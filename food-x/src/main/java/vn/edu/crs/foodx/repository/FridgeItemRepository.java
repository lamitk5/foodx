package vn.edu.crs.foodx.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.edu.crs.foodx.entity.FridgeItem;

import java.util.Optional;

public interface FridgeItemRepository
        extends JpaRepository<FridgeItem, Long> {

    Optional<FridgeItem> findFirstByFood_Id(Long foodId);

}