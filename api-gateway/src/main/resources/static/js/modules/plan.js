var recipesCache = (typeof window !== 'undefined' && window.recipesCache) ? window.recipesCache : [];

/* Shared week-navigation state. Các module là ES modules nên biến `let` ở module
   khác KHÔNG nhìn thấy nhau; phải đặt trên window để plan.js / onboarding.js dùng chung. */
var planOffset = (typeof window !== 'undefined' && typeof window.planOffset === 'number') ? window.planOffset : 0;
var planEntries = (typeof window !== 'undefined' && Array.isArray(window.planEntries)) ? window.planEntries : [];
var planDailyGoal = 2000;
var planActiveDate = null;
var planWeekDays = [];
if (typeof window !== 'undefined') {
    window.planOffset = planOffset;
    window.planEntries = planEntries;
}

function d2s(d) {
    const p = function (n) { return (n < 10 ? '0' : '') + n; };
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}

function weekDays(offset) {
    const now = new Date();
    const mon = new Date(now);
    mon.setDate(now.getDate() - ((now.getDay() + 6) % 7) + offset * 7);
    return Array.from({ length: 7 }, function (_, i) {
        const d = new Date(mon);
        d.setDate(mon.getDate() + i);
        return d;
    });
}

async function loadPlan() {
    const days = weekDays(planOffset);
    const start = d2s(days[0]);
    const end = d2s(days[6]);
    const label = document.getElementById('weekLabel');
    if (label) label.textContent = 'Tuần ' + days[0].getDate() + '/' + (days[0].getMonth() + 1) + ' – ' + days[6].getDate() + '/' + (days[6].getMonth() + 1);
    planWeekDays = days;
    try {
        planEntries = await apiRequest('/api/plan?start=' + start + '&end=' + end) || [];
    } catch (e) {
        planEntries = [];
    }
    // Mục tiêu calo ngày cho widget đo dinh dưỡng (fallback 2000 nếu lỗi)
    planDailyGoal = 2000;
    try {
        const s = await apiRequest('/api/plan/summary?start=' + start + '&end=' + end);
        if (s && s.dailyKcalGoal) planDailyGoal = s.dailyKcalGoal;
    } catch (_) {}
    if (typeof window !== 'undefined') {
        window.planOffset = planOffset;
        window.planEntries = planEntries;
    }
    renderPlan();
}

function renderPlan() {
    const box = document.getElementById('planDays');
    if (!box) return;
    const days = planWeekDays.length ? planWeekDays : weekDays(planOffset);
    const today = d2s(new Date());
    const DAYS_VI = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const SLOT = { morning: ['🌅', 'Sáng'], lunch: ['☀️', 'Trưa'], dinner: ['🌙', 'Tối'] };
    const byDay = {};
    planEntries.forEach(function (e) {
        byDay[e.planDate] = byDay[e.planDate] || {};
        byDay[e.planDate][e.slot] = e;
    });
    if (!planActiveDate || !byDay[planActiveDate]) {
        planActiveDate = byDay[today] ? today : d2s(days[0]);
    }

    // 1) Dải tab 7 ngày (Thứ 2 -> Chủ nhật)
    box.innerHTML = '<div class="plan-day-tabs" id="planDayTabs"></div><div class="plan-day-content" id="planDayContent"></div>';
    const tabs = document.getElementById('planDayTabs');
    tabs.innerHTML = days.map(function (d) {
        const key = d2s(d);
        const meals = byDay[key] || {};
        const dayKcal = Object.keys(meals).reduce(function (s, sl) { return s + (meals[sl].recipeKcal || 0); }, 0);
        const active = key === planActiveDate ? ' active' : '';
        const isToday = key === today ? ' is-today' : '';
        return '<button type="button" class="plan-day-tab' + active + isToday + '" data-plan-date="' + key + '">' +
            '<span class="pdt-name">' + DAYS_VI[d.getDay()] + '</span>' +
            '<span class="pdt-date">' + d.getDate() + '/' + (d.getMonth() + 1) + '</span>' +
            '<span class="pdt-kcal">' + dayKcal + ' kcal</span>' +
        '</button>';
    }).join('');

    // 2) Widget đo dinh dưỡng (Calo đã nạp / Mục tiêu ngày)
    const sum = document.getElementById('planSummary');
    if (sum) {
        const activeMeals = byDay[planActiveDate] || {};
        const dayKcal = Object.keys(activeMeals).reduce(function (s, sl) { return s + (activeMeals[sl].recipeKcal || 0); }, 0);
        const goal = planDailyGoal || 2000;
        const pct = Math.min(100, Math.round(dayKcal * 100 / goal));
        sum.innerHTML =
            '<div class="nutrition-gauge">' +
                '<div class="ng-head"><span>⚡ Calo đã nạp</span><b>' + dayKcal + ' / ' + goal + ' kcal</b></div>' +
                '<div class="ng-bar"><div class="ng-fill" style="width:' + pct + '%"></div></div>' +
                '<div class="ng-meta"><span>Đã lên ' + Object.keys(activeMeals).length + '/3 bữa</span><span>' + pct + '% mục tiêu ngày</span></div>' +
            '</div>';
    }

    // 3) Card từng bữa (ảnh, tên, calo, tag nguyên liệu Đã có trong tủ / Cần mua)
    const content = document.getElementById('planDayContent');
    const meals = byDay[planActiveDate] || {};
    content.innerHTML = ['morning', 'lunch', 'dinner'].map(function (slot) {
        return mealCardHtml(meals[slot], planActiveDate, slot, SLOT);
    }).join('');

    // 4) Gắn sự kiện
    document.querySelectorAll('[data-plan-date]').forEach(function (b) {
        b.addEventListener('click', function () {
            planActiveDate = b.getAttribute('data-plan-date');
            renderPlan();
        });
    });
    document.querySelectorAll('[data-rm-date]').forEach(function (b) {
        b.addEventListener('click', function () {
            removeMeal(b.getAttribute('data-rm-date'), b.getAttribute('data-rm-slot'));
        });
    });
    document.querySelectorAll('[data-ai-slot-date]').forEach(function (b) {
        b.addEventListener('click', function () {
            quickAiSuggest(b.getAttribute('data-ai-slot-date'), b.getAttribute('data-ai-slot-type'), 'Gợi ý món ăn ngon, thanh đạm, dinh dưỡng cân bằng');
        });
    });
    document.querySelectorAll('[data-swap-date]').forEach(function (b) {
        b.addEventListener('click', function () {
            quickAiSuggest(b.getAttribute('data-swap-date'), b.getAttribute('data-swap-slot'), 'Đổi món khác mới lạ, thanh đạm, hấp dẫn không trùng lặp');
        });
    });
    document.querySelectorAll('[data-add-date]').forEach(function (b) {
        b.addEventListener('click', function () {
            openAddMeal(b.getAttribute('data-add-date'), b.getAttribute('data-add-slot'));
        });
    });
    document.querySelectorAll('[data-open-recipe]').forEach(function (el) {
        el.addEventListener('click', function () {
            const rid = el.getAttribute('data-open-recipe');
            if (rid) {
                openRecipeDetail(rid);
            }
        });
    });
}

function mealCardHtml(e, date, slot, SLOT) {
    const slotMeta = SLOT[slot] || ['🍽️', 'Bữa'];
    if (e) {
        const img = e.imageUrl
            ? '<img class="meal-img" src="' + escapeHtml(e.imageUrl) + '" alt="' + escapeHtml(e.recipeTitle) + '" loading="lazy" onerror="this.style.display=\'none'">'
            : '<div class="meal-img meal-img-emoji">' + slotMeta[0] + '</div>';
        const tags = (e.ingredients || []).slice(0, 6).map(function (t) {
            return '<span class="ing-tag ' + (t.inFridge ? 'in-fridge' : 'need-buy') + '">' + (t.inFridge ? '✓ ' : '🛒 ') + escapeHtml(t.name) + '</span>';
        }).join('');
        return '<div class="meal-card" id="meal-slot-' + date + '-' + slot + '">' +
            img +
            '<div class="meal-card-body">' +
                '<div class="meal-card-head">' +
                    '<span class="meal-slot-tag">' + slotMeta[0] + ' ' + slotMeta[1] + '</span>' +
                    '<div class="meal-actions">' +
                        '<button type="button" class="meal-edit-btn" data-add-date="' + date + '" data-add-slot="' + slot + '" title="Đổi món khác">✏️</button>' +
                        '<button type="button" class="meal-swap-btn" data-swap-date="' + date + '" data-swap-slot="' + slot + '" title="AI đổi món tự động">✨</button>' +
                        '<button type="button" class="meal-x" data-rm-date="' + date + '" data-rm-slot="' + slot + '" title="Xoá món">✕</button>' +
                    '</div>' +
                '</div>' +
                '<div class="meal-name" data-open-recipe="' + (e.recipeId || '') + '">' + escapeHtml(e.recipeTitle) + '</div>' +
                '<div class="meal-meta">' +
                    '<span>🔥 ' + (e.recipeKcal || 0) + ' kcal</span>' +
                    (e.cookTime ? '<span>⏱ ' + e.cookTime + "′</span>" : '') +
                    (e.difficulty ? '<span>📊 ' + escapeHtml(e.difficulty) + '</span>' : '') +
                '</div>' +
                (tags ? '<div class="meal-tags">' + tags + '</div>' : '<div class="meal-tags-empty">Chưa có danh sách nguyên liệu</div>') +
            '</div>' +
        '</div>';
    }
    return '<div class="meal-card meal-card-empty" id="meal-slot-' + date + '-' + slot + '">' +
        '<div class="meal-img meal-img-emoji">' + slotMeta[0] + '</div>' +
        '<div class="meal-card-body">' +
            '<div class="meal-card-head"><span class="meal-slot-tag">' + slotMeta[0] + ' ' + slotMeta[1] + '</span><span class="meal-empty-hint">Trống</span></div>' +
            '<div class="meal-empty-actions">' +
                '<button type="button" class="ai-suggest-slot-btn" data-ai-slot-date="' + date + '" data-ai-slot-type="' + slot + '">✨ AI gợi ý</button>' +
                '<button type="button" class="add-meal-btn" data-add-date="' + date + '" data-add-slot="' + slot + '">＋ Thêm món</button>' +
            '</div>' +
        '</div>' +
    '</div>';
}

let currentPlanDate = null;
let currentPlanSlot = null;

async function quickAiSuggest(date, slot, prompt) {
    if (!isUserLoggedIn()) {
        requireAuth('plan');
        return;
    }
    const SLOT_TEXT = { morning: '🌅 Sáng', lunch: '☀️ Trưa', dinner: '🌙 Tối' };
    const slotEl = document.getElementById('meal-slot-' + date + '-' + slot);
    if (slotEl) {
        slotEl.innerHTML = '<div class="meal-row-header"><span class="meal-slot-tag">' + (SLOT_TEXT[slot] || 'Bữa ăn') + '</span></div>' +
            '<div style="color:var(--green);font-weight:700;font-size:12px;padding:6px 0;display:flex;align-items:center;gap:4px;">' +
            '⏳ AI đang sáng tạo món...</div>';
    }
    try {
        const res = await apiRequest('/api/plan/suggest-slot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                planDate: date,
                slot: slot,
                prompt: prompt || 'Món ăn thanh đạm, dinh dưỡng cân bằng và ngon miệng'
            })
        });
        if (res && res.recipeTitle) {
            showToast('✨ AI đã thêm món "' + res.recipeTitle + '" (' + (res.recipeKcal || 450) + ' kcal)! 🎉', 'success');
        } else {
            showToast('Đã lên kế hoạch thành công!', 'success');
        }
        loadPlan();
    } catch (e) {
        showToast('Không thể tạo gợi ý món ăn lúc này', 'error');
        loadPlan();
    }
}

async function removeMeal(date, slot) {
    try {
        await apiRequest('/api/plan?date=' + date + '&slot=' + slot, { method: 'DELETE' });
        showToast('Đã xóa món ăn', 'info');
        loadPlan();
    } catch (e) {
        showToast('Cần đăng nhập.', 'error');
    }
}

function openAddMeal(date, slot) {
    if (!isUserLoggedIn()) {
        requireAuth('plan');
        return;
    }
    currentPlanDate = date;
    currentPlanSlot = slot;

    const modal = document.getElementById('planMealModal');
    if (!modal) return;

    const SLOT_NAME = { morning: 'Bữa Sáng', lunch: 'Bữa Trưa', dinner: 'Bữa Tối' };
    const SLOT_KCALS = { morning: 420, lunch: 650, dinner: 550 };
    const dateObj = new Date(date);
    const DAYS_VI = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dateStr = DAYS_VI[dateObj.getDay()] + ' (' + dateObj.getDate() + '/' + (dateObj.getMonth() + 1) + ')';

    const titleEl = document.getElementById('pmmTitle');
    const subEl = document.getElementById('pmmSubtitle');
    if (titleEl) titleEl.textContent = '🍽️ ' + (SLOT_NAME[slot] || 'Bữa ăn') + ' · ' + dateStr;
    if (subEl) subEl.textContent = 'Chọn AI gợi ý thông minh, tự nhập món & chấm calo, hoặc chọn từ kho công thức';

    // Reset inputs
    const aiTargetKcal = document.getElementById('pmmAiTargetKcal');
    if (aiTargetKcal) aiTargetKcal.value = SLOT_KCALS[slot] || 450;
    const aiPrompt = document.getElementById('pmmAiPrompt');
    if (aiPrompt) aiPrompt.value = '';

    const customTitle = document.getElementById('pmmCustomTitle');
    if (customTitle) customTitle.value = '';
    const customKcal = document.getElementById('pmmCustomKcal');
    if (customKcal) customKcal.value = SLOT_KCALS[slot] || 450;
    const customProtein = document.getElementById('pmmCustomProtein');
    if (customProtein) customProtein.value = 25;
    const customCarb = document.getElementById('pmmCustomCarb');
    if (customCarb) customCarb.value = 50;
    const customFat = document.getElementById('pmmCustomFat');
    if (customFat) customFat.value = 12;
    const customDesc = document.getElementById('pmmCustomDesc');
    if (customDesc) customDesc.value = '';

    switchPlanModalTab('ai');
    renderPmmRecipes();

    modal.hidden = false;
}

function switchPlanModalTab(tabName) {
    const tabAi = document.getElementById('pmmTabAi');
    const tabCustom = document.getElementById('pmmTabCustom');
    const tabRecipe = document.getElementById('pmmTabRecipe');
    const paneAi = document.getElementById('pmmPaneAi');
    const paneCustom = document.getElementById('pmmPaneCustom');
    const paneRecipe = document.getElementById('pmmPaneRecipe');

    [tabAi, tabCustom, tabRecipe].forEach(t => {
        if (t) {
            t.style.borderBottomColor = 'transparent';
            t.style.color = 'var(--text-soft)';
            t.classList.remove('active');
        }
    });
    [paneAi, paneCustom, paneRecipe].forEach(p => { if (p) p.hidden = true; });

    if (tabName === 'ai') {
        if (tabAi) { tabAi.style.borderBottomColor = 'var(--green)'; tabAi.style.color = 'var(--text)'; tabAi.classList.add('active'); }
        if (paneAi) paneAi.hidden = false;
    } else if (tabName === 'custom') {
        if (tabCustom) { tabCustom.style.borderBottomColor = 'var(--green)'; tabCustom.style.color = 'var(--text)'; tabCustom.classList.add('active'); }
        if (paneCustom) paneCustom.hidden = false;
    } else if (tabName === 'recipe') {
        if (tabRecipe) { tabRecipe.style.borderBottomColor = 'var(--green)'; tabRecipe.style.color = 'var(--text)'; tabRecipe.classList.add('active'); }
        if (paneRecipe) paneRecipe.hidden = false;
    }
}

async function renderPmmRecipes(filterText) {
    const listEl = document.getElementById('pmmRecipeList');
    if (!listEl) return;
    if (!recipesCache || !recipesCache.length) {
        try {
            const res = await apiRequest('/api/recipes');
            if (Array.isArray(res) && res.length) {
                recipesCache = res;
            }
        } catch (_) {}
    }
    let list = recipesCache || [];
    if (filterText) {
        const q = filterText.toLowerCase();
        list = list.filter(r => (r.title && r.title.toLowerCase().includes(q)) || (r.category && r.category.toLowerCase().includes(q)));
    }
    if (!list.length) {
        listEl.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-soft);font-size:13px;">Chưa có món ăn phù hợp trong kho</div>';
        return;
    }
    listEl.innerHTML = list.slice(0, 20).map(function (r) {
        return '<div class="pmm-recipe-item" style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-radius:10px;background:var(--card);border:1px solid var(--border);cursor:pointer;margin-bottom:6px;" data-pick-recipe="' + r.id + '">' +
            '<div><div style="font-weight:700;font-size:14px;color:var(--text);">' + escapeHtml(r.title) + '</div>' +
            '<div style="font-size:12px;color:var(--text-soft);margin-top:2px;">' + (r.kcal || 400) + ' kcal · ' + (r.cookTime ? r.cookTime + ' phút' : 'Dễ nấu') + '</div></div>' +
            '<button type="button" class="secondary-button" style="padding:5px 12px;font-size:12px;border-radius:6px;pointer-events:none;">Chọn</button>' +
            '</div>';
    }).join('');

    listEl.querySelectorAll('[data-pick-recipe]').forEach(function (el) {
        el.addEventListener('click', async function () {
            const rid = +el.getAttribute('data-pick-recipe');
            if (!rid || !currentPlanDate || !currentPlanSlot) return;
            try {
                await apiRequest('/api/plan', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ planDate: currentPlanDate, slot: currentPlanSlot, recipeId: rid })
                });
                showToast('Đã thêm món vào kế hoạch 🎉', 'success');
                const modal = document.getElementById('planMealModal');
                if (modal) modal.hidden = true;
                loadPlan();
            } catch (e) {
                showToast('Không thể thêm món vào kế hoạch', 'error');
            }
        });
    });
}

async function autoPlan() {
    const days = weekDays(planOffset);
    try {
        const res = await apiRequest('/api/plan/auto?start=' + d2s(days[0]) + '&end=' + d2s(days[6]), { method: 'POST' });
        showToast(res && res.added ? '✨ AI đã lên kế hoạch ' + res.added + ' bữa!' : 'Kế hoạch tuần đã đầy ✨', 'success');
        loadPlan();
    } catch (e) {
        showToast('Cần đăng nhập.', 'error');
    }
}


/* =========================================================
   STATS - THỐNG KÊ (gop tu dk-dn)
========================================================= */
/* loadStats is implemented in STATS section with full insights & waste tracker */

function drawLineChart(byDay) {
    const svg = document.getElementById('statsLine');
    const labels = document.getElementById('statsLabels');
    if (!svg) return;
    const data = (byDay || []).map(function (d) { return d.kcal || 0; });
    const dates = (byDay || []).map(function (d) { return String(d.date || '').slice(5); });
    const W = 340, H = 150, pad = 8;
    const max = Math.max.apply(null, data.concat([1]));
    const x = function (i) { return pad + i * (W - pad * 2) / Math.max(1, data.length - 1); };
    const y = function (v) { return H - 14 - (v / max) * (H - 40); };
    const pts = data.map(function (v, i) { return x(i).toFixed(1) + ',' + y(v).toFixed(1); });
    if (data.length > 1) {
        svg.innerHTML =
            '<polyline class="stats-line" points="' + pts.join(' ') + '"/>' +
            pts.map(function (p, i) {
                return '<circle class="stats-dot" cx="' + p.split(',')[0] + '" cy="' + p.split(',')[1] + '" r="3"><title>' + (dates[i] || '') + ': ' + data[i] + ' kcal</title></circle>';
            }).join('');
    } else {
        svg.innerHTML = '<text x="170" y="75" text-anchor="middle" class="stats-empty-text">Chưa có dữ liệu</text>';
    }
    if (labels) labels.innerHTML = dates.map(function (d) { return '<span>' + d + '</span>'; }).join('');
}





async function addCurRecipeMissingToShopping() {
    if (!curRecipe) {
        showToast('Chưa chọn món ăn.', 'warning');
        return;
    }
    if (!isUserLoggedIn()) {
        requireAuth('shopping');
        return;
    }
    await addRecipeIngredientsToShopping(curRecipe.id, true);
}

async function addCurRecipeAllToShopping() {
    if (!curRecipe) {
        showToast('Chưa chọn món ăn.', 'warning');
        return;
    }
    if (!isUserLoggedIn()) {
        requireAuth('shopping');
        return;
    }
    await addRecipeIngredientsToShopping(curRecipe.id, false);
}

/* =========================================================
   WIRING CÁC TÍNH NĂNG MỚI
========================================================= */
(function initDkDnFeatures() {
    const rs = document.getElementById('recipeSearch');
    if (rs) rs.addEventListener('input', debounce(renderRecipeBrowse, 200));
    const rf = document.getElementById('recipeFilter');
    if (rf) rf.addEventListener('change', renderRecipeBrowse);
    const rms = document.getElementById('recipeMealSlot');
    if (rms) rms.addEventListener('change', function () { syncRecipeChips(); renderRecipeBrowse(); });
    const rsp = document.getElementById('recipeSpeed');
    if (rsp) rsp.addEventListener('change', function () { syncRecipeChips(); renderRecipeBrowse(); });
    const rcat = document.getElementById('recipeCategory');
    if (rcat) rcat.addEventListener('change', function () { syncRecipeChips(); renderRecipeBrowse(); });
    const rdiff = document.getElementById('recipeDifficulty');
    if (rdiff) rdiff.addEventListener('change', function () { renderRecipeBrowse(); });

    // Quick chips click handling
    document.querySelectorAll('.rc-chip').forEach(function (btn) {
        btn.addEventListener('click', function () {
            const chip = this.getAttribute('data-chip');
            handleRecipeChipClick(chip);
        });
    });

    const save = document.getElementById('rdSave');
    if (save) save.addEventListener('click', toggleSaveRecipe);
    const plan = document.getElementById('rdPlan');
    if (plan) plan.addEventListener('click', addCurToPlan);
    const cook = document.getElementById('rdCook');
    if (cook) cook.addEventListener('click', cookNow);
    const editBtn = document.getElementById('rdEdit');
    if (editBtn) editBtn.addEventListener('click', function () {
        if (typeof openRecipeEditModal === 'function') openRecipeEditModal();
        else if (window.openRecipeEditModal) window.openRecipeEditModal();
    });
    const deleteBtn = document.getElementById('rdDelete');
    if (deleteBtn) deleteBtn.addEventListener('click', function () {
        if (typeof deleteCurRecipe === 'function') deleteCurRecipe();
        else if (window.deleteCurRecipe) window.deleteCurRecipe();
    });
    const addShopBtn = document.getElementById('rdAddShop');
    if (addShopBtn) addShopBtn.addEventListener('click', addCurRecipeMissingToShopping);
    const addShopAllBtn = document.getElementById('rdAddShopAll');
    if (addShopAllBtn) addShopAllBtn.addEventListener('click', addCurRecipeAllToShopping);
    const addFridgeBtn = document.getElementById('rdAddFridge');
    if (addFridgeBtn) addFridgeBtn.addEventListener('click', addCurRecipeAllToShopping);

    document.querySelectorAll('[data-rdtab]').forEach(function (t) {
        t.addEventListener('click', function () {
            document.querySelectorAll('[data-rdtab]').forEach(function (x) { x.classList.remove('active'); });
            t.classList.add('active');
            ['rdIng', 'rdSteps', 'rdNutri'].forEach(function (id) {
                const el = document.getElementById(id);
                if (el) {
                    el.classList.toggle('active', id === 'rd' + t.getAttribute('data-rdtab').charAt(0).toUpperCase() + t.getAttribute('data-rdtab').slice(1));
                }
            });
        });
    });

    const pp = document.getElementById('planPrev');
    if (pp) pp.addEventListener('click', function () { planOffset--; loadPlan(); });
    const pn = document.getElementById('planNext');
    if (pn) pn.addEventListener('click', function () { planOffset++; loadPlan(); });
    const pa = document.getElementById('planAuto');
    if (pa) pa.addEventListener('click', autoPlan);

    // Plan Meal Modal Tabs & Handlers
    const tabAi = document.getElementById('pmmTabAi');
    if (tabAi) tabAi.addEventListener('click', function () { switchPlanModalTab('ai'); });
    const tabCustom = document.getElementById('pmmTabCustom');
    if (tabCustom) tabCustom.addEventListener('click', function () { switchPlanModalTab('custom'); });
    const tabRecipe = document.getElementById('pmmTabRecipe');
    if (tabRecipe) tabRecipe.addEventListener('click', function () { switchPlanModalTab('recipe'); });

    // Quick tag chips
    document.querySelectorAll('#pmmTags .filter-chip').forEach(function (btn) {
        btn.addEventListener('click', function () {
            const promptInput = document.getElementById('pmmAiPrompt');
            if (promptInput) {
                const tag = btn.getAttribute('data-tag') || btn.textContent.trim();
                promptInput.value = tag;
            }
        });
    });

    // AI Suggest submit
    const aiSubBtn = document.getElementById('pmmAiSubmit');
    if (aiSubBtn) {
        aiSubBtn.addEventListener('click', async function () {
            if (!currentPlanDate || !currentPlanSlot) return;
            const prompt = document.getElementById('pmmAiPrompt') ? document.getElementById('pmmAiPrompt').value.trim() : '';
            const targetKcal = document.getElementById('pmmAiTargetKcal') ? +document.getElementById('pmmAiTargetKcal').value : 450;

            aiSubBtn.disabled = true;
            aiSubBtn.textContent = '⏳ AI đang sáng tạo món ăn...';

            try {
                const res = await apiRequest('/api/plan/suggest-slot', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        planDate: currentPlanDate,
                        slot: currentPlanSlot,
                        prompt: prompt,
                        targetKcal: targetKcal
                    })
                });
                if (res && res.recipeTitle) {
                    showToast('✨ AI đã thêm món "' + res.recipeTitle + '" (' + (res.recipeKcal || 450) + ' kcal) vào kế hoạch!', 'success');
                    const modal = document.getElementById('planMealModal');
                    if (modal) modal.hidden = true;
                    loadPlan();
                } else {
                    showToast('Đã lên kế hoạch thành công!', 'success');
                    const modal = document.getElementById('planMealModal');
                    if (modal) modal.hidden = true;
                    loadPlan();
                }
            } catch (e) {
                showToast('Không thể tạo gợi ý món ăn: ' + (e.message || 'Lỗi mạng'), 'error');
            } finally {
                aiSubBtn.disabled = false;
                aiSubBtn.textContent = '✨ AI Gợi ý & Thêm vào kế hoạch';
            }
        });
    }

    // AI Estimate Dish
    const estBtn = document.getElementById('pmmEstimateBtn');
    if (estBtn) {
        estBtn.addEventListener('click', async function () {
            const titleInput = document.getElementById('pmmCustomTitle');
            const dish = titleInput ? titleInput.value.trim() : '';
            if (!dish) {
                showToast('Vui lòng nhập tên món ăn cần chấm calo', 'warning');
                if (titleInput) titleInput.focus();
                return;
            }
            estBtn.disabled = true;
            estBtn.textContent = '⏳ AI đang tính...';

            try {
                const res = await apiRequest('/api/plan/estimate-dish', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ dishName: dish, slot: currentPlanSlot })
                });
                if (res) {
                    if (document.getElementById('pmmCustomKcal')) document.getElementById('pmmCustomKcal').value = res.kcal || 450;
                    if (document.getElementById('pmmCustomProtein')) document.getElementById('pmmCustomProtein').value = res.protein || 20;
                    if (document.getElementById('pmmCustomCarb')) document.getElementById('pmmCustomCarb').value = res.carb || 50;
                    if (document.getElementById('pmmCustomFat')) document.getElementById('pmmCustomFat').value = res.fat || 12;
                    if (document.getElementById('pmmCustomDesc') && res.description) document.getElementById('pmmCustomDesc').value = res.description;
                    showToast('✨ AI chấm món "' + dish + '": ~' + res.kcal + ' kcal (Protein: ' + res.protein + 'g, Carb: ' + res.carb + 'g, Fat: ' + res.fat + 'g)', 'success');
                }
            } catch (e) {
                showToast('Không thể ước tính calo lúc này', 'error');
            } finally {
                estBtn.disabled = false;
                estBtn.textContent = '⚡ AI Chấm Calo';
            }
        });
    }

    // Custom Dish Submit
    const custSubBtn = document.getElementById('pmmCustomSubmit');
    if (custSubBtn) {
        custSubBtn.addEventListener('click', async function () {
            if (!currentPlanDate || !currentPlanSlot) return;
            const title = document.getElementById('pmmCustomTitle') ? document.getElementById('pmmCustomTitle').value.trim() : '';
            if (!title) {
                showToast('Vui lòng nhập tên món ăn', 'warning');
                return;
            }
            const kcal = document.getElementById('pmmCustomKcal') ? +document.getElementById('pmmCustomKcal').value : 450;
            const protein = document.getElementById('pmmCustomProtein') ? +document.getElementById('pmmCustomProtein').value : 20;
            const carb = document.getElementById('pmmCustomCarb') ? +document.getElementById('pmmCustomCarb').value : 50;
            const fat = document.getElementById('pmmCustomFat') ? +document.getElementById('pmmCustomFat').value : 12;
            const desc = document.getElementById('pmmCustomDesc') ? document.getElementById('pmmCustomDesc').value.trim() : '';

            custSubBtn.disabled = true;
            custSubBtn.textContent = '⏳ Đang lưu...';

            try {
                const res = await apiRequest('/api/plan/custom-slot', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        planDate: currentPlanDate,
                        slot: currentPlanSlot,
                        title: title,
                        kcal: kcal,
                        protein: protein,
                        carb: carb,
                        fat: fat,
                        description: desc
                    })
                });
                showToast('Đã thêm món "' + title + '" (' + kcal + ' kcal) vào kế hoạch 🎉', 'success');
                const modal = document.getElementById('planMealModal');
                if (modal) modal.hidden = true;
                loadPlan();
            } catch (e) {
                showToast('Không thể thêm món: ' + (e.message || 'Lỗi xử lý'), 'error');
            } finally {
                custSubBtn.disabled = false;
                custSubBtn.textContent = '💾 Thêm món này vào kế hoạch';
            }
        });
    }

    // Recipe Search in modal
    const pmmSearch = document.getElementById('pmmRecipeSearch');
    if (pmmSearch) {
        pmmSearch.addEventListener('input', function () {
            renderPmmRecipes(pmmSearch.value.trim());
        });
    }

    // Modal Close
    document.querySelectorAll('[data-close="planMealModal"]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            const m = document.getElementById('planMealModal');
            if (m) m.hidden = true;
        });
    });

    const pmmOverlay = document.getElementById('planMealModal');
    if (pmmOverlay) {
        pmmOverlay.addEventListener('click', function (e) {
            if (e.target === pmmOverlay) pmmOverlay.hidden = true;
        });
    }

})();



/* =========================================================
   FOODX REDESIGN — helpers + UX polish
========================================================= */

/* ---------- Skeleton / Empty / Error ---------- */
async function planZeroWasteRescue() {
    if (typeof window !== 'undefined' && typeof window.handleVetTuAutoFill === 'function') {
        return window.handleVetTuAutoFill();
    }
    if (!isUserLoggedIn()) {
        requireAuth('plan');
        return;
    }
    let fridgeItems = [];
    try {
        fridgeItems = await apiRequest('/api/fridge') || [];
    } catch (_) {}
    if (!fridgeItems.length && typeof state !== 'undefined' && Array.isArray(state.fridge)) {
        fridgeItems = state.fridge;
    }
    if (!fridgeItems.length) {
        showToast('Tủ lạnh chưa có thực phẩm nào. Hãy thêm thực phẩm từ Kho trước nhé!', 'warning');
        return;
    }
    const sorted = [...fridgeItems].sort((a, b) => daysLeft(a.expiresAt) - daysLeft(b.expiresAt));
    const urgentItems = sorted.slice(0, 3).map(f => f.name || f.foodName).filter(Boolean);
    const urgentNames = urgentItems.join(', ');

    const allR = (typeof recipesCache !== 'undefined' && recipesCache.length ? recipesCache : (typeof recipes !== 'undefined' ? recipes : []));
    let matchedRecipe = allR.find(r => {
        const text = ((r.title || r.name || '') + ' ' + (r.ingredients ? (Array.isArray(r.ingredients) ? r.ingredients.map(i => i.name || i.ingredientName || i).join(' ') : r.ingredients) : '')).toLowerCase();
        return urgentItems.some(ui => text.includes(ui.toLowerCase()));
    });

    if (!matchedRecipe && allR.length) {
        matchedRecipe = allR[0];
    }

    if (matchedRecipe) {
        showToast(`🌱 Ưu tiên vét tủ: Đã tìm thấy món "${matchedRecipe.title || matchedRecipe.name}" để dùng ${urgentNames}!`, 'success');
        if (typeof openRecipeDetail === 'function') {
            openRecipeDetail(matchedRecipe.id);
        }
    } else {
        showToast(`Thực phẩm cần ưu tiên dùng: ${urgentNames}. Hãy dùng AI Cứu Tủ Lạnh để sáng tạo món mới!`, 'info');
    }
}
window.planZeroWasteRescue = planZeroWasteRescue;

// --- 5.4 SMART SHOPPING LIST SHARING ---

// Module window exports
if (typeof window !== 'undefined') window.d2s = d2s;
if (typeof window !== 'undefined') window.weekDays = weekDays;
if (typeof window !== 'undefined') window.loadPlan = loadPlan;
if (typeof window !== 'undefined') window.renderPlan = renderPlan;
if (typeof window !== 'undefined') window.quickAiSuggest = quickAiSuggest;
if (typeof window !== 'undefined') window.removeMeal = removeMeal;
if (typeof window !== 'undefined') window.openAddMeal = openAddMeal;
if (typeof window !== 'undefined') window.switchPlanModalTab = switchPlanModalTab;
if (typeof window !== 'undefined') window.renderPmmRecipes = renderPmmRecipes;
if (typeof window !== 'undefined') window.autoPlan = autoPlan;
if (typeof window !== 'undefined') window.drawLineChart = drawLineChart;
if (typeof window !== 'undefined') window.addCurRecipeMissingToShopping = addCurRecipeMissingToShopping;
if (typeof window !== 'undefined') window.addCurRecipeAllToShopping = addCurRecipeAllToShopping;
