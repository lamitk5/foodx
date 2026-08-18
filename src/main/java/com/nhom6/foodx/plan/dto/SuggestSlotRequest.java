package com.nhom6.foodx.plan.dto;

import java.time.LocalDate;

public record SuggestSlotRequest(
        LocalDate planDate,
        String slot,
        String prompt,
        Integer targetKcal
) {
}
