package com.nhom6.foodx.recipe.entity;

import com.nhom6.foodx.auth.entity.User;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Công thức nấu ăn.
 */
@Entity
@Table(name = "recipes")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Recipe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String description;

    /** Hướng dẫn nấu, mỗi bước một dòng. */
    @Lob
    @Column(columnDefinition = "TEXT")
    private String instructions;

    /** Thời gian chuẩn bị (phút). */
    private Integer prepTime;

    /** Thời gian nấu (phút). */
    private Integer cookTime;

    /** Số khẩu phần. */
    private Integer servings;

    @Column(length = 100)
    private String cuisine;

    @Column(length = 100)
    private String category;

    /** Đường dẫn ảnh món ăn. */
    @Column(length = 500)
    private String imageUrl;

    /** URL nguồn nếu import từ web. */
    @Column(length = 500)
    private String sourceUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id")
    private User author;

    @Builder.Default
    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RecipeIngredient> ingredients = new ArrayList<>();

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
