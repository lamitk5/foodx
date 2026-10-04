package com.nhom6.foodx.shopping.controller;

import com.nhom6.foodx.common.response.ApiResponse;
import com.nhom6.foodx.common.security.SecurityUtils;
import com.nhom6.foodx.shopping.dto.ShoppingItemRequest;
import com.nhom6.foodx.shopping.dto.ShoppingItemResponse;
import com.nhom6.foodx.shopping.service.ShoppingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * API danh sách mua sắm (yêu cầu JWT).
 *
 * <p>Danh tính người dùng lấy từ JWT qua {@link SecurityUtils#getCurrentUserId()}.</p>
 */
@RestController
@RequestMapping("/api/shopping")
@RequiredArgsConstructor
public class ShoppingController {

    private final ShoppingService shoppingService;

    @GetMapping
    public ApiResponse<List<ShoppingItemResponse>> getAll() {
        return ApiResponse.success(shoppingService.getAll(SecurityUtils.getCurrentUserId()), "Danh sách mua sắm");
    }

    @PostMapping
    public ApiResponse<ShoppingItemResponse> add(@RequestBody ShoppingItemRequest request) {
        return ApiResponse.success(shoppingService.add(SecurityUtils.getCurrentUserId(), request), "Đã thêm vào danh sách mua");
    }

    @PatchMapping("/{id:\\d+}/toggle")
    public ApiResponse<ShoppingItemResponse> toggle(@PathVariable Long id) {
        return ApiResponse.success(shoppingService.toggle(SecurityUtils.getCurrentUserId(), id), "Đã cập nhật");
    }

    @PatchMapping("/{id:\\d+}")
    public ApiResponse<ShoppingItemResponse> update(@PathVariable Long id, @RequestBody ShoppingItemRequest request) {
        return ApiResponse.success(shoppingService.update(SecurityUtils.getCurrentUserId(), id, request), "Đã cập nhật");
    }

    @DeleteMapping("/done")
    public ApiResponse<Void> clearDone() {
        shoppingService.clearDone(SecurityUtils.getCurrentUserId());
        return ApiResponse.success(null, "Đã dọn các món đã mua");
    }

    @DeleteMapping("/all")
    public ApiResponse<Void> clearAll() {
        shoppingService.clearAll(SecurityUtils.getCurrentUserId());
        return ApiResponse.success(null, "Đã xoá toàn bộ danh sách mua");
    }

    @DeleteMapping("/{id:[0-9]+}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        shoppingService.delete(SecurityUtils.getCurrentUserId(), id);
        return ApiResponse.success(null, "Đã xoá");
    }
}
