package com.nhom6.foodx.ai.service;

import com.nhom6.foodx.auth.entity.User;
import com.nhom6.foodx.fridge.repository.FridgeItemRepository;
import com.nhom6.foodx.profile.entity.UserProfile;
import com.nhom6.foodx.profile.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Dựng "bối cảnh người dùng" (hồ sơ dinh dưỡng + tủ lạnh) để nhồi vào prompt AI.
 * Giúp Trợ lý không còn mù thông tin: biết user đang ăn kiêng gì, dị ứng gì,
 * và đang có những nguyên liệu nào trong tủ.
 */
@Service
@RequiredArgsConstructor
public class AiContextService {

    private final UserProfileRepository userProfileRepository;
    private final FridgeItemRepository fridgeItemRepository;

    /**
     * @return chuỗi bối cảnh tiếng Việt (hoặc chuỗi rỗng nếu user chưa có dữ liệu gì đáng kể)
     */
    public String buildContext(User user) {
        if (user == null) {
            return "";
        }
        StringBuilder sb = new StringBuilder();

        userProfileRepository.findByUser_Id(user.getId()).ifPresent(profile -> {
            List<String> parts = new java.util.ArrayList<>();
            if (profile.getGender() != null) {
                parts.add("giới tính " + ("female".equalsIgnoreCase(profile.getGender()) ? "nữ" : "nam"));
            }
            if (profile.getAge() != null) {
                parts.add(profile.getAge() + " tuổi");
            }
            if (profile.getWeight() != null) {
                parts.add("nặng " + trimNumber(profile.getWeight()) + " kg");
            }
            if (profile.getHeight() != null) {
                parts.add("cao " + trimNumber(profile.getHeight()) + " cm");
            }
            if (profile.getDiet() != null && !profile.getDiet().isBlank()
                    && !"Ăn linh tinh".equals(profile.getDiet())) {
                parts.add("chế độ ăn: " + profile.getDiet());
            }
            if (parts.isEmpty()) {
                return;
            }
            sb.append("Hồ sơ người dùng: ").append(String.join(", ", parts)).append(".\n");
            if (profile.getAllergies() != null && !profile.getAllergies().isBlank()) {
                sb.append("Dị ứng cần tránh tuyệt đối: ").append(profile.getAllergies().trim()).append(".\n");
            }
            if (profile.getDislikes() != null && !profile.getDislikes().isBlank()) {
                sb.append("Món người dùng không thích: ").append(profile.getDislikes().trim()).append(".\n");
            }
        });

        List<String> fridgeNames = fridgeItemRepository.findByUser_IdOrderByIdAsc(user.getId()).stream()
                .map(item -> item.getFood() != null ? item.getFood().getName() : null)
                .filter(name -> name != null && !name.isBlank())
                .distinct()
                .collect(Collectors.toList());
        if (!fridgeNames.isEmpty()) {
            sb.append("Tủ lạnh của người dùng hiện có: ")
                    .append(String.join(", ", fridgeNames))
                    .append(". Hãy ưu tiên gợi ý món dùng được các nguyên liệu này.\n");
        }
        return sb.toString();
    }

    private String trimNumber(Double value) {
        if (value == null) {
            return "?";
        }
        long rounded = Math.round(value);
        return value == rounded ? String.valueOf(rounded) : String.valueOf(value);
    }
}
