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

    @GetMapping
    public ApiResponse<List<FridgeItemResponse>> getAll() {
        return ApiResponse.success(fridgeService.getAll(securityUtils.getCurrentUser()), "Lấy tủ lạnh thành công");
    }

    @PostMapping
    public ApiResponse<FridgeItemResponse> add(@RequestBody FridgeItemRequest request) {
        return ApiResponse.success(fridgeService.add(securityUtils.getCurrentUser(), request), "Đã thêm vào tủ lạnh");
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

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        fridgeService.delete(securityUtils.getCurrentUser(), id);
        return ApiResponse.success(null, "Đã xóa khỏi tủ lạnh");
    }
}