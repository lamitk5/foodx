package com.nhom6.foodx.fridge.facade;

import java.util.Set;

/**
 * Public Service Interface của module tủ lạnh (inventory).
 * Cung cấp dữ liệu tủ lạnh cho các module khác mà KHÔNG lộ repository.
 */
public interface FridgeFacade {

    /** Danh sách tên thực phẩm hiện có trong tủ của người dùng (đã trim, bỏ rỗng). */
    Set<String> getFoodNames(Long userId);
}
