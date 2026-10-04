package com.nhom6.foodx.plan.service;

import com.nhom6.foodx.common.client.UserServiceClient;
import com.nhom6.foodx.common.dto.UserProfileDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.function.Function;

/**
 * Lớp mỏng bọc {@link UserServiceClient} cho nhu cầu hồ sơ dinh dưỡng của module kế hoạch.
 *
 * <p>Trước đây là {@code ProfileFacadeImpl} đọc thẳng bảng {@code profiles} bằng JPA.
 * Nay bảng đó thuộc user-service, service này chỉ được hỏi qua HTTP nội bộ.</p>
 *
 * <p>Công thức Mifflin-St Jeor và mặc định 2000 kcal được giữ <b>nguyên</b> như bản cũ;
 * khi user-service không trả về hồ sơ (chưa tạo hoặc service chết) thì dùng mặc định.</p>
 */
@Service
@RequiredArgsConstructor
public class ProfileLookupService {

    private static final int DEFAULT_KCAL = 2000;

    private final UserServiceClient userServiceClient;

    /** Mục tiêu calo mỗi ngày (tính theo Mifflin-St Jeor từ hồ sơ). Mặc định 2000 nếu chưa có hồ sơ. */
    public Integer getDailyKcalGoal(Long userId) {
        if (userId == null) {
            return DEFAULT_KCAL;
        }
        return userServiceClient.getProfile(userId)
                .map(this::computeDailyKcal)
                .filter(kcal -> kcal > 0)
                .orElse(DEFAULT_KCAL);
    }

    public String getDiet(Long userId) {
        return text(userId, UserProfileDto::diet);
    }

    public String getAllergies(Long userId) {
        return text(userId, UserProfileDto::allergies);
    }

    public String getDislikes(Long userId) {
        return text(userId, UserProfileDto::dislikes);
    }

    /** Trả "" nếu profile rỗng hoặc field rỗng — đúng như hành vi của ProfileFacadeImpl cũ. */
    private String text(Long userId, Function<UserProfileDto, String> getter) {
        if (userId == null) {
            return "";
        }
        return userServiceClient.getProfile(userId)
                .map(getter)
                .filter(value -> value != null && !value.isBlank())
                .orElse("");
    }

    /** Mifflin-St Jeor: BMR = 10*W + 6.25*H - 5*Age + (nam +5 / nữ -161), nhân hệ số vận động. */
    private Integer computeDailyKcal(UserProfileDto p) {
        double weight = p.weight() == null ? 60.0 : p.weight();
        double height = p.height() == null ? 165.0 : p.height();
        int age = p.age() == null ? 25 : p.age();
        double activity = p.activity() == null ? 1.2 : p.activity();

        double bmr = 10.0 * weight + 6.25 * height - 5.0 * age;
        bmr += ("female".equalsIgnoreCase(p.gender())) ? -161.0 : 5.0;
        return (int) Math.round(bmr * activity);
    }
}
