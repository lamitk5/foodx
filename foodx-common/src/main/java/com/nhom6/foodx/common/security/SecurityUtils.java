package com.nhom6.foodx.common.security;

import com.nhom6.foodx.common.exception.BusinessException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

/**
 * Tiện ích lấy thông tin người dùng hiện tại từ {@link SecurityContextHolder}.
 *
 * <p>Đây là lớp <b>static</b> duy nhất của hệ thống. Các microservice không còn tự
 * truy vấn bảng {@code users} để biết "tôi là ai": danh tính đến từ claims của JWT
 * ({@code uid}, {@code role}) do {@link JwtAuthenticationFilter} nạp vào
 * {@link UserPrincipal}. Nhờ vậy một service chỉ cần {@code userId}, không cần
 * entity {@code User} hay repository của user-service.</p>
 */
public final class SecurityUtils {

    private SecurityUtils() {
    }

    /** Principal hiện tại, rỗng nếu request chưa xác thực. */
    public static Optional<UserPrincipal> currentPrincipal() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            return Optional.of(principal);
        }
        return Optional.empty();
    }

    /** Principal hiện tại; ném 401 nếu chưa đăng nhập. */
    public static UserPrincipal getCurrentUser() {
        return currentPrincipal()
                .orElseThrow(() -> new BusinessException(401, "Bạn cần đăng nhập để thực hiện chức năng này"));
    }

    /** ID người dùng hiện tại; ném 401 nếu chưa đăng nhập. */
    public static Long getCurrentUserId() {
        Long id = getCurrentUser().getId();
        if (id == null) {
            throw new BusinessException(401, "Token không hợp lệ: thiếu định danh người dùng");
        }
        return id;
    }

    /** ID người dùng hiện tại, hoặc null nếu ẩn danh (dùng cho endpoint công khai). */
    public static Long getCurrentUserIdOrNull() {
        return currentPrincipal().map(UserPrincipal::getId).orElse(null);
    }

    /** Tên đăng nhập hiện tại, hoặc null nếu ẩn danh. */
    public static String getCurrentUsername() {
        return currentPrincipal().map(UserPrincipal::getUsername).orElse(null);
    }

    /** Vai trò hiện tại, hoặc null nếu ẩn danh. */
    public static String getCurrentRole() {
        return currentPrincipal().map(UserPrincipal::getRole).orElse(null);
    }

    public static boolean hasRole(String role) {
        return currentPrincipal()
                .map(UserPrincipal::getAuthorities)
                .map(authorities -> authorities.stream()
                        .map(GrantedAuthority::getAuthority)
                        .anyMatch(a -> a.equals(role) || a.equals("ROLE_" + role)))
                .orElse(false);
    }

    public static boolean isAdmin() {
        return hasRole("ADMIN");
    }
}
