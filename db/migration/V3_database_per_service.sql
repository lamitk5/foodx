-- ============================================================================
-- FoodX — Migration V3: DATABASE PER SERVICE
-- ============================================================================
-- Mục đích
--   Chuyển từ mô hình "6 service dùng chung một database `foodx`" sang mỗi
--   service sở hữu một database riêng — đây là đặc trưng bắt buộc của kiến trúc
--   microservice (mỗi service tự quản lược đồ dữ liệu của mình).
--
--     foodx_user       (8081)  users, profiles
--     foodx_inventory  (8082)  foods, ingredients, fridge_stock
--     foodx_recipe     (8083)  recipes, recipe_ingredients, favorites
--     foodx_plan       (8084)  meal_plan_entries, shopping_items
--     foodx_ai         (8085)  chat_sessions, chat_messages
--     foodx_social     (8086)  recipe_posts, post_likes, post_comments, cook_history
--
-- Cách chạy (chỉ cần cho DB ĐÃ CÓ DỮ LIỆU; DB mới thì JPA tự tạo ở từng DB riêng):
--     mysql -u root -p < db/migration/V3_database_per_service.sql
--
-- Script dùng `RENAME TABLE` nên dữ liệu được DI CHUYỂN TỨC THỜI, không copy lại.
-- Viết theo kiểu idempotent: chạy lại vô hại, bảng nào đã ở đúng chỗ sẽ bị bỏ qua.
--
-- ⚠️  Yêu cầu: `DELIMITER` là chỉ thị của mysql client, nên phải chạy bằng
--     lệnh `mysql < file` (không dán vào GUI từng câu).
-- ============================================================================

SET @SOURCE_SCHEMA := 'foodx';

-- ----------------------------------------------------------------------------
-- 1) Tạo 6 database, mỗi service một cái
-- ----------------------------------------------------------------------------
CREATE DATABASE IF NOT EXISTS `foodx_user`      CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS `foodx_inventory` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS `foodx_recipe`    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS `foodx_plan`      CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS `foodx_ai`        CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS `foodx_social`    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 1b) Tài khoản riêng cho từng service (least privilege — không dùng chung root)
--     ⚠️ Mật khẩu là thông tin ĐĂNG NHẬP DEV, ghi công khai trong repo. Khi triển
--     khai thật phải tạo tài khoản riêng với mật khẩu ngẫu nhiên.
-- ----------------------------------------------------------------------------
CREATE USER IF NOT EXISTS 'foodx_user'@'%'      IDENTIFIED BY 'foodx_dev_pw';
CREATE USER IF NOT EXISTS 'foodx_inventory'@'%' IDENTIFIED BY 'foodx_dev_pw';
CREATE USER IF NOT EXISTS 'foodx_recipe'@'%'    IDENTIFIED BY 'foodx_dev_pw';
CREATE USER IF NOT EXISTS 'foodx_plan'@'%'      IDENTIFIED BY 'foodx_dev_pw';
CREATE USER IF NOT EXISTS 'foodx_ai'@'%'        IDENTIFIED BY 'foodx_dev_pw';
CREATE USER IF NOT EXISTS 'foodx_social'@'%'    IDENTIFIED BY 'foodx_dev_pw';

GRANT ALL PRIVILEGES ON `foodx_user`.*      TO 'foodx_user'@'%';
GRANT ALL PRIVILEGES ON `foodx_inventory`.* TO 'foodx_inventory'@'%';
GRANT ALL PRIVILEGES ON `foodx_recipe`.*    TO 'foodx_recipe'@'%';
GRANT ALL PRIVILEGES ON `foodx_plan`.*      TO 'foodx_plan'@'%';
GRANT ALL PRIVILEGES ON `foodx_ai`.*        TO 'foodx_ai'@'%';
GRANT ALL PRIVILEGES ON `foodx_social`.*    TO 'foodx_social'@'%';

FLUSH PRIVILEGES;

-- ----------------------------------------------------------------------------
-- 2) Bỏ TOÀN BỘ khoá ngoại trong DB dùng chung
--    Không thể RENAME bảng sang schema khác khi nó còn tham gia ràng buộc FK.
--    Sau bước này, mọi quan hệ xuyên service ở tầng DB đều biến mất — đúng với
--    thiết kế mới: quan hệ xuyên service do mã nguồn (HTTP) quản lý.
-- ----------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS `foodx_drop_all_fks`;
DELIMITER $$
CREATE PROCEDURE `foodx_drop_all_fks`(IN p_schema VARCHAR(64))
BEGIN
    DECLARE v_done  TINYINT DEFAULT 0;
    DECLARE v_table VARCHAR(64);
    DECLARE v_fk    VARCHAR(64);
    DECLARE cur CURSOR FOR
        SELECT TABLE_NAME, CONSTRAINT_NAME
        FROM information_schema.TABLE_CONSTRAINTS
        WHERE CONSTRAINT_SCHEMA = p_schema
          AND CONSTRAINT_TYPE   = 'FOREIGN KEY';
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = 1;

    OPEN cur;
    drop_loop: LOOP
        FETCH cur INTO v_table, v_fk;
        IF v_done = 1 THEN
            LEAVE drop_loop;
        END IF;
        SET @sql := CONCAT('ALTER TABLE `', p_schema, '`.`', v_table, '` DROP FOREIGN KEY `', v_fk, '`');
        PREPARE st FROM @sql; EXECUTE st; DEALLOCATE PREPARE st;
    END LOOP;
    CLOSE cur;
END$$
DELIMITER ;

CALL `foodx_drop_all_fks`(@SOURCE_SCHEMA);
DROP PROCEDURE IF EXISTS `foodx_drop_all_fks`;

-- ----------------------------------------------------------------------------
-- 3) Chuyển từng bảng sang database của service sở hữu nó
--    (chỉ chuyển khi bảng còn ở `foodx` và chưa có ở đích ⇒ chạy lại vô hại)
-- ----------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS `foodx_move_table`;
DELIMITER $$
CREATE PROCEDURE `foodx_move_table`(IN p_table VARCHAR(64), IN p_target VARCHAR(64))
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.TABLES
               WHERE TABLE_SCHEMA = @SOURCE_SCHEMA AND TABLE_NAME = p_table)
       AND NOT EXISTS (SELECT 1 FROM information_schema.TABLES
                       WHERE TABLE_SCHEMA = p_target AND TABLE_NAME = p_table)
    THEN
        SET @sql := CONCAT('RENAME TABLE `', @SOURCE_SCHEMA, '`.`', p_table, '` TO `', p_target, '`.`', p_table, '`');
        PREPARE st FROM @sql; EXECUTE st; DEALLOCATE PREPARE st;
    END IF;
END$$
DELIMITER ;

-- user-service
CALL `foodx_move_table`('users',    'foodx_user');
CALL `foodx_move_table`('profiles', 'foodx_user');

-- inventory-service
CALL `foodx_move_table`('foods',        'foodx_inventory');
CALL `foodx_move_table`('ingredients',  'foodx_inventory');
CALL `foodx_move_table`('fridge_stock', 'foodx_inventory');

-- recipe-service
CALL `foodx_move_table`('recipes',            'foodx_recipe');
CALL `foodx_move_table`('recipe_ingredients', 'foodx_recipe');
CALL `foodx_move_table`('favorites',          'foodx_recipe');

-- plan-shopping-service
CALL `foodx_move_table`('meal_plan_entries', 'foodx_plan');
CALL `foodx_move_table`('shopping_items',    'foodx_plan');

-- ai-service
CALL `foodx_move_table`('chat_sessions', 'foodx_ai');
CALL `foodx_move_table`('chat_messages', 'foodx_ai');

-- social-stats-service
CALL `foodx_move_table`('recipe_posts',  'foodx_social');
CALL `foodx_move_table`('post_likes',    'foodx_social');
CALL `foodx_move_table`('post_comments', 'foodx_social');
CALL `foodx_move_table`('cook_history',  'foodx_social');

DROP PROCEDURE IF EXISTS `foodx_move_table`;

-- ----------------------------------------------------------------------------
-- 4) Khôi phục khoá ngoại NỘI BỘ từng service
--    Quan hệ trong cùng một service vẫn nên được DB bảo vệ; chỉ quan hệ XUYÊN
--    service mới bị bỏ. (JPA `ddl-auto=update` cũng sinh lại các FK này, nhưng
--    khai báo tường minh để DB đúng ngay sau migration.)
-- ----------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS `foodx_add_fk`;
DELIMITER $$
CREATE PROCEDURE `foodx_add_fk`(IN p_schema VARCHAR(64), IN p_table VARCHAR(64),
                                IN p_fk VARCHAR(64), IN p_ddl VARCHAR(1000))
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.TABLES
               WHERE TABLE_SCHEMA = p_schema AND TABLE_NAME = p_table)
       AND NOT EXISTS (SELECT 1 FROM information_schema.TABLE_CONSTRAINTS
                       WHERE CONSTRAINT_SCHEMA = p_schema AND TABLE_NAME = p_table
                         AND CONSTRAINT_NAME = p_fk AND CONSTRAINT_TYPE = 'FOREIGN KEY')
    THEN
        SET @sql := p_ddl;
        PREPARE st FROM @sql; EXECUTE st; DEALLOCATE PREPARE st;
    END IF;
END$$
DELIMITER ;

CALL `foodx_add_fk`('foodx_user', 'profiles', 'fk_profiles_user',
    'ALTER TABLE `foodx_user`.`profiles` ADD CONSTRAINT `fk_profiles_user`
     FOREIGN KEY (`user_id`) REFERENCES `foodx_user`.`users`(`id`) ON DELETE CASCADE');

CALL `foodx_add_fk`('foodx_recipe', 'recipe_ingredients', 'fk_recipe_ingredients_recipe',
    'ALTER TABLE `foodx_recipe`.`recipe_ingredients` ADD CONSTRAINT `fk_recipe_ingredients_recipe`
     FOREIGN KEY (`recipe_id`) REFERENCES `foodx_recipe`.`recipes`(`id`) ON DELETE CASCADE');

CALL `foodx_add_fk`('foodx_ai', 'chat_messages', 'fk_chat_messages_session',
    'ALTER TABLE `foodx_ai`.`chat_messages` ADD CONSTRAINT `fk_chat_messages_session`
     FOREIGN KEY (`session_id`) REFERENCES `foodx_ai`.`chat_sessions`(`id`) ON DELETE CASCADE');

CALL `foodx_add_fk`('foodx_social', 'post_likes', 'fk_post_likes_post',
    'ALTER TABLE `foodx_social`.`post_likes` ADD CONSTRAINT `fk_post_likes_post`
     FOREIGN KEY (`post_id`) REFERENCES `foodx_social`.`recipe_posts`(`id`) ON DELETE CASCADE');

CALL `foodx_add_fk`('foodx_social', 'post_comments', 'fk_post_comments_post',
    'ALTER TABLE `foodx_social`.`post_comments` ADD CONSTRAINT `fk_post_comments_post`
     FOREIGN KEY (`post_id`) REFERENCES `foodx_social`.`recipe_posts`(`id`) ON DELETE CASCADE');

DROP PROCEDURE IF EXISTS `foodx_add_fk`;

-- ----------------------------------------------------------------------------
-- 5) Kiểm tra kết quả
-- ----------------------------------------------------------------------------
SELECT 'foodx'           AS `database`, COUNT(*) AS `so_bang_con_lai`
FROM information_schema.TABLES WHERE TABLE_SCHEMA = 'foodx'
UNION ALL SELECT 'foodx_user',      COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = 'foodx_user'
UNION ALL SELECT 'foodx_inventory', COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = 'foodx_inventory'
UNION ALL SELECT 'foodx_recipe',    COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = 'foodx_recipe'
UNION ALL SELECT 'foodx_plan',      COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = 'foodx_plan'
UNION ALL SELECT 'foodx_ai',        COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = 'foodx_ai'
UNION ALL SELECT 'foodx_social',    COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = 'foodx_social';

-- Kiểm tra không còn khoá ngoại XUYÊN service nào:
-- (mọi FK còn lại phải có REFERENCED_TABLE_SCHEMA = TABLE_SCHEMA)
SELECT CONSTRAINT_SCHEMA AS `tu_db`, TABLE_NAME AS `bang`, CONSTRAINT_NAME AS `fk`,
       REFERENCED_TABLE_SCHEMA AS `tro_sang_db`
FROM information_schema.REFERENTIAL_CONSTRAINTS
WHERE CONSTRAINT_SCHEMA LIKE 'foodx%'
  AND CONSTRAINT_SCHEMA <> REFERENCED_TABLE_SCHEMA;

-- ----------------------------------------------------------------------------
-- 6) Dọn DB dùng chung
--    Chỉ xoá khi `foodx` đã rỗng (câu SELECT ở bước 5 phải trả 0).
--    Cố ý để dạng comment để tránh xoá nhầm dữ liệu chưa migrate hết.
-- ----------------------------------------------------------------------------
-- DROP DATABASE `foodx`;
