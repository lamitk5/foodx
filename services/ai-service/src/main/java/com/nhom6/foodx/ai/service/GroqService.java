package com.nhom6.foodx.ai.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nhom6.foodx.ai.config.GroqConfig;
import com.nhom6.foodx.ai.dto.GroqRequest;
import com.nhom6.foodx.ai.dto.GroqResponse;
import com.nhom6.foodx.common.exception.BusinessException;

import lombok.extern.slf4j.Slf4j;

/**
 * Goi Groq API (OpenAI-compatible chat completions) de sinh phan hoi text.
 * Day la provider uu tien; neu loi, AiProviderService se tu chuyen sang Gemini.
 */
@Slf4j
@Service
public class GroqService {

    private static final String SYSTEM_PROMPT = """
            Bạn là trợ lý nấu ăn FoodX. Trả lời bằng tiếng Việt, ngắn gọn, chính xác, thân thiện.
            Ưu tiên dùng nguyên liệu người dùng đang có. Tuyệt đối tránh nguyên liệu họ dị ứng.
            Không bịa số liệu dinh dưỡng nếu không chắc chắn. Nếu không liên quan ẩm thực, từ chối lịch sự.
            Khi được yêu cầu JSON, chỉ trả về JSON hợp lệ, không markdown, không giải thích thêm.
            """;

    private final GroqConfig groqConfig;
    private final WebClient webClient;

    public GroqService(GroqConfig groqConfig,
                       @Qualifier("aiWebClient") WebClient webClient) {
        this.groqConfig = groqConfig;
        this.webClient = webClient;
    }

    public boolean isConfigured() {
        return groqConfig.getApiKey() != null && !groqConfig.getApiKey().isBlank();
    }

    public String generateText(String prompt) {
        return generateText(prompt, null);
    }

    public String generateText(String prompt, String responseMimeType) {
        if (!isConfigured()) {
            throw new BusinessException(503, "Groq API key chua duoc cau hinh");
        }

        boolean jsonMode = "application/json".equals(responseMimeType);
        String currentModel = groqConfig.getModel();
        int maxRetries = 2;
        int attempt = 0;

        while (attempt <= maxRetries) {
            GroqRequest.GroqRequestBuilder requestBuilder = GroqRequest.builder()
                    .model(currentModel)
                    .messages(List.of(
                            GroqRequest.Message.builder().role("system").content(SYSTEM_PROMPT).build(),
                            GroqRequest.Message.builder().role("user").content(prompt).build()))
                    .temperature(jsonMode ? 0.2 : 0.6)
                    .maxTokens(2048);

            if (jsonMode) {
                requestBuilder.responseFormat(GroqRequest.ResponseFormat.builder().type("json_object").build());
            }

            try {
                GroqResponse response = webClient
                        .post()
                        .uri(groqConfig.getUrl())
                        .contentType(MediaType.APPLICATION_JSON)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + groqConfig.getApiKey())
                        .bodyValue(requestBuilder.build())
                        .retrieve()
                        .bodyToMono(GroqResponse.class)
                        .block();

                if (response == null || response.getChoices() == null || response.getChoices().isEmpty()
                        || response.getChoices().get(0).getMessage() == null
                        || response.getChoices().get(0).getMessage().getContent() == null) {
                    throw new BusinessException(502, "Groq API tra ve phan hoi rong");
                }

                return response.getChoices().get(0).getMessage().getContent();
            } catch (WebClientResponseException ex) {
                int status = ex.getStatusCode().value();
                if (status == 429 || status == 503) {
                    log.warn("Groq Rate Limit/503. Attempt {}/{}", attempt + 1, maxRetries + 1);
                    if (attempt == 0) {
                        try { Thread.sleep(1000); } catch(Exception e) {}
                    } else if (attempt == 1) {
                        currentModel = "llama-3.1-8b-instant";
                        log.warn("Falling back to model: {}", currentModel);
                        try { Thread.sleep(2000); } catch(Exception e) {}
                    }
                    attempt++;
                    if (attempt > maxRetries) {
                        throw new BusinessException(status, "AI hiện đang bận hoặc vượt hạn mức. Vui lòng thử lại sau vài giây.");
                    }
                } else {
                    log.error("Loi HTTP tu Groq API: Status={}, Body={}", ex.getStatusCode(), ex.getResponseBodyAsString(), ex);
                    throw new BusinessException(ex.getStatusCode().value(), "Loi tu Groq API: " + ex.getResponseBodyAsString());
                }
            } catch (Exception ex) {
                log.error("Loi goi Groq API", ex);
                throw new BusinessException(502, "Loi khi goi Groq API: " + ex.getMessage());
            }
        }
        throw new BusinessException(502, "Khong the hoan thanh yeu cau API.");
    }

    public <T> T generateJson(String prompt, Class<T> type) {
        ObjectMapper mapper = new ObjectMapper();
        String text = generateText(prompt, "application/json");
        String json = extractJson(text);
        try {
            return mapper.readValue(json, type);
        } catch (Exception ex) {
            log.error("Khong parse duoc JSON tu Groq. Content: '{}'", json, ex);
            throw new BusinessException(502, "Phan hoi AI khong dung dinh dang: " + ex.getMessage());
        }
    }

    private String extractJson(String text) {
        if (text == null) {
            return "{}";
        }
        String trimmed = text.trim();
        if (trimmed.startsWith("```json")) {
            trimmed = trimmed.substring(7);
        } else if (trimmed.startsWith("```")) {
            trimmed = trimmed.substring(3);
        }
        if (trimmed.endsWith("```")) {
            trimmed = trimmed.substring(0, trimmed.length() - 3);
        }
        trimmed = trimmed.trim();

        int firstObj = trimmed.indexOf('{');
        int lastObj = trimmed.lastIndexOf('}');
        int firstArr = trimmed.indexOf('[');
        int lastArr = trimmed.lastIndexOf(']');

        if (firstObj >= 0 && lastObj > firstObj && (firstArr < 0 || firstObj < firstArr)) {
            return trimmed.substring(firstObj, lastObj + 1);
        } else if (firstArr >= 0 && lastArr > firstArr) {
            return trimmed.substring(firstArr, lastArr + 1);
        }
        return trimmed;
    }
}
