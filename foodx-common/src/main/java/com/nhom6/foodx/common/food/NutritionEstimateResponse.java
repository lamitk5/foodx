package com.nhom6.foodx.common.food;

public record NutritionEstimateResponse(
        Double kcal,
        Double protein,
        Double carb,
        Double fat,
        String benefit,
        String components,
        String basisNote
) {}
