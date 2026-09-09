package com.nhom6.foodx.ai.service;

import com.nhom6.foodx.common.exception.BusinessException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.Semaphore;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Bulkhead cho lời gọi LLM: chặn không cho nhiều request AI chạy song song
 * làm treo Tomcat / cạn connection pool DB.
 */
@Slf4j
@Component
public class AiRequestGate {

    private final Semaphore semaphore;
    private final int maxConcurrent;
    private final long acquireTimeoutMs;
    private final AtomicLong succeeded = new AtomicLong();
    private final AtomicLong rejected = new AtomicLong();
    private final AtomicLong totalWaitNanos = new AtomicLong();

    public AiRequestGate(
            @Value("${app.ai.max-concurrent:8}") int maxConcurrent,
            @Value("${app.ai.acquire-timeout-ms:3000}") long acquireTimeoutMs) {
        this.maxConcurrent = Math.max(1, maxConcurrent);
        this.acquireTimeoutMs = Math.max(100, acquireTimeoutMs);
        this.semaphore = new Semaphore(this.maxConcurrent, true);
    }

    public <T> T call(String operation, java.util.function.Supplier<T> action) {
        long start = System.nanoTime();
        boolean acquired;
        try {
            acquired = semaphore.tryAcquire(acquireTimeoutMs, TimeUnit.MILLISECONDS);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            rejected.incrementAndGet();
            throw new BusinessException(503, "AI đang bận — vui lòng thử lại");
        }
        if (!acquired) {
            rejected.incrementAndGet();
            log.warn("AI bulkhead full ({}), reject {}", maxConcurrent, operation);
            throw new BusinessException(503, "AI đang bận — quá nhiều người hỏi cùng lúc, thử lại sau vài giây");
        }
        try {
            totalWaitNanos.addAndGet(System.nanoTime() - start);
            return action.get();
        } finally {
            semaphore.release();
            succeeded.incrementAndGet();
        }
    }

    public int availablePermits() {
        return semaphore.availablePermits();
    }

    public int maxConcurrent() {
        return maxConcurrent;
    }

    public Map<String, Object> metrics() {
        long ok = succeeded.get();
        long avgWaitMs = ok == 0 ? 0 : totalWaitNanos.get() / ok / 1_000_000L;
        return Map.of(
                "maxConcurrent", maxConcurrent,
                "availablePermits", semaphore.availablePermits(),
                "inFlight", maxConcurrent - semaphore.availablePermits(),
                "acquireTimeoutMs", acquireTimeoutMs,
                "succeeded", ok,
                "rejected", rejected.get(),
                "avgWaitMs", avgWaitMs);
    }
}
