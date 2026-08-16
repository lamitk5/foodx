package com.nhom6.foodx.ai.service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import org.springframework.stereotype.Service;

import com.nhom6.foodx.ai.dto.ChatRequest;
import com.nhom6.foodx.ai.dto.ChatResponse;
import com.nhom6.foodx.ai.util.PromptTemplate;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Trợ lý AI nấu ăn - hỏi đáp và hướng dẫn từng bước.
 * Dùng dữ liệu mẫu (mock) khi chưa cấu hình Gemini API key để test giao diện.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

    private final GeminiService geminiService;
    private final MockAiDataService mockAiDataService;

    /** Cho biết hiện đang dùng dữ liệu mẫu hay Gemini thật. */
    public boolean isMockMode() {
        return !geminiService.isConfigured();
    }

    public ChatResponse chat(ChatRequest request) {
        String reply;
        List<String> steps = null;

        boolean stepMode = "step".equalsIgnoreCase(request.getMode());

        if (!geminiService.isConfigured()) {
            // ---- Chế độ mock (test không cần Gemini) ----
            if (stepMode) {
                steps = mockAiDataService.stepReply(request.getMessage(), request.getAvailableIngredients());
                reply = "Mình đã chia sẻ các bước nấu món \"" + request.getMessage() + "\" cho bạn dưới đây:";
            } else {
                reply = mockAiDataService.chatReply(request.getMessage(), request.getAvailableIngredients());
            }
        } else {
            // ---- Chế độ dùng Gemini thật ----
            try {
                String prompt = stepMode
                        ? PromptTemplate.stepByStepPrompt(request.getMessage(), request.getAvailableIngredients())
                        : PromptTemplate.chatPrompt(request.getMessage(), request.getAvailableIngredients());
                // Gọi 1 lần duy nhất cho cả reply và steps (tiết kiệm quota gói free)
                String text = geminiService.generateText(prompt);
                if (stepMode) {
                    steps = parseSteps(text);
                    reply = "Mình đã hướng dẫn từng bước nấu món \"" + request.getMessage() + "\" cho bạn dưới đây:";
                } else {
                    reply = text;
                }
            } catch (Exception ex) {
                // Gemini quá tải / vượt hạn mức (gói free 20 req/phút) -> fallback mock
                // để người dùng vẫn test được giao diện liên tục.
                log.warn("Gemini lỗi ({}), tạm dùng dữ liệu mẫu: {}", ex.getMessage(), request.getMessage());
                String note = "ℹ️ Gemini hiện đang bận hoặc vượt hạn mức tạm thời — đây là câu trả lời mẫu để bạn tiếp tục test giao diện, thử lại sau ít phút để có câu trả lời từ AI nhé!";
                if (stepMode) {
                    steps = mockAiDataService.stepReply(request.getMessage(), request.getAvailableIngredients());
                    reply = note + "\nMình đã chia sẻ các bước nấu món \"" + request.getMessage() + "\" cho bạn dưới đây:";
                } else {
                    reply = note + "\n\n" + mockAiDataService.chatReply(request.getMessage(), request.getAvailableIngredients());
                }
            }
        }

        return ChatResponse.builder()
                .reply(reply)
                .steps(steps)
                .timestamp(LocalDateTime.now())
                .build();
    }

    private List<String> parseSteps(String text) {
        if (text == null || text.isBlank()) {
            return null;
        }
        // Tách theo dòng hoặc số bước
        String[] lines = text.split("\\r?\\n");
        List<String> steps = Arrays.stream(lines)
                .map(String::trim)
                .filter(line -> !line.isBlank())
                .toList();
        return steps.isEmpty() ? null : steps;
    }
}
