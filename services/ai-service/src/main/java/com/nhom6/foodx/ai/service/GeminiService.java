package com.nhom6.foodx.ai.service;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nhom6.foodx.ai.config.GeminiConfig;
import com.nhom6.foodx.ai.dto.GeminiRequest;
import com.nhom6.foodx.ai.dto.GeminiResponse;
import com.nhom6.foodx.common.exception.BusinessException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Gọi Gemini API để sinh phản hồi text.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class GeminiService {

    private final GeminiConfig geminiConfig;
    private final WebClient.Builder webClientBuilder;

    /** Kiểm tra xem Gemini API key đã được cấu hình hay chưa. */
    public boolean isConfigured() {
        return geminiConfig.getApiKey() != null && !geminiConfig.getApiKey().isBlank();
    }

    public String generateText(String prompt) {
        return generateText(prompt, null);
    }

    public String generateText(String prompt, String responseMimeType) {
        if (geminiConfig.getApiKey() == null || geminiConfig.getApiKey().isBlank()) {
            throw new BusinessException(503, "Gemini API key chưa được cấu hình");
        }

        GeminiRequest.GenerationConfig.GenerationConfigBuilder configBuilder = GeminiRequest.GenerationConfig.builder()
                .temperature(0.7)
                .maxOutputTokens(4096); // giới hạn độ dài sinh ra để giảm thời gian chờ

        if (responseMimeType != null && !responseMimeType.isBlank()) {
            configBuilder.responseMimeType(responseMimeType);
        }

        GeminiRequest request = GeminiRequest.builder()
                .contents(List.of(GeminiRequest.Content.builder()
                        .parts(List.of(GeminiRequest.Part.builder().text(prompt).build()))
                        .build()))
                .generationConfig(configBuilder.build())
                .build();

        String uri = geminiConfig.getUrl() + "/" + geminiConfig.getModel()
                + ":generateContent?key=" + geminiConfig.getApiKey();

        try {
            GeminiResponse response = webClientBuilder.build()
                    .post()
                    .uri(uri)
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("x-goog-api-key", geminiConfig.getApiKey())
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(GeminiResponse.class)
                    .block();

            if (response == null || response.getCandidates() == null
                    || response.getCandidates().isEmpty()
                    || response.getCandidates().get(0).getContent() == null
                    || response.getCandidates().get(0).getContent().getParts() == null) {
                throw new BusinessException(502, "Gemini API trả về phản hồi rỗng");
            }

            StringBuilder sb = new StringBuilder();
            for (GeminiResponse.Part part : response.getCandidates().get(0).getContent().getParts()) {
                sb.append(part.getText());
            }
            return sb.toString();
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
        // Cắt mảnh JSON bọc ```json ... ``` nếu có
        String json = extractJson(text);
        try {
            return mapper.readValue(json, type);
        } catch (Exception ex) {
            log.error("Không parse được JSON từ Gemini. Content: '{}'", json, ex);
            throw new BusinessException(502, "Phản hồi AI không đúng định dạng: " + ex.getMessage());
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
