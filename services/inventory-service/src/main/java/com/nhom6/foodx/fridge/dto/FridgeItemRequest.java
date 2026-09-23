package com.nhom6.foodx.fridge.dto;

import java.time.LocalDate;

/**
 * Yêu cầu thêm thực phẩm vào tủ lạnh.
 */
public record FridgeItemRequest(
        String sourceKey,
        String name,
        String type,
        Double quantity,
        String unit,
        Double kcal,
        Double protein,
        Double carb,
        Double fat,
        String components,
        String benefit,
        String imageUrl,
        LocalDate expiresAt,
        String note,
        Boolean customFood
) {
}