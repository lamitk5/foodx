package com.nhom6.foodx.internal;

import com.nhom6.foodx.common.client.InternalApi;
import com.nhom6.foodx.social.repository.PostCommentRepository;
import com.nhom6.foodx.social.repository.PostLikeRepository;
import com.nhom6.foodx.social.repository.RecipePostRepository;
import com.nhom6.foodx.stats.repository.CookHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * API nội bộ để dọn dữ liệu của một người dùng đã bị xoá tài khoản.
 *
 * <p>Chỉ tồn tại trong mạng nội bộ (yêu cầu {@code X-Foodx-Internal-Token}) và không được
 * API Gateway định tuyến ra ngoài. Trước refactor, user-service tự chạy {@code DELETE}
 * xuyên qua bảng của service này bằng {@code JdbcTemplate}; nay mỗi service tự dọn bảng
 * mình sở hữu qua {@link InternalApi#USER_DATA_PURGE} và user-service chỉ điều phối.</p>
 *
 * <p>Theo quy ước {@code /internal/**}, endpoint trả về <b>JSON thô</b> (một số nguyên là
 * số dòng đã xoá), không bọc {@code ApiResponse}.</p>
 */
@RestController
@RequestMapping(InternalApi.USERS)
@RequiredArgsConstructor
public class InternalUserDataController {

    private final RecipePostRepository postRepository;
    private final PostLikeRepository likeRepository;
    private final PostCommentRepository commentRepository;
    private final CookHistoryRepository cookHistoryRepository;

    /**
     * Xoá toàn bộ dữ liệu social + thống kê của một người dùng, theo đúng thứ tự phụ thuộc
     * (con trước, cha sau) để không vi phạm khoá ngoại:
     * <ol>
     *   <li>{@code post_comments} của các bài viết do user làm tác giả</li>
     *   <li>{@code post_likes} của các bài viết do user làm tác giả</li>
     *   <li>{@code recipe_posts} của user (theo {@code author_id})</li>
     *   <li>{@code post_comments} của user (theo {@code user_id}, trên bài của người khác)</li>
     *   <li>{@code post_likes} của user (theo {@code user_id}, trên bài của người khác)</li>
     *   <li>{@code cook_history} của user (theo {@code user_id})</li>
     * </ol>
     *
     * @return tổng số dòng đã xoá
     */
    @DeleteMapping("/{userId}/data")
    @Transactional
    public Integer purgeUserData(@PathVariable Long userId) {
        if (userId == null) {
            return 0;
        }
        int deleted = 0;
        // Bình luận/lượt thích nằm trên bài viết của user — phải xoá trước recipe_posts
        deleted += commentRepository.deleteByPostAuthorId(userId);
        deleted += likeRepository.deleteByPostAuthorId(userId);
        deleted += postRepository.deleteByAuthorId(userId);
        // Bình luận/lượt thích do chính user tạo trên bài của người khác
        deleted += commentRepository.deleteByUserId(userId);
        deleted += likeRepository.deleteByUserId(userId);
        // Lịch sử nấu ăn
        deleted += cookHistoryRepository.deleteByUserId(userId);
        return deleted;
    }
}
