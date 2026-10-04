package com.nhom6.foodx.common.client;

import com.nhom6.foodx.common.security.InternalTokenFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Optional;

/**
 * Nền tảng cho mọi client gọi service khác trong cụm FoodX.
 *
 * <p>Mọi lời gọi đều mang header {@code X-Foodx-Internal-Token} và trỏ tới
 * {@code /internal/**} — cổng nội bộ không được API Gateway expose ra ngoài.
 * Lỗi mạng/service chết <b>không</b> làm sập service gọi: client ghi log cảnh báo và
 * trả về rỗng để bên gọi tự quyết định phương án dự phòng.</p>
 */
abstract class AbstractFoodxClient {

    protected final Logger log = LoggerFactory.getLogger(getClass());

    private final RestClient restClient;

    protected AbstractFoodxClient(RestClient.Builder builder, String baseUrl, String internalToken) {
        this.restClient = builder.clone()
                .baseUrl(baseUrl)
                .defaultHeader(InternalTokenFilter.HEADER, internalToken)
                .build();
    }

    protected <T> Optional<T> getOptional(String uri, Class<T> type, Object... uriVars) {
        try {
            return Optional.ofNullable(restClient.get().uri(uri, uriVars).retrieve().body(type));
        } catch (Exception ex) {
            log.warn("Gọi nội bộ thất bại: GET {} ({})", uri, ex.getMessage());
            return Optional.empty();
        }
    }

    protected <T> List<T> getList(String uri, ParameterizedTypeReference<List<T>> type, Object... uriVars) {
        try {
            List<T> body = restClient.get().uri(uri, uriVars).retrieve().body(type);
            return body == null ? List.of() : body;
        } catch (Exception ex) {
            log.warn("Gọi nội bộ thất bại: GET {} ({})", uri, ex.getMessage());
            return List.of();
        }
    }

    protected <T> Optional<T> postOptional(String uri, Class<T> type, Object body, Object... uriVars) {
        try {
            return Optional.ofNullable(restClient.post().uri(uri, uriVars).body(body).retrieve().body(type));
        } catch (Exception ex) {
            log.warn("Gọi nội bộ thất bại: POST {} ({})", uri, ex.getMessage());
            return Optional.empty();
        }
    }

    protected <T> List<T> postList(String uri, ParameterizedTypeReference<List<T>> type, Object body, Object... uriVars) {
        try {
            List<T> result = restClient.post().uri(uri, uriVars).body(body).retrieve().body(type);
            return result == null ? List.of() : result;
        } catch (Exception ex) {
            log.warn("Gọi nội bộ thất bại: POST {} ({})", uri, ex.getMessage());
            return List.of();
        }
    }

    protected void postVoid(String uri, Object body, Object... uriVars) {
        try {
            restClient.post().uri(uri, uriVars).body(body).retrieve().toBodilessEntity();
        } catch (Exception ex) {
            log.warn("Gọi nội bộ thất bại: POST {} ({})", uri, ex.getMessage());
        }
    }
}
