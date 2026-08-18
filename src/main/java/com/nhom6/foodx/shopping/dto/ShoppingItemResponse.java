package com.nhom6.foodx.shopping.dto;

public record ShoppingItemResponse(
        Long id,
        String name,
        String quantity,
        Integer price,
        String category,
        Boolean done
) {
}