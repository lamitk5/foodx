package com.nhom6.foodx.common.web;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Gắn {@link CorrelationId} cho mọi request vào service.
 *
 * <p>Chạy ở mức ưu tiên cao nhất nên mã tương quan có mặt cả ở những request bị tầng bảo mật
 * từ chối (401/403) — rất cần khi điều tra sự cố. Mã cũng được trả lại trong header phản hồi
 * để phía client/gateway đối chiếu.</p>
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CorrelationIdFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String correlationId = CorrelationId.start(request.getHeader(CorrelationId.HEADER));
        try {
            response.setHeader(CorrelationId.HEADER, correlationId);
            filterChain.doFilter(request, response);
        } finally {
            CorrelationId.clear();
        }
    }
}
