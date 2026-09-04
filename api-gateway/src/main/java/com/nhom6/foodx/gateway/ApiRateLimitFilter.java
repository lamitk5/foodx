package com.nhom6.foodx.gateway;

import com.nhom6.foodx.gateway.ratelimit.RateLimitBackend;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.Semaphore;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Chống lạm dụng cho endpoint đắt tiền:
 * - Rate-limit theo user (JWT) nếu có, không thì theo IP.
 * - Bulkhead toàn cục cho AI path để không nhận quá nhiều request LLM cùng lúc.
 */
@Slf4j
@Component
public class ApiRateLimitFilter extends OncePerRequestFilter {

    private static final Set<String> LIMITED_PREFIXES = Set.of(
            "/api/ai/chat",
            "/api/ai/suggest",
            "/api/ai/generate",
            "/api/chat",
            "/api/fridge/search-image",
            "/api/recipes/search-image",
            "/api/fridge/estimate-nutrition",
            "/api/fridge/scan-image",
            "/api/upload");

    private static final Set<String> AI_PREFIXES = Set.of(
            "/api/ai/chat",
            "/api/ai/suggest",
            "/api/ai/generate",
            "/api/chat/sessions");

    private final RateLimitBackend backend;
    private final String jwtSecret;
    private final int limitPerMinute;
    private final Semaphore aiBulkhead;
    private final AtomicLong rejectedByRateLimit = new AtomicLong();
    private final AtomicLong rejectedByBulkhead = new AtomicLong();

    public ApiRateLimitFilter(
            RateLimitBackend backend,
            @Value("${app.rate-limit-per-minute:120}") int limitPerMinute,
            @Value("${app.ai.max-concurrent-global:24}") int maxAiConcurrentGlobal,
            @Value("${app.jwt.secret:dev-super-secret-key-please-change-this-key-32bytes!!}") String jwtSecret) {
        this.backend = backend;
        this.limitPerMinute = Math.max(1, limitPerMinute);
        this.jwtSecret = jwtSecret;
        this.aiBulkhead = new Semaphore(Math.max(1, maxAiConcurrentGlobal), true);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return LIMITED_PREFIXES.stream().noneMatch(path::startsWith);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        String key = resolveRateKey(request);
        long count = backend.incrementAndGet(key, 60);
        if (count > limitPerMinute) {
            rejectedByRateLimit.incrementAndGet();
            log.warn("Rate limit exceeded ({}={}) on {}", backend.name(), key, request.getRequestURI());
            write429(response);
            return;
        }

        String path = request.getRequestURI();
        boolean isAiPath = AI_PREFIXES.stream().anyMatch(path::startsWith)
                && "POST".equalsIgnoreCase(request.getMethod());

        if (!isAiPath) {
            chain.doFilter(request, response);
            return;
        }

        boolean acquired;
        try {
            acquired = aiBulkhead.tryAcquire(2, TimeUnit.SECONDS);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            write503(response);
            return;
        }
        if (!acquired) {
            rejectedByBulkhead.incrementAndGet();
            log.warn("Gateway AI bulkhead full, reject {}", path);
            write503(response);
            return;
        }
        try {
            chain.doFilter(request, response);
        } finally {
            aiBulkhead.release();
        }
    }

    /** Ưu tiên user từ JWT (nhiều user cùng NAT/IP vẫn fair); fallback IP. */
    private String resolveRateKey(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) {
            String subject = parseJwtSubject(auth.substring(7));
            if (subject != null && !subject.isBlank()) {
                return "u:" + subject;
            }
        }
        return "ip:" + resolveClientIp(request);
    }

    private String parseJwtSubject(String token) {
        try {
            // Gateway không verify full signature (service con làm) — chỉ đọc subject để key rate-limit.
            String[] parts = token.split("\\.");
            if (parts.length < 2) {
                return null;
            }
            byte[] payload = Base64.getUrlDecoder().decode(parts[1]);
            String json = new String(payload, StandardCharsets.UTF_8);
            int idx = json.indexOf("\"sub\"");
            if (idx < 0) {
                // fallback: username claim
                idx = json.indexOf("\"username\"");
            }
            if (idx < 0) {
                return null;
            }
            int start = json.indexOf('"', json.indexOf(':', idx) + 1) + 1;
            int end = json.indexOf('"', start);
            if (start <= 0 || end <= start) {
                return null;
            }
            return json.substring(start, end);
        } catch (Exception ex) {
            return null;
        }
    }

    private String resolveClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            int comma = forwarded.indexOf(',');
            return (comma > 0 ? forwarded.substring(0, comma) : forwarded).trim();
        }
        return request.getRemoteAddr();
    }

    private void write429(HttpServletResponse response) throws IOException {
        response.setStatus(429);
        response.setHeader("Retry-After", "60");
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"success\":false,\"message\":\"Quá nhiều yêu cầu — vui lòng thử lại sau 1 phút\",\"status\":429}");
    }

    private void write503(HttpServletResponse response) throws IOException {
        response.setStatus(503);
        response.setHeader("Retry-After", "3");
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"success\":false,\"message\":\"Hệ thống AI đang bận — thử lại sau vài giây\",\"status\":503}");
    }

    public Map<String, Object> metrics() {
        return Map.of(
                "backend", backend.name(),
                "limitPerMinute", limitPerMinute,
                "aiMaxConcurrentGlobal", aiBulkhead.availablePermits() + (/* inUse estimate */ 0),
                "aiAvailablePermits", aiBulkhead.availablePermits(),
                "rejectedByRateLimit", rejectedByRateLimit.get(),
                "rejectedByBulkhead", rejectedByBulkhead.get());
    }
}
