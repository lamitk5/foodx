package com.nhom6.foodx.recipe.facade;

import java.util.List;

/**
 * Bản tóm tắt công thức dùng cho giao tiếp liên module (Public API của recipe module).
 * Không lộ entity/Repository ra ngoài — chỉ trả DTO thuần.
 */
public record RecipeSummary(
        Long id,
        String title,
        String imageUrl,
        Integer kcal,
        String difficulty,
        Integer cookTime,
        Double protein,
        Double carb,
        Double fat,
        String mealSlots,
        List<String> ingredientNames
) {
}
