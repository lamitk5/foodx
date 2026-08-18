package com.nhom6.foodx.social.service;

import com.nhom6.foodx.auth.entity.User;
import com.nhom6.foodx.common.exception.BusinessException;
import com.nhom6.foodx.social.dto.CommentRequest;
import com.nhom6.foodx.social.dto.CommentResponse;
import com.nhom6.foodx.social.dto.LikeResponse;
import com.nhom6.foodx.social.dto.PostRequest;
import com.nhom6.foodx.social.dto.PostResponse;
import com.nhom6.foodx.social.entity.PostComment;
import com.nhom6.foodx.social.entity.PostLike;
import com.nhom6.foodx.social.entity.RecipePost;
import com.nhom6.foodx.social.repository.PostCommentRepository;
import com.nhom6.foodx.social.repository.PostLikeRepository;
import com.nhom6.foodx.social.repository.RecipePostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

/**
 * Mạng xã hội chia sẻ công thức: feed, đăng bài, thích, bình luận.
 */
@Service
@RequiredArgsConstructor
public class SocialService {

    private final RecipePostRepository postRepository;
    private final PostLikeRepository likeRepository;
    private final PostCommentRepository commentRepository;

    @Transactional(readOnly = true)
    public List<PostResponse> feed(User me) {
        return postRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(post -> toResponse(me, post))
                .toList();
    }

    @Transactional(readOnly = true)
    public PostResponse getPost(User me, Long id) {
        return toResponse(me, findPost(id));
    }

    @Transactional
    public PostResponse create(User me, PostRequest request) {
        if (request.title() == null || request.title().isBlank()) {
            throw new BusinessException(400, "Tiêu đề không được để trống");
        }
        RecipePost post = RecipePost.builder()
                .author(me)
                .title(request.title().trim())
                .description(request.description() == null ? "" : request.description().trim())
                .ingredients(joinLines(request.ingredients()))
                .instructions(request.instructions() == null ? "" : request.instructions().trim())
                .imageUrl(request.imageUrl() == null ? null : request.imageUrl().trim())
                .build();
        return toResponse(me, postRepository.save(post));
    }

    @Transactional
    public void delete(User me, Long id) {
        RecipePost post = findPost(id);
        requireAuthor(post, me);
        likeRepository.deleteByPost_Id(id);
        commentRepository.deleteByPost_Id(id);
        postRepository.delete(post);
    }

    @Transactional
    public LikeResponse toggleLike(User me, Long postId) {
        RecipePost post = findPost(postId);
        boolean liked;
        if (likeRepository.existsByPost_IdAndUser_Id(postId, me.getId())) {
            likeRepository.findByPost_IdAndUser_Id(postId, me.getId()).ifPresent(likeRepository::delete);
            liked = false;
        } else {
            likeRepository.save(PostLike.builder()
                    .user(me)
                    .post(post)
                    .build());
            liked = true;
        }
        return new LikeResponse(liked, likeRepository.countByPost_Id(postId));
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> comments(Long postId) {
        findPost(postId);
        return commentRepository.findByPost_IdOrderByCreatedAtAsc(postId)
                .stream()
                .map(this::toCommentResponse)
                .toList();
    }

    @Transactional
    public CommentResponse addComment(User me, Long postId, CommentRequest request) {
        if (request.content() == null || request.content().isBlank()) {
            throw new BusinessException(400, "Nội dung bình luận không được để trống");
        }
        RecipePost post = findPost(postId);
        PostComment comment = PostComment.builder()
                .user(me)
                .post(post)
                .content(request.content().trim())
                .build();
        return toCommentResponse(commentRepository.save(comment));
    }

    @Transactional
    public void deleteComment(User me, Long commentId) {
        PostComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new BusinessException(404, "Không tìm thấy bình luận"));
        if (!comment.getUser().getId().equals(me.getId())) {
            throw new BusinessException(403, "Bạn không có quyền xóa bình luận này");
        }
        commentRepository.delete(comment);
    }

    private RecipePost findPost(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new BusinessException(404, "Không tìm thấy bài chia sẻ"));
    }

    private void requireAuthor(RecipePost post, User me) {
        if (!post.getAuthor().getId().equals(me.getId())) {
            throw new BusinessException(403, "Bạn không có quyền thực hiện thao tác này");
        }
    }

    private String joinLines(List<String> lines) {
        if (lines == null || lines.isEmpty()) {
            return "";
        }
        return String.join("\n", lines.stream()
                .filter(line -> line != null && !line.isBlank())
                .map(String::trim)
                .toList());
    }

    private List<String> splitLines(String text) {
        if (text == null || text.isBlank()) {
            return List.of();
        }
        return Arrays.stream(text.split("\n"))
                .map(String::trim)
                .filter(line -> !line.isBlank())
                .toList();
    }

    private PostResponse toResponse(User me, RecipePost post) {
        User author = post.getAuthor();
        return new PostResponse(
                post.getId(),
                author.getId(),
                author.getFullName() == null || author.getFullName().isBlank()
                        ? author.getUsername()
                        : author.getFullName(),
                author.getAvatarUrl(),
                post.getTitle(),
                post.getDescription(),
                splitLines(post.getIngredients()),
                post.getInstructions(),
                post.getImageUrl(),
                likeRepository.countByPost_Id(post.getId()),
                me != null && likeRepository.existsByPost_IdAndUser_Id(post.getId(), me.getId()),
                commentRepository.countByPost_Id(post.getId()),
                post.getCreatedAt()
        );
    }

    private CommentResponse toCommentResponse(PostComment comment) {
        User author = comment.getUser();
        return new CommentResponse(
                comment.getId(),
                comment.getPost().getId(),
                author.getId(),
                author.getFullName() == null || author.getFullName().isBlank()
                        ? author.getUsername()
                        : author.getFullName(),
                author.getAvatarUrl(),
                comment.getContent(),
                comment.getCreatedAt()
        );
    }
}