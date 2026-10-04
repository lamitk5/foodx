package com.nhom6.foodx.gateway;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Kiểm tra Spring context của API Gateway nạp được.
 *
 * <p>Đáng chú ý: khẳng định bảng định tuyến khai báo bằng cấu hình
 * ({@code gateway.routes[*]}) thực sự được bind — nếu ai xoá/đổi tên property, gateway
 * sẽ trả 404 cho mọi request mà không có lỗi biên dịch nào.</p>
 *
 * <p>Test nằm cùng package với {@link ApiGatewayApplication} vì gateway chỉ quét package
 * {@code com.nhom6.foodx.gateway} (khác với các service nghiệp vụ quét {@code com.nhom6.foodx}
 * nên nhận được cả {@code foodx-common}).</p>
 */
@SpringBootTest
class ApiGatewayApplicationTests {

    @Autowired
    private ApplicationContext context;

    @Autowired
    private GatewayProperties gatewayProperties;

    @Test
    void contextLoads() {
        assertNotNull(context);
    }

    @Test
    void routingTableIsBoundFromConfiguration() {
        assertTrue(gatewayProperties.getRoutes().size() >= 14,
                "Bảng định tuyến phải được nạp từ gateway.routes[*], hiện có "
                        + gatewayProperties.getRoutes().size() + " quy tắc");

        // Mọi route phải trỏ tới một service đã cấu hình, không được để uri rỗng
        gatewayProperties.sortedRoutes().forEach(route -> {
            assertNotNull(route.getPath(), "route thiếu path");
            assertNotNull(route.getUri(), "route " + route.getPath() + " thiếu uri");
            assertTrue(route.getUri().startsWith("http"), "uri phải là http(s): " + route.getUri());
        });
    }
}
