package com.nhom6.foodx.ai.service;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.nhom6.foodx.ai.dto.SuggestRequest;
import com.nhom6.foodx.ai.dto.SuggestResponse;
import com.nhom6.foodx.ai.util.PromptTemplate;

import lombok.RequiredArgsConstructor;

/**
 * Gợi ý công thức dựa trên nguyên liệu có sẵn.
 */
@Service
@RequiredArgsConstructor
public class SuggestionService {

    private final AiProviderService aiProviderService;
    private final MockAiDataService mockAiDataService;

    public SuggestResponse suggest(SuggestRequest request) {
        SuggestResponse response = new SuggestResponse();

        // Chưa cấu hình Groq/Gemini: trả dữ liệu mẫu để test.
        if (aiProviderService.isMockMode()) {
            response.setSuggestions(mockAiDataService.suggestions(
                    request.getAvailableIngredients(),
                    request.getPreference(),
                    request.getMealType()));
            return response;
        }

        String prompt = PromptTemplate.suggestionPrompt(request);
        JsonNode json = aiProviderService.generateJson(prompt, JsonNode.class);

        java.util.List<SuggestResponse.Suggestion> suggestions = new java.util.ArrayList<>();
        if (json.has("suggestions") && json.get("suggestions").isArray()) {
            for (JsonNode node : json.get("suggestions")) {
                java.util.List<String> ings = new java.util.ArrayList<>();
                if (node.has("ingredients") && node.get("ingredients").isArray()) {
                    node.get("ingredients").forEach(i -> ings.add(i.asText()));
                }
                suggestions.add(SuggestResponse.Suggestion.builder()
                        .title(node.path("title").asText())
                        .description(node.path("description").asText())
                        .ingredients(ings)
                        .instructions(node.path("instructions").asText())
                        .estimatedTime(node.path("estimatedTime").asText())
                        .build());
            }
        }
        response.setSuggestions(suggestions);
        return response;
    }
}
