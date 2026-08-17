package com.nhom6.foodx.fridge.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "fridge_items", indexes = {
        @Index(name = "idx_fridge_user_category", columnList = "userId, category"),
        @Index(name = "idx_fridge_expiry", columnList = "expiryDate")
})
public class FridgeItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /** Người sở hữu (khớp schema: FK -> users.id) */
    private Long userId;
    private String name;
    private String category;
        private Double quantity;
    private String unit;

    /** Ảnh minh hoạ (URL hoặc base64). Dùng @Lob để tạo cột LONGTEXT chứa được base64 dài. */
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String imageUrl;

    private String note;
    
    /** Hạn sử dụng của nguyên liệu (theo README: fridge gồm hạn dùng) */
    private LocalDate expiryDate;

    private LocalDateTime createdAt = LocalDateTime.now();
}

