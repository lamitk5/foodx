package com.nhom6.foodx.common.client;

import com.nhom6.foodx.common.dto.RecipeDraftDto;
import com.nhom6.foodx.common.dto.RecipeSummaryDto;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.web.client.RestClient;

import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Client gọi recipe-service — service duy nhất sở hữu bảng {@code recipes} và
 * {@code recipe_ingredients}.
 */
public class RecipeServiceClient extends AbstractFoodxClient {

    public RecipeServiceClient(RestClient.Builder builder, String baseUrl, String internalToken) {
        super(builder, baseUrl, internalToken);
    }

    public Optional<RecipeSummaryDto> getRecipe(Long id) {
        if (id == null) {
            return Optional.empty();
        }
        return getOptional(InternalApi.RECIPE_BY_ID, RecipeSummaryDto.class, id);
    }

    public Map<Long, RecipeSummaryDto> getRecipes(Collection<Long> ids) {
        Map<Long, RecipeSummaryDto> result = new LinkedHashMap<>();
        if (ids == null || ids.isEmpty()) {
            return result;
        }
        String joined = ids.stream()
                .filter(Objects::nonNull)
                .distinct()
                .map(String::valueOf)
                .collect(Collectors.joining(","));
        if (joined.isEmpty()) {
            return result;
        }
        List<RecipeSummaryDto> recipes = getList(InternalApi.RECIPES + "?ids={ids}",
                new ParameterizedTypeReference<>() {
                }, joined);
        for (RecipeSummaryDto recipe : recipes) {
            result.put(recipe.id(), recipe);
        }
        return result;
    }

    public List<RecipeSummaryDto> getAllRecipes() {
        return getList(InternalApi.RECIPES, new ParameterizedTypeReference<>() {
        });
    }

    /** Đảm bảo một công thức (thường do AI sinh) tồn tại trong kho. */
    public Optional<RecipeSummaryDto> ensureRecipe(RecipeDraftDto draft) {
        if (draft == null || draft.title() == null || draft.title().isBlank()) {
            return Optional.empty();
        }
        return postOptional(InternalApi.RECIPES_ENSURE, RecipeSummaryDto.class, draft);
    }
}
