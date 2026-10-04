package com.nhom6.foodx.gateway.ratelimit;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

public class InMemoryRateLimitBackend implements RateLimitBackend {

    private static final class Window {
        final long windowStartMs = System.currentTimeMillis();
        final AtomicLong count = new AtomicLong();
    }

    private final ConcurrentHashMap<String, Window> windows = new ConcurrentHashMap<>();
    private final AtomicLong ops = new AtomicLong();

    @Override
    public long incrementAndGet(String key, long windowSeconds) {
        long now = System.currentTimeMillis();
        long windowMs = windowSeconds * 1000L;

        // Dọn thỉnh thoảng để map không phình
        if (ops.incrementAndGet() % 10_000 == 0) {
            windows.entrySet().removeIf(e -> now - e.getValue().windowStartMs > windowMs * 2);
        }

        Window window = windows.compute(key, (k, existing) -> {
            if (existing == null || now - existing.windowStartMs >= windowMs) {
                return new Window();
            }
            return existing;
        });
        return window.count.incrementAndGet();
    }

    @Override
    public String name() {
        return "memory";
    }

    /** Debug/metrics. */
    public int trackedKeys() {
        return windows.size();
    }

    public Map<String, Object> snapshot() {
        return Map.of("backend", name(), "trackedKeys", windows.size());
    }
}
