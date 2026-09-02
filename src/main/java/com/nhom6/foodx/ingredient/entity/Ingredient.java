package com.nhom6.foodx.ingredient.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Danh mục nguyên liệu chung dùng cho toàn hệ thống.
 */
@Entity
@Table(name = "ingredients")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Ingredient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    /** Đơn vị mặc định: g, ml, cái, quả... */
    @Column(length = 20)
    private String defaultUnit;

    /** Phân nhóm nguyên liệu: rau, thịt, gia vị... */
    @Column(length = 50)
    private String category;

    /** Calo ước tính trên mỗi 100g/ml. */
    private Double caloriesPerUnit;

    @Column(length = 500)
    private String description;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
