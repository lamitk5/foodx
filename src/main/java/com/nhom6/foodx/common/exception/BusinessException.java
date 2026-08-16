package com.nhom6.foodx.common.exception;

/**
 * Ngoại lệ nghiệp vụ có mã HTTP đi kèm.
 */
public class BusinessException extends RuntimeException {

    private final int status;

    public BusinessException(String message) {
        this(400, message);
    }

    public BusinessException(int status, String message) {
        super(message);
        this.status = status;
    }

    public int getStatus() {
        return status;
    }
}
