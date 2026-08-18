-- =============================================================
-- FoodX - Dữ liệu mẫu (Seed Data)
-- =============================================================

-- ---------- users ----------
INSERT INTO users (username, email, password, full_name, role) VALUES
('dangnhap', 'demo@foodx.com',  '$2a$10$hashedplaceholder', 'Người Dùng Demo', 'USER'),
('admin',     'admin@foodx.com', '$2a$10$hashedplaceholder', 'Quản Trị Viên',    'ADMIN');

-- ---------- ingredients ----------
INSERT INTO ingredients (name, default_unit, category, calories_per_unit, description) VALUES
('Hành tím',   'củ',  'Rau củ',  40.0, 'Hành tím tươi'),
('Tỏi',        'củ',  'Gia vị',  4.0,  'Tỏi ta'),
('Ớt chuông',  'trái','Rau củ',  26.0, 'Ớt chuông đỏ'),
('Cà chua',    'trái','Rau củ',  18.0, 'Cà chua chín'),
('Thịt bò',    'kg',  'Thịt',    250.0,'Thịt bò thăn'),
('Cá hồi',     'kg',  'Hải sản', 208.0,'Cá hồi Đại Tây Dương'),
('Trứng gà',   'quả', 'Gia vị',  73.0, 'Trứng gà ta'),
('Cơm',        'tô',  'Tinh bột',206.0,'Cơm trắng'),
('Bánh phở',   'kg',  'Tinh bột',110.0,'Bánh phở tươi'),
('Rau thơm',   'bó',  'Rau củ',  25.0, 'Các loại rau thơm');

-- ---------- fridge_items (nguyên liệu trong tủ lạnh) ----------
-- ADMIN có user_id = 2
INSERT INTO fridge_items (user_id, name, category, quantity, unit, image_url, note, expiry_date) VALUES
(2, 'Thịt bò thăn',   'Thịt',       2.5, 'kg',   NULL, 'Bảo quản ngăn mát',  DATEADD('DAY', 10, CURRENT_DATE)),
(2, 'Cá hồi',         'Hải Sản',    4.0, 'lbs',  NULL, NULL,                 DATEADD('DAY', 5, CURRENT_DATE)),
(2, 'Măng tây',       'Rau Củ',     3.0, 'bó',   NULL, NULL,                 DATEADD('DAY', 30, CURRENT_DATE)),
(2, 'Hành tím',       'Gia Vị',     0.8, 'kg',   NULL, NULL,                 DATEADD('DAY', 60, CURRENT_DATE)),
(2, 'Cà chua',        'Rau Củ',     1.5, 'kg',   NULL, 'Dùng món xào',       DATEADD('DAY', -2, CURRENT_DATE));

-- ---------- shopping_lists & items ----------
INSERT INTO shopping_lists (user_id, name) VALUES
(2, 'Chợ cuối tuần');

INSERT INTO shopping_list_items (shopping_list_id, ingredient_name, quantity, unit, bought) VALUES
(1, 'Trứng gà',  12, 'quả', FALSE),
(1, 'Bánh phở',  2,  'kg',  TRUE),
(1, 'Rau thơm',  3,  'bó',  FALSE);

-- ---------- recipes ----------
INSERT INTO recipes (user_id, title, description, instructions, prep_time, cook_time, servings, cuisine, category) VALUES
(2, 'Phở bò', 'Món ăn truyền thống Việt Nam',
 'Ninh xương, nấu nước dùng với gừng nướng và hành tây...',
 30, 120, 4, 'Việt Nam', 'Món chính'),
(2, 'Cơm chiên trứng', 'Món đơn giản cho bữa sáng',
 'Đánh trứng, phi hành, cho cơm vào chiên...',
 5, 10, 1, 'Việt Nam', 'Món chính');

-- ---------- recipe_ingredients ----------
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, note) VALUES
(1, 'Bánh phở',   500, 'g',   'Loại tươi'),
(1, 'Thịt bò',    300, 'g',   'Thái lát mỏng'),
(1, 'Hành tím',   2,   'củ',  NULL),
(2, 'Cơm',        2,   'tô',  'Cơm nguội'),
(2, 'Trứng gà',   2,   'quả', NULL);

-- ---------- saved_recipes ----------
INSERT INTO saved_recipes (user_id, recipe_id) VALUES
(2, 1),
(2, 2);

-- ---------- meal_plans & items ----------
INSERT INTO meal_plans (user_id, start_date, end_date, note) VALUES
(2, DATEADD('DAY', -1, CURRENT_DATE), DATEADD('DAY', 6, CURRENT_DATE), 'Kế hoạch tuần 1');

INSERT INTO meal_plan_items (meal_plan_id, recipe_id, day_number, meal_type, portions) VALUES
(1, 1, 1, 'TRUA', 4),
(1, 2, 1, 'SANG', 1);

-- ---------- user_allergies ----------
INSERT INTO user_allergies (user_id, ingredient_id) VALUES
(2, 10); -- dị ứng rau thơm
