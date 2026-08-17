package com.nhom6.foodx.fridge.service;

import com.nhom6.foodx.fridge.dto.FridgeItemRequest;
import com.nhom6.foodx.fridge.dto.FridgeItemResponse;
import com.nhom6.foodx.fridge.entity.FridgeItem;
import com.nhom6.foodx.fridge.repository.FridgeItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class FridgeService {

    private final FridgeItemRepository repository;

    /** Số ngày hạn sử dụng mặc định theo danh mục */
    private static final Map<String, Integer> SHELF_DAYS = Map.of(
            "Thịt", 5,
            "Hải Sản", 5,
            "Rau Củ", 2,
            "Gia Vị", 30
    );
    private static final int DEFAULT_SHELF_DAYS = 7;

    public FridgeService(FridgeItemRepository repository) {
        this.repository = repository;
    }

    public List<FridgeItemResponse> getAll(String category, String search) {
        List<FridgeItem> items;
        if (search != null && !search.isBlank()) {
            items = repository.findByNameContainingIgnoreCase(search.trim());
        } else if (category != null && !category.isBlank() && !category.equals("Tất Cả")) {
            items = repository.findByCategory(category);
        } else {
            items = repository.findAll();
        }
        return items.stream().map(FridgeItemResponse::from).collect(Collectors.toList());
    }

    public FridgeItemResponse getById(Long id) {
        return FridgeItemResponse.from(findOrThrow(id));
    }

    @Transactional
    public FridgeItemResponse create(FridgeItemRequest request) {
        FridgeItem item = new FridgeItem();
        apply(item, request);
        return FridgeItemResponse.from(repository.save(item));
    }

    @Transactional
    public FridgeItemResponse update(Long id, FridgeItemRequest request) {
        FridgeItem item = findOrThrow(id);
        apply(item, request);
        return FridgeItemResponse.from(repository.save(item));
    }

    @Transactional
    public FridgeItemResponse updateQuantity(Long id, Double quantity) {
        FridgeItem item = findOrThrow(id);
        item.setQuantity(quantity);
        return FridgeItemResponse.from(repository.save(item));
    }

    @Transactional
    public void delete(Long id) {
        repository.deleteById(id);
    }

    private void apply(FridgeItem item, FridgeItemRequest req) {
        item.setUserId(req.getUserId());
        item.setName(req.getName());
        item.setCategory(req.getCategory());
        item.setQuantity(req.getQuantity());
        item.setUnit(req.getUnit());
        item.setImageUrl(req.getImageUrl());
        item.setNote(req.getNote());

        // Ngày thêm: nếu người dùng chọn thì dùng, không thì lấy hôm nay
        LocalDate dateAdded = req.getDateAdded() != null ? req.getDateAdded() : LocalDate.now();
        item.setCreatedAt(dateAdded.atStartOfDay());

        // Hạn sử dụng: ưu tiên người gửi (expiryDate); nếu không thì tự tính = dateAdded + số ngày theo danh mục
        LocalDate expiry = req.getExpiryDate() != null ? req.getExpiryDate() : dateAdded.plusDays(shelfDays(req.getCategory()));
        item.setExpiryDate(expiry);
    }

    /** Hệ thống tự tính hạn sử dụng (số ngày) theo danh mục */
    private int shelfDays(String category) {
        if (category == null) return DEFAULT_SHELF_DAYS;
        return SHELF_DAYS.getOrDefault(category.trim(), DEFAULT_SHELF_DAYS);
    }

    private FridgeItem findOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy nguyên liệu với id = " + id));
    }
}

