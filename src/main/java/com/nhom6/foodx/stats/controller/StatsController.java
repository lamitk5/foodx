package com.nhom6.foodx.stats.controller;

import com.nhom6.foodx.common.response.ApiResponse;
import com.nhom6.foodx.security.SecurityUtils;
import com.nhom6.foodx.stats.dto.CookRequest;
import com.nhom6.foodx.stats.dto.StatsResponse;
import com.nhom6.foodx.stats.service.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * API thống kê nấu ăn (yêu cầu JWT).
 */
@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {

    private final StatsService statsService;
    private final SecurityUtils securityUtils;

    @GetMapping
    public ApiResponse<StatsResponse> getStats() {
        return ApiResponse.success(statsService.getStats(securityUtils.getCurrentUser()), "Thống kê");
    }

    @PostMapping("/cooked")
    public ApiResponse<Void> recordCook(@RequestBody CookRequest request) {
        statsService.recordCook(securityUtils.getCurrentUser(), request.recipeId());
        return ApiResponse.success(null, "Đã ghi nhận món đã nấu");
    }
}