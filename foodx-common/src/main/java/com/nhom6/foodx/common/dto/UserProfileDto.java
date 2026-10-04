package com.nhom6.foodx.common.dto;

/**
 * Hồ sơ dinh dưỡng của người dùng, trả về qua API nội bộ của user-service.
 *
 * <p>ai-service dùng để dựng prompt, plan-shopping-service dùng để tính mục tiêu kcal.</p>
 */
public record UserProfileDto(
        Long userId,
        String gender,
        Integer age,
        Double weight,
        Double height,
        Double targetWeight,
        Double activity,
        String diet,
        String allergies,
        String dislikes) {
}
