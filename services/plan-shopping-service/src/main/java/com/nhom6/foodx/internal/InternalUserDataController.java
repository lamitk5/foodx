package com.nhom6.foodx.internal;

import com.nhom6.foodx.common.client.InternalApi;
import com.nhom6.foodx.plan.service.PlanService;
import com.nhom6.foodx.shopping.service.ShoppingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * API nội bộ để dọn dữ liệu của một người dùng khi họ yêu cầu xoá tài khoản.
 *
 * <p>Trước đây user-service tự chạy {@code DELETE FROM meal_plan_entries WHERE user_id = ?} và
 * {@code DELETE FROM shopping_items WHERE user_id = ?} bằng JdbcTemplate xuyên qua bảng của
 * service này. Nay mỗi service tự dọn bảng mình sở hữu: plan-shopping-service xoá
 * {@code meal_plan_entries} và {@code shopping_items}.</p>
 *
 * <p>Trả về <b>JSON thô</b> (số dòng đã xoá), không bọc {@code ApiResponse};
 * {@code /internal/**} do foodx-common chặn bằng {@code ROLE_INTERNAL} nên không cần khai báo
 * trong {@code PlanShoppingServiceSecurityRules}.</p>
 */
@RestController
@RequestMapping(InternalApi.PREFIX + "/users")
@RequiredArgsConstructor
public class InternalUserDataController {

    private final PlanService planService;
    private final ShoppingService shoppingService;

    /**
     * {@code DELETE /internal/users/{userId}/data} — xoá toàn bộ kế hoạch bữa ăn và
     * danh sách mua sắm của người dùng.
     *
     * @return tổng số dòng đã xoá thuộc {@code meal_plan_entries} + {@code shopping_items}
     */
    @DeleteMapping("/{userId}/data")
    public Integer purgeUserData(@PathVariable Long userId) {
        return planService.purgeUserData(userId) + shoppingService.purgeUserData(userId);
    }
}
