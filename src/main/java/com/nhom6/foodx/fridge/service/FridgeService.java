package com.nhom6.foodx.fridge.service;

import com.nhom6.foodx.auth.entity.User;
import com.nhom6.foodx.common.exception.BusinessException;
import com.nhom6.foodx.food.entity.Food;
import com.nhom6.foodx.food.repository.FoodRepository;
import com.nhom6.foodx.fridge.dto.FridgeItemRequest;
import com.nhom6.foodx.fridge.dto.FridgeItemResponse;
import com.nhom6.foodx.fridge.entity.FridgeItem;
import com.nhom6.foodx.fridge.repository.FridgeItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Quản lý tủ lạnh của người dùng (gộp từ dự án food-x, có phân quyền theo user).
 */
@Service
@RequiredArgsConstructor
public class FridgeService {

    private final FoodRepository foodRepository;
    private final FridgeItemRepository fridgeItemRepository;

    @Transactional(readOnly = true)
    public List<FridgeItemResponse> getAll(User user) {
        return fridgeItemRepository.findByUser_IdOrderByIdAsc(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public FridgeItemResponse add(User user, FridgeItemRequest request) {
        if (request.name() == null || request.name().isBlank()) {
            throw new BusinessException(400, "Tên thực phẩm không được để trống");
        }

        String sourceKey = request.sourceKey();
        if (sourceKey == null || sourceKey.isBlank()) {
            sourceKey = "custom-" + UUID.randomUUID();
        }
        final String finalSourceKey = sourceKey;

        Food food = foodRepository.findBySourceKey(finalSourceKey)
                .orElseGet(() -> createFood(request, finalSourceKey));

        Optional<FridgeItem> existing = fridgeItemRepository
                .findFirstByUser_IdAndFood_Id(user.getId(), food.getId());

        FridgeItem fridgeItem;
        if (existing.isPresent()) {
            fridgeItem = existing.get();
            double oldQuantity = fridgeItem.getQuantity() == null ? 0 : fridgeItem.getQuantity();
            double addedQuantity = request.quantity() == null ? 1 : request.quantity();
            fridgeItem.setQuantity(oldQuantity + addedQuantity);

            if (request.unit() != null && !request.unit().isBlank()) {
                fridgeItem.setUnit(request.unit());
            }
            if (request.expiresAt() != null) {
                fridgeItem.setExpiresAt(request.expiresAt());
            }
            if (request.note() != null) {
                fridgeItem.setNote(request.note());
            }
        } else {
            fridgeItem = FridgeItem.builder()
                    .user(user)
                    .food(food)
                    .quantity(request.quantity() == null ? 1.0 : request.quantity())
                    .unit(request.unit() == null || request.unit().isBlank() ? "phần" : request.unit())
                    .expiresAt(request.expiresAt() != null
                            ? request.expiresAt()
                            : LocalDate.now().plusDays(
                                    food.getDefaultExpiryDays() == null ? 7 : food.getDefaultExpiryDays()))
                    .note(request.note())
                    .build();
        }

        return toResponse(fridgeItemRepository.save(fridgeItem));
    }

    private Food createFood(FridgeItemRequest request, String sourceKey) {
        return foodRepository.save(Food.builder()
                .sourceKey(sourceKey)
                .name(request.name())
                .type(request.type() == null || request.type().isBlank() ? "Nguyên liệu" : request.type())
                .kcal(valueOrZero(request.kcal()))
                .protein(valueOrZero(request.protein()))
                .carb(valueOrZero(request.carb()))
                .fat(valueOrZero(request.fat()))
                .components(request.components())
                .benefit(request.benefit())
                .imageUrl(request.imageUrl())
                .defaultQuantity(request.quantity() == null ? 1.0 : request.quantity())
                .unit(request.unit())
                .customFood(Boolean.TRUE.equals(request.customFood()))
                .build());
    }

    @Transactional
    public Optional<FridgeItemResponse> changeQuantity(User user, Long id, Double delta) {
        FridgeItem item = findFridgeItem(user, id);
        double current = item.getQuantity() == null ? 0 : item.getQuantity();
        double change = delta == null ? 0 : delta;
        double newQuantity = current + change;

        if (newQuantity <= 0) {
            fridgeItemRepository.delete(item);
            return Optional.empty();
        }
        item.setQuantity(newQuantity);
        return Optional.of(toResponse(fridgeItemRepository.save(item)));
    }

    @Transactional
    public FridgeItemResponse updateExpiry(User user, Long id, LocalDate expiresAt) {
        if (expiresAt == null) {
            throw new BusinessException(400, "Ngày hết hạn không được để trống");
        }
        FridgeItem item = findFridgeItem(user, id);
        item.setExpiresAt(expiresAt);
        return toResponse(fridgeItemRepository.save(item));
    }

    @Transactional
    public void delete(User user, Long id) {
        fridgeItemRepository.delete(findFridgeItem(user, id));
    }

    private FridgeItem findFridgeItem(User user, Long id) {
        return fridgeItemRepository.findByIdAndUser_Id(id, user.getId())
                .orElseThrow(() -> new BusinessException(404, "Không tìm thấy thực phẩm trong tủ lạnh"));
    }

    private FridgeItemResponse toResponse(FridgeItem item) {
        Food food = item.getFood();
        return new FridgeItemResponse(
                item.getId(),
                food.getId(),
                food.getSourceKey(),
                food.getName(),
                food.getType(),
                item.getQuantity(),
                item.getUnit(),
                food.getKcal(),
                food.getProtein(),
                food.getCarb(),
                food.getFat(),
                food.getComponents(),
                food.getBenefit(),
                food.getImageUrl(),
                item.getExpiresAt(),
                item.getNote(),
                food.getCustomFood()
        );
    }

    private Double valueOrZero(Double value) {
        return value == null ? 0.0 : value;
    }
}