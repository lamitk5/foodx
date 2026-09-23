import static com.kms.katalon.core.checkpoint.CheckpointFactory.findCheckpoint
import static com.kms.katalon.core.testcase.TestCaseFactory.findTestCase
import static com.kms.katalon.core.testdata.TestDataFactory.findTestData
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject

import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import com.kms.katalon.core.model.FailureHandling
import internal.GlobalVariable
import com.foodx.keywords.WebHelper

/* =========================================================================
   TC08: LUỒNG KIỂM THỬ TOÀN DIỆN TỪ ĐẦU ĐẾN CUỐI (E2E FULL USER JOURNEY)
   - Đăng ký -> Thiết lập Chế độ ăn (Onboarding) -> Tủ lạnh -> Món ăn -> Đi chợ -> Kế hoạch -> Đăng xuất
   ========================================================================= */

WebUI.comment("BƯỚC 1: Mở ứng dụng & Khởi tạo")
WebHelper.openFoodXApp()

WebUI.comment("BƯỚC 2: Đăng ký tài khoản người dùng mới")
WebUI.click(WebHelper.byId("settingsButton"))
WebUI.click(WebHelper.byId("openRegisterButton"))
def randomSuffix = String.valueOf(System.currentTimeMillis() % 100000)
def newUsername = "e2e_" + randomSuffix
def newEmail = "e2e_" + randomSuffix + "@foodx.test"

WebUI.setText(WebHelper.byId("registerFullName"), "E2E Tester " + randomSuffix)
WebUI.setText(WebHelper.byId("registerUsername"), newUsername)
WebUI.setText(WebHelper.byId("registerEmail"), newEmail)
WebUI.setText(WebHelper.byId("registerPassword"), GlobalVariable.TEST_PASSWORD)
WebUI.setText(WebHelper.byId("registerConfirmPassword"), GlobalVariable.TEST_PASSWORD)
WebUI.click(WebHelper.byCss("#registerForm button[type='submit']"))
WebUI.delay(2)

WebUI.comment("BƯỚC 3: Thiết lập Chế độ ăn & Khảo sát dinh dưỡng (Onboarding)")
WebHelper.handleOnboardingOrDietSetup(true)

WebUI.comment("BƯỚC 4: Quản lý Tủ Lạnh - Thêm nguyên liệu mới")
WebHelper.navigateToView("fridge")
WebUI.click(WebHelper.byId("openCustomIngredient"))
WebUI.setText(WebHelper.byId("customFoodName"), "Trứng gà ta")
WebUI.setText(WebHelper.byId("customFoodQuantity"), "10")
WebUI.selectOptionByValue(WebHelper.byId("customFoodUnit"), "quả", false)
WebUI.setText(WebHelper.byId("customFoodExpiry"), "2026-12-30")
WebUI.click(WebHelper.byCss("#customIngredientForm button[type='submit']"))
WebUI.delay(1)

WebUI.comment("BƯỚC 5: Tìm kiếm Công Thức & Lưu vào Danh Sách Mua Sắm")
WebHelper.navigateToView("recipes")
WebUI.setText(WebHelper.byId("recipeSearch"), "Trứng")
WebUI.delay(1)
def firstRecipe = WebHelper.byCss("#recipeBrowseGrid .recipe-card")
if (WebUI.verifyElementPresent(firstRecipe, 5, FailureHandling.OPTIONAL)) {
    WebUI.click(firstRecipe)
    WebUI.delay(1)
    if (WebUI.verifyElementVisible(WebHelper.byId("rdAddShop"), FailureHandling.OPTIONAL)) {
        WebUI.click(WebHelper.byId("rdAddShop"))
        WebUI.delay(1)
    }
    WebUI.click(WebHelper.byId("rdBackBtn"))
    WebUI.delay(1)
}

WebUI.comment("BƯỚC 6: Đi Chợ & Đánh dấu Đã Mua (Auto-sync Tủ Lạnh)")
WebHelper.navigateToView("shopping")
def itemCheck = WebHelper.byCss("#shoppingList input[type='checkbox'], #shoppingList .sp-item-check")
if (WebUI.verifyElementPresent(itemCheck, 5, FailureHandling.OPTIONAL)) {
    WebUI.click(itemCheck)
    WebUI.delay(1)
}

WebUI.comment("BƯỚC 7: Lên Kế Hoạch Bữa Ăn Bằng AI")
WebHelper.navigateToView("plan")
WebUI.click(WebHelper.byId("planAuto"))
WebUI.delay(2)

WebUI.comment("BƯỚC 8: Đăng xuất tài khoản")
WebUI.click(WebHelper.byId("settingsButton"))
if (WebUI.verifyElementPresent(WebHelper.byId("logoutButton"), 3, FailureHandling.OPTIONAL)) {
    WebUI.click(WebHelper.byId("logoutButton"))
    WebUI.delay(1)
}

WebUI.comment("BƯỚC 9: Hoàn tất kịch bản End-to-End thành công rực rỡ!")
WebUI.closeBrowser()
