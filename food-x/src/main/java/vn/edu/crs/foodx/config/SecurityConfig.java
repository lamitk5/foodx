package vn.edu.crs.foodx.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    /*
     * TẠM THỜI:
     * Cho phép toàn bộ request để Food X hiện tại
     * vẫn chạy bình thường trong lúc ta xây
     * chức năng đăng ký / đăng nhập.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http

                /*
                 * app.js hiện đang POST / PUT / PATCH / DELETE
                 * mà chưa gửi CSRF token.
                 *
                 * Vì vậy tạm tắt CSRF.
                 * Sau khi hoàn thiện đăng nhập sẽ cấu hình lại.
                 */
                .csrf(csrf ->
                        csrf.disable()
                )

                /*
                 * Hiện tại cho phép mọi URL.
                 *
                 * Sau này sẽ đổi thành:
                 *
                 * /api/auth/**       -> permitAll()
                 * /css/**            -> permitAll()
                 * /js/**             -> permitAll()
                 * /images/**         -> permitAll()
                 * các API cá nhân    -> authenticated()
                 */
                .authorizeHttpRequests(auth ->
                        auth.anyRequest().permitAll()
                )

                /*
                 * Không dùng màn hình login mặc định
                 * của Spring Security.
                 *
                 * Food X sẽ có popup đăng nhập riêng.
                 */
                .formLogin(form ->
                        form.disable()
                )

                /*
                 * Không dùng HTTP Basic.
                 */
                .httpBasic(basic ->
                        basic.disable()
                );


        return http.build();
    }


    /*
     * Mật khẩu tuyệt đối không lưu dạng chữ thường.
     *
     * Register:
     * passwordEncoder.encode(password)
     *
     * Login:
     * passwordEncoder.matches(
     *      rawPassword,
     *      encodedPassword
     * )
     */
    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }
}