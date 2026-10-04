package com.nhom6.foodx.recipe.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Nguyên liệu của một công thức.
 */
@Entity
@Table(name = "recipe_ingredients")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecipeIngredient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;

    /**
     * ID nguyên liệu trong danh mục của inventory-service (nullable: tủ danh mục có thể
     * không sẵn sàng, khi đó công thức vẫn lưu được tên nguyên liệu).
     */
    @Column(name = "ingredient_id")
    private Long ingredientId;

    /** Tên nguyên liệu (bản sao tại thời điểm tạo công thức). */
    @Column(name = "ingredient_name", length = 100)
    private String ingredientName;

    /** Số lượng. */
    @Column(nullable = false)
    private Double quantity;

    /** Đơn vị: g, ml, muỗng... */
    @Column(length = 20)
    private String unit;

    /** Ghi chú thêm cho nguyên liệu. */
    @Column(length = 200)
    private String note;
}
