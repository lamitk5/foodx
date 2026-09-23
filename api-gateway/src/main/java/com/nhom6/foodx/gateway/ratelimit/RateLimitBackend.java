package com.nhom6.foodx.gateway.ratelimit;

/**
 * Backend lưu đếm rate-limit theo key (IP hoặc user).
 */
public interface RateLimitBackend {

    /**
     * Tăng counter trong cửa sổ 60s và trả về số request đã đếm.
     * @return count &gt; limit nghĩa là vượt
     */
    long incrementAndGet(String key, long windowSeconds);

    String name();
}
