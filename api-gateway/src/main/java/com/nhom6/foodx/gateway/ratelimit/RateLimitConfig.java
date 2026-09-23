package com.nhom6.foodx.gateway.ratelimit;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.env.Environment;
import org.springframework.data.redis.core.StringRedisTemplate;

@Slf4j
@Configuration
public class RateLimitConfig {

    @Bean
    @Primary
    public RateLimitBackend rateLimitBackend(
            ObjectProvider<StringRedisTemplate> redisTemplateProvider,
            Environment env) {
        String backendType = env.getProperty("app.rate-limit.backend", "memory");
        if ("redis".equalsIgnoreCase(backendType)) {
            StringRedisTemplate redisTemplate = redisTemplateProvider.getIfAvailable();
            if (redisTemplate != null) {
                log.info("RateLimitBackend: Using RedisRateLimitBackend");
                return new RedisRateLimitBackend(redisTemplate);
            } else {
                log.warn("RateLimitBackend: Redis requested but StringRedisTemplate bean not available, falling back to InMemoryRateLimitBackend");
            }
        }
        log.info("RateLimitBackend: Using InMemoryRateLimitBackend");
        return new InMemoryRateLimitBackend();
    }
}