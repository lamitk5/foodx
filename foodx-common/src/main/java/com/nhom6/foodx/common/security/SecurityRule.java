package com.nhom6.foodx.common.security;

import org.springframework.http.HttpMethod;

/**
 * Một quy tắc phân quyền của riêng một microservice.
 *
 * @param method  HTTP method cần khớp; {@code null} = mọi method
 * @param pattern Ant pattern của đường dẫn
 * @param permitAll {@code true} = công khai, {@code false} = bắt buộc đăng nhập
 */
public record SecurityRule(HttpMethod method, String pattern, boolean permitAll) {

    public static SecurityRule permitAll(String pattern) {
        return new SecurityRule(null, pattern, true);
    }

    public static SecurityRule permitAll(HttpMethod method, String pattern) {
        return new SecurityRule(method, pattern, true);
    }

    public static SecurityRule authenticated(String pattern) {
        return new SecurityRule(null, pattern, false);
    }

    public static SecurityRule authenticated(HttpMethod method, String pattern) {
        return new SecurityRule(method, pattern, false);
    }
}
