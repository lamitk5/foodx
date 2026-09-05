var recipesCache = (typeof window !== 'undefined' && window.recipesCache) ? window.recipesCache : [];
var currentBlogCategory = 'all';
let homeBlogRecipesCache = null;

const BLOG_CAT_META = [
    { key: 'sang',     cat: 'Món sáng',        label: '🥣 Món sáng' },
    { key: 'family',   cat: 'Món chính',       label: '🍚 Món chính' },
    { key: 'eatclean', cat: 'Món ăn kiêng',    label: '🥗 Món ăn kiêng' },
    { key: 'quick',    cat: 'Món nhanh',       label: '⚡ Món nhanh' },
    { key: 'dessert',  cat: 'Món tráng miệng', label: '🍰 Món tráng miệng' }
];
if (typeof window !== 'undefined') window.BLOG_CAT_META = BLOG_CAT_META;

function showSkeleton(el, type, n) {
    if (!el) return;
    const unit = type === 'card' ? '<div class="sk sk-card"></div>'
        : type === 'row' ? '<div class="sk sk-row"></div>'
        : '<div class="sk sk-text"></div>';
    el.innerHTML = '<div class="' + (type === 'card' ? 'sk-grid' : 'sk-list') + '">' + Array(n || 3).fill(unit).join('') + '</div>';
}

function renderEmpty(el, icon, title, desc, ctaLabel, ctaFn) {
    if (!el) return;
    el.innerHTML = '<div class="empty-state"><span class="es-icon">' + (icon || '🥗') + '</span>' +
        '<b>' + title + '</b><p>' + desc + '</p>' +
        (ctaLabel ? '<button type="button" class="primary-button" id="emptyCtaBtn">' + ctaLabel + '</button>' : '') +
        '</div>';
    const btn = document.getElementById('emptyCtaBtn');
    if (btn && ctaFn) btn.addEventListener('click', ctaFn);
}

function renderError(el, retryFn) {
    if (!el) return;
    el.innerHTML = '<div class="error-state"><b>Không thể tải dữ liệu</b>' +
        '<p>Vui lòng thử lại.</p>' +
        '<button type="button" class="secondary-button" id="errRetryBtn">Thử lại</button></div>';
    const btn = document.getElementById('errRetryBtn');
    if (btn && retryFn) btn.addEventListener('click', retryFn);
}


/* =========================================================
   HOME DASHBOARD
========================================================= */
function homeUserName() {
    try {
        if (window.authState && authState.authenticated && (authState.fullName || authState.username)) {
            return authState.fullName || authState.username;
        }
    } catch (e) { }
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

    // Fridge status + expiring
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
    if (!isUserLoggedIn()) {
        card.hidden = true;
        return;
    }
    const today = d2s(new Date());
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

    if (!isUserLoggedIn()) {
        card.hidden = false;
        renderEmpty(
            list,
            '✨',
            'Gợi ý thực đơn thông minh',
            'Đăng nhập để nhận gợi ý món ngon phù hợp từ nguyên liệu trong tủ lạnh của bạn.',
            'Đăng nhập ngay',
            function () { requireAuth('suggest'); }
        );
        return;
    }

    let ingredients = [];
    try {
        const items = await apiRequest('/api/fridge') || [];
        ingredients = items.map(function (i) { return i.name; });
    } catch (e) { }
    if (btn) btn.disabled = true;
    card.hidden = false;
    showSkeleton(list, 'card', 3);
    try {
        const res = await apiRequest('/api/ai/suggest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ availableIngredients: ingredients, preference: '', mealType: '', maxSuggestions: 3 })
        });
        const sug = (res && res.suggestions) || [];
        if (!sug.length) {
            renderEmpty(list, '🤖', 'Chưa có gợi ý', 'Thêm nguyên liệu vào tủ lạnh để nhận món phù hợp.', 'Xem tủ lạnh', function () { openView('fridge'); });
        } else {
            list.innerHTML = sug.map(function (s) {
                return '<div class="hs-item"><b>' + escapeHtml(s.title || '') + '</b>' +
                    '<span>' + escapeHtml(s.description || '') + '</span>' +
                    (s.estimatedTime ? '<span style="margin-top:6px">⏱ ' + escapeHtml(s.estimatedTime) + '</span>' : '') + '</div>';
            }).join('');
        }
    } catch (err) {
        renderError(list, loadHomeSuggest);
    } finally {
        if (btn) btn.disabled = false;
    }
}


/* =========================================================
   RECIPE DETAIL — hero image + related
========================================================= */
function renderRecipeDetail() {
    const r = curRecipe;
    if (!r) return;

    const baseServings = r.baseServings || parseInt(r.servings) || 4;
    const currentServings = r.currentServings || baseServings;
    const servingRatio = currentServings / baseServings;
    r.baseServings = baseServings;
    r.currentServings = currentServings;

    document.getElementById('rdEmoji').textContent = recipeEmoji(r);
    document.getElementById('rdTitle').textContent = r.title || r.name || 'Chi tiết món';

    let baseKcal = parseInt(r.baseKcal) || parseInt(r.kcal) || 0;
    let baseP = parseFloat(r.baseProtein) || parseFloat(r.protein) || 0;
    let baseC = parseFloat(r.baseCarb) || parseFloat(r.carb) || 0;
    let baseF = parseFloat(r.baseFat) || parseFloat(r.fat) || 0;

    if (!baseKcal || baseKcal < 50) {
        const t = (r.title || '').toLowerCase();
        if (t.includes('pho') || t.includes('bun') || t.includes('com')) baseKcal = 520;
        else if (t.includes('banh mi') || t.includes('chao') || t.includes('trung')) baseKcal = 380;
        else if (t.includes('salad') || t.includes('canh') || t.includes('yen mach')) baseKcal = 280;
        else baseKcal = 420;
    }

    if (!baseP || !baseC || !baseF) {
        const t = (r.title || '').toLowerCase();
        if (t.includes('bo') || t.includes('ga') || t.includes('ca ') || t.includes('tom') || t.includes('thit') || t.includes('trung') || t.includes('eatclean')) {
            baseP = Math.round(baseKcal * 0.28 / 4 * 10) / 10;
            baseC = Math.round(baseKcal * 0.46 / 4 * 10) / 10;
            baseF = Math.round(baseKcal * 0.26 / 9 * 10) / 10;
        } else {
            baseP = Math.round(baseKcal * 0.20 / 4 * 10) / 10;
            baseC = Math.round(baseKcal * 0.55 / 4 * 10) / 10;
            baseF = Math.round(baseKcal * 0.25 / 9 * 10) / 10;
        }
    }

    r.baseKcal = baseKcal;
    r.baseProtein = baseP;
    r.baseCarb = baseC;
    r.baseFat = baseF;

    let kcal = Math.round(baseKcal * servingRatio);
    let p = Math.round((baseP * servingRatio) * 10) / 10;
    let c = Math.round((baseC * servingRatio) * 10) / 10;
    let f = Math.round((baseF * servingRatio) * 10) / 10;
    r.kcal = kcal;
    r.protein = p;
    r.carb = c;
    r.fat = f;

    // Sync serving selector buttons
    const servingBtns = document.querySelectorAll('#rdServingSelector .serving-btn');
    if (servingBtns.length) {
        servingBtns.forEach(function (btn) {
            const s = parseInt(btn.getAttribute('data-servings'));
            if (s === currentServings) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    document.getElementById('rdMeta').innerHTML =
        '<span><svg class="icon"><use href="#i-clock"/></svg> ' + (r.cookTime || r.time || 30) + ' phút</span>' +
        '<span><svg class="icon"><use href="#i-stats"/></svg> ' + escapeHtml(r.difficulty || 'Dễ') + '</span>' +
        '<span><svg class="icon"><use href="#i-user"/></svg> ' + currentServings + ' người' + (currentServings !== baseServings ? ' (đã chỉnh)' : '') + '</span>' +
        (kcal ? '<span><svg class="icon"><use href="#i-flame"/></svg> ' + kcal + ' kcal</span>' : '');

    document.getElementById('rdDesc').textContent = r.description || '';

    // Hero image handling
    const heroBox = document.querySelector('.recipe-detail-hero');
    const img = document.getElementById('rdHeroImg');
    if (img) {
        let imgUrl = r.imageUrl || r.image;
        if (imgUrl && !imgUrl.includes('default-recipe.jpg') && !imgUrl.includes('placeholder')) {
            img.src = imgUrl;
            img.hidden = false;
            img.onload = function () {
                if (heroBox) heroBox.classList.add('has-img');
            };
            img.onerror = function () {
                img.hidden = true;
                if (heroBox) heroBox.classList.remove('has-img');
            };
        } else {
            img.hidden = true;
            if (heroBox) heroBox.classList.remove('has-img');
            // Auto search image from web/wikipedia if recipe has title
            if (r.title && typeof apiRequest === 'function') {
                apiRequest('/api/recipes/search-image?query=' + encodeURIComponent(r.title)).then(function (res) {
                    if (res && res.data && res.data.imageUrl && !res.data.imageUrl.includes('placeholder')) {
                        r.imageUrl = res.data.imageUrl;
                        img.src = res.data.imageUrl;
                        img.hidden = false;
                        if (heroBox) heroBox.classList.add('has-img');
                    }
                }).catch(function () {});
            }
        }
    }

    const ings = normalizeIngredientList(r.ingredients);
    document.getElementById('rdIng').innerHTML = ings.length
        ? '<ul class="rd-ing-list">' + ings.map(function (i) {
            const rawQty = i.baseQuantity != null && i.baseQuantity !== '' ? i.baseQuantity : i.quantity;
            const scaledQtyStr = scaleIngredientQuantity(rawQty, servingRatio);
            const qtyStr = (scaledQtyStr != null && String(scaledQtyStr).trim() ? String(scaledQtyStr).trim() + ' ' : '') + escapeHtml(i.unit || '');
            return '<li><span>' + escapeHtml(i.ingredientName || i.name || '') + '</span>' +
                (qtyStr.trim() ? '<span class="qty">' + qtyStr.trim() + '</span>' : '') + '</li>';
        }).join('') + '</ul>'
        : '<div class="empty-state"><span class="es-icon">🧺</span><b>Chưa cập nhật nguyên liệu</b></div>';

    const steps = String(r.instructions || '').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
    document.getElementById('rdSteps').innerHTML = steps.length
        ? '<ol class="rd-steps-list">' + steps.map(function (s) { return '<li>' + escapeHtml(s) + '</li>'; }).join('') + '</ol>'
        : '<div class="empty-state"><span class="es-icon">👨‍🍳</span><b>Chưa cập nhật các bước</b></div>';

    const pPct = Math.round((p * 4 / kcal) * 100) || 25;
    const cPct = Math.round((c * 4 / kcal) * 100) || 50;
    const fPct = Math.max(0, 100 - pPct - cPct);

    document.getElementById('rdNutri').innerHTML =
        '<div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px; margin-bottom: 16px;">' +
        '<div style="background: var(--bg); border: 1px solid var(--border); border-radius: 12px; padding: 12px; text-align: center;">' +
        '<span style="font-size: 11px; color: var(--text-soft); font-weight: 600; text-transform: uppercase;">🔥 Năng lượng</span>' +
        '<div style="font-size: 20px; font-weight: 800; color: #ea580c; margin-top: 4px;">' + kcal + ' <small style="font-size: 11px; font-weight: 600;">kcal</small></div>' +
        '</div>' +
        '<div style="background: var(--bg); border: 1px solid var(--border); border-radius: 12px; padding: 12px; text-align: center;">' +
        '<span style="font-size: 11px; color: var(--text-soft); font-weight: 600; text-transform: uppercase;">🥩 Đạm (Protein)</span>' +
        '<div style="font-size: 20px; font-weight: 800; color: #2563eb; margin-top: 4px;">' + p + ' <small style="font-size: 11px; font-weight: 600;">g</small></div>' +
        '<div style="font-size: 10.5px; color: var(--text-soft); margin-top: 2px;">' + pPct + '% năng lượng</div>' +
        '</div>' +
        '<div style="background: var(--bg); border: 1px solid var(--border); border-radius: 12px; padding: 12px; text-align: center;">' +
        '<span style="font-size: 11px; color: var(--text-soft); font-weight: 600; text-transform: uppercase;">🍚 Tinh bột (Carbs)</span>' +
        '<div style="font-size: 20px; font-weight: 800; color: #d97706; margin-top: 4px;">' + c + ' <small style="font-size: 11px; font-weight: 600;">g</small></div>' +
        '<div style="font-size: 10.5px; color: var(--text-soft); margin-top: 2px;">' + cPct + '% năng lượng</div>' +
        '</div>' +
        '<div style="background: var(--bg); border: 1px solid var(--border); border-radius: 12px; padding: 12px; text-align: center;">' +
        '<span style="font-size: 11px; color: var(--text-soft); font-weight: 600; text-transform: uppercase;">🥑 Chất béo (Fat)</span>' +
        '<div style="font-size: 20px; font-weight: 800; color: #16a34a; margin-top: 4px;">' + f + ' <small style="font-size: 11px; font-weight: 600;">g</small></div>' +
        '<div style="font-size: 10.5px; color: var(--text-soft); margin-top: 2px;">' + fPct + '% năng lượng</div>' +
        '</div>' +
        '</div>' +
        '<div style="background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 14px; margin-bottom: 12px;">' +
        '<div style="display:flex; justify-content:space-between; font-size:12px; font-weight:700; margin-bottom: 8px;">' +
        '<span>Phân bổ dinh dưỡng (Macro Split)</span>' +
        '<span style="color: var(--green-dark);">1 khẩu phần</span>' +
        '</div>' +
        '<div style="display: flex; height: 10px; border-radius: 999px; overflow: hidden; background: var(--border); gap: 2px;">' +
        '<div style="width:' + pPct + '%; background: #2563eb;" title="Đạm: ' + pPct + '%"></div>' +
        '<div style="width:' + cPct + '%; background: #d97706;" title="Tinh bột: ' + cPct + '%"></div>' +
        '<div style="width:' + fPct + '%; background: #16a34a;" title="Chất béo: ' + fPct + '%"></div>' +
        '</div>' +
        '<div style="display: flex; justify-content: center; gap: 16px; margin-top: 10px; font-size: 11.5px; color: var(--text-soft); flex-wrap: wrap;">' +
        '<span><i style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#2563eb;margin-right:4px;"></i>Đạm ' + pPct + '%</span>' +
        '<span><i style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#d97706;margin-right:4px;"></i>Tinh bột ' + cPct + '%</span>' +
        '<span><i style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#16a34a;margin-right:4px;"></i>Chất béo ' + fPct + '%</span>' +
        '</div>' +
        '</div>' +
        '<div style="background: var(--green-light); border-radius: 10px; padding: 10px 14px; font-size: 12px; color: var(--green-dark); display: flex; align-items: center; gap: 8px;">' +
        '<span>💡</span>' +
        '<span>Món ăn cân đối dinh dưỡng, cung cấp đầy đủ đạm, tinh bột và chất béo thiết yếu cho cơ thể.</span>' +
        '</div>';
    
    const isSaved = !!savedPostsState[String(r.id)];
    const saveBtn = document.getElementById('rdSave');
    if (saveBtn) saveBtn.innerHTML = isSaved ? '❤️ Đã lưu vào công thức của tôi' : '🤍 Lưu món';
    
    renderRelated(r);
}

function renderRelated(r) {
    const box = document.getElementById('rdRelated');
    if (!box) return;
    const related = (recipesCache || []).filter(function (x) {
        return x.id !== r.id && x.category && r.category && x.category === r.category;
    }).slice(0, 4);
    if (!related.length) { box.innerHTML = ''; return; }
    box.innerHTML = '<h4>Món tương tự</h4><div class="related-grid">' +
        related.map(function (x) {
            return '<div class="related-item" data-related="' + x.id + '"><b>' + escapeHtml(x.title) + '</b>' +
                '<span>⏱ ' + (x.cookTime || '—') + '′ · ' + (x.kcal || 0) + ' kcal</span></div>';
        }).join('') + '</div>';
    document.querySelectorAll('[data-related]').forEach(function (el) {
        el.addEventListener('click', function () { openRecipeDetail(+el.getAttribute('data-related')); });
    });
}


/* =========================================================
   STATS — insights + food waste
========================================================= */
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

    // Pills động theo đúng category có trong kho công thức thật
    const categoriesPresent = new Set(posts.map(function (p) { return p.category; }));
    renderHomeBlogPills(categoriesPresent);
    const pillsWrap = document.getElementById('homeBlogPills');
    if (pillsWrap) {
        pillsWrap.querySelectorAll('.blog-pill').forEach(function (p) { p.classList.remove('active'); });
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
        const meta = BLOG_CAT_META.find(function (m) { return m.key === catFilter; });
        filtered = meta ? posts.filter(function (p) { return p.category === meta.cat; }) : posts;
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


/* =========================================================
   WIRING REDESIGN
========================================================= */
(function initRedesign() {
    // Home
    const sb = document.getElementById('homeSuggestBtn');
    if (sb) sb.addEventListener('click', loadHomeSuggest);
    loadHomeDashboard();
    renderHomeBlogSection('all');

    // Home Blog Category Filter Pills — delegation (pills được render động theo category thật)
    const blogPillsWrap = document.getElementById('homeBlogPills');
    if (blogPillsWrap) {
        blogPillsWrap.addEventListener('click', function (e) {
            const pill = e.target.closest('.blog-pill');
            if (!pill) return;
            blogPillsWrap.querySelectorAll('.blog-pill').forEach(function (p) { p.classList.remove('active'); });
            pill.classList.add('active');
            renderHomeBlogSection(pill.getAttribute('data-blog-cat'));
        });
    }

    // Shopping clear-done & clear-all
    const cd = document.getElementById('shopClearDone');
    if (cd) cd.addEventListener('click', clearDoneShopping);
    const ca = document.getElementById('shopClearAll');
    if (ca) ca.addEventListener('click', clearAllShopping);

    // Bottom nav
    document.querySelectorAll('[data-bottom-nav]').forEach(function (b) {
        b.addEventListener('click', function () { openView(b.getAttribute('data-bottom-nav')); });
    });
    const fab = document.getElementById('qaFab');
    if (fab) fab.addEventListener('click', toggleQa);

    // Quick action items
    document.querySelectorAll('.qa-item').forEach(function (it) {
        it.addEventListener('click', function () { handleQa(it.getAttribute('data-qa')); });
    });

    // Hamburger drawer
    const hm = document.getElementById('mobileMenuButton');
    if (hm) hm.addEventListener('click', function (e) {
        e.stopPropagation();
        document.body.classList.toggle('drawer-open');
    });
    document.addEventListener('click', function (e) {
        if (document.body.classList.contains('drawer-open') && !e.target.closest('.sidebar') && !e.target.closest('#mobileMenuButton')) closeDrawer();
        if (qaOpen && !e.target.closest('#qaMenu') && !e.target.closest('#qaFab')) closeQa();
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeQa();
            closeDrawer();
            document.querySelectorAll('.modal-overlay.show').forEach(m => m.classList.remove('show'));
            document.querySelectorAll('.modal-overlay[id="planMealModal"], .modal-overlay[id="shoppingRecipeModal"]').forEach(m => { m.setAttribute('hidden', ''); m.style.display = 'none'; });
            document.body.style.overflow = '';
        }
    });
})();





// Module window exports
if (typeof window !== 'undefined') window.showSkeleton = showSkeleton;
if (typeof window !== 'undefined') window.renderEmpty = renderEmpty;
if (typeof window !== 'undefined') window.renderError = renderError;
if (typeof window !== 'undefined') window.homeUserName = homeUserName;
if (typeof window !== 'undefined') window.expiryInfo = expiryInfo;
if (typeof window !== 'undefined') window.foodEmoji = foodEmoji;
if (typeof window !== 'undefined') window.loadHomeDashboard = loadHomeDashboard;
if (typeof window !== 'undefined') window.loadTodayMeals = loadTodayMeals;
if (typeof window !== 'undefined') window.loadHomeSuggest = loadHomeSuggest;
if (typeof window !== 'undefined') window.renderRecipeDetail = renderRecipeDetail;
if (typeof window !== 'undefined') window.renderRelated = renderRelated;
if (typeof window !== 'undefined') window.loadHomeBlogRecipes = loadHomeBlogRecipes;
if (typeof window !== 'undefined') window.renderHomeBlogPills = renderHomeBlogPills;
if (typeof window !== 'undefined') window.renderHomeBlogSection = renderHomeBlogSection;
