/**
 * FoodX - Real HTTP Integration Test Suite
 * Executes ACTUAL network requests against the running API Gateway (http://localhost:8080)
 * Tests actual Spring Boot microservices, security filters, JWT tokens, and MySQL persistence.
 */

const BASE_URL = 'http://localhost:8080';

async function request(method, path, body = null, token = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);
    
    const res = await fetch(`${BASE_URL}${path}`, opts);
    let json = null;
    try {
        json = await res.json();
    } catch (e) {
        json = { rawStatus: res.status, statusText: res.statusText };
    }
    return { status: res.status, ok: res.ok, data: json };
}

let totalTests = 0;
let passTests = 0;
let failTests = 0;
const results = [];

function assert(id, name, expectedCondition, detail) {
    totalTests++;
    if (expectedCondition) {
        passTests++;
        results.push({ id, name, status: 'PASS', detail });
    } else {
        failTests++;
        results.push({ id, name, status: 'FAIL', detail });
        console.error(`[FAIL] ${id} - ${name}: ${detail}`);
    }
}

async function run() {
    console.log("=================================================");
    console.log("   FOODX - KIEM THU HTTP THUC TE (LIVE E2E)      ");
    console.log("   Target: " + BASE_URL);
    console.log("=================================================");

    const timestamp = Date.now();
    const testUsername = `user_${timestamp}`;
    const testEmail = `user_${timestamp}@foodx.vn`;
    let userToken = '';
    let testUserId = null;

    // 1. AUTH & REGISTRATION
    // 1.1 Register valid
    const regRes = await request('POST', '/api/auth/register', {
        username: testUsername,
        email: testEmail,
        password: 'Password123!',
        fullName: 'Real Test User'
    });
    assert('REAL_001', 'Dang ky tai khoan moi thanh cong', regRes.status === 200 && regRes.data.success === true, `Status: ${regRes.status}`);
    if (regRes.data?.data) {
        userToken = regRes.data.data.accessToken;
        testUserId = regRes.data.data.userId;
    }

    // 1.2 Register duplicate username
    const dupRes = await request('POST', '/api/auth/register', {
        username: testUsername,
        email: `other_${timestamp}@foodx.vn`,
        password: 'Password123!',
        fullName: 'Duplicate User'
    });
    assert('REAL_002', 'Tu choi dang ky trung username', dupRes.status === 400 && dupRes.data.success === false, `Status: ${dupRes.status}`);

    // 1.3 Register invalid email
    const badEmailRes = await request('POST', '/api/auth/register', {
        username: `bad_email_${timestamp}`,
        email: 'invalid-email-address',
        password: 'Password123!',
        fullName: 'Bad Email User'
    });
    assert('REAL_003', 'Tu choi dang ky email sai dinh dang', badEmailRes.status === 400, `Status: ${badEmailRes.status}`);

    // 1.4 Login success
    const loginRes = await request('POST', '/api/auth/login', {
        username: testUsername,
        password: 'Password123!'
    });
    assert('REAL_004', 'Dang nhap dung mat khau tra ve 200 & JWT', loginRes.status === 200 && loginRes.data.data?.accessToken, `Status: ${loginRes.status}`);

    // 1.5 Login case-insensitive
    const loginUpperRes = await request('POST', '/api/auth/login', {
        username: testUsername.toUpperCase(),
        password: 'Password123!'
    });
    assert('REAL_005', 'Dang nhap khong phan biet hoa thuong', loginUpperRes.status === 200 && loginUpperRes.data.success === true, `Status: ${loginUpperRes.status}`);

    // 1.6 Login bad password
    const badPassRes = await request('POST', '/api/auth/login', {
        username: testUsername,
        password: 'WRONG_PASSWORD!'
    });
    assert('REAL_006', 'Dang nhap sai mat khau tra ve 401', badPassRes.status === 401, `Status: ${badPassRes.status}`);

    // 2. PROFILE MANAGEMENT
    // 2.1 Get profile without JWT (should fail 401/403)
    const noAuthProf = await request('GET', '/api/profile');
    assert('REAL_007', 'Chan truy cap profile khi khong co JWT', noAuthProf.status === 401 || noAuthProf.status === 403, `Status: ${noAuthProf.status}`);

    // 2.2 Get profile with JWT
    const getProf = await request('GET', '/api/profile', null, userToken);
    assert('REAL_008', 'Lay profile nguoi dung thanh cong', getProf.status === 200 && getProf.data.data?.userId === testUserId, `Status: ${getProf.status}`);

    // 2.3 Update profile
    const updateProf = await request('PUT', '/api/profile', {
        name: 'Updated Name',
        age: 25,
        weight: 65,
        height: 175,
        target: 62,
        diet: 'Ăn kiêng Low-Carb'
    }, userToken);
    assert('REAL_009', 'Cap nhat profile thanh cong', updateProf.status === 200 && updateProf.data.success === true, `Status: ${updateProf.status}`);

    // 3. INVENTORY & FRIDGE
    // 3.1 Get initial fridge items
    const getFridge1 = await request('GET', '/api/fridge', null, userToken);
    assert('REAL_010', 'Lay danh sach tu lanh ban dau', getFridge1.status === 200 && Array.isArray(getFridge1.data.data), `Status: ${getFridge1.status}`);

    // 3.2 Add item 1: Thit ga
    const addFridge1 = await request('POST', '/api/fridge', {
        name: 'Thịt gà tươi',
        type: 'Thịt tươi',
        quantity: 500,
        unit: 'g',
        kcal: 165,
        protein: 31,
        carb: 0,
        fat: 3.6,
        expiresAt: '2026-10-05'
    }, userToken);
    assert('REAL_011', 'Them thit ga vao tu lanh thanh cong', addFridge1.status === 200 && addFridge1.data.data?.id, `Status: ${addFridge1.status}`);
    const itemId1 = addFridge1.data?.data?.id;

    // 3.3 Add item 2: Trứng gà
    const addFridge2 = await request('POST', '/api/fridge', {
        name: 'Trứng gà Ba Huân',
        type: 'Trứng',
        quantity: 10,
        unit: 'quả',
        kcal: 70,
        protein: 6.3,
        carb: 0.4,
        fat: 4.8,
        expiresAt: '2026-10-15'
    }, userToken);
    assert('REAL_012', 'Them trung ga vao tu lanh thanh cong', addFridge2.status === 200 && addFridge2.data.data?.id, `Status: ${addFridge2.status}`);

    // 3.4 Verify items in fridge
    const getFridge2 = await request('GET', '/api/fridge', null, userToken);
    assert('REAL_013', 'Xac thuc 2 mon da luu vao MySQL', getFridge2.status === 200 && getFridge2.data.data?.length >= 2, `Count: ${getFridge2.data?.data?.length}`);

    // 3.5 Delete item 1
    if (itemId1) {
        const delRes = await request('DELETE', `/api/fridge/${itemId1}`, null, userToken);
        assert('REAL_014', 'Xoa thuc pham khoi tu lanh thanh cong', delRes.status === 200, `Status: ${delRes.status}`);
    }

    // 4. RECIPES
    // 4.1 Get recipes catalog
    const recipesRes = await request('GET', '/api/recipes', null, userToken);
    assert('REAL_015', 'Lay danh sach cong thuc nau an tu MySQL', recipesRes.status === 200 && Array.isArray(recipesRes.data.data) && recipesRes.data.data.length > 0, `Recipes count: ${recipesRes.data?.data?.length}`);

    // 4.2 Get single recipe detail
    const sampleRecipeId = recipesRes.data?.data?.[0]?.id;
    if (sampleRecipeId) {
        const recDetail = await request('GET', `/api/recipes/${sampleRecipeId}`, null, userToken);
        assert('REAL_016', 'Lay chi tiet 1 cong thuc nau an', recDetail.status === 200 && recDetail.data.data?.title, `Title: ${recDetail.data?.data?.title}`);
    }

    // 5. SHOPPING LIST
    // 5.1 Get shopping list
    const shopListRes = await request('GET', '/api/shopping', null, userToken);
    assert('REAL_017', 'Lay danh sach di cho ban dau', shopListRes.status === 200, `Status: ${shopListRes.status}`);

    // 5.2 Add item to shopping list
    const addShopRes = await request('POST', '/api/shopping', {
        name: 'Sữa tươi không đường',
        quantity: 2,
        unit: 'hộp',
        category: 'dairy'
    }, userToken);
    assert('REAL_018', 'Them thuc pham vao danh sach di cho', addShopRes.status === 200, `Status: ${addShopRes.status}`);

    // 6. MEAL PLAN
    // 6.1 Get meal plan
    const mealPlanRes = await request('GET', '/api/plan', null, userToken);
    assert('REAL_019', 'Lay ke hoach bua an tuan', mealPlanRes.status === 200, `Status: ${mealPlanRes.status}`);

    // 7. SOCIAL & STATS
    // 7.1 Get social posts
    const socialRes = await request('GET', '/api/social/posts', null, userToken);
    assert('REAL_020', 'Lay bang tin chia se cong thuc (Social feed)', socialRes.status === 200, `Status: ${socialRes.status}`);

    // SUMMARY
    console.log("\n=================================================");
    console.log("            KET QUA KIEM THU HTTP THUC TE        ");
    console.log("=================================================");
    console.log(`Tong so test cases HTTP: ${totalTests}`);
    console.log(`PASS: ${passTests} (${((passTests / totalTests) * 100).toFixed(2)}%)`);
    console.log(`FAIL: ${failTests} (${((failTests / totalTests) * 100).toFixed(2)}%)`);

    console.table(results.map(r => ({ id: r.id, name: r.name, status: r.status, detail: r.detail })));
}

run().catch(console.error);
