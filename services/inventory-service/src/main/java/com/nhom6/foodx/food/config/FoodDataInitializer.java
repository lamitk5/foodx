package com.nhom6.foodx.food.config;

import com.nhom6.foodx.food.entity.Food;
import com.nhom6.foodx.food.repository.FoodRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class FoodDataInitializer implements CommandLineRunner {

    private final FoodRepository foodRepository;

    @Override
    public void run(String... args) {
        if (foodRepository.count() > 0) {
            return;
        }

        log.info("Khoi tao du lieu danh muc thuc pham mau...");

        List<Food> foods = List.of(
                Food.builder().sourceKey("egg").name("Trứng gà").type("Nguyên liệu").kcal(70.0).protein(6.3).carb(0.4).fat(4.8).components("Protein cao, vitamin D, choline").benefit("Giàu protein, tốt cho cơ bắp").imageUrl("/images/foods/egg.jpg").defaultQuantity(6.0).unit("quả").defaultExpiryDays(14).customFood(false).build(),
                Food.builder().sourceKey("chicken").name("Ức gà").type("Nguyên liệu").kcal(165.0).protein(31.0).carb(0.0).fat(3.6).components("Đạm cao, ít béo, sắt, kẽm").benefit("Tăng cơ, kiểm soát cân nặng").imageUrl("/images/foods/chicken.jpg").defaultQuantity(450.0).unit("g").defaultExpiryDays(4).customFood(false).build(),
                Food.builder().sourceKey("beef").name("Thịt bò").type("Nguyên liệu").kcal(250.0).protein(26.0).carb(0.0).fat(15.0).components("Đạm, sắt hema, vitamin B6, B12").benefit("Bổ máu, phát triển cơ bắp").imageUrl("/images/foods/beef.jpg").defaultQuantity(300.0).unit("g").defaultExpiryDays(5).customFood(false).build(),
                Food.builder().sourceKey("pork").name("Thịt heo").type("Nguyên liệu").kcal(242.0).protein(27.0).carb(0.0).fat(14.0).components("Vitamin B1, kẽm, phốt pho").benefit("Giàu năng lượng, thơm ngon").imageUrl("/images/foods/pork.jpg").defaultQuantity(400.0).unit("g").defaultExpiryDays(5).customFood(false).build(),
                Food.builder().sourceKey("salmon").name("Cá hồi").type("Nguyên liệu").kcal(208.0).protein(20.0).carb(0.0).fat(13.0).components("Axit béo Omega-3, DHA, vitamin D").benefit("Tốt cho tim mạch và trí não").imageUrl("/images/foods/salmon.jpg").defaultQuantity(300.0).unit("g").defaultExpiryDays(4).customFood(false).build(),
                Food.builder().sourceKey("shrimp").name("Tôm tươi").type("Nguyên liệu").kcal(99.0).protein(24.0).carb(0.2).fat(0.3).components("Canxi, đạm, iot, selen").benefit("Chắc xương, ít béo").imageUrl("/images/foods/shrimp.jpg").defaultQuantity(300.0).unit("g").defaultExpiryDays(3).customFood(false).build(),
                Food.builder().sourceKey("tomato").name("Cà chua").type("Rau Củ").kcal(22.0).protein(0.9).carb(3.9).fat(0.2).components("Nước, lycopene, vitamin C, kali").benefit("Đẹp da, chống oxy hoá").imageUrl("/images/foods/tomato.jpg").defaultQuantity(4.0).unit("quả").defaultExpiryDays(7).customFood(false).build(),
                Food.builder().sourceKey("broccoli").name("Bông cải xanh").type("Rau Củ").kcal(34.0).protein(2.8).carb(6.6).fat(0.4).components("Chất xơ, vitamin C, vitamin K").benefit("Thanh lọc cơ thể, ít calo").imageUrl("/images/foods/broccoli.jpg").defaultQuantity(250.0).unit("g").defaultExpiryDays(6).customFood(false).build(),
                Food.builder().sourceKey("carrot").name("Cà rốt").type("Rau Củ").kcal(41.0).protein(0.9).carb(9.6).fat(0.2).components("Beta-carotene, vitamin A, chất xơ").benefit("Tốt cho thị lực, miễn dịch").imageUrl("/images/foods/carrot.jpg").defaultQuantity(3.0).unit("củ").defaultExpiryDays(14).customFood(false).build(),
                Food.builder().sourceKey("potato").name("Khoai tây").type("Rau Củ").kcal(77.0).protein(2.0).carb(17.0).fat(0.1).components("Tinh bột kháng, kali, vitamin B6").benefit("Bổ sung năng lượng lành mạnh").imageUrl("/images/foods/potato.jpg").defaultQuantity(4.0).unit("củ").defaultExpiryDays(21).customFood(false).build(),
                Food.builder().sourceKey("shallot").name("Hành tím").type("Gia vị").kcal(40.0).protein(1.1).carb(9.3).fat(0.1).components("Flavonoid, hợp chất lưu huỳnh").benefit("Kháng viêm, tăng hương vị").imageUrl("/images/foods/shallot.jpg").defaultQuantity(5.0).unit("củ").defaultExpiryDays(30).customFood(false).build(),
                Food.builder().sourceKey("garlic").name("Tỏi").type("Gia vị").kcal(149.0).protein(6.4).carb(33.0).fat(0.5).components("Allicin, chất chống oxy hóa").benefit("Tăng cường miễn dịch, tiêu hoá").imageUrl("/images/foods/garlic.jpg").defaultQuantity(3.0).unit("củ").defaultExpiryDays(45).customFood(false).build(),
                Food.builder().sourceKey("ginger").name("Gừng tươi").type("Gia vị").kcal(80.0).protein(1.8).carb(18.0).fat(0.8).components("Gingerol, tinh dầu gừng").benefit("Ấm bụng, giảm viêm, chống cảm").imageUrl("/images/foods/ginger.jpg").defaultQuantity(2.0).unit("củ").defaultExpiryDays(30).customFood(false).build(),
                Food.builder().sourceKey("milk").name("Sữa tươi").type("Nguyên liệu").kcal(120.0).protein(8.0).carb(12.0).fat(5.0).components("Canxi, vitamin D, protein casein").benefit("Chắc khỏe xương và răng").imageUrl("/images/foods/milk.jpg").defaultQuantity(1.0).unit("lít").defaultExpiryDays(7).customFood(false).build(),
                Food.builder().sourceKey("yogurt").name("Sữa chua").type("Nguyên liệu").kcal(95.0).protein(10.0).carb(3.6).fat(0.4).components("Men vi sinh Probiotic, protein").benefit("Hỗ trợ tiêu hóa đường ruột").imageUrl("/images/foods/yogurt.jpg").defaultQuantity(4.0).unit("hộp").defaultExpiryDays(10).customFood(false).build(),
                Food.builder().sourceKey("avocado").name("Quả bơ").type("Trái Cây").kcal(160.0).protein(2.0).carb(8.5).fat(14.7).components("Chất béo không bão hòa đơn, kali").benefit("Tốt cho tim mạch, no lâu").imageUrl("/images/foods/avocado.jpg").defaultQuantity(2.0).unit("quả").defaultExpiryDays(5).customFood(false).build(),
                Food.builder().sourceKey("banana").name("Chuối").type("Trái Cây").kcal(89.0).protein(1.1).carb(22.8).fat(0.3).components("Kali, carbohydrate phức hợp").benefit("Bổ sung năng lượng tức thì").imageUrl("/images/foods/banana.jpg").defaultQuantity(5.0).unit("quả").defaultExpiryDays(6).customFood(false).build(),
                Food.builder().sourceKey("rice").name("Cơm trắng").type("Nguyên liệu").kcal(130.0).protein(2.7).carb(28.0).fat(0.3).components("Carbohydrate, tinh bột").benefit("Nguồn tinh bột chính bữa ăn").imageUrl("/images/foods/rice.jpg").defaultQuantity(500.0).unit("g").defaultExpiryDays(3).customFood(false).build(),
                Food.builder().sourceKey("tofu").name("Đậu hũ").type("Nguyên liệu").kcal(76.0).protein(8.0).carb(2.0).fat(4.5).components("Protein thực vật, isoflavone").benefit("Đạm thực vật thanh đạm").imageUrl("/images/foods/tofu.jpg").defaultQuantity(2.0).unit("hộp").defaultExpiryDays(5).customFood(false).build(),
                Food.builder().sourceKey("cheese").name("Phô mai").type("Nguyên liệu").kcal(402.0).protein(25.0).carb(1.3).fat(33.0).components("Canxi, chất béo, protein").benefit("Giàu năng lượng, béo thơm").imageUrl("/images/foods/cheese.jpg").defaultQuantity(200.0).unit("g").defaultExpiryDays(30).customFood(false).build()
        );

        foodRepository.saveAll(foods);
        log.info("Da khoi tao thanh cong {} loai thuc pham vao danh muc", foods.size());
    }
}
