package com.nhom6.foodx.social.controller;

import com.nhom6.foodx.common.response.ApiResponse;
import com.nhom6.foodx.common.security.SecurityUtils;
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
 * API mạng xã hội chia sẻ công thức.
 *
 * <p>Feed/chi tiết bài/bình luận là công khai (đọc được cả khi ẩn danh), các thao tác
 * còn lại yêu cầu đăng nhập. Danh tính lấy từ JWT qua {@link SecurityUtils} (static).</p>
 */
@RestController
@RequestMapping("/api/social")
@RequiredArgsConstructor
public class SocialController {

    private final SocialService socialService;

    @GetMapping("/posts")
    public ApiResponse<List<PostResponse>> feed() {
        return ApiResponse.success(socialService.feed(SecurityUtils.getCurrentUserIdOrNull()), "Danh sách bài chia sẻ");
    }

    @GetMapping("/posts/my")
    public ApiResponse<List<PostResponse>> myPosts() {
        return ApiResponse.success(socialService.myPosts(SecurityUtils.getCurrentUserId()), "Lịch sử bài đăng của tôi");
    }

    @GetMapping("/posts/{id}")
    public ApiResponse<PostResponse> getPost(@PathVariable Long id) {
        return ApiResponse.success(socialService.getPost(SecurityUtils.getCurrentUserIdOrNull(), id), "Chi tiết bài chia sẻ");
    }

    @PostMapping("/posts")
    public ApiResponse<PostResponse> create(@RequestBody PostRequest request) {
        return ApiResponse.success(socialService.create(SecurityUtils.getCurrentUserId(), request), "Đã lưu công thức");
    }

    @PostMapping("/posts/{id}/publish")
    public ApiResponse<PostResponse> publish(@PathVariable Long id) {
        return ApiResponse.success(socialService.publish(SecurityUtils.getCurrentUserId(), id), "Đã xuất bản công thức");
    }

    @DeleteMapping("/posts/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        socialService.delete(SecurityUtils.getCurrentUserId(), id);
        return ApiResponse.success(null, "Đã xóa bài chia sẻ");
    }

    @PostMapping("/posts/{id}/like")
    public ApiResponse<LikeResponse> toggleLike(@PathVariable Long id) {
        return ApiResponse.success(socialService.toggleLike(SecurityUtils.getCurrentUserId(), id), "Đã cập nhật lượt thích");
    }

    @GetMapping("/posts/{id}/comments")
    public ApiResponse<List<CommentResponse>> comments(@PathVariable Long id) {
        return ApiResponse.success(socialService.comments(id), "Danh sách bình luận");
    }

    @PostMapping("/posts/{id}/comments")
    public ApiResponse<CommentResponse> addComment(@PathVariable Long id, @RequestBody CommentRequest request) {
        return ApiResponse.success(socialService.addComment(SecurityUtils.getCurrentUserId(), id, request), "Đã bình luận");
    }

    @DeleteMapping("/comments/{id}")
    public ApiResponse<Void> deleteComment(@PathVariable Long id) {
        socialService.deleteComment(SecurityUtils.getCurrentUserId(), id);
        return ApiResponse.success(null, "Đã xóa bình luận");
    }
}