package com.nhom6.foodx.fridge.dto;

import com.nhom6.foodx.fridge.entity.ShoppingList;
import com.nhom6.foodx.fridge.entity.ShoppingListItem;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
public class ShoppingListResponse {

    private Long id;
    private Long userId;
    private String name;
    private LocalDateTime createdAt;
    private List<ShoppingListItemDto> items;

    @Data
    public static class ShoppingListItemDto {
        private Long id;
        private String ingredientName;
        private Double quantity;
        private String unit;
        private boolean bought;

        public static ShoppingListItemDto from(ShoppingListItem item) {
            ShoppingListItemDto dto = new ShoppingListItemDto();
            dto.setId(item.getId());
            dto.setIngredientName(item.getIngredientName());
            dto.setQuantity(item.getQuantity());
            dto.setUnit(item.getUnit());
            dto.setBought(item.isBought());
            return dto;
        }
    }

    public static ShoppingListResponse from(ShoppingList list) {
        ShoppingListResponse res = new ShoppingListResponse();
        res.setId(list.getId());
        res.setUserId(list.getUserId());
        res.setName(list.getName());
        res.setCreatedAt(list.getCreatedAt());
        if (list.getItems() != null) {
            res.setItems(list.getItems().stream()
                    .map(ShoppingListItemDto::from)
                    .collect(Collectors.toList()));
        }
        return res;
    }
}
