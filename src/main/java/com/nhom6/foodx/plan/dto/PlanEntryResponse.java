package com.nhom6.foodx.plan.dto;

import java.time.LocalDate;

public record PlanEntryResponse(
        Long id,
        LocalDate planDate,
        String slot,
        Long recipeId,
        String recipeTitle,
        Integer recipeKcal
) {
}