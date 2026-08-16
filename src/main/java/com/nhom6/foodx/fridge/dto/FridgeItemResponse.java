package com.nhom6.foodx.fridge.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Phản hồi một mục trong tủ lạnh.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FridgeItemResponse {

    private Long id;
    private Long ingredientId;
    private String ingredientName;
    private Double quantity;
    private String unit;
    private LocalDate expiryDate;
    private boolean expired;
    private long daysUntilExpiry;
    private LocalDateTime addedAt;
}
