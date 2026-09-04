package com.nhom6.foodx.common.utils;

/**
 * Tiện ích xử lý chuỗi.
 */
public final class StringUtils {

    private StringUtils() {
    }

    public static boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    public static boolean isNotBlank(String value) {
        return !isBlank(value);
    }

    /** Chuẩn hoá chuỗi: trim và bỏ khoảng trắng thừa, null -> "". */
    public static String normalize(String value) {
        if (value == null) {
            return "";
        }
        return value.trim().replaceAll("\\s+", " ");
    }

    public static String toLowerCase(String value) {
        return value == null ? null : value.toLowerCase();
    }

    /** Rút gọn chuỗi về tối đa maxLen ký tự. */
    public static String truncate(String value, int maxLen) {
        if (value == null || value.length() <= maxLen) {
            return value;
        }
        return value.substring(0, maxLen) + "...";
    }

    /**
     * Chuẩn hoá chuỗi để so khớp không nhạy dấu tiếng Việt:
     * trim, lowercase, bỏ dấu (đ -> d). Dùng cho tìm kiếm & khớp nguyên liệu.
     */
    public static String searchable(String value) {
        if (value == null) {
            return "";
        }
        String normalized = normalize(value).toLowerCase();
        String nfd = java.text.Normalizer.normalize(normalized, java.text.Normalizer.Form.NFD);
        return nfd.replaceAll("\\p{InCombiningDiacriticalMarks}+", "").replace("đ", "d");
    }
}
