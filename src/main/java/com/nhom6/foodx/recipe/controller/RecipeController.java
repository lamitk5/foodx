package com.nhom6.foodx.recipe.controller;

import com.nhom6.foodx.common.response.ApiResponse;
import com.nhom6.foodx.recipe.dto.RecipeImportRequest;
import com.nhom6.foodx.recipe.dto.RecipeRequest;
import com.nhom6.foodx.recipe.dto.RecipeResponse;
import com.nhom6.foodx.recipe.service.ImportRecipeService;
import com.nhom6.foodx.recipe.service.RecipeService;
import com.nhom6.foodx.security.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/recipes")
@RequiredArgsConstructor
public class RecipeController {

    private final RecipeService recipeService;
    private final ImportRecipeService importRecipeService;
    private final SecurityUtils securityUtils;

    @GetMapping
    public ApiResponse<List<RecipeResponse>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String cuisine) {
        return ApiResponse.success(recipeService.search(keyword, category, cuisine));
    }

    @GetMapping("/{id}")
    public ApiResponse<RecipeResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(recipeService.getById(id));
    }

    @PostMapping
    public ApiResponse<RecipeResponse> create(@Valid @RequestBody RecipeRequest request) {
        return ApiResponse.success(recipeService.create(request, securityUtils.getCurrentUser()),
                "Tạo công thức thành công");
    }

    @PostMapping("/import")
    public ApiResponse<RecipeResponse> importRecipe(@Valid @RequestBody RecipeImportRequest request) {
        return ApiResponse.success(
                importRecipeService.importFromText(request, securityUtils.getCurrentUser()),
                "Import công thức thành công");
    }

    @PutMapping("/{id}")
    public ApiResponse<RecipeResponse> update(@PathVariable Long id, @Valid @RequestBody RecipeRequest request) {
        return ApiResponse.success(recipeService.update(id, request), "Cập nhật công thức thành công");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        recipeService.delete(id);
        return ApiResponse.success(null, "Xoá công thức thành công");
    }
}
