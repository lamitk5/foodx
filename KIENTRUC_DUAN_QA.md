# BỘ CÂU HỎI & TRẢ LỜI KIẾN TRÚC DỰ ÁN FOODX

---

## 1. Vì sao chọn kiến trúc này?

FoodX áp dụng kiến trúc **Microservices có API Gateway** (chuyển dịch từ Monolith ban đầu) gồm:
- **API Gateway (Port 8080)**: Điểm tiếp nhận duy nhất, định tuyến URL, rate limit qua Redis/In-memory.
- **6 dịch vụ nghiệp vụ**: `user-service` (8081), `inventory-service` (8082), `recipe-service` (8083), `plan-shopping-service` (8084), `ai-service` (8085), `social-stats-service` (8086).

### Lý do lựa chọn:
1. **Cô lập tải nặng AI (`ai-service`)**: Tác vụ gọi LLM (Groq / Gemini) có độ trễ lớn (1–3s I/O) và giới hạn quota. Tách riêng giúp tránh nghẽn thread pool của các luồng tra cứu nhanh như tủ lạnh và user.
2. **Cách ly lỗi (Fault Isolation)**: Khi AI service chạm hạn mức hoặc sập, toàn bộ nghiệp vụ cốt lõi (tủ lạnh, công thức, đi chợ) vẫn hoạt động 100% bình thường.
3. **Mở rộng độc lập (Independent Scalability)**: Cho phép scale riêng instance cho module có lượng truy cập cao (ví dụ: công thức, tủ lạnh) mà không cần nhân bản toàn bộ ứng dụng.
4. **Kiểm soát bảo mật tập trung**: Xác thực JWT, cấu hình CORS và chặn tấn công brute-force/DDoS (Rate Limiting) ngay tại Gateway trước khi vào mạng nội bộ.
5. **Phân chia phát triển song song**: Các thành viên phát triển từng service độc lập, giảm xung đột git và tăng tốc kiểm thử từng phần.

---

## 2. Nếu không theo kiến trúc này có hướng xử lý khác không, có dễ hơn hay không?

- **Hướng xử lý thay thế**: **Modular Monolith** (Đơn khối module hóa theo Package-by-Feature) – chính là cấu trúc ban đầu tại thư mục `src/main/java/com/nhom6/foodx/`.
- **Có dễ hơn không?**: **Dễ hơn rất nhiều** ở quy mô hiện tại:
  1. **Triển khai đơn giản**: Chỉ chạy 1 tiến trình JAR duy nhất, không cần quản lý mạng container Docker, cổng 8081–8086 hay cấu hình reverse proxy phức tạp.
  2. **Giao dịch ACID nội bộ**: Các thao tác liên kết (như đi chợ -> đẩy vào tủ lạnh, nấu xong -> trừ kho) dùng trực tiếp `@Transactional` cục bộ, không lo bài toán phân tán.
  3. **Không có độ trễ mạng**: Gọi hàm nội bộ trong JVM, không tốn chi phí đóng gói HTTP request/response giữa các service.
  4. **Dễ debug và ghi log**: Toàn bộ stack trace nằm trên một tiến trình, không cần dựng công cụ Distributed Tracing (Zipkin/Jaeger).
  5. **Nhược điểm đánh đổi**: 1 lỗi rò rỉ bộ nhớ hoặc nghẽn luồng ở module AI có thể kéo sập toàn bộ hệ thống; không thể scale độc lập từng module.

---

## 3. Thực thể trọng tâm của dự án là gì, xuất hiện ở model nào, mỗi nơi cần thuộc tính gì?

Thực thể trọng tâm xuyên suốt luồng nghiệp vụ (từ quản lý tủ lạnh, gợi ý món, lập kế hoạch, đi chợ đến nấu ăn) là **Nguyên liệu / Thực phẩm (Food & FridgeItem / Ingredient)**:

1. **Tại `inventory-service` (Tủ lạnh & Catalog thực phẩm)**:
   - `Food`: `id`, `name`, `type`, `unit`, `kcal`, `protein`, `carb`, `fat`, `defaultExpiryDays`.
   - `FridgeItem`: `id`, `user` (`userId`), `food` (`foodId`), `quantity`, `unit`, `expiresAt`, `note`.
2. **Tại `recipe-service` (Công thức nấu ăn)**:
   - `RecipeIngredient`: `id`, `recipeId`, `ingredientId`, `ingredientName`, `amount`, `unit`, `isOptional`.
3. **Tại `plan-shopping-service` (Danh sách mua sắm)**:
   - `ShoppingItem`: `id`, `userId`, `name`, `quantity`, `category`, `price`, `done`.
4. **Tại `ai-service` (Bối cảnh gợi ý AI - `AiContextService`)**:
   - DTO nạp vào prompt: `name`, `quantity`, `unit`, `daysUntilExpiry`, `allergyWarning`.
5. **Tại `social-stats-service` (Lịch sử & Vòng tiêu thụ trừ kho)**:
   - Mô hình đối soát: `name`, `amount`, `unit`, `servings` (để quy đổi và trừ nguyên liệu tủ).

---

## 4. Chỉ ra 1 thay đổi nghiệp vụ buộc nhóm phải sửa nhiều mô-đun/dịch vụ khác kèm theo nhất, vì sao?

- **Nghiệp vụ**: **Chuẩn hóa hệ thống Đơn vị tính và Quy đổi nguyên liệu (Unit & Metric Conversion System)** (ví dụ: chuyển từ nhập chuỗi tự do sang đơn vị chuẩn có hệ số quy đổi gam/ml/cái).
- **Lý do phải sửa nhiều nơi nhất**:
  1. `inventory-service`: Sửa bảng `fridge_stock` và entity `FridgeItem`, bổ sung bảng quy chuẩn đơn vị và logic cộng dồn nguyên liệu.
  2. `recipe-service`: Sửa `RecipeIngredient` và thuật toán tính độ khớp nguyên liệu (`/api/recipes/match`) để so sánh đúng lượng tồn so với lượng cần nấu.
  3. `plan-shopping-service`: Sửa `ShoppingItem` và luồng toggle tích mua tự động nạp tủ (`fridgeService.addOrUpdateBoughtItem`).
  4. `social-stats-service`: Sửa toàn bộ hàm trừ kho `StatsService.deductFridgeStock()`, nơi hiện tại đang hard-code bảng `WEIGHT_UNITS` và `VOLUME_UNITS`.
  5. `ai-service`: Cập nhật `PromptTemplate` để ép LLM trả về đúng danh mục đơn vị chuẩn theo enum hệ thống.

---

## 5. Nếu có thao tác cập nhật dữ liệu ở nhiều nơi bước thứ 2 lỗi thì dữ liệu xử lý như thế nào?

### Hiện trạng dự án (Shared Database):
- Với các thao tác liên kết (ví dụ: `ShoppingService.toggle()` -> `FridgeService.addOrUpdateBoughtItem()`):
- Toàn bộ được đặt trong annotation `@Transactional` của Spring. Khi bước 2 quăng lỗi (`RuntimeException`), Spring Rollback toàn bộ kết nối DB, hủy bỏ thay đổi của bước 1 để bảo toàn tính nhất quán.

### Trường hợp Microservices độc lập cơ sở dữ liệu (Database-per-Service):
Nếu hai service chạy DB riêng biệt và gọi nhau qua HTTP/gRPC:
1. **Saga Pattern (Compensating Transaction)**: Khi service B trả về mã lỗi, service A thực hiện transaction bù trừ để hoàn tác dữ liệu bước 1 (ví dụ: đổi lại trạng thái `done = false`).
2. **Transactional Outbox & Retry**: Ghi nhận trạng thái `PENDING` vào bảng outbox cục bộ, sử dụng message broker thử lại cho đến khi thành công hoặc chuyển vào hàng đợi Dead Letter Queue (DLQ) để xử lý thủ công.

---

## 6. Hai người cùng giành 1 chỗ cuối cùng thì nhóm xử lý như thế nào? (Race Condition)

Áp dụng một trong các cơ chế kiểm soát tương tranh sau:

1. **Optimistic Locking (Khóa lạc quan) với `@Version` (JPA/Hibernate)**:
   - Thêm cột `version` vào bảng dữ liệu.
   - Cả 2 người cùng đọc version 1; người A cập nhật trước đưa version lên 2.
   - Người B submit với version 1 -> Hibernate quăng `OptimisticLockException`. Hệ thống trả về `409 Conflict`: thông báo chỗ đã được người khác lấy.
2. **Pessimistic Locking (Khóa bi quan) ở mức Database**:
   - Dùng truy vấn `SELECT ... FOR UPDATE` (`@Lock(LockModeType.PESSIMISTIC_WRITE)`).
   - Người A khóa dòng dữ liệu cho đến khi hoàn tất giao dịch. Người B phải chờ; khi khóa mở, hệ thống kiểm tra lượng tồn bằng 0 và từ chối người B.
3. **Distributed Lock qua Redis**:
   - Dùng Redis `SET key value NX PX 5000`. Chỉ người lấy được key đầu tiên mới có quyền thực thi nghiệp vụ, người còn lại nhận kết quả thất bại ngay.

---

## 7. Giả sử A đăng nhập tài khoản đổi ID thành B để xem dữ liệu của B thì điều gì xảy ra, nhóm xử lý thế nào? (IDOR)

### Điều gì xảy ra:
- Nếu truyền thẳng `id` của B lên URL hoặc body request, hệ thống sẽ **từ chối truy cập** và A **không thể** xem hay sửa dữ liệu của B.

### Cách nhóm xử lý:
1. **Không nhận User ID từ client**:
   - Với các API cá nhân (`/api/profile`, `/api/fridge`, `/api/shopping`), hệ thống không nhận `userId` từ client mà trích xuất trực tiếp từ token JWT thông qua `SecurityUtils.getCurrentUser()`. Token này được ký HMAC-SHA256 bí mật nên không thể giả mạo.
2. **Ràng buộc User ID trong truy vấn (Scoping Query)**:
   - Mọi thao tác tìm kiếm hay cập nhật đối tượng theo ID đều bắt buộc kèm điều kiện:
     `findByIdAndUser_Id(itemId, currentUser.getId())` (xem [FridgeService.java](file:///d:/foodx/services/inventory-service/src/main/java/com/nhom6/foodx/fridge/service/FridgeService.java#L430) và [ShoppingService.java](file:///d:/foodx/services/plan-shopping-service/src/main/java/com/nhom6/foodx/shopping/service/ShoppingService.java#L102)).
   - Nếu A truyền ID của B, câu lệnh SQL không khớp dữ liệu và quăng lỗi `404 Not Found` (ngăn lộ thông tin sự tồn tại của dữ liệu B).

---

## 8. Làm sao để thu hồi quyền của 1 người khi token của họ còn hạn?

Do JWT là stateless, nhóm áp dụng các giải pháp sau để thu hồi quyền tức thì:

1. **Redis Token Blacklist**:
   - Khi người dùng đăng xuất hoặc bị Admin thu hồi quyền/khóa tài khoản: Server lưu token vào Redis với prefix `blacklist:<token>` và TTL bằng đúng thời hạn còn lại của JWT.
   - Tại Gateway / Security Filter: Kiểm tra Redis trước mỗi request; nếu token nằm trong blacklist thì chặn ngay với mã `401 Unauthorized`.
2. **Cặp đôi Access Token ngắn hạn (Short-lived) + Refresh Token**:
   - Cấp Access Token có thời hạn ngắn (5–15 phút).
   - Refresh Token được lưu trong DB/Redis. Khi thu hồi quyền, hủy Refresh Token. Sau tối đa 15 phút, Access Token hết hạn và client không thể làm mới token được nữa.
3. **Quản lý phiên bản quyền (`token_version`)**:
   - Lưu trường `token_version` trong bảng User. Token chứa claim `v`. Khi thu hồi quyền, tăng `token_version` trong DB lên 1. Mọi token có version cũ sẽ bị loại bỏ khi so khớp.

---

## 9. Từ người dùng qua dịch vụ A gọi sang dịch vụ B, nếu B phản hồi chậm thì A và người dùng thấy gì?

### Phía dịch vụ A (`api-gateway` hoặc service gọi phụ thuộc):
- `GatewayProxyController` sử dụng `HttpClient` với cấu hình: `connectTimeout = 5s`, `request timeout = 60s`.
- Khi B phản hồi quá thời gian, A bắt ngoại lệ `HttpTimeoutException` / `IOException`, ghi log lỗi và trả về HTTP `503 Service Unavailable` hoặc `504 Gateway Timeout` kèm JSON chuẩn hóa.
- Nếu tích hợp Circuit Breaker (Resilience4j): Khi tỷ lệ lỗi vượt ngưỡng, Circuit Breaker ngắt mạch sang trạng thái OPEN và trả về Fallback ngay lập tức mà không cần chờ timeout.

### Phía người dùng (Frontend SPA):
- Màn hình hiển thị trạng thái chờ (loading spinner / skeleton).
- Khi hết thời gian, UI nhận phản hồi lỗi 503/504 và hiển thị Toast thông báo: *"Hệ thống đang bận hoặc phản hồi chậm, vui lòng thử lại sau"*.
- Giao diện giữ nguyên trạng thái cũ, không bị crash hay trắng trang. Với gợi ý món ăn, hệ thống tự kích hoạt dữ liệu dự phòng nội bộ (Mock fallback) để hiển thị tạm thời.

---

## 10. Nếu 1 dịch vụ nhận trùng 1 thông điệp 2 lần thì có sinh dữ liệu trùng hay không? (Idempotency)

### Nghiệp vụ đã có cơ chế chống trùng:
1. **Ghi nhận nấu ăn (`StatsService.java`)**: Kiểm tra `existsByUser_IdAndRecipeIdAndCookedAt(...)`. Nếu gọi lần 2 trong cùng ngày, hệ thống bỏ qua và không ghi nhận hay trừ kho lần thứ 2.
2. **Nạp đồ vào tủ lạnh (`FridgeService.java`)**: Nếu trùng tên và hạn sử dụng, hệ thống cộng dồn số lượng chứ không tạo bản ghi mới.
3. **Đăng ký tài khoản**: Cột `username` và `email` có ràng buộc `UNIQUE` trong DB, quăng lỗi `DataIntegrityViolationException` nếu gửi lặp.

### Nghiệp vụ chưa có chống trùng (Có nguy cơ sinh trùng):
- **Thêm danh sách đi chợ (`ShoppingService.add`)** hoặc **Bình luận (`SocialService.addComment`)**: Nếu client spam click hoặc mạng retry gửi 2 HTTP POST giống nhau, hệ thống vẫn lưu 2 bản ghi riêng biệt.
- **Giải pháp chuẩn hóa**: Dùng header `X-Idempotency-Key` (UUID). Server lưu key vào Redis với TTL ngắn; nếu trùng key thì trả về kết quả cũ mà không ghi mới.

---

## 11. Chỉ ra 1 đặc điểm nhóm biết là chưa tốt nhưng cố tình để lại, nếu còn thời gian nhóm sửa gì trước vì sao?

### Đặc điểm chưa tốt nhưng cố tình để lại (Trade-off):
- **Kiến trúc Microservices nhưng dùng chung 1 Database MySQL (Shared Database Anti-Pattern)**:
  - 6 services cùng kết nối tới database `foodx`. Các thực thể và repository (`FridgeItem`, `Recipe`) bị nhân bản chéo để các service tự truy vấn trực tiếp bảng của nhau (ví dụ: `social-stats-service` trực tiếp query và update `fridge_stock` thay vì gọi qua API của `inventory-service`).
  - *Lý do giữ lại*: Tiết kiệm tài nguyên máy tính dev, không phải thiết lập hệ thống giao dịch phân tán phức tạp (Saga / Outbox qua Kafka/RabbitMQ) để kịp tiến độ báo cáo.

### Nếu còn thời gian, nhóm sẽ sửa gì trước? Vì sao?
- **Hạng mục ưu tiên sửa trước**: **Bỏ truy vấn trực tiếp bảng chéo giữa các service, chuyển sang giao tiếp bất đồng bộ qua Message Broker (RabbitMQ hoặc Kafka) cho các sự kiện cốt lõi (Cooking & Inventory Events)**.
- **Lý do**:
  1. **Đúng chuẩn Microservices**: Triệt tiêu sự phụ thuộc chặt (Tight Coupling) ở tầng cơ sở dữ liệu.
  2. **Tách biệt trách nhiệm**: `social-stats-service` chỉ cần phát sự kiện `DishCookedEvent`; `inventory-service` tự nhận event và trừ kho mà không cần chia sẻ quyền truy cập bảng.
  3. **Tăng độ ổn định**: Tránh việc khóa bảng (lock contention) trên một cơ sở dữ liệu chung làm ảnh hưởng chéo toàn bộ hệ thống.
