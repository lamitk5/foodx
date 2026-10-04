package com.nhom6.foodx.config;

import com.nhom6.foodx.common.security.PublicEndpoints;
import com.nhom6.foodx.common.security.SecurityRule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;

import java.util.List;

/**
 * Endpoint của <b>social-stats-service</b> — service tự khai báo, không biết endpoint
 * của service khác.
 *
 * <p>Thứ tự khai báo quan trọng (khớp trước thắng): {@code /api/social/posts/my} phải
 * đứng trước {@code /api/social/posts/*} để không bị coi là công khai.</p>
 */
@Configuration
public class SocialStatsServiceSecurityRules {

    @Bean
    public PublicEndpoints socialStatsServicePublicEndpoints() {
        return () -> List.of(
                // Bài đăng của tôi — bắt buộc đăng nhập (phải đứng trước rule công khai bên dưới)
                SecurityRule.authenticated(HttpMethod.GET, "/api/social/posts/my"),
                // Feed công khai (đọc được cả khi ẩn danh)
                SecurityRule.permitAll(HttpMethod.GET, "/api/social/posts"),
                // Chi tiết một bài chia sẻ
                SecurityRule.permitAll(HttpMethod.GET, "/api/social/posts/*"),
                // Bình luận của một bài chia sẻ
                SecurityRule.permitAll(HttpMethod.GET, "/api/social/posts/*/comments"),
                // Còn lại (đăng bài, thích, bình luận, thống kê...) bắt buộc đăng nhập
                SecurityRule.authenticated("/api/**")
        );
    }
}
