package com.nhom6.foodx.internal;

import com.nhom6.foodx.common.client.InternalApi;
import com.nhom6.foodx.favorite.repository.FavoriteRepository;
import com.nhom6.foodx.recipe.repository.RecipeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

/**
 * API nội bộ để user-service nhờ dọn dữ liệu khi một tài khoản bị xoá.
 *
 * <p>Trước đây user-service tự chạy {@code DELETE FROM favorites} và
 * {@code UPDATE recipes SET author_id = NULL} bằng JdbcTemplate xuyên qua service khác.
 * Nay mỗi service tự dọn bảng mình sở hữu qua endpoint này — {@code UserPurgeClient} ở
 * foodx-common gọi tới.</p>
 *
 * <p>Chỉ tồn tại trong mạng nội bộ (yêu cầu {@code X-Foodx-Internal-Token}) và trả về
 * <b>JSON thô</b> (một số nguyên), không bọc {@code ApiResponse}.</p>
 */
@RestController
@RequiredArgsConstructor
public class InternalUserDataController {

    private final FavoriteRepository favoriteRepository;
    private final RecipeRepository recipeRepository;

    /**
     * Xoá/gỡ dữ liệu thuộc sở hữu của recipe-service cho một người dùng.
     *
     * <ul>
     *   <li>{@code favorites} theo {@code user_id} — xoá hẳn.</li>
     *   <li>{@code recipes} của user — chỉ set {@code author_id = NULL}, giữ lại công thức
     *       để cộng đồng vẫn xem được.</li>
     * </ul>
     *
     * @return tổng số dòng đã xoá/cập nhật
     */
    @DeleteMapping(InternalApi.USER_DATA_PURGE)
    @Transactional
    public Integer purgeUserData(@PathVariable Long userId) {
        if (userId == null) {
            return 0;
        }
        int deletedFavorites = favoriteRepository.deleteByUserId(userId);
        int detachedRecipes = recipeRepository.clearAuthorId(userId);
        return deletedFavorites + detachedRecipes;
    }
}
