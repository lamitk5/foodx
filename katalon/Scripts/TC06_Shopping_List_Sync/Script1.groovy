import static com.kms.katalon.core.checkpoint.CheckpointFactory.findCheckpoint
import static com.kms.katalon.core.testcase.TestCaseFactory.findTestCase
import static com.kms.katalon.core.testdata.TestDataFactory.findTestData
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject

import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import com.kms.katalon.core.model.FailureHandling
import internal.GlobalVariable
import com.foodx.keywords.WebHelper

/* =========================================================================
   TC06: KIỂM THỬ DANH SÁCH ĐI CHỢ & ĐỒNG BỘ TỦ LẠNH (YÊU CẦU ĐĂNG NHẬP)
   ========================================================================= */

WebUI.comment("1. Mở ứng dụng FoodX")
WebHelper.openFoodXApp()

WebUI.comment("2. Đăng nhập để quản lý danh sách đi chợ cá nhân")
WebHelper.loginAs(GlobalVariable.TEST_USERNAME, GlobalVariable.TEST_PASSWORD)

WebUI.comment("3. Điều hướng vào tab Danh sách mua")
WebHelper.navigateToView("shopping")
WebUI.verifyElementVisible(WebHelper.byId("view-shopping"))
WebUI.verifyElementVisible(WebHelper.byId("shoppingInput"))
WebUI.verifyElementVisible(WebHelper.byId("shoppingAdd"))

WebUI.comment("4. Thêm nguyên liệu nhanh qua Chip gợi ý (Quick Chips)")
def eggChip = WebHelper.byCss(".shopping-quick-chips button.sqc-chip:first-child")
if (WebUI.verifyElementVisible(eggChip, FailureHandling.OPTIONAL)) {
    WebUI.click(eggChip)
    WebUI.delay(1)
}

WebUI.comment("5. Nhập thêm nguyên liệu mới thủ công")
WebUI.setText(WebHelper.byId("shoppingInput"), "1kg Gạo tám xoan")
WebUI.click(WebHelper.byId("shoppingAdd"))
WebUI.delay(1)

WebUI.comment("6. Đánh dấu món đã mua (Tự động nạp vào tủ lạnh)")
def firstItemCheck = WebHelper.byCss("#shoppingList .sp-item-check, #shoppingList input[type='checkbox']")
if (WebUI.verifyElementPresent(firstItemCheck, 5, FailureHandling.OPTIONAL)) {
    WebUI.click(firstItemCheck)
    WebUI.delay(1)
}

WebUI.comment("7. Chuyển đổi bộ lọc: Tất cả / Cần mua / Đã mua")
def tabPending = WebHelper.byCss("button[data-shop-filter='pending']")
def tabDone = WebHelper.byCss("button[data-shop-filter='done']")
def tabAll = WebHelper.byCss("button[data-shop-filter='all']")

if (WebUI.verifyElementVisible(tabPending, FailureHandling.OPTIONAL)) {
    WebUI.click(tabPending)
    WebUI.delay(1)
    WebUI.click(tabDone)
    WebUI.delay(1)
    WebUI.click(tabAll)
    WebUI.delay(1)
}

WebUI.comment("8. Dọn dẹp món đã mua")
if (WebUI.verifyElementVisible(WebHelper.byId("shopClearDone"), FailureHandling.OPTIONAL)) {
    WebUI.click(WebHelper.byId("shopClearDone"))
    WebUI.delay(1)
}

WebUI.comment("9. Hoàn tất kiểm thử danh sách mua sắm!")
WebUI.closeBrowser()
