package com.nhom6.foodx.fridge.dto;

import com.nhom6.foodx.fridge.entity.FridgeItem;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class FridgeItemResponse {

    private Long id;
    private Long userId;
    private String name;
    private String category;
    private Double quantity;
    private String unit;
    private String imageUrl;
    private String note;

    /** Hạn sử dụng */
    private LocalDate expiryDate;

    /** Ngày thêm nguyên liệu (phần ngày của createdAt) */
    private LocalDate dateAdded;

    private LocalDateTime createdAt;

    /** true nếu nguyên liệu đã hết hạn (expiryDate < hôm nay) */
    private boolean expired;

    public static FridgeItemResponse from(FridgeItem item) {
        FridgeItemResponse res = new FridgeItemResponse();
        res.setId(item.getId());
        res.setUserId(item.getUserId());
        res.setName(item.getName());
        res.setCategory(item.getCategory());
        res.setQuantity(item.getQuantity());
        res.setUnit(item.getUnit());
        res.setImageUrl(item.getImageUrl());
        res.setNote(item.getNote());
        res.setExpiryDate(item.getExpiryDate());
        res.setCreatedAt(item.getCreatedAt());
        res.setDateAdded(item.getCreatedAt() != null ? item.getCreatedAt().toLocalDate() : LocalDate.now());
        res.setExpired(item.getExpiryDate() != null
                && item.getExpiryDate().isBefore(LocalDate.now()));
        return res;
    }
}

