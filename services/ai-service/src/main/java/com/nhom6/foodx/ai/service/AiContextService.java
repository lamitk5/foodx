package com.nhom6.foodx.ai.service;

import com.nhom6.foodx.common.client.InventoryServiceClient;
import com.nhom6.foodx.common.client.UserServiceClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * Dựng "bối cảnh người dùng" (hồ sơ dinh dưỡng + tủ lạnh) để nhồi vào prompt AI.
 *
 * <p>ai-service không sở hữu bảng {@code profiles} / {@code fridge_stock}: dữ liệu được
 * lấy qua HTTP client nội bộ của {@code foodx-common} (user-service, inventory-service).
 * Cache TTL ngắn để chat liên tục không gọi HTTP mỗi lần.</p>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AiContextService {

    private final UserServiceClient userServiceClient;
    private final InventoryServiceClient inventoryServiceClient;

    @Value("${app.ai.context-cache-ttl-ms:45000}")
    private long cacheTtlMs;

    private final Map<Long, CacheEntry> contextCache = new ConcurrentHashMap<>();

    private record CacheEntry(String context, long expiresAtMs) {
        boolean expired(long now) {
            return now >= expiresAtMs;
        }
    }

    /**
     * @return chuỗi bối cảnh tiếng Việt (hoặc chuỗi rỗng nếu user chưa có dữ liệu gì đáng kể)
     */
    public String buildContext(Long userId) {
        if (userId == null) {
            return "";
        }
        long now = System.currentTimeMillis();
        CacheEntry cached = contextCache.get(userId);
        if (cached != null && !cached.expired(now)) {
            return cached.context();
        }

        String context = loadContext(userId);
        contextCache.put(userId, new CacheEntry(context, now + Math.max(1_000, cacheTtlMs)));

        // Dọn entry hết hạn thỉnh thoảng
        if (contextCache.size() > 5_000) {
            contextCache.entrySet().removeIf(e -> e.getValue().expired(now));
        }
        return context;
    }

    /** Gọi khi user đổi hồ sơ / tủ lạnh để lần chat sau thấy ngay. */
    public void evict(Long userId) {
        if (userId != null) {
            contextCache.remove(userId);
        }
    }

    private String loadContext(Long userId) {
        StringBuilder sb = new StringBuilder();

        // Hồ sơ dinh dưỡng: lấy từ user-service qua API nội bộ, lỗi mạng trả về rỗng.
        userServiceClient.getProfile(userId).ifPresent(profile -> {
            List<String> parts = new java.util.ArrayList<>();
            if (profile.gender() != null) {
                parts.add("giới tính " + ("female".equalsIgnoreCase(profile.gender()) ? "nữ" : "nam"));
            }
            if (profile.age() != null) {
                parts.add(profile.age() + " tuổi");
            }
            if (profile.weight() != null) {
                parts.add("nặng " + trimNumber(profile.weight()) + " kg");
            }
            if (profile.height() != null) {
                parts.add("cao " + trimNumber(profile.height()) + " cm");
            }
            if (profile.diet() != null && !profile.diet().isBlank()
                    && !"Ăn linh tinh".equals(profile.diet())) {
                parts.add("chế độ ăn: " + profile.diet());
            }
            if (parts.isEmpty()) {
                return;
            }
            sb.append("Hồ sơ người dùng: ").append(String.join(", ", parts)).append(".\n");
            if (profile.allergies() != null && !profile.allergies().isBlank()) {
                sb.append("Dị ứng cần tránh tuyệt đối: ").append(profile.allergies().trim()).append(".\n");
            }
            if (profile.dislikes() != null && !profile.dislikes().isBlank()) {
                sb.append("Món người dùng không thích: ").append(profile.dislikes().trim()).append(".\n");
            }
        });

        // Tủ lạnh: inventory-service trả sẵn danh sách tên thực phẩm đã lọc trùng.
        List<String> fridgeNames = inventoryServiceClient.getFridgeFoodNames(userId).stream()
                .filter(name -> name != null && !name.isBlank())
                .distinct()
                .limit(40)
                .collect(Collectors.toList());
        if (!fridgeNames.isEmpty()) {
            sb.append("Tủ lạnh của người dùng hiện có: ")
                    .append(String.join(", ", fridgeNames))
                    .append(". Hãy ưu tiên gợi ý món dùng được các nguyên liệu này.\n");
        }
        return sb.toString();
    }

    private String trimNumber(Double value) {
        if (value == null) {
            return "?";
        }
        long rounded = Math.round(value);
        return value == rounded ? String.valueOf(rounded) : String.valueOf(value);
    }
}
