package com.nhom6.foodx.internal;

import com.nhom6.foodx.common.client.InternalApi;
import com.nhom6.foodx.common.dto.UserProfileDto;
import com.nhom6.foodx.profile.entity.UserProfile;
import com.nhom6.foodx.profile.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * API nội bộ cho hồ sơ dinh dưỡng.
 *
 * <p>ai-service dùng để dựng prompt, plan-shopping-service dùng để tính mục tiêu kcal —
 * cả hai đọc qua DTO thay vì truy vấn thẳng bảng {@code profiles}.</p>
 */
@RestController
@RequestMapping(InternalApi.PROFILES)
@RequiredArgsConstructor
public class InternalProfileController {

    private final UserProfileRepository userProfileRepository;

    @GetMapping("/{userId}")
    public ResponseEntity<UserProfileDto> getByUserId(@PathVariable Long userId) {
        return userProfileRepository.findByUser_Id(userId)
                .map(profile -> ResponseEntity.ok(toDto(profile)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /** Tra nhiều hồ sơ trong một lời gọi: {@code ?userIds=1,2,3}. */
    @GetMapping
    public List<UserProfileDto> getByUserIds(@RequestParam("userIds") List<Long> userIds) {
        return userProfileRepository.findByUser_IdIn(userIds).stream().map(this::toDto).toList();
    }

    private UserProfileDto toDto(UserProfile profile) {
        return new UserProfileDto(
                profile.getUser() != null ? profile.getUser().getId() : null,
                profile.getGender(),
                profile.getAge(),
                profile.getWeight(),
                profile.getHeight(),
                profile.getTargetWeight(),
                profile.getActivity(),
                profile.getDiet(),
                profile.getAllergies(),
                profile.getDislikes());
    }
}
