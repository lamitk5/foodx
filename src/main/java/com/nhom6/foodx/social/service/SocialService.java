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

import java.util.List;

/**
 * Mạng xã hội chia sẻ công thức: feed, đăng bài (nháp/xuất bản), thích, bình luận.
 */
@Service
@RequiredArgsConstructor
public class SocialService {

    private final RecipePostRepository postRepository;
    private final PostLikeRepository likeRepository;
    private final PostCommentRepository commentRepository;

    @Transactional(readOnly = true)
    public List<PostResponse> feed(User me) {
        return postRepository.findByStatusOrderByCreatedAtDesc(RecipePost.STATUS_PUBLISHED)
                .stream()
                .map(post -> toResponse(me, post))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PostResponse> myPosts(User me) {
        return postRepository.findByAuthor_IdOrderByCreatedAtDesc(me.getId())
                .stream()
                .map(post -> toResponse(me, post))
                .toList();
    }

    @Transactional(readOnly = true)
    public PostResponse getPost(User me, Long id) {
        RecipePost post = findPost(id);
        if (RecipePost.STATUS_DRAFT.equals(post.getStatus())
                && (me == null || !post.getAuthor().getId().equals(me.getId()))) {
            throw new BusinessException(404, "Không tìm thấy bài chia sẻ");
        }
        return toResponse(me, post);
    }

    @Transactional
    public PostResponse create(User me, PostRequest request) {
        if (request.title() == null || request.title().isBlank()) {
            throw new BusinessException(400, "Tiêu đề không được để trống");
        }

        String status = normalizeStatus(request.status());
        String steps = joinLines(request.steps());
        if (steps.isBlank() && request.instructions() != null && !request.instructions().isBlank()) {
            steps = request.instructions().trim();
        }

        RecipePost post = RecipePost.builder()
                .author(me)
                .title(request.title().trim())
                .description(request.description() == null ? "" : request.description().trim())
                .ingredients(joinLines(request.ingredients()))
                .steps(steps)
                .instructions(steps)
                .imageUrl(request.imageUrl() == null ? null : request.imageUrl().trim())
                .category(request.category() == null ? null : request.category().trim())
                .cookTime(request.cookTime() != null && request.cookTime() > 0 ? request.cookTime() : null)
                .kcal(request.kcal() != null && request.kcal() > 0 ? request.kcal() : null)
                .servings(request.servings() != null && request.servings() > 0 ? request.servings() : null)
                .difficulty(request.difficulty() == null ? null : request.difficulty().trim())
                .status(status)
                .build();
        return toResponse(me, postRepository.save(post));
    }

    /** Xuất bản một bản nháp. */
    @Transactional
    public PostResponse publish(User me, Long id) {
        RecipePost post = findPost(id);
        requireAuthor(post, me);
        post.setStatus(RecipePost.STATUS_PUBLISHED);
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
        if (!comment.getUser().getId().equals(me.getId()) && me.getRole() != User.Role.ADMIN) {
            throw new BusinessException(403, "Bạn không có quyền xóa bình luận này");
        }
        commentRepository.delete(comment);
    }

    private RecipePost findPost(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new BusinessException(404, "Không tìm thấy bài chia sẻ"));
    }

    private void requireAuthor(RecipePost post, User me) {
        if (!post.getAuthor().getId().equals(me.getId()) && me.getRole() != User.Role.ADMIN) {
            throw new BusinessException(403, "Bạn không có quyền thực hiện thao tác này");
        }
    }

    private String normalizeStatus(String status) {
        if (status != null && RecipePost.STATUS_DRAFT.equalsIgnoreCase(status.trim())) {
            return RecipePost.STATUS_DRAFT;
        }
        return RecipePost.STATUS_PUBLISHED;
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

    /** Tách dòng: CHỈ theo xuống dòng (không tách theo dấu phẩy để giữ nguyên "500g Thịt bò"). */
    private List<String> splitLines(String text) {
        if (text == null || text.isBlank()) {
            return List.of();
        }
        return java.util.Arrays.stream(text.split("\r?\n"))
                .map(String::trim)
                .filter(line -> !line.isBlank())
                .toList();
    }

    private PostResponse toResponse(User me, RecipePost post) {
        User author = post.getAuthor();
        String stepsText = post.getSteps() != null ? post.getSteps() : post.getInstructions();
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
                stepsText,
                splitLines(stepsText),
                post.getImageUrl(),
                post.getCategory(),
                post.getCookTime(),
                post.getKcal(),
                post.getServings(),
                post.getDifficulty(),
                post.getStatus(),
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
