package com.nhom6.foodx.common.config;

import com.nhom6.foodx.auth.entity.User;
import com.nhom6.foodx.auth.repository.UserRepository;
import com.nhom6.foodx.food.entity.Food;
import com.nhom6.foodx.food.repository.FoodRepository;
import com.nhom6.foodx.fridge.entity.FridgeItem;
import com.nhom6.foodx.fridge.repository.FridgeItemRepository;
import com.nhom6.foodx.ingredient.entity.Ingredient;
import com.nhom6.foodx.ingredient.repository.IngredientRepository;
import com.nhom6.foodx.recipe.entity.Recipe;
import com.nhom6.foodx.recipe.entity.RecipeIngredient;
import com.nhom6.foodx.recipe.repository.RecipeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.text.Normalizer;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * Seed dữ liệu mẫu cho ứng dụng (User, Catalog Food, Tủ lạnh Fridge, Công thức Recipe).
 * CHỈ chạy ở môi trường không phải prod (dev, ai-test, test...) để tránh tạo
 * tài khoản demo có mật khẩu yếu trên production.
 */
@Slf4j
@Component
@Profile("!prod")
@Transactional
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final FoodRepository foodRepository;
    private final FridgeItemRepository fridgeItemRepository;
    private final RecipeRepository recipeRepository;
    private final IngredientRepository ingredientRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedUsers();
        seedFoods();
        seedFridgeItems();
        seedRecipes();
        // Bổ sung nguyên liệu/category/ảnh cho dữ liệu recipe đã tồn tại từ các lần chạy trước
        seedExistingRecipeData();
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
        List<Recipe> seedList = List.of(
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

        List<Recipe> recipes = new ArrayList<>(seedList);
        // Bổ sung món tráng miệng để catalog đa dạng
        recipes.add(recipe("Bánh flan caramel sữa tươi", "Món tráng miệng mềm mịn thơm vị caramel tự làm tại nhà chỉ với trứng, sữa tươi và đường.",
                "Thắng đường với chút nước đến khi vàng cánh gián rồi tráng đáy khuôn.\nĐánh tan trứng với sữa tươi, lọc qua rây cho mịn.\nĐổ sữa trứng vào khuôn, hấp cách thủy lửa nhỏ 30 phút hoặc nướng cách thủy 160°C.\nĐể nguội rồi cho tủ lạnh, úp ra đĩa khi ăn.",
                40, "Trung bình", 4, 220, 6, 30, 9, "dessert"));
        recipes.add(recipe("Chè đậu đen nước cốt dừa", "Bát chè đậu đen bùi bùi ngọt thanh, chan nước cốt dừa béo thơm chuẩn vị.",
                "Vo sạch đậu đen, ngâm 4-6 tiếng rồi nấu nhừ với chút muối.\nCho đường vào khuấy tan, nêm ngọt vừa ăn.\nMúc chè ra bát, chan nước cốt dừa và rắc dừa nạo lên trên.",
                90, "Dễ", 4, 260, 9, 48, 5, "dessert"));
        recipes.add(recipe("Sinh tố bơ chuối sữa chua", "Ly sinh tố bơ béo ngậy quyện chuối chín và sữa chua mát lạnh, đầy năng lượng.",
                "Bơ chín bỏ hạt, chuối lột vỏ cắt khúc.\nCho bơ, chuối, sữa chua, sữa tươi và mật ong vào máy xay.\nXay nhuyễn mịn rồi rót ra ly, thêm đá bào và thưởng thức ngay.",
                10, "Dễ", 2, 290, 6, 38, 13, "dessert"));

        // Gắn category phong phú, ảnh local và danh sách nguyên liệu thật cho từng món
        for (Recipe r : recipes) {
            enrichRecipeData(r);
        }
        recipeRepository.saveAll(recipes);
        log.info("Đã seed {} công thức món ăn chuẩn Việt Nam (kèm nguyên liệu, category, ảnh local) vào catalog", recipes.size());
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

    // =========================================================================
    // 4b. ENRICH RECIPES: category đa dạng + ảnh local + NGUYÊN LIỆU THẬT
    //     (Tên nguyên liệu dùng đúng tên trong catalog Food/Fridge để tính năng
    //      "khớp tủ lạnh" & gợi ý món hoạt động với dữ liệu thật)
    // =========================================================================

    private void seedExistingRecipeData() {
        // Dữ liệu recipe đã tồn tại từ các lần chạy trước (chưa có nguyên liệu) → bổ sung
        List<Recipe> existing = recipeRepository.findAll();
        int enriched = 0;
        for (Recipe r : existing) {
            if (r.getIngredients() == null || r.getIngredients().isEmpty()) {
                enrichRecipeData(r);
                recipeRepository.save(r);
                enriched++;
            }
        }
        if (enriched > 0) {
            log.info("Đã bổ sung nguyên liệu/category/ảnh cho {} công thức đang có sẵn", enriched);
        }
    }

    /** Gắn category, ảnh local (nếu thiếu) và nguyên liệu (nếu chưa có) theo metadata seed. */
    private void enrichRecipeData(Recipe r) {
        String[] meta = SEED_RECIPE_META.get(r.getTitle().trim());
        if (meta != null) {
            r.setCategory(meta[0]);
        }
        if (r.getImageUrl() == null || r.getImageUrl().isBlank()) {
            r.setImageUrl(localRecipeImage(r.getTitle()));
        }
        if (r.getIngredients() != null && !r.getIngredients().isEmpty()) {
            return;
        }
        if (meta == null || meta.length < 2) {
            return;
        }
        List<RecipeIngredient> ings = new ArrayList<>();
        for (int i = 1; i < meta.length; i++) {
            String[] parts = meta[i].split("\\|", 3);
            String name = parts.length > 0 ? parts[0].trim() : "";
            if (name.isEmpty()) {
                continue;
            }
            double qty = 1.0;
            try {
                qty = Double.parseDouble(parts[1].trim());
            } catch (Exception ignored) {
                // giữ mặc định 1.0
            }
            String unit = parts.length > 2 && !parts[2].isBlank() ? parts[2].trim() : "phần";
            Ingredient ing = ingredientRepository.findByNameIgnoreCase(name)
                    .orElseGet(() -> ingredientRepository.save(Ingredient.builder()
                            .name(name)
                            .category("Thực phẩm")
                            .createdAt(LocalDateTime.now())
                            .updatedAt(LocalDateTime.now())
                            .build()));
            ings.add(RecipeIngredient.builder()
                    .recipe(r)
                    .ingredient(ing)
                    .quantity(qty)
                    .unit(unit)
                    .build());
        }
        r.setIngredients(ings);
    }

    /** Ảnh local theo slug tên món (đã có sẵn trong static/images/foods), fallback ảnh mặc định. */
    private String localRecipeImage(String title) {
        String slug = slugify(title);
        String rel = "/images/foods/" + slug + ".jpg";
        try {
            if (new ClassPathResource("static" + rel).exists()) {
                return rel;
            }
        } catch (Exception ignored) {
            // kiểm tra tiếp đường dẫn source
        }
        if (Files.exists(Paths.get("src/main/resources/static" + rel))) {
            return rel;
        }
        return "/images/recipes/default-recipe.jpg";
    }

    private static String slugify(String input) {
        if (input == null || input.isBlank()) {
            return "default";
        }
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        String noAccents = Pattern.compile("\\p{InCombiningDiacriticalMarks}+")
                .matcher(normalized).replaceAll("")
                .replace("đ", "d").replace("Đ", "D");
        return noAccents.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-+|-+$", "")
                .replaceAll("^$", "default");
    }

    /**
     * Metadata seed cho công thức: [category, "nguyên liệu|số lượng|đơn vị", ...].
     * Tên nguyên liệu khớp với tên thực phẩm trong catalog Food để demo "khớp tủ" chạy thật.
     */
    private static final Map<String, String[]> SEED_RECIPE_META = buildSeedRecipeMeta();

    private static Map<String, String[]> buildSeedRecipeMeta() {
        Map<String, String[]> m = new HashMap<>();
        m.put("Phở bò tái Hà Nội", new String[]{"Món sáng",
                "Thịt bò|300|g", "Xương ống bò|500|g", "Bánh phở tươi|400|g", "Hành tím|2|củ",
                "Gừng tươi|1|củ", "Hành lá|1|bó", "Chanh|1|quả", "Ớt tươi|2|quả", "Rau thơm|1|bó"});
        m.put("Bánh mì trứng ốp la bơ tỏi", new String[]{"Món nhanh",
                "Trứng gà|2|quả", "Bánh mì|2|ổ", "Tỏi|1|củ", "Bơ lạt|10|g", "Dưa leo|1|quả", "Tương ớt|1|muỗng"});
        m.put("Cháo gà xé gừng hành hoa", new String[]{"Món sáng",
                "Ức gà|200|g", "Gạo tẻ|100|g", "Gừng tươi|1|củ", "Hành tím|1|củ", "Hành lá|1|bó", "Nước mắm|1|muỗng"});
        m.put("Yến mạch hoa quả hạt chia sữa chua", new String[]{"Món sáng",
                "Yến mạch cán dẹt|40|g", "Sữa tươi|100|ml", "Sữa chua|1|hộp", "Chuối|1|quả",
                "Quả bơ|1|quả", "Hạt chia|1|muỗng", "Mật ong|1|muỗng"});
        m.put("Hủ tiếu Nam Vang tôm thịt", new String[]{"Món sáng",
                "Tôm tươi|150|g", "Thịt heo|150|g", "Hủ tiếu khô|200|g", "Củ cải trắng|1|củ",
                "Trứng cút|6|quả", "Tỏi|1|củ", "Hành lá|1|bó"});
        m.put("Bún mọc sườn non dọc mùng", new String[]{"Món sáng",
                "Thịt heo|200|g", "Sườn non|300|g", "Bún tươi|300|g", "Dọc mùng|1|bó",
                "Nấm hương|5|cái", "Hành tím|1|củ"});
        m.put("Bánh cuốn nóng chả lụa", new String[]{"Món sáng",
                "Thịt heo|150|g", "Bột gạo|200|g", "Chả lụa|200|g", "Mộc nhĩ|5|cái",
                "Hành tím|2|củ", "Nước mắm|1|muỗng"});
        m.put("Cơm chiên trứng xúc xích kiểu Việt", new String[]{"Món nhanh",
                "Cơm trắng|400|g", "Trứng gà|2|quả", "Xúc xích|2|cây", "Tỏi|1|củ", "Hành lá|1|bó", "Xì dầu|1|muỗng"});
        m.put("Cơm tấm sườn nướng mật ong", new String[]{"Món chính",
                "Thịt heo|300|g", "Cơm trắng|300|g", "Trứng gà|1|quả", "Cà rốt|1|củ",
                "Tỏi|1|củ", "Mật ong|2|muỗng", "Dầu hào|1|muỗng"});
        m.put("Cơm bò lúc lắc khoai tây sốt tiêu", new String[]{"Món chính",
                "Thịt bò|300|g", "Khoai tây|2|củ", "Cơm trắng|300|g", "Hành tím|2|củ",
                "Tỏi|1|củ", "Ớt chuông|1|quả", "Cà chua|2|quả"});
        m.put("Bún chả Hà Nội nướng than", new String[]{"Món chính",
                "Thịt heo|350|g", "Bún tươi|300|g", "Cà rốt|1|củ", "Đu đủ xanh|1|quả",
                "Tỏi|1|củ", "Ớt tươi|2|quả", "Rau sống|1|đĩa"});
        m.put("Cơm ức gà áp chảo sốt bơ tỏi & bông cải", new String[]{"Món ăn kiêng",
                "Ức gà|250|g", "Bông cải xanh|200|g", "Tỏi|1|củ", "Cơm gạo lứt|150|g",
                "Dầu ô liu|1|muỗng", "Bơ lạt|10|g"});
        m.put("Cơm cá basa kho tộ & canh cải thìa", new String[]{"Món chính",
                "Cá basa|300|g", "Cơm trắng|300|g", "Hành tím|1|củ", "Ớt tươi|2|quả",
                "Tôm tươi|50|g", "Cải thìa|200|g", "Hành lá|1|bó"});
        m.put("Cơm sườn non rim chua ngọt", new String[]{"Món chính",
                "Sườn non|400|g", "Cơm trắng|300|g", "Cà chua|2|quả", "Tỏi|1|củ",
                "Dưa leo|1|quả", "Hành tím|1|củ"});
        m.put("Mì Ý sốt bò bằm cà chua phô mai", new String[]{"Món chính",
                "Mì Ý|250|g", "Thịt bò|200|g", "Cà chua|3|quả", "Phô mai|50|g", "Tỏi|1|củ", "Dầu ô liu|1|muỗng"});
        m.put("Bún bò Huế bắp bò chả cua", new String[]{"Món chính",
                "Thịt bò|300|g", "Giò heo|400|g", "Bún tươi|300|g", "Thịt cua|100|g",
                "Sả|2|cây", "Hành tím|1|củ", "Ớt bột|1|muỗng"});
        m.put("Cá hồi áp chảo măng tây sốt chanh leo", new String[]{"Món ăn kiêng",
                "Cá hồi|250|g", "Măng tây|150|g", "Chanh leo|2|quả", "Tỏi|1|củ",
                "Bơ lạt|10|g", "Mật ong|1|muỗng"});
        m.put("Canh chua cá lóc miền Tây & cá kho tộ", new String[]{"Món chính",
                "Cá lóc|500|g", "Cơm trắng|300|g", "Cà chua|2|quả", "Dứa|1|quả",
                "Đậu bắp|100|g", "Me chua|1|muỗng", "Hành lá|1|bó", "Ớt tươi|2|quả"});
        m.put("Canh sườn hầm rau củ ngũ sắc & cơm", new String[]{"Món chính",
                "Sườn non|350|g", "Cà rốt|1|củ", "Khoai tây|1|củ", "Bắp ngọt|1|trái",
                "Nấm hương|5|cái", "Cơm trắng|250|g", "Hành lá|1|bó"});
        m.put("Đậu hũ dồn thịt sốt cà chua & cơm", new String[]{"Món chính",
                "Đậu hũ|2|hộp", "Thịt heo|150|g", "Cà chua|3|quả", "Cơm trắng|300|g",
                "Mộc nhĩ|3|cái", "Hành tím|1|củ", "Hành lá|1|bó"});
        m.put("Thịt bò xào cần tỏi & canh rong biển đậu hũ", new String[]{"Món chính",
                "Thịt bò|250|g", "Cần tây|200|g", "Tỏi|1|củ", "Rong biển khô|10|g",
                "Đậu hũ|1|hộp", "Tôm tươi|50|g", "Cơm trắng|250|g"});
        m.put("Salad tôm nướng quả bơ sốt mè rang", new String[]{"Món nhanh",
                "Tôm tươi|200|g", "Quả bơ|1|quả", "Cà chua bi|8|quả", "Dưa leo|1|quả",
                "Xà lách xoăn|100|g", "Mè rang|1|muỗng"});
        m.put("Gà hấp lá chanh & canh bí đao tôm tươi", new String[]{"Món ăn kiêng",
                "Thịt gà|400|g", "Lá chanh|5|lá", "Bí đao|300|g", "Tôm tươi|100|g", "Gừng tươi|1|củ"});
        m.put("Gà kho gừng sả ớt & canh rau ngót", new String[]{"Món chính",
                "Thịt gà|500|g", "Gừng tươi|1|củ", "Sả|2|cây", "Ớt tươi|2|quả",
                "Rau ngót|200|g", "Hành tím|1|củ", "Cơm trắng|300|g", "Nước mắm|2|muỗng"});
        m.put("Bánh flan caramel sữa tươi", new String[]{"Món tráng miệng",
                "Trứng gà|4|quả", "Sữa tươi|500|ml", "Đường|100|g", "Vani|1|ống"});
        m.put("Chè đậu đen nước cốt dừa", new String[]{"Món tráng miệng",
                "Đậu đen|200|g", "Nước cốt dừa|200|ml", "Đường|80|g", "Vani|1|ống"});
        m.put("Sinh tố bơ chuối sữa chua", new String[]{"Món tráng miệng",
                "Quả bơ|1|quả", "Chuối|2|quả", "Sữa chua|1|hộp", "Sữa tươi|150|ml", "Mật ong|1|muỗng"});
        return m;
    }
}