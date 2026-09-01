package com.nhom6.foodx.favorite.service;

import com.nhom6.foodx.auth.entity.User;
import com.nhom6.foodx.common.exception.BusinessException;
import com.nhom6.foodx.favorite.dto.FavoriteRequest;
import com.nhom6.foodx.favorite.dto.FavoriteResponse;
import com.nhom6.foodx.favorite.entity.Favorite;
import com.nhom6.foodx.favorite.repository.FavoriteRepository;
import com.nhom6.foodx.ingredient.facade.IngredientFacade;
import com.nhom6.foodx.ingredient.facade.IngredientSummary;
import com.nhom6.foodx.recipe.facade.RecipeFacade;
import com.nhom6.foodx.recipe.facade.RecipeSummary;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Module yêu thích: chỉ lưu tham chiếu (targetId, targetType) + userId.
 * Khi trả dữ liệu hiển thị, gọi Public API của recipe/ingredient module để lấy chi tiết —
 * TUYỆT ĐỐI không gọi trực tiếp repository của module khác.
 */
@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final RecipeFacade recipeFacade;
    private final IngredientFacade ingredientFacade;

    /** Bật/tắt yêu thích. Trả về true = đã lưu, false = đã bỏ lưu. */
    @Transactional
    public boolean toggle(User user, FavoriteRequest request) {
        Long targetId = request.targetId();
        String targetType = request.targetType() == null ? "" : request.targetType().trim().toUpperCase();
        if (targetId == null) {
            throw new BusinessException(400, "Thiếu đối tượng cần lưu");
        }
        if (!List.of(Favorite.TYPE_RECIPE, Favorite.TYPE_INGREDIENT).contains(targetType)) {
            throw new BusinessException(400, "Loại yêu thích không hợp lệ");
        }
        // Xác thực đối tượng tồn tại qua Public API của module tương ứng.
        if (!targetExists(targetId, targetType)) {
            throw new BusinessException(404, "Không tìm thấy đối tượng cần lưu");
        }

        if (favoriteRepository.existsByUserIdAndTargetIdAndTargetType(user.getId(), targetId, targetType)) {
            favoriteRepository.findByUserIdAndTargetIdAndTargetType(user.getId(), targetId, targetType)
                    .ifPresent(favoriteRepository::delete);
            return false;
        }
        favoriteRepository.save(Favorite.builder()
                .userId(user.getId())
                .targetId(targetId)
                .targetType(targetType)
                .build());
        return true;
    }

    @Transactional(readOnly = true)
    public List<FavoriteResponse> list(User user) {
        List<Favorite> favorites = favoriteRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        if (favorites.isEmpty()) {
            return List.of();
        }

        Set<Long> recipeIds = favorites.stream()
                .filter(f -> Favorite.TYPE_RECIPE.equals(f.getTargetType()))
                .map(Favorite::getTargetId)
                .collect(Collectors.toSet());
        Set<Long> ingredientIds = favorites.stream()
                .filter(f -> Favorite.TYPE_INGREDIENT.equals(f.getTargetType()))
                .map(Favorite::getTargetId)
                .collect(Collectors.toSet());

        Map<Long, RecipeSummary> recipes = recipeFacade.getSummaries(recipeIds);
        Map<Long, IngredientSummary> ingredients = ingredientFacade.getSummaries(ingredientIds);

        List<FavoriteResponse> result = new ArrayList<>();
        for (Favorite f : favorites) {
            FavoriteResponse resp = toResponse(f, recipes.get(f.getTargetId()), ingredients.get(f.getTargetId()));
            if (resp != null) {
                result.add(resp);
            }
        }
        return result;
    }

    @Transactional
    public void remove(User user, Long favoriteId) {
        Favorite favorite = favoriteRepository.findByIdAndUserId(favoriteId, user.getId())
                .orElseThrow(() -> new BusinessException(404, "Không tìm thấy mục yêu thích"));
        favoriteRepository.delete(favorite);
    }

    private boolean targetExists(Long targetId, String targetType) {
        if (Favorite.TYPE_RECIPE.equals(targetType)) {
            return recipeFacade.getSummary(targetId) != null;
        }
        return ingredientFacade.getSummary(targetId) != null;
    }

    private FavoriteResponse toResponse(Favorite f, RecipeSummary recipe, IngredientSummary ingredient) {
        if (Favorite.TYPE_RECIPE.equals(f.getTargetType())) {
            if (recipe == null) {
                return null;
            }
            String subtitle = "Công thức" + (recipe.difficulty() != null ? " · " + recipe.difficulty() : "");
            return new FavoriteResponse(
                    f.getId(), f.getTargetId(), f.getTargetType(),
                    recipe.title(), subtitle, recipe.imageUrl(), recipe.kcal(),
                    recipe.cookTime(), recipe.difficulty(), f.getCreatedAt());
        }
        // INGREDIENT
        if (ingredient == null) {
            return null;
        }
        int kcal = ingredient.caloriesPerUnit() == null ? 0 : (int) Math.round(ingredient.caloriesPerUnit());
        return new FavoriteResponse(
                f.getId(), f.getTargetId(), f.getTargetType(),
                ingredient.name(),
                ingredient.category() != null ? ingredient.category() : "Nguyên liệu",
                null, kcal, null, null, f.getCreatedAt());
    }
}
