package com.nhom6.foodx.recipe.facade;

/**
 * Đặc tả tạo mới một công thức (dùng cho module khác nhờ recipe module lưu giúp,
 * ví dụ: plan module lưu món do AI sáng tạo).
 */
public record RecipeCreateSpec(
        String title,
        String description,
        String instructions,
        Integer kcal,
        Double protein,
        Double carb,
        Double fat,
        String difficulty,
        String mealSlots
) {
}
