-- ============================================================================
-- FoodX - SEED DATA: 30 MÓN ĂN VIỆT NAM & CHÂU Á CHUẨN VỊ
-- Danh mục: family (Gia đình), breakfast (Ăn sáng), eatclean (Eat Clean), dessert (Tráng miệng)
-- Tính năng: Idempotent (Chạy nhiều lần không bị duplicate key)
-- ============================================================================

-- -------------------------------------------------------------
-- 1. SEED NGUYÊN LIỆU (INGREDIENTS)
-- -------------------------------------------------------------
INSERT IGNORE INTO ingredients (name, default_unit, category, calories_per_unit, description, created_at, updated_at) VALUES
('Thịt ba chỉ', 'g', 'Thịt', 260.0, 'Thịt ba chỉ heo tươi ngon', NOW(), NOW()),
('Thịt nạc vai xay', 'g', 'Thịt', 240.0, 'Thịt nạc vai xay nhuyễn', NOW(), NOW()),
('Thịt gà ta', 'g', 'Thịt', 190.0, 'Thịt gà ta thả vườn dai ngọt', NOW(), NOW()),
('Ức gà fillet', 'g', 'Thịt', 165.0, 'Ức gà tươi ít mỡ giàu protein', NOW(), NOW()),
('Thịt bò thăn', 'g', 'Thịt', 250.0, 'Thịt bò thăn mềm ngọt bổ máu', NOW(), NOW()),
('Bắp bò hoa', 'g', 'Thịt', 220.0, 'Bắp bò hoa giòn ngọt đậm vị', NOW(), NOW()),
('Bò ba chỉ Mỹ', 'g', 'Thịt', 280.0, 'Ba chỉ bò Mỹ thái dải mỏng', NOW(), NOW()),
('Sườn non heo', 'g', 'Thịt', 270.0, 'Sườn non nhiều sụn mềm róc', NOW(), NOW()),
('Móng giò heo', 'g', 'Thịt', 260.0, 'Móng giò heo giàu collagen', NOW(), NOW()),
('Cá chẽm tươi', 'g', 'Hải sản', 120.0, 'Cá chẽm tươi thịt trắng dai', NOW(), NOW()),
('Phi lê cá hồi Nauy', 'g', 'Hải sản', 208.0, 'Cá hồi tươi giàu Omega-3', NOW(), NOW()),
('Tôm sú tươi', 'g', 'Hải sản', 99.0, 'Tôm sú tươi chắc thịt giòn ngọt', NOW(), NOW()),
('Cua đồng xay', 'g', 'Hải sản', 87.0, 'Cua đồng xay nguyên chất nhiều gạch', NOW(), NOW()),
('Trứng vịt', 'quả', 'Trứng', 130.0, 'Trứng vịt tươi lòng đỏ to', NOW(), NOW()),
('Trứng gà tươi', 'quả', 'Trứng', 70.0, 'Trứng gà ta tươi sạch', NOW(), NOW()),
('Đậu hũ non', 'hộp', 'Đậu hạt', 76.0, 'Đậu hũ non mềm mịn béo ngậy', NOW(), NOW()),
('Đậu xanh xát vỏ', 'g', 'Đậu hạt', 328.0, 'Đậu xanh tiêu thơm bùi', NOW(), NOW()),
('Đậu nành hạt', 'g', 'Đậu hạt', 446.0, 'Đậu nành hạt nguyên chất', NOW(), NOW()),
('Bánh phở tươi', 'g', 'Tinh bột', 110.0, 'Bánh phở sợi mềm mướt', NOW(), NOW()),
('Bún tươi', 'g', 'Tinh bột', 110.0, 'Bún tươi sợi nhỏ truyền thống', NOW(), NOW()),
('Bún gạo lứt', 'g', 'Tinh bột', 214.0, 'Bún gạo lứt huyết rồng Eat Clean', NOW(), NOW()),
('Bánh mì giòn', 'ổ', 'Tinh bột', 260.0, 'Bánh mì vỏ giòn ruột xốp', NOW(), NOW()),
('Gạo tấm thơm', 'g', 'Tinh bột', 350.0, 'Gạo tấm Sa Giang dẻo thơm', NOW(), NOW()),
('Gạo nếp cái hoa vàng', 'g', 'Tinh bột', 346.0, 'Gạo nếp cái hoa vàng dẻo thơm', NOW(), NOW()),
('Bột bánh cuốn', 'g', 'Tinh bột', 360.0, 'Bột gạo lọc làm bánh cuốn', NOW(), NOW()),
('Bột nếp', 'g', 'Tinh bột', 360.0, 'Bột nếp mịn làm bánh rán', NOW(), NOW()),
('Bột năng', 'g', 'Tinh bột', 380.0, 'Bột năng tạo độ sánh giòn', NOW(), NOW()),
('Yến mạch cán dẹt', 'g', 'Tinh bột', 389.0, 'Yến mạch Úc nguyên cám', NOW(), NOW()),
('Bông cải xanh', 'g', 'Rau củ', 34.0, 'Bông cải xanh Đà Lạt giòn ngọt', NOW(), NOW()),
('Cà chua bi', 'g', 'Rau củ', 22.0, 'Cà chua bi tươi mọng nước', NOW(), NOW()),
('Cần tây', 'g', 'Rau củ', 16.0, 'Cần tây cọng giòn thơm nồng', NOW(), NOW()),
('Tỏi tây', 'g', 'Rau củ', 61.0, 'Tỏi tây boa-rô ngọt đậm', NOW(), NOW()),
('Măng tây tươi', 'g', 'Rau củ', 20.0, 'Măng tây xanh non giòn ngọt', NOW(), NOW()),
('Rau mồng tơi', 'g', 'Rau củ', 19.0, 'Rau mồng tơi thanh nhiệt', NOW(), NOW()),
('Rau đay', 'g', 'Rau củ', 25.0, 'Rau đay đồng quê ngọt mát', NOW(), NOW()),
('Mướp hương', 'quả', 'Rau củ', 30.0, 'Mướp hương thơm ngát ruột mềm', NOW(), NOW()),
('Rong biển khô', 'g', 'Rau củ', 45.0, 'Rong biển nấu canh thanh mát', NOW(), NOW()),
('Nấm đùi gà', 'g', 'Nấm', 35.0, 'Nấm đùi gà giòn ngọt dai dai', NOW(), NOW()),
('Nấm đông cô', 'g', 'Nấm', 42.0, 'Nấm đông cô thơm sâu lắng', NOW(), NOW()),
('Nấm hương mộc nhĩ', 'g', 'Nấm', 50.0, 'Nấm hương mộc nhĩ giòn sần sật', NOW(), NOW()),
('Cùi bưởi da xanh', 'g', 'Trái cây', 40.0, 'Cùi bưởi làm chè giòn dai', NOW(), NOW()),
('Chuối sứ chín', 'quả', 'Trái cây', 90.0, 'Chuối sứ chín ngọt thơm lừng', NOW(), NOW()),
('Hạt sen tươi', 'g', 'Hạt', 89.0, 'Hạt sen Huế bở tơi thanh ngọt', NOW(), NOW()),
('Long nhãn Hưng Yên', 'g', 'Trái cây', 280.0, 'Long nhãn Hưng Yên dẻo ngọt', NOW(), NOW()),
('Nước dừa xiêm', 'ml', 'Gia vị', 19.0, 'Nước dừa tươi ngọt lành', NOW(), NOW()),
('Nước cốt dừa', 'ml', 'Gia vị', 230.0, 'Nước cốt dừa sánh béo đậm đà', NOW(), NOW()),
('Sữa đặc', 'ml', 'Sữa', 320.0, 'Sữa đặc có đường thơm ngậy', NOW(), NOW()),
('Sữa tươi không đường', 'ml', 'Sữa', 60.0, 'Sữa tươi thanh trùng tiệt trùng', NOW(), NOW()),
('Mắm tôm ngon', 'ml', 'Gia vị', 70.0, 'Mắm tôm Hậu Lộc thơm nức', NOW(), NOW()),
('Mắm ruốc Huế', 'g', 'Gia vị', 100.0, 'Mắm ruốc Huế chuẩn vị cung đình', NOW(), NOW());

-- -------------------------------------------------------------
-- 2. SEED RECIPES (30 CÔNG THỨC 4 DANH MỤC)
-- -------------------------------------------------------------

-- =============================================================
-- DANH MỤC 1: MÓN ĂN GIA ĐÌNH (family) - 8 MÓN
-- =============================================================

-- 1. Thịt kho tàu nước dừa
INSERT INTO recipes (title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, created_at, updated_at)
SELECT 'Thịt kho tàu nước dừa',
'Thịt ba chỉ mềm rục ngấm nước dừa xiêm ngọt thanh, trứng vịt bùi ngậy keo màu cánh gián óng ả chuẩn vị mâm cơm Tết.',
'1. Thịt ba chỉ thái vuông 3-4cm, chần qua nước sôi 2 phút rồi vớt ra để ráo.\n2. Ướp thịt với hành tỏi băm, nước mắm ngon, tiêu và chút đường trong 30 phút.\n3. Thắng nước màu cánh gián, cho thịt vào xào săn đều các mặt.\n4. Đổ nước dừa tươi ngập thịt, đun sôi rồi hạ lửa liu riu trong 40 phút.\n5. Cho trứng vịt luộc bóc vỏ vào kho thêm 15 phút đến khi nước thịt sánh kẹo óng ả.',
15, 45, 4, 'Việt Nam', 'family', 560, 32.0, 12.0, 42.0, 'Dễ', 'lunch,dinner',
'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE title = 'Thịt kho tàu nước dừa');

-- 2. Gà kho gừng sả ớt
INSERT INTO recipes (title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, created_at, updated_at)
SELECT 'Gà kho gừng sả ớt',
'Miếng thịt gà ta săn chắc đậm đà thơm cay nồng nàn vị gừng tươi và sả phi, cực kỳ đưa cơm trong những ngày mưa lạnh.',
'1. Gà chặt miếng vừa ăn, xát muối gừng khử mùi rồi rửa sạch để ráo.\n2. Ướp gà với nửa phần gừng thái chỉ, nước mắm, hạt nêm, tiêu trong 20 phút.\n3. Phi thơm sả băm và gừng còn lại với chút dầu ăn đến khi dậy mùi thơm nức.\n4. Cho thịt gà vào xào lửa lớn cho săn chắc các mặt.\n5. Thêm chút nước lọc, hạ lửa nhỏ kho liu riu 20 phút cho gà mềm ngấm vị cay ấm của gừng.',
15, 30, 4, 'Việt Nam', 'family', 420, 38.0, 8.0, 26.0, 'Dễ', 'lunch,dinner',
'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE title = 'Gà kho gừng sả ớt');

-- 3. Canh sườn non nấu sấu chua
INSERT INTO recipes (title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, created_at, updated_at)
SELECT 'Canh sườn non nấu sấu chua',
'Bát canh sườn chua thanh tao ngọt lịm đặc trưng mùa hè miền Bắc, nước dùng trong vắt điểm xuyết cà chua và hành mùi.',
'1. Sườn non chặt khúc 3cm, chần nước sôi rửa sạch bọt bẩn.\n2. Phi thơm hành tím xào sơ cà chua và sườn, nêm muối tiêu vừa miệng.\n3. Cho 1.2 lít nước vào đun sôi, hạ lửa hầm sườn trong 25 phút.\n4. Thả quả sấu cạo vỏ vào nấu chín mềm, dầm sấu lấy vị chua thanh dịu.\n5. Rắc hành hoa mùi tàu thái nhỏ, tắt bếp và múc ra tô thưởng thức nóng.',
15, 35, 4, 'Việt Nam', 'family', 310, 28.0, 14.0, 16.0, 'Dễ', 'lunch,dinner',
'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE title = 'Canh sườn non nấu sấu chua');

-- 4. Cá chẽm hấp xì dầu hành gừng
INSERT INTO recipes (title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, created_at, updated_at)
SELECT 'Cá chẽm hấp xì dầu hành gừng',
'Thịt cá ngọt mềm mọng nước, quyện cùng sốt xì dầu sánh thơm mùi gừng hành và dầu mè, giữ trọn vẹn dinh dưỡng.',
'1. Cá làm sạch, khía vảy rồng hai bên thân cá, xát gừng rượu khử tanh.\n2. Xếp gừng thái sợi và đầu hành lá vào đĩa lót dưới đáy và nhét vào bụng cá.\n3. Đặt cá vào xửng hấp chín tới trong 15 phút.\n4. Nấu hỗn hợp xì dầu, dầu hào, đường, nước dùng cho sôi rồi rưới đều lên thân cá.\n5. Rải hành lá thái sợi lên trên, đun sôi 1 muôi dầu ăn nóng già dội lên hành cho dậy mùi thơm.',
15, 25, 3, 'Châu Á', 'family', 340, 36.0, 12.0, 16.0, 'Trung bình', 'lunch,dinner',
'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE title = 'Cá chẽm hấp xì dầu hành gừng');

-- 5. Bò xào cần tỏi tây
INSERT INTO recipes (title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, created_at, updated_at)
SELECT 'Bò xào cần tỏi tây',
'Thịt bò thăn thái mỏng xào lửa lớn giữ nguyên độ mềm mọng ngọt tự nhiên, quyện cùng cần tây tỏi tây thơm nức giòn ngọt.',
'1. Thịt bò thái lát mỏng ngang thớ, ướp tỏi băm, dầu hào, tiêu và 1 thìa dầu ăn cho mềm.\n2. Cần tây, tỏi tây rửa sạch cắt khúc 4cm; cà chua bổ múi cau.\n3. Đun nóng chảo dầu, phi thơm tỏi rồi cho thịt bò vào xào lửa lớn trong 2 phút vừa chín tới, trút ra đĩa.\n4. Dùng lại chảo xào nhanh cần tây, tỏi tây và cà chua cho chín giòn.\n5. Trút thịt bò vào đảo nhanh tay 30 giây cho hòa quyện, rắc tiêu thơm rồi tắt bếp.',
10, 15, 3, 'Việt Nam', 'family', 380, 34.0, 14.0, 20.0, 'Dễ', 'lunch,dinner',
'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE title = 'Bò xào cần tỏi tây');

-- 6. Tôm rim mặn ngọt hành tỏi
INSERT INTO recipes (title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, created_at, updated_at)
SELECT 'Tôm rim mặn ngọt hành tỏi',
'Tôm rim đỏ au vỏ bóng bẩy giòn thơm, sốt mặn ngọt keo quánh đậm đà ăn cùng cơm trắng nóng hổi vét sạch nồi cơm.',
'1. Tôm cắt râu gai, rửa sạch để ráo nước.\n2. Cho đường vào chảo đảo nhỏ lửa cho tan chảy chuyển màu cánh gián đẹp mắt.\n3. Phi thơm hành tỏi băm, cho tôm vào đảo đều trên lửa lớn cho tôm cong lại ửng đỏ.\n4. Nêm nước mắm ngon, tiêu và chút nước, hạ lửa vừa rim cho sốt áo quanh thân tôm óng ả.\n5. Khi sốt sệt keo bám bóng bẩy vào từng con tôm, rắc hành hoa rồi dọn ra đĩa.',
10, 20, 3, 'Việt Nam', 'family', 290, 32.0, 16.0, 10.0, 'Dễ', 'lunch,dinner',
'https://images.unsplash.com/photo-1559742811-822873691df8?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE title = 'Tôm rim mặn ngọt hành tỏi');

-- 7. Canh cua mồng tơi rau đay mướp hương
INSERT INTO recipes (title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, created_at, updated_at)
SELECT 'Canh cua mồng tơi rau đay mướp hương',
'Bát canh cua gạch đóng tảng thơm lừng, rau đay mồng tơi thanh mát quyện cùng hương mướp ngọt lành giải nhiệt ngày hè.',
'1. Cua đồng hòa với nước, lọc qua rây 2-3 lần lấy nước cốt gạch cua.\n2. Đun nồi nước cua trên lửa vừa, thêm xíu muối, khuấy nhẹ cho thịt cua kết mảng nổi lên mặt rồi vớt ra để riêng.\n3. Cho mướp thái vát và rau mồng tơi, rau đay thái nhỏ vào nồi nước cua sôi.\n4. Nêm gia vị và xíu mắm tôm cho dậy hương vị đồng quê đặc trưng.\n5. Cho phần thịt cua trở lại nồi, tắt bếp, ăn kèm cơm trắng và cà pháo muối giòn.',
15, 25, 4, 'Việt Nam', 'family', 180, 20.0, 12.0, 6.0, 'Trung bình', 'lunch,dinner',
'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE title = 'Canh cua mồng tơi rau đay mướp hương');

-- 8. Thịt ba chỉ luộc cà pháo mắm tôm
INSERT INTO recipes (title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, created_at, updated_at)
SELECT 'Thịt ba chỉ luộc cà pháo mắm tôm',
'Thịt ba chỉ luộc trắng mềm da giòn sần sật, chấm bát mắm tôm đánh bông quất ớt ăn kèm cà pháo giòn rụm dân dã tuyệt đỉnh.',
'1. Rửa sạch thịt ba chỉ, buộc chỉ định hình miếng thịt cho đẹp mắt.\n2. Cho thịt vào nồi cùng nước ngập, đập dập hành tím và nhánh gừng luộc trong 20 phút.\n3. Vớt thịt ngâm ngay vào âu nước đá lạnh 5 phút để da giòn thịt trắng không bị thâm.\n4. Thái thịt thành từng lát mỏng đều tay bày ra đĩa cùng rau thơm các loại.\n5. Đánh bông mắm tôm với đường, nước cốt quất, ớt tươi và chút rượu trắng, chấm kèm cà pháo giòn rụm.',
10, 25, 4, 'Việt Nam', 'family', 460, 26.0, 8.0, 36.0, 'Dễ', 'lunch,dinner',
'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE title = 'Thịt ba chỉ luộc cà pháo mắm tôm');


-- =============================================================
-- DANH MỤC 2: MÓN SÁNG / ĂN NHANH (breakfast) - 8 MÓN
-- =============================================================

-- 9. Phở bò tái nạm Hà Nội
INSERT INTO recipes (title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, created_at, updated_at)
SELECT 'Phở bò tái nạm Hà Nội',
'Tô phở nước dùng trong veo thơm mùi hoa hồi thảo quả, bánh phở mềm mướt quyện thịt bò tươi ngọt đậm đà danh bất hư truyền.',
'1. Ninh xương bò cùng gừng hành nướng cháy vỏ và túi hương liệu quế hồi thảo quả lấy nước dùng ngọt trong veo.\n2. Thái mỏng thịt bò tái đập dập nhẹ; nạm bò chín thái lát mỏng.\n3. Trụng bánh phở qua nước sôi, xếp vào tô lớn.\n4. Bày thịt tái, nạm bò, hành hoa chẻ và ngò gai lên bề mặt phở.\n5. Chan nước dùng đang sôi sùng sục làm chín thịt bò mềm ngọt, ăn kèm chanh ớt tươi và quẩy nóng.',
20, 45, 2, 'Việt Nam', 'breakfast', 480, 36.0, 56.0, 13.0, 'Trung bình', 'morning',
'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE title = 'Phở bò tái nạm Hà Nội');

-- 10. Bún chả que tre Hà Nội
INSERT INTO recipes (title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, created_at, updated_at)
SELECT 'Bún chả que tre Hà Nội',
'Chả miếng và chả viên nướng xém cạnh thơm phức ngập trong bát nước mắm đu đủ chua ngọt, ăn kèm bún lá và rau thơm tươi non.',
'1. Thịt ba chỉ thái lát mỏng; thịt nạc vai xay viên tròn dẹt.\n2. Ướp thịt với hành khô băm, nước hàng đường thắng, nước mắm, tiêu trong 30 phút.\n3. Kẹp thịt nướng trên than hoa hoặc nồi chiên không dầu ở 180°C đến khi xém vàng óng ả thơm lừng.\n4. Pha nước chấm ấm từ nước mắm, đường, dấm, tỏi ớt băm, thả đu đủ cà rốt giòn ngọt.\n5. Thả chả nóng vào bát nước chấm, dùng kèm đĩa bún tươi và rổ rau thơm xanh mướt.',
20, 35, 2, 'Việt Nam', 'breakfast', 580, 34.0, 62.0, 22.0, 'Trung bình', 'morning,lunch',
'https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE title = 'Bún chả que tre Hà Nội');

-- 11. Bánh mì kẹp xá xíu pate trứng
INSERT INTO recipes (title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, created_at, updated_at)
SELECT 'Bánh mì kẹp xá xíu pate trứng',
'Ổ bánh mì giòn tan ngập tràn patê béo ngậy, thịt xá xíu thơm lừng, trứng ốp la lòng đào và dưa góp thanh mát tuyệt hảo.',
'1. Nướng nóng giòn vỏ bánh mì trong lò nướng hoặc chảo nóng 2 phút.\n2. Rạch dọc thân bánh, phết đều một lớp patê béo ngậy và sốt bơ mayonnaise thơm lừng.\n3. Xếp thịt xá xíu thái lát mỏng và trứng ốp la lòng đào vào trong ruột bánh.\n4. Thêm dưa leo thái lát, đồ chua cà rốt củ cải và vài cọng ngò rí tươi non.\n5. Rưới chút nước sốt tương ớt đậm đà, kẹp lại thưởng thức ngay khi vỏ bánh còn giòn tan.',
5, 15, 2, 'Việt Nam', 'breakfast', 460, 22.0, 52.0, 18.0, 'Dễ', 'morning',
'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE title = 'Bánh mì kẹp xá xíu pate trứng');

-- 12. Cơm tấm sườn bì chả Sài Gòn
INSERT INTO recipes (title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, created_at, updated_at)
SELECT 'Cơm tấm sườn bì chả Sài Gòn',
'Hạt tấm dẻo thơm, sườn cốt lết nướng mật ong sả tỏi đậm đà, bì giòn bùi thính gạo và chả trứng hấp vàng óng mỡ hành thơm phức.',
'1. Nấu cơm tấm chín dẻo bằng xửng hấp hoặc nồi cơm điện.\n2. Sườn cốt lết ướp sả tỏi băm, mật ong, dầu hào, nước tương rồi nướng vàng đều 2 mặt.\n3. Hấp chín chả trứng thịt mộc nhĩ, quét lòng đỏ trứng lên mặt cho vàng óng.\n4. Xới cơm tấm ra đĩa, xếp miếng sườn nướng thơm phức, bì trộn thính và lát chả trứng.\n5. Rưới mỡ hành bóng bẩy lên trên, ăn kèm dưa leo, cà chua và chén nước mắm kẹo ớt băm.',
20, 40, 2, 'Việt Nam', 'breakfast', 680, 42.0, 76.0, 24.0, 'Trung bình', 'morning,lunch',
'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE title = 'Cơm tấm sườn bì chả Sài Gòn');

-- 13. Bún bò Huế giò heo bắp hoa
INSERT INTO recipes (title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, created_at, updated_at)
SELECT 'Bún bò Huế giò heo bắp hoa',
'Nước dùng cay nồng thơm lừng hương sả và mắm ruốc Huế đặc trưng, sợi bún to dai quyện bắp bò hoa giòn ngọt và móng giò béo mềm.',
'1. Hầm xương ống và giò heo với sả đập dập lấy nước ngọt thanh trong 40 phút.\n2. Hòa mắm ruốc với nước lạnh lọc lấy nước trong cho vào nồi nước dùng dậy mùi thơm đặc trưng.\n3. Bắp bò cuộn tròn luộc chín tới, vớt ra ngâm đá rồi thái lát mỏng to bản.\n4. Phi màu điều với ớt sa tế tạo màu đỏ cam lóng lánh thơm cay rưới vào nồi nước lèo.\n5. Trụng bún sợi to vào tô, xếp thịt bắp bò, giò heo, chan nước lèo cay nồng nóng hổi kèm hoa chuối bào.',
25, 50, 2, 'Việt Nam', 'breakfast', 610, 40.0, 66.0, 20.0, 'Khó', 'morning,lunch',
'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE title = 'Bún bò Huế giò heo bắp hoa');

-- 14. Bánh cuốn nóng nhân thịt mộc nhĩ
INSERT INTO recipes (title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, created_at, updated_at)
SELECT 'Bánh cuốn nóng nhân thịt mộc nhĩ',
'Lớp bánh mỏng mềm mướt cuộn nhân thịt nạc băm xào mộc nhĩ nấm hương thơm nức, rắc ngập hành phi giòn tan chấm mắm chua ngọt ấm dịu.',
'1. Xào thịt nạc băm với mộc nhĩ nấm hương băm nhỏ, nêm hạt nêm và tiêu thơm lừng làm nhân.\n2. Tráng lớp bột mỏng trên chảo chống dính hoặc nồi hơi đậy nắp 45 giây cho bánh chín trong.\n3. Trút bánh ra đĩa thoa dầu, múc nhân thịt vào giữa cuộn tròn đều tay.\n4. Cắt bánh thành khúc vừa ăn, xếp chả lụa thái lát xung quanh.\n5. Rắc thật nhiều hành phi vàng giòn lên trên, chấm cùng nước mắm chua ngọt ấm dịu có thêm vài giọt tinh dầu cà cuống.',
15, 25, 2, 'Việt Nam', 'breakfast', 410, 20.0, 56.0, 12.0, 'Dễ', 'morning',
'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE title = 'Bánh cuốn nóng nhân thịt mộc nhĩ');

-- 15. Xôi xéo gà nấm mỡ hành
INSERT INTO recipes (title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, created_at, updated_at)
SELECT 'Xôi xéo gà nấm mỡ hành',
'Hạt nếp vàng óng dẻo quánh, từng lát đậu xanh bùi béo mỏng tang tan trong miệng quyện cùng thịt gà xé xào nấm và mỡ hành ngậy thơm.',
'1. Gạo nếp ngâm nước nghệ cho vàng óng, đồ xôi hai lửa cho hạt nếp căng bóng dẻo quánh.\n2. Đậu xanh đồ chín mềm, giã nhuyễn nắm thành quả tròn đặc khi còn nóng.\n3. Thịt gà xé xào cùng nấm hương thơm lừng với chút nước mắm tiêu.\n4. Xới xôi vàng ra đĩa, dùng dao gọt từng lát đậu xanh mỏng phủ kín mặt xôi.\n5. Thêm gà nấm xào, rưới một muỗng mỡ gà thơm ngậy và rắc đầy hành phi giòn tan.',
20, 35, 2, 'Việt Nam', 'breakfast', 590, 28.0, 78.0, 18.0, 'Trung bình', 'morning',
'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE title = 'Xôi xéo gà nấm mỡ hành');

-- 16. Cháo sườn sụn quẩy giòn ruốc thịt
INSERT INTO recipes (title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, created_at, updated_at)
SELECT 'Cháo sườn sụn quẩy giòn ruốc thịt',
'Tô cháo sánh mịn như lụa từ bột gạo tẻ xay, ngọt lịm nước hầm sườn sụn giòn sần sật, ăn cùng quẩy nóng giòn rụm và ruốc bông thơm nức.',
'1. Sườn sụn chặt miếng nhỏ băm nhỏ, xào sơ với nước mắm cho ngấm đậm đà.\n2. Khuấy đều bột gạo với nước ninh sườn trên lửa nhỏ, đảo đều tay liên tục để cháo mịn mượt không bị khê đáy.\n3. Khi cháo sánh mượt trong veo, cho sườn sụn vào nấu thêm 10 phút cho sụn giòn sần sật.\n4. Múc cháo nóng hổi ra bát tô trắng tinh khôi.\n5. Cắt quẩy giòn rụm lên trên, thêm một nhúm ruốc thịt thơm, rắc tiêu bắc thơm nồng và chút ớt bột.',
10, 30, 2, 'Việt Nam', 'breakfast', 420, 24.0, 58.0, 11.0, 'Dễ', 'morning',
'https://images.unsplash.com/photo-1588767763785-5b437cbb5a4a?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE title = 'Cháo sườn sụn quẩy giòn ruốc thịt');


-- =============================================================
-- DANH MỤC 3: EAT CLEAN & HEALTHY (eatclean) - 7 MÓN
-- =============================================================

-- 17. Ức gà áp chảo sốt bơ tỏi & bông cải xanh
INSERT INTO recipes (title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, created_at, updated_at)
SELECT 'Ức gà áp chảo sốt bơ tỏi & bông cải xanh',
'Thực đơn tăng cơ giảm mỡ kinh điển: Ức gà áp chảo vàng óng mọng nước không hề khô bã, sốt bơ tỏi thơm ngậy kèm bông cải xanh thanh mát.',
'1. Ức gà khía vát nhẹ, ướp muối hồng, tiêu đen, tỏi băm và chút dầu ô-liu trong 10 phút.\n2. Bông cải xanh và cà rốt chần nhanh qua nước sôi có chút muối rồi ngâm nước đá giữ độ giòn xanh.\n3. Đun nóng chảo chống dính, áp chảo ức gà mỗi mặt 5 phút trên lửa vừa cho vàng giòn bên ngoài, mọng nước bên trong.\n4. Thêm 1 thìa bơ thực vật nhỏ và tỏi băm vào chảo rưới đều lên miếng gà cho dậy mùi thơm.\n5. Cắt gà thành lát dày vừa ăn, bày ra đĩa cùng rau củ luộc thanh ngọt tự nhiên.',
10, 20, 1, 'Eat Clean', 'eatclean', 420, 48.0, 18.0, 16.0, 'Dễ', 'lunch,dinner',
'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE title = 'Ức gà áp chảo sốt bơ tỏi & bông cải xanh');

-- 18. Salad cá hồi áp chảo sốt mè rang
INSERT INTO recipes (title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, created_at, updated_at)
SELECT 'Salad cá hồi áp chảo sốt mè rang',
'Phi lê cá hồi Nauy da giòn thịt mềm mọng nước kết hợp xà lách tươi giòn, bơ sáp béo bùi và sốt mè rang thơm lừng chuẩn phong cách Healthy.',
'1. Cá hồi ướp xíu muối và tiêu xay 5 phút, áp chảo phần da cho giòn rụm trong 3 phút, lật mặt thịt 2 phút vừa chín tới.\n2. Rau xà lách rửa sạch vẩy ráo nước cắt khúc vừa ăn; cà chua bi bổ đôi, bơ sáp thái lát mỏng.\n3. Xếp toàn bộ rau củ tươi mát vào âu lớn sâu lòng.\n4. Đặt miếng cá hồi áp chảo vàng óng thơm nức lên chính giữa đĩa salad.\n5. Pha sốt cốt chanh leo chua thanh với sốt mè rang béo bùi, rưới đều lên salad trước khi thưởng thức.',
10, 15, 1, 'Eat Clean', 'eatclean', 450, 36.0, 16.0, 28.0, 'Dễ', 'lunch,dinner',
'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE title = 'Salad cá hồi áp chảo sốt mè rang');

-- 19. Bún gạo lứt xào ức gà nấm đùi gà
INSERT INTO recipes (title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, created_at, updated_at)
SELECT 'Bún gạo lứt xào ức gà nấm đùi gà',
'Sợi bún gạo lứt dai ngon giàu chất xơ hòa quyện với ức gà xào mềm ngọt, nấm đùi gà giòn dai và cải xanh thanh mát không ngấy dầu mỡ.',
'1. Bún gạo lứt ngâm nước ấm 10 phút rồi luộc 3 phút, vớt ra xả nước lạnh trộn chút dầu mè cho tơi sợi.\n2. Ức gà thái con chì ướp nước tương và tiêu xay; nấm đùi gà thái lát vừa ăn.\n3. Phi thơm tỏi xào ức gà chín săn, trút nấm đùi gà và cải ngọt vào xào lửa lớn 2 phút.\n4. Cho bún gạo lứt vào chảo đảo đều cùng sốt tương tamari cho sợi bún ngấm đều màu nâu óng.\n5. Rắc hành ngò và tiêu xay thơm lừng, dùng nóng cho bữa trưa lành mạnh tràn đầy năng lượng.',
10, 20, 1, 'Eat Clean', 'eatclean', 390, 34.0, 48.0, 9.0, 'Dễ', 'lunch,dinner',
'https://images.unsplash.com/photo-1552611052-33e04de081de?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE title = 'Bún gạo lứt xào ức gà nấm đùi gà');

-- 20. Gỏi cuốn tôm thịt chấm sốt tương đậu phộng
INSERT INTO recipes (title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, created_at, updated_at)
SELECT 'Gỏi cuốn tôm thịt chấm sốt tương đậu phộng',
'Món cuốn thanh khiết đẹp mắt với tôm đỏ au, thịt luộc mỏng và rau sống tươi mát qua lớp bánh tráng trong veo, chấm tương bơ lạc thơm bùi.',
'1. Tôm sú luộc chín bóc vỏ chẻ đôi sống lưng; thịt ba chỉ luộc thái lát mỏng.\n2. Làm ẩm bánh tráng bằng khăn ướt sạch, trải lên mặt phẳng đĩa.\n3. Xếp lần lượt xà lách, rau thơm, bún tươi và thịt ba chỉ vào 1/3 mép bánh tráng.\n4. Cuộn chặt một vòng, xếp tôm đỏ au và nhánh hẹ dài thò ra ngoài mép bánh.\n5. Gập hai bên mép cuộn tròn chặt tay, chấm cùng sốt tương bơ đậu phộng ngọt bùi rắc lạc rang giã dập.',
15, 25, 2, 'Việt Nam', 'eatclean', 360, 26.0, 44.0, 9.0, 'Dễ', 'lunch,dinner',
'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE title = 'Gỏi cuốn tôm thịt chấm sốt tương đậu phộng');

-- 21. Cháo yến mạch tôm tươi rong biển
INSERT INTO recipes (title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, created_at, updated_at)
SELECT 'Cháo yến mạch tôm tươi rong biển',
'Bát cháo yến mạch sánh mịn ngọt thanh nước tôm tươi kết hợp rong biển bổ dưỡng giàu i-ốt và canxi, tốt cho hệ tiêu hóa và vóc dáng.',
'1. Tôm bóc vỏ băm nhỏ, ướp chút hạt tiêu và hành tím băm.\n2. Rong biển ngâm nở mềm trong nước lạnh 5 phút rồi cắt nhỏ.\n3. Đun sôi 350ml nước lọc, cho tôm và cà rốt băm vào nấu chín ngọt nước.\n4. Trút yến mạch cán dẹt vào khuấy đều trên lửa nhỏ 5 phút đến khi sánh mịn.\n5. Thả rong biển vào nấu thêm 1 phút, rưới vài giọt dầu mè thơm lừng rồi tắt bếp múc ra tô.',
5, 15, 1, 'Eat Clean', 'eatclean', 330, 28.0, 42.0, 6.0, 'Dễ', 'morning,dinner',
'https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE title = 'Cháo yến mạch tôm tươi rong biển');

-- 22. Đậu hũ non sốt cà chua nấm đông cô
INSERT INTO recipes (title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, created_at, updated_at)
SELECT 'Đậu hũ non sốt cà chua nấm đông cô',
'Món ăn thuần chay thanh tịnh với đậu hũ non béo mềm tan trong miệng, quyện cùng sốt cà chua tươi mọng và nấm đông cô thơm sâu lắng.',
'1. Đậu hũ non cắt miếng vuông 3cm, trần sơ qua nước ấm rồi xếp ra đĩa sâu lòng.\n2. Nấm đông cô khía chữ thập trên mũ nấm; cà chua băm nhuyễn bỏ hạt.\n3. Phi thơm hành boa-rô, cho cà chua vào đảo nhuyễn tạo màu đỏ tự nhiên đẹp mắt.\n4. Thêm nấm đông cô, nước tương và chút nước đun sôi sền sệt 5 phút.\n5. Hòa xíu bột bắp cho sốt sánh bóng, rưới đều lên đĩa đậu hũ non thanh mát béo ngậy.',
10, 15, 2, 'Ăn chay', 'eatclean', 280, 18.0, 32.0, 10.0, 'Dễ', 'lunch,dinner',
'https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE title = 'Đậu hũ non sốt cà chua nấm đông cô');

-- 23. Bò cuộn măng tây nướng sốt tiêu đen
INSERT INTO recipes (title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, created_at, updated_at)
SELECT 'Bò cuộn măng tây nướng sốt tiêu đen',
'Thịt ba chỉ bò Mỹ mềm béo cuộn trọn măng tây xanh giòn ngọt tự nhiên, nướng xém vàng rưới sốt tiêu đen cay nồng thơm quyến rũ.',
'1. Măng tây cắt bỏ gốc già, rửa sạch chần sơ nước sôi 1 phút ngâm đá giữ màu xanh biếc.\n2. Trải từng dải thịt bò mỏng ra đĩa, đặt 2-3 cọng măng tây vào cuộn tròn chặt tay.\n3. Quết một lớp dầu ô-liu mỏng và sốt tiêu đen đậm đà lên các cuộn bò măng tây.\n4. Nướng bằng nồi chiên không dầu ở 190°C trong 8 phút cho thịt bò xém vàng thơm nức.\n5. Bày ra đĩa rắc chút tiêu sọ xay, thưởng thức nóng giòn ngọt thanh ngọt tự nhiên.',
10, 20, 2, 'Eat Clean', 'eatclean', 440, 36.0, 14.0, 28.0, 'Dễ', 'dinner',
'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE title = 'Bò cuộn măng tây nướng sốt tiêu đen');


-- =============================================================
-- DANH MỤC 4: BÁNH & MÓN ĂN VẶT / TRÁNG MIỆNG (dessert) - 7 MÓN
-- =============================================================

-- 24. Chè bưởi An Giang cốt dừa béo ngậy
INSERT INTO recipes (title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, created_at, updated_at)
SELECT 'Chè bưởi An Giang cốt dừa béo ngậy',
'Cùi bưởi giòn sần sật trong veo không chút đắng, đỗ xanh bở tơi ngập trong nước đường phèn sánh dẻo thơm ngát tinh dầu bưởi cốt dừa béo.',
'1. Cùi bưởi gọt sạch vỏ xanh xắt hạt lựu, bóp muối xả nước 5 lần khử đắng rồi luộc sơ vắt ráo.\n2. Ướp cùi bưởi với đường rồi áo đều một lớp bột năng dày đem luộc chín trong veo giòn sần sật.\n3. Đậu xanh ngâm nở đồ chín mềm tơi nguyên hạt.\n4. Nấu sôi nước đường phèn, hòa bột năng cho chè sánh trong rồi trút cùi bưởi và đậu xanh vào khuấy nhẹ.\n5. Múc chè ra ly, thêm đá viên, chan nước cốt dừa béo ngậy và vài giọt tinh dầu hoa bưởi ngát hương.',
25, 40, 4, 'Việt Nam', 'dessert', 320, 8.0, 62.0, 6.0, 'Trung bình', 'snack',
'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE title = 'Chè bưởi An Giang cốt dừa béo ngậy');

-- 25. Bánh chuối nướng cốt dừa kiểu Nam Bộ
INSERT INTO recipes (title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, created_at, updated_at)
SELECT 'Bánh chuối nướng cốt dừa kiểu Nam Bộ',
'Bánh chuối nướng đỏ rượu vang thơm nức mùi nước cốt dừa và bơ lạt, dẻo mềm béo ngậy chuẩn vị tráng miệng nức tiếng miền Tây.',
'1. Chuối sứ thái lát mỏng ướp 2 thìa đường và chút rượu rum cho lên màu đỏ vang.\n2. Bánh mì xé nhỏ trộn cùng nước cốt dừa, sữa đặc, bơ tan chảy và 2/3 phần chuối dầm nhuyễn.\n3. Thoa bơ chống dính khuôn bánh, trút hỗn hợp bột chuối bánh mì vào dàn phẳng mặt.\n4. Xếp các lát chuối còn lại lên bề mặt bánh thành hình hoa đẹp mắt.\n5. Nướng ở 175°C trong 45 phút đến khi mặt bánh chín vàng nâu thơm phức mùi dừa chuối.',
20, 45, 4, 'Việt Nam', 'dessert', 350, 6.0, 58.0, 12.0, 'Trung bình', 'snack',
'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE title = 'Bánh chuối nướng cốt dừa kiểu Nam Bộ');

-- 26. Trà sữa Thái xanh thạch phô mai
INSERT INTO recipes (title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, created_at, updated_at)
SELECT 'Trà sữa Thái xanh thạch phô mai',
'Vị trà Thái xanh chát nhẹ thơm nồng hòa quyện cùng sữa tươi béo ngọt, nhấn nhá những viên thạch phô mai giòn ngậy mát rượi.',
'1. Hãm trà Thái xanh với 500ml nước sôi 10 phút, lọc bỏ bã lấy nước cốt trà xanh mát.\n2. Cắt phô mai thành viên vuông nhỏ xếp vào khay làm thạch.\n3. Nấu bột rau câu với đường cho trong suốt rồi đổ ngập viên phô mai, để nguội cho thạch đông giòn.\n4. Khuấy đều nước cốt trà với sữa đặc và sữa tươi cho ra màu xanh ngọc bích tuyệt đẹp.\n5. Cho đá viên vào ly, rót trà sữa thơm lừng và thả các viên thạch phô mai béo ngậy lên trên.',
10, 20, 2, 'Châu Á', 'dessert', 290, 8.0, 46.0, 9.0, 'Dễ', 'snack',
'https://images.unsplash.com/photo-1558857563-b37d1a580665?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE title = 'Trà sữa Thái xanh thạch phô mai');

-- 27. Tào phớ hoa nhài nước đường gừng
INSERT INTO recipes (title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, created_at, updated_at)
SELECT 'Tào phớ hoa nhài nước đường gừng',
'Lát tào phớ trắng muốt mềm mượt tan trên đầu lưỡi, ngập trong nước đường hoa mai ấm nồng vị gừng thơm ngát hương hoa nhài thanh khiết.',
'1. Đậu nành xay mịn vắt lấy nước cốt sữa đậu nành đặc, đun sôi nhỏ lửa hớt bọt kỹ.\n2. Hòa đường nho với 1 thìa nước lạnh tráng quanh đáy âu, đổ dứt khoát sữa đậu nành nóng vào ủ 30 phút thành tào phớ mịn màng.\n3. Nấu đường hoa mai với nước lọc và gừng thái sợi cho sánh thơm mùi mật mía.\n4. Thả hoa nhài tươi vào nước đường gừng khi vừa tắt bếp để giữ trọn vẹn hương thơm thanh khiết.\n5. Dùng muôi mỏng hớt từng lát tào phớ mềm mượt như lụa ra bát, chan nước đường gừng hoa nhài thơm ngát.',
15, 25, 3, 'Việt Nam', 'dessert', 210, 10.0, 38.0, 4.0, 'Trung bình', 'snack',
'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE title = 'Tào phớ hoa nhài nước đường gừng');

-- 28. Bánh flan caramel trứng sữa mịn màng
INSERT INTO recipes (title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, created_at, updated_at)
SELECT 'Bánh flan caramel trứng sữa mịn màng',
'Bánh flan núng nính mềm mịn không rỗ mặt, thơm nức mùi trứng sữa tươi hòa cùng lớp caramel màu hổ phách đắng ngọt quyến rũ.',
'1. Thắng đường với chút nước đến khi chuyển màu cánh gián hổ phách, tráng đều một lớp mỏng đáy hũ flan.\n2. Đun ấm sữa tươi cùng sữa đặc khuấy tan (không để sôi).\n3. Đánh tan trứng nhẹ tay không tạo bọt khí, từ từ rót sữa ấm vào khuấy đều rồi lọc qua rây 2 lần cho mịn lụa.\n4. Rót hỗn hợp trứng sữa vào hũ caramel, đậy nắp hoặc bọc giấy bạc.\n5. Hấp cách thủy trên lửa nhỏ nhất trong 30 phút đến khi bánh đông mịn màng, làm lạnh trước khi thưởng thức cùng cà phê đá.',
15, 35, 4, 'Châu Âu', 'dessert', 260, 9.0, 34.0, 10.0, 'Dễ', 'snack',
'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE title = 'Bánh flan caramel trứng sữa mịn màng');

-- 29. Chè hạt sen long nhãn thanh mát
INSERT INTO recipes (title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, created_at, updated_at)
SELECT 'Chè hạt sen long nhãn thanh mát',
'Món tráng miệng cung đình quý phái: Hạt sen bở bùi lồng khéo léo trong cùi long nhãn giòn ngọt, chan nước đường phèn thơm thoang thoảng hoa bưởi.',
'1. Hạt sen thông tâm, rửa sạch hấp chín tới cho bở tơi nguyên hạt không bị nát.\n2. Lồng từng hạt sen chín bùi vào trong cùi quả long nhãn giòn ngọt óng ả.\n3. Đun sôi nước với đường phèn đến khi tan hoàn toàn nước trong veo thanh dịu.\n4. Thả sen lồng nhãn vào nồi nước đường đun sôi lăn tăn 3 phút cho ngấm vị ngọt thanh.\n5. Tắt bếp nhỏ vài giọt tinh dầu hoa bưởi, để nguội thêm đá viên thưởng thức món tráng miệng cung đình quý phái.',
15, 30, 3, 'Việt Nam', 'dessert', 230, 6.0, 48.0, 2.0, 'Trung bình', 'snack',
'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE title = 'Chè hạt sen long nhãn thanh mát');

-- 30. Bánh rán lúc lắc mè đen nhân đậu xanh
INSERT INTO recipes (title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, created_at, updated_at)
SELECT 'Bánh rán lúc lắc mè đen nhân đậu xanh',
'Vỏ bánh nếp chiên vàng giòn rụm phủ đầy mè thơm phức, bên trong rỗng ruột chứa viên nhân đậu xanh ngọt bùi lúc lắc vui tai.',
'1. Bột nếp nhồi với nước ấm và chút đường thành khối bột dẻo mịn không dính tay.\n2. Đậu xanh vo viên tròn làm nhân; chia bột bọc kín viên nhân vo tròn đều.\n3. Lăn bánh qua vừng trắng mè đen cho bám đều quanh vỏ bánh.\n4. Thả bánh vào chảo dầu ấm, chiên lửa nhỏ lăn tròn đều tay đến khi bánh phồng to vỏ giòn rụm vàng ruộm.\n5. Vớt bánh ra giấy thấm dầu, khi lắc nhẹ nghe tiếng viên nhân lúc lắc vui tai bên trong.',
15, 30, 4, 'Việt Nam', 'dessert', 310, 7.0, 52.0, 9.0, 'Trung bình', 'snack',
'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop&q=80', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE title = 'Bánh rán lúc lắc mè đen nhân đậu xanh');

-- -------------------------------------------------------------
-- 3. LIÊN KẾT NGUYÊN LIỆU CHO CÔNG THỨC (RECIPE_INGREDIENTS)
-- -------------------------------------------------------------
-- Thịt kho tàu
INSERT IGNORE INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit, note)
SELECT r.id, i.id, 500, 'g', 'Cắt vuông 3-4cm' FROM recipes r, ingredients i WHERE r.title = 'Thịt kho tàu nước dừa' AND i.name = 'Thịt ba chỉ';
INSERT IGNORE INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit, note)
SELECT r.id, i.id, 4, 'quả', 'Luộc chín bóc vỏ' FROM recipes r, ingredients i WHERE r.title = 'Thịt kho tàu nước dừa' AND i.name = 'Trứng vịt';
INSERT IGNORE INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit, note)
SELECT r.id, i.id, 400, 'ml', 'Nước dừa tươi xiêm' FROM recipes r, ingredients i WHERE r.title = 'Thịt kho tàu nước dừa' AND i.name = 'Nước dừa xiêm';

-- Gà kho gừng sả ớt
INSERT IGNORE INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit, note)
SELECT r.id, i.id, 600, 'g', 'Chặt miếng vừa ăn' FROM recipes r, ingredients i WHERE r.title = 'Gà kho gừng sả ớt' AND i.name = 'Thịt gà ta';

-- Canh sườn non sấu chua
INSERT IGNORE INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit, note)
SELECT r.id, i.id, 500, 'g', 'Chặt khúc 3cm' FROM recipes r, ingredients i WHERE r.title = 'Canh sườn non nấu sấu chua' AND i.name = 'Sườn non heo';

-- Cá chẽm hấp xì dầu
INSERT IGNORE INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit, note)
SELECT r.id, i.id, 700, 'g', 'Khía vảy rồng' FROM recipes r, ingredients i WHERE r.title = 'Cá chẽm hấp xì dầu hành gừng' AND i.name = 'Cá chẽm tươi';

-- Bò xào cần tỏi tây
INSERT IGNORE INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit, note)
SELECT r.id, i.id, 350, 'g', 'Thái lát mỏng' FROM recipes r, ingredients i WHERE r.title = 'Bò xào cần tỏi tây' AND i.name = 'Thịt bò thăn';
INSERT IGNORE INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit, note)
SELECT r.id, i.id, 150, 'g', 'Cắt khúc 4cm' FROM recipes r, ingredients i WHERE r.title = 'Bò xào cần tỏi tây' AND i.name = 'Cần tây';

-- Tôm rim mặn ngọt
INSERT IGNORE INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit, note)
SELECT r.id, i.id, 400, 'g', 'Cắt râu để ráo' FROM recipes r, ingredients i WHERE r.title = 'Tôm rim mặn ngọt hành tỏi' AND i.name = 'Tôm sú tươi';

-- Canh cua mồng tơi
INSERT IGNORE INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit, note)
SELECT r.id, i.id, 350, 'g', 'Lọc lấy nước gạch' FROM recipes r, ingredients i WHERE r.title = 'Canh cua mồng tơi rau đay mướp hương' AND i.name = 'Cua đồng xay';
INSERT IGNORE INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit, note)
SELECT r.id, i.id, 150, 'g', 'Rửa sạch thái nhỏ' FROM recipes r, ingredients i WHERE r.title = 'Canh cua mồng tơi rau đay mướp hương' AND i.name = 'Rau mồng tơi';
INSERT IGNORE INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit, note)
SELECT r.id, i.id, 1, 'quả', 'Thái vát mỏng' FROM recipes r, ingredients i WHERE r.title = 'Canh cua mồng tơi rau đay mướp hương' AND i.name = 'Mướp hương';

-- Phở bò tái nạm
INSERT IGNORE INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit, note)
SELECT r.id, i.id, 400, 'g', 'Trụng nóng' FROM recipes r, ingredients i WHERE r.title = 'Phở bò tái nạm Hà Nội' AND i.name = 'Bánh phở tươi';
INSERT IGNORE INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit, note)
SELECT r.id, i.id, 200, 'g', 'Đập dập nhẹ' FROM recipes r, ingredients i WHERE r.title = 'Phở bò tái nạm Hà Nội' AND i.name = 'Thịt bò thăn';

-- Bún chả que tre
INSERT IGNORE INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit, note)
SELECT r.id, i.id, 500, 'g', 'Bún lá tươi' FROM recipes r, ingredients i WHERE r.title = 'Bún chả que tre Hà Nội' AND i.name = 'Bún tươi';
INSERT IGNORE INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit, note)
SELECT r.id, i.id, 250, 'g', 'Ướp nướng than' FROM recipes r, ingredients i WHERE r.title = 'Bún chả que tre Hà Nội' AND i.name = 'Thịt ba chỉ';
INSERT IGNORE INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit, note)
SELECT r.id, i.id, 250, 'g', 'Viên tròn dẹt' FROM recipes r, ingredients i WHERE r.title = 'Bún chả que tre Hà Nội' AND i.name = 'Thịt nạc vai xay';

-- Bánh mì kẹp
INSERT IGNORE INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit, note)
SELECT r.id, i.id, 2, 'ổ', 'Nướng giòn' FROM recipes r, ingredients i WHERE r.title = 'Bánh mì kẹp xá xíu pate trứng' AND i.name = 'Bánh mì giòn';
INSERT IGNORE INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit, note)
SELECT r.id, i.id, 2, 'quả', 'Ốp la lòng đào' FROM recipes r, ingredients i WHERE r.title = 'Bánh mì kẹp xá xíu pate trứng' AND i.name = 'Trứng gà tươi';

-- Cơm tấm sườn bì chả
INSERT IGNORE INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit, note)
SELECT r.id, i.id, 300, 'g', 'Nấu chín dẻo' FROM recipes r, ingredients i WHERE r.title = 'Cơm tấm sườn bì chả Sài Gòn' AND i.name = 'Gạo tấm thơm';

-- Bún bò Huế
INSERT IGNORE INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit, note)
SELECT r.id, i.id, 400, 'g', 'Sợi to trụng nóng' FROM recipes r, ingredients i WHERE r.title = 'Bún bò Huế giò heo bắp hoa' AND i.name = 'Bún tươi';
INSERT IGNORE INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit, note)
SELECT r.id, i.id, 200, 'g', 'Thái lát to bản' FROM recipes r, ingredients i WHERE r.title = 'Bún bò Huế giò heo bắp hoa' AND i.name = 'Bắp bò hoa';
INSERT IGNORE INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit, note)
SELECT r.id, i.id, 250, 'g', 'Chặt khúc hầm mềm' FROM recipes r, ingredients i WHERE r.title = 'Bún bò Huế giò heo bắp hoa' AND i.name = 'Móng giò heo';
INSERT IGNORE INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit, note)
SELECT r.id, i.id, 20, 'g', 'Lọc nước trong' FROM recipes r, ingredients i WHERE r.title = 'Bún bò Huế giò heo bắp hoa' AND i.name = 'Mắm ruốc Huế';

-- Ức gà áp chảo
INSERT IGNORE INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit, note)
SELECT r.id, i.id, 250, 'g', 'Áp chảo 2 mặt' FROM recipes r, ingredients i WHERE r.title = 'Ức gà áp chảo sốt bơ tỏi & bông cải xanh' AND i.name = 'Ức gà fillet';
INSERT IGNORE INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit, note)
SELECT r.id, i.id, 150, 'g', 'Luộc giòn xanh' FROM recipes r, ingredients i WHERE r.title = 'Ức gà áp chảo sốt bơ tỏi & bông cải xanh' AND i.name = 'Bông cải xanh';

-- Salad cá hồi
INSERT IGNORE INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit, note)
SELECT r.id, i.id, 180, 'g', 'Áp chảo giòn da' FROM recipes r, ingredients i WHERE r.title = 'Salad cá hồi áp chảo sốt mè rang' AND i.name = 'Phi lê cá hồi Nauy';
INSERT IGNORE INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit, note)
SELECT r.id, i.id, 80, 'g', 'Bổ đôi' FROM recipes r, ingredients i WHERE r.title = 'Salad cá hồi áp chảo sốt mè rang' AND i.name = 'Cà chua bi';

-- Bún gạo lứt
INSERT IGNORE INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit, note)
SELECT r.id, i.id, 100, 'g', 'Luộc xả lạnh' FROM recipes r, ingredients i WHERE r.title = 'Bún gạo lứt xào ức gà nấm đùi gà' AND i.name = 'Bún gạo lứt';
INSERT IGNORE INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit, note)
SELECT r.id, i.id, 120, 'g', 'Thái con chì' FROM recipes r, ingredients i WHERE r.title = 'Bún gạo lứt xào ức gà nấm đùi gà' AND i.name = 'Ức gà fillet';
INSERT IGNORE INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit, note)
SELECT r.id, i.id, 80, 'g', 'Thái lát' FROM recipes r, ingredients i WHERE r.title = 'Bún gạo lứt xào ức gà nấm đùi gà' AND i.name = 'Nấm đùi gà';

-- Cháo yến mạch tôm rong biển
INSERT IGNORE INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit, note)
SELECT r.id, i.id, 60, 'g', 'Nấu nở sánh' FROM recipes r, ingredients i WHERE r.title = 'Cháo yến mạch tôm tươi rong biển' AND i.name = 'Yến mạch cán dẹt';
INSERT IGNORE INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit, note)
SELECT r.id, i.id, 120, 'g', 'Băm nhỏ' FROM recipes r, ingredients i WHERE r.title = 'Cháo yến mạch tôm tươi rong biển' AND i.name = 'Tôm sú tươi';
INSERT IGNORE INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit, note)
SELECT r.id, i.id, 10, 'g', 'Ngâm nở cắt nhỏ' FROM recipes r, ingredients i WHERE r.title = 'Cháo yến mạch tôm tươi rong biển' AND i.name = 'Rong biển khô';

-- Đậu hũ sốt cà chua nấm
INSERT IGNORE INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit, note)
SELECT r.id, i.id, 2, 'hộp', 'Thái miếng vuông' FROM recipes r, ingredients i WHERE r.title = 'Đậu hũ non sốt cà chua nấm đông cô' AND i.name = 'Đậu hũ non';
INSERT IGNORE INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit, note)
SELECT r.id, i.id, 80, 'g', 'Khía chữ thập' FROM recipes r, ingredients i WHERE r.title = 'Đậu hũ non sốt cà chua nấm đông cô' AND i.name = 'Nấm đông cô';

-- Bò cuộn măng tây
INSERT IGNORE INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit, note)
SELECT r.id, i.id, 300, 'g', 'Dải mỏng cuộn' FROM recipes r, ingredients i WHERE r.title = 'Bò cuộn măng tây nướng sốt tiêu đen' AND i.name = 'Bò ba chỉ Mỹ';
INSERT IGNORE INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit, note)
SELECT r.id, i.id, 200, 'g', 'Bỏ gốc già chần sơ' FROM recipes r, ingredients i WHERE r.title = 'Bò cuộn măng tây nướng sốt tiêu đen' AND i.name = 'Măng tây tươi';

-- Chè bưởi
INSERT IGNORE INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit, note)
SELECT r.id, i.id, 200, 'g', 'Khử đắng áo bột năng' FROM recipes r, ingredients i WHERE r.title = 'Chè bưởi An Giang cốt dừa béo ngậy' AND i.name = 'Cùi bưởi da xanh';
INSERT IGNORE INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit, note)
SELECT r.id, i.id, 150, 'g', 'Đồ chín tơi' FROM recipes r, ingredients i WHERE r.title = 'Chè bưởi An Giang cốt dừa béo ngậy' AND i.name = 'Đậu xanh xát vỏ';
INSERT IGNORE INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit, note)
SELECT r.id, i.id, 200, 'ml', 'Chan lên mặt ly chè' FROM recipes r, ingredients i WHERE r.title = 'Chè bưởi An Giang cốt dừa béo ngậy' AND i.name = 'Nước cốt dừa';

-- Bánh chuối nướng
INSERT IGNORE INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit, note)
SELECT r.id, i.id, 6, 'quả', 'Thái lát ướp đường' FROM recipes r, ingredients i WHERE r.title = 'Bánh chuối nướng cốt dừa kiểu Nam Bộ' AND i.name = 'Chuối sứ chín';
INSERT IGNORE INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit, note)
SELECT r.id, i.id, 250, 'ml', 'Trộn bột bánh' FROM recipes r, ingredients i WHERE r.title = 'Bánh chuối nướng cốt dừa kiểu Nam Bộ' AND i.name = 'Nước cốt dừa';

-- Bánh flan
INSERT IGNORE INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit, note)
SELECT r.id, i.id, 5, 'quả', 'Đánh tan nhẹ tay' FROM recipes r, ingredients i WHERE r.title = 'Bánh flan caramel trứng sữa mịn màng' AND i.name = 'Trứng gà tươi';
INSERT IGNORE INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit, note)
SELECT r.id, i.id, 400, 'ml', 'Đun ấm' FROM recipes r, ingredients i WHERE r.title = 'Bánh flan caramel trứng sữa mịn màng' AND i.name = 'Sữa tươi không đường';

-- Chè sen long nhãn
INSERT IGNORE INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit, note)
SELECT r.id, i.id, 200, 'g', 'Hấp chín bở tơi' FROM recipes r, ingredients i WHERE r.title = 'Chè hạt sen long nhãn thanh mát' AND i.name = 'Hạt sen tươi';
INSERT IGNORE INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit, note)
SELECT r.id, i.id, 150, 'g', 'Lồng hạt sen vào trong' FROM recipes r, ingredients i WHERE r.title = 'Chè hạt sen long nhãn thanh mát' AND i.name = 'Long nhãn Hưng Yên';
