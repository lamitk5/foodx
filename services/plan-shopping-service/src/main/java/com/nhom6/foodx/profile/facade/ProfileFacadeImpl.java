package com.nhom6.foodx.profile.facade;

import com.nhom6.foodx.profile.entity.UserProfile;
import com.nhom6.foodx.profile.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Triển khai ProfileFacade.
 */
@Service
@RequiredArgsConstructor
public class ProfileFacadeImpl implements ProfileFacade {

    private static final int DEFAULT_KCAL = 2000;

    private final UserProfileRepository userProfileRepository;

    @Override
    @Transactional(readOnly = true)
    public Integer getDailyKcalGoal(Long userId) {
        if (userId == null) {
            return DEFAULT_KCAL;
        }
        return profile(userId)
                .map(this::computeDailyKcal)
                .filter(kcal -> kcal > 0)
                .orElse(DEFAULT_KCAL);
    }

    @Override
    @Transactional(readOnly = true)
    public String getDiet(Long userId) {
        return profile(userId)
                .map(UserProfile::getDiet)
                .filter(diet -> diet != null && !diet.isBlank())
                .orElse("");
    }

    @Override
    @Transactional(readOnly = true)
    public String getAllergies(Long userId) {
        return profile(userId)
                .map(UserProfile::getAllergies)
                .filter(s -> s != null && !s.isBlank())
                .orElse("");
    }

    @Override
    @Transactional(readOnly = true)
    public String getDislikes(Long userId) {
        return profile(userId)
                .map(UserProfile::getDislikes)
                .filter(s -> s != null && !s.isBlank())
                .orElse("");
    }

    private Optional<UserProfile> profile(Long userId) {
        return userProfileRepository.findByUser_Id(userId);
    }

    /** Mifflin-St Jeor: BMR = 10*W + 6.25*H - 5*Age + (nam +5 / nữ -161), nhân hệ số vận động. */
    private Integer computeDailyKcal(UserProfile p) {
        double weight = p.getWeight() == null ? 60.0 : p.getWeight();
        double height = p.getHeight() == null ? 165.0 : p.getHeight();
        int age = p.getAge() == null ? 25 : p.getAge();
        double activity = p.getActivity() == null ? 1.2 : p.getActivity();

        double bmr = 10.0 * weight + 6.25 * height - 5.0 * age;
        bmr += ("female".equalsIgnoreCase(p.getGender())) ? -161.0 : 5.0;
        return (int) Math.round(bmr * activity);
    }
}
