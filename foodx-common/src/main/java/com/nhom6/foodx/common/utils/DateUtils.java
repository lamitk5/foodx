package com.nhom6.foodx.common.utils;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

/**
 * Tiện ích xử lý ngày giờ.
 */
public final class DateUtils {

    public static final DateTimeFormatter ISO_DATE = DateTimeFormatter.ISO_LOCAL_DATE;
    public static final DateTimeFormatter DEFAULT_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private DateUtils() {
    }

    public static LocalDate nowDate() {
        return LocalDate.now();
    }

    public static LocalDateTime nowDateTime() {
        return LocalDateTime.now();
    }

    /** Lấy timestamp hiện tại (epoch millis). */
    public static long nowEpochMillis() {
        return Instant.now().toEpochMilli();
    }

    public static LocalDateTime fromEpochMillis(long epochMillis) {
        return LocalDateTime.ofInstant(Instant.ofEpochMilli(epochMillis), ZoneId.systemDefault());
    }

    public static String format(LocalDateTime dateTime) {
        return dateTime == null ? null : dateTime.format(DEFAULT_FORMAT);
    }

    public static String formatDate(LocalDate date) {
        return date == null ? null : date.format(ISO_DATE);
    }
}
