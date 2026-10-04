package com.nhom6.foodx.common.client;

import com.nhom6.foodx.common.web.CorrelationId;
import org.springframework.http.HttpRequest;
import org.springframework.http.client.ClientHttpRequestExecution;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.client.ClientHttpResponse;

import java.io.IOException;

/**
 * Chuyển tiếp {@link CorrelationId} sang service được gọi, nhờ đó một request của người dùng
 * có thể lần theo toàn bộ chuỗi service mà nó đi qua.
 */
class CorrelationIdInterceptor implements ClientHttpRequestInterceptor {

    @Override
    public ClientHttpResponse intercept(HttpRequest request, byte[] body, ClientHttpRequestExecution execution)
            throws IOException {
        String correlationId = CorrelationId.current();
        if (correlationId != null && !correlationId.isBlank()
                && request.getHeaders().getFirst(CorrelationId.HEADER) == null) {
            request.getHeaders().set(CorrelationId.HEADER, correlationId);
        }
        return execution.execute(request, body);
    }
}
