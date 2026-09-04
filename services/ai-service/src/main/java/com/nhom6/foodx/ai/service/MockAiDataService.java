package com.nhom6.foodx.ai.service;

import com.nhom6.foodx.ai.dto.SuggestResponse;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

/**
 * Cung cấp dữ liệu mẫu (mock) cho chat AI khi chưa cấu hình Gemini API key.
 * Dữ liệu thuần tuý tại đây, KHÔNG liên quan tới database, chỉ để test giao diện.
 */
@Service
public class MockAiDataService {

    /** Xác định dữ liệu trả về có đang dùng bản mẫu hay không. */
    public boolean isMock() {
        return true;
    }

    /**
     * Sinh câu trả lời mẫu cho chế độ chat dựa trên câu hỏi của người dùng.
     */
    public String chatReply(String message, List<String> availableIngredients) {
        String msg = message == null ? "" : message.toLowerCase(Locale.ROOT);
        String ings = availableIngredients == null || availableIngredients.isEmpty()
                ? "Chưa chọn nguyên liệu sẵn có."
                : "Nguyên liệu bạn sẵn có: **" + String.join(", ", availableIngredients) + "**.";

        String reply;
        if (msg.contains("cá kho") || msg.contains("kho tiêu")) {
            reply = "**Cá Kho Tiêu — Món cá kho đậm đà, thơm lừng vị tiêu đen**\n\n" +
                    "### 1. Nguyên liệu gợi ý\n\n" +
                    "| Nguyên liệu | Lượng (cho 2–3 người) |\n" +
                    "|---|---|\n" +
                    "| Cá (basa, cá thu, cá lóc, cá hồi...) | 500g (cắt khúc vừa ăn) |\n" +
                    "| Tiêu đen (xay nhuyễn) | 1-2 muỗng cà phê |\n" +
                    "| Hành tím & Tỏi | 2-3 củ (băm nhỏ) |\n" +
                    "| Nước mắm, đường, ớt | Vừa đủ nêm nếm |\n\n" +
                    "### 2. Các bước thực hiện\n\n" +
                    "1. **Sơ chế & Ướp:** Rửa sạch cá với nước muối bớt nhớt. Ướp cá với 2 muỗng nước mắm, 1 muỗng đường, 1/2 muỗng tiêu, hành tỏi băm trong **15–20 phút**.\n" +
                    "2. **Thắng nước màu:** Đun 1 muỗng đường với ít dầu ăn trên lửa nhỏ đến khi chuyển màu cánh gián thơm.\n" +
                    "3. **Kho cá:** Cho cá đã ướp vào lật đều 2 mặt cho săn. Đổ thêm ít nước ấm sấp mặt cá, đun sôi rồi hạ lửa nhỏ kho riu riu đến khi nước sánh lại.\n" +
                    "4. **Hoàn thiện:** Rắc thêm nhiều tiêu đen xay và vài lát ớt tươi lên trên. Dùng nóng với cơm trắng.\n\n" +
                    "> 💡 **Mẹo ngon:** Kho cá 2 lửa (kho xong tắt bếp để nguội rồi kho lại lần 2) cá sẽ săn chắc và thấm vị đậm đà hơn!";
        } else if (msg.contains("cơm chiên") || msg.contains("cơm rang")) {
            reply = "**Hướng Dẫn Nấu Cơm Chiên Trứng Vàng Óng**\n\n" +
                    "### 1. Bảng nguyên liệu\n\n" +
                    "| Nguyên liệu | Định lượng |\n" +
                    "|---|---|\n" +
                    "| Cơm nguội | 2-3 bát |\n" +
                    "| Trứng gà | 2-3 quả |\n" +
                    "| Hành lá, tỏi băm | Vừa đủ |\n" +
                    "| Gia vị | Nước mắm, tiêu, hạt nêm |\n\n" +
                    "### 2. Các bước thực hiện\n\n" +
                    "1. **Đánh trứng:** Đánh tan 2 quả trứng với chút hạt nêm và hành lá thái nhỏ.\n" +
                    "2. **Xào cơm:** Phi thơm tỏi băm, cho cơm nguội vào đảo đều trên lửa lớn cho hạt cơm săn ráo.\n" +
                    "3. **Rưới trứng:** Đổ trứng từ từ vào cơm, đảo đều tay để trứng bám đều quanh từng hạt cơm vàng óng.\n" +
                    "4. **Nêm nếm:** Nêm xì dầu, rắc tiêu thơm và dùng nóng.\n\n" +
                    "> 📌 *" + ings + "*";
        } else if (msg.contains("phở") || msg.contains("bún")) {
            reply = "**Gợi Ý Nấu " + (msg.contains("phở") ? "Phở Bò Hà Nội" : "Bún Bò Đậm Đà") + "**\n\n" +
                    "### 1. Chuẩn bị nước dùng\n" +
                    "- Ninh xương ống bò/heo từ **2-3 tiếng** cùng hành tây nướng, gừng nướng, hoa hồi, quế, thảo quả.\n" +
                    "- Nêm nước mắm ngon, đường phèn và muối cho vị ngọt thanh tự nhiên.\n\n" +
                    "### 2. Thưởng thức\n" +
                    "- Chần bánh phở/bún qua nước sôi, xếp vào tô.\n" +
                    "- Xếp thịt bò tái/nạm, rắc hành lá, coriander.\n" +
                    "- Chan nước dùng đang sôi sùng sục vào tô và dùng kèm chanh ớt, quẩy giòn.";
        } else if (msg.contains("xào")) {
            reply = "**Mẹo Nấu Món Xào Giòn Ngon Đậm Vị**\n\n" +
                    "### Các bước chuẩn bị:\n" +
                    "1. **Sơ chế:** Cắt nguyên liệu miếng vừa ăn, ướp chút gia vị trước **10 phút**.\n" +
                    "2. **Phi thơm:** Đun nóng chảo với lửa lớn, phi thơm tỏi/hành băm.\n" +
                    "3. **Xào nhanh:** Cho thịt/nguyên liệu lâu chín xào trước, sau đó cho rau củ vào đảo nhanh tay để giữ độ giòn ngọt.\n\n" +
                    "> 📌 *" + ings + "*";
        } else if (msg.contains("không") && msg.contains("thịt")) {
            reply = "**Gợi Ý Danh Sách Món Chay Thanh Đạm**\n\n" +
                    "| Món ăn | Đặc điểm | Thời gian |\n" +
                    "|---|---|---|\n" +
                    "| Đậu hũ sốt cà chua | Chiên vàng đậu, sốt cà chua thanh ngọt | 15 phút |\n" +
                    "| Rau củ luộc kho quẹt | Giòn ngọt, kho quẹt quánh thơm | 20 phút |\n" +
                    "| Nấm xào sả ớt | Thơm nức, cay nhẹ bắt cơm | 12 phút |\n\n" +
                    "Hãy chọn món bạn yêu thích để bắt đầu nấu nhé!";
        } else {
            reply = "Chào bạn! Mình là **Trợ lý AI Nấu ăn FoodX** 🍳\n\n" +
                    "Bạn có thể hỏi mình bất cứ món ăn nào (vd: *\"Cách làm cá kho tiêu\"*, *\"Cơm chiên trứng\"*, *\"Phở bò\"*) hoặc chia sẻ nguyên liệu có sẵn để mình gợi ý nhé!\n\n" +
                    "> 💡 *" + ings + "*";
        }
        return reply;
    }

    /**
     * Sinh các bước nấu mẫu cho một món ăn (chế độ step).
     */
    public List<String> stepReply(String dish, List<String> availableIngredients) {
        String d = dish == null || dish.isBlank() ? "món bạn yêu cầu" : dish;
        String ings = availableIngredients == null || availableIngredients.isEmpty()
                ? "hãy mua thêm nguyên liệu cần thiết"
                : "tận dụng các nguyên liệu: " + String.join(", ", availableIngredients);
        return List.of(
                "Bước 1 - Chuẩn bị: Sơ chế nguyên liệu cho món " + d + ", " + ings + ".",
                "Bước 2 - Ướp: Trộn gia vị (muối, tiêu, tỏi, hạt nêm) và để ngấm 10 phút.",
                "Bước 3 - Nấu: Đun nóng dầu, xào/chiên/bung theo kiểu món chọn, đảo đều tay.",
                "Bước 4 - Nêm nếm: Thêm nước mắm/xì dầu, nêm lại cho vừa miệng.",
                "Bước 5 - Hoàn thành: Trình bày ra đĩa, rắc hành/tiêu và thưởng thức khi còn nóng."
        );
    }

    /**
     * Sinh danh sách gợi ý món mẫu dựa trên nguyên liệu có sẵn.
     */
    public List<SuggestResponse.Suggestion> suggestions(
            List<String> ingredients, String preference, String mealType) {
        String prefs = preference == null || preference.isBlank() ? "không yêu cầu" : preference;
        String meal = mealType == null || mealType.isBlank() ? "bữa bất kỳ" : ("bữa " + mealType);
        String mainIng = ingredients == null || ingredients.isEmpty() ? "nguyên liệu chính" : ingredients.get(0);

        return List.of(
                SuggestResponse.Suggestion.builder()
                        .title("Súp rau củ truyền thống")
                        .description("Món lý tưởng cho " + meal + ", đậm đà và dễ nấu.")
                        .ingredients(ingredients == null ? List.of("rau củ", "hành", "nước dùng") : ingredients)
                        .instructions("Phi hành thơm, cho rau củ xào sơ, đổ nước dùng nấu chín, nêm nếm.")
                        .estimatedTime("25 phút")
                        .build(),
                SuggestResponse.Suggestion.builder()
                        .title("Món xào thập cẩm")
                        .description("Kết hợp nhiều nguyên liệu tạo món xào nhanh gọn, " + prefs + ".")
                        .ingredients(ingredients == null ? List.of("thịt", "rau") : ingredients)
                        .instructions("Xào nguyên liệu chính với tỏi, nêm gia vị, cho rau vào cuối.") 
                        .estimatedTime("15 phút")
                        .build(),
                SuggestResponse.Suggestion.builder()
                        .title("Cơm chiên " + mainIng)
                        .description("Biến tấu đơn giản từ " + mainIng + " cho " + meal + ".")
                        .ingredients(ingredients == null ? List.of("cơm nguội", "trứng") : ingredients)
                        .instructions("Xào nguyên liệu với trứng và cơm nguội, nêm xì dầu, thêm hành lá.")
                        .estimatedTime("20 phút")
                        .build()
        );
    }
}
