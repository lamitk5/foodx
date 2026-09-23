package com.nhom6.foodx.chat.dto;

import java.util.List;

public record SessionDetailResponse(
        SessionResponse session,
        List<MessageResponse> messages
) {
}