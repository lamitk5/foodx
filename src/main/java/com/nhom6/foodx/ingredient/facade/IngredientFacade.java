package com.nhom6.foodx.ingredient.facade;

import java.util.Collection;
import java.util.Map;

/**
 * Public Service Interface của ingredient module.
 */
public interface IngredientFacade {

    IngredientSummary getSummary(Long ingredientId);

    Map<Long, IngredientSummary> getSummaries(Collection<Long> ingredientIds);
}
