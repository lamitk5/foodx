package com.nhom6.foodx.shopping.service;

import com.nhom6.foodx.common.client.InventoryServiceClient;
import com.nhom6.foodx.common.exception.BusinessException;
import com.nhom6.foodx.shopping.dto.ShoppingItemRequest;
import com.nhom6.foodx.shopping.dto.ShoppingItemResponse;
import com.nhom6.foodx.shopping.entity.ShoppingItem;
import com.nhom6.foodx.shopping.repository.ShoppingItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Danh sách mua sắm (gộp từ dk-dn).
 *
 * <p>Service này chỉ sở hữu bảng {@code shopping_items}. Khi người dùng tích "đã mua",
 * thực phẩm được nạp vào tủ lạnh bằng lời gọi HTTP sang inventory-service
 * ({@link InventoryServiceClient#addFridgeItem}) — service này KHÔNG còn bảng
 * {@code fridge_stock}, {@code foods} hay {@code ingredients}.</p>
 */
@Service
@RequiredArgsConstructor
public class ShoppingService {

    /**
     * Tách "500g", "2 hộp", "1,5 kg" thành số lượng + đơn vị.
     * Giữ nguyên quy tắc parse của {@code FridgeService.addOrUpdateBoughtItem} trước đây.
     */
    private static final Pattern QUANTITY_PATTERN = Pattern.compile("^([0-9]+(?:[.,][0-9]+)?)\\s*(.*)$");

    private final ShoppingItemRepository shoppingItemRepository;
    private final InventoryServiceClient inventoryServiceClient;

    @Transactional(readOnly = true)
    public List<ShoppingItemResponse> getAll(Long userId) {
        return shoppingItemRepository.findByUserIdOrderByIdAsc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ShoppingItemResponse add(Long userId, ShoppingItemRequest request) {
        if (request.name() == null || request.name().isBlank()) {
            throw new BusinessException(400, "Tên nguyên liệu không được để trống");
        }
        String category = request.category() == null || request.category().isBlank() ? "spice" : request.category().trim();
        if (category.length() > 250) {
            category = category.substring(0, 250);
        }
        ShoppingItem item = ShoppingItem.builder()
                .userId(userId)
                .name(request.name().trim())
                .quantity(request.quantity() == null ? "1 phần" : request.quantity())
                .price(request.price() == null ? 0 : request.price())
                .category(category)
                .done(false)
                .build();
        return toResponse(shoppingItemRepository.save(item));
    }

    @Transactional
    public ShoppingItemResponse toggle(Long userId, Long id) {
        ShoppingItem item = findItem(userId, id);
        boolean newDone = !Boolean.TRUE.equals(item.getDone());
        item.setDone(newDone);
        ShoppingItem saved = shoppingItemRepository.save(item);
        if (newDone) {
            pushToFridge(userId, item.getName(), item.getQuantity());
        }
        return toResponse(saved);
    }

    @Transactional
    public ShoppingItemResponse update(Long userId, Long id, ShoppingItemRequest request) {
        ShoppingItem item = findItem(userId, id);
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
    public void delete(Long userId, Long id) {
        shoppingItemRepository.delete(findItem(userId, id));
    }

    @Transactional
    public void clearDone(Long userId) {
        shoppingItemRepository.findByUserIdOrderByIdAsc(userId)
                .stream()
                .filter(i -> Boolean.TRUE.equals(i.getDone()))
                .forEach(shoppingItemRepository::delete);
    }

    @Transactional
    public void clearAll(Long userId) {
        shoppingItemRepository.deleteByUserId(userId);
    }

    /**
     * Dọn toàn bộ danh sách mua sắm của một người dùng — phục vụ endpoint nội bộ
     * {@code DELETE /internal/users/{userId}/data} khi admin xoá tài khoản.
     *
     * @return số dòng {@code shopping_items} đã xoá
     */
    @Transactional
    public int purgeUserData(Long userId) {
        if (userId == null) {
            return 0;
        }
        return (int) shoppingItemRepository.deleteByUserId(userId);
    }

    /**
     * Mua xong → nạp vào tủ lạnh của inventory-service.
     *
     * <p>Số lượng là chuỗi tự do ("500g", "2 hộp"...). Nếu parse được thì tách số lượng/đơn vị
     * như trước; nếu không parse được thì gửi {@code null} và để inventory-service tự quyết định.</p>
     */
    private void pushToFridge(Long userId, String name, String quantityStr) {
        if (name == null || name.isBlank()) {
            return;
        }
        Double quantity = null;
        String unit = null;
        if (quantityStr != null && !quantityStr.isBlank()) {
            Matcher matcher = QUANTITY_PATTERN.matcher(quantityStr.trim());
            if (matcher.find()) {
                try {
                    quantity = Double.parseDouble(matcher.group(1).replace(",", "."));
                    String parsedUnit = matcher.group(2).trim();
                    if (!parsedUnit.isBlank()) {
                        unit = parsedUnit;
                    }
                } catch (NumberFormatException ignored) {
                    quantity = null;
                    unit = null;
                }
            }
        }
        inventoryServiceClient.addFridgeItem(userId, name.trim(), quantity, unit);
    }

    private ShoppingItem findItem(Long userId, Long id) {
        return shoppingItemRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new BusinessException(404, "Không tìm thấy mục mua sắm"));
    }

    private ShoppingItemResponse toResponse(ShoppingItem item) {
        return new ShoppingItemResponse(
                item.getId(),
                item.getName(),
                item.getQuantity(),
                item.getPrice(),
                item.getCategory(),
                item.getDone(),
                item.getCreatedAt()
        );
    }
}
