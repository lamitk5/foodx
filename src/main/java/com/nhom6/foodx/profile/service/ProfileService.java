package com.nhom6.foodx.profile.service;

import com.nhom6.foodx.auth.entity.User;
import com.nhom6.foodx.auth.repository.UserRepository;
import com.nhom6.foodx.common.exception.BusinessException;
import com.nhom6.foodx.profile.dto.ProfileRequest;
import com.nhom6.foodx.profile.dto.ProfileResponse;
import com.nhom6.foodx.profile.entity.UserProfile;
import com.nhom6.foodx.profile.repository.UserProfileRepository;
import com.nhom6.foodx.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

/**
 * Quản lý hồ sơ dinh dưỡng + avatar của người dùng (gộp từ dự án food-x).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final UserProfileRepository profileRepository;
    private final SecurityUtils securityUtils;

    private static final Path AVATAR_DIRECTORY = Paths.get("uploads", "avatars").toAbsolutePath().normalize();
    private static final long MAX_AVATAR_SIZE = 5L * 1024 * 1024;
    private static final Set<String> ALLOWED_TYPES = Set.of("image/jpeg", "image/png", "image/webp");

    /** Lấy hoặc tạo mới hồ sơ mặc định cho user. */
    @Transactional
    public UserProfile getOrCreateProfile(User user) {
        return profileRepository.findByUser_Id(user.getId())
                .orElseGet(() -> {
                    UserProfile profile = UserProfile.builder()
                            .user(user)
                            .gender("male")
                            .age(21)
                            .weight(53.0)
                            .height(153.0)
                            .targetWeight(53.0)
                            .activity(1.2)
                            .diet("Ăn linh tinh")
                            .allergies("")
                            .dislikes("")
                            .build();
                    return profileRepository.save(profile);
                });
    }

    @Transactional
    public ProfileResponse getProfile() {
        User user = securityUtils.getCurrentUser();
        return toResponse(user, getOrCreateProfile(user));
    }

    @Transactional
    public ProfileResponse updateProfile(ProfileRequest request) {
        User user = securityUtils.getCurrentUser();
        UserProfile profile = getOrCreateProfile(user);

        if (request.name() != null && !request.name().isBlank()) {
            user.setFullName(request.name().trim());
        }
        if (request.gender() != null) {
            profile.setGender(request.gender());
        }
        if (request.age() != null) {
            if (request.age() < 1 || request.age() > 120) {
                throw new BusinessException(400, "Tuổi không hợp lệ");
            }
            profile.setAge(request.age());
        }
        if (request.weight() != null) {
            if (request.weight() <= 0 || request.weight() > 500) {
                throw new BusinessException(400, "Cân nặng không hợp lệ");
            }
            profile.setWeight(request.weight());
        }
        if (request.height() != null) {
            if (request.height() <= 0 || request.height() > 300) {
                throw new BusinessException(400, "Chiều cao không hợp lệ");
            }
            profile.setHeight(request.height());
        }
        if (request.target() != null) {
            profile.setTargetWeight(request.target());
        }
        if (request.activity() != null) {
            profile.setActivity(request.activity());
        }
        if (request.diet() != null) {
            profile.setDiet(request.diet());
        }
        profile.setAllergies(request.allergies() == null ? "" : request.allergies().trim());
        profile.setDislikes(request.dislikes() == null ? "" : request.dislikes().trim());

        userRepository.save(user);
        profileRepository.save(profile);
        return toResponse(user, profile);
    }

    @Transactional
    public ProfileResponse uploadAvatar(MultipartFile avatar) {
        if (avatar == null || avatar.isEmpty()) {
            throw new BusinessException(400, "Bạn chưa chọn ảnh");
        }
        if (avatar.getSize() > MAX_AVATAR_SIZE) {
            throw new BusinessException(400, "Ảnh tối đa 5MB");
        }
        String contentType = avatar.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new BusinessException(400, "Chỉ hỗ trợ JPG, PNG hoặc WEBP");
        }

        String extension = switch (contentType) {
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> ".jpg";
        };

        String fileName = UUID.randomUUID() + extension;
        Path target = AVATAR_DIRECTORY.resolve(fileName).normalize();
        if (!target.startsWith(AVATAR_DIRECTORY)) {
            throw new BusinessException(400, "Tên file không hợp lệ");
        }

        try {
            Files.createDirectories(AVATAR_DIRECTORY);
            Files.copy(avatar.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            log.error("Không lưu được avatar", e);
            throw new BusinessException(500, "Không lưu được avatar");
        }

        User user = securityUtils.getCurrentUser();
        deleteOldAvatarFile(user.getAvatarUrl());
        user.setAvatarUrl("/uploads/avatars/" + fileName);
        userRepository.save(user);

        return toResponse(user, getOrCreateProfile(user));
    }

    @Transactional
    public ProfileResponse removeAvatar() {
        User user = securityUtils.getCurrentUser();
        deleteOldAvatarFile(user.getAvatarUrl());
        user.setAvatarUrl(null);
        userRepository.save(user);
        return toResponse(user, getOrCreateProfile(user));
    }

    private void deleteOldAvatarFile(String avatarUrl) {
        if (avatarUrl == null || !avatarUrl.startsWith("/uploads/avatars/")) {
            return;
        }
        String oldFileName = avatarUrl.substring("/uploads/avatars/".length());
        Path oldFile = AVATAR_DIRECTORY.resolve(oldFileName).normalize();
        if (!oldFile.startsWith(AVATAR_DIRECTORY)) {
            return;
        }
        try {
            Files.deleteIfExists(oldFile);
        } catch (IOException ignored) {
        }
    }

    private ProfileResponse toResponse(User user, UserProfile profile) {
        return new ProfileResponse(
                user.getId(),
                profile.getId(),
                user.getFullName(),
                user.getAvatarUrl(),
                profile.getGender(),
                profile.getAge(),
                profile.getWeight(),
                profile.getHeight(),
                profile.getTargetWeight(),
                profile.getActivity(),
                profile.getDiet(),
                profile.getAllergies(),
                profile.getDislikes()
        );
    }
}