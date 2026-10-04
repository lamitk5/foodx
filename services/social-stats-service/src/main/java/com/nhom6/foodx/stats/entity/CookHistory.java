package com.nhom6.foodx.stats.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Lịch sử nấu ăn để tính thống kê (gộp từ dk-dn).
 */
@Entity
@Table(name = "cook_history")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CookHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** ID người nấu (user-service sở hữu bảng users) — giữ đúng tên cột cũ. */
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "recipe_id", nullable = false)
    private Long recipeId;

    @Column(name = "cooked_at", nullable = false)
    private LocalDate cookedAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (cookedAt == null) {
            cookedAt = LocalDate.now();
        }
    }
}