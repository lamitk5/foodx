package com.nhom6.foodx.social.repository;

import com.nhom6.foodx.social.entity.RecipePost;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RecipePostRepository extends JpaRepository<RecipePost, Long> {

    List<RecipePost> findAllByOrderByCreatedAtDesc();
}