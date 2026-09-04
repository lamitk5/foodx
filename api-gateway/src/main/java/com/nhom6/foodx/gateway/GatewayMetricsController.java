package com.nhom6.foodx.gateway;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Metrics vận hành cho gateway (rate-limit + AI bulkhead).
 * Không cần auth — chỉ expose số liệu, không lộ bí mật.
 */
@RestController
@RequestMapping("/api/gateway")
@RequiredArgsConstructor
public class GatewayMetricsController {

    private final ApiRateLimitFilter rateLimitFilter;

    @GetMapping("/metrics")
    public Map<String, Object> metrics() {
        Map<String, Object> body = new LinkedHashMap<>(rateLimitFilter.metrics());
        body.put("ts", System.currentTimeMillis());
        return body;
    }
}
