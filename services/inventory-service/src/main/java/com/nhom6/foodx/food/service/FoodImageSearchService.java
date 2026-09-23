package com.nhom6.foodx.food.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * Tự động tìm kiếm ảnh thực phẩm/món ăn trên mạng (Wikipedia) và tải về
 * lưu trực tiếp vào Source Code static assets.
 *
 * <p>Thứ tự tìm kiếm:
 * <ol>
 *   <li>File đã có sẵn trên đĩa → trả về ngay, không tải lại.</li>
 *   <li>Khớp chính xác với set ảnh mặc định (trứng, cá hồi, ...) → trả về luôn.</li>
 *   <li>Tra cứu trang Wikipedia Tiếng Việt theo tên chính xác (prop=pageimages,
 *       lấy ảnh đại diện bài viết – chính xác nhất).</li>
 *   <li>Tìm kiếm toàn văn Wikipedia Tiếng Việt (generator=search).</li>
 *   <li>Tìm kiếm Wikimedia Commons (generator=search).</li>
 *   <li>Trả về placeholder nếu không tìm được.</li>
 * </ol>
 * </p>
 */
@Slf4j
@Service
public class FoodImageSearchService {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private static final String USER_AGENT =
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

    private static final String SRC_IMG_DIR  = "src/main/resources/static/images/foods";
    private static final String TARGET_IMG_DIR = "target/classes/static/images/foods";
    private static final String PLACEHOLDER = "/images/placeholder.jpg";

    // Danh sách tên slug CHÍNH XÁC đã có ảnh mặc định sẵn
    private static final Set<String> EXACT_BASIC_SLUGS = Set.of(
            "egg", "trung", "trung-ga", "trung-vit",
            "chicken", "uc-ga", "thit-ga",
            "beef", "thit-bo",
            "pork", "thit-heo", "thit-lon",
            "salmon", "ca-hoi",
            "shrimp", "tom", "tom-tuoi",
            "tomato", "ca-chua",
            "broccoli", "bong-cai-xanh", "sup-lo",
            "carrot", "ca-rot",
            "potato", "khoai-tay",
            "shallot", "hanh-tim",
            "garlic", "toi",
            "ginger", "gung",
            "milk", "sua", "sua-tuoi",
            "yogurt", "sua-chua",
            "avocado", "qua-bo", "trai-bo",
            "banana", "chuoi",
            "rice", "com", "com-trang", "com-nguoi", "gao",
            "tofu", "dau-hu", "dau-phu",
            "cheese", "pho-mai"
    );

    // Map slug không dấu → tên tiếng Việt đầy đủ để tra Wikipedia chính xác
    private static final Map<String, String> SLUG_TO_VIET_NAME = Map.ofEntries(
            // Rau củ
            Map.entry("rau-muong",       "Rau muống"),
            Map.entry("rau-muong-nuoc",  "Rau muống"),
            Map.entry("rau-cai",         "Cải xanh"),
            Map.entry("rau-cai-xanh",    "Cải xanh"),
            Map.entry("rau-xanh",        "Rau xanh"),
            Map.entry("khoai-lang",      "Khoai lang"),
            Map.entry("khoai-mon",       "Khoai môn"),
            Map.entry("khoai-tay",       "Khoai tây"),
            Map.entry("sup-lo",          "Bông cải"),
            Map.entry("ca-chua",         "Cà chua"),
            Map.entry("ca-rot",          "Cà rốt"),
            Map.entry("hanh-tay",        "Hành tây"),
            Map.entry("hanh-tim",        "Hành tím"),
            Map.entry("hanh-la",         "Hành lá"),
            Map.entry("toi",             "Tỏi"),
            Map.entry("gung",            "Gừng"),
            Map.entry("sa",              "Sả"),
            Map.entry("ot",              "Ớt"),
            Map.entry("ot-do",           "Ớt đỏ"),
            Map.entry("ot-xanh",         "Ớt xanh"),
            Map.entry("cu-cai",          "Củ cải"),
            Map.entry("bau",             "Bầu"),
            Map.entry("bi-do",           "Bí đỏ"),
            Map.entry("bi-xanh",         "Bí xanh"),
            Map.entry("muop",            "Mướp"),
            Map.entry("dau-dua",         "Đậu đũa"),
            Map.entry("dau-bap",         "Đậu bắp"),
            // Thịt / hải sản
            Map.entry("thit-ga",         "Thịt gà"),
            Map.entry("thit-bo",         "Thịt bò"),
            Map.entry("thit-heo",        "Thịt lợn"),
            Map.entry("thit-lon",        "Thịt lợn"),
            Map.entry("ca-hoi",          "Cá hồi"),
            Map.entry("ca-chep",         "Cá chép"),
            Map.entry("ca-ro",           "Cá rô"),
            Map.entry("ca-tra",          "Cá tra"),
            Map.entry("ca-loc",          "Cá lóc"),
            Map.entry("ca-basa",         "Cá ba sa"),
            Map.entry("ca-thu",          "Cá thu"),
            Map.entry("ca-ngua",         "Cá ngừ"),
            Map.entry("ca-ngu",          "Cá ngừ"),
            Map.entry("tom",             "Tôm"),
            Map.entry("muc",             "Mực"),
            Map.entry("cua",             "Cua"),
            Map.entry("ngheu",           "Nghêu"),
            Map.entry("so",              "Sò"),
            // Trứng / sữa
            Map.entry("trung",           "Trứng gà"),
            Map.entry("trung-ga",        "Trứng gà"),
            Map.entry("trung-vit",       "Trứng vịt"),
            Map.entry("sua",             "Sữa"),
            Map.entry("sua-tuoi",        "Sữa tươi"),
            Map.entry("sua-chua",        "Sữa chua"),
            Map.entry("pho-mai",         "Phô mai"),
            // Tinh bột / gạo
            Map.entry("gao",             "Gạo"),
            Map.entry("com",             "Cơm trắng"),          // "Cơm" chung → rice
            Map.entry("com-trang",       "Cơm trắng"),
            Map.entry("com-nguoi",       "Cơm trắng"),          // tránh Wikipedia trả chuồn chuồn "Cơm nguội"
            Map.entry("com-chien",       "Cơm chiên"),
            Map.entry("bun",             "Bún"),

            Map.entry("banh-pho",        "Bánh phở"),
            Map.entry("banh-mi",         "Bánh mì"),
            Map.entry("mien",            "Miến"),
            Map.entry("mien-dong",       "Miến dong"),
            // Trái cây
            Map.entry("chuoi",           "Chuối"),
            Map.entry("trai-bo",         "Bơ (quả)"),
            Map.entry("qua-bo",          "Bơ (quả)"),
            Map.entry("xoai",            "Xoài"),
            Map.entry("du-du",           "Đu đủ"),
            Map.entry("com-dua",         "Cùi dừa"),
            // Đậu / khác
            Map.entry("dau-hu",          "Đậu hũ"),
            Map.entry("dau-phu",         "Đậu phụ"),
            Map.entry("dau-xanh",        "Đậu xanh"),
            Map.entry("dau-phong",       "Đậu phộng"),
            Map.entry("vung",            "Vừng")
    );

    // Nhãn ảnh không phải thực phẩm cần loại bỏ (biểu tượng, bản đồ, logo...)
    private static final List<String> IMAGE_BLOCKLIST = List.of(
            ".svg", "logo", "icon", "_map", "flag", "symbol",
            "diagram", "chart", "coat_of_arms", "emblem", "nuvola",
            "commons-logo", "OOjs_UI"
    );


    // -----------------------------------------------------------------------
    //  Public API
    // -----------------------------------------------------------------------

    public String findOrDownloadImage(String rawFoodName) {
        if (rawFoodName == null || rawFoodName.isBlank()) return PLACEHOLDER;

        String cleanName = rawFoodName.trim();
        String slug      = toSlug(cleanName);
        String relPath   = "/images/foods/" + slug + ".jpg";

        // 1. File đã có sẵn
        Path srcFile = Paths.get(SRC_IMG_DIR, slug + ".jpg");
        if (Files.exists(srcFile)) {
            syncToTarget(srcFile, slug + ".jpg");
            return relPath;
        }

        // 2. Khớp ảnh mặc định chính xác
        String basic = matchExactBasicImage(slug);
        if (basic != null) return basic;

        // 3. Tìm kiếm tự động từ Wikipedia
        try {
            log.info("🔍 Tìm ảnh cho: '{}' (slug: '{}')", cleanName, slug);
            String url = searchImageUrl(cleanName, slug);

            if (url != null) {
                downloadAndSaveImage(url, slug + ".jpg");
                log.info("✅ Đã lưu ảnh: {}", relPath);
                return relPath;
            } else {
                log.warn("⚠️ Không tìm được ảnh nào trên mạng cho: '{}'", cleanName);
            }
        } catch (Exception e) {
            log.warn("⚠️ Lỗi tải ảnh cho '{}': {} - {}", cleanName, e.getClass().getSimpleName(), e.getMessage());
        }

        return PLACEHOLDER;
    }

    // -----------------------------------------------------------------------
    //  Search logic (4 chiến lược)
    // -----------------------------------------------------------------------

    private String searchImageUrl(String rawQuery, String slug) {
        // Ưu tiên dùng tên tiếng Việt đúng dấu từ map (chính xác nhất khi tra Wikipedia)
        String query = SLUG_TO_VIET_NAME.getOrDefault(slug, rawQuery);
        String encoded = URLEncoder.encode(query, StandardCharsets.UTF_8);
        log.debug("  → Wikipedia query: '{}'", query);

        // Chiến lược 1: Tra cứu trang Wikipedia chính xác theo tên (pageimages của bài viết)
        String img = fetchPageImage("https://vi.wikipedia.org/w/api.php?action=query&format=json"
                + "&prop=pageimages&titles=" + encoded
                + "&piprop=thumbnail&pithumbsize=800");
        if (img != null) return img;

        // Chiến lược 2: Tìm kiếm toàn văn Wikipedia Tiếng Việt, lấy bài tốt nhất
        img = fetchFirstSearchResult("https://vi.wikipedia.org/w/api.php?action=query&format=json"
                + "&prop=pageimages&generator=search&gsrsearch=" + encoded
                + "&piprop=thumbnail&pithumbsize=800&gsrlimit=5");
        if (img != null) return img;

        // Chiến lược 3: Wikipedia Tiếng Anh (fallback cho tên quốc tế / tên đã là tiếng Anh)
        String encodedRaw = URLEncoder.encode(rawQuery, StandardCharsets.UTF_8);
        img = fetchPageImage("https://en.wikipedia.org/w/api.php?action=query&format=json"
                + "&prop=pageimages&titles=" + encodedRaw
                + "&piprop=thumbnail&pithumbsize=800");
        if (img != null) return img;

        // Chiến lược 4: Wikimedia Commons tìm kiếm toàn văn
        img = fetchFirstSearchResult("https://commons.wikimedia.org/w/api.php?action=query&format=json"
                + "&prop=pageimages&generator=search&gsrsearch=" + encoded + "%20food"
                + "&piprop=thumbnail&pithumbsize=800&gsrlimit=5");
        return img;
    }

    /** Lấy ảnh từ bài Wikipedia có tên chính xác (prop=pageimages). */
    private String fetchPageImage(String apiUrl) {
        try {
            JsonNode root = httpGet(apiUrl);
            if (root == null) return null;
            JsonNode pages = root.path("query").path("pages");
            for (JsonNode page : pages) {
                if (page.has("missing")) continue;
                JsonNode src = page.path("thumbnail").path("source");
                if (src.isTextual() && isGoodImage(src.asText())) {
                    return src.asText();
                }
            }
        } catch (Exception e) {
            log.debug("fetchPageImage failed for {}: {}", apiUrl, e.getMessage());
        }
        return null;
    }

    /**
     * Tìm kiếm toàn văn (generator=search) và lọc bỏ ảnh xấu.
     * Ưu tiên bài viết có thứ hạng tìm kiếm cao nhất (index thấp nhất).
     */
    private String fetchFirstSearchResult(String apiUrl) {
        try {
            JsonNode root = httpGet(apiUrl);
            if (root == null) return null;
            JsonNode pages = root.path("query").path("pages");

            String best = null;
            int bestIndex = Integer.MAX_VALUE;
            for (JsonNode page : pages) {
                if (page.has("missing")) continue;
                int idx = page.path("index").asInt(Integer.MAX_VALUE);
                JsonNode thumb = page.path("thumbnail");
                JsonNode src   = thumb.path("source");
                if (src.isTextual() && isGoodImage(src.asText()) && idx < bestIndex) {
                    best      = src.asText();
                    bestIndex = idx;
                }
            }
            return best;
        } catch (Exception e) {
            log.debug("fetchFirstSearchResult failed for {}: {}", apiUrl, e.getMessage());
        }
        return null;
    }

    // -----------------------------------------------------------------------
    //  HTTP helpers
    // -----------------------------------------------------------------------

    private JsonNode httpGet(String apiUrl) throws Exception {
        HttpURLConnection conn = (HttpURLConnection) URI.create(apiUrl).toURL().openConnection();
        conn.setRequestMethod("GET");
        conn.setRequestProperty("User-Agent", USER_AGENT);
        conn.setConnectTimeout(5000);
        conn.setReadTimeout(5000);
        if (conn.getResponseCode() != 200) return null;
        try (InputStream is = conn.getInputStream()) {
            return objectMapper.readTree(is);
        }
    }

    private void downloadAndSaveImage(String imageUrl, String fileName) throws Exception {
        HttpURLConnection conn = (HttpURLConnection) URI.create(imageUrl).toURL().openConnection();
        conn.setRequestMethod("GET");
        conn.setRequestProperty("User-Agent", USER_AGENT);
        conn.setConnectTimeout(8000);
        conn.setReadTimeout(8000);
        if (conn.getResponseCode() != 200) {
            throw new RuntimeException("HTTP " + conn.getResponseCode() + " cho: " + imageUrl);
        }
        Path srcPath = Paths.get(SRC_IMG_DIR, fileName);
        Files.createDirectories(srcPath.getParent());
        try (InputStream in = conn.getInputStream()) {
            Files.copy(in, srcPath, StandardCopyOption.REPLACE_EXISTING);
        }
        syncToTarget(srcPath, fileName);
    }

    private void syncToTarget(Path srcPath, String fileName) {
        try {
            if (!Files.exists(Paths.get("target/classes"))) return;
            Path targetPath = Paths.get(TARGET_IMG_DIR, fileName);
            Files.createDirectories(targetPath.getParent());
            Files.copy(srcPath, targetPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (Exception e) {
            log.debug("syncToTarget warning: {}", e.getMessage());
        }
    }

    // -----------------------------------------------------------------------
    //  Helpers
    // -----------------------------------------------------------------------

    /** Lọc ảnh không phù hợp (biểu tượng SVG, bản đồ, logo...). */
    private boolean isGoodImage(String url) {
        String lower = url.toLowerCase(Locale.ROOT);
        for (String blocked : IMAGE_BLOCKLIST) {
            if (lower.contains(blocked)) return false;
        }
        return true;
    }

    private String matchExactBasicImage(String slug) {
        if (!EXACT_BASIC_SLUGS.contains(slug)) return null;
        if (slug.contains("trung")) return "/images/foods/egg.jpg";
        if (slug.equals("ga") || slug.contains("uc-ga") || slug.contains("thit-ga")) return "/images/foods/chicken.jpg";
        if (slug.equals("bo") || slug.contains("thit-bo")) return "/images/foods/beef.jpg";
        if (slug.contains("heo") || slug.contains("lon")) return "/images/foods/pork.jpg";
        if (slug.contains("ca-hoi")) return "/images/foods/salmon.jpg";
        if (slug.equals("tom") || slug.contains("tom-tuoi")) return "/images/foods/shrimp.jpg";
        if (slug.contains("ca-chua")) return "/images/foods/tomato.jpg";
        if (slug.contains("bong-cai") || slug.contains("sup-lo")) return "/images/foods/broccoli.jpg";
        if (slug.contains("ca-rot")) return "/images/foods/carrot.jpg";
        if (slug.contains("khoai-tay")) return "/images/foods/potato.jpg";
        if (slug.contains("hanh-tim")) return "/images/foods/shallot.jpg";
        if (slug.equals("toi")) return "/images/foods/garlic.jpg";
        if (slug.equals("gung")) return "/images/foods/ginger.jpg";
        if (slug.contains("sua-chua")) return "/images/foods/yogurt.jpg";
        if (slug.equals("sua") || slug.contains("sua-tuoi")) return "/images/foods/milk.jpg";
        if (slug.contains("qua-bo") || slug.contains("trai-bo")) return "/images/foods/avocado.jpg";
        if (slug.equals("chuoi")) return "/images/foods/banana.jpg";
        if (slug.contains("com") || slug.equals("gao")) return "/images/foods/rice.jpg";
        if (slug.contains("dau-hu") || slug.contains("dau-phu")) return "/images/foods/tofu.jpg";
        if (slug.contains("pho-mai")) return "/images/foods/cheese.jpg";
        return null;
    }

    public static String toSlug(String input) {
        if (input == null) return "food";
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        String noAccents  = Pattern.compile("\\p{InCombiningDiacriticalMarks}+")
                .matcher(normalized).replaceAll("")
                .replace("đ", "d").replace("Đ", "D");
        return noAccents.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-+|-+$", "");
    }
}
