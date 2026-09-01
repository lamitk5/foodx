package com.nhom6.foodx.ingredient.service;

import com.nhom6.foodx.common.exception.ResourceNotFoundException;
import com.nhom6.foodx.ingredient.dto.IngredientDto;
import com.nhom6.foodx.ingredient.entity.Ingredient;
import com.nhom6.foodx.ingredient.repository.IngredientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class IngredientService {

    private final IngredientRepository ingredientRepository;

    @Transactional(readOnly = true)
    public List<IngredientDto> search(String name, String category) {
        List<Ingredient> ingredients;
        if (name != null && !name.isBlank()) {
            ingredients = ingredientRepository.findByNameContainingIgnoreCase(name);
        } else if (category != null && !category.isBlank()) {
            ingredients = ingredientRepository.findByCategoryContainingIgnoreCase(category);
        } else {
            ingredients = ingredientRepository.findAll();
        }
        return ingredients.stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public IngredientDto getById(Long id) {
        return toDto(findEntity(id));
    }

    @Transactional
    public IngredientDto create(IngredientDto dto) {
        if (ingredientRepository.existsByNameIgnoreCase(dto.getName())) {
            throw new com.nhom6.foodx.common.exception.BusinessException(400,
                    "Nguyên liệu đã tồn tại: " + dto.getName());
        }
        Ingredient ingredient = Ingredient.builder()
                .name(dto.getName().trim())
                .defaultUnit(dto.getDefaultUnit())
                .category(dto.getCategory())
                .caloriesPerUnit(dto.getCaloriesPerUnit())
                .description(dto.getDescription())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        return toDto(ingredientRepository.save(ingredient));
    }

    @Transactional
    public IngredientDto update(Long id, IngredientDto dto) {
        Ingredient ingredient = findEntity(id);
        ingredient.setName(dto.getName().trim());
        ingredient.setDefaultUnit(dto.getDefaultUnit());
        ingredient.setCategory(dto.getCategory());
        ingredient.setCaloriesPerUnit(dto.getCaloriesPerUnit());
        ingredient.setDescription(dto.getDescription());
        ingredient.setUpdatedAt(LocalDateTime.now());
        return toDto(ingredientRepository.save(ingredient));
    }

    @Transactional
    public void delete(Long id) {
        Ingredient ingredient = findEntity(id);
        ingredientRepository.delete(ingredient);
    }

    private Ingredient findEntity(Long id) {
        return ingredientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nguyên liệu id=" + id));
    }

    private IngredientDto toDto(Ingredient ingredient) {
        return IngredientDto.builder()
                .id(ingredient.getId())
                .name(ingredient.getName())
                .defaultUnit(ingredient.getDefaultUnit())
                .category(ingredient.getCategory())
                .caloriesPerUnit(ingredient.getCaloriesPerUnit())
                .description(ingredient.getDescription())
                .build();
    }
}
