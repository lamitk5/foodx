package com.nhom6.foodx.favorite.repository;

import com.nhom6.foodx.favorite.entity.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    List<Favorite> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<Favorite> findByUserIdAndTargetIdAndTargetType(Long userId, Long targetId, String targetType);

    boolean existsByUserIdAndTargetIdAndTargetType(Long userId, Long targetId, String targetType);

    Optional<Favorite> findByIdAndUserId(Long id, Long userId);

    /** Dọn yêu thích khi người dùng xoá tài khoản; trả về số dòng đã xoá. */
    @Modifying
    @Query("delete from Favorite f where f.userId = :userId")
    int deleteByUserId(@Param("userId") Long userId);
}
