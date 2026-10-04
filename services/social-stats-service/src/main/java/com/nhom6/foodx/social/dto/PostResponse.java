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
        List<String> steps,
        String imageUrl,
        String category,
        Integer cookTime,
        Integer kcal,
        Integer servings,
        String difficulty,
        String status,
        long likeCount,
        boolean likedByMe,
        long commentCount,
        LocalDateTime createdAt
) {
}
