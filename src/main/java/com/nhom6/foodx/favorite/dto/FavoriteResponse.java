package com.nhom6.foodx.favorite.dto;

import java.time.LocalDateTime;

/**
 * Mục yêu thích đã được nạp đầy đủ dữ liệu hiển thị (qua Public API của module tương ứng).
 */
public record FavoriteResponse(
        Long id,
        Long targetId,
        String targetType,
        String title,
        String subtitle,
        String imageUrl,
        Integer kcal,
        Integer cookTime,
        String difficulty,
        LocalDateTime createdAt
) {
}
