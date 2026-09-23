import static com.kms.katalon.core.checkpoint.CheckpointFactory.findCheckpoint
import static com.kms.katalon.core.testcase.TestCaseFactory.findTestCase
import static com.kms.katalon.core.testdata.TestDataFactory.findTestData
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject

import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import com.kms.katalon.core.model.FailureHandling
import internal.GlobalVariable
import com.foodx.keywords.WebHelper

/* =========================================================================
   TC05: KIỂM THỬ KẾ HOẠCH BỮA ĂN (MEAL PLAN - YÊU CẦU ĐĂNG NHẬP)
   ========================================================================= */

WebUI.comment("1. Mở ứng dụng FoodX")
WebHelper.openFoodXApp()

WebUI.comment("2. Đăng nhập để quản lý thực đơn tuần của người dùng")
WebHelper.loginAs(GlobalVariable.TEST_USERNAME, GlobalVariable.TEST_PASSWORD)

WebUI.comment("3. Điều hướng vào tab Kế hoạch")
WebHelper.navigateToView("plan")

WebUI.comment("4. Kiểm tra giao diện Kế hoạch Tuần")
WebUI.verifyElementVisible(WebHelper.byId("view-plan"))
WebUI.verifyElementVisible(WebHelper.byId("weekLabel"))
WebUI.verifyElementVisible(WebHelper.byId("planAuto"))
WebUI.verifyElementVisible(WebHelper.byId("exportPlanShoppingBtn"))

WebUI.comment("5. Chuyển tuần kế tiếp và tuần trước đó")
WebUI.click(WebHelper.byId("planNext"))
WebUI.delay(1)
WebUI.click(WebHelper.byId("planPrev"))
WebUI.delay(1)

WebUI.comment("6. Kiểm tra AI Lên Kế Hoạch Tự Động")
WebUI.click(WebHelper.byId("planAuto"))
WebUI.delay(2)

WebUI.comment("7. Kiểm tra Xuất Nguyên Liệu Tuần Ra Danh Sách Đi Chợ")
WebUI.click(WebHelper.byId("exportPlanShoppingBtn"))
WebUI.delay(2)

WebUI.comment("8. Hoàn tất kiểm thử kế hoạch bữa ăn!")
WebUI.closeBrowser()
