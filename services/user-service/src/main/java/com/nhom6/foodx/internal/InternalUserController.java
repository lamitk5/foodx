package com.nhom6.foodx.internal;

import com.nhom6.foodx.auth.entity.User;
import com.nhom6.foodx.auth.repository.UserRepository;
import com.nhom6.foodx.common.client.InternalApi;
import com.nhom6.foodx.common.dto.UserSummaryDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * API nội bộ cho các microservice khác đọc thông tin người dùng.
 *
 * <p>Chỉ tồn tại trong mạng nội bộ (yêu cầu {@code X-Foodx-Internal-Token}) và không được
 * API Gateway định tuyến ra ngoài. Nhờ vậy recipe-service, social-stats-service...
 * hiển thị được tên tác giả mà không cần bảng {@code users} trong mã nguồn.</p>
 */
@RestController
@RequestMapping(InternalApi.USERS)
@RequiredArgsConstructor
public class InternalUserController {

    private final UserRepository userRepository;

    @GetMapping("/{id}")
    public ResponseEntity<UserSummaryDto> getById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(user -> ResponseEntity.ok(toDto(user)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /** Tra nhiều người dùng trong một lời gọi: {@code ?ids=1,2,3}. */
    @GetMapping
    public List<UserSummaryDto> getByIds(@RequestParam("ids") List<Long> ids) {
        return userRepository.findAllById(ids).stream().map(this::toDto).toList();
    }

    private UserSummaryDto toDto(User user) {
        return new UserSummaryDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getAvatarUrl(),
                user.getRole() != null ? user.getRole().name() : null);
    }
}
