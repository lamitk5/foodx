package com.nhom6.foodx.favorite.controller;

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
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * API danh sách yêu thích (công thức + nguyên liệu). Yêu cầu JWT.
 */
@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;
    private final SecurityUtils securityUtils;

    @GetMapping
    public ApiResponse<List<FavoriteResponse>> list() {
        return ApiResponse.success(favoriteService.list(securityUtils.getCurrentUser()), "Danh sách yêu thích");
    }

    @PostMapping("/toggle")
    public ApiResponse<Boolean> toggle(@RequestBody FavoriteRequest request) {
        boolean saved = favoriteService.toggle(securityUtils.getCurrentUser(), request);
        return ApiResponse.success(saved, saved ? "Đã lưu vào yêu thích" : "Đã bỏ khỏi yêu thích");
    }

    @DeleteMapping("/{id:\\d+}")
    public ApiResponse<Void> remove(@PathVariable Long id) {
        favoriteService.remove(securityUtils.getCurrentUser(), id);
        return ApiResponse.success(null, "Đã xoá khỏi yêu thích");
    }
}
