package com.nhom6.foodx.recipe.parser;

import com.fasterxml.jackson.databind.JsonNode;
import com.nhom6.foodx.ai.service.RecipeParserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Parse công thức từ text thông qua AI.
 * Logic AI được ủy quyền cho package ai/ -> tránh lặp code.
 */
@Component
@RequiredArgsConstructor
public class RecipeTextParser {

    private final RecipeParserService recipeParserService;

    public JsonNode parse(String rawText) {
        return recipeParserService.parse(rawText);
    }
}
