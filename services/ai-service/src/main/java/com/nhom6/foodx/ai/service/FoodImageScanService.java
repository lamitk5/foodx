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
     * @return thực phẩm nhận diện được; nếu chưa cấu hình Gemini hoặc lỗi thì trả dữ liệu mẫu
     *         để luồng quét ảnh vẫn dùng được khi chạy offline
     */
    public List<ScanFoodImageItemDto> scan(String base64Data, String mimeType) {
        if (base64Data == null || base64Data.isBlank()) {
            return List.of();
        }

        if (geminiService.isConfigured()) {
            try {
                String jsonStr = geminiService.analyzeImage(base64Data, mimeType, PROMPT);
                List<ScanFoodImageItemDto> parsed = parse(jsonStr);
                if (!parsed.isEmpty()) {
                    return parsed;
                }
            } catch (Exception ex) {
                log.warn("Nhận diện thực phẩm từ ảnh thất bại: {}", ex.getMessage());
            }
        }

        return fallback();
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

    /** Dữ liệu mẫu khi chạy offline / chưa cấu hình API key. */
    private List<ScanFoodImageItemDto> fallback() {
        return List.of(
                new ScanFoodImageItemDto("Trứng gà", 10.0, "quả", "Trứng & Sữa", 14, 0.98),
                new ScanFoodImageItemDto("Thịt ba chỉ heo", 500.0, "g", "Thịt", 3, 0.95),
                new ScanFoodImageItemDto("Rau muống", 1.0, "bó", "Rau củ", 4, 0.92),
                new ScanFoodImageItemDto("Cà chua", 4.0, "quả", "Rau củ", 7, 0.90),
                new ScanFoodImageItemDto("Sữa tươi có đường", 1.0, "hộp", "Trứng & Sữa", 10, 0.96));
    }
}
