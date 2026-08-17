package com.nhom6.foodx.fridge.controller;

import com.nhom6.foodx.fridge.dto.FridgeItemRequest;
import com.nhom6.foodx.fridge.dto.FridgeItemResponse;
import com.nhom6.foodx.fridge.service.FridgeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fridge")
@CrossOrigin("*")
public class FridgeController {

    private final FridgeService service;

    public FridgeController(FridgeService service) {
        this.service = service;
    }
    @GetMapping
    public List<FridgeItemResponse> getAllItems(@RequestParam(required = false) String category,
                                                @RequestParam(required = false) String search) {
        return service.getAll(category, search);
    }

    @GetMapping("/{id}")
    public FridgeItemResponse getItem(@PathVariable Long id) {
        return service.getById(id);
    }
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FridgeItemResponse addItem(@Valid @RequestBody FridgeItemRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public FridgeItemResponse updateItem(@PathVariable Long id,
                                         @Valid @RequestBody FridgeItemRequest request) {
        return service.update(id, request);
    }

    @PutMapping("/{id}/quantity")
    public FridgeItemResponse updateQuantity(@PathVariable Long id,
                                             @RequestParam Double quantity) {
        return service.updateQuantity(id, quantity);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteItem(@PathVariable Long id) {
        service.delete(id);
    }
}

