package com.nhom6.foodx.food.entity;

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

import java.time.LocalDateTime;

/**
 * Kho thực phẩm (catalog) với thông tin dinh dưỡng — gộp từ dự án food-x.
 */
@Entity
@Table(name = "foods")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Food {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Key nối với catalog frontend (egg, chicken...); nguyên liệu tự nhập có thể null. */
    @Column(name = "source_key", unique = true, length = 100)
    private String sourceKey;

    @Column(nullable = false, length = 150)
    private String name;

    @Builder.Default
    @Column(nullable = false, length = 50)
    private String type = "Nguyên liệu";

    @Builder.Default
    private Double kcal = 0.0;
    @Builder.Default
    private Double protein = 0.0;
    @Builder.Default
    private Double carb = 0.0;
    @Builder.Default
    private Double fat = 0.0;

    @Column(columnDefinition = "TEXT")
    private String components;

    @Column(length = 150)
    private String benefit;

    @Column(name = "image_url", length = 1000)
    private String imageUrl;

    @Builder.Default
    @Column(name = "default_quantity")
    private Double defaultQuantity = 1.0;

    @Column(length = 30)
    private String unit;

    @Builder.Default
    @Column(name = "default_expiry_days")
    private Integer defaultExpiryDays = 7;

    /** true = người dùng tự nhập; false = nguyên liệu hệ thống. */
    @Builder.Default
    @Column(name = "custom_food")
    private Boolean customFood = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (type == null) {
            type = "Nguyên liệu";
        }
        if (kcal == null) {
            kcal = 0.0;
        }
        if (protein == null) {
            protein = 0.0;
        }
        if (carb == null) {
            carb = 0.0;
        }
        if (fat == null) {
            fat = 0.0;
        }
        if (defaultQuantity == null) {
            defaultQuantity = 1.0;
        }
        if (defaultExpiryDays == null) {
            defaultExpiryDays = 7;
        }
        if (customFood == null) {
            customFood = false;
        }
    }
}