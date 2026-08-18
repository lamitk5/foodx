package com.nhom6.foodx.ai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nhom6.foodx.ai.util.PromptTemplate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecipeParserService {

    private final AiProviderService aiProviderService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Parse text công thức thành JsonNode có cấu trúc.
     * Ưu tiên dùng AI (Groq/Gemini), nếu AI bị lỗi JSON hoặc cắt cụt thì tự động dùng Rule-based Fallback Regex.
     */
    public JsonNode parse(String rawText) {
        if (rawText == null || rawText.isBlank()) {
            return buildFallbackRecipe(rawText);
        }
        try {
            String prompt = PromptTemplate.recipeParsePrompt(rawText);
            JsonNode result = aiProviderService.generateJson(prompt, JsonNode.class);
            if (result != null && (result.has("title") || result.has("ingredients"))) {
                return result;
            }
        } catch (Exception ex) {
            log.warn("AI parse JSON thất bại ({}), chuyển sang bộ phân tích dự phòng Regex.", ex.getMessage());
        }
        return buildFallbackRecipe(rawText);
    }

    private JsonNode buildFallbackRecipe(String rawText) {
        ObjectNode root = objectMapper.createObjectNode();
        if (rawText == null || rawText.isBlank()) {
            root.put("title", "Công thức món ăn");
            root.put("description", "Công thức từ AI FoodX");
            root.put("instructions", "Thực hiện theo các bước.");
            root.put("prepTime", 15);
            root.put("cookTime", 30);
            root.put("servings", 2);
            root.put("cuisine", "Việt Nam");
            root.put("category", "Món chính");
            root.put("difficulty", "Dễ");
            root.put("kcal", 450);
            root.putArray("ingredients");
            return root;
        }

        String[] lines = rawText.split("\n");
        String title = "";
        StringBuilder instructions = new StringBuilder();
        ArrayNode ingredients = objectMapper.createArrayNode();
        boolean isIngSection = false;
        boolean isStepSection = false;

        for (String rawLine : lines) {
            String line = rawLine.trim();
            if (line.isBlank()) continue;
            String lower = line.toLowerCase();

            // Extract title if not set
            if (title.isEmpty() && !line.startsWith("|") && !line.startsWith("-") && !line.startsWith("*") && line.length() > 3 && line.length() < 120) {
                String cleanTitle = line.replaceAll("^[#\\*\\_~\\-\\•\\s]+", "").replaceAll("[#\\*\\_~\\-\\•\\s]+$", "");
                if (!cleanTitle.toLowerCase().contains("nguyên liệu") && !cleanTitle.toLowerCase().contains("thành phần")) {
                    title = cleanTitle;
                    continue;
                }
            }

            // Section markers
            if (lower.contains("nguyên liệu") || lower.contains("thành phần") || lower.contains("chuẩn bị")) {
                isIngSection = true;
                isStepSection = false;
                continue;
            }
            if (lower.contains("hướng dẫn") || lower.contains("cách làm") || lower.contains("thực hiện") || lower.contains("các bước") || lower.contains("bước 1") || lower.contains("sơ chế") || lower.contains("chế biến")) {
                isIngSection = false;
                isStepSection = true;
                continue;
            }

            if (isStepSection) {
                String stepClean = line.replaceAll("^[#\\*\\_~\\-\\•\\s]+", "");
                if (!stepClean.isBlank() && !stepClean.startsWith("|")) {
                    if (!instructions.isEmpty()) instructions.append("\n");
                    instructions.append(stepClean);
                }
                continue;
            }

            if (isIngSection || line.startsWith("-") || line.startsWith("*") || line.startsWith("•") || (line.startsWith("|") && line.endsWith("|"))) {
                // Table row
                if (line.startsWith("|") && line.endsWith("|")) {
                    if (line.contains("---")) continue;
                    String[] cells = line.split("\\|");
                    List<String> validCells = new ArrayList<>();
                    for (int i = 1; i < cells.length; i++) {
                        String c = cells[i].trim();
                        if (!c.isBlank()) validCells.add(c);
                    }
                    if (validCells.isEmpty() || validCells.stream().anyMatch(c -> c.toLowerCase().contains("nguyên liệu") || c.toLowerCase().contains("định lượng"))) {
                        continue;
                    }
                    String ingName = validCells.get(0);
                    String qtyStr = validCells.size() > 1 ? validCells.get(1) : "1 phần";
                    if (validCells.size() >= 3 && isQty(validCells.get(2))) {
                        ingName = validCells.get(1);
                        qtyStr = validCells.get(2);
                    }
                    ObjectNode ingNode = ingredients.addObject();
                    ingNode.put("name", cleanName(ingName));
                    ingNode.put("quantity", parseDoubleQty(qtyStr));
                    ingNode.put("unit", parseUnit(qtyStr));
                    ingNode.put("note", "");
                    continue;
                }

                // Regular bullet
                String ingClean = line.replaceAll("^[#\\*\\_~\\-\\•\\s\\d\\.\\)]+", "").trim();
                if (ingClean.length() >= 2 && !ingClean.toLowerCase().contains("chúc bạn")) {
                    String name = ingClean;
                    String qtyStr = "1 phần";
                    if (ingClean.contains(":")) {
                        String[] parts = ingClean.split(":", 2);
                        name = parts[0].trim();
                        qtyStr = parts[1].trim();
                    } else {
                        Pattern p = Pattern.compile("^(\\d+(?:[\\.,/]\\d+)?\\s*(?:kg|g|gr|gram|ml|l|lít|lit|quả|trái|củ|nhánh|cây|muỗng|thìa|bát|chén|gói|tép|lát)?)\\s+(.*)$", Pattern.CASE_INSENSITIVE);
                        Matcher m = p.matcher(ingClean);
                        if (m.matches()) {
                            qtyStr = m.group(1).trim();
                            name = m.group(2).trim();
                        }
                    }
                    ObjectNode ingNode = ingredients.addObject();
                    ingNode.put("name", cleanName(name));
                    ingNode.put("quantity", parseDoubleQty(qtyStr));
                    ingNode.put("unit", parseUnit(qtyStr));
                    ingNode.put("note", "");
                }
            }
        }

        root.put("title", title.isBlank() ? "Món ăn từ AI" : title);
        root.put("description", "Công thức được tự động tạo và lưu từ Trợ lý nấu ăn AI FoodX.");
        root.put("instructions", instructions.length() == 0 ? "Thực hiện theo các bước hướng dẫn." : instructions.toString());
        root.put("prepTime", 15);
        root.put("cookTime", 30);
        root.put("servings", 2);
        root.put("cuisine", "Việt Nam");
        root.put("category", "Món chính");
        root.put("difficulty", "Dễ");
        root.put("kcal", 500);
        root.set("ingredients", ingredients);
        return root;
    }

    private boolean isQty(String s) {
        if (s == null) return false;
        String l = s.toLowerCase();
        return l.matches(".*\\d+.*") || l.contains("vừa đủ") || l.contains("tùy thích");
    }

    private String cleanName(String name) {
        if (name == null) return "Nguyên liệu";
        return name.replaceAll("^[#\\*\\_~\\-\\•\\s\\/\\\\]+", "").replaceAll("[#\\*\\_~\\-\\•\\s\\/\\\\]+$", "").trim();
    }

    private double parseDoubleQty(String qty) {
        if (qty == null) return 1.0;
        Matcher m = Pattern.compile("(\\d+(?:\\.\\d+)?)").matcher(qty);
        if (m.find()) {
            try {
                return Double.parseDouble(m.group(1));
            } catch (Exception ignored) {}
        }
        return 1.0;
    }

    private String parseUnit(String qty) {
        if (qty == null || qty.isBlank()) return "phần";
        String clean = qty.replaceAll("^[\\d\\.,/\\s]+", "").trim();
        return clean.isBlank() ? "phần" : clean;
    }

    public List<String> parseIngredientNames(JsonNode recipeNode) {
        List<String> names = new ArrayList<>();
        if (recipeNode != null && recipeNode.has("ingredients") && recipeNode.get("ingredients").isArray()) {
            for (JsonNode item : recipeNode.get("ingredients")) {
                if (item.has("name")) {
                    names.add(item.get("name").asText());
                }
            }
        }
        return names;
    }
}
