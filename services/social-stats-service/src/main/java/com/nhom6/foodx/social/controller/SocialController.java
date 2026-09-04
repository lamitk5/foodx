package com.nhom6.foodx.social.controller;

import com.nhom6.foodx.common.response.ApiResponse;
import com.nhom6.foodx.security.SecurityUtils;
import com.nhom6.foodx.social.dto.CommentRequest;
import com.nhom6.foodx.social.dto.CommentResponse;
import com.nhom6.foodx.social.dto.LikeResponse;
import com.nhom6.foodx.social.dto.PostRequest;
import com.nhom6.foodx.social.dto.PostResponse;
import com.nhom6.foodx.social.service.SocialService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * API mạng xã hội chia sẻ công thức (yêu cầu đăng nhập JWT).
 */
@RestController
@RequestMapping("/api/social")
@RequiredArgsConstructor
public class SocialController {

    private final SocialService socialService;
    private final SecurityUtils securityUtils;

    @GetMapping("/posts")
    public ApiResponse<List<PostResponse>> feed() {
        return ApiResponse.success(socialService.feed(securityUtils.getCurrentUser()), "Danh sách bài chia sẻ");
    }

    @GetMapping("/posts/my")
    public ApiResponse<List<PostResponse>> myPosts() {
        return ApiResponse.success(socialService.myPosts(securityUtils.getCurrentUser()), "Lịch sử bài đăng của tôi");
    }

    @GetMapping("/posts/{id}")
    public ApiResponse<PostResponse> getPost(@PathVariable Long id) {
        return ApiResponse.success(socialService.getPost(securityUtils.getCurrentUser(), id), "Chi tiết bài chia sẻ");
    }

    @PostMapping("/posts")
    public ApiResponse<PostResponse> create(@RequestBody PostRequest request) {
        return ApiResponse.success(socialService.create(securityUtils.getCurrentUser(), request), "Đã đăng công thức");
    }

    @DeleteMapping("/posts/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        socialService.delete(securityUtils.getCurrentUser(), id);
        return ApiResponse.success(null, "Đã xóa bài chia sẻ");
    }

    @PostMapping("/posts/{id}/like")
    public ApiResponse<LikeResponse> toggleLike(@PathVariable Long id) {
        return ApiResponse.success(socialService.toggleLike(securityUtils.getCurrentUser(), id), "Đã cập nhật lượt thích");
    }

    @GetMapping("/posts/{id}/comments")
    public ApiResponse<List<CommentResponse>> comments(@PathVariable Long id) {
        return ApiResponse.success(socialService.comments(id), "Danh sách bình luận");
    }

    @PostMapping("/posts/{id}/comments")
    public ApiResponse<CommentResponse> addComment(@PathVariable Long id, @RequestBody CommentRequest request) {
        return ApiResponse.success(socialService.addComment(securityUtils.getCurrentUser(), id, request), "Đã bình luận");
    }

    @DeleteMapping("/comments/{id}")
    public ApiResponse<Void> deleteComment(@PathVariable Long id) {
        socialService.deleteComment(securityUtils.getCurrentUser(), id);
        return ApiResponse.success(null, "Đã xóa bình luận");
    }
}