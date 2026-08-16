package com.nhom6.foodx.fridge.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Request thêm một mục vào tủ lạnh.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FridgeItemRequest {

    @NotBlank(message = "Tên nguyên liệu không được để trống")
    private String ingredientName;

    @NotNull(message = "Số lượng không được để trống")
    private Double quantity;

    private String unit;

    private LocalDate expiryDate;
}
