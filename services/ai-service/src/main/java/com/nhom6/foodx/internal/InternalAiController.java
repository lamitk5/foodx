package com.nhom6.foodx.internal;

import com.nhom6.foodx.ai.service.AiProviderService;
import com.nhom6.foodx.ai.service.FoodImageScanService;
import com.nhom6.foodx.ai.service.RecipeExtractionService;
import com.nhom6.foodx.common.client.InternalApi;
import com.nhom6.foodx.common.dto.ScanFoodImageItemDto;
import com.nhom6.foodx.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

/**
 * API nội bộ cho các tác vụ AI dùng chung.
 *
 * <p>Trước refactor, recipe-service / plan-shopping-service gọi thẳng
 * {@code /api/ai/generate} và {@code /api/ai/parse-recipe} qua gateway — tức là phụ thuộc
 * vào endpoint công khai của người dùng cuối. Nay các tác vụ sinh văn bản / phân tích công
 * thức cho service khác nằm dưới {@code /internal/ai/**}: chỉ tồn tại trong mạng nội bộ,
 * yêu cầu header {@code X-Foodx-Internal-Token} (foodx-common chặn bằng {@code ROLE_INTERNAL}).</p>
 *
 * <p>Toàn bộ việc chọn nhà cung cấp LLM (Groq → Gemini → mock) vẫn nằm ở
 * {@link AiProviderService} — hai endpoint này chỉ là cửa vào mỏng, không viết lại logic LLM.</p>
 */
@RestController
@RequestMapping(InternalApi.PREFIX + "/ai")
@RequiredArgsConstructor
public class InternalAiController {

    /** Trả văn bản thô nên ghi rõ charset, tránh vỡ tiếng Việt trên đường truyền. */
    private static final MediaType TEXT_PLAIN_UTF8 = new MediaType("text", "plain", StandardCharsets.UTF_8);

    private final AiProviderService aiProviderService;
    private final RecipeExtractionService recipeExtractionService;
    private final FoodImageScanService foodImageScanService;

    /** Body dùng chung cho cả hai endpoint: {@code {"prompt":"..","mimeType":".."}}. */
    public record GenerationRequest(String prompt, String mimeType) {
    }

    /** Body của endpoint nhận diện ảnh: {@code {"data":"<base64>","mimeType":"image/jpeg"}}. */
    public record ScanRequest(String data, String mimeType) {
    }

    /**
     * {@code POST /internal/ai/generate} — sinh văn bản thô từ prompt.
     *
     * <p>Dùng bởi plan-shopping-service qua {@code AiServiceClient.generate(prompt, mimeType)}
     * của foodx-common (đọc body dạng String).</p>
     *
     * @return văn bản AI sinh ra (text/plain), hoặc 503 khi không sinh được
     */
    @PostMapping(value = "/generate", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> generate(@RequestBody(required = false) GenerationRequest request) {
        String prompt = request == null ? null : request.prompt();
        if (prompt == null || prompt.isBlank()) {
            return unavailable("Không sinh được văn bản: prompt rỗng");
        }
        // Giữ đúng hành vi cũ của /api/ai/generate khi chưa cấu hình Groq/Gemini.
        if (aiProviderService.isMockMode()) {
            return ResponseEntity.ok()
                    .contentType(TEXT_PLAIN_UTF8)
                    .body("Phản hồi mẫu AI cho: " + prompt);
        }
        String text;
        try {
            text = aiProviderService.generateText(prompt, request.mimeType());
        } catch (BusinessException ex) {
            return unavailable(ex.getMessage());
        }
        if (text == null || text.isBlank()) {
            return unavailable("Không sinh được văn bản từ AI");
        }
        return ResponseEntity.ok().contentType(TEXT_PLAIN_UTF8).body(text);
    }

    /**
     * {@code POST /internal/ai/parse-recipe} — phân tích văn bản thô thành JSON công thức.
     *
     * <p>Dùng bởi recipe-service qua {@code AiServiceClient.parseRecipe(String)} của foodx-common.
     * Trả về {@code text/plain} chứa chuỗi JSON (không phải {@code application/json}) để bên gọi
     * tự phân tích bằng Jackson 2 của mình — Spring Boot 4 dùng Jackson 3 cho tầng HTTP, không
     * nên bắc cầu hai phiên bản Jackson qua message converter.</p>
     *
     * @return JSON công thức dạng text, hoặc 503 khi AI không sinh được
     */
    @PostMapping(value = "/parse-recipe", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> parseRecipe(@RequestBody(required = false) GenerationRequest request) {
        String prompt = request == null ? null : request.prompt();
        if (prompt == null || prompt.isBlank()) {
            return unavailable("Không sinh được công thức: văn bản rỗng");
        }
        return recipeExtractionService.extractRawWithAi(prompt)
                .map(json -> ResponseEntity.ok().contentType(TEXT_PLAIN_UTF8).body(json))
                .orElseGet(() -> unavailable("AI không sinh được công thức từ văn bản đã cho"));
    }

    /**
     * {@code POST /internal/ai/scan-food-image} — nhận diện thực phẩm từ ảnh.
     *
     * <p>Dùng bởi inventory-service qua {@code AiServiceClient.scanFoodImage(base64, mimeType)}
     * của foodx-common, phục vụ tính năng "quét ảnh hoá đơn / tủ lạnh". Cùng logic với
     * {@code POST /api/ai/scan-food-image} đang phục vụ giao diện.</p>
     *
     * @return danh sách thực phẩm nhận diện được (dữ liệu mẫu nếu chưa cấu hình Gemini)
     */
    @PostMapping(value = "/scan-food-image", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<ScanFoodImageItemDto> scanFoodImage(@RequestBody(required = false) ScanRequest request) {
        if (request == null) {
            return List.of();
        }
        return foodImageScanService.scan(request.data(), request.mimeType());
    }

    private ResponseEntity<String> unavailable(String message) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .contentType(TEXT_PLAIN_UTF8)
                .body(message == null ? "Không sinh được văn bản từ AI" : message);
    }
}
