# Thư mục `db/` — lược đồ, migration và dữ liệu mẫu

## Kiến trúc dữ liệu: database-per-service

Mỗi microservice sở hữu **một database riêng** và **một tài khoản MySQL riêng** chỉ có quyền
trên database đó. Không service nào đọc/ghi dữ liệu của service khác ở tầng DB — mọi nhu cầu
dữ liệu chéo đều đi qua HTTP (`/internal/**`).

| Service | Port | Database | Tài khoản | Bảng sở hữu |
|---|---|---|---|---|
| user-service | 8081 | `foodx_user` | `foodx_user` | `users`, `profiles` |
| inventory-service | 8082 | `foodx_inventory` | `foodx_inventory` | `foods`, `ingredients`, `fridge_stock` |
| recipe-service | 8083 | `foodx_recipe` | `foodx_recipe` | `recipes`, `recipe_ingredients`, `favorites` |
| plan-shopping-service | 8084 | `foodx_plan` | `foodx_plan` | `meal_plan_entries`, `shopping_items` |
| ai-service | 8085 | `foodx_ai` | `foodx_ai` | `chat_sessions`, `chat_messages` |
| social-stats-service | 8086 | `foodx_social` | `foodx_social` | `recipe_posts`, `post_likes`, `post_comments`, `cook_history` |

**Nguồn chuẩn duy nhất của lược đồ là các `@Entity` trong mã nguồn.** JPA `ddl-auto=update`
tạo/cập nhật bảng khi service khởi động. Các file `.sql` trong thư mục này chỉ phục vụ
khởi tạo, migration và nạp dữ liệu mẫu.

## File nào dùng khi nào

### Đang dùng

| File | Mục đích |
|---|---|
| [`init/00-create-databases.sql`](init/00-create-databases.sql) | Tạo 6 database + 6 tài khoản service. Docker tự chạy khi volume MySQL **còn rỗng** (mount vào `/docker-entrypoint-initdb.d`). |
| [`migration/V2_service_boundaries.sql`](migration/V2_service_boundaries.sql) | Migration cho DB **đã có dữ liệu** từ bản trước refactor: thêm `recipe_ingredients.ingredient_name` và backfill. |
| [`migration/V3_database_per_service.sql`](migration/V3_database_per_service.sql) | Migration cho DB **đã có dữ liệu**: bỏ FK xuyên service, tạo 6 database + tài khoản, `RENAME TABLE` từng bảng sang database của service sở hữu (di chuyển tức thời, không copy dữ liệu). |

### Thứ tự nâng cấp DB cũ (bản dùng chung một database `foodx`)

```bash
mysql -u root -p < db/migration/V2_service_boundaries.sql
mysql -u root -p < db/migration/V3_database_per_service.sql
```

V3 in ra bảng thống kê số bảng còn lại ở `foodx` (phải là 0) và danh sách FK xuyên service
còn sót (phải rỗng). Kiểm tra xong mới `DROP DATABASE foodx;` (câu lệnh để sẵn dạng comment
ở cuối file).

DB hoàn toàn mới thì **không cần** chạy migration — chỉ cần `init/00-create-databases.sql`
(hoặc để `createDatabaseIfNotExist=true` trong JDBC URL tự tạo database).

### Tài liệu tham khảo cũ (KHÔNG nạp tự động)

Các file dưới đây viết cho **lược đồ một-database dùng chung** trước refactor. Chúng vẫn hữu ích
để tra cứu thiết kế bảng, nhưng **không chạy trực tiếp được** nữa vì các bảng nay nằm ở 6 database
khác nhau, và một số bảng đã bị bỏ (ví dụ `saved_recipes` — tính năng "lưu công thức" nay dùng
`favorites` với `target_type = 'RECIPE'`).

| File | Ghi chú |
|---|---|
| `schema.sql` | Đã tự ghi rõ là tài liệu cũ ở đầu file. |
| `database-design.md` | Mô tả thiết kế theo lược đồ cũ. |
| `seed-sample.sql`, `data.sql` | Có `USE foodx;` / dữ liệu trải trên nhiều service ⇒ phải tách theo database trước khi dùng. |
| `recipes_seed.sql`, `recipes_seed_60.sql` | Chỉ liên quan `recipes` + `recipe_ingredients` ⇒ dùng được với `foodx_recipe`. |
| `fix_ingredients_utf8.sql` | Chỉ liên quan `ingredients` ⇒ dùng được với `foodx_inventory`. |
