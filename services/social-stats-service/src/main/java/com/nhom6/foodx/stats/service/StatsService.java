package com.nhom6.foodx.stats.service;

import com.nhom6.foodx.common.client.InventoryServiceClient;
import com.nhom6.foodx.common.client.RecipeServiceClient;
import com.nhom6.foodx.common.dto.ConsumeItemDto;
import com.nhom6.foodx.common.dto.RecipeIngredientRefDto;
import com.nhom6.foodx.common.dto.RecipeSummaryDto;
import com.nhom6.foodx.common.exception.BusinessException;
import com.nhom6.foodx.stats.dto.StatsResponse;
import com.nhom6.foodx.stats.entity.CookHistory;
import com.nhom6.foodx.stats.repository.CookHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Thống kê nấu ăn + vòng tiêu thụ: khi người dùng nấu xong một món,
 * tự trừ nguyên liệu tương ứng trong tủ lạnh (theo khẩu phần đã nấu).
 *
 * <p>Service chỉ sở hữu bảng {@code cook_history}. Công thức lấy qua
 * {@link RecipeServiceClient}; việc trừ tủ lạnh (quy đổi đơn vị, khớp tên) do
 * inventory-service thực hiện qua {@link InventoryServiceClient}.</p>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class StatsService {

    private final CookHistoryRepository cookHistoryRepository;
    private final RecipeServiceClient recipeServiceClient;
    private final InventoryServiceClient inventoryServiceClient;

    @Transactional
    public void recordCook(Long userId, Long recipeId, Integer servings) {
        if (recipeId == null) {
            throw new BusinessException(400, "Thiếu công thức");
        }
        RecipeSummaryDto recipe = recipeServiceClient.getRecipe(recipeId)
                .orElseThrow(() -> new BusinessException(404, "Không tìm thấy công thức"));

        LocalDate today = LocalDate.now();
        // Chống ghi trùng do bấm đúp / gọi lại API
        if (cookHistoryRepository.existsByUserIdAndRecipeIdAndCookedAt(userId, recipeId, today)) {
            log.info("Món {} đã được ghi nhận hôm nay cho user {}, bỏ qua ghi trùng", recipeId, userId);
            return;
        }

        cookHistoryRepository.save(CookHistory.builder()
                .userId(userId)
                .recipeId(recipeId)
                .cookedAt(today)
                .build());

        // Vòng tiêu thụ: tính lượng nguyên liệu cần trừ theo số khẩu phần đã nấu
        // rồi gửi sang inventory-service (nơi sở hữu tủ lạnh + nghiệp vụ quy đổi đơn vị).
        List<ConsumeItemDto> consumeItems = buildConsumeItems(recipe, servings);
        int deducted = inventoryServiceClient.consumeFridgeItems(userId, consumeItems);
        if (deducted > 0) {
            log.info("Đã trừ {} loại nguyên liệu khỏi tủ lạnh của user {} sau khi nấu '{}'",
                    deducted, userId, recipe.title());
        }
    }

    /**
     * Quy đổi định lượng của công thức gốc theo số khẩu phần thực nấu.
     *
     * <p>Giữ đúng công thức scale cũ: {@code scale = servings / recipeServings}, kẹp trong
     * khoảng 0.05–20.0 (khẩu phần trống/không hợp lệ thì dùng hệ số 1.0). Nguyên liệu có
     * tên rỗng hoặc lượng <= 0 bị bỏ qua.</p>
     */
    private List<ConsumeItemDto> buildConsumeItems(RecipeSummaryDto recipe, Integer servings) {
        List<RecipeIngredientRefDto> ingredients = recipe.ingredients();
        if (ingredients == null || ingredients.isEmpty()) {
            return List.of();
        }
        int recipeServings = recipe.servings() != null && recipe.servings() > 0 ? recipe.servings() : 1;
        double scale = (servings == null || servings <= 0)
                ? 1.0
                : Math.max(0.05, Math.min(20.0, (double) servings / recipeServings));

        List<ConsumeItemDto> items = new ArrayList<>();
        for (RecipeIngredientRefDto ri : ingredients) {
            if (ri == null || ri.name() == null || ri.name().isBlank() || ri.quantity() == null) {
                continue;
            }
            double amount = ri.quantity() * scale;
            if (amount <= 0) {
                continue;
            }
            items.add(new ConsumeItemDto(ri.name(), amount, ri.unit()));
        }
        return items;
    }

    @Transactional(readOnly = true)
    public StatsResponse getStats(Long userId) {
        LocalDate today = LocalDate.now();
        long total = cookHistoryRepository.countByUserId(userId);
        long week = cookHistoryRepository.countByUserIdAndCookedAtBetween(userId, today.minusDays(6), today);
        long month = cookHistoryRepository.countByUserIdAndCookedAtBetween(userId, today.minusDays(29), today);

        List<CookHistory> history = cookHistoryRepository.findByUserIdOrderByCookedAtDesc(userId);

        // Nạp công thức một lần (tránh N+1)
        Set<Long> recipeIds = history.stream()
                .map(CookHistory::getRecipeId)
                .collect(Collectors.toSet());
        Map<Long, RecipeSummaryDto> recipeMap = recipeIds.isEmpty()
                ? Map.of()
                : recipeServiceClient.getRecipes(recipeIds);

        // Calo theo ngày (14 ngày gần nhất)
        Map<LocalDate, Long> kcalByDay = new LinkedHashMap<>();
        for (int i = 13; i >= 0; i--) {
            kcalByDay.put(today.minusDays(i), 0L);
        }
        Map<Long, Long> recipeCounts = new HashMap<>();
        Set<LocalDate> cookedDays = new HashSet<>();
        for (CookHistory c : history) {
            LocalDate day = c.getCookedAt();
            if (day != null) {
                cookedDays.add(day);
                if (kcalByDay.containsKey(day)) {
                    RecipeSummaryDto r = recipeMap.get(c.getRecipeId());
                    int kcal = r != null && r.kcal() != null ? r.kcal() : 0;
                    kcalByDay.put(day, kcalByDay.get(day) + kcal);
                }
            }
            recipeCounts.merge(c.getRecipeId(), 1L, Long::sum);
        }
        List<StatsResponse.KcalDay> byDay = kcalByDay.entrySet().stream()
                .map(e -> new StatsResponse.KcalDay(e.getKey().toString(), e.getValue()))
                .toList();

        // Top món nấu nhiều nhất
        List<StatsResponse.TopRecipe> top = recipeCounts.entrySet().stream()
                .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                .limit(5)
                .map(e -> {
                    RecipeSummaryDto r = recipeMap.get(e.getKey());
                    return new StatsResponse.TopRecipe(e.getKey(),
                            r != null ? r.title() : "Đã xoá",
                            e.getValue());
                })
                .toList();

        // Chuỗi ngày nấu liên tiếp (tính từ hôm nay hoặc hôm qua)
        long streak = computeStreak(cookedDays, today);

        return new StatsResponse(total, week, month, byDay, top, streak);
    }

    /** Số ngày liên tiếp có ít nhất 1 lần nấu (hôm nay chưa nấu thì tính từ hôm qua). */
    private long computeStreak(Set<LocalDate> cookedDays, LocalDate today) {
        LocalDate cursor = cookedDays.contains(today) ? today
                : (cookedDays.contains(today.minusDays(1)) ? today.minusDays(1) : null);
        if (cursor == null) {
            return 0;
        }
        long streak = 0;
        while (cookedDays.contains(cursor)) {
            streak++;
            cursor = cursor.minusDays(1);
        }
        return streak;
    }
}
