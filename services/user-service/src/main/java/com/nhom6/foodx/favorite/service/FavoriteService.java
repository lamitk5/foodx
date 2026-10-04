package com.nhom6.foodx.favorite.service;

import com.nhom6.foodx.common.exception.BusinessException;
import com.nhom6.foodx.favorite.dto.FavoriteRequest;
import com.nhom6.foodx.favorite.dto.FavoriteResponse;
import com.nhom6.foodx.favorite.entity.Favorite;
import com.nhom6.foodx.favorite.repository.FavoriteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Xử lý nghiệp vụ Danh sách yêu thích cho người dùng.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final JdbcTemplate jdbcTemplate;

    /**
     * Bật/tắt yêu thích. Trả về true = đã lưu, false = đã bỏ lưu.
     */
    @Transactional
    public boolean toggle(Long userId, FavoriteRequest request) {
        if (userId == null) {
            throw new BusinessException(401, "Bạn cần đăng nhập để thao tác yêu thích");
        }
        Long targetId = request.targetId();
        if (targetId == null) {
            throw new BusinessException(400, "Thiếu id món ăn hoặc đối tượng cần lưu");
        }
        String targetType = request.targetType() == null || request.targetType().isBlank()
                ? Favorite.TYPE_RECIPE
                : request.targetType().trim().toUpperCase();

        if (favoriteRepository.existsByUserIdAndTargetIdAndTargetType(userId, targetId, targetType)) {
            favoriteRepository.findByUserIdAndTargetIdAndTargetType(userId, targetId, targetType)
                    .ifPresent(favoriteRepository::delete);
            return false;
        }

        Favorite favorite = Favorite.builder()
                .userId(userId)
                .targetId(targetId)
                .targetType(targetType)
                .build();
        favoriteRepository.save(favorite);
        return true;
    }

    /**
     * Lấy danh sách các món yêu thích của người dùng kèm chi tiết tiêu đề, ảnh và calo.
     */
    @Transactional(readOnly = true)
    public List<FavoriteResponse> list(Long userId) {
        List<Favorite> favorites = favoriteRepository.findByUserIdOrderByCreatedAtDesc(userId);
        if (favorites.isEmpty()) {
            return List.of();
        }

        List<FavoriteResponse> result = new ArrayList<>();
        for (Favorite f : favorites) {
            FavoriteResponse resp = resolveDetails(f);
            result.add(resp);
        }
        return result;
    }

    /**
     * Lấy danh sách ID các target đã yêu thích theo loại (để client check nhanh trạng thái tim).
     */
    @Transactional(readOnly = true)
    public List<Long> getFavoriteIds(Long userId, String targetType) {
        String type = (targetType == null || targetType.isBlank()) ? Favorite.TYPE_RECIPE : targetType.trim().toUpperCase();
        return favoriteRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .filter(f -> type.equalsIgnoreCase(f.getTargetType()))
                .map(Favorite::getTargetId)
                .toList();
    }

    /**
     * Xóa một mục khỏi danh sách yêu thích.
     */
    @Transactional
    public void remove(Long userId, Long favoriteId) {
        Favorite favorite = favoriteRepository.findByIdAndUserId(favoriteId, userId)
                .orElseThrow(() -> new BusinessException(404, "Không tìm thấy mục yêu thích"));
        favoriteRepository.delete(favorite);
    }

    private FavoriteResponse resolveDetails(Favorite f) {
        String title = "Mục #" + f.getTargetId();
        String subtitle = "Yêu thích";
        String imageUrl = null;
        Integer kcal = null;
        Integer cookTime = null;
        String difficulty = null;

        if (Favorite.TYPE_RECIPE.equalsIgnoreCase(f.getTargetType())) {
            try {
                List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                        "SELECT title, image_url, cooking_time, calories, difficulty FROM recipes WHERE id = ?",
                        f.getTargetId()
                );
                if (!rows.isEmpty()) {
                    Map<String, Object> row = rows.get(0);
                    title = row.get("title") != null ? row.get("title").toString() : title;
                    imageUrl = row.get("image_url") != null ? row.get("image_url").toString() : null;
                    if (row.get("cooking_time") instanceof Number n) cookTime = n.intValue();
                    if (row.get("calories") instanceof Number n) kcal = n.intValue();
                    difficulty = row.get("difficulty") != null ? row.get("difficulty").toString() : null;
                    subtitle = "Công thức" + (difficulty != null ? " · " + difficulty : "");
                }
            } catch (Exception e) {
                log.debug("Không truy vấn được bảng recipes: {}", e.getMessage());
            }
        } else if (Favorite.TYPE_INGREDIENT.equalsIgnoreCase(f.getTargetType())) {
            try {
                List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                        "SELECT name, category, calories_per_unit FROM ingredients WHERE id = ?",
                        f.getTargetId()
                );
                if (!rows.isEmpty()) {
                    Map<String, Object> row = rows.get(0);
                    title = row.get("name") != null ? row.get("name").toString() : title;
                    String category = row.get("category") != null ? row.get("category").toString() : "Nguyên liệu";
                    subtitle = category;
                    if (row.get("calories_per_unit") instanceof Number n) kcal = (int) Math.round(n.doubleValue());
                }
            } catch (Exception e) {
                log.debug("Không truy vấn được bảng ingredients: {}", e.getMessage());
            }
        }

        return new FavoriteResponse(
                f.getId(),
                f.getTargetId(),
                f.getTargetType(),
                title,
                subtitle,
                imageUrl,
                kcal,
                cookTime,
                difficulty,
                f.getCreatedAt()
        );
    }
}
