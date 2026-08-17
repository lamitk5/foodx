package com.nhom6.foodx.ai.service;

import com.nhom6.foodx.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Định tuyến provider AI: ưu tiên Groq, tự động fallback sang Gemini khi Groq lỗi.
 * Nếu chưa cấu hình provider nào, các service gọi sẽ dùng dữ liệu mẫu (mock).
 * <p>
 * Tối ưu tốc độ: khi Groq lỗi, ta tạm "cách ly" Groq trong GROQ_COOLDOWN_MS để các
 * request tiếp theo dùng thẳng Gemini (không phải chờ Groq lỗi lặp lại mỗi lần).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AiProviderService {

    /** Thời gian tạm bỏ qua Groq sau một lỗi (ms) trước khi thử lại. */
    private static final long GROQ_COOLDOWN_MS = 30_000L;

    private final GroqService groqService;
    private final GeminiService geminiService;

    /** Thời điểm được phép thử lại Groq (ms epoch). 0 = Groq bình thường. */
    private volatile long groqFailUntil = 0L;

    /** Provider đang được dùng: groq -> gemini -> mock. */
    public String getActiveProvider() {
        if (groqService.isConfigured()) {
            return "groq";
        }
        if (geminiService.isConfigured()) {
            return "gemini";
        }
        return "mock";
    }

    /** Còn dùng dữ liệu mẫu (chưa cấu hình Groq lẫn Gemini). */
    public boolean isMockMode() {
        return !groqService.isConfigured() && !geminiService.isConfigured();
    }

    /** Groq sẵn sàng dùng: đã cấu hình và không đang trong cooldown sau lỗi. */
    private boolean groqAvailable() {
        return groqService.isConfigured() && System.currentTimeMillis() >= groqFailUntil;
    }

    private void markGroqFailed() {
        groqFailUntil = System.currentTimeMillis() + GROQ_COOLDOWN_MS;
    }

    private void markGroqOk() {
        groqFailUntil = 0L;
    }

    public String generateText(String prompt) {
        return generateText(prompt, null);
    }

    public String generateText(String prompt, String responseMimeType) {
        // 1) Ưu tiên Groq nếu đang khả dụng
        if (groqAvailable()) {
            try {
                String result = groqService.generateText(prompt, responseMimeType);
                markGroqOk();
                return result;
            } catch (Exception groqEx) {
                markGroqFailed();
                log.warn("Groq lỗi ({}), tự động chuyển sang Gemini.", groqEx.getMessage());
                if (geminiService.isConfigured()) {
                    return geminiService.generateText(prompt, responseMimeType);
                }
                throw new BusinessException(502, "Groq lỗi và chưa cấu hình Gemini dự phòng: " + groqEx.getMessage());
            }
        }

        // 2) Groq đang cooldown sau lỗi -> dùng Gemini ngay (tránh chờ lỗi lặp lại)
        if (geminiService.isConfigured()) {
            return geminiService.generateText(prompt, responseMimeType);
        }

        // 3) Không có Gemini: thử lại Groq (dù đang cooldown) hoặc báo lỗi
        if (groqService.isConfigured()) {
            return groqService.generateText(prompt, responseMimeType);
        }
        throw new BusinessException(503, "Chưa cấu hình AI (Groq/Gemini) - không thể sinh phản hồi");
    }

    public <T> T generateJson(String prompt, Class<T> type) {
        // 1) Ưu tiên Groq nếu đang khả dụng
        if (groqAvailable()) {
            try {
                T result = groqService.generateJson(prompt, type);
                markGroqOk();
                return result;
            } catch (Exception groqEx) {
                markGroqFailed();
                log.warn("Groq lỗi ({}), tự động chuyển sang Gemini.", groqEx.getMessage());
                if (geminiService.isConfigured()) {
                    return geminiService.generateJson(prompt, type);
                }
                throw new BusinessException(502, "Groq lỗi và chưa cấu hình Gemini dự phòng: " + groqEx.getMessage());
            }
        }

        // 2) Groq đang cooldown sau lỗi -> dùng Gemini ngay
        if (geminiService.isConfigured()) {
            return geminiService.generateJson(prompt, type);
        }

        // 3) Không có Gemini: thử lại Groq hoặc báo lỗi
        if (groqService.isConfigured()) {
            return groqService.generateJson(prompt, type);
        }
        throw new BusinessException(503, "Chưa cấu hình AI (Groq/Gemini) - không thể sinh phản hồi");
    }
}