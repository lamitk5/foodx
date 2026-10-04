package com.nhom6.foodx.common.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpMethod;
import org.springframework.web.client.RestClient;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Yêu cầu các service khác dọn dữ liệu của một người dùng đã bị xoá.
 *
 * <p>Trước refactor, user-service tự chạy {@code DELETE FROM fridge_stock / recipe_posts /
 * meal_plan_entries / chat_sessions / ...} bằng {@code JdbcTemplate} — tức là biết và ghi
 * thẳng vào bảng của 5 service khác. Nay mỗi service tự dọn bảng của mình qua
 * {@code DELETE /internal/users/{userId}/data}; user-service chỉ điều phối.</p>
 *
 * <p>Đây là bước dọn dẹp "best effort": service nào không phản hồi thì ghi log và bỏ qua,
 * không chặn việc xoá tài khoản.</p>
 */
public class UserPurgeClient {

    private static final Logger log = LoggerFactory.getLogger(UserPurgeClient.class);

    private final Map<String, RestClient> targets = new LinkedHashMap<>();

    public UserPurgeClient(RestClient.Builder builder, FoodxProperties properties) {
        String token = properties.getInternal().getToken();
        FoodxProperties.Services services = properties.getServices();
        // user-service không nằm trong danh sách: nó tự xoá bảng users/profiles của mình.
        targets.put("inventory-service", client(builder, services.getInventoryService(), token));
        targets.put("recipe-service", client(builder, services.getRecipeService(), token));
        targets.put("plan-shopping-service", client(builder, services.getPlanShoppingService(), token));
        targets.put("ai-service", client(builder, services.getAiService(), token));
        targets.put("social-stats-service", client(builder, services.getSocialStatsService(), token));
    }

    private RestClient client(RestClient.Builder builder, String baseUrl, String token) {
        return builder.clone()
                .baseUrl(baseUrl)
                .defaultHeader(com.nhom6.foodx.common.security.InternalTokenFilter.HEADER, token)
                .build();
    }

    /**
     * @return tổng số dòng đã xoá ở các service phản hồi được
     */
    public int purgeUserData(Long userId) {
        if (userId == null) {
            return 0;
        }
        int total = 0;
        for (Map.Entry<String, RestClient> entry : targets.entrySet()) {
            try {
                Integer deleted = entry.getValue()
                        .method(HttpMethod.DELETE)
                        .uri(InternalApi.USER_DATA_PURGE, userId)
                        .retrieve()
                        .body(Integer.class);
                total += deleted == null ? 0 : deleted;
            } catch (Exception ex) {
                log.warn("Không dọn được dữ liệu người dùng {} ở {}: {}",
                        userId, entry.getKey(), ex.getMessage());
            }
        }
        return total;
    }
}
