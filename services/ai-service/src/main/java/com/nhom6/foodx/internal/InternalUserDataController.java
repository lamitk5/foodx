package com.nhom6.foodx.internal;

import com.nhom6.foodx.chat.service.ChatSessionService;
import com.nhom6.foodx.common.client.InternalApi;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * API nội bộ để dọn dữ liệu của một người dùng khi họ yêu cầu xoá tài khoản.
 *
 * <p>Trước đây user-service tự chạy {@code DELETE FROM chat_messages / chat_sessions}
 * bằng JdbcTemplate xuyên qua service khác. Nay ai-service tự dọn hai bảng nó sở hữu,
 * theo đúng thứ tự phụ thuộc: tin nhắn trước, phiên sau.</p>
 *
 * <p>Trả về <b>JSON thô</b> (số dòng đã xoá), không bọc {@code ApiResponse}.</p>
 */
@RestController
@RequestMapping(InternalApi.PREFIX + "/users")
@RequiredArgsConstructor
public class InternalUserDataController {

    private final ChatSessionService chatSessionService;

    /**
     * {@code DELETE /internal/users/{userId}/data} — xoá toàn bộ phiên trò chuyện và tin nhắn
     * của người dùng.
     *
     * @return tổng số dòng {@code chat_messages} + {@code chat_sessions} đã xoá
     */
    @DeleteMapping("/{userId}/data")
    public Integer purgeUserData(@PathVariable Long userId) {
        return chatSessionService.purgeUserData(userId);
    }
}
