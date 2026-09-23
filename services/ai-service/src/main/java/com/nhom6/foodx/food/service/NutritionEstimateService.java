package com.nhom6.foodx.food.service;

import com.nhom6.foodx.food.dto.NutritionEstimateResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * Dịch vụ tra cứu và ước tính dinh dưỡng (Calo, Protein, Carb, Chất béo)
 * tự động dựa trên tên nguyên liệu, số lượng và đơn vị (g, kg, lít, quả, củ...).
 */
@Slf4j
@Service
public class NutritionEstimateService {

    /**
     * Dữ liệu dinh dưỡng chuẩn tính trên 100g (hoặc 100ml).
     */
    private record FoodNutrition(
            double kcalPer100g,
            double proteinPer100g,
            double carbPer100g,
            double fatPer100g,
            String components,
            double defaultUnitGrams // Trọng lượng 1 đơn vị quả/củ/hộp/phần nếu dùng đơn vị đếm
    ) {}

    // Bảng dữ liệu dinh dưỡng chi tiết hơn 50+ nguyên liệu phổ biến
    private static final Map<String, FoodNutrition> NUTRITION_TABLE = Map.ofEntries(
            // --- THỊT ---
            Map.entry("uc-ga",       new FoodNutrition(165, 31.0,  0.0,  3.6, "Nhiều protein, ít béo, vitamin B6, phốt pho", 150)),
            Map.entry("thit-ga",      new FoodNutrition(239, 27.0,  0.0, 14.0, "Protein động vật, vitamin B12, kẽm", 150)),
            Map.entry("ga",           new FoodNutrition(239, 27.0,  0.0, 14.0, "Protein động vật, vitamin B12, kẽm", 150)),
            Map.entry("thit-bo",      new FoodNutrition(250, 26.0,  0.0, 15.0, "Protein cao, sắt, kẽm, vitamin B12", 150)),
            Map.entry("bo",           new FoodNutrition(250, 26.0,  0.0, 15.0, "Protein cao, sắt, kẽm, vitamin B12", 150)),
            Map.entry("thit-heo",     new FoodNutrition(242, 27.0,  0.0, 14.0, "Protein, thiamine (B1), phốt pho", 150)),
            Map.entry("thit-lon",     new FoodNutrition(242, 27.0,  0.0, 14.0, "Protein, thiamine (B1), phốt pho", 150)),
            Map.entry("thit-ba-chi",  new FoodNutrition(395, 14.0,  0.0, 37.0, "Nhiều chất béo, năng lượng cao", 150)),
            Map.entry("thit-vit",     new FoodNutrition(337, 19.0,  0.0, 28.0, "Protein, sắt, chất béo không bão hòa", 150)),

            // --- HẢI SẢN ---
            Map.entry("ca-hoi",       new FoodNutrition(208, 20.0,  0.0, 13.0, "Omega-3, protein chất lượng cao, vitamin D", 150)),
            Map.entry("ca-chep",      new FoodNutrition(127, 17.8,  0.0,  5.6, "Protein, Omega-3, phốt pho, canxi", 200)),
            Map.entry("ca-loc",       new FoodNutrition(97,  18.2,  0.0,  2.7, "Protein nạc, ít béo, dễ tiêu hóa", 200)),
            Map.entry("ca-ro",        new FoodNutrition(100, 19.1,  0.0,  2.6, "Protein, canxi, phốt pho", 100)),
            Map.entry("ca-tra",       new FoodNutrition(125, 15.0,  0.0,  7.0, "Omega-3, protein, chất béo lành mạnh", 150)),
            Map.entry("ca-basa",      new FoodNutrition(130, 15.5,  0.0,  7.5, "Omega-3, protein, DHA", 150)),
            Map.entry("ca-thu",       new FoodNutrition(205, 19.0,  0.0, 14.0, "Omega-3 cao, vitamin B12, selen", 150)),
            Map.entry("ca-ngu",       new FoodNutrition(132, 28.0,  0.0,  1.0, "Protein siêu nạc, vitamin B3, B12", 150)),
            Map.entry("tom",          new FoodNutrition(99,  24.0,  0.2,  0.3, "Protein cao, selen, iốt, astaxanthin", 20)),
            Map.entry("muc",          new FoodNutrition(92,  15.6,  3.1,  1.4, "Protein, đồng, selen, vitamin B2", 100)),
            Map.entry("cua",          new FoodNutrition(87,  17.5,  0.0,  1.3, "Protein, kẽm, canxi, magiê", 150)),
            Map.entry("ngheu",        new FoodNutrition(74,  12.8,  2.6,  1.0, "Sắt, vitamin B12, kẽm", 30)),
            Map.entry("so",           new FoodNutrition(80,  13.0,  3.0,  1.2, "Kẽm, sắt, protein", 30)),

            // --- TRỨNG / SỮA ---
            Map.entry("trung",        new FoodNutrition(143, 13.0,  0.7,  9.5, "Choline, protein toàn diện, vitamin B12", 50)),
            Map.entry("trung-ga",     new FoodNutrition(143, 13.0,  0.7,  9.5, "Choline, protein toàn diện, vitamin B12", 50)),
            Map.entry("trung-vit",    new FoodNutrition(185, 13.0,  1.5, 14.0, "Protein, chất béo, sắt, vitamin A", 70)),
            Map.entry("sua",          new FoodNutrition(65,   3.2,  4.8,  3.6, "Canxi, vitamin D, protein casein", 100)),
            Map.entry("sua-tuoi",     new FoodNutrition(65,   3.2,  4.8,  3.6, "Canxi, vitamin D, protein casein", 100)),
            Map.entry("sua-chua",     new FoodNutrition(61,   3.5,  4.7,  3.3, "Probiotics men vi sinh, canxi, protein", 100)),
            Map.entry("pho-mai",      new FoodNutrition(402, 25.0,  1.3, 33.0, "Canxi đậm đặc, protein, chất béo", 30)),
            Map.entry("bo-thuc-vat",  new FoodNutrition(717,  0.9,  0.1, 81.0, "Chất béo bão hòa, năng lượng cao", 15)),

            // --- RAU CỦ QUẢ ---
            Map.entry("rau-muong",    new FoodNutrition(19,   3.2,  2.1,  0.3, "Chất xơ, sắt, vitamin A, vitamin C", 100)),
            Map.entry("rau-cai",      new FoodNutrition(16,   1.5,  2.2,  0.2, "Vitamin C, vitamin K, chất xơ", 100)),
            Map.entry("rau-cai-xanh", new FoodNutrition(16,   1.5,  2.2,  0.2, "Vitamin C, vitamin K, chất xơ", 100)),
            Map.entry("rau-ngot",     new FoodNutrition(35,   5.3,  3.4,  0.0, "Chất đạm thực vật, canxi, vitamin C", 100)),
            Map.entry("rau-xanh",     new FoodNutrition(20,   2.0,  3.0,  0.3, "Chất xơ, vitamin tổng hợp, khoáng chất", 100)),
            Map.entry("bong-cai",     new FoodNutrition(34,   2.8,  6.6,  0.4, "Sulforaphane chống oxy hóa, vitamin C, K", 150)),
            Map.entry("sup-lo",       new FoodNutrition(34,   2.8,  6.6,  0.4, "Sulforaphane chống oxy hóa, vitamin C, K", 150)),
            Map.entry("ca-chua",      new FoodNutrition(18,   0.9,  3.9,  0.2, "Lycopene chống oxy hóa, vitamin C, kali", 80)),
            Map.entry("ca-rot",       new FoodNutrition(41,   0.9,  9.6,  0.2, "Beta-carotene (tiền vitamin A), chất xơ", 100)),
            Map.entry("khoai-tay",    new FoodNutrition(77,   2.0, 17.5,  0.1, "Carb phức tạp, kali, vitamin B6", 120)),
            Map.entry("khoai-lang",   new FoodNutrition(86,   1.6, 20.0,  0.1, "Chất xơ hòa tan, vitamin A, chỉ số GI thấp", 150)),
            Map.entry("khoai-mon",    new FoodNutrition(112,  1.5, 26.5,  0.2, "Chất xơ, vitamin E, mangan", 150)),
            Map.entry("bi-do",        new FoodNutrition(26,   1.0,  6.5,  0.1, "Vitamin A, lutein, zeaxanthin", 200)),
            Map.entry("bi-xanh",      new FoodNutrition(14,   0.4,  3.0,  0.1, "Nước, thanh nhiệt, kali", 200)),
            Map.entry("muop",         new FoodNutrition(16,   0.9,  3.2,  0.1, "Chất xơ, vitamin C, vị ngọt tự nhiên", 150)),
            Map.entry("dau-bap",      new FoodNutrition(33,   1.9,  7.5,  0.2, "Chất nhầy tốt dạ dày, folate, chất xơ", 30)),
            Map.entry("dau-dua",      new FoodNutrition(47,   2.8,  8.0,  0.4, "Protein thực vật, chất xơ, vitamin C", 50)),
            Map.entry("hanh-tim",     new FoodNutrition(40,   1.1,  9.3,  0.1, "Quercetin, allicin, kháng viêm", 20)),
            Map.entry("hanh-tay",     new FoodNutrition(40,   1.1,  9.3,  0.1, "Chất chống oxy hóa, prebiotic", 150)),
            Map.entry("hanh-la",      new FoodNutrition(32,   1.8,  7.3,  0.2, "Vitamin K, vitamin C", 20)),
            Map.entry("toi",          new FoodNutrition(149,  6.4, 33.0,  0.5, "Allicin kháng khuẩn, tăng đề kháng", 10)),
            Map.entry("gung",         new FoodNutrition(80,   1.8, 17.8,  0.8, "Gingerol ấm bụng, kháng viêm", 30)),
            Map.entry("ot",           new FoodNutrition(40,   1.9,  8.8,  0.4, "Capsaicin sinh nhiệt, vitamin C cao", 10)),

            // --- TINH BỘT / ĐẬU ---
            Map.entry("com",          new FoodNutrition(130,  2.7, 28.2,  0.3, "Carbohydrate cung cấp năng lượng chính", 150)),
            Map.entry("com-nguoi",    new FoodNutrition(130,  2.7, 28.2,  0.3, "Carbohydrate, tinh bột kháng tiêu hóa tốt", 150)),
            Map.entry("com-trang",    new FoodNutrition(130,  2.7, 28.2,  0.3, "Carbohydrate cung cấp năng lượng chính", 150)),
            Map.entry("gao",          new FoodNutrition(360,  7.5, 78.0,  0.7, "Năng lượng tinh bột đậm đặc, vitamin B1", 100)),
            Map.entry("bun",          new FoodNutrition(110,  1.7, 25.0,  0.2, "Carbohydrate tiêu hóa nhanh", 150)),
            Map.entry("banh-pho",     new FoodNutrition(120,  2.0, 27.0,  0.2, "Carbohydrate, năng lượng", 150)),
            Map.entry("banh-mi",      new FoodNutrition(265,  9.0, 49.0,  3.2, "Carb, protein lúa mì, năng lượng nhanh", 80)),
            Map.entry("mien",         new FoodNutrition(332,  0.7, 82.0,  0.2, "Tinh bột dong/đậu xanh không gluten", 50)),
            Map.entry("dau-hu",       new FoodNutrition(76,   8.0,  1.9,  4.8, "Isoflavone đậu nành, canxi, đạm thực vật", 150)),
            Map.entry("dau-phu",      new FoodNutrition(76,   8.0,  1.9,  4.8, "Isoflavone đậu nành, canxi, đạm thực vật", 150)),
            Map.entry("dau-xanh",     new FoodNutrition(347, 24.0, 63.0,  1.2, "Protein thực vật cao, chất xơ, kali", 100)),
            Map.entry("dau-phong",    new FoodNutrition(567, 25.8, 16.1, 49.2, "Chất béo tốt, protein, magie, vitamin E", 50)),
            Map.entry("dau-den",      new FoodNutrition(343, 21.6, 62.4,  1.4, "Chất xơ, anthocyanin chống oxy hóa", 100)),

            // --- TRÁI CÂY ---
            Map.entry("qua-bo",       new FoodNutrition(160,  2.0,  8.5, 14.7, "Chất béo không bão hòa đơn, kali, vitamin E", 150)),
            Map.entry("trai-bo",      new FoodNutrition(160,  2.0,  8.5, 14.7, "Chất béo không bão hòa đơn, kali, vitamin E", 150)),
            Map.entry("chuoi",        new FoodNutrition(89,   1.1, 22.8,  0.3, "Kali, vitamin B6, năng lượng tức thì", 110)),
            Map.entry("tao",          new FoodNutrition(52,   0.3, 13.8,  0.2, "Pectin (chất xơ hòa tan), vitamin C", 150)),
            Map.entry("cam",          new FoodNutrition(47,   0.9, 11.8,  0.1, "Vitamin C cao, flavonoid, chất xơ", 180)),
            Map.entry("xoai",         new FoodNutrition(60,   0.8, 15.0,  0.4, "Vitamin A, C, men tiêu hóa amylase", 200)),
            Map.entry("du-du",        new FoodNutrition(43,   0.5, 10.8,  0.3, "Enzyme papain tiêu hóa đạm, vitamin C", 250)),
            Map.entry("dua-hau",      new FoodNutrition(30,   0.6,  7.6,  0.2, "Nước (92%), citrulline, lycopene", 300)),
            Map.entry("oi",           new FoodNutrition(68,   2.6, 14.3,  1.0, "Vitamin C cực cao, chất xơ ruột non", 150))
    );

    /**
     * Ước tính dinh dưỡng theo tên thực phẩm, số lượng và đơn vị.
     */
    public NutritionEstimateResponse estimate(String rawName, Double rawQuantity, String rawUnit) {
        if (rawName == null || rawName.isBlank()) {
            return new NutritionEstimateResponse(0.0, 0.0, 0.0, 0.0, "Cân bằng", "", "Chưa có tên");
        }

        double quantity = (rawQuantity == null || rawQuantity <= 0) ? 100.0 : rawQuantity;
        String unit = (rawUnit == null || rawUnit.isBlank()) ? "g" : rawUnit.trim().toLowerCase(Locale.ROOT);
        String slug = toSlug(rawName);

        // 1. Tìm thông tin 100g của nguyên liệu
        FoodNutrition fn = findNutrition(slug);

        // 2. Tính hệ số nhân (multiplier theo 100g cơ sở)
        double multiplier = calculateMultiplier(unit, quantity, fn.defaultUnitGrams());

        // 3. Tính dinh dưỡng tổng
        double totalKcal = Math.round((fn.kcalPer100g() * multiplier) * 10.0) / 10.0;
        double totalProtein = Math.round((fn.proteinPer100g() * multiplier) * 10.0) / 10.0;
        double totalCarb = Math.round((fn.carbPer100g() * multiplier) * 10.0) / 10.0;
        double totalFat = Math.round((fn.fatPer100g() * multiplier) * 10.0) / 10.0;

        // Làm tròn Kcal đẹp (số nguyên)
        double roundedKcal = Math.round(totalKcal);

        // 4. Xác định mục tiêu phù hợp
        String benefit = determineBenefit(totalKcal, totalProtein, totalFat, totalCarb);

        String basisNote = String.format("Tính toán tự động cho %.1f %s %s", quantity, unit, rawName.trim());

        return new NutritionEstimateResponse(
                roundedKcal,
                totalProtein,
                totalCarb,
                totalFat,
                benefit,
                fn.components(),
                basisNote
        );
    }

    private FoodNutrition findNutrition(String slug) {
        // 1. Tìm chính xác
        if (NUTRITION_TABLE.containsKey(slug)) {
            return NUTRITION_TABLE.get(slug);
        }

        // 2. Tìm theo từ khóa chứa trong slug
        for (Map.Entry<String, FoodNutrition> entry : NUTRITION_TABLE.entrySet()) {
            String key = entry.getKey();
            if (slug.contains(key) || key.contains(slug)) {
                return entry.getValue();
            }
        }

        // 3. Phân loại tổng quát theo nhóm (Fallback thông minh)
        if (slug.contains("ca-") || slug.contains("tom") || slug.contains("muc") || slug.contains("hai-san")) {
            return new FoodNutrition(120, 20.0, 0.0, 4.0, "Protein hải sản, ít chất béo", 150);
        }
        if (slug.contains("thit") || slug.contains("ga") || slug.contains("bo") || slug.contains("heo")) {
            return new FoodNutrition(220, 25.0, 0.0, 13.0, "Protein động vật, vitamin B", 150);
        }
        if (slug.contains("rau") || slug.contains("cai") || slug.contains("la")) {
            return new FoodNutrition(25, 2.0, 4.0, 0.3, "Chất xơ, vitamin và khoáng chất", 100);
        }
        if (slug.contains("khoai") || slug.contains("cu") || slug.contains("bi-")) {
            return new FoodNutrition(75, 1.5, 17.0, 0.2, "Carbohydrate phức hợp, chất xơ", 120);
        }
        if (slug.contains("qua") || slug.contains("trai") || slug.contains("trai-cay")) {
            return new FoodNutrition(55, 0.8, 13.0, 0.3, "Đường tự nhiên, vitamin C, chất xơ", 150);
        }
        if (slug.contains("banh") || slug.contains("mi") || slug.contains("chao")) {
            return new FoodNutrition(180, 5.0, 35.0, 2.0, "Tinh bột năng lượng", 150);
        }

        // Fallback mặc định
        return new FoodNutrition(100, 5.0, 15.0, 2.0, "Dinh dưỡng cân bằng", 100);
    }

    private double calculateMultiplier(String unit, double quantity, double defaultUnitGrams) {
        String u = unit.toLowerCase(Locale.ROOT);
        return switch (u) {
            case "g", "gram", "gr" -> quantity / 100.0;
            case "kg", "kilogram" -> (quantity * 1000.0) / 100.0;
            case "lít", "lit", "l", "liter" -> (quantity * 1000.0) / 100.0;
            case "ml", "mililit" -> quantity / 100.0;
            case "quả", "qua", "trái", "trai" -> (quantity * defaultUnitGrams) / 100.0;
            case "củ", "cu" -> (quantity * Math.max(80.0, defaultUnitGrams)) / 100.0;
            case "hộp", "hop" -> (quantity * 120.0) / 100.0;
            case "phần", "phan", "bát", "bat", "dĩa", "dia" -> (quantity * 150.0) / 100.0;
            default -> (quantity * defaultUnitGrams) / 100.0;
        };
    }

    private String determineBenefit(double kcal, double protein, double fat, double carb) {
        if (protein >= 20.0) return "Tăng cơ";
        if (fat >= 15.0 || kcal >= 350.0) return "Tăng cân";
        if (kcal <= 50.0 && carb <= 10.0) return "Giảm cân";
        return "Cân bằng";
    }

    private String toSlug(String input) {
        if (input == null) return "";
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        String noAccents  = Pattern.compile("\\p{InCombiningDiacriticalMarks}+")
                .matcher(normalized).replaceAll("")
                .replace("đ", "d").replace("Đ", "D");
        return noAccents.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-+|-+$", "");
    }
}
