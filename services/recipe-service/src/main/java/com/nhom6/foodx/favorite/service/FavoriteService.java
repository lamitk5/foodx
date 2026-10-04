package com.nhom6.foodx.favorite.service;

import com.nhom6.foodx.common.client.InventoryServiceClient;
import com.nhom6.foodx.common.dto.IngredientRefDto;
import com.nhom6.foodx.common.exception.BusinessException;
import com.nhom6.foodx.favorite.dto.FavoriteRequest;
import com.nhom6.foodx.favorite.dto.FavoriteResponse;
import com.nhom6.foodx.favorite.entity.Favorite;
import com.nhom6.foodx.favorite.repository.FavoriteRepository;
import com.nhom6.foodx.recipe.dto.RecipeResponse;
import com.nhom6.foodx.recipe.repository.RecipeRepository;
import com.nhom6.foodx.recipe.service.RecipeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Module yêu thích: chỉ lưu tham chiếu (targetId, targetType) + userId.
 * Khi trả dữ liệu hiển thị: công thức đọc từ {@link RecipeRepository} (bảng của chính
 * service này), nguyên liệu lấy qua HTTP từ inventory-service — service sở hữu bảng
 * {@code ingredients}.
 */
@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final RecipeRepository recipeRepository;
    private final RecipeService recipeService;
    private final InventoryServiceClient inventoryServiceClient;

    /** Bật/tắt yêu thích. Trả về true = đã lưu, false = đã bỏ lưu. */
    @Transactional
    public boolean toggle(Long userId, FavoriteRequest request) {
        Long targetId = request.targetId();
        String targetType = request.targetType() == null ? "" : request.targetType().trim().toUpperCase();
        if (targetId == null) {
            throw new BusinessException(400, "Thiếu đối tượng cần lưu");
        }
        if (!List.of(Favorite.TYPE_RECIPE, Favorite.TYPE_INGREDIENT).contains(targetType)) {
            throw new BusinessException(400, "Loại yêu thích không hợp lệ");
        }
        // Xác thực đối tượng tồn tại (recipe: bảng nội bộ; ingredient: inventory-service).
        if (!targetExists(targetId, targetType)) {
            throw new BusinessException(404, "Không tìm thấy đối tượng cần lưu");
        }

        if (favoriteRepository.existsByUserIdAndTargetIdAndTargetType(userId, targetId, targetType)) {
            favoriteRepository.findByUserIdAndTargetIdAndTargetType(userId, targetId, targetType)
                    .ifPresent(favoriteRepository::delete);
            return false;
        }
        favoriteRepository.save(Favorite.builder()
                .userId(userId)
                .targetId(targetId)
                .targetType(targetType)
                .build());
        return true;
    }

    @Transactional(readOnly = true)
    public List<FavoriteResponse> list(Long userId) {
        List<Favorite> favorites = favoriteRepository.findByUserIdOrderByCreatedAtDesc(userId);
        if (favorites.isEmpty()) {
            return List.of();
        }

        Set<Long> recipeIds = favorites.stream()
                .filter(f -> Favorite.TYPE_RECIPE.equals(f.getTargetType()))
                .map(Favorite::getTargetId)
                .collect(Collectors.toSet());

        Map<Long, RecipeResponse> recipes = recipeRepository.findAllById(recipeIds).stream()
                .map(recipe -> recipeService.toResponse(recipe, null, null))
                .collect(Collectors.toMap(RecipeResponse::getId, Function.identity()));

        // Nguyên liệu thuộc inventory-service: gom id rồi tra MỘT lời gọi (tránh N+1).
        Set<Long> ingredientIds = favorites.stream()
                .filter(f -> Favorite.TYPE_INGREDIENT.equals(f.getTargetType()))
                .map(Favorite::getTargetId)
                .collect(Collectors.toSet());
        Map<Long, IngredientRefDto> ingredients = inventoryServiceClient.getIngredients(ingredientIds);

        List<FavoriteResponse> result = new ArrayList<>();
        for (Favorite f : favorites) {
            FavoriteResponse resp = Favorite.TYPE_RECIPE.equals(f.getTargetType())
                    ? toRecipeResponse(f, recipes.get(f.getTargetId()))
                    : toIngredientResponse(f, ingredients.get(f.getTargetId()));
            if (resp != null) {
                result.add(resp);
            }
        }
        return result;
    }

    @Transactional
    public void remove(Long userId, Long favoriteId) {
        Favorite favorite = favoriteRepository.findByIdAndUserId(favoriteId, userId)
                .orElseThrow(() -> new BusinessException(404, "Không tìm thấy mục yêu thích"));
        favoriteRepository.delete(favorite);
    }

    private boolean targetExists(Long targetId, String targetType) {
        if (Favorite.TYPE_RECIPE.equals(targetType)) {
            return recipeRepository.existsById(targetId);
        }
        return inventoryServiceClient.getIngredient(targetId).isPresent();
    }

    private FavoriteResponse toRecipeResponse(Favorite f, RecipeResponse recipe) {
        if (recipe == null) {
            return null;
        }
        String subtitle = "Công thức" + (recipe.getDifficulty() != null ? " · " + recipe.getDifficulty() : "");
        return new FavoriteResponse(
                f.getId(), f.getTargetId(), f.getTargetType(),
                recipe.getTitle(), subtitle, recipe.getImageUrl(), recipe.getKcal(),
                recipe.getCookTime(), recipe.getDifficulty(), f.getCreatedAt());
    }

    /**
     * Nguyên liệu nay thuộc inventory-service; calo lấy từ
     * {@link IngredientRefDto#caloriesPerUnit()} (calo/100g).
     */
    private FavoriteResponse toIngredientResponse(Favorite f, IngredientRefDto ingredient) {
        if (ingredient == null) {
            return null;
        }
        int kcal = ingredient.caloriesPerUnit() != null ? (int) Math.round(ingredient.caloriesPerUnit()) : 0;
        return new FavoriteResponse(
                f.getId(), f.getTargetId(), f.getTargetType(),
                ingredient.name(),
                ingredient.category() != null ? ingredient.category() : "Nguyên liệu",
                null, kcal, null, null, f.getCreatedAt());
    }
}
