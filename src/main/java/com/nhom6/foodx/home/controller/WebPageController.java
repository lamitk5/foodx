package com.nhom6.foodx.home.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Các trang web tĩnh bổ sung (ứng dụng Food X được gộp từ dự án food-x).
 */
@Controller
public class WebPageController {

    /** Ứng dụng Food X: tủ lạnh, hồ sơ dinh dưỡng... */
    @GetMapping("/app")
    public String app() {
        return "forward:/app.html";
    }
}