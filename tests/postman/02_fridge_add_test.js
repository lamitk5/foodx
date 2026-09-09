/**
 * Form 2: Thêm thực phẩm vào tủ lạnh
 * Endpoint: POST {{baseUrl}}/api/fridge
 * Headers: Authorization: Bearer {{accessToken}}, Content-Type: application/json
 */

// 1. Kiểm tra HTTP Status Code
pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});

// 2. Kiểm tra ApiResponse envelope
pm.test("Response envelope is successful", function () {
    const res = pm.response.json();
    pm.expect(res.success).to.be.true;
    pm.expect(res.status).to.eql(200);
    pm.expect(res.message).to.include("Đã thêm vào tủ lạnh");
});

// 3. Kiểm tra tính toàn vẹn dữ liệu item vừa thêm
pm.test("Fridge item fields match request data", function () {
    const res = pm.response.json();
    const item = res.data;
    const reqBody = JSON.parse(pm.request.body.raw);

    pm.expect(item).to.be.an("object");
    pm.expect(item.id).to.be.a("number");
    pm.expect(item.name).to.eql(reqBody.name.trim());
    pm.expect(item.quantity).to.eql(reqBody.quantity);
    pm.expect(item.unit).to.eql(reqBody.unit);
    pm.expect(item.expiresAt).to.eql(reqBody.expiresAt);

    // Lưu ID thực phẩm để dùng cho các test case UPDATE / DELETE kế tiếp
    pm.environment.set("createdFridgeItemId", item.id);
});

// 4. Kiểm tra response time & header content-type
pm.test("Header has JSON Content-Type and response time < 800ms", function () {
    pm.expect(pm.response.headers.get("Content-Type")).to.include("application/json");
    pm.expect(pm.response.responseTime).to.be.below(800);
});
