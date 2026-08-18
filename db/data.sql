-- =============================================================
-- FoodX - Dữ liệu mẫu (Seed Data cho H2 & MySQL)
-- =============================================================

-- ---------- users ----------
INSERT INTO users (username, email, password, full_name, role, created_at, updated_at) VALUES
('minhanh',  'minhanh@foodx.vn', '$2a$10$hdW4xu/fl0vOy80.9Poc6.4YGO.FywFhI8ohnO3X4fSwxJJwQOxlu', 'Minh Anh',       'USER',  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('dangnhap', 'demo@foodx.com',   '$2a$10$hdW4xu/fl0vOy80.9Poc6.4YGO.FywFhI8ohnO3X4fSwxJJwQOxlu', 'Người Dùng Demo','USER',  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('admin',    'admin@foodx.com',  '$2a$10$hdW4xu/fl0vOy80.9Poc6.4YGO.FywFhI8ohnO3X4fSwxJJwQOxlu', 'Quản Trị Viên',  'ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('thao',     'thao@foodx.vn',    '$2a$10$hdW4xu/fl0vOy80.9Poc6.4YGO.FywFhI8ohnO3X4fSwxJJwQOxlu', 'Thu Thảo',       'USER',  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('lam',      'lam@foodx.vn',     '$2a$10$hdW4xu/fl0vOy80.9Poc6.4YGO.FywFhI8ohnO3X4fSwxJJwQOxlu', 'Nguyễn Sơn Lâm', 'ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ---------- foods (Catalog thực phẩm) ----------
INSERT INTO foods (source_key, name, type, kcal, protein, carb, fat, components, benefit, image_url, default_quantity, unit, default_expiry_days, custom_food, created_at) VALUES
('egg',      'Trứng gà',     'Nguyên liệu', 70,  6.3,  0.4, 4.8,  'Protein cao, vitamin D, choline',          'Giàu protein, tốt cho cơ bắp',  'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=700&q=85', 6,   'quả', 14, FALSE, CURRENT_TIMESTAMP),
('chicken',  'Ức gà',        'Nguyên liệu', 165, 31,   0,   3.6,  'Đạm cao, ít béo, sắt, kẽm',                'Tăng cơ, kiểm soát cân nặng',   'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=700&q=85', 450, 'g',    4,  FALSE, CURRENT_TIMESTAMP),
('beef',     'Thịt bò',      'Nguyên liệu', 250, 26,   0,   15,   'Đạm, sắt hema, vitamin B6, B12',           'Bổ máu, phát triển cơ bắp',     'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&w=700&q=85', 300, 'g',    5,  FALSE, CURRENT_TIMESTAMP),
('pork',     'Thịt heo',     'Nguyên liệu', 242, 27,   0,   14,   'Vitamin B1, kẽm, phốt pho',                'Giàu năng lượng, thơm ngon',    'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=700&q=85', 400, 'g',    5,  FALSE, CURRENT_TIMESTAMP),
('salmon',   'Cá hồi',       'Nguyên liệu', 208, 20,   0,   13,   'Axit béo Omega-3, DHA, vitamin D',         'Tốt cho tim mạch và trí não',   'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=700&q=85', 300, 'g',    4,  FALSE, CURRENT_TIMESTAMP),
('shrimp',   'Tôm tươi',     'Nguyên liệu', 99,  24,   0.2, 0.3,  'Canxi, đạm, iot, selen',                   'Chắc xương, ít béo',            'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=700&q=85', 300, 'g',    3,  FALSE, CURRENT_TIMESTAMP),
('tomato',   'Cà chua',      'Rau Củ',      22,  0.9,  3.9, 0.2,  'Nước, lycopene, vitamin C, kali',          'Đẹp da, chống oxy hoá',         'https://images.unsplash.com/photo-1546470427-e5ac89cd0b31?auto=format&fit=crop&w=700&q=85', 4,   'quả',  7,  FALSE, CURRENT_TIMESTAMP),
('broccoli', 'Bông cải xanh','Rau Củ',      34,  2.8,  6.6, 0.4,  'Chất xơ, vitamin C, vitamin K',            'Thanh lọc cơ thể, ít calo',     'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=700&q=85', 250, 'g',    6,  FALSE, CURRENT_TIMESTAMP),
('carrot',   'Cà rốt',       'Rau Củ',      41,  0.9,  9.6, 0.2,  'Beta-carotene, vitamin A, chất xơ',        'Tốt cho thị lực, miễn dịch',    'https://images.unsplash.com/photo-1447175008436-170170753e16?auto=format&fit=crop&w=700&q=85', 3,   'củ',   14, FALSE, CURRENT_TIMESTAMP),
('potato',   'Khoai tây',    'Rau Củ',      77,  2,    17,  0.1,  'Tinh bột kháng, kali, vitamin B6',         'Bổ sung năng lượng lành mạnh',  'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=700&q=85', 4,   'củ',   21, FALSE, CURRENT_TIMESTAMP),
('shallot',  'Hành tím',     'Gia vị',      40,  1.1,  9.3, 0.1,  'Flavonoid, hợp chất lưu huỳnh',            'Kháng viêm, tăng hương vị',     'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=700&q=85', 5,   'củ',   30, FALSE, CURRENT_TIMESTAMP),
('garlic',   'Tỏi',          'Gia vị',      149, 6.4,  33,  0.5,  'Allicin, chất chống oxy hóa',              'Tăng cường miễn dịch, tiêu hoá','https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?auto=format&fit=crop&w=700&q=85', 3,   'củ',   45, FALSE, CURRENT_TIMESTAMP),
('ginger',   'Gừng tươi',    'Gia vị',      80,  1.8,  18,  0.8,  'Gingerol, tinh dầu gừng',                  'Ấm bụng, giảm viêm, chống cảm', 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=700&q=85', 2,   'củ',   30, FALSE, CURRENT_TIMESTAMP),
('milk',     'Sữa tươi',     'Nguyên liệu', 120, 8,    12,  5,    'Canxi, vitamin D, protein casein',         'Chắc khỏe xương và răng',       'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=700&q=85', 1,   'lít',  7,  FALSE, CURRENT_TIMESTAMP),
('yogurt',   'Sữa chua',     'Nguyên liệu', 95,  10,   3.6, 0.4,  'Men vi sinh Probiotic, protein',           'Hỗ trợ tiêu hóa đường ruột',    'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=700&q=85', 4,   'hộp',  10, FALSE, CURRENT_TIMESTAMP),
('avocado',  'Quả bơ',       'Trái Cây',    160, 2,    8.5, 14.7, 'Chất béo không bão hòa đơn, kali',        'Tốt cho tim mạch, no lâu',      'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=700&q=85', 2,   'quả',  5,  FALSE, CURRENT_TIMESTAMP),
('banana',   'Chuối',        'Trái Cây',    89,  1.1,  22.8,0.3,  'Kali, carbohydrate phức hợp',              'Bổ sung năng lượng tức thì',    'https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&w=700&q=85', 5,   'quả',  6,  FALSE, CURRENT_TIMESTAMP),
('rice',     'Cơm trắng',    'Nguyên liệu', 130, 2.7,  28,  0.3,  'Carbohydrate, tinh bột',                   'Nguồn tinh bột chính bữa ăn',   'https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=700&q=85', 500, 'g',    3,  FALSE, CURRENT_TIMESTAMP),
('tofu',     'Đậu hũ',       'Nguyên liệu', 76,  8,    2,   4.5,  'Protein thực vật, isoflavone',             'Đạm thực vật thanh đạm',        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=700&q=85', 2,   'hộp',  5,  FALSE, CURRENT_TIMESTAMP),
('cheese',   'Phô mai',      'Nguyên liệu', 402, 25,   1.3, 33,   'Canxi, chất béo, protein',                 'Giàu năng lượng, béo thơm',     'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=700&q=85', 200, 'g',    30, FALSE, CURRENT_TIMESTAMP);

-- ---------- fridge_stock (Thực phẩm trong tủ lạnh) ----------
INSERT INTO fridge_stock (user_id, food_id, quantity, unit, expires_at, note, created_at, updated_at) VALUES
-- User 1 (Minh Anh)
(1, 1,  10,  'quả', DATEADD('DAY', 12, CURRENT_DATE), 'Trứng gà Ba Huân mua tại WinMart',           CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 2,  450, 'g',   DATEADD('DAY', 2,  CURRENT_DATE), 'Ức gà để ngăn mát, cần nấu sớm',             CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 3,  500, 'g',   DATEADD('DAY', 4,  CURRENT_DATE), 'Bảo quản ngăn mát 2°C làm bò xào',           CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 5,  300, 'g',   DATEADD('DAY', 3,  CURRENT_DATE), 'Phi lê cá hồi Nauy tươi',                    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 7,  4,   'quả', DATEADD('DAY', 1,  CURRENT_DATE), 'Cà chua chín mềm, làm canh hoặc sốt',        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 8,  250, 'g',   DATEADD('DAY', 5,  CURRENT_DATE), 'Bông cải đã rửa sạch để ráo',                CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 9,  3,   'củ',  DATEADD('DAY', 10, CURRENT_DATE), 'Bảo quản ngăn rau củ',                       CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 10, 4,   'củ',  DATEADD('DAY', 18, CURRENT_DATE), 'Bảo quản nơi khô ráo thoáng mát',            CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 14, 1,   'lít', DATEADD('DAY', 1,  CURRENT_DATE), 'Sữa tươi thanh trùng mở nắp hôm qua',        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 15, 4,   'hộp', DATEADD('DAY', 8,  CURRENT_DATE), 'Sữa chua không đường ăn sáng',               CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 16, 2,   'quả', DATEADD('DAY', 3,  CURRENT_DATE), 'Quả bơ sáp 034 Đắk Lắk',                     CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 17, 5,   'quả', DATEADD('DAY', 2,  CURRENT_DATE), 'Chuối tiêu chín tự nhiên',                   CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 18, 400, 'g',   DATEADD('DAY', 2,  CURRENT_DATE), 'Cơm nguội dùng chiên cơm',                   CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 19, 2,   'hộp', DATEADD('DAY', 4,  CURRENT_DATE), 'Đậu hũ non nấu canh rong biển',              CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 11, 5,   'củ',  DATEADD('DAY', 25, CURRENT_DATE), 'Hành tím phi thơm',                          CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 12, 3,   'củ',  DATEADD('DAY', 40, CURRENT_DATE), 'Tỏi Hải Dương',                              CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 4,  200, 'g',   DATEADD('DAY', -1, CURRENT_DATE), 'Thịt heo xay bảo quản ngăn mát - đã quá hạn',CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- User 2 (Người Dùng Demo)
(2, 1,  8,   'quả', DATEADD('DAY', 14, CURRENT_DATE), 'Trứng gà sạch',                              CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 3,  400, 'g',   DATEADD('DAY', 3,  CURRENT_DATE), 'Thịt bò thăn mềm',                           CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 7,  5,   'quả', DATEADD('DAY', 2,  CURRENT_DATE), 'Cà chua Đà Lạt',                             CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 14, 1,   'lít', DATEADD('DAY', 1,  CURRENT_DATE), 'Sữa tươi Dalatmilk',                         CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 18, 500, 'g',   DATEADD('DAY', 3,  CURRENT_DATE), 'Cơm trắng',                                  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ---------- ingredients ----------
INSERT INTO ingredients (name, default_unit, category, calories_per_unit, description) VALUES
('Trứng gà',    'quả',   'Thịt - Trứng', 78.0, '1 quả trứng gà ~ 50g'),
('Thịt gà',     'g',     'Thịt',         165.0,'Thịt đùi/cánh, 100g'),
('Gạo trắng',   'g',     'Tinh bột',     130.0,'Gạo nấu cơm'),
('Cà chua',     'quả',   'Rau Củ',       18.0, 'Cà chua bi hoặc cà chua thường'),
('Hành tím',    'củ',    'Gia vị',       40.0, 'Hành tím tươi'),
('Tỏi',         'củ',    'Gia vị',       4.0,  'Tỏi ta'),
('Thịt bò',     'g',     'Thịt',         250.0,'Thịt bò thăn'),
('Cá hồi',      'g',     'Hải Sản',      208.0,'Cá hồi Đại Tây Dương'),
('Bánh phở',    'kg',    'Tinh bột',     110.0,'Bánh phở tươi'),
('Rau thơm',    'bó',    'Rau củ',       25.0, 'Các loại rau thơm');

-- ---------- shopping_items ----------
INSERT INTO shopping_items (user_id, name, quantity, price, category, done, created_at, updated_at) VALUES
(1, 'Trứng gà', '10 quả', 35000, 'dairy', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'Bánh phở tươi', '1 kg', 25000, 'spice', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, 'Rau thơm các loại', '3 bó', 15000, 'veg', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ---------- recipes ----------
INSERT INTO recipes (title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, created_at, updated_at) VALUES
('Phở bò', 'Món ăn truyền thống Việt Nam', 'Ninh xương, nấu nước dùng với gừng nướng và hành tây...', 30, 120, 4, 'Việt Nam', 'Món chính', 420, 32.0, 48.0, 10.0, 'Khó', 'morning,lunch', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Cơm chiên trứng', 'Món đơn giản cho bữa sáng', 'Đánh trứng, phi hành, cho cơm vào chiên...', 5, 10, 1, 'Việt Nam', 'Món chính', 350, 12.0, 45.0, 14.0, 'Dễ', 'morning,lunch,dinner', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
