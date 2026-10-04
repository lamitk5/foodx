package com.nhom6.foodx.config;

import com.nhom6.foodx.common.security.PublicEndpoints;
import com.nhom6.foodx.common.security.SecurityRule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * Endpoint công khai của plan-shopping-service — service tự khai báo, không biết endpoint của service khác.
 *
 * <p>Toàn bộ endpoint của service ({@code /api/plan/**}, {@code /api/shopping/**}) đều thao tác trên
 * dữ liệu riêng của người dùng nên đều yêu cầu JWT; không có endpoint công khai nào.
 * Các endpoint {@code /internal/**} do foodx-common tự chặn bằng {@code ROLE_INTERNAL}.</p>
 */
@Configuration
public class PlanShoppingServiceSecurityRules {

    @Bean
    public PublicEndpoints planShoppingServicePublicEndpoints() {
        return () -> List.of(
                SecurityRule.authenticated("/api/**")
        );
    }
}
