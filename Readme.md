# FoodX - Trợ Lý Nấu Ăn & Quản Lý Thực Phẩm Thông Minh

FoodX là nền tảng quản lý tủ lạnh, gợi ý thực đơn, lập kế hoạch bữa ăn và mạng xã hội chia sẻ công thức nấu ăn tích hợp Trợ lý AI (Google Gemini & Groq LLM).

---

## 🏗️ Kiến Trúc Hệ Thống (Microservices)

FoodX xây dựng trên kiến trúc **Microservices (Spring Boot 4.x / Java 17)** kết hợp **Spring Cloud Gateway** làm cổng trung gian điều phối và reverse proxy phục vụ frontend **SPA Vanilla JS (PWA)**.

```text
foodx/
├── pom.xml                                # Maven Parent Aggregator (Java 17, Spring Boot)
├── Readme.md                              # Tài liệu dự án
├── API_DOCUMENTATION.md                   # Tài liệu API đồng bộ hệ thống
├── docker-compose.yml                     # Cụm container: 7 Services + MySQL 8.0 + Redis 7
├── start-dev.ps1                          # Script quản lý & khởi chạy dev nhanh trên Windows
│
├── api-gateway/                           # API Gateway (Cổng 8080) & Host Frontend SPA
│   ├── src/main/java/com/nhom6/foodx/gateway/ # Proxy, Security, Rate Limit, CORS
│   └── src/main/resources/static/         # Frontend SPA (HTML5, CSS3, Vanilla JS, PWA)
│
├── foodx-common/                          # Module chia sẻ (DTO, ApiResponse, Utilities)
│
└── services/                              # Cụm 6 Microservices nghiệp vụ độc lập
    ├── user-service/                      # Cổng 8081: Xác thực JWT, Hồ sơ người dùng, Admin
    ├── inventory-service/                 # Cổng 8082: Tủ lạnh ảo, Catalog thực phẩm, Nguyên liệu
    ├── recipe-service/                    # Cổng 8083: Kho công thức, Khớp món tủ lạnh
    ├── plan-shopping-service/             # Cổng 8084: Kế hoạch bữa ăn, Danh sách đi chợ
    ├── ai-service/                        # Cổng 8085: Trợ lý AI (Gemini, Groq), Gợi ý thực đơn
    └── social-stats-service/              # Cổng 8086: Cộng đồng, Like/Comment, Lịch sử & Streak
```

### Phân Bổ Cổng & Điều Phối API

| Dịch vụ | Port nội bộ | Định tuyến qua Gateway (`:8080`) | Trách nhiệm chính |
|---|---|---|---|
| **api-gateway** | `8080` | `/` (Web SPA), `/api/**` | Reverse proxy, Frontend host, Rate limiting (Redis/In-memory) |
| **user-service** | `8081` | `/api/auth/**`, `/api/profile/**`, `/api/admin/users/**` | Đăng ký, đăng nhập JWT, hồ sơ dinh dưỡng, quản trị user |
| **inventory-service** | `8082` | `/api/fridge/**`, `/api/foods/**`, `/api/ingredients/**` | Quản lý kho tủ lạnh cá nhân, catalog thực phẩm, tra cứu dinh dưỡng |
| **recipe-service** | `8083` | `/api/recipes/**` | Công thức nấu ăn, phân loại danh mục, thuật toán khớp nguyên liệu tủ |
| **plan-shopping-service** | `8084` | `/api/plans/**`, `/api/shopping/**` | Lên thực đơn tuần, danh sách đi chợ (tự nạp tủ lạnh khi mua xong) |
| **ai-service** | `8085` | `/api/ai/**` | Tích hợp Groq LLM & Google Gemini, tư vấn dinh dưỡng đa phiên |
| **social-stats-service** | `8086` | `/api/social/**`, `/api/stats/**` | Bài viết cộng đồng, tương tác xã hội, lịch sử nấu và streak |

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### 1. Yêu cầu môi trường
- **Java**: JDK **17+**.
- **MySQL 8+** (port `3306`, database `foodx`).
- **Redis** (port `6379`, tùy chọn cho rate limiting & caching).
- **Docker & Docker Compose** (khuyên dùng khi chạy toàn bộ hệ thống).

### 2. Cách 1: Khởi chạy bằng Docker Compose (Khuyên dùng)
Chạy toàn bộ cơ sở dữ liệu, Redis, Gateway và 6 microservices chỉ với 1 câu lệnh:
```bash
docker compose up --build
```
Truy cập:
- Web App (SPA): **http://localhost:8080**
- API Docs & Swagger: **http://localhost:8080/swagger-ui.html**

### 3. Cách 2: Khởi chạy môi trường Dev cục bộ bằng PowerShell Script
FoodX cung cấp script [start-dev.ps1](file:///d:/du_an_ca_nhan/foodx/start-dev.ps1) hỗ trợ quản lý dev thuận tiện:

```powershell
# Biên dịch toàn bộ các module microservices
.\start-dev.ps1 -Service build

# Khởi chạy tất cả 7 microservices cùng lúc (mở các cửa sổ riêng)
.\start-dev.ps1 -Service all

# Khởi chạy cụm dịch vụ lõi (Gateway: 8080, User: 8081, Inventory: 8082)
.\start-dev.ps1 -Service core

# Chỉ chạy API Gateway (kèm Frontend)
.\start-dev.ps1 -Service gateway

# Chạy một dịch vụ cụ thể (user-service, recipe-service, ai-service...)
.\start-dev.ps1 -Service user-service
```

### 4. Cách 3: Khởi chạy thủ công từng service qua Maven Wrapper
```powershell
# Khởi chạy API Gateway
.\mvnw.cmd spring-boot:run -f api-gateway/pom.xml

# Khởi chạy User Service
.\mvnw.cmd spring-boot:run -f services/user-service/pom.xml
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
