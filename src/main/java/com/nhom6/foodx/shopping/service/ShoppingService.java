package com.nhom6.foodx.shopping.service;

import com.nhom6.foodx.auth.entity.User;
import com.nhom6.foodx.common.exception.BusinessException;
import com.nhom6.foodx.shopping.dto.ShoppingItemRequest;
import com.nhom6.foodx.shopping.dto.ShoppingItemResponse;
import com.nhom6.foodx.shopping.entity.ShoppingItem;
import com.nhom6.foodx.shopping.repository.ShoppingItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Danh sách mua sắm (gộp từ dk-dn).
 */
@Service
@RequiredArgsConstructor
public class ShoppingService {

    private final ShoppingItemRepository shoppingItemRepository;

    @Transactional(readOnly = true)
    public List<ShoppingItemResponse> getAll(User user) {
        return shoppingItemRepository.findByUser_IdOrderByIdAsc(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ShoppingItemResponse add(User user, ShoppingItemRequest request) {
        if (request.name() == null || request.name().isBlank()) {
            throw new BusinessException(400, "Tên nguyên liệu không được để trống");
        }
        ShoppingItem item = ShoppingItem.builder()
                .user(user)
                .name(request.name().trim())
                .quantity(request.quantity() == null ? "1 phần" : request.quantity())
                .price(request.price() == null ? 0 : request.price())
                .category(request.category() == null ? "spice" : request.category())
                .done(false)
                .build();
        return toResponse(shoppingItemRepository.save(item));
    }

    @Transactional
    public ShoppingItemResponse toggle(User user, Long id) {
        ShoppingItem item = findItem(user, id);
        item.setDone(!Boolean.TRUE.equals(item.getDone()));
        return toResponse(shoppingItemRepository.save(item));
    }

    @Transactional
    public ShoppingItemResponse update(User user, Long id, ShoppingItemRequest request) {
        ShoppingItem item = findItem(user, id);
        if (request.name() != null && !request.name().isBlank()) {
            item.setName(request.name().trim());
        }
        if (request.quantity() != null) {
            item.setQuantity(request.quantity());
        }
        if (request.price() != null) {
            item.setPrice(request.price());
        }
        if (request.category() != null) {
            item.setCategory(request.category());
        }
        return toResponse(shoppingItemRepository.save(item));
    }

    @Transactional
    public void delete(User user, Long id) {
        shoppingItemRepository.delete(findItem(user, id));
    }

    @Transactional
    public void clearDone(User user) {
        shoppingItemRepository.findByUser_IdOrderByIdAsc(user.getId())
                .stream()
                .filter(i -> Boolean.TRUE.equals(i.getDone()))
                .forEach(shoppingItemRepository::delete);
    }

    private ShoppingItem findItem(User user, Long id) {
        return shoppingItemRepository.findByIdAndUser_Id(id, user.getId())
                .orElseThrow(() -> new BusinessException(404, "Không tìm thấy mục mua sắm"));
    }

    private ShoppingItemResponse toResponse(ShoppingItem item) {
        return new ShoppingItemResponse(
                item.getId(),
                item.getName(),
                item.getQuantity(),
                item.getPrice(),
                item.getCategory(),
                item.getDone()
        );
    }
}