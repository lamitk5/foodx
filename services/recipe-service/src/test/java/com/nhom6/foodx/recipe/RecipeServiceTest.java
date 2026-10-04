package com.nhom6.foodx.recipe;

import com.nhom6.foodx.auth.entity.User;
import com.nhom6.foodx.common.exception.BusinessException;
import com.nhom6.foodx.fridge.repository.FridgeItemRepository;
import com.nhom6.foodx.ingredient.repository.IngredientRepository;
import com.nhom6.foodx.recipe.dto.RecipeRequest;
import com.nhom6.foodx.recipe.entity.Recipe;
import com.nhom6.foodx.recipe.repository.RecipeIngredientRepository;
import com.nhom6.foodx.recipe.repository.RecipeRepository;
import com.nhom6.foodx.recipe.service.RecipeService;
import com.nhom6.foodx.security.SecurityUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RecipeServiceTest {

    @Mock
    private RecipeRepository recipeRepository;
    @Mock
    private RecipeIngredientRepository recipeIngredientRepository;
    @Mock
    private IngredientRepository ingredientRepository;
    @Mock
    private FridgeItemRepository fridgeItemRepository;
    @Mock
    private com.nhom6.foodx.food.service.FoodImageSearchService foodImageSearchService;
    @Mock
    private SecurityUtils securityUtils;

    @InjectMocks
    private RecipeService recipeService;

    private User author;
    private User otherUser;
    private Recipe recipe;

    @BeforeEach
    void setUp() {
        author = User.builder()
                .id(1L)
                .username("haidang")
                .role(User.Role.USER)
                .build();

        otherUser = User.builder()
                .id(2L)
                .username("otheruser")
                .role(User.Role.USER)
                .build();

        recipe = Recipe.builder()
                .id(10L)
                .title("Phở Bò Hà Nội")
                .author(author)
                .build();
    }

    @Test
    void createRecipe_emptyTitle_throwsBusinessException() {
        RecipeRequest req = new RecipeRequest();
        req.setTitle("   ");

        BusinessException ex = assertThrows(BusinessException.class, () -> recipeService.create(req, author));
        assertEquals(400, ex.getStatus());
    }

    @Test
    void updateRecipe_nonAuthor_throwsForbidden() {
        when(recipeRepository.findById(10L)).thenReturn(Optional.of(recipe));
        when(securityUtils.getCurrentUser()).thenReturn(otherUser);

        RecipeRequest req = new RecipeRequest();
        req.setTitle("Tên mới");

        BusinessException ex = assertThrows(BusinessException.class, () -> recipeService.update(10L, req));
        assertEquals(403, ex.getStatus());
    }

    @Test
    void deleteRecipe_byAuthor_succeeds() {
        when(recipeRepository.findById(10L)).thenReturn(Optional.of(recipe));
        when(securityUtils.getCurrentUser()).thenReturn(author);

        assertDoesNotThrow(() -> recipeService.delete(10L));
        verify(recipeRepository, times(1)).delete(recipe);
    }
}
