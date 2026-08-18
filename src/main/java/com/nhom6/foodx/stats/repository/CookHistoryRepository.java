package com.nhom6.foodx.stats.repository;

import com.nhom6.foodx.stats.entity.CookHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface CookHistoryRepository extends JpaRepository<CookHistory, Long> {

    List<CookHistory> findByUser_IdOrderByCookedAtDesc(Long userId);

    long countByUser_Id(Long userId);

    long countByUser_IdAndCookedAtBetween(Long userId, LocalDate start, LocalDate end);
}