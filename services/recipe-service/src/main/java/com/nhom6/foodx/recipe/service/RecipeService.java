package com.nhom6.foodx.recipe.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.nhom6.foodx.common.client.InventoryServiceClient;
import com.nhom6.foodx.common.client.UserServiceClient;
import com.nhom6.foodx.common.dto.IngredientRefDto;
import com.nhom6.foodx.common.dto.UserSummaryDto;
import com.nhom6.foodx.common.exception.ResourceNotFoundException;
import com.nhom6.foodx.common.food.FoodImageSearchService;
import com.nhom6.foodx.common.utils.StringUtils;
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
import java.util.Collection;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecipeService {

    private final RecipeRepository recipeRepository;
    private final RecipeIngredientRepository recipeIngredientRepository;
    /** Danh mục nguyên liệu & tủ lạnh thuộc inventory-service. */
    private final InventoryServiceClient inventoryServiceClient;
    /** Tên tác giả thuộc user-service. */
    private final UserServiceClient userServiceClient;

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
        return toResponses(recipes);
    }

    @Transactional(readOnly = true)
    public RecipeResponse getById(Long id) {
        return toResponses(List.of(findEntity(id))).get(0);
    }

    @Transactional
    public RecipeResponse create(RecipeRequest request, Long authorId) {
        Recipe recipe = new Recipe();
        applyRequest(recipe, request);

        // Ảnh: ưu tiên ảnh người dùng cung cấp; nếu chưa có thì dùng ảnh local theo tên món
        // (KHÔNG tải mạng trong lúc lưu — tránh chặn request & ghi file vào source lúc runtime)
        if (!isUsableImage(recipe.getImageUrl())) {
            recipe.setImageUrl(localImageForTitle(recipe.getTitle()));
        }

        recipe.setAuthorId(authorId);
        recipe.setCreatedAt(LocalDateTime.now());
        recipe.setUpdatedAt(LocalDateTime.now());
        recipeRepository.save(recipe);

        if (request.getIngredients() != null) {
            saveIngredients(recipe, request.getIngredients());
        }
        recipeRepository.save(recipe);
        return toResponses(List.of(recipe)).get(0);
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
        return toResponses(List.of(recipe)).get(0);
    }

    @Transactional
    public void delete(Long id) {
        Recipe recipe = findEntity(id);
        recipeRepository.delete(recipe);
    }

    @Transactional
    public RecipeResponse createFromParsed(JsonNode parsed, Long authorId) {
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
        return create(request, authorId);
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

    /**
     * Lưu nguyên liệu của công thức. Danh mục nguyên liệu nay thuộc inventory-service:
     * service này chỉ giữ lại {@code ingredientId} + {@code ingredientName}.
     * inventory-service không sẵn sàng thì vẫn lưu tên, {@code ingredientId} để null.
     */
    private void saveIngredients(Recipe recipe, List<RecipeIngredientItem> items) {
        for (RecipeIngredientItem item : items) {
            String ingName = item.getIngredientName() != null ? item.getIngredientName().trim() : "Nguyên liệu";
            Optional<IngredientRefDto> ref =
                    inventoryServiceClient.ensureIngredient(ingName, recipe.getCategory());

            RecipeIngredient ri = RecipeIngredient.builder()
                    .recipe(recipe)
                    .ingredientId(ref.map(IngredientRefDto::id).orElse(null))
                    .ingredientName(ref.map(IngredientRefDto::name).orElse(ingName))
                    .quantity(item.getQuantity() != null ? item.getQuantity() : 1.0)
                    .unit(item.getUnit() != null && !item.getUnit().isBlank() ? item.getUnit() : "phần")
                    .note(item.getNote())
                    .build();
            recipe.getIngredients().add(ri);
            recipeIngredientRepository.save(ri);
        }
    }

    private Recipe findEntity(Long id) {
        return recipeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy công thức id=" + id));
    }

    // =========================================================================
    //  Ánh xạ entity -> DTO (tên tác giả lấy qua HTTP, gom một lời gọi cho cả danh sách)
    // =========================================================================

    /**
     * Ánh xạ một danh sách công thức, gom {@code authorId} rồi hỏi user-service
     * <b>một lần duy nhất</b> — tránh N+1 khi render danh sách.
     */
    public List<RecipeResponse> toResponses(List<Recipe> recipes) {
        Map<Long, String> authorNames = resolveAuthorNames(recipes);
        return recipes.stream()
                .map(recipe -> toResponse(recipe, recipe.getAuthorId(),
                        recipe.getAuthorId() == null ? null : authorNames.get(recipe.getAuthorId())))
                .toList();
    }

    /** Ánh xạ một công thức khi đã biết sẵn tên tác giả (null nếu không tra được). */
    public RecipeResponse toResponse(Recipe recipe, Long authorId, String authorName) {
        List<RecipeResponse.IngredientDto> ings = recipe.getIngredients().stream()
                .map(ri -> RecipeResponse.IngredientDto.builder()
                        .id(ri.getId())
                        .ingredientName(ri.getIngredientName())
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
                .authorId(authorId)
                .authorName(authorName)
                .ingredients(ings)
                .createdAt(recipe.getCreatedAt())
                .updatedAt(recipe.getUpdatedAt())
                .build();
    }

    /** Tra tên hiển thị của tác giả theo lô; không tra được thì trả map rỗng (authorName = null). */
    private Map<Long, String> resolveAuthorNames(Collection<Recipe> recipes) {
        Set<Long> authorIds = recipes.stream()
                .map(Recipe::getAuthorId)
                .filter(Objects::nonNull)
                .collect(Collectors.toCollection(LinkedHashSet::new));
        if (authorIds.isEmpty()) {
            return Map.of();
        }
        Map<Long, UserSummaryDto> users = userServiceClient.getUsers(authorIds);
        Map<Long, String> names = new LinkedHashMap<>();
        for (Map.Entry<Long, UserSummaryDto> entry : users.entrySet()) {
            UserSummaryDto user = entry.getValue();
            if (user == null) {
                continue;
            }
            String name = (user.fullName() != null && !user.fullName().isBlank())
                    ? user.fullName()
                    : user.username();
            names.put(entry.getKey(), name);
        }
        return names;
    }

    // =========================================================================
    //  Ảnh local (không tải mạng trong vòng đọc/ghi dữ liệu)
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
        String slug = FoodImageSearchService.toSlug(title);
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
    public List<RecipeMatchDto> matchWithFridge(Long userId) {
        List<String> fridgeNames = inventoryServiceClient.getFridgeFoodNames(userId).stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(name -> !name.isEmpty())
                .distinct()
                .toList();
        if (fridgeNames.isEmpty()) {
            return List.of();
        }

        // Tra id nguyên liệu trong danh mục (một lời gọi); inventory chết thì coi như rỗng.
        Map<String, IngredientRefDto> resolved = inventoryServiceClient.resolveIngredients(fridgeNames);
        List<Long> ingredientIds = fridgeNames.stream()
                .map(name -> resolved.get(name.toLowerCase()))
                .filter(Objects::nonNull)
                .map(IngredientRefDto::id)
                .filter(Objects::nonNull)
                .distinct()
                .toList();

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

        List<MatchScore> scores = new ArrayList<>();
        for (Recipe recipe : candidates) {
            if (recipe.getIngredients() == null || recipe.getIngredients().isEmpty()) {
                continue;
            }
            long total = recipe.getIngredients().size();
            long matched = recipe.getIngredients().stream()
                    .filter(ri -> {
                        String key = StringUtils.searchable(ri.getIngredientName());
                        if (key.length() < 3) {
                            return false;
                        }
                        return fridgeKeys.stream().anyMatch(fk -> fk.contains(key) || key.contains(fk));
                    })
                    .count();
            if (matched == 0) {
                continue;
            }
            scores.add(new MatchScore(recipe, matched, total));
        }

        scores.sort(Comparator
                .comparingInt(MatchScore::percent).reversed()
                .thenComparing(Comparator.comparingLong(MatchScore::matched).reversed()));
        List<MatchScore> limited = scores.stream().limit(20).toList();

        // Một lời gọi user-service cho toàn bộ kết quả trả về.
        List<RecipeResponse> responses = toResponses(limited.stream().map(MatchScore::recipe).toList());

        List<RecipeMatchDto> result = new ArrayList<>();
        for (int i = 0; i < limited.size(); i++) {
            MatchScore score = limited.get(i);
            result.add(new RecipeMatchDto(responses.get(i), score.matched(), score.total(), score.percent()));
        }
        return result;
    }

    /** Điểm khớp tạm thời trước khi nạp tên tác giả theo lô. */
    private record MatchScore(Recipe recipe, long matched, long total) {

        int percent() {
            return (int) Math.round(matched * 100.0 / total);
        }
    }
}
