package com.nhom6.foodx.chat.dto;

import java.time.LocalDateTime;
import java.util.List;

public record MessageResponse(
        Long id,
        String role,
        String content,
        List<String> steps,
        LocalDateTime createdAt
) {
}