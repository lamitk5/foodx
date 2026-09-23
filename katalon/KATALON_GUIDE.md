# Hướng Dẫn Chạy Kiểm Thử Tự Động Giao Diện FoodX Trên Katalon Studio

Dự án kiểm thử tự động này được cấu hình chuẩn cho **Katalon Studio (bản 8.x / 9.x / 10.x)** nhằm kiểm thử toàn diện giao diện Web của **FoodX**.

---

## 📁 Cấu Trúc Dự Án Test

```text
katalon/
├── foodx-katalon.prj              # File dự án Katalon Studio
├── Profiles/
│   └── default.glbl               # Cấu hình BASE_URL, TIMEOUT, TEST_USER
├── Keywords/
│   └── com/foodx/keywords/
│       └── WebHelper.groovy       # Keyword tạo TestObject động (CSS/XPath) & Điều hướng
├── Test Cases/
│   ├── TC01_Welcome_And_Navigation.tc
│   ├── TC02_Authentication_Profile.tc
│   ├── TC03_Fridge_Management.tc
│   ├── TC04_Recipe_Discovery_Favorites.tc
│   ├── TC05_Meal_Plan_Workflow.tc
│   ├── TC06_Shopping_List_Sync.tc
│   ├── TC07_Social_And_AIChat.tc
│   └── TC08_E2E_Full_User_Journey.tc
├── Scripts/
│   ├── TC01_Welcome_And_Navigation/Script1.groovy
│   ├── TC02_Authentication_Profile/Script1.groovy
│   ├── TC03_Fridge_Management/Script1.groovy
│   ├── TC04_Recipe_Discovery_Favorites/Script1.groovy
│   ├── TC05_Meal_Plan_Workflow/Script1.groovy
│   ├── TC06_Shopping_List_Sync/Script1.groovy
│   ├── TC07_Social_And_AIChat/Script1.groovy
│   └── TC08_E2E_Full_User_Journey/Script1.groovy
├── Test Suites/
│   └── TS_FoodX_Full_UI.ts       # Test Suite gom toàn bộ 8 Test Cases
└── KATALON_GUIDE.md              # Tài liệu hướng dẫn
```

---

## 🚀 Các Bước Chạy Kiểm Thử Trên Katalon Studio GUI

### 1. Khởi động Web App FoodX
Đảm bảo ứng dụng FoodX đang chạy ở địa chỉ `http://localhost:8080`:
```bash
# Terminal thư mục gốc dự án foodx
.\mvnw.cmd spring-boot:run
```

### 2. Mở Dự Án trong Katalon Studio
1. Mở phần mềm **Katalon Studio**.
2. Chọn **File** -> **Open Project**.
3. Duyệt đến thư mục: `d:\du_an_ca_nhan\foodx\katalon\foodx-katalon.prj` và bấm **Open**.

### 3. Chạy Kiểm Thử
- **Chạy từng Test Case**: Mở thư mục `Test Cases` -> Chọn kịch bản muốn test (ví dụ `TC03_Fridge_Management`) -> Bấm nút **Run** (chọn trình duyệt Chrome/Edge).
- **Chạy toàn bộ Suite**: Mở `Test Suites` -> Chọn `TS_FoodX_Full_UI` -> Bấm nút **Run**.

---

## ⚡ Chạy Tự Động Bằng Dòng Lệnh (Katalon Runtime Engine / CLI)

```bash
katalonc -noSplash -runMode=console -projectPath="d:\du_an_ca_nhan\foodx\katalon\foodx-katalon.prj" -testSuitePath="Test Suites/TS_FoodX_Full_UI" -browserType="Chrome" -executionProfile="default"
```
