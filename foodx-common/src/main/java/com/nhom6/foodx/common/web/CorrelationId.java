package com.nhom6.foodx.common.web;

import org.slf4j.MDC;

import java.util.UUID;

/**
 * Mã tương quan (correlation id) dùng để lần theo một request xuyên qua nhiều microservice.
 *
 * <p>Gateway/service nhận request sẽ lấy {@code X-Correlation-Id} do bên gọi gửi tới (hoặc
 * sinh mới nếu chưa có), lưu vào {@link MDC} để mọi dòng log trong cùng luồng đều mang mã đó,
 * và chuyển tiếp sang service kế tiếp qua header cùng tên.</p>
 */
public final class CorrelationId {

    /** Header trao đổi mã tương quan giữa các service. */
    public static final String HEADER = "X-Correlation-Id";

    /** Khoá MDC — dùng trong pattern log: {@code %X{correlationId}}. */
    public static final String MDC_KEY = "correlationId";

    private CorrelationId() {
    }

    /** Mã tương quan của luồng hiện tại, hoặc {@code null} nếu ngoài ngữ cảnh request. */
    public static String current() {
        return MDC.get(MDC_KEY);
    }

    /**
     * Dùng lại mã của bên gọi nếu có, ngược lại sinh mã mới; đồng thời gắn vào MDC.
     *
     * @param incoming giá trị header {@code X-Correlation-Id} nhận được (có thể null)
     * @return mã tương quan sẽ dùng cho request này
     */
    public static String start(String incoming) {
        String id = (incoming != null && !incoming.isBlank()) ? incoming.trim() : UUID.randomUUID().toString();
        MDC.put(MDC_KEY, id);
        return id;
    }

    /** Gỡ khỏi MDC — luôn gọi trong {@code finally} để không rò rỉ sang request khác cùng thread. */
    public static void clear() {
        MDC.remove(MDC_KEY);
    }
}
