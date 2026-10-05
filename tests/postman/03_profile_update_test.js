/**
 * Form 3: Cập nhật hồ sơ dinh dưỡng
 * Endpoint: PUT {{baseUrl}}/api/profile
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
    pm.expect(res.message).to.eql("Cập nhật hồ sơ thành công");
});

// 3. Kiểm tra tính đúng đắn của các chỉ số profile
pm.test("Profile updated metrics match input", function () {
    const res = pm.response.json();
    const profile = res.data;
    const reqBody = JSON.parse(pm.request.body.raw);

    pm.expect(profile.name).to.eql(reqBody.name.trim());
    pm.expect(profile.gender).to.eql(reqBody.gender);
    pm.expect(profile.age).to.eql(reqBody.age);
    pm.expect(profile.weight).to.eql(reqBody.weight);
    pm.expect(profile.height).to.eql(reqBody.height);
    pm.expect(profile.diet).to.eql(reqBody.diet);
    pm.expect(profile.allergies).to.eql(reqBody.allergies);
    pm.expect(profile.dislikes).to.eql(reqBody.dislikes);
});

// 4. Kiểm tra trường tính toán BMI & BMR (nếu backend hỗ trợ tính toán tự động)
pm.test("Response returns valid profile schema", function () {
    const res = pm.response.json();
    pm.expect(res.data).to.have.all.keys(
        "id", "userId", "name", "gender", "age", "weight", "height",
        "targetWeight", "activity", "diet", "allergies", "dislikes", "avatarUrl"
    );
});
