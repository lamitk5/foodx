package com.nhom6.foodx.ai.dto;

/**
 * Một lượt trong lịch sử chat, gửi riêng cho model thay vì nhét vào một chuỗi.
 */
public record ChatTurn(String role, String content) {
}
