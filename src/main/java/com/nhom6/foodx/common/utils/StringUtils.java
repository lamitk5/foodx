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
}
