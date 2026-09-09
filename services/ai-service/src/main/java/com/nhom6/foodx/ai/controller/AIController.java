package com.nhom6.foodx.ai.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nhom6.foodx.ai.dto.ChatRequest;
import com.nhom6.foodx.ai.dto.ChatResponse;
import com.nhom6.foodx.ai.dto.SuggestRequest;
import com.nhom6.foodx.ai.dto.SuggestResponse;
import com.nhom6.foodx.ai.service.AiContextService;
import com.nhom6.foodx.ai.service.ChatService;
import com.nhom6.foodx.ai.service.SuggestionService;
import com.nhom6.foodx.common.response.ApiResponse;
import com.nhom6.foodx.security.SecurityUtils;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * API gợi ý công thức và Trợ lý AI nấu ăn.
 */
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AIController {

    private final SuggestionService suggestionService;
    private final ChatService chatService;
    private final AiContextService aiContextService;
    private final SecurityUtils securityUtils;
    private final com.nhom6.foodx.ai.service.AiProviderService aiProviderService;
    private final com.nhom6.foodx.ai.service.GeminiService geminiService;

    @GetMapping("/status")
    public ApiResponse<Map<String, Object>> status() {
        String provider = chatService.getActiveProvider();
        boolean mock = chatService.isMockMode();
        String message = switch (provider) {
            case "groq" -> "Đang dùng Groq AI thật (tự động chuyển sang Gemini nếu Groq lỗi).";
            case "gemini" -> "Đang dùng Gemini AI thật (dự phòng khi Groq không khả dụng).";
            default -> "Đang chạy chế độ dữ liệu mẫu (mock) — chưa cấu hình Groq/Gemini API key.";
        };
        return ApiResponse.success(Map.of(
                "mock", mock,
                "provider", provider,
                "message", message
        ), "Trạng thái AI");
    }

    @PostMapping("/suggest")
    public ApiResponse<SuggestResponse> suggest(@Valid @RequestBody SuggestRequest request) {
        return ApiResponse.success(suggestionService.suggest(request), "Gợi ý thành công");
    }

    @PostMapping("/chat")
    public ApiResponse<ChatResponse> chat(@Valid @RequestBody ChatRequest request) {
        // Server tự nạp bối cảnh (hồ sơ + tủ lạnh) thay vì chỉ tin vào dữ liệu client gửi lên
        String context = aiContextService.buildContext(securityUtils.getCurrentUser());
        return ApiResponse.success(chatService.chat(request, context), "Trợ lý AI phản hồi");
    }

    @PostMapping("/generate")
    public String generate(@RequestBody Map<String, String> body) {
        String prompt = body.get("prompt");
        String mimeType = body.get("mimeType");
        if (prompt == null || prompt.isBlank()) {
            return "";
        }
        if (aiProviderService.isMockMode()) {
            return "Phản hồi mẫu AI cho: " + prompt;
        }
        return aiProviderService.generateText(prompt, mimeType);
    }

    @PostMapping("/parse-recipe")
    @SuppressWarnings("unchecked")
    public Map<String, Object> parseRecipe(@RequestBody Map<String, String> body) {
        String prompt = body.get("prompt");
        if (prompt == null || prompt.isBlank()) {
            return Map.of("title", "Công thức mới", "ingredients", java.util.List.of());
        }
        if (!aiProviderService.isMockMode()) {
            try {
                String systemPrompt = "Bạn là chuyên gia trích xuất món ăn. Hãy phân tích văn bản sau và trả về DUY NHẤT một JSON hợp lệ có các trường: title (string), description (string), servings (int), cookTimeMinutes (int), kcal (int), category (string: Món chính/Món sáng/Món nhanh/Món ăn kiêng/Món tráng miệng), ingredients (mảng object: name (string), quantity (double), unit (string)).\n\nVăn bản:\n" + prompt;
                String jsonStr = aiProviderService.generateText(systemPrompt, "application/json");
                if (jsonStr != null && !jsonStr.isBlank()) {
                    String cleanJson = jsonStr.trim();
                    if (cleanJson.startsWith("```")) {
                        int start = cleanJson.indexOf('\n') + 1;
                        int end = cleanJson.lastIndexOf("```");
                        if (end > start) {
                            cleanJson = cleanJson.substring(start, end).trim();
                        }
                    }
                    return new com.fasterxml.jackson.databind.ObjectMapper().readValue(cleanJson, Map.class);
                }
            } catch (Exception ignored) {
            }
        }
        return Map.of(
                "title", prompt.lines().findFirst().orElse("Món ăn mới").trim(),
                "description", prompt.length() > 100 ? prompt.substring(0, 100) : prompt,
                "servings", 2,
                "cookTimeMinutes", 30,
                "kcal", 350,
                "ingredients", java.util.List.of()
        );
    }

    @PostMapping("/scan-food-image")
    public java.util.List<com.nhom6.foodx.ai.dto.ScannedFoodItemDto> scanFoodImage(@RequestBody Map<String, String> body) {
        String base64Data = body.get("data");
        String mimeType = body.get("mimeType");
        if (base64Data == null || base64Data.isBlank()) {
            return java.util.List.of();
        }

        if (geminiService.isConfigured()) {
            try {
                String prompt = """
                        Bạn là chuyên gia nhận diện thực phẩm chuyên nghiệp từ ảnh chụp (hoá đơn siêu thị hoặc ảnh chụp ngăn tủ lạnh).
                        Hãy phân tích ảnh và trích xuất danh sách tất cả các thực phẩm/nguyên liệu nhìn thấy hoặc mua trong hoá đơn.
                        Trả về DUY NHẤT một JSON Array hợp lệ (không kèm markdown) có cấu trúc:
                        [
                          {
                            "name": "Tên thực phẩm chuẩn tiếng Việt (vd: Trứng gà, Thịt ba chỉ, Cà chua)",
                            "quantity": 1.0,
                            "unit": "Đơn vị (vd: quả, kg, g, bó, hộp, vỉ, chai, túi)",
                            "category": "Danh mục (Rau củ / Thịt / Hải sản / Trứng & Sữa / Gia vị / Đồ uống / Trái cây / Khác)",
                            "estimatedExpiryDays": 7,
                            "confidence": 0.95
                          }
                        ]
                        """;
                String jsonStr = geminiService.analyzeImage(base64Data, mimeType, prompt);
                if (jsonStr != null && !jsonStr.isBlank()) {
                    String cleanJson = jsonStr.trim();
                    if (cleanJson.startsWith("```json")) {
                        cleanJson = cleanJson.substring(7);
                    } else if (cleanJson.startsWith("```")) {
                        cleanJson = cleanJson.substring(3);
                    }
                    if (cleanJson.endsWith("```")) {
                        cleanJson = cleanJson.substring(0, cleanJson.length() - 3);
                    }
                    cleanJson = cleanJson.trim();
                    com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                    return mapper.readValue(cleanJson, mapper.getTypeFactory().constructCollectionType(java.util.List.class, com.nhom6.foodx.ai.dto.ScannedFoodItemDto.class));
                }
            } catch (Exception ignored) {
            }
        }

        // Fallback thực tế khi chạy offline / chưa cấu hình key
        return java.util.List.of(
                com.nhom6.foodx.ai.dto.ScannedFoodItemDto.builder().name("Trứng gà").quantity(10.0).unit("quả").category("Trứng & Sữa").estimatedExpiryDays(14).confidence(0.98).build(),
                com.nhom6.foodx.ai.dto.ScannedFoodItemDto.builder().name("Thịt ba chỉ heo").quantity(500.0).unit("g").category("Thịt").estimatedExpiryDays(3).confidence(0.95).build(),
                com.nhom6.foodx.ai.dto.ScannedFoodItemDto.builder().name("Rau muống").quantity(1.0).unit("bó").category("Rau củ").estimatedExpiryDays(4).confidence(0.92).build(),
                com.nhom6.foodx.ai.dto.ScannedFoodItemDto.builder().name("Cà chua").quantity(4.0).unit("quả").category("Rau củ").estimatedExpiryDays(7).confidence(0.90).build(),
                com.nhom6.foodx.ai.dto.ScannedFoodItemDto.builder().name("Sữa tươi có đường").quantity(1.0).unit("hộp").category("Trứng & Sữa").estimatedExpiryDays(10).confidence(0.96).build()
        );
    }
}
