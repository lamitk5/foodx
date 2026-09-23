package com.nhom6.foodx.ai.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Cau hinh Groq API (provider uu tien, tu dong fallback sang Gemini khi loi).
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "app.groq")
public class GroqConfig {

    private String apiKey;
    private String model;
    private String url;
}