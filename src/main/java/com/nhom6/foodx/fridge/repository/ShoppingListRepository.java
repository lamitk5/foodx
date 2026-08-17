package com.nhom6.foodx.fridge.repository;

import com.nhom6.foodx.fridge.entity.ShoppingList;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ShoppingListRepository extends JpaRepository<ShoppingList, Long> {
}
