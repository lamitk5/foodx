# FoodX - Trợ Lý Nấu Ăn & Quản Lý Thực Phẩm Thông Minh

FoodX là nền tảng quản lý tủ lạnh, gợi ý thực đơn, lập kế hoạch bữa ăn và mạng xã hội chia sẻ công thức nấu ăn tích hợp Trợ lý AI (Google Gemini & Groq LLM).

---

## 🏗️ Kiến Trúc Hệ Thống (Microservices)

FoodX gồm **1 API Gateway** và **6 microservice nghiệp vụ** (Spring Boot 4.x / Java 17), mỗi service
sở hữu **database riêng** và chỉ giao tiếp với nhau qua HTTP.

```text
foodx/
├── pom.xml                       # Parent POM + aggregator cho cả 9 module
├── Dockerfile                    # MỘT Dockerfile multi-stage dùng chung cho 7 module chạy được
├── docker-compose.yml            # Cụm: 7 service + MySQL 8 + Redis 7 (có healthcheck)
├── .env.example                  # Mẫu biến môi trường / bí mật (copy thành .env)
├── Readme.md, API_DOCUMENTATION.md
├── start-dev.ps1                 # Chạy dev nhanh trên Windows
│
├── api-gateway/                  # :8080 — cổng DUY NHẤT ra ngoài + host frontend SPA
│   ├── src/main/java/com/nhom6/foodx/gateway/   # Bảng định tuyến, rate limit, bulkhead AI
│   └── src/main/resources/static/              # SPA (HTML5, CSS3, Vanilla JS, PWA)
│
├── foodx-common/                 # Thư viện dùng chung (KHÔNG chứa entity nghiệp vụ)
│   └── com/nhom6/foodx/common/
│       ├── security/             # JWT, SecurityFilterChain, PublicEndpoints, InternalTokenFilter
│       ├── client/               # Client gọi service khác + hằng số InternalApi
│       ├── dto/                  # DTO trao đổi giữa các service
│       ├── web/                  # CorrelationId + filter (truy vết xuyên service)
│       ├── config/               # SecretGuard — chặn chạy prod với bí mật mặc định
│       ├── food/                 # Tiện ích ảnh thực phẩm + ước tính dinh dưỡng
│       ├── response/, exception/, utils/
│
├── db/
│   ├── init/00-create-databases.sql        # 6 database + 6 tài khoản service (volume mới)
│   ├── migration/V2_service_boundaries.sql # DB cũ: thêm recipe_ingredients.ingredient_name
│   ├── migration/V3_database_per_service.sql # DB cũ: tách sang database-per-service
│   └── README.md                           # File nào dùng khi nào + thứ tự nâng cấp
│
└── services/                     # 6 microservice nghiệp vụ độc lập
    ├── user-service/             # :8081 — Xác thực JWT, hồ sơ, admin
    ├── inventory-service/        # :8082 — Tủ lạnh, catalog thực phẩm, nguyên liệu
    ├── recipe-service/           # :8083 — Kho công thức, khớp món tủ lạnh
    ├── plan-shopping-service/    # :8084 — Kế hoạch bữa ăn, danh sách đi chợ
    ├── ai-service/               # :8085 — Trợ lý AI (Groq, Gemini), chat
    └── social-stats-service/     # :8086 — Cộng đồng, lịch sử nấu & streak
```

### Nguyên Tắc Kiến Trúc (bắt buộc tuân thủ)

1. **Database per service.** Mỗi service có database MySQL riêng và **tài khoản MySQL riêng** chỉ có
   quyền trên database đó. Không FK, không JOIN, không truy vấn xuyên service.
2. **Mỗi bảng chỉ có đúng một service sở hữu.** Trong `src/main/java` của một service chỉ được tồn
   tại `@Entity`/`@Repository` cho bảng của chính nó.
3. **Mọi giao tiếp chéo đi qua HTTP**, không qua DB: cổng nội bộ `/internal/**` với header
   `X-Foodx-Internal-Token`, trả JSON thô của DTO trong `foodx-common`.
4. **Danh tính người dùng đến từ JWT, không từ DB.** Mọi service dùng `SecurityUtils.getCurrentUserId()`
   và lưu `Long userId` — không có entity `User` ngoài user-service.
5. **Phân quyền do từng service tự khai báo** qua bean `PublicEndpoints`; không service nào biết
   đường dẫn của service khác.
6. **Mọi lời gọi nội bộ đều có timeout và correlation id.** Không có timeout thì một service chậm sẽ
   treo dây chuyền; không có correlation id thì không truy vết được request xuyên service.
7. **Cấu hình qua biến môi trường, bí mật không nằm trong mã nguồn.** Chạy profile `prod` với bí mật
   mặc định của dev sẽ **dừng khởi động** (`SecretGuardConfiguration`).

### Mức Độ Chuẩn Microservice

| # | Tiêu chí | Trạng thái |
|---|---|---|
| 1 | Database per service, không chia sẻ lược đồ | ✅ 6 database + 6 tài khoản riêng |
| 2 | Không truy cập dữ liệu service khác ở tầng DB | ✅ 0 FK xuyên service; mọi thứ qua `/internal/**` |
| 3 | Mỗi service triển khai độc lập | ✅ Dockerfile + image riêng, jar riêng |
| 4 | API Gateway là cửa vào duy nhất | ✅ (proxy tự viết — xem nợ kỹ thuật #1) |
| 5 | Cấu hình ngoài mã nguồn (12-factor) | ✅ biến môi trường + `.env`; có `SecretGuard` |
| 6 | Chịu lỗi: timeout, retry, bulkhead | ✅ timeout + retry GET ở client; bulkhead AI ở gateway |
| 7 | Truy vết xuyên service | ✅ `X-Correlation-Id` + MDC trong log mỗi service |
| 8 | Health check & vòng đời container | ✅ `/actuator/health` + Docker healthcheck + `depends_on: service_healthy` |
| 9 | Container bảo mật | ✅ multi-stage, chạy user thường, `.dockerignore`, không có JDK trong image runtime |
| 10 | Least privilege tài khoản DB | ✅ mỗi service một tài khoản, chỉ quyền trên DB của mình |
| 11 | Service discovery | ⚠️ DNS nội bộ của Docker Compose (hợp lệ cho quy mô này; chưa dùng Eureka) |
| 12 | Giao tiếp bất đồng bộ / event-driven | ❌ fan-out khi xoá user vẫn là gọi HTTP đồng bộ |
| 13 | Migration lược đồ có versioning (Flyway/Liquibase) | ❌ còn dùng `ddl-auto=update` |

### Quyền Sở Hữu Dữ Liệu & Định Tuyến

| Service | Port | Database / tài khoản | Bảng sở hữu | Định tuyến qua Gateway | Gọi service khác |
|---|---|---|---|---|---|
| **api-gateway** | `8080` | – | – | `/` (SPA), `/api/**` | – |
| **user-service** | `8081` | `foodx_user` | `users`, `profiles` | `/api/auth`, `/api/profile`, `/api/admin` | → 5 service (chỉ khi xoá tài khoản) |
| **inventory-service** | `8082` | `foodx_inventory` | `foods`, `ingredients`, `fridge_stock` | `/api/fridge`, `/api/ingredients`, `/api/upload` | → ai |
| **recipe-service** | `8083` | `foodx_recipe` | `recipes`, `recipe_ingredients`, `favorites` | `/api/recipes`, `/api/home`, `/api/favorites` | → user, inventory, ai |
| **plan-shopping-service** | `8084` | `foodx_plan` | `meal_plan_entries`, `shopping_items` | `/api/plan`, `/api/shopping` | → user, inventory, recipe, ai |
| **ai-service** | `8085` | `foodx_ai` | `chat_sessions`, `chat_messages` | `/api/ai`, `/api/chat` | → user, inventory |
| **social-stats-service** | `8086` | `foodx_social` | `recipe_posts`, `post_likes`, `post_comments`, `cook_history` | `/api/social`, `/api/stats` | → user, inventory, recipe |

> Bảng định tuyến của gateway **khai báo bằng cấu hình** (`gateway.routes[*]`), không hard-code trong
> Java — thêm service mới chỉ cần sửa `api-gateway/src/main/resources/application.properties`.

### Cổng Nội Bộ Giữa Các Service (`/internal/**`)

Không được API Gateway định tuyến ra ngoài (`/internal` bị gateway chặn tường minh); yêu cầu header
`X-Foodx-Internal-Token`; trả JSON thô của DTO.

| Service cung cấp | Endpoint | Trả về |
|---|---|---|
| user | `GET /internal/users/{id}`, `GET /internal/users?ids=` | `UserSummaryDto` |
| user | `GET /internal/profiles/{userId}`, `GET /internal/profiles?userIds=` | `UserProfileDto` |
| inventory | `GET /internal/fridge/{userId}/items`, `.../food-names` | `FridgeItemDto`, `List<String>` |
| inventory | `POST /internal/fridge/{userId}/items` | thêm/cộng dồn thực phẩm vào tủ |
| inventory | `POST /internal/fridge/{userId}/consume` | trừ nguyên liệu sau khi nấu (quy đổi đơn vị) |
| inventory | `GET /internal/ingredients/{id}`, `?ids=`, `/resolve?names=`, `POST .../ensure` | `IngredientRefDto` |
| recipe | `GET /internal/recipes/{id}`, `?ids=`, (không tham số = tất cả) | `RecipeSummaryDto` |
| recipe | `POST /internal/recipes/ensure` | tạo/đảm bảo công thức do AI sinh |
| ai | `POST /internal/ai/generate`, `/parse-recipe`, `/scan-food-image` | văn bản thô / JSON công thức / thực phẩm từ ảnh |
| *(mọi service)* | `DELETE /internal/users/{userId}/data` | mỗi service tự dọn dữ liệu khi xoá tài khoản |

> **Luồng truy vết:** client gửi (hoặc gateway sinh) `X-Correlation-Id` → mỗi service ghi mã này vào
> MDC nên **mọi dòng log đều có tiền tố `[cid]`** → khi gọi service khác, client tự chuyển tiếp header.
> Một request của người dùng vì thế lần theo được toàn bộ chuỗi service mà nó đi qua.

### Kết Quả Dọn Dẹp Cấu Trúc

| | Trước | Sau |
|---|---|---|
| File Java | 328 | **220** |
| Dòng code Java | 20.734 | **12.615** |
| Bảng bị nhiều service cùng mô hình hoá | 16 | **0** (mỗi bảng đúng 1 chủ) |
| FK xuyên service ở tầng DB | 11 | **0** |
| Bản copy `security/` (JWT) | 6 | **0** |
| Bản copy `FoodImageSearchService` | 5 | **1** |
| Dockerfile | 7 (trùng lặp) | **1** (multi-stage, tham số hoá) |
| Database | 1 dùng chung | **6** riêng biệt |

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### 1. Yêu cầu môi trường
- **Java**: JDK **17+**.
- **MySQL 8+** (port `3306`) — 6 database `foodx_user`, `foodx_inventory`, `foodx_recipe`,
  `foodx_plan`, `foodx_ai`, `foodx_social`.
- **Redis** (port `6379`) — rate limiting ở gateway.
- **Docker & Docker Compose** (khuyên dùng).

### 2. Cách 1: Docker Compose (khuyên dùng)

```bash
cp .env.example .env      # tuỳ chọn: đặt bí mật thật; bỏ qua thì dùng giá trị dev
docker compose up --build
```

Compose tự lo phần khó: MySQL tạo sẵn 6 database + 6 tài khoản service (mount `db/init`), mỗi service
dùng đúng database + tài khoản của mình, và chỉ khởi động sau khi MySQL **healthy**. Image build theo
`Dockerfile` ở gốc repo (multi-stage, không cần build jar trước).

Truy cập:
- Web App (SPA): **http://localhost:8080**
- Health từng service: `http://localhost:8081/actuator/health` … `http://localhost:8086/actuator/health`

> Port `8081`–`8086` được publish cho việc phát triển/debug. Khi deploy thật, bỏ các mục `ports` đó
> trong `docker-compose.yml` để chỉ gateway ra ngoài (đã ghi chú `# PROD:` tại từng chỗ).

### 3. Cách 2: Chạy dev cục bộ bằng PowerShell

```powershell
.\start-dev.ps1 -Service build          # biên dịch toàn bộ
.\start-dev.ps1 -Service all            # chạy cả 7 service (mở cửa sổ riêng)
.\start-dev.ps1 -Service gateway        # chỉ API Gateway
.\start-dev.ps1 -Service user-service   # một service cụ thể
```

Khi chạy ngoài Docker, service dùng mặc định `localhost` và tài khoản `root` (JDBC URL có
`createDatabaseIfNotExist=true` nên 6 database tự được tạo).

### 4. Cách 3: Chạy thủ công qua Maven Wrapper

```powershell
.\mvnw.cmd spring-boot:run -pl api-gateway
.\mvnw.cmd spring-boot:run -pl services/user-service
```

---

## 🧩 Tính Năng Chính

| Khu vực | Tính năng |
|---|---|
| Tủ lạnh | Thêm/sửa/xoá thực phẩm, hạn dùng, gộp trùng, kho catalog, tra dinh dưỡng, ảnh local theo tên |
| Công thức | Duyệt/tìm, lọc, lưu món, tạo mới, **import từ văn bản (AI parse + regex fallback)**, chế độ nấu từng bước (giọng nói vi-VN, hẹn giờ) |
| **Khớp tủ lạnh** | `GET /api/recipes/match` — tìm món khớp nguyên liệu đang có trong tủ (tính % khớp theo dữ liệu nguyên liệu thật) |
| Kế hoạch bữa ăn | Thực đơn tuần 3 bữa, AI auto-fill theo hồ sơ + tủ lạnh, fallback thuật toán khi AI lỗi |
| Đi chợ | Danh sách mua sắm; **tích "đã mua" → tự nạp vào tủ lạnh** |
| Cộng đồng | Feed công khai (khách xem được), đăng bài, like, bình luận |
| AI Chat | Trợ lý nấu ăn đa phiên; **server tự nạp bối cảnh** (hồ sơ, dị ứng, tủ lạnh, lịch sử phiên); Groq → Gemini → Mock |
| Sức khỏe | Hồ sơ BMI/calo, chế độ ăn, dị ứng (ảnh hưởng prompt AI & lọc món) |
| Stats & vòng tiêu thụ | Lịch sử nấu, **streak ngày liên tiếp**, biểu đồ kcal; **"nấu xong" tự trừ nguyên liệu tủ theo khẩu phần** |
| Nhắc hết hạn | Nút "🔔 Bật nhắc hết hạn" (menu +) — dùng Notification API của trình duyệt |
| PWA | Cài đặt như app (manifest), precache shell, offline navigation, cache-first tĩnh + làm mới nền |

---

## 🔐 Bảo Mật & Vận Hành

- **JWT**: `/api/auth/register` & `/login` công khai; mọi API khác yêu cầu `Authorization: Bearer <token>`;
  đổi mật khẩu **bắt buộc** mật khẩu cũ. Token được ký/xác minh bằng cùng một khoá khai báo một lần ở
  `foodx-common` (trước đây mỗi service giữ một bản, có nguy cơ lệch nhau).
- **Cổng nội bộ `/internal/**`**: không được gateway định tuyến; yêu cầu `X-Foodx-Internal-Token`;
  gateway **không giữ** khoá JWT (chỉ đọc payload để lấy khoá rate-limit, không xác minh chữ ký).
- **Tài khoản DB least privilege**: mỗi service một tài khoản MySQL, chỉ có quyền trên database của mình.
- **Bí mật**: không commit. Đặt qua `.env` / biến môi trường `APP_JWT_SECRET`, `FOODX_INTERNAL_TOKEN`,
  `MYSQL_ROOT_PASSWORD`, `GROQ_API_KEY`, `GEMINI_API_KEY`. Chạy `--spring.profiles.active=prod` mà vẫn
  dùng giá trị dev ⇒ **ứng dụng dừng khởi động** kèm hướng dẫn (`SecretGuardConfiguration`).
- **Rate limit**: 120 yêu cầu/phút/user (Redis hoặc in-memory) cho các endpoint đắt tiền
  (`/api/ai/**`, tìm ảnh, dinh dưỡng, upload); kèm bulkhead giới hạn số request AI đồng thời.
- **Upload**: chỉ JPG/PNG/WEBP ≤ 5MB (từ chối SVG), yêu cầu đăng nhập.
- **CORS**: đóng (SPA cùng origin); tách frontend thì phải bật theo danh sách origin cụ thể.
- **Health**: `/actuator/health` công khai trên mọi service (do `foodx-common` mở, không service nào
  quên được) — dùng cho Docker healthcheck.
- **Lỗi**: `GlobalExceptionHandler` ghi log stack kèm correlation id; không lộ chi tiết nội bộ ra response.

---

## 🔭 Vận Hành & Truy Vết

```bash
# Trạng thái cụm
docker compose ps

# Log một service kèm mã tương quan
docker compose logs -f recipe-service

# Lần theo một request xuyên service: tìm mã tương quan rồi lọc theo nó
docker compose logs | grep '<correlation-id>'
```

Mọi dòng log có dạng `... INFO [<correlation-id>] c.n.f...` — cùng một request sẽ mang cùng mã ở
gateway và ở mọi service nó đi qua.

---

## 🧪 Kiểm Thử

- **Backend**: `.\mvnw.cmd verify`
  - Test nạp Spring context cho **cả 7 module** (`*ApplicationTests`, H2 in-memory nên không cần MySQL).
    Nhóm này bắt được lỗi wiring mà trình biên dịch không thấy — ví dụ Spring Boot 4 **không** tự tạo
    bean `RestClient.Builder`, hay Boot 4 dùng Jackson 3 (`tools.jackson`) trong khi mã nghiệp vụ dùng
    Jackson 2.
  - `FoodxPropertiesTest` khoá hợp đồng cấu hình: `FOODX_SERVICES_*` → `foodx.services.*` → field.
    Đổi tên property mà quên đổi biến môi trường sẽ làm test đỏ, thay vì để service âm thầm gọi
    `http://localhost` trong container.
  - `SecretGuardConfigurationTest` bảo đảm không thể chạy `prod` với bí mật dev.
  - `JwtTokenProviderTest`, `AuthServiceTest`, và test bảng định tuyến của gateway.
- **E2E UI**: bộ Katalon `katalon/` (BASE_URL `http://localhost:8080`) hoặc Playwright trong `tests/`.
- **API**: xem `API_DOCUMENTATION.md`.

---

## 🗄️ Nâng Cấp Database

Toàn bộ chi tiết nằm ở [`db/README.md`](db/README.md). Tóm tắt:

**DB hoàn toàn mới** — không cần làm gì: `db/init/00-create-databases.sql` (Docker) hoặc
`createDatabaseIfNotExist=true` trong JDBC URL tự tạo 6 database, JPA tạo bảng.

**DB cũ dùng chung một database `foodx`** — chạy lần lượt:

```bash
mysql -u root -p < db/migration/V2_service_boundaries.sql      # thêm cột ingredient_name
mysql -u root -p < db/migration/V3_database_per_service.sql    # tách sang database-per-service
```

V3 bỏ mọi FK, tạo 6 database + 6 tài khoản, rồi `RENAME TABLE` từng bảng sang database của service
sở hữu (di chuyển tức thời, **không copy dữ liệu**). Cuối script in ra bảng thống kê và danh sách FK
xuyên service còn sót (phải rỗng) trước khi bạn `DROP DATABASE foodx;`.

---

## 🚧 Nợ Kỹ Thuật Còn Lại

| # | Vấn đề | Hướng xử lý |
|---|---|---|
| 1 | **Gateway là reverse proxy tự viết** (`GatewayProxyController`), không phải Spring Cloud Gateway. | Chuyển sang `spring-cloud-starter-gateway-server-webflux` (Spring Cloud 2025.1.x cho Boot 4) + `CircuitBreaker` filter. Cần viết lại tầng rate-limit/bulkhead và tầng host SPA tĩnh sang WebFlux. |
| 2 | **Chưa có service discovery** — dùng DNS nội bộ của Docker Compose. | Eureka/Consul + `spring-cloud-starter-loadbalancer` (`lb://user-service`). Với quy mô hiện tại DNS là đủ và ít failure mode hơn. |
| 3 | **Migration lược đồ chưa có versioning**: còn dùng `ddl-auto=update`. | Thêm Flyway/Liquibase, đặt `ddl-auto=validate`, sinh migration cơ sở từ entity hiện tại. |
| 4 | **Fan-out xoá người dùng là gọi HTTP đồng bộ** (5 lời gọi). | Phát sự kiện `user.deleted` qua RabbitMQ/Kafka để các service tự tiêu thụ; đồng thời bỏ được 5 lời gọi chặn. |
| 5 | **Bí mật vẫn có giá trị mặc định cho dev trong mã nguồn** (đã có `SecretGuard` chặn ở prod). | Spring Cloud Config / secret manager (Vault) để không còn default nào trong repo. |
| 6 | **Tài khoản DB dùng chung một mật khẩu dev** cho 6 service. | Cấp mật khẩu riêng ngẫu nhiên cho từng service khi triển khai (đã tách quyền theo database). |
| 7 | **Truy vết mới ở mức correlation id**, chưa có tracing chuẩn. | Micrometer Tracing + OpenTelemetry, xuất span sang Jaeger/Tempo. |
| 8 | **Chưa có metrics exporter** (chỉ có `/actuator/health`). | Thêm `micrometer-registry-prometheus` + Prometheus/Grafana. |
| 9 | Bug có sẵn ở frontend: nút xoá món trong `js/modules/plan.js` gọi `DELETE /api/plan/{id}` nhưng backend chỉ có `@DeleteMapping /api/plan?date=&slot=`. | Sửa cho khớp hợp đồng API. |
| 10 | `db/schema.sql`, `db/data.sql`, `db/seed-sample.sql` là tài liệu/dữ liệu của lược đồ cũ (một database). | Chuyển thành migration có versioning (mục 3) và seed theo từng service. |

---

## 📌 Lộ Trình Gần Đây (đã làm)

**Đợt 2 — nền tảng chuẩn microservice:**
- **Database per service**: 6 database + 6 tài khoản MySQL least-privilege; xoá toàn bộ FK xuyên
  service; migration `V3` di chuyển bảng bằng `RENAME TABLE` (không copy dữ liệu).
- **Docker**: từ 7 Dockerfile trùng lặp còn **1** Dockerfile multi-stage ở gốc repo (build được cả
  `foodx-common`), chạy bằng user thường, có `HEALTHCHECK`; thêm `.dockerignore`, `.env.example`;
  compose có healthcheck cho MySQL/Redis và `depends_on: service_healthy`.
- **Chịu lỗi**: timeout kết nối/đọc + retry cho lời gọi GET ở mọi client nội bộ.
- **Truy vết**: `X-Correlation-Id` sinh ở gateway, lưu vào MDC (mọi dòng log đều có), tự chuyển tiếp
  sang service kế tiếp.
- **Cấu hình**: bỏ `app.jwt.*` / `foodx.internal.token` / `foodx.services.*` trùng lặp khỏi 6 file
  `application.properties` (mặc định nằm một chỗ ở `foodx-common`, override bằng biến môi trường);
  thêm `SecretGuardConfiguration` chặn chạy prod với bí mật dev.
- **Actuator** cho mọi module + `/actuator/health` được mở công khai tại `foodx-common`.
- **Test**: thêm test context cho gateway, test hợp đồng cấu hình env→property, test `SecretGuard`.

**Đợt 1 — tách biên giới microservice:**
- Gộp JWT + phân quyền vào `foodx-common`, xoá 6 bản `security/` copy-paste (mỗi bản ~275 LOC).
- Mỗi service chỉ còn `@Entity`/`@Repository` cho bảng mình sở hữu; xoá ~12.000 LOC domain trùng lặp
  (`auth`, `profile`, `fridge`, `food`, `ingredient`, `recipe`) khỏi các service không sở hữu nó.
- Thay truy cập DB chéo service bằng HTTP client dùng chung qua `/internal/**`.
- Chuyển thuật toán trừ nguyên liệu sau khi nấu từ social-stats-service về inventory-service
  (nơi sở hữu tủ lạnh); gộp 5 bản `FoodImageSearchService` giống hệt nhau vào `foodx-common`.
- Danh tính người dùng lấy từ claims JWT: `Long userId` thay `@ManyToOne User` ở 5 service.
- Bảng định tuyến gateway chuyển từ `if/else` trong Java sang cấu hình `gateway.routes[*]`.
- `AdminUserController` không còn `DELETE` xuyên 5 service khác; mỗi service tự dọn qua
  `/internal/users/{id}/data`.
- Hợp nhất POM: `foodx-parent` trở thành parent thật của cả 9 module (bỏ ~300 dòng trùng lặp).

**Trước đó:**
- Gỡ mã chết frontend, hợp nhất `index.html`/`app.html`.
- Thay nội dung demo giả bằng dữ liệu API thật; feed cộng đồng mở cho khách đọc.
- Seed công thức kèm nguyên liệu/category/ảnh local; bật tính năng khớp tủ lạnh server-side.
- Chat AI có bối cảnh người dùng + nhớ lịch sử phiên; rate-limit; upload & endpoint nhạy cảm yêu cầu JWT.
- PWA: sửa cache (khớp path, bỏ query), nén ảnh (~10MB → ~5.6MB), lazy-load ảnh toàn cục.
- Vòng tiêu thụ: nấu xong trừ nguyên liệu tủ; stats hết N+1; streak nấu ăn; nhắc hết hạn bằng Notification API.
