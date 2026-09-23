-- =========================================================================
-- FoodX - Large-Scale 60 Recipes Seed SQL Script
-- Tự động kiểm tra & Upsert dữ liệu, không gây duplicate key.
-- =========================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Đảm bảo cấu trúc cột mở rộng cho bảng recipes
SET @col1 = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='foodx' AND TABLE_NAME='recipes' AND COLUMN_NAME='is_featured');
SET @sql1 = IF(@col1=0, 'ALTER TABLE recipes ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;', 'SELECT 1;');
PREPARE stmt1 FROM @sql1; EXECUTE stmt1; DEALLOCATE PREPARE stmt1;

SET @col2 = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='foodx' AND TABLE_NAME='recipes' AND COLUMN_NAME='likes_count');
SET @sql2 = IF(@col2=0, 'ALTER TABLE recipes ADD COLUMN likes_count INT DEFAULT 0;', 'SELECT 1;');
PREPARE stmt2 FROM @sql2; EXECUTE stmt2; DEALLOCATE PREPARE stmt2;

-- 2. Nạp kho nguyên liệu (Ingredients Master)
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Thịt ba chỉ', 'g', 'meat', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Thịt ba chỉ');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Trứng vịt', 'quả', 'meat', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Trứng vịt');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Nước dừa xiêm', 'ml', 'meat', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Nước dừa xiêm');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Nước mắm truyền thống', 'muỗng', 'meat', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Nước mắm truyền thống');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Hành tím', 'củ', 'meat', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Hành tím');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Cá bống sông', 'g', 'meat', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Cá bống sông');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Tiêu sọ đập dập', 'muỗng', 'meat', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Tiêu sọ đập dập');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Gừng già thái sợi', 'g', 'meat', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Gừng già thái sợi');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Nước màu đường', 'muỗng', 'meat', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Nước màu đường');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Ớt chỉ thiên', 'quả', 'meat', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Ớt chỉ thiên');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Cá lóc đồng', 'g', 'meat', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Cá lóc đồng');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Bạc hà (dọc mùng)', 'nhánh', 'meat', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Bạc hà (dọc mùng)');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Đậu bắp', 'quả', 'meat', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Đậu bắp');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Cà chua', 'quả', 'meat', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Cà chua');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Me vắt', 'g', 'meat', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Me vắt');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Thịt ba chỉ ngon', 'g', 'meat', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Thịt ba chỉ ngon');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Cà pháo muối giòn', 'g', 'meat', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Cà pháo muối giòn');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Mắm tôm Bắc', 'muỗng', 'meat', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Mắm tôm Bắc');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Chanh tươi', 'quả', 'meat', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Chanh tươi');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Hành tím củ', 'củ', 'meat', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Hành tím củ');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Sườn non heo', 'g', 'meat', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Sườn non heo');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Cà chua chín', 'quả', 'meat', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Cà chua chín');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Giấm gạo thanh', 'muỗng', 'meat', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Giấm gạo thanh');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Đường cát vàng', 'muỗng', 'meat', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Đường cát vàng');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Tỏi băm', 'củ', 'meat', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Tỏi băm');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Ngao sống (nghêu)', 'kg', 'meat', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Ngao sống (nghêu)');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Quả sấu tươi', 'quả', 'meat', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Quả sấu tươi');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Thì là & hành lá', 'g', 'meat', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Thì là & hành lá');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Dứa (thơm)', 'phần', 'meat', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Dứa (thơm)');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Thịt bò thăn', 'g', 'meat', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Thịt bò thăn');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Cần tây xanh', 'g', 'meat', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Cần tây xanh');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Tỏi tây (hành boa-rô)', 'nhánh', 'meat', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Tỏi tây (hành boa-rô)');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Dầu hào', 'muỗng', 'meat', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Dầu hào');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Thịt nạc vai băm', 'g', 'meat', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Thịt nạc vai băm');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Bánh đa nem (vỏ ram)', 'phần', 'meat', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Bánh đa nem (vỏ ram)');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Miến dong', 'g', 'meat', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Miến dong');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Mộc nhĩ nấm hương', 'g', 'meat', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Mộc nhĩ nấm hương');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Trứng gà tươi', 'quả', 'meat', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Trứng gà tươi');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Cá chép sông', 'kg', 'meat', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Cá chép sông');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Dưa cải chua', 'g', 'meat', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Dưa cải chua');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Tóp mỡ giòn', 'g', 'meat', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Tóp mỡ giòn');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Đậu phụ trắng', 'phần', 'meat', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Đậu phụ trắng');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Mộc nhĩ khô', 'g', 'meat', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Mộc nhĩ khô');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Hành lá', 'g', 'meat', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Hành lá');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Cua đồng xay nhuyễn', 'g', 'meat', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Cua đồng xay nhuyễn');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Rau đay & mồng tơi', 'g', 'meat', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Rau đay & mồng tơi');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Mướp hương', 'quả', 'meat', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Mướp hương');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Muối hạt', 'muỗng', 'meat', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Muối hạt');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Hành tím phi', 'g', 'meat', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Hành tím phi');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Tôm tươi (tôm đất/sú)', 'g', 'meat', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Tôm tươi (tôm đất/sú)');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Nước hàng (nước màu)', 'muỗng', 'meat', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Nước hàng (nước màu)');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Nước mắm ngon', 'muỗng', 'meat', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Nước mắm ngon');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Đầu hành trắng', 'nhánh', 'meat', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Đầu hành trắng');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Bánh phở tươi', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Bánh phở tươi');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Thịt bò thăn mềm', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Thịt bò thăn mềm');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Nước dùng phở bò cô đặc', 'ml', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Nước dùng phở bò cô đặc');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Hành hoa & đầu hành chẻ', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Hành hoa & đầu hành chẻ');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Tỏi củ băm nhuyễn', 'củ', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Tỏi củ băm nhuyễn');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Bún sợi to Huế', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Bún sợi to Huế');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Bắp bò hoa & giò heo', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Bắp bò hoa & giò heo');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Chả cua Huế', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Chả cua Huế');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Mắm ruốc Huế nguyên chất', 'muỗng', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Mắm ruốc Huế nguyên chất');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Sả tươi đập dập', 'nhánh', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Sả tươi đập dập');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Thịt gà ta thả vườn', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Thịt gà ta thả vườn');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Miến dong sạch', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Miến dong sạch');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Lá chanh bánh tẻ', 'nhánh', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Lá chanh bánh tẻ');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Nấm hương khô', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Nấm hương khô');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Hành tây & hành hoa', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Hành tây & hành hoa');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Sợi bánh canh bột lọc', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Sợi bánh canh bột lọc');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Thịt cua biển gỡ sẵn', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Thịt cua biển gỡ sẵn');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Tôm sú tươi', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Tôm sú tươi');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Trứng cút luộc', 'quả', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Trứng cút luộc');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Nước cốt dừa thơm béo', 'ml', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Nước cốt dừa thơm béo');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Hủ tiếu dai Mỹ Tho', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Hủ tiếu dai Mỹ Tho');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Tôm sú tươi luộc', 'quả', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Tôm sú tươi luộc');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Thịt nạc băm', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Thịt nạc băm');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Tỏi phi giòn rụm', 'muỗng', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Tỏi phi giòn rụm');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Bún tươi sợi mảnh', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Bún tươi sợi mảnh');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Thịt ba chỉ thái mỏng', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Thịt ba chỉ thái mỏng');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Đu đủ xanh & cà rốt', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Đu đủ xanh & cà rốt');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Nước hàng thắng đường', 'muỗng', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Nước hàng thắng đường');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Bột bánh cuốn pha sẵn', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Bột bánh cuốn pha sẵn');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Thịt nạc heo băm', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Thịt nạc heo băm');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Mộc nhĩ ngâm nở băm', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Mộc nhĩ ngâm nở băm');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Hành phi vàng giòn', 'muỗng', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Hành phi vàng giòn');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Chả lụa thái lát', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Chả lụa thái lát');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Gạo nếp cái hoa vàng', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Gạo nếp cái hoa vàng');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Đậu xanh đãi vỏ', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Đậu xanh đãi vỏ');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Thịt gà luộc xé', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Thịt gà luộc xé');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Mỡ gà phi hành thơm', 'muỗng', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Mỡ gà phi hành thơm');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Bột nghệ tạo màu', 'muỗng', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Bột nghệ tạo màu');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Bánh mì giòn nóng', 'phần', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Bánh mì giòn nóng');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Pate gan thơm bùi', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Pate gan thơm bùi');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Xúc xích chiên', 'phần', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Xúc xích chiên');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Sốt cà chua đậm đà', 'ml', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Sốt cà chua đậm đà');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Sợi mì Quảng tươi', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Sợi mì Quảng tươi');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Tôm tươi & thịt ba chỉ', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Tôm tươi & thịt ba chỉ');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Bánh tráng nướng mè', 'phần', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Bánh tráng nướng mè');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Đậu phộng rang giã dập', 'muỗng', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Đậu phộng rang giã dập');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Gạo tẻ rang vàng', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Gạo tẻ rang vàng');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Lòng heo & dồi trường', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Lòng heo & dồi trường');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Huyết heo tươi', 'ml', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Huyết heo tươi');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Quẩy giòn', 'phần', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Quẩy giòn');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Hành hoa & tía tô', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Hành hoa & tía tô');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Bún tươi sợi nhỏ', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Bún tươi sợi nhỏ');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Cua đồng giã lọc nước', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Cua đồng giã lọc nước');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Cà chua bổ múi', 'quả', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Cà chua bổ múi');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Đậu phụ rán giòn', 'phần', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Đậu phụ rán giòn');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Tóp mỡ giòn rụm', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Tóp mỡ giòn rụm');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Ức gà phi lê tươi', 'g', 'veggie', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Ức gà phi lê tươi');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Bơ lạt tan chảy', 'g', 'veggie', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Bơ lạt tan chảy');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Tỏi tươi băm nhuyễn', 'nhánh', 'veggie', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Tỏi tươi băm nhuyễn');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Lá hương thảo (rosemary)', 'nhánh', 'veggie', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Lá hương thảo (rosemary)');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Dầu ô liu nguyên chất', 'muỗng', 'veggie', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Dầu ô liu nguyên chất');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Rong nho biển tươi', 'g', 'veggie', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Rong nho biển tươi');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Xà lách thủy canh', 'g', 'veggie', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Xà lách thủy canh');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Cà chua bi baby', 'quả', 'veggie', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Cà chua bi baby');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Sốt mè rang Kewpie', 'muỗng', 'veggie', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Sốt mè rang Kewpie');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Phi lê cá hồi Nauy', 'g', 'veggie', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Phi lê cá hồi Nauy');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Chanh leo tươi lấy cốt', 'quả', 'veggie', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Chanh leo tươi lấy cốt');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Măng tây xanh non', 'g', 'veggie', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Măng tây xanh non');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Bơ lạt thực vật', 'g', 'veggie', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Bơ lạt thực vật');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Mật ong nguyên chất', 'muỗng', 'veggie', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Mật ong nguyên chất');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Bún nưa Shirataki', 'g', 'veggie', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Bún nưa Shirataki');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Thịt bò thăn thái mỏng', 'g', 'veggie', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Thịt bò thăn thái mỏng');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Cà chua bi', 'quả', 'veggie', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Cà chua bi');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Dầu hào nấm hương', 'muỗng', 'veggie', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Dầu hào nấm hương');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Yến mạch cán dẹt', 'g', 'veggie', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Yến mạch cán dẹt');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Sữa chua Hy Lạp không đường', 'g', 'veggie', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Sữa chua Hy Lạp không đường');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Dâu tây tươi thái lát', 'quả', 'veggie', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Dâu tây tươi thái lát');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Hạt chia hữu cơ', 'muỗng', 'veggie', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Hạt chia hữu cơ');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Mật ong rừng', 'muỗng', 'veggie', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Mật ong rừng');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Trứng gà ta tươi', 'quả', 'veggie', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Trứng gà ta tươi');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Bơ sáp chín tới', 'quả', 'veggie', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Bơ sáp chín tới');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Nước cốt chanh vàng', 'muỗng', 'veggie', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Nước cốt chanh vàng');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Muối hồng Himalaya', 'muỗng', 'veggie', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Muối hồng Himalaya');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Ớt bột paprika', 'muỗng', 'veggie', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Ớt bột paprika');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Tôm thẻ tươi sống', 'g', 'veggie', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Tôm thẻ tươi sống');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Bông cải xanh (súp lơ)', 'g', 'veggie', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Bông cải xanh (súp lơ)');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Gừng tươi thái lát', 'g', 'veggie', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Gừng tươi thái lát');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Muối tiêu chanh', 'phần', 'veggie', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Muối tiêu chanh');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Hạt diêm mạch (quinoa)', 'g', 'veggie', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Hạt diêm mạch (quinoa)');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Ức gà luộc xé sợi', 'g', 'veggie', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Ức gà luộc xé sợi');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Dưa leo baby thái hạt lựu', 'quả', 'veggie', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Dưa leo baby thái hạt lựu');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Dầu ô liu & giấm táo', 'muỗng', 'veggie', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Dầu ô liu & giấm táo');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Cá thu tươi cắt khúc', 'g', 'veggie', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Cá thu tươi cắt khúc');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Tiêu xanh nguyên chùm', 'nhánh', 'veggie', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Tiêu xanh nguyên chùm');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Hành tây thái mỏng', 'củ', 'veggie', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Hành tây thái mỏng');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Thì là tươi', 'g', 'veggie', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Thì là tươi');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Dầu ô liu', 'muỗng', 'veggie', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Dầu ô liu');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Rong biển khô Wakame', 'g', 'veggie', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Rong biển khô Wakame');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Đậu hũ non', 'phần', 'veggie', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Đậu hũ non');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Nấm kim châm tươi', 'g', 'veggie', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Nấm kim châm tươi');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Gừng tươi thái sợi', 'g', 'veggie', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Gừng tươi thái sợi');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Hành boa-rô thái nhỏ', 'g', 'veggie', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Hành boa-rô thái nhỏ');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Đậu phụ trắng cứng', 'phần', 'veggie', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Đậu phụ trắng cứng');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Nấm đông cô tươi', 'g', 'veggie', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Nấm đông cô tươi');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Nước tương Tamari', 'muỗng', 'veggie', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Nước tương Tamari');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Bột bắp (bột ngô)', 'muỗng', 'veggie', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Bột bắp (bột ngô)');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Hành hoa thái nhỏ', 'g', 'veggie', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Hành hoa thái nhỏ');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Chuối tiêu chín đông lạnh', 'quả', 'veggie', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Chuối tiêu chín đông lạnh');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Dâu tây đông lạnh', 'g', 'veggie', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Dâu tây đông lạnh');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Sữa hạt không đường', 'ml', 'veggie', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Sữa hạt không đường');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Granola yến mạch mật ong', 'muỗng', 'veggie', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Granola yến mạch mật ong');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Cơm nguội khô ráo', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Cơm nguội khô ráo');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Dưa cải chua giòn', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Dưa cải chua giòn');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Lòng đỏ trứng gà', 'quả', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Lòng đỏ trứng gà');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Hành tím băm', 'củ', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Hành tím băm');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Mì gói hoặc mì trứng', 'phần', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Mì gói hoặc mì trứng');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Tôm sú bóc nõn', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Tôm sú bóc nõn');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Mực ống cắt khoanh', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Mực ống cắt khoanh');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Cải ngọt xanh', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Cải ngọt xanh');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Dầu hào & hắc xì dầu', 'muỗng', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Dầu hào & hắc xì dầu');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Nấm hương khô ngâm nở', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Nấm hương khô ngâm nở');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Cà chua chín mọng', 'quả', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Cà chua chín mọng');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Hành lá & hành khô', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Hành lá & hành khô');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Nước mắm cốt', 'muỗng', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Nước mắm cốt');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Dầu ăn thực vật', 'muỗng', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Dầu ăn thực vật');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Rong biển nấu canh', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Rong biển nấu canh');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Hành hoa & rau mùi', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Hành hoa & rau mùi');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Dầu mè thơm', 'muỗng', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Dầu mè thơm');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Bánh mì ổ giòn', 'phần', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Bánh mì ổ giòn');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Pate gan heo', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Pate gan heo');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Bơ thực vật thơm', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Bơ thực vật thơm');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Dưa leo & rau mùi', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Dưa leo & rau mùi');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Cơm nguội', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Cơm nguội');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Kim chi cải thảo thái nhỏ', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Kim chi cải thảo thái nhỏ');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Xúc xích Đức thái lát', 'phần', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Xúc xích Đức thái lát');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Phô mai Mozzarella bào', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Phô mai Mozzarella bào');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Tương ớt Hàn Quốc Gochujang', 'muỗng', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Tương ớt Hàn Quốc Gochujang');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Lòng mề gan gà tươi', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Lòng mề gan gà tươi');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Giá đỗ tươi', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Giá đỗ tươi');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Hành hoa & rau răm', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Hành hoa & rau răm');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Mì tôm Hảo Hảo', 'phần', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Mì tôm Hảo Hảo');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Bắp cải thái sợi', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Bắp cải thái sợi');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Tỏi băm nhuyễn', 'nhánh', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Tỏi băm nhuyễn');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Tương ớt Chin-su', 'muỗng', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Tương ớt Chin-su');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Bắp ngọt (ngô ngọt) tách hạt', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Bắp ngọt (ngô ngọt) tách hạt');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Hành tím & hành hoa', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Hành tím & hành hoa');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Bơ lạt thơm', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Bơ lạt thơm');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Hạt nêm & nước mắm', 'muỗng', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Hạt nêm & nước mắm');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Xúc xích xông khói', 'phần', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Xúc xích xông khói');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Đậu đỏ hầm sốt cà đóng hộp', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Đậu đỏ hầm sốt cà đóng hộp');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Bơ lạt', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Bơ lạt');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Bánh mì lát sandwich', 'phần', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Bánh mì lát sandwich');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Rau cải ngọt non', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Rau cải ngọt non');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Thịt heo nạc băm', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Thịt heo nạc băm');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Gừng tươi đập dập', 'nhánh', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Gừng tươi đập dập');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Củ năng tươi thái hạt lựu', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Củ năng tươi thái hạt lựu');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Bột năng nguyên chất', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Bột năng nguyên chất');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Sương sáo đen/trắng', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Sương sáo đen/trắng');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Nước cốt dừa đậm đặc', 'ml', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Nước cốt dừa đậm đặc');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Nước cốt củ dền tạo màu đỏ', 'ml', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Nước cốt củ dền tạo màu đỏ');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Sữa tươi không đường', 'ml', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Sữa tươi không đường');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Sữa đặc có đường', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Sữa đặc có đường');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Đường thắng caramel', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Đường thắng caramel');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Nước cốt dừa thơm', 'ml', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Nước cốt dừa thơm');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Sữa chua không đường', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Sữa chua không đường');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Gelatin lá hữu cơ', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Gelatin lá hữu cơ');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Sữa đặc', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Sữa đặc');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Dâu tây & xoài chín', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Dâu tây & xoài chín');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Bột cacao nguyên chất', 'muỗng', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Bột cacao nguyên chất');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Đậu nành hạt ngâm xay', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Đậu nành hạt ngâm xay');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Đường nâu Hàn Quốc', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Đường nâu Hàn Quốc');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Trân châu đen dẻo', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Trân châu đen dẻo');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Đường nho hữu cơ', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Đường nho hữu cơ');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Cùi bưởi da xanh', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Cùi bưởi da xanh');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Đậu xanh xát vỏ', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Đậu xanh xát vỏ');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Bột năng', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Bột năng');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Đường phèn', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Đường phèn');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Chuối xiêm chín ngọt', 'quả', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Chuối xiêm chín ngọt');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Nếp dẻo nấu cốt dừa', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Nếp dẻo nấu cốt dừa');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Bột báng hạt nhỏ', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Bột báng hạt nhỏ');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Nước cốt dừa béo', 'ml', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Nước cốt dừa béo');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Đậu phộng rang vàng', 'muỗng', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Đậu phộng rang vàng');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Bột gạo tẻ', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Bột gạo tẻ');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Đậu xanh đãi vỏ nấu chín', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Đậu xanh đãi vỏ nấu chín');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Nước cốt lá dứa nguyên chất', 'ml', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Nước cốt lá dứa nguyên chất');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Nước cốt dừa', 'ml', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Nước cốt dừa');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Chuối sứ chín rục', 'quả', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Chuối sứ chín rục');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Bánh mì cũ xé nhỏ', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Bánh mì cũ xé nhỏ');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Bơ lạt đun chảy', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Bơ lạt đun chảy');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Trà đen nguyên lá (Black Tea)', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Trà đen nguyên lá (Black Tea)');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Sữa tươi thanh trùng Dalatmilk', 'ml', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Sữa tươi thanh trùng Dalatmilk');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Trân châu đường đen dẻo', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Trân châu đường đen dẻo');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Cream cheese phô mai', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Cream cheese phô mai');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Whipping cream kem sữa tươi', 'ml', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Whipping cream kem sữa tươi');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Quả dừa xiêm tươi', 'quả', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Quả dừa xiêm tươi');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Bột rau câu dẻo Jelly', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Bột rau câu dẻo Jelly');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Đường phèn xay mịn', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Đường phèn xay mịn');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Trái cây thái hạt lựu', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Trái cây thái hạt lựu');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Nha đam tươi bẹ to', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Nha đam tươi bẹ to');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Đậu xanh nguyên hạt', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Đậu xanh nguyên hạt');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Đường phèn thanh ngọt', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Đường phèn thanh ngọt');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Lá dứa (lá nếp)', 'nhánh', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Lá dứa (lá nếp)');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Chanh tươi vắt cốt', 'quả', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Chanh tươi vắt cốt');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Bột nếp thơm', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Bột nếp thơm');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Khoai tây nghiền mịn', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Khoai tây nghiền mịn');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Đậu xanh sên dừa ngọt', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Đậu xanh sên dừa ngọt');
INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)
SELECT 'Mè trắng (vừng)', 'g', 'spice', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = 'Mè trắng (vừng)');

-- 3. Nạp 60 công thức chi tiết (Recipes)
-- [mon-an-gia-dinh] Thịt kho hột vịt nước dừa
INSERT INTO recipes (id, title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, is_featured, likes_count, created_at, updated_at)
VALUES (101, 'Thịt kho hột vịt nước dừa', 'Thịt ba chỉ mềm rục ngấm nước dừa xiêm ngọt thanh, trứng vịt bùi béo keo màu cánh gián óng ả chuẩn vị mâm cơm Tết phương Nam.', '1. Thịt ba chỉ thái miếng vuông 3-4cm, chần qua nước sôi 2 phút rồi rửa sạch để ráo.
2. Ướp thịt với hành tím băm, nước mắm ngon, tiêu và chút đường trong 30 phút.
3. Thắng nước màu đường cánh gián, cho thịt vào xào săn đều các mặt.
4. Đổ nước dừa xiêm ngập thịt, đun sôi rồi hạ nhỏ lửa liu riu trong 40 phút.
5. Cho trứng vịt luộc bóc vỏ vào kho tiếp 15 phút đến khi nước sốt sánh kẹo óng ánh.', 15, 50, 4, 'Việt Nam', 'mon-an-gia-dinh', 560, 28.5, 35.0, 14.2, 'Khó', 'lunch,dinner', 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80', 1, 450, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  title = VALUES(title),
  description = VALUES(description),
  instructions = VALUES(instructions),
  cook_time = VALUES(cook_time),
  servings = VALUES(servings),
  category = VALUES(category),
  kcal = VALUES(kcal),
  difficulty = VALUES(difficulty),
  image_url = VALUES(image_url),
  is_featured = VALUES(is_featured),
  likes_count = VALUES(likes_count),
  updated_at = NOW();

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 101, id, 500, 'g' FROM ingredients WHERE name = 'Thịt ba chỉ'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 101 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Thịt ba chỉ' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 101, id, 4, 'quả' FROM ingredients WHERE name = 'Trứng vịt'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 101 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Trứng vịt' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 101, id, 400, 'ml' FROM ingredients WHERE name = 'Nước dừa xiêm'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 101 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Nước dừa xiêm' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 101, id, 3, 'muỗng' FROM ingredients WHERE name = 'Nước mắm truyền thống'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 101 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Nước mắm truyền thống' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 101, id, 3, 'củ' FROM ingredients WHERE name = 'Hành tím'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 101 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Hành tím' LIMIT 1));

-- [mon-an-gia-dinh] Cá bống kho tiêu gừng
INSERT INTO recipes (id, title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, is_featured, likes_count, created_at, updated_at)
VALUES (102, 'Cá bống kho tiêu gừng', 'Cá bống sông tươi kho quéo ngấm cay nồng của tiêu sọ và gừng già, thịt cá cứng chắc thơm lừng mùi mắm nhĩ.', '1. Cá bống làm sạch vảy, xát muối khử tanh rồi rửa sạch, để thật ráo nước.
2. Ướp cá với nước mắm, tiêu sọ, gừng sợi, nước màu và ớt băm trong 25 phút.
3. Xếp một lớp gừng mỏng dưới đáy tộ đất, đặt cá lên trên cùng phần nước ướp.
4. Đun lửa lớn cho cá sôi bùng và săn lại, sau đó hạ lửa thật nhỏ kho liu riu.
5. Khi nước kho cạn sánh sền sệt, rưới thêm muỗng mỡ nước và rắc thêm tiêu xay.', 15, 35, 3, 'Việt Nam', 'mon-an-gia-dinh', 320, 28.5, 35.0, 14.2, 'Trung bình', 'lunch,dinner', 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80', 0, 180, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  title = VALUES(title),
  description = VALUES(description),
  instructions = VALUES(instructions),
  cook_time = VALUES(cook_time),
  servings = VALUES(servings),
  category = VALUES(category),
  kcal = VALUES(kcal),
  difficulty = VALUES(difficulty),
  image_url = VALUES(image_url),
  is_featured = VALUES(is_featured),
  likes_count = VALUES(likes_count),
  updated_at = NOW();

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 102, id, 400, 'g' FROM ingredients WHERE name = 'Cá bống sông'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 102 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Cá bống sông' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 102, id, 2, 'muỗng' FROM ingredients WHERE name = 'Tiêu sọ đập dập'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 102 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Tiêu sọ đập dập' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 102, id, 30, 'g' FROM ingredients WHERE name = 'Gừng già thái sợi'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 102 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Gừng già thái sợi' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 102, id, 1, 'muỗng' FROM ingredients WHERE name = 'Nước màu đường'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 102 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Nước màu đường' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 102, id, 2, 'quả' FROM ingredients WHERE name = 'Ớt chỉ thiên'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 102 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Ớt chỉ thiên' LIMIT 1));

-- [mon-an-gia-dinh] Canh chua cá lóc miền Tây
INSERT INTO recipes (id, title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, is_featured, likes_count, created_at, updated_at)
VALUES (103, 'Canh chua cá lóc miền Tây', 'Nước canh thanh ngọt chua dịu từ me chín kết hợp cá lóc đồng béo ngọt, thơm lừng ngò gai và rau ngổ.', '1. Cá lóc cắt khúc dày 2-3cm, khía nhẹ, xát chanh khử nhớt rồi rửa sạch.
2. Dầm me với nửa bát nước sôi lấy nước cốt chua thanh dịu.
3. Đun sôi 1 lít nước, trút nước me và cho cá vào nấu chín tới trong 8 phút.
4. Thêm cà chua, dứa, đậu bắp, bạc hà vào đun sôi bùng thêm 3 phút.
5. Nêm mắm đường vừa vị chua ngọt, tắt bếp rắc ngò gai, rau ngổ và tỏi phi vàng.', 15, 30, 4, 'Việt Nam', 'mon-an-gia-dinh', 280, 28.5, 35.0, 14.2, 'Trung bình', 'lunch,dinner', 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=800&q=80', 1, 320, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  title = VALUES(title),
  description = VALUES(description),
  instructions = VALUES(instructions),
  cook_time = VALUES(cook_time),
  servings = VALUES(servings),
  category = VALUES(category),
  kcal = VALUES(kcal),
  difficulty = VALUES(difficulty),
  image_url = VALUES(image_url),
  is_featured = VALUES(is_featured),
  likes_count = VALUES(likes_count),
  updated_at = NOW();

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 103, id, 500, 'g' FROM ingredients WHERE name = 'Cá lóc đồng'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 103 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Cá lóc đồng' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 103, id, 2, 'nhánh' FROM ingredients WHERE name = 'Bạc hà (dọc mùng)'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 103 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Bạc hà (dọc mùng)' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 103, id, 6, 'quả' FROM ingredients WHERE name = 'Đậu bắp'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 103 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Đậu bắp' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 103, id, 2, 'quả' FROM ingredients WHERE name = 'Cà chua'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 103 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Cà chua' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 103, id, 50, 'g' FROM ingredients WHERE name = 'Me vắt'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 103 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Me vắt' LIMIT 1));

-- [mon-an-gia-dinh] Thịt ba chỉ luộc cà pháo mắm tôm
INSERT INTO recipes (id, title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, is_featured, likes_count, created_at, updated_at)
VALUES (104, 'Thịt ba chỉ luộc cà pháo mắm tôm', 'Thịt ba chỉ luộc trắng hồng giòn bì, ăn kèm cà pháo muối giòn tan và chén mắm tôm đánh bông chanh ớt cay tê.', '1. Thịt ba chỉ cạo sạch bì, rửa sạch với nước muối loãng.
2. Cho thịt vào nồi nước lạnh cùng hành tím đập dập và chút muối hạt.
3. Luộc lửa vừa khoảng 20 phút đến khi xiên đũa không còn tiết nước hồng.
4. Vớt thịt ngâm ngay vào âu nước đá lạnh 5 phút giúp bì giòn và thịt trắng.
5. Thái lát mỏng vừa ăn, đánh bông mắm tôm cùng đường, nước cốt chanh và ớt.', 15, 25, 3, 'Việt Nam', 'mon-an-gia-dinh', 460, 28.5, 35.0, 14.2, 'Trung bình', 'lunch,dinner', 'https://images.unsplash.com/photo-1547496502-affa22d38842?auto=format&fit=crop&w=800&q=80', 0, 210, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  title = VALUES(title),
  description = VALUES(description),
  instructions = VALUES(instructions),
  cook_time = VALUES(cook_time),
  servings = VALUES(servings),
  category = VALUES(category),
  kcal = VALUES(kcal),
  difficulty = VALUES(difficulty),
  image_url = VALUES(image_url),
  is_featured = VALUES(is_featured),
  likes_count = VALUES(likes_count),
  updated_at = NOW();

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 104, id, 500, 'g' FROM ingredients WHERE name = 'Thịt ba chỉ ngon'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 104 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Thịt ba chỉ ngon' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 104, id, 150, 'g' FROM ingredients WHERE name = 'Cà pháo muối giòn'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 104 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Cà pháo muối giòn' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 104, id, 3, 'muỗng' FROM ingredients WHERE name = 'Mắm tôm Bắc'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 104 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Mắm tôm Bắc' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 104, id, 1, 'quả' FROM ingredients WHERE name = 'Chanh tươi'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 104 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Chanh tươi' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 104, id, 3, 'củ' FROM ingredients WHERE name = 'Hành tím củ'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 104 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Hành tím củ' LIMIT 1));

-- [mon-an-gia-dinh] Sườn xào chua ngọt chuẩn vị Bắc
INSERT INTO recipes (id, title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, is_featured, likes_count, created_at, updated_at)
VALUES (105, 'Sườn xào chua ngọt chuẩn vị Bắc', 'Từng dẻ sườn non óng ả sốt cà chua quyện giấm đường chua dịu, thịt mềm thơm róc xương đậm đà cực kỳ đưa cơm.', '1. Sườn non chặt khúc vừa ăn, chần nước sôi khử bọt bẩn rồi vớt ra để ráo.
2. Pha nước sốt chua ngọt gồm giấm gạo, đường, mắm, tương cà và chút tiêu.
3. Rán sườn trên chảo dầu nóng lửa vừa đến khi xém vàng đều hai mặt.
4. Phi thơm tỏi băm, cho cà chua thái múi vào xào nhuyễn thành sốt mịn.
5. Trút sườn và bát nước sốt vào đảo đều, om nhỏ lửa 15 phút đến khi sốt keo sánh.', 15, 40, 4, 'Việt Nam', 'mon-an-gia-dinh', 480, 28.5, 35.0, 14.2, 'Trung bình', 'lunch,dinner', 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=800&q=80', 1, 480, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  title = VALUES(title),
  description = VALUES(description),
  instructions = VALUES(instructions),
  cook_time = VALUES(cook_time),
  servings = VALUES(servings),
  category = VALUES(category),
  kcal = VALUES(kcal),
  difficulty = VALUES(difficulty),
  image_url = VALUES(image_url),
  is_featured = VALUES(is_featured),
  likes_count = VALUES(likes_count),
  updated_at = NOW();

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 105, id, 600, 'g' FROM ingredients WHERE name = 'Sườn non heo'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 105 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Sườn non heo' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 105, id, 2, 'quả' FROM ingredients WHERE name = 'Cà chua chín'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 105 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Cà chua chín' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 105, id, 2, 'muỗng' FROM ingredients WHERE name = 'Giấm gạo thanh'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 105 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Giấm gạo thanh' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 105, id, 2, 'muỗng' FROM ingredients WHERE name = 'Đường cát vàng'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 105 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Đường cát vàng' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 105, id, 1, 'củ' FROM ingredients WHERE name = 'Tỏi băm'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 105 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Tỏi băm' LIMIT 1));

-- [mon-an-gia-dinh] Canh ngao nấu chua thì là
INSERT INTO recipes (id, title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, is_featured, likes_count, created_at, updated_at)
VALUES (106, 'Canh ngao nấu chua thì là', 'Món canh thanh ngọt tự nhiên từ nước luộc ngao, thơm hương thì là hành hoa và vị chua thanh tao từ quả sấu hoặc me.', '1. Ngao ngâm nước ớt cắt lát 1 tiếng nhả sạch cát rồi rửa sạch vỏ.
2. Luộc ngao với nước xâm xấp đến khi mở miệng, vớt ruột ngao, lọc lấy nước trong.
3. Phi thơm hành tím, xào săn cà chua và dứa cùng chút nước mắm ngon.
4. Đổ nước luộc ngao vào nồi, thả sấu vào đun sôi, dầm sấu lấy vị chua thanh.
5. Thả thịt ngao, hành hoa, thì là thái nhỏ vào đun sôi lại rồi tắt bếp ngay.', 15, 20, 3, 'Việt Nam', 'mon-an-gia-dinh', 160, 28.5, 35.0, 14.2, 'Dễ', 'lunch,dinner', 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80', 0, 160, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  title = VALUES(title),
  description = VALUES(description),
  instructions = VALUES(instructions),
  cook_time = VALUES(cook_time),
  servings = VALUES(servings),
  category = VALUES(category),
  kcal = VALUES(kcal),
  difficulty = VALUES(difficulty),
  image_url = VALUES(image_url),
  is_featured = VALUES(is_featured),
  likes_count = VALUES(likes_count),
  updated_at = NOW();

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 106, id, 1, 'kg' FROM ingredients WHERE name = 'Ngao sống (nghêu)'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 106 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Ngao sống (nghêu)' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 106, id, 2, 'quả' FROM ingredients WHERE name = 'Cà chua'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 106 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Cà chua' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 106, id, 3, 'quả' FROM ingredients WHERE name = 'Quả sấu tươi'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 106 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Quả sấu tươi' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 106, id, 50, 'g' FROM ingredients WHERE name = 'Thì là & hành lá'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 106 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Thì là & hành lá' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 106, id, 1, 'phần' FROM ingredients WHERE name = 'Dứa (thơm)'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 106 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Dứa (thơm)' LIMIT 1));

-- [mon-an-gia-dinh] Bò xào cần tỏi tây
INSERT INTO recipes (id, title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, is_featured, likes_count, created_at, updated_at)
VALUES (107, 'Bò xào cần tỏi tây', 'Thịt bò thăn mềm mọng xào lửa lớn cùng cần tây, tỏi tây giòn ngọt bùi thơm, đậm đà hạt tiêu đen xay thô.', '1. Thịt bò thái mỏng ngang thớ, ướp tỏi băm, dầu hào, tiêu và dầu ăn trong 15 phút.
2. Cần tỏi tây nhặt rửa sạch, cắt khúc xéo 4-5cm, cà chua bổ múi cau.
3. Làm nóng chảo với lửa lớn, trút thịt bò vào đảo nhanh tay 1-2 phút vừa chín tới rồi múc riêng.
4. Cho tiếp cà chua, tỏi tây và cần tây vào xào lửa lớn với chút gia vị cho giòn ngọt.
5. Đổ thịt bò vào đảo cùng rau thêm 30 giây, rắc tiêu xay thơm lừng rồi tắt bếp.', 15, 15, 3, 'Việt Nam', 'mon-an-gia-dinh', 390, 28.5, 35.0, 14.2, 'Dễ', 'lunch,dinner', 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80', 0, 290, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  title = VALUES(title),
  description = VALUES(description),
  instructions = VALUES(instructions),
  cook_time = VALUES(cook_time),
  servings = VALUES(servings),
  category = VALUES(category),
  kcal = VALUES(kcal),
  difficulty = VALUES(difficulty),
  image_url = VALUES(image_url),
  is_featured = VALUES(is_featured),
  likes_count = VALUES(likes_count),
  updated_at = NOW();

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 107, id, 350, 'g' FROM ingredients WHERE name = 'Thịt bò thăn'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 107 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Thịt bò thăn' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 107, id, 150, 'g' FROM ingredients WHERE name = 'Cần tây xanh'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 107 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Cần tây xanh' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 107, id, 2, 'nhánh' FROM ingredients WHERE name = 'Tỏi tây (hành boa-rô)'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 107 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Tỏi tây (hành boa-rô)' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 107, id, 1, 'quả' FROM ingredients WHERE name = 'Cà chua'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 107 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Cà chua' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 107, id, 1, 'muỗng' FROM ingredients WHERE name = 'Dầu hào'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 107 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Dầu hào' LIMIT 1));

-- [mon-an-gia-dinh] Nem rán truyền thống Hà Nội
INSERT INTO recipes (id, title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, is_featured, likes_count, created_at, updated_at)
VALUES (108, 'Nem rán truyền thống Hà Nội', 'Vỏ nem giòn rụm màu vàng ruộm, nhân thịt nạc vai quyện mộc nhĩ, miến dong, nấm hương và rau củ thơm ngát.', '1. Miến, mộc nhĩ, nấm hương ngâm nở mềm rồi băm nhỏ; cà rốt, củ đậu bào sợi ngắn.
2. Trộn đều thịt băm, rau củ, miến nấm cùng trứng gà, hạt tiêu và chút nước mắm.
3. Trải bánh đa nem, cho nhân vừa đủ vào giữa rồi cuộn chặt vừa phải thành từng chiếc thon đều.
4. Rán nem ngập dầu 2 lần: lần 1 rán sơ chín tới, lần 2 rán lửa vừa cho vỏ vàng giòn rụm.
5. Pha nước chấm nem chua ngọt tỏi ớt ăn kèm đu đủ cà rốt ngâm giòn và rau sống.', 15, 45, 4, 'Việt Nam', 'mon-an-gia-dinh', 420, 28.5, 35.0, 14.2, 'Khó', 'lunch,dinner', 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=800&q=80', 1, 410, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  title = VALUES(title),
  description = VALUES(description),
  instructions = VALUES(instructions),
  cook_time = VALUES(cook_time),
  servings = VALUES(servings),
  category = VALUES(category),
  kcal = VALUES(kcal),
  difficulty = VALUES(difficulty),
  image_url = VALUES(image_url),
  is_featured = VALUES(is_featured),
  likes_count = VALUES(likes_count),
  updated_at = NOW();

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 108, id, 400, 'g' FROM ingredients WHERE name = 'Thịt nạc vai băm'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 108 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Thịt nạc vai băm' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 108, id, 20, 'phần' FROM ingredients WHERE name = 'Bánh đa nem (vỏ ram)'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 108 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Bánh đa nem (vỏ ram)' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 108, id, 50, 'g' FROM ingredients WHERE name = 'Miến dong'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 108 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Miến dong' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 108, id, 30, 'g' FROM ingredients WHERE name = 'Mộc nhĩ nấm hương'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 108 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Mộc nhĩ nấm hương' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 108, id, 2, 'quả' FROM ingredients WHERE name = 'Trứng gà tươi'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 108 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Trứng gà tươi' LIMIT 1));

-- [mon-an-gia-dinh] Cá chép om dưa chua tóp mỡ
INSERT INTO recipes (id, title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, is_featured, likes_count, created_at, updated_at)
VALUES (109, 'Cá chép om dưa chua tóp mỡ', 'Cá chép tươi ngọt om liu riu với dưa cải muối chua giòn rụm và tóp mỡ béo ngậy, nồng nàn hương thì là hành hoa.', '1. Cá chép làm sạch, khía vảy thân, rán sơ hai mặt cho se vàng và thịt cá săn chắc.
2. Xào thơm cà chua múi cau, trút dưa chua và tóp mỡ vào xào săn cùng chút nước mắm.
3. Đổ nước dưa chua và nước sôi xâm xấp dưa, đun sôi rồi đặt cá chép vào giữa nồi.
4. Hạ nhỏ lửa om cá khoảng 25 phút cho dưa nhừ mềm ngấm vị ngọt đậm đà từ cá chép.
5. Rắc thì là và hành hoa cắt khúc lên mặt, dùng nóng trên bếp cồn kèm bún tươi.', 15, 40, 4, 'Việt Nam', 'mon-an-gia-dinh', 410, 28.5, 35.0, 14.2, 'Trung bình', 'lunch,dinner', 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?auto=format&fit=crop&w=800&q=80', 0, 250, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  title = VALUES(title),
  description = VALUES(description),
  instructions = VALUES(instructions),
  cook_time = VALUES(cook_time),
  servings = VALUES(servings),
  category = VALUES(category),
  kcal = VALUES(kcal),
  difficulty = VALUES(difficulty),
  image_url = VALUES(image_url),
  is_featured = VALUES(is_featured),
  likes_count = VALUES(likes_count),
  updated_at = NOW();

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 109, id, 1, 'kg' FROM ingredients WHERE name = 'Cá chép sông'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 109 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Cá chép sông' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 109, id, 400, 'g' FROM ingredients WHERE name = 'Dưa cải chua'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 109 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Dưa cải chua' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 109, id, 100, 'g' FROM ingredients WHERE name = 'Tóp mỡ giòn'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 109 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Tóp mỡ giòn' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 109, id, 2, 'quả' FROM ingredients WHERE name = 'Cà chua'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 109 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Cà chua' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 109, id, 80, 'g' FROM ingredients WHERE name = 'Thì là & hành lá'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 109 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Thì là & hành lá' LIMIT 1));

-- [mon-an-gia-dinh] Đậu phụ nhồi thịt sốt cà chua
INSERT INTO recipes (id, title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, is_featured, likes_count, created_at, updated_at)
VALUES (110, 'Đậu phụ nhồi thịt sốt cà chua', 'Miếng đậu phụ vàng mềm bọc trọn nhân thịt băm mộc nhĩ ngọt thơm, đẫm sốt cà chua hành lá sền sệt chua thanh.', '1. Đậu phụ cắt khúc vuông dày 4cm, dùng thìa nhỏ khoét rỗng phần ruột ở giữa.
2. Trộn thịt băm với ruột đậu, mộc nhĩ băm nhỏ, hành tím, tiêu và hạt nêm.
3. Nhồi nhân thịt vào từng miếng đậu thật khéo léo rồi đem rán vàng các mặt.
4. Phi thơm hành khô, xào nhuyễn cà chua với gia vị tạo thành hỗn hợp sốt đỏ sánh.
5. Thả đậu nhồi thịt vào sốt, rim nhỏ lửa 10 phút cho ngấm đẫm sốt rồi rắc hành lá.', 15, 30, 3, 'Việt Nam', 'mon-an-gia-dinh', 330, 28.5, 35.0, 14.2, 'Trung bình', 'lunch,dinner', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80', 0, 190, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  title = VALUES(title),
  description = VALUES(description),
  instructions = VALUES(instructions),
  cook_time = VALUES(cook_time),
  servings = VALUES(servings),
  category = VALUES(category),
  kcal = VALUES(kcal),
  difficulty = VALUES(difficulty),
  image_url = VALUES(image_url),
  is_featured = VALUES(is_featured),
  likes_count = VALUES(likes_count),
  updated_at = NOW();

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 110, id, 4, 'phần' FROM ingredients WHERE name = 'Đậu phụ trắng'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 110 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Đậu phụ trắng' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 110, id, 250, 'g' FROM ingredients WHERE name = 'Thịt nạc vai băm'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 110 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Thịt nạc vai băm' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 110, id, 20, 'g' FROM ingredients WHERE name = 'Mộc nhĩ khô'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 110 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Mộc nhĩ khô' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 110, id, 3, 'quả' FROM ingredients WHERE name = 'Cà chua chín'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 110 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Cà chua chín' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 110, id, 30, 'g' FROM ingredients WHERE name = 'Hành lá'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 110 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Hành lá' LIMIT 1));

-- [mon-an-gia-dinh] Canh cua rau đay mồng tơi mướp
INSERT INTO recipes (id, title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, is_featured, likes_count, created_at, updated_at)
VALUES (111, 'Canh cua rau đay mồng tơi mướp', 'Tảng gạch cua đồng béo ngậy nổi đều trên mặt canh rau đay mồng tơi trơn mát, hòa quyện hương mướp hương thơm ngát.', '1. Cua xay hòa cùng 1 lít nước và thìa muối nhỏ, bóp kĩ rồi lọc qua rây lấy nước trong.
2. Đun nước cua lửa nhỏ vừa, khuấy nhẹ ban đầu đến khi mảng thịt cua đóng tảng nổi lên thì vớt riêng.
3. Mướp gọt vỏ thái vát, rau đay và mồng tơi rửa sạch thái nhỏ vừa ăn.
4. Thả mướp và rau vào nồi nước cua sôi, nêm mắm ngon cho vừa miệng.
5. Canh sôi chín tới múc ra tô, đặt tảng thịt cua lên trên cùng chút gạch cua xào thơm.', 15, 25, 4, 'Việt Nam', 'mon-an-gia-dinh', 220, 28.5, 35.0, 14.2, 'Trung bình', 'lunch,dinner', 'https://images.unsplash.com/photo-1576867757603-05b134ebc379?auto=format&fit=crop&w=800&q=80', 0, 230, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  title = VALUES(title),
  description = VALUES(description),
  instructions = VALUES(instructions),
  cook_time = VALUES(cook_time),
  servings = VALUES(servings),
  category = VALUES(category),
  kcal = VALUES(kcal),
  difficulty = VALUES(difficulty),
  image_url = VALUES(image_url),
  is_featured = VALUES(is_featured),
  likes_count = VALUES(likes_count),
  updated_at = NOW();

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 111, id, 400, 'g' FROM ingredients WHERE name = 'Cua đồng xay nhuyễn'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 111 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Cua đồng xay nhuyễn' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 111, id, 200, 'g' FROM ingredients WHERE name = 'Rau đay & mồng tơi'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 111 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Rau đay & mồng tơi' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 111, id, 1, 'quả' FROM ingredients WHERE name = 'Mướp hương'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 111 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Mướp hương' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 111, id, 1, 'muỗng' FROM ingredients WHERE name = 'Muối hạt'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 111 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Muối hạt' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 111, id, 20, 'g' FROM ingredients WHERE name = 'Hành tím phi'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 111 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Hành tím phi' LIMIT 1));

-- [mon-an-gia-dinh] Tôm rim thịt ba chỉ mặn ngọt
INSERT INTO recipes (id, title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, is_featured, likes_count, created_at, updated_at)
VALUES (112, 'Tôm rim thịt ba chỉ mặn ngọt', 'Tôm đồng giòn vỏ óng ả màu cánh gián quyện cùng thịt ba chỉ xém cạnh ngậy béo, đậm đà vị mặn ngọt hài hòa.', '1. Tôm cắt râu gai, rửa sạch để ráo; thịt ba chỉ thái miếng mỏng con chì.
2. Cho thịt ba chỉ vào chảo đảo xém cạnh cho tứa bớt mỡ ngậy rồi múc ra đĩa.
3. Dùng mỡ thịt phi thơm hành tỏi băm, trút tôm vào đảo lửa lớn đến khi chuyển đỏ au giòn vỏ.
4. Trút thịt lại vào chảo cùng tôm, nêm mắm, đường, tiêu và nước màu.
5. Rim nhỏ lửa đảo đều tay đến khi sốt keo bám đều óng ả vào tôm thịt thì tắt bếp.', 15, 30, 4, 'Việt Nam', 'mon-an-gia-dinh', 430, 28.5, 35.0, 14.2, 'Trung bình', 'lunch,dinner', 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80', 0, 340, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  title = VALUES(title),
  description = VALUES(description),
  instructions = VALUES(instructions),
  cook_time = VALUES(cook_time),
  servings = VALUES(servings),
  category = VALUES(category),
  kcal = VALUES(kcal),
  difficulty = VALUES(difficulty),
  image_url = VALUES(image_url),
  is_featured = VALUES(is_featured),
  likes_count = VALUES(likes_count),
  updated_at = NOW();

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 112, id, 300, 'g' FROM ingredients WHERE name = 'Tôm tươi (tôm đất/sú)'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 112 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Tôm tươi (tôm đất/sú)' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 112, id, 300, 'g' FROM ingredients WHERE name = 'Thịt ba chỉ'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 112 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Thịt ba chỉ' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 112, id, 1, 'muỗng' FROM ingredients WHERE name = 'Nước hàng (nước màu)'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 112 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Nước hàng (nước màu)' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 112, id, 2, 'muỗng' FROM ingredients WHERE name = 'Nước mắm ngon'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 112 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Nước mắm ngon' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 112, id, 3, 'nhánh' FROM ingredients WHERE name = 'Đầu hành trắng'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 112 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Đầu hành trắng' LIMIT 1));

-- [mon-sang] Phở bò tái lăn Hà Nội
INSERT INTO recipes (id, title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, is_featured, likes_count, created_at, updated_at)
VALUES (113, 'Phở bò tái lăn Hà Nội', 'Bánh phở mềm mướt ngập trong nước dùng xương bò hầm 10 tiếng ngọt thanh, thịt bò xào lăn lửa lớn dậy nồng hương tỏi gừng.', '1. Đun sôi nước dùng xương bò cùng hoa hồi, thảo quả và gừng nướng thơm.
2. Thịt bò thái mỏng, ướp tỏi băm, tiêu, mắm và dầu ăn.
3. Đun chảo mỡ thật nóng, xào lăn thịt bò thật nhanh tay trong 30 giây rồi tắt bếp.
4. Chần bánh phở tươi qua nước sôi, xếp vào bát tô cùng đầu hành chẻ và hành hoa thái nhỏ.
5. Múc thịt bò xào lăn lên trên, chan nước dùng phở sôi sùng sục rồi thưởng thức kèm dấm tỏi ớt.', 15, 45, 2, 'Việt Nam', 'mon-sang', 490, 28.5, 35.0, 14.2, 'Khó', 'morning', 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80', 1, 495, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  title = VALUES(title),
  description = VALUES(description),
  instructions = VALUES(instructions),
  cook_time = VALUES(cook_time),
  servings = VALUES(servings),
  category = VALUES(category),
  kcal = VALUES(kcal),
  difficulty = VALUES(difficulty),
  image_url = VALUES(image_url),
  is_featured = VALUES(is_featured),
  likes_count = VALUES(likes_count),
  updated_at = NOW();

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 113, id, 400, 'g' FROM ingredients WHERE name = 'Bánh phở tươi'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 113 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Bánh phở tươi' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 113, id, 250, 'g' FROM ingredients WHERE name = 'Thịt bò thăn mềm'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 113 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Thịt bò thăn mềm' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 113, id, 800, 'ml' FROM ingredients WHERE name = 'Nước dùng phở bò cô đặc'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 113 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Nước dùng phở bò cô đặc' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 113, id, 50, 'g' FROM ingredients WHERE name = 'Hành hoa & đầu hành chẻ'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 113 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Hành hoa & đầu hành chẻ' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 113, id, 1, 'củ' FROM ingredients WHERE name = 'Tỏi củ băm nhuyễn'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 113 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Tỏi củ băm nhuyễn' LIMIT 1));

-- [mon-sang] Bún bò Huế giò heo chả cua
INSERT INTO recipes (id, title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, is_featured, likes_count, created_at, updated_at)
VALUES (114, 'Bún bò Huế giò heo chả cua', 'Tô bún đỏ rực màu ớt bột quyện mùi sả thơm ngát và mắm ruốc đặc trưng, ăn kèm khoanh giò heo mềm ngậy cùng chả cua giòn sần sật.', '1. Hầm xương ống bò và khoanh giò heo cùng bó sả đập dập trong 50 phút lấy nước ngọt.
2. Khuấy tan mắm ruốc với nước lạnh, đun sôi lọc cặn rồi trút phần nước trong vào nồi hầm.
3. Phi dầu màu điều với tỏi ớt băm thơm lừng rồi châm vào nồi nước dùng tạo màu đỏ bắt mắt.
4. Múc từng viên chả cua thả vào nồi nước dùng cho chín nổi lên mặt.
5. Xếp bún sợi to, bắp bò thái lát, khoanh giò và chả cua ra tô, chan nước dùng đậm đà kèm bắp chuối bào.', 15, 60, 4, 'Việt Nam', 'mon-sang', 540, 28.5, 35.0, 14.2, 'Khó', 'morning', 'https://images.unsplash.com/photo-1569058242252-623df46b5025?auto=format&fit=crop&w=800&q=80', 1, 460, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  title = VALUES(title),
  description = VALUES(description),
  instructions = VALUES(instructions),
  cook_time = VALUES(cook_time),
  servings = VALUES(servings),
  category = VALUES(category),
  kcal = VALUES(kcal),
  difficulty = VALUES(difficulty),
  image_url = VALUES(image_url),
  is_featured = VALUES(is_featured),
  likes_count = VALUES(likes_count),
  updated_at = NOW();

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 114, id, 600, 'g' FROM ingredients WHERE name = 'Bún sợi to Huế'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 114 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Bún sợi to Huế' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 114, id, 500, 'g' FROM ingredients WHERE name = 'Bắp bò hoa & giò heo'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 114 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Bắp bò hoa & giò heo' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 114, id, 150, 'g' FROM ingredients WHERE name = 'Chả cua Huế'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 114 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Chả cua Huế' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 114, id, 3, 'muỗng' FROM ingredients WHERE name = 'Mắm ruốc Huế nguyên chất'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 114 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Mắm ruốc Huế nguyên chất' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 114, id, 6, 'nhánh' FROM ingredients WHERE name = 'Sả tươi đập dập'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 114 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Sả tươi đập dập' LIMIT 1));

-- [mon-sang] Miến gà ta lá chanh nước trong
INSERT INTO recipes (id, title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, is_featured, likes_count, created_at, updated_at)
VALUES (115, 'Miến gà ta lá chanh nước trong', 'Sợi miến dong trong suốt dai mềm hòa cùng nước luộc gà ngọt lịm, thịt gà ta xé phay giòn da thơm hương lá chanh thái chỉ.', '1. Luộc gà với nhánh gừng và củ hành nướng đến khi chín tới, vớt ra ngâm nước lạnh cho da giòn.
2. Lọc xương gà trút lại vào nồi tiếp tục ninh lấy nước ngọt thanh, lọc bỏ váng mỡ thừa.
3. Gà lọc thịt xé phay miếng vừa ăn, lá chanh rửa sạch thái sợi mỏng như tơ.
4. Miến dong ngâm mềm, chần nhanh qua nước sôi rồi chia đều vào các tô.
5. Xếp thịt gà, nấm hương, hành hoa, rắc lá chanh lên trên rồi chan nước dùng gà nóng hổi.', 15, 35, 3, 'Việt Nam', 'mon-sang', 380, 28.5, 35.0, 14.2, 'Trung bình', 'morning', 'https://images.unsplash.com/photo-1594998893017-36147cbcae05?auto=format&fit=crop&w=800&q=80', 0, 220, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  title = VALUES(title),
  description = VALUES(description),
  instructions = VALUES(instructions),
  cook_time = VALUES(cook_time),
  servings = VALUES(servings),
  category = VALUES(category),
  kcal = VALUES(kcal),
  difficulty = VALUES(difficulty),
  image_url = VALUES(image_url),
  is_featured = VALUES(is_featured),
  likes_count = VALUES(likes_count),
  updated_at = NOW();

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 115, id, 600, 'g' FROM ingredients WHERE name = 'Thịt gà ta thả vườn'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 115 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Thịt gà ta thả vườn' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 115, id, 200, 'g' FROM ingredients WHERE name = 'Miến dong sạch'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 115 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Miến dong sạch' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 115, id, 6, 'nhánh' FROM ingredients WHERE name = 'Lá chanh bánh tẻ'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 115 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Lá chanh bánh tẻ' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 115, id, 20, 'g' FROM ingredients WHERE name = 'Nấm hương khô'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 115 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Nấm hương khô' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 115, id, 50, 'g' FROM ingredients WHERE name = 'Hành tây & hành hoa'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 115 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Hành tây & hành hoa' LIMIT 1));

-- [mon-sang] Bánh canh cua nước cốt dừa bột lọc
INSERT INTO recipes (id, title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, is_featured, likes_count, created_at, updated_at)
VALUES (116, 'Bánh canh cua nước cốt dừa bột lọc', 'Sợi bánh canh dai dai hòa quyện nước sốt cua sánh sệt đậm đà, thịt cua biển ngọt lịm kèm trứng cút và chả cá béo ngậy.', '1. Xào thơm hành tím cùng thịt cua biển và tôm tươi với chút dầu điều cho lên màu đẹp.
2. Đun sôi nước hầm xương heo ngọt đậm đà, nêm nếm gia vị vừa miệng.
3. Hòa bột năng với nước lọc rót từ từ vào nồi nước dùng khuấy đều tạo độ sánh mịn.
4. Thả sợi bánh canh bột lọc và trứng cút vào nấu trong 3 phút cho sợi bánh mềm trong.
5. Múc ra tô, rắc hành ngò, ớt lát và tiêu xay, vắt thêm lát chanh thanh mát.', 15, 40, 3, 'Việt Nam', 'mon-sang', 510, 28.5, 35.0, 14.2, 'Trung bình', 'morning', 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=800&q=80', 1, 380, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  title = VALUES(title),
  description = VALUES(description),
  instructions = VALUES(instructions),
  cook_time = VALUES(cook_time),
  servings = VALUES(servings),
  category = VALUES(category),
  kcal = VALUES(kcal),
  difficulty = VALUES(difficulty),
  image_url = VALUES(image_url),
  is_featured = VALUES(is_featured),
  likes_count = VALUES(likes_count),
  updated_at = NOW();

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 116, id, 400, 'g' FROM ingredients WHERE name = 'Sợi bánh canh bột lọc'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 116 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Sợi bánh canh bột lọc' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 116, id, 200, 'g' FROM ingredients WHERE name = 'Thịt cua biển gỡ sẵn'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 116 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Thịt cua biển gỡ sẵn' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 116, id, 150, 'g' FROM ingredients WHERE name = 'Tôm sú tươi'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 116 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Tôm sú tươi' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 116, id, 6, 'quả' FROM ingredients WHERE name = 'Trứng cút luộc'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 116 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Trứng cút luộc' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 116, id, 100, 'ml' FROM ingredients WHERE name = 'Nước cốt dừa thơm béo'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 116 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Nước cốt dừa thơm béo' LIMIT 1));

-- [mon-sang] Hủ tiếu Nam Vang sườn tôm cật
INSERT INTO recipes (id, title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, is_featured, likes_count, created_at, updated_at)
VALUES (117, 'Hủ tiếu Nam Vang sườn tôm cật', 'Món ngon trứ danh Nam Bộ với sợi hủ tiếu dai mướt, nước dùng tôm mực nướng ngọt sâu, topping ngập tràn tôm sú, sườn non và thịt băm.', '1. Hầm xương heo cùng mực khô nướng và củ cải trắng lấy nước lèo trong veo ngọt đậm đà.
2. Xào chín thịt băm với tỏi phi vàng thơm lừng; luộc tôm sú bóc nõn chừa đuôi.
3. Chần sợi hủ tiếu qua nước sôi cho mềm dai rồi xóc với dầu tỏi phi thơm chống dính.
4. Cho hủ tiếu vào tô, bày sườn non, tôm tươi, thịt băm, trứng cút và cần tàu.
5. Chan nước lèo nóng rẫy, rắc hành lá và tỏi phi giòn, ăn kèm giá sống hẹ tươi.', 15, 45, 3, 'Việt Nam', 'mon-sang', 470, 28.5, 35.0, 14.2, 'Khó', 'morning', 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&w=800&q=80', 0, 310, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  title = VALUES(title),
  description = VALUES(description),
  instructions = VALUES(instructions),
  cook_time = VALUES(cook_time),
  servings = VALUES(servings),
  category = VALUES(category),
  kcal = VALUES(kcal),
  difficulty = VALUES(difficulty),
  image_url = VALUES(image_url),
  is_featured = VALUES(is_featured),
  likes_count = VALUES(likes_count),
  updated_at = NOW();

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 117, id, 350, 'g' FROM ingredients WHERE name = 'Hủ tiếu dai Mỹ Tho'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 117 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Hủ tiếu dai Mỹ Tho' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 117, id, 6, 'quả' FROM ingredients WHERE name = 'Tôm sú tươi luộc'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 117 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Tôm sú tươi luộc' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 117, id, 300, 'g' FROM ingredients WHERE name = 'Sườn non heo'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 117 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Sườn non heo' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 117, id, 150, 'g' FROM ingredients WHERE name = 'Thịt nạc băm'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 117 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Thịt nạc băm' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 117, id, 2, 'muỗng' FROM ingredients WHERE name = 'Tỏi phi giòn rụm'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 117 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Tỏi phi giòn rụm' LIMIT 1));

-- [mon-sang] Bún chả nướng than hoa Hà Nội
INSERT INTO recipes (id, title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, is_featured, likes_count, created_at, updated_at)
VALUES (118, 'Bún chả nướng than hoa Hà Nội', 'Chả miếng ba chỉ và chả viên nướng xém cạnh than hoa thơm nức mũi, thả trong bát nước mắm chua ngọt ấm nóng kèm đu đủ giòn sần sật.', '1. Ướp thịt ba chỉ và thịt băm với hành khô băm, nước mắm, hạt tiêu, đường và nước hàng trong 30 phút.
2. Viên thịt băm thành từng viên tròn dẹt; xếp thịt miếng và thịt viên lên vỉ nướng.
3. Nướng thịt trên than hoa đỏ rực, quạt đều tay đến khi chả xém vàng ươm và thơm nức.
4. Pha nước mắm chua ngọt ấm gồm mắm, giấm, đường, tỏi ớt băm và thả dưa góp đu đủ cà rốt.
5. Bày bún tươi ra đĩa, thả chả nướng nóng hổi vào bát nước chấm ăn kèm đĩa rau sống tía tô kinh giới.', 15, 40, 3, 'Việt Nam', 'mon-sang', 520, 28.5, 35.0, 14.2, 'Trung bình', 'morning', 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=800&q=80', 1, 440, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  title = VALUES(title),
  description = VALUES(description),
  instructions = VALUES(instructions),
  cook_time = VALUES(cook_time),
  servings = VALUES(servings),
  category = VALUES(category),
  kcal = VALUES(kcal),
  difficulty = VALUES(difficulty),
  image_url = VALUES(image_url),
  is_featured = VALUES(is_featured),
  likes_count = VALUES(likes_count),
  updated_at = NOW();

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 118, id, 500, 'g' FROM ingredients WHERE name = 'Bún tươi sợi mảnh'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 118 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Bún tươi sợi mảnh' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 118, id, 300, 'g' FROM ingredients WHERE name = 'Thịt ba chỉ thái mỏng'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 118 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Thịt ba chỉ thái mỏng' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 118, id, 250, 'g' FROM ingredients WHERE name = 'Thịt nạc vai băm'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 118 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Thịt nạc vai băm' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 118, id, 150, 'g' FROM ingredients WHERE name = 'Đu đủ xanh & cà rốt'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 118 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Đu đủ xanh & cà rốt' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 118, id, 2, 'muỗng' FROM ingredients WHERE name = 'Nước hàng thắng đường'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 118 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Nước hàng thắng đường' LIMIT 1));

-- [mon-sang] Bánh cuốn nóng tráng tay nhân thịt nấm
INSERT INTO recipes (id, title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, is_featured, likes_count, created_at, updated_at)
VALUES (119, 'Bánh cuốn nóng tráng tay nhân thịt nấm', 'Lớp bánh mỏng mềm dẻo dai bọc trọn thịt băm mộc nhĩ giòn ngọt, rắc hành phi tự làm giòn tan chấm nước mắm cà cuống ấm nóng.', '1. Khuấy bột bánh cuốn với nước lọc và xíu dầu ăn, để bột nghỉ 20 phút.
2. Xào chín thịt băm cùng mộc nhĩ, hành tím và hạt tiêu đến khi săn thơm ráo nước.
3. Tráng một lớp bột mỏng trên chảo chống dính đậy vung 30 giây cho bánh chín trong.
4. Úp bánh ra đĩa, múc nhân thịt vào giữa rồi cuộn tròn thon dài khéo léo.
5. Bày bánh cuốn ra đĩa, rắc hành phi giòn, xếp chả lụa ăn cùng nước mắm chấm ấm chua ngọt.', 15, 30, 3, 'Việt Nam', 'mon-sang', 360, 28.5, 35.0, 14.2, 'Trung bình', 'morning', 'https://images.unsplash.com/photo-1555126634-323283e090fa?auto=format&fit=crop&w=800&q=80', 0, 270, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  title = VALUES(title),
  description = VALUES(description),
  instructions = VALUES(instructions),
  cook_time = VALUES(cook_time),
  servings = VALUES(servings),
  category = VALUES(category),
  kcal = VALUES(kcal),
  difficulty = VALUES(difficulty),
  image_url = VALUES(image_url),
  is_featured = VALUES(is_featured),
  likes_count = VALUES(likes_count),
  updated_at = NOW();

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 119, id, 250, 'g' FROM ingredients WHERE name = 'Bột bánh cuốn pha sẵn'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 119 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Bột bánh cuốn pha sẵn' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 119, id, 200, 'g' FROM ingredients WHERE name = 'Thịt nạc heo băm'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 119 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Thịt nạc heo băm' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 119, id, 30, 'g' FROM ingredients WHERE name = 'Mộc nhĩ ngâm nở băm'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 119 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Mộc nhĩ ngâm nở băm' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 119, id, 3, 'muỗng' FROM ingredients WHERE name = 'Hành phi vàng giòn'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 119 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Hành phi vàng giòn' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 119, id, 150, 'g' FROM ingredients WHERE name = 'Chả lụa thái lát'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 119 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Chả lụa thái lát' LIMIT 1));

-- [mon-sang] Xôi xéo gà xé hành phi mỡ gà
INSERT INTO recipes (id, title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, is_featured, likes_count, created_at, updated_at)
VALUES (120, 'Xôi xéo gà xé hành phi mỡ gà', 'Từng hạt nếp cái hoa vàng dẻo thơm ươm màu nghệ tây, phủ đầy đậu xanh thái mỏng bùi ngậy và thịt gà xé phay rưới mỡ gà thơm nức.', '1. Gạo nếp ngâm nước pha bột nghệ 6 tiếng, vo sạch để ráo rồi trộn xíu muối đem đồ chín dẻo.
2. Đậu xanh đồ chín mềm, giã nhuyễn khi còn nóng rồi nắm chặt thành từng quả tròn mịn.
3. Thịt gà luộc xé sợi, xào sơ với chút gia vị và hạt tiêu thơm lựng.
4. Xới xôi nếp vàng óng ra đĩa, dùng dao sắc thái từng lát đậu xanh mỏng phủ kín mặt xôi.
5. Rưới thìa mỡ gà phi hành nóng hổi, xếp thịt gà xé và rắc thật nhiều hành phi giòn tan.', 15, 40, 3, 'Việt Nam', 'mon-sang', 550, 28.5, 35.0, 14.2, 'Trung bình', 'morning', 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80', 0, 350, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  title = VALUES(title),
  description = VALUES(description),
  instructions = VALUES(instructions),
  cook_time = VALUES(cook_time),
  servings = VALUES(servings),
  category = VALUES(category),
  kcal = VALUES(kcal),
  difficulty = VALUES(difficulty),
  image_url = VALUES(image_url),
  is_featured = VALUES(is_featured),
  likes_count = VALUES(likes_count),
  updated_at = NOW();

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 120, id, 350, 'g' FROM ingredients WHERE name = 'Gạo nếp cái hoa vàng'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 120 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Gạo nếp cái hoa vàng' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 120, id, 150, 'g' FROM ingredients WHERE name = 'Đậu xanh đãi vỏ'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 120 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Đậu xanh đãi vỏ' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 120, id, 200, 'g' FROM ingredients WHERE name = 'Thịt gà luộc xé'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 120 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Thịt gà luộc xé' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 120, id, 3, 'muỗng' FROM ingredients WHERE name = 'Mỡ gà phi hành thơm'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 120 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Mỡ gà phi hành thơm' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 120, id, 1, 'muỗng' FROM ingredients WHERE name = 'Bột nghệ tạo màu'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 120 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Bột nghệ tạo màu' LIMIT 1));

-- [mon-sang] Bánh mì chảo xíu mại pate trứng ốp
INSERT INTO recipes (id, title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, is_featured, likes_count, created_at, updated_at)
VALUES (121, 'Bánh mì chảo xíu mại pate trứng ốp', 'Chảo bánh mì nóng hổi sôi lục bục với viên xíu mại thịt ngọt lịm, pate gan béo ngậy và lòng đỏ trứng ốp la bùi bùi chấm ngập sốt cà chua.', '1. Làm nóng chảo gang cá nhân với chút bơ thơm, ốp la 2 quả trứng gà lòng đào béo ngậy.
2. Áp chảo xém cạnh xúc xích và làm nóng miếng pate gan thơm lừng.
3. Rót sốt cà chua thịt băm đậm đà vào chảo đun sôi lăn tăn bốc khói nghi ngút.
4. Rắc hạt tiêu xay, hành lá thái nhỏ và vài lát ớt tươi trang trí bắt mắt.
5. Thưởng thức ngay khi chảo còn xèo xèo cùng ổ bánh mì vỏ giòn rụm ruột mềm xốp.', 15, 20, 2, 'Việt Nam', 'mon-sang', 580, 28.5, 35.0, 14.2, 'Dễ', 'morning', 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80', 1, 420, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  title = VALUES(title),
  description = VALUES(description),
  instructions = VALUES(instructions),
  cook_time = VALUES(cook_time),
  servings = VALUES(servings),
  category = VALUES(category),
  kcal = VALUES(kcal),
  difficulty = VALUES(difficulty),
  image_url = VALUES(image_url),
  is_featured = VALUES(is_featured),
  likes_count = VALUES(likes_count),
  updated_at = NOW();

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 121, id, 2, 'phần' FROM ingredients WHERE name = 'Bánh mì giòn nóng'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 121 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Bánh mì giòn nóng' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 121, id, 2, 'quả' FROM ingredients WHERE name = 'Trứng gà tươi'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 121 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Trứng gà tươi' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 121, id, 80, 'g' FROM ingredients WHERE name = 'Pate gan thơm bùi'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 121 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Pate gan thơm bùi' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 121, id, 2, 'phần' FROM ingredients WHERE name = 'Xúc xích chiên'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 121 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Xúc xích chiên' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 121, id, 100, 'ml' FROM ingredients WHERE name = 'Sốt cà chua đậm đà'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 121 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Sốt cà chua đậm đà' LIMIT 1));

-- [mon-sang] Mì Quảng tôm thịt trứng cút bánh tráng
INSERT INTO recipes (id, title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, is_featured, likes_count, created_at, updated_at)
VALUES (122, 'Mì Quảng tôm thịt trứng cút bánh tráng', 'Sợi mì Quảng vàng óng mềm mượt chan nước nhưn tôm thịt rim đậm đà sánh ngọt, rắc đậu phộng rang giòn rụm và bánh tráng mè nướng.', '1. Thịt ba chỉ và tôm ướp củ nén đập dập, ớt bột màu điều, nước mắm và tiêu trong 20 phút.
2. Phi thơm củ nén với dầu đậu phộng, trút tôm thịt vào xào săn keo lại đậm đà.
3. Châm chút nước dùng hầm xương vừa đủ, rim nhỏ lửa tạo thành nước nhưn sánh vàng óng ả.
4. Trải rau sống bắp chuối dưới đáy tô, xếp sợi mì Quảng lên trên cùng tôm thịt và trứng cút.
5. Chan một vá nước nhưn đậm đà, rắc đậu phộng và bẻ vụn bánh tráng mè nướng giòn tan.', 15, 35, 3, 'Việt Nam', 'mon-sang', 490, 28.5, 35.0, 14.2, 'Trung bình', 'morning', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80', 0, 290, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  title = VALUES(title),
  description = VALUES(description),
  instructions = VALUES(instructions),
  cook_time = VALUES(cook_time),
  servings = VALUES(servings),
  category = VALUES(category),
  kcal = VALUES(kcal),
  difficulty = VALUES(difficulty),
  image_url = VALUES(image_url),
  is_featured = VALUES(is_featured),
  likes_count = VALUES(likes_count),
  updated_at = NOW();

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 122, id, 400, 'g' FROM ingredients WHERE name = 'Sợi mì Quảng tươi'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 122 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Sợi mì Quảng tươi' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 122, id, 300, 'g' FROM ingredients WHERE name = 'Tôm tươi & thịt ba chỉ'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 122 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Tôm tươi & thịt ba chỉ' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 122, id, 6, 'quả' FROM ingredients WHERE name = 'Trứng cút luộc'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 122 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Trứng cút luộc' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 122, id, 1, 'phần' FROM ingredients WHERE name = 'Bánh tráng nướng mè'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 122 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Bánh tráng nướng mè' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 122, id, 3, 'muỗng' FROM ingredients WHERE name = 'Đậu phộng rang giã dập'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 122 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Đậu phộng rang giã dập' LIMIT 1));

-- [mon-sang] Cháo lòng heo bùi ngậy quẩy giòn
INSERT INTO recipes (id, title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, is_featured, likes_count, created_at, updated_at)
VALUES (123, 'Cháo lòng heo bùi ngậy quẩy giòn', 'Tô cháo sánh mịn nấu từ gạo rang thơm lừng quyện huyết tươi, topping đầy ắp dồi trường giòn sần sật, gan luộc bùi béo và quẩy chiên giòn rụm.', '1. Lòng heo sơ chế sạch với muối và chanh, luộc chín giòn vớt ra thái miếng vừa ăn.
2. Gạo rang vàng hạ thổ, ninh với nước luộc lòng cho hạt gạo nở bung sánh mịn.
3. Khuấy đều huyết tươi vào nồi cháo sôi lăn tăn tạo màu nâu đỏ đặc trưng và vị ngọt bùi.
4. Múc cháo ra tô, xếp đầy đặn dồi trường, gan, dạ dày và thịt dải heo lên mặt.
5. Rắc tiêu đen xay thô, hành hoa tía tô thái sợi, ăn kèm quẩy giòn và chén mắm ớt cay.', 15, 45, 3, 'Việt Nam', 'mon-sang', 440, 28.5, 35.0, 14.2, 'Khó', 'morning', 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=800&q=80', 0, 195, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  title = VALUES(title),
  description = VALUES(description),
  instructions = VALUES(instructions),
  cook_time = VALUES(cook_time),
  servings = VALUES(servings),
  category = VALUES(category),
  kcal = VALUES(kcal),
  difficulty = VALUES(difficulty),
  image_url = VALUES(image_url),
  is_featured = VALUES(is_featured),
  likes_count = VALUES(likes_count),
  updated_at = NOW();

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 123, id, 150, 'g' FROM ingredients WHERE name = 'Gạo tẻ rang vàng'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 123 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Gạo tẻ rang vàng' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 123, id, 350, 'g' FROM ingredients WHERE name = 'Lòng heo & dồi trường'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 123 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Lòng heo & dồi trường' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 123, id, 100, 'ml' FROM ingredients WHERE name = 'Huyết heo tươi'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 123 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Huyết heo tươi' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 123, id, 4, 'phần' FROM ingredients WHERE name = 'Quẩy giòn'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 123 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Quẩy giòn' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 123, id, 40, 'g' FROM ingredients WHERE name = 'Hành hoa & tía tô'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 123 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Hành hoa & tía tô' LIMIT 1));

-- [mon-sang] Bún riêu cua đồng tóp mỡ mắm tôm
INSERT INTO recipes (id, title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, is_featured, likes_count, created_at, updated_at)
VALUES (124, 'Bún riêu cua đồng tóp mỡ mắm tôm', 'Bát bún riêu rực rỡ sắc đỏ cà chua, tảng riêu cua đồng mềm mịn béo ngậy, đậu phụ rán giòn và tóp mỡ vàng rụm dậy mùi mắm tôm nồng nàn.', '1. Đun nước cua lửa vừa với chút muối đến khi mảng riêu cua nổi dày đặc thì vớt riêng ra bát.
2. Xào cà chua với dầu điều thơm phức rồi trút vào nồi nước dùng đun sôi liu riu.
3. Nêm dấm bỗng chua dịu thanh tao cùng chút mắm tôm cho dậy hương vị đồng nội.
4. Chần bún xếp vào tô, thả đậu phụ rán, múc tảng riêu cua và tóp mỡ giòn lên trên.
5. Chan nước riêu nóng rẫy ngập bún, ăn kèm rổ rau sống hoa chuối và kinh giới tươi non.', 15, 35, 3, 'Việt Nam', 'mon-sang', 460, 28.5, 35.0, 14.2, 'Trung bình', 'morning', 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=800&q=80', 0, 360, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  title = VALUES(title),
  description = VALUES(description),
  instructions = VALUES(instructions),
  cook_time = VALUES(cook_time),
  servings = VALUES(servings),
  category = VALUES(category),
  kcal = VALUES(kcal),
  difficulty = VALUES(difficulty),
  image_url = VALUES(image_url),
  is_featured = VALUES(is_featured),
  likes_count = VALUES(likes_count),
  updated_at = NOW();

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 124, id, 450, 'g' FROM ingredients WHERE name = 'Bún tươi sợi nhỏ'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 124 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Bún tươi sợi nhỏ' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 124, id, 500, 'g' FROM ingredients WHERE name = 'Cua đồng giã lọc nước'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 124 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Cua đồng giã lọc nước' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 124, id, 3, 'quả' FROM ingredients WHERE name = 'Cà chua bổ múi'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 124 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Cà chua bổ múi' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 124, id, 2, 'phần' FROM ingredients WHERE name = 'Đậu phụ rán giòn'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 124 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Đậu phụ rán giòn' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 124, id, 80, 'g' FROM ingredients WHERE name = 'Tóp mỡ giòn rụm'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 124 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Tóp mỡ giòn rụm' LIMIT 1));

-- [eat-clean] Ức gà nướng bơ tỏi hương thảo
INSERT INTO recipes (id, title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, is_featured, likes_count, created_at, updated_at)
VALUES (125, 'Ức gà nướng bơ tỏi hương thảo', 'Miếng ức gà mềm mọng nước không hề bị khô xác, phủ lớp sốt bơ tỏi vàng óng dậy mùi thơm ngát của lá hương thảo rosemary tươi.', '1. Ức gà khía nhẹ mặt trên hình quả trám giúp gia vị ngấm sâu vào thớ thịt.
2. Ướp gà với dầu ô liu, tỏi băm, muối hồng tiêu đen và lá hương thảo trong 20 phút.
3. Làm nóng chảo chống dính, áp chảo ức gà mỗi mặt 3-4 phút cho xém vàng đẹp mắt.
4. Thêm bơ lạt và tỏi nhánh vào chảo, dùng thìa rưới bơ liên tục lên mặt ức gà cho mọng nước.
5. Gắp gà ra để nghỉ 5 phút trước khi thái lát chéo, dùng kèm măng tây hoặc bông cải xanh.', 15, 25, 2, 'Việt Nam', 'eat-clean', 320, 28.5, 35.0, 14.2, 'Trung bình', 'lunch,dinner', 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80', 1, 380, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  title = VALUES(title),
  description = VALUES(description),
  instructions = VALUES(instructions),
  cook_time = VALUES(cook_time),
  servings = VALUES(servings),
  category = VALUES(category),
  kcal = VALUES(kcal),
  difficulty = VALUES(difficulty),
  image_url = VALUES(image_url),
  is_featured = VALUES(is_featured),
  likes_count = VALUES(likes_count),
  updated_at = NOW();

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 125, id, 400, 'g' FROM ingredients WHERE name = 'Ức gà phi lê tươi'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 125 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Ức gà phi lê tươi' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 125, id, 20, 'g' FROM ingredients WHERE name = 'Bơ lạt tan chảy'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 125 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Bơ lạt tan chảy' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 125, id, 4, 'nhánh' FROM ingredients WHERE name = 'Tỏi tươi băm nhuyễn'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 125 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Tỏi tươi băm nhuyễn' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 125, id, 2, 'nhánh' FROM ingredients WHERE name = 'Lá hương thảo (rosemary)'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 125 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Lá hương thảo (rosemary)' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 125, id, 1, 'muỗng' FROM ingredients WHERE name = 'Dầu ô liu nguyên chất'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 125 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Dầu ô liu nguyên chất' LIMIT 1));

-- [eat-clean] Salad rong nho tôm tươi sốt mè rang
INSERT INTO recipes (id, title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, is_featured, likes_count, created_at, updated_at)
VALUES (126, 'Salad rong nho tôm tươi sốt mè rang', 'Từng chùm rong nho giòn sần sật mọng nước biển kết hợp tôm sú hấp ngọt mềm và trứng luộc, đẫm sốt mè rang bùi béo thanh mát.', '1. Rong nho ngâm nước đá lạnh 5 phút để khử bớt vị mặn và tăng độ giòn giòn mọng nước.
2. Tôm sú hấp chín tới cùng nhánh sả, bóc vỏ bỏ chỉ đen để nguội.
3. Xà lách rửa sạch xắt khúc vừa ăn, cà chua bi bổ đôi xếp đều ra đĩa to.
4. Bày tôm tươi và rong nho giòn mọng lên trên mặt đĩa rau salad nhiều màu sắc.
5. Rưới sốt mè rang thơm bùi ngay trước khi dùng để giữ trọn độ giòn tươi của rong nho.', 15, 15, 2, 'Việt Nam', 'eat-clean', 260, 28.5, 35.0, 14.2, 'Dễ', 'lunch,dinner', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80', 0, 240, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  title = VALUES(title),
  description = VALUES(description),
  instructions = VALUES(instructions),
  cook_time = VALUES(cook_time),
  servings = VALUES(servings),
  category = VALUES(category),
  kcal = VALUES(kcal),
  difficulty = VALUES(difficulty),
  image_url = VALUES(image_url),
  is_featured = VALUES(is_featured),
  likes_count = VALUES(likes_count),
  updated_at = NOW();

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 126, id, 120, 'g' FROM ingredients WHERE name = 'Rong nho biển tươi'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 126 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Rong nho biển tươi' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 126, id, 8, 'quả' FROM ingredients WHERE name = 'Tôm sú tươi luộc'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 126 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Tôm sú tươi luộc' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 126, id, 150, 'g' FROM ingredients WHERE name = 'Xà lách thủy canh'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 126 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Xà lách thủy canh' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 126, id, 8, 'quả' FROM ingredients WHERE name = 'Cà chua bi baby'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 126 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Cà chua bi baby' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 126, id, 3, 'muỗng' FROM ingredients WHERE name = 'Sốt mè rang Kewpie'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 126 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Sốt mè rang Kewpie' LIMIT 1));

-- [eat-clean] Cá hồi áp chảo sốt chanh leo măng tây
INSERT INTO recipes (id, title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, is_featured, likes_count, created_at, updated_at)
VALUES (127, 'Cá hồi áp chảo sốt chanh leo măng tây', 'Phi lê cá hồi giòn rụm lớp da ngoài nhưng thịt bên trong hồng mềm béo ngậy, quyện sốt chanh leo chua thanh dịu ngọt cực kỳ thanh lịch.', '1. Cá hồi thấm thật khô mặt da bằng khăn giấy, ướp chút muối biển và tiêu đen xay thô.
2. Áp chảo cá hồi với dầu ô liu: áp mặt da 4 phút cho giòn rụm rồi lật mặt thịt 2 phút vừa chín tới.
3. Măng tây cắt bớt gốc già, xào sơ với bơ tỏi trên chảo nóng 2 phút cho giòn ngọt.
4. Đun nước cốt chanh leo cùng thìa mật ong và bơ lạt đến khi sốt hơi sánh mịn.
5. Đặt cá hồi lên đĩa măng tây, rưới sốt chanh leo vàng óng óng ả lên miếng cá.', 15, 20, 2, 'Việt Nam', 'eat-clean', 390, 28.5, 35.0, 14.2, 'Dễ', 'lunch,dinner', 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80', 1, 470, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  title = VALUES(title),
  description = VALUES(description),
  instructions = VALUES(instructions),
  cook_time = VALUES(cook_time),
  servings = VALUES(servings),
  category = VALUES(category),
  kcal = VALUES(kcal),
  difficulty = VALUES(difficulty),
  image_url = VALUES(image_url),
  is_featured = VALUES(is_featured),
  likes_count = VALUES(likes_count),
  updated_at = NOW();

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 127, id, 300, 'g' FROM ingredients WHERE name = 'Phi lê cá hồi Nauy'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 127 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Phi lê cá hồi Nauy' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 127, id, 3, 'quả' FROM ingredients WHERE name = 'Chanh leo tươi lấy cốt'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 127 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Chanh leo tươi lấy cốt' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 127, id, 120, 'g' FROM ingredients WHERE name = 'Măng tây xanh non'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 127 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Măng tây xanh non' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 127, id, 15, 'g' FROM ingredients WHERE name = 'Bơ lạt thực vật'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 127 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Bơ lạt thực vật' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 127, id, 1, 'muỗng' FROM ingredients WHERE name = 'Mật ong nguyên chất'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 127 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Mật ong nguyên chất' LIMIT 1));

-- [eat-clean] Bún nưa bò xào cần tây cà chua
INSERT INTO recipes (id, title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, is_featured, likes_count, created_at, updated_at)
VALUES (128, 'Bún nưa bò xào cần tây cà chua', 'Sợi bún nưa Shirataki zero-carb dai giòn sần sật ngấm trọn vị ngọt mềm từ thịt bò xào lửa lớn và vị chua dịu từ cà chua bi.', '1. Bún nưa rửa sạch qua rây, chần nước sôi 2 phút rồi sao khô trên chảo không dầu cho ráo nước.
2. Thịt bò ướp tỏi băm, chút muối tiêu và thìa dầu hào nấm hương giảm muối.
3. Làm nóng chảo với chút dầu ô liu, đảo thịt bò lửa lớn chín tái 80% rồi trút ra đĩa.
4. Xào cần tây và cà chua bi cho chín giòn ngọt tự nhiên.
5. Đổ bún nưa và thịt bò vào chảo đảo đều tay 1 phút, rắc hạt tiêu thơm rồi thưởng thức nóng.', 15, 15, 2, 'Việt Nam', 'eat-clean', 230, 28.5, 35.0, 14.2, 'Dễ', 'lunch,dinner', 'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=800&q=80', 0, 190, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  title = VALUES(title),
  description = VALUES(description),
  instructions = VALUES(instructions),
  cook_time = VALUES(cook_time),
  servings = VALUES(servings),
  category = VALUES(category),
  kcal = VALUES(kcal),
  difficulty = VALUES(difficulty),
  image_url = VALUES(image_url),
  is_featured = VALUES(is_featured),
  likes_count = VALUES(likes_count),
  updated_at = NOW();

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 128, id, 300, 'g' FROM ingredients WHERE name = 'Bún nưa Shirataki'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 128 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Bún nưa Shirataki' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 128, id, 200, 'g' FROM ingredients WHERE name = 'Thịt bò thăn thái mỏng'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 128 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Thịt bò thăn thái mỏng' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 128, id, 100, 'g' FROM ingredients WHERE name = 'Cần tây xanh'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 128 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Cần tây xanh' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 128, id, 6, 'quả' FROM ingredients WHERE name = 'Cà chua bi'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 128 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Cà chua bi' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 128, id, 1, 'muỗng' FROM ingredients WHERE name = 'Dầu hào nấm hương'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 128 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Dầu hào nấm hương' LIMIT 1));

-- [eat-clean] Yến mạch hoa quả hạt chia sữa chua Hy Lạp
INSERT INTO recipes (id, title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, is_featured, likes_count, created_at, updated_at)
VALUES (129, 'Yến mạch hoa quả hạt chia sữa chua Hy Lạp', 'Bữa sáng tràn đầy năng lượng sạch với yến mạch cán dẹt ngâm qua đêm, sữa chua Hy Lạp sánh đặc phủ dâu tây mọng và hạt chia giàu xơ.', '1. Cho yến mạch cán dẹt và hạt chia vào lọ thủy tinh cùng sữa chua Hy Lạp.
2. Khuấy đều hỗn hợp cùng một thìa nhỏ mật ong và 30ml sữa hạt nguyên chất.
3. Đậy kín nắp lọ bảo quản ngăn mát tủ lạnh qua đêm cho yến mạch nở mềm xốp.
4. Sáng hôm sau mở nắp, xếp dâu tây tươi và chuối lát lên trên bề mặt.
5. Rắc thêm vài hạt hạnh nhân giã dập tạo độ giòn bùi thú vị khi thưởng thức.', 15, 10, 1, 'Việt Nam', 'eat-clean', 290, 28.5, 35.0, 14.2, 'Dễ', 'lunch,dinner', 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=800&q=80', 0, 310, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  title = VALUES(title),
  description = VALUES(description),
  instructions = VALUES(instructions),
  cook_time = VALUES(cook_time),
  servings = VALUES(servings),
  category = VALUES(category),
  kcal = VALUES(kcal),
  difficulty = VALUES(difficulty),
  image_url = VALUES(image_url),
  is_featured = VALUES(is_featured),
  likes_count = VALUES(likes_count),
  updated_at = NOW();

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 129, id, 50, 'g' FROM ingredients WHERE name = 'Yến mạch cán dẹt'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 129 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Yến mạch cán dẹt' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 129, id, 120, 'g' FROM ingredients WHERE name = 'Sữa chua Hy Lạp không đường'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 129 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Sữa chua Hy Lạp không đường' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 129, id, 5, 'quả' FROM ingredients WHERE name = 'Dâu tây tươi thái lát'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 129 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Dâu tây tươi thái lát' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 129, id, 1, 'muỗng' FROM ingredients WHERE name = 'Hạt chia hữu cơ'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 129 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Hạt chia hữu cơ' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 129, id, 1, 'muỗng' FROM ingredients WHERE name = 'Mật ong rừng'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 129 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Mật ong rừng' LIMIT 1));

-- [eat-clean] Trứng luộc lòng đào sốt bơ quả dinh dưỡng
INSERT INTO recipes (id, title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, is_featured, likes_count, created_at, updated_at)
VALUES (130, 'Trứng luộc lòng đào sốt bơ quả dinh dưỡng', 'Trứng gà ta luộc đúng 6 phút lòng đào sánh dẻo vàng óng, ăn cùng quả bơ sáp béo ngậy thái hạt lựu và sốt chanh mè thanh dịu.', '1. Đun nước sôi bùng cùng chút giấm, hạ trứng nhẹ nhàng luộc đúng 6 phút canh đồng hồ.
2. Vớt trứng ngâm ngay vào âu nước đá lạnh 5 phút rồi bóc vỏ nhẹ nhàng.
3. Bơ sáp bổ đôi bỏ hạt, thái lát mỏng hoặc hạt lựu vuông vức xếp ra đĩa.
4. Cắt đôi quả trứng gà để lộ phần lòng đào vàng sánh mịn màng đặt bên cạnh bơ.
5. Rắc muối hồng, tiêu đen, ớt bột paprika và rưới chút dầu ô liu chanh vàng thanh khiết.', 15, 12, 1, 'Việt Nam', 'eat-clean', 270, 28.5, 35.0, 14.2, 'Dễ', 'lunch,dinner', 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80', 0, 160, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  title = VALUES(title),
  description = VALUES(description),
  instructions = VALUES(instructions),
  cook_time = VALUES(cook_time),
  servings = VALUES(servings),
  category = VALUES(category),
  kcal = VALUES(kcal),
  difficulty = VALUES(difficulty),
  image_url = VALUES(image_url),
  is_featured = VALUES(is_featured),
  likes_count = VALUES(likes_count),
  updated_at = NOW();

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 130, id, 2, 'quả' FROM ingredients WHERE name = 'Trứng gà ta tươi'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 130 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Trứng gà ta tươi' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 130, id, 1, 'quả' FROM ingredients WHERE name = 'Bơ sáp chín tới'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 130 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Bơ sáp chín tới' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 130, id, 1, 'muỗng' FROM ingredients WHERE name = 'Nước cốt chanh vàng'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 130 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Nước cốt chanh vàng' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 130, id, 1, 'muỗng' FROM ingredients WHERE name = 'Muối hồng Himalaya'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 130 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Muối hồng Himalaya' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 130, id, 1, 'muỗng' FROM ingredients WHERE name = 'Ớt bột paprika'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 130 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Ớt bột paprika' LIMIT 1));

-- [eat-clean] Tôm hấp sả kèm bông cải xanh luộc
INSERT INTO recipes (id, title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, is_featured, likes_count, created_at, updated_at)
VALUES (131, 'Tôm hấp sả kèm bông cải xanh luộc', 'Tôm thẻ tươi giòn ngọt tự nhiên hấp cùng sả cây thơm ngát, ăn kèm bông cải xanh luộc giòn ngọt chấm muối tiêu chanh thanh đạm.', '1. Tôm rửa sạch cắt râu; sả đập dập lót một lớp dưới đáy nồi hấp.
2. Xếp tôm và vài lát gừng lên vỉ sả, hấp cách thủy trong 6-7 phút đến khi tôm cong đỏ au.
3. Bông cải xanh cắt miếng vừa ăn, luộc nhanh trong nước sôi có chút muối trong 3 phút.
4. Vớt bông cải ngâm nước lạnh giúp giữ màu xanh ngọc bích và độ giòn ngọt tự nhiên.
5. Bày tôm hấp và bông cải xanh ra đĩa, thưởng thức cùng chén muối tiêu chanh tươi.', 15, 15, 2, 'Việt Nam', 'eat-clean', 210, 28.5, 35.0, 14.2, 'Dễ', 'lunch,dinner', 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=800&q=80', 0, 220, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  title = VALUES(title),
  description = VALUES(description),
  instructions = VALUES(instructions),
  cook_time = VALUES(cook_time),
  servings = VALUES(servings),
  category = VALUES(category),
  kcal = VALUES(kcal),
  difficulty = VALUES(difficulty),
  image_url = VALUES(image_url),
  is_featured = VALUES(is_featured),
  likes_count = VALUES(likes_count),
  updated_at = NOW();

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 131, id, 350, 'g' FROM ingredients WHERE name = 'Tôm thẻ tươi sống'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 131 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Tôm thẻ tươi sống' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 131, id, 4, 'nhánh' FROM ingredients WHERE name = 'Sả tươi đập dập'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 131 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Sả tươi đập dập' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 131, id, 250, 'g' FROM ingredients WHERE name = 'Bông cải xanh (súp lơ)'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 131 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Bông cải xanh (súp lơ)' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 131, id, 15, 'g' FROM ingredients WHERE name = 'Gừng tươi thái lát'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 131 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Gừng tươi thái lát' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 131, id, 1, 'phần' FROM ingredients WHERE name = 'Muối tiêu chanh'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 131 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Muối tiêu chanh' LIMIT 1));

-- [eat-clean] Salad ức gà quinoa sốt dầu giấm oliu
INSERT INTO recipes (id, title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, is_featured, likes_count, created_at, updated_at)
VALUES (132, 'Salad ức gà quinoa sốt dầu giấm oliu', 'Hạt quinoa chín xốp bùi kết hợp ức gà xé mềm ngọt, rau củ thanh mát và nước sốt dầu giấm táo chua dịu giúp no lâu mà nhẹ bụng.', '1. Vo sạch hạt quinoa, nấu cùng nước theo tỉ lệ 1:2 trong 15 phút đến khi hạt nở bung xốp.
2. Ức gà luộc chín tới cùng lát gừng, xé thành từng sợi nhỏ vừa ăn.
3. Dưa leo, ớt chuông đỏ và cà chua bi rửa sạch thái hạt lựu màu sắc rực rỡ.
4. Pha sốt dầu giấm gồm dầu ô liu, giấm táo, mật ong, muối hồng và tiêu xay nhuyễn.
5. Trộn đều quinoa, ức gà và rau củ cùng bát nước sốt, để 5 phút cho ngấm rồi thưởng thức.', 15, 25, 2, 'Việt Nam', 'eat-clean', 340, 28.5, 35.0, 14.2, 'Trung bình', 'lunch,dinner', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80', 0, 280, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  title = VALUES(title),
  description = VALUES(description),
  instructions = VALUES(instructions),
  cook_time = VALUES(cook_time),
  servings = VALUES(servings),
  category = VALUES(category),
  kcal = VALUES(kcal),
  difficulty = VALUES(difficulty),
  image_url = VALUES(image_url),
  is_featured = VALUES(is_featured),
  likes_count = VALUES(likes_count),
  updated_at = NOW();

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 132, id, 80, 'g' FROM ingredients WHERE name = 'Hạt diêm mạch (quinoa)'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 132 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Hạt diêm mạch (quinoa)' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 132, id, 200, 'g' FROM ingredients WHERE name = 'Ức gà luộc xé sợi'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 132 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Ức gà luộc xé sợi' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 132, id, 1, 'quả' FROM ingredients WHERE name = 'Dưa leo baby thái hạt lựu'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 132 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Dưa leo baby thái hạt lựu' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 132, id, 6, 'quả' FROM ingredients WHERE name = 'Cà chua bi baby'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 132 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Cà chua bi baby' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 132, id, 2, 'muỗng' FROM ingredients WHERE name = 'Dầu ô liu & giấm táo'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 132 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Dầu ô liu & giấm táo' LIMIT 1));

-- [eat-clean] Cá thu nướng giấy bạc thơm thảo mộc
INSERT INTO recipes (id, title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, is_featured, likes_count, created_at, updated_at)
VALUES (133, 'Cá thu nướng giấy bạc thơm thảo mộc', 'Khúc cá thu nướng giữ trọn vẹn nước ngọt béo nguyên bản trong lớp giấy bạc kín, thoang thoảng hương thì là, tiêu xanh và hành tây.', '1. Cá thu rửa sạch thấm khô, khía xéo hai mặt ướp chút muối tiêu và dầu ô liu 15 phút.
2. Trải giấy bạc ra khay nướng, rải một lớp hành tây thái mỏng và vài nhánh thì là dưới đáy.
3. Đặt cá thu lên trên, xếp tiêu xanh đập dập và thì là bao phủ mặt cá.
4. Gói kín các mép giấy bạc lại tạo thành bọc kín hơi giúp cá chín mọng nước.
5. Nướng ở 200 độ C trong 20 phút bằng nồi chiên không dầu hoặc lò nướng.', 15, 30, 2, 'Việt Nam', 'eat-clean', 330, 28.5, 35.0, 14.2, 'Trung bình', 'lunch,dinner', 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80', 0, 200, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  title = VALUES(title),
  description = VALUES(description),
  instructions = VALUES(instructions),
  cook_time = VALUES(cook_time),
  servings = VALUES(servings),
  category = VALUES(category),
  kcal = VALUES(kcal),
  difficulty = VALUES(difficulty),
  image_url = VALUES(image_url),
  is_featured = VALUES(is_featured),
  likes_count = VALUES(likes_count),
  updated_at = NOW();

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 133, id, 350, 'g' FROM ingredients WHERE name = 'Cá thu tươi cắt khúc'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 133 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Cá thu tươi cắt khúc' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 133, id, 2, 'nhánh' FROM ingredients WHERE name = 'Tiêu xanh nguyên chùm'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 133 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Tiêu xanh nguyên chùm' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 133, id, 1, 'củ' FROM ingredients WHERE name = 'Hành tây thái mỏng'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 133 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Hành tây thái mỏng' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 133, id, 30, 'g' FROM ingredients WHERE name = 'Thì là tươi'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 133 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Thì là tươi' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 133, id, 1, 'muỗng' FROM ingredients WHERE name = 'Dầu ô liu'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 133 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Dầu ô liu' LIMIT 1));

-- [eat-clean] Canh rong biển đậu hũ non nấm kim châm
INSERT INTO recipes (id, title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, is_featured, likes_count, created_at, updated_at)
VALUES (134, 'Canh rong biển đậu hũ non nấm kim châm', 'Nước canh thanh ngọt dịu dàng chuẩn vị dưỡng sinh Nhật Bản với rong biển Wakame giòn mát, đậu hũ non mềm mịn tan trong miệng.', '1. Rong biển Wakame ngâm nước lọc 5 phút cho nở bung rồi vớt ra cắt khúc vừa ăn.
2. Đậu hũ non cắt miếng vuông 2cm; nấm kim châm cắt bỏ gốc ngâm rửa sạch.
3. Đun sôi 800ml nước dùng rau củ cùng vài sợi gừng tươi khử tanh thanh lọc vị giác.
4. Thả đậu hũ non và nấm kim châm vào đun sôi nhẹ trong 3 phút.
5. Cho rong biển và hành boa-rô vào nồi, nêm chút hạt nêm chay rồi tắt bếp ngay.', 15, 15, 3, 'Việt Nam', 'eat-clean', 140, 28.5, 35.0, 14.2, 'Dễ', 'lunch,dinner', 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80', 0, 175, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  title = VALUES(title),
  description = VALUES(description),
  instructions = VALUES(instructions),
  cook_time = VALUES(cook_time),
  servings = VALUES(servings),
  category = VALUES(category),
  kcal = VALUES(kcal),
  difficulty = VALUES(difficulty),
  image_url = VALUES(image_url),
  is_featured = VALUES(is_featured),
  likes_count = VALUES(likes_count),
  updated_at = NOW();

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 134, id, 15, 'g' FROM ingredients WHERE name = 'Rong biển khô Wakame'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 134 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Rong biển khô Wakame' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 134, id, 1, 'phần' FROM ingredients WHERE name = 'Đậu hũ non'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 134 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Đậu hũ non' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 134, id, 100, 'g' FROM ingredients WHERE name = 'Nấm kim châm tươi'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 134 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Nấm kim châm tươi' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 134, id, 10, 'g' FROM ingredients WHERE name = 'Gừng tươi thái sợi'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 134 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Gừng tươi thái sợi' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 134, id, 20, 'g' FROM ingredients WHERE name = 'Hành boa-rô thái nhỏ'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 134 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Hành boa-rô thái nhỏ' LIMIT 1));

-- [eat-clean] Đậu phụ áp chảo sốt nấm hương đông cô
INSERT INTO recipes (id, title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, is_featured, likes_count, created_at, updated_at)
VALUES (135, 'Đậu phụ áp chảo sốt nấm hương đông cô', 'Từng lát đậu hũ vàng giòn vỏ bùi ruột tắm đẫm trong sốt nấm đông cô sánh mượt ngọt thơm thảo mộc tự nhiên.', '1. Đậu phụ ép ráo bớt nước, cắt lát vuông dày 2cm áp chảo vàng ươm hai mặt với chút dầu ô liu.
2. Nấm đông cô ngâm rửa sạch, khía chữ thập trên mũ nấm hoặc thái lát mỏng vừa ăn.
3. Phi thơm hành boa-rô, cho nấm vào xào chín với nước tương Tamari và chút tiêu xay.
4. Hòa bột bắp với nửa bát nước rót vào chảo nấm khuấy nhẹ tạo độ sánh sệt thơm lừng.
5. Xếp đậu phụ áp chảo ra đĩa sâu lòng, rưới đều sốt nấm đông cô nóng hổi lên trên mặt.', 15, 20, 2, 'Việt Nam', 'eat-clean', 220, 28.5, 35.0, 14.2, 'Dễ', 'lunch,dinner', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80', 0, 190, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  title = VALUES(title),
  description = VALUES(description),
  instructions = VALUES(instructions),
  cook_time = VALUES(cook_time),
  servings = VALUES(servings),
  category = VALUES(category),
  kcal = VALUES(kcal),
  difficulty = VALUES(difficulty),
  image_url = VALUES(image_url),
  is_featured = VALUES(is_featured),
  likes_count = VALUES(likes_count),
  updated_at = NOW();

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 135, id, 3, 'phần' FROM ingredients WHERE name = 'Đậu phụ trắng cứng'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 135 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Đậu phụ trắng cứng' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 135, id, 120, 'g' FROM ingredients WHERE name = 'Nấm đông cô tươi'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 135 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Nấm đông cô tươi' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 135, id, 2, 'muỗng' FROM ingredients WHERE name = 'Nước tương Tamari'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 135 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Nước tương Tamari' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 135, id, 1, 'muỗng' FROM ingredients WHERE name = 'Bột bắp (bột ngô)'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 135 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Bột bắp (bột ngô)' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 135, id, 20, 'g' FROM ingredients WHERE name = 'Hành hoa thái nhỏ'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 135 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Hành hoa thái nhỏ' LIMIT 1));

-- [eat-clean] Smoothie bowl chuối dâu hạt chia granola
INSERT INTO recipes (id, title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, is_featured, likes_count, created_at, updated_at)
VALUES (136, 'Smoothie bowl chuối dâu hạt chia granola', 'Tô sinh tố mát lạnh đặc mịn như kem từ chuối đông lạnh và quả mọng, phủ đầy granola yến mạch giòn rụm và dừa nạo ngọt bùi.', '1. Cho chuối đông lạnh cắt khúc, dâu tây và sữa hạt vào máy xay sinh tố công suất cao.
2. Xay nhuyễn mịn ở tốc độ cao đến khi hỗn hợp sánh đặc mịn màng như kem tươi mát lạnh.
3. Đổ sinh tố ra bát sứ nông lòng tạo bề mặt phẳng mịn.
4. Rải granola yến mạch giòn tan thành dải dọc trên mặt bát.
5. Rắc thêm hạt chia, dừa nạo và vài lát dâu tây tươi tạo điểm nhấn mắt nhìn hấp dẫn.', 15, 10, 1, 'Việt Nam', 'eat-clean', 310, 28.5, 35.0, 14.2, 'Dễ', 'lunch,dinner', 'https://images.unsplash.com/photo-1577805947697-89e18249d767?auto=format&fit=crop&w=800&q=80', 1, 340, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  title = VALUES(title),
  description = VALUES(description),
  instructions = VALUES(instructions),
  cook_time = VALUES(cook_time),
  servings = VALUES(servings),
  category = VALUES(category),
  kcal = VALUES(kcal),
  difficulty = VALUES(difficulty),
  image_url = VALUES(image_url),
  is_featured = VALUES(is_featured),
  likes_count = VALUES(likes_count),
  updated_at = NOW();

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 136, id, 2, 'quả' FROM ingredients WHERE name = 'Chuối tiêu chín đông lạnh'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 136 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Chuối tiêu chín đông lạnh' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 136, id, 100, 'g' FROM ingredients WHERE name = 'Dâu tây đông lạnh'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 136 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Dâu tây đông lạnh' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 136, id, 80, 'ml' FROM ingredients WHERE name = 'Sữa hạt không đường'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 136 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Sữa hạt không đường' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 136, id, 3, 'muỗng' FROM ingredients WHERE name = 'Granola yến mạch mật ong'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 136 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Granola yến mạch mật ong' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 136, id, 1, 'muỗng' FROM ingredients WHERE name = 'Hạt chia hữu cơ'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 136 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Hạt chia hữu cơ' LIMIT 1));

-- [nau-nhanh] Cơm rang dưa bò giòn hạt chuẩn phố cổ
INSERT INTO recipes (id, title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, is_featured, likes_count, created_at, updated_at)
VALUES (137, 'Cơm rang dưa bò giòn hạt chuẩn phố cổ', 'Cơm nguội rang vàng ươm săn giòn từng hạt quyện thịt bò xào dưa chua róc nước mềm ngọt, đượm khói chảo gang giòn rụm ngất ngây.', '1. Bóp đều cơm nguội với 2 lòng đỏ trứng gà và thìa nhỏ dầu ăn giúp hạt cơm bám trứng vàng đều.
2. Thịt bò xào nhanh tay lửa lớn cùng dưa chua và tỏi băm cho săn giòn rồi trút riêng ra đĩa.
3. Cho chảo gang lên bếp đun thật nóng mỡ gà, đổ cơm vào đảo liên tục lửa lớn cho hạt cơm săn nổ giòn tách tách.
4. Khi cơm săn vàng ruộm, đổ đĩa thịt bò dưa chua vào đảo chung thêm 2 phút cho quyện đều vị.
5. Múc cơm ra đĩa, rắc hành phi giòn tan và hạt tiêu xay thơm nồng.', 15, 20, 2, 'Việt Nam', 'nau-nhanh', 520, 28.5, 35.0, 14.2, 'Dễ', 'lunch,dinner', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80', 1, 430, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  title = VALUES(title),
  description = VALUES(description),
  instructions = VALUES(instructions),
  cook_time = VALUES(cook_time),
  servings = VALUES(servings),
  category = VALUES(category),
  kcal = VALUES(kcal),
  difficulty = VALUES(difficulty),
  image_url = VALUES(image_url),
  is_featured = VALUES(is_featured),
  likes_count = VALUES(likes_count),
  updated_at = NOW();

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 137, id, 400, 'g' FROM ingredients WHERE name = 'Cơm nguội khô ráo'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 137 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Cơm nguội khô ráo' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 137, id, 200, 'g' FROM ingredients WHERE name = 'Thịt bò thăn thái mỏng'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 137 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Thịt bò thăn thái mỏng' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 137, id, 150, 'g' FROM ingredients WHERE name = 'Dưa cải chua giòn'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 137 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Dưa cải chua giòn' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 137, id, 2, 'quả' FROM ingredients WHERE name = 'Lòng đỏ trứng gà'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 137 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Lòng đỏ trứng gà' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 137, id, 2, 'củ' FROM ingredients WHERE name = 'Hành tím băm'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 137 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Hành tím băm' LIMIT 1));

-- [nau-nhanh] Mì xào hải sản rau cải giòn sần sật
INSERT INTO recipes (id, title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, is_featured, likes_count, created_at, updated_at)
VALUES (138, 'Mì xào hải sản rau cải giòn sần sật', 'Sợi mì tôm hoặc mì trứng xào lửa lớn giữ trọn độ dai giòn, tôm mực tươi rói quyện cải ngọt xanh mướt đẫm sốt dầu hào thơm phức.', '1. Chần mì qua nước sôi 1 phút cho sợi tơi mềm, vớt ra xả nước lạnh rồi trộn thìa dầu ăn chống dính.
2. Xào chín tôm mực trên lửa lớn cùng chút tỏi băm và hạt tiêu rồi múc ra đĩa riêng.
3. Xào cải ngọt và cà rốt bào sợi chín tới giữ nguyên màu xanh giòn mát.
4. Cho mì vào chảo đảo xém cạnh, rưới sốt dầu hào pha hắc xì dầu đảo đều tay cho mì lên màu nâu óng.
5. Trút hải sản và rau vào chảo mì đảo đều 1 phút trên lửa cực lớn rồi tắt bếp.', 15, 18, 2, 'Việt Nam', 'nau-nhanh', 450, 28.5, 35.0, 14.2, 'Dễ', 'lunch,dinner', 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80', 0, 260, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  title = VALUES(title),
  description = VALUES(description),
  instructions = VALUES(instructions),
  cook_time = VALUES(cook_time),
  servings = VALUES(servings),
  category = VALUES(category),
  kcal = VALUES(kcal),
  difficulty = VALUES(difficulty),
  image_url = VALUES(image_url),
  is_featured = VALUES(is_featured),
  likes_count = VALUES(likes_count),
  updated_at = NOW();

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 138, id, 2, 'phần' FROM ingredients WHERE name = 'Mì gói hoặc mì trứng'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 138 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Mì gói hoặc mì trứng' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 138, id, 150, 'g' FROM ingredients WHERE name = 'Tôm sú bóc nõn'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 138 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Tôm sú bóc nõn' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 138, id, 150, 'g' FROM ingredients WHERE name = 'Mực ống cắt khoanh'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 138 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Mực ống cắt khoanh' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 138, id, 150, 'g' FROM ingredients WHERE name = 'Cải ngọt xanh'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 138 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Cải ngọt xanh' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 138, id, 2, 'muỗng' FROM ingredients WHERE name = 'Dầu hào & hắc xì dầu'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 138 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Dầu hào & hắc xì dầu' LIMIT 1));

-- [nau-nhanh] Trứng chiên thịt băm nấm hương hành hoa
INSERT INTO recipes (id, title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, is_featured, likes_count, created_at, updated_at)
VALUES (139, 'Trứng chiên thịt băm nấm hương hành hoa', 'Món ăn quốc dân thơm ngát nấm hương, trứng gà vàng phồng xốp mềm ẩm bọc thịt băm đậm đà cực kỳ hao cơm trong 15 phút.', '1. Nấm hương ngâm nở mềm, rửa sạch vắt ráo rồi băm thật nhuyễn.
2. Đập 4 quả trứng gà vào tô, cho thịt băm, nấm hương, hành hoa, nước mắm và tiêu xay.
3. Dùng đũa đánh thật kỹ và bông bọt cho hỗn hợp hòa quyện đều gia vị.
4. Đun nóng chảo dầu ăn, đổ toàn bộ hỗn hợp trứng vào rán lửa nhỏ vừa đậy nắp vung 3 phút.
5. Lật mặt trứng rán tiếp 2 phút cho chín vàng đều hai mặt thơm phưng phức.', 15, 15, 3, 'Việt Nam', 'nau-nhanh', 340, 28.5, 35.0, 14.2, 'Dễ', 'lunch,dinner', 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80', 0, 310, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  title = VALUES(title),
  description = VALUES(description),
  instructions = VALUES(instructions),
  cook_time = VALUES(cook_time),
  servings = VALUES(servings),
  category = VALUES(category),
  kcal = VALUES(kcal),
  difficulty = VALUES(difficulty),
  image_url = VALUES(image_url),
  is_featured = VALUES(is_featured),
  likes_count = VALUES(likes_count),
  updated_at = NOW();

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 139, id, 4, 'quả' FROM ingredients WHERE name = 'Trứng gà tươi'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 139 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Trứng gà tươi' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 139, id, 150, 'g' FROM ingredients WHERE name = 'Thịt nạc heo băm'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 139 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Thịt nạc heo băm' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 139, id, 20, 'g' FROM ingredients WHERE name = 'Nấm hương khô ngâm nở'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 139 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Nấm hương khô ngâm nở' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 139, id, 30, 'g' FROM ingredients WHERE name = 'Hành hoa thái nhỏ'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 139 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Hành hoa thái nhỏ' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 139, id, 1, 'muỗng' FROM ingredients WHERE name = 'Nước mắm ngon'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 139 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Nước mắm ngon' LIMIT 1));

-- [nau-nhanh] Đậu sốt cà chua hành lá nóng hổi
INSERT INTO recipes (id, title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, is_featured, likes_count, created_at, updated_at)
VALUES (140, 'Đậu sốt cà chua hành lá nóng hổi', 'Món ngon kinh điển với đậu phụ rán vàng giòn vỏ mềm ruột đẫm trong sốt cà chua sóng sánh thơm lừng hành hoa thái nhỏ.', '1. Đậu phụ cắt miếng vuông vừa ăn, rán trên chảo dầu nóng đến khi vàng giòn các mặt.
2. Cà chua thái múi cau; phi thơm hành khô rồi trút cà chua vào xào nhuyễn cùng thìa mắm.
3. Thêm nửa bát con nước đun sôi tạo thành hỗn hợp nước sốt cà chua sánh đỏ tự nhiên.
4. Thả đậu rán vào chảo sốt, hạ nhỏ lửa đun rim 5 phút cho đậu hút no nước sốt đậm đà.
5. Rắc thật nhiều hành lá thái nhỏ lên trên đảo nhẹ rồi múc ra đĩa ăn nóng với cơm.', 15, 15, 2, 'Việt Nam', 'nau-nhanh', 280, 28.5, 35.0, 14.2, 'Dễ', 'lunch,dinner', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80', 0, 220, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  title = VALUES(title),
  description = VALUES(description),
  instructions = VALUES(instructions),
  cook_time = VALUES(cook_time),
  servings = VALUES(servings),
  category = VALUES(category),
  kcal = VALUES(kcal),
  difficulty = VALUES(difficulty),
  image_url = VALUES(image_url),
  is_featured = VALUES(is_featured),
  likes_count = VALUES(likes_count),
  updated_at = NOW();

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 140, id, 3, 'phần' FROM ingredients WHERE name = 'Đậu phụ trắng'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 140 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Đậu phụ trắng' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 140, id, 3, 'quả' FROM ingredients WHERE name = 'Cà chua chín mọng'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 140 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Cà chua chín mọng' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 140, id, 40, 'g' FROM ingredients WHERE name = 'Hành lá & hành khô'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 140 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Hành lá & hành khô' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 140, id, 2, 'muỗng' FROM ingredients WHERE name = 'Nước mắm cốt'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 140 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Nước mắm cốt' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 140, id, 3, 'muỗng' FROM ingredients WHERE name = 'Dầu ăn thực vật'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 140 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Dầu ăn thực vật' LIMIT 1));

-- [nau-nhanh] Canh trứng cà chua rong biển thanh đạm
INSERT INTO recipes (id, title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, is_featured, likes_count, created_at, updated_at)
VALUES (141, 'Canh trứng cà chua rong biển thanh đạm', 'Món canh mây trứng bồng bềnh thanh nhẹ nấu siêu tốc trong 10 phút, vị chua ngọt thanh tao giải ngấy hoàn hảo cho ngày bận rộn.', '1. Xào cà chua bổ múi với chút dầu ăn và hành khô cho nhuyễn mềm ra màu nước canh đỏ cam đẹp mắt.
2. Đổ 700ml nước vào nồi đun sôi bùng, thả rong biển đã ngâm mềm vào nấu 2 phút.
3. Đánh tan 2 quả trứng gà trong bát con cùng xíu gia vị.
4. Khuấy tròn nồi canh theo một chiều, rót từ từ trứng qua đũa tạo thành các dải vân mây trứng mỏng đẹp mắt.
5. Tắt bếp ngay, rắc hành hoa thái nhỏ và vài giọt dầu mè thơm ngậy.', 15, 10, 3, 'Việt Nam', 'nau-nhanh', 120, 28.5, 35.0, 14.2, 'Dễ', 'lunch,dinner', 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80', 0, 180, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  title = VALUES(title),
  description = VALUES(description),
  instructions = VALUES(instructions),
  cook_time = VALUES(cook_time),
  servings = VALUES(servings),
  category = VALUES(category),
  kcal = VALUES(kcal),
  difficulty = VALUES(difficulty),
  image_url = VALUES(image_url),
  is_featured = VALUES(is_featured),
  likes_count = VALUES(likes_count),
  updated_at = NOW();

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 141, id, 2, 'quả' FROM ingredients WHERE name = 'Trứng gà tươi'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 141 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Trứng gà tươi' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 141, id, 2, 'quả' FROM ingredients WHERE name = 'Cà chua chín'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 141 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Cà chua chín' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 141, id, 10, 'g' FROM ingredients WHERE name = 'Rong biển nấu canh'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 141 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Rong biển nấu canh' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 141, id, 20, 'g' FROM ingredients WHERE name = 'Hành hoa & rau mùi'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 141 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Hành hoa & rau mùi' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 141, id, 1, 'muỗng' FROM ingredients WHERE name = 'Dầu mè thơm'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 141 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Dầu mè thơm' LIMIT 1));

-- [nau-nhanh] Bánh mì kẹp trứng ốp la pate bơ thơm
INSERT INTO recipes (id, title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, is_featured, likes_count, created_at, updated_at)
VALUES (142, 'Bánh mì kẹp trứng ốp la pate bơ thơm', 'Ổ bánh mì nóng giòn rụm kẹp đôi trứng ốp la lòng đào tan chảy, quyện pate gan béo ngậy, bơ thơm và dưa leo mát giòn rắc tiêu cay.', '1. Làm nóng chảo với chút bơ, ốp la 2 quả trứng gà lòng đào chảy ngậy rắc tiêu đen.
2. Bánh mì nướng lại trong nồi chiên không dầu 2 phút cho vỏ giòn rụm nóng bỏng tay.
3. Rạch dọc thân bánh mì, quết một lớp bơ thơm và lớp pate gan béo ngậy vào hai mặt ruột bánh.
4. Khéo léo kẹp 2 quả trứng ốp la vào giữa thân bánh mì.
5. Thêm vài lát dưa leo giòn mát, rau mùi tươi và rưới vài giọt tương ớt cay nồng.', 15, 10, 1, 'Việt Nam', 'nau-nhanh', 460, 28.5, 35.0, 14.2, 'Dễ', 'lunch,dinner', 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80', 0, 290, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  title = VALUES(title),
  description = VALUES(description),
  instructions = VALUES(instructions),
  cook_time = VALUES(cook_time),
  servings = VALUES(servings),
  category = VALUES(category),
  kcal = VALUES(kcal),
  difficulty = VALUES(difficulty),
  image_url = VALUES(image_url),
  is_featured = VALUES(is_featured),
  likes_count = VALUES(likes_count),
  updated_at = NOW();

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 142, id, 1, 'phần' FROM ingredients WHERE name = 'Bánh mì ổ giòn'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 142 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Bánh mì ổ giòn' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 142, id, 2, 'quả' FROM ingredients WHERE name = 'Trứng gà tươi'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 142 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Trứng gà tươi' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 142, id, 40, 'g' FROM ingredients WHERE name = 'Pate gan heo'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 142 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Pate gan heo' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 142, id, 15, 'g' FROM ingredients WHERE name = 'Bơ thực vật thơm'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 142 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Bơ thực vật thơm' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 142, id, 40, 'g' FROM ingredients WHERE name = 'Dưa leo & rau mùi'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 142 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Dưa leo & rau mùi' LIMIT 1));

-- [nau-nhanh] Cơm chiên kim chi xúc xích phô mai kéo sợi
INSERT INTO recipes (id, title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, is_featured, likes_count, created_at, updated_at)
VALUES (143, 'Cơm chiên kim chi xúc xích phô mai kéo sợi', 'Hạt cơm dẻo săn đẫm vị cay chua giòn sần sật của kim chi cải thảo, xúc xích áp chảo xém thơm phủ lớp phô mai Mozzarella béo ngậy kéo sợi dài.', '1. Phi thơm tỏi băm, cho xúc xích thái lát vào đảo xém cạnh rồi trút kim chi vào xào săn thơm.
2. Nêm 1 thìa tương ớt Gochujang và xíu đường cân bằng độ chua thanh của kim chi.
3. Trút cơm nguội vào chảo, dùng muôi dẹp miết tơi hạt cơm đảo đều tay trên lửa lớn 5 phút.
4. Gom cơm gọn lại giữa chảo, rải phô mai bào kín mặt trên rồi đậy vung hạ nhỏ lửa 2 phút cho phô mai tan chảy kéo sợi.
5. Rắc mè rang và rong biển vụn lên trên mặt phô mai rồi thưởng thức ngay trên chảo nóng.', 15, 18, 2, 'Việt Nam', 'nau-nhanh', 540, 28.5, 35.0, 14.2, 'Dễ', 'lunch,dinner', 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=800&q=80', 1, 390, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  title = VALUES(title),
  description = VALUES(description),
  instructions = VALUES(instructions),
  cook_time = VALUES(cook_time),
  servings = VALUES(servings),
  category = VALUES(category),
  kcal = VALUES(kcal),
  difficulty = VALUES(difficulty),
  image_url = VALUES(image_url),
  is_featured = VALUES(is_featured),
  likes_count = VALUES(likes_count),
  updated_at = NOW();

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 143, id, 350, 'g' FROM ingredients WHERE name = 'Cơm nguội'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 143 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Cơm nguội' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 143, id, 150, 'g' FROM ingredients WHERE name = 'Kim chi cải thảo thái nhỏ'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 143 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Kim chi cải thảo thái nhỏ' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 143, id, 2, 'phần' FROM ingredients WHERE name = 'Xúc xích Đức thái lát'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 143 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Xúc xích Đức thái lát' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 143, id, 80, 'g' FROM ingredients WHERE name = 'Phô mai Mozzarella bào'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 143 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Phô mai Mozzarella bào' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 143, id, 1, 'muỗng' FROM ingredients WHERE name = 'Tương ớt Hàn Quốc Gochujang'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 143 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Tương ớt Hàn Quốc Gochujang' LIMIT 1));

-- [nau-nhanh] Miến xào lòng gà giòn sần sật
INSERT INTO recipes (id, title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, is_featured, likes_count, created_at, updated_at)
VALUES (144, 'Miến xào lòng gà giòn sần sật', 'Sợi miến dong xào tơi mềm óng ả quyện lòng mề gà giòn sần sật, mộc nhĩ nấm hương bùi thơm và giá đỗ giòn ngọt.', '1. Lòng gà bóp muối làm sạch, thái mỏng ướp hành khô, tiêu và nước mắm ngon 15 phút.
2. Miến dong ngâm nước ấm cho mềm dai, cắt khúc vừa ăn rồi xóc với lòng trắng trứng hoặc chút dầu ăn.
3. Xào chín lòng gà trên lửa lớn cùng nấm hương mộc nhĩ rồi múc riêng ra đĩa.
4. Cho miến vào chảo đảo đều tay với chút nước dùng gà cho sợi miến nở trong veo mềm mướt.
5. Trút lòng gà, giá đỗ và hành răm vào chảo miến đảo nhanh 1 phút trên lửa to rồi rắc tiêu.', 15, 20, 2, 'Việt Nam', 'nau-nhanh', 390, 28.5, 35.0, 14.2, 'Dễ', 'lunch,dinner', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80', 0, 210, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  title = VALUES(title),
  description = VALUES(description),
  instructions = VALUES(instructions),
  cook_time = VALUES(cook_time),
  servings = VALUES(servings),
  category = VALUES(category),
  kcal = VALUES(kcal),
  difficulty = VALUES(difficulty),
  image_url = VALUES(image_url),
  is_featured = VALUES(is_featured),
  likes_count = VALUES(likes_count),
  updated_at = NOW();

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 144, id, 180, 'g' FROM ingredients WHERE name = 'Miến dong sạch'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 144 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Miến dong sạch' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 144, id, 200, 'g' FROM ingredients WHERE name = 'Lòng mề gan gà tươi'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 144 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Lòng mề gan gà tươi' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 144, id, 25, 'g' FROM ingredients WHERE name = 'Mộc nhĩ nấm hương'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 144 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Mộc nhĩ nấm hương' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 144, id, 100, 'g' FROM ingredients WHERE name = 'Giá đỗ tươi'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 144 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Giá đỗ tươi' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 144, id, 30, 'g' FROM ingredients WHERE name = 'Hành hoa & rau răm'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 144 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Hành hoa & rau răm' LIMIT 1));

-- [nau-nhanh] Mì tôm bò bắp cải xào tỏi
INSERT INTO recipes (id, title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, is_featured, likes_count, created_at, updated_at)
VALUES (145, 'Mì tôm bò bắp cải xào tỏi', 'Món ăn cứu đói thần thánh lúc đêm khuya với sợi mì tôm giòn dai thơm lừng xào cùng thịt bò mềm mọng và bắp cải giòn sần sật.', '1. Chần vắt mì qua nước sôi 45 giây cho sợi vừa tơi ra thì vớt ráo ngay.
2. Phi thơm nhiều tỏi băm với dầu ăn, trút thịt bò vào xào lửa lớn 1 phút vừa chín tới múc ra đĩa.
3. Cho bắp cải thái sợi vào chảo xào nhanh với gói muối mì tôm cho ngấm giòn ngọt.
4. Đổ mì và thịt bò vào chảo đảo đều tay trên lửa lớn cho sợi mì se giòn xém cạnh.
5. Thêm thìa tương ớt cay nồng đảo đều và thưởng thức ngay khi còn nóng hổi bốc khói.', 15, 12, 1, 'Việt Nam', 'nau-nhanh', 420, 28.5, 35.0, 14.2, 'Dễ', 'lunch,dinner', 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80', 0, 280, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  title = VALUES(title),
  description = VALUES(description),
  instructions = VALUES(instructions),
  cook_time = VALUES(cook_time),
  servings = VALUES(servings),
  category = VALUES(category),
  kcal = VALUES(kcal),
  difficulty = VALUES(difficulty),
  image_url = VALUES(image_url),
  is_featured = VALUES(is_featured),
  likes_count = VALUES(likes_count),
  updated_at = NOW();

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 145, id, 1, 'phần' FROM ingredients WHERE name = 'Mì tôm Hảo Hảo'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 145 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Mì tôm Hảo Hảo' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 145, id, 120, 'g' FROM ingredients WHERE name = 'Thịt bò thăn'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 145 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Thịt bò thăn' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 145, id, 100, 'g' FROM ingredients WHERE name = 'Bắp cải thái sợi'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 145 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Bắp cải thái sợi' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 145, id, 3, 'nhánh' FROM ingredients WHERE name = 'Tỏi băm nhuyễn'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 145 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Tỏi băm nhuyễn' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 145, id, 1, 'muỗng' FROM ingredients WHERE name = 'Tương ớt Chin-su'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 145 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Tương ớt Chin-su' LIMIT 1));

-- [nau-nhanh] Thịt băm xào bắp ngọt giòn ngậy
INSERT INTO recipes (id, title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, is_featured, likes_count, created_at, updated_at)
VALUES (146, 'Thịt băm xào bắp ngọt giòn ngậy', 'Hạt bắp mỹ vàng tươi giòn ngọt tự nhiên quyện thịt nạc băm xào hành tỏi thơm phức, món ăn bắt cơm siêu tốc cả người lớn lẫn trẻ nhỏ đều mê.', '1. Bắp ngọt chần qua nước sôi 1 phút rồi vớt ra ngâm nước lạnh cho giữ màu vàng tươi giòn ngọt.
2. Phi thơm hành tím với bơ lạt, cho thịt băm vào xào săn tơi đều các hạt thịt.
3. Nêm nước mắm ngon và hạt nêm đảo đều cho thịt ngấm gia vị đậm đà.
4. Trút hạt bắp ngọt vào xào chung trên lửa lớn trong 3 phút cho quyện đều vị bơ thịt thơm ngậy.
5. Rắc hành hoa thái nhỏ và hạt tiêu xay rồi tắt bếp, xúc ăn cùng cơm trắng nóng dẻo.', 15, 15, 3, 'Việt Nam', 'nau-nhanh', 330, 28.5, 35.0, 14.2, 'Dễ', 'lunch,dinner', 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80', 0, 230, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  title = VALUES(title),
  description = VALUES(description),
  instructions = VALUES(instructions),
  cook_time = VALUES(cook_time),
  servings = VALUES(servings),
  category = VALUES(category),
  kcal = VALUES(kcal),
  difficulty = VALUES(difficulty),
  image_url = VALUES(image_url),
  is_featured = VALUES(is_featured),
  likes_count = VALUES(likes_count),
  updated_at = NOW();

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 146, id, 250, 'g' FROM ingredients WHERE name = 'Thịt nạc vai băm'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 146 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Thịt nạc vai băm' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 146, id, 200, 'g' FROM ingredients WHERE name = 'Bắp ngọt (ngô ngọt) tách hạt'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 146 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Bắp ngọt (ngô ngọt) tách hạt' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 146, id, 30, 'g' FROM ingredients WHERE name = 'Hành tím & hành hoa'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 146 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Hành tím & hành hoa' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 146, id, 10, 'g' FROM ingredients WHERE name = 'Bơ lạt thơm'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 146 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Bơ lạt thơm' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 146, id, 1, 'muỗng' FROM ingredients WHERE name = 'Hạt nêm & nước mắm'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 146 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Hạt nêm & nước mắm' LIMIT 1));

-- [nau-nhanh] Trứng ốp la xúc xích sốt cà chua đậu đỏ
INSERT INTO recipes (id, title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, is_featured, likes_count, created_at, updated_at)
VALUES (147, 'Trứng ốp la xúc xích sốt cà chua đậu đỏ', 'Bữa ăn giàu đạm đầy đủ năng lượng với xúc xích nướng xém cạnh, trứng ốp lòng đào béo ngậy sốt cà chua quyện đậu đỏ đậm đà vị Âu.', '1. Khía xéo thân xúc xích, áp chảo với bơ lạt cho xém vàng thơm nức.
2. Ốp la 2 quả trứng gà lòng đào rắc chút muối tiêu trên mặt.
3. Đổ đậu đỏ sốt cà chua vào góc chảo đun sôi lăn tăn bốc khói.
4. Nướng vàng giòn 2 lát bánh mì sandwich trong chảo bơ nóng.
5. Bày tất cả nguyên liệu ra đĩa ăn kèm tương cà và nhâm nhi cùng tách cà phê sáng.', 15, 15, 1, 'Việt Nam', 'nau-nhanh', 430, 28.5, 35.0, 14.2, 'Dễ', 'lunch,dinner', 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80', 0, 190, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  title = VALUES(title),
  description = VALUES(description),
  instructions = VALUES(instructions),
  cook_time = VALUES(cook_time),
  servings = VALUES(servings),
  category = VALUES(category),
  kcal = VALUES(kcal),
  difficulty = VALUES(difficulty),
  image_url = VALUES(image_url),
  is_featured = VALUES(is_featured),
  likes_count = VALUES(likes_count),
  updated_at = NOW();

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 147, id, 2, 'quả' FROM ingredients WHERE name = 'Trứng gà tươi'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 147 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Trứng gà tươi' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 147, id, 2, 'phần' FROM ingredients WHERE name = 'Xúc xích xông khói'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 147 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Xúc xích xông khói' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 147, id, 100, 'g' FROM ingredients WHERE name = 'Đậu đỏ hầm sốt cà đóng hộp'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 147 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Đậu đỏ hầm sốt cà đóng hộp' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 147, id, 10, 'g' FROM ingredients WHERE name = 'Bơ lạt'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 147 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Bơ lạt' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 147, id, 2, 'phần' FROM ingredients WHERE name = 'Bánh mì lát sandwich'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 147 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Bánh mì lát sandwich' LIMIT 1));

-- [nau-nhanh] Canh cải ngọt nấu thịt nạc băm
INSERT INTO recipes (id, title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, is_featured, likes_count, created_at, updated_at)
VALUES (148, 'Canh cải ngọt nấu thịt nạc băm', 'Món canh thanh đạm giải nhiệt mát gan với nước dùng ngọt lịm từ thịt nạc băm và rau cải ngọt xanh mướt giòn sần sật chỉ mất 10 phút.', '1. Rau cải ngọt nhặt sạch gốc rễ, ngâm rửa sạch rồi cắt khúc 3-4cm vừa ăn.
2. Phi thơm hành tím với xíu dầu ăn, cho thịt băm vào xào săn cùng thìa mắm cho dậy mùi.
3. Đổ 800ml nước lọc vào nồi đun sôi bùng, vớt sạch bọt trắng cho nước canh trong veo.
4. Thả rau cải ngọt và nhánh gừng đập dập vào đun sôi bùng thêm 2 phút cho rau vừa chín tới giòn ngọt.
5. Nêm nếm lại gia vị cho vừa miệng rồi múc canh ra tô dùng nóng.', 15, 12, 3, 'Việt Nam', 'nau-nhanh', 150, 28.5, 35.0, 14.2, 'Dễ', 'lunch,dinner', 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80', 0, 170, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  title = VALUES(title),
  description = VALUES(description),
  instructions = VALUES(instructions),
  cook_time = VALUES(cook_time),
  servings = VALUES(servings),
  category = VALUES(category),
  kcal = VALUES(kcal),
  difficulty = VALUES(difficulty),
  image_url = VALUES(image_url),
  is_featured = VALUES(is_featured),
  likes_count = VALUES(likes_count),
  updated_at = NOW();

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 148, id, 300, 'g' FROM ingredients WHERE name = 'Rau cải ngọt non'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 148 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Rau cải ngọt non' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 148, id, 150, 'g' FROM ingredients WHERE name = 'Thịt heo nạc băm'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 148 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Thịt heo nạc băm' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 148, id, 2, 'củ' FROM ingredients WHERE name = 'Hành tím băm'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 148 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Hành tím băm' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 148, id, 1, 'nhánh' FROM ingredients WHERE name = 'Gừng tươi đập dập'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 148 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Gừng tươi đập dập' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 148, id, 1, 'muỗng' FROM ingredients WHERE name = 'Nước mắm truyền thống'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 148 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Nước mắm truyền thống' LIMIT 1));

-- [banh-trang-mieng] Chè sương sa hạt lựu cốt dừa béo ngậy
INSERT INTO recipes (id, title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, is_featured, likes_count, created_at, updated_at)
VALUES (149, 'Chè sương sa hạt lựu cốt dừa béo ngậy', 'Ly chè rực rỡ sắc màu với hạt lựu củ năng giòn sần sật bọc bột lọc dẻo dai, sương sa mát lạnh hòa quyện nước cốt dừa thơm béo ngậy.', '1. Ngâm củ năng hạt lựu vào nước cốt củ dền cho nhuộm màu đỏ hồng tự nhiên.
2. Áo đều bột năng quanh củ năng rồi luộc trong nước sôi đến khi hạt lựu nổi trong veo thì vớt ngâm nước đá.
3. Nấu nước cốt dừa cùng chút lá dứa, đường cát và xíu muối hạt cho sánh béo thơm lừng.
4. Cắt nhỏ thạch sương sáo và chuẩn bị đậu xanh đánh nhuyễn mịn màng.
5. Múc hạt lựu, sương sa, đậu xanh vào ly, rưới nước cốt dừa béo ngậy và thêm đá bào mát rượi.', 15, 35, 4, 'Việt Nam', 'banh-trang-mieng', 320, 28.5, 35.0, 14.2, 'Trung bình', 'snack', 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80', 1, 370, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  title = VALUES(title),
  description = VALUES(description),
  instructions = VALUES(instructions),
  cook_time = VALUES(cook_time),
  servings = VALUES(servings),
  category = VALUES(category),
  kcal = VALUES(kcal),
  difficulty = VALUES(difficulty),
  image_url = VALUES(image_url),
  is_featured = VALUES(is_featured),
  likes_count = VALUES(likes_count),
  updated_at = NOW();

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 149, id, 200, 'g' FROM ingredients WHERE name = 'Củ năng tươi thái hạt lựu'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 149 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Củ năng tươi thái hạt lựu' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 149, id, 150, 'g' FROM ingredients WHERE name = 'Bột năng nguyên chất'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 149 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Bột năng nguyên chất' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 149, id, 100, 'g' FROM ingredients WHERE name = 'Sương sáo đen/trắng'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 149 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Sương sáo đen/trắng' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 149, id, 250, 'ml' FROM ingredients WHERE name = 'Nước cốt dừa đậm đặc'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 149 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Nước cốt dừa đậm đặc' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 149, id, 50, 'ml' FROM ingredients WHERE name = 'Nước cốt củ dền tạo màu đỏ'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 149 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Nước cốt củ dền tạo màu đỏ' LIMIT 1));

-- [banh-trang-mieng] Bánh flan caramel cốt dừa mềm mịn
INSERT INTO recipes (id, title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, is_featured, likes_count, created_at, updated_at)
VALUES (150, 'Bánh flan caramel cốt dừa mềm mịn', 'Miếng bánh flan caramel trứng sữa mịn màng núng nính không hề có lỗ rỗ, ngập trong sốt caramel đắng nhẹ thơm bùi hương cốt dừa.', '1. Thắng đường cùng chút nước cốt chanh đến khi chuyển màu hổ phách thì rót đều dưới đáy hũ thủy tinh.
2. Khuấy nhẹ trứng gà với sữa tươi đun ấm, sữa đặc và nước cốt dừa theo một chiều không tạo bọt khí.
3. Lọc hỗn hợp trứng sữa qua rây 2 lần để hỗn hợp thật mịn màng không gợn cặn.
4. Rót nhẹ nhàng vào từng hũ caramel, dùng giấy bạc bọc kín miệng hũ.
5. Hấp cách thủy lửa thật nhỏ trong 30 phút hoặc nướng cách thủy ở 150 độ C, làm mát trước khi dùng.', 15, 40, 4, 'Việt Nam', 'banh-trang-mieng', 270, 28.5, 35.0, 14.2, 'Trung bình', 'snack', 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80', 1, 460, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  title = VALUES(title),
  description = VALUES(description),
  instructions = VALUES(instructions),
  cook_time = VALUES(cook_time),
  servings = VALUES(servings),
  category = VALUES(category),
  kcal = VALUES(kcal),
  difficulty = VALUES(difficulty),
  image_url = VALUES(image_url),
  is_featured = VALUES(is_featured),
  likes_count = VALUES(likes_count),
  updated_at = NOW();

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 150, id, 5, 'quả' FROM ingredients WHERE name = 'Trứng gà tươi'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 150 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Trứng gà tươi' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 150, id, 400, 'ml' FROM ingredients WHERE name = 'Sữa tươi không đường'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 150 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Sữa tươi không đường' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 150, id, 120, 'g' FROM ingredients WHERE name = 'Sữa đặc có đường'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 150 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Sữa đặc có đường' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 150, id, 80, 'g' FROM ingredients WHERE name = 'Đường thắng caramel'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 150 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Đường thắng caramel' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 150, id, 50, 'ml' FROM ingredients WHERE name = 'Nước cốt dừa thơm'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 150 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Nước cốt dừa thơm' LIMIT 1));

-- [banh-trang-mieng] Sữa chua dẻo trái cây nhiệt đới
INSERT INTO recipes (id, title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, is_featured, likes_count, created_at, updated_at)
VALUES (151, 'Sữa chua dẻo trái cây nhiệt đới', 'Từng miếng sữa chua dẻo dai mát lạnh cắt vuông vức hòa cùng sốt chanh leo, dâu tây mọng nước và kiwi chua ngọt thanh mát cực đã.', '1. Ngâm mềm lá gelatin trong nước đá lạnh 10 phút rồi vớt ráo vắt kiệt nước.
2. Đun ấm sữa tươi và sữa đặc, hòa tan gelatin vào khuấy đều cho tan hoàn toàn.
3. Trộn đều sữa chua vào hỗn hợp rồi đổ vào khuôn vuông lót màng bọc thực phẩm.
4. Để tủ mát 4-5 tiếng cho sữa chua đông dẻo đàn hồi rồi lấy ra cắt miếng vuông 2-3cm.
5. Xếp ra đĩa cùng các loại trái cây nhiệt đới, rắc bột cacao hoặc bột trà xanh lên trên.', 15, 20, 3, 'Việt Nam', 'banh-trang-mieng', 210, 28.5, 35.0, 14.2, 'Dễ', 'snack', 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80', 0, 320, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  title = VALUES(title),
  description = VALUES(description),
  instructions = VALUES(instructions),
  cook_time = VALUES(cook_time),
  servings = VALUES(servings),
  category = VALUES(category),
  kcal = VALUES(kcal),
  difficulty = VALUES(difficulty),
  image_url = VALUES(image_url),
  is_featured = VALUES(is_featured),
  likes_count = VALUES(likes_count),
  updated_at = NOW();

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 151, id, 300, 'g' FROM ingredients WHERE name = 'Sữa chua không đường'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 151 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Sữa chua không đường' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 151, id, 12, 'g' FROM ingredients WHERE name = 'Gelatin lá hữu cơ'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 151 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Gelatin lá hữu cơ' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 151, id, 60, 'g' FROM ingredients WHERE name = 'Sữa đặc'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 151 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Sữa đặc' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 151, id, 150, 'g' FROM ingredients WHERE name = 'Dâu tây & xoài chín'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 151 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Dâu tây & xoài chín' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 151, id, 1, 'muỗng' FROM ingredients WHERE name = 'Bột cacao nguyên chất'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 151 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Bột cacao nguyên chất' LIMIT 1));

-- [banh-trang-mieng] Tàu hũ trân châu đường đen nóng dẻo
INSERT INTO recipes (id, title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, is_featured, likes_count, created_at, updated_at)
VALUES (152, 'Tàu hũ trân châu đường đen nóng dẻo', 'Lớp tào phớ trắng muốt núng nính mềm tan trong miệng, ngập tràn trân châu đen dai dẻo đượm vị đường mía sẫm màu và gừng tươi ấm nồng.', '1. Xay đậu nành lọc lấy 1 lít sữa đậu nành nguyên chất đun sôi liu riu trong 10 phút.
2. Hòa đường nho với 1 thìa nước tráng quanh lòng nồi sứ, đổ dứt khoát sữa đậu nành nóng vào rồi đậy nắp ủ 30 phút.
3. Luộc trân châu đen trong 20 phút rồi ủ kín 20 phút cho trân châu nở dẻo dai.
4. Nấu đường nâu cùng gừng tươi và nửa bát nước cho keo sánh sền sệt thơm nức mùi mật mía.
5. Dùng muôi dẹp hớt từng lát tàu hũ mềm mượt vào bát, múc trân châu đường đen nóng dẻo chan lên trên.', 15, 30, 3, 'Việt Nam', 'banh-trang-mieng', 250, 28.5, 35.0, 14.2, 'Trung bình', 'snack', 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80', 0, 350, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  title = VALUES(title),
  description = VALUES(description),
  instructions = VALUES(instructions),
  cook_time = VALUES(cook_time),
  servings = VALUES(servings),
  category = VALUES(category),
  kcal = VALUES(kcal),
  difficulty = VALUES(difficulty),
  image_url = VALUES(image_url),
  is_featured = VALUES(is_featured),
  likes_count = VALUES(likes_count),
  updated_at = NOW();

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 152, id, 200, 'g' FROM ingredients WHERE name = 'Đậu nành hạt ngâm xay'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 152 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Đậu nành hạt ngâm xay' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 152, id, 100, 'g' FROM ingredients WHERE name = 'Đường nâu Hàn Quốc'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 152 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Đường nâu Hàn Quốc' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 152, id, 100, 'g' FROM ingredients WHERE name = 'Trân châu đen dẻo'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 152 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Trân châu đen dẻo' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 152, id, 3, 'g' FROM ingredients WHERE name = 'Đường nho hữu cơ'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 152 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Đường nho hữu cơ' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 152, id, 20, 'g' FROM ingredients WHERE name = 'Gừng tươi đập dập'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 152 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Gừng tươi đập dập' LIMIT 1));

-- [banh-trang-mieng] Chè bưởi An Giang giòn ngọt đậu xanh nước cốt dừa
INSERT INTO recipes (id, title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, is_featured, likes_count, created_at, updated_at)
VALUES (153, 'Chè bưởi An Giang giòn ngọt đậu xanh nước cốt dừa', 'Cùi bưởi giòn sần sật trong veo khử sạch tinh dầu đắng, đậu xanh hấp chín bở bùi quyện nước đường hoa bưởi thoang thoảng cốt dừa sánh béo.', '1. Cùi bưởi cắt hạt lựu bóp muối xả nước 6 lần khử sạch vị đắng ngâm nước đường phèn rồi áo bột năng.
2. Luộc cùi bưởi trong nước sôi đến khi cùi trong veo nổi lên thì vớt ngâm ngay âu nước đá cho giòn tan.
3. Đậu xanh ngâm nở đồ chín tới giữ nguyên hạt tròn vẹn không bị nát nhừ.
4. Nấu nước đường phèn hoa bưởi, xuống bột năng từ từ cho nước chè sánh mượt trong veo.
5. Trút cùi bưởi giòn và đậu xanh vào đảo đều, múc ra ly chan nước cốt dừa béo ngậy thơm lừng.', 15, 45, 4, 'Việt Nam', 'banh-trang-mieng', 290, 28.5, 35.0, 14.2, 'Khó', 'snack', 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80', 1, 410, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  title = VALUES(title),
  description = VALUES(description),
  instructions = VALUES(instructions),
  cook_time = VALUES(cook_time),
  servings = VALUES(servings),
  category = VALUES(category),
  kcal = VALUES(kcal),
  difficulty = VALUES(difficulty),
  image_url = VALUES(image_url),
  is_featured = VALUES(is_featured),
  likes_count = VALUES(likes_count),
  updated_at = NOW();

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 153, id, 250, 'g' FROM ingredients WHERE name = 'Cùi bưởi da xanh'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 153 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Cùi bưởi da xanh' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 153, id, 150, 'g' FROM ingredients WHERE name = 'Đậu xanh xát vỏ'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 153 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Đậu xanh xát vỏ' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 153, id, 120, 'g' FROM ingredients WHERE name = 'Bột năng'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 153 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Bột năng' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 153, id, 150, 'g' FROM ingredients WHERE name = 'Đường phèn'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 153 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Đường phèn' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 153, id, 200, 'ml' FROM ingredients WHERE name = 'Nước cốt dừa thơm béo'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 153 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Nước cốt dừa thơm béo' LIMIT 1));

-- [banh-trang-mieng] Chè chuối nướng nước cốt dừa Nam Bộ
INSERT INTO recipes (id, title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, is_featured, likes_count, created_at, updated_at)
VALUES (154, 'Chè chuối nướng nước cốt dừa Nam Bộ', 'Chuối xiêm chín bọc lớp nếp dẻo thơm cuộn lá chuối nướng cháy sém xém vàng, chan đẫm nước cốt dừa bột báng béo ngậy rắc đậu phộng thơm.', '1. Nếp dẻo nấu chín cùng nước cốt dừa và chút đường cho dẻo thơm ngậy.
2. Cán mỏng một lớp nếp bọc kín quanh quả chuối xiêm chín rồi cuộn ngoài bằng lá chuối tươi.
3. Nướng chuối trên than hồng hoặc nồi chiên không dầu đến khi lá chuối cháy xém và nếp vàng giòn rụm.
4. Nấu nước cốt dừa cùng bột báng, lá dứa và đường thốt nốt cho sánh mịn béo ngậy.
5. Cắt chuối nướng thành từng khoanh tròn ra đĩa, chan đẫm nước cốt dừa bột báng và rắc đậu phộng rang giã dập.', 15, 35, 3, 'Việt Nam', 'banh-trang-mieng', 340, 28.5, 35.0, 14.2, 'Trung bình', 'snack', 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80', 0, 280, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  title = VALUES(title),
  description = VALUES(description),
  instructions = VALUES(instructions),
  cook_time = VALUES(cook_time),
  servings = VALUES(servings),
  category = VALUES(category),
  kcal = VALUES(kcal),
  difficulty = VALUES(difficulty),
  image_url = VALUES(image_url),
  is_featured = VALUES(is_featured),
  likes_count = VALUES(likes_count),
  updated_at = NOW();

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 154, id, 4, 'quả' FROM ingredients WHERE name = 'Chuối xiêm chín ngọt'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 154 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Chuối xiêm chín ngọt' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 154, id, 250, 'g' FROM ingredients WHERE name = 'Nếp dẻo nấu cốt dừa'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 154 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Nếp dẻo nấu cốt dừa' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 154, id, 30, 'g' FROM ingredients WHERE name = 'Bột báng hạt nhỏ'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 154 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Bột báng hạt nhỏ' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 154, id, 200, 'ml' FROM ingredients WHERE name = 'Nước cốt dừa béo'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 154 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Nước cốt dừa béo' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 154, id, 3, 'muỗng' FROM ingredients WHERE name = 'Đậu phộng rang vàng'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 154 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Đậu phộng rang vàng' LIMIT 1));

-- [banh-trang-mieng] Bánh da lợn lá dứa đậu xanh dẻo dai
INSERT INTO recipes (id, title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, is_featured, likes_count, created_at, updated_at)
VALUES (155, 'Bánh da lợn lá dứa đậu xanh dẻo dai', 'Từng lớp bánh mỏng xen kẽ xanh thơm mùi lá dứa và vàng bùi đậu xanh cốt dừa, kết cấu dai mềm dẻo bóng óng ả ngọt ngào.', '1. Pha lớp xanh: Bột năng, bột gạo, đường, nước cốt dừa và nước cốt lá dứa tươi xay nhuyễn.
2. Pha lớp vàng: Xay nhuyễn đậu xanh chín cùng nước cốt dừa, bột năng và đường cát mịn.
3. Quét một lớp dầu mỏng vào khuôn bánh, làm nóng khuôn trong nồi hấp cách thủy.
4. Đổ lần lượt từng lớp mỏng: 1 lớp xanh hấp 5 phút chín trong thì đổ tiếp 1 lớp vàng hấp 5 phút.
5. Lặp lại các lớp cho đầy khuôn bánh, để bánh thật nguội trước khi dùng dao bọc màng thực phẩm cắt miếng ziczac.', 15, 40, 4, 'Việt Nam', 'banh-trang-mieng', 280, 28.5, 35.0, 14.2, 'Trung bình', 'snack', 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80', 0, 230, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  title = VALUES(title),
  description = VALUES(description),
  instructions = VALUES(instructions),
  cook_time = VALUES(cook_time),
  servings = VALUES(servings),
  category = VALUES(category),
  kcal = VALUES(kcal),
  difficulty = VALUES(difficulty),
  image_url = VALUES(image_url),
  is_featured = VALUES(is_featured),
  likes_count = VALUES(likes_count),
  updated_at = NOW();

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 155, id, 200, 'g' FROM ingredients WHERE name = 'Bột năng'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 155 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Bột năng' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 155, id, 50, 'g' FROM ingredients WHERE name = 'Bột gạo tẻ'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 155 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Bột gạo tẻ' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 155, id, 150, 'g' FROM ingredients WHERE name = 'Đậu xanh đãi vỏ nấu chín'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 155 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Đậu xanh đãi vỏ nấu chín' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 155, id, 100, 'ml' FROM ingredients WHERE name = 'Nước cốt lá dứa nguyên chất'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 155 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Nước cốt lá dứa nguyên chất' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 155, id, 250, 'ml' FROM ingredients WHERE name = 'Nước cốt dừa'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 155 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Nước cốt dừa' LIMIT 1));

-- [banh-trang-mieng] Bánh chuối nướng bơ sữa Nam Bộ
INSERT INTO recipes (id, title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, is_featured, likes_count, created_at, updated_at)
VALUES (156, 'Bánh chuối nướng bơ sữa Nam Bộ', 'Ổ bánh chuối nướng màu nâu đỏ cánh gián quyện bánh mì cũ ngâm sữa tươi và chuối chín ép, thơm lừng vị bơ Pháp và rượu rum nồng nàn.', '1. Chuối cắt lát ướp chút đường và 1 nắp rượu rum trong 30 phút cho lên men đỏ thẫm.
2. Xé nhỏ bánh mì ngâm trong hỗn hợp sữa tươi, nước cốt dừa, bơ chảy và sữa đặc 15 phút cho ngấu mềm.
3. Trộn 2/3 lượng chuối vào tô bánh mì bóp nhuyễn vừa phải thành khối bột dẻo mịn.
4. Quét bơ lót giấy nến vào khuôn, đổ hỗn hợp bánh vào khuôn và xếp 1/3 lát chuối còn lại lên bề mặt trang trí.
5. Nướng ở 175 độ C trong 60 phút đến khi mặt bánh se vàng sậm màu cánh gián thơm ngào ngạt.', 15, 60, 6, 'Việt Nam', 'banh-trang-mieng', 310, 28.5, 35.0, 14.2, 'Khó', 'snack', 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80', 0, 290, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  title = VALUES(title),
  description = VALUES(description),
  instructions = VALUES(instructions),
  cook_time = VALUES(cook_time),
  servings = VALUES(servings),
  category = VALUES(category),
  kcal = VALUES(kcal),
  difficulty = VALUES(difficulty),
  image_url = VALUES(image_url),
  is_featured = VALUES(is_featured),
  likes_count = VALUES(likes_count),
  updated_at = NOW();

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 156, id, 6, 'quả' FROM ingredients WHERE name = 'Chuối sứ chín rục'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 156 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Chuối sứ chín rục' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 156, id, 150, 'g' FROM ingredients WHERE name = 'Bánh mì cũ xé nhỏ'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 156 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Bánh mì cũ xé nhỏ' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 156, id, 250, 'ml' FROM ingredients WHERE name = 'Sữa tươi không đường'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 156 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Sữa tươi không đường' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 156, id, 150, 'ml' FROM ingredients WHERE name = 'Nước cốt dừa thơm'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 156 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Nước cốt dừa thơm' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 156, id, 40, 'g' FROM ingredients WHERE name = 'Bơ lạt đun chảy'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 156 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Bơ lạt đun chảy' LIMIT 1));

-- [banh-trang-mieng] Trà sữa trân châu đường đen phô mai kem mặn
INSERT INTO recipes (id, title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, is_featured, likes_count, created_at, updated_at)
VALUES (157, 'Trà sữa trân châu đường đen phô mai kem mặn', 'Cốt trà đen đậm vị thơm ngát hòa sữa tươi thanh trùng, trân châu nấu đường mật ấm dẻo phủ lớp kem phô mai Macchiato mằn mặn béo ngậy.', '1. Ủ trà đen với 250ml nước sôi ở 90 độ C trong 12 phút rồi lọc bỏ bã trà lấy cốt trà thơm đậm.
2. Đánh bông nhẹ hỗn hợp kem gồm cream cheese mềm, whipping cream, xíu sữa đặc và muối biển.
3. Nấu trân châu đen với đường mía sẫm màu cho trân châu ấm dẻo keo sánh đường.
4. Múc trân châu đường đen quanh thành ly tạo vệt vân hổ bắt mắt rồi rót sữa tươi và cốt trà.
5. Rót lớp kem phô mai mặn béo ngậy lên trên miệng ly và thưởng thức ngay không cần khuấy.', 15, 20, 2, 'Việt Nam', 'banh-trang-mieng', 380, 28.5, 35.0, 14.2, 'Dễ', 'snack', 'https://images.unsplash.com/photo-1558857563-b371033873b8?auto=format&fit=crop&w=800&q=80', 0, 450, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  title = VALUES(title),
  description = VALUES(description),
  instructions = VALUES(instructions),
  cook_time = VALUES(cook_time),
  servings = VALUES(servings),
  category = VALUES(category),
  kcal = VALUES(kcal),
  difficulty = VALUES(difficulty),
  image_url = VALUES(image_url),
  is_featured = VALUES(is_featured),
  likes_count = VALUES(likes_count),
  updated_at = NOW();

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 157, id, 20, 'g' FROM ingredients WHERE name = 'Trà đen nguyên lá (Black Tea)'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 157 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Trà đen nguyên lá (Black Tea)' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 157, id, 300, 'ml' FROM ingredients WHERE name = 'Sữa tươi thanh trùng Dalatmilk'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 157 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Sữa tươi thanh trùng Dalatmilk' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 157, id, 100, 'g' FROM ingredients WHERE name = 'Trân châu đường đen dẻo'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 157 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Trân châu đường đen dẻo' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 157, id, 50, 'g' FROM ingredients WHERE name = 'Cream cheese phô mai'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 157 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Cream cheese phô mai' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 157, id, 80, 'ml' FROM ingredients WHERE name = 'Whipping cream kem sữa tươi'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 157 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Whipping cream kem sữa tươi' LIMIT 1));

-- [banh-trang-mieng] Thạch dừa tươi hoa quả thạch rau câu
INSERT INTO recipes (id, title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, is_featured, likes_count, created_at, updated_at)
VALUES (158, 'Thạch dừa tươi hoa quả thạch rau câu', 'Trái dừa xiêm tươi mát với lớp thạch nước dừa thanh ngọt trong veo, bên trên phủ lớp thạch cốt dừa béo trắng muốt điểm xuyết hoa quả giòn ngọt.', '1. Chặt phần đầu quả dừa lấy nước dừa tươi nguyên chất (khoảng 800ml), giữ lại vỏ dừa làm khuôn.
2. Trộn đều bột rau câu dẻo với đường phèn khô cho không bị vón cục khi nấu.
3. Đun sôi nước dừa, từ từ khuấy bột rau câu vào nấu sôi lăn tăn trong 3 phút cho thạch trong veo.
4. Rót 3/4 lượng thạch nước dừa vào hai trái dừa, thả trái cây thái nhỏ vào để se mặt trong 15 phút.
5. Phần thạch còn lại khuấy cùng nước cốt dừa rót phủ kín mặt trên, bảo quản tủ lạnh 2 tiếng cho đông mát lạnh.', 15, 25, 2, 'Việt Nam', 'banh-trang-mieng', 180, 28.5, 35.0, 14.2, 'Trung bình', 'snack', 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80', 0, 240, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  title = VALUES(title),
  description = VALUES(description),
  instructions = VALUES(instructions),
  cook_time = VALUES(cook_time),
  servings = VALUES(servings),
  category = VALUES(category),
  kcal = VALUES(kcal),
  difficulty = VALUES(difficulty),
  image_url = VALUES(image_url),
  is_featured = VALUES(is_featured),
  likes_count = VALUES(likes_count),
  updated_at = NOW();

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 158, id, 2, 'quả' FROM ingredients WHERE name = 'Quả dừa xiêm tươi'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 158 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Quả dừa xiêm tươi' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 158, id, 10, 'g' FROM ingredients WHERE name = 'Bột rau câu dẻo Jelly'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 158 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Bột rau câu dẻo Jelly' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 158, id, 80, 'ml' FROM ingredients WHERE name = 'Nước cốt dừa thơm'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 158 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Nước cốt dừa thơm' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 158, id, 50, 'g' FROM ingredients WHERE name = 'Đường phèn xay mịn'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 158 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Đường phèn xay mịn' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 158, id, 60, 'g' FROM ingredients WHERE name = 'Trái cây thái hạt lựu'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 158 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Trái cây thái hạt lựu' LIMIT 1));

-- [banh-trang-mieng] Chè đậu xanh nha đam đường phèn thanh nhiệt
INSERT INTO recipes (id, title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, is_featured, likes_count, created_at, updated_at)
VALUES (159, 'Chè đậu xanh nha đam đường phèn thanh nhiệt', 'Nước chè thanh mát ngọt dịu của đường phèn kết hợp đậu xanh ninh bở bùi và miếng nha đam giòn sần sật khử nhớt sạch sẽ giải nhiệt ngày hè.', '1. Nha đam gọt sạch vỏ xanh ngâm nước muối chanh xả nhớt 5 lần, thái hạt lựu chần nước sôi rồi ngâm nước đá cho giòn tan.
2. Đậu xanh đãi sạch ngâm nước ấm 30 phút rồi cho vào nồi ninh cùng lá dứa đến khi hạt đậu nở bở bùi.
3. Cho đường phèn vào nồi chè khuấy tan đun nhỏ lửa 5 phút cho đậu xanh ngấm vị ngọt thanh.
4. Trút toàn bộ nha đam giòn vào nồi chè đun sôi bùng lại rồi tắt bếp ngay tránh làm nhũn nha đam.
5. Để nguội cho vào ngăn mát tủ lạnh, múc ra bát thưởng thức thanh mát giải nhiệt độc cơ thể.', 15, 30, 4, 'Việt Nam', 'banh-trang-mieng', 220, 28.5, 35.0, 14.2, 'Trung bình', 'snack', 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80', 0, 260, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  title = VALUES(title),
  description = VALUES(description),
  instructions = VALUES(instructions),
  cook_time = VALUES(cook_time),
  servings = VALUES(servings),
  category = VALUES(category),
  kcal = VALUES(kcal),
  difficulty = VALUES(difficulty),
  image_url = VALUES(image_url),
  is_featured = VALUES(is_featured),
  likes_count = VALUES(likes_count),
  updated_at = NOW();

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 159, id, 300, 'g' FROM ingredients WHERE name = 'Nha đam tươi bẹ to'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 159 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Nha đam tươi bẹ to' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 159, id, 150, 'g' FROM ingredients WHERE name = 'Đậu xanh nguyên hạt'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 159 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Đậu xanh nguyên hạt' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 159, id, 120, 'g' FROM ingredients WHERE name = 'Đường phèn thanh ngọt'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 159 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Đường phèn thanh ngọt' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 159, id, 4, 'nhánh' FROM ingredients WHERE name = 'Lá dứa (lá nếp)'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 159 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Lá dứa (lá nếp)' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 159, id, 1, 'quả' FROM ingredients WHERE name = 'Chanh tươi vắt cốt'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 159 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Chanh tươi vắt cốt' LIMIT 1));

-- [banh-trang-mieng] Bánh rán lúc lắc mè vừng nhân đậu xanh
INSERT INTO recipes (id, title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, is_featured, likes_count, created_at, updated_at)
VALUES (160, 'Bánh rán lúc lắc mè vừng nhân đậu xanh', 'Vỏ bánh vàng ươm giòn rụm phủ kín mè rang thơm ngát, viên nhân đậu xanh ngọt bùi lắc lục cục bên trong rỗng xốp cực kỳ vui tai.', '1. Nhồi bột nếp, bột tẻ, khoai tây nghiền và chút đường cùng nước ấm thành khối bột dẻo mịn không dính tay.
2. Đậu xanh sên đường và dừa sợi vo tròn thành từng viên nhân nhỏ bằng quả quất.
3. Dàn mỏng bột bánh, bọc kín viên nhân sao cho có một khoảng trống nhỏ ở giữa rồi vo tròn thật khéo.
4. Lăn bánh qua đĩa mè trắng ấn nhẹ cho hạt mè bám chắc vào vỏ bánh.
5. Rán bánh ngập dầu lửa nhỏ vừa, dùng đũa đảo tròn liên tục cho bánh nở phồng to vàng ruộm lắc nghe lục cục.', 15, 35, 4, 'Việt Nam', 'banh-trang-mieng', 310, 28.5, 35.0, 14.2, 'Trung bình', 'snack', 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80', 0, 310, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  title = VALUES(title),
  description = VALUES(description),
  instructions = VALUES(instructions),
  cook_time = VALUES(cook_time),
  servings = VALUES(servings),
  category = VALUES(category),
  kcal = VALUES(kcal),
  difficulty = VALUES(difficulty),
  image_url = VALUES(image_url),
  is_featured = VALUES(is_featured),
  likes_count = VALUES(likes_count),
  updated_at = NOW();

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 160, id, 200, 'g' FROM ingredients WHERE name = 'Bột nếp thơm'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 160 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Bột nếp thơm' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 160, id, 30, 'g' FROM ingredients WHERE name = 'Bột gạo tẻ'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 160 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Bột gạo tẻ' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 160, id, 50, 'g' FROM ingredients WHERE name = 'Khoai tây nghiền mịn'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 160 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Khoai tây nghiền mịn' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 160, id, 150, 'g' FROM ingredients WHERE name = 'Đậu xanh sên dừa ngọt'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 160 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Đậu xanh sên dừa ngọt' LIMIT 1));
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 160, id, 60, 'g' FROM ingredients WHERE name = 'Mè trắng (vừng)'
AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = 160 AND ingredient_id = (SELECT id FROM ingredients WHERE name = 'Mè trắng (vừng)' LIMIT 1));

SET FOREIGN_KEY_CHECKS = 1;
