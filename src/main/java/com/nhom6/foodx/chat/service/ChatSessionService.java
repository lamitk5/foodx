package com.nhom6.foodx.chat.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nhom6.foodx.ai.dto.ChatRequest;
import com.nhom6.foodx.ai.dto.ChatResponse;
import com.nhom6.foodx.ai.service.ChatService;
import com.nhom6.foodx.auth.entity.User;
import com.nhom6.foodx.chat.dto.MessageResponse;
import com.nhom6.foodx.chat.dto.SendMessageRequest;
import com.nhom6.foodx.chat.dto.SessionCreateRequest;
import com.nhom6.foodx.chat.dto.SessionDetailResponse;
import com.nhom6.foodx.chat.dto.SessionResponse;
import com.nhom6.foodx.chat.entity.ChatMessage;
import com.nhom6.foodx.chat.entity.ChatSession;
import com.nhom6.foodx.chat.repository.ChatMessageRepository;
import com.nhom6.foodx.chat.repository.ChatSessionRepository;
import com.nhom6.foodx.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

/**
 * Lịch sử trò chuyện AI theo tài khoản: phiên chat + tin nhắn.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ChatSessionService {

    private final ChatSessionRepository sessionRepository;
    private final ChatMessageRepository messageRepository;
    private final ChatService chatService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional(readOnly = true)
    public List<SessionResponse> list(User user) {
        return sessionRepository.findByUser_IdOrderByUpdatedAtDesc(user.getId())
                .stream()
                .map(this::toSessionResponse)
                .toList();
    }

    @Transactional
    public SessionResponse create(User user, SessionCreateRequest request) {
        ChatSession session = ChatSession.builder()
                .user(user)
                .title(request != null && request.title() != null && !request.title().isBlank()
                        ? request.title().trim()
                        : "Cuộc trò chuyện mới")
                .mode(request != null && request.mode() != null ? request.mode() : "chat")
                .build();
        return toSessionResponse(sessionRepository.save(session));
    }

    @Transactional(readOnly = true)
    public SessionDetailResponse get(User user, Long id) {
        ChatSession session = findSession(user, id);
        List<MessageResponse> messages = messageRepository.findBySession_IdOrderByCreatedAtAsc(id)
                .stream()
                .map(this::toMessageResponse)
                .toList();
        return new SessionDetailResponse(toSessionResponse(session), messages);
    }

    @Transactional
    public SessionResponse rename(User user, Long id, String title) {
        if (title == null || title.isBlank()) {
            throw new BusinessException(400, "Tiêu đề không được để trống");
        }
        ChatSession session = findSession(user, id);
        session.setTitle(title.trim());
        return toSessionResponse(sessionRepository.save(session));
    }

    @Transactional
    public void delete(User user, Long id) {
        ChatSession session = findSession(user, id);
        messageRepository.deleteBySession_Id(id);
        sessionRepository.delete(session);
    }

    /** Gọi AI, lưu câu hỏi + câu trả lời vào phiên, tự đặt tiêu đề từ tin nhắn đầu tiên. */
    @Transactional
    public ChatResponse send(User user, Long id, SendMessageRequest request) {
        if (request.message() == null || request.message().isBlank()) {
            throw new BusinessException(400, "Nội dung câu hỏi không được để trống");
        }
        ChatSession session = findSession(user, id);
        String mode = request.mode() == null ? "chat" : request.mode();

        ChatResponse ai = chatService.chat(ChatRequest.builder()
                .message(request.message().trim())
                .mode(mode)
                .availableIngredients(request.availableIngredients())
                .build());

        messageRepository.save(ChatMessage.builder()
                .session(session)
                .role("user")
                .content(request.message().trim())
                .build());

        String stepsJson = null;
        if (ai.getSteps() != null && !ai.getSteps().isEmpty()) {
            try {
                stepsJson = objectMapper.writeValueAsString(ai.getSteps());
            } catch (Exception e) {
                log.warn("Không thể serialize steps thành JSON: {}", e.getMessage());
                stepsJson = String.join("\n", ai.getSteps());
            }
        }

        messageRepository.save(ChatMessage.builder()
                .session(session)
                .role("assistant")
                .content(ai.getReply() == null ? "" : ai.getReply())
                .steps(stepsJson)
                .build());

        // Tự đặt tiêu đề từ câu hỏi đầu tiên
        if ("Cuộc trò chuyện mới".equals(session.getTitle())) {
            String msg = request.message().trim();
            session.setTitle(msg.length() > 40 ? msg.substring(0, 40) + "…" : msg);
        }
        session.setMode(mode);
        sessionRepository.save(session);

        return ai;
    }

    private ChatSession findSession(User user, Long id) {
        return sessionRepository.findByIdAndUser_Id(id, user.getId())
                .orElseThrow(() -> new BusinessException(404, "Không tìm thấy phiên trò chuyện"));
    }

    private SessionResponse toSessionResponse(ChatSession s) {
        return new SessionResponse(s.getId(), s.getTitle(), s.getMode(), s.getCreatedAt(), s.getUpdatedAt());
    }

    private MessageResponse toMessageResponse(ChatMessage m) {
        List<String> steps = null;
        if (m.getSteps() != null && !m.getSteps().isBlank()) {
            try {
                steps = objectMapper.readValue(m.getSteps(), new TypeReference<List<String>>() {});
            } catch (Exception e) {
                steps = Arrays.stream(m.getSteps().split("\n"))
                        .map(String::trim)
                        .filter(s -> !s.isBlank())
                        .toList();
            }
        }
        return new MessageResponse(m.getId(), m.getRole(), m.getContent(), steps, m.getCreatedAt());
    }
}