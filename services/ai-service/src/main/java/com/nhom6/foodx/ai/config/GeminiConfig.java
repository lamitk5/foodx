package com.nhom6.foodx.ai.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Cấu hình Gemini API.
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "app.gemini")
public class GeminiConfig {

    private String apiKey;
    private String model;
    private String url;
}
