package com.nhom6.foodx.ai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@Slf4j
@Service
public class AiProviderService {

    @Value("${app.ai-service.url:http://localhost:8085}")
    private String aiServiceUrl;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    public boolean isMockMode() {
        return false;
    }

    public String generateText(String prompt, String mimeType) {
        try {
            java.util.Map<String, String> payload = new java.util.HashMap<>();
            payload.put("prompt", prompt == null ? "" : prompt);
            if (mimeType != null && !mimeType.isBlank()) {
                payload.put("mimeType", mimeType);
            }
            String requestBody = objectMapper.writeValueAsString(payload);
            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(aiServiceUrl + "/api/ai/generate"))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .timeout(Duration.ofSeconds(20))
                    .build();

            HttpResponse<String> res = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
            if (res.statusCode() == 200) {
                return res.body();
            }
        } catch (Exception ex) {
            log.warn("Không thể kết nối tới AI Service: {}", ex.getMessage());
        }
        return null;
    }
}
