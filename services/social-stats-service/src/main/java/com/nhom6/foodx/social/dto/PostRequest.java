package com.nhom6.foodx.social.dto;

import java.util.List;

/**
 * Yêu cầu tạo bài chia sẻ công thức.
 */
public record PostRequest(
        String title,
        String description,
        List<String> ingredients,
        String instructions,
        String imageUrl
) {
}