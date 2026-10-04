# BÁO CÁO BÀI TẬP LỚN
## MÔN HỌC: PHÁT TRIỂN PHẦN MỀM HƯỚNG DỊCH VỤ

---

### ĐỀ TÀI:
# THIẾT KẾ VÀ PHÁT TRIỂN HỆ THỐNG QUẢN LÝ THỰC PHẨM VÀ GỢI Ý THỰC ĐƠN THÔNG MINH FOODX THEO KIẾN TRÚC CLIENT-SERVER DỰA TRÊN RESTFUL API

* **Trường / Khoa / Lớp:** Trường Đại học Tài nguyên và Môi trường Hà Nội / Khoa Công nghệ Thông tin / Lớp ĐH13C1
* **Sinh viên thực hiện:** Nhóm 6
  * Cao Bảo Lâm – MSSV: 2311060394 (Trưởng nhóm, Kiến trúc hệ thống, Backend Microservices: user-service, api-gateway, ai-service, Docker, JWT)
  * Mai Hải Đăng – MSSV: 2311060240 (Module Công thức nấu ăn recipe-service, Blog chia sẻ social-stats-service, Frontend tương ứng)
  * Hoàng Phương Thảo – MSSV: 2311060391 (Module Tủ lạnh & Nguyên liệu inventory-service, Lập kịch bản và thực thi kiểm thử)
  * Nguyễn Thị Hồng Hạnh – MSSV: 2311060384 (Module Kế hoạch bữa ăn & Đi chợ plan-shopping-service, Báo cáo kỹ thuật)
* **Giảng viên hướng dẫn:** ThS. Trương Mạnh Đạt
* **Năm học:** 2026

---

## MỤC LỤC
1. [LỜI MỞ ĐẦU / GIỚI THIỆU ĐỀ TÀI](#lời-mở-đầu--giới-thiệu-đề-tài)
   - 1. Lý do chọn đề tài
   - 2. Mục tiêu nghiên cứu
   - 3. Phạm vi nghiên cứu
   - 4. Phương pháp nghiên cứu
   - 5. Cấu trúc của báo cáo
2. [CHƯƠNG 1. CƠ SỞ LÝ THUYẾT, CÔNG NGHỆ VÀ GIẢI PHÁP](#chương-1-cơ-sở-lý-thuyết-công-nghệ-và-giải-pháp)
   - 1.1 Tổng quan về kiến trúc và mô hình phát triển
   - 1.2 Nguyên lý thiết kế và tiêu thụ Web API
   - 1.3 Công nghệ sử dụng trong hệ thống
3. [CHƯƠNG 2. PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG](#chương-2-phân-tích-và-thiết-kế-hệ-thống)
   - 2.1 Phân tích bài toán và yêu cầu hệ thống
   - 2.2 Mô hình hóa chức năng và nghiệp vụ
   - 2.3 Thiết kế kiến trúc hệ thống
   - 2.4 Thiết kế dữ liệu
   - 2.5 Thiết kế API dịch vụ
   - 2.6 Thiết kế ứng dụng Client
4. [CHƯƠNG 3. CÀI ĐẶT VÀ TRIỂN KHAI HỆ THỐNG](#chương-3-cài-đặt-và-triển-khai-hệ-thống)
   - 3.1 Môi trường và công cụ phát triển
   - 3.2 Cài đặt Backend Service/API
   - 3.3 Cài đặt Client Application
   - 3.4 Triển khai hệ thống
5. [CHƯƠNG 4. KIỂM THỬ VÀ ĐÁNH GIÁ HỆ THỐNG](#chương-4-kiểm-thử-và-đánh-giá-hệ-thống)
   - 4.1 Kiểm thử API
   - 4.2 Kiểm thử tích hợp Client – API
   - 4.3 Đánh giá mức độ đáp ứng yêu cầu
6. [KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN](#kết-luận-và-hướng-phát-triển)
   - 1. Đề tài đã đạt được gì
   - 2. Đề tài còn hạn chế gì
   - 3. Hướng phát triển
7. [TÀI LIỆU THAM KHẢO](#tài-liệu-tham-khảo)

---

# LỜI MỞ ĐẦU / GIỚI THIỆU ĐỀ TÀI

### 1. Lý do chọn đề tài
#### 1.1 Đặt vấn đề
Trong đời sống hiện đại, việc quản lý thực phẩm trong gia đình gặp nhiều bất cập: người dùng thường xuyên quên hạn sử dụng thực phẩm dẫn đến lãng phí, mua sắm trùng lặp các nguyên liệu đã có sẵn, hoặc bế tắc trong việc trả lời câu hỏi "hôm nay ăn gì?" dựa trên những nguyên liệu đang có trong tủ lạnh. 

#### 1.2 Thực trạng hiện tại
* Người tiêu dùng thường ghi chép hạn dùng thực phẩm thủ công hoặc chỉ dựa vào trí nhớ, tỷ lệ thực phẩm bị quá hạn và phải bỏ đi chiếm tới 20–30% trong các hộ gia đình đô thị.
* Các ứng dụng nấu ăn truyền thống thường cung cấp công thức cố định mà không liên kết với kho thực phẩm hiện có của người dùng, khiến việc tìm kiếm món ăn tốn nhiều thời gian và không tối ưu hóa được nguồn tài nguyên sẵn có.
* Kiến trúc phần mềm của nhiều hệ thống cũ thường gắn chặt mã nguồn hiển thị giao diện với mã xử lý dữ liệu (monolithic khép kín), gây khó khăn cho việc tích hợp đa nền tảng (Web, Mobile, Smart Refrigerator) và mở rộng tính năng mới.

#### 1.3 Ý nghĩa và định hướng giải pháp của đề tài
Nhằm giải quyết triệt để các vấn đề trên, đề tài **FoodX** được xây dựng nhằm cung cấp giải pháp trợ lý quản lý thực phẩm thông minh:
* Tách biệt hoàn toàn tầng dịch vụ Backend (API) và ứng dụng Client tiêu thụ theo chuẩn RESTful API.
* Cung cấp các dịch vụ tự động hóa quản lý kho tủ lạnh: cảnh báo hạn sử dụng, gộp trùng lặp, ước tính dinh dưỡng và đặc biệt là thuật toán tự động khớp món ăn dựa trên nguyên liệu thực tế đang có trong tủ lạnh.
* Tích hợp trợ lý trí tuệ nhân tạo (AI Assistant) nhằm tư vấn dinh dưỡng và gợi ý thực đơn linh hoạt theo nhu cầu cá nhân.

---

### 2. Mục tiêu nghiên cứu
#### 2.1 Mục tiêu tổng quát
Nghiên cứu, thiết kế và phát triển hoàn chỉnh một hệ thống phần mềm hướng dịch vụ theo mô hình Client-Server dựa trên RESTful API, phục vụ nhu cầu quản lý tủ lạnh ảo, tra cứu công thức, lập kế hoạch đi chợ và gợi ý món ăn thông minh.

#### 2.2 Mục tiêu cụ thể
1. **Thiết kế & Xây dựng Backend Service:** Xây dựng hệ thống RESTful API hoàn chỉnh trên nền tảng Spring Boot và Spring Cloud Gateway, cung cấp đầy đủ các endpoint xử lý xác thực (JWT), quản lý tủ lạnh, thư viện công thức, kế hoạch bữa ăn và tích hợp AI.
2. **Hiện thực hóa quy tắc nghiệp vụ:** Triển khai các thuật toán nghiệp vụ ngoài CRUD thông thường: thuật toán đối sánh độ khớp nguyên liệu (`recipe-match`), thuật toán gộp trùng thực phẩm, tính toán giá trị dinh dưỡng và cơ chế rate limiting bảo vệ hệ thống.
3. **Xây dựng Client tiêu thụ dịch vụ:** Phát triển ứng dụng Web Single Page Application (SPA/PWA) tương tác mượt mà, tiêu thụ 100% tài nguyên thông qua RESTful API với cơ chế xử lý lỗi và trạng thái tải dữ liệu chuẩn mực.
4. **Kiểm thử & Triển khai:** Đóng gói toàn bộ dịch vụ và cơ sở dữ liệu trên container Docker Compose, kiểm thử toàn diện qua bộ kịch bản tự động E2E (End-to-End).

---

### 3. Phạm vi nghiên cứu
* **Trong phạm vi:**
  * Xây dựng kiến trúc Client-Server dựa trên RESTful API hoàn chỉnh cho web application.
  * Backend gồm cụm vi dịch vụ được điều phối qua một API Gateway thống nhất.
  * Quản lý thực phẩm tủ lạnh cá nhân, thư viện công thức nấu ăn, kế hoạch bữa ăn tuần, danh sách mua sắm, chia sẻ mạng xã hội.
  * Tích hợp AI (Google Gemini / Groq LLM) phục vụ tư vấn dinh dưỡng và phân tích món ăn.
  * Triển khai cục bộ hoàn chỉnh qua Docker Compose và môi trường Windows dev script.
* **Ngoài phạm vi:**
  * Ứng dụng di động thuần Native (iOS/Android Native) — hiện tại hỗ trợ thông qua Web App PWA.
  * Cổng thanh toán trực tuyến tiền thật (Payment Gateway) cho dịch vụ mua hộ thực phẩm.
  * Triển khai cụm Kubernetes đa vùng trên hạ tầng Cloud công cộng (AWS/GCP).

---

### 4. Phương pháp nghiên cứu
* **Phương pháp phân tích & mô hình hóa:** Sử dụng UML (Use Case, Sequence Diagram) để mô tả luồng nghiệp vụ; mô hình thực thể quan hệ (ERD) để chuẩn hóa cấu trúc dữ liệu.
* **Phương pháp phát triển phần mềm:** Áp dụng mô hình Agile/Scrum, thiết kế theo hướng API-First Design và kiến trúc phân tầng (Layered Architecture) trong từng dịch vụ.
* **Phương pháp kiểm thử:** Kiểm thử hộp đen với Postman và tự động hóa kiểm thử tích hợp đầu cuối (End-to-End integration test) bằng Node.js và Playwright.

---

### 5. Cấu trúc của báo cáo
* **Chương 1:** Cơ sở lý thuyết, công nghệ và giải pháp — Trình bày các khái niệm kiến trúc, RESTful API và lý do lựa chọn công nghệ.
* **Chương 2:** Phân tích và thiết kế hệ thống — Làm rõ các yêu cầu chức năng, phi chức năng, quy tắc nghiệp vụ, thiết kế kiến trúc, dữ liệu, API và Client.
* **Chương 3:** Cài đặt và triển khai hệ thống — Chi tiết hiện thực mã nguồn Backend, Client và quy trình khởi chạy hệ thống.
* **Chương 4:** Kiểm thử và đánh giá hệ thống — Báo cáo kết quả kiểm thử API, kiểm thử tích hợp Client - API và đánh giá độ đáp ứng yêu cầu.
* **Kết luận và hướng phát triển:** Đánh giá kết quả đạt được, hạn chế và đề xuất mở rộng.

---

# CHƯƠNG 1. CƠ SỞ LÝ THUYẾT, CÔNG NGHỆ VÀ GIẢI PHÁP

### 1.1 Tổng quan về kiến trúc và mô hình phát triển

#### 1.1.1 Mô hình Client – Server
Mô hình Client-Server phân định rõ hai thực thể tham gia:
* **Client (Phía khách):** Đảm nhận giao diện người dùng (Presentation Layer), thu nhận thao tác của người dùng, đóng gói dữ liệu thành các yêu cầu (Request) và hiển thị kết quả phản hồi (Response).
* **Server (Phía máy chủ):** Tiếp nhận yêu cầu, thực thi các quy tắc nghiệp vụ (Business Logic) và tương tác với tầng lưu trữ (Data Persistence Layer) để phản hồi về Client.
Mô hình này cho phép phía Client và Server phát triển, bảo trì và nâng cấp hoàn toàn độc lập với nhau mà không gây ảnh hưởng đến phần còn lại.

#### 1.1.2 Kiến trúc dựa trên API (API-based Architecture)
Trong kiến trúc này, API đóng vai trò là "bản hợp đồng" giao tiếp duy nhất giữa các thành phần phần mềm. Máy chủ không sinh mã giao diện (Server-side Rendering) mà chỉ phát hành các API cung cấp dữ liệu thô (chủ yếu là định dạng JSON). Nhờ đó, một hệ thống Backend duy nhất có thể phục vụ đồng thời nhiều loại Client khác nhau (Web Browser, Mobile App, IoT Hub).

#### 1.1.3 Dịch vụ web RESTful (RESTful Web Service)
Hệ thống FoodX tuân thủ 6 nguyên tắc ràng buộc của kiến trúc REST (Representational State Transfer):
1. **Client-Server Separation:** Tách biệt mối quan tâm giữa giao diện và lưu trữ dữ liệu.
2. **Stateless (Phi trạng thái):** Mỗi request gửi từ Client lên Server phải chứa đầy đủ mọi thông tin cần thiết để Server hiểu và xử lý. Server không lưu session người dùng trong bộ nhớ ứng dụng mà sử dụng JSON Web Token (JWT).
3. **Cacheable (Khả năng lưu bộ đệm):** Dữ liệu phản hồi được định danh rõ ràng có được lưu cache hay không (ví dụ cache Redis đối với danh mục công thức).
4. **Uniform Interface (Giao diện đồng nhất):** Định danh tài nguyên qua URI, thao tác thông qua các phương thức chuẩn HTTP, phản hồi dữ liệu tự mô tả.
5. **Layered System (Hệ thống phân tầng):** Client không cần biết đang kết nối trực tiếp tới máy chủ ứng dụng hay qua máy chủ trung gian (API Gateway).

#### 1.1.4 Kiến trúc Microservices và API Gateway
Khác với các ứng dụng Monolithic truyền thống, hệ thống FoodX được xây dựng theo kiến trúc hướng dịch vụ vi mô (Microservices):
* Toàn bộ hệ thống phân rã thành các dịch vụ độc lập theo ranh giới nghiệp vụ (User, Inventory, Recipe, Planning, AI, Social).
* **Spring Cloud Gateway** đóng vai trò là điểm truy cập duy nhất (Single Point of Entry) tiếp nhận mọi kết nối từ Client, thực hiện kiểm tra bảo mật, định tuyến (Routing), kiểm soát tải (Rate Limiting) và chuyển tiếp yêu cầu đến các vi dịch vụ tương ứng.

---

### 1.2 Nguyên lý thiết kế và tiêu thụ Web API

#### 1.2.1 Xác định tài nguyên (Resource) và URI
Tài nguyên là đối tượng dữ liệu trung tâm của hệ thống, được định danh bằng danh từ số nhiều:
* `/api/fridge`: Thực phẩm trong tủ lạnh.
* `/api/recipes`: Công thức món ăn.
* `/api/ingredients`: Danh mục nguyên liệu.
* `/api/plans`: Kế hoạch bữa ăn.

#### 1.2.2 Quy ước phương thức HTTP (HTTP Methods)
* **GET:** Truy vấn và lấy thông tin tài nguyên (không làm thay đổi trạng thái hệ thống).
* **POST:** Tạo mới một tài nguyên hoặc kích hoạt một hành động nghiệp vụ xử lý dữ liệu phức tạp.
* **PUT:** Cập nhật hoặc thay thế toàn bộ thông tin của tài nguyên theo mã định danh.
* **PATCH:** Cập nhật một phần thuộc tính của tài nguyên (ví dụ: chỉ sửa số lượng thực phẩm, hạn dùng).
* **DELETE:** Loại bỏ tài nguyên khỏi hệ thống.

#### 1.2.3 Cấu trúc Request và Response
* **Request Header:** Thiết lập `Content-Type: application/json` và kèm `Authorization: Bearer <token>` cho các endpoint yêu cầu xác thực.
* **Response Envelope chuẩn:** Để tạo tính đồng nhất, tất cả API trả về cấu trúc chuẩn:
```json
{
  "success": true,
  "message": "Thao tác thành công",
  "data": { ... },
  "status": 200
}
```

#### 1.2.4 Mã trạng thái HTTP (HTTP Status Codes)
* `200 OK`: Yêu cầu thành công, dữ liệu trả về hợp lệ.
* `201 Created`: Tạo mới tài nguyên thành công.
* `400 Bad Request`: Dữ liệu đầu vào sai định dạng hoặc vi phạm quy tắc nghiệp vụ.
* `401 Unauthorized`: Chưa xác thực hoặc Token không hợp lệ / hết hạn.
* `403 Forbidden`: Người dùng không có quyền truy cập vào tài nguyên.
* `404 Not Found`: Không tìm thấy tài nguyên được yêu cầu.
* `409 Conflict`: Xung đột dữ liệu (ví dụ: trùng tên tài khoản).
* `429 Too Many Requests`: Vượt quá tần suất gửi yêu cầu cho phép (Rate Limit).
* `500 Internal Server Error`: Lỗi phát sinh ngoài dự kiến phía máy chủ.

#### 1.2.5 Cơ chế tiêu thụ API tại Client
Client sử dụng Web API Fetch hiện đại thông qua cơ chế bất đồng bộ `async/await`. Phía Client bóc tách dữ liệu JSON từ Response, kiểm tra trường `success`, tự động gắn JWT vào Request Header cho các yêu cầu kế tiếp và điều hướng giao diện tương ứng.

---

### 1.3 Công nghệ sử dụng trong hệ thống

Bảng tổng hợp các công nghệ được lựa chọn trong đề tài và lý do áp dụng:

| Thành phần | Công nghệ / Công cụ | Phiên bản | Vai trò & Lý do lựa chọn |
|---|---|---|---|
| **Hệ điều hành** | Windows 11 / Linux | - | Môi trường phát triển và kiểm thử hệ thống. |
| **Backend Language** | Java (OpenJDK) | 17 LTS | Ngôn ngữ mạnh mẽ về hướng đối tượng, an toàn kiểu dữ liệu và tối ưu hiệu năng. |
| **Backend Framework** | Spring Boot | 3.x / 4.x | Cung cấp cấu hình tự động (Auto-configuration), kiến trúc phân tầng chuẩn, hỗ trợ tạo RESTful API nhanh chóng. |
| **API Gateway** | Spring Cloud Gateway | - | Đóng vai trò Reverse Proxy, định tuyến tập trung, lọc CORS và Rate Limiting. |
| **Cơ sở dữ liệu** | MySQL | 8.0+ | Hệ quản trị CSDL quan hệ tin cậy, lưu trữ bền vững dữ liệu nghiệp vụ và người dùng. |
| **Bộ đệm & Cache** | Redis | 7.x | Lưu trữ tạm dữ liệu tần suất cao và phục vụ tính năng Rate Limit IP. |
| **Ứng dụng Client** | HTML5 / CSS3 / Vanilla JS | ES6+ | Xây dựng Single Page App thuần, độc lập hoàn toàn với backend, tốc độ tải trang cực nhanh, hỗ trợ PWA. |
| **Trí tuệ nhân tạo (AI)** | Google Gemini / Groq LLM | API | Tích hợp dịch vụ trí tuệ nhân tạo bên thứ ba để xử lý ngôn ngữ tự nhiên và tư vấn dinh dưỡng. |
| **API Testing** | Postman / Playwright | 1.40+ | Kiểm thử tự động các endpoint RESTful và kiểm thử tích hợp luồng người dùng E2E. |
| **Quản lý mã nguồn** | Git / GitHub | - | Kiểm soát phiên bản mã nguồn, quản lý phân nhánh và làm việc nhóm. |

---

# CHƯƠNG 2. PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG

### 2.1 Phân tích bài toán và yêu cầu hệ thống

#### 2.1.1 Các tác nhân của hệ thống (Actors)
* **Khách vãng lai (Guest):** Người dùng chưa đăng nhập, chỉ có thể xem danh sách công thức mẫu và tra cứu nguyên liệu chung.
* **Người dùng đã đăng ký (User):** Quản lý kho thực phẩm tủ lạnh cá nhân, xem công thức khớp với đồ trong tủ, lưu công thức yêu thích, tạo kế hoạch bữa ăn, quản lý danh sách đi chợ, chat với AI.
* **Quản trị viên (Admin):** Quản lý tài khoản người dùng, giám sát hệ thống, quản lý danh mục thực phẩm toàn cục.

#### 2.1.2 Yêu cầu chức năng theo từng tác nhân
1. **Phân hệ Người dùng & Xác thực:**
   * Đăng ký tài khoản mới, Đăng nhập nhận JWT Token.
   * Xem và cập nhật thông tin hồ sơ cá nhân, đổi mật khẩu bảo mật.
2. **Phân hệ Tủ lạnh ảo (Fridge Inventory):**
   * Thêm mới thực phẩm kèm số lượng, hạn sử dụng, calo.
   * Tăng/giảm số lượng nhanh (về `<= 0` tự động xóa).
   * Gộp các thực phẩm trùng lặp (trùng tên và hạn dùng).
   * Tra cứu ước tính dinh dưỡng tự động theo khối lượng.
3. **Phân hệ Công thức & Gợi ý (Recipe & Smart Matching):**
   * Xem danh mục món ăn, tìm kiếm theo từ khóa/danh mục/vùng miền.
   * **Thuật toán Khớp món tủ lạnh:** Tự động tính toán tỷ lệ nguyên liệu sẵn có trong tủ lạnh so với yêu cầu của từng công thức để xếp hạng từ cao xuống thấp.
   * Nhập khẩu công thức tự động từ văn bản/URL thông qua AI.
4. **Phân hệ Kế hoạch & Đi chợ (Meal Planning & Shopping):**
   * Lên kế hoạch ăn uống theo các ngày trong tuần (Sáng, Trưa, Tối).
   * Tự động sinh danh sách đi chợ từ các nguyên liệu còn thiếu trong kế hoạch.
   * Đánh dấu "Đã mua" để tự động nạp thẳng thực phẩm vào tủ lạnh.
5. **Phân hệ Trợ lý AI (AI Nutritionist):**
   * Hỏi đáp dinh dưỡng, gợi ý thực đơn thích ứng theo sở thích và tình trạng kho thực phẩm.

#### 2.1.3 Các quy tắc nghiệp vụ quan trọng (Business Rules)
Hệ thống FoodX vượt ra ngoài phạm vi CRUD thông thường với các quy tắc nghiệp vụ ràng buộc chặt chẽ:
* **BR01 (Kiểm soát số lượng):** Khi số lượng thực phẩm trong tủ lạnh giảm về $\le 0$, hệ thống tự động loại bỏ bản ghi để tránh lưu dữ liệu rác.
* **BR02 (Gộp thực phẩm trùng):** Hai bản ghi thực phẩm trong tủ lạnh chỉ được phép gộp tự động khi trùng tên và trùng hạn sử dụng; số lượng sẽ được cộng dồn.
* **BR03 (Thuật toán khớp món ăn):** Một công thức chỉ được đưa vào danh sách gợi ý khi tỷ lệ nguyên liệu đáp ứng từ tủ lạnh đạt trên $0\%$, sắp xếp theo độ khớp giảm dần:
$$\text{Match Percent} = \left(\frac{\text{Số nguyên liệu có sẵn trong tủ}}{\text{Tổng số nguyên liệu của công thức}}\right) \times 100\%$$
* **BR04 (Bảo vệ tần suất gọi AI / Ảnh):** Giới hạn tối đa 30 yêu cầu/phút trên mỗi địa chỉ IP đối với các endpoint tốn tài nguyên (`/api/ai/**`, `/api/upload`, tìm kiếm ảnh), vượt ngưỡng trả về HTTP 429.
* **BR05 (Bảo mật tài khoản):** Đổi mật khẩu bắt buộc phải xác minh đúng mật khẩu cũ hiện tại và mật khẩu mới phải khác biệt mật khẩu cũ.

#### 2.1.4 Yêu cầu phi chức năng
* **Bảo mật:** Sử dụng cơ chế mã hóa mật khẩu BCrypt 10 rounds, truyền tải thông tin định danh bằng JWT Token có thời hạn hợp lệ.
* **Hiệu năng:** Thời gian phản hồi của các API thông thường $\le 200\text{ms}$.
* **Khả năng mở rộng:** Kiến trúc phân tách vi dịch vụ cho phép nhân bản (scale-out) riêng lẻ dịch vụ có tải cao như `recipe-service` hoặc `inventory-service`.

---

### 2.2 Mô hình hóa chức năng và nghiệp vụ

#### 2.2.1 Sơ đồ Use Case tổng thể

```mermaid
flowchart LR
    User((Người dùng))
    Guest((Khách))
    Admin((Quản trị viên))

    subgraph Hệ thống FoodX
        UC1[Đăng nhập / Đăng ký]
        UC2[Xem công thức & nguyên liệu]
        UC3[Quản lý kho tủ lạnh]
        UC4[Gợi ý món ăn khớp tủ lạnh]
        UC5[Lập kế hoạch & Danh sách đi chợ]
        UC6[Tư vấn trợ lý AI]
        UC7[Quản trị tài khoản & hệ thống]
    end

    Guest --> UC1
    Guest --> UC2
    User --> UC1
    User --> UC2
    User --> UC3
    User --> UC4
    User --> UC5
    User --> UC6
    Admin --> UC7
    Admin --> UC3
```

#### 2.2.2 Đặc tả Use Case chính

##### Use Case 1: Tìm kiếm món ăn khớp tủ lạnh (Smart Recipe Match)
* **Tác nhân:** Người dùng đã đăng nhập.
* **Điều kiện bắt đầu:** Người dùng đã xác thực JWT thành công và có ít nhất 1 thực phẩm trong tủ lạnh.
* **Luồng xử lý chính:**
  1. Người dùng truy cập trang "Khám phá món ăn" và chọn mục "Món khớp tủ lạnh".
  2. Client gửi yêu cầu `GET /api/recipes/match` kèm JWT Bearer Header.
  3. Hệ thống Backend truy vấn toàn bộ thực phẩm hiện có trong tủ của người dùng.
  4. Hệ thống quét kho công thức, so khớp từng thành phần nguyên liệu giữa tủ lạnh và công thức.
  5. Tính toán tỷ lệ khớp (`matchPercent`), sắp xếp danh sách giảm dần và trả về kết quả JSON.
  6. Client tiếp nhận danh sách và hiển thị các món ăn kèm nhãn tỷ lệ phần trăm khớp.
* **Luồng ngoại lệ:** Nếu tủ lạnh rỗng, hệ thống trả về mảng rỗng kèm thông điệp hướng dẫn nạp thực phẩm vào tủ.
* **Kết quả:** Người dùng xem được danh sách các món ăn có thể nấu ngay với thực phẩm sẵn có.

##### Use Case 2: Gộp thực phẩm trùng lặp trong tủ lạnh
* **Tác nhân:** Người dùng đã đăng nhập.
* **Điều kiện bắt đầu:** Tủ lạnh có nhiều bản ghi thực phẩm trùng tên và hạn dùng do người dùng thêm vào nhiều đợt.
* **Luồng xử lý chính:**
  1. Người dùng nhấn nút "Gộp trùng" trên giao diện tủ lạnh.
  2. Client gửi yêu cầu `POST /api/fridge/merge-duplicates`.
  3. Backend gom nhóm (group by) các bản ghi theo `(userId, name, expiresAt)`.
  4. Backend cộng dồn `quantity`, giữ lại bản ghi đầu tiên và xóa bỏ các bản ghi trùng lặp thừa.
  5. Trả về thông báo thành công và danh sách tủ lạnh đã được làm gọn.
  6. Client cập nhật lại giao diện hiển thị.
* **Kết quả:** Kho tủ lạnh sạch sẽ, không còn các bản ghi rời rạc cùng hạn.

#### 2.2.3 Sơ đồ tuần tự (Sequence Diagram) cho các luồng xử lý chính

##### Sơ đồ 1: Luồng xử lý Tìm kiếm món ăn khớp tủ lạnh (`GET /api/recipes/match`)

```mermaid
sequenceDiagram
    autonumber
    actor User as Người dùng
    participant Client as Client SPA
    participant Gateway as API Gateway (8080)
    participant RecipeSvc as Recipe Service (8083)
    participant InvenSvc as Inventory Service (8082)
    participant DB as MySQL Database

    User->>Client: Nhấn xem "Món khớp tủ lạnh"
    Client->>Gateway: GET /api/recipes/match [Authorization: Bearer token]
    Gateway->>Gateway: Kiểm tra hợp lệ JWT Token
    Gateway->>RecipeSvc: Chuyển tiếp GET /recipes/match [X-User-Id: ...]
    RecipeSvc->>InvenSvc: Gọi nội bộ lấy danh sách thực phẩm trong tủ của User
    InvenSvc->>DB: SELECT * FROM fridge_items WHERE user_id = ?
    DB-->>InvenSvc: Danh sách thực phẩm
    InvenSvc-->>RecipeSvc: Trả về danh sách nguyên liệu tủ
    RecipeSvc->>DB: SELECT * FROM recipes JOIN recipe_ingredients
    DB-->>RecipeSvc: Danh sách tất cả công thức & nguyên liệu
    RecipeSvc->>RecipeSvc: Thực thi thuật toán so khớp & tính MatchPercent
    RecipeSvc-->>Gateway: Trả về ApiResponse chứa danh sách món đã xếp hạng
    Gateway-->>Client: HTTP 200 OK + JSON Data
    Client-->>User: Hiển thị giao diện danh sách món khớp
```

##### Sơ đồ 2: Luồng xử lý Đăng nhập và Cấp phát Token (`POST /api/auth/login`)

```mermaid
sequenceDiagram
    autonumber
    actor User as Người dùng
    participant Client as Client SPA
    participant Gateway as API Gateway (8080)
    participant UserSvc as User Service (8081)
    participant DB as MySQL Database

    User->>Client: Nhập username và password, nhấn Đăng nhập
    Client->>Gateway: POST /api/auth/login {username, password}
    Gateway->>UserSvc: Chuyển tiếp POST /auth/login
    UserSvc->>DB: SELECT * FROM users WHERE username = ? OR email = ?
    DB-->>UserSvc: Thông tin User kèm password_hash
    alt Người dùng không tồn tại hoặc sai mật khẩu
        UserSvc-->>Gateway: HTTP 401 Unauthorized (Sai tài khoản hoặc mật khẩu)
        Gateway-->>Client: HTTP 401 Error Envelope
        Client-->>User: Hiển thị thông báo lỗi trên giao diện
    else Xác thực thành công (BCrypt match)
        UserSvc->>UserSvc: Tạo JWT Token với Subject và Roles
        UserSvc-->>Gateway: HTTP 200 OK + {accessToken, userProfile}
        Gateway-->>Client: HTTP 200 OK + JSON Token
        Client->>Client: Lưu accessToken vào localStorage
        Client-->>User: Điều hướng vào trang Tủ Lạnh chính
    end
```

#### 2.2.4 Đặc tả chức năng Xác thực, Quản lý tài khoản và Danh sách yêu thích

Nhóm chức năng xác thực và quản lý tài khoản là tầng bảo mật đầu tiên của hệ thống FoodX, được hiện thực chủ yếu tại **user-service** (cổng 8081) với các API `/api/auth/**`, `/api/profile/**`, `/api/admin/users/**`; riêng chức năng yêu thích công thức được hiện thực tại **recipe-service** (`/api/favorites`). Toàn bộ thao tác được bảo vệ bằng cơ chế JWT — chỉ đăng ký và đăng nhập là công khai, mọi thao tác còn lại đều bắt buộc kèm thẻ `Authorization: Bearer <token>`. Phần đặc tả dưới đây gồm 5 sơ đồ phân rã use case cấp cao và các sơ đồ tuần tự – sơ đồ hoạt động đặc tả chi tiết cho những chức năng trọng yếu: đăng ký tài khoản, cập nhật hồ sơ dinh dưỡng và xóa tài khoản.

Bảng tổng hợp 11 chức năng con được đặc tả trong phần này:

| STT | Tên use case con | Mô tả hoạt động |
| --- | --- | --- |
| 1 | Kiểm tra trùng lặp Username/Email | Hệ thống tra cứu username và email trong bảng `users` trước khi tạo tài khoản; nếu đã tồn tại sẽ trả về lỗi HTTP 409 và từ chối ghi dữ liệu. |
| 2 | Mã hóa mật khẩu | Mật khẩu được băm bằng thuật toán BCrypt (kèm salt riêng) trước khi lưu; không bao giờ lưu hoặc truyền mật khẩu dạng văn bản thuần. |
| 3 | Tự động cấp Token đăng nhập | Sau khi xác thực thành công, hệ thống tự phát hành JWT chứa `userId`, `username` và `role` với thời hạn 24 giờ. |
| 4 | Đăng nhập bằng Username/Email | Hệ thống chấp nhận cả hai định danh, tự chuẩn hóa về username (không phân biệt hoa/thường) rồi mới thực hiện xác thực. |
| 5 | Lưu phiên làm việc JWT | Client lưu `accessToken` vào localStorage và đính kèm mọi request; mỗi service kiểm tra chữ ký và hạn dùng của token (phiên stateless). |
| 6 | Cập nhật hồ sơ dinh dưỡng | Người dùng cập nhật chỉ số cơ thể, chế độ ăn, dị ứng...; dữ liệu được validate khoảng giá trị và ảnh hưởng trực tiếp đến gợi ý của AI. |
| 7 | Cập nhật / Xóa ảnh đại diện | Upload ảnh đại diện (JPG/PNG/WEBP, tối đa 5MB, từ chối SVG) hoặc xóa ảnh hiện có; ảnh được phục vụ tĩnh tại `/uploads`. |
| 8 | Sửa thông tin và Phân quyền | Quản trị viên chỉnh sửa email, mật khẩu và phân quyền (ADMIN/USER); mọi thao tác đều yêu cầu vai trò ADMIN trong JWT. |
| 9 | Xóa tài khoản người dùng | Quản trị viên xóa tài khoản; hệ thống đồng thời dọn sạch dữ liệu liên quan của người dùng trên các bảng trong cùng cơ sở dữ liệu. |
| 10 | Thêm công thức vào yêu thích | Người dùng bật yêu thích đối với công thức hoặc nguyên liệu (toggle); bản ghi có ràng buộc duy nhất theo từng người và từng đối tượng. |
| 11 | Bỏ yêu thích | Người dùng gỡ công thức/nguyên liệu khỏi danh sách yêu thích bằng thao tác toggle lần hai hoặc xóa trực tiếp bản ghi. |

##### Sơ đồ phân rã chức năng

Năm sơ đồ dưới đây mô tả cấu trúc use case cấp cao của từng nhóm chức năng, trong đó quan hệ `<<include>>` biểu thị chức năng bắt buộc kèm theo, `<<extend>>` biểu thị các nhánh mở rộng chỉ phát sinh khi điều kiện thỏa mãn.

![Hình 2.1: Sơ đồ phân rã chức năng Đăng ký tài khoản](assets/report/uc_dangky.png)

![Hình 2.2: Sơ đồ phân rã chức năng Đăng nhập](assets/report/uc_dangnhap.png)

![Hình 2.3: Sơ đồ phân rã chức năng Quản lý tài khoản cá nhân](assets/report/uc_taikhoan.png)

![Hình 2.4: Sơ đồ phân rã chức năng Quản lý người dùng hệ thống (Admin)](assets/report/uc_admin.png)

![Hình 2.5: Sơ đồ phân rã chức năng Quản lý danh sách yêu thích](assets/report/uc_yeuthich.png)

##### Chức năng 1: Kiểm tra trùng lặp Username/Email

Điều kiện tiên quyết của đăng ký là tính duy nhất của định danh. Khi người dùng nhập username hoặc email, hệ thống truy vấn bảng `users` và so sánh không phân biệt hoa/thường; nếu trùng, API trả về HTTP 409 kèm thông báo tiếng Việt, nếu không trùng dữ liệu được chuyển sang các bước tiếp theo. Sơ đồ mô tả luồng hội thoại giữa người dùng – form – lớp xử lý – cơ sở dữ liệu và luồng hoạt động với nhánh quyết định *Condition [Bị trùng / Hợp lệ]*.

![Hình 2.6: Sơ đồ tuần tự — Kiểm tra trùng lặp Username/Email](assets/report/tk01_seq.png)

![Hình 2.7: Sơ đồ hoạt động — Kiểm tra trùng lặp Username/Email](assets/report/tk01_act.png)

##### Chức năng 2: Mã hóa mật khẩu

Mật khẩu không bao giờ được lưu dạng văn bản thuần. Trước khi ghi vào bảng `users`, mật khẩu được băm bằng BCrypt — mỗi mật khẩu tự sinh salt riêng, giúp dữ liệu đánh cắp được từ cơ sở dữ liệu không thể giải ngược. Ở chiều đăng nhập, hệ thống gọi `BCrypt.matches()` để so khớp mật khẩu người dùng nhập với hash đã lưu. Sơ đồ hoạt động thể hiện rõ nhánh kiểm tra hợp lệ trước khi thực hiện băm và lưu.

![Hình 2.8: Sơ đồ tuần tự — Mã hóa mật khẩu](assets/report/tk02_seq.png)

![Hình 2.9: Sơ đồ hoạt động — Mã hóa mật khẩu](assets/report/tk02_act.png)

##### Chức năng 3: Tự động cấp Token đăng nhập

Sau khi `AuthenticationManager` xác thực thành công, `JwtTokenProvider` phát hành JSON Web Token chứa các claim `userId`, `username` và `role`, có hạn 24 giờ (86.400.000 ms). Token được trả về cho client dưới dạng `Bearer <accessToken>` kèm metadata `tokenType` và `expiresIn`. Việc cấp token hoàn toàn tự động, người dùng không cần thao tác thêm.

![Hình 2.10: Sơ đồ tuần tự — Tự động cấp Token đăng nhập](assets/report/tk03_seq.png)

![Hình 2.11: Sơ đồ hoạt động — Tự động cấp Token đăng nhập](assets/report/tk03_act.png)

##### Chức năng 4: Đăng nhập bằng Username/Email

Để thuận tiện, hệ thống chấp nhận cả username lẫn email trong cùng một ô nhập. Lớp xử lý chuẩn hóa định danh (bỏ khoảng trắng, không phân biệt hoa/thường); nếu input là email thì tra về username tương ứng rồi mới gọi `AuthenticationManager`. Sai mật khẩu hoặc tài khoản không tồn tại đều trả về HTTP 401 với cùng một thông điệp, không tiết lộ tài khoản nào thực sự tồn tại — nguyên tắc phản hồi lỗi thống nhất.

##### Chức năng 5: Lưu phiên làm việc JWT

Client lưu `accessToken` vào localStorage của trình duyệt và đính kèm header `Authorization: Bearer ...` cho mọi request kế tiếp. Mỗi microservice tự kiểm tra token qua `JwtAuthenticationFilter` — kiểm tra chữ ký, hạn dùng và nạp người dùng từ claim — nên phiên làm việc hoàn toàn stateless, không tốn bộ nhớ phía máy chủ. Đăng xuất tương ứng với việc client xóa `accessToken` khỏi localStorage.

##### Chức năng 6: Cập nhật hồ sơ dinh dưỡng

Hồ sơ dinh dưỡng được tạo mặc định ngay khi đăng ký và là dữ liệu đầu vào quan trọng của trợ lý AI (mục tiêu calo, chế độ ăn, dị ứng, món ghét). API `PUT /api/profile` validate khoảng giá trị của các trường như tuổi, cân nặng, chiều cao trước khi ghi; dữ liệu sai sẽ bị từ chối với thông báo chi tiết. Sơ đồ thể hiện luồng nhập chỉ số – kiểm tra điều kiện – ghi vào bảng `profiles` – thông báo thành công.

![Hình 2.12: Sơ đồ tuần tự — Cập nhật hồ sơ dinh dưỡng](assets/report/tk06_seq.png)

![Hình 2.13: Sơ đồ hoạt động — Cập nhật hồ sơ dinh dưỡng](assets/report/tk06_act.png)

##### Chức năng 7: Cập nhật / Xóa ảnh đại diện (Avatar)

Chức năng upload nhận file multipart dưới trường `avatar`, chỉ chấp nhận JPG/PNG/WEBP dung lượng tối đa 5MB và chủ động từ chối SVG để tránh rủi ro XSS. Ảnh được lưu vào thư mục uploads theo ngày và phục vụ công khai tại `/uploads/**`; người dùng có thể xóa avatar bất cứ lúc nào, hệ thống sẽ khôi phục ảnh mặc định.

##### Chức năng 8: Sửa thông tin và Phân quyền người dùng

Đây là chức năng riêng của vai trò Quản trị viên: API `PUT /api/admin/users/{id}` yêu cầu JWT hợp lệ kèm claim `role = ADMIN`. Quản trị viên có thể thay đổi email, mật khẩu (được băm lại bằng BCrypt) và phân quyền giữa ADMIN/USER; thay đổi phân quyền có hiệu lực ngay ở các request kế tiếp vì vai trò được đọc trực tiếp từ token.

##### Chức năng 9: Xóa tài khoản người dùng

Khi xóa người dùng, hệ thống không chỉ ghi xóa bảng `users` mà còn dọn sạch dữ liệu liên quan (tủ lạnh, kế hoạch ăn, danh sách mua, lịch sử nấu, bài viết...) trên các bảng dùng chung thông qua truy vấn JDBC trực tiếp, bảo đảm không để lại dữ liệu mồ côi. Sơ đồ hoạt động thể hiện luồng xác nhận trước khi thực hiện thao tác không thể hoàn tác này.

![Hình 2.14: Sơ đồ tuần tự — Xóa tài khoản người dùng](assets/report/tk09_seq.png)

![Hình 2.15: Sơ đồ hoạt động — Xóa tài khoản người dùng](assets/report/tk09_act.png)

##### Chức năng 10: Thêm công thức vào yêu thích

API `POST /api/favorites/toggle` cho phép người dùng bật yêu thích đối với một công thức hoặc nguyên liệu (`targetType = RECIPE | INGREDIENT`). Bảng `favorites` có ràng buộc duy nhất theo bộ (userId, targetId, targetType) nên mỗi đối tượng chỉ được yêu thích đúng một lần, tránh ghi trùng khi người dùng bấm nhiều lần.

##### Chức năng 11: Bỏ yêu thích

Bỏ yêu thích được hiện thực bằng chính thao tác toggle: khi đối tượng đã ở trạng thái yêu thích, lần gọi kế tiếp sẽ gỡ bản ghi khỏi bảng `favorites`. Client đồng thời cập nhật giao diện (biểu tượng tim rỗng) và danh sách yêu thích được tải lại từ `GET /api/favorites`.

#### 2.2.5 Đặc tả chức năng Quản lý tủ lạnh

Quản lý tủ lạnh là chức năng lõi của FoodX, hiện thực tại **inventory-service** (cổng 8082) với tiền tố API `/api/fridge`. Người dùng theo dõi thực phẩm cá nhân theo thời gian thực, thêm – sửa – xóa thực phẩm, gộp các bản ghi trùng lặp, cập nhật hạn dùng và tra cứu dinh dưỡng. Đặc tả được thể hiện qua sơ đồ phân rã use case, bảng mô tả use case và bảng mô tả hoạt động chi tiết cho từng chức năng con; riêng chức năng *Thêm thực phẩm mới* được thể hiện đầy đủ bằng cặp sơ đồ tuần tự – hoạt động.

![Hình 2.16: Sơ đồ phân rã chức năng Quản lý tủ lạnh](assets/report/tl_uc.png)

**Mô tả use case Quản lý tủ lạnh:**

| STT | Tên Usecase | Mô tả hoạt động |
| --- | --- | --- |
| 1 | Đăng nhập | Người dùng thực hiện đăng nhập tài khoản vào hệ thống để xác thực quyền trước khi thực hiện các thao tác quản lý tủ lạnh cá nhân. |
| 2 | Xem thực phẩm trong tủ | Người dùng tra cứu, xem danh sách và thông tin chi tiết các loại thực phẩm hiện có trong tủ lạnh (tên thực phẩm, số lượng, đơn vị tính, ngày hết hạn, tình trạng còn hạn/cận hạn/hết hạn, giá trị dinh dưỡng). |
| 3 | Thêm thực phẩm vào tủ | Người dùng nhập thông tin thực phẩm mới (tên thực phẩm, số lượng, đơn vị, hạn sử dụng) hoặc quét ảnh bằng AI để hệ thống tự động nhận diện và lưu trữ vào tủ lạnh. |
| 4 | Sửa thực phẩm (HSD/Số lượng) | Người dùng chỉnh sửa, cập nhật lại các thông tin của thực phẩm đã có trong tủ (tăng/giảm số lượng tiêu thụ hàng ngày, cập nhật lại ngày hết hạn sử dụng, gộp các món trùng lặp) khi có biến động. |
| 5 | Xóa thực phẩm khỏi tủ | Người dùng thực hiện gỡ bỏ/xóa thông tin thực phẩm khỏi cơ sở dữ liệu tủ lạnh khi đã tiêu thụ hết, dọn sạch thực phẩm bị hỏng/hết hạn, hoặc dọn toàn bộ tủ lạnh. |

##### Xem thực phẩm

Về hiện thực, API `GET /api/fridge` trả về danh sách thực phẩm của người dùng đang đăng nhập (xác định qua JWT), kèm ngày hết hạn để gán nhãn trạng thái còn hạn / cận hạn / hết hạn.

**Bảng mô tả hoạt động chi tiết — Xem thực phẩm:**

| Mục | Nội dung chi tiết |
| --- | --- |
| Tên Usecase | Xem thực phẩm |
| Mô tả | Người dùng có thể tra cứu, xem danh sách và thông tin chi tiết các loại thực phẩm hiện có trong tủ lạnh theo trạng thái hạn dùng, phân loại và số lượng tồn. |
| Tác nhân | Người dùng |
| Tác nhân kích hoạt | Người dùng chọn chức năng "Quản lý tủ lạnh" hoặc chọn "Xem danh sách thực phẩm". |
| Điều kiện tiên quyết | Người dùng đã đăng nhập thành công vào hệ thống và có quyền truy cập vào tủ lạnh cá nhân. |
| Hậu điều kiện | Danh sách các thực phẩm cùng hạn sử dụng và số lượng được hiển thị đầy đủ trên giao diện hệ thống. |
| Luồng sự kiện chính | • Người dùng truy cập vào màn hình "Quản lý tủ lạnh".<br>• Hệ thống tiếp nhận yêu cầu và gửi truy vấn dữ liệu đến cơ sở dữ liệu theo định danh người dùng.<br>• Cơ sở dữ liệu thực hiện tìm kiếm và trả về danh sách toàn bộ thực phẩm hiện có.<br>• Hệ thống kiểm tra hạn sử dụng, tự động gắn nhãn trạng thái (Còn hạn, Cận hạn, Hết hạn) và hiển thị kết quả lên giao diện.<br>• Người dùng xem danh sách hoặc chọn lọc theo phân loại (Rau củ, Thịt cá, Đồ uống, v.v.). |
| Luồng thay thế | Nếu trong tủ lạnh chưa có thực phẩm nào, hệ thống hiển thị thông báo "Tủ lạnh của bạn đang trống" kèm nút gợi ý "Thêm thực phẩm mới". |
| Ngoại lệ | Nếu có lỗi kết nối cơ sở dữ liệu hoặc lỗi hệ thống trong quá trình tải dữ liệu, hệ thống hiển thị thông báo lỗi và yêu cầu người dùng thử lại sau. |
| Quy tắc nghiệp vụ | • Chỉ hiển thị danh sách thực phẩm thuộc tài khoản của người dùng đang đăng nhập.<br>• Tự động phân loại màu sắc cảnh báo theo thời gian thực (Real-time): Xanh (còn hạn), Vàng (cận hạn 3 ngày), Đỏ (đã quá hạn). |
| Yêu cầu phi chức năng | • Thời gian phản hồi và hiển thị danh sách không quá 2 giây.<br>• Giao diện hiển thị trực quan, hỗ trợ tốt trên cả máy tính và thiết bị di động. |

##### Thêm thực phẩm mới

API `POST /api/fridge` nhận thông tin thực phẩm (tên, số lượng, đơn vị, hạn dùng, dinh dưỡng); hỗ trợ thêm hàng loạt qua `/api/fridge/batch`, tự gộp với món trùng tên và cùng hạn dùng, đồng thời hỗ trợ nhận diện thực phẩm bằng AI qua `POST /api/fridge/scan-image`.

![Hình 2.17: Sơ đồ tuần tự — Thêm thực phẩm mới](assets/report/tl02_seq.png)

![Hình 2.18: Sơ đồ hoạt động — Thêm thực phẩm mới](assets/report/tl02_act.png)

**Bảng mô tả hoạt động chi tiết — Thêm thực phẩm:**

| Mục | Nội dung chi tiết |
| --- | --- |
| Tên Usecase | Thêm thực phẩm |
| Mô tả | Người dùng nhập thông tin để thêm một hoặc nhiều mặt hàng thực phẩm mới vào tủ lạnh để tiện theo dõi và quản lý. |
| Tác nhân | Người dùng |
| Tác nhân kích hoạt | Người dùng nhấn nút "Thêm thực phẩm mới". |
| Điều kiện tiên quyết | Người dùng đã đăng nhập vào hệ thống và đang ở màn hình Quản lý tủ lạnh. |
| Hậu điều kiện | Thực phẩm mới được thêm thành công vào cơ sở dữ liệu và hiển thị lên danh sách thực phẩm của tủ lạnh. |
| Luồng sự kiện chính | • Người dùng chọn nút "Thêm thực phẩm mới".<br>• Hệ thống hiển thị form nhập thông tin thực phẩm (bao gồm: Tên thực phẩm, Số lượng, Đơn vị tính, Hạn sử dụng, Phân loại danh mục, Ghi chú).<br>• Người dùng nhập đầy đủ thông tin vào các trường dữ liệu và nhấn nút "Lưu".<br>• Hệ thống thực hiện kiểm tra tính hợp lệ của dữ liệu vừa nhập.<br>• Hệ thống gửi thông tin đến cơ sở dữ liệu để khởi tạo bản ghi thực phẩm mới.<br>• Cơ sở dữ liệu lưu dữ liệu thành công và gửi phản hồi xác nhận.<br>• Hệ thống hiển thị thông báo "Thêm thực phẩm thành công" và cập nhật làm mới lại danh sách trên màn hình. |
| Luồng thay thế | • Nếu người dùng nhập thiếu thông tin bắt buộc (như Tên hoặc Số lượng), hệ thống hiển thị cảnh báo lỗi màu đỏ tại trường đó và yêu cầu nhập lại.<br>• Nếu thực phẩm thêm mới trùng tên và cùng ngày hết hạn với món đã có sẵn, hệ thống hiển thị hộp thoại gợi ý: "Cộng dồn số lượng vào món hiện có".<br>• Nếu người dùng bấm nút "Hủy", hệ thống đóng form và không lưu dữ liệu. |
| Ngoại lệ | Nếu có lỗi kết nối cơ sở dữ liệu trong quá trình lưu, hệ thống hiển thị thông báo lỗi và yêu cầu người dùng thử lại sau. |
| Quy tắc nghiệp vụ | • Tên thực phẩm là bắt buộc, không được để trống.<br>• Số lượng phải là giá trị số dương (> 0).<br>• Hạn sử dụng phải có định dạng hợp lệ (ngày/tháng/năm). |
| Yêu cầu phi chức năng | • Thời gian xử lý lưu dữ liệu không quá 2 giây.<br>• Form nhập liệu hỗ trợ tự động gợi ý đơn vị tính chuẩn (kg, gam, hộp, chai,...). |

##### Sửa thông tin thực phẩm

Người dùng điều chỉnh số lượng (`PATCH /api/fridge/{id}/quantity?delta=...`), đổi hạn dùng (`PATCH /api/fridge/{id}/expiry`) hoặc sửa toàn bộ thông tin (`PUT /api/fridge/{id}`). Quy tắc nghiệp vụ: số lượng bằng 0 thì bản ghi tự bị gỡ khỏi tủ lạnh.

**Bảng mô tả hoạt động chi tiết — Sửa thực phẩm:**

| Mục | Nội dung chi tiết |
| --- | --- |
| Tên Usecase | Sửa thực phẩm |
| Mô tả | Người dùng chỉnh sửa, cập nhật lại các thông tin của thực phẩm đã có trong tủ (điều chỉnh số lượng tiêu thụ, gia hạn ngày sử dụng, đổi ghi chú). |
| Tác nhân | Người dùng |
| Tác nhân kích hoạt | Người dùng chọn một món thực phẩm và nhấn nút "Sửa" (hoặc chỉnh nhanh số lượng +/-). |
| Điều kiện tiên quyết | Người dùng đã đăng nhập vào hệ thống và thực phẩm cần chỉnh sửa đang tồn tại trong tủ lạnh. |
| Hậu điều kiện | Thông tin thực phẩm được cập nhật thành công trong cơ sở dữ liệu và hiển thị dữ liệu mới trên giao diện. |
| Luồng sự kiện chính | • Người dùng chọn món thực phẩm cần cập nhật và nhấn nút "Sửa".<br>• Hệ thống hiển thị form chỉnh sửa với các thông tin hiện tại của thực phẩm được điền sẵn.<br>• Người dùng tiến hành thay đổi các thông tin cần thiết (Số lượng, Hạn sử dụng, Vị trí ngăn tủ) và nhấn nút "Lưu".<br>• Hệ thống kiểm tra tính hợp lệ của dữ liệu chỉnh sửa.<br>• Hệ thống gửi dữ liệu cập nhật đến cơ sở dữ liệu.<br>• Cơ sở dữ liệu cập nhật thành công và gửi phản hồi.<br>• Hệ thống hiển thị thông báo "Cập nhật thực phẩm thành công" và làm mới thẻ thực phẩm đó trên giao diện. |
| Luồng thay thế | • Nếu người dùng giảm số lượng về 0, hệ thống hiển thị cảnh báo: "Số lượng bằng 0, món ăn này sẽ được gỡ khỏi tủ lạnh" và hỏi xác nhận người dùng.<br>• Nếu dữ liệu chỉnh sửa không hợp lệ (số lượng âm hoặc ngày không đúng), hệ thống báo lỗi và giữ nguyên form nhập.<br>• Nếu người dùng bấm "Hủy", hệ thống đóng form và giữ nguyên dữ liệu cũ. |
| Ngoại lệ | Nếu mất kết nối mạng hoặc lỗi cơ sở dữ liệu, hệ thống thông báo "Không thể cập nhật lúc này" và giữ nguyên trạng thái cũ. |
| Quy tắc nghiệp vụ | • Chỉ người sở hữu thực phẩm mới có quyền chỉnh sửa.<br>• Không được để trống tên thực phẩm sau khi sửa; số lượng phải > 0. |
| Yêu cầu phi chức năng | • Thời gian phản hồi thao tác sửa không quá 1.5 giây.<br>• Trạng thái hạn sử dụng (Còn hạn/Hết hạn) tự động tính toán lại ngay sau khi ngày hết hạn được thay đổi. |

##### Xóa thực phẩm

API `DELETE /api/fridge/{id}` xóa từng món, `DELETE /api/fridge/all` dọn toàn bộ tủ. Mọi thao tác đều có bước xác nhận ở giao diện để tránh bấm nhầm và chỉ tác động đến dữ liệu của chính người dùng (kiểm tra quyền sở hữu ở backend).

**Bảng mô tả hoạt động chi tiết — Xóa thực phẩm:**

| Mục | Nội dung chi tiết |
| --- | --- |
| Tên Usecase | Xóa thực phẩm |
| Mô tả | Người dùng thực hiện gỡ bỏ thông tin thực phẩm ra khỏi tủ lạnh khi đã tiêu thụ hết, dọn sạch đồ hỏng hoặc nhập sai dữ liệu. |
| Tác nhân | Người dùng |
| Tác nhân kích hoạt | Người dùng nhấn nút biểu tượng "Xóa" (thùng rác) tại món thực phẩm tương ứng. |
| Điều kiện tiên quyết | Người dùng đã đăng nhập vào hệ thống và thực phẩm cần xóa tồn tại trong tủ lạnh. |
| Hậu điều kiện | Bản ghi thực phẩm bị xóa bỏ hoàn toàn khỏi cơ sở dữ liệu và không còn hiển thị trong danh sách tủ lạnh. |
| Luồng sự kiện chính | • Người dùng nhấn nút "Xóa" tại thực phẩm cần gỡ bỏ.<br>• Hệ thống hiển thị hộp thoại (popup) xác nhận: "Bạn có chắc chắn muốn xóa thực phẩm này khỏi tủ lạnh không?".<br>• Người dùng nhấn nút xác nhận "Đồng ý xóa".<br>• Hệ thống gửi yêu cầu xóa thực phẩm (kèm ID thực phẩm) đến cơ sở dữ liệu.<br>• Cơ sở dữ liệu tiến hành xóa bản ghi tương ứng và gửi phản hồi thành công.<br>• Hệ thống hiển thị thông báo "Đã xóa thực phẩm thành công" và xóa mục đó khỏi danh sách hiển thị trên màn hình. |
| Luồng thay thế | • Nếu người dùng nhấn nút "Hủy bỏ" trong hộp thoại xác nhận, hệ thống đóng popup và không thực hiện thao tác xóa, thực phẩm vẫn được giữ nguyên trong tủ. |
| Ngoại lệ | Nếu xảy ra lỗi kết nối cơ sở dữ liệu trong quá trình xóa, hệ thống hiển thị thông báo lỗi: "Không thể xóa thực phẩm vào lúc này, vui lòng thử lại sau". |
| Quy tắc nghiệp vụ | • Thao tác xóa là vĩnh viễn, bắt buộc hệ thống phải hiển thị bước xác nhận để tránh người dùng bấm nhầm.<br>• Người dùng chỉ có quyền xóa thực phẩm trong tủ lạnh của chính mình. |
| Yêu cầu phi chức năng | • Thời gian xử lý xóa và cập nhật lại giao diện không quá 1 giây.<br>• Giao diện hộp thoại xác nhận rõ ràng, màu sắc nút phân biệt trực quan (nút Hủy màu xám, nút Xóa màu đỏ). |

#### 2.2.6 Đặc tả chức năng Quản lý nguyên liệu

Danh mục nguyên liệu (bảng `ingredients`) là dữ liệu dùng chung, đóng vai trò cầu nối giữa tủ lạnh và kho công thức — mỗi thành phần trong công thức được gắn với một nguyên liệu để thuật toán khớp tủ lạnh có thể so khớp. API `GET /api/ingredients` công khai (không cần đăng nhập) để mọi người dùng tra cứu; thao tác ghi yêu cầu JWT. Danh mục dùng chung cho mọi tài khoản nên khi mở rộng production cần tách riêng quyền quản trị.

![Hình 2.19: Sơ đồ phân rã chức năng Quản lý nguyên liệu](assets/report/nl_uc.png)

**Mô tả use case Quản lý nguyên liệu:**

| STT | Tên Usecase | Mô tả hoạt động |
| --- | --- | --- |
| 1 | Đăng nhập | Người dùng/Quản trị viên thực hiện đăng nhập tài khoản vào hệ thống để xác thực quyền trước khi thao tác với danh mục nguyên liệu. |
| 2 | Xem danh mục nguyên liệu | Người dùng/Quản trị viên tra cứu, tìm kiếm theo tên hoặc phân loại nhóm (rau củ, thịt cá, gia vị, hải sản,...) và xem thông tin chi tiết nguyên liệu (tên, đơn vị tính mặc định, calo/hàm lượng dinh dưỡng, hình ảnh). |
| 3 | Thêm nguyên liệu | Người dùng/Quản trị viên nhập thông tin chi tiết của nguyên liệu mới (tên nguyên liệu, danh mục phân loại, đơn vị đo chuẩn, định lượng dinh dưỡng) để khởi tạo nguyên liệu mới vào cơ sở dữ liệu. |
| 4 | Sửa thông tin nguyên liệu | Người dùng/Quản trị viên chỉnh sửa, cập nhật lại thông tin nguyên liệu đã có (thay đổi tên, phân loại danh mục, điều chỉnh đơn vị tính hoặc thông số calo) khi có sai sót hoặc cập nhật mới. |
| 5 | Xóa nguyên liệu | Người dùng/Quản trị viên thực hiện gỡ bỏ/xóa thông tin nguyên liệu khỏi cơ sở dữ liệu đối với các nguyên liệu không còn sử dụng hoặc do nhập sai dữ liệu. |

##### Xem danh mục nguyên liệu

Người dùng và quản trị viên tra cứu theo tên hoặc nhóm phân loại; chức năng tìm kiếm không phân biệt hoa/thường và hỗ trợ tìm kiếm không dấu. Kết quả hiển thị kèm hình ảnh và thông tin dinh dưỡng của từng nguyên liệu.

**Bảng mô tả hoạt động chi tiết — Xem danh mục nguyên liệu:**

| Mục | Nội dung chi tiết |
| --- | --- |
| Tên Usecase | Xem danh mục nguyên liệu |
| Mô tả | Người dùng/Quản trị viên có thể tra cứu, xem danh sách và tìm kiếm thông tin chi tiết của các nguyên liệu có trong hệ thống theo tên hoặc nhóm phân loại. |
| Tác nhân | Người dùng, Quản trị viên |
| Tác nhân kích hoạt | Người dùng chọn chức năng "Quản lý nguyên liệu" hoặc nhập từ khóa tìm kiếm nguyên liệu. |
| Điều kiện tiên quyết | Người dùng đã đăng nhập vào hệ thống và có quyền truy cập module nguyên liệu. |
| Hậu điều kiện | Danh sách các nguyên liệu (Tên, Loại, Đơn vị tính, Lượng calo) được hiển thị đầy đủ trên giao diện. |
| Luồng sự kiện chính | • Người dùng truy cập vào màn hình "Quản lý nguyên liệu".<br>• Hệ thống tiếp nhận yêu cầu và gửi truy vấn đến cơ sở dữ liệu để lấy danh mục nguyên liệu.<br>• Cơ sở dữ liệu thực hiện truy vấn và trả về danh sách các nguyên liệu.<br>• Hệ thống hiển thị danh sách nguyên liệu kèm hình ảnh và thông tin chi tiết.<br>• Người dùng có thể lọc theo nhóm (Rau củ, Thịt cá, Gia vị,...) hoặc gõ tên nguyên liệu vào ô tìm kiếm. |
| Luồng thay thế | Nếu không có nguyên liệu nào khớp với từ khóa tìm kiếm, hệ thống hiển thị thông báo "Không tìm thấy nguyên liệu phù hợp" và gợi ý tạo nguyên liệu mới. |
| Ngoại lệ | Nếu có lỗi kết nối cơ sở dữ liệu hoặc lỗi hệ thống, hệ thống hiển thị thông báo lỗi và yêu cầu thử lại sau. |
| Quy tắc nghiệp vụ | • Cho phép tìm kiếm không phân biệt chữ hoa, chữ thường và hỗ trợ tìm kiếm gần đúng (gõ không dấu hoặc có dấu). |
| Yêu cầu phi chức năng | • Thời gian tải danh sách và phản hồi tìm kiếm không quá 1.5 giây.<br>• Giao diện hiển thị dạng bảng hoặc thẻ trực quan, dễ theo dõi. |

##### Thêm nguyên liệu

Tên nguyên liệu là duy nhất (ràng buộc unique) — hệ thống kiểm tra trùng trước khi ghi; đơn vị tính phải thuộc danh mục chuẩn và chỉ số calo được validate là số không âm.

**Bảng mô tả hoạt động chi tiết — Thêm nguyên liệu:**

| Mục | Nội dung chi tiết |
| --- | --- |
| Tên Usecase | Thêm nguyên liệu |
| Mô tả | Người dùng/Quản trị viên khởi tạo và thêm mới một loại nguyên liệu vào danh mục dữ liệu của hệ thống. |
| Tác nhân | Người dùng, Quản trị viên |
| Tác nhân kích hoạt | Người dùng nhấn nút "Thêm nguyên liệu mới". |
| Điều kiện tiên quyết | Người dùng đã đăng nhập vào hệ thống và đang ở màn hình Quản lý nguyên liệu. |
| Hậu điều kiện | Nguyên liệu mới được lưu thành công vào cơ sở dữ liệu và hiển thị trên danh mục chung. |
| Luồng sự kiện chính | • Người dùng chọn nút "Thêm nguyên liệu mới".<br>• Hệ thống hiển thị form nhập thông tin (bao gồm: Tên nguyên liệu, Nhóm phân loại, Đơn vị tính chuẩn, Lượng calo ước tính, Ghi chú/Ảnh).<br>• Người dùng nhập đầy đủ thông tin và nhấn nút "Lưu".<br>• Hệ thống kiểm tra tính hợp lệ của dữ liệu và kiểm tra tên nguyên liệu đã tồn tại hay chưa.<br>• Hệ thống gửi yêu cầu lưu bản ghi nguyên liệu mới vào cơ sở dữ liệu.<br>• Cơ sở dữ liệu lưu trữ thành công và trả về phản hồi.<br>• Hệ thống hiển thị thông báo "Tạo nguyên liệu thành công" và làm mới lại danh sách trên màn hình. |
| Luồng thay thế | • Nếu người dùng để trống tên nguyên liệu hoặc chọn sai định dạng đơn vị, hệ thống hiển thị cảnh báo lỗi tại ô nhập liệu tương ứng.<br>• Nếu tên nguyên liệu đã tồn tại trong hệ thống, hệ thống báo lỗi: "Nguyên liệu này đã có trong danh mục, vui lòng kiểm tra lại", giữ nguyên form.<br>• Nếu người dùng bấm "Hủy", hệ thống đóng form và hủy thao tác. |
| Ngoại lệ | Nếu mất kết nối mạng hoặc lỗi cơ sở dữ liệu, hệ thống thông báo "Không thể lưu nguyên liệu vào lúc này, vui lòng thử lại sau". |
| Quy tắc nghiệp vụ | • Tên nguyên liệu là duy nhất (không được trùng lặp).<br>• Đơn vị tính phải chọn theo danh mục chuẩn (g, kg, ml, lít, củ, quả, thìa,...).<br>• Chỉ số calo (nếu nhập) phải là số không âm (>= 0). |
| Yêu cầu phi chức năng | • Thời gian xử lý thêm mới không quá 2 giây.<br>• Giao diện tự động focus vào ô Tên nguyên liệu khi vừa mở form. |

##### Sửa thông tin nguyên liệu

Phát hiện trùng tên khi đổi tên sẽ trả về lỗi và giữ nguyên form nhập; dữ liệu hợp lệ được ghi cập nhật và làm mới danh mục ngay trên giao diện.

**Bảng mô tả hoạt động chi tiết — Sửa nguyên liệu:**

| Mục | Nội dung chi tiết |
| --- | --- |
| Tên Usecase | Sửa thông tin nguyên liệu |
| Mô tả | Người dùng/Quản trị viên cập nhật, điều chỉnh lại các thông tin của nguyên liệu đã có (tên, phân loại nhóm, đơn vị tính mặc định, chỉ số calo). |
| Tác nhân | Người dùng, Quản trị viên |
| Tác nhân kích hoạt | Người dùng chọn một nguyên liệu và nhấn nút "Sửa". |
| Điều kiện tiên quyết | Người dùng đã đăng nhập vào hệ thống và nguyên liệu cần sửa tồn tại trong cơ sở dữ liệu. |
| Hậu điều kiện | Dữ liệu nguyên liệu được cập nhật thành công trong cơ sở dữ liệu và hiển thị thông tin mới trên danh mục. |
| Luồng sự kiện chính | • Người dùng chọn nguyên liệu cần chỉnh sửa trên bảng và nhấn nút "Sửa".<br>• Hệ thống hiển thị form chỉnh sửa với thông tin hiện có của nguyên liệu được điền sẵn.<br>• Người dùng thay đổi các thông tin cần điều chỉnh (Tên, Đơn vị tính, Lượng calo, Mô tả) và nhấn nút "Lưu".<br>• Hệ thống kiểm tra tính hợp lệ của dữ liệu chỉnh sửa.<br>• Hệ thống gửi dữ liệu cập nhật đến cơ sở dữ liệu.<br>• Cơ sở dữ liệu cập nhật dữ liệu thành công và trả về phản hồi.<br>• Hệ thống hiển thị thông báo "Cập nhật nguyên liệu thành công" và làm mới lại dòng thông tin nguyên liệu đó. |
| Luồng thay thế | • Nếu người dùng sửa tên nguyên liệu trùng với một nguyên liệu khác đã tồn tại, hệ thống báo lỗi "Tên nguyên liệu đã được sử dụng" và yêu cầu sửa lại.<br>• Nếu dữ liệu không hợp lệ, hệ thống hiển thị thông báo lỗi và không gửi lưu.<br>• Nếu người dùng bấm "Hủy", hệ thống đóng form và giữ nguyên dữ liệu ban đầu. |
| Ngoại lệ | Nếu có sự cố đường truyền hoặc lỗi hệ thống, hiển thị thông báo lỗi và giữ nguyên trạng thái cũ. |
| Quy tắc nghiệp vụ | • Không được để trống tên nguyên liệu sau khi sửa.<br>• Lượng calo điều chỉnh phải là số hợp lệ (>= 0). |
| Yêu cầu phi chức năng | • Thời gian cập nhật và phản hồi kết quả không quá 1.5 giây. |

##### Xóa nguyên liệu

Bắt buộc có bước xác nhận. Về toàn vẹn dữ liệu, quy tắc nghiệp vụ là không cho phép xóa cứng đối với nguyên liệu đang được liên kết trong các công thức hoặc đang có trong tủ lạnh để bảo đảm thuật toán so khớp không bị gãy liên kết.

**Bảng mô tả hoạt động chi tiết — Xóa nguyên liệu:**

| Mục | Nội dung chi tiết |
| --- | --- |
| Tên Usecase | Xóa nguyên liệu |
| Mô tả | Người dùng/Quản trị viên thực hiện xóa bỏ thông tin nguyên liệu khỏi danh mục hệ thống khi không còn sử dụng hoặc do nhập sai. |
| Tác nhân | Người dùng, Quản trị viên |
| Tác nhân kích hoạt | Người dùng nhấn nút biểu tượng "Xóa" tại nguyên liệu cần xóa. |
| Điều kiện tiên quyết | Người dùng đã đăng nhập vào hệ thống và nguyên liệu cần xóa tồn tại trong cơ sở dữ liệu. |
| Hậu điều kiện | Bản ghi nguyên liệu bị xóa hoàn toàn khỏi cơ sở dữ liệu và không còn hiển thị trên danh mục. |
| Luồng sự kiện chính | • Người dùng chọn nguyên liệu cần gỡ bỏ và nhấn nút "Xóa".<br>• Hệ thống hiển thị hộp thoại xác nhận: "Bạn có chắc chắn muốn xóa nguyên liệu này không?".<br>• Người dùng chọn nút xác nhận "Đồng ý".<br>• Hệ thống gửi yêu cầu xóa nguyên liệu (kèm ID) đến cơ sở dữ liệu.<br>• Cơ sở dữ liệu thực hiện xóa bản ghi tương ứng.<br>• Hệ thống hiển thị thông báo "Đã xóa nguyên liệu thành công" và làm mới danh sách hiển thị trên màn hình. |
| Luồng thay thế | • Nếu người dùng bấm nút "Hủy bỏ" trong hộp thoại xác nhận, hệ thống đóng hộp thoại và hủy thao tác xóa.<br>• Nếu nguyên liệu này đang được liên kết trong các công thức nấu ăn hoặc món ăn trong tủ lạnh, hệ thống cảnh báo: "Nguyên liệu này đang được sử dụng trong công thức/tủ lạnh, không thể xóa" và từ chối xóa. |
| Ngoại lệ | Nếu xảy ra lỗi cơ sở dữ liệu trong quá trình xóa, hệ thống hiển thị thông báo lỗi và yêu cầu thử lại sau. |
| Quy tắc nghiệp vụ | • Thao tác xóa yêu cầu bắt buộc có bước xác nhận.<br>• Phải đảm bảo toàn vẹn dữ liệu: không cho phép xóa cứng nếu nguyên liệu đang có ràng buộc khóa ngoại (foreign key) với các bảng khác. |
| Yêu cầu phi chức năng | • Thời gian thực thi thao tác xóa không quá 1 giây.<br>• Giao diện popup xác nhận hiển thị cảnh báo rõ ràng. |

#### 2.2.7 Đặc tả chức năng Quản lý danh sách mua đồ

Danh sách đi chợ hiện thực tại **plan-shopping-service** (cổng 8084) với API `/api/shopping`. Điểm nổi bật của chức năng là tính năng *tự nạp tủ lạnh*: khi người dùng tích món đã mua (`PATCH /api/shopping/{id}/toggle`), hệ thống tự parse số lượng – đơn vị, cộng dồn vào thực phẩm sẵn có hoặc tạo mới thực phẩm trong tủ lạnh với hạn dùng mặc định. Danh sách được đồng bộ theo tài khoản và tối ưu cho màn hình di động khi đi chợ.

![Hình 2.20: Sơ đồ phân rã chức năng Quản lý danh sách mua đồ](assets/report/dc_uc.png)

**Mô tả use case Quản lý danh sách mua đồ:**

| STT | Tên Usecase | Mô tả hoạt động |
| --- | --- | --- |
| 1 | Đăng nhập | Người dùng thực hiện đăng nhập tài khoản vào hệ thống để xác thực quyền quản lý danh sách mua sắm cá nhân. |
| 2 | Xem danh sách cần mua | Người dùng xem toàn bộ danh sách các món đồ cần đi chợ/siêu thị, lọc theo trạng thái (chưa mua / đã mua) kèm số lượng, đơn vị và ghi chú chi tiết. |
| 3 | Thêm món cần mua | Người dùng nhập thông tin món hàng cần mua mới (tên món, số lượng dự kiến mua, đơn vị tính) hoặc tự động thêm từ danh sách thiếu nguyên liệu nấu ăn vào cơ sở dữ liệu. |
| 4 | Sửa món đã mua | Người dùng chỉnh sửa, cập nhật lại thông tin của món hàng (thay đổi số lượng, đơn vị tính, đổi tên món hoặc tích chọn chuyển đổi trạng thái đã mua/chưa mua) khi có điều chỉnh thực tế. |
| 5 | Xóa / Dọn dẹp món đã mua | Người dùng thực hiện xóa từng món hàng khỏi danh sách mua sắm hoặc dùng chức năng dọn sạch toàn bộ các món đã mua xong để làm mới danh sách. |

##### Xem danh sách mua đồ

Danh sách phân tách rõ hai nhóm "Cần mua" và "Đã mua xong", tự động đưa món đã mua xuống cuối để người dùng dễ theo dõi các món còn lại.

**Bảng mô tả hoạt động chi tiết — Xem danh sách mua đồ:**

| Mục | Nội dung chi tiết |
| --- | --- |
| Tên Usecase | Xem danh sách mua đồ |
| Mô tả | Người dùng xem toàn bộ danh sách các món đồ cần mua sắm khi đi chợ hoặc siêu thị, được phân chia theo trạng thái đã mua hoặc chưa mua. |
| Tác nhân | Người dùng |
| Tác nhân kích hoạt | Người dùng chọn chức năng "Danh sách mua sắm" trên menu chính. |
| Điều kiện tiên quyết | Người dùng đã đăng nhập thành công vào hệ thống. |
| Hậu điều kiện | Danh sách các mặt hàng cần mua kèm số lượng, đơn vị được hiển thị đầy đủ trên màn hình. |
| Luồng sự kiện chính | • Người dùng truy cập vào màn hình "Danh sách mua sắm".<br>• Hệ thống gửi yêu cầu truy vấn danh sách món mua thuộc tài khoản người dùng tới cơ sở dữ liệu.<br>• Cơ sở dữ liệu trả về toàn bộ dữ liệu các món mua.<br>• Hệ thống hiển thị danh sách trực quan, phân tách rõ ràng giữa các món "Cần mua" và các món "Đã mua xong".<br>• Người dùng xem danh sách để chuẩn bị hoặc thực hiện đi chợ. |
| Luồng thay thế | Nếu danh sách mua sắm hiện đang trống, hệ thống hiển thị thông báo: "Danh sách mua sắm của bạn đang trống" kèm ô gợi ý "Thêm món mới ngay". |
| Ngoại lệ | Nếu có lỗi kết nối cơ sở dữ liệu hoặc lỗi mạng, hệ thống hiển thị thông báo lỗi và yêu cầu người dùng thử lại sau. |
| Quy tắc nghiệp vụ | • Chỉ hiển thị danh sách mua sắm của tài khoản đang đăng nhập.<br>• Tự động nhóm các món đã mua xuống cuối danh sách để người dùng dễ theo dõi các món còn lại. |
| Yêu cầu phi chức năng | • Thời gian tải danh sách không quá 1.5 giây.<br>• Giao diện tối ưu hóa cho màn hình điện thoại di động giúp người dùng thuận tiện xem khi đang đi chợ. |

##### Thêm món vào danh sách mua đồ

Trạng thái mặc định của món mới là chưa mua (`done = false`); tên món là bắt buộc; hỗ trợ thêm nhanh bằng cách nhập tên và nhấn Enter.

**Bảng mô tả hoạt động chi tiết — Thêm món vào danh sách mua đồ:**

| Mục | Nội dung chi tiết |
| --- | --- |
| Tên Usecase | Thêm món vào danh sách mua đồ |
| Mô tả | Người dùng nhập và lưu thêm một món hàng cần mua sắm vào danh sách. |
| Tác nhân | Người dùng |
| Tác nhân kích hoạt | Người dùng nhấn nút "Thêm món cần mua" (hoặc nhập nhanh vào thanh nhập liệu). |
| Điều kiện tiên quyết | Người dùng đã đăng nhập vào hệ thống và đang ở màn hình Danh sách mua đồ. |
| Hậu điều kiện | Món hàng mới được lưu thành công vào cơ sở dữ liệu và hiển thị ngay trên đầu danh sách cần mua. |
| Luồng sự kiện chính | • Người dùng chọn nút "Thêm món cần mua".<br>• Hệ thống hiển thị form nhập thông tin (bao gồm: Tên món, Số lượng cần mua, Đơn vị tính, Ghi chú).<br>• Người dùng điền các thông tin và nhấn nút "Lưu" (hoặc bấm phím Enter).<br>• Hệ thống kiểm tra tính hợp lệ của dữ liệu vừa nhập.<br>• Hệ thống gửi yêu cầu lưu bản ghi mới vào cơ sở dữ liệu với trạng thái mặc định là "Chưa mua" (bought = false).<br>• Cơ sở dữ liệu lưu thành công và trả về phản hồi.<br>• Hệ thống hiển thị thông báo "Đã thêm vào danh sách mua" và làm mới lại danh sách trên màn hình. |
| Luồng thay thế | • Nếu người dùng để trống tên món, hệ thống hiển thị cảnh báo đỏ "Vui lòng nhập tên món đồ cần mua".<br>• Nếu món đồ này đã có trong danh sách nhưng chưa mua, hệ thống gợi ý: "Món này đã có trong danh sách, bạn có muốn cộng dồn số lượng không?".<br>• Nếu người dùng bấm "Hủy", hệ thống đóng form và không lưu dữ liệu. |
| Ngoại lệ | Nếu mất kết nối mạng hoặc lỗi cơ sở dữ liệu, hệ thống thông báo "Không thể lưu món đồ lúc này, vui lòng thử lại sau". |
| Quy tắc nghiệp vụ | • Tên món đồ là bắt buộc, không được để trống.<br>• Số lượng dự kiến mua phải là số dương (> 0), mặc định nếu không nhập là 1. |
| Yêu cầu phi chức năng | • Thao tác thêm nhanh (nhập tên và Enter) phản hồi trong vòng dưới 1 giây. |

##### Sửa danh sách mua đồ

Cho phép đổi tên, số lượng, đơn vị và ghi chú; dữ liệu phải qua bước kiểm tra hợp lệ (Condition) ở lớp xử lý trước khi ghi xuống cơ sở dữ liệu.

**Bảng mô tả hoạt động chi tiết — Sửa danh sách mua đồ:**

| Mục | Nội dung chi tiết |
| --- | --- |
| Tên Usecase | Sửa danh sách mua đồ (Sửa món cần mua) |
| Mô tả | Người dùng có thể chỉnh sửa, cập nhật lại thông tin của các món hàng đã có trong danh sách mua sắm (tên món, số lượng cần mua, đơn vị tính, ghi chú) khi có sự thay đổi. |
| Tác nhân | Người dùng |
| Tác nhân kích hoạt | Người dùng chọn món cần sửa và nhấn nút "Sửa" trên màn hình quản lý danh sách mua đồ. |
| Điều kiện tiên quyết | Người dùng đã đăng nhập vào hệ thống và món hàng cần sửa đang tồn tại trong danh sách mua đồ. |
| Hậu điều kiện | Thông tin món hàng được cập nhật thành công vào cơ sở dữ liệu và hiển thị dữ liệu mới trên danh sách mua đồ. |
| Luồng sự kiện chính | -Người dùng truy cập vào Màn hình quản lý danh sách mua đồ.<br>-Hệ thống gửi yêu cầu và CSDL lấy danh sách thông tin món cần mua.<br>-Hệ thống hiện danh sách thông tin món cần mua lên màn hình.<br>-Người dùng chọn món cần sửa và nhấn nút "Sửa".<br>-Hệ thống (Form QLDS) hiển thị form sửa và điền sẵn dữ liệu cũ của món hàng.<br>-Người dùng thực hiện nhập thông tin mới muốn sửa và nhấn nút "Lưu".<br>-Form QLDS gửi thông tin cập nhật sang bộ phận Xử lý.<br>-Bộ phận Xử lý thực hiện kiểm tra tính hợp lệ của dữ liệu.<br>-Hệ thống gửi lệnh cập nhật thông tin món đến CSDL.<br>-CSDL thực hiện ghi dữ liệu và phản hồi ghi dữ liệu thành công.<br>-Bộ phận Xử lý trả kết quả thành công về cho Form QLDS.<br>-Hệ thống hiển thị thông báo sửa thành công (Hiện lưu thông tin món thành công) và làm mới lại danh sách. |
| Luồng thay thế | • Tại bước kiểm tra dữ liệu (Condition [Sai]): Nếu thông tin nhập vào không hợp lệ (tên món để trống, số lượng không hợp lệ), hệ thống báo lỗi và quay trở lại bước hiển thị form để người dùng nhập lại.<br>• Nếu người dùng nhấn "Hủy bỏ": Hệ thống đóng form sửa và giữ nguyên thông tin ban đầu của món đồ. |
| Ngoại lệ | Nếu xảy ra lỗi kết nối cơ sở dữ liệu hoặc sự cố hệ thống trong quá trình cập nhật, hệ thống hiển thị thông báo lỗi và yêu cầu người dùng thử lại sau. |
| Quy tắc nghiệp vụ | • Tên món đồ sau khi sửa là bắt buộc, không được để trống.<br>• Số lượng món cần mua phải là số dương (> 0).<br>• Chỉ người dùng sở hữu danh sách mới có quyền chỉnh sửa các món đồ của mình. |
| Yêu cầu phi chức năng | • Thời gian phản hồi và lưu thông tin cập nhật không quá 1.5 giây.<br>• Giao diện form sửa hiển thị trực quan, tự động focus vào ô dữ liệu cần chỉnh sửa. |

##### Xóa món trong danh sách mua đồ

Xóa từng món hoặc dọn hàng loạt các món đã mua (`DELETE /api/shopping/done`); mọi thao tác xóa đều có hộp thoại xác nhận để tránh bấm nhầm khi người dùng đang di chuyển (sử dụng trên điện thoại).

**Bảng mô tả hoạt động chi tiết — Xóa món trong danh sách mua đồ:**

| Mục | Nội dung chi tiết |
| --- | --- |
| Tên Usecase | Xóa món trong danh sách mua đồ |
| Mô tả | Người dùng xóa từng món đồ không còn nhu cầu mua nữa, hoặc sử dụng tính năng dọn sạch toàn bộ các món đã mua hoàn tất. |
| Tác nhân | Người dùng |
| Tác nhân kích hoạt | Người dùng nhấn biểu tượng "Xóa" tại món hàng (hoặc nhấn nút "Dọn dẹp món đã mua"). |
| Điều kiện tiên quyết | Người dùng đã đăng nhập vào hệ thống và món hàng cần xóa tồn tại trong danh sách. |
| Hậu điều kiện | Món hàng bị xóa bỏ hoàn toàn khỏi cơ sở dữ liệu và biến mất khỏi giao diện danh sách mua đồ. |
| Luồng sự kiện chính | • Người dùng nhấn nút "Xóa" tại món hàng không muốn mua nữa.<br>• Hệ thống hiển thị hộp thoại xác nhận: "Bạn có chắc chắn muốn xóa món này khỏi danh sách mua sắm?".<br>• Người dùng chọn xác nhận "Đồng ý xóa".<br>• Hệ thống gửi yêu cầu xóa bản ghi đến cơ sở dữ liệu.<br>• Cơ sở dữ liệu thực hiện xóa món hàng tương ứng.<br>• Hệ thống hiển thị thông báo "Đã xóa món đồ thành công" và loại bỏ mục đó khỏi danh sách hiển thị. |
| Luồng thay thế | • Nếu người dùng bấm "Hủy bỏ" trong hộp thoại xác nhận, hệ thống đóng thông báo và giữ nguyên món hàng.<br>• Nếu người dùng chọn nút "Dọn dẹp món đã mua", hệ thống gửi lệnh xóa hàng loạt tất cả các món có trạng thái bought = true. |
| Ngoại lệ | Nếu xảy ra sự cố cơ sở dữ liệu trong khi xóa, hệ thống báo lỗi "Không thể xóa món hàng lúc này, vui lòng thử lại sau". |
| Quy tắc nghiệp vụ | • Thao tác xóa từng món hoặc xóa hàng loạt là vĩnh viễn, bắt buộc hệ thống phải hiển thị thông báo xác nhận để tránh bấm nhầm khi đang di chuyển. |
| Yêu cầu phi chức năng | • Thời gian thực thi thao tác xóa và cập nhật lại danh sách không quá 1 giây. |

---

### 2.3 Thiết kế kiến trúc hệ thống

Toàn bộ hệ thống FoodX được thiết kế theo kiến trúc hướng dịch vụ nhiều tầng phân tán, tách biệt tuyệt đối giữa Frontend và Backend:

```mermaid
flowchart TD
    subgraph ClientLayer [Tầng Ứng dụng Khách - Client Layer]
        SPA[Web Single Page Application - HTML5/CSS3/Vanilla JS]
    end

    subgraph GatewayLayer [Tầng Cổng Giao Tiếp - Gateway Layer]
        APIGW[Spring Cloud Gateway - Port 8080<br/>• Reverse Proxy & JWT Verification<br/>• CORS & Rate Limiting Filter<br/>• Static Resource Host]
    end

    subgraph ServiceLayer [Tầng Dịch Vụ Nghiệp Vụ - Backend Microservices]
        S1[user-service :8081<br/>Auth & Profile]
        S2[inventory-service :8082<br/>Tủ lạnh & Nguyên liệu]
        S3[recipe-service :8083<br/>Kho công thức & Match món]
        S4[plan-shopping-service :8084<br/>Kế hoạch ăn & Đi chợ]
        S5[ai-service :8085<br/>AI Gemini / Groq LLM]
        S6[social-stats-service :8086<br/>Mạng xã hội & Thống kê]
    end

    subgraph DataLayer [Tầng Dữ Liệu & Bên Thứ Ba]
        MySQL[(MySQL 8.0 Database)]
        Redis[(Redis 7 Cache)]
        LLM[Google Gemini / Groq Cloud]
    end

    SPA -->|HTTP / RESTful API Request| APIGW
    APIGW -->|/api/auth/**, /api/profile/**| S1
    APIGW -->|/api/fridge/**, /api/ingredients/**| S2
    APIGW -->|/api/recipes/**, /api/home| S3
    APIGW -->|/api/plans/**, /api/shopping/**| S4
    APIGW -->|/api/ai/**| S5
    APIGW -->|/api/social/**, /api/stats/**| S6

    S1 & S2 & S3 & S4 & S6 --> MySQL
    APIGW & S5 --> Redis
    S5 --> LLM
```

#### Trách nhiệm của các tầng:
* **Client Layer (Giao diện):** Đảm nhiệm việc kết xuất UI, quản lý state cục bộ, gửi asynchronous requests tới Gateway, bắt lỗi và phản hồi trực quan cho người dùng.
* **Gateway Layer (Điều phối):** Tiếp nhận toàn bộ lưu lượng cổng 8080, kiểm tra tính hợp lệ của Header và Token JWT, ngăn chặn các đợt tấn công từ chối dịch vụ thông qua bộ đếm Rate Limiting, định tuyến chính xác đến các service nội bộ.
* **Service Layer (Nghiệp vụ):** Mỗi service quản lý một nhóm thực thể nghiệp vụ độc lập, tổ chức theo kiến trúc Controller $\rightarrow$ Service $\rightarrow$ Repository.
* **Data Layer (Lưu trữ):** Đảm bảo tính toàn vẹn dữ liệu qua cơ sở dữ liệu quan hệ ACID (MySQL) và tối ưu tốc độ đọc bằng bộ đệm (Redis).

---

### 2.4 Thiết kế dữ liệu

#### 2.4.1 Sơ đồ thực thể quan hệ (ERD)

```mermaid
erDiagram
    USERS ||--o{ FRIDGE_ITEMS : "sở hữu"
    USERS ||--o{ RECIPES : "tạo"
    USERS ||--o{ MEAL_PLANS : "lên lịch"
    USERS ||--o{ SHOPPING_ITEMS : "mua sắm"
    RECIPES ||--|{ RECIPE_INGREDIENTS : "chứa"
    INGREDIENTS ||--o{ RECIPE_INGREDIENTS : "tham chiếu"

    USERS {
        bigint id PK
        varchar username UK
        varchar email UK
        varchar password
        varchar full_name
        varchar role
        datetime created_at
    }

    FRIDGE_ITEMS {
        bigint id PK
        bigint user_id FK
        varchar name
        varchar type
        double quantity
        varchar unit
        date expires_at
        double kcal
        text note
    }

    RECIPES {
        bigint id PK
        bigint author_id FK
        varchar title
        text description
        text instructions
        varchar category
        varchar cuisine
        int cook_time
        varchar difficulty
    }

    INGREDIENTS {
        bigint id PK
        varchar name UK
        varchar default_unit
        double calo_per_100g
    }

    RECIPE_INGREDIENTS {
        bigint id PK
        bigint recipe_id FK
        bigint ingredient_id FK
        double quantity
        varchar unit
    }

    MEAL_PLANS {
        bigint id PK
        bigint user_id FK
        bigint recipe_id FK
        date plan_date
        varchar meal_slot
    }

    SHOPPING_ITEMS {
        bigint id PK
        bigint user_id FK
        varchar item_name
        double quantity
        varchar unit
        boolean is_purchased
    }
```

#### 2.4.2 Mô tả các bảng dữ liệu cốt lõi
1. **`users`:** Lưu thông tin tài khoản người dùng, mật khẩu đã mã hóa BCrypt, quyền hạn (`ROLE_USER`, `ROLE_ADMIN`).
2. **`fridge_items`:** Lưu chi tiết các thực phẩm trong kho của người dùng; khóa ngoại `user_id` liên kết tới bảng `users`. Khóa toàn vẹn: khi xóa user, các thực phẩm tương ứng sẽ bị xóa (Cascade Delete).
3. **`recipes`:** Lưu trữ thông tin công thức nấu ăn, thời gian chế biến, định lượng calo và hướng dẫn từng bước.
4. **`recipe_ingredients`:** Bảng trung gian giải quyết quan hệ nhiều - nhiều giữa `recipes` và `ingredients`, lưu số lượng và đơn vị cần cho mỗi món.
5. **`shopping_items`:** Lưu danh sách các món cần mua sắm; cờ `is_purchased` phục vụ việc tự động chuyển vào tủ lạnh khi người dùng bấm hoàn tất mua.

---

### 2.5 Thiết kế API dịch vụ

#### 2.5.1 Quy ước thiết kế API
* **Base URL:** `http://localhost:8080/api`
* **Tiêu đề Request:** `Content-Type: application/json`, `Authorization: Bearer <accessToken>`
* **Định dạng Response Envelope thành công:**
```json
{
  "success": true,
  "message": "Thông báo thành công",
  "data": { ... },
  "status": 200
}
```
* **Định dạng Response Envelope khi gặp lỗi:**
```json
{
  "success": false,
  "message": "Nội dung mô tả lỗi cụ thể",
  "data": null,
  "status": 400
}
```

#### 2.5.2 Danh sách các API chính của hệ thống

| STT | Phương thức | Endpoint | Chức năng nghiệp vụ | Quyền truy cập |
|:---:|:---:|---|---|:---:|
| 1 | `POST` | `/api/auth/register` | Đăng ký tài khoản người dùng mới | Public |
| 2 | `POST` | `/api/auth/login` | Xác thực đăng nhập và cấp mã JWT | Public |
| 3 | `GET` | `/api/auth/me` | Lấy thông tin tài khoản đang đăng nhập | Bearer JWT |
| 4 | `GET` | `/api/home` | Lấy dữ liệu công khai cho trang chủ | Public |
| 5 | `GET` | `/api/fridge` | Lấy danh sách thực phẩm trong tủ của người dùng | Bearer JWT |
| 6 | `POST` | `/api/fridge` | Thêm thực phẩm mới vào tủ lạnh | Bearer JWT |
| 7 | `PATCH` | `/api/fridge/{id}/quantity` | Tăng / giảm số lượng thực phẩm (delta) | Bearer JWT |
| 8 | `POST` | `/api/fridge/merge-duplicates` | Tự động gộp các thực phẩm trùng tên và hạn dùng | Bearer JWT |
| 9 | `DELETE`| `/api/fridge/{id}` | Xóa một món thực phẩm khỏi tủ | Bearer JWT |
| 10 | `GET` | `/api/recipes` | Danh sách công thức nấu ăn (lọc theo danh mục/vùng) | Public |
| 11 | `GET` | `/api/recipes/{id}` | Xem chi tiết công thức kèm định lượng nguyên liệu | Public |
| 12 | `GET` | `/api/recipes/match` | Tìm và xếp hạng món ăn khớp với kho tủ lạnh | Bearer JWT |
| 13 | `POST` | `/api/recipes/{id}/save` | Đánh dấu lưu / bỏ lưu công thức yêu thích | Bearer JWT |
| 14 | `GET` | `/api/plans` | Lấy kế hoạch bữa ăn trong tuần của người dùng | Bearer JWT |
| 15 | `POST` | `/api/plans` | Thêm món ăn vào lịch theo ngày và bữa ăn | Bearer JWT |
| 16 | `GET` | `/api/shopping` | Lấy danh sách đồ cần đi chợ | Bearer JWT |
| 17 | `POST` | `/api/ai/chat` | Gửi câu hỏi tư vấn dinh dưỡng cho Trợ lý AI | Bearer JWT |

#### 2.5.3 Đặc tả chi tiết một số API quan trọng

##### API 1: Khớp món ăn theo kho tủ lạnh (`GET /api/recipes/match`)
* **Endpoint:** `/api/recipes/match`
* **Method:** `GET`
* **Request Header:** `Authorization: Bearer eyJhbGciOiJIUzI1Ni...`
* **Query Parameters:** Không có.
* **Response Thành công (`200 OK`):**
```json
{
  "success": true,
  "message": "Lấy danh sách món ăn khớp tủ lạnh thành công",
  "data": [
    {
      "recipe": {
        "id": 12,
        "title": "Trứng chiên thịt băm cà chua",
        "category": "Món mặn",
        "cookTime": 15
      },
      "matchedIngredients": ["Trứng gà", "Cà chua", "Thịt heo xay"],
      "totalIngredients": 3,
      "matchPercent": 100.0
    }
  ],
  "status": 200
}
```

##### API 2: Gộp thực phẩm trùng lặp (`POST /api/fridge/merge-duplicates`)
* **Endpoint:** `/api/fridge/merge-duplicates`
* **Method:** `POST`
* **Request Header:** `Authorization: Bearer <Token>`
* **Response Thành công (`200 OK`):**
```json
{
  "success": true,
  "message": "Đã gộp thành công các thực phẩm trùng lặp trong tủ",
  "data": {
    "mergedGroupsCount": 2,
    "removedItemsCount": 3
  },
  "status": 200
}
```

---

### 2.6 Thiết kế ứng dụng Client

#### 2.6.1 Danh sách các màn hình giao diện
Ứng dụng Client được xây dựng theo mô hình Single Page Application (SPA), định tuyến động thông qua JavaScript:
1. **Màn hình Trang chủ (`HomeView`):** Banner chào mừng, danh sách món ăn thịnh hành, nhóm công thức theo danh mục món Việt.
2. **Màn hình Tủ lạnh ảo (`FridgeView`):** Quản lý trực quan các ngăn thực phẩm, thống kê calo, gắn nhãn cảnh báo hết hạn màu đỏ/vàng/xanh, nút thao tác nhanh (gộp trùng, tăng/giảm lượng).
3. **Màn hình Công thức & Khớp món (`RecipeView`):** Bộ lọc tìm kiếm đa tiêu chí, tab chuyển đổi giữa toàn bộ công thức và "Món có thể nấu ngay từ tủ lạnh".
4. **Màn hình Kế hoạch & Đi chợ (`PlanShoppingView`):** Bảng lịch thực đơn 7 ngày trong tuần, danh sách các món cần mua sắm kèm checkbox tích chọn mua.
5. **Màn hình Trợ lý AI (`AIChatView`):** Giao diện hội thoại tương tác trực tiếp với chuyên gia dinh dưỡng AI.

#### 2.6.2 Thiết kế tích hợp Client – API

Bảng ánh xạ giữa chức năng giao diện và API tiêu thụ tương ứng:

| Màn hình / Chức năng Client | Module JS xử lý | API Backend tiêu thụ | HTTP Method |
|---|---|---|:---:|
| Đăng nhập tài khoản | `auth.js` | `/api/auth/login` | `POST` |
| Tải danh sách thực phẩm trong tủ | `fridge.js` | `/api/fridge` | `GET` |
| Bấm nút tăng/giảm số lượng món | `fridge.js` | `/api/fridge/{id}/quantity` | `PATCH` |
| Gộp thực phẩm trùng hạn | `fridge.js` | `/api/fridge/merge-duplicates` | `POST` |
| Hiển thị danh sách món khớp tủ | `recipes.js` | `/api/recipes/match` | `GET` |
| Lên lịch món ăn vào thứ Hai | `plan.js` | `/api/plans` | `POST` |
| Tích chọn đã mua đồ chợ | `shopping.js` | `/api/shopping/{id}/toggle` | `PATCH` |
| Trò chuyện cùng trợ lý dinh dưỡng | `chat.js` | `/api/ai/chat` | `POST` |

---

# CHƯƠNG 3. CÀI ĐẶT VÀ TRIỂN KHAI HỆ THỐNG

### 3.1 Môi trường và công cụ phát triển

Bảng đặc tả môi trường kỹ thuật hiện thực dự án:

| Thành phần | Công nghệ / Công cụ | Phiên bản | Mục đích sử dụng cụ thể |
|---|---|:---:|---|
| **Hệ điều hành** | Microsoft Windows 11 64-bit | Pro 23H2 | Môi trường máy trạm lập trình và chạy thử nghiệm. |
| **Nền tảng Java** | OpenJDK | 17.0.10 | Biên dịch và thực thi mã nguồn máy chủ Backend. |
| **Khung ứng dụng** | Spring Boot & Spring Cloud | 3.x / 4.x | Cung cấp khung REST Controller, JPA ORM và Gateway Routing. |
| **Cơ sở dữ liệu** | MySQL Server Community | 8.0.36 | Lưu trữ cơ sở dữ liệu quan hệ `foodx`. |
| **Bộ đệm & Cache** | Redis Server | 7.2 | Hỗ trợ lưu trữ rate limit key và cache phiên. |
| **Công cụ đóng gói** | Apache Maven | 3.9+ | Quản lý phụ thuộc đa module (Multi-module Parent POM). |
| **IDE Lập trình** | IntelliJ IDEA / VS Code | 2024.x | Môi trường phát triển tích hợp viết mã nguồn Java và JavaScript. |
| **Kiểm thử API** | Postman & Playwright | 1.40 | Thiết lập kịch bản kiểm thử API tự động và giao diện. |

---

### 3.2 Cài đặt Backend Service/API

#### 3.2.1 Cấu trúc mã nguồn thực tế
Mã nguồn Backend được quản lý theo mô hình đa module Maven (Multi-module Architecture) gồm 1 Gateway và 6 Vi dịch vụ độc lập:

```text
foodx/
├── pom.xml                                  # Maven Parent Aggregator
├── foodx-common/                            # Thư viện dùng chung (DTO, ApiResponse, JwtUtil)
├── api-gateway/                             # Cổng API Gateway (Port 8080)
│   └── src/main/java/com/nhom6/foodx/gateway/
└── services/
    ├── user-service/                        # Port 8081: com.nhom6.foodx.auth, profile
    ├── inventory-service/                   # Port 8082: com.nhom6.foodx.fridge, ingredient
    ├── recipe-service/                      # Port 8083: com.nhom6.foodx.recipe, favorite
    ├── plan-shopping-service/               # Port 8084: com.nhom6.foodx.plan, shopping
    ├── ai-service/                          # Port 8085: com.nhom6.foodx.ai, chat
    └── social-stats-service/                # Port 8086: com.nhom6.foodx.social, stats
```

Trong mỗi dịch vụ, mã nguồn tuân thủ nghiêm ngặt mô hình phân tầng:
* `controller/`: Tiếp nhận HTTP Request từ Gateway, kiểm tra định dạng và trả về `ResponseEntity<ApiResponse<T>>`.
* `service/`: Hiện thực hóa 100% các quy tắc nghiệp vụ, kiểm tra ràng buộc logic, điều phối các repository.
* `repository/`: Kế thừa `JpaRepository` của Spring Data JPA để tương tác truy vấn dữ liệu từ MySQL.
* `entity/`: Các lớp Java ánh xạ trực tiếp với cấu trúc bảng thông qua JPA Annotations (`@Entity`, `@Table`, `@Id`).
* `dto/`: Các đối tượng đóng gói dữ liệu Request và Response, bảo vệ không làm lộ cấu trúc bảng ra ngoài.
* `exception/`: Bộ xử lý lỗi toàn cục `@RestControllerAdvice` bắt các ngoại lệ và trả về envelope lỗi chuẩn.

#### 3.2.2 Hiện thực mô hình dữ liệu và truy cập CSDL tiêu biểu
Minh họa lớp thực thể `FridgeItem` trong [services/inventory-service](file:///d:/foodx/services/inventory-service):

```java
@Entity
@Table(name = "fridge_items")
public class FridgeItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String name;

    private Double quantity;
    private String unit;
    private LocalDate expiresAt;
    private Double kcal;
    private String note;

    // Getters, Setters, Constructors omitted for brevity
}
```

Và Interface Repository tương ứng truy vấn theo người dùng và hỗ trợ kiểm tra trùng lặp:

```java
@Repository
public interface FridgeItemRepository extends JpaRepository<FridgeItem, Long> {
    List<FridgeItem> findByUserId(Long userId);
    List<FridgeItem> findByUserIdAndNameAndExpiresAt(Long userId, String name, LocalDate expiresAt);
    void deleteByUserId(Long userId);
}
```

#### 3.2.3 Hiện thực quy trình xử lý luồng API tiêu biểu
Luồng xử lý API lấy danh sách tủ lạnh (`GET /api/fridge`):
1. **Client** gửi request `GET /api/fridge` kèm JWT Header tới Gateway (Port 8080).
2. **Gateway Filter** giải mã JWT, trích xuất `userId` và gắn vào Header nội bộ `X-User-Id`.
3. **Gateway** định tuyến request sang `inventory-service` (Port 8082).
4. `FridgeController` đón nhận request, lấy `userId` từ context.
5. `FridgeService.getMyFridge(userId)` gọi `FridgeItemRepository.findByUserId(userId)`.
6. Tầng Repository thực thi câu lệnh SQL qua Spring Data JPA và trả về danh sách Entity.
7. Service chuyển đổi Entity thành danh sách DTO `FridgeItemResponse`.
8. Controller bọc dữ liệu vào `ApiResponse.success(data)` và phản hồi mã `200 OK` dạng JSON về Client.

---

### 3.3 Cài đặt Client Application

#### 3.3.1 Cấu trúc mã nguồn Client
Toàn bộ mã nguồn Client nằm tại thư mục [api-gateway/src/main/resources/static/](file:///d:/foodx/api-gateway/src/main/resources/static/) và được phục vụ trực tiếp qua Web Gateway:

```text
static/
├── index.html                               # Trang Single Page App chính
├── css/                                     # Toàn bộ mã định kiểu CSS tùy biến
└── js/
    ├── app.js                               # Bộ điều hướng và kết nối ứng dụng
    └── modules/                             # Các module nghiệp vụ độc lập
        ├── state.js                         # Quản lý trạng thái toàn cục (Auth state, User info)
        ├── auth.js                          # Xử lý form đăng nhập, đăng ký, JWT storage
        ├── fridge.js                        # Giao diện và API thao tác tủ lạnh
        ├── recipes.js                       # Hiển thị món ăn và danh sách khớp tủ
        ├── plan.js                          # Lập lịch kế hoạch bữa ăn
        ├── shopping.js                      # Quản lý danh sách đồ cần mua
        ├── chat.js                          # Giao diện hội thoại tương tác AI
        └── utils.js                         # Xử lý thông báo Toast, Loading Spinner
```

#### 3.3.2 Hiện thực tích hợp Client với Backend API qua Fetch
Trong module `fridge.js`, toàn bộ việc gọi API được tách biệt khỏi mã tạo DOM giao diện:

```javascript
// Trích đoạn module fridge.js
export async function fetchFridgeItems() {
    try {
        utils.showLoading(true);
        const token = state.getToken();
        const response = await fetch('/api/fridge', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Không thể tải dữ liệu tủ lạnh');
        }
        renderFridgeUI(result.data);
    } catch (error) {
        utils.showToast(error.message, 'error');
    } finally {
        utils.showLoading(false);
    }
}
```

#### 3.3.3 Xử lý trạng thái và lỗi trên Client
* **Đang tải (Loading):** Hàm `utils.showLoading(true)` hiển thị spinner làm mờ màn hình trong thời gian chờ Promise phản hồi từ API.
* **Thành công (Success):** Dữ liệu được gán vào bảng/thẻ card DOM kèm thông báo Toast xanh góc phải màn hình.
* **Lỗi xác thực (401 Unauthorized):** Tự động xóa Token cũ khỏi `localStorage` và điều hướng người dùng về màn hình đăng nhập.
* **Vượt quá tần suất (429 Rate Limit):** Hiển thị hộp thoại cảnh báo: "Bạn đang thao tác quá nhanh, vui lòng đợi 1 phút trước khi thử lại".

---

### 3.4 Triển khai hệ thống

Hệ thống cung cấp hai phương thức triển khai sẵn sàng:

#### Phương thức 1: Đóng gói và chạy qua Docker Compose
Toàn bộ cụm hệ thống (MySQL, Redis, Gateway, 6 Microservices) được định nghĩa trong [docker-compose.yml](file:///d:/foodx/docker-compose.yml):

```bash
# Khởi động toàn bộ cơ sở dữ liệu và 7 container ứng dụng
docker compose up -d --build
```
Thứ tự khởi động được cấu hình tự động:
1. `mysql-db` (Port 3306) và `redis-cache` (Port 6379) khởi chạy trước và vượt qua kiểm tra trạng thái sức khỏe (Healthcheck).
2. Các microservices (`user-service`, `inventory-service`, ...) khởi chạy kết nối tới CSDL.
3. `api-gateway` (Port 8080) khởi chạy cuối cùng để mở cổng đón nhận yêu cầu từ người dùng tại `http://localhost:8080`.

#### Phương thức 2: Khởi chạy môi trường Dev cục bộ bằng PowerShell Script
Dự án cung cấp kịch bản tự động [start-dev.ps1](file:///d:/foodx/start-dev.ps1) hỗ trợ biên dịch và khởi chạy song song các cửa sổ console cho từng service:

```powershell
# Biên dịch toàn bộ các module
.\start-dev.ps1 -Service build

# Khởi chạy toàn bộ hệ thống
.\start-dev.ps1 -Service all
```

---

# CHƯƠNG 4. KIỂM THỬ VÀ ĐÁNH GIÁ HỆ THỐNG

### 4.1 Kiểm thử API
Hệ thống được kiểm thử thông qua bộ công cụ tự động hóa HTTP Script tại [scripts/test_live_api_e2e.js](file:///d:/foodx/scripts/test_live_api_e2e.js). Bảng kết quả kiểm thử một số ca tiêu biểu:

| Mã TC | Endpoint kiểm thử | Dữ liệu đầu vào (Input) | Kết quả mong đợi | Kết quả thực tế | Đánh giá |
|:---:|---|---|---|---|:---:|
| **TC01** | `POST /api/auth/login` | Tài khoản hợp lệ: `{"username":"minhanh", "password":"123"}` | Trả về HTTP 200, trường `success=true`, cấp `accessToken` | HTTP 200, JWT token hợp lệ | **ĐẠT** |
| **TC02** | `POST /api/auth/login` | Mật khẩu sai: `{"username":"minhanh", "password":"999"}` | Trả về HTTP 401, thông báo lỗi xác thực | HTTP 401, message tiếng Việt chuẩn | **ĐẠT** |
| **TC03** | `GET /api/fridge` | Không gửi kèm Header `Authorization` | Trả về HTTP 401 Unauthorized | HTTP 401 Unauthorized | **ĐẠT** |
| **TC04** | `POST /api/fridge/merge-duplicates` | Header Bearer JWT, tủ lạnh có 2 bản ghi thịt bò cùng hạn dùng | Trả về HTTP 200, `mergedGroupsCount: 1`, cộng dồn số lượng | HTTP 200, dữ liệu tủ lạnh được gộp chính xác | **ĐẠT** |
| **TC05** | `GET /api/recipes/match` | Header Bearer JWT, tủ lạnh có trứng và cà chua | Trả về HTTP 200, danh sách món xếp hạng theo % khớp giảm dần | HTTP 200, món trứng cà chua đạt 100% lên đầu | **ĐẠT** |
| **TC06** | `POST /api/ai/chat` | Gửi liên tục 35 yêu cầu trong 30 giây từ 1 địa chỉ IP | Từ yêu cầu thứ 31 trả về HTTP 429 Too Many Requests | HTTP 429 đúng với cấu hình Rate Limiting | **ĐẠT** |

---

### 4.2 Kiểm thử tích hợp Client – API
Kiểm thử tích hợp đầu cuối (End-to-End) được kiểm chứng tự động bằng Playwright thông qua [scripts/test_ui_playwright.js](file:///d:/foodx/scripts/test_ui_playwright.js), mô phỏng đầy đủ chuỗi hành vi người dùng trên trình duyệt:

1. **Kịch bản 1: Xác thực & Điều hướng:** Người dùng mở trang chủ $\rightarrow$ nhập thông tin đăng nhập $\rightarrow$ Client gửi API nhận Token $\rightarrow$ chuyển hướng thành công vào trang quản lý Tủ Lạnh cá nhân.
2. **Kịch bản 2: Quản lý thực phẩm & Gợi ý món:** Thêm mới 1 hộp sữa và 2 quả trứng $\rightarrow$ Danh sách hiển thị ngay lập tức $\rightarrow$ Chuyển sang tab Món ăn $\rightarrow$ Client gọi API `/api/recipes/match` $\rightarrow$ Hiển thị các món ăn tương ứng với nguyên liệu vừa thêm.
3. **Kịch bản 3: Kế hoạch ăn & Đi chợ:** Thêm món ăn vào bữa tối thứ Ba $\rightarrow$ Hệ thống tự sinh danh sách nguyên liệu thiếu sang bảng Đi chợ $\rightarrow$ Bấm nút "Đã mua" $\rightarrow$ Dữ liệu tự động được nạp ngược lại vào kho Tủ Lạnh.

Tất cả các kịch bản tích hợp Client - API đều hoàn thành chính xác, chứng minh ứng dụng Client thực sự tiêu thụ dữ liệu và đồng bộ trạng thái tức thời với dịch vụ Backend.

---

### 4.3 Đánh giá mức độ đáp ứng yêu cầu

Bảng đối chiếu giữa các mục tiêu đề ra ban đầu và kết quả thực hiện thực tế của hệ thống:

| STT | Yêu cầu / Mục tiêu ban đầu | Mức độ thực hiện | Ghi chú & Đánh giá cụ thể |
|:---:|---|:---:|---|
| 1 | Xây dựng RESTful API chuẩn mực | **Hoàn thành 100%** | Đầy đủ các phương thức HTTP, quy chuẩn URI, envelope chuẩn và mã phản hồi tương ứng. |
| 2 | Phân tách độc lập Backend và Client | **Hoàn thành 100%** | Client SPA tiêu thụ dữ liệu hoàn toàn qua Web API, không dùng cơ chế sinh mã server-side. |
| 3 | Triển khai kiến trúc vi dịch vụ & Gateway | **Hoàn thành 100%** | Tách biệt thành 6 vi dịch vụ nghiệp vụ điều phối bởi 1 Spring Cloud Gateway. |
| 4 | Xử lý logic nghiệp vụ ngoài CRUD | **Hoàn thành 100%** | Hiện thực thành công thuật toán so khớp món ăn, gộp trùng thực phẩm, tính calo và giới hạn tải. |
| 5 | Tích hợp Trợ lý Trí tuệ Nhân tạo (AI) | **Hoàn thành 100%** | Kết nối trực tiếp với API Google Gemini và Groq LLM để tư vấn thực đơn linh hoạt. |
| 6 | Đóng gói và triển khai tự động | **Hoàn thành 100%** | Cung cấp sẵn Docker Compose và PowerShell Dev Script khởi chạy toàn bộ hệ thống bằng 1 lệnh. |

---

# KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN

### 1. Đề tài đã đạt được gì
* Hoàn thiện trọn vẹn một hệ thống phần mềm hướng dịch vụ theo mô hình Client-Server hiện đại, đáp ứng đầy đủ các tiêu chuẩn học thuật của môn học Phát triển phần mềm hướng dịch vụ.
* Xây dựng thành công cụm Backend RESTful API vững chắc, có tính mô-đun cao, phân tầng rõ ràng (Controller - Service - Repository) và quản lý bảo mật hiệu quả bằng JWT.
* Phát triển ứng dụng Web Client SPA trực quan, mượt mà, phân tách rõ ràng lớp gọi dịch vụ API và lớp hiển thị dữ liệu giao diện.
* Đạt được các kết quả kiểm thử toàn diện cả về mức độ dịch vụ độc lập (API Unit Test) lẫn tích hợp liên tầng (Client - API E2E Integration Test).

### 2. Đề tài còn hạn chế gì
* **Phạm vi nền tảng:** Chưa xây dựng ứng dụng di động gốc (Native App trên Android/iOS) mà mới dừng lại ở giao diện Web Responsive / Progressive Web App (PWA).
* **Cơ chế xác thực nâng cao:** Chưa tích hợp xác thực một chạm qua mạng xã hội (OAuth2 / Google Sign-in / Facebook Login) và chưa có cơ chế cấp mới mã tự động (Refresh Token).
* **Quy mô triển khai:** Hệ thống hiện mới triển khai trên môi trường máy chủ cục bộ thông qua Docker Compose, chưa thiết lập cụm tự động co giãn (Auto-scaling) trên nền tảng điện toán đám mây.

### 3. Hướng phát triển
Bám sát các hạn chế đã chỉ ra, hệ thống định hướng mở rộng trong tương lai theo các mục tiêu cụ thể:
1. **Bổ sung xác thực OAuth2 & Refresh Token:** Nâng cấp tầng bảo mật cho `user-service`, hỗ trợ đăng nhập liên kết mạng xã hội và gia hạn phiên đăng nhập an toàn.
2. **Phát triển Client Mobile Native:** Xây dựng ứng dụng di động bằng Flutter hoặc React Native nhằm tái sử dụng 100% hệ thống RESTful API hiện tại.
3. **Mở rộng hạ tầng đám mây (Cloud & Kubernetes):** Đóng gói Helm Chart và triển khai toàn bộ hệ thống lên cụm Kubernetes (K8s) trên nền tảng AWS hoặc Google Cloud Platform để tối ưu hóa khả năng chịu tải.

---

# TÀI LIỆU THAM KHẢO

[1] R. Fielding, "Architectural Styles and the Design of Network-based Software Architectures," Ph.D. dissertation, Dept. Information and Computer Science, Univ. California, Irvine, CA, USA, 2000.  
[2] C. Richardson, *Microservices Patterns: With examples in Java*, Shelter Island, NY, USA: Manning Publications, 2018.  
[3] Spring Boot Documentation, "Building a RESTful Web Service," VMware, Inc., [Online]. Available: https://spring.io/guides/gs/rest-service/. [Truy cập: 2026].  
[4] Mozilla Developer Network (MDN), "Using the Fetch API," Mozilla Foundation, [Online]. Available: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API. [Truy cập: 2026].  
[5] Trương Mạnh Đạt, *Hướng dẫn viết báo cáo bài tập lớn - Môn học: Phát triển phần mềm hướng dịch vụ*, Tài liệu giảng dạy, 2026.
