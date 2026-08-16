package com.nhom6.foodx.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request gợi ý công thức từ AI.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SuggestRequest {

    /** Những gì hiện có trong tủ lạnh (danh sách nguyên liệu). */
    private java.util.List<String> availableIngredients;

    /** Yêu cầu bổ sung: không dùng thịt, món xào... */
    private String preference;

    /** Loại bữa: sáng, trưa, tối, tráng miệng. */
    private String mealType;

    /** Số lượng gợi ý. */
    private Integer maxSuggestions;
}
