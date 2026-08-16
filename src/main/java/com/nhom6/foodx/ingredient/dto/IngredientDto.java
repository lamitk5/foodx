package com.nhom6.foodx.ingredient.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO cho nguyên liệu.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IngredientDto {

    private Long id;

    @NotBlank(message = "Tên nguyên liệu không được để trống")
    @Size(max = 100, message = "Tên nguyên liệu tối đa 100 ký tự")
    private String name;

    @Size(max = 20, message = "Đơn vị tối đa 20 ký tự")
    private String defaultUnit;

    @Size(max = 50, message = "Phân loại tối đa 50 ký tự")
    private String category;

    private Double caloriesPerUnit;

    @Size(max = 500, message = "Mô tả tối đa 500 ký tự")
    private String description;
}
