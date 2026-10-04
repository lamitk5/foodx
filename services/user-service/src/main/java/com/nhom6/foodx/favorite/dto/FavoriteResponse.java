package com.nhom6.foodx.favorite.dto;

import java.time.LocalDateTime;

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
