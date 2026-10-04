package com.nhom6.foodx.auth.service;

import com.nhom6.foodx.auth.dto.AuthResponse;
import com.nhom6.foodx.auth.dto.LoginRequest;
import com.nhom6.foodx.auth.dto.RegisterRequest;
import com.nhom6.foodx.auth.entity.User;
import com.nhom6.foodx.auth.repository.UserRepository;
import com.nhom6.foodx.common.exception.BusinessException;
import com.nhom6.foodx.common.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private com.nhom6.foodx.profile.repository.UserProfileRepository userProfileRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@foodx.vn")
                .password("encoded_pass")
                .fullName("Test User")
                .role(User.Role.USER)
                .build();
    }

    @Test
    @DisplayName("Dang ky thanh cong voi thong tin hop le")
    void testRegisterSuccess() {
        RegisterRequest req = new RegisterRequest();
        req.setUsername("newuser");
        req.setEmail("new@foodx.vn");
        req.setPassword("Secret123!");
        req.setFullName("New User");

        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("new@foodx.vn")).thenReturn(false);
        when(passwordEncoder.encode("Secret123!")).thenReturn("encodedSecret");
        when(jwtTokenProvider.generateToken(any(), eq("newuser"), eq("USER"))).thenReturn("mock-jwt-token");

        AuthResponse resp = authService.register(req);

        assertNotNull(resp);
        assertEquals("mock-jwt-token", resp.getAccessToken());
        assertEquals("newuser", resp.getUsername());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Dang ky that bai khi trung username")
    void testRegisterDuplicateUsername() {
        RegisterRequest req = new RegisterRequest();
        req.setUsername("existing");
        req.setEmail("unique@foodx.vn");

        when(userRepository.existsByUsername("existing")).thenReturn(true);

        BusinessException ex = assertThrows(BusinessException.class, () -> authService.register(req));
        assertEquals(400, ex.getStatus());
        assertTrue(ex.getMessage().contains("Tên đăng nhập đã tồn tại"));
    }

    @Test
    @DisplayName("Dang nhap thanh cong voi username hop le")
    void testLoginSuccess() {
        LoginRequest req = new LoginRequest();
        req.setUsername("testuser");
        req.setPassword("Secret123!");

        when(userRepository.findByUsernameIgnoreCase("testuser")).thenReturn(Optional.of(sampleUser));
        Authentication auth = mock(Authentication.class);
        when(auth.getName()).thenReturn("testuser");
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(sampleUser));
        when(jwtTokenProvider.generateToken(eq(1L), eq("testuser"), eq("USER"))).thenReturn("mock-jwt-token");

        AuthResponse resp = authService.login(req);

        assertNotNull(resp);
        assertEquals("mock-jwt-token", resp.getAccessToken());
        assertEquals("testuser", resp.getUsername());
    }

    @Test
    @DisplayName("Dang nhap that bai khi sai mat khau")
    void testLoginBadCredentials() {
        LoginRequest req = new LoginRequest();
        req.setUsername("testuser");
        req.setPassword("wrongpassword");

        when(userRepository.findByUsernameIgnoreCase("testuser")).thenReturn(Optional.of(sampleUser));
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        BusinessException ex = assertThrows(BusinessException.class, () -> authService.login(req));
        assertEquals(401, ex.getStatus());
        assertTrue(ex.getMessage().contains("không chính xác"));
    }
}
