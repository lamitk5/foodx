package com.nhom6.foodx.fridge.dto;

import java.time.LocalDate;

/**
 * Phản hồi thực phẩm trong tủ lạnh.
 */
public record FridgeItemResponse(
        Long id,
        Long foodId,
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