package com.nhom6.foodx.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO đại diện cho thực phẩm trích xuất được từ ảnh chụp hoá đơn / tủ lạnh.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScannedFoodItemDto {
    private String name;
    private Double quantity;
    private String unit;
    private String category;
    private Integer estimatedExpiryDays;
    private Double confidence;
}
