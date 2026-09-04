package com.nhom6.foodx.ai.service;

import java.util.List;

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

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Goi Groq API (OpenAI-compatible chat completions) de sinh phan hoi text.
 * Day la provider uu tien; neu loi, AiProviderService se tu chuyen sang Gemini.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class GroqService {

    /** Ky tu backtick (dau fence cua Markdown), khong viet truc tiep de tranh xung dot. */
    private static final char BT = (char) 96;
    private static final String FENCE = "" + BT + BT + BT;

    private final GroqConfig groqConfig;
    private final WebClient.Builder webClientBuilder;

    /** Kiem tra xem Groq API key da duoc cau hinh hay chua. */
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

        GroqRequest.GroqRequestBuilder requestBuilder = GroqRequest.builder()
                .model(groqConfig.getModel())
                .messages(List.of(GroqRequest.Message.builder()
                        .role("user")
                        .content(prompt)
                        .build()))
                .temperature(0.7)
                .maxTokens(4096); // giới hạn độ dài sinh ra để giảm thời gian chờ

        // Groq ho tro JSON mode qua response_format (prompt phai chua chu "json")
        if ("application/json".equals(responseMimeType)) {
            requestBuilder.responseFormat(GroqRequest.ResponseFormat.builder().type("json_object").build());
        }

        try {
            GroqResponse response = webClientBuilder.build()
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
        } catch (BusinessException ex) {
            throw ex;
        } catch (WebClientResponseException ex) {
            log.error("Loi HTTP tu Groq API: Status={}, Body={}", ex.getStatusCode(), ex.getResponseBodyAsString(), ex);
            throw new BusinessException(ex.getStatusCode().value(), "Loi tu Groq API: " + ex.getResponseBodyAsString());
        } catch (Exception ex) {
            log.error("Loi goi Groq API", ex);
            throw new BusinessException(502, "Loi khi goi Groq API: " + ex.getMessage());
        }
    }

    public <T> T generateJson(String prompt, Class<T> type) {
        ObjectMapper mapper = new ObjectMapper();
        String text = generateText(prompt, "application/json");
        // Cat bo khoi JSON neu model boc trong dau ba backtick (fence) cua Markdown
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
        if (trimmed.startsWith(FENCE + "json")) {
            trimmed = trimmed.substring(7);
        } else if (trimmed.startsWith(FENCE)) {
            trimmed = trimmed.substring(3);
        }
        if (trimmed.endsWith(FENCE)) {
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