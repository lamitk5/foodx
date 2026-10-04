package com.nhom6.foodx.ingredient.service;

import com.nhom6.foodx.common.dto.IngredientRefDto;
import com.nhom6.foodx.common.exception.BusinessException;
import com.nhom6.foodx.common.exception.ResourceNotFoundException;
import com.nhom6.foodx.ingredient.dto.IngredientDto;
import com.nhom6.foodx.ingredient.entity.Ingredient;
import com.nhom6.foodx.ingredient.repository.IngredientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

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
            throw new BusinessException(400,
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
        String newName = dto.getName().trim();
        if (!ingredient.getName().equalsIgnoreCase(newName) && ingredientRepository.existsByNameIgnoreCase(newName)) {
            throw new BusinessException(400, "Nguyên liệu đã tồn tại: " + newName);
        }
        ingredient.setName(newName);
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

    // ------------------------------------------------------------------
    //  API nội bộ (/internal/ingredients) — trả DTO tham chiếu dùng chung
    // ------------------------------------------------------------------

    /** Tra nhiều nguyên liệu theo id: {@code GET /internal/ingredients?ids=1,2,3}. */
    @Transactional(readOnly = true)
    public List<IngredientRefDto> getRefs(Collection<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return List.of();
        }
        return ingredientRepository.findAllById(ids).stream().map(this::toRef).toList();
    }

    /** Tra một nguyên liệu theo id: {@code GET /internal/ingredients/{id}}. */
    @Transactional(readOnly = true)
    public Optional<IngredientRefDto> getRef(Long id) {
        if (id == null) {
            return Optional.empty();
        }
        return ingredientRepository.findById(id).map(this::toRef);
    }

    /**
     * Tra nhiều nguyên liệu theo tên (không phân biệt hoa/thường):
     * {@code GET /internal/ingredients/resolve?names=a,b}.
     */
    @Transactional(readOnly = true)
    public List<IngredientRefDto> resolveRefs(List<String> names) {
        if (names == null || names.isEmpty()) {
            return List.of();
        }
        List<String> cleaned = new ArrayList<>();
        for (String name : names) {
            if (name == null || name.isBlank()) {
                continue;
            }
            String lower = name.trim().toLowerCase(Locale.ROOT);
            if (!cleaned.contains(lower)) {
                cleaned.add(lower);
            }
        }
        if (cleaned.isEmpty()) {
            return List.of();
        }
        return ingredientRepository.findByLowerNameIn(cleaned).stream().map(this::toRef).toList();
    }

    /**
     * Đảm bảo nguyên liệu tồn tại: có rồi thì trả bản cũ, chưa có thì tạo mới
     * ({@code POST /internal/ingredients/ensure}).
     */
    @Transactional
    public IngredientRefDto ensure(String name, String category) {
        if (name == null || name.isBlank()) {
            throw new BusinessException(400, "Tên nguyên liệu không được để trống");
        }
        String cleanName = name.trim();
        return ingredientRepository.findByNameIgnoreCase(cleanName)
                .map(this::toRef)
                .orElseGet(() -> {
                    LocalDateTime now = LocalDateTime.now();
                    Ingredient created = ingredientRepository.save(Ingredient.builder()
                            .name(cleanName)
                            .category(category != null && !category.isBlank() ? category.trim() : null)
                            .createdAt(now)
                            .updatedAt(now)
                            .build());
                    return toRef(created);
                });
    }

    private IngredientRefDto toRef(Ingredient ingredient) {
        return new IngredientRefDto(
                ingredient.getId(),
                ingredient.getName(),
                ingredient.getDefaultUnit(),
                ingredient.getCategory(),
                ingredient.getCaloriesPerUnit());
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
