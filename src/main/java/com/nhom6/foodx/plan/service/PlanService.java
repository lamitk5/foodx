package com.nhom6.foodx.plan.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nhom6.foodx.ai.service.AiProviderService;
import com.nhom6.foodx.auth.entity.User;
import com.nhom6.foodx.common.exception.BusinessException;
import com.nhom6.foodx.common.utils.StringUtils;
import com.nhom6.foodx.fridge.facade.FridgeFacade;
import com.nhom6.foodx.plan.dto.CustomSlotRequest;
import com.nhom6.foodx.plan.dto.EstimateDishRequest;
import com.nhom6.foodx.plan.dto.EstimateDishResponse;
import com.nhom6.foodx.plan.dto.PlanEntryRequest;
import com.nhom6.foodx.plan.dto.PlanEntryResponse;
import com.nhom6.foodx.plan.dto.PlanSummaryResponse;
import com.nhom6.foodx.plan.dto.SuggestSlotRequest;
import com.nhom6.foodx.plan.entity.MealPlanEntry;
import com.nhom6.foodx.plan.repository.MealPlanEntryRepository;
import com.nhom6.foodx.profile.facade.ProfileFacade;
import com.nhom6.foodx.recipe.facade.RecipeCreateSpec;
import com.nhom6.foodx.recipe.facade.RecipeFacade;
import com.nhom6.foodx.recipe.facade.RecipeSummary;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Random;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Kế hoạch bữa ăn theo tuần thông minh:
 * - Tích hợp AI (Groq/Gemini) lên thực đơn cá nhân hóa theo hồ sơ và tủ lạnh.
 * - Giao tiếp liên module TUÂN THỦ nguyên tắc Modular Monolith: chỉ gọi qua
 *   RecipeFacade / FridgeFacade / ProfileFacade, KHÔNG gọi trực tiếp repository của module khác.
 * - Luôn trả về dữ liệu an toàn (không bao giờ null gây NPE ở controller/template).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PlanService {

    private final MealPlanEntryRepository planRepository;
    private final RecipeFacade recipeFacade;
    private final ProfileFacade profileFacade;
    private final FridgeFacade fridgeFacade;
    private final AiProviderService aiProviderService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional(readOnly = true)
    public List<PlanEntryResponse> getRange(User user, LocalDate start, LocalDate end) {
        List<MealPlanEntry> entries = planRepository
                .findByUser_IdAndPlanDateBetweenOrderByPlanDateAsc(user.getId(), start, end);
        if (entries.isEmpty()) {
            return List.of();
        }
        Set<Long> recipeIds = entries.stream()
                .map(MealPlanEntry::getRecipeId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        Map<Long, RecipeSummary> summaries = recipeFacade.getSummaries(recipeIds);
        Set<String> fridgeNames = fridgeFacade.getFoodNames(user.getId());

        return entries.stream()
                .map(e -> toResponse(e, summaries.get(e.getRecipeId()), fridgeNames))
                .toList();
    }

    /** Tổng hợp tuần (goal + tổng calo) cho widget đo dinh dưỡng. */
    @Transactional(readOnly = true)
    public PlanSummaryResponse getSummary(User user, LocalDate start, LocalDate end) {
        List<MealPlanEntry> entries = planRepository
                .findByUser_IdAndPlanDateBetweenOrderByPlanDateAsc(user.getId(), start, end);
        Set<Long> recipeIds = entries.stream()
                .map(MealPlanEntry::getRecipeId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        Map<Long, RecipeSummary> summaries = recipeFacade.getSummaries(recipeIds);
        int totalKcal = entries.stream()
                .mapToInt(e -> {
                    RecipeSummary s = summaries.get(e.getRecipeId());
                    return s != null && s.kcal() != null ? s.kcal() : 0;
                })
                .sum();
        return new PlanSummaryResponse(
                start,
                end,
                profileFacade.getDailyKcalGoal(user.getId()),
                entries.size(),
                totalKcal
        );
    }

    @Transactional
    public PlanEntryResponse setSlot(User user, PlanEntryRequest request) {
        if (request.planDate() == null || request.slot() == null || request.recipeId() == null) {
            throw new BusinessException(400, "Thiếu thông tin kế hoạch");
        }
        if (!List.of("morning", "lunch", "dinner").contains(request.slot())) {
            throw new BusinessException(400, "Khung giờ không hợp lệ");
        }
        RecipeSummary recipe = recipeFacade.getSummary(request.recipeId());
        if (recipe == null) {
            throw new BusinessException(404, "Không tìm thấy công thức");
        }

        MealPlanEntry entry = planRepository
                .findByUser_IdAndPlanDateAndSlot(user.getId(), request.planDate(), request.slot())
                .orElseGet(() -> MealPlanEntry.builder()
                        .user(user)
                        .planDate(request.planDate())
                        .slot(request.slot())
                        .build());
        entry.setRecipeId(request.recipeId());
        return toResponse(planRepository.save(entry), recipe, fridgeFacade.getFoodNames(user.getId()));
    }

    @Transactional
    public void removeSlot(User user, LocalDate planDate, String slot) {
        planRepository.deleteByUser_IdAndPlanDateAndSlot(user.getId(), planDate, slot);
    }

    @Transactional
    public int autoFill(User user, LocalDate start, LocalDate end) {
        if (!aiProviderService.isMockMode()) {
            try {
                int aiResult = autoFillWithAi(user, start, end);
                if (aiResult > 0) {
                    log.info("AI đã lên thành công {} bữa ăn cho người dùng {}", aiResult, user.getUsername());
                    return aiResult;
                }
            } catch (Exception ex) {
                log.warn("AI lên kế hoạch gặp lỗi ({}), tự động dùng thuật toán dự phòng thông minh.", ex.getMessage());
            }
        }
        return autoFillWithSmartFallback(user, start, end);
    }

    private int autoFillWithAi(User user, LocalDate start, LocalDate end) {
        Long userId = user.getId();
        String diet = profileFacade.getDiet(userId);
        if (diet.isBlank()) diet = "Bình thường, cân bằng dinh dưỡng";
        String allergies = profileFacade.getAllergies(userId);
        if (allergies.isBlank()) allergies = "Không có";
        String dislikes = profileFacade.getDislikes(userId);
        if (dislikes.isBlank()) dislikes = "Không có";

        Set<String> fridgeNames = fridgeFacade.getFoodNames(userId);
        String fridgeList = fridgeNames.stream().sorted().collect(Collectors.joining(", "));
        if (fridgeList.isBlank()) {
            fridgeList = "Trứng, thịt bò, thịt gà, rau củ, cà chua, bông cải xanh, gia vị";
        }

        String existingTitles = recipeFacade.getAllSummaries().stream()
                .map(RecipeSummary::title)
                .filter(Objects::nonNull)
                .limit(20)
                .collect(Collectors.joining(", "));

        String prompt = String.format("""
                Bạn là chuyên gia dinh dưỡng và bếp trưởng AI FoodX.
                Hãy lên kế hoạch thực đơn chi tiết cho người dùng từ ngày %s đến ngày %s (mỗi ngày đủ 3 bữa: morning, lunch, dinner).
                
                Hồ sơ người dùng:
                - Chế độ ăn: %s
                - Dị ứng cần tránh tuyệt đối: %s
                - Món ghét: %s
                - Nguyên liệu sẵn có trong tủ lạnh: %s
                - Món ăn có sẵn trong hệ thống: %s
                
                Yêu cầu:
                1. Đảm bảo calo khoa học: Bữa sáng 350-500 kcal, Bữa trưa 550-750 kcal, Bữa tối 450-650 kcal (Tổng 1.600 - 2.000 kcal/ngày).
                2. Tuyệt đối không lặp lại món trong cùng 1 ngày. Các ngày liền kề đổi mới món liên tục.
                3. Bạn có thể dùng món có sẵn HOẶC tự sáng tạo món ăn mới chuẩn vị Việt hoặc Healthy Eat Clean phù hợp với nguyên liệu trong tủ lạnh.
                4. Trả về DUY NHẤT một mảng JSON thuần túy (không kèm markdown ```json hay text giải thích), cấu trúc:
                [
                  {
                    "date": "YYYY-MM-DD",
                    "slot": "morning|lunch|dinner",
                    "recipeTitle": "Tên món ăn hấp dẫn",
                    "description": "Mô tả ngắn gọn hương vị và dinh dưỡng",
                    "instructions": "Bước 1: Sơ chế... Bước 2: Nấu... Bước 3: Hoàn thành",
                    "kcal": 450,
                    "protein": 30.0,
                    "carb": 50.0,
                    "fat": 14.0,
                    "difficulty": "Dễ"
                  }
                ]
                """, start, end, diet, allergies, dislikes, fridgeList, existingTitles);

        String rawJson = aiProviderService.generateText(prompt, "application/json");
        if (rawJson == null || rawJson.isBlank()) {
            return 0;
        }

        String cleanJson = cleanJson(rawJson);
        List<AiMealPlanItem> items;
        try {
            items = objectMapper.readValue(cleanJson, new TypeReference<List<AiMealPlanItem>>() {});
        } catch (Exception e) {
            log.warn("Không parse được JSON từ AI: {}", e.getMessage());
            return 0;
        }

        if (items == null || items.isEmpty()) {
            return 0;
        }

        int added = 0;
        for (AiMealPlanItem item : items) {
            if (item.getDate() == null || item.getSlot() == null || item.getRecipeTitle() == null) {
                continue;
            }
            LocalDate planDate;
            try {
                planDate = LocalDate.parse(item.getDate());
            } catch (Exception e) {
                continue;
            }
            if (planDate.isBefore(start) || planDate.isAfter(end)) {
                continue;
            }

            RecipeSummary recipe = recipeFacade.ensureRecipe(new RecipeCreateSpec(
                    item.getRecipeTitle().trim(),
                    item.getDescription(),
                    item.getInstructions(),
                    item.getKcal(),
                    item.getProtein(),
                    item.getCarb(),
                    item.getFat(),
                    item.getDifficulty(),
                    item.getSlot()
            ));
            if (recipe == null) {
                continue;
            }

            MealPlanEntry entry = planRepository.findByUser_IdAndPlanDateAndSlot(userId, planDate, item.getSlot())
                    .orElseGet(() -> MealPlanEntry.builder()
                            .user(user)
                            .planDate(planDate)
                            .slot(item.getSlot())
                            .build());
            entry.setRecipeId(recipe.id());
            planRepository.save(entry);
            added++;
        }
        return added;
    }

    private int autoFillWithSmartFallback(User user, LocalDate start, LocalDate end) {
        List<RecipeSummary> recipes = recipeFacade.getAllSummaries();
        if (recipes.isEmpty()) {
            return 0;
        }

        List<RecipeSummary> morningPool = filterBySlot(recipes, "morning");
        List<RecipeSummary> lunchPool = filterBySlot(recipes, "lunch");
        List<RecipeSummary> dinnerPool = filterBySlot(recipes, "dinner");

        int added = 0;
        LocalDate day = start;
        int dayIndex = 0;

        while (!day.isAfter(end)) {
            Set<Long> usedTodayRecipeIds = new HashSet<>();

            RecipeSummary morningRecipe = pickRecipeWithoutDuplicate(morningPool, dayIndex, usedTodayRecipeIds);
            saveSlotIfAbsent(user, day, "morning", morningRecipe);
            if (morningRecipe != null) usedTodayRecipeIds.add(morningRecipe.id());

            RecipeSummary lunchRecipe = pickRecipeWithoutDuplicate(lunchPool, dayIndex + 2, usedTodayRecipeIds);
            saveSlotIfAbsent(user, day, "lunch", lunchRecipe);
            if (lunchRecipe != null) usedTodayRecipeIds.add(lunchRecipe.id());

            RecipeSummary dinnerRecipe = pickRecipeWithoutDuplicate(dinnerPool, dayIndex + 5, usedTodayRecipeIds);
            saveSlotIfAbsent(user, day, "dinner", dinnerRecipe);

            added += 3;
            day = day.plusDays(1);
            dayIndex++;
        }
        return added;
    }

    private List<RecipeSummary> filterBySlot(List<RecipeSummary> recipes, String slot) {
        List<RecipeSummary> pool = recipes.stream()
                .filter(r -> r.mealSlots() != null && r.mealSlots().contains(slot))
                .toList();
        return pool.isEmpty() ? recipes : pool;
    }

    private RecipeSummary pickRecipeWithoutDuplicate(List<RecipeSummary> pool, int seed, Set<Long> usedIds) {
        if (pool.isEmpty()) return null;
        for (int i = 0; i < pool.size(); i++) {
            RecipeSummary r = pool.get((Math.abs(seed) + i) % pool.size());
            if (!usedIds.contains(r.id())) {
                return r;
            }
        }
        return pool.get(Math.abs(seed) % pool.size());
    }

    @Transactional
    public PlanEntryResponse suggestSlot(User user, SuggestSlotRequest request) {
        if (request.planDate() == null || request.slot() == null) {
            throw new BusinessException(400, "Thiếu ngày hoặc bữa ăn cần gợi ý");
        }
        if (!List.of("morning", "lunch", "dinner").contains(request.slot())) {
            throw new BusinessException(400, "Khung giờ không hợp lệ");
        }

        List<MealPlanEntry> dayEntries = planRepository.findByUser_IdAndPlanDateBetweenOrderByPlanDateAsc(
                user.getId(), request.planDate(), request.planDate());
        String otherMealsToday = dayEntries.stream()
                .filter(e -> !e.getSlot().equals(request.slot()))
                .map(e -> {
                    RecipeSummary r = recipeFacade.getSummary(e.getRecipeId());
                    return r != null ? r.title() : "";
                })
                .filter(s -> !s.isBlank())
                .collect(Collectors.joining(", "));

        Long userId = user.getId();
        String diet = profileFacade.getDiet(userId);
        if (diet.isBlank()) diet = "Cân bằng dinh dưỡng";
        String allergies = profileFacade.getAllergies(userId);
        if (allergies.isBlank()) allergies = "Không có";

        Set<String> fridgeNames = fridgeFacade.getFoodNames(userId);
        String fridgeList = fridgeNames.stream().sorted().collect(Collectors.joining(", "));

        String slotVi = switch (request.slot()) {
            case "morning" -> "Bữa Sáng (350-500 kcal)";
            case "lunch" -> "Bữa Trưa (550-750 kcal)";
            case "dinner" -> "Bữa Tối (450-650 kcal)";
            default -> "Bữa ăn";
        };

        String userPrompt = request.prompt() != null && !request.prompt().isBlank()
                ? request.prompt().trim()
                : "Món ngon, bổ dưỡng, chuẩn vị Việt hoặc Healthy";
        int targetKcal = request.targetKcal() != null && request.targetKcal() > 0
                ? request.targetKcal()
                : (request.slot().equals("morning") ? 420 : (request.slot().equals("lunch") ? 650 : 550));

        String prompt = String.format("""
                Bạn là chuyên gia dinh dưỡng và bếp trưởng AI FoodX.
                Hãy gợi ý DUY NHẤT 1 món ăn lý tưởng cho %s ngày %s.
                
                Yêu cầu của người dùng: %s
                Mục tiêu calo: khoảng %d kcal.
                Chế độ ăn: %s. Dị ứng cần tránh: %s.
                Các món khác đã có trong ngày hôm đó (tránh trùng lặp): %s.
                Nguyên liệu sẵn có trong tủ lạnh: %s.
                
                Trả về DUY NHẤT 1 object JSON thuần túy (không kèm markdown ```json hay giải thích):
                {
                  "recipeTitle": "Tên món ăn hấp dẫn",
                  "description": "Mô tả hương vị và điểm nổi bật",
                  "instructions": "Bước 1: Sơ chế... Bước 2: Nấu... Bước 3: Hoàn thành",
                  "kcal": %d,
                  "protein": 28.0,
                  "carb": 55.0,
                  "fat": 14.0,
                  "difficulty": "Dễ"
                }
                """, slotVi, request.planDate(), userPrompt, targetKcal, diet, allergies, otherMealsToday, fridgeList, targetKcal);

        RecipeSummary recipe = null;
        try {
            String rawJson = aiProviderService.generateText(prompt, "application/json");
            if (rawJson != null && !rawJson.isBlank()) {
                String clean = cleanJson(rawJson);
                int f = clean.indexOf('{'), l = clean.lastIndexOf('}');
                if (f >= 0 && l > f) clean = clean.substring(f, l + 1);

                AiMealPlanItem item = objectMapper.readValue(clean, AiMealPlanItem.class);
                if (item != null && item.getRecipeTitle() != null && !item.getRecipeTitle().isBlank()) {
                    recipe = recipeFacade.ensureRecipe(new RecipeCreateSpec(
                            item.getRecipeTitle().trim(),
                            item.getDescription(),
                            item.getInstructions(),
                            item.getKcal(),
                            item.getProtein(),
                            item.getCarb(),
                            item.getFat(),
                            item.getDifficulty(),
                            request.slot()
                    ));
                }
            }
        } catch (Exception e) {
            log.warn("Lỗi khi AI gợi ý món cho slot: {}", e.getMessage());
        }

        if (recipe == null) {
            List<RecipeSummary> pool = filterBySlot(recipeFacade.getAllSummaries(), request.slot());
            if (!pool.isEmpty()) {
                recipe = pool.get(new Random().nextInt(pool.size()));
            }
        }

        if (recipe == null) {
            throw new BusinessException(500, "Không thể tạo gợi ý món ăn lúc này");
        }

        MealPlanEntry entry = planRepository.findByUser_IdAndPlanDateAndSlot(userId, request.planDate(), request.slot())
                .orElseGet(() -> MealPlanEntry.builder()
                        .user(user)
                        .planDate(request.planDate())
                        .slot(request.slot())
                        .build());
        entry.setRecipeId(recipe.id());
        return toResponse(planRepository.save(entry), recipe, fridgeFacade.getFoodNames(userId));
    }

    public EstimateDishResponse estimateDish(EstimateDishRequest request) {
        if (request.dishName() == null || request.dishName().isBlank()) {
            throw new BusinessException(400, "Tên món ăn không được để trống");
        }
        String dish = request.dishName().trim();
        String prompt = String.format("""
                Hãy phân tích hàm lượng dinh dưỡng tiêu chuẩn cho 1 phần món ăn '%s' (phù hợp cho %s).
                Trả về DUY NHẤT 1 object JSON thuần túy (không kèm markdown):
                {
                  "dishName": "%s",
                  "kcal": 480,
                  "protein": 26.0,
                  "carb": 55.0,
                  "fat": 14.0,
                  "category": "Món nước",
                  "description": "Mô tả ngắn gọn đặc điểm dinh dưỡng và hương vị"
                }
                """, dish, request.slot() != null ? request.slot() : "bữa ăn chính", dish);

        try {
            String rawJson = aiProviderService.generateText(prompt, "application/json");
            if (rawJson != null && !rawJson.isBlank()) {
                String clean = cleanJson(rawJson);
                int f = clean.indexOf('{'), l = clean.lastIndexOf('}');
                if (f >= 0 && l > f) clean = clean.substring(f, l + 1);
                return objectMapper.readValue(clean, EstimateDishResponse.class);
            }
        } catch (Exception e) {
            log.warn("AI chấm calo thất bại ({}), dùng giá trị ước tính mặc định", e.getMessage());
        }

        return new EstimateDishResponse(dish, 450, 22.0, 50.0, 13.0, "Món chính", "Món ăn cân bằng dinh dưỡng");
    }

    @Transactional
    public PlanEntryResponse setCustomSlot(User user, CustomSlotRequest request) {
        if (request.planDate() == null || request.slot() == null || request.title() == null || request.title().isBlank()) {
            throw new BusinessException(400, "Thiếu thông tin ngày, bữa ăn hoặc tên món");
        }

        String title = request.title().trim();
        int kcal = request.kcal() != null && request.kcal() > 0 ? request.kcal() : 450;
        double protein = request.protein() != null ? request.protein() : 20.0;
        double carb = request.carb() != null ? request.carb() : 50.0;
        double fat = request.fat() != null ? request.fat() : 12.0;

        RecipeSummary recipe = recipeFacade.ensureRecipe(new RecipeCreateSpec(
                title,
                request.description() != null && !request.description().isBlank()
                        ? request.description() : "Món ăn do bạn thêm vào kế hoạch.",
                "Sơ chế nguyên liệu và nấu theo khẩu vị gia đình.",
                kcal,
                protein,
                carb,
                fat,
                "Dễ",
                request.slot()
        ));

        MealPlanEntry entry = planRepository.findByUser_IdAndPlanDateAndSlot(user.getId(), request.planDate(), request.slot())
                .orElseGet(() -> MealPlanEntry.builder()
                        .user(user)
                        .planDate(request.planDate())
                        .slot(request.slot())
                        .build());
        entry.setRecipeId(recipe.id());
        return toResponse(planRepository.save(entry), recipe, fridgeFacade.getFoodNames(user.getId()));
    }

    private void saveSlotIfAbsent(User user, LocalDate day, String slot, RecipeSummary recipe) {
        if (recipe == null) return;
        MealPlanEntry entry = planRepository.findByUser_IdAndPlanDateAndSlot(user.getId(), day, slot)
                .orElseGet(() -> MealPlanEntry.builder()
                        .user(user)
                        .planDate(day)
                        .slot(slot)
                        .build());
        entry.setRecipeId(recipe.id());
        planRepository.save(entry);
    }

    private PlanEntryResponse toResponse(MealPlanEntry entry, RecipeSummary recipe, Set<String> fridgeNames) {
        List<PlanEntryResponse.IngredientTag> tags = List.of();
        if (recipe != null && recipe.ingredientNames() != null) {
            tags = recipe.ingredientNames().stream()
                    .map(name -> new PlanEntryResponse.IngredientTag(name, isInFridge(name, fridgeNames)))
                    .toList();
        }
        return new PlanEntryResponse(
                entry.getId(),
                entry.getPlanDate(),
                entry.getSlot(),
                entry.getRecipeId(),
                recipe != null ? recipe.title() : "Đã xoá",
                recipe != null ? recipe.kcal() : 0,
                recipe != null ? recipe.imageUrl() : null,
                recipe != null ? recipe.cookTime() : null,
                recipe != null ? recipe.difficulty() : null,
                recipe != null ? recipe.protein() : null,
                recipe != null ? recipe.carb() : null,
                recipe != null ? recipe.fat() : null,
                tags
        );
    }

    /** So khớp không dấu, tiếng Việt: nguyên liệu có trong tủ hay không. */
    private boolean isInFridge(String ingredientName, Set<String> fridgeNames) {
        if (ingredientName == null || fridgeNames == null || fridgeNames.isEmpty()) {
            return false;
        }
        String key = StringUtils.searchable(ingredientName);
        if (key.length() < 3) {
            return false;
        }
        return fridgeNames.stream().anyMatch(f -> {
            String fk = StringUtils.searchable(f);
            return fk.length() >= 3 && (fk.contains(key) || key.contains(fk));
        });
    }

    /** Gỡ markdown ```json / ``` bao quanh chuỗi AI trả về. */
    private String cleanJson(String raw) {
        String clean = raw.trim();
        if (clean.startsWith("```json")) {
            clean = clean.substring(7);
        } else if (clean.startsWith("```")) {
            clean = clean.substring(3);
        }
        if (clean.endsWith("```")) {
            clean = clean.substring(0, clean.length() - 3);
        }
        return clean.trim();
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AiMealPlanItem {
        private String date;
        private String slot;
        private String recipeTitle;
        private String description;
        private String instructions;
        private Integer kcal;
        private Double protein;
        private Double carb;
        private Double fat;
        private String difficulty;
    }
}
