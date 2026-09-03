package com.nhom6.foodx.plan.dto;

import java.time.LocalDate;

/**
 * Tổng hợp kế hoạch tuần dùng cho widget đo dinh dưỡng.
 */
public record PlanSummaryResponse(
        LocalDate start,
        LocalDate end,
        Integer dailyKcalGoal,
        int plannedSlots,
        int totalKcal
) {
}
