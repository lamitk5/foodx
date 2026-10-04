package com.nhom6.foodx.common.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

import java.util.ArrayList;
import java.util.List;

/**
 * Chặn việc chạy production với bí mật mặc định của môi trường phát triển.
 *
 * <p>Giá trị mặc định của {@code app.jwt.secret} và {@code foodx.internal.token} nằm trong mã
 * nguồn để tiện chạy dev. Nếu deploy mà quên đặt biến môi trường, hệ thống sẽ dùng khoá đã
 * công khai trong repo — ai cũng ký được JWT hoặc gọi được {@code /internal/**}.</p>
 *
 * <ul>
 *   <li>profile {@code prod}: <b>dừng khởi động</b> ngay (fail fast) kèm hướng dẫn;</li>
 *   <li>các môi trường khác: chỉ ghi log cảnh báo.</li>
 * </ul>
 *
 * <p>Cách đặt khi deploy: {@code APP_JWT_SECRET}, {@code FOODX_INTERNAL_TOKEN}.</p>
 */
@Slf4j
@Configuration
public class SecretGuardConfiguration {

    private static final String DEV_JWT_SECRET = "dev-super-secret-key-please-change-this-key-32bytes!!";
    private static final String DEV_INTERNAL_TOKEN = "foodx-internal-dev-token";

    public SecretGuardConfiguration(Environment environment) {
        List<String> insecure = new ArrayList<>();
        if (DEV_JWT_SECRET.equals(environment.getProperty("app.jwt.secret", DEV_JWT_SECRET))) {
            insecure.add("app.jwt.secret (đặt qua APP_JWT_SECRET)");
        }
        if (DEV_INTERNAL_TOKEN.equals(environment.getProperty("foodx.internal.token", DEV_INTERNAL_TOKEN))) {
            insecure.add("foodx.internal.token (đặt qua FOODX_INTERNAL_TOKEN)");
        }
        if (insecure.isEmpty()) {
            return;
        }

        String detail = "Đang dùng giá trị bí mật mặc định của môi trường dev: " + String.join(", ", insecure);
        if (environment.matchesProfiles("prod")) {
            throw new IllegalStateException(detail
                    + ". Không được chạy profile 'prod' với bí mật mặc định — hãy đặt biến môi trường tương ứng.");
        }
        log.warn("{}. Chỉ chấp nhận được ở môi trường dev.", detail);
    }
}
