package com.nhom6.foodx.common.config;

import com.nhom6.foodx.recipe.entity.Recipe;
import com.nhom6.foodx.recipe.repository.RecipeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Seed công thức mẫu (từ prototype dk-dn) nếu bảng recipes trống.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final RecipeRepository recipeRepository;

    @Override
    public void run(String... args) {
        if (recipeRepository.count() > 0) {
            return;
        }
        List<Recipe> recipes = List.of(
                recipe("Gà kho mật ong", "Món gà kho đậm đà, thịt mềm thơm mùi mật ong và tỏi — dễ làm, hợp cơm trắng nóng.",
                        "Sơ chế: gà rửa sạch, chặt miếng vừa ăn, ướp 15 phút với tỏi, tiêu và 1 muỗng nước mắm.\nPhi thơm tỏi với 1 muỗng dầu, xếp gà da xuống chảo, chiên nhẹ 2 mặt vàng.\nPha sốt: 2 muỗng mật ong + 2 muỗng nước mắm + dầu hào + 3 muỗng nước, khuấy đều.\nĐổ sốt vào chảo, đun liu riu 10–12 phút đến khi sốt sánh và bám đều miếng gà.\nRắc hành lá, tắt bếp. Dùng nóng với cơm trắng và canh rau.",
                        30, "Trung bình", 2, 350, 28, 15, 12, "dinner,lunch"),
                recipe("Phở bò", "Tô phở nước dùng trong, thơm hương quế hồi, thịt bò tái mềm và bánh phở trắng mịn.",
                        "Blanch xương 5 phút, rửa sạch rồi ninh nhỏ lửa 90 phút với hành, gừng nướng và gói gia vị.\nThái bò mỏng, chần nhanh trong nước dùng sôi để giữ độ tái mềm.\nTrụng bánh phở, xếp thịt, chan nước dùng đang sôi.\nĂn kèm hành lá, rau thơm, chanh, ớt và tương.",
                        60, "Khó", 4, 420, 32, 48, 10, "morning,lunch"),
                recipe("Cơm tấm sườn bì", "Đĩa cơm tấm Sài Gòn chuẩn vị: sườn nướng mật ong, bì tôm thịt, chả trứng và nước mắm ngọt.",
                        "Ướp sườn với mật ong, tỏi, nước mắm 30 phút rồi nướng 180°C 20 phút.\nLuộc thịt, tôm; thái mảnh làm bì trộn thính.\nChiên chả trứng mỏng, thái sợi.\nBào dưa leo, xếp tất cả lên cơm, chan nước mắm ngọt.",
                        45, "Trung bình", 2, 550, 35, 58, 20, "lunch,dinner"),
                recipe("Bánh mì trứng op-la", "Bữa sáng nhanh 15 phút: trứng ốp la béo mịn, patê, đồ chua trong ổ bánh mì giòn.",
                        "Đập trứng vào chảo dầu nóng, để lòng đỏ còn mềm.\nBẻ bánh mì, phết patê, nướng lại cho giòn.\nKẹp trứng, thêm đồ chua, ngò, tương ớt.",
                        15, "Dễ", 1, 380, 16, 42, 14, "morning"),
                recipe("Rau củ xào tỏi", "Đĩa rau xanh giòn ngọt, thơm mùi tỏi bơ — món ăn kèm nhẹ nhàng, lành mạnh.",
                        "Chần rau củ 1 phút qua nước sôi có chút muối, vớt ngâm nước lạnh.\nPhi thơm tỏi, cho rau vào xào lửa lớn 2 phút.\nNêm nước mắm, tiêu, tắt bếp nhanh để rau giữ độ giòn.",
                        15, "Dễ", 2, 180, 6, 14, 9, "dinner,lunch"),
                recipe("Canh chua cá", "Canh chua miền Tây chua ngọt hài hoà với me, dứa, đậu bắp và cá lóc tươi.",
                        "Nấu me với 1 lít nước, lọc lấy nước chua.\nCho dứa, cà chua vào đun sôi, nêm chua ngọt vừa miệng.\nThả cá cắt khúc, đun 5 phút, thêm đậu bắp, bạc hà.\nRắc rau om, ngò gai, tắt bếp, dùng nóng với cơm.",
                        40, "Trung bình", 4, 250, 24, 16, 8, "dinner,lunch"),
                recipe("Súp bí đỏ tôm", "Súp bí đỏ mịn ngọt tự nhiên, chút tôm tươi — nhẹ bụng, giàu vitamin A.",
                        "Bí đỏ hấp chín, xay nhuyễn cùng 300ml nước.\nPhi hành, xào tôm, đổ bí xay vào đun sôi.\nThêm sữa, nêm muối tiêu, khuấy nhẹ 2 phút.",
                        25, "Dễ", 3, 160, 9, 18, 4, "morning,dinner"),
                recipe("Bò xào hành tây", "Thịt bò mềm ngọt, hành tây giòn, sốt đậm đà — hoàn thành chỉ trong 20 phút.",
                        "Thái bò mỏng, ướp dầu hào, tỏi gừng 10 phút.\nXào bò lửa lớn 2 phút tới chín tái, trút ra đĩa.\nXào hành tây 1 phút, trả bò vào, nêm lại, rắc hành lá.",
                        20, "Dễ", 2, 390, 30, 12, 22, "lunch,dinner"),
                recipe("Cháo gà rau thơm", "Cháo gà nhuyễn mềm, ấm bụng cho buổi sáng — dễ tiêu, hợp cả trẻ nhỏ.",
                        "Ninh gạo với 1,2 lít nước 25 phút tới nở bung.\nLuộc ức gà, xé sợi nhỏ, giữ nước luộc cho vào nồi.\nNêm muối, gừng băm; múc ra bát, rắc rau mùi, tiêu.",
                        35, "Dễ", 3, 280, 22, 36, 6, "morning"),
                recipe("Gỏi bò đu đủ", "Gỏi thanh mát, chua cay the the của đu đủ xanh bào, thịt bò tài và rau răm.",
                        "Bào sợi đu đủ, cà rốt, ngâm nước muối loãng 10 phút, vắt khô.\nChần bò mỏng qua nước sôi, để nguội.\nTrộn tất cả với nước mắm chua ngọt, rắc đậu phộng rang.",
                        20, "Dễ", 3, 220, 20, 14, 11, "lunch,dinner"),
                recipe("Chè chuối bọc nếp", "Vị ngọt dịu của chuối xiêm bọc lớp nếp dẻo, rắc vừng thơm lừng.",
                        "Ngâm nếp 4 tiếng, hấp chín.\nBọc chuối bằng nếp, hấp lại 10 phút.\nRắc vừng rang, dùng kèm nước cốt dừa.",
                        35, "Dễ", 4, 260, 4, 55, 3, "dinner")
        );
        recipeRepository.saveAll(recipes);
        log.info("Đã seed {} công thức mẫu từ dk-dn", recipes.size());
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