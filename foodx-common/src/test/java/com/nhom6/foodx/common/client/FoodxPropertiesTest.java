package com.nhom6.foodx.common.client;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.context.properties.bind.Binder;
import org.springframework.core.env.SystemEnvironmentPropertySource;
import org.springframework.mock.env.MockEnvironment;

import java.time.Duration;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Khoá chặt hợp đồng cấu hình giữa biến môi trường / {@code application.properties}
 * và {@link FoodxProperties}.
 *
 * <p>Đây là hợp đồng mà tầng Docker phụ thuộc. Chuỗi đầy đủ là:</p>
 * <pre>
 *   FOODX_SERVICES_INVENTORY_SERVICE  --(1)-->  foodx.services.inventory-service  --(2)-->  field
 * </pre>
 * <p>Hai bước được kiểm tra tách biệt để test chạy tất định, không phụ thuộc việc máy build
 * có đặt sẵn biến môi trường hay không. Nếu ai đổi tên property mà quên đổi biến môi trường,
 * các service sẽ âm thầm gọi {@code http://localhost} bên trong container — bước (1) sẽ báo lỗi.</p>
 */
class FoodxPropertiesTest {

    // ------------------------------------------------------------------ bước (1)

    @Test
    @DisplayName("(1) FOODX_SERVICES_* ánh xạ vào property foodx.services.* (hợp đồng với Docker)")
    void environmentVariableNamesMapToPropertyNames() {
        SystemEnvironmentPropertySource source = new SystemEnvironmentPropertySource("systemEnvironment", Map.of(
                "FOODX_SERVICES_INVENTORY_SERVICE", "http://inventory-service:8082",
                "FOODX_SERVICES_PLAN_SHOPPING_SERVICE", "http://plan-shopping-service:8084",
                "FOODX_INTERNAL_TOKEN", "token-tu-bien-moi-truong",
                "APP_JWT_SECRET", "khoa-jwt-tu-bien-moi-truong"));

        assertEquals("http://inventory-service:8082",
                source.getProperty("foodx.services.inventory-service"));
        assertEquals("http://plan-shopping-service:8084",
                source.getProperty("foodx.services.plan-shopping-service"));
        assertEquals("token-tu-bien-moi-truong",
                source.getProperty("foodx.internal.token"));
        assertEquals("khoa-jwt-tu-bien-moi-truong",
                source.getProperty("app.jwt.secret"));
    }

    // ------------------------------------------------------------------ bước (2)

    @Test
    @DisplayName("(2) Tên property dạng gạch ngang trong application.properties bind đúng vào field")
    void propertyNamesBindToFields() {
        MockEnvironment environment = new MockEnvironment();
        environment.setProperty("foodx.services.inventory-service", "http://inventory:8082");
        environment.setProperty("foodx.services.ai-service", "http://ai:8085");
        environment.setProperty("foodx.internal.token", "token-tu-file-properties");

        FoodxProperties properties = bind(environment);

        assertEquals("http://inventory:8082", properties.getServices().getInventoryService());
        assertEquals("http://ai:8085", properties.getServices().getAiService());
        assertEquals("token-tu-file-properties", properties.getInternal().getToken());
    }

    @Test
    @DisplayName("Không cấu hình gì thì dùng mặc định localhost (chạy dev trong IDE)")
    void fallsBackToLocalhostDefaults() {
        FoodxProperties properties = bind(new MockEnvironment());

        assertEquals("http://localhost:8081", properties.getServices().getUserService());
        assertEquals("http://localhost:8086", properties.getServices().getSocialStatsService());
        assertNotNull(properties.getInternal().getToken());
    }

    @Test
    @DisplayName("Client nội bộ luôn có timeout dương — chống treo dây chuyền")
    void clientTimeoutsArePositive() {
        FoodxProperties.Client client = bind(new MockEnvironment()).getClient();

        assertTrue(client.getConnectTimeout().compareTo(Duration.ZERO) > 0, "connect-timeout phải > 0");
        assertTrue(client.getReadTimeout().compareTo(Duration.ZERO) > 0, "read-timeout phải > 0");
        assertTrue(client.getMaxAttempts() >= 1, "max-attempts phải >= 1");
        assertTrue(client.getRetryBackoff().compareTo(Duration.ZERO) >= 0, "retry-backoff không được âm");
    }

    /**
     * Bind giống Spring Boot: không có property nào dưới {@code foodx.*} thì dùng giá trị
     * mặc định khai báo trong lớp (Boot vẫn tạo bean bình thường trong trường hợp này).
     */
    private FoodxProperties bind(MockEnvironment environment) {
        return Binder.get(environment).bind("foodx", FoodxProperties.class).orElseGet(FoodxProperties::new);
    }
}
