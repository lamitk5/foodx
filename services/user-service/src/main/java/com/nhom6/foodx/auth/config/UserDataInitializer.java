package com.nhom6.foodx.auth.config;

import com.nhom6.foodx.auth.entity.User;
import com.nhom6.foodx.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserDataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return;
        }

        log.info("Khoi tao du lieu nguoi dung ban dau...");

        LocalDateTime now = LocalDateTime.now();

        User admin = User.builder()
                .username("admin")
                .email("admin@foodx.com")
                .password(passwordEncoder.encode("Admin@123"))
                .fullName("Quản Trị Viên")
                .role(User.Role.ADMIN)
                .createdAt(now)
                .updatedAt(now)
                .build();

        User minhanh = User.builder()
                .username("minhanh")
                .email("minhanh@foodx.vn")
                .password(passwordEncoder.encode("123456"))
                .fullName("Minh Anh")
                .role(User.Role.USER)
                .createdAt(now)
                .updatedAt(now)
                .build();

        User demo = User.builder()
                .username("demo")
                .email("demo@foodx.com")
                .password(passwordEncoder.encode("123456"))
                .fullName("Người Dùng Demo")
                .role(User.Role.USER)
                .createdAt(now)
                .updatedAt(now)
                .build();

        userRepository.save(admin);
        userRepository.save(minhanh);
        userRepository.save(demo);

        log.info("Da khoi tao thanh cong 3 tai khoan: admin (Admin@123), minhanh (123456), demo (123456)");
    }
}
