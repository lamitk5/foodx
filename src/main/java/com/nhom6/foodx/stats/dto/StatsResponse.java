package com.nhom6.foodx.stats.dto;

import java.util.List;

/**
 * Dữ liệu thống kê cho màn hình Thống kê.
 */
public record StatsResponse(
        long totalCooked,
        long weekCooked,
        long monthCooked,
        List<KcalDay> byDay,
        List<TopRecipe> topRecipes
) {
    public record KcalDay(String date, long kcal) {
    }

    public record TopRecipe(Long recipeId, String title, long count) {
    }
}