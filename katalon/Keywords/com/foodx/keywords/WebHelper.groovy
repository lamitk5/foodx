package com.foodx.keywords

import com.kms.katalon.core.annotation.Keyword
import com.kms.katalon.core.testobject.ConditionType
import com.kms.katalon.core.testobject.TestObject
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import com.kms.katalon.core.model.FailureHandling
import internal.GlobalVariable

public class WebHelper {

    /**
     * Tạo TestObject động theo CSS Selector
     */
    @Keyword
    public static TestObject byCss(String cssSelector, String objectName = "Dynamic_CSS_Object") {
        TestObject to = new TestObject(objectName)
        to.addProperty("css", ConditionType.EQUALS, cssSelector)
        return to
    }

    /**
     * Tạo TestObject động theo XPath
     */
    @Keyword
    public static TestObject byXPath(String xpathExpr, String objectName = "Dynamic_XPath_Object") {
        TestObject to = new TestObject(objectName)
        to.addProperty("xpath", ConditionType.EQUALS, xpathExpr)
        return to
    }

    /**
     * Tạo TestObject động theo ID
     */
    @Keyword
    public static TestObject byId(String elementId) {
        return byCss("#" + elementId, "ID_" + elementId)
    }

    /**
     * Mở ứng dụng và chuẩn bị trạng thái ban đầu
     */
    @Keyword
    public static void openFoodXApp() {
        WebUI.openBrowser('')
        WebUI.maximizeWindow()
        WebUI.navigateToUrl(GlobalVariable.BASE_URL)
        WebUI.waitForPageLoad(GlobalVariable.DEFAULT_TIMEOUT)
    }

    /**
     * Chuyển tab Sidebar theo data-view
     */
    @Keyword
    public static void navigateToView(String viewName) {
        TestObject menuBtn = byCss("button.menu-item[data-view='" + viewName + "']")
        WebUI.waitForElementVisible(menuBtn, GlobalVariable.DEFAULT_TIMEOUT)
        WebUI.click(menuBtn)
        WebUI.delay(1)
    }

    /**
     * Thực hiện Đăng nhập tài khoản kiểm thử
     */
    @Keyword
    public static void loginAs(String username = GlobalVariable.TEST_USERNAME, String password = GlobalVariable.TEST_PASSWORD) {
        WebUI.click(byId("settingsButton"))
        WebUI.delay(1)
        
        TestObject openLogin = byId("openLoginButton")
        if (WebUI.verifyElementVisible(openLogin, FailureHandling.OPTIONAL)) {
            WebUI.click(openLogin)
            WebUI.waitForElementVisible(byId("loginModal"), GlobalVariable.DEFAULT_TIMEOUT)
            WebUI.setText(byId("loginEmail"), username)
            WebUI.setText(byId("loginPassword"), password)
            WebUI.click(byCss("#loginForm button[type='submit']"))
            WebUI.delay(2)
        }
    }

    /**
     * Xử lý màn hình Thiết lập chế độ ăn / Onboarding 3 bước:
     * @param savePreferences: true -> điền thông tin và Lưu hồ sơ; false -> Bỏ qua / Hủy
     */
    @Keyword
    public static void handleOnboardingOrDietSetup(boolean savePreferences = true) {
        // 1. Kiểm tra Onboarding Overlay 3 bước sau đăng ký
        TestObject onbOverlay = byId("onboardingOverlay")
        if (WebUI.verifyElementPresent(onbOverlay, 2, FailureHandling.OPTIONAL) && 
            WebUI.verifyElementVisible(onbOverlay, FailureHandling.OPTIONAL)) {
            
            if (savePreferences) {
                // Bước 1: Khẩu vị & Ẩm thực
                TestObject vnChip = byCss("#onbCuisines .onb-chip:first-child")
                if (WebUI.verifyElementVisible(vnChip, FailureHandling.OPTIONAL)) {
                    WebUI.click(vnChip)
                }
                WebUI.click(byId("onb1Next"))
                WebUI.delay(1)
                
                // Bước 2: Mục tiêu bữa ăn
                TestObject goalCard = byCss("#onbGoals .onb-goal-card:first-child")
                if (WebUI.verifyElementVisible(goalCard, FailureHandling.OPTIONAL)) {
                    WebUI.click(goalCard)
                }
                WebUI.click(byId("onb2Next"))
                WebUI.delay(1)
                
                // Bước 3: Dinh dưỡng & Hoàn tất
                TestObject finishBtn = byId("onbFinish")
                if (WebUI.verifyElementVisible(finishBtn, FailureHandling.OPTIONAL)) {
                    WebUI.click(finishBtn)
                    WebUI.delay(1)
                }
            } else {
                // Bỏ qua / đóng Onboarding qua phím Escape hoặc nút đóng
                WebUI.executeJavaScript("if (typeof hideOnboarding === 'function') hideOnboarding();", null)
                WebUI.delay(1)
            }
        }

        // 2. Kiểm tra Profile Modal (Thiết lập chế độ ăn trong Hồ sơ dinh dưỡng)
        TestObject profileModal = byId("profileModal")
        if (WebUI.verifyElementPresent(profileModal, 2, FailureHandling.OPTIONAL) &&
            WebUI.verifyElementVisible(profileModal, FailureHandling.OPTIONAL)) {
            
            if (savePreferences) {
                // Chọn chip Ẩm thực yêu thích (Việt Nam, Hàn Quốc...)
                TestObject cuisineChip = byCss("#profileCuisinesGrid .onb-chip:first-child")
                if (WebUI.verifyElementVisible(cuisineChip, FailureHandling.OPTIONAL)) {
                    WebUI.click(cuisineChip)
                }
                // Chọn mức độ ăn cay
                if (WebUI.verifyElementVisible(byId("profileSpiceSelect"), FailureHandling.OPTIONAL)) {
                    WebUI.selectOptionByValue(byId("profileSpiceSelect"), "Ít cay", false)
                }
                // Mục tiêu bữa ăn chính
                TestObject goalChip = byCss("#profileGoalsGrid .onb-chip:first-child")
                if (WebUI.verifyElementVisible(goalChip, FailureHandling.OPTIONAL)) {
                    WebUI.click(goalChip)
                }
                // Thiết bị bếp có sẵn
                TestObject equipChip = byCss("#profileEquipGrid .onb-chip:first-child")
                if (WebUI.verifyElementVisible(equipChip, FailureHandling.OPTIONAL)) {
                    WebUI.click(equipChip)
                }
                // Bấm Lưu hồ sơ
                TestObject saveBtn = byCss("#profileForm button[type='submit']")
                if (WebUI.verifyElementVisible(saveBtn, FailureHandling.OPTIONAL)) {
                    WebUI.click(saveBtn)
                    WebUI.delay(1)
                }
            } else {
                // Bấm Hủy / Bỏ qua modal
                TestObject cancelBtn = byCss("button[data-close='profileModal']")
                if (WebUI.verifyElementVisible(cancelBtn, FailureHandling.OPTIONAL)) {
                    WebUI.click(cancelBtn)
                    WebUI.delay(1)
                }
            }
        }
    }
}
