# 🍽️ FoodX - Tài liệu API

> **Ứng dụng:** FoodX - Quản lý công thức nấu ăn, tủ lạnh ảo, trợ lý AI nấu ăn
> **Base URL:** `http://localhost:8080` (dev) / biến đổi theo môi trường triển khai

---

## 1. Tổng quan

FoodX là một REST API được xây dựng bằng **Spring Boot 4.1.0** (Java 17). Tài liệu này mô tả **toàn bộ các API đang có trong dự án**, bao gồm:
| 🤖 **AI** | `/api/ai` | Gợi ý công thức, trợ lý AI nấu ăn |
| Nhóm API | Base path | Mô tả |
|----------|-----------|-------|
| 🔐 **Auth** | `/api/auth` | Đăng ký, đăng nhập, cấp JWT |
| 🧅 **Ingredient** | `/api/ingredients` | Quản lý danh mục nguyên liệu |
| 🍳 **Recipe** | `/api/recipes` | Quản lý công thức, import công thức |
| 🏠 **Home** | `/api/home` | Dữ liệu tổng hợp cho trang chủ |
| 🤖 **AI** | `/api/ai` | Gợi ý công thức, trợ lý AI nấu ăn |

> **Ghi chú:** Các module `fridge` (tủ lạnh ảo) và `mealplan` (kế hoạch ăn uống) hiện **chưa có controller** (chưa được expose endpoint) — tuy đã có entity/repository/DTO bên dưới. Sẽ được bổ sung trong các giai đoạn sau.

---

## 2. Định dạng phản hồi chuẩn (ApiResponse)

Mọi endpoint đều trả về một object JSON theo cấu trúc thống nhất (**`ApiResponse<T>`**):

```json
{
  "success": true,
  "message": "Thông báo (chuỗi)",
  "data": { },
  "timestamp": "2024-01-01T10:00:00.000",
  "status": 200
}
```

| Trường | Kiểu | Ý nghĩa |
|--------|------|---------|
| `success` | `boolean` | `true` nếu thành công, `false` nếu thất bại |
| `message` | `string` | Thông điệp mô tả (có thể null khi gọi `success(data)` |
| `data` | `any` | Payload dữ liệu chính (có thể null) |
| `timestamp` | `string` (ISO) | Thời điểm server trả về |
| `status` | `integer` | Mã trạng thái HTTP |

---

## 3. Xác thực (Authentication - JWT)

Hệ thống dùng **JWT Bearer Token**. Cơ chế:

- Sau khi đăng nhập/đăng ký thành công, nhận được `accessToken`.
- Đính kèm token vào header của mọi request có yêu cầu xác thực:
  ```
  Authorization: Bearer <accessToken>
  ```
- JWT chứa `subject` (username), claim `uid` (userId) và `role` (ADMIN | USER).
- Thời hạn mặc định: `86400000` ms = **24 giờ** (`app.jwt.expiration-ms`).
- Issuer: `foodx`.

### Các endpoint **công khai** (không cần token)

| Phương thức | Path | Mô tả |
|-------------|------|-------|
| ANY | `/api/auth/**` | Đăng ký / đăng nhập |
| GET | `/api/ingredients/**` | Tìm kiếm / xem nguyên liệu |
| GET | `/api/recipes/**` | Tìm kiếm / xem công thức |
| GET | `/api/home/**` | Dữ liệu trang chủ |
| ANY | `/api/ai/**` | AI gợi ý / chat |
| ANY | `/v3/api-docs/**`, `/swagger-ui/**`, ... | Tài liệu Swagger |

### Các endpoint **cần xác thực** (bắt buộc token)

| Phương thức | Path |
|-------------|------|
| POST / PUT / DELETE | `/api/ingredients/**` (tạo/sửa/xóa) |
| POST / PUT / DELETE | `/api/recipes/**` (tạo/sửa/xóa/import) |

---

## 4. Cấu hình & Tài liệu tự động (Swagger / OpenAPI)

Dự án tích hợp **Springdoc OpenAPI**. Sau khi chạy server, truy cập:

- **Swagger UI:** `http://localhost:8080/swagger-ui.html`
- **OpenAPI JSON:** `http://localhost:8080/v3/api-docs`

Cấu hình trong `application.properties`:
```properties
springdoc.api-docs.path=/v3/api-docs
springdoc.swagger-ui.path=/swagger-ui.html
```

---

## 5. Bảng mã trạng thái

| Mã | Ý nghĩa |
|----|---------|
| 200 | Thành công |
| 400 | Dữ liệu không hợp lệ (validation lỗi) |
| 401 | Chưa xác thực / Token không hợp lệ |
| 403 | Không có quyền truy cập |
| 404 | Không tìm thấy tài nguyên |
| 500 | Lỗi hệ thống |

---

## 6. Chi tiết các API

### 6.1 🏠 Home

#### `GET /api/home`
Lấy dữ liệu tổng hợp cho trang chủ (món nổi bật, danh mục, lời chào).
- **Xác thực:** ❌ Không cần
- **Response:** `ApiResponse<HomeResponse>`

```json
{
  "success": true,
  "message": "Thành công",
  "data": {
    "featuredRecipes": [
      {
        "id": 1,
        "title": "Phở bò",
        "imageUrl": "https://...",
        "summary": "Món bún ngon",
        "category": "Món chính",
        "cookTime": 120,
        "servings": 4
      }
    ],
    "categoryGroups": [
      {
        "category": "Món chính",
        "recipes": [ { "id": 1, "title": "Phở bò" } ]
      }
    ],
    "greeting": "Chào mừng bạn quay lại!"
  },
  "timestamp": "...",
  "status": 200
}
```

---

### 6.2 🔐 Auth

#### `POST /api/auth/register`
Đăng ký tài khoản mới.
- **Xác thực:** ❌ Không cần
- **Request body:** `RegisterRequest`

```json
{
  "username": "johndoe",          // bắt buộc, 3-50 ký tự
  "email": "johndoe@email.com",   // bắt buộc, hợp lệ, tối đa 100 ký tự
  "password": "secret123",        // bắt buộc, tối thiểu 6 ký tự
  "fullName": "John Doe"          // không bắt buộc, tối đa 100 ký tự
}
```

- **Response:** `ApiResponse<AuthResponse>` — trả token sau khi đăng ký thành công
```json
{
  "success": true,
  "message": "Đăng ký thành công",
  "data": {
    "accessToken": "eyJhbGciOi...",
    "tokenType": "Bearer",
    "expiresIn": 86400000,
    "userId": 1,
    "username": "johndoe",
    "email": "johndoe@email.com",
    "role": "USER"
  },
  "status": 200
}
```

#### `POST /api/auth/login`
Đăng nhập bằng username/email và mật khẩu.
- **Xác thực:** ❌ Không cần
- **Request body:** `LoginRequest`

```json
{
  "username": "johndoe",     // bắt buộc (username HOẶC email)
  "password": "secret123"    // bắt buộc
}
```

- **Response:** `ApiResponse<AuthResponse>` (cấu trúc giống register)
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "accessToken": "eyJhbGciOi...",
    "tokenType": "Bearer",
    "expiresIn": 86400000,
    "userId": 1,
    "username": "johndoe",
    "email": "johndoe@email.com",
    "role": "USER"
  },
  "status": 200
}
```

---

### 6.3 🧅 Ingredient

#### `GET /api/ingredients`
Tìm kiếm danh sách nguyên liệu theo tên và/hoặc danh mục.
- **Xác thực:** ❌ Không cần
- **Query params (tuỳ chọn):**
  - `name` (string): lọc theo tên
  - `category` (string): lọc theo danh mục
- **Response:** `ApiResponse<List<IngredientDto>>`

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Hành tím",
      "defaultUnit": "củ",
      "category": "Rau củ",
      "caloriesPerUnit": 40.0,
      "description": "Hành tím"
    }
  ],
  "status": 200
}
```

#### `GET /api/ingredients/{id}`
Lấy chi tiết một nguyên liệu theo ID.
- **Xác thực:** ❌ Không cần
- **Path param:** `id` (Long)
- **Response:** `ApiResponse<IngredientDto>`

#### `POST /api/ingredients`
Tạo nguyên liệu mới.
- **Xác thực:** ✅ Bắt buộc (Bearer token)
- **Request body:** `IngredientDto` — `name` bắt buộc, tối đa 100 ký tự; `defaultUnit` ≤ 20, `category` ≤ 50, `description` ≤ 500 ký tự.

```json
{
  "name": "Ớt chuông",
  "defaultUnit": "trái",
  "category": "Rau củ",
  "caloriesPerUnit": 26.0,
  "description": "Ớt chuông đỏ"
}
```

- **Response:** `ApiResponse<IngredientDto>`

#### `PUT /api/ingredients/{id}`
Cập nhật nguyên liệu theo ID.
- **Xác thực:** ✅ Bắt buộc
- **Path param:** `id` (Long)
- **Request body:** `IngredientDto` (tương tự create)

#### `DELETE /api/ingredients/{id}`
Xóa nguyên liệu theo ID.
- **Xác thực:** ✅ Bắt buộc
- **Path param:** `id` (Long)
- **Response:** `ApiResponse<Void>` — message `"Xoá nguyên liệu thành công"`

---

### 6.4 🍳 Recipe

#### `GET /api/recipes`
Tìm kiếm công thức.
- **Xác thực:** ❌ Không cần
- **Query params (tuỳ chọn):**
  - `keyword` (string)
  - `category` (string)
  - `cuisine` (string)
- **Response:** `ApiResponse<List<RecipeResponse>>`

#### `GET /api/recipes/{id}`
Lấy chi tiết công thức.
- **Xác thực:** ❌ Không cần
- **Path param:** `id` (Long)
- **Response:** `ApiResponse<RecipeResponse>`

Cấu trúc `RecipeResponse`:
```json
{
  "id": 1,
  "title": "Phở bò",
  "description": "Món ăn truyền thống",
  "instructions": "Nấu nước dùng...",
  "prepTime": 30,
  "cookTime": 120,
  "servings": 4,
  "cuisine": "Việt Nam",
  "category": "Món chính",
  "imageUrl": "https://...",
  "sourceUrl": "https://...",
  "authorId": 1,
  "authorName": "johndoe",
  "ingredients": [
    {
      "id": 10,
      "ingredientName": "Bánh phở",
      "quantity": 500.0,
      "unit": "g",
      "note": "Loại tươi"
    }
  ],
  "createdAt": "2024-01-01T10:00:00",
  "updatedAt": "2024-01-01T10:00:00"
}
```

#### `POST /api/recipes`
Tạo công thức mới (công thức thuộc về user đang đăng nhập).
- **Xác thực:** ✅ Bắt buộc
- **Request body:** `RecipeRequest`

```json
{
  "title": "Phở bò",            // bắt buộc, ≤ 200 ký tự
  "description": "Món ăn truyền thống",
  "instructions": "Nấu nước dùng...",
  "prepTime": 30,
  "cookTime": 120,
  "servings": 4,
  "cuisine": "Việt Nam",
  "category": "Món chính",
  "imageUrl": "https://...",
  "sourceUrl": "https://...",
  "ingredients": [
    {
      "ingredientName": "Bánh phở",   // bắt buộc
      "quantity": 500.0,
      "unit": "g",
      "note": "Loại tươi"
    }
  ]
}
```

- **Response:** `ApiResponse<RecipeResponse>`
- **Message:** `"Tạo công thức thành công"`

#### `POST /api/recipes/import`
Import công thức từ text/URL (được AI parse).
- **Xác thực:** ✅ Bắt buộc
- **Request body:** `RecipeImportRequest`

```json
{
  "sourceUrl": "https://...",    // tuỳ chọn
  "text": "Nguyên liệu: ... Cách làm: ..."   // bắt buộc (hoặc sourceUrl)
}
```

> **Lưu ý:** annotation `@NotBlank` trên trường `text` cho thấy hiện tại bắt buộc phải có `text`, dù vậy DTO vẫn có cả `sourceUrl` tùy chọn.

- **Response:** `ApiResponse<RecipeResponse>`
- **Message:** `"Import công thức thành công"`

#### `PUT /api/recipes/{id}`
Cập nhật công thức theo ID.
- **Xác thực:** ✅ Bắt buộc
- **Path param:** `id` (Long)
- **Request body:** `RecipeRequest` (tương tự create)
- **Message:** `"Cập nhật công thức thành công"`

#### `DELETE /api/recipes/{id}`
Xóa công thức theo ID.
- **Xác thực:** ✅ Bắt buộc
- **Path param:** `id` (Long)
- **Response:** `ApiResponse<Void>` — message `"Xoá công thức thành công"`

---

### 6.5 🤖 AI

> Các endpoint AI hiện được cấu hình **công khai** (`/api/ai/**` permitAll) nhưng có thể được bảo vệ trong giai đoạn sau.

#### `POST /api/ai/suggest`
Gợi ý công thức dựa trên nguyên liệu có sẵn.
- **Xác thực:** ❌ Không bắt buộc (hiện tại)
- **Request body:** `SuggestRequest`

```json
{
  "availableIngredients": ["trứng", "cà chua", "hành"],
  "preference": "không dùng thịt",
  "mealType": "tối",
  "maxSuggestions": 3
}
```

| Trường | Kiểu | Ý nghĩa |
|--------|------|---------|
| `availableIngredients` | `List<String>` | Nguyên liệu hiện có trong tủ lạnh |
| `preference` | `string` | Yêu cầu bổ sung (không dùng thịt, món xào...) |
| `mealType` | `string` | Bữa: sáng, trưa, tối, tráng miệng |
| `maxSuggestions` | `integer` | Số lượng gợi ý |

- **Response:** `ApiResponse<SuggestResponse>`
```json
{
  "success": true,
  "message": "Gợi ý thành công",
  "data": {
    "suggestions": [
      {
        "title": "Trứng sốt cà chua",
        "description": "Món ăn đơn giản",
        "ingredients": ["trứng", "cà chua", "hành"],
        "instructions": "Phi hành, cho cà chua...",
        "estimatedTime": "20 phút"
      }
    ]
  },
  "status": 200
}
```

#### `POST /api/ai/chat`
Hỏi đáp với Trợ lý AI nấu ăn.
- **Xác thực:** ❌ Không bắt buộc (hiện tại)
- **Request body:** `ChatRequest`

```json
{
  "message": "Cách nấu cơm chiên trứng?",   // bắt buộc
  "availableIngredients": ["cơm", "trứng"],  // tuỳ chọn
  "mode": "step"                              // 'chat' | 'step'
}
```

| Trường | Kiểu | Ý nghĩa |
|--------|------|---------|
| `message` | `string` | Câu hỏi / lời nhắn (bắt buộc) |
| `availableIngredients` | `List<String>` | Nguyên liệu hiện có (tuỳ chọn) |
| `mode` | `string` | `chat` (hỏi đáp) hoặc `step` (nấu từng bước) |

- **Response:** `ApiResponse<ChatResponse>`
```json
{
  "success": true,
  "message": "Trợ lý AI phản hồi",
  "data": {
    "reply": "Để nấu cơm chiên trứng, bạn cần...",
    "steps": ["Đánh trứng", "Phi thơm", "Cho cơm vào"],
    "timestamp": "2024-01-01T10:00:00"
  },
  "status": 200
}
```

---

## 7. Xử lý lỗi (Error Handling)

Mọi lỗi đều được xử lý tập trung trong `GlobalExceptionHandler`:

### 7.1 BusinessException (lỗi nghiệp vụ, ví dụ: trùng tài khoản)
```json
{
  "success": false,
  "message": "Tên đăng nhập đã tồn tại",
  "timestamp": "...",
  "status": 400
}
```

### 7.2 Validation lỗi (400)
Khi dữ liệu request không hợp lệ:
```json
{
  "success": false,
  "message": "Dữ liệu không hợp lệ",
  "data": {
    "username": "Tên đăng nhập từ 3-50 ký tự",
    "password": "Mật khẩu tối thiểu 6 ký tự"
  },
  "status": 400
}
```

### 7.3 Lỗi hệ thống (500)
```json
{
  "success": false,
  "message": "Đã xảy ra lỗi hệ thống: <chi tiết>",
  "timestamp": "...",
  "status": 500
}
```

---

## 8. Ví dụ luồng sử dụng điển hình

1. **Đăng ký / đăng nhập** → lấy `accessToken`.
2. Đính token vào tất cả request cần xác thực.
3. **Tìm kiếm** công thức (công khai, không cần token).
4. **Tạo / import** công thức của riêng mình (cần token).
5. Dùng **AI** để gợi ý món dựa trên nguyên liệu trong tủ.

### Ví dụ curl (tạo công thức - cần token)
```bash
curl -X POST http://localhost:8080/api/recipes \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Món mới",
    "instructions": "...",
    "ingredients": [{ "ingredientName": "gà", "quantity": 1, "unit": "con" }]
  }'
```

---

## 9. Cấu hình môi trường

Trong `application.properties`:
```properties
spring.profiles.active=dev          # profile đang chạy (dev / prod)
app.jwt.secret=...                  # khóa bí mật JWT (≥32 bytes)
app.jwt.expiration-ms=86400000      # thời hạn token (24h)
app.gemini.api-key=${GEMINI_API_KEY}  # API key Gemini cho AI
app.gemini.model=gemini-1.5-flash   # model AI
```

> ⚠️ **Bảo mật:** khóa JWT mặc định (`app.jwt.secret`) bắt buộc phải thay đổi khi triển khai production.

---

## 10. Module chưa có API (đang phát triển)

Các nhóm sau có **entity / repository / DTO** nhưng **chưa có controller** (chưa thể gọi qua HTTP):

### 🧊 Fridge (tủ lạnh ảo) — dự kiến:
- `FridgeItem` — nguyên liệu trong tủ + hạn sử dụng
- `ShoppingList` / `ShoppingListItem` — danh sách mua sắm

### 📅 Mealplan (kế hoạch ăn uống) — dự kiến:
- `MealPlan` / `MealPlanItem` — kế hoạch bữa ăn
- `UserAllergy` — dị ứng của người dùng
- Gợi ý kế hoạch bằng AI

> Khi các module này được expose controller, tài liệu sẽ được bổ sung.

---

*Tài liệu được sinh tự động dựa trên mã nguồn hiện tại của dự án.*
