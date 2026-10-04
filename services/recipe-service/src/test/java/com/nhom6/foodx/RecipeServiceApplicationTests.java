package com.nhom6.foodx;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * Kiểm tra Spring context nạp được — bắt các lỗi wiring mà trình biên dịch không thấy:
 * chuỗi filter bảo mật dùng chung, bean client gọi service khác, binding
 * {@code foodx.*} trong properties, và ánh xạ entity/repository.
 *
 * <p>Chạy trên H2 in-memory nên không cần MySQL; mọi lời gọi HTTP sang service khác đều
 * thất bại và được client nuốt lỗi (log warn) — đúng thiết kế chịu lỗi.</p>
 */
@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:foodx_recipe;DB_CLOSE_DELAY=-1;MODE=MySQL",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect"
})
class RecipeServiceApplicationTests {

    @Test
    void contextLoads() {
    }
}
