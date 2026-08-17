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
import com.nhom6.foodx.ai.service.ChatService;
import com.nhom6.foodx.ai.service.SuggestionService;
import com.nhom6.foodx.common.response.ApiResponse;

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
        return ApiResponse.success(chatService.chat(request), "Trợ lý AI phản hồi");
    }
}
