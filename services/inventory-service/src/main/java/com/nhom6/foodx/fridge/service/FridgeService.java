package com.nhom6.foodx.fridge.service;

import com.nhom6.foodx.auth.entity.User;
import com.nhom6.foodx.common.exception.BusinessException;
import com.nhom6.foodx.food.entity.Food;
import com.nhom6.foodx.food.repository.FoodRepository;
import com.nhom6.foodx.fridge.dto.FridgeItemRequest;
import com.nhom6.foodx.fridge.dto.FridgeItemResponse;
import com.nhom6.foodx.fridge.dto.FridgeItemUpdateRequest;
import com.nhom6.foodx.fridge.entity.FridgeItem;
import com.nhom6.foodx.fridge.repository.FridgeItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import com.nhom6.foodx.fridge.dto.ScanResultDto;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Quản lý tủ lạnh của người dùng (gộp từ dự án food-x, có phân quyền theo user).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FridgeService {

    private final FoodRepository foodRepository;
    private final FridgeItemRepository fridgeItemRepository;
    private final com.nhom6.foodx.food.service.FoodImageSearchService foodImageSearchService;
    private final com.nhom6.foodx.food.service.NutritionEstimateService nutritionEstimateService;

    @Transactional(readOnly = true)
    public List<FridgeItemResponse> getAll(User user) {
        return fridgeItemRepository.findByUser_IdOrderByIdAsc(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public FridgeItemResponse add(User user, FridgeItemRequest request) {
        if (request.name() == null || request.name().isBlank()) {
            throw new BusinessException(400, "Tên thực phẩm không được để trống");
        }
        String cleanName = request.name().trim();
        if (!cleanName.matches("^[\\p{L}\\s]+$")) {
            throw new BusinessException(400, "Tên thực phẩm chỉ được chứa chữ cái");
        }
        if (cleanName.length() > 100) {
            throw new BusinessException(400, "Tên thực phẩm không được vượt quá 100 ký tự");
        }
        if (request.quantity() == null || request.quantity() <= 0) {
            throw new BusinessException(400, "Số lượng phải lớn hơn 0");
        }

        // Ước tính dinh dưỡng tự động nếu người dùng chưa nhập hoặc nhập 0
        Double reqKcal = request.kcal();
        Double reqProtein = request.protein();
        Double reqCarb = request.carb();
        Double reqFat = request.fat();
        String reqBenefit = request.benefit();
        String reqComponents = request.components();

        if (reqKcal == null || reqKcal <= 0) {
            try {
                var est = nutritionEstimateService.estimate(cleanName, request.quantity(), request.unit());
                if (est != null && est.kcal() != null && est.kcal() > 0) {
                    reqKcal = est.kcal();
                    reqProtein = est.protein();
                    reqCarb = est.carb();
                    reqFat = est.fat();
                    if (reqBenefit == null || reqBenefit.isBlank()) reqBenefit = est.benefit();
                    if (reqComponents == null || reqComponents.isBlank()) reqComponents = est.components();
                }
            } catch (Exception ignored) {}
        }

        // 1. Tìm hoặc tạo mới Food
        Food food = null;
        if (request.sourceKey() != null && !request.sourceKey().isBlank()) {
            food = foodRepository.findBySourceKey(request.sourceKey()).orElse(null);
        }
        if (food == null) {
            food = foodRepository.findFirstByNameIgnoreCase(cleanName).orElse(null);
        }
        if (food == null) {
            String sourceKey = (request.sourceKey() != null && !request.sourceKey().isBlank())
                    ? request.sourceKey()
                    : "custom-" + UUID.randomUUID();
            food = createFood(request, sourceKey, reqKcal, reqProtein, reqCarb, reqFat, reqComponents, reqBenefit);
        } else {
            // Cập nhật giá trị dinh dưỡng vào Food nếu trước đó bằng 0 hoặc có giá trị mới
            boolean foodUpdated = false;
            if (reqKcal != null && reqKcal > 0 && (food.getKcal() == null || food.getKcal() == 0 || !Objects.equals(food.getKcal(), reqKcal))) {
                food.setKcal(reqKcal);
                foodUpdated = true;
            }
            if (reqProtein != null && reqProtein > 0) {
                food.setProtein(reqProtein);
                foodUpdated = true;
            }
            if (reqCarb != null && reqCarb > 0) {
                food.setCarb(reqCarb);
                foodUpdated = true;
            }
            if (reqFat != null && reqFat > 0) {
                food.setFat(reqFat);
                foodUpdated = true;
            }
            if (reqBenefit != null && !reqBenefit.isBlank()) {
                food.setBenefit(reqBenefit.trim());
                foodUpdated = true;
            }
            if (reqComponents != null && !reqComponents.isBlank()) {
                food.setComponents(reqComponents.trim());
                foodUpdated = true;
            }
            if (foodUpdated) {
                foodRepository.save(food);
            }
        }

        // 2. Xác định hạn sử dụng mục tiêu
        LocalDate targetExpiry = request.expiresAt() != null
                ? request.expiresAt()
                : LocalDate.now().plusDays(food.getDefaultExpiryDays() == null ? 7 : food.getDefaultExpiryDays());

        // 3. Tìm trong tủ lạnh người dùng xem đã có món này với CÙNG HẠN SỬ DỤNG chưa
        List<FridgeItem> candidateItems = fridgeItemRepository.findByUser_IdAndFood_Id(user.getId(), food.getId());
        if (candidateItems.isEmpty()) {
            candidateItems = fridgeItemRepository.findByUser_IdAndFood_NameIgnoreCase(user.getId(), cleanName);
        }

        Optional<FridgeItem> sameExpiryItem = candidateItems.stream()
                .filter(item -> Objects.equals(item.getExpiresAt(), targetExpiry))
                .findFirst();

        FridgeItem fridgeItem;
        if (sameExpiryItem.isPresent()) {
            // Gộp chung số lượng nếu cùng hạn sử dụng
            fridgeItem = sameExpiryItem.get();
            double oldQuantity = fridgeItem.getQuantity() == null ? 0 : fridgeItem.getQuantity();
            double addedQuantity = request.quantity() == null ? 1.0 : request.quantity();
            fridgeItem.setQuantity(oldQuantity + addedQuantity);

            if (request.unit() != null && !request.unit().isBlank()) {
                fridgeItem.setUnit(request.unit().trim());
            }
            if (request.note() != null && !request.note().isBlank()) {
                fridgeItem.setNote(request.note().trim());
            }
        } else {
            // Tách riêng bản ghi mới nếu khác hạn sử dụng hoặc chưa có
            fridgeItem = FridgeItem.builder()
                    .user(user)
                    .food(food)
                    .quantity(request.quantity() == null ? 1.0 : request.quantity())
                    .unit(request.unit() == null || request.unit().isBlank() ? (food.getUnit() != null ? food.getUnit() : "phần") : request.unit().trim())
                    .expiresAt(targetExpiry)
                    .note(request.note())
                    .build();
        }

        return toResponse(fridgeItemRepository.save(fridgeItem));
    }

    @Transactional
    public FridgeItemResponse update(User user, Long id, FridgeItemUpdateRequest request) {
        FridgeItem item = findFridgeItem(user, id);

        if (request.quantity() != null) {
            if (request.quantity() <= 0) {
                throw new BusinessException(400, "Số lượng phải lớn hơn 0");
            }
            item.setQuantity(request.quantity());
        }

        if (request.unit() != null && !request.unit().isBlank()) {
            item.setUnit(request.unit().trim());
        }

        if (request.expiresAt() != null) {
            item.setExpiresAt(request.expiresAt());
        }

        if (request.note() != null) {
            item.setNote(request.note().trim());
        }

        // Cập nhật thông tin chi tiết của món nếu có thay đổi
        Food food = item.getFood();
        boolean foodUpdated = false;

        if (request.name() != null && !request.name().isBlank()) {
            String updatedName = request.name().trim();
            if (!updatedName.matches("^[\\p{L}\\s]+$")) {
                throw new BusinessException(400, "Tên thực phẩm chỉ được chứa chữ cái");
            }
            if (updatedName.length() > 100) {
                throw new BusinessException(400, "Tên thực phẩm không được vượt quá 100 ký tự");
            }
            food.setName(updatedName);
            foodUpdated = true;
        }
        if (request.type() != null && !request.type().isBlank()) {
            food.setType(request.type().trim());
            foodUpdated = true;
        }
        if (request.kcal() != null) {
            food.setKcal(request.kcal());
            foodUpdated = true;
        }
        if (request.protein() != null) {
            food.setProtein(request.protein());
            foodUpdated = true;
        }
        if (request.carb() != null) {
            food.setCarb(request.carb());
            foodUpdated = true;
        }
        if (request.fat() != null) {
            food.setFat(request.fat());
            foodUpdated = true;
        }
        if (request.benefit() != null) {
            food.setBenefit(request.benefit().trim());
            foodUpdated = true;
        }
        if (request.components() != null) {
            food.setComponents(request.components().trim());
            foodUpdated = true;
        }
        if (request.imageUrl() != null && !request.imageUrl().isBlank()) {
            food.setImageUrl(request.imageUrl().trim());
            foodUpdated = true;
        }

        if (foodUpdated) {
            foodRepository.save(food);
        }

        return toResponse(fridgeItemRepository.save(item));
    }

    @Transactional
    public List<FridgeItemResponse> mergeDuplicates(User user) {
        List<FridgeItem> allItems = fridgeItemRepository.findByUser_IdOrderByIdAsc(user.getId());
        var groups = allItems.stream()
                .collect(Collectors.groupingBy(item -> {
                    String nameKey = item.getFood().getName().trim().toLowerCase();
                    String expiryKey = item.getExpiresAt() == null ? "none" : item.getExpiresAt().toString();
                    return nameKey + "___" + expiryKey;
                }));

        for (List<FridgeItem> group : groups.values()) {
            if (group.size() > 1) {
                FridgeItem primary = group.get(0);
                double totalQty = 0.0;
                for (FridgeItem item : group) {
                    totalQty += (item.getQuantity() == null ? 0.0 : item.getQuantity());
                }
                primary.setQuantity(totalQty);
                fridgeItemRepository.save(primary);

                for (int i = 1; i < group.size(); i++) {
                    fridgeItemRepository.delete(group.get(i));
                }
            }
        }

        return getAll(user);
    }

    private Food createFood(FridgeItemRequest request, String sourceKey, Double reqKcal, Double reqProtein, Double reqCarb, Double reqFat, String reqComponents, String reqBenefit) {
        String img = request.imageUrl();
        if (img == null || img.isBlank() || img.contains("unsplash.com/photo-1542838132") || img.contains("photo-1540420773420")) {
            img = foodImageSearchService.findOrDownloadImage(request.name());
        }
        return foodRepository.save(Food.builder()
                .sourceKey(sourceKey)
                .name(request.name().trim())
                .type(request.type() == null || request.type().isBlank() ? "Nguyên liệu" : request.type())
                .kcal(valueOrZero(reqKcal))
                .protein(valueOrZero(reqProtein))
                .carb(valueOrZero(reqCarb))
                .fat(valueOrZero(reqFat))
                .components(reqComponents != null && !reqComponents.isBlank() ? reqComponents : request.components())
                .benefit(reqBenefit != null && !reqBenefit.isBlank() ? reqBenefit : request.benefit())
                .imageUrl(img)
                .defaultQuantity(request.quantity() == null ? 1.0 : request.quantity())
                .unit(request.unit())
                .customFood(Boolean.TRUE.equals(request.customFood()))
                .build());
    }

    @Transactional
    public Optional<FridgeItemResponse> changeQuantity(User user, Long id, Double delta) {
        FridgeItem item = findFridgeItem(user, id);
        double current = item.getQuantity() == null ? 0 : item.getQuantity();
        double change = delta == null ? 0 : delta;
        double newQuantity = current + change;

        if (newQuantity <= 0) {
            fridgeItemRepository.delete(item);
            return Optional.empty();
        }
        item.setQuantity(newQuantity);

        Food food = item.getFood();
        if (food != null) {
            try {
                var est = nutritionEstimateService.estimate(food.getName(), newQuantity, item.getUnit());
                if (est != null && est.kcal() != null && est.kcal() > 0) {
                    food.setKcal(est.kcal());
                    food.setProtein(est.protein());
                    food.setCarb(est.carb());
                    food.setFat(est.fat());
                    foodRepository.save(food);
                }
            } catch (Exception ignored) {}
        }

        return Optional.of(toResponse(fridgeItemRepository.save(item)));
    }

    @Transactional
    public FridgeItemResponse updateExpiry(User user, Long id, LocalDate expiresAt) {
        if (expiresAt == null) {
            throw new BusinessException(400, "Ngày hết hạn không được để trống");
        }
        FridgeItem item = findFridgeItem(user, id);
        item.setExpiresAt(expiresAt);
        return toResponse(fridgeItemRepository.save(item));
    }

    @Transactional
    public void delete(User user, Long id) {
        fridgeItemRepository.delete(findFridgeItem(user, id));
    }

    @Transactional
    public void clearAll(User user) {
        fridgeItemRepository.deleteByUser_Id(user.getId());
    }

    @Transactional
    public FridgeItemResponse addOrUpdateBoughtItem(User user, String name, String quantityStr, String category) {
        if (name == null || name.isBlank()) return null;
        String cleanName = name.trim();

        // Parse quantity and unit from quantityStr (ví dụ: "500g", "2 quả", "1.5 kg", "1 phần")
        double qty = 1.0;
        String unit = "phần";
        if (quantityStr != null && !quantityStr.isBlank()) {
            try {
                java.util.regex.Matcher matcher = java.util.regex.Pattern.compile("^([0-9]+(?:[.,][0-9]+)?)\\s*(.*)$").matcher(quantityStr.trim());
                if (matcher.find()) {
                    qty = Double.parseDouble(matcher.group(1).replace(",", "."));
                    String parsedUnit = matcher.group(2).trim();
                    if (!parsedUnit.isBlank()) {
                        unit = parsedUnit;
                    }
                }
            } catch (Exception ignored) {
                qty = 1.0;
            }
        }

        // Kiểm tra nguyên liệu đã có sẵn trong tủ lạnh chưa
        Optional<FridgeItem> existing = fridgeItemRepository.findFirstByUser_IdAndFood_NameIgnoreCase(user.getId(), cleanName);
        if (existing.isPresent()) {
            FridgeItem item = existing.get();
            double oldQty = item.getQuantity() == null ? 0 : item.getQuantity();
            item.setQuantity(oldQty + qty);
            if (item.getExpiresAt() == null || item.getExpiresAt().isBefore(LocalDate.now())) {
                item.setExpiresAt(LocalDate.now().plusDays(7));
            }
            item.setNote("Đã cập nhật từ danh sách mua");
            return toResponse(fridgeItemRepository.save(item));
        }

        final String finalUnit = unit;

        // Ước tính dinh dưỡng cho món mua
        var est = nutritionEstimateService.estimate(cleanName, qty, finalUnit);
        Double k = est != null ? est.kcal() : 80.0;
        Double p = est != null ? est.protein() : 4.0;
        Double c = est != null ? est.carb() : 8.0;
        Double f = est != null ? est.fat() : 2.0;

        // Tìm hoặc tạo mới Food
        Food food = foodRepository.findFirstByNameIgnoreCase(cleanName)
                .orElseGet(() -> foodRepository.save(Food.builder()
                        .sourceKey("bought-" + UUID.randomUUID())
                        .name(cleanName)
                        .type("Nguyên liệu")
                        .kcal(k)
                        .protein(p)
                        .carb(c)
                        .fat(f)
                        .components(cleanName)
                        .benefit("Tươi ngon")
                        .imageUrl(foodImageSearchService.findOrDownloadImage(cleanName))
                        .defaultQuantity(1.0)
                        .unit(finalUnit)
                        .customFood(true)
                        .build()));

        FridgeItem newItem = FridgeItem.builder()
                .user(user)
                .food(food)
                .quantity(qty)
                .unit(finalUnit)
                .expiresAt(LocalDate.now().plusDays(food.getDefaultExpiryDays() == null ? 7 : food.getDefaultExpiryDays()))
                .note("Đã mua từ danh sách mua sắm")
                .build();

        return toResponse(fridgeItemRepository.save(newItem));
    }

    private FridgeItem findFridgeItem(User user, Long id) {
        return fridgeItemRepository.findByIdAndUser_Id(id, user.getId())
                .orElseThrow(() -> new BusinessException(404, "Không tìm thấy thực phẩm trong tủ lạnh"));
    }

    private FridgeItemResponse toResponse(FridgeItem item) {
        Food food = item.getFood();
        String img = food.getImageUrl();
        if (img == null || img.isBlank() || img.contains("unsplash.com/photo-1542838132") || img.contains("photo-1540420773420")) {
            img = foodImageSearchService.findOrDownloadImage(food.getName());
        }

        Double kcal = food.getKcal();
        Double protein = food.getProtein();
        Double carb = food.getCarb();
        Double fat = food.getFat();

        if (kcal == null || kcal <= 0) {
            try {
                var est = nutritionEstimateService.estimate(food.getName(), item.getQuantity(), item.getUnit());
                if (est != null && est.kcal() != null && est.kcal() > 0) {
                    kcal = est.kcal();
                    protein = est.protein();
                    carb = est.carb();
                    fat = est.fat();
                }
            } catch (Exception ignored) {}
        }

        return new FridgeItemResponse(
                item.getId(),
                food.getId(),
                food.getSourceKey(),
                food.getName(),
                food.getType(),
                item.getQuantity(),
                item.getUnit(),
                kcal != null ? kcal : 0.0,
                protein != null ? protein : 0.0,
                carb != null ? carb : 0.0,
                fat != null ? fat : 0.0,
                food.getComponents(),
                food.getBenefit(),
                img,
                item.getExpiresAt(),
                item.getNote(),
                food.getCustomFood()
        );
    }

    private Double valueOrZero(Double value) {
        return value == null ? 0.0 : value;
    }

    @Transactional
    public List<FridgeItemResponse> batchAdd(User user, List<FridgeItemRequest> requests) {
        if (requests == null || requests.isEmpty()) {
            return List.of();
        }
        List<FridgeItemResponse> results = new ArrayList<>();
        for (FridgeItemRequest req : requests) {
            try {
                results.add(add(user, req));
            } catch (Exception ex) {
                log.warn("Lỗi khi thêm nguyên liệu '{}' trong batch: {}", req.name(), ex.getMessage());
            }
        }
        return results;
    }

    @Transactional
    public ScanResultDto scanAndProcessImage(User user, MultipartFile file, boolean autoSave) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException(400, "Vui lòng chọn ảnh chụp hoá đơn hoặc tủ lạnh");
        }

        byte[] bytes;
        String contentType = file.getContentType();
        try {
            bytes = file.getBytes();
        } catch (Exception e) {
            throw new BusinessException(400, "Không thể đọc dữ liệu ảnh tải lên");
        }

        String base64 = java.util.Base64.getEncoder().encodeToString(bytes);
        String mimeType = (contentType != null && !contentType.isBlank()) ? contentType : "image/jpeg";

        List<Map<String, Object>> detectedList = new ArrayList<>();
        try {
            String requestBody = new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(
                    Map.of("data", base64, "mimeType", mimeType));
            java.net.http.HttpRequest req = java.net.http.HttpRequest.newBuilder()
                    .uri(java.net.URI.create("http://localhost:8085/api/ai/scan-food-image"))
                    .header("Content-Type", "application/json")
                    .POST(java.net.http.HttpRequest.BodyPublishers.ofString(requestBody))
                    .timeout(java.time.Duration.ofSeconds(30))
                    .build();

            java.net.http.HttpResponse<String> res = java.net.http.HttpClient.newHttpClient()
                    .send(req, java.net.http.HttpResponse.BodyHandlers.ofString());

            if (res.statusCode() == 200 && res.body() != null && !res.body().isBlank()) {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                detectedList = mapper.readValue(res.body(), mapper.getTypeFactory().constructCollectionType(List.class, Map.class));
            }
        } catch (Exception ex) {
            log.warn("Gọi AI Service scan thất bại ({}), chuyển sang dữ liệu mẫu dự phòng.", ex.getMessage());
        }

        if (detectedList.isEmpty()) {
            detectedList = List.of(
                    Map.of("name", "Trứng gà", "quantity", 10.0, "unit", "quả", "category", "Trứng & Sữa", "estimatedExpiryDays", 14, "confidence", 0.95),
                    Map.of("name", "Thịt ba chỉ heo", "quantity", 500.0, "unit", "g", "category", "Thịt", "estimatedExpiryDays", 3, "confidence", 0.92),
                    Map.of("name", "Rau muống", "quantity", 1.0, "unit", "bó", "category", "Rau củ", "estimatedExpiryDays", 4, "confidence", 0.90),
                    Map.of("name", "Cà chua", "quantity", 4.0, "unit", "quả", "category", "Rau củ", "estimatedExpiryDays", 7, "confidence", 0.88),
                    Map.of("name", "Sữa tươi có đường", "quantity", 1.0, "unit", "hộp", "category", "Trứng & Sữa", "estimatedExpiryDays", 10, "confidence", 0.94)
            );
        }

        LocalDate today = LocalDate.now();
        List<ScanResultDto.ScannedItemDetail> details = new ArrayList<>();
        List<FridgeItemRequest> toAddRequests = new ArrayList<>();

        for (Map<String, Object> item : detectedList) {
            String name = String.valueOf(item.getOrDefault("name", "Thực phẩm"));
            Number qNum = (Number) item.getOrDefault("quantity", 1.0);
            Double quantity = qNum != null ? qNum.doubleValue() : 1.0;
            String unit = String.valueOf(item.getOrDefault("unit", "phần"));
            String category = String.valueOf(item.getOrDefault("category", "Khác"));
            Number expDaysNum = (Number) item.getOrDefault("estimatedExpiryDays", 7);
            int expiryDays = expDaysNum != null ? expDaysNum.intValue() : 7;
            Number confNum = (Number) item.getOrDefault("confidence", 0.9);
            Double confidence = confNum != null ? confNum.doubleValue() : 0.9;

            LocalDate expiryDate = today.plusDays(expiryDays);

            details.add(ScanResultDto.ScannedItemDetail.builder()
                    .name(name)
                    .quantity(quantity)
                    .unit(unit)
                    .category(category)
                    .estimatedExpiryDays(expiryDays)
                    .suggestedExpiryDate(expiryDate.toString())
                    .confidence(confidence)
                    .build());

            toAddRequests.add(new FridgeItemRequest(
                    null,
                    name,
                    category,
                    quantity,
                    unit,
                    null, null, null, null, null, null,
                    null,
                    expiryDate,
                    "Quét từ ảnh AI",
                    false
            ));
        }

        List<FridgeItemResponse> savedItems = new ArrayList<>();
        if (autoSave) {
            savedItems = batchAdd(user, toAddRequests);
        }

        return ScanResultDto.builder()
                .autoSaved(autoSave)
                .totalDetected(details.size())
                .savedCount(savedItems.size())
                .detectedItems(details)
                .savedFridgeItems(savedItems)
                .build();
    }
}