import static com.kms.katalon.core.checkpoint.CheckpointFactory.findCheckpoint
import static com.kms.katalon.core.testcase.TestCaseFactory.findTestCase
import static com.kms.katalon.core.testdata.TestDataFactory.findTestData
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject

import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import com.kms.katalon.core.model.FailureHandling
import internal.GlobalVariable
import com.foodx.keywords.WebHelper

/* =========================================================================
   TC03: KIỂM THỬ QUẢN LÝ TỦ LẠNH & NGUYÊN LIỆU (YÊU CẦU ĐĂNG NHẬP)
   ========================================================================= */

WebUI.comment("1. Mở ứng dụng FoodX")
WebHelper.openFoodXApp()

WebUI.comment("2. Đăng nhập tài khoản để quản lý tủ lạnh cá nhân")
WebHelper.loginAs(GlobalVariable.TEST_USERNAME, GlobalVariable.TEST_PASSWORD)

WebUI.comment("3. Điều hướng vào tab Tủ lạnh")
WebHelper.navigateToView("fridge")
WebUI.verifyElementVisible(WebHelper.byId("view-fridge"))
WebUI.verifyElementVisible(WebHelper.byId("fridgeRescueBtn"))
WebUI.verifyElementVisible(WebHelper.byId("openCustomIngredient"))

WebUI.comment("4. Mở Modal Thêm Nguyên Liệu Mới")
WebUI.click(WebHelper.byId("openCustomIngredient"))
WebUI.verifyElementVisible(WebHelper.byId("customIngredientModal"))

WebUI.setText(WebHelper.byId("customFoodName"), "Thịt bò phi lê")
WebUI.setText(WebHelper.byId("customFoodQuantity"), "350")
WebUI.selectOptionByValue(WebHelper.byId("customFoodUnit"), "g", false)
WebUI.setText(WebHelper.byId("customFoodExpiry"), "2026-12-31")

WebUI.comment("5. Tra cứu & Tự động tính calo/dinh dưỡng")
if (WebUI.verifyElementVisible(WebHelper.byId("btnAutoCalculateNutrition"), FailureHandling.OPTIONAL)) {
    WebUI.click(WebHelper.byId("btnAutoCalculateNutrition"))
    WebUI.delay(1)
}

WebUI.comment("6. Lưu nguyên liệu vào tủ lạnh")
WebUI.click(WebHelper.byCss("#customIngredientForm button[type='submit']"))
WebUI.delay(2)

WebUI.comment("7. Tìm kiếm & Lọc nguyên liệu trong tủ lạnh")
WebUI.setText(WebHelper.byId("fridgeSearch"), "Thịt bò")
WebUI.delay(1)
WebUI.clearText(WebHelper.byId("fridgeSearch"))
WebUI.delay(1)

WebUI.comment("8. Kiểm tra tính năng AI Cứu Tủ Lạnh")
WebUI.click(WebHelper.byId("fridgeRescueBtn"))
WebUI.delay(2)

WebUI.comment("9. Hoàn tất kiểm thử quản lý tủ lạnh!")
WebUI.closeBrowser()
