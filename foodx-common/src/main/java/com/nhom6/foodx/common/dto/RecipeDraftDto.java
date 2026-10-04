package com.nhom6.foodx.common.dto;

/**
 * Bản nháp công thức do service khác (thường là plan-shopping-service sau khi AI gợi ý
 * món mới) gửi sang recipe-service để "đảm bảo tồn tại".
 *
 * <p>recipe-service là service duy nhất ghi bảng {@code recipes}.</p>
 */
public record RecipeDraftDto(
        String title,
        String description,
        String instructions,
        Integer kcal,
        Double protein,
        Double carb,
        Double fat,
        String difficulty,
        String mealSlots) {
}
