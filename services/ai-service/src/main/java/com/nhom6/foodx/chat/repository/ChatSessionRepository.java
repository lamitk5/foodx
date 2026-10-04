package com.nhom6.foodx.chat.repository;

import com.nhom6.foodx.chat.entity.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChatSessionRepository extends JpaRepository<ChatSession, Long> {

    List<ChatSession> findByUserIdOrderByUpdatedAtDesc(Long userId);

    Optional<ChatSession> findByIdAndUserId(Long id, Long userId);

    /**
     * Xoá mọi phiên trò chuyện của một người dùng — dùng cho yêu cầu xoá dữ liệu người dùng
     * ({@code DELETE /internal/users/{userId}/data}). Nhớ xoá {@code chat_messages} trước.
     *
     * @return số dòng đã xoá
     */
    @Modifying
    @Query("delete from ChatSession s where s.userId = :userId")
    int deleteByUserId(@Param("userId") Long userId);
}
