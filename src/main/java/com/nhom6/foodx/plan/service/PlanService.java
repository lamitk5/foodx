package com.nhom6.foodx.plan.service;

import com.nhom6.foodx.auth.entity.User;
import com.nhom6.foodx.common.exception.BusinessException;
import com.nhom6.foodx.plan.dto.PlanEntryRequest;
import com.nhom6.foodx.plan.dto.PlanEntryResponse;
import com.nhom6.foodx.plan.entity.MealPlanEntry;
import com.nhom6.foodx.plan.repository.MealPlanEntryRepository;
import com.nhom6.foodx.recipe.entity.Recipe;
import com.nhom6.foodx.recipe.repository.RecipeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Kế hoạch bữa ăn theo tuần (gộp từ dk-dn).
 */
@Service
@RequiredArgsConstructor
public class PlanService {

    private final MealPlanEntryRepository planRepository;
    private final RecipeRepository recipeRepository;

    @Transactional(readOnly = true)
    public List<PlanEntryResponse> getRange(User user, LocalDate start, LocalDate end) {
        return planRepository.findByUser_IdAndPlanDateBetweenOrderByPlanDateAsc(user.getId(), start, end)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public PlanEntryResponse setSlot(User user, PlanEntryRequest request) {
        if (request.planDate() == null || request.slot() == null || request.recipeId() == null) {
            throw new BusinessException(400, "Thiếu thông tin kế hoạch");
        }
        if (!List.of("morning", "lunch", "dinner").contains(request.slot())) {
            throw new BusinessException(400, "Khung giờ không hợp lệ");
        }
        recipeRepository.findById(request.recipeId())
                .orElseThrow(() -> new BusinessException(404, "Không tìm thấy công thức"));

        MealPlanEntry entry = planRepository
                .findByUser_IdAndPlanDateAndSlot(user.getId(), request.planDate(), request.slot())
                .orElseGet(() -> MealPlanEntry.builder()
                        .user(user)
                        .planDate(request.planDate())
                        .slot(request.slot())
                        .build());
        entry.setRecipeId(request.recipeId());
        return toResponse(planRepository.save(entry));
    }

    @Transactional
    public void removeSlot(User user, LocalDate planDate, String slot) {
        planRepository.deleteByUser_IdAndPlanDateAndSlot(user.getId(), planDate, slot);
    }

    @Transactional
    public int autoFill(User user, LocalDate start, LocalDate end) {
        List<Recipe> recipes = recipeRepository.findAll();
        if (recipes.isEmpty()) {
            return 0;
        }
        int added = 0;
        LocalDate day = start;
        while (!day.isAfter(end)) {
            for (String slot : List.of("morning", "lunch", "dinner")) {
                if (planRepository.findByUser_IdAndPlanDateAndSlot(user.getId(), day, slot).isPresent()) {
                    continue;
                }
                List<Recipe> pool = recipes.stream()
                        .filter(r -> r.getMealSlots() == null || r.getMealSlots().contains(slot))
                        .toList();
                Recipe pick = pool.isEmpty() ? recipes.get((day.getDayOfYear() + slot.hashCode()) % recipes.size())
                        : pool.get((day.getDayOfYear() + slot.hashCode()) % pool.size());
                planRepository.save(MealPlanEntry.builder()
                        .user(user)
                        .planDate(day)
                        .slot(slot)
                        .recipeId(pick.getId())
                        .build());
                added++;
            }
            day = day.plusDays(1);
        }
        return added;
    }

    private PlanEntryResponse toResponse(MealPlanEntry entry) {
        Recipe recipe = recipeRepository.findById(entry.getRecipeId()).orElse(null);
        return new PlanEntryResponse(
                entry.getId(),
                entry.getPlanDate(),
                entry.getSlot(),
                entry.getRecipeId(),
                recipe != null ? recipe.getTitle() : "Đã xoá",
                recipe != null ? recipe.getKcal() : 0
        );
    }
}