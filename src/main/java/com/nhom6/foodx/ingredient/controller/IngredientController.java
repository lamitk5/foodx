package com.nhom6.foodx.ingredient.controller;

import com.nhom6.foodx.common.response.ApiResponse;
import com.nhom6.foodx.ingredient.dto.IngredientDto;
import com.nhom6.foodx.ingredient.service.IngredientService;
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
@RequestMapping("/api/ingredients")
@RequiredArgsConstructor
public class IngredientController {

    private final IngredientService ingredientService;

    @GetMapping
    public ApiResponse<List<IngredientDto>> search(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String category) {
        return ApiResponse.success(ingredientService.search(name, category));
    }

    @GetMapping("/{id}")
    public ApiResponse<IngredientDto> getById(@PathVariable Long id) {
        return ApiResponse.success(ingredientService.getById(id));
    }

    @PostMapping
    public ApiResponse<IngredientDto> create(@Valid @RequestBody IngredientDto dto) {
        return ApiResponse.success(ingredientService.create(dto), "Tạo nguyên liệu thành công");
    }

    @PutMapping("/{id}")
    public ApiResponse<IngredientDto> update(@PathVariable Long id, @Valid @RequestBody IngredientDto dto) {
        return ApiResponse.success(ingredientService.update(id, dto), "Cập nhật nguyên liệu thành công");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        ingredientService.delete(id);
        return ApiResponse.success(null, "Xoá nguyên liệu thành công");
    }
}
