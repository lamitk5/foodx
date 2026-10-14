package com.nhom6.foodx.common.food;

import com.nhom6.foodx.common.dto.UserProfileDto;

import java.util.Collection;

/**
 * Mục tiêu kcal/ngày dùng chung cho hồ sơ, gợi ý món và kế hoạch bữa ăn.
 *
 * <p>Công thức Mifflin-St Jeor khớp với {@code calculateCalories} trên giao diện:
 * BMR × mức vận động, giảm cân ×0,90, tăng cân ×1,08, kẹp 1200–4000, làm tròn chục.
 * Nếu người dùng đã lưu "Mục tiêu Calo hàng ngày" thì số đó được ưu tiên.</p>
 *
 * <p>Ba bữa chia 26% / 40% / 34% (sáng / trưa / tối) để cộng lại đúng mục tiêu ngày.</p>
 */
public final class DailyCalorieGoal {

    public static final int MIN_KCAL = 1200;
    public static final int MAX_KCAL = 4000;
    public static final int DEFAULT_KCAL = 2000;

    private DailyCalorieGoal() {
    }

    /** Số kcal/ngày mà gợi ý và kế hoạch phải bám theo. */
    public static int resolve(UserProfileDto profile) {
        if (profile == null) {
            return DEFAULT_KCAL;
        }
        Integer explicit = profile.dailyKcal();
        if (explicit != null && explicit >= MIN_KCAL && explicit <= MAX_KCAL) {
            return roundToTen(explicit);
        }
        int computed = compute(profile);
        return computed > 0 ? computed : DEFAULT_KCAL;
    }

    /**
     * Ước tính từ cân nặng, chiều cao, tuổi, giới tính và mục tiêu cân.
     * Trả 0 khi thiếu số đo hoặc dưới 18 tuổi — người gọi dùng {@link #resolve}.
     */
    public static int compute(UserProfileDto profile) {
        if (profile == null || profile.weight() == null || profile.height() == null || profile.age() == null) {
            return 0;
        }
        double weight = profile.weight();
        double height = profile.height();
        int age = profile.age();
        if (age < 18 || weight <= 0 || height <= 0) {
            return 0;
        }
        double activity = profile.activity() == null ? 1.2 : profile.activity();
        double bmr = 10.0 * weight + 6.25 * height - 5.0 * age;
        bmr += female(profile.gender()) ? -161.0 : 5.0;
        double calories = bmr * activity;
        Double target = profile.targetWeight();
        if (target != null && target < weight - 1) {
            calories *= 0.90;
        } else if (target != null && target > weight + 1) {
            calories *= 1.08;
        }
        calories = Math.max(MIN_KCAL, Math.min(MAX_KCAL, calories));
        return roundToTen(calories);
    }

    /** Phần kcal của một bữa trong ngày (sáng 26%, trưa 40%, tối 34%). */
    public static int slotShare(int dailyKcal, String slot) {
        int daily = dailyKcal > 0 ? dailyKcal : DEFAULT_KCAL;
        double ratio = switch (slot == null ? "" : slot) {
            case "morning" -> 0.26;
            case "lunch" -> 0.40;
            case "dinner" -> 0.34;
            default -> 1.0 / 3.0;
        };
        return Math.max(200, roundToTen(daily * ratio));
    }

    /**
     * Mục tiêu của bữa đang xếp. Nếu là bữa trống cuối cùng thì lấy phần còn lại của ngày,
     * nếu không thì giữ đúng phần của bữa và chừa suất cho các bữa chưa xếp.
     */
    public static int targetForSlot(int dailyKcal, String slot, int otherKcal, Collection<String> emptyOtherSlots) {
        int daily = dailyKcal > 0 ? dailyKcal : DEFAULT_KCAL;
        int share = slotShare(daily, slot);
        int reserved = 0;
        if (emptyOtherSlots != null) {
            for (String empty : emptyOtherSlots) {
                reserved += slotShare(daily, empty);
            }
        }
        if (emptyOtherSlots == null || emptyOtherSlots.isEmpty()) {
            int remaining = roundToTen(daily - otherKcal);
            int cap = Math.max(share, roundToTen(daily * 0.55));
            return clamp(remaining, 200, cap);
        }
        int room = roundToTen(daily - otherKcal - reserved);
        if (room < 200) {
            room = 200;
        }
        return Math.min(share, room);
    }

    public static int roundToTen(double value) {
        return (int) (Math.round(value / 10.0) * 10);
    }

    private static int clamp(int value, int min, int max) {
        if (max < min) {
            max = min;
        }
        return Math.max(min, Math.min(max, value));
    }

    private static boolean female(String gender) {
        if (gender == null) {
            return false;
        }
        String value = gender.trim().toLowerCase();
        return value.equals("female") || value.equals("nữ") || value.equals("nu") || value.equals("f");
    }
}
