package com.nhom6.foodx.plan.repository;

import com.nhom6.foodx.plan.entity.MealPlanEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface MealPlanEntryRepository extends JpaRepository<MealPlanEntry, Long> {

    List<MealPlanEntry> findByUser_IdAndPlanDateBetweenOrderByPlanDateAsc(Long userId, LocalDate start, LocalDate end);

    Optional<MealPlanEntry> findByUser_IdAndPlanDateAndSlot(Long userId, LocalDate planDate, String slot);

    Optional<MealPlanEntry> findByIdAndUser_Id(Long id, Long userId);

    void deleteByUser_IdAndPlanDateAndSlot(Long userId, LocalDate planDate, String slot);
}