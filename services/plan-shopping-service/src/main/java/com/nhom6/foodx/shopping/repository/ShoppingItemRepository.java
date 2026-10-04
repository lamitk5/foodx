package com.nhom6.foodx.shopping.repository;

import com.nhom6.foodx.shopping.entity.ShoppingItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * Chỉ truy vấn bảng {@code shopping_items} do service này sở hữu.
 * Khoá ngoại tới người dùng nay là {@code userId} (giá trị thô), không còn entity {@code User}.
 */
public interface ShoppingItemRepository extends JpaRepository<ShoppingItem, Long> {

    List<ShoppingItem> findByUserIdOrderByIdAsc(Long userId);

    Optional<ShoppingItem> findByIdAndUserId(Long id, Long userId);

    long countByUserIdAndDoneFalse(Long userId);

    /** Dọn toàn bộ danh sách mua sắm của một người dùng (admin xoá tài khoản). */
    long deleteByUserId(Long userId);
}
