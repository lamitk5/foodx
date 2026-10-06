package com.nhom6.foodx.recipe.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Định nghĩa một nguyên liệu trong request công thức.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecipeIngredientItem {

    @NotBlank(message = "Tên nguyên liệu không được để trống")
    private String ingredientName;

    @Positive(message = "Số lượng nguyên liệu phải lớn hơn 0")
    private Double quantity;

    @Size(max = 20)
    private String unit;

    @Size(max = 200)
    private String note;
}
