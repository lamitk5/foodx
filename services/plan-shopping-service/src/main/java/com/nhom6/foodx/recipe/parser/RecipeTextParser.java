package com.nhom6.foodx.recipe.parser;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

/**
 * Phân tích công thức từ văn bản thô.
 * Gọi AI Service qua REST (port 8085) hoặc dùng parser dự phòng regex.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RecipeTextParser {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    @Value("${app.ai-service.url:http://localhost:8085}")
    private String aiServiceUrl;

    public JsonNode parse(String rawText) {
        if (rawText == null || rawText.isBlank()) {
            return buildFallbackRecipe(rawText);
        }

        try {
            String requestBody = objectMapper.writeValueAsString(java.util.Map.of("prompt", rawText));
            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(aiServiceUrl + "/api/ai/parse-recipe"))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .timeout(Duration.ofSeconds(15))
                    .build();

            HttpResponse<String> res = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
            if (res.statusCode() == 200) {
                JsonNode parsed = objectMapper.readTree(res.body());
                if (parsed != null && (parsed.has("title") || parsed.has("ingredients"))) {
                    return parsed;
                }
            }
        } catch (Exception ex) {
            log.warn("Gọi AI Service thất bại ({}), chuyển sang parser dự phòng.", ex.getMessage());
        }

        return buildFallbackRecipe(rawText);
    }

    private JsonNode buildFallbackRecipe(String rawText) {
        ObjectNode root = objectMapper.createObjectNode();
        if (rawText == null || rawText.isBlank()) {
            root.put("title", "Công thức món ăn");
            root.put("description", "Công thức phân tích");
            root.put("instructions", "Thực hiện theo các bước.");
            root.put("prepTime", 15);
            root.put("cookTime", 30);
            root.put("servings", 2);
            root.put("cuisine", "Việt Nam");
            root.put("category", "Món chính");
            root.put("difficulty", "Dễ");
            root.put("kcal", 450);
            root.putArray("ingredients");
            return root;
        }

        String[] lines = rawText.split("\\r?\\n");
        String title = lines.length > 0 && !lines[0].isBlank() ? lines[0].trim() : "Món ăn ngon";
        root.put("title", title);
        root.put("description", "Công thức nhập từ văn bản");
        root.put("instructions", rawText);
        root.put("prepTime", 15);
        root.put("cookTime", 30);
        root.put("servings", 2);
        root.put("cuisine", "Việt Nam");
        root.put("category", "Món chính");
        root.put("difficulty", "Trung bình");
        root.put("kcal", 500);
        root.putArray("ingredients");
        return root;
    }
}
