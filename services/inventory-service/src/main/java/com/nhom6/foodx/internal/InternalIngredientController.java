package com.nhom6.foodx.internal;

import com.nhom6.foodx.common.client.InternalApi;
import com.nhom6.foodx.common.dto.IngredientRefDto;
import com.nhom6.foodx.ingredient.service.IngredientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * API nội bộ cho danh mục nguyên liệu ({@code ingredients}).
 *
 * <p>recipe-service dùng để bảo đảm nguyên liệu tồn tại và tra cứu theo tên thay vì
 * tự ghi vào bảng {@code ingredients}. Chỉ tồn tại trong mạng nội bộ (yêu cầu
 * {@code X-Foodx-Internal-Token}); trả về <b>JSON thô</b> của DTO/List, không bọc
 * {@code ApiResponse}.</p>
 *
 * <p>Tiền tố {@code InternalApi.PREFIX + "/ingredients"} khai báo ở cấp class; các
 * đường dẫn dưới đây là phần đuôi tương ứng của {@link InternalApi#INGREDIENTS},
 * {@link InternalApi#INGREDIENT_BY_ID}, {@link InternalApi#INGREDIENTS_RESOLVE} và
 * {@link InternalApi#INGREDIENTS_ENSURE}.</p>
 */
@RestController
@RequestMapping(InternalApi.PREFIX + "/ingredients")
@RequiredArgsConstructor
public class InternalIngredientController {

    private final IngredientService ingredientService;

    /** {@code GET /internal/ingredients?ids=1,2,3} — tra nhiều nguyên liệu theo id. */
    @GetMapping
    public List<IngredientRefDto> getByIds(@RequestParam("ids") List<Long> ids) {
        return ingredientService.getRefs(ids);
    }

    /** {@code GET /internal/ingredients/{id}} — một nguyên liệu, không có thì 404. */
    @GetMapping("/{id}")
    public ResponseEntity<IngredientRefDto> getById(@PathVariable Long id) {
        return ingredientService.getRef(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * {@code GET /internal/ingredients/resolve?names=a,b} — tra theo tên, không phân biệt
     * hoa/thường.
     *
     * <p><b>Lưu ý:</b> Spring tự tách tham số theo dấu phẩy, nên tên nguyên liệu có chứa
     * dấu phẩy sẽ bị cắt thành nhiều phần (rủi ro đã được chấp nhận — xem báo cáo).</p>
     */
    @GetMapping("/resolve")
    public List<IngredientRefDto> resolve(@RequestParam("names") List<String> names) {
        return ingredientService.resolveRefs(names);
    }

    /**
     * {@code POST /internal/ingredients/ensure} — trả nguyên liệu cũ nếu đã có
     * (không phân biệt hoa/thường), ngược lại tạo mới.
     * Body: {@code {"name":"..","category":".."}}.
     */
    @PostMapping("/ensure")
    public IngredientRefDto ensure(@RequestBody EnsureIngredientRequest request) {
        return ingredientService.ensure(request.name(), request.category());
    }

    /** Body tạo/tra nguyên liệu. */
    public record EnsureIngredientRequest(
            String name,
            String category
    ) {
    }
}
