package com.nhom6.foodx.chat.dto;

import java.util.List;

public record SendMessageRequest(
        String message,
        String mode,
        List<String> availableIngredients
) {
}