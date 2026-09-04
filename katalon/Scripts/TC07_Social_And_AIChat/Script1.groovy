import static com.kms.katalon.core.checkpoint.CheckpointFactory.findCheckpoint
import static com.kms.katalon.core.testcase.TestCaseFactory.findTestCase
import static com.kms.katalon.core.testdata.TestDataFactory.findTestData
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject

import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import com.kms.katalon.core.model.FailureHandling
import internal.GlobalVariable
import com.foodx.keywords.WebHelper

/* =========================================================================
   TC07: KIỂM THỬ MẠNG XÃ HỘI CỘNG ĐỒNG & TRỢ LÝ AI CHAT (ĐĂNG NHẬP ĐỂ ĐĂNG BÀI & CHAT)
   ========================================================================= */

WebUI.comment("1. Mở ứng dụng FoodX")
WebHelper.openFoodXApp()

WebUI.comment("2. Đăng nhập để sử dụng tính năng Đăng bài chia sẻ & Trò chuyện cùng AI")
WebHelper.loginAs(GlobalVariable.TEST_USERNAME, GlobalVariable.TEST_PASSWORD)

WebUI.comment("3. Điều hướng vào tab Chia sẻ công thức")
WebHelper.navigateToView("social")
WebUI.verifyElementVisible(WebHelper.byId("view-social"))

WebUI.comment("4. Mở khung Soạn bài chia sẻ công thức mới")
WebUI.click(WebHelper.byId("toggleComposerBtn"))
WebUI.verifyElementVisible(WebHelper.byId("socialComposerCard"))

WebUI.comment("5. Nhập nội dung bài viết công thức")
WebUI.setText(WebHelper.byId("postTitle"), "Salad ức gà xé Eat Clean")
WebUI.setText(WebHelper.byId("postTime"), "15")
WebUI.setText(WebHelper.byId("postKcal"), "280")
WebUI.setText(WebHelper.byId("postDescription"), "Món ăn thanh mát nhiều đạm cho người giảm cân.")
WebUI.setText(WebHelper.byId("postIngredients"), "200g Ức gà\n1 Cây Xà lách xoăn\n1 Quả Cà chua bi\n2 Thìa Sốt mè rang")
WebUI.setText(WebHelper.byId("postInstructions"), "1. Luộc chín ức gà rồi xé sợi.\n2. Rửa sạch rau củ, cắt lát vừa ăn.\n3. Trộn đều cùng sốt và thưởng thức.")

WebUI.comment("6. Bấm Đăng bài ngay")
WebUI.click(WebHelper.byId("postSubmit"))
WebUI.delay(2)

WebUI.comment("7. Lọc danh mục bài viết theo Tab Pill")
def pillEatClean = WebHelper.byCss("button[data-social-cat='eatclean']")
if (WebUI.verifyElementVisible(pillEatClean, FailureHandling.OPTIONAL)) {
    WebUI.click(pillEatClean)
    WebUI.delay(1)
}

WebUI.comment("8. Mở Trợ lý Ảo AI Chat (Chat Floating Action Button)")
WebUI.click(WebHelper.byId("chatFab"))
WebUI.verifyElementVisible(WebHelper.byId("chatPanel"))

WebUI.comment("9. Gửi câu hỏi cho Trợ lý AI")
WebUI.setText(WebHelper.byId("chatInputFx"), "Gợi ý cho tôi 1 món ngon từ ức gà?")
WebUI.click(WebHelper.byId("chatSendBtn"))
WebUI.delay(3)

WebUI.comment("10. Đóng panel AI Chat")
WebUI.click(WebHelper.byCss(".chat-close"))
WebUI.delay(1)

WebUI.comment("11. Hoàn tất kiểm thử mạng xã hội & AI Chat!")
WebUI.closeBrowser()
