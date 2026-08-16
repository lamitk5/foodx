package com.nhom6.foodx.ai.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO gửi lên Gemini API.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class GeminiRequest {

    private List<Content> contents;
    @JsonProperty("system_instruction")
    private Content systemInstruction;
    private GenerationConfig generationConfig;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Content {
        private List<Part> parts;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Part {
        private String text;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class GenerationConfig {
        private Double temperature;
        @JsonProperty("maxOutputTokens")
        private Integer maxOutputTokens;
        @JsonProperty("responseMimeType")
        private String responseMimeType;
    }
}
