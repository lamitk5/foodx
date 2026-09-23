package com.nhom6.foodx.recipe.dto;

/**
 * Kết quả khớp một công thức với tủ lạnh của người dùng ("nấu với tủ của tôi").
 */
public record RecipeMatchDto(
        RecipeResponse recipe,
        long matchedIngredients,
        long totalIngredients,
        int matchPercent
) {
}
