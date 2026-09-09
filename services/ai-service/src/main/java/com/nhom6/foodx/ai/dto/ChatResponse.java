package com.nhom6.foodx.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Phản hồi của Trợ lý AI nấu ăn.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponse {

    /** Câu trả lời từ AI. */
    private String reply;

    /** Các bước nấu (nếu chế độ 'step'). */
    private List<String> steps;

    private LocalDateTime timestamp;
}
