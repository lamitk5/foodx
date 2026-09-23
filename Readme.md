# FoodX - Trợ Lý Nấu Ăn & Quản Lý Thực Phẩm Thông Minh

FoodX là nền tảng quản lý tủ lạnh, gợi ý thực đơn, lập kế hoạch bữa ăn và mạng xã hội chia sẻ công thức nấu ăn tích hợp Trợ lý AI (Google Gemini & Groq LLM).

---

## 🏗️ Kiến Trúc Dự Án

Backend **Spring Boot (Java 17)** chia theo **Package-by-Feature**; frontend là **SPA Vanilla JS** chạy từ static resource của chính backend (không tách server, không build step — phù hợp quy mô hiện tại).

```text
foodx/
├── pom.xml                                # Maven (Spring Boot parent 4.1.0, Java 17)
├── Readme.md                              # Tài liệu này
├── API_DOCUMENTATION.md                   # Tài liệu API đầy đủ (đồng bộ với mã nguồn)
│
├── src/main/java/com/nhom6/foodx/
│   ├── FoodxApplication.java              # Điểm khởi chạy
│   ├── auth/                              # Đăng nhập/đăng ký JWT (controller, entity, service)
│   ├── ai/                                # Tích hợp AI: Groq → Gemini → Mock (dự phòng)
│   │   ├── config/                        # GeminiConfig, GroqConfig
│   │   ├── controller/ dto/ service/      # AIController, ChatService, SuggestionService,
│   │   │                                  #   AiContextService (nạp bối cảnh hồ sơ + tủ lạnh), MockAiDataService
│   │   └── util/PromptTemplate.java       # Mẫu prompt chuẩn hoá
│   ├── chat/                              # Phiên chat AI theo tài khoản (ChatSession/ChatMessage)
│   ├── common/
│   │   ├── config/                        # DataSeeder, OpenApiConfig, WebClientConfig, WebConfig
│   │   ├── exception/                     # BusinessException, GlobalExceptionHandler, ResourceNotFoundException
│   │   ├── response/ApiResponse.java      # Envelope JSON thống nhất {success,message,data,status}
│   │   └── utils/                         # DateUtils, StringUtils (searchable bỏ dấu tiếng Việt)
│   ├── food/                              # Catalog thực phẩm + tra dinh dưỡng + tìm ảnh (entity/repository/service)
│   ├── fridge/                            # Tủ lạnh ảo (fridge_stock), upload file
│   ├── home/                              # Dashboard công khai + WebPageController (/app)
│   ├── ingredient/                        # Danh mục nguyên liệu toàn cục
│   ├── plan/                              # Kế hoạch bữa ăn (AI auto-fill + fallback thuật toán)
│   ├── profile/                           # Hồ sơ dinh dưỡng + avatar (BMI/calo tính phía client, server lưu số liệu)
│   ├── recipe/                            # Kho công thức, nguyên liệu, lưu món, import text, khớp tủ
│   ├── security/                          # JWT filter/provider, SecurityConfig, ApiRateLimitFilter
│   ├── shopping/                          # Danh sách đi chợ (tích mua → tự nạp tủ lạnh)
│   ├── social/                            # Cộng đồng: bài viết, like, bình luận
│   └── stats/                             # Lịch sử nấu ăn + streak; nấu xong → trừ nguyên liệu tủ
│
├── src/main/resources/
│   ├── application.properties             # Cấu hình chung (profile mặc định: dev)
│   ├── application-dev.properties         # MySQL local (localhost:3306/foodx)
│   ├── application-prod.properties        # Production (JWT/DB qua env)
│   ├── application-ai-test.properties     # H2 in-memory — chạy thử KHÔNG cần MySQL
│   └── static/                            # FRONTEND (Single Page Application)
│       ├── index.html                     # File SPA DUY NHẤT (mọi view)
│       ├── app.html                       # Bộ chuyển hướng cũ → index.html (giữ URL /app.html)
│       ├── css/style.css                  # Toàn bộ giao diện (~10k dòng, dark/light, responsive)
│       ├── js/app.js                      # Toàn bộ logic frontend (SPA, ~15k dòng, không build step)
│       ├── sw.js + manifest.json          # PWA: precache app shell, offline navigation
│       ├── icons/ + images/               # Ảnh local (foods/recipes/avatars)
│       └── (js/core, js/modules, ai-chat-test.html đã được GỠ — mã chết/trang test không ship)
│
├── db/                                   # ⚠️ TÀI LIỆU THAM KHẢO CŨ — KHÔNG tự nạp khi chạy
│   ├── schema.sql / data.sql / seed-sample.sql / database-design.md
│   └── (lược đồ thật do JPA ddl-auto sinh từ @Entity; dữ liệu mẫu do DataSeeder seed)
│
├── katalon/                              # Bộ test UI Katalon (TC01–TC08, Test Suites/TS_FoodX_Full_UI.ts)
├── tests/playwright/                     # Bộ test frontend Playwright (Python, mock dữ liệu local)
└── target/                               # Output build
```

> ⚠️ **Ghi chú**: `db/*.sql` & `database-design.md` mô tả thiết kế giai đoạn đầu và **có thể lệch** với entity hiện tại (bảng thực tế: `fridge_stock`, `shopping_items`, `meal_plan_entries`, `foods`, `profiles`, `recipe_posts`, `chat_sessions`, `chat_messages`, `cook_history`, `saved_recipes`...). Nguồn chuẩn duy nhất là mã nguồn.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy

### 1. Yêu cầu môi trường
- **Java**: JDK **17+** (`pom.xml` đặt `java.version=17`).
- **MySQL 8+** (cổng `3306`, database `foodx`) — chỉ cần cho profile `dev`.
- **Maven**: dùng wrapper `./mvnw` / `.\mvnw.cmd` (không cần cài Maven riêng).

### 2. Cấu hình cơ sở dữ liệu (profile dev)
Sửa trong `src/main/resources/application-dev.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/foodx?createDatabaseIfNotExist=true&serverTimezone=UTC&useSSL=false&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=your_mysql_password
```

### 3. Khởi chạy
```bash
# Windows — chạy với MySQL local (profile dev là mặc định)
.\mvnw.cmd spring-boot:run

# Chạy KHÔNG cần MySQL (H2 in-memory — hợp để test AI/API)
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=ai-test"

# Production (cần set biến môi trường: DB_URL/DB_USER/DB_PASSWORD/JWT_SECRET/GROQ_API_KEY/GEMINI_API_KEY)
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=prod"
```

Truy cập:
- Ứng dụng: **http://localhost:8080** (SPA)
- Swagger UI: **http://localhost:8080/swagger-ui.html**
- H2 console (chỉ profile ai-test): http://localhost:8080/h2-console

### 4. Dữ liệu mẫu (DataSeeder)
Khi khởi động ở profile **khác `prod`** và database trống, `DataSeeder` tự seed:
- 5 tài khoản demo (mật khẩu mặc định **`123456`**, ví dụ `minhanh` / `admin`…)
- 20 thực phẩm catalog + tủ lạnh mẫu (có món sắp hết hạn để demo)
- **27 công thức Việt** kèm **đầy đủ nguyên liệu**, category (Món sáng / Món chính / Món nhanh / Món ăn kiêng / Món tráng miệng) và ảnh local

> Ở `prod`, DataSeeder KHÔNG chạy — dữ liệu do team tự quản lý (migration/import).

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

## 🔐 Bảo Mật & Vận Hành (tóm tắt)

- **JWT**: endpoint `/api/auth/register` & `/login` công khai; mọi API khác yêu cầu `Authorization: Bearer <token>`; đổi mật khẩu **bắt buộc** mật khẩu cũ.
- **Rate limit**: filter in-memory mặc định **30 yêu cầu/phút/IP** cho `/api/ai/**`, tìm ảnh, tra dinh dưỡng, upload (cấu hình `app.rate-limit-per-minute`).
- **Upload**: chỉ JPG/PNG/WEBP ≤ 5MB (từ chối SVG), yêu cầu đăng nhập.
- **CORS**: đóng (SPA cùng origin); nếu tách frontend phải bật theo danh sách origin cụ thể.
- **Bí mật**: không commit key thật. Khi deploy set env: `JWT_SECRET`, `GROQ_API_KEY`, `GEMINI_API_KEY`, `DB_*` (xem `application-prod.properties`).
- **Lỗi**: `GlobalExceptionHandler` ghi log stack; không lộ chi tiết lỗi nội bộ ra response.

---

## 🧪 Kiểm Thử
- Backend: `.\mvnw.cmd test` (hiện chỉ có test context-load — đang mở rộng dần).
- E2E UI: bộ Katalon `katalon/` (Test Suites/TS_FoodX_Full_UI.ts, BASE_URL http://localhost:8080) hoặc Playwright `tests/playwright/run_tests.py` (chạy độc lập với mock dữ liệu, không cần backend).
- API: xem `API_DOCUMENTATION.md` + Swagger tại `/swagger-ui.html`.

---

## 📌 Lộ Trình Gần Đây (đã làm)
- Gỡ mã chết frontend (`js/core`, `js/modules`, `ai-chat-test.html`), hợp nhất `index.html`/`app.html`.
- Thay nội dung demo giả (blog/feed ảo) bằng dữ liệu API thật; feed cộng đồng mở cho khách đọc.
- Seed công thức kèm nguyên liệu/category/ảnh local; bật tính năng khớp tủ lạnh server-side.
- Chat AI có bối cảnh người dùng + nhớ lịch sử phiên; rate-limit; upload & endpoint nhạy cảm yêu cầu JWT.
- PWA: sửa cache (khớp path, bỏ query), nén ảnh (~10MB → ~5.6MB), lazy-load ảnh toàn cục.
- Vòng tiêu thụ: nấu xong trừ nguyên liệu tủ; stats hết N+1; streak nấu ăn; nhắc hết hạn bằng Notification API.
