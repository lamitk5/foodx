package com.nhom6.foodx.social.entity;

import com.nhom6.foodx.auth.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Bài đăng chia sẻ công thức nấu ăn (mạng xã hội thu nhỏ).
 * Hỗ trợ bản nháp (DRAFT) và xuất bản (PUBLISHED).
 */
@Entity
@Table(name = "recipe_posts")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecipePost {

    public static final String STATUS_DRAFT = "DRAFT";
    public static final String STATUS_PUBLISHED = "PUBLISHED";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    /** Mỗi dòng là một nguyên liệu (đã định dạng "500g Thịt bò"). */
    @Column(columnDefinition = "TEXT")
    private String ingredients;

    /** Các bước thực hiện, mỗi dòng một bước (được đánh số tự động khi hiển thị). */
    @Column(name = "steps", columnDefinition = "TEXT")
    private String steps;

    /** Hướng dẫn dạng tự do (giữ tương thích dữ liệu cũ). */
    @Column(columnDefinition = "TEXT")
    private String instructions;

    @Column(name = "image_url", length = 1000)
    private String imageUrl;

    @Column(length = 50)
    private String category;

    @Column(name = "cook_time")
    private Integer cookTime;

    private Integer kcal;

    private Integer servings;

    @Column(length = 30)
    private String difficulty;

    /** DRAFT | PUBLISHED. */
    @Column(nullable = false, length = 20)
    private String status;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.status == null) {
            this.status = STATUS_PUBLISHED;
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
