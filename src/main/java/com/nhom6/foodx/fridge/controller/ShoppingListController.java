package com.nhom6.foodx.fridge.controller;

import com.nhom6.foodx.fridge.dto.FridgeItemRequest;
import com.nhom6.foodx.fridge.dto.ShoppingListRequest;
import com.nhom6.foodx.fridge.dto.ShoppingListResponse;
import com.nhom6.foodx.fridge.service.ShoppingListService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shopping-lists")
@CrossOrigin("*")
public class ShoppingListController {

    private final ShoppingListService service;

    public ShoppingListController(ShoppingListService service) {
        this.service = service;
    }

    @GetMapping
    public List<ShoppingListResponse> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public ShoppingListResponse getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ShoppingListResponse create(@Valid @RequestBody ShoppingListRequest request) {
        return service.create(request);
    }

    @PostMapping("/{listId}/items")
    public ShoppingListResponse addItem(@PathVariable Long listId,
                                        @Valid @RequestBody FridgeItemRequest itemRequest) {
        return service.addItem(listId, itemRequest);
    }

    @PutMapping("/{listId}/items/{itemId}/toggle")
    public ShoppingListResponse toggleBought(@PathVariable Long listId,
                                             @PathVariable Long itemId) {
        return service.toggleBought(listId, itemId);
    }

    @DeleteMapping("/{listId}/items/{itemId}")
    public ShoppingListResponse removeItem(@PathVariable Long listId,
                                           @PathVariable Long itemId) {
        return service.removeItem(listId, itemId);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}

