package com.nhom6.foodx.food.repository;

import com.nhom6.foodx.food.entity.Food;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FoodRepository extends JpaRepository<Food, Long> {

    Optional<Food> findBySourceKey(String sourceKey);
}