package com.nhom6.foodx.fridge.controller;

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

    @GetMapping
    public ApiResponse<List<FridgeItemResponse>> getAll() {
        return ApiResponse.success(fridgeService.getAll(securityUtils.getCurrentUser()), "Lấy tủ lạnh thành công");
    }

    @PostMapping
    public ApiResponse<FridgeItemResponse> add(@RequestBody FridgeItemRequest request) {
        return ApiResponse.success(fridgeService.add(securityUtils.getCurrentUser(), request), "Đã thêm vào tủ lạnh");
    }

    @PutMapping("/{id}")
    public ApiResponse<FridgeItemResponse> update(
            @PathVariable Long id,
            @RequestBody com.nhom6.foodx.fridge.dto.FridgeItemUpdateRequest request) {
        return ApiResponse.success(
                fridgeService.update(securityUtils.getCurrentUser(), id, request),
                "Đã cập nhật nguyên liệu thành công");
    }

    @PostMapping("/merge-duplicates")
    public ApiResponse<List<FridgeItemResponse>> mergeDuplicates() {
        return ApiResponse.success(
                fridgeService.mergeDuplicates(securityUtils.getCurrentUser()),
                "Đã gộp các nguyên liệu trùng hạn sử dụng thành công");
    }

    @PatchMapping("/{id}/quantity")
    public ApiResponse<FridgeItemResponse> changeQuantity(@PathVariable Long id, @RequestParam Double delta) {
        return ApiResponse.success(
                fridgeService.changeQuantity(securityUtils.getCurrentUser(), id, delta).orElse(null),
                "Đã cập nhật số lượng");
    }

    @PatchMapping("/{id}/expiry")
    public ApiResponse<FridgeItemResponse> updateExpiry(@PathVariable Long id, @RequestBody ExpiryRequest request) {
        return ApiResponse.success(
                fridgeService.updateExpiry(securityUtils.getCurrentUser(), id, request.expiresAt()),
                "Đã cập nhật hạn sử dụng");
    }

    @DeleteMapping({"", "/all", "/clear-all"})
    public ApiResponse<Void> clearAll() {
        fridgeService.clearAll(securityUtils.getCurrentUser());
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
        fridgeService.delete(securityUtils.getCurrentUser(), id);
        return ApiResponse.success(null, "Đã xóa khỏi tủ lạnh");
    }

    @PostMapping("/scan-image")
    public ApiResponse<com.nhom6.foodx.fridge.dto.ScanResultDto> scanImage(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            @RequestParam(required = false, defaultValue = "false") boolean autoSave) {
        var result = fridgeService.scanAndProcessImage(securityUtils.getCurrentUser(), file, autoSave);
        return ApiResponse.success(result, "Quét và phân tích ảnh thực phẩm thành công");
    }

    @PostMapping("/batch")
    public ApiResponse<List<FridgeItemResponse>> batchAdd(@RequestBody List<FridgeItemRequest> requests) {
        var result = fridgeService.batchAdd(securityUtils.getCurrentUser(), requests);
        return ApiResponse.success(result, "Đã thêm danh sách thực phẩm vào tủ lạnh thành công");
    }
}