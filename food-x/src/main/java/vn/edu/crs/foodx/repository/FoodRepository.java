package vn.edu.crs.foodx.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.edu.crs.foodx.entity.Food;

import java.util.Optional;

public interface FoodRepository
        extends JpaRepository<Food, Long> {

    Optional<Food> findBySourceKey(String sourceKey);

}