package com.nhom6.foodx.chat.repository;

import com.nhom6.foodx.chat.entity.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChatSessionRepository extends JpaRepository<ChatSession, Long> {

    List<ChatSession> findByUser_IdOrderByUpdatedAtDesc(Long userId);

    Optional<ChatSession> findByIdAndUser_Id(Long id, Long userId);
}