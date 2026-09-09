package com.nhom6.foodx.chat.dto;

import java.time.LocalDateTime;

public record SessionResponse(
        Long id,
        String title,
        String mode,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}