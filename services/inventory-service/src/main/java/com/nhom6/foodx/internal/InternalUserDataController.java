package com.nhom6.foodx.internal;

import com.nhom6.foodx.common.client.InternalApi;
import com.nhom6.foodx.fridge.service.FridgeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

/**
 * API nội bộ để dọn dữ liệu của một người dùng khi họ yêu cầu xoá tài khoản.
 *
 * <p>Trước đây user-service tự chạy {@code DELETE FROM fridge_stock WHERE user_id = ?}
 * bằng JdbcTemplate xuyên qua service khác. Nay mỗi service tự dọn bảng mình sở hữu:
 * inventory-service xoá {@code fridge_stock}, còn {@code foods}/{@code ingredients} là
 * danh mục dùng chung nên giữ nguyên.</p>
 *
 * <p>Trả về <b>JSON thô</b> (số dòng đã xoá), không bọc {@code ApiResponse}.</p>
 */
@RestController
@RequiredArgsConstructor
public class InternalUserDataController {

    private final FridgeService fridgeService;

    /**
     * {@code DELETE /internal/users/{userId}/data} — xoá toàn bộ tủ lạnh của người dùng.
     * Đường dẫn lấy trực tiếp từ {@link InternalApi#USER_DATA_PURGE} để không lệch với bên gọi.
     *
     * @return số dòng {@code fridge_stock} đã xoá
     */
    @DeleteMapping(InternalApi.USER_DATA_PURGE)
    public Integer purgeUserData(@PathVariable Long userId) {
        return fridgeService.purgeUserData(userId);
    }
}
