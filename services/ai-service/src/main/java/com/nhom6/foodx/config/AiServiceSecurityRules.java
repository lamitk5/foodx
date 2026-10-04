package com.nhom6.foodx.config;

import com.nhom6.foodx.common.security.PublicEndpoints;
import com.nhom6.foodx.common.security.SecurityRule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;

import java.util.List;

/**
 * Endpoint công khai của <b>ai-service</b>.
 *
 * <p>Chỉ {@code GET /api/ai/status} là công khai (màn hình trạng thái AI ở trang chủ).
 * Các endpoint còn lại — chat, suggest, parse-recipe, scan-food-image — đều yêu cầu đăng
 * nhập. Riêng tác vụ sinh văn bản / phân tích công thức cho service khác nay nằm dưới
 * {@code /internal/ai/**} (đã được foodx-common chặn bằng {@code ROLE_INTERNAL}), nên
 * không còn khai báo công khai ở đây.</p>
 */
@Configuration
public class AiServiceSecurityRules {

    @Bean
    public PublicEndpoints aiServicePublicEndpoints() {
        return () -> List.of(
                SecurityRule.permitAll(HttpMethod.GET, "/api/ai/status"),
                SecurityRule.authenticated("/api/**")
        );
    }
}
