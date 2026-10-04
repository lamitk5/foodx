package com.nhom6.foodx.auth.controller;

import com.nhom6.foodx.auth.dto.AdminUserRequest;
import com.nhom6.foodx.auth.dto.AdminUserResponse;
import com.nhom6.foodx.auth.entity.User;
import com.nhom6.foodx.auth.repository.UserRepository;
import com.nhom6.foodx.common.client.UserPurgeClient;
import com.nhom6.foodx.common.exception.BusinessException;
import com.nhom6.foodx.common.exception.ResourceNotFoundException;
import com.nhom6.foodx.common.response.ApiResponse;
import com.nhom6.foodx.common.security.SecurityUtils;
import com.nhom6.foodx.profile.repository.UserProfileRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Quản trị người dùng (chỉ ADMIN).
 *
 * <p>Khi xoá tài khoản, user-service chỉ xoá bảng do mình sở hữu ({@code profiles}, {@code users});
 * 5 service còn lại tự dọn dữ liệu của họ qua {@code DELETE /internal/users/{userId}/data}
 * (xem {@link UserPurgeClient}). Trước đây lớp này chạy {@code DELETE}/{@code UPDATE} bằng
 * {@code JdbcTemplate} xuyên qua bảng của 5 service khác — đúng kiểu "distributed monolith".</p>
 */
@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserPurgeClient userPurgeClient;

    /** Vai trò lấy từ JWT (không truy vấn DB chỉ để kiểm tra quyền). */
    private Long requireAdmin() {
        if (!SecurityUtils.isAdmin()) {
            throw new BusinessException(403, "Chỉ tài khoản Quản trị viên (ADMIN) mới có quyền truy cập");
        }
        return SecurityUtils.getCurrentUserId();
    }

    @GetMapping
    public ApiResponse<List<AdminUserResponse>> getAllUsers() {
        requireAdmin();
        List<AdminUserResponse> list = userRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
        return ApiResponse.success(list, "Danh sách người dùng");
    }

    @PostMapping
    @Transactional
    public ApiResponse<AdminUserResponse> createUser(@Valid @RequestBody AdminUserRequest req) {
        requireAdmin();
        if (req.getUsername() == null || req.getUsername().isBlank()) {
            throw new BusinessException(400, "Tên đăng nhập không được để trống");
        }
        if (req.getEmail() == null || req.getEmail().isBlank()) {
            throw new BusinessException(400, "Email không được để trống");
        }
        if (req.getPassword() == null || req.getPassword().length() < 6) {
            throw new BusinessException(400, "Mật khẩu tối thiểu 6 ký tự");
        }
        if (userRepository.existsByUsername(req.getUsername().trim())) {
            throw new BusinessException(400, "Tên đăng nhập đã tồn tại: " + req.getUsername());
        }
        if (userRepository.existsByEmail(req.getEmail().trim())) {
            throw new BusinessException(400, "Email đã tồn tại: " + req.getEmail());
        }

        User user = User.builder()
                .username(req.getUsername().trim())
                .email(req.getEmail().trim())
                .password(passwordEncoder.encode(req.getPassword()))
                .fullName(req.getFullName() != null && !req.getFullName().isBlank() ? req.getFullName().trim() : req.getUsername().trim())
                .role(req.getRole() != null ? req.getRole() : User.Role.USER)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return ApiResponse.success(toResponse(userRepository.save(user)), "Tạo người dùng thành công");
    }

    @PutMapping("/{id}")
    @Transactional
    public ApiResponse<AdminUserResponse> updateUser(@PathVariable Long id, @RequestBody AdminUserRequest req) {
        requireAdmin();
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng id=" + id));

        if (req.getEmail() != null && !req.getEmail().isBlank() && !req.getEmail().equalsIgnoreCase(user.getEmail())) {
            if (userRepository.existsByEmail(req.getEmail().trim())) {
                throw new BusinessException(400, "Email đã được sử dụng bởi tài khoản khác");
            }
            user.setEmail(req.getEmail().trim());
        }
        if (req.getFullName() != null) {
            user.setFullName(req.getFullName().trim());
        }
        if (req.getRole() != null) {
            user.setRole(req.getRole());
        }
        if (req.getPassword() != null && !req.getPassword().isBlank()) {
            if (req.getPassword().length() < 6) {
                throw new BusinessException(400, "Mật khẩu mới tối thiểu 6 ký tự");
            }
            user.setPassword(passwordEncoder.encode(req.getPassword()));
        }
        user.setUpdatedAt(LocalDateTime.now());
        return ApiResponse.success(toResponse(userRepository.save(user)), "Cập nhật người dùng thành công");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteUser(@PathVariable Long id) {
        Long adminId = requireAdmin();
        if (adminId.equals(id)) {
            throw new BusinessException(400, "Không thể xóa chính tài khoản đang đăng nhập");
        }
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy người dùng id=" + id);
        }

        cleanUserData(id);
        userRepository.deleteById(id);
        return ApiResponse.success(null, "Đã xóa người dùng thành công");
    }

    /**
     * Dọn dữ liệu của người dùng trước khi xoá tài khoản.
     *
     * <p>Không đặt {@code @Transactional} ở đây vì bước 1 là gọi HTTP sang 5 service khác —
     * giữ transaction DB trong lúc chờ mạng sẽ làm chậm và dễ nghẽn connection pool.</p>
     */
    private void cleanUserData(Long userId) {
        // 1) Các service khác tự dọn bảng của họ (best effort, có log cảnh báo nếu service chết).
        userPurgeClient.purgeUserData(userId);

        // 2) Bảng do user-service sở hữu.
        userProfileRepository.deleteByUser_Id(userId);
    }

    private AdminUserResponse toResponse(User u) {
        return AdminUserResponse.builder()
                .id(u.getId())
                .username(u.getUsername())
                .email(u.getEmail())
                .fullName(u.getFullName())
                .avatarUrl(u.getAvatarUrl())
                .role(u.getRole())
                .createdAt(u.getCreatedAt())
                .build();
    }
}
