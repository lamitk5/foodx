package com.nhom6.foodx.auth.service;

import com.nhom6.foodx.auth.entity.User;
import com.nhom6.foodx.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Nạp thông tin người dùng theo username hoặc email.
 *
 * <p>Chỉ <b>user-service</b> cần lớp này: nó phục vụ {@code AuthenticationManager} khi
 * đăng nhập (kiểm tra mật khẩu). Các service khác xác thực người dùng từ claims của JWT
 * do {@code foodx-common} cung cấp, không truy vấn bảng {@code users}.</p>
 */
@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(usernameOrEmail)
                .orElseGet(() -> userRepository.findByEmail(usernameOrEmail)
                        .orElseThrow(() -> new UsernameNotFoundException(
                                "Không tìm thấy người dùng: " + usernameOrEmail)));

        List<SimpleGrantedAuthority> authorities =
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));

        return org.springframework.security.core.userdetails.User
                .withUsername(user.getUsername())
                .password(user.getPassword())
                .authorities(authorities)
                .build();
    }
}
