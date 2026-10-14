package com.nhom6.foodx.chat.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nhom6.foodx.ai.dto.ChatRequest;
import com.nhom6.foodx.ai.dto.ChatResponse;
import com.nhom6.foodx.ai.dto.ChatTurn;
import com.nhom6.foodx.ai.service.AiContextService;
import com.nhom6.foodx.ai.service.ChatService;
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

import java.util.ArrayList;
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
    private final AiContextService aiContextService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional(readOnly = true)
    public List<SessionResponse> list(Long userId) {
        return sessionRepository.findByUserIdOrderByUpdatedAtDesc(userId)
                .stream()
                .map(this::toSessionResponse)
                .toList();
    }

    @Transactional
    public SessionResponse create(Long userId, SessionCreateRequest request) {
        ChatSession session = ChatSession.builder()
                .userId(userId)
                .title(request != null && request.title() != null && !request.title().isBlank()
                        ? request.title().trim()
                        : "Cuộc trò chuyện mới")
                .mode(request != null && request.mode() != null ? request.mode() : "chat")
                .build();
        return toSessionResponse(sessionRepository.save(session));
    }

    @Transactional(readOnly = true)
    public SessionDetailResponse get(Long userId, Long id) {
        ChatSession session = findSession(userId, id);
        List<MessageResponse> messages = messageRepository.findBySession_IdOrderByCreatedAtAsc(id)
                .stream()
                .map(this::toMessageResponse)
                .toList();
        return new SessionDetailResponse(toSessionResponse(session), messages);
    }

    @Transactional
    public SessionResponse rename(Long userId, Long id, String title) {
        if (title == null || title.isBlank()) {
            throw new BusinessException(400, "Tiêu đề không được để trống");
        }
        ChatSession session = findSession(userId, id);
        session.setTitle(title.trim());
        return toSessionResponse(sessionRepository.save(session));
    }

    @Transactional
    public void delete(Long userId, Long id) {
        ChatSession session = findSession(userId, id);
        messageRepository.deleteBySession_Id(id);
        sessionRepository.delete(session);
    }

    /**
     * Gọi AI, lưu câu hỏi + câu trả lời vào phiên, tự đặt tiêu đề từ tin nhắn đầu tiên.
     * KHÔNG mở transaction quanh lời gọi LLM — giữ connection DB suốt 10–30s
     * sẽ làm cạn Hikari pool khi có vài user chat đồng thời.
     */
    public ChatResponse send(Long userId, Long id, SendMessageRequest request) {
        if (request.message() == null || request.message().isBlank()) {
            throw new BusinessException(400, "Nội dung câu hỏi không được để trống");
        }
        if (request.message().length() > 2000) {
            throw new BusinessException(400, "Câu hỏi tối đa 2000 ký tự");
        }
        ChatSession session = findSession(userId, id);
        String mode = request.mode() == null ? "chat" : request.mode();
        String message = request.message().trim();

        // Hồ sơ + tủ lạnh. Mode chat gửi 12 tin gần nhất thành message riêng (mỗi tin tối đa 600 ký tự).
        List<ChatMessage> recent = messageRepository.findTop12BySession_IdOrderByCreatedAtDesc(id);
        String profileContext = aiContextService.buildContext(userId);
        boolean chatMode = "chat".equalsIgnoreCase(mode);
        List<ChatTurn> history = chatMode ? toTurns(recent) : List.of();
        String context = chatMode ? profileContext : profileContext + flattenHistory(recent);

        ChatResponse ai = chatService.chat(ChatRequest.builder()
                .message(message)
                .mode(mode)
                .availableIngredients(request.availableIngredients())
                .build(), context, history);

        messageRepository.save(ChatMessage.builder()
                .session(session)
                .role("user")
                .content(message)
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

    /**
     * Dọn toàn bộ dữ liệu trò chuyện của một người dùng (phục vụ xoá tài khoản).
     *
     * <p>Thứ tự bắt buộc: xoá {@code chat_messages} trước rồi mới xoá {@code chat_sessions},
     * vì tin nhắn tham chiếu phiên qua khoá ngoại {@code session_id}.</p>
     *
     * @return tổng số dòng đã xoá (tin nhắn + phiên)
     */
    @Transactional
    public int purgeUserData(Long userId) {
        if (userId == null) {
            return 0;
        }
        int messages = messageRepository.deleteByUserId(userId);
        int sessions = sessionRepository.deleteByUserId(userId);
        log.info("Đã dọn dữ liệu chat của người dùng {}: {} tin nhắn, {} phiên", userId, messages, sessions);
        return messages + sessions;
    }

    private List<ChatTurn> toTurns(List<ChatMessage> newestFirst) {
        List<ChatTurn> turns = new ArrayList<>();
        if (newestFirst == null || newestFirst.isEmpty()) {
            return turns;
        }
        for (int i = newestFirst.size() - 1; i >= 0; i--) {
            ChatMessage message = newestFirst.get(i);
            String content = clip(message.getContent(), 600);
            if (content.isBlank()) {
                continue;
            }
            String role = "assistant".equals(message.getRole()) ? "assistant" : "user";
            turns.add(new ChatTurn(role, content));
        }
        return turns;
    }

    private String flattenHistory(List<ChatMessage> newestFirst) {
        if (newestFirst == null || newestFirst.isEmpty()) {
            return "";
        }
        StringBuilder context = new StringBuilder("\nLịch sử hội thoại gần đây trong phiên này:\n");
        for (int i = newestFirst.size() - 1; i >= 0; i--) {
            ChatMessage message = newestFirst.get(i);
            String content = clip(message.getContent(), 600);
            if (content.isBlank()) {
                continue;
            }
            context.append("user".equals(message.getRole()) ? "Người dùng: " : "Trợ lý FoodX: ")
                    .append(content)
                    .append("\n");
        }
        return context.toString();
    }

    private static String clip(String content, int max) {
        String text = content == null ? "" : content.replace("\n", " ").trim();
        if (text.length() <= max) {
            return text;
        }
        return text.substring(0, max) + "…";
    }

    private ChatSession findSession(Long userId, Long id) {
        return sessionRepository.findByIdAndUserId(id, userId)
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