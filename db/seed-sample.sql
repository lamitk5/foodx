SET NAMES utf8mb4;
USE foodx;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS post_likes;
DROP TABLE IF EXISTS post_comments;
DROP TABLE IF EXISTS recipe_posts;
DROP TABLE IF EXISTS saved_recipes;
DROP TABLE IF EXISTS fridge_stock;
DROP TABLE IF EXISTS recipe_ingredients;
DROP TABLE IF EXISTS recipes;
DROP TABLE IF EXISTS ingredients;
DROP TABLE IF EXISTS foods;
DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- ===================== USERS =====================
CREATE TABLE users (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    username    VARCHAR(50)  NOT NULL UNIQUE,
    email       VARCHAR(100) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    full_name   VARCHAR(100),
    avatar_url  VARCHAR(500),
    role        VARCHAR(20)  NOT NULL,
    created_at  DATETIME,
    updated_at  DATETIME
); 

INSERT INTO users (username, email, password, full_name, avatar_url, role, created_at, updated_at) VALUES
('minhanh', 'minhanh@foodx.vn',   '$2a$10$hdW4xu/fl0vOy80.9Poc6.4YGO.FywFhI8ohnO3X4fSwxJJwQOxlu', 'Minh Anh',       NULL, 'USER',  NOW(), NOW()),
('thao',    'thao@foodx.vn',      '$2a$10$PEJBTgz6Q2X6mGpsMJSjBOlZ8hFpgJaC.EUBZsO39vMofdVtSGVAq', 'Thu Thao',       NULL, 'USER',  NOW(), NOW()),
('lam',     'lam@foodx.vn',       '$2a$10$kas1gNPS8IfJHFW4IrM3v.fOdQ7lMXi5L0BlQAKHDAQp5CfTjNaji', 'Nguyen Son Lam', NULL, 'ADMIN', NOW(), NOW()),
('hao',     'hao@foodx.vn',       '$2a$10$hdW4xu/fl0vOy80.9Poc6.4YGO.FywFhI8ohnO3X4fSwxJJwQOxlu', 'Hoang Hao',      NULL, 'USER',  NOW(), NOW());

-- ===================== PROFILES =====================
CREATE TABLE profiles (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id           BIGINT NOT NULL UNIQUE,
    gender            VARCHAR(20),
    age               INTEGER,
    weight_kg         DOUBLE,
    height_cm         DOUBLE,
    target_weight_kg  DOUBLE,
    activity          DOUBLE,
    diet              VARCHAR(100),
    allergies         TEXT,
    dislikes          TEXT,
    created_at        DATETIME,
    updated_at        DATETIME,
    CONSTRAINT fk_profiles_user FOREIGN KEY (user_id) REFERENCES users(id)
);

INSERT INTO profiles (user_id, gender, age, weight_kg, height_cm, target_weight_kg, activity, diet, allergies, dislikes, created_at, updated_at) VALUES
(1, 'Nữ',   22, 50, 160, 48, 1.375, 'Ăn kiêng low-carb', 'Đậu phộng, tôm',  'Hành sống',        NOW(), NOW()),
(2, 'Nữ',   20, 48, 158, 48, 1.2,   'Ăn linh tinh',     NULL,               'Cần tây',          NOW(), NOW()),
(3, 'Nam',  22, 65, 172, 60, 1.55,  'Tăng cơ',          'NULL',             NULL,               NOW(), NOW()),
(4, 'Nam',  23, 70, 175, 68, 1.375, 'Ăn linh tinh',     'Cá',               'Đậu phộng',        NOW(), NOW());

-- ===================== FOODS (catalog tủ lạnh) =====================
CREATE TABLE foods (
    id                    BIGINT AUTO_INCREMENT PRIMARY KEY,
    source_key            VARCHAR(100) UNIQUE,
    name                  VARCHAR(150) NOT NULL,
    type                  VARCHAR(50)  NOT NULL,
    kcal                  DOUBLE,
    protein               DOUBLE,
    carb                  DOUBLE,
    fat                   DOUBLE,
    components            TEXT,
    benefit               VARCHAR(150),
    image_url             VARCHAR(1000),
    default_quantity      DOUBLE,
    unit                  VARCHAR(30),
    default_expiry_days   INTEGER,
    custom_food           BOOLEAN,
    created_at            DATETIME
);

INSERT INTO foods (source_key, name, type, kcal, protein, carb, fat, components, benefit, image_url, default_quantity, unit, default_expiry_days, custom_food, created_at) VALUES
('egg',      'Trứng gà',     'Nguyên liệu', 70,  6.3,  0.4, 4.8,  'Protein cao, vitamin D, choline',          'Giàu protein, tốt cho cơ bắp',  'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=700&q=85', 6,   'quả', 14, FALSE, NOW()),
('chicken',  'Ức gà',        'Nguyên liệu', 165, 31,   0,   3.6,  'Đạm cao, ít béo, sắt, kẽm',                'Tăng cơ, kiểm soát cân nặng',   'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=700&q=85', 450, 'g',    4,  FALSE, NOW()),
('beef',     'Thịt bò',      'Nguyên liệu', 250, 26,   0,   15,   'Đạm, sắt hema, vitamin B6, B12',           'Bổ máu, phát triển cơ bắp',     'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&w=700&q=85', 300, 'g',    5,  FALSE, NOW()),
('pork',     'Thịt heo',     'Nguyên liệu', 242, 27,   0,   14,   'Vitamin B1, kẽm, phốt pho',                'Giàu năng lượng, thơm ngon',    'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=700&q=85', 400, 'g',    5,  FALSE, NOW()),
('salmon',   'Cá hồi',       'Nguyên liệu', 208, 20,   0,   13,   'Axit béo Omega-3, DHA, vitamin D',         'Tốt cho tim mạch và trí não',   'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=700&q=85', 300, 'g',    4,  FALSE, NOW()),
('shrimp',   'Tôm tươi',     'Nguyên liệu', 99,  24,   0.2, 0.3,  'Canxi, đạm, iot, selen',                   'Chắc xương, ít béo',            'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=700&q=85', 300, 'g',    3,  FALSE, NOW()),
('tomato',   'Cà chua',      'Rau Củ',      22,  0.9,  3.9, 0.2,  'Nước, lycopene, vitamin C, kali',          'Đẹp da, chống oxy hoá',         'https://images.unsplash.com/photo-1546470427-e5ac89cd0b31?auto=format&fit=crop&w=700&q=85', 4,   'quả',  7,  FALSE, NOW()),
('broccoli', 'Bông cải xanh','Rau Củ',      34,  2.8,  6.6, 0.4,  'Chất xơ, vitamin C, vitamin K',            'Thanh lọc cơ thể, ít calo',     'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=700&q=85', 250, 'g',    6,  FALSE, NOW()),
('carrot',   'Cà rốt',       'Rau Củ',      41,  0.9,  9.6, 0.2,  'Beta-carotene, vitamin A, chất xơ',        'Tốt cho thị lực, miễn dịch',    'https://images.unsplash.com/photo-1447175008436-170170753e16?auto=format&fit=crop&w=700&q=85', 3,   'củ',   14, FALSE, NOW()),
('potato',   'Khoai tây',    'Rau Củ',      77,  2,    17,  0.1,  'Tinh bột kháng, kali, vitamin B6',         'Bổ sung năng lượng lành mạnh',  'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=700&q=85', 4,   'củ',   21, FALSE, NOW()),
('shallot',  'Hành tím',     'Gia vị',      40,  1.1,  9.3, 0.1,  'Flavonoid, hợp chất lưu huỳnh',            'Kháng viêm, tăng hương vị',     'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=700&q=85', 5,   'củ',   30, FALSE, NOW()),
('garlic',   'Tỏi',          'Gia vị',      149, 6.4,  33,  0.5,  'Allicin, chất chống oxy hóa',              'Tăng cường miễn dịch, tiêu hoá','https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?auto=format&fit=crop&w=700&q=85', 3,   'củ',   45, FALSE, NOW()),
('ginger',   'Gừng tươi',    'Gia vị',      80,  1.8,  18,  0.8,  'Gingerol, tinh dầu gừng',                  'Ấm bụng, giảm viêm, chống cảm', 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=700&q=85', 2,   'củ',   30, FALSE, NOW()),
('milk',     'Sữa tươi',     'Nguyên liệu', 120, 8,    12,  5,    'Canxi, vitamin D, protein casein',         'Chắc khỏe xương và răng',       'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=700&q=85', 1,   'lít',  7,  FALSE, NOW()),
('yogurt',   'Sữa chua',     'Nguyên liệu', 95,  10,   3.6, 0.4,  'Men vi sinh Probiotic, protein',           'Hỗ trợ tiêu hóa đường ruột',    'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=700&q=85', 4,   'hộp',  10, FALSE, NOW()),
('avocado',  'Quả bơ',       'Trái Cây',    160, 2,    8.5, 14.7, 'Chất béo không bão hòa đơn, kali',        'Tốt cho tim mạch, no lâu',      'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=700&q=85', 2,   'quả',  5,  FALSE, NOW()),
('banana',   'Chuối',        'Trái Cây',    89,  1.1,  22.8,0.3,  'Kali, carbohydrate phức hợp',              'Bổ sung năng lượng tức thì',    'https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&w=700&q=85', 5,   'quả',  6,  FALSE, NOW()),
('rice',     'Cơm trắng',    'Nguyên liệu', 130, 2.7,  28,  0.3,  'Carbohydrate, tinh bột',                   'Nguồn tinh bột chính bữa ăn',   'https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=700&q=85', 500, 'g',    3,  FALSE, NOW()),
('tofu',     'Đậu hũ',       'Nguyên liệu', 76,  8,    2,   4.5,  'Protein thực vật, isoflavone',             'Đạm thực vật thanh đạm',        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=700&q=85', 2,   'hộp',  5,  FALSE, NOW()),
('cheese',   'Phô mai',      'Nguyên liệu', 402, 25,   1.3, 33,   'Canxi, chất béo, protein',                 'Giàu năng lượng, béo thơm',     'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=700&q=85', 200, 'g',    30, FALSE, NOW());

-- ===================== INGREDIENTS =====================
CREATE TABLE ingredients (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    name                VARCHAR(100) NOT NULL UNIQUE,
    default_unit        VARCHAR(20),
    category            VARCHAR(50),
    calories_per_unit   DOUBLE,
    description         VARCHAR(500),
    created_at          DATETIME,
    updated_at          DATETIME
);

INSERT INTO ingredients (name, default_unit, category, calories_per_unit, description, created_at, updated_at) VALUES
('Trứng gà',    'quả',   'Thịt - Trứng', 78,  '1 quả trứng gà ~ 50g',                    NOW(), NOW()),
('Thịt gà',     'g',     'Thịt',         165, 'Thịt đùi/cánh, 100g',                     NOW(), NOW()),
('Gạo trắng',   'g',     'Tinh bột',     130, 'Gạo nấu cơm',                             NOW(), NOW()),
('Cà chua',     'quả',   'Rau Củ',       18,  'Cà chua bi hoặc cà chua thường',          NOW(), NOW()),
('Hành tím',    'củ',    'Gia vị',       40,  'Phi thơm',                                NOW(), NOW()),
('Tỏi',         'tép',   'Gia vị',       4,   'Băm nhuyễn',                              NOW(), NOW()),
('Dầu ăn',      'muỗng', 'Gia vị',       120, 'Dầu thực vật',                            NOW(), NOW()),
('Nước tương',  'muỗng', 'Gia vị',       10,  'Xì dầu',                                  NOW(), NOW()),
('Thịt heo',    'g',     'Thịt',         242, 'Thịt ba chỉ hoặc nạc',                    NOW(), NOW()),
('Cá hồi',      'g',     'Hải Sản',      208, 'Phi lê cá hồi',                           NOW(), NOW()),
('Bông cải xanh','g',    'Rau Củ',       34,  'Bông cải xanh',                           NOW(), NOW()),
('Khoai tây',   'g',     'Rau Củ',       77,  'Khoai tây mới',                           NOW(), NOW()),
('Sữa tươi',    'ml',    'Sữa',          61,  'Sữa tươi tiệt trùng',                    NOW(), NOW()),
('Chuối',       'quả',   'Trái Cây',     89,  'Chuối tiêu chín',                        NOW(), NOW()),
('Đậu hũ',      'g',     'Đậu',          76,  'Đậu hũ non',                              NOW(), NOW()),
('Gừng',        'củ',    'Gia vị',       80,  'Gừng già',                                NOW(), NOW());

-- ===================== RECIPES =====================
CREATE TABLE recipes (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    title         VARCHAR(200) NOT NULL,
    description   TEXT,
    instructions  TEXT,
    prep_time     INTEGER,
    cook_time     INTEGER,
    servings      INTEGER,
    cuisine       VARCHAR(100),
    category      VARCHAR(100),
    kcal          INTEGER,
    protein       DOUBLE,
    carb          DOUBLE,
    fat           DOUBLE,
    difficulty    VARCHAR(30),
    meal_slots    TEXT,
    image_url     VARCHAR(500),
    source_url    VARCHAR(500),
    author_id     BIGINT,
    created_at    DATETIME,
    updated_at    DATETIME,
    CONSTRAINT fk_recipes_author FOREIGN KEY (author_id) REFERENCES users(id)
);

INSERT INTO recipes (title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, source_url, author_id, created_at, updated_at) VALUES
('Cơm chiên trứng kiểu Việt', 'Món cơm chiên nhanh gọn với trứng, hành tím và cơm nguội.', 'Bước 1: Đập 2 quả trứng ra bát, đánh tan.\nBước 2: Phi thơm hành tím và tỏi băm với dầu.\nBước 3: Đổ trứng vào xào sơ cho chín tới.\nBước 4: Cho cơm nguội vào, đảo đều tay, nêm nước tương.\nBước 5: Nêm nếm lại rồi tắt bếp, dọn ra đĩa.', 10, 10, 2, 'Việt Nam', 'Món chính', 350, 12, 45, 14, 'Dễ', 'morning,lunch,dinner', '/uploads/recipe/com-chien-trung.png', NULL, 1, NOW(), NOW()),
('Gà kho gừng', 'Gà kho đậm đà với gừng, thơm cùng cơm nóng.', 'Bước 1: Ướp gà với nước tương, gừng, tiêu 15 phút.\nBước 2: Phi thơm gừng, cho gà vào đảo săn.\nBước 3: Thêm nước ướp, kho lửa nhỏ 20 phút tới khi sệt.\nBước 4: Nêm lại theo khẩu vị, thêm tiêu rồi dọn ra đĩa.', 15, 30, 3, 'Việt Nam', 'Món chính', 420, 35, 10, 28, 'Trung bình', 'lunch,dinner', '/uploads/recipe/ga-kho-gung.png', NULL, 3, NOW(), NOW()),
('Cá hồi áp chảo bông cải', 'Bữa tối healthy với cá hồi và bông cải xanh.', 'Bước 1: Ướp cá hồi với muối tiêu 10 phút.\nBước 2: Luộc/sau đó áp chảo bông cải xanh 3 phút.\nBước 3: Áp chảo cá hồi mỗi mặt 3-4 phút lửa vừa.\nBước 4: Dọn cá hồi cùng bông cải, rưới nước sốt chanh.', 10, 15, 1, 'Nhật', 'Healthy', 380, 40, 12, 20, 'Trung bình', 'dinner', '/uploads/recipe/ca-hoi-ap-chao.png', NULL, 2, NOW(), NOW());

-- ===================== RECIPE INGREDIENTS =====================
CREATE TABLE recipe_ingredients (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipe_id      BIGINT NOT NULL,
    ingredient_id  BIGINT NOT NULL,
    quantity       DOUBLE NOT NULL,
    unit           VARCHAR(20),
    note           VARCHAR(200),
    CONSTRAINT fk_ri_recipe FOREIGN KEY (recipe_id) REFERENCES recipes(id),
    CONSTRAINT fk_ri_ingredient FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit, note) VALUES
(1, 1, 2, 'quả',   'Trứng gà'),
(1, 3, 300, 'g',    'Cơm nguội'),
(1, 5, 1, 'củ',     NULL),
(1, 6, 2, 'tép',    NULL),
(1, 7, 1, 'muỗng',  NULL),
(1, 8, 1, 'muỗng',  'Nước tương'),
(2, 2, 500, 'g',    'Đùi hoặc cánh'),
(2, 8, 2, 'muỗng',  NULL),
(2, 16, 30, 'g',    'Gừng tươi'),
(3, 10, 150, 'g',   'Phi lê cá hồi'),
(3, 11, 200, 'g',   'Bông cải xanh'),
(3, 4, 1, 'quả',    'Trang trí');

-- ===================== SAVED RECIPES =====================
CREATE TABLE saved_recipes (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT NOT NULL,
    recipe_id  BIGINT NOT NULL,
    saved_at   DATETIME,
    CONSTRAINT uk_saved UNIQUE (user_id, recipe_id),
    CONSTRAINT fk_saved_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_saved_recipe FOREIGN KEY (recipe_id) REFERENCES recipes(id)
);

INSERT INTO saved_recipes (user_id, recipe_id, saved_at) VALUES
(2, 1, NOW()),
(2, 2, NOW()),
(4, 1, NOW());

-- ===================== FRIDGE STOCK =====================
CREATE TABLE fridge_stock (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT NOT NULL,
    food_id     BIGINT NOT NULL,
    quantity    DOUBLE NOT NULL,
    unit        VARCHAR(30) NOT NULL,
    expires_at  DATE,
    note        TEXT,
    created_at  DATETIME,
    updated_at  DATETIME,
    CONSTRAINT fk_fs_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_fs_food FOREIGN KEY (food_id) REFERENCES foods(id)
);

INSERT INTO fridge_stock (user_id, food_id, quantity, unit, expires_at, note, created_at, updated_at) VALUES
-- User 1 (Minh Anh)
(1, 1,  10,  'quả', DATE_ADD(CURDATE(), INTERVAL 12 DAY), 'Trứng gà Ba Huân mua tại WinMart',           NOW(), NOW()),
(1, 2,  450, 'g',   DATE_ADD(CURDATE(), INTERVAL 2 DAY),  'Ức gà để ngăn mát, cần nấu sớm',             NOW(), NOW()),
(1, 3,  500, 'g',   DATE_ADD(CURDATE(), INTERVAL 4 DAY),  'Bảo quản ngăn mát 2°C làm bò xào',           NOW(), NOW()),
(1, 5,  300, 'g',   DATE_ADD(CURDATE(), INTERVAL 3 DAY),  'Phi lê cá hồi Nauy tươi',                    NOW(), NOW()),
(1, 7,  4,   'quả', DATE_ADD(CURDATE(), INTERVAL 1 DAY),  'Cà chua chín mềm, làm canh hoặc sốt',        NOW(), NOW()),
(1, 8,  250, 'g',   DATE_ADD(CURDATE(), INTERVAL 5 DAY),  'Bông cải đã rửa sạch để ráo',                NOW(), NOW()),
(1, 9,  3,   'củ',  DATE_ADD(CURDATE(), INTERVAL 10 DAY), 'Bảo quản ngăn rau củ',                       NOW(), NOW()),
(1, 10, 4,   'củ',  DATE_ADD(CURDATE(), INTERVAL 18 DAY), 'Bảo quản nơi khô ráo thoáng mát',            NOW(), NOW()),
(1, 14, 1,   'lít', DATE_ADD(CURDATE(), INTERVAL 1 DAY),  'Sữa tươi thanh trùng mở nắp hôm qua',        NOW(), NOW()),
(1, 15, 4,   'hộp', DATE_ADD(CURDATE(), INTERVAL 8 DAY),  'Sữa chua không đường ăn sáng',               NOW(), NOW()),
(1, 16, 2,   'quả', DATE_ADD(CURDATE(), INTERVAL 3 DAY),  'Quả bơ sáp 034 Đắk Lắk',                     NOW(), NOW()),
(1, 17, 5,   'quả', DATE_ADD(CURDATE(), INTERVAL 2 DAY),  'Chuối tiêu chín tự nhiên',                   NOW(), NOW()),
(1, 18, 400, 'g',   DATE_ADD(CURDATE(), INTERVAL 2 DAY),  'Cơm nguội dùng chiên cơm',                   NOW(), NOW()),
(1, 19, 2,   'hộp', DATE_ADD(CURDATE(), INTERVAL 4 DAY),  'Đậu hũ non nấu canh rong biển',              NOW(), NOW()),
(1, 11, 5,   'củ',  DATE_ADD(CURDATE(), INTERVAL 25 DAY), 'Hành tím phi thơm',                          NOW(), NOW()),
(1, 12, 3,   'củ',  DATE_ADD(CURDATE(), INTERVAL 40 DAY), 'Tỏi Hải Dương',                              NOW(), NOW()),
(1, 4,  200, 'g',   DATE_SUB(CURDATE(), INTERVAL 1 DAY),  'Thịt heo xay bảo quản ngăn mát - đã quá hạn',NOW(), NOW()),

-- User 2 (Thu Thảo)
(2, 1,  6,   'quả', DATE_ADD(CURDATE(), INTERVAL 10 DAY), 'Trứng gà ta',                               NOW(), NOW()),
(2, 5,  400, 'g',   DATE_ADD(CURDATE(), INTERVAL 2 DAY),  'Cá hồi áp chảo tối nay',                     NOW(), NOW()),
(2, 7,  3,   'quả', DATE_ADD(CURDATE(), INTERVAL 4 DAY),  'Cà chua bi',                                 NOW(), NOW()),
(2, 8,  300, 'g',   DATE_ADD(CURDATE(), INTERVAL 3 DAY),  'Bông cải xanh organic',                      NOW(), NOW()),
(2, 14, 1,   'lít', DATE_ADD(CURDATE(), INTERVAL 1 DAY),  'Sữa tươi tiệt trùng',                        NOW(), NOW()),
(2, 16, 2,   'quả', DATE_ADD(CURDATE(), INTERVAL 4 DAY),  'Bơ làm sinh tố',                             NOW(), NOW()),

-- User 3 (Nguyễn Sơn Lâm)
(3, 2,  600, 'g',   DATE_ADD(CURDATE(), INTERVAL 3 DAY),  'Ức gà tăng cơ',                              NOW(), NOW()),
(3, 3,  500, 'g',   DATE_ADD(CURDATE(), INTERVAL 5 DAY),  'Thịt bò nạc',                                NOW(), NOW()),
(3, 1,  12,  'quả', DATE_ADD(CURDATE(), INTERVAL 15 DAY), 'Trứng gà ăn theo chế độ gym',               NOW(), NOW()),
(3, 6,  400, 'g',   DATE_ADD(CURDATE(), INTERVAL 2 DAY),  'Tôm sú tươi hấp bia',                        NOW(), NOW()),
(3, 15, 6,   'hộp', DATE_ADD(CURDATE(), INTERVAL 7 DAY),  'Sữa chua Hy Lạp giàu đạm',                   NOW(), NOW()),

-- User 4 (Hoàng Hảo)
(4, 4,  500, 'g',   DATE_ADD(CURDATE(), INTERVAL 4 DAY),  'Thịt ba chỉ luộc',                           NOW(), NOW()),
(4, 7,  4,   'quả', DATE_ADD(CURDATE(), INTERVAL 2 DAY),  'Cà chua sốt đậu',                            NOW(), NOW()),
(4, 19, 3,   'hộp', DATE_ADD(CURDATE(), INTERVAL 3 DAY),  'Đậu hũ rán vàng',                            NOW(), NOW()),
(4, 18, 500, 'g',   DATE_ADD(CURDATE(), INTERVAL 3 DAY),  'Gạo ngon Tám Thơm',                          NOW(), NOW());

-- ===================== RECIPE POSTS (mạng xã hội) =====================
CREATE TABLE recipe_posts (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    author_id    BIGINT NOT NULL,
    title        VARCHAR(150) NOT NULL,
    description  TEXT,
    ingredients  TEXT,
    instructions TEXT,
    image_url    VARCHAR(1000),
    created_at   DATETIME,
    updated_at   DATETIME,
    CONSTRAINT fk_posts_author FOREIGN KEY (author_id) REFERENCES users(id)
);

INSERT INTO recipe_posts (author_id, title, description, ingredients, instructions, image_url, created_at, updated_at) VALUES
(1, 'Món cơm chiên trứng cho bữa sáng', 'Hôm nay mình chia sẻ món cơm chiên trứng cực nhanh cho bữa sáng bận rộn.', 'Trứng, cơm nguội, hành tím, dầu ăn', 'Đánh tan trứng, phi hành, cho cơm vào đảo đều, nêm nước tương.', '/uploads/post/com-chien.png', NOW(), NOW()),
(3, 'Bí quyết gà kho gừng ngon đúng điệu', 'Đã test nhiều lần, công thức này đậm đà chuẩn vị.', 'Gà, gừng, nước tương, tiêu', 'Ướp gà 15 phút, kho lửa nhỏ đến khi nước sệt.', '/uploads/post/ga-kho.png', NOW(), NOW()),
(2, 'Salad cá hồi cho người giảm cân', 'Nhẹ nhàng, đủ chất, dễ làm.', 'Cá hồi, rau xà lách, bông cải xanh, chanh', 'Áp chảo cá hồi, trộn rau và bông cải luộc.', '/uploads/post/salad-ca-hoi.png', NOW(), NOW());

-- ===================== POST COMMENTS =====================
CREATE TABLE post_comments (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT NOT NULL,
    post_id     BIGINT NOT NULL,
    content     TEXT NOT NULL,
    created_at  DATETIME,
    CONSTRAINT fk_comments_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_comments_post FOREIGN KEY (post_id) REFERENCES recipe_posts(id)
);

INSERT INTO post_comments (user_id, post_id, content, created_at) VALUES
(2, 1, 'Ngon quá, mình sẽ thử ngay!',             NOW()),
(4, 1, 'Cảm ơn đã chia sẻ công thức!',            NOW()),
(1, 2, 'Bí quyết kho hay lắm. Thanks!',           NOW()),
(3, 3, 'Mình đang giảm cân, công thức này hợp.',  NOW());

-- ===================== POST LIKES =====================
CREATE TABLE post_likes (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT NOT NULL,
    post_id     BIGINT NOT NULL,
    created_at  DATETIME,
    CONSTRAINT uk_post_likes UNIQUE (user_id, post_id),
    CONSTRAINT fk_likes_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_likes_post FOREIGN KEY (post_id) REFERENCES recipe_posts(id)
);

INSERT INTO post_likes (user_id, post_id, created_at) VALUES
(2, 1, NOW()),
(3, 1, NOW()),
(4, 1, NOW()),
(1, 2, NOW()),
(4, 2, NOW()),
(3, 3, NOW());