package com.nhom6.foodx.fridge.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDate;

@Data
public class FridgeItemRequest {

    /** Người sở hữu (tuỳ chọn, mặc định có thể gán từ session) */
    private Long userId;

    @NotBlank(message = "Tên nguyên liệu không được để trống")
    private String name;

    private String category;

    @Positive(message = "Số lượng phải lớn hơn 0")
    private Double quantity;

    private String unit;

    private String imageUrl;

    private String note;

    /** Ngày thêm nguyên liệu (người dùng tự chọn, mặc định là hôm nay) */
    private LocalDate dateAdded;

    /** Hạn sử dụng: hệ thống tự tính từ dateAdded + số ngày theo danh mục.
     *  Nếu gửi giá trị này thì dùng luôn, nếu không sẽ tự tính. */
    private LocalDate expiryDate;
}

