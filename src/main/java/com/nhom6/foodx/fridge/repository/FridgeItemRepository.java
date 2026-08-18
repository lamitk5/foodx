package com.nhom6.foodx.fridge.repository;

import com.nhom6.foodx.fridge.entity.FridgeItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FridgeItemRepository extends JpaRepository<FridgeItem, Long> {

    List<FridgeItem> findByUser_IdOrderByIdAsc(Long userId);

    Optional<FridgeItem> findByIdAndUser_Id(Long id, Long userId);

    Optional<FridgeItem> findFirstByUser_IdAndFood_Id(Long userId, Long foodId);
}