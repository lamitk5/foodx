package com.nhom6.foodx.fridge.facade;

import com.nhom6.foodx.fridge.entity.FridgeItem;
import com.nhom6.foodx.fridge.repository.FridgeItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Triển khai FridgeFacade.
 */
@Service
@RequiredArgsConstructor
public class FridgeFacadeImpl implements FridgeFacade {

    private final FridgeItemRepository fridgeItemRepository;

    @Override
    @Transactional(readOnly = true)
    public Set<String> getFoodNames(Long userId) {
        if (userId == null) {
            return Set.of();
        }
        return fridgeItemRepository.findByUser_IdOrderByIdAsc(userId).stream()
                .map(FridgeItem::getFood)
                .filter(Objects::nonNull)
                .map(food -> food.getName())
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(name -> !name.isEmpty())
                .collect(Collectors.toSet());
    }
}
