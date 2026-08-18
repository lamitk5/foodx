# 🗄️ FoodX - Thiết Kế Cơ Sở Dữ Liệu

> Tài liệu mô tả thiết kế database cho hệ thống **FoodX - Quản lý ẩm thực**.
> Database mặc định dùng **H2** (in-memory) để phát triển, có thể chuyển sang **MySQL/PostgreSQL** khi triển khai production.

---

## 1. Tổng quan

Hệ thống gồm **8 bảng** chính, chia theo module:

| Module | Bảng | Mô tả |
|--------|------|-------|
| 🔐 Auth | `users` | Người dùng |
| 🧅 Ingredient | `ingredients` | Danh mục nguyên liệu chung |
| 🧊 Fridge | `fridge_items` | Nguyên liệu trong tủ lạnh ảo |
| 🧊 Fridge | `shopping_lists`, `shopping_list_items` | Danh sách mua sắm |
| 🍳 Recipe | `recipes`, `recipe_ingredients`, `saved_recipes` | Công thức nấu ăn |
| 📅 Mealplan | `meal_plans`, `meal_plan_items`, `user_allergies` | Kế hoạch ăn uống |

---

## 2. Sơ đồ quan hệ (ERD)

```
┌──────────┐      ┌──────────────┐      ┌───────────────────┐
│  users   │ 1─── 1│ FridgeItem  │      │  shopping_lists   │
│----------│      │  (fridge)    │      │-------------------│
│ id       │      │ id           │      │ id                │
│ username │      │ user_id  ────┼──┐   │ name              │
│ email    │      │ name         │  │   │ user_id ──────────┼──┐
│ password │      │ category     │  │   │ created_at        │  │
│ role     │      │ quantity     │  │   └───────────────────┘  │
└──────────┘      │ unit         │  │                          │
                  │ expiry_date  │  │  ┌────────────────────┐  │
                  └──────────────┘  │  │ shopping_list_items│  │
                                    │  │--------------------│◄─┘
┌──────────────┐                    └──│ id                │
│  ingredients │                        │ list_id  ─────────│──┐
│--------------│                        │ ingredient_name   │  │
│ id           │                        │ quantity          │  │
│ name         │                        │ unit              │  │
│ default_unit │                        │ bought            │  │
│ category     │                        └────────────────────┘  │
│ calories     │                                               │
└──────────────┘

┌──────────────┐      ┌───────────────────┐
│   recipes    │ 1─── N│ recipe_ingredients│
│--------------│      │-------------------│
│ id           │      │ id                │
│ user_id ─────┼───   │ recipe_id ────────│───┐
│ title        │      │ ingredient_name   │   │
│ description  │      │ quantity          │   │
│ instructions │      │ unit              │   │
│ prep_time    │      │ note              │   │
│ cook_time    │      └───────────────────┘   │
│ servings     │                              │
│ cuisine      │  ┌────────────────────┐       │
│ category     │  │   saved_recipes    │       │
│ image_url    │  │--------------------│       │
│ source_url   │  │ id                 │       │
└──────────────┘  │ user_id ───────────┼──┐    │
                  │ recipe_id ─────────┼──┼────┘
                  └────────────────────┘  │

┌──────────────┐      ┌───────────────────┐
│  meal_plans  │ 1─── N│  meal_plan_items  │
│--------------│      │-------------------│
│ id           │      │ id                │
│ user_id ─────┼───   │ plan_id ──────────│───┐
│ start_date   │      │ recipe_id ────────│───┼──┐
│ end_date     │      │ day_number        │   │  │
│ note         │      │ meal_type         │   │  │
└──────────────┘      │ portions          │   │  │
                      └───────────────────┘   │  │
┌──────────────────┐        ┌────────────────┴──┴─┐
│  user_allergies  │        │   (references)      │
│------------------│        │ recipe_id → recipes │
│ id               │        └────────────────────┴──┘
│ user_id ─────────┼───┐
│ ingredient_id    │   │  └── liên kết tới ingredients
└──────────────────┘   ┘
```

> **Ghi chú mối quan hệ:**
> - `users` 1-N `fridge_items`, `shopping_lists`, `recipes`, `saved_recipes`, `meal_plans`, `user_allergies`
> - `shopping_lists` 1-N `shopping_list_items`
> - `recipes` 1-N `recipe_ingredients`; `users` N-N `recipes` (qua `saved_recipes`)
> - `meal_plans` 1-N `meal_plan_items`; `meal_plan_items` N-1 `recipes`
> - `user_allergies` N-1 `ingredients`

---

## 3. Chi tiết bảng

### 3.1 `users` — Người dùng
| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `id` | BIGINT | PK, AUTO_INCREMENT | Khóa chính |
| `username` | VARCHAR(50) | UNIQUE, NOT NULL | Tên đăng nhập |
| `email` | VARCHAR(100) | UNIQUE, NOT NULL | Email |
| `password` | VARCHAR(255) | NOT NULL | Mật khẩu (hash BCrypt) |
| `full_name` | VARCHAR(100) | | Họ tên đầy đủ |
| `role` | VARCHAR(20) | NOT NULL, DEFAULT 'USER' | ADMIN / USER |
| `created_at` | TIMESTAMP | NOT NULL | Thời gian tạo |

---

### 3.2 `ingredients` — Danh mục nguyên liệu chung
| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `id` | BIGINT | PK, AUTO_INCREMENT | Khóa chính |
| `name` | VARCHAR(100) | NOT NULL | Tên nguyên liệu |
| `default_unit` | VARCHAR(20) | | Đơn vị mặc định |
| `category` | VARCHAR(50) | | Danh mục |
| `calories_per_unit` | DOUBLE | | Calo mỗi đơn vị |
| `description` | VARCHAR(500) | | Mô tả |
| `created_at` | TIMESTAMP | NOT NULL | Thời gian tạo |

---

### 3.3 `fridge_items` — Nguyên liệu trong tủ lạnh
| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `id` | BIGINT | PK, AUTO_INCREMENT | Khóa chính |
| `user_id` | BIGINT | FK → `users.id` | Người sở hữu |
| `name` | VARCHAR(100) | NOT NULL | Tên nguyên liệu |
| `category` | VARCHAR(50) | | Danh mục (Thịt, Hải Sản...) |
| `quantity` | DOUBLE | NOT NULL | Số lượng |
| `unit` | VARCHAR(20) | | Đơn vị (kg, g, bó...) |
| `image_url` | VARCHAR(255) | | URL ảnh |
| `note` | VARCHAR(500) | | Ghi chú |
| `expiry_date` | DATE | | Hạn sử dụng |
| `created_at` | TIMESTAMP | NOT NULL | Thời gian thêm |

---

### 3.4 `shopping_lists` — Danh sách mua sắm
| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `id` | BIGINT | PK, AUTO_INCREMENT | Khóa chính |
| `user_id` | BIGINT | FK → `users.id` | Người sở hữu |
| `name` | VARCHAR(100) | NOT NULL | Tên danh sách |
| `created_at` | TIMESTAMP | NOT NULL | Thời gian tạo |

---

### 3.5 `shopping_list_items` — Mục trong danh sách mua sắm
| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `id` | BIGINT | PK, AUTO_INCREMENT | Khóa chính |
| `shopping_list_id` | BIGINT | FK → `shopping_lists.id` | Thuộc danh sách nào |
| `ingredient_name` | VARCHAR(100) | NOT NULL | Tên nguyên liệu |
| `quantity` | DOUBLE | | Số lượng |
| `unit` | VARCHAR(20) | | Đơn vị |
| `bought` | BOOLEAN | DEFAULT FALSE | Đã mua chưa |

---

### 3.6 `recipes` — Công thức nấu ăn
| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `id` | BIGINT | PK, AUTO_INCREMENT | Khóa chính |
| `user_id` | BIGINT | FK → `users.id` | Người tạo |
| `title` | VARCHAR(200) | NOT NULL | Tiêu đề |
| `description` | TEXT | | Mô tả |
| `instructions` | TEXT | | Cách làm |
| `prep_time` | INT | | Thời gian chuẩn bị (phút) |
| `cook_time` | INT | | Thời gian nấu (phút) |
| `servings` | INT | | Khẩu phần |
| `cuisine` | VARCHAR(50) | | Quốc gia/miền |
| `category` | VARCHAR(50) | | Danh mục món ăn |
| `image_url` | VARCHAR(255) | | Ảnh |
| `source_url` | VARCHAR(255) | | Nguồn (import) |
| `created_at` | TIMESTAMP | NOT NULL | Thời gian tạo |
| `updated_at` | TIMESTAMP | | Thời gian sửa |

---

### 3.7 `recipe_ingredients` — Nguyên liệu của công thức
| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `id` | BIGINT | PK, AUTO_INCREMENT | Khóa chính |
| `recipe_id` | BIGINT | FK → `recipes.id` | Thuộc công thức |
| `ingredient_name` | VARCHAR(100) | NOT NULL | Tên nguyên liệu |
| `quantity` | DOUBLE | | Số lượng |
| `unit` | VARCHAR(20) | | Đơn vị |
| `note` | VARCHAR(200) | | Ghi chú |

---

### 3.8 `saved_recipes` — Công thức đã lưu (yêu thích)
| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `id` | BIGINT | PK, AUTO_INCREMENT | Khóa chính |
| `user_id` | BIGINT | FK → `users.id` | Người lưu |
| `recipe_id` | BIGINT | FK → `recipes.id` | Công thức lưu |
| `saved_at` | TIMESTAMP | NOT NULL | Thời gian lưu |

**Ràng buộc:** `UNIQUE(user_id, recipe_id)` — tránh lưu trùng.

---

### 3.9 `meal_plans` — Kế hoạch ăn uống
| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `id` | BIGINT | PK, AUTO_INCREMENT | Khóa chính |
| `user_id` | BIGINT | FK → `users.id` | Chủ kế hoạch |
| `start_date` | DATE | NOT NULL | Ngày bắt đầu |
| `end_date` | DATE | NOT NULL | Ngày kết thúc |
| `note` | VARCHAR(500) | | Ghi chú |
| `created_at` | TIMESTAMP | NOT NULL | Thời gian tạo |

---

### 3.10 `meal_plan_items` — Mục trong kế hoạch
| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `id` | BIGINT | PK, AUTO_INCREMENT | Khóa chính |
| `meal_plan_id` | BIGINT | FK → `meal_plans.id` | Thuộc kế hoạch |
| `recipe_id` | BIGINT | FK → `recipes.id` | Món ăn |
| `day_number` | INT | NOT NULL | Ngày thứ mấy |
| `meal_type` | VARCHAR(20) | NOT NULL | Sáng/Trưa/Tối |
| `portions` | INT | | Khẩu phần |

---

### 3.11 `user_allergies` — Dị ứng của người dùng
| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|-----------|-------|
| `id` | BIGINT | PK, AUTO_INCREMENT | Khóa chính |
| `user_id` | BIGINT | FK → `users.id` | Người dùng |
| `ingredient_id` | BIGINT | FK → `ingredients.id` | Nguyên liệu gây dị ứng |

**Ràng buộc:** `UNIQUE(user_id, ingredient_id)` — mỗi loại dị ứng chỉ ghi 1 lần.

---

## 4. Cấu hình kết nối

### Môi trường Dev (H2 in-memory)
Đã cấu hình trong `src/main/resources/application.properties`.

### Môi trường Production (MySQL - ví dụ)
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/foodx
spring.datasource.username=root
spring.datasource.password=yourpassword
spring.jpa.database-platform=org.hibernate.dialect.MySQL8Dialect
spring.jpa.hibernate.ddl-auto=update
```

---

## 5. Tốc độ truy vấn & Index

Các cột thường dùng trong `WHERE / JOIN / ORDER BY` nên có index:

| Bảng | Index | Lý do |
|------|-------|-------|
| `fridge_items` | `(user_id, category)` | Lọc tủ lạnh theo người dùng + danh mục |
| `fridge_items` | `(expiry_date)` | Truy vấn sắp hết hạn |
| `shopping_list_items` | `(shopping_list_id)` | Lấy items của 1 danh sách |
| `recipes` | `(category, cuisine)` | Lọc công thức |
| `saved_recipes` | `(user_id)` | Lấy công thức đã lưu của user |
| `meal_plan_items` | `(meal_plan_id)` | Lấy mục của kế hoạch |
| `user_allergies` | `(user_id)` | Lấy dị ứng của user |

---

## 6. Dữ liệu mẫu

Xem file `db/data.sql` chứa dữ liệu demo để chạy thử.
