package com.nhom6.foodx.fridge.repository;

import com.nhom6.foodx.fridge.entity.ShoppingListItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ShoppingListItemRepository extends JpaRepository<ShoppingListItem, Long> {
}
