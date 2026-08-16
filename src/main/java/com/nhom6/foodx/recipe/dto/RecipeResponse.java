package com.nhom6.foodx.recipe.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Phản hồi công thức cho client.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecipeResponse {

    private Long id;
    private String title;
    private String description;
    private String instructions;
    private Integer prepTime;
    private Integer cookTime;
    private Integer servings;
    private String cuisine;
    private String category;
    private String imageUrl;
    private String sourceUrl;
    private Long authorId;
    private String authorName;
    private List<IngredientDto> ingredients;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class IngredientDto {
        private Long id;
        private String ingredientName;
        private Double quantity;
        private String unit;
        private String note;
    }
}
