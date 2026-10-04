-- ============================================================================
-- FoodX — Migration V2: tách biên giới giữa các microservice
-- ============================================================================
-- BỐI CẢNH
--   Trước refactor, mỗi service đều có entity/repository cho bảng của service khác
--   (auth, profile, fridge, food, ingredient, recipe) và ghi thẳng vào bảng đó.
--   Sau refactor, mỗi bảng chỉ có ĐÚNG MỘT service sở hữu:
--
--     users, profiles                    -> user-service        (8081)
--     foods, ingredients, fridge_stock   -> inventory-service   (8082)
--     recipes, recipe_ingredients,
--       favorites                        -> recipe-service      (8083)
--     meal_plan_entries, shopping_items  -> plan-shopping-service(8084)
--     chat_sessions, chat_messages       -> ai-service          (8085)
--     recipe_posts, post_likes,
--       post_comments, cook_history      -> social-stats-service(8086)
--
--   Ghi chú: bảng `saved_recipes` trong db/schema.sql là tài liệu cũ đã lỗi thời —
--   không có @Entity nào ánh xạ tới nó (tính năng "lưu công thức" nay dùng bảng `favorites`
--   với target_type = 'RECIPE'), nên bảng đó không tồn tại trong DB thật.
--
--   Các service khác đọc/ghi qua API nội bộ `/internal/**` (header
--   `X-Foodx-Internal-Token`) thay vì JPA.
--
-- KHI NÀO CHẠY
--   Chỉ cần chạy một lần cho database ĐÃ CÓ DỮ LIỆU (DB mới thì JPA `ddl-auto=update`
--   tự tạo đúng lược đồ). Script viết theo kiểu idempotent nên chạy lại vô hại.
--
--   mysql -u root -p foodx < db/migration/V2_service_boundaries.sql
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) recipe-service: recipe_ingredients cần cột ingredient_name
--    recipe-service không còn sở hữu bảng `ingredients`, nên nó lưu bản sao tên
--    nguyên liệu (denormalize) để hiển thị/khớp món mà không phải gọi
--    inventory-service mỗi lần đọc.
-- ----------------------------------------------------------------------------
SET @col_exists := (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'recipe_ingredients'
      AND COLUMN_NAME = 'ingredient_name'
);
SET @ddl := IF(@col_exists = 0,
    'ALTER TABLE recipe_ingredients ADD COLUMN ingredient_name VARCHAR(100) NULL AFTER ingredient_id',
    'DO 0');
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ----------------------------------------------------------------------------
-- 2) Backfill tên nguyên liệu cho các dòng cũ từ danh mục `ingredients`
--    (chỉ chạy được khi bảng `ingredients` còn dữ liệu — đúng với DB dùng chung).
-- ----------------------------------------------------------------------------
UPDATE recipe_ingredients ri
JOIN ingredients i ON i.id = ri.ingredient_id
SET ri.ingredient_name = i.name
WHERE (ri.ingredient_name IS NULL OR ri.ingredient_name = '')
  AND ri.ingredient_id IS NOT NULL;

-- ----------------------------------------------------------------------------
-- 3) ingredient_id không còn bắt buộc
--    Nếu inventory-service tạm thời không sẵn sàng, recipe-service vẫn lưu được
--    công thức với `ingredient_name` và `ingredient_id = NULL`.
-- ----------------------------------------------------------------------------
SET @nullable := (
    SELECT IS_NULLABLE FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'recipe_ingredients'
      AND COLUMN_NAME = 'ingredient_id'
);
SET @ddl := IF(@nullable = 'NO',
    'ALTER TABLE recipe_ingredients MODIFY COLUMN ingredient_id BIGINT NULL',
    'DO 0');
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================================================
-- GHI CHÚ VỀ KHOÁ NGOẠI XUYÊN SERVICE (chưa xử lý ở migration này)
-- ============================================================================
-- Các ràng buộc FK dưới đây nối bảng của service này sang bảng của service khác,
-- tức là ràng buộc vẫn tồn tại ở tầng DB dù mã nguồn đã tách:
--
--   fridge_stock.user_id       -> users.id
--   recipes.author_id          -> users.id
--   meal_plan_entries.user_id  -> users.id
--   shopping_items.user_id     -> users.id
--   chat_sessions.user_id      -> users.id
--   recipe_posts.author_id     -> users.id
--   post_likes.user_id         -> users.id
--   post_comments.user_id      -> users.id
--   cook_history.user_id       -> users.id
--   recipe_ingredients.ingredient_id -> ingredients.id
--
-- Hệ quả: khi xoá một người dùng, user-service phải yêu cầu 5 service khác tự dọn dữ liệu
-- qua `DELETE /internal/users/{userId}/data` (xem `UserPurgeClient` trong foodx-common và
-- `AdminUserController.cleanUserData`). Đây là **nợ kỹ thuật còn lại**: giải pháp đúng là
-- tách schema/database theo service rồi xoá FK.
--
-- Muốn xoá FK ngay (chỉ an toàn khi đã tách DB hoặc chấp nhận mất toàn vẹn tham chiếu):
--
--   ALTER TABLE fridge_stock        DROP FOREIGN KEY fk_fridge_user;
--   ALTER TABLE recipes             DROP FOREIGN KEY fk_recipe_user;
--   ALTER TABLE meal_plan_entries   DROP FOREIGN KEY fk_meal_plan_user;
--   ALTER TABLE shopping_items      DROP FOREIGN KEY fk_shopping_user;
--   ALTER TABLE chat_sessions       DROP FOREIGN KEY fk_chatsession_user;
--   ALTER TABLE recipe_posts        DROP FOREIGN KEY fk_post_author;
--   ALTER TABLE post_likes          DROP FOREIGN KEY fk_like_user;
--   ALTER TABLE post_comments       DROP FOREIGN KEY fk_comment_user;
--   ALTER TABLE cook_history        DROP FOREIGN KEY fk_cookhistory_user;
--   ALTER TABLE recipe_ingredients  DROP FOREIGN KEY fk_recipe_ingredient_ing;
--
-- (Tên constraint có thể khác nhau giữa các DB vì do Hibernate sinh ra —
--  kiểm tra bằng: SHOW CREATE TABLE <tên_bảng>;)
-- ============================================================================
