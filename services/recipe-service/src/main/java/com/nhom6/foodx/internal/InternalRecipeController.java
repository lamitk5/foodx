package com.nhom6.foodx.internal;

import com.nhom6.foodx.common.client.InternalApi;
import com.nhom6.foodx.common.dto.RecipeDraftDto;
import com.nhom6.foodx.common.dto.RecipeIngredientRefDto;
import com.nhom6.foodx.common.dto.RecipeSummaryDto;
import com.nhom6.foodx.common.food.FoodImageSearchService;
import com.nhom6.foodx.recipe.entity.Recipe;
import com.nhom6.foodx.recipe.entity.RecipeIngredient;
import com.nhom6.foodx.recipe.repository.RecipeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

/**
 * API nội bộ cho các microservice khác đọc/ghi công thức.
 *
 * <p>Chỉ tồn tại trong mạng nội bộ (yêu cầu {@code X-Foodx-Internal-Token}) và không được
 * API Gateway định tuyến ra ngoài. Trả về <b>JSON thô của DTO</b>, không bọc
 * {@code ApiResponse}, để {@code RecipeServiceClient} ở foodx-common giải mã trực tiếp.</p>
 *
 * <p>Đây là thay thế HTTP cho {@code RecipeFacade} nội bộ trước kia: plan-shopping-service
 * dựng thực đơn, social-stats-service tính calo và trừ nguyên liệu khỏi tủ.</p>
 */
@RestController
@RequestMapping(InternalApi.PREFIX + "/recipes")
@RequiredArgsConstructor
public class InternalRecipeController {

    private final RecipeRepository recipeRepository;

    /** Tra một công thức; 404 nếu không tồn tại. */
    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<RecipeSummaryDto> getById(@PathVariable Long id) {
        return recipeRepository.findById(id)
                .map(recipe -> ResponseEntity.ok(toDto(recipe)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Tra công thức: {@code ?ids=1,2,3} để lấy một lô, hoặc không tham số để lấy tất cả
     * (dùng cho thuật toán dự phòng phía gọi).
     */
    @GetMapping
    @Transactional(readOnly = true)
    public List<RecipeSummaryDto> getRecipes(@RequestParam(value = "ids", required = false) List<Long> ids) {
        List<Recipe> recipes = (ids == null || ids.isEmpty())
                ? recipeRepository.findAll()
                : recipeRepository.findAllById(ids);
        return recipes.stream().map(this::toDto).toList();
    }

    /** Đảm bảo một công thức (thường do AI sinh) tồn tại trong kho. */
    @PostMapping("/ensure")
    @Transactional
    public ResponseEntity<RecipeSummaryDto> ensure(@RequestBody RecipeDraftDto draft) {
        String title = (draft == null || draft.title() == null) ? "" : draft.title().trim();
        if (title.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Recipe recipe = recipeRepository.findFirstByTitleIgnoreCase(title).orElse(null);
        if (recipe == null) {
            int kcal = (draft.kcal() != null && draft.kcal() > 0) ? draft.kcal() : 450;
            recipe = Recipe.builder()
                    .title(title)
                    .description(draft.description() != null ? draft.description() : "Món ăn do AI FoodX thiết kế riêng.")
                    .instructions(draft.instructions() != null ? draft.instructions() : "Sơ chế nguyên liệu sạch sẽ, nấu chín vừa tới và thưởng thức nóng.")
                    .prepTime(15)
                    .cookTime(25)
                    .servings(1)
                    .cuisine("Việt Nam")
                    .category("Món chính")
                    .kcal(kcal)
                    .protein(draft.protein() != null ? draft.protein() : 25.0)
                    .carb(draft.carb() != null ? draft.carb() : 50.0)
                    .fat(draft.fat() != null ? draft.fat() : 14.0)
                    .difficulty(draft.difficulty() != null ? draft.difficulty() : "Dễ")
                    .mealSlots(draft.mealSlots())
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            recipe = recipeRepository.save(recipe);
        } else if (draft.kcal() != null && draft.kcal() > 0 && !Objects.equals(recipe.getKcal(), draft.kcal())) {
            recipe.setKcal(draft.kcal());
            recipe = recipeRepository.save(recipe);
        }
        return ResponseEntity.ok(toDto(recipe));
    }

    /**
     * Ánh xạ công thức sang DTO nội bộ. {@code ingredientNames} để hiển thị/khớp món,
     * {@code ingredients} kèm định lượng để social-stats-service trừ tủ lạnh sau khi nấu.
     */
    private RecipeSummaryDto toDto(Recipe recipe) {
        List<RecipeIngredient> items = recipe.getIngredients() == null ? List.of() : recipe.getIngredients();

        List<String> ingredientNames = items.stream()
                .map(RecipeIngredient::getIngredientName)
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(name -> !name.isEmpty())
                .distinct()
                .toList();

        List<RecipeIngredientRefDto> ingredients = items.stream()
                .filter(ri -> ri.getIngredientName() != null && !ri.getIngredientName().isBlank())
                .map(ri -> new RecipeIngredientRefDto(
                        ri.getIngredientName().trim(), ri.getQuantity(), ri.getUnit()))
                .toList();

        int kcal = (recipe.getKcal() != null && recipe.getKcal() > 0) ? recipe.getKcal() : 380;

        return new RecipeSummaryDto(
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
                recipe.getServings(),
                ingredientNames,
                ingredients);
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
