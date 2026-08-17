package com.nhom6.foodx.fridge.repository;

import com.nhom6.foodx.fridge.entity.FridgeItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FridgeItemRepository extends JpaRepository<FridgeItem, Long> {
    List<FridgeItem> findByCategory(String category);
    List<FridgeItem> findByNameContainingIgnoreCase(String name);
}
