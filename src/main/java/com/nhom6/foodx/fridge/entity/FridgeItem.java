package com.nhom6.foodx.fridge.entity;

import com.nhom6.foodx.auth.entity.User;
import com.nhom6.foodx.ingredient.entity.Ingredient;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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
 * Một nguyên liệu trong tủ lạnh ảo của người dùng.
 */
@Entity
@Table(name = "fridge_items", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "ingredient_id"})
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FridgeItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ingredient_id", nullable = false)
    private Ingredient ingredient;

    @Column(nullable = false)
    private Double quantity;

    @Column(length = 20)
    private String unit;

    /** Ngày hết hạn. */
    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    /** Ngày nhập vào tủ. */
    @Column(name = "added_at")
    private LocalDateTime addedAt;
}
