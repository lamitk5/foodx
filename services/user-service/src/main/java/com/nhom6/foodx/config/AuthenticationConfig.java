package com.nhom6.foodx.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;

/**
 * user-service là service duy nhất cần {@link AuthenticationManager} (để xác minh
 * mật khẩu khi đăng nhập), nên bean này được khai báo cục bộ thay vì đặt ở foodx-common.
 */
@Configuration
public class AuthenticationConfig {

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }
}
