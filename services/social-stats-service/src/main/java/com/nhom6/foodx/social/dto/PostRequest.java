package com.nhom6.foodx.social.dto;

import java.util.List;

/**
 * Yêu cầu tạo bài chia sẻ công thức.
 * <p>ingredients: danh sách chuỗi đã định dạng ("500g Thịt bò").
 * <p>steps: danh sách các bước thực hiện (được đánh số tự động khi hiển thị).
 */
public record PostRequest(
        String title,
        String description,
        List<String> ingredients,
        List<String> steps,
        String instructions,
        String imageUrl,
        String category,
        Integer cookTime,
        Integer kcal,
        Integer servings,
        String difficulty,
        String status
) {
}
