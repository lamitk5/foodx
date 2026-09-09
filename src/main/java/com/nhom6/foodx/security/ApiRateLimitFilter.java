package com.nhom6.foodx.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nhom6.foodx.common.response.ApiResponse;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Giới hạn tần suất đơn giản (in-memory, theo IP) cho các endpoint "đắt tiền":
 * AI chat/suggest, tìm ảnh mạng, tra cứu dinh dưỡng, upload file.
 * Chặn lạm dụng/đốt quota LLM & tải ảnh. Chỉ dùng một tiến trình; nếu chạy
 * nhiều instance cần chuyển sang Redis/bucket4j.
 */
@Slf4j
@Component
public class ApiRateLimitFilter extends OncePerRequestFilter {

    /** Endpoint áp giới hạn (tiền tố path). */
    private static final Set<String> LIMITED_PREFIXES = Set.of(
            "/api/ai/chat",
            "/api/ai/suggest",
            "/api/fridge/search-image",
            "/api/recipes/search-image",
            "/api/fridge/estimate-nutrition",
            "/api/upload");

    /** ip -> [thời điểm mở cửa sổ (ms), số yêu cầu trong cửa sổ] */
    private final Map<String, long[]> windows = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.rate-limit-per-minute:30}")
    private int limitPerMinute;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return LIMITED_PREFIXES.stream().noneMatch(path::startsWith);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String clientIp = resolveClientIp(request);
        long now = System.currentTimeMillis();
        boolean allowed;
        synchronized (this) {
            if (windows.size() > 10_000) {
                // Dọn các cửa sổ đã hết hạn để map không phình vô hạn
                windows.entrySet().removeIf(e -> now - e.getValue()[0] > 60_000);
            }
            long[] window = windows.computeIfAbsent(clientIp, k -> new long[]{now, 0});
            if (now - window[0] > 60_000) {
                window[0] = now;
                window[1] = 0;
            }
            window[1]++;
            allowed = window[1] <= Math.max(1, limitPerMinute);
        }

        if (!allowed) {
            log.warn("Rate limit exceeded for IP {} on {}", clientIp, request.getRequestURI());
            response.setStatus(429);
            response.setContentType("application/json;charset=UTF-8");
            objectMapper.writeValue(response.getWriter(),
                    ApiResponse.error(429, "Quá nhiều yêu cầu — vui lòng thử lại sau 1 phút"));
            return;
        }
        chain.doFilter(request, response);
    }

    private String resolveClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            int comma = forwarded.indexOf(',');
            return (comma > 0 ? forwarded.substring(0, comma) : forwarded).trim();
        }
        return request.getRemoteAddr();
    }
}
