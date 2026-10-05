package com.nhom6.foodx.plan.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nhom6.foodx.common.client.AiServiceClient;
import com.nhom6.foodx.common.client.InventoryServiceClient;
import com.nhom6.foodx.common.client.RecipeServiceClient;
import com.nhom6.foodx.common.dto.RecipeDraftDto;
import com.nhom6.foodx.common.dto.RecipeSummaryDto;
import com.nhom6.foodx.common.exception.BusinessException;
import com.nhom6.foodx.common.utils.StringUtils;
import com.nhom6.foodx.plan.dto.CustomSlotRequest;
import com.nhom6.foodx.plan.dto.EstimateDishRequest;
import com.nhom6.foodx.plan.dto.EstimateDishResponse;
import com.nhom6.foodx.plan.dto.PlanEntryRequest;
import com.nhom6.foodx.plan.dto.PlanEntryResponse;
import com.nhom6.foodx.plan.dto.PlanSummaryResponse;
import com.nhom6.foodx.plan.dto.SuggestSlotRequest;
import com.nhom6.foodx.plan.entity.MealPlanEntry;
import com.nhom6.foodx.plan.repository.MealPlanEntryRepository;
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
 * - Tích hợp AI (qua ai-service) lên thực đơn cá nhân hóa theo hồ sơ và tủ lạnh.
 * - Giao tiếp liên service TUÂN THỦ nguyên tắc microservice: chỉ gọi qua HTTP client dùng chung
 *   (RecipeServiceClient / InventoryServiceClient / UserServiceClient qua ProfileLookupService /
 *   AiServiceClient), KHÔNG truy cập bảng DB của service khác.
 * - Luôn trả về dữ liệu an toàn (không bao giờ null gây NPE ở controller/template).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PlanService {

    private final MealPlanEntryRepository planRepository;
    private final RecipeServiceClient recipeServiceClient;
    private final InventoryServiceClient inventoryServiceClient;
    private final ProfileLookupService profileLookupService;
    private final AiServiceClient aiServiceClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional(readOnly = true)
    public List<PlanEntryResponse> getRange(Long userId, LocalDate start, LocalDate end) {
        List<MealPlanEntry> entries = planRepository
                .findByUserIdAndPlanDateBetweenOrderByPlanDateAsc(userId, start, end);
        if (entries.isEmpty()) {
            return List.of();
        }
        Set<Long> recipeIds = entries.stream()
                .map(MealPlanEntry::getRecipeId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        Map<Long, RecipeSummaryDto> summaries = recipeServiceClient.getRecipes(recipeIds);
        Set<String> fridgeNames = fridgeFoodNames(userId);

        return entries.stream()
                .map(e -> toResponse(e, summaries.get(e.getRecipeId()), fridgeNames))
                .toList();
    }

    /** Tổng hợp tuần (goal + tổng calo) cho widget đo dinh dưỡng. */
    @Transactional(readOnly = true)
    public PlanSummaryResponse getSummary(Long userId, LocalDate start, LocalDate end) {
        List<MealPlanEntry> entries = planRepository
                .findByUserIdAndPlanDateBetweenOrderByPlanDateAsc(userId, start, end);
        Set<Long> recipeIds = entries.stream()
                .map(MealPlanEntry::getRecipeId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        Map<Long, RecipeSummaryDto> summaries = recipeServiceClient.getRecipes(recipeIds);
        int totalKcal = entries.stream()
                .mapToInt(e -> {
                    RecipeSummaryDto s = summaries.get(e.getRecipeId());
                    return s != null && s.kcal() != null ? s.kcal() : 0;
                })
                .sum();
        return new PlanSummaryResponse(
                start,
                end,
                profileLookupService.getDailyKcalGoal(userId),
                entries.size(),
                totalKcal
        );
    }

    @Transactional
    public PlanEntryResponse setSlot(Long userId, PlanEntryRequest request) {
        if (request.planDate() == null || request.slot() == null || request.recipeId() == null) {
            throw new BusinessException(400, "Thiếu thông tin kế hoạch");
        }
        if (!List.of("morning", "lunch", "dinner").contains(request.slot())) {
            throw new BusinessException(400, "Khung giờ không hợp lệ");
        }
        RecipeSummaryDto recipe = recipeServiceClient.getRecipe(request.recipeId()).orElse(null);
        if (recipe == null) {
            throw new BusinessException(404, "Không tìm thấy công thức");
        }

        MealPlanEntry entry = planRepository
                .findByUserIdAndPlanDateAndSlot(userId, request.planDate(), request.slot())
                .orElseGet(() -> MealPlanEntry.builder()
                        .userId(userId)
                        .planDate(request.planDate())
                        .slot(request.slot())
                        .build());
        entry.setRecipeId(request.recipeId());
        try {
            entry = planRepository.saveAndFlush(entry);
        } catch (org.springframework.dao.DataIntegrityViolationException ex) {
            entry = planRepository.findByUserIdAndPlanDateAndSlot(userId, request.planDate(), request.slot())
                    .orElse(entry);
            entry.setRecipeId(request.recipeId());
            entry = planRepository.save(entry);
        }
        return toResponse(entry, recipe, fridgeFoodNames(userId));
    }

    @Transactional
    public void removeSlot(Long userId, LocalDate planDate, String slot) {
        planRepository.deleteByUserIdAndPlanDateAndSlot(userId, planDate, slot);
    }

    /**
     * Dọn toàn bộ kế hoạch bữa ăn của một người dùng — phục vụ endpoint nội bộ
     * {@code DELETE /internal/users/{userId}/data} khi admin xoá tài khoản.
     *
     * @return số dòng {@code meal_plan_entries} đã xoá
     */
    @Transactional
    public int purgeUserData(Long userId) {
        if (userId == null) {
            return 0;
        }
        return (int) planRepository.deleteByUserId(userId);
    }

    @Transactional
    public int autoFill(Long userId, LocalDate start, LocalDate end) {
        // ai-service chết thì AiServiceClient trả Optional.empty() — tương đương generateText trả null
        // trước đây, nên luồng dự phòng thuật toán bên dưới vẫn chạy y như cũ.
        try {
            int aiResult = autoFillWithAi(userId, start, end);
            if (aiResult > 0) {
                log.info("AI đã lên thành công {} bữa ăn cho người dùng {}", aiResult, userId);
                return aiResult;
            }
        } catch (Exception ex) {
            log.warn("AI lên kế hoạch gặp lỗi ({}), tự động dùng thuật toán dự phòng thông minh.", ex.getMessage());
        }
        return autoFillWithSmartFallback(userId, start, end);
    }

    private int autoFillWithAi(Long userId, LocalDate start, LocalDate end) {
        String diet = profileLookupService.getDiet(userId);
        if (diet.isBlank()) diet = "Bình thường, cân bằng dinh dưỡng";
        String allergies = profileLookupService.getAllergies(userId);
        if (allergies.isBlank()) allergies = "Không có";
        String dislikes = profileLookupService.getDislikes(userId);
        if (dislikes.isBlank()) dislikes = "Không có";

        Set<String> fridgeNames = fridgeFoodNames(userId);
        String fridgeList = fridgeNames.stream().sorted().collect(Collectors.joining(", "));
        if (fridgeList.isBlank()) {
            fridgeList = "Trứng, thịt bò, thịt gà, rau củ, cà chua, bông cải xanh, gia vị";
        }

        String existingTitles = recipeServiceClient.getAllRecipes().stream()
                .map(RecipeSummaryDto::title)
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
                    "difficulty": "Dễ",
                    "ingredients": [
                      {"name": "Thịt bò", "quantity": 200, "unit": "g"},
                      {"name": "Hành lá", "quantity": 20, "unit": "g"}
                    ]
                  }
                ]
                Mỗi món phải có ít nhất 4 nguyên liệu thật, đúng với tên món, kèm số lượng và đơn vị.
                """, start, end, diet, allergies, dislikes, fridgeList, existingTitles);

        String rawJson = aiServiceClient.generate(prompt, "application/json").orElse(null);
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

            RecipeSummaryDto recipe = recipeServiceClient.ensureRecipe(new RecipeDraftDto(
                    item.getRecipeTitle().trim(),
                    item.getDescription(),
                    item.getInstructions(),
                    item.getKcal(),
                    item.getProtein(),
                    item.getCarb(),
                    item.getFat(),
                    item.getDifficulty(),
                    item.getSlot()
            )).orElse(null);
            if (recipe == null) {
                continue;
            }

            MealPlanEntry entry = planRepository.findByUserIdAndPlanDateAndSlot(userId, planDate, item.getSlot())
                    .orElseGet(() -> MealPlanEntry.builder()
                            .userId(userId)
                            .planDate(planDate)
                            .slot(item.getSlot())
                            .build());
            entry.setRecipeId(recipe.id());
            planRepository.save(entry);
            added++;
        }
        return added;
    }

    private int autoFillWithSmartFallback(Long userId, LocalDate start, LocalDate end) {
        List<RecipeSummaryDto> recipes = recipeServiceClient.getAllRecipes();
        if (recipes.isEmpty()) {
            return 0;
        }

        List<RecipeSummaryDto> morningPool = filterBySlot(recipes, "morning");
        List<RecipeSummaryDto> lunchPool = filterBySlot(recipes, "lunch");
        List<RecipeSummaryDto> dinnerPool = filterBySlot(recipes, "dinner");

        int added = 0;
        LocalDate day = start;
        int dayIndex = 0;

        while (!day.isAfter(end)) {
            Set<Long> usedTodayRecipeIds = new HashSet<>();

            RecipeSummaryDto morningRecipe = pickRecipeWithoutDuplicate(morningPool, dayIndex, usedTodayRecipeIds);
            saveSlotIfAbsent(userId, day, "morning", morningRecipe);
            if (morningRecipe != null) usedTodayRecipeIds.add(morningRecipe.id());

            RecipeSummaryDto lunchRecipe = pickRecipeWithoutDuplicate(lunchPool, dayIndex + 2, usedTodayRecipeIds);
            saveSlotIfAbsent(userId, day, "lunch", lunchRecipe);
            if (lunchRecipe != null) usedTodayRecipeIds.add(lunchRecipe.id());

            RecipeSummaryDto dinnerRecipe = pickRecipeWithoutDuplicate(dinnerPool, dayIndex + 5, usedTodayRecipeIds);
            saveSlotIfAbsent(userId, day, "dinner", dinnerRecipe);

            added += 3;
            day = day.plusDays(1);
            dayIndex++;
        }
        return added;
    }

    private List<RecipeSummaryDto> filterBySlot(List<RecipeSummaryDto> recipes, String slot) {
        List<RecipeSummaryDto> pool = recipes.stream()
                .filter(r -> r.mealSlots() != null && r.mealSlots().contains(slot))
                .toList();
        return pool.isEmpty() ? recipes : pool;
    }

    private RecipeSummaryDto pickRecipeWithoutDuplicate(List<RecipeSummaryDto> pool, int seed, Set<Long> usedIds) {
        if (pool.isEmpty()) return null;
        for (int i = 0; i < pool.size(); i++) {
            RecipeSummaryDto r = pool.get((Math.abs(seed) + i) % pool.size());
            if (!usedIds.contains(r.id())) {
                return r;
            }
        }
        return pool.get(Math.abs(seed) % pool.size());
    }

    @Transactional
    public PlanEntryResponse suggestSlot(Long userId, SuggestSlotRequest request) {
        if (request.planDate() == null || request.slot() == null) {
            throw new BusinessException(400, "Thiếu ngày hoặc bữa ăn cần gợi ý");
        }
        if (!List.of("morning", "lunch", "dinner").contains(request.slot())) {
            throw new BusinessException(400, "Khung giờ không hợp lệ");
        }

        List<MealPlanEntry> dayEntries = planRepository.findByUserIdAndPlanDateBetweenOrderByPlanDateAsc(
                userId, request.planDate(), request.planDate());
        String otherMealsToday = dayEntries.stream()
                .filter(e -> !e.getSlot().equals(request.slot()))
                .map(e -> {
                    RecipeSummaryDto r = recipeServiceClient.getRecipe(e.getRecipeId()).orElse(null);
                    return r != null ? r.title() : "";
                })
                .filter(s -> !s.isBlank())
                .collect(Collectors.joining(", "));

        String diet = profileLookupService.getDiet(userId);
        if (diet.isBlank()) diet = "Cân bằng dinh dưỡng";
        String allergies = profileLookupService.getAllergies(userId);
        if (allergies.isBlank()) allergies = "Không có";

        Set<String> fridgeNames = fridgeFoodNames(userId);
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
                  "difficulty": "Dễ",
                  "ingredients": [
                    {"name": "Ức gà", "quantity": 200, "unit": "g"},
                    {"name": "Rau xà lách", "quantity": 80, "unit": "g"}
                  ]
                }
                Món phải có ít nhất 4 nguyên liệu đúng với tên món.
                """, slotVi, request.planDate(), userPrompt, targetKcal, diet, allergies, otherMealsToday, fridgeList, targetKcal);

        RecipeSummaryDto recipe = null;
        try {
            String rawJson = aiServiceClient.generate(prompt, "application/json").orElse(null);
            if (rawJson != null && !rawJson.isBlank()) {
                String clean = cleanJson(rawJson);
                int f = clean.indexOf('{'), l = clean.lastIndexOf('}');
                if (f >= 0 && l > f) clean = clean.substring(f, l + 1);

                AiMealPlanItem item = objectMapper.readValue(clean, AiMealPlanItem.class);
                if (item != null && item.getRecipeTitle() != null && !item.getRecipeTitle().isBlank()) {
                    recipe = recipeServiceClient.ensureRecipe(new RecipeDraftDto(
                            item.getRecipeTitle().trim(),
                            item.getDescription(),
                            item.getInstructions(),
                            item.getKcal(),
                            item.getProtein(),
                            item.getCarb(),
                            item.getFat(),
                            item.getDifficulty(),
                            request.slot()
                    )).orElse(null);
                }
            }
        } catch (Exception e) {
            log.warn("Lỗi khi AI gợi ý món cho slot: {}", e.getMessage());
        }

        if (recipe == null) {
            List<RecipeSummaryDto> pool = filterBySlot(recipeServiceClient.getAllRecipes(), request.slot());
            if (!pool.isEmpty()) {
                recipe = pool.get(new Random().nextInt(pool.size()));
            }
        }

        if (recipe == null) {
            throw new BusinessException(500, "Không thể tạo gợi ý món ăn lúc này");
        }

        MealPlanEntry entry = planRepository.findByUserIdAndPlanDateAndSlot(userId, request.planDate(), request.slot())
                .orElseGet(() -> MealPlanEntry.builder()
                        .userId(userId)
                        .planDate(request.planDate())
                        .slot(request.slot())
                        .build());
        entry.setRecipeId(recipe.id());
        return toResponse(planRepository.save(entry), recipe, fridgeFoodNames(userId));
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
            String rawJson = aiServiceClient.generate(prompt, "application/json").orElse(null);
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
    public PlanEntryResponse setCustomSlot(Long userId, CustomSlotRequest request) {
        if (request.planDate() == null || request.slot() == null || request.title() == null || request.title().isBlank()) {
            throw new BusinessException(400, "Thiếu thông tin ngày, bữa ăn hoặc tên món");
        }

        String title = request.title().trim();
        int kcal = request.kcal() != null && request.kcal() > 0 ? request.kcal() : 450;
        double protein = request.protein() != null ? request.protein() : 20.0;
        double carb = request.carb() != null ? request.carb() : 50.0;
        double fat = request.fat() != null ? request.fat() : 12.0;

        RecipeSummaryDto recipe = recipeServiceClient.ensureRecipe(new RecipeDraftDto(
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
        )).orElse(null);

        if (recipe == null) {
            throw new BusinessException(500, "Không thể tạo món ăn lúc này");
        }

        MealPlanEntry entry = planRepository.findByUserIdAndPlanDateAndSlot(userId, request.planDate(), request.slot())
                .orElseGet(() -> MealPlanEntry.builder()
                        .userId(userId)
                        .planDate(request.planDate())
                        .slot(request.slot())
                        .build());
        entry.setRecipeId(recipe.id());
        return toResponse(planRepository.save(entry), recipe, fridgeFoodNames(userId));
    }

    private void saveSlotIfAbsent(Long userId, LocalDate day, String slot, RecipeSummaryDto recipe) {
        if (recipe == null) return;
        MealPlanEntry entry = planRepository.findByUserIdAndPlanDateAndSlot(userId, day, slot)
                .orElseGet(() -> MealPlanEntry.builder()
                        .userId(userId)
                        .planDate(day)
                        .slot(slot)
                        .build());
        entry.setRecipeId(recipe.id());
        planRepository.save(entry);
    }

    /** Tên thực phẩm trong tủ lạnh — nay hỏi inventory-service qua HTTP nội bộ. */
    private Set<String> fridgeFoodNames(Long userId) {
        if (userId == null) {
            return Set.of();
        }
        return new HashSet<>(inventoryServiceClient.getFridgeFoodNames(userId));
    }

    private PlanEntryResponse toResponse(MealPlanEntry entry, RecipeSummaryDto recipe, Set<String> fridgeNames) {
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
        private java.util.List<AiIngredient> ingredients;
    }

    @lombok.Data
    @lombok.NoArgsConstructor
    public static class AiIngredient {
        private String name;
        private Double quantity;
    }
}

