package com.nhom6.foodx.common.client;

import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.net.http.HttpClient;

/**
 * Khai báo các client giao tiếp giữa microservice.
 *
 * <p>Các bean ở đây chỉ là đối tượng mỏng giữ base URL + token nội bộ, không mở kết nối
 * cho tới khi được gọi, nên service nào không dùng tới cũng không tốn tài nguyên.</p>
 */
@Configuration
@EnableConfigurationProperties(FoodxProperties.class)
public class FoodxClientConfiguration {

    /**
     * Builder dùng chung cho mọi client nội bộ.
     *
     * <p>Spring Boot 4 <b>không</b> tự tạo bean {@code RestClient.Builder}, nên nếu trông cậy
     * vào auto-configuration thì cả 6 service sẽ chết lúc khởi động
     * ({@code NoSuchBeanDefinitionException}). Khai báo tường minh ở đây, kèm
     * {@code @ConditionalOnMissingBean} để nhường chỗ nếu ứng dụng tự cấu hình.</p>
     *
     * <p>Builder được cấu hình một lần cho toàn bộ hệ:</p>
     * <ul>
     *   <li><b>timeout</b> — chặn cascading failure khi một service bị treo;</li>
     *   <li><b>correlation id</b> — chuyển tiếp {@code X-Correlation-Id} để lần theo request;</li>
     *   <li><b>thử lại</b> — chỉ cho {@code GET} (idempotent) khi lỗi tầng vận chuyển.</li>
     * </ul>
     */
    @Bean
    @ConditionalOnMissingBean(RestClient.Builder.class)
    public RestClient.Builder foodxRestClientBuilder(FoodxProperties properties) {
        FoodxProperties.Client settings = properties.getClient();

        HttpClient httpClient = HttpClient.newBuilder()
                .connectTimeout(settings.getConnectTimeout())
                .followRedirects(HttpClient.Redirect.NORMAL)
                .build();
        JdkClientHttpRequestFactory requestFactory = new JdkClientHttpRequestFactory(httpClient);
        requestFactory.setReadTimeout(settings.getReadTimeout());

        return RestClient.builder()
                .requestFactory(requestFactory)
                .requestInterceptor(new CorrelationIdInterceptor())
                .requestInterceptor(new RetryInterceptor(settings.getMaxAttempts(), settings.getRetryBackoff()));
    }

    @Bean
    @ConditionalOnMissingBean
    public UserServiceClient userServiceClient(RestClient.Builder builder, FoodxProperties properties) {
        return new UserServiceClient(builder,
                properties.getServices().getUserService(),
                properties.getInternal().getToken());
    }

    @Bean
    @ConditionalOnMissingBean
    public InventoryServiceClient inventoryServiceClient(RestClient.Builder builder, FoodxProperties properties) {
        return new InventoryServiceClient(builder,
                properties.getServices().getInventoryService(),
                properties.getInternal().getToken());
    }

    @Bean
    @ConditionalOnMissingBean
    public RecipeServiceClient recipeServiceClient(RestClient.Builder builder, FoodxProperties properties) {
        return new RecipeServiceClient(builder,
                properties.getServices().getRecipeService(),
                properties.getInternal().getToken());
    }

    @Bean
    @ConditionalOnMissingBean
    public AiServiceClient aiServiceClient(RestClient.Builder builder, FoodxProperties properties) {
        return new AiServiceClient(builder,
                properties.getServices().getAiService(),
                properties.getInternal().getToken());
    }

    @Bean
    @ConditionalOnMissingBean
    public UserPurgeClient userPurgeClient(RestClient.Builder builder, FoodxProperties properties) {
        return new UserPurgeClient(builder, properties);
    }
}
