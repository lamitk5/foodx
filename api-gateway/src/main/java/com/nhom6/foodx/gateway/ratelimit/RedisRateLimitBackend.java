package com.nhom6.foodx.gateway.ratelimit;

import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;

import java.time.Duration;

/**
 * Rate-limit qua Redis (INCR + EXPIRE). Dùng chung khi chạy nhiều instance gateway.
 * Bật bằng: app.rate-limit.backend=redis + spring.data.redis.host
 */
@Slf4j
public class RedisRateLimitBackend implements RateLimitBackend {

    private final StringRedisTemplate redisTemplate;

    public RedisRateLimitBackend(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Override
    public long incrementAndGet(String key, long windowSeconds) {
        String redisKey = "foodx:rl:" + key + ":" + (System.currentTimeMillis() / (windowSeconds * 1000L));
        Long count = redisTemplate.opsForValue().increment(redisKey);
        if (count != null && count == 1L) {
            redisTemplate.expire(redisKey, Duration.ofSeconds(windowSeconds + 5));
        }
        return count == null ? 1L : count;
    }

    @Override
    public String name() {
        return "redis";
    }
}
