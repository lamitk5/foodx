package com.nhom6.foodx.social.repository;

import com.nhom6.foodx.social.entity.PostLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PostLikeRepository extends JpaRepository<PostLike, Long> {

    boolean existsByPost_IdAndUserId(Long postId, Long userId);

    Optional<PostLike> findByPost_IdAndUserId(Long postId, Long userId);

    long countByPost_Id(Long postId);

    void deleteByPost_Id(Long postId);

    /**
     * Xoá lượt thích nằm trên các bài viết do một người dùng làm tác giả.
     * Dùng cho {@code DELETE /internal/users/{userId}/data} — phải chạy trước khi xoá bài viết.
     *
     * @return số dòng đã xoá
     */
    @Modifying
    @Query("delete from PostLike l where l.post.id in "
            + "(select p.id from RecipePost p where p.authorId = :authorId)")
    int deleteByPostAuthorId(@Param("authorId") Long authorId);

    /**
     * Xoá lượt thích do chính một người dùng tạo (trên bài của mình hoặc của người khác).
     * Dùng cho {@code DELETE /internal/users/{userId}/data}.
     *
     * @return số dòng đã xoá
     */
    @Modifying
    @Query("delete from PostLike l where l.userId = :userId")
    int deleteByUserId(@Param("userId") Long userId);
}