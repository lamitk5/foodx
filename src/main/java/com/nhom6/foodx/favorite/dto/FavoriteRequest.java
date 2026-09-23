package com.nhom6.foodx.favorite.dto;

/**
 * Yêu cầu thêm/xoá yêu thích.
 */
public record FavoriteRequest(
        Long targetId,
        String targetType
) {
}
