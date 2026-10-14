package com.nhom6.foodx.ai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nhom6.foodx.common.dto.ScanFoodImageItemDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Nhận diện thực phẩm từ ảnh (hoá đơn siêu thị / ngăn tủ lạnh) bằng mô hình thị giác Gemini.
 *
 * <p>Được dùng bởi hai cửa vào: {@code POST /api/ai/scan-food-image} (người dùng cuối) và
 * {@code POST /internal/ai/scan-food-image} (inventory-service). Nhờ vậy logic prompt và
 * phương án dự phòng chỉ tồn tại một bản — trước refactor inventory-service tự gọi HTTP thô
 * tới endpoint công khai của ai-service.</p>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FoodImageScanService {

    private static final String PROMPT = """
            Bạn là chuyên gia nhận diện thực phẩm chuyên nghiệp từ ảnh chụp (hoá đơn siêu thị hoặc ảnh chụp ngăn tủ lạnh).
            Hãy phân tích ảnh và trích xuất danh sách tất cả các thực phẩm/nguyên liệu nhìn thấy hoặc mua trong hoá đơn.
            Trả về DUY NHẤT một JSON Array hợp lệ (không kèm markdown) có cấu trúc:
            [
              {
                "name": "Tên thực phẩm chuẩn tiếng Việt (vd: Trứng gà, Thịt ba chỉ, Cà chua)",
                "quantity": 1.0,
                "unit": "Đơn vị (vd: quả, kg, g, bó, hộp, vỉ, chai, túi)",
                "category": "Danh mục (Rau củ / Thịt / Hải sản / Trứng & Sữa / Gia vị / Đồ uống / Trái cây / Khác)",
                "estimatedExpiryDays": 7,
                "confidence": 0.95
              }
            ]
            """;

    private final GeminiService geminiService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * @param base64Data ảnh đã mã hoá Base64 (không kèm tiền tố data URI)
     * @param mimeType   ví dụ {@code image/jpeg}
     * @return thực phẩm nhận diện được; danh sách rỗng nếu chưa cấu hình Gemini hoặc AI lỗi.
     *         Bên gọi (inventory-service) tự gắn danh sách dự phòng và cờ {@code fallback}.
     */
    public List<ScanFoodImageItemDto> scan(String base64Data, String mimeType) {
        if (base64Data == null || base64Data.isBlank()) {
            return List.of();
        }

        if (!geminiService.isConfigured()) {
            log.info("Chưa cấu hình Gemini — không nhận diện ảnh, trả danh sách rỗng");
            return List.of();
        }

        try {
            String jsonStr = geminiService.analyzeImage(base64Data, mimeType, PROMPT);
            List<ScanFoodImageItemDto> parsed = parse(jsonStr);
            if (!parsed.isEmpty()) {
                return parsed;
            }
            log.warn("AI không trả thực phẩm nào từ ảnh");
        } catch (Exception ex) {
            log.warn("Nhận diện thực phẩm từ ảnh thất bại: {}", ex.getMessage());
        }

        return List.of();
    }

    private List<ScanFoodImageItemDto> parse(String jsonStr) {
        if (jsonStr == null || jsonStr.isBlank()) {
            return List.of();
        }
        String cleanJson = jsonStr.trim();
        if (cleanJson.startsWith("```json")) {
            cleanJson = cleanJson.substring(7);
        } else if (cleanJson.startsWith("```")) {
            cleanJson = cleanJson.substring(3);
        }
        if (cleanJson.endsWith("```")) {
            cleanJson = cleanJson.substring(0, cleanJson.length() - 3);
        }
        cleanJson = cleanJson.trim();
        try {
            return objectMapper.readValue(cleanJson, objectMapper.getTypeFactory()
                    .constructCollectionType(List.class, ScanFoodImageItemDto.class));
        } catch (Exception ex) {
            log.warn("Không đọc được JSON thực phẩm từ AI: {}", ex.getMessage());
            return List.of();
        }
    }

}
