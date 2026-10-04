/**
 * =========================================================
 * FOODX - APP.JS (Bộ điều hướng và kết nối ứng dụng)
 * =========================================================
 */

var qaOpen = false;
var slideIndex = 0;
var slideTimer = null;
var currentBlogCategory = 'all';
var homeBlogRecipesCache = null;

const BLOG_CAT_META = [
    { key: 'mon-an-gia-dinh',  cat: 'mon-an-gia-dinh',  label: '🍚 Món ăn gia đình' },
    { key: 'mon-sang',         cat: 'mon-sang',         label: '🥣 Món sáng' },
    { key: 'eat-clean',        cat: 'eat-clean',        label: '🥗 Eat Clean' },
    { key: 'nau-nhanh',        cat: 'nau-nhanh',        label: '⚡ Nấu nhanh' },
    { key: 'banh-trang-mieng', cat: 'banh-trang-mieng', label: '🍰 Bánh & Tráng miệng' },
    { key: 'family',           cat: 'family',           label: '🍚 Món chính' },
    { key: 'breakfast',        cat: 'breakfast',        label: '🥣 Món sáng' },
    { key: 'eatclean',         cat: 'eatclean',         label: '🥗 Món ăn kiêng' },
    { key: 'dessert',          cat: 'dessert',          label: '🍰 Món tráng miệng' }
];

/* =========================================================
   1. SINGLE PAGE APPLICATION ROUTER (openView)
========================================================= */

function closeDrawer() {
    if (document.body) document.body.classList.remove('drawer-open');
}

function closeQa() {
    qaOpen = false;
    const fab = document.getElementById('qaFab');
    const menu = document.getElementById('qaMenu');
    if (fab) fab.classList.remove('open');
    if (menu) menu.hidden = true;
}

function openView(name) {
    if (!name) name = "home";
    if (name === "stats") name = "home";

    const AUTH_REQUIRED_VIEWS = ["fridge", "favorites", "shopping", "plan", "admin"];
    if (AUTH_REQUIRED_VIEWS.includes(name) && typeof isUserLoggedIn === "function" && !isUserLoggedIn()) {
        if (typeof requireAuth === "function") requireAuth(name);
        return;
    }

    if (name === "admin" && (!window.authState || window.authState.role !== "ADMIN")) {
        if (typeof showToast === "function") showToast("Chỉ tài khoản Quản trị viên (ADMIN) mới có quyền truy cập", "error");
        openView("home");
        return;
    }

    if (typeof state !== "undefined" && state) {
        state.activeView = name;
    }

    try {
        localStorage.setItem("foodx_active_view", name);
        if (window.history && window.history.replaceState) {
            window.history.replaceState(null, "", "#" + name);
        }
    } catch (_) {}

    // Toggle active view visibility
    document.querySelectorAll(".view").forEach(view => view.classList.remove("active"));
    const targetView = document.getElementById(`view-${name}`);
    if (targetView) {
        targetView.classList.add("active");
        if (typeof window.trigger3DViewTransition === "function") {
            window.trigger3DViewTransition(targetView);
        }
    }

    // Sync sidebar active state
    document.querySelectorAll(".menu-item").forEach(button => {
        button.classList.toggle("active", button.dataset.view === name);
    });

    // Sync bottom navigation active state (mobile)
    document.querySelectorAll(".bn-item").forEach(button => {
        button.classList.toggle("active", button.getAttribute("data-bottom-nav") === name);
    });

    // Close mobile drawers and overlays if open
    closeDrawer();
    closeQa();

    // Data Hydration per view
    try {
        if (name === "home") {
            loadHomeDashboard();
            renderHomeBlogSection();
        } else if (name === "fridge") {
            if (typeof renderFridge === "function") renderFridge();
            if (typeof renderExpiring === "function") renderExpiring();
        } else if (name === "recipes") {
            if (typeof loadRecipes === "function") loadRecipes();
        } else if (name === "plan") {
            if (typeof loadPlan === "function") loadPlan();
        } else if (name === "favorites") {
            if (typeof renderFavorites === "function") renderFavorites();
        } else if (name === "shopping") {
            if (typeof renderShopping === "function") renderShopping();
        } else if (name === "social") {
            if (typeof loadSocialFeed === "function") loadSocialFeed();
        } else if (name === "admin") {
            if (typeof loadAdminDashboard === "function") loadAdminDashboard();
        }
    } catch (err) {
        console.warn("View hydration error for " + name + ":", err);
    }

    if (typeof window !== "undefined" && typeof window.scrollTo === "function") {
        try {
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (_) {}
    }
}

function syncBottomNav(name) {
    document.querySelectorAll('[data-bottom-nav]').forEach(function (b) {
        b.classList.toggle('active', b.getAttribute('data-bottom-nav') === name);
    });
}

function toggleQa() {
    qaOpen = !qaOpen;
    const fab = document.getElementById('qaFab');
    const menu = document.getElementById('qaMenu');
    if (fab) fab.classList.toggle('open', qaOpen);
    if (menu) menu.hidden = !qaOpen;
}

async function handleQa(action) {
    closeQa();
    if (action === 'ingredient') {
        openView('fridge');
        const btn = document.getElementById('openCustomIngredient');
        if (btn) {
            setTimeout(() => btn.click(), 200);
        } else {
            const fab = document.getElementById('nav-fab');
            if (fab) fab.click();
        }
        return;
    }
    if (action === 'recipe') {
        if (typeof openRecipeCreateModal === 'function') openRecipeCreateModal();
        return;
    }
    if (action === 'plan') {
        openView('plan');
        setTimeout(() => {
            if (typeof openAddMeal === 'function' && typeof d2s === 'function') openAddMeal(d2s(new Date()), 'lunch');
        }, 250);
        return;
    }
    if (action === 'notify') {
        if (typeof enableExpiryReminders === 'function') enableExpiryReminders();
        return;
    }
}

function handleHeroCtaClick() {
    const sug = document.getElementById("suggestionSection") || document.getElementById("homeSuggestCard");
    if (sug) {
        sug.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
        openView("recipes");
    }
}

function goBackFromRecipeDetail() {
    const prev = (typeof window !== 'undefined' && window.previousViewBeforeRecipe) ? window.previousViewBeforeRecipe : 'recipes';
    openView(prev);
}

function goToFoodSearch() {
    openView("home");
    setTimeout(() => {
        const search = document.getElementById("foodSearch");
        search?.scrollIntoView({ behavior: "smooth", block: "center" });
        search?.focus();
    }, 250);
}

/* =========================================================
   2. HOME DASHBOARD & HERO SLIDER
========================================================= */

function homeUserName() {
    try {
        if (window.authState && window.authState.authenticated && (window.authState.fullName || window.authState.username)) {
            return window.authState.fullName || window.authState.username;
        }
    } catch (_) {}
    return '';
}

function expiryInfo(iso) {
    if (!iso) return null;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const d = new Date(iso + 'T00:00:00');
    const diff = Math.round((d - today) / 864e5);
    if (diff < 0) return { cls: 'expired', label: 'Đã hết hạn' };
    if (diff === 0) return { cls: 'soon', label: 'Hết hạn hôm nay' };
    if (diff <= 2) return { cls: 'soon', label: 'Còn ' + diff + ' ngày' };
    return { cls: 'ok', label: 'Còn ' + diff + ' ngày' };
}

function foodEmoji(name) {
    const n = String(name || '').toLowerCase();
    const map = { 'gà': '🍗', 'bò': '🥩', 'heo': '🥓', 'cá': '🐟', 'tôm': '🦐', 'trứng': '🥚', 'sữa': '🥛', 'cà rốt': '🥕', 'cải': '🥬', 'bông cải': '🥦', 'hành': '🌿', 'tỏi': '🧄', 'cà chua': '🍅', 'bí': '🎃', 'chuối': '🍌', 'táo': '🍎', 'chanh': '🍋', 'ớt': '🌶️', 'gạo': '🍚', 'mì': '🍜', 'bánh mì': '🥖', 'đậu hũ': '⬜', 'rau': '🥬', 'mật ong': '🍯', 'dầu': '🫗' };
    for (const k in map) { if (n.includes(k)) return map[k]; }
    return '🥫';
}

async function loadHomeDashboard() {
    const greet = document.getElementById('homeGreeting');
    const dateEl = document.getElementById('homeDate');
    if (greet) {
        const name = homeUserName();
        greet.textContent = name ? 'Chào ' + name.split(' ').pop() + ' 👋' : 'Chào bạn 👋';
    }
    if (dateEl) {
        dateEl.textContent = new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' });
    }

    const card = document.getElementById('homeFridgeCard');
    const expBox = document.getElementById('homeExpiringCard');
    const expList = document.getElementById('homeExpiring');
    const title = document.getElementById('homeFridgeTitle');
    const sub = document.getElementById('homeFridgeSub');
    let items = [];

    try {
        items = await apiRequest('/api/fridge') || [];
    } catch (e) {
        if (title) title.textContent = 'Đăng nhập để quản lý tủ lạnh';
        if (sub) sub.textContent = 'Lưu nguyên liệu và nhận gợi ý món ăn';
        return;
    }

    if (title) title.textContent = 'Bạn có ' + items.length + ' nguyên liệu trong tủ';
    const expiring = items.filter(function (i) {
        const info = expiryInfo(i.expiresAt);
        return info && (info.cls === 'expired' || info.cls === 'soon');
    }).sort(function (a, b) { return String(a.expiresAt).localeCompare(String(b.expiresAt)); });

    if (sub) sub.textContent = expiring.length ? expiring.length + ' nguyên liệu sắp hết hạn' : 'Tủ lạnh còn đủ thời gian sử dụng';
    if (expBox && expiring.length) {
        expBox.hidden = false;
        if (expList) {
            expList.innerHTML = expiring.slice(0, 4).map(function (i) {
                const info = expiryInfo(i.expiresAt);
                return '<div class="he-item"><span>' + foodEmoji(i.name) + '</span>' +
                    '<span class="he-name">' + escapeHtml(i.name) + '</span>' +
                    '<span class="exp-badge ' + info.cls + '">' + info.label + '</span></div>';
            }).join('');
        }
    } else if (expBox) {
        expBox.hidden = true;
    }
    loadTodayMeals();
}

async function loadTodayMeals() {
    const card = document.getElementById('homeTodayCard');
    const list = document.getElementById('homeToday');
    if (!card) return;
    if (typeof isUserLoggedIn === 'function' && !isUserLoggedIn()) {
        card.hidden = true;
        return;
    }
    const today = (typeof d2s === 'function') ? d2s(new Date()) : new Date().toISOString().split('T')[0];
    try {
        const entries = await apiRequest('/api/plan?start=' + today + '&end=' + today) || [];
        if (!entries.length) { card.hidden = true; return; }
        card.hidden = false;
        const SLOT = { morning: '🌅 Sáng', lunch: '☀️ Trưa', dinner: '🌙 Tối' };
        const bySlot = {};
        entries.forEach(function (e) { bySlot[e.slot] = e; });
        if (list) {
            list.innerHTML = ['morning', 'lunch', 'dinner'].map(function (s) {
                const e = bySlot[s];
                return e
                    ? '<div class="ht-row"><span class="ht-slot">' + SLOT[s] + '</span><b>' + escapeHtml(e.recipeTitle) + '</b><span class="ht-kcal">' + (e.recipeKcal || 0) + ' kcal</span></div>'
                    : '<div class="ht-row"><span class="ht-slot">' + SLOT[s] + '</span><b style="color:var(--text-soft);font-weight:500">Chưa có bữa ăn</b></div>';
            }).join('');
        }
    } catch (e) {
        card.hidden = true;
    }
}

async function loadHomeSuggest() {
    const card = document.getElementById('homeSuggestCard');
    const list = document.getElementById('homeSuggest');
    const btn = document.getElementById('homeSuggestBtn');
    if (!card || !list) return;

    if (typeof isUserLoggedIn === 'function' && !isUserLoggedIn()) {
        card.hidden = false;
        if (typeof renderEmpty === 'function') {
            renderEmpty(
                list,
                '✨',
                'Gợi ý thực đơn thông minh',
                'Đăng nhập để nhận gợi ý món ngon phù hợp từ nguyên liệu trong tủ lạnh của bạn.',
                'Đăng nhập ngay',
                function () { if (typeof requireAuth === 'function') requireAuth('suggest'); }
            );
        }
        return;
    }

    let ingredients = [];
    try {
        const items = await apiRequest('/api/fridge') || [];
        ingredients = items.map(i => i.name);
    } catch (_) {}

    if (btn) btn.disabled = true;
    card.hidden = false;
    if (typeof showSkeleton === 'function') showSkeleton(list, 'card', 3);

    try {
        const res = await apiRequest('/api/ai/suggest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ availableIngredients: ingredients, preference: '', mealType: '', maxSuggestions: 3 })
        });
        const sug = (res && res.suggestions) || [];
        if (!sug.length) {
            if (typeof renderEmpty === 'function') {
                renderEmpty(list, '🤖', 'Chưa có gợi ý', 'Thêm nguyên liệu vào tủ lạnh để nhận món phù hợp.', 'Xem tủ lạnh', function () { openView('fridge'); });
            }
        } else {
            list.innerHTML = sug.map(function (s) {
                return '<div class="hs-item"><b>' + escapeHtml(s.title || '') + '</b>' +
                    '<span>' + escapeHtml(s.description || '') + '</span>' +
                    (s.estimatedTime ? '<span style="margin-top:6px">⏱ ' + escapeHtml(s.estimatedTime) + '</span>' : '') + '</div>';
            }).join('');
        }
    } catch (err) {
        if (typeof renderError === 'function') renderError(list, loadHomeSuggest);
    } finally {
        if (btn) btn.disabled = false;
    }
}

async function loadHomeBlogRecipes() {
    if (homeBlogRecipesCache) return homeBlogRecipesCache;
    try {
        const list = await apiRequest('/api/recipes');
        homeBlogRecipesCache = Array.isArray(list) ? list : [];
    } catch (_) {
        homeBlogRecipesCache = [];
    }
    return homeBlogRecipesCache;
}

function renderHomeBlogPills(categoriesPresent) {
    const pillsWrap = document.getElementById('homeBlogPills');
    if (!pillsWrap) return;
    let html = '<button type="button" class="blog-pill active" data-blog-cat="all">✨ Tất cả món</button>';
    BLOG_CAT_META.forEach(function (m) {
        if (!categoriesPresent.has(m.cat)) return;
        html += '<button type="button" class="blog-pill" data-blog-cat="' + m.key + '">' + m.label + '</button>';
    });
    pillsWrap.innerHTML = html;
}

async function renderHomeBlogSection(catFilter) {
    const grid = document.getElementById('homeBlogGrid');
    if (!grid) return;

    catFilter = catFilter || currentBlogCategory || 'all';
    currentBlogCategory = catFilter;

    const recipes = await loadHomeBlogRecipes();
    const posts = recipes.map(function (r) {
        return {
            id: r.id,
            title: r.title || r.name || 'Món ăn',
            description: r.description || '',
            image: r.imageUrl || '/images/recipes/default-recipe.jpg',
            kcal: r.kcal ? Math.round(r.kcal) : '',
            cookTime: r.cookTime ? (r.cookTime + ' phút') : '',
            difficulty: r.difficulty || 'Dễ',
            category: r.category || 'Món chính'
        };
    });

    const categoriesPresent = new Set(posts.map(p => p.category));
    renderHomeBlogPills(categoriesPresent);

    const pillsWrap = document.getElementById('homeBlogPills');
    if (pillsWrap) {
        pillsWrap.querySelectorAll('.blog-pill').forEach(p => p.classList.remove('active'));
        const activePill = pillsWrap.querySelector('.blog-pill[data-blog-cat="' + catFilter + '"]');
        if (activePill) {
            activePill.classList.add('active');
        } else {
            const allPill = pillsWrap.querySelector('.blog-pill[data-blog-cat="all"]');
            if (allPill) allPill.classList.add('active');
            catFilter = 'all';
        }
    }

    let filtered = posts;
    if (catFilter !== 'all') {
        const meta = BLOG_CAT_META.find(m => m.key === catFilter);
        filtered = meta ? posts.filter(p => p.category === meta.cat) : posts;
    }
    const shown = filtered.slice(0, 8);

    if (!shown.length) {
        grid.innerHTML = '<div class="social-empty" style="grid-column:1/-1;text-align:center;padding:30px;">Chưa có món trong mục này — hãy là người chia sẻ công thức đầu tiên nhé!</div>';
        return;
    }

    grid.innerHTML = shown.map(function (p) {
        return '<div class="blog-card" onclick="openRecipeDetail(' + p.id + ')">' +
            '<div class="blog-card-img-wrap">' +
                '<img class="blog-card-img" src="' + escapeHtml(p.image) + '" alt="' + escapeHtml(p.title) + '" loading="lazy" onerror="this.src=\'/images/recipes/default-recipe.jpg\'">' +
                '<span class="blog-category-tag">' + (p.cookTime ? '⏱ ' + p.cookTime : (p.difficulty ? escapeHtml(p.difficulty) : 'Món ăn')) + '</span>' +
            '</div>' +
            '<div class="blog-card-body">' +
                '<div class="blog-author-meta" style="margin-bottom:8px;">' +
                    '<div class="blog-avatar" style="width:24px;height:24px;font-size:12px;">🍳</div>' +
                    '<span class="blog-author-name" style="font-size:12px;">FoodX • <small style="opacity:0.7">Kho công thức cộng đồng</small></span>' +
                '</div>' +
                '<h4 class="blog-card-title">' + escapeHtml(p.title) + '</h4>' +
                '<p class="blog-card-desc">' + escapeHtml(String(p.description || '').slice(0, 140)) + '</p>' +
                '<div class="blog-card-footer">' +
                    '<span>🔥 ' + p.kcal + ' kcal</span>' +
                    '<span>' + escapeHtml(p.category) + '</span>' +
                '</div>' +
            '</div>' +
        '</div>';
    }).join('');
}

// Hero Slider
function displaySlide(index) {
    const slidesList = (typeof window !== 'undefined' && window.slides) ? window.slides : [];
    if (!slidesList || !slidesList.length) return;

    slideIndex = (index + slidesList.length) % slidesList.length;
    const slide = slidesList[slideIndex];

    const heroImage = document.getElementById("heroImage");
    const heroContent = document.getElementById("heroContent");

    heroImage?.classList.add("fade");
    heroContent?.classList.add("changing");

    setTimeout(() => {
        if (heroImage) heroImage.src = slide.image;
        if (typeof setText === 'function') {
            setText("heroBadge", slide.badge);
            setText("heroDescription", slide.description);
        }
        const title = document.getElementById("heroTitle");
        if (title) title.innerHTML = slide.title;

        document.querySelectorAll(".hero-dot").forEach((dot, i) => {
            dot.classList.toggle("active", i === slideIndex);
        });

        heroImage?.classList.remove("fade");
        heroContent?.classList.remove("changing");
    }, 220);
}

function startSlider() {
    clearInterval(slideTimer);
    slideTimer = setInterval(() => displaySlide(slideIndex + 1), 5000);
}

/* =========================================================
   3. RENDER ALL & BOOTSTRAP (startFoodX)
========================================================= */

function renderAll() {
    if (typeof renderAvatar === 'function') renderAvatar();
    if (typeof renderProfile === 'function') renderProfile();
    if (typeof renderAuthSettings === 'function') renderAuthSettings();
    if (typeof renderSearch === 'function') renderSearch();
    if (typeof renderFridge === 'function') renderFridge();
    if (typeof renderRecipes === 'function') renderRecipes();
    if (typeof renderFavorites === 'function') renderFavorites();
    if (typeof renderShopping === 'function') renderShopping();
    if (typeof renderStats === 'function') renderStats();
    if (typeof renderExpiring === 'function') renderExpiring();
}

async function startFoodX() {
    // 0. Khôi phục authState & profile ngay lập tức từ localStorage
    const token = (typeof getToken === 'function') ? getToken() : '';
    let savedUser = null;
    try {
        savedUser = JSON.parse(localStorage.getItem("foodx_user") || "null");
    } catch (_) {}

    if (token && savedUser) {
        if (typeof authState !== 'undefined') {
            window.authState = { ...window.authState, ...savedUser, authenticated: true };
        }
        if (typeof state !== "undefined" && state) {
            state.userId = savedUser.userId || savedUser.id;
            if (savedUser.fullName) state.profile.name = savedUser.fullName;
            if (savedUser.avatarUrl) state.profile.avatarUrl = savedUser.avatarUrl;
        }
    }

    // 1. Khôi phục tab từ URL Hash
    const hash = window.location.hash ? window.location.hash.replace("#", "").trim() : "";
    const validViews = ["home", "fridge", "recipes", "plan", "favorites", "shopping", "social", "admin"];
    let initialView = "home";

    if (hash && validViews.includes(hash)) {
        initialView = hash;
    }

    const AUTH_REQUIRED = ["fridge", "favorites", "shopping", "plan", "admin"];
    if (AUTH_REQUIRED.includes(initialView) && typeof isUserLoggedIn === 'function' && !isUserLoggedIn()) {
        initialView = "home";
    }

    renderAll();
    openView(initialView);

    // 2. Tải thông tin phiên đăng nhập
    if (token && typeof loadAuthState === 'function') {
        try {
            await loadAuthState(false);
        } catch (_) {}
    }

    if (typeof isUserLoggedIn === 'function' && !isUserLoggedIn()) {
        if (typeof renderAuthSettings === 'function') renderAuthSettings();
        return;
    }

    // 3. Đồng bộ dữ liệu MySQL
    try {
        const promises = [];
        if (typeof loadFridgeFromApi === 'function') promises.push(loadFridgeFromApi(false));
        if (typeof loadProfileFromApi === 'function') promises.push(loadProfileFromApi(false));
        await Promise.all(promises);
        console.log("✅ FoodX đã đồng bộ dữ liệu người dùng.");
    } catch (_) {}

    renderAll();
    openView(initialView);
}

/* =========================================================
   4. GLOBAL EVENT DELEGATION & LISTENERS
========================================================= */

(function initGlobalAppListeners() {
    // Menu navigation bindings
    document.querySelectorAll(".menu-item").forEach(btn => {
        btn.addEventListener("click", () => openView(btn.dataset.view));
    });

    document.querySelectorAll("[data-open-view]").forEach(btn => {
        btn.addEventListener("click", () => openView(btn.dataset.openView));
    });

    document.querySelectorAll("[data-bottom-nav]").forEach(btn => {
        btn.addEventListener("click", () => openView(btn.getAttribute("data-bottom-nav")));
    });

    // Hash change routing
    window.addEventListener("hashchange", function () {
        const hash = window.location.hash ? window.location.hash.replace("#", "").trim() : "";
        const validViews = ["home", "fridge", "recipes", "plan", "favorites", "shopping", "social", "admin"];
        if (hash && validViews.includes(hash)) {
            openView(hash);
        }
    });

    // Quick Action Fab
    const qaFab = document.getElementById('qaFab');
    if (qaFab) qaFab.addEventListener('click', toggleQa);

    document.querySelectorAll('.qa-item').forEach(it => {
        it.addEventListener('click', () => handleQa(it.getAttribute('data-qa')));
    });

    // Drawer menu
    const mobileBtn = document.getElementById('mobileMenuButton');
    if (mobileBtn) {
        mobileBtn.addEventListener('click', e => {
            e.stopPropagation();
            document.body.classList.toggle('drawer-open');
        });
    }

    // Hero slider controls
    document.getElementById("nextSlide")?.addEventListener("click", () => {
        displaySlide(slideIndex + 1);
        startSlider();
    });
    document.getElementById("prevSlide")?.addEventListener("click", () => {
        displaySlide(slideIndex - 1);
        startSlider();
    });
    document.querySelectorAll(".hero-dot").forEach(dot => {
        dot.addEventListener("click", () => {
            displaySlide(Number(dot.dataset.index));
            startSlider();
        });
    });
    document.getElementById("exploreButton")?.addEventListener("click", () => {
        document.getElementById("suggestionSection")?.scrollIntoView({ behavior: "smooth" });
    });

    // Home blog category tabs
    const blogPillsWrap = document.getElementById('homeBlogPills');
    if (blogPillsWrap) {
        blogPillsWrap.addEventListener('click', function (e) {
            const pill = e.target.closest('.blog-pill');
            if (!pill) return;
            blogPillsWrap.querySelectorAll('.blog-pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            renderHomeBlogSection(pill.getAttribute('data-blog-cat'));
        });
    }

    // Home AI suggest button
    document.getElementById('homeSuggestBtn')?.addEventListener('click', loadHomeSuggest);

    // Global document clicks & escape key
    document.addEventListener('click', function (e) {
        if (document.body.classList.contains('drawer-open') && !e.target.closest('.sidebar') && !e.target.closest('#mobileMenuButton')) {
            closeDrawer();
        }
        if (qaOpen && !e.target.closest('#qaMenu') && !e.target.closest('#qaFab')) {
            closeQa();
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeQa();
            closeDrawer();
            document.querySelectorAll('.modal-overlay.show').forEach(m => m.classList.remove('show'));
            document.querySelectorAll('.modal-overlay[id="planMealModal"], .modal-overlay[id="shoppingRecipeModal"]').forEach(m => {
                m.setAttribute('hidden', '');
                m.style.display = 'none';
            });
            document.body.style.overflow = '';
        }
    });

    // Global Action Delegation
    document.addEventListener("click", event => {
        const target = event.target.closest("[data-action]");
        if (!target) return;

        const action = target.dataset.action;
        const rawId = target.dataset.id;
        const id = Number(rawId);

        if (action === "add-food" && typeof addFoodToFridge === 'function') {
            addFoodToFridge(rawId, target);
        } else if (action === "ingredient-detail" && typeof openIngredientDetail === 'function') {
            openIngredientDetail(id);
        } else if (action === "save-ingredient-full" && typeof saveIngredientFull === 'function') {
            saveIngredientFull(id);
        } else if (action === "save-ingredient-expiry" && typeof saveIngredientExpiry === 'function') {
            saveIngredientExpiry(id);
        } else if (action === "increase-fridge" && typeof adjustFridge === 'function') {
            adjustFridge(id, 1);
        } else if (action === "decrease-fridge" && typeof adjustFridge === 'function') {
            adjustFridge(id, -1);
        } else if (action === "use-fridge" && typeof useFridgeFood === 'function') {
            useFridgeFood(id);
        } else if (action === "delete-fridge" && typeof deleteFridgeFood === 'function') {
            deleteFridgeFood(id);
        } else if (action === "favorite" && typeof toggleFavorite === 'function') {
            toggleFavorite(id);
        } else if (action === "recipe-detail" && typeof openRecipeDetail === 'function') {
            openRecipeDetail(id);
        } else if (action === "start-cooking" && typeof startCooking === 'function') {
            startCooking(id);
        } else if (action === "ask-recipe-ai" && typeof openContextChat === 'function') {
            const recipe = (typeof getRecipeById === 'function') ? getRecipeById(id) : null;
            if (recipe) {
                window.activeRecipeContext = {
                    id: recipe.id,
                    name: recipe.name || recipe.title,
                    ingredients: [...(recipe.ingredients || [])],
                    steps: [...(recipe.steps || [])],
                    kcal: recipe.kcal,
                    time: recipe.time || recipe.cookTime,
                    difficulty: recipe.difficulty
                };
                openContextChat("recipe");
            }
        } else if (action === "add-missing" && typeof addMissingIngredients === 'function') {
            addMissingIngredients(String(target.dataset.recipe));
        } else if (action === "shopping-delete" && typeof delShop === 'function') {
            delShop(id);
        }
    });

    // Global Checkbox Delegation
    document.addEventListener("change", event => {
        const fridgeCheckbox = event.target.closest('[data-action="select-fridge"]');
        if (fridgeCheckbox && typeof toggleSelectedFridge === 'function') {
            toggleSelectedFridge(Number(fridgeCheckbox.dataset.id), fridgeCheckbox.checked);
            return;
        }

        const shoppingCheckbox = event.target.closest('[data-action="shopping-check"]');
        if (shoppingCheckbox && typeof toggleShop === 'function') {
            toggleShop(Number(shoppingCheckbox.dataset.id));
        }
    });

    displaySlide(0);
    startSlider();
})();

/* =========================================================
   5. SERVICE WORKER & GLOBAL IMAGE LAZY LOADING
========================================================= */

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('[FoodX PWA] Service Worker registered, scope:', reg.scope))
            .catch(err => console.warn('[FoodX PWA] Service Worker registration failed:', err));
    });
}

(function initGlobalLazyImages() {
    function apply(img) {
        if (img && img.tagName === 'IMG' && !img.hasAttribute('loading')) {
            img.setAttribute('loading', 'lazy');
        }
        if (img && img.tagName === 'IMG' && !img.hasAttribute('decoding')) {
            img.setAttribute('decoding', 'async');
        }
    }
    function scan(root) {
        if (root && root.querySelectorAll) {
            root.querySelectorAll('img').forEach(apply);
        }
    }
    if (document.body) scan(document);
    document.addEventListener('DOMContentLoaded', () => scan(document));
    if (typeof MutationObserver !== 'undefined') {
        try {
            const mo = new MutationObserver(mutations => {
                mutations.forEach(m => {
                    m.addedNodes.forEach(n => {
                        if (n.nodeType === 1) {
                            if (n.tagName === 'IMG') apply(n);
                            scan(n);
                        }
                    });
                });
            });
            mo.observe(document.documentElement, { childList: true, subtree: true });
        } catch (_) {}
    }
})();

// Khởi chạy ứng dụng
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startFoodX);
} else {
    startFoodX();
}

// Window Exports
if (typeof window !== 'undefined') {
    window.openView = openView;
    window.syncBottomNav = syncBottomNav;
    window.toggleQa = toggleQa;
    window.handleQa = handleQa;
    window.closeDrawer = closeDrawer;
    window.closeQa = closeQa;
    window.handleHeroCtaClick = handleHeroCtaClick;
    window.goBackFromRecipeDetail = goBackFromRecipeDetail;
    window.goToFoodSearch = goToFoodSearch;
    window.homeUserName = homeUserName;
    window.loadHomeDashboard = loadHomeDashboard;
    window.loadTodayMeals = loadTodayMeals;
    window.loadHomeSuggest = loadHomeSuggest;
    window.renderHomeBlogSection = renderHomeBlogSection;
    window.displaySlide = displaySlide;
    window.startSlider = startSlider;
    window.renderAll = renderAll;
    window.startFoodX = startFoodX;
}
