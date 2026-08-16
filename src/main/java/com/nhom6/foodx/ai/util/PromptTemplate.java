package com.nhom6.foodx.ai.util;

import com.nhom6.foodx.ai.dto.SuggestRequest;

import java.util.List;

/**
 * Mẫu prompt cho AI.
 */
public final class PromptTemplate {

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

    /** Prompt chat với Trợ lý AI nấu ăn. */
    public static String chatPrompt(String message, List<String> availableIngredients) {
        String ings = availableIngredients == null || availableIngredients.isEmpty()
                ? "không có (bạn tự gợi ý)"
                : String.join(", ", availableIngredients);
        return """
                Bạn là trợ lý AI chuyên về nấu ăn thân thiện. Trả lời câu hỏi của người dùng
                bằng tiếng Việt, rõ ràng, dễ hiểu. Nếu có thể, hãy gợi ý sử dụng các nguyên liệu
                người dùng đang có. Nếu câu hỏi không liên quan đến ẩm thực, hãy lịch sự từ chối.

                Nguyên liệu hiện có: %s

                Câu hỏi của người dùng: %s
                """.formatted(ings, message);
    }

    /** Prompt hướng dẫn nấu từng bước. */
    public static String stepByStepPrompt(String dish, List<String> availableIngredients) {
        String ings = availableIngredients == null || availableIngredients.isEmpty()
                ? "không có (hãy liệt kê nguyên liệu cần thiết)"
                : String.join(", ", availableIngredients);
        return """
                Bạn là đầu bếp chuyên nghiệp. Hãy hướng dẫn nấu món "%s" từng bước chi tiết.
                Mỗi bước trên một dòng riêng, bắt đầu bằng số thứ tự. Liệt kê rõ nguyên liệu
                và khối lượng. Nếu người dùng có sẵn nguyên liệu (%s), ưu tiên dùng chúng.

                Chỉ đưa ra các bước nấu, không kèm văn bản quảng cáo.
                """.formatted(dish, ings);
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
