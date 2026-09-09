package com.nhom6.foodx.gateway;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "gateway.services")
public class GatewayProperties {
    private String userService = "http://localhost:8081";
    private String inventoryService = "http://localhost:8082";
    private String recipeService = "http://localhost:8083";
    private String planShoppingService = "http://localhost:8084";
    private String aiService = "http://localhost:8085";
    private String socialStatsService = "http://localhost:8086";
}
