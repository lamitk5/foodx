# FoodX - Trợ Lý Nấu Ăn & Quản Lý Thực Phẩm Thông Minh

FoodX là nền tảng quản lý tủ lạnh, gợi ý thực đơn, lập kế hoạch bữa ăn và mạng xã hội chia sẻ công thức nấu ăn, tích hợp Trợ lý AI (Google Gemini & Groq LLM).

**Repository:** https://github.com/lamitk5/foodx

---

## 👥 Nhóm phát triển & phân công

| Thành viên | GitHub | Nhánh làm việc | Phạm vi phụ trách |
|---|---|---|---|
| **Nguyễn Thị Hồng Hạnh** | [`honghanh45`](https://github.com/honghanh45) | `feature/hanh` | Đăng nhập / đăng ký (JWT), đổi mật khẩu, hồ sơ & cá nhân hóa (BMI, TDEE, calo), onboarding, avatar, danh sách yêu thích (UI profile) |
| **Hoàng Phương Thảo** | [`PhuongThao05102`](https://github.com/PhuongThao05102) | `feature/thao` | Tủ lạnh, catalog nguyên liệu, ước tính dinh dưỡng, kế hoạch bữa ăn tuần, danh sách đi chợ |
| **Mai Hải Đăng** | [`haidang22072005-creator`](https://github.com/haidang22072005-creator) | `feature/dang` | Kho công thức, import công thức, khớp món với tủ lạnh, cộng đồng (feed, like, bình luận), yêu thích công thức |
| **Cao Bảo Lâm** | [`lamitk5`](https://github.com/lamitk5) | `feature/lam` | Trang chủ, Trợ lý AI, quản trị Admin, API Gateway, Docker/infra, PWA & tích hợp hệ thống |

Nhánh tích hợp chung: **`master`** (bản đầy đủ microservices). Mỗi nhánh `feature/*` giữ lịch sử commit theo phần việc của từng thành viên.

---

## 🏗️ Kiến trúc hệ thống (Microservices)

FoodX dùng **Spring Boot 4.x / Java 17**, **Spring Cloud Gateway** làm cổng `:8080`, frontend **SPA Vanilla JS (PWA)** phục vụ tại gateway.

### Cấu trúc thư mục (hiện tại)

```text
foodx/
├── pom.xml                          # Maven parent (aggregator 8 module)
├── Readme.md
├── API_DOCUMENTATION.md             # Mô tả API đồng bộ giữa các service
├── HELP.md
├── docker-compose.yml               # MySQL 8, Redis 7, Gateway + 6 service
├── start-dev.ps1                    # Script dev trên Windows
├── mvnw, mvnw.cmd                   # Maven Wrapper
│
├── db/
│   └── database-design.md           # Thiết kế CSDL
│
├── scripts/                         # Script hỗ trợ vận hành / dev
│
├── .github/                         # Quy ước review / CI (nếu có)
│
├── foodx-common/                    # DTO, ApiResponse, exception, utils dùng chung
│   └── src/main/java/com/nhom6/foodx/common/
│
├── api-gateway/                     # Cổng 8080: proxy + host SPA
│   └── src/main/
│       ├── java/com/nhom6/foodx/gateway/   # GatewayProxyController, rate limit, static
│       └── resources/static/               # Frontend production (index.html + app.js)
│           ├── index.html, app.html, manifest.json, sw.js
│           ├── css/                          # style.bundle.css, views/, components/
│           ├── js/
│           │   ├── app.js                    # Entry chính (monolith, ~16k dòng)
│           │   ├── main.js                   # Entry module (ES import, dùng khi chuyển dần)
│           │   └── modules/                  # Tách theo nghiệp vụ (đồng bộ với app.js)
│           │       ├── auth.js, profile.js, onboarding.js    → Hạnh
│           │       ├── fridge.js, plan.js, shopping.js, foodCatalog.js → Thảo
│           │       ├── recipes.js, social.js, cooking.js       → Đăng
│           │       ├── home.js, chat.js, admin.js, navigation.js, stats.js, threeD.js → Lâm
│           │       └── utils.js, state.js, data.js             → Dùng chung
│           └── images/, icons/
│
└── services/
    ├── user-service/                # :8081 — auth, profile, admin users
    ├── inventory-service/           # :8082 — fridge, foods, ingredients, upload ảnh
    ├── recipe-service/              # :8083 — recipes, favorites, match tủ lạnh
    ├── plan-shopping-service/       # :8084 — meal plan, shopping list
    ├── ai-service/                  # :8085 — chat & gợi ý AI (Groq / Gemini)
    └── social-stats-service/        # :8086 — social feed, stats, streak nấu ăn
```

Mỗi service có cấu trúc Maven chuẩn: `src/main/java`, `src/main/resources/application.properties`, `Dockerfile`, `pom.xml`.

### Phân bổ cổng & điều phối API

| Dịch vụ | Port | Gateway (`:8080`) | Trách nhiệm |
|---|---|---|---|
| **api-gateway** | 8080 | `/`, `/api/**` | Reverse proxy, SPA, rate limit |
| **user-service** | 8081 | `/api/auth/**`, `/api/profile/**`, `/api/admin/users/**` | JWT, hồ sơ, admin user |
| **inventory-service** | 8082 | `/api/fridge/**`, `/api/foods/**`, `/api/ingredients/**`, `/api/upload/**` | Tủ lạnh, catalog, dinh dưỡng |
| **recipe-service** | 8083 | `/api/recipes/**`, `/api/favorites/**`, `/api/home/**` | Công thức, yêu thích, ảnh món |
| **plan-shopping-service** | 8084 | `/api/plans/**`, `/api/shopping/**` | Kế hoạch tuần, đi chợ |
| **ai-service** | 8085 | `/api/ai/**` | Chat & gợi ý AI |
| **social-stats-service** | 8086 | `/api/social/**`, `/api/stats/**` | Cộng đồng, thống kê nấu |

---

## 🚀 Cài đặt & khởi chạy

### Yêu cầu

- JDK **17+**
- **MySQL 8+** (database `foodx`, port `3306`)
- **Redis 7** (port `6379`, rate limit / cache)
- **Docker Compose** (khuyên dùng)

### Docker Compose (khuyên dùng)

```bash
docker compose up --build
```

- Web: http://localhost:8080  
- Swagger: http://localhost:8080/swagger-ui.html  

Volume `foodx_uploads` dùng chung giữa gateway, user-service và inventory-service để avatar/ảnh upload hiển thị đúng.

### Dev trên Windows (`start-dev.ps1`)

```powershell
.\start-dev.ps1 -Service build
.\start-dev.ps1 -Service all
.\start-dev.ps1 -Service core
.\start-dev.ps1 -Service gateway
.\start-dev.ps1 -Service user-service
```

### Maven thủ công

```bash
./mvnw -pl api-gateway -am spring-boot:run
./mvnw -pl services/user-service -am spring-boot:run
```

---

## 🧩 Tính năng chính (theo module)

| Khu vực | Người phụ trách | Tính năng |
|---|---|---|
| Auth & hồ sơ | Hạnh | Đăng ký/đăng nhập JWT, đổi mật khẩu, onboarding 3 bước, BMI/TDEE/calo, avatar |
| Tủ lạnh & nguyên liệu | Thảo | CRUD tủ lạnh, hạn dùng, catalog, ước tính calo, admin nguyên liệu |
| Kế hoạch & đi chợ | Thảo | Thực đơn tuần (sáng/trưa/tối), danh sách mua, tích đã mua → nạp tủ |
| Công thức & nấu | Đăng | Kho công thức, import text, khớp tủ (`/api/recipes/match`), chế độ nấu từng bước |
| Cộng đồng & yêu thích | Đăng | Feed, like/comment, bài của tôi, đồng bộ favorites |
| Trang chủ & AI | Lâm | Dashboard, chat đa phiên (Groq → Gemini), gợi ý theo hồ sơ + tủ lạnh |
| Admin & hạ tầng | Lâm | Quản lý user/công thức, gateway, Docker, PWA (`sw.js`, manifest) |

---

## 🔐 Bảo mật (tóm tắt)

- JWT: `/api/auth/register`, `/login` công khai; còn lại cần `Authorization: Bearer <token>`.
- `/api/admin/**` yêu cầu role **ADMIN**.
- Upload: JPG/PNG/WEBP ≤ 5MB; biến môi trường `JWT_SECRET`, `GROQ_API_KEY`, `GEMINI_API_KEY`, `DB_*` khi deploy.

---

## 🧪 Kiểm thử & tài liệu

- Backend: `./mvnw test`
- API: `API_DOCUMENTATION.md` và Swagger tại `/swagger-ui.html`
- Thiết kế DB: `db/database-design.md`

---

## 📌 Ghi chú phát triển

- Production load **`/js/app.js`** từ `index.html`; các file trong `js/modules/` là module tách song song (cần giữ đồng bộ khi sửa).
- Nhánh `feature/hanh`, `feature/thao`, `feature/dang`, `feature/lam` dùng cho báo cáo phân công; **`master`** là bản tích hợp đầy đủ.
