package com.nhom6.foodx.stats.service;

import com.nhom6.foodx.auth.entity.User;
import com.nhom6.foodx.common.exception.BusinessException;
import com.nhom6.foodx.fridge.entity.FridgeItem;
import com.nhom6.foodx.fridge.repository.FridgeItemRepository;
import com.nhom6.foodx.recipe.entity.Recipe;
import com.nhom6.foodx.recipe.entity.RecipeIngredient;
import com.nhom6.foodx.recipe.repository.RecipeRepository;
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
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class StatsService {

    private final CookHistoryRepository cookHistoryRepository;
    private final RecipeRepository recipeRepository;
    private final FridgeItemRepository fridgeItemRepository;

    /** Nhóm đơn vị khối lượng (quy về g). */
    private static final Map<String, Double> WEIGHT_UNITS = Map.of(
            "g", 1.0, "gr", 1.0, "gam", 1.0, "gram", 1.0,
            "kg", 1000.0, "kilogam", 1000.0, "ki-lo-gam", 1000.0);

    /** Nhóm đơn vị thể tích (quy về ml). */
    private static final Map<String, Double> VOLUME_UNITS = Map.of(
            "ml", 1.0, "l", 1000.0, "lit", 1000.0, "lít", 1000.0);

    @Transactional
    public void recordCook(User user, Long recipeId, Integer servings) {
        if (recipeId == null) {
            throw new BusinessException(400, "Thiếu công thức");
        }
        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new BusinessException(404, "Không tìm thấy công thức"));

        LocalDate today = LocalDate.now();
        // Chống ghi trùng do bấm đúp / gọi lại API
        if (cookHistoryRepository.existsByUser_IdAndRecipeIdAndCookedAt(user.getId(), recipeId, today)) {
            log.info("Món {} đã được ghi nhận hôm nay cho user {}, bỏ qua ghi trùng", recipeId, user.getUsername());
            return;
        }

        cookHistoryRepository.save(CookHistory.builder()
                .user(user)
                .recipeId(recipeId)
                .cookedAt(today)
                .build());

        // Vòng tiêu thụ: trừ nguyên liệu khỏi tủ lạnh theo số khẩu phần đã nấu
        int deducted = deductFridgeStock(user, recipe, servings);
        if (deducted > 0) {
            log.info("Đã trừ {} loại nguyên liệu khỏi tủ lạnh của user {} sau khi nấu '{}'",
                    deducted, user.getUsername(), recipe.getTitle());
        }
    }

    /**
     * Trừ số lượng nguyên liệu trong tủ lạnh theo công thức đã nấu.
     * Chỉ trừ khi tên & đơn vị tương thích (tránh trừ nhầm hàng tồn).
     */
    private int deductFridgeStock(User user, Recipe recipe, Integer servings) {
        if (recipe.getIngredients() == null || recipe.getIngredients().isEmpty()) {
            return 0;
        }
        int recipeServings = recipe.getServings() != null && recipe.getServings() > 0
                ? recipe.getServings() : 1;
        double scale = (servings == null || servings <= 0)
                ? 1.0
                : Math.max(0.05, Math.min(20.0, (double) servings / recipeServings));

        List<FridgeItem> fridge = fridgeItemRepository.findByUser_IdOrderByIdAsc(user.getId());
        if (fridge.isEmpty()) {
            return 0;
        }

        int deducted = 0;
        for (RecipeIngredient ri : recipe.getIngredients()) {
            if (ri.getIngredient() == null) {
                continue;
            }
            String target = normalizeKey(ri.getIngredient().getName());
            if (target.length() < 2) {
                continue;
            }
            // Tìm món trong tủ khớp tên (chuỗi con hai chiều, không nhạy dấu)
            FridgeItem matched = null;
            for (FridgeItem item : fridge) {
                if (item.getFood() == null || item.getFood().getName() == null) {
                    continue;
                }
                String key = normalizeKey(item.getFood().getName());
                if (key.length() < 2) {
                    continue;
                }
                if (key.equals(target) || key.contains(target) || target.contains(key)) {
                    matched = item;
                    break;
                }
            }
            if (matched == null) {
                continue;
            }

            double amount = ri.getQuantity() != null ? ri.getQuantity() * scale : 0;
            if (amount <= 0) {
                continue;
            }
            double remaining = subtractAmount(matched.getQuantity(), matched.getUnit(), amount, ri.getUnit());
            if (remaining == matched.getQuantity()) {
                continue; // đơn vị không tương thích — không trừ nhầm
            }
            if (remaining <= 0.001) {
                fridgeItemRepository.delete(matched);
                fridge.remove(matched);
                log.debug("Đã xoá '{}' khỏi tủ (dùng hết)", matched.getFood().getName());
            } else {
                matched.setQuantity(remaining);
                fridgeItemRepository.save(matched);
            }
            deducted++;
        }
        return deducted;
    }

    /** Trừ amount (đơn vị srcUnit) khỏi stock hiện tại (đơn vị stockUnit); không tương thích → trả về stock cũ. */
    private double subtractAmount(double stock, String stockUnit, double amount, String srcUnit) {
        String su = unitKey(stockUnit);
        String au = unitKey(srcUnit);
        if (su.isEmpty() || au.isEmpty()) {
            return stock;
        }
        if (su.equals(au)) {
            return stock - amount;
        }
        // Đổi qua đơn vị cơ sở cùng nhóm (g/gr/kg... hoặc ml/l...)
        Double suBase = weightOrVolumeBase(su);
        Double auBase = weightOrVolumeBase(au);
        if (suBase != null && auBase != null) {
            double amountInStockUnit = amount * auBase / suBase;
            return stock - amountInStockUnit;
        }
        return stock;
    }

    private Double weightOrVolumeBase(String unit) {
        Double w = WEIGHT_UNITS.get(unit);
        if (w != null) {
            return w;
        }
        return VOLUME_UNITS.get(unit);
    }

    private String unitKey(String unit) {
        return unit == null ? "" : unit.trim().toLowerCase();
    }

    /** Bỏ dấu tiếng Việt + lowercase để so khớp tên. */
    private String normalizeKey(String value) {
        if (value == null) {
            return "";
        }
        String v = value.trim().toLowerCase();
        String nfd = java.text.Normalizer.normalize(v, java.text.Normalizer.Form.NFD);
        return nfd.replaceAll("\\p{InCombiningDiacriticalMarks}+", "").replace("đ", "d");
    }

    @Transactional(readOnly = true)
    public StatsResponse getStats(User user) {
        LocalDate today = LocalDate.now();
        long total = cookHistoryRepository.countByUser_Id(user.getId());
        long week = cookHistoryRepository.countByUser_IdAndCookedAtBetween(user.getId(), today.minusDays(6), today);
        long month = cookHistoryRepository.countByUser_IdAndCookedAtBetween(user.getId(), today.minusDays(29), today);

        List<CookHistory> history = cookHistoryRepository.findByUser_IdOrderByCookedAtDesc(user.getId());

        // Nạp công thức một lần (tránh N+1)
        Set<Long> recipeIds = history.stream()
                .map(CookHistory::getRecipeId)
                .collect(Collectors.toSet());
        Map<Long, Recipe> recipeMap = recipeIds.isEmpty()
                ? Map.of()
                : recipeRepository.findAllById(recipeIds).stream()
                        .collect(Collectors.toMap(Recipe::getId, r -> r, (a, b) -> a));

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
                    Recipe r = recipeMap.get(c.getRecipeId());
                    int kcal = r != null && r.getKcal() != null ? r.getKcal() : 0;
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
                    Recipe r = recipeMap.get(e.getKey());
                    return new StatsResponse.TopRecipe(e.getKey(),
                            r != null ? r.getTitle() : "Đã xoá",
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
