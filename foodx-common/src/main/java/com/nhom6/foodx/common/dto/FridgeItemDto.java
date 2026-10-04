package com.nhom6.foodx.common.dto;

import java.time.LocalDate;

/**
 * Một thực phẩm trong tủ lạnh, trả về qua API nội bộ của inventory-service.
 *
 * <p>inventory-service là service duy nhất sở hữu bảng {@code fridge_stock};
 * recipe-service (khớp món), plan-shopping-service (gợi ý thực đơn),
 * ai-service (bối cảnh chat) và social-stats-service (trừ kho khi nấu) đều đọc qua DTO này.</p>
 */
public record FridgeItemDto(
        Long id,
        Long foodId,
        String foodName,
        String category,
        Double quantity,
        String unit,
        LocalDate expiresAt,
        String note,
        String imageUrl) {
}
