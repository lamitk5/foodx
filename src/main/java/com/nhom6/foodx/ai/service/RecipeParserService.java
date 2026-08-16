package com.nhom6.foodx.ai.service;

/**
 * Parse công thức từ text thô sử dụng Gemini AI.
 */
import com.fasterxml.jackson.databind.JsonNode;
import com.nhom6.foodx.ai.util.PromptTemplate;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RecipeParserService {

    private final GeminiService geminiService;

    /**
     * Parse text công thức thành JsonNode có cấu trúc đã định nghĩa trong prompt.
     */
    public JsonNode parse(String rawText) {
        String prompt = PromptTemplate.recipeParsePrompt(rawText);
        return geminiService.generateJson(prompt, JsonNode.class);
    }

    public List<String> parseIngredientNames(JsonNode recipeNode) {
        List<String> names = new ArrayList<>();
        if (recipeNode != null && recipeNode.has("ingredients") && recipeNode.get("ingredients").isArray()) {
            for (JsonNode item : recipeNode.get("ingredients")) {
                if (item.has("name")) {
                    names.add(item.get("name").asText());
                }
            }
        }
        return names;
    }
}
