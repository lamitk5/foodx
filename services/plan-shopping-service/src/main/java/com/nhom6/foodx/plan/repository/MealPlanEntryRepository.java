package com.nhom6.foodx.plan.repository;

import com.nhom6.foodx.plan.entity.MealPlanEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Chỉ truy vấn bảng {@code meal_plan_entries} do service này sở hữu.
 * Khoá ngoại tới người dùng nay là {@code userId} (giá trị thô), không còn entity {@code User}.
 */
public interface MealPlanEntryRepository extends JpaRepository<MealPlanEntry, Long> {

    List<MealPlanEntry> findByUserIdAndPlanDateBetweenOrderByPlanDateAsc(Long userId, LocalDate start, LocalDate end);

    Optional<MealPlanEntry> findByUserIdAndPlanDateAndSlot(Long userId, LocalDate planDate, String slot);

    Optional<MealPlanEntry> findByIdAndUserId(Long id, Long userId);

    void deleteByUserIdAndPlanDateAndSlot(Long userId, LocalDate planDate, String slot);

    /** Dọn toàn bộ kế hoạch bữa ăn của một người dùng (admin xoá tài khoản). */
    long deleteByUserId(Long userId);
}
