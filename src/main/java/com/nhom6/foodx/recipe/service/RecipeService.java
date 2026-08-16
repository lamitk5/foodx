package com.nhom6.foodx.recipe.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.nhom6.foodx.auth.entity.User;
import com.nhom6.foodx.common.exception.ResourceNotFoundException;
import com.nhom6.foodx.ingredient.entity.Ingredient;
import com.nhom6.foodx.ingredient.repository.IngredientRepository;
import com.nhom6.foodx.recipe.dto.RecipeIngredientItem;
import com.nhom6.foodx.recipe.dto.RecipeRequest;
import com.nhom6.foodx.recipe.dto.RecipeResponse;
import com.nhom6.foodx.recipe.entity.Recipe;
import com.nhom6.foodx.recipe.entity.RecipeIngredient;
import com.nhom6.foodx.recipe.repository.RecipeIngredientRepository;
import com.nhom6.foodx.recipe.repository.RecipeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RecipeService {

    private final RecipeRepository recipeRepository;
    private final RecipeIngredientRepository recipeIngredientRepository;
    private final IngredientRepository ingredientRepository;

    @Transactional(readOnly = true)
    public List<RecipeResponse> search(String keyword, String category, String cuisine) {
        List<Recipe> recipes;
        if (keyword != null && !keyword.isBlank()) {
            recipes = recipeRepository.findByTitleContainingIgnoreCase(keyword);
        } else if (category != null && !category.isBlank()) {
            recipes = recipeRepository.findByCategoryContainingIgnoreCase(category);
        } else if (cuisine != null && !cuisine.isBlank()) {
            recipes = recipeRepository.findByCuisineContainingIgnoreCase(cuisine);
        } else {
            recipes = recipeRepository.findAll();
        }
        return recipes.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public RecipeResponse getById(Long id) {
        return toResponse(findEntity(id));
    }

    @Transactional
    public RecipeResponse create(RecipeRequest request, User author) {
        Recipe recipe = new Recipe();
        applyRequest(recipe, request);
        recipe.setAuthor(author);
        recipe.setCreatedAt(LocalDateTime.now());
        recipe.setUpdatedAt(LocalDateTime.now());
        recipeRepository.save(recipe);

        if (request.getIngredients() != null) {
            saveIngredients(recipe, request.getIngredients());
        }
        recipeRepository.save(recipe);
        return toResponse(recipe);
    }

    @Transactional
    public RecipeResponse update(Long id, RecipeRequest request) {
        Recipe recipe = findEntity(id);
        applyRequest(recipe, request);
        recipe.setUpdatedAt(LocalDateTime.now());

        // Xoá nguyên liệu cũ và lưu lại
        if (request.getIngredients() != null) {
            recipe.getIngredients().clear();
            saveIngredients(recipe, request.getIngredients());
        }
        recipeRepository.save(recipe);
        return toResponse(recipe);
    }

    @Transactional
    public void delete(Long id) {
        Recipe recipe = findEntity(id);
        recipeRepository.delete(recipe);
    }

    @Transactional
    public RecipeResponse createFromParsed(JsonNode parsed, User author) {
        RecipeRequest request = new RecipeRequest();
        request.setTitle(parsed.path("title").asText(parsed.path("name").asText("Không có tiêu đề")));
        request.setDescription(parsed.path("description").asText());
        request.setInstructions(parsed.path("instructions").asText());
        request.setPrepTime(parsed.path("prepTime").isMissingNode() ? null : parsed.path("prepTime").asInt());
        request.setCookTime(parsed.path("cookTime").isMissingNode() ? null : parsed.path("cookTime").asInt());
        request.setServings(parsed.path("servings").isMissingNode() ? null : parsed.path("servings").asInt());
        request.setCuisine(parsed.path("cuisine").asText());
        request.setCategory(parsed.path("category").asText());

        List<RecipeIngredientItem> items = new ArrayList<>();
        if (parsed.has("ingredients") && parsed.get("ingredients").isArray()) {
            for (JsonNode item : parsed.get("ingredients")) {
                items.add(RecipeIngredientItem.builder()
                        .ingredientName(item.path("name").asText())
                        .quantity(item.path("quantity").isNumber() ? item.path("quantity").asDouble() : null)
                        .unit(item.path("unit").asText())
                        .note(item.path("note").asText())
                        .build());
            }
        }
        request.setIngredients(items);
        return create(request, author);
    }

    private void applyRequest(Recipe recipe, RecipeRequest request) {
        recipe.setTitle(request.getTitle().trim());
        recipe.setDescription(request.getDescription());
        recipe.setInstructions(request.getInstructions());
        recipe.setPrepTime(request.getPrepTime());
        recipe.setCookTime(request.getCookTime());
        recipe.setServings(request.getServings());
        recipe.setCuisine(request.getCuisine());
        recipe.setCategory(request.getCategory());
        recipe.setImageUrl(request.getImageUrl());
        recipe.setSourceUrl(request.getSourceUrl());
    }

    private void saveIngredients(Recipe recipe, List<RecipeIngredientItem> items) {
        for (RecipeIngredientItem item : items) {
            Ingredient ingredient = ingredientRepository.findByNameIgnoreCase(item.getIngredientName().trim())
                    .orElseGet(() -> {
                        Ingredient newIng = Ingredient.builder()
                                .name(item.getIngredientName().trim())
                                .category(recipe.getCategory())
                                .createdAt(LocalDateTime.now())
                                .updatedAt(LocalDateTime.now())
                                .build();
                        return ingredientRepository.save(newIng);
                    });

            RecipeIngredient ri = RecipeIngredient.builder()
                    .recipe(recipe)
                    .ingredient(ingredient)
                    .quantity(item.getQuantity())
                    .unit(item.getUnit())
                    .note(item.getNote())
                    .build();
            recipe.getIngredients().add(ri);
            recipeIngredientRepository.save(ri);
        }
    }

    private Recipe findEntity(Long id) {
        return recipeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy công thức id=" + id));
    }

    private RecipeResponse toResponse(Recipe recipe) {
        List<RecipeResponse.IngredientDto> ings = recipe.getIngredients().stream()
                .map(ri -> RecipeResponse.IngredientDto.builder()
                        .id(ri.getId())
                        .ingredientName(ri.getIngredient().getName())
                        .quantity(ri.getQuantity())
                        .unit(ri.getUnit())
                        .note(ri.getNote())
                        .build())
                .toList();

        return RecipeResponse.builder()
                .id(recipe.getId())
                .title(recipe.getTitle())
                .description(recipe.getDescription())
                .instructions(recipe.getInstructions())
                .prepTime(recipe.getPrepTime())
                .cookTime(recipe.getCookTime())
                .servings(recipe.getServings())
                .cuisine(recipe.getCuisine())
                .category(recipe.getCategory())
                .imageUrl(recipe.getImageUrl())
                .sourceUrl(recipe.getSourceUrl())
                .authorId(recipe.getAuthor() != null ? recipe.getAuthor().getId() : null)
                .authorName(recipe.getAuthor() != null ? recipe.getAuthor().getFullName() : null)
                .ingredients(ings)
                .createdAt(recipe.getCreatedAt())
                .updatedAt(recipe.getUpdatedAt())
                .build();
    }
}
