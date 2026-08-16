package com.nhom6.foodx.ai.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nhom6.foodx.ai.config.GeminiConfig;
import com.nhom6.foodx.ai.dto.GeminiRequest;
import com.nhom6.foodx.ai.dto.GeminiResponse;
import com.nhom6.foodx.common.exception.BusinessException;

import lombok.extern.slf4j.Slf4j;

/**
 * Gọi Gemini API để sinh phản hồi text.
 */
@Slf4j
@Service
public class GeminiService {

    private static final String SYSTEM_PROMPT = """
            Bạn là trợ lý nấu ăn FoodX. Trả lời bằng tiếng Việt, ngắn gọn, chính xác, thân thiện.
            Ưu tiên dùng nguyên liệu người dùng đang có. Tuyệt đối tránh nguyên liệu họ dị ứng.
            Không bịa số liệu dinh dưỡng nếu không chắc chắn. Nếu không liên quan ẩm thực, từ chối lịch sự.
            Khi được yêu cầu JSON, chỉ trả về JSON hợp lệ, không markdown, không giải thích thêm.
            """;

    private final GeminiConfig geminiConfig;
    private final WebClient webClient;

    public GeminiService(GeminiConfig geminiConfig,
                         @Qualifier("aiWebClient") WebClient webClient) {
        this.geminiConfig = geminiConfig;
        this.webClient = webClient;
    }

    public boolean isConfigured() {
        return geminiConfig.getApiKey() != null && !geminiConfig.getApiKey().isBlank();
    }

    public String generateText(String prompt) {
        return generateText(prompt, null);
    }

    public String generateText(String prompt, String responseMimeType) {
        if (!isConfigured()) {
            throw new BusinessException(503, "Gemini API key chưa được cấu hình");
        }

        boolean jsonMode = responseMimeType != null && !responseMimeType.isBlank();
        GeminiRequest.GenerationConfig.GenerationConfigBuilder configBuilder = GeminiRequest.GenerationConfig.builder()
                .temperature(jsonMode ? 0.2 : 0.6)
                .maxOutputTokens(2048);

        if (jsonMode) {
            configBuilder.responseMimeType(responseMimeType);
        }

        GeminiRequest request = GeminiRequest.builder()
                .systemInstruction(GeminiRequest.Content.builder()
                        .parts(List.of(GeminiRequest.Part.builder().text(SYSTEM_PROMPT).build()))
                        .build())
                .contents(List.of(GeminiRequest.Content.builder()
                        .parts(List.of(GeminiRequest.Part.builder().text(prompt).build()))
                        .build()))
                .generationConfig(configBuilder.build())
                .build();

        String uri = geminiConfig.getUrl() + "/" + geminiConfig.getModel() + ":generateContent";

        try {
            GeminiResponse response = webClient
                    .post()
                    .uri(uri)
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("x-goog-api-key", geminiConfig.getApiKey())
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(GeminiResponse.class)
                    .block();

            return extractText(response, "Gemini API");
        } catch (BusinessException ex) {
            throw ex;
        } catch (org.springframework.web.reactive.function.client.WebClientResponseException ex) {
            log.error("Lỗi HTTP từ Gemini API: Status={}, Body={}", ex.getStatusCode(), ex.getResponseBodyAsString(), ex);
            throw new BusinessException(ex.getStatusCode().value(), "Lỗi từ Gemini API: " + ex.getResponseBodyAsString());
        } catch (Exception ex) {
            log.error("Lỗi gọi Gemini API", ex);
            throw new BusinessException(502, "Lỗi khi gọi Gemini API: " + ex.getMessage());
        }
    }

    public <T> T generateJson(String prompt, Class<T> type) {
        ObjectMapper mapper = new ObjectMapper();
        String text = generateText(prompt, "application/json");
        String json = extractJson(text);
        try {
            return mapper.readValue(json, type);
        } catch (Exception ex) {
            log.error("Không parse được JSON từ Gemini. Content: '{}'", json, ex);
            throw new BusinessException(502, "Phản hồi AI không đúng định dạng: " + ex.getMessage());
        }
    }

    private String extractText(GeminiResponse response, String apiName) {
        if (response == null || response.getCandidates() == null
                || response.getCandidates().isEmpty()
                || response.getCandidates().get(0).getContent() == null
                || response.getCandidates().get(0).getContent().getParts() == null) {
            throw new BusinessException(502, apiName + " trả về phản hồi rỗng");
        }
        StringBuilder sb = new StringBuilder();
        for (GeminiResponse.Part part : response.getCandidates().get(0).getContent().getParts()) {
            if (part.getText() != null) {
                sb.append(part.getText());
            }
        }
        return sb.toString();
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
