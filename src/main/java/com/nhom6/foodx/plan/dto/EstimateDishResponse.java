package com.nhom6.foodx.plan.dto;

public record EstimateDishResponse(
        String dishName,
        Integer kcal,
        Double protein,
        Double carb,
        Double fat,
        String category,
        String description
) {
}
