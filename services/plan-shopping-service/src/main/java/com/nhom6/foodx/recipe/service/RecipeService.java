package com.nhom6.foodx.recipe.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.nhom6.foodx.auth.entity.User;
import com.nhom6.foodx.common.exception.ResourceNotFoundException;
import com.nhom6.foodx.common.utils.StringUtils;
import com.nhom6.foodx.fridge.repository.FridgeItemRepository;
import com.nhom6.foodx.ingredient.entity.Ingredient;
import com.nhom6.foodx.ingredient.repository.IngredientRepository;
import com.nhom6.foodx.recipe.dto.RecipeIngredientItem;
import com.nhom6.foodx.recipe.dto.RecipeMatchDto;
import com.nhom6.foodx.recipe.dto.RecipeRequest;
import com.nhom6.foodx.recipe.dto.RecipeResponse;
import com.nhom6.foodx.recipe.entity.Recipe;
import com.nhom6.foodx.recipe.entity.RecipeIngredient;
import com.nhom6.foodx.recipe.repository.RecipeIngredientRepository;
import com.nhom6.foodx.recipe.repository.RecipeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class RecipeService {

    private final RecipeRepository recipeRepository;
    private final RecipeIngredientRepository recipeIngredientRepository;
    private final IngredientRepository ingredientRepository;
    private final FridgeItemRepository fridgeItemRepository;
    private final com.nhom6.foodx.recipe.repository.SavedRecipeRepository savedRecipeRepository;
    private final com.nhom6.foodx.food.service.FoodImageSearchService foodImageSearchService;

    @Transactional(readOnly = true)
    public List<RecipeResponse> search(String keyword, String category, String cuisine) {
        List<Recipe> recipes;
        if (keyword != null && !keyword.isBlank()) {
            recipes = recipeRepository.findByTitleContainingIgnoreCase(keyword);
        } else if (category != null && !category.isBlank()) {
            recipes = recipeRepository.findByCategoryContainingIgnoreCase(category);
        } else if (cuisine != null && !cuisine.isBlank()) {
            recipes = recipeRepository.findByCuisineContainingIgnoreCase(cuisine);
        } else {
            recipes = recipeRepository.findAll();
        }
        return recipes.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public RecipeResponse getById(Long id) {
        return toResponse(findEntity(id));
    }

    @Transactional
    public RecipeResponse create(RecipeRequest request, User author) {
        Recipe recipe = new Recipe();
        applyRequest(recipe, request);

        // Ảnh: ưu tiên ảnh người dùng cung cấp; nếu chưa có thì dùng ảnh local theo tên món
        // (KHÔNG tải mạng trong lúc lưu — tránh chặn request & ghi file vào source lúc runtime)
        if (!isUsableImage(recipe.getImageUrl())) {
            recipe.setImageUrl(localImageForTitle(recipe.getTitle()));
        }

        recipe.setAuthor(author);
        recipe.setCreatedAt(LocalDateTime.now());
        recipe.setUpdatedAt(LocalDateTime.now());
        recipeRepository.save(recipe);

        if (request.getIngredients() != null) {
            saveIngredients(recipe, request.getIngredients());
        }
        recipeRepository.save(recipe);
        return toResponse(recipe);
    }

    @Transactional
    public RecipeResponse update(Long id, RecipeRequest request) {
        Recipe recipe = findEntity(id);
        applyRequest(recipe, request);

        if (!isUsableImage(recipe.getImageUrl())) {
            recipe.setImageUrl(localImageForTitle(recipe.getTitle()));
        }

        recipe.setUpdatedAt(LocalDateTime.now());

        // Xoá nguyên liệu cũ và lưu lại
        if (request.getIngredients() != null) {
            recipe.getIngredients().clear();
            saveIngredients(recipe, request.getIngredients());
        }
        recipeRepository.save(recipe);
        return toResponse(recipe);
    }

    @Transactional
    public void delete(Long id) {
        Recipe recipe = findEntity(id);
        recipeRepository.delete(recipe);
    }

    @Transactional
    public RecipeResponse createFromParsed(JsonNode parsed, User author) {
        RecipeRequest request = new RecipeRequest();
        request.setTitle(parsed.path("title").asText(parsed.path("name").asText("Không có tiêu đề")));
        request.setDescription(parsed.path("description").asText());
        request.setInstructions(parsed.path("instructions").asText());
        request.setPrepTime(parsed.path("prepTime").isMissingNode() ? null : parsed.path("prepTime").asInt());
        request.setCookTime(parsed.path("cookTime").isMissingNode() ? null : parsed.path("cookTime").asInt());
        request.setServings(parsed.path("servings").isMissingNode() ? null : parsed.path("servings").asInt());
        request.setCuisine(parsed.path("cuisine").asText());
        request.setCategory(parsed.path("category").asText());

        List<RecipeIngredientItem> items = new ArrayList<>();
        if (parsed.has("ingredients") && parsed.get("ingredients").isArray()) {
            for (JsonNode item : parsed.get("ingredients")) {
                Double qty = 1.0;
                if (item.path("quantity").isNumber()) {
                    qty = item.path("quantity").asDouble();
                } else if (item.has("quantity") && item.path("quantity").asText().matches("\\d+(\\.\\d+)?")) {
                    qty = Double.parseDouble(item.path("quantity").asText());
                }
                items.add(RecipeIngredientItem.builder()
                        .ingredientName(item.path("name").asText("Nguyên liệu"))
                        .quantity(qty)
                        .unit(item.path("unit").asText("phần"))
                        .note(item.path("note").asText())
                        .build());
            }
        }
        request.setIngredients(items);
        return create(request, author);
    }

    private void applyRequest(Recipe recipe, RecipeRequest request) {
        recipe.setTitle(request.getTitle().trim());
        recipe.setDescription(request.getDescription());
        recipe.setInstructions(request.getInstructions());
        recipe.setPrepTime(request.getPrepTime());
        recipe.setCookTime(request.getCookTime());
        recipe.setServings(request.getServings());
        recipe.setCuisine(request.getCuisine());
        recipe.setCategory(request.getCategory());

        int kcal = (request.getKcal() != null && request.getKcal() > 0) ? request.getKcal() : 380;
        recipe.setKcal(kcal);

        double protein = (request.getProtein() != null && request.getProtein() > 0)
                ? request.getProtein()
                : Math.round(kcal * 0.22 / 4.0 * 10.0) / 10.0;
        double carb = (request.getCarb() != null && request.getCarb() > 0)
                ? request.getCarb()
                : Math.round(kcal * 0.52 / 4.0 * 10.0) / 10.0;
        double fat = (request.getFat() != null && request.getFat() > 0)
                ? request.getFat()
                : Math.round(kcal * 0.26 / 9.0 * 10.0) / 10.0;

        recipe.setProtein(protein);
        recipe.setCarb(carb);
        recipe.setFat(fat);

        recipe.setDifficulty(request.getDifficulty());
        recipe.setMealSlots(request.getMealSlots());
        recipe.setImageUrl(request.getImageUrl());
        recipe.setSourceUrl(request.getSourceUrl());
    }

    private void saveIngredients(Recipe recipe, List<RecipeIngredientItem> items) {
        for (RecipeIngredientItem item : items) {
            String ingName = item.getIngredientName() != null ? item.getIngredientName().trim() : "Nguyên liệu";
            Ingredient ingredient = ingredientRepository.findByNameIgnoreCase(ingName)
                    .orElseGet(() -> {
                        Ingredient newIng = Ingredient.builder()
                                .name(ingName)
                                .category(recipe.getCategory())
                                .createdAt(LocalDateTime.now())
                                .updatedAt(LocalDateTime.now())
                                .build();
                        return ingredientRepository.save(newIng);
                    });

            RecipeIngredient ri = RecipeIngredient.builder()
                    .recipe(recipe)
                    .ingredient(ingredient)
                    .quantity(item.getQuantity() != null ? item.getQuantity() : 1.0)
                    .unit(item.getUnit() != null && !item.getUnit().isBlank() ? item.getUnit() : "phần")
                    .note(item.getNote())
                    .build();
            recipe.getIngredients().add(ri);
            recipeIngredientRepository.save(ri);
        }
    }

    @Transactional(readOnly = true)
    public List<RecipeResponse> getSaved(User user) {
        return savedRecipeRepository.findByUserId(user.getId()).stream()
                .map(sr -> toResponse(sr.getRecipe()))
                .toList();
    }

    @Transactional
    public boolean toggleSave(User user, Long recipeId) {
        Recipe recipe = findEntity(recipeId);
        if (savedRecipeRepository.existsByUserIdAndRecipeId(user.getId(), recipeId)) {
            savedRecipeRepository.findByUserIdAndRecipeId(user.getId(), recipeId)
                    .ifPresent(savedRecipeRepository::delete);
            return false;
        }
        savedRecipeRepository.save(com.nhom6.foodx.recipe.entity.SavedRecipe.builder()
                .user(user)
                .recipe(recipe)
                .savedAt(java.time.LocalDateTime.now())
                .build());
        return true;
    }

    private Recipe findEntity(Long id) {
        return recipeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy công thức id=" + id));
    }

    private RecipeResponse toResponse(Recipe recipe) {
        List<RecipeResponse.IngredientDto> ings = recipe.getIngredients().stream()
                .map(ri -> RecipeResponse.IngredientDto.builder()
                        .id(ri.getId())
                        .ingredientName(ri.getIngredient().getName())
                        .quantity(ri.getQuantity())
                        .unit(ri.getUnit())
                        .note(ri.getNote())
                        .build())
                .toList();

        String img = recipe.getImageUrl();
        if (!isUsableImage(img)) {
            // Giải quyết ảnh cục bộ ngay lập tức, không gọi mạng trong vòng đọc dữ liệu
            img = localImageForTitle(recipe.getTitle());
        }

        int kcal = (recipe.getKcal() != null && recipe.getKcal() > 0) ? recipe.getKcal() : 380;
        double protein = (recipe.getProtein() != null && recipe.getProtein() > 0)
                ? recipe.getProtein()
                : Math.round(kcal * 0.22 / 4.0 * 10.0) / 10.0;
        double carb = (recipe.getCarb() != null && recipe.getCarb() > 0)
                ? recipe.getCarb()
                : Math.round(kcal * 0.52 / 4.0 * 10.0) / 10.0;
        double fat = (recipe.getFat() != null && recipe.getFat() > 0)
                ? recipe.getFat()
                : Math.round(kcal * 0.26 / 9.0 * 10.0) / 10.0;

        return RecipeResponse.builder()
                .id(recipe.getId())
                .title(recipe.getTitle())
                .description(recipe.getDescription())
                .instructions(recipe.getInstructions())
                .prepTime(recipe.getPrepTime())
                .cookTime(recipe.getCookTime())
                .servings(recipe.getServings())
                .cuisine(recipe.getCuisine())
                .category(recipe.getCategory())
                .kcal(kcal)
                .protein(protein)
                .carb(carb)
                .fat(fat)
                .difficulty(recipe.getDifficulty())
                .mealSlots(recipe.getMealSlots())
                .imageUrl(img)
                .sourceUrl(recipe.getSourceUrl())
                .authorId(recipe.getAuthor() != null ? recipe.getAuthor().getId() : null)
                .authorName(recipe.getAuthor() != null ? recipe.getAuthor().getFullName() : null)
                .ingredients(ings)
                .createdAt(recipe.getCreatedAt())
                .updatedAt(recipe.getUpdatedAt())
                .build();
    }

    // =========================================================================
    // Ảnh local (không tải mạng trong vòng đọc/ghi dữ liệu)
    // =========================================================================

    /** Ảnh người dùng cung cấp hợp lệ (không phải placeholder/default seed). */
    private boolean isUsableImage(String img) {
        if (img == null || img.isBlank()) {
            return false;
        }
        String lower = img.toLowerCase();
        if (lower.contains("default-recipe") || lower.contains("placeholder")) {
            return false;
        }
        // Ảnh "mặc định" cũ của seed Unsplash (2-3 tấm dùng chung cho mọi món)
        if (lower.contains("unsplash.com/photo-1542838132")) {
            return false;
        }
        return true;
    }

    /** Ảnh local có sẵn theo slug tên món; nếu không có thì dùng ảnh mặc định. */
    private String localImageForTitle(String title) {
        String slug = com.nhom6.foodx.food.service.FoodImageSearchService.toSlug(title);
        String rel = "/images/foods/" + slug + ".jpg";
        try {
            if (new ClassPathResource("static" + rel).exists()) {
                return rel;
            }
        } catch (Exception ignored) {
            // kiểm tra tiếp đường dẫn source (khi chạy từ IDE chưa copy resources)
        }
        if (Files.exists(Paths.get("src/main/resources/static" + rel))) {
            return rel;
        }
        return "/images/recipes/default-recipe.jpg";
    }

    /**
     * "Nấu với tủ của tôi": tìm món khớp nguyên liệu tủ lạnh của user.
     * Dùng query findByAnyIngredients (lọc nhanh) + chấm điểm chi tiết theo tên
     * nguyên liệu đã chuẩn hoá bỏ dấu.
     */
    @Transactional(readOnly = true)
    public List<RecipeMatchDto> matchWithFridge(User user) {
        List<String> fridgeNames = fridgeItemRepository.findByUser_IdOrderByIdAsc(user.getId()).stream()
                .map(item -> item.getFood() != null ? item.getFood().getName() : null)
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(name -> !name.isEmpty())
                .distinct()
                .toList();
        if (fridgeNames.isEmpty()) {
            return List.of();
        }

        List<Long> ingredientIds = new ArrayList<>();
        for (String name : fridgeNames) {
            ingredientRepository.findByNameIgnoreCase(name)
                    .ifPresent(ingredient -> ingredientIds.add(ingredient.getId()));
        }

        List<Recipe> candidates;
        if (ingredientIds.isEmpty()) {
            candidates = recipeRepository.findAll();
        } else {
            candidates = recipeRepository.findByAnyIngredients(ingredientIds);
            if (candidates.isEmpty()) {
                candidates = recipeRepository.findAll();
            }
        }

        List<String> fridgeKeys = fridgeNames.stream()
                .map(StringUtils::searchable)
                .filter(key -> key.length() >= 3)
                .toList();

        List<RecipeMatchDto> result = new ArrayList<>();
        for (Recipe recipe : candidates) {
            if (recipe.getIngredients() == null || recipe.getIngredients().isEmpty()) {
                continue;
            }
            long total = recipe.getIngredients().size();
            long matched = recipe.getIngredients().stream()
                    .filter(ri -> {
                        String key = StringUtils.searchable(ri.getIngredient().getName());
                        if (key.length() < 3) {
                            return false;
                        }
                        return fridgeKeys.stream().anyMatch(fk -> fk.contains(key) || key.contains(fk));
                    })
                    .count();
            if (matched == 0) {
                continue;
            }
            int percent = (int) Math.round(matched * 100.0 / total);
            result.add(new RecipeMatchDto(toResponse(recipe), matched, total, percent));
        }

        result.sort(Comparator
                .comparingInt(RecipeMatchDto::matchPercent).reversed()
                .thenComparing(Comparator.comparingLong(RecipeMatchDto::matchedIngredients).reversed()));
        return result.stream().limit(20).toList();
    }
}
