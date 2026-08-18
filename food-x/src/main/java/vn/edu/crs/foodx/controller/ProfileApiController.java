package vn.edu.crs.foodx.controller;

import jakarta.servlet.http.HttpSession;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import vn.edu.crs.foodx.dto.ProfileRequest;
import vn.edu.crs.foodx.dto.ProfileResponse;
import vn.edu.crs.foodx.service.ProfileService;

@RestController
@RequestMapping("/api/profile")
public class ProfileApiController {

    private final ProfileService profileService;


    public ProfileApiController(
            ProfileService profileService
    ) {
        this.profileService =
                profileService;
    }


    /* =====================================================
       LẤY PROFILE USER ĐANG ĐĂNG NHẬP
    ===================================================== */

    @GetMapping
    public ProfileResponse getProfile(
            HttpSession session
    ) {

        return profileService
                .getProfile(
                        session
                );
    }


    /* =====================================================
       CẬP NHẬT PROFILE
    ===================================================== */

    @PutMapping
    public ProfileResponse updateProfile(
            @RequestBody
            ProfileRequest request,

            HttpSession session
    ) {

        return profileService
                .updateProfile(
                        request,
                        session
                );
    }


    /* =====================================================
       UPLOAD AVATAR
    ===================================================== */

    @PostMapping(
            value = "/avatar",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ProfileResponse uploadAvatar(

            @RequestParam("avatar")
            MultipartFile avatar,

            HttpSession session
    ) {

        return profileService
                .uploadAvatar(
                        avatar,
                        session
                );
    }


    /* =====================================================
       XÓA AVATAR
    ===================================================== */

    @DeleteMapping("/avatar")
    public ProfileResponse removeAvatar(
            HttpSession session
    ) {

        return profileService
                .removeAvatar(
                        session
                );
    }
}