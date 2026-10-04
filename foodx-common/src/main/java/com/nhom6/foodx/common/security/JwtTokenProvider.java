package com.nhom6.foodx.common.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;
import java.util.function.Function;

/**
 * Tạo và kiểm tra tính hợp lệ của JWT — dùng chung cho mọi microservice.
 *
 * <p>Đây là nguồn duy nhất sinh/đọc token trong hệ thống FoodX. Trước đây mỗi service
 * giữ một bản copy riêng của lớp này; nay tất cả dùng bean do
 * {@link FoodxSecurityConfiguration} khai báo.</p>
 */
public class JwtTokenProvider {

    private final SecretKey secretKey;
    private final long expirationMs;
    private final String issuer;

    public JwtTokenProvider(
            @Value("${app.jwt.secret:dev-super-secret-key-please-change-this-key-32bytes!!}") String secret,
            @Value("${app.jwt.expiration-ms:86400000}") long expirationMs,
            @Value("${app.jwt.issuer:foodx}") String issuer) {
        this.secretKey = getSigningKey(secret);
        this.expirationMs = expirationMs;
        this.issuer = issuer;
    }

    private SecretKey getSigningKey(String secret) {
        // Nếu secret là Base64 hợp lệ và đủ dài thì decode, ngược lại dùng trực tiếp bytes
        try {
            byte[] keyBytes = Decoders.BASE64.decode(secret);
            if (keyBytes.length >= 32) {
                return Keys.hmacShaKeyFor(keyBytes);
            }
        } catch (Exception ignored) {
            // rơi xuống nhánh dùng bytes thô
        }
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(Long userId, String username, String role) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);
        return Jwts.builder()
                .issuer(issuer)
                .subject(username)
                .claims(Map.of("uid", userId, "role", role))
                .issuedAt(now)
                .expiration(expiry)
                .signWith(secretKey)
                .compact();
    }

    public String getUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Long getUserId(String token) {
        return extractClaim(token, claims -> {
            Object uid = claims.get("uid");
            if (uid instanceof Number num) {
                return num.longValue();
            }
            if (uid instanceof String str && !str.isBlank()) {
                return Long.parseLong(str);
            }
            return null;
        });
    }

    public String getRole(String token) {
        return extractClaim(token, claims -> claims.get("role", String.class));
    }

    public boolean validateToken(String token) {
        try {
            extractClaim(token, Claims::getSubject);
            return true;
        } catch (Exception ex) {
            return false;
        }
    }

    private <T> T extractClaim(String token, Function<Claims, T> resolver) {
        Claims claims = Jwts.parser()
                .verifyWith(secretKey)
                .requireIssuer(issuer)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return resolver.apply(claims);
    }
}
