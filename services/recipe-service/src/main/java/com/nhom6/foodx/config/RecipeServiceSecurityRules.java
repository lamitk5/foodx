package com.nhom6.foodx.config;

import com.nhom6.foodx.common.security.PublicEndpoints;
import com.nhom6.foodx.common.security.SecurityRule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;

import java.util.List;

/**
 * Endpoint công khai của <b>recipe-service</b>.
 *
 * <p>Mỗi service tự khai báo danh sách của mình; khung phân quyền nằm ở
 * {@code foodx-common}. Thứ tự khai báo quan trọng: quy tắc khớp trước thắng, nên các
 * endpoint cá nhân hoá ({@code /saved}, {@code /match}, {@code /import}) phải đứng
 * trước pattern công khai {@code GET /api/recipes/*}.</p>
 *
 * <p>recipe-service không phục vụ tài nguyên tĩnh — giao diện và ảnh nằm ở api-gateway —
 * nên không cần khai báo quy tắc cho {@code /index.html}, {@code /css/**}, {@code /images/**}.</p>
 */
@Configuration
public class RecipeServiceSecurityRules {

    @Bean
    public PublicEndpoints recipeServicePublicEndpoints() {
        return () -> List.of(
                // Công thức đã lưu của tôi — luôn yêu cầu đăng nhập
                SecurityRule.authenticated(HttpMethod.GET, "/api/recipes/saved"),
                // "Nấu với tủ của tôi" — cần biết user nào
                SecurityRule.authenticated(HttpMethod.GET, "/api/recipes/match"),
                // Import công thức từ text/URL
                SecurityRule.authenticated(HttpMethod.POST, "/api/recipes/import"),
                // Yêu thích là dữ liệu cá nhân
                SecurityRule.authenticated("/api/favorites/**"),
                // Dữ liệu trang chủ công khai
                SecurityRule.permitAll(HttpMethod.GET, "/api/home/**"),
                // Danh sách công thức công khai
                SecurityRule.permitAll(HttpMethod.GET, "/api/recipes"),
                // Chi tiết công thức & tìm ảnh công khai
                SecurityRule.permitAll(HttpMethod.GET, "/api/recipes/*"),
                // Còn lại (tạo/sửa/xoá công thức...) bắt buộc đăng nhập
                SecurityRule.authenticated("/api/**")
        );
    }
}
