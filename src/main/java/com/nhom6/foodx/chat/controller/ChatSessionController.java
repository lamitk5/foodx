package com.nhom6.foodx.chat.controller;

import com.nhom6.foodx.ai.dto.ChatResponse;
import com.nhom6.foodx.chat.dto.SendMessageRequest;
import com.nhom6.foodx.chat.dto.SessionCreateRequest;
import com.nhom6.foodx.chat.dto.SessionDetailResponse;
import com.nhom6.foodx.chat.dto.SessionResponse;
import com.nhom6.foodx.chat.service.ChatSessionService;
import com.nhom6.foodx.common.response.ApiResponse;
import com.nhom6.foodx.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * API phiên trò chuyện AI theo tài khoản (yêu cầu JWT).
 */
@RestController
@RequestMapping("/api/chat/sessions")
@RequiredArgsConstructor
public class ChatSessionController {

    private final ChatSessionService chatSessionService;
    private final SecurityUtils securityUtils;

    @GetMapping
    public ApiResponse<List<SessionResponse>> list() {
        return ApiResponse.success(chatSessionService.list(securityUtils.getCurrentUser()), "Danh sách phiên trò chuyện");
    }

    @PostMapping
    public ApiResponse<SessionResponse> create(@RequestBody(required = false) SessionCreateRequest request) {
        return ApiResponse.success(chatSessionService.create(securityUtils.getCurrentUser(), request), "Đã tạo phiên trò chuyện");
    }

    @GetMapping("/{id}")
    public ApiResponse<SessionDetailResponse> get(@PathVariable Long id) {
        return ApiResponse.success(chatSessionService.get(securityUtils.getCurrentUser(), id), "Chi tiết phiên trò chuyện");
    }

    @PatchMapping("/{id}")
    public ApiResponse<SessionResponse> rename(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ApiResponse.success(chatSessionService.rename(securityUtils.getCurrentUser(), id, body.get("title")), "Đã đổi tên phiên");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        chatSessionService.delete(securityUtils.getCurrentUser(), id);
        return ApiResponse.success(null, "Đã xóa phiên trò chuyện");
    }

    @PostMapping("/{id}/messages")
    public ApiResponse<ChatResponse> send(@PathVariable Long id, @RequestBody SendMessageRequest request) {
        return ApiResponse.success(chatSessionService.send(securityUtils.getCurrentUser(), id, request), "Trợ lý AI phản hồi");
    }
}