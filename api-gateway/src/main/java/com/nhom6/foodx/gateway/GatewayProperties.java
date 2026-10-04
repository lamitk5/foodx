package com.nhom6.foodx.gateway;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.ArrayList;
import java.util.List;

/**
 * Cấu hình API Gateway: địa chỉ các service downstream và bảng định tuyến.
 *
 * <p>Trước đây bảng định tuyến bị hard-code bằng một chuỗi {@code if (path.startsWith(...))}
 * trong {@link GatewayProxyController}. Nay nó là dữ liệu cấu hình: thêm/bớt service chỉ cần
 * sửa {@code application.properties}, không phải sửa và build lại mã Java.</p>
 */
@Data
@ConfigurationProperties(prefix = "gateway")
public class GatewayProperties {

    /** Địa chỉ gốc của từng microservice. */
    private Services services = new Services();

    /**
     * Bảng định tuyến theo tiền tố đường dẫn; quy tắc dài nhất được ưu tiên
     * (xem {@link #sortedRoutes()}).
     */
    private List<Route> routes = new ArrayList<>();

    @Data
    public static class Services {
        private String userService = "http://localhost:8081";
        private String inventoryService = "http://localhost:8082";
        private String recipeService = "http://localhost:8083";
        private String planShoppingService = "http://localhost:8084";
        private String aiService = "http://localhost:8085";
        private String socialStatsService = "http://localhost:8086";
    }

    @Data
    public static class Route {
        /** Tiền tố đường dẫn, ví dụ {@code /api/recipes}. */
        private String path;
        /** Địa chỉ gốc của service nhận request. */
        private String uri;
    }

    /** Bảng định tuyến đã sắp xếp: tiền tố dài nhất đứng trước. */
    public List<Route> sortedRoutes() {
        List<Route> sorted = new ArrayList<>(routes);
        sorted.sort((a, b) -> Integer.compare(length(b.getPath()), length(a.getPath())));
        return sorted;
    }

    private static int length(String value) {
        return value == null ? 0 : value.length();
    }
}
