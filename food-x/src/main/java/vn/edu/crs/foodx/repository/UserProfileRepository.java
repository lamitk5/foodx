package vn.edu.crs.foodx.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.edu.crs.foodx.entity.UserProfile;

import java.util.Optional;

public interface UserProfileRepository
        extends JpaRepository<UserProfile, Long> {

    Optional<UserProfile> findByUser_Id(Long userId);
}