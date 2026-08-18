package com.nhom6.foodx.plan.dto;

import java.time.LocalDate;

public record CustomSlotRequest(
        LocalDate planDate,
        String slot,
        String title,
        Integer kcal,
        Double protein,
        Double carb,
        Double fat,
        String description
) {
}
