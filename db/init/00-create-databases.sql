-- ============================================================================
-- FoodX — Khởi tạo database + tài khoản cho môi trường Docker (volume MySQL mới)
-- ============================================================================
-- MySQL image chỉ chạy các file trong /docker-entrypoint-initdb.d khi thư mục dữ
-- liệu CÒN RỖNG. Với volume đã có dữ liệu, dùng db/migration/V3_database_per_service.sql.
--
-- Mỗi service sở hữu MỘT database riêng và MỘT tài khoản riêng chỉ có quyền trên
-- database đó (nguyên tắc least privilege — không dùng chung tài khoản root):
--
--   user-service         8081 -> foodx_user       / foodx_user
--   inventory-service    8082 -> foodx_inventory  / foodx_inventory
--   recipe-service       8083 -> foodx_recipe     / foodx_recipe
--   plan-shopping-service 8084 -> foodx_plan      / foodx_plan
--   ai-service           8085 -> foodx_ai         / foodx_ai
--   social-stats-service 8086 -> foodx_social     / foodx_social
--
-- ⚠️  Mật khẩu dưới đây là thông tin ĐĂNG NHẬP DEV, được ghi công khai trong repo
--     (giống mật khẩu root mặc định). Khi triển khai thật phải tạo tài khoản riêng
--     với mật khẩu ngẫu nhiên và KHÔNG commit vào mã nguồn.
--
-- Lược đồ bên trong do JPA `ddl-auto=update` tạo khi service khởi động lần đầu.
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `foodx_user`      CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS `foodx_inventory` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS `foodx_recipe`    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS `foodx_plan`      CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS `foodx_ai`        CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS `foodx_social`    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Tài khoản riêng cho từng service: chỉ có quyền trên database của chính nó,
-- nên một service bị chiếm quyền cũng không đọc/ghi được dữ liệu service khác.
-- ---------------------------------------------------------------------------
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
