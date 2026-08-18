package com.nhom6.foodx.social.dto;

import java.time.LocalDateTime;

public record CommentResponse(
        Long id,
        Long postId,
        Long authorId,
        String authorName,
        String authorAvatar,
        String content,
        LocalDateTime createdAt
) {
}