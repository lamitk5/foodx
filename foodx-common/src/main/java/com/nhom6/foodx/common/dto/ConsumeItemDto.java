package com.nhom6.foodx.common.dto;

/**
 * Yêu cầu trừ bớt nguyên liệu trong tủ lạnh sau khi nấu xong.
 *
 * <p>Việc quy đổi đơn vị và khớp tên nguyên liệu là nghiệp vụ của inventory-service
 * (nơi sở hữu tủ lạnh), nên social-stats-service chỉ gửi lên danh sách nguyên liệu
 * đã dùng thay vì tự ghi vào bảng {@code fridge_stock}.</p>
 *
 * @param name     tên nguyên liệu cần trừ
 * @param quantity số lượng cần trừ (theo {@code unit})
 * @param unit     đơn vị của {@code quantity}
 */
public record ConsumeItemDto(
        String name,
        Double quantity,
        String unit) {
}
