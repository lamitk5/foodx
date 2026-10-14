package com.nhom6.foodx.ai.service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import org.springframework.stereotype.Service;

import com.nhom6.foodx.ai.dto.ChatRequest;
import com.nhom6.foodx.ai.dto.ChatResponse;
import com.nhom6.foodx.ai.dto.ChatTurn;
import com.nhom6.foodx.ai.util.PromptTemplate;
import com.nhom6.foodx.common.exception.BusinessException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Trợ lý AI nấu ăn - hỏi đáp và hướng dẫn từng bước.
 * Dùng dữ liệu mẫu (mock) khi chưa cấu hình Groq/Gemini API key để test giao diện.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

    private final AiProviderService aiProviderService;
    private final MockAiDataService mockAiDataService;

    /** Cho biết hiện đang dùng dữ liệu mẫu (chưa cấu hình Groq/Gemini). */
    public boolean isMockMode() {
        return aiProviderService.isMockMode();
    }

    /** Provider đang dùng: groq -> gemini -> mock. */
    public String getActiveProvider() {
        return aiProviderService.getActiveProvider();
    }

    public boolean isDegraded() {
        return aiProviderService.isDegraded();
    }

    public String getLastProviderError() {
        return aiProviderService.getLastProviderError();
    }

    public ChatResponse chat(ChatRequest request) {
        return chat(request, null);
    }

    /**
     * Chat có bối cảnh người dùng (hồ sơ + tủ lạnh + lịch sử) do server dựng.
     * Nếu {@code extraContext} rỗng/null thì hành vi như {@link #chat(ChatRequest)}.
     */
    public ChatResponse chat(ChatRequest request, String extraContext) {
        return chat(request, extraContext, List.of());
    }

    /**
     * Chat có bối cảnh và lịch sử hội thoại dạng lượt riêng (chỉ mode chat).
     */
    public ChatResponse chat(ChatRequest request, String extraContext, List<ChatTurn> history) {
        String reply;
        List<String> steps = null;

        boolean stepMode = "step".equalsIgnoreCase(request.getMode());
        boolean substituteMode = "substitute".equalsIgnoreCase(request.getMode());
        String context = extraContext == null ? "" : extraContext;
        List<ChatTurn> turns = history == null ? List.of() : history;

        boolean fallback = false;
        if (aiProviderService.isMockMode()) {
            // Chưa có API key: trả câu mẫu và đánh dấu để giao diện không hiện như AI thật.
            fallback = true;
            if (substituteMode) {
                reply = "{\"items\":[]}";
            } else if (stepMode) {
                steps = mockAiDataService.stepReply(request.getMessage(), request.getAvailableIngredients());
                reply = "Mình đã chia sẻ các bước nấu món \"" + request.getMessage() + "\" cho bạn dưới đây:";
            } else {
                reply = mockAiDataService.chatReply(request.getMessage(), request.getAvailableIngredients());
            }
        } else {
            try {
                String prompt = substituteMode
                        ? PromptTemplate.substitutePrompt(request.getMessage(), request.getAvailableIngredients(), context)
                        : stepMode
                        ? PromptTemplate.stepByStepPrompt(request.getMessage(), request.getAvailableIngredients(), context)
                        : PromptTemplate.chatPrompt(request.getMessage(), request.getAvailableIngredients(), context);
                String text = (!stepMode && !substituteMode)
                        ? aiProviderService.generateChat(prompt, turns)
                        : aiProviderService.generateText(prompt);
                if (stepMode) {
                    steps = parseSteps(text);
                    reply = "Mình đã hướng dẫn từng bước nấu món \"" + request.getMessage() + "\" cho bạn dưới đây:";
                } else {
                    reply = text;
                }
            } catch (BusinessException ex) {
                throw ex;
            } catch (Exception ex) {
                log.error("Nhà cung cấp AI lỗi: {}", ex.getMessage(), ex);
                throw new BusinessException(502, "Trợ lý AI đang lỗi. Thử lại sau ít giây.");
            }
        }

        return ChatResponse.builder()
                .reply(reply)
                .steps(steps)
                .fallback(fallback)
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
