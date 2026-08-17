package com.nhom6.foodx.fridge.service;

import com.nhom6.foodx.fridge.dto.FridgeItemRequest;
import com.nhom6.foodx.fridge.dto.ShoppingListRequest;
import com.nhom6.foodx.fridge.dto.ShoppingListResponse;
import com.nhom6.foodx.fridge.entity.ShoppingList;
import com.nhom6.foodx.fridge.entity.ShoppingListItem;
import com.nhom6.foodx.fridge.repository.ShoppingListItemRepository;
import com.nhom6.foodx.fridge.repository.ShoppingListRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ShoppingListService {

    private final ShoppingListRepository repository;
    private final ShoppingListItemRepository itemRepository;

    public ShoppingListService(ShoppingListRepository repository,
                               ShoppingListItemRepository itemRepository) {
        this.repository = repository;
        this.itemRepository = itemRepository;
    }

    public List<ShoppingListResponse> getAll() {
        return repository.findAll().stream()
                .map(ShoppingListResponse::from)
                .collect(Collectors.toList());
    }

    public ShoppingListResponse getById(Long id) {
        return ShoppingListResponse.from(findOrThrow(id));
    }

    @Transactional
    public ShoppingListResponse create(ShoppingListRequest request) {
        ShoppingList list = new ShoppingList();
        list.setUserId(request.getUserId());
        list.setName(request.getName());
        if (request.getItems() != null) {
            for (FridgeItemRequest itemReq : request.getItems()) {
                list.getItems().add(toItem(itemReq, list));
            }
        }
        return ShoppingListResponse.from(repository.save(list));
    }

    @Transactional
    public ShoppingListResponse addItem(Long listId, FridgeItemRequest itemReq) {
        ShoppingList list = findOrThrow(listId);
        list.getItems().add(toItem(itemReq, list));
        return ShoppingListResponse.from(repository.save(list));
    }

    @Transactional
    public ShoppingListResponse removeItem(Long listId, Long itemId) {
        ShoppingList list = findOrThrow(listId);
        list.getItems().removeIf(i -> i.getId().equals(itemId));
        return ShoppingListResponse.from(repository.save(list));
    }
    @Transactional
    public ShoppingListResponse toggleBought(Long listId, Long itemId) {
        ShoppingListItem item = itemRepository.findById(itemId)
                .filter(i -> i.getShoppingList() != null
                        && i.getShoppingList().getId().equals(listId))
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy mục mua sắm"));
        item.setBought(!item.isBought());
        itemRepository.save(item);
        return ShoppingListResponse.from(findOrThrow(listId));
    }

    @Transactional
    public void delete(Long id) {
        repository.deleteById(id);
    }

    private ShoppingListItem toItem(FridgeItemRequest req, ShoppingList list) {
        ShoppingListItem item = new ShoppingListItem();
        item.setIngredientName(req.getName());
        item.setQuantity(req.getQuantity());
        item.setUnit(req.getUnit());
        item.setShoppingList(list);
        return item;
    }

    private ShoppingList findOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy danh sách mua sắm với id = " + id));
    }
}

