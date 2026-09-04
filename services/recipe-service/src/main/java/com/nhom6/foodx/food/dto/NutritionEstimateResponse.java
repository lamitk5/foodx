package com.nhom6.foodx.food.dto;

public record NutritionEstimateResponse(
        Double kcal,
        Double protein,
        Double carb,
        Double fat,
        String benefit,
        String components,
        String basisNote
) {}
