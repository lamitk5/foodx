package com.nhom6.foodx.common.client;

import com.nhom6.foodx.common.dto.ConsumeItemDto;
import com.nhom6.foodx.common.dto.FridgeItemDto;
import com.nhom6.foodx.common.dto.IngredientRefDto;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.web.client.RestClient;

import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Client gọi inventory-service — service duy nhất sở hữu bảng {@code foods},
 * {@code ingredients} và {@code fridge_stock}.
 */
public class InventoryServiceClient extends AbstractFoodxClient {

    public InventoryServiceClient(RestClient.Builder builder, String baseUrl, String internalToken) {
        super(builder, baseUrl, internalToken);
    }

    // ------------------------------------------------------------------ tủ lạnh

    public List<FridgeItemDto> getFridgeItems(Long userId) {
        if (userId == null) {
            return List.of();
        }
        return getList(InternalApi.FRIDGE_ITEMS, new ParameterizedTypeReference<>() {
        }, userId);
    }

    /** Tên thực phẩm đang có trong tủ (đã lọc trùng, giữ nguyên thứ tự thêm vào). */
    public List<String> getFridgeFoodNames(Long userId) {
        if (userId == null) {
            return List.of();
        }
        return getList(InternalApi.FRIDGE_FOOD_NAMES, new ParameterizedTypeReference<>() {
        }, userId);
    }

    /** Thêm một thực phẩm vào tủ (dùng khi người dùng tích "đã mua" trong danh sách đi chợ). */
    public Optional<FridgeItemDto> addFridgeItem(Long userId, String name, Double quantity, String unit) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("name", name);
        body.put("quantity", quantity);
        body.put("unit", unit);
        return postOptional(InternalApi.FRIDGE_ITEMS, FridgeItemDto.class, body, userId);
    }

    /**
     * Trừ nguyên liệu khỏi tủ sau khi nấu. Nghiệp vụ quy đổi đơn vị và khớp tên nằm ở
     * inventory-service; trả về số dòng đã thay đổi.
     */
    public int consumeFridgeItems(Long userId, List<ConsumeItemDto> items) {
        if (userId == null || items == null || items.isEmpty()) {
            return 0;
        }
        Integer changed = postOptional(InternalApi.FRIDGE_CONSUME, Integer.class, items, userId).orElse(0);
        return changed == null ? 0 : changed;
    }

    // -------------------------------------------------------------- danh mục nguyên liệu

    /** Đảm bảo nguyên liệu tồn tại trong danh mục; tạo mới nếu chưa có. */
    public Optional<IngredientRefDto> ensureIngredient(String name, String category) {
        if (name == null || name.isBlank()) {
            return Optional.empty();
        }
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("name", name);
        body.put("category", category);
        return postOptional(InternalApi.INGREDIENTS_ENSURE, IngredientRefDto.class, body);
    }

    /** Tra cứu nhiều nguyên liệu theo tên trong một lời gọi. */
    public Map<String, IngredientRefDto> resolveIngredients(Collection<String> names) {
        Map<String, IngredientRefDto> result = new LinkedHashMap<>();
        if (names == null || names.isEmpty()) {
            return result;
        }
        String joined = names.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(n -> !n.isEmpty())
                .distinct()
                .collect(Collectors.joining(","));
        if (joined.isEmpty()) {
            return result;
        }
        List<IngredientRefDto> refs = getList(InternalApi.INGREDIENTS_RESOLVE + "?names={names}",
                new ParameterizedTypeReference<>() {
                }, joined);
        for (IngredientRefDto ref : refs) {
            result.put(ref.name().toLowerCase(), ref);
        }
        return result;
    }

    public Optional<IngredientRefDto> getIngredient(Long id) {
        if (id == null) {
            return Optional.empty();
        }
        return getOptional(InternalApi.INGREDIENT_BY_ID, IngredientRefDto.class, id);
    }

    /** Tra nhiều nguyên liệu theo id trong một lời gọi (tránh N+1). */
    public Map<Long, IngredientRefDto> getIngredients(Collection<Long> ids) {
        Map<Long, IngredientRefDto> result = new LinkedHashMap<>();
        if (ids == null || ids.isEmpty()) {
            return result;
        }
        String joined = ids.stream()
                .filter(Objects::nonNull)
                .distinct()
                .map(String::valueOf)
                .collect(Collectors.joining(","));
        if (joined.isEmpty()) {
            return result;
        }
        List<IngredientRefDto> refs = getList(InternalApi.INGREDIENTS + "?ids={ids}",
                new ParameterizedTypeReference<>() {
                }, joined);
        for (IngredientRefDto ref : refs) {
            result.put(ref.id(), ref);
        }
        return result;
    }
}
