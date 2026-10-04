# FoodX — Toàn bộ sơ đồ UML dạng Mermaid (dán vào draw.io)

Mục lục: 0. Kiến trúc · 1. Use Case tổng quát · 2. Use Case phân rã · 3. Biểu đồ lớp ·
4. Hoạt động (autoFill) · 5. Tuần tự (Chat AI) · 6. Component · 7. Triển khai ·
8. Trạng thái ×3 · 9. Tuần tự bổ sung ×3 · 10. Hoạt động (Import) · 11. ER

## Cách nhập vào draw.io

1. Mở draw.io (app.diagrams.net hoặc bản desktop).
2. Chọn **Extras → Mermaid...** (một số phiên bản: dialog tạo mới có thẻ *Mermaid*, hoặc *File → New → Mermaid*).
3. Xóa nội dung mặc định, dán **một** khối `mermaid` bên dưới, nhấn **Insert / OK**.
4. draw.io tự layout — kéo lại cho gọn (vị trí sinh ra có thể chưa đẹp như bản SVG gốc).

### Lưu ý tương thích

- Nếu báo lỗi parse: xóa dòng `direction TB` / `direction LR` (trong `subgraph` hoặc `stateDiagram`) rồi thử lại.
- Mermaid không có diagram type Use Case riêng → Use Case dùng node ellipse `([...])` + `subgraph` làm khung hệ thống.
- Không dùng `classDef` / `style` / `linkStyle` để tránh lệch khi convert sang mxGraph.
- Nếu `erDiagram` không import được trên bản draw.io cũ, báo lại — sẽ chuyển sang dạng bảng.

---

## 0. Kiến trúc tổng quát

```mermaid
flowchart LR
    Browser["Trình duyệt SPA (PWA)"] --> GW["API Gateway :8080<br/>reverse-proxy + rate-limit"]
    GW --> US["user-service :8081<br/>auth, profile, admin"]
    GW --> IS["inventory-service :8082<br/>tủ lạnh, thực phẩm"]
    GW --> RS["recipe-service :8083<br/>công thức, match"]
    GW --> PS["plan-shopping-service :8084<br/>thực đơn, đi chợ"]
    GW --> AI["ai-service :8085<br/>chat, gợi ý"]
    GW --> SS["social-stats-service :8086<br/>cộng đồng, stats"]
    US & IS & RS & PS & AI & SS --> DB[("MySQL — DB foodx<br/>chung 1 database")]
    AI --> LLM["Groq / Gemini LLM"]
    PS -->|"POST /api/ai/generate"| AI
    RS -->|"POST /api/ai/parse-recipe"| AI
```

---

## 1. Use Case tổng quát

```mermaid
flowchart LR
    GUEST["Khách"]
    MEMBER["Thành viên"]
    ADMIN["Quản trị viên"]
    LLM["Groq / Gemini (ngoài hệ thống)"]

    subgraph SYS["Hệ thống FoodX"]
        UC1(["Đăng ký tài khoản"])
        UC2(["Đăng nhập & nhận JWT"])
        UC3(["Xem trang chủ, tìm công thức"])
        UC4(["Xem chi tiết công thức"])
        UC5(["Xem feed cộng đồng"])
        UC6(["Quản lý tủ lạnh ảo"])
        UC7(["Khớp công thức với tủ lạnh"])
        UC8(["Lưu / bỏ lưu công thức"])
        UC9(["Tạo & quản lý công thức"])
        UC10(["Import công thức từ văn bản"])
        UC11(["Lên thực đơn tuần (AI)"])
        UC12(["Danh sách đi chợ → nạp tủ"])
        UC13(["Trò chuyện với Trợ lý AI"])
        UC14(["Đăng bài & tương tác"])
        UC15(["Nấu xong & trừ nguyên liệu"])
        UC16(["Xem thống kê & streak"])
        UC17(["Quản lý hồ sơ dinh dưỡng"])
        UC18(["Quản lý người dùng"])
        UC19(["Phân quyền & xóa dữ liệu"])
    end

    GUEST --- UC1
    GUEST --- UC2
    GUEST --- UC3
    GUEST --- UC4
    GUEST --- UC5
    MEMBER --- UC6
    MEMBER --- UC7
    MEMBER --- UC8
    MEMBER --- UC9
    MEMBER --- UC10
    MEMBER --- UC11
    MEMBER --- UC12
    MEMBER --- UC13
    MEMBER --- UC14
    MEMBER --- UC15
    MEMBER --- UC16
    MEMBER --- UC17
    ADMIN --- UC18
    ADMIN --- UC19
    UC11 -.->|gọi LLM| LLM
    UC13 -.->|gọi LLM| LLM
```

---

## 2. Use Case phân rã

```mermaid
flowchart LR
    subgraph GA["1. Lên thực đơn tuần (AI) — POST /api/plan/auto"]
        PA(["Lên thực đơn tuần (AI auto-fill)"])
        A1(["Xác thực JWT (Bearer token)"])
        A2(["Đọc hồ sơ, tủ lạnh, catalog công thức"])
        A3(["Dựng prompt & gọi AI qua /api/ai/generate"])
        A4(["Parse JSON & tạo công thức thiếu"])
        A5(["Lưu MealPlanEntry (21 bữa)"])
        A6(["Fallback thuật toán (khi AI lỗi)"])
        PA -.->|include| A1
        PA -.->|include| A2
        PA -.->|include| A3
        PA -.->|include| A4
        PA -.->|include| A5
        PA -.->|extend| A6
    end

    subgraph GB["2. Đánh dấu đã mua — PATCH /api/shopping/{id}/toggle"]
        PB(["Đánh dấu đã mua (tự nạp tủ lạnh)"])
        B1(["Parse số & đơn vị từ chuỗi \"500g\""])
        B2(["Kiểm tra Food đã có trong tủ?"])
        B3(["Ước lượng dinh dưỡng & tạo Food mới"])
        B4(["Cộng dồn / tạo FridgeItem (hạn +7 ngày)"])
        PB -.->|include| B1
        PB -.->|include| B2
        PB -.->|include| B4
        PB -.->|extend| B3
    end

    subgraph GC["3. Nấu xong món ăn — POST /api/stats/cooked"]
        PC(["Nấu xong món ăn (ghi nhận + trừ tủ)"])
        C1(["Kiểm tra trùng (đã nấu hôm nay?)"])
        C2(["Lưu lịch sử CookHistory"])
        C3(["Quy đổi khẩu phần & trừ nguyên liệu tủ"])
        C4(["Cập nhật streak & thống kê 14 ngày"])
        PC -.->|include| C1
        PC -.->|include| C2
        PC -.->|include| C3
        PC -.->|include| C4
    end
```

---

## 3. Biểu đồ lớp

```mermaid
classDiagram
    direction TB
    class User {
        +Long id
        +String username
        +String email
        +String password
        +String fullName
        +String avatarUrl
        +Role role
    }
    class UserProfile {
        +String gender
        +Integer age
        +Double weight
        +Double height
        +String diet
        +String allergies
        +String dislikes
    }
    class Food {
        +String name
        +String type
        +Double kcal
        +Double protein
        +Double carb
        +Double fat
        +String imageUrl
        +Integer defaultExpiryDays
        +Boolean customFood
    }
    class FridgeItem {
        +Double quantity
        +String unit
        +LocalDate expiresAt
        +String note
    }
    class Ingredient {
        +String name
        +String defaultUnit
        +String category
    }
    class Recipe {
        +String title
        +String description
        +String instructions
        +Integer servings
        +String category
        +Integer kcal
        +String imageUrl
    }
    class RecipeIngredient {
        +Double quantity
        +String unit
        +String note
    }
    class SavedRecipe {
        +LocalDateTime savedAt
    }
    class Favorite {
        +Long userId
        +Long targetId
        +String targetType
    }
    class MealPlanEntry {
        +LocalDate planDate
        +String slot
        +Long recipeId
    }
    class ShoppingItem {
        +String name
        +String quantity
        +Integer price
        +Boolean done
    }
    class ChatSession {
        +String title
        +String mode
    }
    class ChatMessage {
        +String role
        +String content
        +String steps
    }
    class RecipePost {
        +String title
        +String description
        +String steps
        +String status
        +Integer kcal
    }
    class PostLike {
        +LocalDateTime createdAt
    }
    class PostComment {
        +String content
    }
    class CookHistory {
        +Long recipeId
        +LocalDate cookedAt
    }

    User "1" -- "1" UserProfile : ho so dinh duong
    User "1" -- "*" FridgeItem : tu lanh
    Food "1" -- "*" FridgeItem : trong tu
    User "1" -- "*" Recipe : tac gia
    Recipe "1" -- "*" RecipeIngredient : thanh phan
    Ingredient "1" -- "*" RecipeIngredient : dung trong
    User "1" -- "*" SavedRecipe
    Recipe "1" -- "*" SavedRecipe
    User "1" -- "*" Favorite
    User "1" -- "*" MealPlanEntry
    User "1" -- "*" ShoppingItem
    User "1" -- "*" ChatSession
    ChatSession "1" -- "*" ChatMessage
    User "1" -- "*" RecipePost : tac gia
    RecipePost "1" -- "*" PostLike
    User "1" -- "*" PostLike
    RecipePost "1" -- "*" PostComment
    User "1" -- "*" PostComment
    User "1" -- "*" CookHistory
```

---

## 4. Biểu đồ hoạt động — Tự động lên thực đơn tuần

```mermaid
flowchart TD
    S(["Thành viên gửi POST /api/plan/auto"]) --> A1["Đọc ProfileFacade · FridgeFacade<br/>· RecipeFacade (DB chung)"]
    A1 --> A2["Dựng prompt JSON<br/>(dị ứng · calo mục tiêu)"]
    A2 --> A3["HTTP POST /api/ai/generate"]
    A3 --> B1["ai-service: Gọi Groq API<br/>(lỗi → Gemini API) — trả text JSON"]
    B1 --> D{"JSON hợp lệ?"}
    D -->|Có| C1["Parse JSON &<br/>ensureRecipe từng món"]
    D -->|Không — AI lỗi| C2["Fallback thuật toán<br/>(phân pool theo slot, không trùng trong ngày)"]
    C1 --> C3["Lưu MealPlanEntry × 21 bữa"]
    C2 --> C3
    C3 --> R["Trả thực đơn 7 ngày × 3 bữa"]
    R --> E(["End"])
```

---

## 5. Biểu đồ tuần tự — Chat AI đa phiên

```mermaid
sequenceDiagram
    autonumber
    participant C as Trình duyệt (SPA)
    participant G as API Gateway :8080
    participant A as ai-service :8085
    participant CTX as AiContextService
    participant CS as ChatService
    participant P as AiProviderService
    participant LLM as Groq / Gemini
    participant DB as MySQL (foodx)

    C->>G: POST /api/chat/sessions/{id}/messages (JWT)
    G->>G: Rate-limit + reverse-proxy /api/chat/**
    G->>A: Forward request (HttpClient)
    A->>A: JwtAuthenticationFilter xác thực token
    A->>CTX: buildContext(userId)
    CTX->>DB: SELECT profile, fridge_items, 8 tin gần nhất
    DB-->>CTX: hồ sơ · tủ lạnh · lịch sử phiên
    CTX-->>A: chuỗi bối cảnh (cache TTL 45s)
    A->>CS: chat(request, context)
    CS->>CS: Dựng prompt (PromptTemplate, mode chat/step)
    CS->>P: generateText(prompt)
    P->>LLM: Groq API (WebClient)
    alt Groq thành công
        LLM-->>P: text trả lời
    else Groq lỗi / đang cooldown
        P->>LLM: Gemini API
        LLM-->>P: text trả lời
    end
    P-->>CS: reply + steps
    CS->>DB: Lưu ChatMessage (user) & (assistant)
    CS-->>C: { reply, steps, timestamp }
```

---

## 6. Biểu đồ thành phần

```mermaid
flowchart TB
    subgraph P["Tầng Presentation"]
        SPA["«component» SPA PWA<br/>index.html · Vanilla JS · Service Worker"]
    end

    subgraph G["«component» API Gateway :8080"]
        GW["GatewayProxyController (reverse-proxy /api/**)<br/>ApiRateLimitFilter (Redis, 120 req/phút)<br/>StaticHostController (SPA + /uploads)"]
    end

    subgraph B["Tầng Business — 6 microservices «component»"]
        direction TB
        USVC["user-service :8081 — AuthController · ProfileController · AdminUserController"]
        ISVC["inventory-service :8082 — FridgeController · IngredientController · FileUploadController"]
        RSVC["recipe-service :8083 — RecipeController · FavoriteController · HomeController"]
        PSVC["plan-shopping-service :8084 — PlanController · ShoppingController<br/>FridgeFacade · ProfileFacade · RecipeFacade"]
        ASVC["ai-service :8085 — AIController · ChatSessionController<br/>ChatService · AiProviderService · AiContextService"]
        SSVC["social-stats-service :8086 — SocialController · StatsController<br/>SocialService · StatsService"]
    end

    subgraph X["Thành phần dùng chung"]
        COMMON["«component» foodx-common — ApiResponse · DTO · Utilities"]
        SEC["«component» security — JwtTokenProvider · JwtAuthenticationFilter<br/>«copy» trong từng service"]
    end

    DB[("«database» MySQL 8 — DB foodx<br/>chung cho 6 service")]
    LLM["«external» Groq API · Google Gemini"]

    SPA --> G
    G --> B
    USVC --> DB
    ISVC --> DB
    RSVC --> DB
    PSVC --> DB
    ASVC --> DB
    SSVC --> DB
    ASVC --> LLM
    B -.-> COMMON
    B -.-> SEC
```

---

## 7. Biểu đồ triển khai

```mermaid
flowchart TB
    BROWSER["«device» Trình duyệt<br/>SPA PWA"]

    subgraph HOST["Host — Docker Compose · network foodx-network"]
        GW["«container» foodx-api-gateway :8080<br/>reverse-proxy · rate-limit · host SPA"]

        subgraph CLUSTER["Cụm microservice «container» — Spring Boot, Java 17"]
            US["user-service :8081"]
            INV["inventory-service :8082"]
            REC["recipe-service :8083"]
            PLAN["plan-shopping-service :8084"]
            AI["ai-service :8085"]
            SOC["social-stats-service :8086"]
        end

        MYSQL[("MySQL 8.0 :3306<br/>DB foodx · volume mysql_data")]
        REDIS[("Redis 7 :6379<br/>rate-limit + cache · volume redis_data")]
        VOL["«volume» uploads_data<br/>mount vào gateway + mọi service"]
    end

    EXT["«external» Groq API · Google Gemini"]

    BROWSER -->|HTTP :8080| GW
    GW -->|proxy toi :8081-8086| CLUSTER
    CLUSTER -->|JDBC — dùng chung DB foodx| MYSQL
    GW <-->|rate-limit| REDIS
    VOL -.->|dùng chung| CLUSTER
    AI -->|HTTPS| EXT
```

---

## 8. Biểu đồ trạng thái (3 sơ đồ)

### 8.1 RecipePost

```mermaid
stateDiagram-v2
    direction LR
    [*] --> DRAFT : POST /api/social/posts
    DRAFT --> PUBLISHED : POST /posts/{id}/publish
    DRAFT --> [*] : DELETE — hủy bài nháp
    PUBLISHED --> [*] : DELETE — xóa bài viết
```

### 8.2 ShoppingItem

```mermaid
stateDiagram-v2
    direction LR
    [*] --> ChuaMua : POST /api/shopping
    ChuaMua --> DaMua : PATCH /{id}/toggle done=true — «include» nạp FridgeItem
    DaMua --> ChuaMua : PATCH /{id}/toggle done=false
    ChuaMua --> [*] : DELETE /{id} · /all
    DaMua --> [*] : DELETE /done — dọn đã mua
```

### 8.3 FridgeItem

```mermaid
stateDiagram-v2
    direction LR
    [*] --> TrongTu : POST /api/fridge · mua từ danh sách
    TrongTu --> TrongTu : PATCH quantity cộng/trừ · merge-duplicates
    TrongTu --> [*] : quantity ≤ 0 sau khi nấu xong
    TrongTu --> [*] : DELETE thủ công · clear-all
```

---

## 9. Biểu đồ tuần tự bổ sung

### 9.1 Đăng nhập & phát hành JWT

```mermaid
sequenceDiagram
    autonumber
    participant U as Người dùng
    participant G as API Gateway
    participant US as user-service :8081
    participant DB as MySQL (bảng users)
    U->>G: POST /api/auth/login {username, password}
    G->>US: Reverse-proxy (không kiểm tra JWT)
    US->>US: Rate-limit theo IP
    US->>DB: SELECT * FROM users WHERE username = ?
    DB-->>US: user record + password hash
    US->>US: BCrypt.matches() qua AuthenticationManager
    alt Mật khẩu đúng
        US->>US: JwtTokenProvider.generateToken(userId, username, role)
        US-->>U: 200 {accessToken, expiresIn 24h, role, fullName}
    else Mật khẩu sai
        US-->>U: 401 Unauthorized {message}
    end
```

### 9.2 Tick "đã mua" → tự nạp tủ lạnh

```mermaid
sequenceDiagram
    autonumber
    participant U as Thành viên
    participant G as API Gateway
    participant PS as plan-shopping-service :8084
    participant FR as FridgeService (in-process)
    participant DB as MySQL (foodx)
    U->>G: PATCH /api/shopping/{id}/toggle (JWT)
    G->>PS: Reverse-proxy :8084
    PS->>PS: JwtAuthenticationFilter xác thực
    PS->>DB: UPDATE shopping_items SET done = true
    PS->>FR: addOrUpdateBoughtItem(name, quantity, category)
    FR->>FR: Parse chuỗi "500g" → 500 + g
    alt Food đã có trong tủ
        FR->>DB: UPDATE fridge_stock quantity += 500, expiry +7 ngày
    else Chưa có trong tủ
        FR->>FR: NutritionEstimateService.estimate()
        FR->>DB: INSERT foods customFood=true, sourceKey bought-UUID
        FR->>DB: INSERT fridge_stock (expiresAt = today + defaultExpiryDays)
    end
    PS-->>U: 200 {done: true} — tủ lạnh đã được nạp
```

### 9.3 "Nấu xong" → trừ nguyên liệu tủ & cộng streak

```mermaid
sequenceDiagram
    autonumber
    participant U as Thành viên
    participant G as API Gateway
    participant SS as social-stats-service :8086
    participant DB as MySQL (foodx)
    U->>G: POST /api/stats/cooked {recipeId, servings} (JWT)
    G->>SS: Reverse-proxy :8086
    SS->>DB: Kiểm tra đã nấu hôm nay? (user + recipe + cookedAt)
    alt Chưa nấu hôm nay
        SS->>DB: INSERT INTO cook_history
        SS->>DB: Load Recipe + RecipeIngredients + FridgeItems (1 lần, tránh N+1)
        SS->>SS: scale = servings / recipe.servings (clamp 0.05–20)
        loop Với từng nguyên liệu của món
            SS->>SS: So khớp tên với Food trong tủ (bỏ dấu)
            alt Đơn vị tương thích g/kg · ml/l
                SS->>DB: UPDATE quantity (trừ) — nếu ≤ 0.001 thì DELETE
            else Không tương thích
                SS->>SS: Bỏ qua (không trừ)
            end
        end
        SS->>SS: Tính streak ngày liên tiếp
        SS-->>U: 200 {ok, totalCooked, currentStreak}
    else Đã nấu hôm nay
        SS-->>U: 200 bỏ qua (chống bấm đúp nhân đôi)
    end
```

---

## 10. Biểu đồ hoạt động — Import công thức từ văn bản

```mermaid
flowchart TD
    S(["Thành viên dán văn bản / URL công thức"]) --> V["Nhận text & validate"]
    V --> C["Gọi POST /api/ai/parse-recipe"]
    C --> AI["ai-service: Groq / Gemini trích xuất JSON"]
    AI --> D{"JSON hợp lệ?"}
    D -->|Có| M["Map JSON → RecipeRequest<br/>+ ingredients"]
    D -->|Không| F["Fallback regex:<br/>title = dòng đầu,<br/>phần còn lại = instructions"]
    M --> SAVE["Lưu Recipe + RecipeIngredient"]
    F --> SAVE
    SAVE --> E(["Trả về công thức — 201 Created"])
```

---

## 11. Biểu đồ quan hệ dữ liệu (ER)

```mermaid
erDiagram
    users {
        bigint id PK
        varchar username UK
        varchar email UK
        varchar password
        varchar role
    }
    profiles {
        bigint id PK
        bigint user_id FK
        varchar gender
        varchar diet
        varchar allergies
        varchar dislikes
    }
    foods {
        bigint id PK
        varchar source_key UK
        varchar name
        double kcal
        integer default_expiry_days
        boolean custom_food
    }
    fridge_stock {
        bigint id PK
        bigint user_id FK
        bigint food_id FK
        double quantity
        varchar unit
        date expires_at
    }
    ingredients {
        bigint id PK
        varchar name UK
        varchar default_unit
        varchar category
    }
    recipes {
        bigint id PK
        bigint author_id FK
        varchar title
        varchar category
        integer kcal
        varchar image_url
    }
    recipe_ingredients {
        bigint id PK
        bigint recipe_id FK
        bigint ingredient_id FK
        double quantity
        varchar unit
    }
    meal_plan_entries {
        bigint id PK
        bigint user_id FK
        date plan_date
        varchar slot
        bigint recipe_id
    }
    shopping_items {
        bigint id PK
        bigint user_id FK
        varchar name
        varchar quantity
        boolean done
    }
    chat_sessions {
        bigint id PK
        bigint user_id FK
        varchar title
        varchar mode
    }
    chat_messages {
        bigint id PK
        bigint session_id FK
        varchar role
        text content
    }
    recipe_posts {
        bigint id PK
        bigint author_id FK
        varchar title
        varchar status
        integer kcal
    }
    post_likes {
        bigint id PK
        bigint user_id FK
        bigint post_id FK
    }
    post_comments {
        bigint id PK
        bigint user_id FK
        bigint post_id FK
        text content
    }
    cook_history {
        bigint id PK
        bigint user_id FK
        bigint recipe_id
        date cooked_at
    }
    saved_recipes {
        bigint id PK
        bigint user_id FK
        bigint recipe_id FK
        datetime saved_at
    }

    users ||--|| profiles : "1-1 ho so"
    users ||--o{ fridge_stock : "1-N tu lanh"
    foods ||--o{ fridge_stock : "1-N trong tu"
    users ||--o{ recipes : "1-N tac gia"
    recipes ||--o{ recipe_ingredients : "1-N thanh phan"
    ingredients ||--o{ recipe_ingredients : "1-N dung trong"
    users ||--o{ meal_plan_entries : "1-N ke hoach"
    users ||--o{ shopping_items : "1-N di cho"
    users ||--o{ chat_sessions : "1-N phien chat"
    chat_sessions ||--o{ chat_messages : "1-N tin nhan"
    users ||--o{ recipe_posts : "1-N bai viet"
    recipe_posts ||--o{ post_likes : "1-N like"
    users ||--o{ post_likes : "1-N like"
    recipe_posts ||--o{ post_comments : "1-N comment"
    users ||--o{ post_comments : "1-N comment"
    users ||--o{ cook_history : "1-N lich su nau"
    users ||--o{ saved_recipes : "1-N da luu"
    recipes ||--o{ saved_recipes : "1-N duoc luu"
```

> `favorites` không có trong ER (lưu `userId/targetId` dạng thường, không FK — yêu thích đa hình cho công thức và nguyên liệu). `meal_plan_entries.recipe_id` và `cook_history.recipe_id` cũng là soft reference, không FK.

---

## Ghi chú ánh xạ với báo cáo

| Sơ đồ | Dạng mermaid | Nguồn gốc |
|---|---|---|
| Use Case tổng quát, phân rã | `flowchart` (ellipse `([...])` + subgraph) | chuyển từ SVG |
| Hoạt động ×2, Triển khai | `flowchart` (bỏ swimlane — mermaid không có) | chuyển từ SVG |
| L lớp, Component, ER | `classDiagram` / `flowchart` / `erDiagram` | giữ nguyên |
| Tuần tự ×4 | `sequenceDiagram` | giữ nguyên |
| Trạng thái ×3 | `stateDiagram-v2` | giữ nguyên |

Nếu khối nào draw.io báo lỗi, gửi lại thông báo lỗi — đó thường là do phiên bản mermaid cũ (`direction`, `erDiagram`); mình sẽ viết lại dạng tương thích.
