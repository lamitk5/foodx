package com.nhom6.foodx.plan.service;

import com.nhom6.foodx.common.client.UserServiceClient;
import com.nhom6.foodx.common.dto.UserProfileDto;
import com.nhom6.foodx.common.food.DailyCalorieGoal;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.function.Function;

/**
 * Lớp mỏng bọc {@link UserServiceClient} cho nhu cầu hồ sơ dinh dưỡng của module kế hoạch.
 *
 * <p>Trước đây là {@code ProfileFacadeImpl} đọc thẳng bảng {@code profiles} bằng JPA.
 * Nay bảng đó thuộc user-service, service này chỉ được hỏi qua HTTP nội bộ.</p>
 *
 * <p>Mục tiêu kcal lấy từ số người dùng đã lưu; chưa có thì tính giống màn hồ sơ.
 * Khi user-service không trả về hồ sơ thì dùng 2000 kcal.</p>
 */
@Service
@RequiredArgsConstructor
public class ProfileLookupService {

    private final UserServiceClient userServiceClient;

    /**
     * Mục tiêu calo mỗi ngày. Ưu tiên số người dùng lưu trong cá nhân hóa,
     * không có thì tính Mifflin-St Jeor giống màn hồ sơ.
     */
    public Integer getDailyKcalGoal(Long userId) {
        if (userId == null) {
            return DailyCalorieGoal.DEFAULT_KCAL;
        }
        return userServiceClient.getProfile(userId)
                .map(DailyCalorieGoal::resolve)
                .orElse(DailyCalorieGoal.DEFAULT_KCAL);
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
}
