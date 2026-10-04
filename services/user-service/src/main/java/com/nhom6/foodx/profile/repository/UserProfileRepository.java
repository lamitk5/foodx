package com.nhom6.foodx.profile.repository;

import com.nhom6.foodx.profile.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {

    Optional<UserProfile> findByUser_Id(Long userId);

    List<UserProfile> findByUser_IdIn(Collection<Long> userIds);

    /** Dọn hồ sơ khi admin xoá tài khoản (bảng `profiles` thuộc sở hữu user-service). */
    @Transactional
    long deleteByUser_Id(Long userId);
}