package com.nhom6.foodx.recipe.repository;

import com.nhom6.foodx.recipe.entity.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RecipeRepository extends JpaRepository<Recipe, Long> {

    List<Recipe> findByTitleContainingIgnoreCase(String keyword);

    java.util.Optional<Recipe> findFirstByTitleIgnoreCase(String title);

    List<Recipe> findByCategoryContainingIgnoreCase(String category);

    List<Recipe> findByCuisineContainingIgnoreCase(String cuisine);

    List<Recipe> findByAuthorId(Long authorId);

    @Query("SELECT r FROM Recipe r JOIN r.ingredients ri WHERE ri.ingredientId IN :ids GROUP BY r HAVING COUNT(DISTINCT ri.ingredientId) = :size")
    List<Recipe> findByAllIngredients(@Param("ids") List<Long> ids, @Param("size") long size);

    @Query("SELECT r FROM Recipe r JOIN r.ingredients ri WHERE ri.ingredientId IN :ids GROUP BY r HAVING COUNT(DISTINCT ri.ingredientId) >= 1")
    List<Recipe> findByAnyIngredients(@Param("ids") List<Long> ids);

    /** Top 8 công thức mới nhất cho trang chủ. */
    List<Recipe> findTop8ByOrderByCreatedAtDesc();

    /** Top 10 công thức theo category cho trang chủ. */
    List<Recipe> findTop10ByCategoryOrderByCreatedAtDesc(String category);

    /**
     * Gỡ liên kết tác giả khi người dùng xoá tài khoản — KHÔNG xoá công thức để cộng đồng
     * vẫn xem được. Trả về số dòng đã cập nhật.
     */
    @Modifying
    @Query("update Recipe r set r.authorId = null where r.authorId = :userId")
    int clearAuthorId(@Param("userId") Long userId);
}
