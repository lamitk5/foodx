package com.nhom6.foodx.recipe.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Request tạo/cập nhật công thức.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecipeRequest {

    @NotBlank(message = "Tiêu đề công thức không được để trống")
    @Size(max = 200, message = "Tiêu đề tối đa 200 ký tự")
    private String title;

    private String description;

    private String instructions;

    private Integer prepTime;

    private Integer cookTime;

    private Integer servings;

    @Size(max = 100)
    private String cuisine;

    @Size(max = 100)
    private String category;

    private Integer kcal;
    private Double protein;
    private Double carb;
    private Double fat;

    @Size(max = 30)
    private String difficulty;

    private String mealSlots;

    @Size(max = 500)
    private String imageUrl;

    @Size(max = 500)
    private String sourceUrl;

    @Valid
    private List<RecipeIngredientItem> ingredients;
}
