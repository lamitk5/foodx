package com.nhom6.foodx.shopping.dto;

import java.time.LocalDateTime;

public record ShoppingItemResponse(
        Long id,
        String name,
        String quantity,
        Integer price,
        String category,
        Boolean done,
        LocalDateTime createdAt
) {
}