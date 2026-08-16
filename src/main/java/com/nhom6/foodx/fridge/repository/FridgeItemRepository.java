package com.nhom6.foodx.fridge.repository;

import com.nhom6.foodx.fridge.entity.FridgeItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface FridgeItemRepository extends JpaRepository<FridgeItem, Long> {

    List<FridgeItem> findByUserId(Long userId);

    Optional<FridgeItem> findByUserIdAndIngredientId(Long userId, Long ingredientId);

    List<FridgeItem> findByUserIdAndExpiryDateBefore(Long userId, LocalDate date);
}
