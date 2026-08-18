package com.nhom6.foodx.plan.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nhom6.foodx.ai.service.AiProviderService;
import com.nhom6.foodx.auth.entity.User;
import com.nhom6.foodx.common.exception.BusinessException;
import com.nhom6.foodx.fridge.entity.FridgeItem;
import com.nhom6.foodx.fridge.repository.FridgeItemRepository;
import com.nhom6.foodx.plan.dto.CustomSlotRequest;
import com.nhom6.foodx.plan.dto.EstimateDishRequest;
import com.nhom6.foodx.plan.dto.EstimateDishResponse;
import com.nhom6.foodx.plan.dto.PlanEntryRequest;
import com.nhom6.foodx.plan.dto.PlanEntryResponse;
import com.nhom6.foodx.plan.dto.SuggestSlotRequest;
import com.nhom6.foodx.plan.entity.MealPlanEntry;
import com.nhom6.foodx.plan.repository.MealPlanEntryRepository;
import com.nhom6.foodx.profile.entity.UserProfile;
import com.nhom6.foodx.profile.repository.UserProfileRepository;
import com.nhom6.foodx.recipe.entity.Recipe;
import com.nhom6.foodx.recipe.repository.RecipeRepository;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Kế hoạch bữa ăn theo tuần thông minh:
 * - Tích hợp AI (Groq/Gemini) lên thực đơn cá nhân hóa theo hồ sơ và tủ lạnh.
 * - Tự động lưu các món mới do AI sáng tạo vào bảng recipes để mọi người dùng tái sử dụng.
 * - Thuật toán chống trùng lặp món ăn trong ngày và cân bằng calo khoa học (1.600 - 2.000 kcal/ngày).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PlanService {

    private final MealPlanEntryRepository planRepository;
    private final RecipeRepository recipeRepository;
    private final UserProfileRepository userProfileRepository;
    private final FridgeItemRepository fridgeItemRepository;
    private final AiProviderService aiProviderService;
    private final ObjectMapper objectMapper = new ObjectMapper();

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
        // 1. Thử dùng AI (Groq / Gemini) sinh thực đơn thông minh & lưu món mới
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

        // 2. Thuật toán dự phòng thông minh (Anti-duplicate & Calorie Balance)
        return autoFillWithSmartFallback(user, start, end);
    }

    /**
     * Dùng AI Groq/Gemini để lên thực đơn 7 ngày, tự động lưu món mới vào MySQL nếu chưa có.
     */
    private int autoFillWithAi(User user, LocalDate start, LocalDate end) {
        Optional<UserProfile> profileOpt = userProfileRepository.findByUser_Id(user.getId());
        String diet = profileOpt.map(UserProfile::getDiet).filter(s -> !s.isBlank()).orElse("Bình thường, cân bằng dinh dưỡng");
        String allergies = profileOpt.map(UserProfile::getAllergies).filter(s -> !s.isBlank()).orElse("Không có");
        String dislikes = profileOpt.map(UserProfile::getDislikes).filter(s -> !s.isBlank()).orElse("Không có");

        List<FridgeItem> fridgeItems = fridgeItemRepository.findByUser_IdOrderByIdAsc(user.getId());
        String fridgeList = fridgeItems.stream()
                .map(i -> i.getFood() != null ? i.getFood().getName() : "")
                .filter(s -> !s.isBlank())
                .distinct()
                .collect(Collectors.joining(", "));
        if (fridgeList.isBlank()) {
            fridgeList = "Trứng, thịt bò, thịt gà, rau củ, cà chua, bông cải xanh, gia vị";
        }

        List<Recipe> existingRecipes = recipeRepository.findAll();
        String existingTitles = existingRecipes.stream()
                .map(Recipe::getTitle)
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

        // Làm sạch chuỗi JSON nếu có bao quanh bởi markdown block
        String cleanJson = rawJson.trim();
        if (cleanJson.startsWith("```json")) {
            cleanJson = cleanJson.substring(7);
        } else if (cleanJson.startsWith("```")) {
            cleanJson = cleanJson.substring(3);
        }
        if (cleanJson.endsWith("```")) {
            cleanJson = cleanJson.substring(0, cleanJson.length() - 3);
        }
        cleanJson = cleanJson.trim();

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

            // 1) Tìm xem món này đã có trong database chưa
            Recipe recipe = recipeRepository.findFirstByTitleIgnoreCase(item.getRecipeTitle().trim())
                    .orElse(null);

            // 2) Nếu là món mới do AI sáng tạo -> Tự động lưu vào bảng recipes của MySQL!
            if (recipe == null) {
                Recipe newRecipe = Recipe.builder()
                        .title(item.getRecipeTitle().trim())
                        .description(item.getDescription() != null ? item.getDescription() : "Món ăn thơm ngon do AI FoodX thiết kế riêng.")
                        .instructions(item.getInstructions() != null ? item.getInstructions() : "Sơ chế nguyên liệu sạch sẽ, nấu chín vừa tới và thưởng thức nóng.")
                        .prepTime(10)
                        .cookTime(20)
                        .servings(1)
                        .cuisine("Việt Nam")
                        .category("Món chính")
                        .kcal(item.getKcal() != null ? item.getKcal() : 450)
                        .protein(item.getProtein() != null ? item.getProtein() : 25.0)
                        .carb(item.getCarb() != null ? item.getCarb() : 50.0)
                        .fat(item.getFat() != null ? item.getFat() : 14.0)
                        .difficulty(item.getDifficulty() != null ? item.getDifficulty() : "Dễ")
                        .mealSlots(item.getSlot())
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build();
                recipe = recipeRepository.save(newRecipe);
                log.info("AI đã tự động lưu món mới '{}' ({} kcal) vào bảng recipes", recipe.getTitle(), recipe.getKcal());
            }

            // 3) Gán vào kế hoạch bữa ăn của user
            MealPlanEntry entry = planRepository.findByUser_IdAndPlanDateAndSlot(user.getId(), planDate, item.getSlot())
                    .orElseGet(() -> MealPlanEntry.builder()
                            .user(user)
                            .planDate(planDate)
                            .slot(item.getSlot())
                            .build());
            entry.setRecipeId(recipe.getId());
            planRepository.save(entry);
            added++;
        }

        return added;
    }

    /**
     * Thuật toán dự phòng thông minh khi không có kết nối AI:
     * - Phân loại món sáng, trưa, tối rõ ràng.
     * - Chống lặp món trong ngày và xoay vòng liên tục giữa các ngày.
     */
    private int autoFillWithSmartFallback(User user, LocalDate start, LocalDate end) {
        List<Recipe> recipes = recipeRepository.findAll();
        if (recipes.isEmpty()) {
            return 0;
        }

        List<Recipe> morningPool = recipes.stream()
                .filter(r -> r.getMealSlots() != null && r.getMealSlots().contains("morning"))
                .toList();
        if (morningPool.isEmpty()) morningPool = recipes;

        List<Recipe> lunchPool = recipes.stream()
                .filter(r -> r.getMealSlots() != null && r.getMealSlots().contains("lunch"))
                .toList();
        if (lunchPool.isEmpty()) lunchPool = recipes;

        List<Recipe> dinnerPool = recipes.stream()
                .filter(r -> r.getMealSlots() != null && r.getMealSlots().contains("dinner"))
                .toList();
        if (dinnerPool.isEmpty()) dinnerPool = recipes;

        int added = 0;
        LocalDate day = start;
        int dayIndex = 0;

        while (!day.isAfter(end)) {
            Set<Long> usedTodayRecipeIds = new HashSet<>();

            // 1. Sáng
            Recipe morningRecipe = pickRecipeWithoutDuplicate(morningPool, dayIndex, usedTodayRecipeIds);
            saveSlotIfAbsent(user, day, "morning", morningRecipe);
            if (morningRecipe != null) usedTodayRecipeIds.add(morningRecipe.getId());

            // 2. Trưa
            Recipe lunchRecipe = pickRecipeWithoutDuplicate(lunchPool, dayIndex + 2, usedTodayRecipeIds);
            saveSlotIfAbsent(user, day, "lunch", lunchRecipe);
            if (lunchRecipe != null) usedTodayRecipeIds.add(lunchRecipe.getId());

            // 3. Tối
            Recipe dinnerRecipe = pickRecipeWithoutDuplicate(dinnerPool, dayIndex + 5, usedTodayRecipeIds);
            saveSlotIfAbsent(user, day, "dinner", dinnerRecipe);

            added += 3;
            day = day.plusDays(1);
            dayIndex++;
        }
        return added;
    }

    private Recipe pickRecipeWithoutDuplicate(List<Recipe> pool, int seed, Set<Long> usedIds) {
        if (pool.isEmpty()) return null;
        for (int i = 0; i < pool.size(); i++) {
            Recipe r = pool.get((Math.abs(seed) + i) % pool.size());
            if (!usedIds.contains(r.getId())) {
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

        // Lấy các món khác trong ngày để tránh trùng lặp
        List<MealPlanEntry> dayEntries = planRepository.findByUser_IdAndPlanDateBetweenOrderByPlanDateAsc(
                user.getId(), request.planDate(), request.planDate());
        String otherMealsToday = dayEntries.stream()
                .filter(e -> !e.getSlot().equals(request.slot()))
                .map(e -> {
                    Recipe r = recipeRepository.findById(e.getRecipeId()).orElse(null);
                    return r != null ? r.getTitle() : "";
                })
                .filter(s -> !s.isBlank())
                .collect(Collectors.joining(", "));

        Optional<UserProfile> profileOpt = userProfileRepository.findByUser_Id(user.getId());
        String diet = profileOpt.map(UserProfile::getDiet).filter(s -> !s.isBlank()).orElse("Cân bằng dinh dưỡng");
        String allergies = profileOpt.map(UserProfile::getAllergies).filter(s -> !s.isBlank()).orElse("Không có");

        List<FridgeItem> fridgeItems = fridgeItemRepository.findByUser_IdOrderByIdAsc(user.getId());
        String fridgeList = fridgeItems.stream()
                .map(i -> i.getFood() != null ? i.getFood().getName() : "")
                .filter(s -> !s.isBlank())
                .distinct()
                .collect(Collectors.joining(", "));

        String slotVi = switch (request.slot()) {
            case "morning" -> "Bữa Sáng (350-500 kcal)";
            case "lunch" -> "Bữa Trưa (550-750 kcal)";
            case "dinner" -> "Bữa Tối (450-650 kcal)";
            default -> "Bữa ăn";
        };

        String userPrompt = request.prompt() != null && !request.prompt().isBlank() ? request.prompt().trim() : "Món ngon, bổ dưỡng, chuẩn vị Việt hoặc Healthy";
        int targetKcal = request.targetKcal() != null && request.targetKcal() > 0 ? request.targetKcal() :
                (request.slot().equals("morning") ? 420 : (request.slot().equals("lunch") ? 650 : 550));

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

        Recipe recipe = null;
        try {
            String rawJson = aiProviderService.generateText(prompt, "application/json");
            if (rawJson != null && !rawJson.isBlank()) {
                String clean = rawJson.trim();
                if (clean.startsWith("```json")) clean = clean.substring(7);
                else if (clean.startsWith("```")) clean = clean.substring(3);
                if (clean.endsWith("```")) clean = clean.substring(0, clean.length() - 3);
                clean = clean.trim();
                int f = clean.indexOf('{'), l = clean.lastIndexOf('}');
                if (f >= 0 && l > f) clean = clean.substring(f, l + 1);

                AiMealPlanItem item = objectMapper.readValue(clean, AiMealPlanItem.class);
                if (item != null && item.getRecipeTitle() != null && !item.getRecipeTitle().isBlank()) {
                    recipe = recipeRepository.findFirstByTitleIgnoreCase(item.getRecipeTitle().trim()).orElse(null);
                    if (recipe == null) {
                        recipe = recipeRepository.save(Recipe.builder()
                                .title(item.getRecipeTitle().trim())
                                .description(item.getDescription() != null ? item.getDescription() : "Món ăn do AI gợi ý cá nhân hóa.")
                                .instructions(item.getInstructions() != null ? item.getInstructions() : "Thực hiện theo các bước chuẩn vị.")
                                .prepTime(15)
                                .cookTime(25)
                                .servings(1)
                                .cuisine("Việt Nam")
                                .category("Món chính")
                                .kcal(item.getKcal() != null ? item.getKcal() : targetKcal)
                                .protein(item.getProtein() != null ? item.getProtein() : 25.0)
                                .carb(item.getCarb() != null ? item.getCarb() : 50.0)
                                .fat(item.getFat() != null ? item.getFat() : 14.0)
                                .difficulty(item.getDifficulty() != null ? item.getDifficulty() : "Dễ")
                                .mealSlots(request.slot())
                                .createdAt(LocalDateTime.now())
                                .updatedAt(LocalDateTime.now())
                                .build());
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Lỗi khi AI gợi ý món cho slot: {}", e.getMessage());
        }

        // Fallback: Lấy món có sẵn trong kho nếu AI lỗi
        if (recipe == null) {
            List<Recipe> pool = recipeRepository.findAll().stream()
                    .filter(r -> r.getMealSlots() != null && r.getMealSlots().contains(request.slot()))
                    .toList();
            if (pool.isEmpty()) pool = recipeRepository.findAll();
            if (!pool.isEmpty()) {
                recipe = pool.get(new Random().nextInt(pool.size()));
            }
        }

        if (recipe == null) {
            throw new BusinessException(500, "Không thể tạo gợi ý món ăn lúc này");
        }

        MealPlanEntry entry = planRepository.findByUser_IdAndPlanDateAndSlot(user.getId(), request.planDate(), request.slot())
                .orElseGet(() -> MealPlanEntry.builder()
                        .user(user)
                        .planDate(request.planDate())
                        .slot(request.slot())
                        .build());
        entry.setRecipeId(recipe.getId());
        return toResponse(planRepository.save(entry));
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
                String clean = rawJson.trim();
                if (clean.startsWith("```json")) clean = clean.substring(7);
                else if (clean.startsWith("```")) clean = clean.substring(3);
                if (clean.endsWith("```")) clean = clean.substring(0, clean.length() - 3);
                clean = clean.trim();
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

        Recipe recipe = recipeRepository.findFirstByTitleIgnoreCase(title).orElse(null);
        if (recipe == null) {
            recipe = recipeRepository.save(Recipe.builder()
                    .title(title)
                    .description(request.description() != null && !request.description().isBlank() ? request.description() : "Món ăn do bạn thêm vào kế hoạch.")
                    .instructions("Sơ chế nguyên liệu và nấu theo khẩu vị gia đình.")
                    .prepTime(15)
                    .cookTime(25)
                    .servings(1)
                    .cuisine("Việt Nam")
                    .category("Món chính")
                    .kcal(kcal)
                    .protein(protein)
                    .carb(carb)
                    .fat(fat)
                    .difficulty("Dễ")
                    .mealSlots(request.slot())
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build());
        }

        MealPlanEntry entry = planRepository.findByUser_IdAndPlanDateAndSlot(user.getId(), request.planDate(), request.slot())
                .orElseGet(() -> MealPlanEntry.builder()
                        .user(user)
                        .planDate(request.planDate())
                        .slot(request.slot())
                        .build());
        entry.setRecipeId(recipe.getId());
        return toResponse(planRepository.save(entry));
    }

    private void saveSlotIfAbsent(User user, LocalDate day, String slot, Recipe recipe) {
        if (recipe == null) return;
        MealPlanEntry entry = planRepository.findByUser_IdAndPlanDateAndSlot(user.getId(), day, slot)
                .orElseGet(() -> MealPlanEntry.builder()
                        .user(user)
                        .planDate(day)
                        .slot(slot)
                        .build());
        entry.setRecipeId(recipe.getId());
        planRepository.save(entry);
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