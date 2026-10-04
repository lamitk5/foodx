package com.nhom6.foodx.common.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Xác thực các lời gọi <b>nội bộ giữa các microservice</b>.
 *
 * <p>Các endpoint dưới {@code /internal/**} không đi qua API Gateway (gateway chỉ route
 * {@code /api/**}), nên chỉ service khác trong cụm gọi được. Thay vì mượn JWT của người
 * dùng cuối, gọi nội bộ dùng một token chia sẻ giữa các service và được cấp quyền
 * {@code ROLE_INTERNAL}.</p>
 */
public class InternalTokenFilter extends OncePerRequestFilter {

    /** Header mang token nội bộ giữa các service. */
    public static final String HEADER = "X-Foodx-Internal-Token";

    /** Authority được cấp cho lời gọi nội bộ hợp lệ. */
    public static final String INTERNAL_AUTHORITY = "ROLE_INTERNAL";

    private final String expectedToken;

    public InternalTokenFilter(String expectedToken) {
        this.expectedToken = expectedToken;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String token = request.getHeader(HEADER);
        if (StringUtils.hasText(token) && token.equals(expectedToken)
                && SecurityContextHolder.getContext().getAuthentication() == null) {
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    "foodx-internal", null, List.of(new SimpleGrantedAuthority(INTERNAL_AUTHORITY)));
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }
        filterChain.doFilter(request, response);
    }
}
