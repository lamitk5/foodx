package com.nhom6.foodx.favorite.controller;

import com.nhom6.foodx.auth.entity.User;
import com.nhom6.foodx.common.response.ApiResponse;
import com.nhom6.foodx.favorite.dto.FavoriteRequest;
import com.nhom6.foodx.favorite.dto.FavoriteResponse;
import com.nhom6.foodx.favorite.service.FavoriteService;
import com.nhom6.foodx.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * API quản lý Danh sách yêu thích của người dùng (yêu cầu xác thực JWT).
 */
@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;
    private final SecurityUtils securityUtils;

    @GetMapping
    public ApiResponse<List<FavoriteResponse>> list() {
        User user = securityUtils.getCurrentUser();
        return ApiResponse.success(favoriteService.list(user.getId()), "Danh sách món yêu thích");
    }

    @PostMapping("/toggle")
    public ApiResponse<Boolean> toggle(@RequestBody FavoriteRequest request) {
        User user = securityUtils.getCurrentUser();
        boolean saved = favoriteService.toggle(user.getId(), request);
        return ApiResponse.success(saved, saved ? "Đã thêm vào mục yêu thích" : "Đã bỏ khỏi mục yêu thích");
    }

    @GetMapping("/ids")
    public ApiResponse<List<Long>> getFavoriteIds(@RequestParam(value = "targetType", defaultValue = "RECIPE") String targetType) {
        User user = securityUtils.getCurrentUser();
        return ApiResponse.success(favoriteService.getFavoriteIds(user.getId(), targetType), "Danh sách ID yêu thích");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> remove(@PathVariable Long id) {
        User user = securityUtils.getCurrentUser();
        favoriteService.remove(user.getId(), id);
        return ApiResponse.success(null, "Đã xóa khỏi mục yêu thích");
    }
}
