package com.nhom6.foodx.stats.repository;

import com.nhom6.foodx.stats.entity.CookHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface CookHistoryRepository extends JpaRepository<CookHistory, Long> {

    List<CookHistory> findByUserIdOrderByCookedAtDesc(Long userId);

    long countByUserId(Long userId);

    long countByUserIdAndCookedAtBetween(Long userId, LocalDate start, LocalDate end);

    /** Kiểm tra đã ghi nhận món này trong ngày (chống trùng khi bấm đúp). */
    boolean existsByUserIdAndRecipeIdAndCookedAt(Long userId, Long recipeId, LocalDate cookedAt);

    /**
     * Xoá toàn bộ lịch sử nấu ăn của một người dùng — dùng cho
     * {@code DELETE /internal/users/{userId}/data}.
     *
     * @return số dòng đã xoá
     */
    @Modifying
    @Query("delete from CookHistory c where c.userId = :userId")
    int deleteByUserId(@Param("userId") Long userId);
}
