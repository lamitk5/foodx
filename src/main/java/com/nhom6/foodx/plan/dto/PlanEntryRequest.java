package com.nhom6.foodx.plan.dto;

import java.time.LocalDate;

public record PlanEntryRequest(
        LocalDate planDate,
        String slot,
        Long recipeId
) {
}