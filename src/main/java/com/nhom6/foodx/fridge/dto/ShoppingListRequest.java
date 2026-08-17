package com.nhom6.foodx.fridge.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class ShoppingListRequest {

    /** Người sở hữu (tuỳ chọn, mặc định có thể gán từ session) */
    private Long userId;

    @NotBlank(message = "Tên danh sách mua sắm không được để trống")
    @Size(max = 100, message = "Tên danh sách tối đa 100 ký tự")
    private String name;

    private List<FridgeItemRequest> items = new ArrayList<>();
}

