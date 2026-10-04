package com.nhom6.foodx.ai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Trích xuất công thức từ văn bản thô bằng AI (Groq → Gemini).
 *
 * <p>Logic này phục vụ cả hai cửa vào: {@code POST /api/ai/parse-recipe} (người dùng dán
 * văn bản công thức) và {@code POST /internal/ai/parse-recipe} (recipe-service import công
 * thức qua {@code AiServiceClient.parseRecipe}). Nhờ gom về một chỗ nên prompt và cách
 * bóc tách JSON không bị lệch nhau giữa hai endpoint.</p>
 *
 * <p>Khác với {@link RecipeParserService} (schema JSON của luồng nhập công thức có
 * prepTime/cookTime/cuisine/instructions), lớp này giữ đúng định dạng rút gọn mà
 * {@code /api/ai/parse-recipe} vẫn trả cho frontend.</p>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RecipeExtractionService {

    /** Prompt trích xuất công thức — giữ nguyên nội dung đang dùng cho /api/ai/parse-recipe. */
    private static final String RECIPE_PROMPT_PREFIX = """
            Bạn là chuyên gia trích xuất món ăn. Hãy phân tích văn bản sau và trả về DUY NHẤT một JSON hợp lệ có các trường: title (string), description (string), servings (int), cookTimeMinutes (int), kcal (int), category (string: Món chính/Món sáng/Món nhanh/Món ăn kiêng/Món tráng miệng), ingredients (mảng object: name (string), quantity (double), unit (string)).

            Văn bản:
            """;

    private final AiProviderService aiProviderService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Nhờ AI trích xuất công thức, trả về <b>chuỗi JSON thô</b>.
     *
     * <p>Cửa nội bộ ({@code /internal/ai/parse-recipe}) trả thẳng chuỗi này dưới dạng
     * {@code text/plain} để recipe-service tự phân tích bằng Jackson 2 của nó — tránh phải
     * bắc cầu Jackson 2 ↔ Jackson 3 qua tầng HTTP của Spring Boot 4.</p>
     *
     * @return JSON công thức do AI sinh, hoặc rỗng nếu chưa cấu hình AI / AI trả về không dùng được
     */
    public Optional<String> extractRawWithAi(String prompt) {
        if (prompt == null || prompt.isBlank() || aiProviderService.isMockMode()) {
            return Optional.empty();
        }
        try {
            String jsonStr = aiProviderService.generateText(RECIPE_PROMPT_PREFIX + prompt, "application/json");
            if (jsonStr == null || jsonStr.isBlank()) {
                return Optional.empty();
            }
            return Optional.of(stripCodeFence(jsonStr));
        } catch (Exception ex) {
            log.warn("AI trích xuất công thức thất bại: {}", ex.getMessage());
            return Optional.empty();
        }
    }

    /**
     * Như {@link #extractRawWithAi(String)} nhưng đã phân tích thành Map (dùng cho
     * {@code /api/ai/parse-recipe} phục vụ frontend).
     */
    @SuppressWarnings("unchecked")
    public Optional<Map<String, Object>> extractWithAi(String prompt) {
        Optional<String> raw = extractRawWithAi(prompt);
        if (raw.isEmpty()) {
            return Optional.empty();
        }
        try {
            Map<String, Object> parsed = objectMapper.readValue(raw.get(), Map.class);
            return Optional.of(parsed);
        } catch (Exception ex) {
            log.warn("Không đọc được JSON công thức từ AI: {}", ex.getMessage());
            return Optional.empty();
        }
    }

    /**
     * Phương án dự phòng không cần AI, giữ nguyên hành vi cũ của {@code /api/ai/parse-recipe}
     * khi AI không khả dụng.
     */
    public Map<String, Object> fallback(String prompt) {
        if (prompt == null || prompt.isBlank()) {
            return Map.of("title", "Công thức mới", "ingredients", List.of());
        }
        return Map.of(
                "title", prompt.lines().findFirst().orElse("Món ăn mới").trim(),
                "description", prompt.length() > 100 ? prompt.substring(0, 100) : prompt,
                "servings", 2,
                "cookTimeMinutes", 30,
                "kcal", 350,
                "ingredients", List.of()
        );
    }

    /** Bỏ rào ```json ... ``` mà LLM hay bọc quanh JSON. */
    private String stripCodeFence(String raw) {
        String cleanJson = raw.trim();
        if (cleanJson.startsWith("```")) {
            int start = cleanJson.indexOf('\n') + 1;
            int end = cleanJson.lastIndexOf("```");
            if (end > start) {
                cleanJson = cleanJson.substring(start, end).trim();
            }
        }
        return cleanJson;
    }
}
