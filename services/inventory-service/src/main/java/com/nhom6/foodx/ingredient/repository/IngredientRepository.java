package com.nhom6.foodx.ingredient.repository;

import com.nhom6.foodx.ingredient.entity.Ingredient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface IngredientRepository extends JpaRepository<Ingredient, Long> {

    Optional<Ingredient> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);

    List<Ingredient> findByNameContainingIgnoreCase(String name);

    List<Ingredient> findByCategoryContainingIgnoreCase(String category);

    /**
     * Tra nhiều nguyên liệu theo tên trong một câu truy vấn (dùng cho
     * {@code GET /internal/ingredients/resolve}). {@code names} phải là tên đã
     * chuẩn hoá chữ thường — xem {@code IngredientService.resolveRefs}.
     */
    @Query("select i from Ingredient i where lower(i.name) in :names")
    List<Ingredient> findByLowerNameIn(@Param("names") Collection<String> names);
}
