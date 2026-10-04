package com.nhom6.foodx.chat.repository;

import com.nhom6.foodx.chat.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findBySession_IdOrderByCreatedAtAsc(Long sessionId);

    /** 8 tin nhắn mới nhất (mới trước) — dùng để dựng context AI. */
    List<ChatMessage> findTop8BySession_IdOrderByCreatedAtDesc(Long sessionId);

    void deleteBySession_Id(Long sessionId);

    /**
     * Xoá mọi tin nhắn thuộc các phiên trò chuyện của một người dùng.
     *
     * <p>Phải chạy <b>trước</b> khi xoá {@code chat_sessions} vì {@code chat_messages.session_id}
     * tham chiếu tới phiên. Dùng cho yêu cầu xoá dữ liệu người dùng
     * ({@code DELETE /internal/users/{userId}/data}).</p>
     *
     * @return số dòng đã xoá
     */
    @Modifying
    @Query("delete from ChatMessage m where m.session.id in "
            + "(select s.id from ChatSession s where s.userId = :userId)")
    int deleteByUserId(@Param("userId") Long userId);
}
