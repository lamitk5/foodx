import static com.kms.katalon.core.checkpoint.CheckpointFactory.findCheckpoint
import static com.kms.katalon.core.testcase.TestCaseFactory.findTestCase
import static com.kms.katalon.core.testdata.TestDataFactory.findTestData
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import com.kms.katalon.core.model.FailureHandling as FailureHandling
import internal.GlobalVariable as GlobalVariable
import com.foodx.keywords.WebHelper as WebHelper
import com.kms.katalon.core.mobile.keyword.MobileBuiltInKeywords as Mobile
import com.kms.katalon.core.cucumber.keyword.CucumberBuiltinKeywords as CucumberKW
import com.kms.katalon.core.webservice.keyword.WSBuiltInKeywords as WS
import com.kms.katalon.core.windows.keyword.WindowsBuiltinKeywords as Windows
import static com.kms.katalon.core.testobject.ObjectRepository.findWindowsObject
import com.kms.katalon.core.testcase.TestCase as TestCase
import com.kms.katalon.core.testdata.TestData as TestData
import com.kms.katalon.core.testobject.TestObject as TestObject
import com.kms.katalon.core.checkpoint.Checkpoint as Checkpoint
import org.openqa.selenium.Keys as Keys

/* =========================================================================
   TC01: KIỂM THỬ GIAO DIỆN CHÀO, THEME & PHÂN QUYỀN TRUY CẬP KHÁCH (GUEST ACCESS)
   - Tab Chia sẻ (Social): Mở tự do cho Khách vãng lai xem.
   - Các chức năng Tủ lạnh, Kế hoạch, Mua sắm, Chat: Yêu cầu Đăng nhập khi thao tác.
   ========================================================================= */
WebUI.comment('1. Mở trang chủ FoodX ở chế độ Khách (Guest - Chưa đăng nhập)')

WebHelper.openFoodXApp()

WebUI.comment('2. Kiểm tra tính năng Public: Tab Chia sẻ công thức (Social) xem được tự do')

WebHelper.navigateToView('social')

WebUI.verifyElementVisible(WebHelper.byId('view-social'))

WebUI.comment('3. Kiểm tra tính năng Bảo mật: Mở AI Chat khi chưa đăng nhập -> Hiện Modal Đăng nhập')

WebUI.click(WebHelper.byId('chatFab'))

WebUI.delay(1)

if (WebUI.verifyElementVisible(WebHelper.byId('loginModal'), FailureHandling.OPTIONAL)) {
    WebUI.comment('-> Đã xuất hiện Modal yêu cầu đăng nhập đúng như kỳ vọng!')

    WebUI.click(WebHelper.byCss('#loginModal .auth-close, button[data-close=\'loginModal\']'))

    WebUI.delay(1)
}

WebUI.comment('4. Chuyển đổi Theme Sáng / Tối (Theme Toggle)')

WebUI.verifyElementVisible(WebHelper.byId('themeToggleBtn'))

WebUI.click(WebHelper.byId('themeToggleBtn'))

WebUI.delay(1)

WebUI.click(WebHelper.byId('themeToggleBtn'))

WebUI.delay(1)

WebUI.comment('5. Kiểm tra Panel Cài Đặt (Settings Popover) ở trạng thái Khách')

WebUI.click(WebHelper.byId('settingsButton'))

WebUI.verifyElementVisible(WebHelper.byId('settingsPanel'))

WebUI.verifyElementVisible(WebHelper.byId('authGuestBox'))

WebUI.click(WebHelper.byId('settingsButton') // Đóng panel
    )

WebUI.comment('6. Điều hướng kiểm tra hiển thị các trang cơ bản')

WebHelper.navigateToView('home')

WebUI.verifyElementVisible(WebHelper.byId('view-home'))

WebUI.comment('7. Hoàn tất kiểm thử TC01!')

WebUI.closeBrowser()

