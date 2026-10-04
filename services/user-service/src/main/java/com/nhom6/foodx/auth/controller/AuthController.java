package com.nhom6.foodx.auth.controller;

import com.nhom6.foodx.auth.dto.AuthResponse;
import com.nhom6.foodx.auth.dto.LoginRequest;
import com.nhom6.foodx.auth.dto.RegisterRequest;
import com.nhom6.foodx.auth.service.AuthService;
import com.nhom6.foodx.common.exception.BusinessException;
import com.nhom6.foodx.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * API xác thực. Danh tính người dùng đến từ JWT (foodx-common), không truy vấn bảng
 * {@code users} ở tầng controller.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

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
            throw new BusinessException(400, "Mật khẩu mới không được để trống");
        }
        authService.changePassword(oldPass, newPass);
        return ApiResponse.success(null, "Đổi mật khẩu thành công");
    }

    /** Lấy thông tin người dùng đang đăng nhập (theo JWT). */
    @GetMapping("/me")
    public ApiResponse<AuthResponse> me() {
        return ApiResponse.success(authService.currentUserInfo(), "Thông tin người dùng hiện tại");
    }
}
