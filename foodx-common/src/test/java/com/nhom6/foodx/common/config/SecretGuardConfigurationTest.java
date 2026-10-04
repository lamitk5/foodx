package com.nhom6.foodx.common.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Bảo đảm không thể chạy production với bí mật mặc định của môi trường dev.
 *
 * <p>Nếu ai đó deploy với {@code --spring.profiles.active=prod} mà quên đặt
 * {@code APP_JWT_SECRET} / {@code FOODX_INTERNAL_TOKEN}, ứng dụng phải <b>dừng ngay</b>
 * thay vì âm thầm dùng khoá đã công khai trong repo.</p>
 */
class SecretGuardConfigurationTest {

    @Test
    @DisplayName("Profile prod + bí mật mặc định -> dừng khởi động")
    void failsFastOnProdWithDefaultSecrets() {
        MockEnvironment environment = new MockEnvironment();
        environment.setActiveProfiles("prod");

        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> new SecretGuardConfiguration(environment));
        assertTrue(ex.getMessage().contains("app.jwt.secret"));
        assertTrue(ex.getMessage().contains("foodx.internal.token"));
    }

    @Test
    @DisplayName("Profile prod + bí mật thật -> khởi động bình thường")
    void startsOnProdWithRealSecrets() {
        MockEnvironment environment = new MockEnvironment();
        environment.setActiveProfiles("prod");
        environment.setProperty("app.jwt.secret", "khoa-that-ngau-nhien-32-byte-tro-len");
        environment.setProperty("foodx.internal.token", "token-that-ngau-nhien");

        assertDoesNotThrow(() -> new SecretGuardConfiguration(environment));
    }

    @Test
    @DisplayName("Môi trường dev -> chỉ cảnh báo, không chặn")
    void onlyWarnsOutsideProd() {
        MockEnvironment environment = new MockEnvironment();

        assertDoesNotThrow(() -> new SecretGuardConfiguration(environment));
    }
}
