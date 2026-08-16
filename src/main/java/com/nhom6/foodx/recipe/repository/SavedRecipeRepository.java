package com.nhom6.foodx.recipe.repository;

import com.nhom6.foodx.recipe.entity.SavedRecipe;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SavedRecipeRepository extends JpaRepository<SavedRecipe, Long> {

    Optional<SavedRecipe> findByUserIdAndRecipeId(Long userId, Long recipeId);

    List<SavedRecipe> findByUserId(Long userId);

    boolean existsByUserIdAndRecipeId(Long userId, Long recipeId);
}
