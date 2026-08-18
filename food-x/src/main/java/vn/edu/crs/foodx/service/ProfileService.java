package vn.edu.crs.foodx.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import vn.edu.crs.foodx.dto.ProfileRequest;
import vn.edu.crs.foodx.dto.ProfileResponse;
import vn.edu.crs.foodx.entity.AppUser;
import vn.edu.crs.foodx.entity.UserProfile;
import vn.edu.crs.foodx.repository.AppUserRepository;
import vn.edu.crs.foodx.repository.UserProfileRepository;

import java.io.IOException;
import java.nio.file.*;
import java.util.Set;
import java.util.UUID;

@Service
public class ProfileService {

    private final AppUserRepository userRepository;

    private final UserProfileRepository profileRepository;


    /*
        File avatar lưu ngoài resources
        để chạy bằng jar vẫn ghi được.
    */
    private final Path avatarDirectory =
            Paths.get(
                            "uploads",
                            "avatars"
                    )
                    .toAbsolutePath()
                    .normalize();


    private static final long MAX_AVATAR_SIZE =
            5L * 1024 * 1024;


    private static final Set<String> ALLOWED_TYPES =
            Set.of(
                    "image/jpeg",
                    "image/png",
                    "image/webp"
            );


    public ProfileService(
            AppUserRepository userRepository,
            UserProfileRepository profileRepository
    ) {

        this.userRepository =
                userRepository;

        this.profileRepository =
                profileRepository;


        try {

            Files.createDirectories(
                    avatarDirectory
            );

        } catch (IOException e) {

            throw new IllegalStateException(
                    "Không tạo được thư mục avatar",
                    e
            );
        }
    }


    /* =====================================================
       CURRENT USER
       Chưa có đăng nhập → lấy user đầu tiên.
    ===================================================== */

    @Transactional
    public AppUser getCurrentUser() {

        return userRepository
                .findFirstByOrderByIdAsc()
                .orElseGet(
                        () -> {

                            AppUser user =
                                    new AppUser();

                            user.setFullName(
                                    "Người dùng Food X"
                            );

                            return userRepository.save(
                                    user
                            );
                        }
                );
    }


    /* =====================================================
       GET OR CREATE PROFILE
    ===================================================== */

    @Transactional
    public UserProfile getOrCreateProfile(
            AppUser user
    ) {

        return profileRepository
                .findByUser_Id(
                        user.getId()
                )
                .orElseGet(
                        () -> {

                            UserProfile profile =
                                    new UserProfile();

                            profile.setUser(
                                    user
                            );

                            profile.setGender(
                                    "male"
                            );

                            profile.setAge(
                                    21
                            );

                            profile.setWeight(
                                    53.0
                            );

                            profile.setHeight(
                                    153.0
                            );

                            profile.setTargetWeight(
                                    53.0
                            );

                            profile.setActivity(
                                    1.2
                            );

                            profile.setDiet(
                                    "Ăn linh tinh"
                            );

                            profile.setAllergies(
                                    ""
                            );

                            profile.setDislikes(
                                    ""
                            );

                            return profileRepository.save(
                                    profile
                            );
                        }
                );
    }


    /* =====================================================
       GET
    ===================================================== */

    @Transactional
    public ProfileResponse getProfile() {

        AppUser user =
                getCurrentUser();


        UserProfile profile =
                getOrCreateProfile(
                        user
                );


        return toResponse(
                user,
                profile
        );
    }


    /* =====================================================
       UPDATE
    ===================================================== */

    @Transactional
    public ProfileResponse updateProfile(
            ProfileRequest request
    ) {

        AppUser user =
                getCurrentUser();


        UserProfile profile =
                getOrCreateProfile(
                        user
                );


        if (
                request.name() != null &&
                        !request.name().isBlank()
        ) {

            user.setFullName(
                    request.name().trim()
            );
        }


        if (request.gender() != null) {
            profile.setGender(
                    request.gender()
            );
        }


        if (request.age() != null) {

            if (
                    request.age() < 1 ||
                            request.age() > 120
            ) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Tuổi không hợp lệ"
                );
            }

            profile.setAge(
                    request.age()
            );
        }


        if (request.weight() != null) {

            if (
                    request.weight() <= 0 ||
                            request.weight() > 500
            ) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Cân nặng không hợp lệ"
                );
            }

            profile.setWeight(
                    request.weight()
            );
        }


        if (request.height() != null) {

            if (
                    request.height() <= 0 ||
                            request.height() > 300
            ) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Chiều cao không hợp lệ"
                );
            }

            profile.setHeight(
                    request.height()
            );
        }


        if (request.target() != null) {

            profile.setTargetWeight(
                    request.target()
            );
        }


        if (request.activity() != null) {

            profile.setActivity(
                    request.activity()
            );
        }


        if (request.diet() != null) {

            profile.setDiet(
                    request.diet()
            );
        }


        profile.setAllergies(
                request.allergies() == null
                        ? ""
                        : request.allergies().trim()
        );


        profile.setDislikes(
                request.dislikes() == null
                        ? ""
                        : request.dislikes().trim()
        );


        userRepository.save(
                user
        );


        profileRepository.save(
                profile
        );


        return toResponse(
                user,
                profile
        );
    }


    /* =====================================================
       UPLOAD AVATAR
    ===================================================== */

    @Transactional
    public ProfileResponse uploadAvatar(
            MultipartFile avatar
    ) {

        if (
                avatar == null ||
                        avatar.isEmpty()
        ) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Bạn chưa chọn ảnh"
            );
        }


        if (
                avatar.getSize() >
                        MAX_AVATAR_SIZE
        ) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Ảnh tối đa 5MB"
            );
        }


        String contentType =
                avatar.getContentType();


        if (
                contentType == null ||
                        !ALLOWED_TYPES.contains(
                                contentType
                        )
        ) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Chỉ hỗ trợ JPG, PNG hoặc WEBP"
            );
        }


        String extension =
                switch (contentType) {

                    case "image/png" ->
                            ".png";

                    case "image/webp" ->
                            ".webp";

                    default ->
                            ".jpg";
                };


        String fileName =
                UUID.randomUUID() +
                        extension;


        Path target =
                avatarDirectory
                        .resolve(
                                fileName
                        )
                        .normalize();


        if (
                !target.startsWith(
                        avatarDirectory
                )
        ) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Tên file không hợp lệ"
            );
        }


        try {

            Files.copy(
                    avatar.getInputStream(),
                    target,
                    StandardCopyOption.REPLACE_EXISTING
            );

        } catch (IOException e) {

            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Không lưu được avatar"
            );
        }


        AppUser user =
                getCurrentUser();


        /*
            Xóa avatar cũ nếu nó là file
            do Food X upload.
        */
        deleteOldAvatarFile(
                user.getAvatarUrl()
        );


        user.setAvatarUrl(
                "/uploads/avatars/" +
                        fileName
        );


        userRepository.save(
                user
        );


        UserProfile profile =
                getOrCreateProfile(
                        user
                );


        return toResponse(
                user,
                profile
        );
    }


    /* =====================================================
       DELETE AVATAR
    ===================================================== */

    @Transactional
    public ProfileResponse removeAvatar() {

        AppUser user =
                getCurrentUser();


        deleteOldAvatarFile(
                user.getAvatarUrl()
        );


        user.setAvatarUrl(
                null
        );


        userRepository.save(
                user
        );


        UserProfile profile =
                getOrCreateProfile(
                        user
                );


        return toResponse(
                user,
                profile
        );
    }


    /* =====================================================
       DELETE FILE
    ===================================================== */

    private void deleteOldAvatarFile(
            String avatarUrl
    ) {

        if (
                avatarUrl == null ||
                        !avatarUrl.startsWith(
                                "/uploads/avatars/"
                        )
        ) {

            return;
        }


        String oldFileName =
                avatarUrl.substring(
                        "/uploads/avatars/".length()
                );


        Path oldFile =
                avatarDirectory
                        .resolve(
                                oldFileName
                        )
                        .normalize();


        if (
                !oldFile.startsWith(
                        avatarDirectory
                )
        ) {
            return;
        }


        try {

            Files.deleteIfExists(
                    oldFile
            );

        } catch (IOException ignored) {
        }
    }


    /* =====================================================
       DTO
    ===================================================== */

    private ProfileResponse toResponse(
            AppUser user,
            UserProfile profile
    ) {

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