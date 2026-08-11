package com.nhom6.foodx.ingredient.facade;

import com.nhom6.foodx.ingredient.entity.Ingredient;
import com.nhom6.foodx.ingredient.repository.IngredientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Triển khai IngredientFacade.
 */
@Service
@RequiredArgsConstructor
public class IngredientFacadeImpl implements IngredientFacade {

    private final IngredientRepository ingredientRepository;

    @Override
    @Transactional(readOnly = true)
    public IngredientSummary getSummary(Long ingredientId) {
        if (ingredientId == null) {
            return null;
        }
        return ingredientRepository.findById(ingredientId).map(this::toSummary).orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<Long, IngredientSummary> getSummaries(Collection<Long> ingredientIds) {
        if (ingredientIds == null || ingredientIds.isEmpty()) {
            return Map.of();
        }
        Set<Long> ids = ingredientIds.stream().filter(Objects::nonNull).collect(Collectors.toSet());
        if (ids.isEmpty()) {
            return Map.of();
        }
        Map<Long, IngredientSummary> result = new LinkedHashMap<>();
        for (Ingredient ing : ingredientRepository.findAllById(ids)) {
            result.put(ing.getId(), toSummary(ing));
        }
        return result;
    }

    private IngredientSummary toSummary(Ingredient ing) {
        return new IngredientSummary(
                ing.getId(),
                ing.getName(),
                ing.getCategory(),
                ing.getCaloriesPerUnit(),
                ing.getDefaultUnit()
        );
    }
}
