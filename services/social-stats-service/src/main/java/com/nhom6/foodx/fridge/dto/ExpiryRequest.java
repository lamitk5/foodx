package com.nhom6.foodx.fridge.dto;

import java.time.LocalDate;

public record ExpiryRequest(
        LocalDate expiresAt
) {
}