package com.nhom6.foodx.common.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private JwtTokenProvider tokenProvider;

    @BeforeEach
    void setUp() {
        tokenProvider = new JwtTokenProvider(
                "dev-super-secret-key-please-change-this-key-32bytes!!",
                86400000L,
                "foodx"
        );
    }

    @Test
    @DisplayName("Tạo và trích xuất thông tin JWT hợp lệ")
    void testGenerateAndExtractValidToken() {
        String token = tokenProvider.generateToken(100L, "testuser", "USER");
        assertNotNull(token);
        assertTrue(tokenProvider.validateToken(token));
        assertEquals("testuser", tokenProvider.getUsername(token));
        assertEquals(100L, tokenProvider.getUserId(token));
        assertEquals("USER", tokenProvider.getRole(token));
    }

    @ParameterizedTest
    @ValueSource(strings = {"admin", "minhanh", "demo_user_123", "user.with.dots"})
    @DisplayName("Kiểm tra nhiều username khác nhau")
    void testMultipleUsernames(String username) {
        String token = tokenProvider.generateToken(1L, username, "USER");
        assertTrue(tokenProvider.validateToken(token));
        assertEquals(username, tokenProvider.getUsername(token));
    }

    @Test
    @DisplayName("Token bị làm giả mạo phải bị từ chối")
    void testTamperedToken() {
        String token = tokenProvider.generateToken(1L, "user1", "USER");
        String tampered = token.substring(0, token.length() - 5) + "abcde";
        assertFalse(tokenProvider.validateToken(tampered));
    }

    @Test
    @DisplayName("Chuỗi rỗng hoặc token sai cấu trúc phải trả về false")
    void testMalformedToken() {
        assertFalse(tokenProvider.validateToken(""));
        assertFalse(tokenProvider.validateToken("not.a.valid.jwt.token"));
        assertFalse(tokenProvider.validateToken(null));
    }
}
