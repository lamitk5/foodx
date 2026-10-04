package com.nhom6.foodx.fridge.repository;

import com.nhom6.foodx.fridge.entity.FridgeItem;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FridgeItemRepository extends JpaRepository<FridgeItem, Long> {

    /**
     * Toàn bộ thực phẩm trong tủ của một người dùng, kèm sẵn {@code food}.
     * {@code food} là LAZY nên phải fetch kèm, nếu không sẽ lỗi khi map ra DTO
     * ngoài transaction (các API nội bộ /internal/** trả JSON thô).
     */
    @EntityGraph(attributePaths = "food")
    List<FridgeItem> findByUserIdOrderByIdAsc(Long userId);

    Optional<FridgeItem> findByIdAndUserId(Long id, Long userId);

    Optional<FridgeItem> findFirstByUserIdAndFood_Id(Long userId, Long foodId);

    Optional<FridgeItem> findFirstByUserIdAndFood_NameIgnoreCase(Long userId, String name);

    List<FridgeItem> findByUserIdAndFood_Id(Long userId, Long foodId);

    List<FridgeItem> findByUserIdAndFood_NameIgnoreCase(Long userId, String name);

    /** Xoá toàn bộ tủ lạnh của một người dùng, trả về số dòng đã xoá. */
    long deleteByUserId(Long userId);
}
