package com.nhom6.foodx.fridge.controller;

import com.nhom6.foodx.ai.service.AiContextService;
import com.nhom6.foodx.auth.entity.User;
import com.nhom6.foodx.common.response.ApiResponse;
import com.nhom6.foodx.fridge.dto.ExpiryRequest;
import com.nhom6.foodx.fridge.dto.FridgeItemRequest;
import com.nhom6.foodx.fridge.dto.FridgeItemResponse;
import com.nhom6.foodx.fridge.service.FridgeService;
import com.nhom6.foodx.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * API tủ lạnh (gộp từ dự án food-x, yêu cầu đăng nhập JWT).
 */
@RestController
@RequestMapping("/api/fridge")
@RequiredArgsConstructor
public class FridgeController {

    private final FridgeService fridgeService;
    private final SecurityUtils securityUtils;
    private final com.nhom6.foodx.food.service.FoodImageSearchService foodImageSearchService;
    private final com.nhom6.foodx.food.service.NutritionEstimateService nutritionEstimateService;
    private final AiContextService aiContextService;

    @GetMapping
    public ApiResponse<List<FridgeItemResponse>> getAll() {
        return ApiResponse.success(fridgeService.getAll(securityUtils.getCurrentUser()), "Lấy tủ lạnh thành công");
    }

    @PostMapping
    public ApiResponse<FridgeItemResponse> add(@RequestBody FridgeItemRequest request) {
        User user = securityUtils.getCurrentUser();
        FridgeItemResponse res = fridgeService.add(user, request);
        aiContextService.evict(user.getId());
        return ApiResponse.success(res, "Đã thêm vào tủ lạnh");
    }

    @PutMapping("/{id}")
    public ApiResponse<FridgeItemResponse> update(
            @PathVariable Long id,
            @RequestBody com.nhom6.foodx.fridge.dto.FridgeItemUpdateRequest request) {
        User user = securityUtils.getCurrentUser();
        FridgeItemResponse res = fridgeService.update(user, id, request);
        aiContextService.evict(user.getId());
        return ApiResponse.success(res, "Đã cập nhật nguyên liệu thành công");
    }

    @PostMapping("/merge-duplicates")
    public ApiResponse<List<FridgeItemResponse>> mergeDuplicates() {
        User user = securityUtils.getCurrentUser();
        List<FridgeItemResponse> res = fridgeService.mergeDuplicates(user);
        aiContextService.evict(user.getId());
        return ApiResponse.success(res, "Đã gộp các nguyên liệu trùng hạn sử dụng thành công");
    }

    @PatchMapping("/{id}/quantity")
    public ApiResponse<FridgeItemResponse> changeQuantity(@PathVariable Long id, @RequestParam Double delta) {
        User user = securityUtils.getCurrentUser();
        FridgeItemResponse res = fridgeService.changeQuantity(user, id, delta).orElse(null);
        aiContextService.evict(user.getId());
        return ApiResponse.success(res, "Đã cập nhật số lượng");
    }

    @PatchMapping("/{id}/expiry")
    public ApiResponse<FridgeItemResponse> updateExpiry(@PathVariable Long id, @RequestBody ExpiryRequest request) {
        User user = securityUtils.getCurrentUser();
        FridgeItemResponse res = fridgeService.updateExpiry(user, id, request.expiresAt());
        aiContextService.evict(user.getId());
        return ApiResponse.success(res, "Đã cập nhật hạn sử dụng");
    }

    @DeleteMapping({"", "/all", "/clear-all"})
    public ApiResponse<Void> clearAll() {
        User user = securityUtils.getCurrentUser();
        fridgeService.clearAll(user);
        aiContextService.evict(user.getId());
        return ApiResponse.success(null, "Đã dọn sạch toàn bộ thực phẩm trong tủ lạnh");
    }

    @GetMapping("/search-image")
    public ApiResponse<java.util.Map<String, String>> searchImage(@RequestParam String query) {
        String img = foodImageSearchService.findOrDownloadImage(query);
        return ApiResponse.success(java.util.Map.of("imageUrl", img), "Tìm ảnh thành công");
    }

    @GetMapping("/estimate-nutrition")
    public ApiResponse<com.nhom6.foodx.food.dto.NutritionEstimateResponse> estimateNutrition(
            @RequestParam String name,
            @RequestParam(required = false, defaultValue = "100") Double quantity,
            @RequestParam(required = false, defaultValue = "g") String unit) {
        var res = nutritionEstimateService.estimate(name, quantity, unit);
        return ApiResponse.success(res, "Tra cứu calo và dinh dưỡng thành công");
    }

    @DeleteMapping("/{id:[0-9]+}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        User user = securityUtils.getCurrentUser();
        fridgeService.delete(user, id);
        aiContextService.evict(user.getId());
        return ApiResponse.success(null, "Đã xóa khỏi tủ lạnh");
    }
}
