package com.nhom6.foodx.profile.controller;

import com.nhom6.foodx.common.response.ApiResponse;
import com.nhom6.foodx.profile.dto.ProfileRequest;
import com.nhom6.foodx.profile.dto.ProfileResponse;
import com.nhom6.foodx.profile.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * API hồ sơ dinh dưỡng + avatar (gộp từ dự án food-x).
 */
@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping
    public ApiResponse<ProfileResponse> getProfile() {
        return ApiResponse.success(profileService.getProfile(), "Lấy hồ sơ thành công");
    }

    @PutMapping
    public ApiResponse<ProfileResponse> updateProfile(@RequestBody ProfileRequest request) {
        return ApiResponse.success(profileService.updateProfile(request), "Cập nhật hồ sơ thành công");
    }

    @PostMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<ProfileResponse> uploadAvatar(@RequestParam("avatar") MultipartFile avatar) {
        return ApiResponse.success(profileService.uploadAvatar(avatar), "Cập nhật avatar thành công");
    }

    @DeleteMapping("/avatar")
    public ApiResponse<ProfileResponse> removeAvatar() {
        return ApiResponse.success(profileService.removeAvatar(), "Xóa avatar thành công");
    }
}