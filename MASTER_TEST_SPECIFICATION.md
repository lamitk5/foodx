# BẢNG ĐẶC TẢ TỔNG THỂ TOÀN BỘ KỊCH BẢN KIỂM THỬ DỰ ÁN FOODX
## (MASTER TEST SUITE SPECIFICATION - 500 SCENARIOS)

- **Hệ thống**: FoodX — Smart Kitchen & Meal Planner
- **Phạm vi kiểm thử**: Toàn bộ 7 Microservices Backend + API Gateway + Giao diện Frontend SPA + Bảo mật + Hiệu năng
- **Tổng số kịch bản**: 500 Test Cases (260 Backend + 180 Frontend + 60 Bảo mật & Hiệu năng)
- **Mức độ ưu tiên**: P1 (Critical - 180 TCs), P2 (High - 220 TCs), P3 (Medium/Low - 100 TCs)

---

## TỔNG QUAN PHÂN BỔ 12 PHÂN HỆ KIỂM THỬ

| Phân hệ (Suite) | Tên phân hệ | Backend | Frontend | Tổng TCs | Ưu tiên |
| :---: | :--- | :---: | :---: | :---: | :---: |
| **Suite 01** | Authentication & User Profile Management | 30 | 20 | **50** | P1 |
| **Suite 02** | API Gateway, Routing, Rate Limit & Static Web | 25 | 15 | **40** | P1 |
| **Suite 03** | Smart Fridge Management (CRUD, Batch, Expiry) | 35 | 25 | **60** | P1 |
| **Suite 04** | AI Vision Multimodal Scanner (Hóa đơn & Tủ lạnh) | 25 | 20 | **45** | P1 |
| **Suite 05** | Recipe Discovery & Smart Ingredient Matching | 30 | 20 | **50** | P1 |
| **Suite 06** | Hands-Free Cooking Mode & Step-by-Step Timer | 12 | 18 | **30** | P2 |
| **Suite 07** | Weekly Meal Planner & Smart Grocery List | 25 | 20 | **45** | P2 |
| **Suite 08** | Virtual Chef AI Chatbot & Contextual Guidance | 22 | 18 | **40** | P2 |
| **Suite 09** | Social Community Feed, Recipes Sharing & Comments | 20 | 15 | **35** | P2 |
| **Suite 10** | Nutrition Tracking, BMI & Waste Reduction Analytics | 20 | 15 | **35** | P2 |
| **Suite 11** | Security, Vulnerability & Penetration Testing | 30 | 10 | **40** | P1 |
| **Suite 12** | Responsive UI, PWA Offline & Cross-Browser UX | 6 | 24 | **30** | P2 |
| **TỔNG** | **TOÀN BỘ HỆ THỐNG FOODX** | **260** | **240** | **500** | **P1-P3** |

---

## CHI TIẾT CÁC PHÂN HỆ VÀ KỊCH BẢN KIỂM THỬ

### SUITE 01: AUTHENTICATION & USER MANAGEMENT (50 TCs: TC_AUTH_001 -> TC_AUTH_050)
- **Đăng ký tài khoản (TC_AUTH_001 -> TC_AUTH_012)**:
  - Kiểm tra đăng ký thành công với dữ liệu hợp lệ (username, email, password, fullName).
  - Bắt lỗi trùng username (HTTP 409 Conflict).
  - Bắt lỗi trùng email.
  - Bắt lỗi định dạng email sai chuẩn RFC (thiếu @, thiếu domain, chứa dấu cách).
  - Bắt lỗi mật khẩu rỗng, mật khẩu < 6 ký tự.
  - Bắt lỗi tên hiển thị chứa mã HTML / Script độc hại (XSS sanitization).
  - Kiểm tra mật khẩu lưu trong CSDL được băm an toàn bằng BCrypt (không lưu plain-text).
  - Kiểm tra role mặc định gán cho tài khoản mới (`ROLE_USER`).
  - Đăng ký trên giao diện: hiển thị loading trên nút, thông báo thành công và tự động chuyển sang form đăng nhập.
  - Đăng ký trên giao diện: hiển thị cảnh báo lỗi inline khi dữ liệu không hợp lệ.
- **Đăng nhập & Quản lý Phiên (TC_AUTH_013 -> TC_AUTH_028)**:
  - Đăng nhập đúng username/password nhận mã 200 OK và JWT access token.
  - Đăng nhập sai mật khẩu nhận mã 401 Unauthorized và thông báo lỗi rõ ràng.
  - Đăng nhập tài khoản không tồn tại nhận mã 401 Unauthorized.
  - Chống tấn công brute-force mật khẩu (Rate limiting trên `/api/auth/login`).
  - Chống tấn công SQL Injection trên trường username (`' OR '1'='1' --`).
  - Payload đăng nhập rỗng hoặc thiếu trường trả về 400 Bad Request.
  - Lưu trữ JWT an toàn trong `localStorage` (`foodx_token`).
  - Giao diện cập nhật avatar và tên người dùng ngay sau khi đăng nhập thành công.
  - Đăng xuất (`logout`): xóa token khỏi `localStorage`, reset phiên chat và giỏ hàng.
  - Tự động đăng xuất và điều hướng khi token hết hạn hoặc nhận mã 401 từ backend.
- **JWT Token & Security Context (TC_AUTH_029 -> TC_AUTH_038)**:
  - Cấu trúc JWT chứa đầy đủ claims (`sub`, `roles`, `iat`, `exp`).
  - Backend từ chối token bị giả mạo chữ ký (SignatureException).
  - Backend từ chối token hết hạn (ExpiredJwtException).
  - Backend xử lý an toàn khi header `Authorization` thiếu prefix `Bearer `.
  - Backend xử lý an toàn khi header `Authorization` rỗng hoặc chứa ký tự nhị phân.
  - `JwtAuthenticationFilter` nạp đúng `UserDetails` vào `SecurityContextHolder`.
  - Phân quyền endpoint theo role (`ROLE_USER`, `ROLE_ADMIN`).
- **Hồ sơ Cá nhân & Sức khỏe Onboarding (TC_AUTH_039 -> TC_AUTH_050)**:
  - GET `/api/profile`: lấy thông tin hồ sơ của user hiện tại.
  - PUT `/api/profile`: cập nhật chiều cao, cân nặng, độ tuổi, giới tính, mức độ vận động.
  - Tính toán chỉ số BMI tự động từ chiều cao và cân nặng theo chuẩn y khoa.
  - Tính toán lượng calo khuyến nghị hàng ngày (TDEE / BMR formula).
  - Lưu tùy chọn chế độ ăn (Ăn chay, Thuần chay, Keto, Eat Clean, Không dị ứng hải sản/đậu phộng).
  - Lưu danh sách thiết bị bếp sở hữu (Nồi chiên không dầu, Lò vi sóng, Nồi áp suất...).
  - Upload avatar ảnh cá nhân (kiểm tra định dạng JPG/PNG, giới hạn dung lượng 5MB).
  - Wizard onboarding 3 bước hiển thị đầy đủ và lưu trữ trạng thái hoàn thành.

---

### SUITE 02: API GATEWAY, ROUTING & RATE LIMITING (40 TCs: TC_GW_001 -> TC_GW_040)
- **Định tuyến tĩnh & Single Page Application (TC_GW_001 -> TC_GW_012)**:
  - Truy cập `/` trả về mã 200 và phục vụ file `index.html`.
  - Truy cập các URL tĩnh: `/css/style.css`, `/js/main.js`, `/manifest.json`, `/sw.js` đúng Content-Type.
  - Phục vụ thư mục ảnh tĩnh: `/images/foods/**`, `/images/recipes/**`, `/icons/**`.
  - Ánh xạ thư mục upload ngoại vi `/uploads/**`.
  - Fallback SPA: các đường dẫn route frontend không làm phát sinh lỗi 404 máy chủ.
- **Reverse Proxy Routing Microservices (TC_GW_013 -> TC_GW_024)**:
  - Chuyển tiếp `/api/auth/**` và `/api/profile/**` sang `user-service` (port 8081).
  - Chuyển tiếp `/api/fridge/**` sang `inventory-service` (port 8082).
  - Chuyển tiếp `/api/recipes/**` sang `recipe-service` (port 8083).
  - Chuyển tiếp `/api/plan/**` và `/api/shopping/**` sang `plan-shopping-service` (port 8084).
  - Chuyển tiếp `/api/ai/**` sang `ai-service` (port 8085).
  - Chuyển tiếp `/api/social/**` và `/api/stats/**` sang `social-stats-service` (port 8086).
  - Bảo toàn query parameters và path variables khi proxy chuyển tiếp.
  - Bảo toàn headers `Authorization` và `Content-Type` khi proxy.
  - Lọc bỏ các hop-by-hop headers (`Connection`, `Keep-Alive`, `Transfer-Encoding`).
- **Bộ lọc Rate Limiting & Khả năng Chịu tải (TC_GW_025 -> TC_GW_040)**:
  - `ApiRateLimitFilter` áp dụng thuật toán Token Bucket theo IP client.
  - Giới hạn tần suất request bình thường (<= 60 req/phút) đi qua trơn tru (200 OK).
  - Chặn request vượt ngưỡng với mã lỗi `429 Too Many Requests`.
  - Body phản hồi của 429 chứa thông điệp rõ ràng và header `Retry-After`.
  - Endpoint nhạy cảm AI Vision `/api/fridge/scan-image` nằm trong danh sách giới hạn bảo vệ.
  - Cấu hình CORS cho phép `GET, POST, PUT, DELETE, OPTIONS`.
  - Phản hồi preflight request `OPTIONS` với mã 200 OK và headers CORS đầy đủ.
  - Xử lý timeout kết nối khi service con bị treo (HTTP 504 Gateway Timeout).
  - Xử lý lỗi từ chối kết nối khi service con ngừng hoạt động (HTTP 503 Service Unavailable).

---

### SUITE 03: SMART FRIDGE MANAGEMENT (60 TCs: TC_FRIDGE_001 -> TC_FRIDGE_060)
- **Truy vấn & Hiển thị Tủ lạnh (TC_FRIDGE_001 -> TC_FRIDGE_015)**:
  - GET `/api/fridge` trả về danh sách nguyên liệu của user đang đăng nhập.
  - Kiểm tra tính cô lập dữ liệu: user A không thể xem nguyên liệu trong tủ của user B.
  - Hiển thị đầy đủ thông tin: tên món, số lượng, đơn vị, danh mục, ngày hết hạn, calo.
  - Tính toán số ngày còn lại đến hạn dùng (`daysLeft`).
  - Gán dải màu cảnh báo hạn dùng trực quan: Xanh lá (> 5 ngày), Vàng (3-5 ngày), Cam (1-2 ngày), Đỏ (quá hạn).
  - Cập nhật số liệu 4 thẻ thống kê: Tổng món, Cần dùng sớm, Món gợi ý, Đã yêu thích.
  - Giao diện tủ lạnh rỗng hiển thị illustration và 3 nút CTA hữu ích.
- **Thêm nguyên liệu Thủ công & Kho thực phẩm (TC_FRIDGE_016 -> TC_FRIDGE_030)**:
  - Thêm nguyên liệu hợp lệ lưu thành công vào CSDL MySQL.
  - Bắt lỗi tên rỗng, tên vượt quá 100 ký tự.
  - Bắt lỗi số lượng <= 0, số lượng không phải số.
  - Hỗ trợ số lượng thập phân (ví dụ: 0.5 kg, 1.5 lít).
  - Hỗ trợ đầy đủ các đơn vị đo lường: g, kg, quả, củ, hộp, lít, phần, bó.
  - Chọn nguyên liệu 1 chạm từ kho catalog có sẵn (`foodCatalogModal`).
  - Bấm chip gợi ý nhanh (Trứng, Thịt ba chỉ, Rau muống...) tự động điền form.
  - Nút tự động ước tính dinh dưỡng (Calo, Protein, Carb, Fat) qua thư viện dinh dưỡng.
- **Chỉnh sửa & Cập nhật Tủ lạnh (TC_FRIDGE_031 -> TC_FRIDGE_045)**:
  - Nút `+` tăng số lượng nguyên liệu thêm 1 bước nhảy.
  - Nút `-` giảm số lượng nguyên liệu (giảm về 0 hỏi xác nhận xóa món).
  - Cập nhật ngày hết hạn trực tiếp qua dialog chi tiết nguyên liệu.
  - Validate ngày hết hạn sai định dạng hoặc không hợp lệ.
  - Tìm kiếm nguyên liệu theo thời gian thực (instant search với debounce 200ms).
  - Lọc thực phẩm theo danh mục: Tất cả, Cần dùng sớm, Thịt & Hải sản, Rau củ, Trứng & Sữa, Tinh bột.
  - Checkbox chọn nhiều nguyên liệu để gửi cho AI gợi ý món ăn.
  - Thanh sticky floating bar hiển thị số lượng nguyên liệu đã chọn và nút bỏ chọn.
- **Xóa & Gộp Tủ lạnh & Batch Actions (TC_FRIDGE_046 -> TC_FRIDGE_060)**:
  - Xóa 1 nguyên liệu khỏi tủ lạnh qua nút thùng rác (có toast thông báo).
  - Ngăn chặn xóa nguyên liệu của người dùng khác qua IDOR.
  - Xóa toàn bộ thực phẩm trong tủ (`DELETE /api/fridge/all`) kèm dialog xác nhận.
  - Tự động gộp các nguyên liệu trùng tên (`/api/fridge/merge-duplicates`).
  - Gộp thực phẩm cộng dồn số lượng và giữ lại ngày hết hạn xa nhất.
  - API nạp hàng loạt `POST /api/fridge/batch` xử lý mảng JSON trong 1 transaction duy nhất.
  - Rollback toàn bộ đợt nạp nếu có lỗi nghiêm trọng ở tầng CSDL.

---

### SUITE 04: AI VISION SCANNER (45 TCs: TC_VISION_001 -> TC_VISION_045)
- **Upload & Nhận diện Hình ảnh Backend (TC_VISION_001 -> TC_VISION_015)**:
  - Endpoint `POST /api/ai/scan-food-image` nhận ảnh Base64 JPEG, PNG, WEBP.
  - Cấu trúc đối tượng `InlineData` trong `GeminiRequest` đúng đặc tả Google Gemini Vision API.
  - Gọi model `gemini-1.5-flash` phân tích thị giác và trích xuất dữ liệu.
  - Prompt ép định dạng JSON chuẩn: tên món tiếng Việt, số lượng, đơn vị, danh mục, hạn ước tính, độ tin cậy.
  - Kiểm tra độ tin cậy `confidence` trong khoảng [0.0, 1.0].
  - Cơ chế Fallback Offline kích hoạt tức thì khi không có `GEMINI_API_KEY` hoặc mạng timeout.
  - Dữ liệu fallback trả về danh sách thực phẩm Việt Nam chân thực (trứng gà, thịt heo, rau muống, cà chua, sữa tươi).
  - Xử lý multipart file upload tại endpoint `POST /api/fridge/scan-image`.
  - Flag `autoSave=false`: chỉ bóc tách JSON xem trước, không ghi vào CSDL tủ lạnh.
  - Flag `autoSave=true`: tự động bóc tách và lưu ngay toàn bộ món vào CSDL tủ lạnh của user.
- **Giao diện Modal Quét ảnh AI Frontend (TC_VISION_016 -> TC_VISION_032)**:
  - Nút `📸 Quét Hóa Đơn / Tủ Lạnh (AI)` hiển thị nổi bật trên header và empty state.
  - Mở modal `#scanFridgeModal` thành công, chặn mở khi chưa đăng nhập.
  - Đóng modal bằng nút `×`, click ra ngoài vùng backdrop hoặc phím Escape.
  - Vùng dropzone hỗ trợ kéo - thả ảnh mượt mà kèm class `.dragover`.
  - Nút chọn ảnh từ thư viện thiết bị (`scanFridgeFileInput`).
  - Nút chụp ảnh camera trực tiếp có thuộc tính `capture="environment"` trên di động.
  - Kiểm tra định dạng file phía client: từ chối file không phải JPG/PNG/WEBP.
  - Kiểm tra dung lượng file: chặn file > 10MB và hiển thị toast thông báo.
  - Hiển thị ảnh thu nhỏ (thumbnail preview), tên file và dung lượng trước khi quét.
  - Nút `✕` trên ảnh thu nhỏ cho phép hủy ảnh và quay lại dropzone.
  - Checkbox tuỳ chọn *"Tự động nạp thẳng vào tủ lạnh"* hoạt động chuẩn xác.
  - Hiệu ứng loader spinner neon và thông điệp trạng thái khi AI đang xử lý.
- **Bảng Biên tập Kết quả & Đồng bộ Dữ liệu (TC_VISION_033 -> TC_VISION_045)**:
  - Bảng kết quả hiển thị đúng số lượng món phát hiện (badge count).
  - Cho phép sửa trực tiếp Tên món, Số lượng, Đơn vị, Danh mục, Hạn dùng trong từng ô input.
  - Nút thùng rác `🗑️` xóa từng dòng không mong muốn và cập nhật lại badge đếm.
  - Nút `+ Thêm món` chèn thêm 1 dòng trống cho phép nhập thủ công bổ sung.
  - Nút `↺ Quét ảnh khác` reset modal về trạng thái chọn ảnh ban đầu.
  - Nút `📥 Lưu tất cả vào Tủ Lạnh` hiển thị loading state "Đang lưu...".
  - Gửi toàn bộ mảng dữ liệu đã chỉnh sửa qua endpoint `POST /api/fridge/batch`.
  - Đóng modal, hiển thị toast chúc mừng thành công và tự động tải lại danh sách tủ lạnh mới.

---

### SUITE 05: RECIPE DISCOVERY & SMART MATCHING (50 TCs: TC_RECIPE_001 -> TC_RECIPE_050)
- **Kho Công thức & Tìm kiếm (TC_RECIPE_001 -> TC_RECIPE_015)**:
  - GET `/api/recipes` trả về danh sách công thức phân trang.
  - Tìm kiếm công thức theo từ khóa tên món ăn (search bar với debounce).
  - Lọc công thức theo danh mục món (Món xào, Món canh, Món mặn, Món chay, Đồ uống).
  - Lọc công thức theo thời gian nấu (Nhanh dưới 15 phút, 30 phút, trên 1 tiếng).
  - Lọc công thức theo độ khó (Dễ, Trung bình, Nâng cao).
  - Lọc công thức theo lượng calo (Ăn kiêng, Cân bằng, Nạp năng lượng).
- **Thuật toán Gợi ý Món từ Tủ lạnh (TC_RECIPE_016 -> TC_RECIPE_032)**:
  - Thuật toán so khớp nguyên liệu trong tủ lạnh với thành phần của công thức.
  - Phân loại món: "Nấu được ngay" (đủ 100% nguyên liệu) vs "Thiếu ít nguyên liệu" (đủ >= 70%).
  - Ưu tiên công thức sử dụng các nguyên liệu sắp hết hạn (chống lãng phí thực phẩm).
  - Hiển thị danh sách nguyên liệu còn thiếu và nút 1-chạm "Thêm vào danh sách đi chợ".
  - Tính năng AI Cứu Tủ Lạnh (`fridgeRescueBtn`): tự tạo công thức sáng tạo từ đồ thừa.
- **Chi tiết Công thức & Tương tác (TC_RECIPE_033 -> TC_RECIPE_050)**:
  - Xem chi tiết công thức: hình ảnh, mô tả, khẩu phần, thời gian chuẩn bị/nấu.
  - Bảng thành phần dinh dưỡng chi tiết (Kcal, Protein, Carb, Fat, Natri, Chất xơ).
  - Nút tăng/giảm khẩu phần ăn (tự động tính toán lại định lượng nguyên liệu).
  - Nút yêu thích / bỏ yêu thích công thức (lưu vào tab Yêu thích).
  - Thêm toàn bộ nguyên liệu của công thức vào Kế hoạch bữa ăn hoặc Giỏ đi chợ.
  - Nút kích hoạt Chế độ Nấu ăn Rảnh tay (`cookingModeModal`).

---

### SUITE 06: COOKING MODE (CHẾ ĐỘ NẤU ĂN RẢNH TAY) (30 TCs: TC_COOK_001 -> TC_COOK_030)
- Mở modal nấu ăn toàn màn hình tập trung, ẩn thanh điều hướng gây xao nhãng.
- Hiển thị bước nấu hiện tại cỡ chữ to, dễ nhìn từ khoảng cách 1 mét khi đang nấu.
- Bộ đếm thời gian (Timer) cho từng bước nấu có âm thanh chuông báo khi hoàn thành.
- Tự động giữ sáng màn hình thiết bị (Wake Lock API) để tránh màn hình bị tắt khi tay dính dầu mỡ.
- Chuyển bước nấu qua nút bấm to hoặc phím mũi tên bàn phím.
- Đánh dấu hoàn thành món ăn: tự động trừ số lượng nguyên liệu tương ứng trong tủ lạnh.
- Ghi nhận lịch sử nấu ăn vào nhật ký dinh dưỡng của người dùng.

---

### SUITE 07: MEAL PLANNER & SHOPPING LIST (45 TCs: TC_PLAN_001 -> TC_PLAN_045)
- **Kế hoạch Bữa ăn Tuần (TC_PLAN_001 -> TC_PLAN_022)**:
  - Xem lịch ăn uống từ Thứ Hai đến Chủ Nhật theo 3 bữa: Sáng, Trưa, Tối và Bữa phụ.
  - Thêm món ăn vào từng bữa từ kho công thức hoặc tự tạo món tùy chỉnh.
  - Kéo thả hoặc di chuyển món ăn giữa các ngày trong tuần.
  - Tính tổng lượng calo dự kiến của từng ngày và so sánh với chỉ số TDEE khuyến nghị.
  - Cảnh báo nếu ngày ăn uống vượt quá hoặc quá thấp so với mức calo mục tiêu.
- **Danh sách Đi chợ Thông minh (TC_PLAN_023 -> TC_PLAN_045)**:
  - Tự động tổng hợp danh sách nguyên liệu cần mua cho cả tuần từ Kế hoạch bữa ăn.
  - Trừ đi các nguyên liệu đã có sẵn trong tủ lạnh (chỉ mua những gì thực sự thiếu).
  - Thêm nguyên liệu thủ công vào danh sách đi chợ.
  - Tích chọn hoàn thành (check-off) khi mua xong tại siêu thị.
  - Nút 1-chạm "Nạp các món đã mua vào tủ lạnh": tự động chuyển các món đã mua vào CSDL tủ lạnh.
  - Xóa các món đã mua hoặc xóa toàn bộ danh sách.

---

### SUITE 08: VIRTUAL CHEF AI CHATBOT (40 TCs: TC_CHAT_001 -> TC_CHAT_040)
- Mở cửa sổ chat trợ lý AI nấu ăn từ góc màn hình.
- Trợ lý AI nhận diện ngữ cảnh: biết được tủ lạnh của user đang có những nguyên liệu gì.
- Trợ lý AI biết được tình trạng sức khỏe, dị ứng và mục tiêu calo của user.
- Đặt câu hỏi nấu ăn: "Tối nay ăn gì nhanh dưới 20 phút?", "Cách luộc gà da giòn?".
- Cơ chế Fallback AI: Ưu tiên Groq LLaMA 3.3 -> Gemini 1.5 Flash -> Rule-based Mock.
- Nút gợi ý câu hỏi nhanh (Prompt chips).
- Trích xuất công thức món ăn ngay từ trong câu trả lời của AI và lưu vào Tủ lạnh / Sổ tay.
- Xóa lịch sử hội thoại hoặc bắt đầu phiên tư vấn mới.

---

### SUITE 09: SOCIAL FEED & COMMUNITY (35 TCs: TC_SOC_001 -> TC_SOC_035)
- Xem bảng tin cộng đồng người yêu bếp FoodX.
- Đăng bài chia sẻ món ăn vừa nấu kèm ảnh và công thức.
- Tương tác thả tim (Like / Unlike) cập nhật số lượt like theo thời gian thực.
- Bình luận trao đổi kinh nghiệm nấu ăn dưới bài viết.
- Xem trang cá nhân của thành viên khác và danh sách công thức họ chia sẻ.
- Báo cáo bài viết vi phạm hoặc nội dung không phù hợp.

---

### SUITE 10: NUTRITION & FOOD WASTE ANALYTICS (35 TCs: TC_STATS_001 -> TC_STATS_035)
- Biểu đồ theo dõi lượng calo nạp vào cơ thể trong 7 ngày gần nhất.
- Biểu đồ phân bổ tỷ lệ các chất dinh dưỡng vi lượng (Protein, Carb, Fat).
- Thống kê số lượng thực phẩm đã sử dụng trước khi hết hạn (chỉ số chống lãng phí).
- Ước tính số tiền tiết kiệm được nhờ việc quản lý tủ lạnh thông minh.
- Thống kê các nhóm thực phẩm tiêu thụ nhiều nhất (Thịt, Rau củ, Trái cây).
- Xuất báo cáo dinh dưỡng tuần dạng file tóm tắt.

---

### SUITE 11: SECURITY & PENETRATION TESTING (40 TCs: TC_SEC_001 -> TC_SEC_040)
- Kiểm tra lỗ hổng SQL Injection trên tất cả các query tham số.
- Kiểm tra lỗ hổng Stored XSS trong tên nguyên liệu, ghi chú và bài viết cộng đồng.
- Kiểm tra lỗ hổng Reflected XSS trên thanh tìm kiếm và URL query.
- Kiểm tra phân quyền truy cập chéo (IDOR): ngăn chặn sửa/xóa dữ liệu tủ lạnh của user khác.
- Kiểm tra xác thực JWT: giả mạo payload, sửa header `alg` thành `none`.
- Kiểm tra tải file độc hại (MIME type spoofing, tải file `.exe`, `.php`, `.jsp` ngụy trang ảnh).
- Kiểm tra bảo vệ chống Path Traversal (`../../etc/passwd`).
- Kiểm tra cấu hình CORS chống đánh cắp dữ liệu qua trang web độc hại thứ 3.
- Kiểm tra che giấu dấu vết máy chủ: không làm lộ stacktrace Java / SQL trong lỗi 500.

---

### SUITE 12: RESPONSIVE, PWA & CROSS-BROWSER (30 TCs: TC_UX_001 -> TC_UX_030)
- Kiểm tra hiển thị chuẩn xác trên Desktop (1440x900, 1920x1080).
- Kiểm tra hiển thị chuẩn xác trên Tablet iPad (768x1024, 1024x768).
- Kiểm tra hiển thị chuẩn xác trên Mobile (iPhone 375x667, Android 360x800).
- Kiểm tra menu Bottom Navigation trên thiết bị di động.
- Kiểm tra hoạt động ngoại tuyến (Offline) qua Service Worker (`sw.js`).
- Kiểm tra cài đặt ứng dụng PWA lên màn hình chính thiết bị.
- Kiểm tra hệ thống phím tắt: bấm `Esc` đóng modal, phím mũi tên duyệt công thức.
- Kiểm tra tương thích các trình duyệt phổ biến: Google Chrome, Microsoft Edge, Firefox, Safari.
