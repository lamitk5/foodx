package com.nhom6.foodx.ai.service;

import com.nhom6.foodx.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Định tuyến provider AI: ưu tiên Groq, tự động fallback sang Gemini khi Groq lỗi.
 * Circuit-breaker cho cả Groq lẫn Gemini để không chờ timeout lặp lại khi provider chết.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AiProviderService {

    private static final long COOLDOWN_MS = 30_000L;
    private static final int MAX_PROMPT_CHARS = 12_000;

    private final GroqService groqService;
    private final GeminiService geminiService;
    private final AiRequestGate aiRequestGate;

    private volatile long groqFailUntil = 0L;
    private volatile long geminiFailUntil = 0L;

    public String getActiveProvider() {
        if (groqAvailable()) {
            return "groq";
        }
        if (geminiAvailable()) {
            return "gemini";
        }
        if (groqService.isConfigured()) {
            return "groq";
        }
        if (geminiService.isConfigured()) {
            return "gemini";
        }
        return "mock";
    }

    public boolean isMockMode() {
        return !groqService.isConfigured() && !geminiService.isConfigured();
    }

    private boolean groqAvailable() {
        return groqService.isConfigured() && System.currentTimeMillis() >= groqFailUntil;
    }

    private boolean geminiAvailable() {
        return geminiService.isConfigured() && System.currentTimeMillis() >= geminiFailUntil;
    }

    private void markGroqFailed() {
        groqFailUntil = System.currentTimeMillis() + COOLDOWN_MS;
    }

    private void markGroqOk() {
        groqFailUntil = 0L;
    }

    private void markGeminiFailed() {
        geminiFailUntil = System.currentTimeMillis() + COOLDOWN_MS;
    }

    private void markGeminiOk() {
        geminiFailUntil = 0L;
    }

    private static String clampPrompt(String prompt) {
        if (prompt == null) {
            return "";
        }
        if (prompt.length() <= MAX_PROMPT_CHARS) {
            return prompt;
        }
        return prompt.substring(0, MAX_PROMPT_CHARS) + "\n…(đã rút gọn prompt)";
    }

    private String friendlyProviderError(Exception ex) {
        if (ex instanceof BusinessException be) {
            int status = be.getStatus();
            return switch (status) {
                case 400 -> "Yêu cầu không hợp lệ — thử diễn đạt lại câu hỏi.";
                case 401, 403 -> "API key AI không hợp lệ hoặc bị từ chối.";
                case 404 -> "Model AI không tồn tại hoặc không khả dụng.";
                case 429 -> "Vượt hạn mức AI — thử lại sau ít giây.";
                case 500, 502, 503, 504 -> "Máy chủ AI tạm thời gián đoạn — thử lại sau.";
                default -> be.getMessage() != null ? be.getMessage() : "Lỗi AI (" + status + ")";
            };
        }
        String msg = ex.getMessage() == null ? "" : ex.getMessage();
        if (msg.contains("429") || msg.toLowerCase().contains("rate")) {
            return "Vượt hạn mức AI — thử lại sau ít giây.";
        }
        if (msg.contains("model")) {
            return "Model AI không khả dụng — kiểm tra cấu hình app.groq.model / app.gemini.model.";
        }
        return msg.isBlank() ? "Lỗi khi gọi AI" : msg;
    }

    public String generateText(String prompt) {
        return generateText(prompt, null);
    }

    public String generateText(String prompt, String responseMimeType) {
        String p = clampPrompt(prompt);
        return aiRequestGate.call("generateText", () -> doGenerateText(p, responseMimeType));
    }

    private String doGenerateText(String prompt, String responseMimeType) {
        if (groqAvailable()) {
            try {
                String result = groqService.generateText(prompt, responseMimeType);
                markGroqOk();
                return result;
            } catch (Exception groqEx) {
                markGroqFailed();
                log.warn("Groq lỗi ({}), thử Gemini.", groqEx.getMessage());
            }
        }

        if (geminiAvailable()) {
            try {
                String result = geminiService.generateText(prompt, responseMimeType);
                markGeminiOk();
                return result;
            } catch (Exception gemEx) {
                markGeminiFailed();
                log.warn("Gemini lỗi ({}).", gemEx.getMessage());
                // Nếu Groq đang cooldown nhưng Gemini cũng fail — ném lỗi rõ
                if (groqService.isConfigured()) {
                    throw new BusinessException(502, "Cả Groq và Gemini đều lỗi: " + friendlyProviderError(gemEx));
                }
                throw new BusinessException(502, "Gemini lỗi: " + friendlyProviderError(gemEx));
            }
        }

        // Groq cooldown + Gemini không khả dụng: thử lại Groq một lần
        if (groqService.isConfigured()) {
            return groqService.generateText(prompt, responseMimeType);
        }
        throw new BusinessException(503, "Chưa cấu hình AI (Groq/Gemini) - không thể sinh phản hồi");
    }

    public <T> T generateJson(String prompt, Class<T> type) {
        String p = clampPrompt(prompt);
        return aiRequestGate.call("generateJson", () -> doGenerateJson(p, type));
    }

    private <T> T doGenerateJson(String prompt, Class<T> type) {
        if (groqAvailable()) {
            try {
                T result = groqService.generateJson(prompt, type);
                markGroqOk();
                return result;
            } catch (Exception groqEx) {
                markGroqFailed();
                log.warn("Groq JSON lỗi ({}), thử Gemini.", groqEx.getMessage());
            }
        }

        if (geminiAvailable()) {
            try {
                T result = geminiService.generateJson(prompt, type);
                markGeminiOk();
                return result;
            } catch (Exception gemEx) {
                markGeminiFailed();
                log.warn("Gemini JSON lỗi ({}).", gemEx.getMessage());
                if (groqService.isConfigured()) {
                    throw new BusinessException(502, "Cả Groq và Gemini đều lỗi: " + friendlyProviderError(gemEx));
                }
                throw new BusinessException(502, "Gemini lỗi: " + friendlyProviderError(gemEx));
            }
        }

        if (groqService.isConfigured()) {
            return groqService.generateJson(prompt, type);
        }
        throw new BusinessException(503, "Chưa cấu hình AI (Groq/Gemini) - không thể sinh phản hồi");
    }
}
