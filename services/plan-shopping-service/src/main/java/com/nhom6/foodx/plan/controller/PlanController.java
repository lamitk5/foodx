package com.nhom6.foodx.plan.controller;

import com.nhom6.foodx.common.response.ApiResponse;
import com.nhom6.foodx.common.security.SecurityUtils;
import com.nhom6.foodx.plan.dto.PlanEntryRequest;
import com.nhom6.foodx.plan.dto.PlanEntryResponse;
import com.nhom6.foodx.plan.dto.PlanSummaryResponse;
import com.nhom6.foodx.plan.service.PlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
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
 *
 * <p>Danh tính người dùng lấy từ JWT qua {@link SecurityUtils#getCurrentUserId()} — không
 * truy vấn bảng {@code users} nữa.</p>
 */
@RestController
@RequestMapping("/api/plan")
@RequiredArgsConstructor
public class PlanController {

    private final PlanService planService;

    @GetMapping
    public ApiResponse<List<PlanEntryResponse>> getRange(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        if (start == null) start = LocalDate.now();
        if (end == null) end = start.plusDays(6);
        return ApiResponse.success(planService.getRange(SecurityUtils.getCurrentUserId(), start, end),
                "Kế hoạch bữa ăn");
    }

    @GetMapping("/summary")
    public ApiResponse<PlanSummaryResponse> getSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        if (start == null) start = LocalDate.now();
        if (end == null) end = start.plusDays(6);
        return ApiResponse.success(planService.getSummary(SecurityUtils.getCurrentUserId(), start, end),
                "Tổng hợp kế hoạch tuần");
    }


    @PostMapping
    public ApiResponse<PlanEntryResponse> setSlot(@RequestBody PlanEntryRequest request) {
        return ApiResponse.success(planService.setSlot(SecurityUtils.getCurrentUserId(), request), "Đã lên kế hoạch");
    }

    @DeleteMapping
    public ApiResponse<Void> removeSlot(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam String slot) {
        planService.removeSlot(SecurityUtils.getCurrentUserId(), date, slot);
        return ApiResponse.success(null, "Đã xoá bữa ăn");
    }

    @PostMapping("/auto")
    public ApiResponse<Map<String, Object>> autoFill(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        int added = planService.autoFill(SecurityUtils.getCurrentUserId(), start, end);
        return ApiResponse.success(Map.of("added", added), "AI đã lên kế hoạch " + added + " bữa");
    }

    @PostMapping("/suggest-slot")
    public ApiResponse<PlanEntryResponse> suggestSlot(@RequestBody com.nhom6.foodx.plan.dto.SuggestSlotRequest request) {
        return ApiResponse.success(planService.suggestSlot(SecurityUtils.getCurrentUserId(), request), "AI đã gợi ý món ăn thành công");
    }

    @PostMapping("/estimate-dish")
    public ApiResponse<com.nhom6.foodx.plan.dto.EstimateDishResponse> estimateDish(@RequestBody com.nhom6.foodx.plan.dto.EstimateDishRequest request) {
        return ApiResponse.success(planService.estimateDish(request), "AI ước tính dinh dưỡng thành công");
    }

    @PostMapping("/custom-slot")
    public ApiResponse<PlanEntryResponse> setCustomSlot(@RequestBody com.nhom6.foodx.plan.dto.CustomSlotRequest request) {
        return ApiResponse.success(planService.setCustomSlot(SecurityUtils.getCurrentUserId(), request), "Đã thêm món vào kế hoạch");
    }
}
