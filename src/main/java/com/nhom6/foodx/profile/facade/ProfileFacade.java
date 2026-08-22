package com.nhom6.foodx.profile.facade;

/**
 * Public Service Interface của module hồ sơ dinh dưỡng.
 */
public interface ProfileFacade {

    /** Mục tiêu calo mỗi ngày (tính theo Mifflin-St Jeor từ hồ sơ). Mặc định 2000 nếu chưa có hồ sơ. */
    Integer getDailyKcalGoal(Long userId);

    String getDiet(Long userId);

    String getAllergies(Long userId);

    String getDislikes(Long userId);
}
