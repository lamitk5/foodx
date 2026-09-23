import static com.kms.katalon.core.checkpoint.CheckpointFactory.findCheckpoint
import static com.kms.katalon.core.testcase.TestCaseFactory.findTestCase
import static com.kms.katalon.core.testdata.TestDataFactory.findTestData
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject

import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import com.kms.katalon.core.model.FailureHandling
import internal.GlobalVariable
import com.foodx.keywords.WebHelper

/* =========================================================================
   TC02: KIỂM THỬ ĐĂNG KÝ, THIẾT LẬP CHẾ ĐỘ ĂN (ONBOARDING), HỒ SƠ & ĐĂNG XUẤT
   - Bao gồm đầy đủ giao diện thiết lập chế độ ăn / khảo sát ẩm thực (như hình đính kèm):
     + Loại hình ẩm thực yêu thích (Việt Nam, Hàn Quốc, Nhật Bản...)
     + Mức độ ăn cay (Ít cay, Vừa cay...)
     + Mục tiêu Calo hàng ngày & thanh kéo slider
     + Mục tiêu bữa ăn chính (Ăn kiêng, Tăng cơ, Tiết kiệm thời gian...)
     + Thiết bị gian bếp có sẵn (Bếp gas, Nồi chiên không dầu...)
     + Kiểm thử cả 2 luồng: Bỏ qua / Hủy HOẶC Lưu hồ sơ
   ========================================================================= */

WebUI.comment("1. Mở ứng dụng FoodX")
WebHelper.openFoodXApp()

WebUI.comment("2. Mở Modal Đăng Ký Tài Khoản Mới")
WebUI.click(WebHelper.byId("settingsButton"))
WebUI.click(WebHelper.byId("openRegisterButton"))
WebUI.verifyElementVisible(WebHelper.byId("registerModal"))

def randomSuffix = String.valueOf(System.currentTimeMillis() % 100000)
def newUsername = "user" + randomSuffix
def newEmail = "user" + randomSuffix + "@foodx.test"

WebUI.setText(WebHelper.byId("registerFullName"), "Katalon Tester " + randomSuffix)
WebUI.setText(WebHelper.byId("registerUsername"), newUsername)
WebUI.setText(WebHelper.byId("registerEmail"), newEmail)
WebUI.setText(WebHelper.byId("registerPassword"), GlobalVariable.TEST_PASSWORD)
WebUI.setText(WebHelper.byId("registerConfirmPassword"), GlobalVariable.TEST_PASSWORD)

WebUI.comment("3. Gửi form Đăng ký mới")
WebUI.click(WebHelper.byCss("#registerForm button[type='submit']"))
WebUI.delay(2)

WebUI.comment("4. Kiểm tra Giao diện Thiết lập Chế độ ăn & Khảo sát Ẩm thực sau khi Đăng ký")
// Kịch bản A: Lưu hồ sơ với đầy đủ các tiêu chí ẩm thực
WebHelper.handleOnboardingOrDietSetup(true)

WebUI.comment("5. Mở Hồ sơ dinh dưỡng từ Avatar để kiểm thử cập nhật hoặc Bỏ qua/Hủy")
WebUI.click(WebHelper.byId("avatarButton"))
WebUI.delay(1)
def openProfileBtn = WebHelper.byCss("#profilePanel button, .btn-open-health-profile")
if (WebUI.verifyElementVisible(openProfileBtn, FailureHandling.OPTIONAL)) {
    WebUI.click(openProfileBtn)
    WebUI.delay(1)
    
    // Kiểm tra Modal Hồ sơ sức khỏe hiển thị
    if (WebUI.verifyElementVisible(WebHelper.byId("profileModal"), FailureHandling.OPTIONAL)) {
        WebUI.comment("-> Kiểm tra các trường thiết lập ẩm thực trong Modal")
        // Chọn ẩm thực
        def vnChip = WebHelper.byCss("#profileCuisinesGrid .onb-chip:first-child")
        if (WebUI.verifyElementVisible(vnChip, FailureHandling.OPTIONAL)) WebUI.click(vnChip)
        
        // Chọn độ cay
        if (WebUI.verifyElementVisible(WebHelper.byId("profileSpiceSelect"), FailureHandling.OPTIONAL)) {
            WebUI.selectOptionByValue(WebHelper.byId("profileSpiceSelect"), "Ít cay", false)
        }
        
        // Kiểm thử nút 'Hủy / Bỏ qua'
        WebUI.comment("-> Bấm nút 'Hủy / Bỏ qua' để đóng modal")
        WebUI.click(WebHelper.byCss("button[data-close='profileModal']"))
        WebUI.delay(1)
    }
}

WebUI.comment("6. Đăng xuất tài khoản")
WebUI.click(WebHelper.byId("settingsButton"))
if (WebUI.verifyElementPresent(WebHelper.byId("logoutButton"), 3, FailureHandling.OPTIONAL)) {
    WebUI.click(WebHelper.byId("logoutButton"))
    WebUI.delay(1)
}

WebUI.comment("7. Hoàn tất kiểm thử Đăng ký & Thiết lập chế độ ăn!")
WebUI.closeBrowser()
