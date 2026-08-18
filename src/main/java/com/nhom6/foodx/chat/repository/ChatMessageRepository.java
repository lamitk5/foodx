package com.nhom6.foodx.chat.repository;

import com.nhom6.foodx.chat.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findBySession_IdOrderByCreatedAtAsc(Long sessionId);

    void deleteBySession_Id(Long sessionId);
}