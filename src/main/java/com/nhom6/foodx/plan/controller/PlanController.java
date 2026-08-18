package com.nhom6.foodx.plan.controller;

import com.nhom6.foodx.common.response.ApiResponse;
import com.nhom6.foodx.plan.dto.PlanEntryRequest;
import com.nhom6.foodx.plan.dto.PlanEntryResponse;
import com.nhom6.foodx.plan.service.PlanService;
import com.nhom6.foodx.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * API kế hoạch bữa ăn tuần (yêu cầu JWT).
 */
@RestController
@RequestMapping("/api/plan")
@RequiredArgsConstructor
public class PlanController {

    private final PlanService planService;
    private final SecurityUtils securityUtils;

    @GetMapping
    public ApiResponse<List<PlanEntryResponse>> getRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return ApiResponse.success(planService.getRange(securityUtils.getCurrentUser(), start, end),
                "Kế hoạch bữa ăn");
    }

    @PostMapping
    public ApiResponse<PlanEntryResponse> setSlot(@RequestBody PlanEntryRequest request) {
        return ApiResponse.success(planService.setSlot(securityUtils.getCurrentUser(), request), "Đã lên kế hoạch");
    }

    @DeleteMapping
    public ApiResponse<Void> removeSlot(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam String slot) {
        planService.removeSlot(securityUtils.getCurrentUser(), date, slot);
        return ApiResponse.success(null, "Đã xoá bữa ăn");
    }

    @PostMapping("/auto")
    public ApiResponse<Map<String, Object>> autoFill(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        int added = planService.autoFill(securityUtils.getCurrentUser(), start, end);
        return ApiResponse.success(Map.of("added", added), "AI đã lên kế hoạch " + added + " bữa");
    }
}