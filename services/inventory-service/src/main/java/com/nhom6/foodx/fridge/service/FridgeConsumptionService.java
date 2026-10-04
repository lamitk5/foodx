package com.nhom6.foodx.fridge.service;

import com.nhom6.foodx.common.dto.ConsumeItemDto;
import com.nhom6.foodx.fridge.entity.FridgeItem;
import com.nhom6.foodx.fridge.repository.FridgeItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

/**
 * Vòng tiêu thụ của tủ lạnh: khi người dùng nấu xong một món, trừ nguyên liệu
 * tương ứng khỏi tủ lạnh.
 *
 * <p>Nghiệp vụ này trước đây nằm trong social-stats-service (method
 * {@code deductFridgeStock} của {@code StatsService}) và ghi thẳng vào bảng
 * {@code fridge_stock}. Nay inventory-service — nơi sở hữu tủ lạnh — làm việc đó,
 * còn social-stats-service chỉ gửi lên danh sách nguyên liệu đã dùng
 * ({@code POST /internal/fridge/{userId}/consume}).</p>
 *
 * <p>Ngữ nghĩa giữ nguyên như bản cũ: chỉ trừ khi tên &amp; đơn vị tương thích,
 * tránh trừ nhầm hàng tồn.</p>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FridgeConsumptionService {

    private final FridgeItemRepository fridgeItemRepository;

    /** Nhóm đơn vị khối lượng (quy về g). */
    private static final Map<String, Double> WEIGHT_UNITS = Map.of(
            "g", 1.0, "gr", 1.0, "gam", 1.0, "gram", 1.0,
            "kg", 1000.0, "kilogam", 1000.0, "ki-lo-gam", 1000.0);

    /** Nhóm đơn vị thể tích (quy về ml). */
    private static final Map<String, Double> VOLUME_UNITS = Map.of(
            "ml", 1.0, "l", 1000.0, "lit", 1000.0, "lít", 1000.0);

    /**
     * Trừ các nguyên liệu đã dùng khỏi tủ lạnh của người dùng.
     *
     * <p>Số lượng trong {@code items} là số lượng cuối cùng cần trừ (bên gọi đã
     * nhân theo khẩu phần), nên ở đây không có tham số {@code servings}/scale.</p>
     *
     * @return tổng số dòng trong tủ đã bị thay đổi (cập nhật hoặc xoá)
     */
    @Transactional
    public int consume(Long userId, List<ConsumeItemDto> items) {
        if (userId == null || items == null || items.isEmpty()) {
            return 0;
        }

        List<FridgeItem> fridge = fridgeItemRepository.findByUserIdOrderByIdAsc(userId);
        if (fridge.isEmpty()) {
            return 0;
        }

        int deducted = 0;
        for (ConsumeItemDto consumeItem : items) {
            if (consumeItem == null) {
                continue;
            }
            String target = normalizeKey(consumeItem.name());
            if (target.length() < 2) {
                continue;
            }

            // Tìm món trong tủ khớp tên (chuỗi con hai chiều, không nhạy dấu)
            FridgeItem matched = null;
            for (FridgeItem item : fridge) {
                if (item.getFood() == null || item.getFood().getName() == null) {
                    continue;
                }
                String key = normalizeKey(item.getFood().getName());
                if (key.length() < 2) {
                    continue;
                }
                if (key.equals(target) || key.contains(target) || target.contains(key)) {
                    matched = item;
                    break;
                }
            }
            if (matched == null) {
                continue;
            }

            double amount = consumeItem.quantity() != null ? consumeItem.quantity() : 0;
            if (amount <= 0) {
                continue;
            }
            double stock = matched.getQuantity() == null ? 0 : matched.getQuantity();
            double remaining = subtractAmount(stock, matched.getUnit(), amount, consumeItem.unit());
            if (remaining == stock) {
                continue; // đơn vị không tương thích — không trừ nhầm
            }
            if (remaining <= 0.001) {
                fridgeItemRepository.delete(matched);
                fridge.remove(matched);
                log.debug("Đã xoá '{}' khỏi tủ (dùng hết)",
                        matched.getFood() != null ? matched.getFood().getName() : null);
            } else {
                matched.setQuantity(remaining);
                fridgeItemRepository.save(matched);
            }
            deducted++;
        }
        return deducted;
    }

    /** Trừ amount (đơn vị srcUnit) khỏi stock hiện tại (đơn vị stockUnit); không tương thích → trả về stock cũ. */
    private double subtractAmount(double stock, String stockUnit, double amount, String srcUnit) {
        String su = unitKey(stockUnit);
        String au = unitKey(srcUnit);
        if (su.isEmpty() || au.isEmpty()) {
            return stock;
        }
        if (su.equals(au)) {
            return stock - amount;
        }
        // Đổi qua đơn vị cơ sở cùng nhóm (g/gr/kg... hoặc ml/l...)
        Double suBase = weightOrVolumeBase(su);
        Double auBase = weightOrVolumeBase(au);
        if (suBase != null && auBase != null) {
            double amountInStockUnit = amount * auBase / suBase;
            return stock - amountInStockUnit;
        }
        return stock;
    }

    private Double weightOrVolumeBase(String unit) {
        Double w = WEIGHT_UNITS.get(unit);
        if (w != null) {
            return w;
        }
        return VOLUME_UNITS.get(unit);
    }

    private String unitKey(String unit) {
        return unit == null ? "" : unit.trim().toLowerCase();
    }

    /** Bỏ dấu tiếng Việt + lowercase để so khớp tên. */
    private String normalizeKey(String value) {
        if (value == null) {
            return "";
        }
        String v = value.trim().toLowerCase();
        String nfd = java.text.Normalizer.normalize(v, java.text.Normalizer.Form.NFD);
        return nfd.replaceAll("\\p{InCombiningDiacriticalMarks}+", "").replace("đ", "d");
    }
}
