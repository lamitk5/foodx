package com.nhom6.foodx.common.config;

import com.nhom6.foodx.auth.entity.User;
import com.nhom6.foodx.auth.repository.UserRepository;
import com.nhom6.foodx.food.entity.Food;
import com.nhom6.foodx.food.repository.FoodRepository;
import com.nhom6.foodx.fridge.entity.FridgeItem;
import com.nhom6.foodx.fridge.repository.FridgeItemRepository;
import com.nhom6.foodx.recipe.entity.Recipe;
import com.nhom6.foodx.recipe.repository.RecipeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Seed dữ liệu mẫu cho ứng dụng (User, Catalog Food, Tủ lạnh Fridge, Công thức Recipe).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final FoodRepository foodRepository;
    private final FridgeItemRepository fridgeItemRepository;
    private final RecipeRepository recipeRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedUsers();
        seedFoods();
        seedFridgeItems();
        seedRecipes();
    }

    // =========================================================================
    // 1. SEED USERS
    // =========================================================================
    private void seedUsers() {
        if (userRepository.count() > 0) {
            return;
        }

        String defaultPass = passwordEncoder.encode("123456");
        LocalDateTime now = LocalDateTime.now();

        List<User> users = List.of(
                User.builder()
                        .username("minhanh")
                        .email("minhanh@foodx.vn")
                        .password(defaultPass)
                        .fullName("Minh Anh")
                        .role(User.Role.USER)
                        .createdAt(now)
                        .updatedAt(now)
                        .build(),
                User.builder()
                        .username("dangnhap")
                        .email("demo@foodx.com")
                        .password(defaultPass)
                        .fullName("Người Dùng Demo")
                        .role(User.Role.USER)
                        .createdAt(now)
                        .updatedAt(now)
                        .build(),
                User.builder()
                        .username("admin")
                        .email("admin@foodx.com")
                        .password(defaultPass)
                        .fullName("Quản Trị Viên")
                        .role(User.Role.ADMIN)
                        .createdAt(now)
                        .updatedAt(now)
                        .build(),
                User.builder()
                        .username("thao")
                        .email("thao@foodx.vn")
                        .password(defaultPass)
                        .fullName("Thu Thảo")
                        .role(User.Role.USER)
                        .createdAt(now)
                        .updatedAt(now)
                        .build(),
                User.builder()
                        .username("lam")
                        .email("lam@foodx.vn")
                        .password(defaultPass)
                        .fullName("Nguyễn Sơn Lâm")
                        .role(User.Role.ADMIN)
                        .createdAt(now)
                        .updatedAt(now)
                        .build()
        );

        userRepository.saveAll(users);
        log.info("Đã seed {} tài khoản người dùng mẫu (mật khẩu mặc định: 123456)", users.size());
    }

    // =========================================================================
    // 2. SEED FOOD CATALOG
    // =========================================================================
    private void seedFoods() {
        if (foodRepository.count() > 0) {
            return;
        }

        List<Food> foods = List.of(
                food("egg", "Trứng gà", "Nguyên liệu", 70.0, 6.3, 0.4, 4.8,
                        "Protein cao, vitamin D, choline", "Giàu protein, tốt cho cơ bắp",
                        "https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=700&q=85",
                        6.0, "quả", 14),

                food("chicken", "Ức gà", "Nguyên liệu", 165.0, 31.0, 0.0, 3.6,
                        "Đạm cao, ít béo, sắt, kẽm", "Tăng cơ, kiểm soát cân nặng",
                        "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=700&q=85",
                        450.0, "g", 4),

                food("beef", "Thịt bò", "Nguyên liệu", 250.0, 26.0, 0.0, 15.0,
                        "Đạm, sắt hema, vitamin B6, B12", "Bổ máu, phát triển cơ bắp",
                        "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&w=700&q=85",
                        300.0, "g", 5),

                food("pork", "Thịt heo", "Nguyên liệu", 242.0, 27.0, 0.0, 14.0,
                        "Vitamin B1, kẽm, phốt pho", "Giàu năng lượng, thơm ngon",
                        "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=700&q=85",
                        400.0, "g", 5),

                food("salmon", "Cá hồi", "Nguyên liệu", 208.0, 20.0, 0.0, 13.0,
                        "Axit béo Omega-3, DHA, vitamin D", "Tốt cho tim mạch và trí não",
                        "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=700&q=85",
                        300.0, "g", 4),

                food("shrimp", "Tôm tươi", "Nguyên liệu", 99.0, 24.0, 0.2, 0.3,
                        "Canxi, đạm, iot, selen", "Chắc xương, ít béo",
                        "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=700&q=85",
                        300.0, "g", 3),

                food("tomato", "Cà chua", "Rau Củ", 22.0, 0.9, 3.9, 0.2,
                        "Nước, lycopene, vitamin C, kali", "Đẹp da, chống oxy hoá",
                        "https://images.unsplash.com/photo-1546470427-e5ac89cd0b31?auto=format&fit=crop&w=700&q=85",
                        4.0, "quả", 7),

                food("broccoli", "Bông cải xanh", "Rau Củ", 34.0, 2.8, 6.6, 0.4,
                        "Chất xơ, vitamin C, vitamin K, sulforaphane", "Thanh lọc cơ thể, ít calo",
                        "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=700&q=85",
                        250.0, "g", 6),

                food("carrot", "Cà rốt", "Rau Củ", 41.0, 0.9, 9.6, 0.2,
                        "Beta-carotene, vitamin A, chất xơ", "Tốt cho thị lực và hệ miễn dịch",
                        "https://images.unsplash.com/photo-1447175008436-170170753e16?auto=format&fit=crop&w=700&q=85",
                        3.0, "củ", 14),

                food("potato", "Khoai tây", "Rau Củ", 77.0, 2.0, 17.0, 0.1,
                        "Tinh bột kháng, kali, vitamin B6", "Bổ sung năng lượng lành mạnh",
                        "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=700&q=85",
                        4.0, "củ", 21),

                food("shallot", "Hành tím", "Gia vị", 40.0, 1.1, 9.3, 0.1,
                        "Flavonoid, hợp chất lưu huỳnh", "Kháng viêm, tăng hương vị món ăn",
                        "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=700&q=85",
                        5.0, "củ", 30),

                food("garlic", "Tỏi", "Gia vị", 149.0, 6.4, 33.0, 0.5,
                        "Allicin, chất chống oxy hóa", "Tăng cường miễn dịch, tiêu hoá",
                        "https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?auto=format&fit=crop&w=700&q=85",
                        3.0, "củ", 45),

                food("ginger", "Gừng tươi", "Gia vị", 80.0, 1.8, 18.0, 0.8,
                        "Gingerol, tinh dầu gừng", "Ấm bụng, giảm viêm, chống cảm",
                        "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=700&q=85",
                        2.0, "củ", 30),

                food("milk", "Sữa tươi", "Nguyên liệu", 120.0, 8.0, 12.0, 5.0,
                        "Canxi, vitamin D, protein casein", "Chắc khỏe xương và răng",
                        "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=700&q=85",
                        1.0, "lít", 7),

                food("yogurt", "Sữa chua", "Nguyên liệu", 95.0, 10.0, 3.6, 0.4,
                        "Men vi sinh Probiotic, protein", "Hỗ trợ tiêu hóa đường ruột",
                        "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=700&q=85",
                        4.0, "hộp", 10),

                food("avocado", "Quả bơ", "Trái Cây", 160.0, 2.0, 8.5, 14.7,
                        "Chất béo không bão hòa đơn, kali", "Tốt cho tim mạch, no lâu",
                        "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=700&q=85",
                        2.0, "quả", 5),

                food("banana", "Chuối", "Trái Cây", 89.0, 1.1, 22.8, 0.3,
                        "Kali, carbohydrate phức hợp", "Bổ sung năng lượng tức thì",
                        "https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&w=700&q=85",
                        5.0, "quả", 6),

                food("rice", "Cơm trắng", "Nguyên liệu", 130.0, 2.7, 28.0, 0.3,
                        "Carbohydrate, tinh bột", "Nguồn tinh bột chính cho bữa ăn",
                        "https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=700&q=85",
                        500.0, "g", 3),

                food("tofu", "Đậu hũ", "Nguyên liệu", 76.0, 8.0, 2.0, 4.5,
                        "Protein thực vật, isoflavone", "Đạm thực vật thanh đạm",
                        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=700&q=85",
                        2.0, "hộp", 5),

                food("cheese", "Phô mai", "Nguyên liệu", 402.0, 25.0, 1.3, 33.0,
                        "Canxi, chất béo, protein", "Giàu năng lượng và béo thơm",
                        "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=700&q=85",
                        200.0, "g", 30)
        );

        foodRepository.saveAll(foods);
        log.info("Đã seed {} loại thực phẩm mẫu vào catalog", foods.size());
    }

    private Food food(String sourceKey, String name, String type, Double kcal, Double p, Double c, Double f,
                      String comp, String benefit, String img, Double defaultQty, String unit, Integer expiryDays) {
        return Food.builder()
                .sourceKey(sourceKey)
                .name(name)
                .type(type)
                .kcal(kcal)
                .protein(p)
                .carb(c)
                .fat(f)
                .components(comp)
                .benefit(benefit)
                .imageUrl(img)
                .defaultQuantity(defaultQty)
                .unit(unit)
                .defaultExpiryDays(expiryDays)
                .customFood(false)
                .createdAt(LocalDateTime.now())
                .build();
    }

    // =========================================================================
    // 3. SEED FRIDGE ITEMS
    // =========================================================================
    private void seedFridgeItems() {
        if (fridgeItemRepository.count() > 0) {
            return;
        }

        List<User> allUsers = userRepository.findAll();
        if (allUsers.isEmpty()) {
            return;
        }

        Map<String, Food> foodMap = new HashMap<>();
        for (Food f : foodRepository.findAll()) {
            if (f.getSourceKey() != null) {
                foodMap.put(f.getSourceKey(), f);
            }
        }

        LocalDate today = LocalDate.now();
        List<FridgeItem> items = new ArrayList<>();

        for (User user : allUsers) {
            // Thêm các món cho từng user
            addItem(items, user, foodMap.get("egg"), 10.0, "quả", today.plusDays(14), "Trứng gà Ba Huân mua tại WinMart");
            addItem(items, user, foodMap.get("chicken"), 450.0, "g", today.plusDays(2), "Ức gà để ngăn mát, cần nấu sớm"); // Sắp hết hạn
            addItem(items, user, foodMap.get("beef"), 300.0, "g", today.plusDays(4), "Bảo quản ngăn mát 2°C làm bò xào");
            addItem(items, user, foodMap.get("salmon"), 300.0, "g", today.plusDays(3), "Phi lê cá hồi Nauy tươi");
            addItem(items, user, foodMap.get("tomato"), 4.0, "quả", today.plusDays(1), "Cà chua chín mềm, dùng làm canh hoặc sốt"); // Sắp hết hạn
            addItem(items, user, foodMap.get("broccoli"), 250.0, "g", today.plusDays(5), "Bông cải đã rửa sạch để ráo");
            addItem(items, user, foodMap.get("carrot"), 3.0, "củ", today.plusDays(10), "Bảo quản ngăn rau củ");
            addItem(items, user, foodMap.get("milk"), 1.0, "lít", today.plusDays(1), "Sữa tươi thanh trùng mở nắp hôm qua"); // Sắp hết hạn
            addItem(items, user, foodMap.get("yogurt"), 4.0, "hộp", today.plusDays(8), "Sữa chua không đường ăn sáng");
            addItem(items, user, foodMap.get("avocado"), 2.0, "quả", today.plusDays(3), "Quả bơ sáp 034");
            addItem(items, user, foodMap.get("potato"), 4.0, "củ", today.plusDays(18), "Bảo quản nơi khô ráo thoáng mát");
            addItem(items, user, foodMap.get("banana"), 5.0, "quả", today.plusDays(2), "Chuối tiêu chín tự nhiên"); // Sắp hết hạn
            addItem(items, user, foodMap.get("rice"), 500.0, "g", today.plusDays(2), "Cơm nguội dùng chiên cơm");
            addItem(items, user, foodMap.get("tofu"), 2.0, "hộp", today.plusDays(4), "Đậu hũ non nấu canh rong biển");
            addItem(items, user, foodMap.get("shallot"), 5.0, "củ", today.plusDays(25), "Hành tím phi thơm");
            addItem(items, user, foodMap.get("garlic"), 3.0, "củ", today.plusDays(40), "Tỏi Hải Dương");
            addItem(items, user, foodMap.get("pork"), 200.0, "g", today.minusDays(1), "Thịt heo xay bảo quản ngăn mát - đã quá hạn"); // Đã hết hạn
        }

        fridgeItemRepository.saveAll(items);
        log.info("Đã seed {} nguyên liệu trong tủ lạnh cho {} người dùng", items.size(), allUsers.size());
    }

    private void addItem(List<FridgeItem> list, User user, Food food, Double quantity, String unit,
                         LocalDate expiresAt, String note) {
        if (user == null || food == null) {
            return;
        }
        LocalDateTime now = LocalDateTime.now();
        list.add(FridgeItem.builder()
                .user(user)
                .food(food)
                .quantity(quantity)
                .unit(unit)
                .expiresAt(expiresAt)
                .note(note)
                .createdAt(now)
                .updatedAt(now)
                .build());
    }

    // =========================================================================
    // 4. SEED RECIPES (24 MÓN ĂN ĐA DẠNG SÁNG - TRƯA - TỐI)
    // =========================================================================
    private void seedRecipes() {
        if (recipeRepository.count() >= 15) {
            return;
        }
        List<Recipe> recipes = List.of(
                // --- BỮA SÁNG (350 - 500 kcal) ---
                recipe("Phở bò tái Hà Nội", "Tô phở nước dùng trong veo, thơm thảo quả hồi quế, thịt bò mềm và bánh phở dẻo mềm.",
                        "Ninh xương bò với gừng hành nướng trong 90 phút.\nTrụng bánh phở, xếp thịt bò tái mỏng lên trên.\nChan nước dùng sôi sùng sục, rắc hành hoa, ngò gai.\nĂn kèm chanh ớt và quẩy nóng.",
                        45, "Trung bình", 1, 480, 32, 55, 14, "morning"),
                recipe("Bánh mì trứng ốp la bơ tỏi", "Bánh mì vỏ giòn rụm, kẹp 2 trứng ốp la lòng đào béo ngậy sốt tương ớt đậm đà.",
                        "Chiên trứng ốp la lòng đào với chút bơ thơm.\nNướng nóng giòn ổ bánh mì, phết patê và sốt bơ tỏi.\nKẹp trứng, dưa leo, ngò rí và chan nước tương tỏi ớt.",
                        10, "Dễ", 1, 420, 18, 46, 18, "morning"),
                recipe("Cháo gà xé gừng hành hoa", "Tô cháo gà nóng hổi sánh mịn, thịt gà ta dai ngọt xé sợi thơm mùi tiêu gừng.",
                        "Gạo tẻ nấu nhừ cùng nước luộc gà trong 30 phút.\nỨc gà luộc chín xé sợi, ướp tiêu và nước mắm.\nMúc cháo ra tô, cho gà lên, rắc hành ngò, gừng tươi thái chỉ và tiêu.",
                        30, "Dễ", 1, 380, 28, 42, 9, "morning"),
                recipe("Yến mạch hoa quả hạt chia sữa chua", "Bữa sáng Eat Clean thanh nhẹ, giàu chất xơ và vitamin giúp no lâu tràn năng lượng.",
                        "Ngâm 40g yến mạch với 100ml sữa tươi ấm 5 phút.\nTrộn cùng 1 hộp sữa chua không đường và 1 thìa hạt chia.\nThêm chuối cắt lát, bơ sáp và dâu tây lên trên, thưởng thức ngay.",
                        5, "Dễ", 1, 360, 16, 52, 10, "morning"),
                recipe("Hủ tiếu Nam Vang tôm thịt", "Hủ tiếu dai ngon, nước lèo xương hầm ngọt thanh, tôm tươi giòn ngọt và thịt băm thơm nức.",
                        "Nấu nước dùng từ xương ống và củ cải trắng.\nTrụng hủ tiếu dai, xếp tôm luộc, thịt nạc xá xíu, trứng cút.\nChan nước lèo nóng, thêm tỏi phi thơm và hẹ lá.",
                        35, "Trung bình", 1, 490, 30, 58, 15, "morning"),
                recipe("Bún mọc sườn non dọc mùng", "Bát bún thanh tao, mọc giòn sần sật mộc nhĩ nấm hương quyện nước dùng sườn đậm đà.",
                        "Ninh sườn non lấy nước ngọt trong 40 phút.\nQuết giò sống với mộc nhĩ nấm hương vo viên thả vào nồi sôi.\nTrụng bún, thêm dọc mùng chần giòn, chan nước dùng thơm ngát.",
                        40, "Trung bình", 1, 460, 34, 48, 14, "morning"),
                recipe("Bánh cuốn nóng chả lụa", "Bánh cuốn mỏng mềm mướt nhân thịt mộc nhĩ, rắc hành phi giòn tan và chả quế thơm lừng.",
                        "Hấp bánh tráng mỏng cuộn nhân thịt băm mộc nhĩ phi thơm.\nXếp bánh ra đĩa, thêm vài lát chả lụa, rắc đầy hành phi.\nChấm cùng nước mắm chua ngọt ấm dịu và rau thơm.",
                        20, "Dễ", 1, 410, 20, 54, 12, "morning"),
                recipe("Cơm chiên trứng xúc xích kiểu Việt", "Hạt cơm vàng óng tơi xốp quyện trứng gà ta và xúc xích thơm ngậy nhanh gọn.",
                        "Cơm nguội trộn đều với 2 lòng đỏ trứng gà.\nPhi thơm tỏi, cho cơm vào đảo lửa lớn đến khi hạt cơm săn tơi.\nThêm xúc xích, hành hoa, nêm xì dầu và tiêu xay.",
                        15, "Dễ", 1, 430, 19, 56, 15, "morning,lunch"),

                // --- BỮA TRƯA (550 - 750 kcal) ---
                recipe("Cơm tấm sườn nướng mật ong", "Đĩa cơm tấm dẻo thơm, sườn nướng vàng óng đậm đà mật ong sả tỏi và trứng ốp la.",
                        "Ướp sườn cốt lết với mật ong, dầu hào, sả băm 30 phút rồi nướng than hoặc nồi chiên không dầu.\nXới cơm tấm nóng, đặt sườn nướng, trứng ốp la và đồ chua.\nChan mỡ hành béo ngậy và nước mắm kẹo chua ngọt.",
                        35, "Trung bình", 1, 680, 42, 75, 22, "lunch,dinner"),
                recipe("Cơm bò lúc lắc khoai tây sốt tiêu", "Thịt bò thăn mềm mọng nước xào lửa lớn với ớt chuông hành tây và sốt bơ tỏi.",
                        "Bò thăn thái quân cờ, ướp tỏi băm, dầu hào, xì dầu và tiêu đen.\nXào bò lửa lớn trong chảo gang 3 phút cho chín tới mềm mọng.\nĂn kèm cơm trắng nóng, khoai tây chiên vàng và xà lách cà chua.",
                        25, "Trung bình", 1, 650, 40, 68, 24, "lunch,dinner"),
                recipe("Bún chả Hà Nội nướng than", "Chả miếng và chả viên nướng xém cạnh thơm phức ngập trong bát nước mắm đu đủ chua ngọt.",
                        "Ướp thịt ba chỉ và thịt băm với hành khô, nước hàng, nước mắm rồi nướng xém vàng.\nPha nước chấm ấm vị chua ngọt dịu, thả đu đủ cà rốt giòn.\nĂn cùng bún tươi lá và đĩa rau sống tươi mát.",
                        35, "Trung bình", 1, 590, 36, 64, 19, "lunch"),
                recipe("Cơm ức gà áp chảo sốt bơ tỏi & bông cải", "Thực đơn Eat Clean tăng cơ giảm mỡ: Ức gà mềm ngọt thơm bơ tỏi kèm bông cải xanh.",
                        "Ức gà khía nhẹ, ướp muối tiêu và dầu ô-liu 10 phút.\nÁp chảo mỗi mặt 4-5 phút cho vàng ruộm rồi rưới sốt bơ tỏi.\nĂn kèm cơm gạo lứt (hoặc cơm trắng) và bông cải xanh luộc giòn ngọt.",
                        20, "Dễ", 1, 550, 48, 55, 14, "lunch,dinner"),
                recipe("Cơm cá basa kho tộ & canh cải thìa", "Cá basa kho tộ keo màu cánh gián thơm cay nồng nàn đưa cơm cực đỉnh.",
                        "Cá basa ướp nước màu, nước mắm ngon, ớt hiểm và đầu hành 20 phút.\nKho lửa nhỏ trong tộ đất đến khi nước kho sánh kẹo đậm đà.\nDùng cùng cơm nóng và bát canh cải thìa nấu tôm ngọt mát.",
                        30, "Trung bình", 1, 580, 38, 66, 17, "lunch,dinner"),
                recipe("Cơm sườn non rim chua ngọt", "Từng miếng sườn non óng ả sốt chua ngọt đậm đà, mềm róc xương chuẩn vị cơm nhà.",
                        "Sườn chặt miếng vừa ăn, luộc sơ rồi chiên vàng nhẹ các mặt.\nPha sốt me chua ngọt tỏi ớt, đảo đều cùng sườn trên lửa nhỏ 15 phút.\nRắc hành lá, ăn cùng cơm nóng và dưa leo giòn.",
                        30, "Trung bình", 1, 630, 39, 70, 21, "lunch,dinner"),
                recipe("Mì Ý sốt bò bằm cà chua phô mai", "Sợi mì Spaghetti dai chuẩn dẻo quyện sốt bò bằm cà chua tươi và phô mai béo ngậy.",
                        "Luộc mì Ý chuẩn al dente trong 8-9 phút với chút muối.\nXào thịt bò bằm với hành tây tỏi băm và sốt cà chua tươi đun sệt.\nTrộn mì cùng sốt, rắc phô mai Parmesan bào sợi và lá oregano.",
                        25, "Dễ", 1, 610, 35, 72, 20, "lunch,dinner"),
                recipe("Bún bò Huế bắp bò chả cua", "Tô bún bò cay nồng thơm mùi sả ruốc Huế, miếng bắp bò hoa giòn ngọt đậm đà.",
                        "Hầm xương bò và giò heo với sả cây đập dập và mắm ruốc Huế hòa tan.\nThái bắp bò mỏng, thả chả cua viên vào nồi sôi.\nTrụng sợi bún to, xếp thịt chan nước dùng cay nồng thơm lừng.",
                        50, "Khó", 1, 620, 42, 65, 20, "lunch"),

                // --- BỮA TỐI (450 - 650 kcal) ---
                recipe("Cá hồi áp chảo măng tây sốt chanh leo", "Phi lê cá hồi Nauy da giòn thịt mềm mọng sốt chanh leo chua thanh quý phái.",
                        "Cá hồi ướp chút muối tiêu áp chảo phần da giòn rụm trong 5 phút.\nNấu sốt cốt chanh leo với chút bơ và mật ong sánh nhẹ.\nXào nhanh măng tây tỏi, xếp cá ra đĩa và rưới sốt chanh leo tuyệt hảo.",
                        20, "Dễ", 1, 520, 44, 25, 26, "dinner"),
                recipe("Canh chua cá lóc miền Tây & cá kho tộ", "Bữa cơm tối miền Tây ấm cúng: Canh chua thanh mát ngọt dịu ăn cùng cá kho keo.",
                        "Nấu nước me chua ngọt cùng cà chua dứa đậu bắp và cá lóc tươi.\nThêm ngò gai rau om dậy mùi thơm nức mũi.\nDùng nóng kèm cơm trắng và cá lóc kho tộ cay cay.",
                        35, "Trung bình", 1, 540, 42, 50, 16, "dinner"),
                recipe("Canh sườn hầm rau củ ngũ sắc & cơm", "Món canh thanh ngọt tự nhiên từ cà rốt, khoai tây, bắp ngọt hầm sườn non mềm rục.",
                        "Ninh sườn non 30 phút cho mềm và ngọt nước dùng.\nCho bắp ngọt, cà rốt, khoai tây và nấm hương vào hầm thêm 15 phút.\nMúc ra tô rắc hành mùi tiêu, ăn cùng cơm nóng nhẹ bụng dễ tiêu.",
                        35, "Trung bình", 1, 510, 36, 58, 15, "dinner"),
                recipe("Đậu hũ dồn thịt sốt cà chua & cơm", "Đậu hũ chiên vàng nhồi thịt mộc nhĩ mềm thơm ngập trong sốt cà chua sóng sánh.",
                        "Đậu hũ khoét ruột, nhồi thịt heo băm mộc nhĩ nấm hương đã ướp vị.\nChiên sơ mặt thịt, cho vào nồi sốt cà chua đun liu riu 15 phút ngấm đều.\nRắc hành lá tiêu xay, dùng cùng cơm trắng nóng hổi.",
                        25, "Dễ", 1, 480, 32, 54, 16, "dinner,lunch"),
                recipe("Thịt bò xào cần tỏi & canh rong biển đậu hũ", "Thịt bò thăn mềm ngọt xào cần tây tỏi thơm lừng ăn kèm canh rong biển thanh đạm.",
                        "Bò thái mỏng ướp tỏi gừng dầu hào, xào nhanh lửa lớn với cần tây.\nNấu canh rong biển đậu hũ non với chút tôm băm thơm nhẹ.\nBữa tối cân bằng đạm và vi chất dinh dưỡng, nhẹ bụng ngủ ngon.",
                        20, "Dễ", 1, 530, 45, 42, 18, "dinner"),
                recipe("Salad tôm nướng quả bơ sốt mè rang", "Salad thanh mát giòn rụm: Tôm sú áp chảo ngọt thịt kết hợp bơ sáp béo bùi và xà lách.",
                        "Tôm bóc vỏ ướp muối ớt nướng chín tới giữ độ mọng nước.\nThái lát bơ sáp, cà chua bi, dưa leo và xà lách xoăn tươi giòn.\nBày ra đĩa, rưới sốt mè rang béo thơm hấp dẫn.",
                        15, "Dễ", 1, 460, 34, 28, 22, "dinner"),
                recipe("Gà hấp lá chanh & canh bí đao tôm tươi", "Thịt gà ta hấp lá chanh vàng ươm da giòn thịt ngọt kèm canh bí đao ngọt thanh mát.",
                        "Gà ướp chút muối gừng hấp cách thủy cùng lá chanh 25 phút thơm phức.\nNấu canh bí đao thái lát với tôm tươi băm nhỏ ngọt lịm.\nBữa tối chuẩn cơm nhà bổ dưỡng, ít calo và thanh lọc cơ thể.",
                        30, "Dễ", 1, 490, 46, 38, 14, "dinner"),
                recipe("Gà kho gừng sả ớt & canh rau ngót", "Gà kho đậm đà màu cánh gián cay ấm nồng nàn kết hợp canh rau ngót thịt băm ngọt mát.",
                        "Gà chặt miếng ướp nước mắm, gừng thái sợi, sả băm và nước màu 15 phút.\nKho gà săn lại rồi đun liu riu đến khi cạn sốt óng ả.\nĂn cùng cơm nóng và bát canh rau ngót thịt nạc băm mát lành.",
                        30, "Dễ", 1, 520, 40, 52, 16, "dinner,lunch")
        );
        recipeRepository.saveAll(recipes);
        log.info("Đã seed bổ sung {} công thức món ăn phong phú chuẩn Việt Nam vào catalog", recipes.size());
    }

    private Recipe recipe(String title, String desc, String steps, int time, String diff, int serve,
                          int kcal, int p, int c, int f, String slots) {
        return Recipe.builder()
                .title(title)
                .description(desc)
                .instructions(steps)
                .prepTime(5)
                .cookTime(time)
                .servings(serve)
                .cuisine("Việt Nam")
                .category("Món chính")
                .kcal(kcal)
                .protein((double) p)
                .carb((double) c)
                .fat((double) f)
                .difficulty(diff)
                .mealSlots(slots)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }
}