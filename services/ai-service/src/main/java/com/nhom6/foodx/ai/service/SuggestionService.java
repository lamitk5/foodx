package com.nhom6.foodx.ai.service;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.nhom6.foodx.ai.dto.SuggestRequest;
import com.nhom6.foodx.ai.dto.SuggestResponse;
import com.nhom6.foodx.ai.util.PromptTemplate;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Gợi ý công thức dựa trên nguyên liệu có sẵn.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SuggestionService {

    private final AiProviderService aiProviderService;
    private final MockAiDataService mockAiDataService;

    public SuggestResponse suggest(SuggestRequest request) {
        if (request == null || aiProviderService.isMockMode()) {
            return mockResponse(request);
        }

        try {
            String prompt = PromptTemplate.suggestionPrompt(request);
            JsonNode json = aiProviderService.generateJson(prompt, JsonNode.class);
            java.util.List<SuggestResponse.Suggestion> suggestions = parseSuggestions(json);
            if (!suggestions.isEmpty()) {
                SuggestResponse response = new SuggestResponse();
                response.setSuggestions(limit(suggestions, request.getMaxSuggestions()));
                return response;
            }
            log.warn("AI không trả món gợi ý, dùng dữ liệu mẫu");
        } catch (Exception ex) {
            log.warn("Gợi ý AI lỗi, dùng dữ liệu mẫu: {}", ex.getMessage());
        }
        return mockResponse(request);
    }

    private SuggestResponse mockResponse(SuggestRequest request) {
        SuggestResponse response = new SuggestResponse();
        java.util.List<String> ingredients = request == null ? null : request.getAvailableIngredients();
        String preference = request == null ? null : request.getPreference();
        String mealType = request == null ? null : request.getMealType();
        Integer max = request == null ? null : request.getMaxSuggestions();
        response.setSuggestions(limit(
                mockAiDataService.suggestions(ingredients, preference, mealType),
                max));
        return response;
    }

    private java.util.List<SuggestResponse.Suggestion> parseSuggestions(JsonNode json) {
        java.util.List<SuggestResponse.Suggestion> suggestions = new java.util.ArrayList<>();
        if (json == null || !json.has("suggestions") || !json.get("suggestions").isArray()) {
            return suggestions;
        }
        for (JsonNode node : json.get("suggestions")) {
            java.util.List<String> ings = new java.util.ArrayList<>();
            if (node.has("ingredients") && node.get("ingredients").isArray()) {
                node.get("ingredients").forEach(i -> ings.add(i.asText()));
            }
            String title = node.path("title").asText("");
            if (title.isBlank()) {
                continue;
            }
            suggestions.add(SuggestResponse.Suggestion.builder()
                    .title(title)
                    .description(node.path("description").asText(""))
                    .ingredients(ings)
                    .instructions(node.path("instructions").asText(""))
                    .estimatedTime(node.path("estimatedTime").asText(""))
                    .build());
        }
        return suggestions;
    }

    private java.util.List<SuggestResponse.Suggestion> limit(
            java.util.List<SuggestResponse.Suggestion> suggestions, Integer max) {
        if (suggestions == null) {
            return java.util.List.of();
        }
        if (max == null || max <= 0 || suggestions.size() <= max) {
            return suggestions;
        }
        return suggestions.subList(0, max);
    }
}
