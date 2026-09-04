package com.nhom6.foodx.auth.controller;

import com.nhom6.foodx.auth.dto.AuthResponse;
import com.nhom6.foodx.auth.dto.LoginRequest;
import com.nhom6.foodx.auth.dto.RegisterRequest;
import com.nhom6.foodx.auth.entity.User;
import com.nhom6.foodx.auth.service.AuthService;
import com.nhom6.foodx.common.response.ApiResponse;
import com.nhom6.foodx.security.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final SecurityUtils securityUtils;

    @PostMapping("/register")
    public ApiResponse<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ApiResponse.success(authService.register(request), "Đăng ký thành công");
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.success(authService.login(request), "Đăng nhập thành công");
    }

    /** Đổi mật khẩu của tài khoản đang đăng nhập. */
    @PostMapping("/change-password")
    public ApiResponse<Void> changePassword(@RequestBody java.util.Map<String, String> body) {
        String oldPass = body.get("oldPassword");
        String newPass = body.get("newPassword");
        if (newPass == null || newPass.isBlank()) {
            throw new com.nhom6.foodx.common.exception.BusinessException(400, "Mật khẩu mới không được để trống");
        }
        authService.changePassword(securityUtils.getCurrentUser(), oldPass, newPass);
        return ApiResponse.success(null, "Đổi mật khẩu thành công");
    }

    /** Lấy thông tin người dùng đang đăng nhập (theo JWT). */
    @GetMapping("/me")
    public ApiResponse<AuthResponse> me() {
        User user = securityUtils.getCurrentUser();
        return ApiResponse.success(AuthResponse.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .build(), "Thông tin người dùng hiện tại");
    }
}
