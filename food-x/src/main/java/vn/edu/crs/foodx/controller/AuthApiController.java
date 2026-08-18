package vn.edu.crs.foodx.controller;

import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.edu.crs.foodx.dto.AuthResponse;
import vn.edu.crs.foodx.dto.LoginRequest;
import vn.edu.crs.foodx.dto.RegisterRequest;
import vn.edu.crs.foodx.service.AuthService;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthApiController {

    private final AuthService authService;


    public AuthApiController(
            AuthService authService
    ) {

        this.authService =
                authService;
    }


    /* =====================================================
       ĐĂNG KÝ
    ===================================================== */

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody RegisterRequest request,
            HttpSession session
    ) {

        try {

            AuthResponse response =
                    authService.register(
                            request,
                            session
                    );


            return ResponseEntity
                    .status(
                            HttpStatus.CREATED
                    )
                    .body(
                            response
                    );


        } catch (
                IllegalArgumentException exception
        ) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    exception.getMessage()
                            )
                    );
        }
    }


    /* =====================================================
       ĐĂNG NHẬP
    ===================================================== */

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request,
            HttpSession session
    ) {

        try {

            return ResponseEntity.ok(
                    authService.login(
                            request,
                            session
                    )
            );


        } catch (
                IllegalArgumentException exception
        ) {

            return ResponseEntity
                    .status(
                            HttpStatus.UNAUTHORIZED
                    )
                    .body(
                            Map.of(
                                    "message",
                                    exception.getMessage()
                            )
                    );
        }
    }


    /* =====================================================
       USER HIỆN TẠI
    ===================================================== */

    @GetMapping("/me")
    public AuthResponse me(
            HttpSession session
    ) {

        return authService
                .getCurrentUser(
                        session
                );
    }


    /* =====================================================
       ĐĂNG XUẤT
    ===================================================== */

    @PostMapping("/logout")
    public AuthResponse logout(
            HttpSession session
    ) {

        return authService.logout(
                session
        );
    }
}