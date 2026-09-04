package com.nhom6.foodx.profile.dto;

/**
 * Yêu cầu cập nhật hồ sơ dinh dưỡng.
 */
public record ProfileRequest(
        String name,
        String gender,
        Integer age,
        Double weight,
        Double height,
        Double target,
        Double activity,
        String diet,
        String allergies,
        String dislikes
) {
}