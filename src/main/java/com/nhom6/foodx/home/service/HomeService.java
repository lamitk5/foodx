package com.nhom6.foodx.home.service;


import com.nhom6.foodx.home.dto.FeaturedRecipeDto;
import com.nhom6.foodx.home.dto.HomeResponse;
import com.nhom6.foodx.recipe.entity.Recipe;
import com.nhom6.foodx.recipe.repository.RecipeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service cung cấp dữ liệu cho trang chủ.
 */
@Service
@RequiredArgsConstructor
public class HomeService {

    private final RecipeRepository recipeRepository;

    /** Các category hiển thị trên trang chủ. */
    private static final List<String> PREVIEW_CATEGORIES =
            List.of("Món chính", "Khai vị", "Tráng miệng", "Đồ uống");

    @Transactional(readOnly = true)
    public HomeResponse getHomeData() {
        // Món nổi bật = các công thức mới nhất
        List<Recipe> latest = recipeRepository.findTop8ByOrderByCreatedAtDesc();
        List<FeaturedRecipeDto> featured = latest.stream().map(this::toFeaturedDto).toList();

        // Gom theo category
        List<HomeResponse.CategoryGroupDto> groups = PREVIEW_CATEGORIES.stream()
                .map(category -> {
                    List<FeaturedRecipeDto> recipes = recipeRepository
                            .findTop10ByCategoryOrderByCreatedAtDesc(category).stream()
                            .map(this::toFeaturedDto)
                            .toList();
                    return new HomeResponse.CategoryGroupDto(category, recipes);
                })
                .toList();

        return HomeResponse.builder()
                .featuredRecipes(featured)
                .categoryGroups(groups)
                .greeting("Chào mừng bạn đến với FoodX! Khám phá những công thức nấu ăn hấp dẫn mỗi ngày.")
                .build();
    }

    private FeaturedRecipeDto toFeaturedDto(Recipe recipe) {
        return FeaturedRecipeDto.builder()
                .id(recipe.getId())
                .title(recipe.getTitle())
                .imageUrl(recipe.getImageUrl())
                .summary(recipe.getDescription() != null && recipe.getDescription().length() > 120
                        ? recipe.getDescription().substring(0, 120) + "..."
                        : recipe.getDescription())
                .category(recipe.getCategory())
                .cookTime(recipe.getCookTime())
                .servings(recipe.getServings())
                .build();
    }
}
