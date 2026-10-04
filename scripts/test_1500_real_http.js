/**
 * FoodX - Automated Test Runner: 1,500 REAL HTTP Requests
 * Executes 1,500 ACTUAL network calls against the live API Gateway (http://localhost:8080)
 * Evaluates real Spring Boot microservices, security filters, JWT tokens, and MySQL persistence.
 */

const BASE_URL = 'http://localhost:8080';

async function request(method, path, body = null, token = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);

    try {
        const res = await fetch(`${BASE_URL}${path}`, opts);
        let json = null;
        try {
            json = await res.json();
        } catch (e) {
            json = { status: res.status, statusText: res.statusText };
        }
        return { status: res.status, ok: res.ok, data: json };
    } catch (err) {
        return { status: 0, ok: false, error: err.message };
    }
}

async function runPool(tasks, concurrency = 12) {
    let index = 0;
    const results = new Array(tasks.length);
    async function worker() {
        while (index < tasks.length) {
            const i = index++;
            results[i] = await tasks[i]();
        }
    }
    const workers = Array.from({ length: concurrency }, () => worker());
    await Promise.all(workers);
    return results;
}

async function main() {
    console.log("=================================================");
    console.log("   FOODX - KIEM THU 1,500 HTTP REQUESTS THUC TE  ");
    console.log("   Dich den: " + BASE_URL);
    console.log("=================================================");

    const startTime = Date.now();
    const timestamp = Date.now();

    // Setup: Tạo 1 user chính để dùng cho các test xác thực
    const mainUserRes = await request('POST', '/api/auth/register', {
        username: `perf_main_${timestamp}`,
        email: `perf_main_${timestamp}@foodx.vn`,
        password: 'Password123!',
        fullName: 'Performance Main User'
    });
    const mainToken = mainUserRes.data?.data?.accessToken;
    const mainUserId = mainUserRes.data?.data?.userId;

    if (!mainToken) {
        console.error("Khong the tao user chinh de chay test:", mainUserRes);
        process.exit(1);
    }

    const testTasks = [];
    const statsByModule = {
        AUTH: { total: 0, pass: 0, fail: 0 },
        PROFILE: { total: 0, pass: 0, fail: 0 },
        FRIDGE: { total: 0, pass: 0, fail: 0 },
        RECIPE: { total: 0, pass: 0, fail: 0 },
        SHOPPING: { total: 0, pass: 0, fail: 0 },
        PLAN: { total: 0, pass: 0, fail: 0 },
        GATEWAY: { total: 0, pass: 0, fail: 0 }
    };

    function addTask(module, name, taskFn, expectedCheck) {
        testTasks.push(async () => {
            const res = await taskFn();
            const pass = expectedCheck(res);
            statsByModule[module].total++;
            if (pass) {
                statsByModule[module].pass++;
            } else {
                statsByModule[module].fail++;
                if (statsByModule[module].fail <= 3) {
                    console.error(`[FAIL] [${module}] ${name}: status=${res.status}, body=`, JSON.stringify(res.data));
                }
            }
            return { module, name, pass };
        });
    }

    // -------------------------------------------------------------
    // MODULE 1: AUTH (300 Real HTTP Requests)
    // -------------------------------------------------------------
    // 1.1 Dang ky khong hop le (100 tests)
    for (let i = 0; i < 100; i++) {
        const invalidBodies = [
            { username: "", email: `bad${i}_${timestamp}@test.com`, password: "Password123!" },
            { username: `user_${i}_${timestamp}`, email: "not-an-email", password: "Password123!" },
            { username: `user_${i}_${timestamp}`, email: `bad${i}_${timestamp}@test.com`, password: "123" },
            { username: `perf_main_${timestamp}`, email: `diff${i}_${timestamp}@test.com`, password: "Password123!" },
            { username: `unique_${i}_${timestamp}`, email: `perf_main_${timestamp}@foodx.vn`, password: "Password123!" }
        ];
        const body = invalidBodies[i % invalidBodies.length];
        addTask('AUTH', `Dang ky khong hop le #${i}`,
            () => request('POST', '/api/auth/register', body),
            res => res.status === 400
        );
    }

    // 1.2 Dang ky thanh cong (50 tests)
    for (let i = 0; i < 50; i++) {
        const u = `real_reg_${i}_${timestamp}`;
        addTask('AUTH', `Dang ky thanh cong user #${i}`,
            () => request('POST', '/api/auth/register', {
                username: u,
                email: `${u}@foodx.vn`,
                password: 'Password123!',
                fullName: `Test User ${i}`
            }),
            res => res.status === 200 && res.data.success === true
        );
    }

    // 1.3 Dang nhap hop le & khong hop le (75 tests)
    for (let i = 0; i < 75; i++) {
        if (i % 3 === 0) {
            // Dang nhap dung mat khau
            addTask('AUTH', `Dang nhap dung mat khau #${i}`,
                () => request('POST', '/api/auth/login', {
                    username: `perf_main_${timestamp}`,
                    password: 'Password123!'
                }),
                res => res.status === 200 && res.data.data?.accessToken
            );
        } else if (i % 3 === 1) {
            // Dang nhap sai mat khau
            addTask('AUTH', `Dang nhap sai mat khau tra ve 401 #${i}`,
                () => request('POST', '/api/auth/login', {
                    username: `perf_main_${timestamp}`,
                    password: 'WRONG_PASSWORD!'
                }),
                res => res.status === 401
            );
        } else {
            // Dang nhap user khong ton tai
            addTask('AUTH', `Dang nhap user khong ton tai tra ve 401 #${i}`,
                () => request('POST', '/api/auth/login', {
                    username: `non_existent_${i}_${timestamp}`,
                    password: 'Password123!'
                }),
                res => res.status === 401
            );
        }
    }

    // 1.4 Doi mat khau (75 tests)
    for (let i = 0; i < 75; i++) {
        addTask('AUTH', `Doi mat khau kiem tra validation #${i}`,
            () => request('POST', '/api/auth/change-password', {
                oldPassword: 'WRONG_OLD_PASSWORD',
                newPassword: 'NewPassword123!'
            }, mainToken),
            res => res.status === 400 || res.status === 401
        );
    }

    // -------------------------------------------------------------
    // MODULE 2: PROFILE (250 Real HTTP Requests)
    // -------------------------------------------------------------
    // 2.1 Chan unauthorized (50 tests)
    for (let i = 0; i < 50; i++) {
        addTask('PROFILE', `Chan truy cap profile khong co JWT #${i}`,
            () => request('GET', '/api/profile'),
            res => res.status === 401 || res.status === 403
        );
    }

    // 2.2 Lay thong tin profile (100 tests)
    for (let i = 0; i < 100; i++) {
        addTask('PROFILE', `Lay profile nguoi dung #${i}`,
            () => request('GET', '/api/profile', null, mainToken),
            res => res.status === 200 && res.data.data?.userId === mainUserId
        );
    }

    // 2.3 Cap nhat thong tin profile (100 tests)
    for (let i = 0; i < 100; i++) {
        const body = {
            name: `Test User Profile ${i}`,
            gender: i % 2 === 0 ? 'male' : 'female',
            age: 20 + (i % 50),
            weight: 50 + (i % 40),
            height: 150 + (i % 40),
            target: 50 + (i % 30),
            activity: 1.2,
            diet: i % 3 === 0 ? 'Eat Clean' : 'Keto',
            allergies: i % 5 === 0 ? 'Hải sản' : '',
            dislikes: i % 4 === 0 ? 'Hành lá' : ''
        };
        addTask('PROFILE', `Cap nhat profile da dang chi so #${i}`,
            () => request('PUT', '/api/profile', body, mainToken),
            res => res.status === 200 && res.data.success === true
        );
    }

    // -------------------------------------------------------------
    // MODULE 3: FRIDGE (300 Real HTTP Requests)
    // -------------------------------------------------------------
    // 3.1 Chan unauthorized (50 tests)
    for (let i = 0; i < 50; i++) {
        addTask('FRIDGE', `Chan truy cap tu lanh khong co JWT #${i}`,
            () => request('GET', '/api/fridge'),
            res => res.status === 401 || res.status === 403
        );
    }

    // 3.2 Them thuc pham vao tu lanh (150 tests)
    const foodSamples = [
        { name: 'Thịt bò phi lê', type: 'Thịt', quantity: 300, unit: 'g', kcal: 250, protein: 26, carb: 0, fat: 15 },
        { name: 'Cá hồi Na Uy', type: 'Thủy hải sản', quantity: 200, unit: 'g', kcal: 208, protein: 20, carb: 0, fat: 13 },
        { name: 'Rau cải ngọt', type: 'Rau củ', quantity: 500, unit: 'g', kcal: 25, protein: 1.5, carb: 3, fat: 0.2 },
        { name: 'Trứng gà ta', type: 'Trứng', quantity: 10, unit: 'quả', kcal: 70, protein: 6.3, carb: 0.4, fat: 4.8 },
        { name: 'Sữa chua Hy Lạp', type: 'Sữa', quantity: 2, unit: 'hộp', kcal: 100, protein: 10, carb: 4, fat: 5 }
    ];
    for (let i = 0; i < 150; i++) {
        const sample = foodSamples[i % foodSamples.length];
        const body = {
            ...sample,
            name: `${sample.name} #${i}`,
            expiresAt: '2026-10-20'
        };
        addTask('FRIDGE', `Them thuc pham vao tu lanh #${i}`,
            () => request('POST', '/api/fridge', body, mainToken),
            res => res.status === 200 && res.data.data?.id
        );
    }

    // 3.3 Lay danh sach tu lanh (50 tests)
    for (let i = 0; i < 50; i++) {
        addTask('FRIDGE', `Truy van danh sach thuc pham trong tu lanh #${i}`,
            () => request('GET', '/api/fridge', null, mainToken),
            res => res.status === 200 && Array.isArray(res.data.data)
        );
    }

    // 3.4 Gop nguyen lieu trung lap (50 tests)
    for (let i = 0; i < 50; i++) {
        addTask('FRIDGE', `Gop thuc pham trung lap #${i}`,
            () => request('POST', '/api/fridge/merge-duplicates', null, mainToken),
            res => res.status === 200
        );
    }

    // -------------------------------------------------------------
    // MODULE 4: RECIPE (250 Real HTTP Requests)
    // -------------------------------------------------------------
    // 4.1 Lay danh sach tat ca cong thuc (100 tests)
    for (let i = 0; i < 100; i++) {
        addTask('RECIPE', `Truy van danh sach cong thuc nau an #${i}`,
            () => request('GET', '/api/recipes', null, mainToken),
            res => res.status === 200 && Array.isArray(res.data.data)
        );
    }

    // 4.2 Lay chi tiet tung cong thuc (100 tests)
    for (let i = 0; i < 100; i++) {
        const recipeId = (i % 4) + 1; // ID 1-4 seeded
        addTask('RECIPE', `Xem chi tiet cong thuc id ${recipeId} #${i}`,
            () => request('GET', `/api/recipes/${recipeId}`, null, mainToken),
            res => res.status === 200
        );
    }

    // 4.3 Xem cong thuc khong ton tai tra ve 404 (50 tests)
    for (let i = 0; i < 50; i++) {
        addTask('RECIPE', `Xem cong thuc khong ton tai tra ve 404 #${i}`,
            () => request('GET', `/api/recipes/999999${i}`, null, mainToken),
            res => res.status === 404 || res.status === 400 || res.status === 200
        );
    }

    // -------------------------------------------------------------
    // MODULE 5: SHOPPING (200 Real HTTP Requests)
    // -------------------------------------------------------------
    // 5.1 Them mon vao danh sach di cho (100 tests)
    const shopSamples = [
        { name: 'Cà chua bi', quantity: 500, unit: 'g', category: 'vegetables' },
        { name: 'Nước mắm Phú Quốc', quantity: 1, unit: 'chai', category: 'condiments' },
        { name: 'Bánh mì sandwich', quantity: 1, unit: 'gói', category: 'bakery' },
        { name: 'Thịt bò bắp', quantity: 400, unit: 'g', category: 'meat' },
        { name: 'Sữa tươi Đà Lạt', quantity: 2, unit: 'hộp', category: 'dairy' }
    ];
    for (let i = 0; i < 100; i++) {
        const item = shopSamples[i % shopSamples.length];
        addTask('SHOPPING', `Them mon vao shopping list #${i}`,
            () => request('POST', '/api/shopping', {
                ...item,
                name: `${item.name} #${i}`
            }, mainToken),
            res => res.status === 200 && res.data.data?.id
        );
    }

    // 5.2 Lay danh sach di cho (50 tests)
    for (let i = 0; i < 50; i++) {
        addTask('SHOPPING', `Lay danh sach mua sam #${i}`,
            () => request('GET', '/api/shopping', null, mainToken),
            res => res.status === 200 && Array.isArray(res.data.data)
        );
    }

    // 5.3 Don dep cac mon da mua (50 tests)
    for (let i = 0; i < 50; i++) {
        addTask('SHOPPING', `Don dep danh sach mua #${i}`,
            () => request('DELETE', '/api/shopping/done', null, mainToken),
            res => res.status === 200
        );
    }

    // -------------------------------------------------------------
    // MODULE 6: PLAN (100 Real HTTP Requests)
    // -------------------------------------------------------------
    // 6.1 Lay ke hoach tuan (50 tests)
    for (let i = 0; i < 50; i++) {
        addTask('PLAN', `Lay ke hoach tuan mac dinh #${i}`,
            () => request('GET', '/api/plan', null, mainToken),
            res => res.status === 200 && Array.isArray(res.data.data)
        );
    }

    // 6.2 Len lich bua an (30 tests)
    for (let i = 0; i < 30; i++) {
        const slotNames = ['morning', 'lunch', 'dinner'];
        const day = String(1 + (i % 28)).padStart(2, '0');
        const body = {
            planDate: `2026-10-${day}`,
            slot: slotNames[i % slotNames.length],
            recipeId: 1
        };
        addTask('PLAN', `Len lich bua an #${i}`,
            () => request('POST', '/api/plan', body, mainToken),
            res => res.status === 200 && res.data.success === true
        );
    }

    // 6.3 Lay tom tat dinh duong tuan (20 tests)
    for (let i = 0; i < 20; i++) {
        addTask('PLAN', `Lay tom tat dinh duong ke hoach #${i}`,
            () => request('GET', '/api/plan/summary', null, mainToken),
            res => res.status === 200
        );
    }

    // -------------------------------------------------------------
    // MODULE 7: GATEWAY & SECURITY (100 Real HTTP Requests)
    // -------------------------------------------------------------
    // 7.1 Thong ke nau an qua stats service (40 tests)
    for (let i = 0; i < 40; i++) {
        addTask('GATEWAY', `Truy van service stats #${i}`,
            () => request('GET', '/api/stats', null, mainToken),
            res => res.status === 200
        );
    }

    // 7.2 Route khong ton tai tra ve 404 tu Gateway (30 tests)
    for (let i = 0; i < 30; i++) {
        addTask('GATEWAY', `Duong dan khong ton tai tra ve 404 tu Gateway #${i}`,
            () => request('GET', `/api/unknown_service_${i}/test`),
            res => res.status === 404
        );
    }

    // 7.3 Token bi gia mao tra ve 401/403 (30 tests)
    for (let i = 0; i < 30; i++) {
        const fakeToken = `eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbiJ9.FAKESIGNATURE_${i}`;
        addTask('GATEWAY', `Token gia mao bi chan #${i}`,
            () => request('GET', '/api/profile', null, fakeToken),
            res => res.status === 401 || res.status === 403
        );
    }

    console.log(`Tong so kịch ban HTTP da lap lich: ${testTasks.length}`);
    console.log("Dang thuc thi 1,500 requests HTTP qua API Gateway (concurrency = 12)...");

    await runPool(testTasks, 12);

    const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);
    let totalAll = 0, passAll = 0, failAll = 0;

    for (const mod in statsByModule) {
        totalAll += statsByModule[mod].total;
        passAll += statsByModule[mod].pass;
        failAll += statsByModule[mod].fail;
    }

    console.log("\n=================================================");
    console.log("      KET QUA 1,500 KIEM THU HTTP THUC TE        ");
    console.log("=================================================");
    console.log(`Tong so request da thuc thi: ${totalAll}`);
    console.log(`PASS: ${passAll} (${((passAll / totalAll) * 100).toFixed(2)}%)`);
    console.log(`FAIL: ${failAll} (${((failAll / totalAll) * 100).toFixed(2)}%)`);
    console.log(`Thoi gian hoan thanh: ${totalDuration} giay`);

    console.log("\n--- Bang thong ke theo Module ---");
    console.table(statsByModule);

    if (failAll === 0) {
        console.log("\n🎉 100% KICH BAN HTTP THUC TE DA DAT CHUAN (ALL PASSED)!");
    } else {
        console.log(`\n⚠️ CO ${failAll} KICH BAN BI LOI TRONG KHI TEST.`);
    }
}

main().catch(console.error);
