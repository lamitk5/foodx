package com.nhom6.foodx.social.service;

import com.nhom6.foodx.common.client.UserServiceClient;
import com.nhom6.foodx.common.dto.UserSummaryDto;
import com.nhom6.foodx.common.exception.BusinessException;
import com.nhom6.foodx.common.security.SecurityUtils;
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

import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Mạng xã hội chia sẻ công thức: feed, đăng bài (nháp/xuất bản), thích, bình luận.
 *
 * <p>Service chỉ sở hữu {@code recipe_posts}, {@code post_likes}, {@code post_comments};
 * tên/avatar tác giả lấy qua {@link UserServiceClient} (gọi gom một lần cho cả feed để
 * tránh N+1). Người dùng hiện tại chỉ được biết qua {@code userId} từ JWT.</p>
 */
@Service
@RequiredArgsConstructor
public class SocialService {

    /** Tên hiển thị khi user-service không trả về thông tin tác giả (user đã xoá / lỗi mạng). */
    private static final String UNKNOWN_AUTHOR = "Người dùng ẩn";

    private final RecipePostRepository postRepository;
    private final PostLikeRepository likeRepository;
    private final PostCommentRepository commentRepository;
    private final UserServiceClient userServiceClient;

    @Transactional(readOnly = true)
    public List<PostResponse> feed(Long meId) {
        List<RecipePost> posts = postRepository.findByStatusOrderByCreatedAtDesc(RecipePost.STATUS_PUBLISHED);
        Map<Long, UserSummaryDto> authors = loadAuthors(posts.stream().map(RecipePost::getAuthorId).toList());
        return posts.stream()
                .map(post -> toResponse(post, meId, authors.get(post.getAuthorId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PostResponse> myPosts(Long meId) {
        List<RecipePost> posts = postRepository.findByAuthorIdOrderByCreatedAtDesc(meId);
        Map<Long, UserSummaryDto> authors = loadAuthors(posts.stream().map(RecipePost::getAuthorId).toList());
        return posts.stream()
                .map(post -> toResponse(post, meId, authors.get(post.getAuthorId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public PostResponse getPost(Long meId, Long id) {
        RecipePost post = findPost(id);
        if (RecipePost.STATUS_DRAFT.equals(post.getStatus())
                && (meId == null || !post.getAuthorId().equals(meId))) {
            throw new BusinessException(404, "Không tìm thấy bài chia sẻ");
        }
        return toResponse(post, meId, loadAuthor(post.getAuthorId()));
    }

    @Transactional
    public PostResponse create(Long meId, PostRequest request) {
        if (request.title() == null || request.title().isBlank()) {
            throw new BusinessException(400, "Tiêu đề không được để trống");
        }

        String status = normalizeStatus(request.status());
        String steps = joinLines(request.steps());
        if (steps.isBlank() && request.instructions() != null && !request.instructions().isBlank()) {
            steps = request.instructions().trim();
        }

        RecipePost post = RecipePost.builder()
                .authorId(meId)
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
        return toResponse(postRepository.save(post), meId, loadAuthor(meId));
    }

    /** Xuất bản một bản nháp. */
    @Transactional
    public PostResponse publish(Long meId, Long id) {
        RecipePost post = findPost(id);
        requireAuthor(post, meId);
        post.setStatus(RecipePost.STATUS_PUBLISHED);
        return toResponse(postRepository.save(post), meId, loadAuthor(post.getAuthorId()));
    }

    @Transactional
    public void delete(Long meId, Long id) {
        RecipePost post = findPost(id);
        requireAuthor(post, meId);
        likeRepository.deleteByPost_Id(id);
        commentRepository.deleteByPost_Id(id);
        postRepository.delete(post);
    }

    @Transactional
    public LikeResponse toggleLike(Long meId, Long postId) {
        RecipePost post = findPost(postId);
        boolean liked;
        if (likeRepository.existsByPost_IdAndUserId(postId, meId)) {
            likeRepository.findByPost_IdAndUserId(postId, meId).ifPresent(likeRepository::delete);
            liked = false;
        } else {
            likeRepository.save(PostLike.builder()
                    .userId(meId)
                    .post(post)
                    .build());
            liked = true;
        }
        return new LikeResponse(liked, likeRepository.countByPost_Id(postId));
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> comments(Long postId) {
        findPost(postId);
        List<PostComment> comments = commentRepository.findByPost_IdOrderByCreatedAtAsc(postId);
        Map<Long, UserSummaryDto> authors = loadAuthors(comments.stream().map(PostComment::getUserId).toList());
        return comments.stream()
                .map(comment -> toCommentResponse(comment, authors.get(comment.getUserId())))
                .toList();
    }

    @Transactional
    public CommentResponse addComment(Long meId, Long postId, CommentRequest request) {
        if (request.content() == null || request.content().isBlank()) {
            throw new BusinessException(400, "Nội dung bình luận không được để trống");
        }
        RecipePost post = findPost(postId);
        PostComment comment = PostComment.builder()
                .userId(meId)
                .post(post)
                .content(request.content().trim())
                .build();
        return toCommentResponse(commentRepository.save(comment), loadAuthor(meId));
    }

    @Transactional
    public void deleteComment(Long meId, Long commentId) {
        PostComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new BusinessException(404, "Không tìm thấy bình luận"));
        if (!comment.getUserId().equals(meId) && !SecurityUtils.isAdmin()) {
            throw new BusinessException(403, "Bạn không có quyền xóa bình luận này");
        }
        commentRepository.delete(comment);
    }

    private RecipePost findPost(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new BusinessException(404, "Không tìm thấy bài chia sẻ"));
    }

    private void requireAuthor(RecipePost post, Long meId) {
        if (!post.getAuthorId().equals(meId) && !SecurityUtils.isAdmin()) {
            throw new BusinessException(403, "Bạn không có quyền thực hiện thao tác này");
        }
    }

    /** Thông tin tác giả cho một bài/bình luận; rỗng nếu user-service không trả về. */
    private UserSummaryDto loadAuthor(Long authorId) {
        if (authorId == null) {
            return null;
        }
        return userServiceClient.getUser(authorId).orElse(null);
    }

    /** Nạp thông tin nhiều tác giả trong MỘT lời gọi HTTP (tránh N+1 khi render danh sách). */
    private Map<Long, UserSummaryDto> loadAuthors(Collection<Long> authorIds) {
        if (authorIds == null || authorIds.isEmpty()) {
            return Map.of();
        }
        return new LinkedHashMap<>(userServiceClient.getUsers(authorIds));
    }

    /** Tên hiển thị: ưu tiên họ tên, fallback tên đăng nhập, cuối cùng là "Người dùng ẩn". */
    private String displayName(UserSummaryDto author) {
        if (author == null) {
            return UNKNOWN_AUTHOR;
        }
        if (author.fullName() != null && !author.fullName().isBlank()) {
            return author.fullName();
        }
        if (author.username() != null && !author.username().isBlank()) {
            return author.username();
        }
        return UNKNOWN_AUTHOR;
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

    private PostResponse toResponse(RecipePost post, Long meId, UserSummaryDto author) {
        String stepsText = post.getSteps() != null ? post.getSteps() : post.getInstructions();
        return new PostResponse(
                post.getId(),
                post.getAuthorId(),
                displayName(author),
                author == null ? null : author.avatarUrl(),
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
                meId != null && likeRepository.existsByPost_IdAndUserId(post.getId(), meId),
                commentRepository.countByPost_Id(post.getId()),
                post.getCreatedAt()
        );
    }

    private CommentResponse toCommentResponse(PostComment comment, UserSummaryDto author) {
        return new CommentResponse(
                comment.getId(),
                comment.getPost().getId(),
                comment.getUserId(),
                displayName(author),
                author == null ? null : author.avatarUrl(),
                comment.getContent(),
                comment.getCreatedAt()
        );
    }
}
