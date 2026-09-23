package com.nhom6.foodx.shopping.dto;

public record ShoppingItemRequest(
        String name,
        String quantity,
        Integer price,
        String category
) {
}