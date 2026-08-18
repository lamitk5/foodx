package vn.edu.crs.foodx.service;

import jakarta.servlet.http.HttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.crs.foodx.dto.AuthResponse;
import vn.edu.crs.foodx.dto.LoginRequest;
import vn.edu.crs.foodx.dto.RegisterRequest;
import vn.edu.crs.foodx.entity.AppUser;
import vn.edu.crs.foodx.repository.AppUserRepository;

import java.util.Locale;
import java.util.Optional;

@Service
public class AuthService {

    public static final String SESSION_USER_ID =
            "FOODX_USER_ID";

    private final AppUserRepository appUserRepository;

    private final PasswordEncoder passwordEncoder;


    public AuthService(
            AppUserRepository appUserRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.appUserRepository =
                appUserRepository;

        this.passwordEncoder =
                passwordEncoder;
    }


    /* =====================================================
       ĐĂNG KÝ
    ===================================================== */

    @Transactional
    public AuthResponse register(
            RegisterRequest request,
            HttpSession session
    ) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Thông tin đăng ký không hợp lệ."
            );
        }


        String fullName =
                clean(request.getFullName());

        String email =
                normalizeEmail(
                        request.getEmail()
                );

        String password =
                request.getPassword();

        String confirmPassword =
                request.getConfirmPassword();


        /* =========================
           VALIDATE HỌ TÊN
        ========================== */

        if (
                fullName == null ||
                        fullName.length() < 2
        ) {
            throw new IllegalArgumentException(
                    "Họ tên phải có ít nhất 2 ký tự."
            );
        }


        /* =========================
           VALIDATE EMAIL
        ========================== */

        if (
                email == null ||
                        !isValidEmail(email)
        ) {
            throw new IllegalArgumentException(
                    "Email không hợp lệ."
            );
        }


        if (
                appUserRepository
                        .existsByEmailIgnoreCase(
                                email
                        )
        ) {
            throw new IllegalArgumentException(
                    "Email này đã được đăng ký."
            );
        }


        /* =========================
           VALIDATE PASSWORD
        ========================== */

        if (
                password == null ||
                        password.length() < 6
        ) {
            throw new IllegalArgumentException(
                    "Mật khẩu phải có ít nhất 6 ký tự."
            );
        }


        if (
                confirmPassword == null ||
                        !password.equals(
                                confirmPassword
                        )
        ) {
            throw new IllegalArgumentException(
                    "Mật khẩu nhập lại không khớp."
            );
        }


        /* =========================
           TẠO USER
        ========================== */

        AppUser user =
                new AppUser();

        user.setFullName(
                fullName
        );

        user.setEmail(
                email
        );

        /*
         * Lưu mật khẩu BCrypt,
         * KHÔNG lưu mật khẩu gốc.
         */
        user.setPassword(
                passwordEncoder.encode(
                        password
                )
        );

        user.setRole(
                "USER"
        );

        user.setEnabled(
                true
        );


        AppUser savedUser =
                appUserRepository.save(
                        user
                );


        /* =========================
           ĐĂNG NHẬP LUÔN
           SAU KHI ĐĂNG KÝ
        ========================== */

        session.setAttribute(
                SESSION_USER_ID,
                savedUser.getId()
        );


        return createResponse(
                savedUser,
                true,
                "Đăng ký tài khoản thành công."
        );
    }


    /* =====================================================
       ĐĂNG NHẬP
    ===================================================== */

    public AuthResponse login(
            LoginRequest request,
            HttpSession session
    ) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Thông tin đăng nhập không hợp lệ."
            );
        }


        String email =
                normalizeEmail(
                        request.getEmail()
                );

        String password =
                request.getPassword();


        if (
                email == null ||
                        password == null ||
                        password.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Vui lòng nhập email và mật khẩu."
            );
        }


        AppUser user =
                appUserRepository
                        .findByEmailIgnoreCase(
                                email
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Email hoặc mật khẩu không chính xác."
                                        )
                        );


        if (
                Boolean.FALSE.equals(
                        user.getEnabled()
                )
        ) {
            throw new IllegalArgumentException(
                    "Tài khoản đã bị khóa."
            );
        }


        if (
                user.getPassword() == null ||
                        !passwordEncoder.matches(
                                password,
                                user.getPassword()
                        )
        ) {
            throw new IllegalArgumentException(
                    "Email hoặc mật khẩu không chính xác."
            );
        }


        session.setAttribute(
                SESSION_USER_ID,
                user.getId()
        );


        return createResponse(
                user,
                true,
                "Đăng nhập thành công."
        );
    }


    /* =====================================================
       USER ĐANG ĐĂNG NHẬP
    ===================================================== */

    public AuthResponse getCurrentUser(
            HttpSession session
    ) {

        Long userId =
                getCurrentUserId(
                        session
                );


        if (userId == null) {
            return guestResponse();
        }


        Optional<AppUser> optionalUser =
                appUserRepository.findById(
                        userId
                );


        if (optionalUser.isEmpty()) {

            session.removeAttribute(
                    SESSION_USER_ID
            );

            return guestResponse();
        }


        AppUser user =
                optionalUser.get();


        if (
                Boolean.FALSE.equals(
                        user.getEnabled()
                )
        ) {

            session.removeAttribute(
                    SESSION_USER_ID
            );

            return guestResponse();
        }


        return createResponse(
                user,
                true,
                "Đã đăng nhập."
        );
    }


    /* =====================================================
       LẤY USER ID TỪ SESSION
    ===================================================== */

    public Long getCurrentUserId(
            HttpSession session
    ) {

        if (session == null) {
            return null;
        }


        Object value =
                session.getAttribute(
                        SESSION_USER_ID
                );


        if (value instanceof Long) {
            return (Long) value;
        }


        if (value instanceof Number) {
            return ((Number) value)
                    .longValue();
        }


        return null;
    }


    /* =====================================================
       ĐĂNG XUẤT
    ===================================================== */

    public AuthResponse logout(
            HttpSession session
    ) {

        if (session != null) {
            session.invalidate();
        }


        return new AuthResponse(
                false,
                "Đăng xuất thành công.",
                null,
                null,
                null,
                null,
                null
        );
    }


    /* =====================================================
       RESPONSE
    ===================================================== */

    private AuthResponse createResponse(
            AppUser user,
            boolean authenticated,
            String message
    ) {

        return new AuthResponse(
                authenticated,
                message,
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.getAvatarUrl()
        );
    }


    private AuthResponse guestResponse() {

        return new AuthResponse(
                false,
                "Chưa đăng nhập.",
                null,
                null,
                null,
                null,
                null
        );
    }


    /* =====================================================
       HELPER
    ===================================================== */

    private String clean(
            String value
    ) {

        if (value == null) {
            return null;
        }


        String result =
                value.trim();


        return result.isEmpty()
                ? null
                : result;
    }


    private String normalizeEmail(
            String email
    ) {

        String value =
                clean(email);


        if (value == null) {
            return null;
        }


        return value.toLowerCase(
                Locale.ROOT
        );
    }


    private boolean isValidEmail(
            String email
    ) {

        return email.matches(
                "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
        );
    }
}