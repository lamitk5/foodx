package com.nhom6.foodx.common.client;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

/**
 * Cấu hình dùng chung cho giao tiếp giữa các microservice.
 *
 * <pre>
 * foodx:
 *   internal:
 *     token: foodx-internal-dev-token
 *   services:
 *     user-service: http://localhost:8081
 *     inventory-service: http://localhost:8082
 *     recipe-service: http://localhost:8083
 *     plan-shopping-service: http://localhost:8084
 *     ai-service: http://localhost:8085
 *     social-stats-service: http://localhost:8086
 * </pre>
 */
@ConfigurationProperties(prefix = "foodx")
public class FoodxProperties {

    private final Services services = new Services();
    private final Internal internal = new Internal();
    private final Client client = new Client();

    public Services getServices() {
        return services;
    }

    public Internal getInternal() {
        return internal;
    }

    public Client getClient() {
        return client;
    }

    public static class Services {
        private String userService = "http://localhost:8081";
        private String inventoryService = "http://localhost:8082";
        private String recipeService = "http://localhost:8083";
        private String planShoppingService = "http://localhost:8084";
        private String aiService = "http://localhost:8085";
        private String socialStatsService = "http://localhost:8086";

        public String getUserService() {
            return userService;
        }

        public void setUserService(String userService) {
            this.userService = userService;
        }

        public String getInventoryService() {
            return inventoryService;
        }

        public void setInventoryService(String inventoryService) {
            this.inventoryService = inventoryService;
        }

        public String getRecipeService() {
            return recipeService;
        }

        public void setRecipeService(String recipeService) {
            this.recipeService = recipeService;
        }

        public String getPlanShoppingService() {
            return planShoppingService;
        }

        public void setPlanShoppingService(String planShoppingService) {
            this.planShoppingService = planShoppingService;
        }

        public String getAiService() {
            return aiService;
        }

        public void setAiService(String aiService) {
            this.aiService = aiService;
        }

        public String getSocialStatsService() {
            return socialStatsService;
        }

        public void setSocialStatsService(String socialStatsService) {
            this.socialStatsService = socialStatsService;
        }
    }

    public static class Internal {
        /** Token chia sẻ cho các lời gọi nội bộ; đặt qua biến môi trường FOODX_INTERNAL_TOKEN khi deploy. */
        private String token = "foodx-internal-dev-token";

        public String getToken() {
            return token;
        }

        public void setToken(String token) {
            this.token = token;
        }
    }

    /**
     * Hành vi của client gọi service khác — thiết lập một lần, áp dụng cho mọi lời gọi nội bộ.
     *
     * <p>Đặt timeout là bắt buộc trong hệ phân tán: không có timeout thì một service chậm sẽ
     * treo luôn service gọi nó (cascading failure).</p>
     */
    public static class Client {
        private Duration connectTimeout = Duration.ofSeconds(2);
        private Duration readTimeout = Duration.ofSeconds(10);
        /** Số lần thử tối đa cho lời gọi GET (1 = không thử lại). */
        private int maxAttempts = 2;
        private Duration retryBackoff = Duration.ofMillis(200);

        public Duration getConnectTimeout() {
            return connectTimeout;
        }

        public void setConnectTimeout(Duration connectTimeout) {
            this.connectTimeout = connectTimeout;
        }

        public Duration getReadTimeout() {
            return readTimeout;
        }

        public void setReadTimeout(Duration readTimeout) {
            this.readTimeout = readTimeout;
        }

        public int getMaxAttempts() {
            return maxAttempts;
        }

        public void setMaxAttempts(int maxAttempts) {
            this.maxAttempts = maxAttempts;
        }

        public Duration getRetryBackoff() {
            return retryBackoff;
        }

        public void setRetryBackoff(Duration retryBackoff) {
            this.retryBackoff = retryBackoff;
        }
    }
}
