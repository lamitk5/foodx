package com.nhom6.foodx.favorite.repository;

import com.nhom6.foodx.favorite.entity.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    List<Favorite> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<Favorite> findByUserIdAndTargetIdAndTargetType(Long userId, Long targetId, String targetType);

    boolean existsByUserIdAndTargetIdAndTargetType(Long userId, Long targetId, String targetType);

    Optional<Favorite> findByIdAndUserId(Long id, Long userId);
}
