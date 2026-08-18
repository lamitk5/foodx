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
('egg',      'Trứng gà',     'Nguyên liệu', 155, 13,   1,   11,   'Protein cao, vitamin D',          'Giàu protein, tốt cho cơ bắp',  '/uploads/food/egg.png',      1,   'quả', 21, FALSE, NOW()),
('chicken',  'Thịt gà',      'Nguyên liệu', 239, 27,   0,   14,   'Đạm, sắt, kẽm',                   'Ít béo, giàu đạm',              '/uploads/food/chicken.png',  1,   'kg',   5, FALSE, NOW()),
('rice',     'Gạo trắng',    'Nguyên liệu', 130, 2.7,  28,  0.3,  'Tinh bột',                        'Cung cấp năng lượng',           '/uploads/food/rice.png',     1,   'kg', 365, FALSE, NOW()),
('tomato',   'Cà chua',      'Rau Củ',      18,  0.9,  3.9, 0.2,  'Vitamin C, lycopene',             'Tốt cho da và tim mạch',        '/uploads/food/tomato.png',   1,   'kg',   7, FALSE, NOW()),
('shallot',  'Hành tím',     'Gia vị',      40,  1.1,  9.3, 0.1,  'Flavonoid',                       'Chống oxy hóa',                 '/uploads/food/shallot.png',  1,   'kg',  30, FALSE, NOW()),
('pork',     'Thịt heo',     'Nguyên liệu', 242, 27,   0,   14,   'Vitamin B, kẽm',                  'Đậm đà, giàu năng lượng',       '/uploads/food/pork.png',     1,   'kg',   5, FALSE, NOW()),
('salmon',   'Cá hồi',       'Nguyên liệu', 208, 20,   0,   13,   'Omega-3',                         'Tốt cho tim và não',            '/uploads/food/salmon.png',   1,   'kg',   5, FALSE, NOW()),
('broccoli', 'Bông cải xanh','Rau Củ',      34,  2.8,  6.6, 0.4,  'Xơ, vitamin K, vitamin C',        'Giàu chất xơ, ít calo',         '/uploads/food/broccoli.png', 1,   'kg',   7, FALSE, NOW()),
('potato',   'Khoai tây',    'Rau Củ',      77,  2,    17,  0.1,  'Tinh bột, kali',                  'Bổ sung năng lượng',            '/uploads/food/potato.png',   1,   'kg',  14, FALSE, NOW()),
('milk',     'Sữa tươi',     'Nguyên liệu', 61,  3.2,  4.8, 3.3,  'Canxi, protein',                  'Tốt cho xương',                 '/uploads/food/milk.png',     1,   'lít',  7, FALSE, NOW()),
('banana',   'Chuối',        'Nguyên liệu', 89,  1.1,  22.8,0.3,  'Kali, vitamin B6',                'Năng lượng nhanh',              '/uploads/food/banana.png',   1,   'kg',   7, FALSE, NOW()),
('tofu',     'Đậu hũ',       'Nguyên liệu', 76,  8,    2,   4.5,  'Protein thực vật',                'Thay thế thịt',                 '/uploads/food/tofu.png',     1,   'kg',   5, FALSE, NOW());

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
(1, 1,  12, 'quả', DATE_ADD(CURDATE(), INTERVAL 8 DAY),  'Mua hôm chợ',                 NOW(), NOW()),
(1, 6,  1,  'kg',  DATE_ADD(CURDATE(), INTERVAL 3 DAY),  NULL,                          NOW(), NOW()),
(1, 3,  5,  'kg',  DATE_ADD(CURDATE(), INTERVAL 60 DAY), 'Gạo đỏ hữu cơ',               NOW(), NOW()),
(2, 9,  2,  'kg',  DATE_ADD(CURDATE(), INTERVAL 10 DAY), NULL,                          NOW(), NOW()),
(2, 8,  1,  'kg',  DATE_ADD(CURDATE(), INTERVAL 6 DAY),  'Rau organic',                 NOW(), NOW()),
(3, 7,  0.5,'kg',  DATE_ADD(CURDATE(), INTERVAL 4 DAY),  'Cá hồi Nauy',                NOW(), NOW()),
(3, 10, 2,  'lít', DATE_ADD(CURDATE(), INTERVAL 7 DAY),  NULL,                          NOW(), NOW()),
(4, 2,  1,  'kg',  DATE_ADD(CURDATE(), INTERVAL 5 DAY),  'Gà ta',                       NOW(), NOW()),
(4, 12, 1,  'kg',  DATE_ADD(CURDATE(), INTERVAL 3 DAY),  'Đậu hũ non',                  NOW(), NOW());

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