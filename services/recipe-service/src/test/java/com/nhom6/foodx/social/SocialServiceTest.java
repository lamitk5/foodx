package com.nhom6.foodx.social;

import com.nhom6.foodx.auth.entity.User;
import com.nhom6.foodx.common.exception.BusinessException;
import com.nhom6.foodx.social.dto.CommentRequest;
import com.nhom6.foodx.social.dto.LikeResponse;
import com.nhom6.foodx.social.dto.PostRequest;
import com.nhom6.foodx.social.dto.PostResponse;
import com.nhom6.foodx.social.entity.PostComment;
import com.nhom6.foodx.social.entity.RecipePost;
import com.nhom6.foodx.social.repository.PostCommentRepository;
import com.nhom6.foodx.social.repository.PostLikeRepository;
import com.nhom6.foodx.social.repository.RecipePostRepository;
import com.nhom6.foodx.social.service.SocialService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SocialServiceTest {

    @Mock
    private RecipePostRepository postRepository;
    @Mock
    private PostLikeRepository likeRepository;
    @Mock
    private PostCommentRepository commentRepository;

    @InjectMocks
    private SocialService socialService;

    private User author;
    private User otherUser;
    private RecipePost post;

    @BeforeEach
    void setUp() {
        author = User.builder()
                .id(1L)
                .username("dang_chef")
                .fullName("Mai Hải Đăng")
                .role(User.Role.USER)
                .build();

        otherUser = User.builder()
                .id(2L)
                .username("guest")
                .fullName("Khách")
                .role(User.Role.USER)
                .build();

        post = RecipePost.builder()
                .id(100L)
                .title("Bún Chả Hà Nội Đậm Đà")
                .description("Bí quyết ướp thịt nướng than hoa")
                .author(author)
                .status(RecipePost.STATUS_PUBLISHED)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    void createPost_emptyTitle_throwsBusinessException() {
        PostRequest req = new PostRequest("   ", "mô tả", List.of(), List.of(), "", null, null, null, null, null, null, null);
        BusinessException ex = assertThrows(BusinessException.class, () -> socialService.create(author, req));
        assertEquals(400, ex.getStatus());
    }

    @Test
    void createPost_unauthenticated_throwsUnauthorized() {
        PostRequest req = new PostRequest("Tiêu đề", "mô tả", List.of(), List.of(), "", null, null, null, null, null, null, null);
        BusinessException ex = assertThrows(BusinessException.class, () -> socialService.create(null, req));
        assertEquals(401, ex.getStatus());
    }

    @Test
    void publishPost_nonAuthor_throwsForbidden() {
        when(postRepository.findById(100L)).thenReturn(Optional.of(post));
        BusinessException ex = assertThrows(BusinessException.class, () -> socialService.publish(otherUser, 100L));
        assertEquals(403, ex.getStatus());
    }

    @Test
    void toggleLike_firstTime_returnsLikedTrue() {
        when(postRepository.findById(100L)).thenReturn(Optional.of(post));
        when(likeRepository.existsByPost_IdAndUser_Id(100L, author.getId())).thenReturn(false);
        when(likeRepository.countByPost_Id(100L)).thenReturn(1L);

        LikeResponse response = socialService.toggleLike(author, 100L);
        assertTrue(response.liked());
        assertEquals(1L, response.likeCount());
        verify(likeRepository, times(1)).save(any());
    }

    @Test
    void addComment_emptyContent_throwsBadRequest() {
        CommentRequest req = new CommentRequest("   ");
        BusinessException ex = assertThrows(BusinessException.class, () -> socialService.addComment(author, 100L, req));
        assertEquals(400, ex.getStatus());
    }

    @Test
    void deleteComment_nonAuthor_throwsForbidden() {
        PostComment comment = PostComment.builder()
                .id(50L)
                .post(post)
                .user(author)
                .content("Bình luận hay")
                .build();
        when(commentRepository.findById(50L)).thenReturn(Optional.of(comment));

        BusinessException ex = assertThrows(BusinessException.class, () -> socialService.deleteComment(otherUser, 50L));
        assertEquals(403, ex.getStatus());
    }
}
