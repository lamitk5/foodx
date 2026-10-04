package com.nhom6.foodx.plan.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Một bữa ăn trong kế hoạch tuần (gộp từ dk-dn): user + ngày + khung giờ + món.
 *
 * <p>Chỉ giữ {@code userId} — bảng {@code users} thuộc user-service nên service này
 * không được có entity/repository của bảng đó. Tên cột {@code user_id} giữ nguyên
 * như bản cũ để {@code ddl-auto=update} không phá dữ liệu hiện có.</p>
 */
@Entity
@Table(name = "meal_plan_entries", uniqueConstraints = {
        @UniqueConstraint(name = "uk_meal_plan", columnNames = {"user_id", "plan_date", "slot"})
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MealPlanEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "plan_date", nullable = false)
    private LocalDate planDate;

    /** morning / lunch / dinner. */
    @Column(nullable = false, length = 20)
    private String slot;

    @Column(name = "recipe_id", nullable = false)
    private Long recipeId;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
