package com.nhom6.foodx.ai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Request gửi câu hỏi cho Trợ lý AI nấu ăn.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatRequest {

    /** Câu hỏi / lời nhắn của người dùng. */
    @NotBlank(message = "Nội dung câu hỏi không được để trống")
    @Size(max = 2000, message = "Câu hỏi tối đa 2000 ký tự")
    private String message;

    /** Nguyên liệu hiện có (tuỳ chọn) để trợ lý gợi ý phù hợp. */
    private List<String> availableIngredients;

    /** Chế độ nấu ăn: 'chat' (hỏi đáp), 'step' (nấu từng bước). */
    private String mode;
}
