package com.nhom6.foodx.social.repository;

import com.nhom6.foodx.social.entity.PostComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PostCommentRepository extends JpaRepository<PostComment, Long> {

    List<PostComment> findByPost_IdOrderByCreatedAtAsc(Long postId);

    long countByPost_Id(Long postId);

    void deleteByPost_Id(Long postId);

    /**
     * Xoá bình luận nằm trên các bài viết do một người dùng làm tác giả.
     * Dùng cho {@code DELETE /internal/users/{userId}/data} — phải chạy trước khi xoá bài viết.
     *
     * @return số dòng đã xoá
     */
    @Modifying
    @Query("delete from PostComment c where c.post.id in "
            + "(select p.id from RecipePost p where p.authorId = :authorId)")
    int deleteByPostAuthorId(@Param("authorId") Long authorId);

    /**
     * Xoá bình luận do chính một người dùng viết (trên bài của mình hoặc của người khác).
     * Dùng cho {@code DELETE /internal/users/{userId}/data}.
     *
     * @return số dòng đã xoá
     */
    @Modifying
    @Query("delete from PostComment c where c.userId = :userId")
    int deleteByUserId(@Param("userId") Long userId);
}