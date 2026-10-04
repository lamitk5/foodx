package com.nhom6.foodx.social.repository;

import com.nhom6.foodx.social.entity.RecipePost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RecipePostRepository extends JpaRepository<RecipePost, Long> {

    List<RecipePost> findAllByOrderByCreatedAtDesc();

    List<RecipePost> findByStatusOrderByCreatedAtDesc(String status);

    List<RecipePost> findByAuthorIdOrderByCreatedAtDesc(Long authorId);

    /**
     * Xoá mọi bài chia sẻ của một tác giả. Dùng cho
     * {@code DELETE /internal/users/{userId}/data} — phải xoá bình luận/lượt thích
     * trên các bài này trước.
     *
     * @return số dòng đã xoá
     */
    @Modifying
    @Query("delete from RecipePost p where p.authorId = :authorId")
    int deleteByAuthorId(@Param("authorId") Long authorId);
}