package com.nhom6.foodx.home.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO món ăn nổi bật cho trang chủ.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeaturedRecipeDto {

    private Long id;
    private String title;
    private String imageUrl;
    private String summary;
    private String category;
    private Integer cookTime;
    private Integer servings;
}
