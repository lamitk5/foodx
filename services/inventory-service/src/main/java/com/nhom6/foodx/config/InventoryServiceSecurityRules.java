package com.nhom6.foodx.config;

import com.nhom6.foodx.common.security.PublicEndpoints;
import com.nhom6.foodx.common.security.SecurityRule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;

import java.util.List;

/**
 * Endpoint công khai của inventory-service — service tự khai báo, không biết
 * endpoint của service khác.
 *
 * <p>Chỉ áp dụng cho các API công khai của chính service này. Toàn bộ
 * {@code /internal/**} do {@code foodx-common} chặn bằng {@code ROLE_INTERNAL}
 * nên không khai báo ở đây.</p>
 */
@Configuration
public class InventoryServiceSecurityRules {

    @Bean
    public PublicEndpoints inventoryServicePublicEndpoints() {
        return () -> List.of(
                // Danh mục nguyên liệu công khai cho khách xem
                SecurityRule.permitAll(HttpMethod.GET, "/api/ingredients/**"),
                // Ảnh tải lên (avatar, ảnh món ăn)
                SecurityRule.permitAll(HttpMethod.GET, "/uploads/**"),
                // Tủ lạnh, upload ảnh... bắt buộc đăng nhập
                SecurityRule.authenticated("/api/**")
        );
    }
}
