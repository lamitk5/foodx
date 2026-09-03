package com.nhom6.foodx.fridge.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Kết quả phân tích và nhận diện nguyên liệu từ ảnh chụp (hoá đơn / tủ lạnh).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScanResultDto {
    private boolean autoSaved;
    private int totalDetected;
    private int savedCount;
    private List<ScannedItemDetail> detectedItems;
    private List<FridgeItemResponse> savedFridgeItems;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ScannedItemDetail {
        private String name;
        private Double quantity;
        private String unit;
        private String category;
        private Integer estimatedExpiryDays;
        private String suggestedExpiryDate;
        private Double confidence;
    }
}
