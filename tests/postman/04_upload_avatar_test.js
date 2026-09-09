/**
 * Form 4: Tải lên ảnh đại diện (Multipart/form-data)
 * Endpoint: POST {{baseUrl}}/api/profile/avatar
 * Headers: Authorization: Bearer {{accessToken}}
 * Body: form-data (key: "avatar", type: File)
 */

// 1. Kiểm tra HTTP Status Code
pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});

// 2. Kiểm tra ApiResponse envelope
pm.test("Upload response envelope is valid", function () {
    const res = pm.response.json();
    pm.expect(res.success).to.be.true;
    pm.expect(res.status).to.eql(200);
    pm.expect(res.message).to.eql("Cập nhật avatar thành công");
});

// 3. Kiểm tra Avatar URL được tạo thành công
pm.test("Avatar URL is generated and valid format", function () {
    const res = pm.response.json();
    const profile = res.data;
    
    pm.expect(profile).to.be.an("object");
    pm.expect(profile.avatarUrl).to.be.a("string").that.is.not.empty;
    pm.expect(profile.avatarUrl).to.match(/^\/uploads\/avatars\/.+\.(jpg|jpeg|png|webp)$/i);

    // Lưu avatar URL vào biến môi trường
    pm.environment.set("currentAvatarUrl", profile.avatarUrl);
});

// 4. Kiểm tra giới hạn thời gian phản ánh tải file (< 2000ms)
pm.test("Upload response time is acceptable (< 2000ms)", function () {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});
