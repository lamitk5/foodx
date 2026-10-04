package com.nhom6.foodx.recipe.config;

import com.nhom6.foodx.recipe.entity.Recipe;
import com.nhom6.foodx.recipe.repository.RecipeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class RecipeDataInitializer implements CommandLineRunner {

    private final RecipeRepository recipeRepository;

    @Override
    public void run(String... args) {
        if (recipeRepository.count() > 0) {
            return;
        }

        log.info("Khoi tao du lieu cong thuc nau an ban dau...");
        LocalDateTime now = LocalDateTime.now();

        Recipe phoBo = Recipe.builder()
                .title("Phở bò")
                .description("Món ăn truyền thống đặc trưng của Việt Nam với nước dùng thơm ngọt từ xương bò và quế hồi.")
                .instructions("1. Ninh xương ống bò 3-4 tiếng với gừng nướng, quế, hoa hồi.\n2. Thái mỏng thịt bò bắp hoặc bò tái.\n3. Trần bánh phở qua nước sôi, xếp vào bát tô.\n4. Đặt thịt bò, rắc hành lá mùi tàu rồi chan nước dùng sôi sùng sục lên trên.")
                .prepTime(30)
                .cookTime(120)
                .servings(4)
                .cuisine("Việt Nam")
                .category("Món chính")
                .kcal(420)
                .protein(32.0)
                .carb(48.0)
                .fat(10.0)
                .difficulty("Khó")
                .mealSlots("morning,lunch")
                .imageUrl("/images/recipes/pho-bo.jpg")
                .createdAt(now)
                .updatedAt(now)
                .build();

        Recipe comChien = Recipe.builder()
                .title("Cơm chiên trứng")
                .description("Món ăn nhanh gọn, thơm ngon chuẩn vị gia đình tận dụng cơm nguội có sẵn.")
                .instructions("1. Đánh tan 2 quả trứng gà cùng một chút mắm tiêu.\n2. Cho dầu ăn phi thơm hành tím băm nhỏ.\n3. Đổ trứng vào đảo tơi nhẹ rồi trút cơm nguội vào đảo đều tay trên lửa lớn.\n4. Rắc hành hoa và tiêu xay trước khi tắt bếp.")
                .prepTime(5)
                .cookTime(10)
                .servings(1)
                .cuisine("Việt Nam")
                .category("Món chính")
                .kcal(350)
                .protein(12.0)
                .carb(45.0)
                .fat(14.0)
                .difficulty("Dễ")
                .mealSlots("morning,lunch,dinner")
                .imageUrl("/images/recipes/com-chien-trung.jpg")
                .createdAt(now)
                .updatedAt(now)
                .build();

        Recipe gaKhoGung = Recipe.builder()
                .title("Gà kho gừng")
                .description("Thịt gà ta săn chắc đậm đà hương thơm ấm áp từ gừng tươi thái lát.")
                .instructions("1. Chặt gà thành miếng vừa ăn, ướp gừng, hành, nước mắm, đường, hạt nêm trong 20 phút.\n2. Thắng nước màu caramen, cho gà vào xào săn trên lửa lớn.\n3. Thêm nước xăm xắp mặt thịt, hạ nhỏ lửa đun liu riu đến khi nước sốt sệt lại.")
                .prepTime(15)
                .cookTime(25)
                .servings(3)
                .cuisine("Việt Nam")
                .category("Món chính")
                .kcal(310)
                .protein(28.0)
                .carb(6.0)
                .fat(18.0)
                .difficulty("Dễ")
                .mealSlots("lunch,dinner")
                .imageUrl("/images/recipes/ga-kho-gung.jpg")
                .createdAt(now)
                .updatedAt(now)
                .build();

        Recipe caHoiApChao = Recipe.builder()
                .title("Cá hồi áp chảo sốt chanh leo")
                .description("Phi lê cá hồi giòn da ngọt thịt kết hợp sốt chanh dây chua ngọt giàu Omega-3.")
                .instructions("1. Ướp phi lê cá hồi với một nhúm muối tiêu và dầu ô liu.\n2. Áp chảo phần da trước trong 3-4 phút cho giòn rụm rồi lật mặt áp chảo thêm 2 phút.\n3. Đun nước cốt chanh leo cùng ít đường bơ cho sánh mịn.\n4. Rưới sốt lên cá và thưởng thức cùng măng tây hoặc rau củ luộc.")
                .prepTime(10)
                .cookTime(15)
                .servings(2)
                .cuisine("Âu - Á")
                .category("Eatclean")
                .kcal(380)
                .protein(34.0)
                .carb(12.0)
                .fat(22.0)
                .difficulty("Trung bình")
                .mealSlots("lunch,dinner")
                .imageUrl("/images/recipes/ca-hoi-ap-chao.jpg")
                .createdAt(now)
                .updatedAt(now)
                .build();

        recipeRepository.saveAll(List.of(phoBo, comChien, gaKhoGung, caHoiApChao));
        log.info("Da khoi tao thanh cong 4 cong thuc mau: Pho bo, Com chien trung, Ga kho gung, Ca hoi ap chao");
    }
}
