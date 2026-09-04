package com.nhom6.foodx.shopping.repository;

import com.nhom6.foodx.shopping.entity.ShoppingItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ShoppingItemRepository extends JpaRepository<ShoppingItem, Long> {

    List<ShoppingItem> findByUser_IdOrderByIdAsc(Long userId);

    Optional<ShoppingItem> findByIdAndUser_Id(Long id, Long userId);

    long countByUser_IdAndDoneFalse(Long userId);

    void deleteByUser_Id(Long userId);
}