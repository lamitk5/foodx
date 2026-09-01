package com.nhom6.foodx.recipe.facade;

import java.util.Collection;
import java.util.List;
import java.util.Map;

/**
 * Public Service Interface của recipe module.
 * Các module khác (plan, favorite, ...) chỉ được phép gọi qua facade này,
 * tuyệt đối không gọi trực tiếp RecipeRepository.
 */
public interface RecipeFacade {

    /** Lấy tóm tắt một công thức (null nếu không tồn tại). */
    RecipeSummary getSummary(Long recipeId);

    /** Lấy tóm tắt nhiều công thức theo id (tránh N+1). Key = recipeId. */
    Map<Long, RecipeSummary> getSummaries(Collection<Long> recipeIds);

    /** Lấy toàn bộ công thức dạng tóm tắt (dùng cho thuật toán dự phòng). */
    List<RecipeSummary> getAllSummaries();

    /** Tìm công thức theo tiêu đề (không phân biệt hoa thường); nếu chưa có thì tạo mới. */
    RecipeSummary ensureRecipe(RecipeCreateSpec spec);
}
