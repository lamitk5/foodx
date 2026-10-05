package com.nhom6.foodx;

import com.nhom6.foodx.auth.dto.RegisterRequest;
import com.nhom6.foodx.auth.entity.User;
import com.nhom6.foodx.auth.repository.UserRepository;
import com.nhom6.foodx.auth.service.AuthService;
import com.nhom6.foodx.common.exception.BusinessException;
import com.nhom6.foodx.favorite.dto.FavoriteRequest;
import com.nhom6.foodx.favorite.entity.Favorite;
import com.nhom6.foodx.favorite.repository.FavoriteRepository;
import com.nhom6.foodx.favorite.service.FavoriteService;
import com.nhom6.foodx.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthAndFavoriteTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private JwtTokenProvider jwtTokenProvider;
    @Mock
    private FavoriteRepository favoriteRepository;
    @Mock
    private JdbcTemplate jdbcTemplate;

    private AuthService authService;
    private FavoriteService favoriteService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, passwordEncoder, authenticationManager, jwtTokenProvider);
        favoriteService = new FavoriteService(favoriteRepository, jdbcTemplate);
    }

    @Test
    @DisplayName("TC01: Đăng ký tài khoản thành công")
    void testRegisterSuccess() {
        RegisterRequest req = RegisterRequest.builder()
                .username("honghanh")
                .email("honghanh@foodx.vn")
                .password("123456")
                .confirmPassword("123456")
                .fullName("Nguyễn Thị Hồng Hạnh")
                .build();

        when(userRepository.existsByUsernameIgnoreCase("honghanh")).thenReturn(false);
        when(userRepository.existsByEmailIgnoreCase("honghanh@foodx.vn")).thenReturn(false);
        when(passwordEncoder.encode("123456")).thenReturn("hashed123");
        when(jwtTokenProvider.generateToken(any(), any(), any())).thenReturn("mock-jwt-token");

        var response = authService.register(req);

        assertNotNull(response);
        assertEquals("mock-jwt-token", response.getAccessToken());
        assertEquals("honghanh", response.getUsername());
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("TC02: Đăng ký mật khẩu xác nhận không khớp")
    void testRegisterMismatchPassword() {
        RegisterRequest req = RegisterRequest.builder()
                .username("honghanh")
                .email("honghanh@foodx.vn")
                .password("123456")
                .confirmPassword("654321")
                .build();

        BusinessException ex = assertThrows(BusinessException.class, () -> authService.register(req));
        assertTrue(ex.getMessage().contains("không khớp"));
    }

    @Test
    @DisplayName("TC03: Đăng ký trùng tên đăng nhập")
    void testRegisterDuplicateUsername() {
        RegisterRequest req = RegisterRequest.builder()
                .username("honghanh")
                .email("honghanh@foodx.vn")
                .password("123456")
                .confirmPassword("123456")
                .build();

        when(userRepository.existsByUsernameIgnoreCase("honghanh")).thenReturn(true);

        BusinessException ex = assertThrows(BusinessException.class, () -> authService.register(req));
        assertTrue(ex.getMessage().contains("đã tồn tại"));
    }

    @Test
    @DisplayName("TC04: Toggle thêm món ăn vào danh sách yêu thích")
    void testToggleAddFavorite() {
        FavoriteRequest req = new FavoriteRequest(10L, "RECIPE");
        when(favoriteRepository.existsByUserIdAndTargetIdAndTargetType(1L, 10L, "RECIPE")).thenReturn(false);

        boolean result = favoriteService.toggle(1L, req);

        assertTrue(result);
        verify(favoriteRepository).save(any(Favorite.class));
    }

    @Test
    @DisplayName("TC05: Toggle bỏ món ăn khỏi danh sách yêu thích")
    void testToggleRemoveFavorite() {
        FavoriteRequest req = new FavoriteRequest(10L, "RECIPE");
        Favorite existing = Favorite.builder()
                .id(100L)
                .userId(1L)
                .targetId(10L)
                .targetType("RECIPE")
                .createdAt(LocalDateTime.now())
                .build();

        when(favoriteRepository.existsByUserIdAndTargetIdAndTargetType(1L, 10L, "RECIPE")).thenReturn(true);
        when(favoriteRepository.findByUserIdAndTargetIdAndTargetType(1L, 10L, "RECIPE")).thenReturn(Optional.of(existing));

        boolean result = favoriteService.toggle(1L, req);

        assertFalse(result);
        verify(favoriteRepository).delete(existing);
    }

    @Test
    @DisplayName("TC06: Lấy danh sách ID các món yêu thích của người dùng")
    void testGetFavoriteIds() {
        Favorite f1 = Favorite.builder().id(1L).userId(1L).targetId(10L).targetType("RECIPE").build();
        Favorite f2 = Favorite.builder().id(2L).userId(1L).targetId(25L).targetType("RECIPE").build();
        when(favoriteRepository.findByUserIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(f1, f2));

        List<Long> ids = favoriteService.getFavoriteIds(1L, "RECIPE");

        assertEquals(2, ids.size());
        assertTrue(ids.contains(10L));
        assertTrue(ids.contains(25L));
    }
}
