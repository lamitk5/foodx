package com.nhom6.foodx.common.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpRequest;
import org.springframework.http.client.ClientHttpRequestExecution;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.client.ClientHttpResponse;

import java.io.IOException;
import java.time.Duration;

/**
 * Thử lại các lời gọi nội bộ <b>idempotent</b> (chỉ {@code GET}) khi gặp lỗi tầng vận chuyển
 * (không kết nối được, timeout).
 *
 * <p>Cố ý <b>không</b> thử lại khi service đích đã trả về mã lỗi HTTP: lỗi 4xx/5xx là quyết định
 * của nghiệp vụ, thử lại có thể gây hiệu ứng lặp. Các lời gọi ghi dữ liệu ({@code POST}/{@code DELETE})
 * cũng không thử lại vì có thể tạo bản ghi trùng.</p>
 */
class RetryInterceptor implements ClientHttpRequestInterceptor {

    private static final Logger log = LoggerFactory.getLogger(RetryInterceptor.class);

    private final int maxAttempts;
    private final Duration backoff;

    RetryInterceptor(int maxAttempts, Duration backoff) {
        this.maxAttempts = Math.max(1, maxAttempts);
        this.backoff = backoff == null || backoff.isNegative() ? Duration.ZERO : backoff;
    }

    @Override
    public ClientHttpResponse intercept(HttpRequest request, byte[] body, ClientHttpRequestExecution execution)
            throws IOException {
        if (maxAttempts <= 1 || !HttpMethod.GET.equals(request.getMethod())) {
            return execution.execute(request, body);
        }

        IOException lastFailure = null;
        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return execution.execute(request, body);
            } catch (IOException ex) {
                lastFailure = ex;
                if (attempt < maxAttempts) {
                    log.warn("Gọi nội bộ {} thất bại (lần {}/{}): {} — thử lại sau {}ms",
                            request.getURI().getPath(), attempt, maxAttempts, ex.getMessage(),
                            backoff.toMillis() * attempt);
                    sleep(backoff.multipliedBy(attempt));
                }
            }
        }
        throw lastFailure;
    }

    private void sleep(Duration duration) {
        if (duration.isZero() || duration.isNegative()) {
            return;
        }
        try {
            Thread.sleep(duration.toMillis());
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
        }
    }
}
