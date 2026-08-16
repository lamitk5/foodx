package com.nhom6.foodx.recipe.repository;

import com.nhom6.foodx.recipe.entity.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RecipeRepository extends JpaRepository<Recipe, Long> {

    List<Recipe> findByTitleContainingIgnoreCase(String keyword);

    List<Recipe> findByCategoryContainingIgnoreCase(String category);

    List<Recipe> findByCuisineContainingIgnoreCase(String cuisine);

    List<Recipe> findByAuthorId(Long authorId);

    @Query("SELECT r FROM Recipe r JOIN r.ingredients ri WHERE ri.ingredient.id IN :ids GROUP BY r HAVING COUNT(DISTINCT ri.ingredient.id) = :size")
    List<Recipe> findByAllIngredients(@Param("ids") List<Long> ids, @Param("size") long size);

    @Query("SELECT r FROM Recipe r JOIN r.ingredients ri WHERE ri.ingredient.id IN :ids GROUP BY r HAVING COUNT(DISTINCT ri.ingredient.id) >= 1")
    List<Recipe> findByAnyIngredients(@Param("ids") List<Long> ids);

    /** Top 8 công thức mới nhất cho trang chủ. */
    List<Recipe> findTop8ByOrderByCreatedAtDesc();

    /** Top 10 công thức theo category cho trang chủ. */
    List<Recipe> findTop10ByCategoryOrderByCreatedAtDesc(String category);
}
