package com.nhom6.foodx.common.dto;

/**
 * Thông tin tóm tắt một người dùng, trả về qua API nội bộ của user-service.
 *
 * <p>Nhờ DTO này, các service khác hiển thị tên/avatar tác giả mà không cần bảng
 * {@code users} hay entity {@code User} trong mã nguồn của mình.</p>
 */
public record UserSummaryDto(
        Long id,
        String username,
        String email,
        String fullName,
        String avatarUrl,
        String role) {
}
