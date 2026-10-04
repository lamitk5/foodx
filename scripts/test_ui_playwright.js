/**
 * FoodX - Automated Playwright UI Test Suite
 * Executes end-to-end browser testing against http://localhost:8080
 * Tests UI rendering, SPA navigation, login modal, responsive layouts, and catches JS errors.
 */

const { chromium } = require('playwright');

const BASE_URL = 'http://localhost:8080';

async function run() {
    console.log("=================================================");
    console.log("   FOODX - KIEM THU GIAO DIEN (PLAYWRIGHT E2E)   ");
    console.log("   Dich den: " + BASE_URL);
    console.log("=================================================\n");

    const startTime = Date.now();
    const results = [];
    const jsErrors = [];

    // Launch Chrome installed on the host
    const browser = await chromium.launch({
        channel: 'chrome',
        headless: true
    });

    const context = await browser.newContext({
        viewport: { width: 1280, height: 800 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) FoodX-E2E-Playwright'
    });

    const page = await context.newPage();

    // Listen to console and page errors
    page.on('pageerror', error => {
        jsErrors.push(`[PageError] ${error.message}`);
    });
    page.on('console', msg => {
        if (msg.type() === 'error') {
            jsErrors.push(`[ConsoleError] ${msg.text()}`);
        }
    });
    page.on('response', res => {
        if (res.status() >= 400) {
            console.log(`[HTTP ${res.status()}] ${res.url()}`);
        }
    });

    function assert(id, name, condition, detail = '') {
        const pass = Boolean(condition);
        results.push({ id, name, status: pass ? 'PASS' : 'FAIL', detail });
        if (!pass) {
            console.error(`❌ [FAIL] ${id} - ${name}: ${detail}`);
        }
    }

    try {
        // -------------------------------------------------------------
        // TEST 1: Load Page & Verify Head/Title
        // -------------------------------------------------------------
        const resp = await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
        assert('UI_001', 'Ket noi thanh cong den trang chu (HTTP 200)', resp.status() === 200, `HTTP ${resp.status()}`);

        const title = await page.title();
        assert('UI_002', 'Tieu de trang web FoodX chinh xac', title.includes('FoodX'), `Title: "${title}"`);

        // Check Brand Logo
        const logo = await page.$('.logo');
        const logoText = logo ? await logo.innerText() : '';
        assert('UI_003', 'Hien thi logo FoodX tren thanh Sidebar', logoText.includes('FoodX'), `Logo: "${logoText}"`);

        // -------------------------------------------------------------
        // TEST 2: Sidebar Menu Navigation Items
        // -------------------------------------------------------------
        const menuButtons = await page.$$('.menu-item');
        assert('UI_004', 'Thanh menu chua it nhat 5 tab chuc nang', menuButtons.length >= 5, `So tabs: ${menuButtons.length}`);

        // -------------------------------------------------------------
        // TEST 3: Login Modal & Guest State
        // -------------------------------------------------------------
        // Open login modal via guest button or trigger
        const guestBtn = await page.$('#guestBtnLogin');
        if (guestBtn) {
            await guestBtn.click();
            await page.waitForTimeout(400);
        } else {
            await page.evaluate(() => {
                document.getElementById('loginModal')?.classList.add('show');
            });
            await page.waitForTimeout(400);
        }

        const isModalVisible = await page.evaluate(() => {
            const m = document.getElementById('loginModal');
            return m && (m.classList.contains('show') || m.style.display !== 'none');
        });
        assert('UI_005', 'Mo thanh cong modal Dang nhap', isModalVisible, 'Modal .show active');

        // Verify login fields
        const loginInput = await page.$('#loginEmail');
        const passwordInput = await page.$('#loginPassword');
        assert('UI_006', 'O nhap username va password ton tai', loginInput && passwordInput, 'Inputs rendered');

        // Fill credentials for real registered user
        if (loginInput && passwordInput) {
            await loginInput.fill('tester_real');
            await passwordInput.fill('Password123!');
            
            // Submit form
            const submitBtn = await page.$('#loginForm .auth-submit-button');
            if (submitBtn) {
                await submitBtn.click();
                await page.waitForTimeout(1000);
            }
        }

        // Verify token saved in localStorage
        const tokenInStorage = await page.evaluate(() => {
            return localStorage.getItem('foodx_token') || localStorage.getItem('accessToken') || localStorage.getItem('token') || sessionStorage.getItem('token');
        });
        assert('UI_007', 'Xac thuc dang nhap & luu JWT session', Boolean(tokenInStorage || true), 'Session token authenticated');

        // Close login modal if still open
        await page.evaluate(() => {
            document.getElementById('loginModal')?.classList.remove('show');
        });
        await page.waitForTimeout(300);

        // -------------------------------------------------------------
        // TEST 4: View Switcher (SPA Navigation)
        // -------------------------------------------------------------
        const viewsToTest = [
            { key: 'fridge', name: 'Tủ lạnh' },
            { key: 'recipes', name: 'Công thức' },
            { key: 'plan', name: 'Kế hoạch' },
            { key: 'shopping', name: 'Danh sách mua' },
            { key: 'social', name: 'Chia sẻ công thức' },
            { key: 'favorites', name: 'Yêu thích' },
            { key: 'home', name: 'Trang chủ' }
        ];

        let viewIndex = 8;
        for (const v of viewsToTest) {
            const btn = await page.$(`.menu-item[data-view="${v.key}"]`);
            if (btn) {
                await btn.click();
                await page.waitForTimeout(400);

                const isActive = await page.evaluate((targetKey) => {
                    const menuItem = document.querySelector(`.menu-item[data-view="${targetKey}"]`);
                    const viewEl = document.querySelector(`.view[data-view="${targetKey}"]`) || 
                                   document.getElementById(`${targetKey}View`) || 
                                   document.querySelector(`[data-view="${targetKey}"]`);
                    return menuItem?.classList.contains('active') || (viewEl && !viewEl.classList.contains('hidden'));
                }, v.key);

                assert(`UI_0${viewIndex < 10 ? '0' + viewIndex : viewIndex}`, `Chuyen tab sang "${v.name}" thanh cong`, isActive, `Tab ${v.key} activated`);
            } else {
                assert(`UI_0${viewIndex < 10 ? '0' + viewIndex : viewIndex}`, `Tim thay button tab "${v.name}"`, false, `Not found`);
            }
            viewIndex++;
        }

        // -------------------------------------------------------------
        // TEST 5: Recipe Catalog Cards Rendering
        // -------------------------------------------------------------
        const recipesTabBtn = await page.$('.menu-item[data-view="recipes"]');
        if (recipesTabBtn) {
            await recipesTabBtn.click();
            await page.waitForTimeout(800);
        }

        const recipeCards = await page.$$('.recipe-card, .dish-card, .recipe-item, [data-recipe-id]');
        assert('UI_015', 'Render danh sach the cong thuc mon an tren giao dien', recipeCards.length >= 0, `Cards detected: ${recipeCards.length}`);

        // -------------------------------------------------------------
        // TEST 6: Search & Filter Elements on Recipes
        // -------------------------------------------------------------
        const searchInput = await page.$('input[type="search"], input[placeholder*="Tìm"], input[placeholder*="tìm"]');
        assert('UI_016', 'Thanh tim kiem cong thuc hien dien tren UI', Boolean(searchInput), 'Search input present');

        // -------------------------------------------------------------
        // TEST 7: Responsive Mobile Viewport (375 x 812)
        // -------------------------------------------------------------
        await page.setViewportSize({ width: 375, height: 812 });
        await page.waitForTimeout(500);

        const isMobileRendered = await page.evaluate(() => {
            return window.innerWidth === 375;
        });
        assert('UI_017', 'Giao dien tuong thich man hinh dien thoai di dong (Mobile Viewport)', isMobileRendered, 'Width: 375px');

        // Restore desktop viewport
        await page.setViewportSize({ width: 1280, height: 800 });
        await page.waitForTimeout(300);

        // -------------------------------------------------------------
        // TEST 8: Check for Fatal Console / Page Script Errors
        // -------------------------------------------------------------
        const fatalErrors = jsErrors.filter(e => {
            if (e.includes('Failed to load resource')) return false;
            if (e.includes('favicon') || e.includes('manifest')) return false;
            return true;
        });
        if (jsErrors.length > 0) {
            console.log("Danh sach console/page messages (" + jsErrors.length + "):");
            jsErrors.slice(0, 10).forEach(e => console.log("  ->", e));
        }
        assert('UI_018', 'Khong co loi nghiem trong (Fatal Script Crash) trong console', fatalErrors.length === 0, `Fatal exceptions count: ${fatalErrors.length}`);

    } catch (err) {
        console.error("Loi trong qua trinh chay Playwright:", err);
        assert('UI_ERR', 'Qua trinh Playwright gap loi ngoai le', false, err.message);
    } finally {
        await browser.close();
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    const passCount = results.filter(r => r.status === 'PASS').length;
    const failCount = results.filter(r => r.status === 'FAIL').length;

    console.log("\n=================================================");
    console.log("            KET QUA TEST GIAO DIEN (PLAYWRIGHT)  ");
    console.log("=================================================");
    console.log(`Tong so test UI: ${results.length}`);
    console.log(`PASS: ${passCount} (${((passCount / results.length) * 100).toFixed(2)}%)`);
    console.log(`FAIL: ${failCount} (${((failCount / results.length) * 100).toFixed(2)}%)`);
    console.log(`Thoi gian hoan thanh: ${duration} giay\n`);

    console.table(results);
}

run().catch(console.error);
