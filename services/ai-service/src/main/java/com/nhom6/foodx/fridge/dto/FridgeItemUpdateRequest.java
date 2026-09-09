package com.nhom6.foodx.fridge.dto;

import java.time.LocalDate;

/**
 * Yêu cầu cập nhật thông tin nguyên liệu trong tủ lạnh.
 */
public record FridgeItemUpdateRequest(
        String name,
        String type,
        Double quantity,
        String unit,
        LocalDate expiresAt,
        Double kcal,
        Double protein,
        Double carb,
        Double fat,
        String components,
        String benefit,
        String imageUrl,
        String note
) {
}
