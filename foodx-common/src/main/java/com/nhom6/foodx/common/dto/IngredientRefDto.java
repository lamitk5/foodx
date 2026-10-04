package com.nhom6.foodx.common.dto;

/**
 * Tham chiếu tới một nguyên liệu trong danh mục của inventory-service.
 *
 * <p>recipe-service lưu {@code ingredientId} + {@code ingredientName} và hỏi
 * inventory-service khi cần đảm bảo nguyên liệu tồn tại, thay vì tự ghi vào bảng
 * {@code ingredients}.</p>
 *
 * @param caloriesPerUnit calo trên mỗi 100g/ml — cần cho màn hình "nguyên liệu yêu thích"
 */
public record IngredientRefDto(
        Long id,
        String name,
        String defaultUnit,
        String category,
        Double caloriesPerUnit) {
}
