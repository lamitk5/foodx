package com.nhom6.foodx.common.dto;

import java.util.List;

/**
 * Bản tóm tắt công thức, trả về qua API nội bộ của recipe-service.
 *
 * <p>plan-shopping-service dùng để dựng thực đơn, social-stats-service dùng để tính
 * calo/thống kê và trừ nguyên liệu khỏi tủ — cả hai đều không cần bảng {@code recipes}
 * trong mã nguồn của mình.</p>
 *
 * @param servings        số khẩu phần gốc của công thức (để quy đổi khi nấu ít/nhiều hơn)
 * @param ingredientNames tên nguyên liệu (tiện cho việc hiển thị/khớp món)
 * @param ingredients     nguyên liệu kèm định lượng (để trừ kho sau khi nấu)
 */
public record RecipeSummaryDto(
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
        Integer servings,
        List<String> ingredientNames,
        List<RecipeIngredientRefDto> ingredients) {
}
