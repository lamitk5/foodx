package com.nhom6.foodx.fridge.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * Upload ảnh món ăn (dùng cho form tạo công thức).
 * Chỉ chấp nhận ảnh raster an toàn (JPEG/PNG/WEBP) — từ chối SVG (nguy cơ stored-XSS),
 * kiểm tra cả đuôi file lẫn Content-Type. Yêu cầu đăng nhập (xem SecurityConfig).
 */
@RestController
@RequestMapping("/api/upload")
public class FileUploadController {

    // Thư mục lưu ảnh. Mặc định lấy từ spring.file.upload-dir, nếu không có thì dùng ./uploads
    @Value("${spring.file.upload-dir:./uploads}")
    private String uploadDir;

    private static final long MAX_UPLOAD_SIZE = 5L * 1024 * 1024;
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(".jpg", ".jpeg", ".png", ".webp");
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp");

    @PostMapping
    public ResponseEntity<?> upload(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "File rỗng"));
        }
        if (file.getSize() > MAX_UPLOAD_SIZE) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Ảnh tối đa 5MB"));
        }

        String original = file.getOriginalFilename();
        String ext = "";
        if (original != null && original.contains(".")) {
            ext = original.substring(original.lastIndexOf('.')).toLowerCase();
        }
        if (!ALLOWED_EXTENSIONS.contains(ext)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP"));
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Loại file không hợp lệ"));
        }

        try {
            // Tạo thư mục theo ngày để gọn gàng
            Path dayDir = Paths.get(uploadDir).resolve(LocalDate.now().toString());
            Files.createDirectories(dayDir);

            // Tên file duy nhất
            String filename = UUID.randomUUID().toString().replace("-", "") + ext;
            Path target = dayDir.resolve(filename);
            file.transferTo(target.toAbsolutePath());

            String url = "/uploads/" + LocalDate.now().toString() + "/" + filename;
            return ResponseEntity.ok(Map.of("url", url));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Không lưu được file"));
        }
    }
}
