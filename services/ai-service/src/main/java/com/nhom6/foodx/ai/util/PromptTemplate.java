package com.nhom6.foodx.ai.util;

import com.nhom6.foodx.ai.dto.SuggestRequest;

import java.util.List;

/**
 * Mẫu prompt cho AI.
 */
public final class PromptTemplate {

    /**
     * System prompt chung cho chat nấu ăn. JSON vẫn đi qua prompt riêng, không phụ thuộc giọng hội thoại.
     */
    public static final String COOKING_SYSTEM_PROMPT = """
            Bạn là trợ lý nấu ăn FoodX, nói chuyện tự nhiên bằng tiếng Việt như một người bạn trong bếp.
            Giọng ngắn, ấm, cụ thể. Không mở đầu bằng "Xin lỗi, tôi chỉ hỗ trợ về nấu ăn".

            Cách ứng biến:
            - Chào, cảm ơn, tạm biệt, hỏi thăm: đáp lại tự nhiên và mời họ hỏi món. Không xin lỗi, không nhét công thức nếu họ chưa hỏi.
            - "Ăn gì", "nay nấu gì", câu mơ hồ: hỏi thêm đúng 1 câu (thời gian, khẩu vị, số người) hoặc đưa 2 món từ tủ lạnh nếu đã đủ thông tin.
            - Tủ lạnh trống: gợi ý món đơn giản và ghi rõ cần mua gì.
            - Dị ứng hoặc không thích: không dùng nguyên liệu đó, nói ngắn vì sao và đưa món thay.
            - Bà bầu, eat clean, nấu nhanh, trẻ em, ít dầu, ngân sách thấp, còn một nguyên liệu, nguyên liệu sắp hết hạn: tôn trọng ràng buộc rồi gợi ý cụ thể.
            - Câu nối ("món đó", "bước 2", "đổi tôm", "chi tiết hơn"): bám lịch sử hội thoại, đừng hỏi lại từ đầu.
            - Lệch chủ đề: một câu lịch sự rồi kéo về nấu ăn. Không bắt buộc gợi ý món.
            - Ưu tiên nguyên liệu đang có. Thiếu thì ghi "cần mua thêm". Không bịa số dinh dưỡng nếu không chắc.
            - Khi được yêu cầu JSON, chỉ trả về JSON hợp lệ, không markdown, không giải thích thêm.

            Ví dụ:
            Người dùng: xin chào
            Trợ lý: Chào bạn, mình là trợ lý bếp của FoodX. Hôm nay bạn muốn nấu món gì, hay để mình xem tủ lạnh rồi gợi ý?
            Người dùng: nay ăn gì
            Trợ lý: Bạn rảnh khoảng bao lâu, và ăn mấy người? Nếu muốn nhanh, mình đưa 2 món từ những gì đang có trong tủ.
            Người dùng: tủ lạnh trống rồi
            Trợ lý: Tủ đang trống thì mình gợi ý trứng chiên hành hoặc mì xào rau — cần mua trứng, hành và mì nếu chưa có.
            Người dùng: tôi dị ứng tôm
            Trợ lý: Mình sẽ tránh tôm. Nếu tủ có thịt và rau, có thể xào thịt với rau củ thay vì món hải sản.
            Người dùng: chi tiết bước 2 của món vừa nói
            Trợ lý: Bước 2 của món đó là ướp gia vị 10 phút cho thấm, đúng món đang nói trong lịch sử.
            Người dùng: thời tiết hôm nay thế nào
            Trợ lý: Mình không theo dõi thời tiết. Nếu bạn muốn món nóng hay món mát thì nói mình gợi ý.
            """;

    private PromptTemplate() {
    }

    /** Prompt parse công thức từ text thô. */
    public static String recipeParsePrompt(String rawText) {
        return """
                Bạn là trợ lý phân tích công thức nấu ăn. Từ đoạn text sau, hãy trích xuất
                thông tin công thức và trả về dưới dạng JSON có cấu trúc:
                {
                  "title": "...",
                  "description": "...",
                  "prepTime": <số phút>,
                  "cookTime": <số phút>,
                  "servings": <số>,
                  "cuisine": "...",
                  "category": "...",
                  "ingredients": [
                    {"name": "...", "quantity": <số>, "unit": "...", "note": "..."}
                  ],
                  "instructions": "..."
                }
                Chỉ trả về JSON, không kèm văn bản khác.
                
                Nội dung công thức:
                """ + rawText;
    }

    /** Prompt gợi ý công thức dựa trên nguyên liệu có sẵn. */
    public static String suggestionPrompt(SuggestRequest request) {
        List<String> ingredients = request.getAvailableIngredients() == null
                ? List.of()
                : request.getAvailableIngredients();

        return """
                Bạn là trợ lý gợi ý món ăn thông minh. Dựa trên danh sách nguyên liệu sau,
                hãy gợi ý những công thức khả thi ngắn gọn. Trả về JSON đúng định dạng:
                {
                  "suggestions": [
                    {
                      "title": "...",
                      "description": "...",
                      "ingredients": ["...", "..."],
                      "instructions": "...",
                      "estimatedTime": "..."
                    }
                  ]
                }
                Chỉ trả về duy nhất chuỗi JSON hợp lệ.

                Nguyên liệu có sẵn: %s
                Loại bữa: %s
                Sở thích / yêu cầu: %s
                Số gợi ý mong muốn: %d
                """.formatted(ingredients, request.getMealType() == null ? "bất kỳ" : request.getMealType(),
                request.getPreference() == null ? "không" : request.getPreference(),
                request.getMaxSuggestions() == null ? 3 : request.getMaxSuggestions());
    }

    /** Prompt chat với Trợ lý AI nấu ăn (không bối cảnh). */
    public static String chatPrompt(String message, List<String> availableIngredients) {
        return chatPrompt(message, availableIngredients, "");
    }

    /**
     * Prompt chat có bối cảnh người dùng (hồ sơ + tủ lạnh + lịch sử hội thoại).
     * @param extraContext chuỗi bối cảnh do server dựng (có thể rỗng)
     */
    public static String chatPrompt(String message, List<String> availableIngredients, String extraContext) {
        String ings = clampIngredients(availableIngredients);
        String context = (extraContext == null || extraContext.isBlank())
                ? ""
                : "Bối cảnh người dùng (bắt buộc tuân thủ):\n" + clamp(extraContext, 4000) + "\n";
        return """
                Trả lời tin nhắn mới nhất theo cách ứng biến đã nêu trong system prompt.
                Không lặp lại các ví dụ. Không xin lỗi vì "chỉ hỗ trợ nấu ăn" khi người dùng chỉ chào hoặc hỏi thăm.
                Ưu tiên nguyên liệu đang có; thiếu thì ghi "cần mua thêm".
                Tuyệt đối không gợi ý nguyên liệu trong danh sách dị ứng hoặc không thích.

                %s
                Nguyên liệu người dùng chọn: %s

                Tin nhắn: %s
                """.formatted(context, ings, clamp(message == null ? "" : message.trim(), 2000));
    }

    private static String clampIngredients(List<String> availableIngredients) {
        if (availableIngredients == null || availableIngredients.isEmpty()) {
            return "không có (bạn tự gợi ý)";
        }
        String joined = String.join(", ", availableIngredients.stream().limit(30).toList());
        return clamp(joined, 800);
    }

    private static String clamp(String text, int maxChars) {
        if (text == null) {
            return "";
        }
        if (text.length() <= maxChars) {
            return text;
        }
        return text.substring(0, maxChars) + "…";
    }

    /** Prompt hướng dẫn nấu từng bước (không bối cảnh). */
    public static String stepByStepPrompt(String dish, List<String> availableIngredients) {
        return stepByStepPrompt(dish, availableIngredients, "");
    }

    /** Prompt hướng dẫn nấu từng bước có bối cảnh người dùng. */
    public static String stepByStepPrompt(String dish, List<String> availableIngredients, String extraContext) {
        String ings = availableIngredients == null || availableIngredients.isEmpty()
                ? "không có (hãy liệt kê nguyên liệu cần thiết)"
                : String.join(", ", availableIngredients);
        String context = (extraContext == null || extraContext.isBlank())
                ? ""
                : "Bối cảnh người dùng (server cung cấp):\n" + extraContext + "\n\n";
        return """
                Bạn là đầu bếp chuyên nghiệp. Hãy hướng dẫn nấu món "%s" từng bước chi tiết.
                Mỗi bước trên một dòng riêng, bắt đầu bằng số thứ tự. Liệt kê rõ nguyên liệu
                và khối lượng. Nếu người dùng có sẵn nguyên liệu (%s), ưu tiên dùng chúng.
                Tránh các nguyên liệu người dùng dị ứng.

                %s
                Chỉ đưa ra các bước nấu, không kèm văn bản quảng cáo.
                """.formatted(dish, ings, context);
    }

    /**
     * Gợi ý món thay cho nguyên liệu thiếu. {@code message} đã ghi món, danh sách thiếu và tủ lạnh.
     * Chỉ được chọn món có thật trong tủ.
     */
    public static String substitutePrompt(String message, List<String> availableIngredients, String extraContext) {
        String ings = clampIngredients(availableIngredients);
        String context = (extraContext == null || extraContext.isBlank())
                ? ""
                : "Bối cảnh (dị ứng, khẩu vị — không được gợi ý món nằm trong đây):\n" + clamp(extraContext, 1500) + "\n";
        return """
                Bạn là đầu bếp. Người dùng thiếu nguyên liệu và muốn dùng đồ đang có trong tủ.
                Chỉ được chọn món thay từ đúng danh sách tủ lạnh, và món đó phải cùng vai trò
                (mặn, chua, ngọt, đạm, rau). Không bịa nguyên liệu mới.
                Không thay muối bằng rau hoặc thịt. Nếu không có món cùng vai trò, để use là chuỗi rỗng.

                %s
                Tủ lạnh: %s

                %s

                Trả về đúng một JSON object, không markdown:
                {"items":[{"missing":"tên nguyên liệu thiếu","use":"tên đúng trong tủ hoặc rỗng","note":"một câu cách dùng"}]}
                """.formatted(context, ings, clamp(message == null ? "" : message.trim(), 1800));
    }

    /** Prompt gợi ý món ăn cho trang chủ. */
    public static String homeSuggestionPrompt(List<String> preferCategories) {
        String cats = preferCategories == null || preferCategories.isEmpty()
                ? "bất kỳ loại món nào"
                : String.join(", ", preferCategories);
        return """
                Bạn là trợ lý gợi ý món ăn cho trang chủ. Hãy gợi ý 6 món ăn hấp dẫn
                (ưu tiên %s). Trả về JSON dạng:
                {
                  "suggestions": [
                    {"title": "...", "posterUrl": "...", "summary": "...", "category": "..."}
                  ]
                }
                Chỉ trả về JSON, không kèm văn bản khác.
                """.formatted(cats);
    }
}
