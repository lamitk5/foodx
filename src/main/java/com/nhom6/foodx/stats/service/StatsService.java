package com.nhom6.foodx.stats.service;

import com.nhom6.foodx.auth.entity.User;
import com.nhom6.foodx.common.exception.BusinessException;
import com.nhom6.foodx.recipe.entity.Recipe;
import com.nhom6.foodx.recipe.repository.RecipeRepository;
import com.nhom6.foodx.stats.dto.StatsResponse;
import com.nhom6.foodx.stats.entity.CookHistory;
import com.nhom6.foodx.stats.repository.CookHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Thống kê nấu ăn (gộp từ dk-dn).
 */
@Service
@RequiredArgsConstructor
public class StatsService {

    private final CookHistoryRepository cookHistoryRepository;
    private final RecipeRepository recipeRepository;

    @Transactional
    public void recordCook(User user, Long recipeId) {
        if (recipeId == null) {
            throw new BusinessException(400, "Thiếu công thức");
        }
        recipeRepository.findById(recipeId)
                .orElseThrow(() -> new BusinessException(404, "Không tìm thấy công thức"));
        cookHistoryRepository.save(CookHistory.builder()
                .user(user)
                .recipeId(recipeId)
                .cookedAt(LocalDate.now())
                .build());
    }

    @Transactional(readOnly = true)
    public StatsResponse getStats(User user) {
        LocalDate today = LocalDate.now();
        long total = cookHistoryRepository.countByUser_Id(user.getId());
        long week = cookHistoryRepository.countByUser_IdAndCookedAtBetween(user.getId(), today.minusDays(6), today);
        long month = cookHistoryRepository.countByUser_IdAndCookedAtBetween(user.getId(), today.minusDays(29), today);

        List<CookHistory> history = cookHistoryRepository.findByUser_IdOrderByCookedAtDesc(user.getId());

        // Calo theo ngày (14 ngày gần nhất)
        Map<LocalDate, Long> kcalByDay = new LinkedHashMap<>();
        for (int i = 13; i >= 0; i--) {
            kcalByDay.put(today.minusDays(i), 0L);
        }
        for (CookHistory c : history) {
            if (c.getCookedAt() == null || !kcalByDay.containsKey(c.getCookedAt())) {
                continue;
            }
            Recipe r = recipeRepository.findById(c.getRecipeId()).orElse(null);
            int kcal = r != null && r.getKcal() != null ? r.getKcal() : 0;
            kcalByDay.put(c.getCookedAt(), kcalByDay.get(c.getCookedAt()) + kcal);
        }
        List<StatsResponse.KcalDay> byDay = new ArrayList<>();
        kcalByDay.forEach((d, k) -> byDay.add(new StatsResponse.KcalDay(d.toString(), k)));

        // Top món nấu nhiều nhất
        Map<Long, Long> counts = new LinkedHashMap<>();
        for (CookHistory c : history) {
            counts.merge(c.getRecipeId(), 1L, Long::sum);
        }
        List<StatsResponse.TopRecipe> top = counts.entrySet().stream()
                .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                .limit(5)
                .map(e -> {
                    Recipe r = recipeRepository.findById(e.getKey()).orElse(null);
                    return new StatsResponse.TopRecipe(e.getKey(),
                            r != null ? r.getTitle() : "Đã xoá",
                            e.getValue());
                })
                .toList();

        return new StatsResponse(total, week, month, byDay, top);
    }
}