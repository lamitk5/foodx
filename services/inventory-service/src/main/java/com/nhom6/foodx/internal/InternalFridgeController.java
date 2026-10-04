package com.nhom6.foodx.internal;

import com.nhom6.foodx.common.client.InternalApi;
import com.nhom6.foodx.common.dto.ConsumeItemDto;
import com.nhom6.foodx.common.dto.FridgeItemDto;
import com.nhom6.foodx.fridge.dto.FridgeItemResponse;
import com.nhom6.foodx.fridge.service.FridgeConsumptionService;
import com.nhom6.foodx.fridge.service.FridgeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * API nội bộ cho các microservice khác đọc/ghi tủ lạnh.
 *
 * <p>Chỉ tồn tại trong mạng nội bộ (yêu cầu {@code X-Foodx-Internal-Token}), không được
 * API Gateway định tuyến ra ngoài. Trả về <b>JSON thô</b> của DTO/List (không bọc
 * {@code ApiResponse}) theo quy ước {@code /internal/**} của foodx-common.</p>
 *
 * <p>Các đường dẫn dưới đây là phần đuôi của {@link InternalApi#FRIDGE_ITEMS},
 * {@link InternalApi#FRIDGE_FOOD_NAMES} và {@link InternalApi#FRIDGE_CONSUME} — tiền tố
 * {@code InternalApi.PREFIX + "/fridge"} đã khai báo ở cấp class nên không lặp lại hằng số.</p>
 */
@RestController
@RequestMapping(InternalApi.PREFIX + "/fridge")
@RequiredArgsConstructor
public class InternalFridgeController {

    private final FridgeService fridgeService;
    private final FridgeConsumptionService fridgeConsumptionService;

    /** {@code GET /internal/fridge/{userId}/items} — toàn bộ thực phẩm trong tủ. */
    @GetMapping("/{userId}/items")
    public List<FridgeItemDto> getItems(@PathVariable Long userId) {
        return fridgeService.getItems(userId);
    }

    /** {@code GET /internal/fridge/{userId}/food-names} — tên thực phẩm (đã lọc trùng, tối đa 40). */
    @GetMapping("/{userId}/food-names")
    public List<String> getFoodNames(@PathVariable Long userId) {
        return fridgeService.getFoodNames(userId);
    }

    /**
     * {@code POST /internal/fridge/{userId}/items} — thêm một thực phẩm vào tủ,
     * body {@code {"name":"..","quantity":1.0,"unit":"g"}}.
     * Đã có food cùng tên (không phân biệt hoa/thường) thì cộng dồn số lượng.
     *
     * <p>{@code quantity}/{@code unit} có thể {@code null} (bên gọi không parse được số lượng
     * từ chuỗi như "một ít"): endpoint mặc định {@code 1.0} và {@code "phần"} để món vẫn được
     * nạp vào tủ. Hành vi chặt chẽ của API công khai {@code /api/fridge} giữ nguyên.</p>
     */
    @PostMapping("/{userId}/items")
    public FridgeItemDto addItem(@PathVariable Long userId, @RequestBody AddFridgeItemRequest request) {
        Double quantity = (request.quantity() == null || request.quantity() <= 0) ? 1.0 : request.quantity();
        String unit = (request.unit() == null || request.unit().isBlank()) ? "phần" : request.unit().trim();
        return toDto(fridgeService.addItem(userId, request.name(), quantity, unit));
    }

    /**
     * {@code POST /internal/fridge/{userId}/consume} — trừ nguyên liệu đã dùng sau khi nấu,
     * body là mảng {@code [{"name":"Thịt bò","quantity":200.0,"unit":"g"}]}.
     *
     * @return số dòng trong tủ đã thay đổi
     */
    @PostMapping("/{userId}/consume")
    public Integer consume(@PathVariable Long userId, @RequestBody List<ConsumeItemDto> items) {
        return fridgeConsumptionService.consume(userId, items);
    }

    private FridgeItemDto toDto(FridgeItemResponse saved) {
        return new FridgeItemDto(
                saved.id(),
                saved.foodId(),
                saved.name(),
                saved.type(),
                saved.quantity(),
                saved.unit(),
                saved.expiresAt(),
                saved.note(),
                saved.imageUrl()
        );
    }

    /** Body thêm nhanh một thực phẩm vào tủ. */
    public record AddFridgeItemRequest(
            String name,
            Double quantity,
            String unit
    ) {
    }
}
