# Câu trả lời bảo vệ kiến trúc — FoodX (Nhóm 6)

Hệ thống là cụm **1 API Gateway + 6 microservice** (Spring Boot, Java 17). Mỗi service một database MySQL và một tài khoản DB riêng. Service không JOIN sang database của nhau; gọi chéo chỉ qua HTTP ` /internal/**` kèm header `X-Foodx-Internal-Token`. Danh tính người dùng lấy từ JWT (`uid`, `role`), không tra bảng `users` ở service khác.

| Service | Cổng | Database | Bảng sở hữu |
|---|---|---|---|
| api-gateway | 8080 | — | không lưu nghiệp vụ; host SPA |
| user-service | 8081 | `foodx_user` | `users`, `profiles` |
| inventory-service | 8082 | `foodx_inventory` | `foods`, `ingredients`, `fridge_stock` |
| recipe-service | 8083 | `foodx_recipe` | `recipes`, `recipe_ingredients`, `favorites` |
| plan-shopping-service | 8084 | `foodx_plan` | `meal_plan_entries`, `shopping_items` |
| ai-service | 8085 | `foodx_ai` | `chat_sessions`, `chat_messages` |
| social-stats-service | 8086 | `foodx_social` | `recipe_posts`, `post_likes`, `post_comments`, `cook_history` |

---

## 1. Vì sao chọn kiến trúc này?

Nhóm chọn **microservice + API Gateway + database-per-service**, giao tiếp đồng bộ HTTP, vì đề tài là môn phát triển phần mềm hướng dịch vụ và vì các mảng nghiệp vụ có vòng đời khác nhau.

- **Tách theo bounded context.** Tủ lạnh, công thức, kế hoạch/đi chợ, AI, cộng đồng/thống kê, tài khoản là sáu nhóm việc. Mỗi nhóm một service, một database, một người phụ trách. Sửa tủ lạnh không đụng schema công thức.
- **Một cửa vào.** Client chỉ gọi `http://localhost:8080`. Gateway định tuyến `/api/**`, rate-limit (Redis, 120 request/phút với API đắt), bulkhead cho AI, và chặn `/internal/**` không ra ngoài.
- **Sở hữu dữ liệu rõ.** Không còn khóa ngoại xuyên service. Service khác cần công thức thì nhận `RecipeSummaryDto`, cần hồ sơ thì nhận `UserProfileDto`, không đọc bảng của nhau.
- **Triển khai độc lập.** Một Dockerfile multi-stage, mỗi module một image. Docker Compose chỉ cho service chạy sau khi MySQL healthy.
- **Đồng bộ HTTP thay vì broker.** Với quy mô đồ án, lời gọi HTTP có timeout, correlation id và log là đủ để demo và truy vết. Thêm Kafka/RabbitMQ sẽ thêm một thành phần hỏng và buộc mọi lệnh ghi phải idempotent ngay từ đầu.

Hướng này đánh đổi sự đơn giản của một transaction duy nhất để lấy biên giới service rõ và đúng yêu cầu môn học.

---

## 2. Theo kiến trúc này, có hướng xử lý khác không? Hướng nào dễ hơn?

Có hai hướng khác, độ khó không giống nhau.

**Hướng dễ hơn lúc code: một ứng dụng monolith (hoặc modular monolith) một database.** Mọi cập nhật nằm trong một `@Transactional`. Hai người tranh một dòng thì khóa DB xử lý được. Không có timeout dây chuyền, không có dữ liệu lệch giữa “đã mua” và “đã vào tủ”. Với sáu người và một học kỳ, monolith ít lỗi tích hợp hơn.

Nhóm không chọn hướng đó vì monolith gom schema, deploy và quyền DB vào một chỗ. Đổi một module vẫn build và khởi động cả hệ. Mục tiêu môn là ranh giới dịch vụ, hợp đồng API và sở hữu dữ liệu — monolith không chứng minh được các điểm đó.

**Hướng đúng kiến trúc này hơn về lâu dài, nhưng khó hơn lúc làm: event-driven.** Ví dụ phát `user.deleted`, `shopping.purchased`, `meal.cooked` qua hàng đợi; service đích tự tiêu thụ và tự bù khi lỗi. Hướng này xử lý fan-out và lỗi bước sau tốt hơn HTTP đồng bộ. Nhóm cố ý chưa làm vì phải có broker, outbox, và khóa chống xử lý trùng — nhiều failure mode hơn mức đồ án cần. README ghi rõ mục này là nợ: fan-out xóa user vẫn là năm lời gọi HTTP đồng bộ.

Tóm lại: monolith dễ viết hơn; event-driven đúng bài toán phân tán hơn nhưng khó hơn. HTTP đồng bộ là điểm giữa nhóm chọn để làm xong và giải thích được.

---

## 3. Thực thể trung tâm là gì? Xuất hiện ở model nào? Mỗi nơi cần thuộc tính gì?

Thực thể trung tâm là **người dùng (User)**. Mọi tủ lạnh, kế hoạch, lịch sử nấu, chat, bài đăng đều thuộc một người. Chỉ **user-service** có entity `User`. Các service còn lại không có bảng `users`; chúng lưu `Long userId` và, khi cần tên/avatar/hồ sơ, gọi API nội bộ.

### user-service — model đầy đủ

Bảng `users` (`User`): `id`, `username`, `email`, `password` (BCrypt), `fullName`, `avatarUrl`, `role` (`ADMIN`/`USER`), `createdAt`, `updatedAt`.

Bảng `profiles` (`UserProfile`, 1-1 với user): `gender`, `age`, `weight`, `height`, `targetWeight`, `activity`, `diet`, `allergies`, `dislikes`. Đây là dữ liệu dinh dưỡng, không phải dữ liệu đăng nhập.

JWT phát hành lúc đăng nhập chỉ mang ba claim nghiệp vụ: `sub` = username, `uid` = id, `role`. Hết hạn mặc định 24 giờ (`app.jwt.expiration-ms=86400000`).

### Các service khác — chỉ giữ khóa và phần việc của mình

| Nơi | Model | Thuộc tính của User mà nơi đó cần |
|---|---|---|
| Mọi service, lúc xác thực | `UserPrincipal` (trong RAM, từ JWT) | `id`, `username`, `role`. Không lưu DB. |
| inventory `fridge_stock` | `FridgeItem.userId` | Chỉ id chủ tủ. Tên thực phẩm, số lượng, đơn vị, hạn dùng thuộc tủ, không thuộc user. |
| recipe `recipes` | `Recipe.authorId` | Chỉ id người tạo. Nội dung món nằm ở recipe. |
| recipe `favorites` | `Favorite.userId` | Id + `targetId` + `targetType`. |
| plan `meal_plan_entries` | `MealPlanEntry.userId` | Id + ngày + `slot` + `recipeId`. |
| plan `shopping_items` | `ShoppingItem.userId` | Id chủ danh sách mua. |
| ai `chat_sessions` | `ChatSession.userId` | Id chủ phiên. Prompt lúc chat mới kéo hồ sơ qua `UserProfileDto`. |
| social `recipe_posts` | `RecipePost.authorId` | Id tác giả. Bài đăng **copy** title, nguyên liệu, các bước — không trỏ FK sang `recipes`. |
| social `post_likes`, `post_comments`, `cook_history` | `userId` | Chỉ id người thích / bình luận / nấu. |

### Bản chiếu khi service khác cần thêm thuộc tính (DTO, không phải entity)

- `UserSummaryDto`: `id`, `username`, `email`, `fullName`, `avatarUrl`, `role` — để hiện tên tác giả bài viết.
- `UserProfileDto`: giới tính, tuổi, cân nặng, chiều cao, vận động, chế độ ăn, dị ứng, món ghét — cho AI và cho kế hoạch bữa ăn tính kcal. plan-shopping và ai-service **không lưu** các cột này.

Công thức (`Recipe`) là thực thể nghiệp vụ lớn thứ hai, nhưng không phải tâm định danh: plan và cook history chỉ giữ `recipeId` rồi hỏi `RecipeSummaryDto` (title, kcal, khẩu phần, nguyên liệu). Bài đăng cộng đồng cố ý lưu bản sao nội dung để feed không phụ thuộc recipe-service còn sống.

---

## 4. Một thay đổi nghiệp vụ buộc sửa nhiều module

**Đổi tủ lạnh cá nhân thành tủ của hộ gia đình** (nhiều tài khoản cùng một tủ, cùng kế hoạch đi chợ).

Hiện mọi bảng nghiệp vụ gắn dữ liệu với đúng một `user_id` lấy từ JWT. “Tủ của tôi”, “kế hoạch của tôi”, “đã nấu của tôi” đều là truy vấn `where user_id = uid trong token`.

Đổi sang hộ thì phải sửa cùng lúc:

1. **user-service** — thêm hộ, thành viên, vai trò trong hộ (chủ hộ / thành viên).
2. **inventory-service** — `fridge_stock` không còn khóa theo một user; trừ kho và gộp trùng phải theo `householdId`.
3. **recipe-service** — khớp món (`/api/recipes/match`) đang lấy nguyên liệu tủ của một user.
4. **plan-shopping-service** — kế hoạch tuần và “đã mua thì đổ vào tủ” đang gọi `/internal/fridge/{userId}/items`.
5. **social-stats-service** — “nấu xong trừ tủ” gọi `/internal/fridge/{userId}/consume` theo người bấm, không theo hộ.
6. **ai-service** — prompt đang nạp tủ và dị ứng của một `userId`.
7. **foodx-common** — mọi URL nội bộ dạng `/internal/fridge/{userId}/...` và client tương ứng.

Không sửa một chỗ rồi JOIN được, vì không có database chung và không có FK. Đây là hệ quả trực tiếp của database-per-service: một khái niệm mới cắt ngang nhiều bounded context thì mỗi context phải đổi model và hợp đồng của chính nó.

Thay đổi nhỏ hơn nhưng cũng đụng nhiều nơi: **đổi cách ghi “đã nấu”** (thêm đánh dấu bữa trong kế hoạch, hoặc đổi công thức quy đổi khẩu phần). Hiện luồng đã đi social-stats → recipe-service (định lượng) → inventory-service (trừ tủ).

---

## 5. Cập nhật nhiều nơi, bước 2 lỗi thì dữ liệu ra sao?

Trong **một** service, `@Transactional` của Spring hoàn tác cả bước nếu lệnh SQL lỗi. **Giữa** các service không có giao dịch phân tán (không 2PC, không saga, không outbox). Client nội bộ (`AbstractFoodxClient.postOptional`) **nuốt lỗi mạng**: ghi log, trả `Optional.empty()`, không ném ra để transaction bên gọi rollback.

Ví dụ thật — tích “đã mua” (`ShoppingService.toggle`):

1. plan-shopping-service ghi `shopping_items.done = true` rồi `save`.
2. Gọi `POST /internal/fridge/{userId}/items` sang inventory-service.

Nếu bước 2 lỗi (inventory chết, timeout 10 giây, hoặc trả 5xx): bước 1 **vẫn commit**. Người dùng thấy mục đã mua. Tủ lạnh không tăng số lượng. Không có job bù. Bấm lại sẽ *gỡ* cờ đã mua (toggle), không tự đổ lại vào tủ.

Ví dụ thứ hai — bấm “đã nấu” (`StatsService.recordCook`):

1. social-stats-service insert `cook_history` (user + recipe + ngày).
2. Gọi inventory trừ `fridge_stock`.

Nếu bước 2 lỗi: lịch sử nấu đã có, tủ không bị trừ. Lần gọi sau **cùng ngày cùng món** bị chặn bởi `existsByUserIdAndRecipeIdAndCookedAt` và `return` luôn — nên tủ **không được trừ lại**. Lệch này đứng đến khi sửa tay.

Ví dụ thứ ba — admin xóa tài khoản (`UserPurgeClient`): năm lệnh `DELETE /internal/users/{id}/data` là best-effort. Service nào không trả lời thì log cảnh báo và bỏ qua, sau đó user-service vẫn xóa `profiles` và `users`. Dữ liệu tủ/công thức/chat của user đó có thể còn sót ở service đã chết.

Cách nhóm sẽ xử lý nếu làm tiếp: ghi bước 1 ở trạng thái `PENDING`, chỉ chuyển `DONE` khi bước 2 thành công; nếu bước 2 lỗi thì hoàn tác bước 1 (đánh dấu chưa mua / xóa dòng cook vừa insert) hoặc xếp lại một lần bù. Đó là saga ngắn, chưa có trong code.

---

## 6. Hai người cùng giành một chỗ cuối thì sao?

FoodX không có đặt bàn nhà hàng. “Chỗ” trong hệ thống là **một khung bữa**: mỗi người, mỗi ngày, mỗi `slot` (`morning` / `lunch` / `dinner`) chỉ một món. Ràng buộc `uk_meal_plan` trên `(user_id, plan_date, slot)` ở bảng `meal_plan_entries`.

Hai **người khác nhau** không tranh nhau chỗ này. Kế hoạch của A và của B là hai dòng khác `user_id`. Không có chỗ dùng chung.

Hai thao tác **cùng một người, cùng một khung còn trống** (hai tab, bấm đúp):

1. Cả hai đọc “chưa có dòng”.
2. Cả hai `INSERT`.
3. Database từ chối dòng thứ hai vì unique.
4. `PlanService.setSlot` bắt `DataIntegrityViolationException`, đọc lại dòng đã thắng, rồi `UPDATE` `recipe_id` thành món của request vừa lỗi.

Kết quả: vẫn **một** dòng. Người đến sau ghi đè món, không tạo hai chỗ. Không dùng `@Version` hay `SELECT … FOR UPDATE`.

Chỗ đua thật sự còn yếu là **trừ nguyên liệu cuối trong tủ** (`FridgeConsumptionService.consume`). Hai request cùng đọc `quantity`, cùng trừ, cùng ghi. Không có khóa dòng. Lần ghi sau đè lần ghi trước (lost update): tủ có thể không về 0 dù đã nấu hai lần. Đây là giới hạn nhóm biết, chưa xử lý bằng khóa bi quan.

---

## 7. A đăng nhập rồi đổi id thành B để xem dữ liệu của B

Ba tình huống, ba kết quả.

**Đổi id trên URL hoặc body của API công khai** (`/api/fridge`, `/api/plan`, `/api/shopping`, `/api/chat`, …). Controller không lấy user từ tham số client. Chúng gọi `SecurityUtils.getCurrentUserId()`, tức claim `uid` trong JWT đã được `JwtAuthenticationFilter` kiểm tra chữ ký. Truy cập một dòng của B đi kèm điều kiện `id` **và** `userId` của A, ví dụ `findByIdAndUserId`. Không khớp thì **404**, không trả dữ liệu của B.

**Sửa claim `uid` (hoặc `role`) trong JWT thành id của B** mà không có khóa ký. `JwtTokenProvider.validateToken` kiểm tra HMAC và issuer `foodx`. Chữ ký sai thì filter **không** gắn `UserPrincipal`. Request thành chưa đăng nhập → **401**. A không trở thành B, cũng không trở thành admin bằng cách sửa payload.

**Gọi thẳng cổng nội bộ** `GET /internal/fridge/{id của B}/items`. Cổng này tin `userId` trên URL, nhưng chỉ mở khi có header `X-Foodx-Internal-Token`, và gateway **không** định tuyến path bắt đầu bằng `/internal` (trả 404). Người dùng qua web (`:8080`) không vào được.

Điểm còn mở ở bản dev: `docker-compose` vẫn publish cổng 8081–8086, và token nội bộ có giá trị mặc định trong cấu hình dev. Ai vào được mạng và biết token thì gọi thẳng service. Bản chạy thật phải bỏ các `ports` đó (compose đã ghi chú `PROD`) và đặt `FOODX_INTERNAL_TOKEN` riêng. Profile `prod` mà còn bí mật dev thì `SecretGuard` chặn không cho khởi động.

---

## 8. Thu hồi quyền khi token còn hạn

**Hiện tại không thu hồi được ngay.** Phiên là stateless (`SessionCreationPolicy.STATELESS`). Filter chỉ kiểm tra chữ ký, issuer và `exp`. Không có bảng phiên, không có blacklist Redis, không có `tokenVersion` trên `users`.

Hệ quả cụ thể trong 24 giờ còn hạn của token:

- Admin hạ `role` hoặc đổi mật khẩu: token cũ vẫn mang `role` cũ, các service không đọc lại bảng `users`.
- Admin xóa user: token vẫn qua được bước xác thực; các API trả 404 vì không còn dòng dữ liệu, nhưng quyền trong token không bị vô hiệu chủ động.
- Đổi `APP_JWT_SECRET` làm mọi token hỏng cùng lúc — dùng khi lộ khóa, không phải thu hồi một người.

**Cách thu hồi một người, hợp với kiến trúc đang có** (chưa code, là hướng làm tiếp):

1. Khi đăng nhập, đưa thêm claim `ver` (số phiên) lấy từ cột `users.token_version`.
2. Đổi mật khẩu, hạ quyền, khóa hoặc xóa tài khoản thì **tăng** `token_version` (hoặc ghi `jti` của token vào Redis đến đúng lúc `exp`).
3. Chỗ kiểm tra đặt ở **gateway hoặc một filter dùng chung** trong `foodx-common`, vì năm service kia không có bảng `users`. Redis đã có sẵn cho rate-limit, dùng được làm denylist.
4. Rút access token xuống 15 phút. Token càng ngắn, cửa sổ “quyền cũ vẫn sống” càng nhỏ nếu bước 2–3 chưa kịp.

Đổi khóa ký toàn hệ chỉ là biện pháp khẩn cấp, không phải thu hồi từng người.

---

## 9. User → service A → service B, B phản hồi chậm thì A và user thấy gì?

Có hai tầng thời gian chờ.

**A gọi B** (`FoodxClientConfiguration`): connect timeout **2 giây**, read timeout **10 giây**.

- B chậm hơn 10 giây hoặc không nhận kết nối: lời gọi ném lỗi I/O.
- Nếu là **GET**: `RetryInterceptor` thử lại tối đa **2 lần**, cách nhau 200 ms rồi nhân theo số lần. Hết lần thì A nhận rỗng (`Optional.empty()` hoặc list rỗng), ghi log cảnh báo, **không sập process**. plan-shopping khi AI/hồ sơ/công thức không về sẽ rơi sang thuật toán dự phòng hoặc trả phần dữ liệu còn có. User thấy kết quả thiếu hoặc màn “không có gợi ý”, không thấy treo vô hạn.
- Nếu là **POST/DELETE**: **không** thử lại (tránh ghi trùng). Lỗi bị nuốt thành rỗng. User thấy response của A — có thể là thành công một nửa như mục 5.

A bị **chặn** trên lời gọi đó đến hết timeout (GET có thể khoảng hơn 20 giây nếu cả hai lần đều chờ đủ 10 giây). Trong lúc đó luồng của A không làm việc khác cho request này.

**User gọi qua gateway tới A** (`GatewayProxyController`): connect **5 giây**, timeout cả request **60 giây**.

- A trả lời trước 60 giây: user nhận đúng status và body của A (kể cả body báo lỗi nghiệp vụ).
- A không trả lời kịp (đang kẹt chờ B, hoặc A chết): gateway trả **HTTP 503** với `{"code":503,"message":"Service Unavailable: ..."}`.
- Riêng AI: quá số request đồng thời thì bulkhead ở gateway trả **429**, header `Retry-After: 3`, không chuyển tiếp sang ai-service.

Mọi chặng vẫn mang `X-Correlation-Id` nên log gateway và log A/B lọc được cùng một request.

---

## 10. Một dịch vụ nhận trùng một thông điệp hai lần — có sinh dữ liệu trùng không?

Hệ thống **không có message broker**. “Thông điệp” ở đây là một request HTTP bị gửi hai lần (client bấm đúp, hoặc proxy gửi lại).

Client nội bộ **cố ý không retry POST/DELETE**. `RetryInterceptor` chỉ thử lại GET khi lỗi mạng, vì GET không đổi dữ liệu. Nhóm không retry khi server đã trả 4xx/5xx.

Khi cùng một lệnh ghi vẫn tới hai lần, kết quả **tùy nghiệp vụ**:

| Luồng | Lần hai |
|---|---|
| Ghi đã nấu cùng user + recipe + ngày | Không insert thêm. Hàm return sớm. Cũng không trừ tủ lần hai. |
| `POST /internal/recipes/ensure` cùng tiêu đề | `findFirstByTitleIgnoreCase` thấy món cũ, không tạo recipe mới. |
| Đặt cùng một khung bữa | Unique `uk_meal_plan`. Lần hai thành cập nhật món, không thêm dòng. |
| Thích bài / lưu yêu thích | Unique `(user, post)` và `(user, target, type)`. Lần hai không tạo dòng like/favorite thứ hai (toggle like thì lần hai là bỏ thích). |
| Xóa dữ liệu user (`DELETE .../data`) | Xóa lần hai ra 0 dòng. Không sinh bản ghi mới. |
| Thêm mục đi chợ, thêm bình luận, gửi tin chat | **Có** bản ghi mới. Không có khóa idempotency (`Idempotency-Key`). |
| Đổ hàng đã mua vào tủ, trùng tên | Không thêm dòng `fridge_stock` mới; **cộng dồn số lượng**. Về mặt dòng thì không trùng, về mặt số lượng thì lần hai vẫn làm tăng kho. |

Không có bảng “đã xử lý message id” dùng chung. Những chỗ an toàn là nhờ khóa nghiệp vụ hoặc unique constraint, không nhờ hạ tầng messaging.

---

## 11. Điểm nhóm biết là chưa tốt nhưng cố tình để lại — nếu còn thời gian sửa gì trước?

**Cố tình để lại: API Gateway là reverse proxy tự viết** (`GatewayProxyController`), không phải Spring Cloud Gateway; và **chưa gắn circuit breaker**. Nhóm biết proxy này không có bộ lọc chuẩn, timeout đang để 60 giây, và gateway không giữ khóa JWT (chỉ đọc payload để lấy khóa rate-limit, không kiểm tra chữ ký — chữ ký do từng service kiểm).

Lý do chưa thay: chuyển sang `spring-cloud-starter-gateway` (WebFlux) phải viết lại rate-limit, bulkhead AI và việc phục vụ SPA. Với một máy Docker Compose và sáu service, DNS nội bộ của Compose cũng đủ; thêm Eureka lúc này nhiều kiểu hỏng hơn là lợi. Hai món đó ghi trong mục nợ kỹ thuật của README và được hoãn có chủ đích.

**Nếu còn thời gian, sửa trước không phải gateway.** Sửa trước **thu hồi phiên và kiểm tra user còn hiệu lực** (mục 8): cột `token_version` hoặc denylist `jti` trên Redis, kiểm ở filter dùng chung, rút hạn access token.

Vì sao việc này trước:

- Token 24 giờ vẫn dùng được sau khi đổi mật khẩu, hạ quyền hoặc xóa tài khoản. Đó là lỗ hổng người dùng thật, không chỉ là nợ cấu trúc.
- Redis đã chạy cho rate-limit, filter JWT đã nằm một chỗ trong `foodx-common`, nên sửa một lần là sáu service cùng chịu.
- Gateway Spring Cloud và tracing OpenTelemetry giúp vận hành, nhưng không chặn được tài khoản bị lộ đang còn hạn.

Việc xếp ngay sau đó mới là **bù dữ liệu khi bước ghi thứ hai lỗi** (mục 5), rồi mới tới Flyway thay `ddl-auto=update`.
