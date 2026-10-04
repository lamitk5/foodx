package com.nhom6.foodx.gateway;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
public class WebStaticConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/", "file:./src/main/resources/static/");

        String uploadLocation = Paths.get("uploads")
                .toAbsolutePath()
                .normalize()
                .toUri()
                .toString();
        if (!uploadLocation.endsWith("/")) {
            uploadLocation += "/";
        }
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadLocation, "file:./uploads/");
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/").setViewName("forward:/index.html");
        registry.addViewController("/app").setViewName("forward:/index.html");
    }
}
