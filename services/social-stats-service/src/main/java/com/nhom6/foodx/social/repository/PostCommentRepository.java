package com.nhom6.foodx.social.repository;

import com.nhom6.foodx.social.entity.PostComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostCommentRepository extends JpaRepository<PostComment, Long> {

    List<PostComment> findByPost_IdOrderByCreatedAtAsc(Long postId);

    long countByPost_Id(Long postId);

    void deleteByPost_Id(Long postId);
}