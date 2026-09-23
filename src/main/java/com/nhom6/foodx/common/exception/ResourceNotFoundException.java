package com.nhom6.foodx.common.exception;

/**
 * Ngoại lệ dùng khi tài nguyên không tìm thấy (404).
 */
public class ResourceNotFoundException extends BusinessException {

    public ResourceNotFoundException(String message) {
        super(404, message);
    }
}
