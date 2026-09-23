package com.nhom6.foodx.ingredient.facade;

/**
 * Bản tóm tắt nguyên liệu cho giao tiếp liên module.
 */
public record IngredientSummary(
        Long id,
        String name,
        String category,
        Double caloriesPerUnit,
        String defaultUnit
) {
}
