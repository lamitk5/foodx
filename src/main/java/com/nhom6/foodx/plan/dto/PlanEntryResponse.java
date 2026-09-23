package com.nhom6.foodx.plan.dto;

import java.time.LocalDate;
import java.util.List;

/**
 * Một bữa ăn trong kế hoạch, kèm đầy đủ dữ liệu hiển thị (ảnh, dinh dưỡng, tag nguyên liệu)
 * để frontend KHÔNG phải gọi thêm API và không bao giờ gặp null khi slot chưa có món.
 */
public record PlanEntryResponse(
        Long id,
        LocalDate planDate,
        String slot,
        Long recipeId,
        String recipeTitle,
        Integer recipeKcal,
        String imageUrl,
        Integer cookTime,
        String difficulty,
        Double protein,
        Double carb,
        Double fat,
        List<IngredientTag> ingredients
) {
    /** Tag nguyên liệu: name + trạng thái đã có trong tủ hay cần mua. */
    public record IngredientTag(String name, boolean inFridge) {
    }
}
