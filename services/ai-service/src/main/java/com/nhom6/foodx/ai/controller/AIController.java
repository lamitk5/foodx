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
import com.nhom6.foodx.ai.service.FoodImageScanService;
import com.nhom6.foodx.ai.service.RecipeExtractionService;
import com.nhom6.foodx.ai.service.SuggestionService;
import com.nhom6.foodx.common.response.ApiResponse;
import com.nhom6.foodx.common.security.SecurityUtils;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * API gợi ý công thức và Trợ lý AI nấu ăn.
 *
 * <p>Là cửa vào cho người dùng cuối. Các tác vụ AI phục vụ <i>service khác</i> nằm ở
 * {@code InternalAiController} ({@code /internal/ai/**}) — chỉ tồn tại trong mạng nội bộ.</p>
 */
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AIController {

    private final SuggestionService suggestionService;
    private final ChatService chatService;
    private final AiContextService aiContextService;
    private final RecipeExtractionService recipeExtractionService;
    private final FoodImageScanService foodImageScanService;
    private final com.nhom6.foodx.ai.service.AiRequestGate aiRequestGate;

    @GetMapping("/status")
    public ApiResponse<Map<String, Object>> status() {
        String provider = chatService.getActiveProvider();
        boolean mock = chatService.isMockMode();
        String message = switch (provider) {
            case "groq" -> "Đang dùng Groq AI thật (tự động chuyển sang Gemini nếu Groq lỗi).";
            case "gemini" -> "Đang dùng Gemini AI thật (dự phòng khi Groq không khả dụng).";
            default -> "Đang chạy chế độ dữ liệu mẫu (mock) — chưa cấu hình Groq/Gemini API key.";
        };
        Map<String, Object> payload = new java.util.LinkedHashMap<>();
        payload.put("mock", mock);
        payload.put("provider", provider);
        payload.put("message", message);
        payload.put("bulkhead", aiRequestGate.metrics());
        return ApiResponse.success(payload, "Trạng thái AI");
    }

    @PostMapping("/suggest")
    public ApiResponse<SuggestResponse> suggest(@Valid @RequestBody SuggestRequest request) {
        return ApiResponse.success(suggestionService.suggest(request), "Gợi ý thành công");
    }

    @PostMapping("/chat")
    public ApiResponse<ChatResponse> chat(@Valid @RequestBody ChatRequest request) {
        // Server tự nạp bối cảnh (hồ sơ + tủ lạnh) thay vì chỉ tin vào dữ liệu client gửi lên
        String context = aiContextService.buildContext(SecurityUtils.getCurrentUserId());
        return ApiResponse.success(chatService.chat(request, context), "Trợ lý AI phản hồi");
    }

    @PostMapping("/parse-recipe")
    public Map<String, Object> parseRecipe(@RequestBody Map<String, String> body) {
        String prompt = body.get("prompt");
        if (prompt == null || prompt.isBlank()) {
            return Map.of("title", "Công thức mới", "ingredients", java.util.List.of());
        }
        return recipeExtractionService.extractWithAi(prompt)
                .orElseGet(() -> recipeExtractionService.fallback(prompt));
    }

    @PostMapping("/scan-food-image")
    public java.util.List<com.nhom6.foodx.common.dto.ScanFoodImageItemDto> scanFoodImage(@RequestBody Map<String, String> body) {
        return foodImageScanService.scan(body.get("data"), body.get("mimeType"));
    }
}
