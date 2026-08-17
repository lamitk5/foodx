package com.nhom6.foodx.fridge.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin("*")
public class FileUploadController {

    // Thư mục lưu ảnh. Mặc định lấy từ spring.file.upload-dir, nếu không có thì dùng ./uploads
    @Value("${spring.file.upload-dir:./uploads}")
    private String uploadDir;

    @PostMapping
    public ResponseEntity<?> upload(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "File rỗng"));
        }

        // Giới hạn đuôi file là ảnh
        String original = file.getOriginalFilename();
        String ext = "";
        if (original != null && original.contains(".")) {
            ext = original.substring(original.lastIndexOf('.')).toLowerCase();
        }
        // Chỉ chấp nhận ảnh
        if (!ext.matches("\\.(png|jpe?g|gif|webp|bmp|svg)$")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Chỉ chấp nhận file ảnh: PNG, JPG, GIF, WEBP, BMP, SVG"));
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
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Không lưu được file: " + e.getMessage()));
        }
    }
}
