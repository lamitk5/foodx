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
                ? "bạn chưa nhập nguyên liệu nào"
                : "bạn đang có các nguyên liệu: " + String.join(", ", availableIngredients) + ".";

        String reply;
        if (msg.contains("cơm chiên") || msg.contains("cơm rang")) {
            reply = "Hướng dẫn cơm chiên trứng:\n" +
                    "1. Đánh tan trứng (3 quả) với chút hành lá và hạt nêm.\n" +
                    "2. Phi thơm tỏi băm rồi cho cơm nguội vào xào săn.\n" +
                    "3. Đổ trứng vào, đảo đều cho trứng bám quanh hạt cơm.\n" +
                    "4. Nêm lại bằng xì dầu, tiêu, hành lá. Dùng nóng.\n\n" +
                    "Ghi chú: " + ings;
        } else if (msg.contains("phở") || msg.contains("bún")) {
            reply = "Gợi ý món " + (msg.contains("phở") ? "phở" : "bún") + ":\n" +
                    "Bạn có thể nấu nước dùng từ xương, thêm hành nướng, gừng, quế, hồi, " +
                    "chanh, ớt và rau sống. Chần bánh + thịt, chan nước dùng nóng là xong.";
        } else if (msg.contains("xào")) {
            reply = "Món xào gợi ý:\n" +
                    "1. Sơ chế nguyên liệu, thái vừa ăn.\n" +
                    "2. Phi tỏi thơm, cho nguyên liệu khó chín vào trước.\n" +
                    "3. Nêm muối/gia vị, cho rau dễ chín vào cuối để giòn.\n\n" +
                    "Ghi chú: " + ings;
        } else if (msg.contains("không") && msg.contains("thịt")) {
            reply = "Đây là gợi ý món chay/mặn không thịt:\n" +
                    "1. Đậu hũ sốt cà chua: chiên vàng đậu, sốt với cà chua + hành.\n" +
                    "2. Rau củ luộc chấm kho quẹt.\n" +
                    "3. Trứng hấp / canh chua.\n\n" +
                    "Ghi chú: " + ings;
        } else {
            reply = "Chào bạn! Mình là trợ lý nấu ăn của FoodX.\n" +
                    "Hãy hỏi mình cách làm một món cụ thể (vd: \"cách nấu ăn ngon\", " +
                    "\"cơm chiên\", \"phở\") hoặc chia sẻ nguyên liệu bạn có (" + ings + ") " +
                    "để mình gợi ý món phù hợp cho bạn nhé!";
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
