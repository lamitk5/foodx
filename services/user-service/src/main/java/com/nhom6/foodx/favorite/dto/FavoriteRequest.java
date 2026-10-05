package com.nhom6.foodx.favorite.dto;

import com.fasterxml.jackson.annotation.JsonAlias;

public record FavoriteRequest(
        @JsonAlias({"recipeId", "dishId", "ingredientId"})
        Long targetId,
        String targetType
) {
}
