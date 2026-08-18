package com.nhom6.foodx.auth.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Yêu cầu đăng nhập (hỗ trợ cả username và email).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {

    @JsonAlias({"email", "loginName", "user"})
    private String username;

    private String email;

    @NotBlank(message = "Mật khẩu không được để trống")
    private String password;

    public String getUsername() {
        if (username != null && !username.isBlank()) {
            return username;
        }
        return email;
    }
}
