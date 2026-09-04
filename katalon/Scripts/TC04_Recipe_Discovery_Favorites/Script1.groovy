import static com.kms.katalon.core.checkpoint.CheckpointFactory.findCheckpoint
import static com.kms.katalon.core.testcase.TestCaseFactory.findTestCase
import static com.kms.katalon.core.testdata.TestDataFactory.findTestData
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject

import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import com.kms.katalon.core.model.FailureHandling
import internal.GlobalVariable
import com.foodx.keywords.WebHelper

/* =========================================================================
   TC04: KIỂM THỬ KHÁM PHÁ CÔNG THỨC & LƯU MÓN YÊU THÍCH (YÊU CẦU ĐĂNG NHẬP)
   ========================================================================= */

WebUI.comment("1. Mở ứng dụng FoodX")
WebHelper.openFoodXApp()

WebUI.comment("2. Đăng nhập để lưu món vào danh sách Yêu thích")
WebHelper.loginAs(GlobalVariable.TEST_USERNAME, GlobalVariable.TEST_PASSWORD)

WebUI.comment("3. Điều hướng vào tab Công thức")
WebHelper.navigateToView("recipes")

WebUI.comment("4. Kiểm tra bộ lọc nhanh (Quick filter chips)")
def morningChip = WebHelper.byCss(".recipe-quick-chips button[data-chip='morning']")
if (WebUI.verifyElementVisible(morningChip, FailureHandling.OPTIONAL)) {
    WebUI.click(morningChip)
    WebUI.delay(1)
}

WebUI.comment("5. Tìm kiếm công thức theo tên")
WebUI.setText(WebHelper.byId("recipeSearch"), "Bò")
WebUI.delay(1)

WebUI.comment("6. Mở Chi tiết món ăn và Lưu vào Yêu thích")
def firstCard = WebHelper.byCss("#recipeBrowseGrid .recipe-card")
if (WebUI.verifyElementPresent(firstCard, 5, FailureHandling.OPTIONAL)) {
    WebUI.click(firstCard)
    WebUI.delay(1)
    
    WebUI.verifyElementVisible(WebHelper.byId("view-recipe"))
    WebUI.verifyElementVisible(WebHelper.byId("rdTitle"))
    
    // Đổi tab Nguyên liệu / Các bước / Dinh dưỡng
    WebUI.click(WebHelper.byCss("button[data-rdtab='steps']"))
    WebUI.delay(1)
    WebUI.click(WebHelper.byCss("button[data-rdtab='nutri']"))
    WebUI.delay(1)
    WebUI.click(WebHelper.byCss("button[data-rdtab='ing']"))
    WebUI.delay(1)
    
    // Lưu món ăn vào danh sách yêu thích
    if (WebUI.verifyElementVisible(WebHelper.byId("rdSave"), FailureHandling.OPTIONAL)) {
        WebUI.click(WebHelper.byId("rdSave"))
        WebUI.delay(1)
    }
    
    // Quay lại danh sách
    WebUI.click(WebHelper.byId("rdBackBtn"))
    WebUI.delay(1)
}

WebUI.comment("7. Kiểm tra tab Món Yêu Thích")
WebHelper.navigateToView("favorites")
WebUI.verifyElementVisible(WebHelper.byId("view-favorites"))

WebUI.comment("8. Hoàn tất kiểm thử công thức & yêu thích!")
WebUI.closeBrowser()
