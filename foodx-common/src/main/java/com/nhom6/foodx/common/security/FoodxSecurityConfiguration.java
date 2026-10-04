package com.nhom6.foodx.common.security;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.util.ArrayList;
import java.util.List;

/**
 * Cấu hình bảo mật dùng chung cho mọi microservice FoodX.
 *
 * <p>Trước đây mỗi service có một {@code SecurityConfig} copy-paste (~275 LOC × 6).
 * Nay toàn bộ nằm ở đây; mỗi service chỉ cần khai báo một bean {@link PublicEndpoints}
 * mô tả endpoint công khai của chính nó. Service nào không khai báo sẽ dùng
 * {@link PublicEndpoints#defaults()} (mọi endpoint đều yêu cầu đăng nhập).</p>
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class FoodxSecurityConfiguration {

    public static final String INTERNAL_PATH_PATTERN = "/internal/**";

    /** Health check do Spring Boot Actuator cung cấp — hạ tầng (Docker, LB) cần gọi được. */
    public static final String HEALTH_PATH_PATTERN = "/actuator/health";

    /**
     * Xác thực JWT cho người dùng cuối. Được tạo trực tiếp (không đăng ký thành bean)
     * để Spring Boot không tự đăng ký nó thêm một lần nữa như servlet filter.
     */
    @Bean
    public JwtTokenProvider jwtTokenProvider(
            @Value("${app.jwt.secret:dev-super-secret-key-please-change-this-key-32bytes!!}") String secret,
            @Value("${app.jwt.expiration-ms:86400000}") long expirationMs,
            @Value("${app.jwt.issuer:foodx}") String issuer) {
        return new JwtTokenProvider(secret, expirationMs, issuer);
    }

    @Bean
    @ConditionalOnMissingBean(PasswordEncoder.class)
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    @ConditionalOnMissingBean(SecurityFilterChain.class)
    public SecurityFilterChain foodxSecurityFilterChain(
            HttpSecurity http,
            JwtTokenProvider jwtTokenProvider,
            ObjectProvider<PublicEndpoints> publicEndpoints,
            @Value("${foodx.internal.token:foodx-internal-dev-token}") String internalToken) throws Exception {

        List<SecurityRule> rules = new ArrayList<>();
        PublicEndpoints declared = publicEndpoints.getIfAvailable();
        rules.addAll(declared != null ? declared.rules() : PublicEndpoints.defaults());

        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> {
                    // Cổng nội bộ giữa các service: chỉ chấp nhận token chia sẻ
                    auth.requestMatchers(INTERNAL_PATH_PATTERN).hasAuthority(InternalTokenFilter.INTERNAL_AUTHORITY);
                    // Health check của hạ tầng (Docker/load balancer) — luôn công khai.
                    // Khai báo ở đây để không service nào quên và làm hỏng healthcheck.
                    auth.requestMatchers(HEALTH_PATH_PATTERN, HEALTH_PATH_PATTERN + "/**").permitAll();
                    for (SecurityRule rule : rules) {
                        var matcher = rule.method() == null
                                ? auth.requestMatchers(rule.pattern())
                                : auth.requestMatchers(rule.method(), rule.pattern());
                        if (rule.permitAll()) {
                            matcher.permitAll();
                        } else {
                            matcher.authenticated();
                        }
                    }
                    auth.anyRequest().authenticated();
                })
                .addFilterBefore(new InternalTokenFilter(internalToken), UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(new JwtAuthenticationFilter(jwtTokenProvider), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
