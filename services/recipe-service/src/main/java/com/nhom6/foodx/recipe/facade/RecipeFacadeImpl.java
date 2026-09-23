package com.nhom6.foodx.recipe.facade;

import com.nhom6.foodx.food.service.FoodImageSearchService;
import com.nhom6.foodx.recipe.entity.Recipe;
import com.nhom6.foodx.recipe.entity.RecipeIngredient;
import com.nhom6.foodx.recipe.repository.RecipeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Triển khai RecipeFacade — là CỔNG DUY NHẤT để module khác đọc/ghi dữ liệu công thức.
 */
@Service
@RequiredArgsConstructor
public class RecipeFacadeImpl implements RecipeFacade {

    private final RecipeRepository recipeRepository;

    @Override
    @Transactional(readOnly = true)
    public RecipeSummary getSummary(Long recipeId) {
        if (recipeId == null) {
            return null;
        }
        return recipeRepository.findById(recipeId).map(this::toSummary).orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<Long, RecipeSummary> getSummaries(Collection<Long> recipeIds) {
        if (recipeIds == null || recipeIds.isEmpty()) {
            return Map.of();
        }
        Set<Long> ids = recipeIds.stream().filter(Objects::nonNull).collect(Collectors.toSet());
        if (ids.isEmpty()) {
            return Map.of();
        }
        Map<Long, RecipeSummary> result = new LinkedHashMap<>();
        for (Recipe recipe : recipeRepository.findAllById(ids)) {
            result.put(recipe.getId(), toSummary(recipe));
        }
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public List<RecipeSummary> getAllSummaries() {
        return recipeRepository.findAll().stream().map(this::toSummary).toList();
    }

    @Override
    @Transactional
    public RecipeSummary ensureRecipe(RecipeCreateSpec spec) {
        String title = spec.title() == null ? "" : spec.title().trim();
        if (title.isEmpty()) {
            return null;
        }
        Recipe recipe = recipeRepository.findFirstByTitleIgnoreCase(title).orElse(null);
        if (recipe == null) {
            int kcal = (spec.kcal() != null && spec.kcal() > 0) ? spec.kcal() : 450;
            recipe = Recipe.builder()
                    .title(title)
                    .description(spec.description() != null ? spec.description() : "Món ăn do AI FoodX thiết kế riêng.")
                    .instructions(spec.instructions() != null ? spec.instructions() : "Sơ chế nguyên liệu sạch sẽ, nấu chín vừa tới và thưởng thức nóng.")
                    .prepTime(15)
                    .cookTime(25)
                    .servings(1)
                    .cuisine("Việt Nam")
                    .category("Món chính")
                    .kcal(kcal)
                    .protein(spec.protein() != null ? spec.protein() : 25.0)
                    .carb(spec.carb() != null ? spec.carb() : 50.0)
                    .fat(spec.fat() != null ? spec.fat() : 14.0)
                    .difficulty(spec.difficulty() != null ? spec.difficulty() : "Dễ")
                    .mealSlots(spec.mealSlots())
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            recipe = recipeRepository.save(recipe);
        }
        return toSummary(recipe);
    }

    private RecipeSummary toSummary(Recipe recipe) {
        List<String> ingredientNames = recipe.getIngredients() == null
                ? List.of()
                : recipe.getIngredients().stream()
                        .map(RecipeIngredient::getIngredient)
                        .filter(Objects::nonNull)
                        .map(ing -> ing.getName())
                        .filter(Objects::nonNull)
                        .map(String::trim)
                        .filter(name -> !name.isEmpty())
                        .distinct()
                        .toList();

        int kcal = (recipe.getKcal() != null && recipe.getKcal() > 0) ? recipe.getKcal() : 380;

        return new RecipeSummary(
                recipe.getId(),
                recipe.getTitle(),
                resolveImage(recipe),
                kcal,
                recipe.getDifficulty(),
                recipe.getCookTime(),
                recipe.getProtein(),
                recipe.getCarb(),
                recipe.getFat(),
                recipe.getMealSlots(),
                ingredientNames
        );
    }

    /** Ảnh hợp lệ của công thức; nếu không có thì ưu tiên ảnh local theo slug tên món. */
    private String resolveImage(Recipe recipe) {
        String img = recipe.getImageUrl();
        if (img != null && !img.isBlank()
                && !img.toLowerCase().contains("default-recipe")
                && !img.toLowerCase().contains("placeholder")
                && !img.toLowerCase().contains("unsplash.com/photo-1542838132")) {
            return img;
        }
        String rel = "/images/foods/" + FoodImageSearchService.toSlug(recipe.getTitle()) + ".jpg";
        try {
            if (new ClassPathResource("static" + rel).exists()) {
                return rel;
            }
        } catch (Exception ignored) {
            // thử tiếp đường dẫn nguồn khi chạy từ IDE
        }
        try {
            if (Files.exists(Paths.get("src/main/resources/static" + rel))) {
                return rel;
            }
        } catch (Exception ignored) {
            // bỏ qua
        }
        return "/images/recipes/default-recipe.jpg";
    }
}
