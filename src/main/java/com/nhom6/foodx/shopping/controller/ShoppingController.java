package com.nhom6.foodx.shopping.controller;

import com.nhom6.foodx.common.response.ApiResponse;
import com.nhom6.foodx.security.SecurityUtils;
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
 */
@RestController
@RequestMapping("/api/shopping")
@RequiredArgsConstructor
public class ShoppingController {

    private final ShoppingService shoppingService;
    private final SecurityUtils securityUtils;

    @GetMapping
    public ApiResponse<List<ShoppingItemResponse>> getAll() {
        return ApiResponse.success(shoppingService.getAll(securityUtils.getCurrentUser()), "Danh sách mua sắm");
    }

    @PostMapping
    public ApiResponse<ShoppingItemResponse> add(@RequestBody ShoppingItemRequest request) {
        return ApiResponse.success(shoppingService.add(securityUtils.getCurrentUser(), request), "Đã thêm vào danh sách mua");
    }

    @PatchMapping("/{id}/toggle")
    public ApiResponse<ShoppingItemResponse> toggle(@PathVariable Long id) {
        return ApiResponse.success(shoppingService.toggle(securityUtils.getCurrentUser(), id), "Đã cập nhật");
    }

    @PatchMapping("/{id}")
    public ApiResponse<ShoppingItemResponse> update(@PathVariable Long id, @RequestBody ShoppingItemRequest request) {
        return ApiResponse.success(shoppingService.update(securityUtils.getCurrentUser(), id, request), "Đã cập nhật");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        shoppingService.delete(securityUtils.getCurrentUser(), id);
        return ApiResponse.success(null, "Đã xoá");
    }

    @DeleteMapping("/done")
    public ApiResponse<Void> clearDone() {
        shoppingService.clearDone(securityUtils.getCurrentUser());
        return ApiResponse.success(null, "Đã dọn các món đã mua");
    }

    @DeleteMapping("/all")
    public ApiResponse<Void> clearAll() {
        shoppingService.clearAll(securityUtils.getCurrentUser());
        return ApiResponse.success(null, "Đã xoá toàn bộ danh sách mua");
    }
}