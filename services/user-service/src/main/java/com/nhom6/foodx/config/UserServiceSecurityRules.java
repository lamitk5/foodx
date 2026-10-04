package com.nhom6.foodx.config;

import com.nhom6.foodx.common.security.PublicEndpoints;
import com.nhom6.foodx.common.security.SecurityRule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;

import java.util.List;

/**
 * Endpoint công khai của <b>user-service</b>.
 *
 * <p>Mỗi service tự khai báo danh sách của mình; khung phân quyền nằm ở
 * {@code foodx-common}. Nhờ vậy user-service không còn biết đường dẫn của
 * recipe/social/fridge như trước.</p>
 */
@Configuration
public class UserServiceSecurityRules {

    @Bean
    public PublicEndpoints userServicePublicEndpoints() {
        return () -> List.of(
                // Đăng ký / đăng nhập là công khai
                SecurityRule.permitAll(HttpMethod.POST, "/api/auth/register"),
                SecurityRule.permitAll(HttpMethod.POST, "/api/auth/login"),
                // Trang tĩnh & ảnh đại diện
                SecurityRule.permitAll("/"),
                SecurityRule.permitAll("/index.html"),
                SecurityRule.permitAll("/css/**"),
                SecurityRule.permitAll("/js/**"),
                SecurityRule.permitAll("/images/**"),
                SecurityRule.permitAll(HttpMethod.GET, "/uploads/**"),
                // Còn lại (hồ sơ, admin, đổi mật khẩu...) bắt buộc đăng nhập
                SecurityRule.authenticated("/api/**")
        );
    }
}
