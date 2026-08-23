# FoodX - Trợ Lý Nấu Ăn & Quản Lý Thực Phẩm Thông Minh

FoodX là nền tảng quản lý tủ lạnh, gợi ý thực đơn, lập kế hoạch bữa ăn và mạng xã hội chia sẻ công thức nấu ăn tích hợp Trợ lý AI (Google Gemini & Groq LLM).

---

## 🏗️ Cấu Trúc Dự Án (Project Architecture)

Dự án được phân chia theo mô hình **Package-by-Feature** cả ở Backend (Spring Boot) và Frontend (Modular JavaScript) giúp mã nguồn tường minh, dễ tìm kiếm, mở rộng và bảo trì.

```text
foodx/
├── pom.xml                               # Quản lý dependency Maven & build Spring Boot
├── Readme.md                             # Tài liệu kiến trúc & hướng dẫn hệ thống
│
├── src/
│   └── main/
│       ├── java/com/nhom6/foodx/         # BACKEND (Spring Boot Java 21)
│       │   ├── FoodxApplication.java     # Class khởi chạy ứng dụng Spring Boot
│       │   │
│       │   ├── ai/                       # Tích hợp AI (Gemini, Groq, Mock)
│       │   │   ├── config/               # Cấu hình API Key (GeminiConfig, GroqConfig)
│       │   │   ├── controller/           # API gợi ý & trợ lý AI (AIController)
│       │   │   ├── dto/                  # ChatRequest, SuggestRequest, GeminiDTO...
│       │   │   ├── service/              # ChatService, GeminiService, GroqService, SuggestionService
│       │   │   └── util/                 # Template prompt chuẩn hoá (PromptTemplate)
│       │   │
│       │   ├── auth/                     # Xác thực & Phân quyền Người dùng
│       │   │   ├── controller/           # AuthController (Đăng nhập, Đăng ký, Me)
│       │   │   ├── dto/                  # LoginRequest, RegisterRequest, AuthResponse
│       │   │   ├── entity/               # User (Thông tin tài khoản, Role)
│       │   │   ├── repository/           # UserRepository
│       │   │   └── service/              # AuthService (Xử lý mật khẩu BCrypt, cấp JWT)
│       │   │
│       │   ├── chat/                     # Quản lý Lịch sử & Đa phiên Chat AI
│       │   │   ├── controller/           # ChatSessionController
│       │   │   ├── dto/                  # SessionResponse, SendMessageRequest, MessageResponse
│       │   │   ├── entity/               # ChatSession, ChatMessage
│       │   │   ├── repository/           # ChatSessionRepository, ChatMessageRepository
│       │   │   └── service/              # ChatSessionService (Lưu phiên, tự đặt tên theo câu hỏi)
│       │   │
│       │   ├── common/                   # Thành phần Dùng chung
│       │   │   ├── dto/                  # ApiResponse chuẩn hóa kết quả JSON
│       │   │   └── exception/            # BusinessException, GlobalExceptionHandler
│       │   │
│       │   ├── config/                   # Cấu hình Hệ thống (OpenApi Swagger, WebMvc)
│       │   │   ├── OpenApiConfig.java
│       │   │   └── WebConfig.java
│       │   │
│       │   ├── food/                     # Danh mục Thực phẩm & Nguyên liệu Gốc
│       │   │   ├── controller/           # FoodController
│       │   │   ├── entity/               # Food (Dinh dưỡng: kcal, protein, fat, carb)
│       │   │   ├── repository/           # FoodRepository
│       │   │   └── service/              # FoodService
│       │   │
│       │   ├── fridge/                   # Quản lý Tủ Lạnh Ảo
│       │   │   ├── controller/           # FridgeController (CRUD kho nguyên liệu)
│       │   │   ├── dto/                  # FridgeItemRequest, FridgeItemResponse
│       │   │   ├── entity/               # FridgeItem (Số lượng, Đơn vị, Hạn sử dụng)
│       │   │   ├── repository/           # FridgeItemRepository
│       │   │   └── service/              # FridgeService (Kiểm soát hạn dùng, nạp nguyên liệu mua)
│       │   │
│       │   ├── home/                     # Trang chủ & Bảng điều khiển (Dashboard)
│       │   │   ├── controller/           # HomeController
│       │   │   ├── dto/                  # HomeDashboardResponse
│       │   │   └── service/              # HomeService
│       │   │
│       │   ├── plan/                     # Kế hoạch Bữa Ăn (Meal Planner)
│       │   │   ├── controller/           # PlanController
│       │   │   ├── dto/                  # MealPlanRequest, MealPlanResponse
│       │   │   ├── entity/               # MealPlan, MealPlanItem (Sáng, Trưa, Tối)
│       │   │   ├── repository/           # MealPlanRepository, MealPlanItemRepository
│       │   │   └── service/              # PlanService (Lên thực đơn theo calo & ngày)
│       │   │
│       │   ├── recipe/                   # Kho Công Thức Nấu Ăn
│       │   │   ├── controller/           # RecipeController (Tìm kiếm, bộ lọc, lưu món)
│       │   │   ├── dto/                  # RecipeRequest, RecipeResponse
│       │   │   ├── entity/               # Recipe, RecipeIngredient, SavedRecipe
│       │   │   ├── repository/           # RecipeRepository, SavedRecipeRepository
│       │   │   └── service/              # RecipeService
│       │   │
│       │   ├── security/                 # Bảo mật Spring Security + JWT
│       │   │   ├── JwtAuthenticationFilter.java  # Lọc và giải mã token Bearer
│       │   │   ├── JwtTokenProvider.java         # Tạo và kiểm tra chữ ký token JWT
│       │   │   ├── SecurityConfig.java           # Phân quyền Endpoint công khai / riêng tư
│       │   │   └── UserDetailsServiceImpl.java   # Nạp thông tin người dùng cho Security Context
│       │   │
│       │   ├── shopping/                 # Danh Sách Đi Chợ (Shopping List)
│       │   │   ├── controller/           # ShoppingController
│       │   │   ├── dto/                  # ShoppingItemRequest, ShoppingItemResponse
│       │   │   ├── entity/               # ShoppingItem (Trạng thái đã mua / chưa mua)
│       │   │   ├── repository/           # ShoppingItemRepository
│       │   │   └── service/              # ShoppingService (Tích đã mua -> Tự động nạp vào tủ lạnh)
│       │   │
│       │   ├── social/                   # Mạng Xã Hội Chia Sẻ Công Thức
│       │   │   ├── controller/           # SocialController
│       │   │   ├── dto/                  # SocialPostRequest, CommentRequest, PostResponse
│       │   │   ├── entity/               # SocialPost, PostComment, PostLike
│       │   │   ├── repository/           # SocialPostRepository, CommentRepository, LikeRepository
│       │   │   └── service/              # SocialService (Đăng bài, bình luận, thả tim, trích xuất mua)
│       │   │
│       │   └── user/                     # Hồ Sơ Cá Nhân & Chỉ Số Sức Khỏe
│       │       ├── controller/           # ProfileController
│       │       ├── dto/                  # ProfileDto, UserProfileResponse
│       │       ├── entity/               # UserProfile (Chiều cao, Cân nặng, Mục tiêu, Dị ứng)
│       │       ├── repository/           # UserProfileRepository
│       │       └── service/              # ProfileService (Tính toán chỉ số sức khỏe)
│       │
│       └── resources/
│           ├── application.properties    # Cấu hình Spring Boot chung (MySQL, JWT, Port 8080)
│           ├── application-dev.properties
│           ├── application-prod.properties
│           │
│           └── static/                   # FRONTEND (Single Page Application)
│               ├── css/
│               │   └── style.css         # Toàn bộ giao diện FoodX (Dark/Light mode, Responsive)
│               │
│               ├── js/
│               │   ├── core/             # Package Lõi & Tiện ích chung
│               │   │   ├── config.js     # Hằng số hệ thống, Endpoint API, URL mặc định
│               │   │   ├── state.js      # Quản lý State toàn cục & đồng bộ LocalStorage
│               │   │   ├── utils.js      # Toast, Format tiền/calo, chuẩn hóa chuỗi
│               │   │   └── router.js     # Điều hướng View (openView), Drawer menu, Bottom Nav
│               │   │
│               │   ├── modules/          # Package Tính Năng Chuyên Biệt
│               │   │   ├── auth/         # Module Xác thực (auth.js: Token JWT, Modal Auth)
│               │   │   ├── profile/      # Module Hồ sơ & Sức khỏe (profile.js: BMI, Dinh dưỡng)
│               │   │   ├── fridge/       # Module Tủ lạnh (fridge.js: Quản lý kho, AI cứu tủ)
│               │   │   ├── recipe/       # Module Công thức (recipe.js: Tìm kiếm, Chi tiết món)
│               │   │   ├── plan/         # Module Kế hoạch (plan.js: Bữa ăn 3 bữa, Thực đơn tuần)
│               │   │   ├── shopping/     # Module Đi chợ (shopping.js: Tích mua -> Nạp vào tủ)
│               │   │   ├── social/       # Module Cộng đồng (social.js: Đăng bài, Bình luận, Tim)
│               │   │   ├── chat/         # Module AI Chat (chat.js: Đa phiên, Lịch sử theo tài khoản)
│               │   │   └── onboarding/   # Module Khảo sát (onboarding.js: Sở thích, Khẩu vị)
│               │   │
│               │   └── app.js            # Điểm khởi chạy chính & Khởi tạo ứng dụng FoodX
│               │
│               ├── index.html            # Trang giao diện chính của ứng dụng
│               ├── app.html              # Trang Web App FoodX
│               └── ai-chat-test.html     # Giao diện kiểm thử AI Chat widget
│
└── db/
    ├── schema.sql                        # Cấu trúc bảng cơ sở dữ liệu MySQL
    └── data.sql                          # Dữ liệu mẫu nguyên liệu & công thức món ăn
```

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Ứng Dụng

### 1. Yêu cầu môi trường
- **Java**: JDK 21 trở lên.
- **MySQL**: Phiên bản 8.0 trở lên (Cổng `3306`, database `foodx`).
- **Maven**: Đã tích hợp sẵn file thực thi `./mvnw` / `.\mvnw.cmd`.

### 2. Cấu hình cơ sở dữ liệu
Chỉnh sửa thông tin kết nối trong file `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/foodx?createDatabaseIfNotExist=true&serverTimezone=UTC&useSSL=false&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=your_mysql_password
```

### 3. Khởi chạy ứng dụng
Mở terminal tại thư mục gốc của dự án và chạy:
```bash
# Windows
.\mvnw.cmd spring-boot:run

# Linux / MacOS
./mvnw spring-boot:run
```

Truy cập ứng dụng tại trình duyệt: **`http://localhost:8080`**
- **Tài liệu Swagger API**: `http://localhost:8080/swagger-ui.html`