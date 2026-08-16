package com.nhom6.foodx.home.controller;

import com.nhom6.foodx.common.response.ApiResponse;
import com.nhom6.foodx.home.dto.HomeResponse;
import com.nhom6.foodx.home.service.HomeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * API trang chủ - cung cấp dữ liệu tổng hợp cho giao diện chính.
 */
@RestController
@RequestMapping("/api/home")
@RequiredArgsConstructor
public class HomeController {

    private final HomeService homeService;

    @GetMapping
    public ApiResponse<HomeResponse> getHome() {
        return ApiResponse.success(homeService.getHomeData());
    }
}
