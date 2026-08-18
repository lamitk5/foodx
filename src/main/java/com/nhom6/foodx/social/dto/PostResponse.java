package com.nhom6.foodx.social.dto;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Bài chia sẻ công thức trả về cho frontend.
 */
public record PostResponse(
        Long id,
        Long authorId,
        String authorName,
        String authorAvatar,
        String title,
        String description,
        List<String> ingredients,
        String instructions,
        String imageUrl,
        long likeCount,
        boolean likedByMe,
        long commentCount,
        LocalDateTime createdAt
) {
}