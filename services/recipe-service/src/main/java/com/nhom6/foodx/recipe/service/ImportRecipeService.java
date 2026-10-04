package com.nhom6.foodx.recipe.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.nhom6.foodx.common.exception.BusinessException;
import com.nhom6.foodx.recipe.dto.RecipeImportRequest;
import com.nhom6.foodx.recipe.dto.RecipeResponse;
import com.nhom6.foodx.recipe.parser.RecipeTextParser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * Import công thức từ URL hoặc text.
 */
@Service
@RequiredArgsConstructor
public class ImportRecipeService {

    private final RecipeTextParser recipeTextParser;
    private final RecipeService recipeService;

    public RecipeResponse importFromText(RecipeImportRequest request, Long authorId) {
        if (request.getText() == null || request.getText().isBlank()) {
            throw new BusinessException(400, "Text công thức không được để trống");
        }
        JsonNode parsed = recipeTextParser.parse(request.getText());
        return recipeService.createFromParsed(parsed, authorId);
    }
}
