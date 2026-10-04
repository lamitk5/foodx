package com.nhom6.foodx.common.dto;

/**
 * Một thực phẩm mà AI nhận diện được từ ảnh (hoá đơn siêu thị / ngăn tủ lạnh).
 *
 * <p>ai-service là service duy nhất gọi được mô hình thị giác; inventory-service nhận kết quả
 * qua {@code POST /internal/ai/scan-food-image} rồi mới quyết định thêm vào tủ lạnh.</p>
 */
public record ScanFoodImageItemDto(
        String name,
        Double quantity,
        String unit,
        String category,
        Integer estimatedExpiryDays,
        Double confidence) {
}
