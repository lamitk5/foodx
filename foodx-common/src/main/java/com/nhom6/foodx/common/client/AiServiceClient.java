package com.nhom6.foodx.common.client;

import com.nhom6.foodx.common.dto.ScanFoodImageItemDto;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Optional;

/**
 * Client gọi ai-service cho các tác vụ AI dùng chung.
 *
 * <p>Nhờ lớp này, recipe-service, plan-shopping-service và inventory-service không cần biết
 * Groq/Gemini là gì, cũng không tự dựng HTTP client riêng: việc chọn nhà cung cấp LLM nằm trọn
 * trong ai-service.</p>
 */
public class AiServiceClient extends AbstractFoodxClient {

    public AiServiceClient(RestClient.Builder builder, String baseUrl, String internalToken) {
        super(builder, baseUrl, internalToken);
    }

    /**
     * Sinh văn bản tự do từ prompt.
     *
     * @param prompt   prompt đã dựng sẵn
     * @param mimeType kiểu nội dung mong muốn (ví dụ {@code application/json})
     * @return văn bản do LLM sinh ra, hoặc rỗng nếu ai-service không sẵn sàng
     */
    public Optional<String> generate(String prompt, String mimeType) {
        return postOptional(InternalApi.AI_GENERATE, String.class,
                        new GenerationRequest(prompt, mimeType))
                .filter(text -> !text.isBlank());
    }

    /**
     * Nhờ ai-service phân tích văn bản thô thành cấu trúc công thức.
     *
     * <p>Trả về <b>chuỗi JSON thô</b> (endpoint nội bộ dùng {@code text/plain}) để bên gọi tự
     * phân tích bằng Jackson của mình. Lý do: Spring Boot 4 dùng Jackson 3 ({@code tools.jackson})
     * cho tầng HTTP, trong khi mã nghiệp vụ của các service dùng Jackson 2
     * ({@code com.fasterxml.jackson}) — không nên bắc cầu hai phiên bản qua message converter.</p>
     *
     * @return JSON công thức (title/description/ingredients...), hoặc rỗng nếu AI không sẵn sàng.
     *         Bên gọi phải có parser dự phòng bằng regex.
     */
    public Optional<String> parseRecipe(String rawText) {
        if (rawText == null || rawText.isBlank()) {
            return Optional.empty();
        }
        return postOptional(InternalApi.AI_PARSE_RECIPE, String.class,
                        new GenerationRequest(rawText, null))
                .filter(text -> !text.isBlank());
    }

    /**
     * Nhờ ai-service nhận diện thực phẩm từ ảnh (hoá đơn hoặc ngăn tủ lạnh).
     *
     * @param base64Data ảnh đã mã hoá Base64 (không kèm tiền tố data URI)
     * @param mimeType   ví dụ {@code image/jpeg}
     * @return danh sách thực phẩm nhận diện được; rỗng nếu ai-service không sẵn sàng
     *         (bên gọi tự dùng dữ liệu mẫu dự phòng)
     */
    public List<ScanFoodImageItemDto> scanFoodImage(String base64Data, String mimeType) {
        if (base64Data == null || base64Data.isBlank()) {
            return List.of();
        }
        return postList(InternalApi.AI_SCAN_FOOD_IMAGE,
                new ParameterizedTypeReference<>() {
                },
                new ScanRequest(base64Data, mimeType));
    }

    private record GenerationRequest(String prompt, String mimeType) {
    }

    private record ScanRequest(String data, String mimeType) {
    }
}
