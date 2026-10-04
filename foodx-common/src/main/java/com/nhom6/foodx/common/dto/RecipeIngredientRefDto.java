package com.nhom6.foodx.common.dto;

/**
 * Một nguyên liệu của công thức (tên + định lượng), trả về qua API nội bộ của recipe-service.
 *
 * <p>social-stats-service cần định lượng để biết phải trừ bao nhiêu khỏi tủ lạnh sau khi
 * người dùng nấu xong; nếu chỉ có tên thì không thể thực hiện được vòng tiêu thụ.</p>
 */
public record RecipeIngredientRefDto(
        String name,
        Double quantity,
        String unit) {
}
