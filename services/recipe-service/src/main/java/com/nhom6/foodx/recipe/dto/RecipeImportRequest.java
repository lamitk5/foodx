package com.nhom6.foodx.recipe.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request import công thức từ web/text.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecipeImportRequest {

    /** URL trang web chứa công thức. */
    private String sourceUrl;

    /** Nội dung text công thức để parse (không bắt buộc nếu có sourceUrl). */
    @NotBlank(message = "Cần cung cấp sourceUrl hoặc text")
    private String text;
}
