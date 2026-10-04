package com.nhom6.foodx.common.client;

import com.nhom6.foodx.common.dto.UserProfileDto;
import com.nhom6.foodx.common.dto.UserSummaryDto;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.web.client.RestClient;

import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Client gọi user-service — service duy nhất sở hữu bảng {@code users} và {@code profiles}.
 */
public class UserServiceClient extends AbstractFoodxClient {

    public UserServiceClient(RestClient.Builder builder, String baseUrl, String internalToken) {
        super(builder, baseUrl, internalToken);
    }

    public Optional<UserSummaryDto> getUser(Long userId) {
        if (userId == null) {
            return Optional.empty();
        }
        return getOptional(InternalApi.USER_BY_ID, UserSummaryDto.class, userId);
    }

    /** Lấy nhiều người dùng trong một lời gọi (tránh N+1 khi render danh sách bài viết). */
    public Map<Long, UserSummaryDto> getUsers(Collection<Long> userIds) {
        Map<Long, UserSummaryDto> result = new LinkedHashMap<>();
        if (userIds == null || userIds.isEmpty()) {
            return result;
        }
        String ids = userIds.stream()
                .filter(java.util.Objects::nonNull)
                .distinct()
                .map(String::valueOf)
                .collect(Collectors.joining(","));
        if (ids.isEmpty()) {
            return result;
        }
        List<UserSummaryDto> users = getList(InternalApi.USERS + "?ids={ids}",
                new ParameterizedTypeReference<>() {
                }, ids);
        for (UserSummaryDto user : users) {
            result.put(user.id(), user);
        }
        return result;
    }

    public Optional<UserProfileDto> getProfile(Long userId) {
        if (userId == null) {
            return Optional.empty();
        }
        return getOptional(InternalApi.PROFILE_BY_USER_ID, UserProfileDto.class, userId);
    }

    public Map<Long, UserProfileDto> getProfiles(Collection<Long> userIds) {
        Map<Long, UserProfileDto> result = new LinkedHashMap<>();
        if (userIds == null || userIds.isEmpty()) {
            return result;
        }
        String ids = userIds.stream()
                .filter(java.util.Objects::nonNull)
                .distinct()
                .map(String::valueOf)
                .collect(Collectors.joining(","));
        if (ids.isEmpty()) {
            return result;
        }
        List<UserProfileDto> profiles = getList(InternalApi.PROFILES + "?userIds={ids}",
                new ParameterizedTypeReference<>() {
                }, ids);
        for (UserProfileDto profile : profiles) {
            result.put(profile.userId(), profile);
        }
        return result;
    }
}
