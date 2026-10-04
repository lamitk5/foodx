package com.nhom6.foodx.common.security;

import org.springframework.http.HttpMethod;

import java.util.List;

/**
 * Mỗi microservice tự khai báo danh sách endpoint công khai của <b>chính nó</b>.
 *
 * <p>Trước đây {@code SecurityConfig} bị copy-paste giữa các service nên một service
 * biết cả đường dẫn của service khác (ví dụ ai-service whitelist {@code /api/social/**}).
 * Nay mỗi service cài đặt interface này trong package {@code config} của mình; các quy
 * tắc được áp dụng theo đúng thứ tự khai báo (quy tắc đầu tiên khớp sẽ thắng), phần còn
 * lại mặc định yêu cầu đăng nhập.</p>
 */
public interface PublicEndpoints {

    /** Quy tắc áp dụng theo thứ tự; phần còn lại mặc định yêu cầu đăng nhập. */
    List<SecurityRule> rules();

    /** Bộ quy tắc tối thiểu dùng khi service không khai báo gì. */
    static List<SecurityRule> defaults() {
        return List.of(
                SecurityRule.permitAll("/v3/api-docs/**"),
                SecurityRule.permitAll("/swagger-ui/**"),
                SecurityRule.permitAll("/swagger-ui.html"),
                SecurityRule.permitAll("/swagger-resources/**"),
                SecurityRule.permitAll("/webjars/**"),
                SecurityRule.permitAll("/actuator/health"),
                SecurityRule.permitAll(HttpMethod.GET, "/uploads/**")
        );
    }
}
