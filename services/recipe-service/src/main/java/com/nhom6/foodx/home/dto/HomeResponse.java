package com.nhom6.foodx.home.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Dữ liệu tổng hợp cho trang chủ.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HomeResponse {

    /** Món ăn mới nhất / nổi bật. */
    private List<FeaturedRecipeDto> featuredRecipes;

    /** Món gợi ý theo category. */
    private List<CategoryGroupDto> categoryGroups;

    /** Thông báo thân thiện cho trang chủ. */
    private String greeting;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryGroupDto {
        private String category;
        private List<FeaturedRecipeDto> recipes;
    }
}
