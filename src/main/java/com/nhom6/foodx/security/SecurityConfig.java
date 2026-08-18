
package com.nhom6.foodx.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import lombok.RequiredArgsConstructor;

/**
 * Cấu hình bảo mật Spring Security + JWT.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    private static final String[] PUBLIC_WHITELIST = {
            "/api/auth/**",
            "/v3/api-docs/**",
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/swagger-resources/**",
            "/webjars/**",
            // Trang chủ và trang test giao diện AI chat (tĩnh)
            "/",
            "/index.html",
            "/ai-chat-test.html",
            "/app",
            "/app.html",
            "/css/**",
            "/js/**",
            // Ảnh avatar tải lên
            "/uploads/**"
    };

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(PUBLIC_WHITELIST).permitAll()
                        // Trạng thái AI có thể kiểm tra công khai
                        .requestMatchers(HttpMethod.GET, "/api/ai/status").permitAll()
                        // Danh mục nguyên liệu & dữ liệu trang chủ công khai
                        .requestMatchers(HttpMethod.GET, "/api/ingredients/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/home/**").permitAll()
                        // Xem bình luận bài viết mạng xã hội công khai
                        .requestMatchers(HttpMethod.GET, "/api/social/posts/*/comments").permitAll()
                        // Các endpoint cá nhân hoá trong công thức yêu cầu đăng nhập
                        .requestMatchers("/api/recipes/saved", "/api/recipes/*/save", "/api/recipes/import").authenticated()
                        // Xem danh sách và chi tiết công thức công khai
                        .requestMatchers(HttpMethod.GET, "/api/recipes", "/api/recipes/*").permitAll()
                        // Toàn bộ các API còn lại (AI chat/suggest, fridge, plans, shopping, stats, profile, social...) bắt buộc đăng nhập
                        .anyRequest().authenticated())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }
}
