package com.nhom6.foodx.auth.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Yeu cau dang nhap (ho tro ca username va email).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {

    @JsonAlias({"email", "loginName", "user"})
    private String username;

    @NotBlank(message = "Mat khau khong duoc de trong")
    private String password;
}
