/**
 * Form 1: Đăng ký tài khoản
 * Endpoint: POST {{baseUrl}}/api/auth/register
 * Content-Type: application/json
 */

// 1. Kiểm tra HTTP Status Code
pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});

// 2. Kiểm tra Response time < 1000ms
pm.test("Response time is under 1000ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(1000);
});

// 3. Kiểm tra định dạng ApiResponse envelope
pm.test("Response matches standard ApiResponse envelope", function () {
    const res = pm.response.json();
    pm.expect(res).to.have.property("success", true);
    pm.expect(res).to.have.property("status", 200);
    pm.expect(res).to.have.property("message");
    pm.expect(res).to.have.property("data");
});

// 4. Kiểm tra dữ liệu trả về & Lưu Access Token
pm.test("Response returns valid AuthResponse data with JWT token", function () {
    const res = pm.response.json();
    const data = res.data;
    
    pm.expect(data).to.be.an("object");
    pm.expect(data.username).to.be.a("string");
    pm.expect(data.email).to.be.a("string");
    pm.expect(data.accessToken).to.be.a("string").that.is.not.empty;
    pm.expect(data.tokenType).to.eql("Bearer");

    // Tự động gán token vào Postman environment cho các request sau
    pm.environment.set("accessToken", data.accessToken);
    pm.environment.set("currentUserId", data.userId);
});
