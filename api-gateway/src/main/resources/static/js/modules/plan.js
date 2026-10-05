/**
 * FoodX module: plan.js
 * Ke hoach bua an va xuat danh sach di cho.
 * Cat tu app.js, van dung bien toan cuc de index.html goi duoc.
 */
/* =========================================================
   PLAN - KẾ HOẠCH TUẦN (gop tu dk-dn)
========================================================= */
let planOffset = 0;
let planEntries = [];

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
    try {
        planEntries = await apiRequest('/api/plan?start=' + start + '&end=' + end) || [];
    } catch (e) {
        planEntries = [];
    }
    if (typeof window !== 'undefined') {
        window.planEntries = planEntries;
    }
    const mp = {};
    (planEntries || []).forEach(function (e) {
        mp[e.planDate] = mp[e.planDate] || {};
        mp[e.planDate][e.slot] = {
            id: e.id,
            recipeId: e.recipeId,
            name: e.recipeTitle,
            calories: e.recipeKcal,
            tags: e.tags || ["Kế hoạch"],
            isAiGenerated: !!e.isAiGenerated
        };
    });
    setMealPlan(mp);
    renderPlan(days);
}

function setMealPlan(updater) {
    let current = {};
    if (typeof state !== 'undefined' && state.mealPlan) {
        current = state.mealPlan;
    } else if (typeof window !== 'undefined' && window.mealPlan) {
        current = window.mealPlan;
    }
    const updated = typeof updater === 'function' ? updater(current) : updater;
    if (typeof state !== 'undefined') {
        state.mealPlan = updated;
        if (typeof saveState === 'function') saveState();
    }
    if (typeof window !== 'undefined') {
        window.mealPlan = updated;
    }
    return updated;
}
window.setMealPlan = setMealPlan;

function renderPlan(days) {
    const box = document.getElementById('planDays');
    if (!box) return;
    if (!days || !Array.isArray(days) || !days.length) {
        days = weekDays(planOffset);
    }
    const today = d2s(new Date());
    const DAYS_VI = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const SLOT = { morning: ['🌅', 'Sáng'], lunch: ['☀️', 'Trưa'], dinner: ['🌙', 'Tối'] };
    const byDay = {};
    (planEntries || []).forEach(function (e) {
        byDay[e.planDate] = byDay[e.planDate] || {};
        byDay[e.planDate][e.slot] = e;
    });
    let nMeals = 0, kcal = 0;
    days.forEach(function (d) {
        const key = d2s(d);
        const meals = byDay[key] || {};
        Object.keys(meals).forEach(function (s) { nMeals++; kcal += meals[s].recipeKcal || 0; });
    });
    const sum = document.getElementById('planSummary');
    if (sum) {
        const plannedDays = days.filter(function (d) { const m = byDay[d2s(d)]; return m && Object.keys(m).length; }).length;
        sum.innerHTML =
            '<div class="stat-box"><b>' + nMeals + '/21</b><span>' + (nMeals === 21 ? 'Hoàn thành 100% kế hoạch 🎉' : 'bữa đã lên kế hoạch') + '</span></div>' +
            '<div class="stat-box"><b>' + (nMeals && plannedDays ? Math.round(kcal / plannedDays) : 0) + '</b><span>kcal TB / ngày</span></div>';
    }
    box.innerHTML = days.map(function (d) {
        const key = d2s(d);
        const meals = byDay[key] || {};
        const dayKcal = Object.keys(meals).reduce(function (s, sl) { return s + (meals[sl].recipeKcal || 0); }, 0);
        return '<div class="day-card' + (key === today ? ' today' : '') + '">' +
            '<div class="day-head"><h4>' + DAYS_VI[d.getDay()] + ' · ' + d.getDate() + '/' + (d.getMonth() + 1) +
            (key === today ? '<span class="today-pill">HÔM NAY</span>' : '') + '</h4>' +
            '<span class="day-kcal">' + dayKcal + ' kcal</span></div>' +
            ['morning', 'lunch', 'dinner'].map(function (slot) {
                const e = meals[slot];
                if (e) {
                    return '<div class="meal-row" id="meal-slot-' + key + '-' + slot + '">' +
                        '<div class="meal-row-header">' +
                            '<span class="meal-slot-tag">' + SLOT[slot][0] + ' ' + SLOT[slot][1] + '</span>' +
                            '<span class="meal-kcal-badge">' + (e.recipeKcal || 0) + ' kcal</span>' +
                            '<div class="meal-actions">' +
                                '<button type="button" class="meal-edit-btn" data-add-date="' + key + '" data-add-slot="' + slot + '" onclick="handleOpenAddMealModal(\'' + key + '\', \'' + slot + '\')" title="Đổi hoặc tự chọn món khác">✏️ Đổi</button>' +
                                '<button type="button" class="meal-swap-btn" data-swap-date="' + key + '" data-swap-slot="' + slot + '" onclick="handleAiSuggestMeal(\'' + key + '\', \'' + slot + '\', this)" title="🤖 AI Đổi món tự động">⚡ AI</button>' +
                                '<button type="button" class="meal-x" data-rm-date="' + key + '" data-rm-slot="' + slot + '" onclick="removeMeal(\'' + key + '\', \'' + slot + '\')" title="Xoá món">✕</button>' +
                            '</div>' +
                        '</div>' +
                        '<div class="meal-row-body">' +
                            '<div class="meal-name" title="' + escapeHtml(e.recipeTitle) + '" data-open-recipe="' + (e.recipeId || '') + '">' +
                                escapeHtml(e.recipeTitle) +
                            '</div>' +
                        '</div>' +
                    '</div>';
                }
                return '<div class="meal-row empty" id="meal-slot-' + key + '-' + slot + '">' +
                    '<div class="meal-row-header">' +
                        '<span class="meal-slot-tag">' + SLOT[slot][0] + ' ' + SLOT[slot][1] + '</span>' +
                        '<span class="meal-empty-hint">Trống</span>' +
                        '<div class="slot-empty-actions">' +
                            '<button type="button" class="ai-suggest-slot-btn" data-ai-slot-date="' + key + '" data-ai-slot-type="' + slot + '" onclick="handleAiSuggestMeal(\'' + key + '\', \'' + slot + '\', this)" title="AI tự động đề xuất món ngon">✨ AI</button>' +
                            '<button type="button" class="add-meal-btn" data-add-date="' + key + '" data-add-slot="' + slot + '" onclick="handleOpenAddMealModal(\'' + key + '\', \'' + slot + '\')" title="Tự nhập món hoặc chọn từ kho">＋ Thêm</button>' +
                        '</div>' +
                    '</div>' +
                '</div>';
            }).join('') + '</div>';
    }).join('');

    // Nút Xóa món
    document.querySelectorAll('[data-rm-date]').forEach(function (b) {
        b.addEventListener('click', function () {
            removeMeal(b.getAttribute('data-rm-date'), b.getAttribute('data-rm-slot'));
        });
    });

    // Mở chi tiết công thức khi bấm vào tên món
    document.querySelectorAll('[data-open-recipe]').forEach(function (el) {
        el.addEventListener('click', function () {
            const rid = el.getAttribute('data-open-recipe');
            if (rid) {
                openRecipeDetail(rid);
            }
        });
    });
}

let currentPlanDate = null;
let currentPlanSlot = null;

async function handleAiSuggestMeal(date, slot, btn) {
    console.log('[MealPlan] handleAiSuggestMeal called with:', { date, slot });
    if (!isUserLoggedIn()) {
        requireAuth('plan');
        return;
    }
    if (!btn) {
        btn = document.querySelector('[data-ai-slot-date="' + date + '"][data-ai-slot-type="' + slot + '"]') ||
              document.querySelector('[data-swap-date="' + date + '"][data-swap-slot="' + slot + '"]');
    }
    const origHtml = btn ? btn.innerHTML : '✨ AI';
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span style="display:inline-block;width:12px;height:12px;border:2px solid currentColor;border-right-color:transparent;border-radius:50%;animation:spin 0.6s linear infinite;margin-right:4px;"></span>AI...';
    }

    const SLOT_TEXT = { morning: 'Sáng', lunch: 'Trưa', dinner: 'Tối' };
    const slotName = SLOT_TEXT[slot] || 'Bữa ăn';

    let fridgeIngs = (state && Array.isArray(state.fridge)) ? state.fridge.map(f => f.name || f.foodName).filter(Boolean) : [];
    const prompt = 'Gợi ý 1 món ăn ngon, thanh đạm, phù hợp bữa ' + slotName + (fridgeIngs.length ? ', ưu tiên nguyên liệu tủ lạnh: ' + fridgeIngs.slice(0, 4).join(', ') : '');

    try {
        let res = null;
        try {
            res = await apiRequest('/api/plan/suggest-slot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planDate: date,
                    slot: slot,
                    prompt: prompt
                })
            });
        } catch (apiErr) {
            console.warn('[MealPlan] suggest-slot API error, fallback to local match:', apiErr);
        }

        let recipeTitle = res && res.recipeTitle;
        let recipeKcal = (res && res.recipeKcal) || 450;
        let recipeId = (res && res.recipeId) || null;

        if (!recipeTitle) {
            const allR = (typeof recipesCache !== 'undefined' && recipesCache.length ? recipesCache : (typeof recipes !== 'undefined' ? recipes : []));
            const randomRecipe = allR.length ? allR[Math.floor(Math.random() * allR.length)] : { id: 8, title: 'Cơm chiên trứng kiểu Việt', kcal: 430 };
            recipeTitle = randomRecipe.title || randomRecipe.name;
            recipeKcal = randomRecipe.kcal || 450;
            recipeId = randomRecipe.id;

            try {
                await apiRequest('/api/plan/custom-slot', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        planDate: date,
                        slot: slot,
                        title: recipeTitle,
                        kcal: recipeKcal,
                        protein: 24,
                        carb: 50,
                        fat: 14,
                        description: 'Gợi ý thông minh từ AI FoodX'
                    })
                });
            } catch (_) {}
        }

        // Cập nhật ngay vào state planEntries theo nguyên tắc bất biến (Immutability)
        const newSuggestEntry = {
            id: (res && res.id) || Date.now(),
            planDate: date,
            slot: slot,
            recipeId: recipeId,
            recipeTitle: recipeTitle,
            recipeKcal: recipeKcal,
            tags: ["AI Gợi ý"],
            isAiGenerated: true
        };
        planEntries = [
            ...(planEntries || []).filter(e => !(e.planDate === date && e.slot === slot)),
            newSuggestEntry
        ];
        if (typeof window !== 'undefined') {
            window.planEntries = planEntries;
        }

        setMealPlan(prev => ({
            ...prev,
            [date]: {
                ...((prev && prev[date]) || {}),
                [slot]: {
                    name: recipeTitle,
                    calories: recipeKcal,
                    tags: ["AI Gợi ý"],
                    isAiGenerated: true,
                    recipeId: recipeId,
                    id: newSuggestEntry.id
                }
            }
        }));

        showToast('✨ AI đã thêm món "' + recipeTitle + '" (' + recipeKcal + ' kcal) cho bữa ' + slotName + '! 🎉', 'success');
        renderPlan(weekDays(planOffset));
    } catch (e) {
        console.error('[MealPlan] handleAiSuggestMeal error:', e);
        showToast('Không thể tạo gợi ý món ăn lúc này', 'error');
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = origHtml;
        }
    }
}
window.handleAiSuggestMeal = handleAiSuggestMeal;
window.quickAiSuggest = handleAiSuggestMeal;

async function removeMeal(date, slot) {
    try {
        await apiRequest('/api/plan?date=' + date + '&slot=' + slot, { method: 'DELETE' });
        showToast('Đã xóa món ăn', 'info');
        planEntries = (planEntries || []).filter(e => !(e.planDate === date && e.slot === slot));
        if (typeof window !== 'undefined') {
            window.planEntries = planEntries;
        }
        setMealPlan(prev => {
            const next = { ...prev };
            if (next[date]) {
                const dayCopy = { ...next[date] };
                delete dayCopy[slot];
                next[date] = dayCopy;
            }
            return next;
        });
        renderPlan(weekDays(planOffset));
    } catch (e) {
        showToast('Cần đăng nhập.', 'error');
    }
}

function openAddMeal(date, slot) {
    console.log('[MealPlan] handleOpenAddMealModal called with:', { date, slot });
    if (!isUserLoggedIn()) {
        requireAuth('plan');
        return;
    }
    currentPlanDate = date;
    currentPlanSlot = slot;

    const modal = document.getElementById('planMealModal');
    if (!modal) {
        console.error('[MealPlan] Modal #planMealModal not found!');
        return;
    }

    const SLOT_NAME = { morning: 'Bữa SÁNG', lunch: 'Bữa TRƯA', dinner: 'Bữa TỐI' };
    const SLOT_KCALS = { morning: 420, lunch: 650, dinner: 550 };
    const dateObj = new Date(date);
    const DAYS_VI = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dateStr = DAYS_VI[dateObj.getDay()] + ' - ' + dateObj.getDate() + '/' + (dateObj.getMonth() + 1);

    const titleEl = document.getElementById('pmmTitle');
    const subEl = document.getElementById('pmmSubtitle');
    if (titleEl) titleEl.textContent = '🍽️ ' + (SLOT_NAME[slot] || 'Bữa ăn') + ' · ' + dateStr;
    if (subEl) subEl.textContent = 'Chọn món từ Kho công thức / Yêu thích, hoặc tự gõ tên món & calo';

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

    const pmmSearch = document.getElementById('pmmRecipeSearch');
    if (pmmSearch) pmmSearch.value = '';

    switchPlanModalTab('recipe');
    renderPmmRecipes();

    // Hiển thị modal đầy đủ (gỡ bỏ hidden và display:none)
    modal.hidden = false;
    modal.removeAttribute('hidden');
    modal.style.display = 'flex';
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}
window.openAddMeal = openAddMeal;
window.handleOpenAddMealModal = openAddMeal;

function closeAddMealModal() {
    console.log('[MealPlan] closeAddMealModal called');
    const modal = document.getElementById('planMealModal');
    if (modal) {
        modal.hidden = true;
        modal.setAttribute('hidden', '');
        modal.style.display = 'none';
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}
window.closeAddMealModal = closeAddMealModal;

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

    const favIds = (state && Array.isArray(state.favorites)) ? state.favorites.map(Number) : [];

    if (filterText) {
        const q = filterText.toLowerCase();
        list = list.filter(r => (r.title && r.title.toLowerCase().includes(q)) || (r.name && r.name.toLowerCase().includes(q)) || (r.category && r.category.toLowerCase().includes(q)));
    }

    list = [...list].sort((a, b) => {
        const aFav = favIds.includes(Number(a.id)) ? 1 : 0;
        const bFav = favIds.includes(Number(b.id)) ? 1 : 0;
        return bFav - aFav;
    });

    if (!list.length) {
        listEl.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-soft);font-size:13px;">Chưa có món ăn phù hợp trong kho. Bạn có thể sang tab "✍️ Tự thêm" để nhập món tự do!</div>';
        return;
    }

    listEl.innerHTML = list.slice(0, 30).map(function (r) {
        const isFav = favIds.includes(Number(r.id));
        return '<div class="pmm-recipe-item" style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-radius:10px;background:var(--card);border:1px solid var(--border);cursor:pointer;margin-bottom:6px;transition:all 0.15s ease;" data-pick-recipe="' + r.id + '">' +
            '<div><div style="font-weight:700;font-size:14px;color:var(--text);display:flex;align-items:center;gap:6px;">' +
            escapeHtml(r.title || r.name) +
            (isFav ? '<span style="font-size:11px;background:rgba(234,179,8,0.15);color:#eab308;padding:2px 6px;border-radius:4px;font-weight:600;">⭐ Yêu thích</span>' : '') +
            '</div>' +
            '<div style="font-size:12px;color:var(--text-soft);margin-top:2px;">' + (r.kcal || 400) + ' kcal · ' + (r.cookTime ? r.cookTime + ' phút' : 'Dễ nấu') + '</div></div>' +
            '<button type="button" class="primary-button" style="padding:6px 14px;font-size:12px;border-radius:8px;pointer-events:none;">+ Chọn</button>' +
            '</div>';
    }).join('');

    listEl.querySelectorAll('[data-pick-recipe]').forEach(function (el) {
        el.addEventListener('click', async function () {
            const rid = +el.getAttribute('data-pick-recipe');
            if (!rid || !currentPlanDate || !currentPlanSlot) return;
            console.log('[MealPlan] Recipe selected from modal:', { rid, currentPlanDate, currentPlanSlot });
            const r = (recipesCache || []).find(item => Number(item.id) === Number(rid));
            const title = r ? (r.title || r.name) : 'Món ăn';
            const kcal = r ? (r.kcal || 450) : 450;

            try {
                await apiRequest('/api/plan', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ planDate: currentPlanDate, slot: currentPlanSlot, recipeId: rid })
                });
            } catch (e) {
                console.warn('[MealPlan] /api/plan API error:', e);
            }

            // Cập nhật trực tiếp vào state planEntries
            planEntries = (planEntries || []).filter(e => !(e.planDate === currentPlanDate && e.slot === currentPlanSlot));
            planEntries.push({
                id: Date.now(),
                planDate: currentPlanDate,
                slot: currentPlanSlot,
                recipeId: rid,
                recipeTitle: title,
                recipeKcal: kcal
            });

            showToast('Đã thêm món "' + title + '" vào thực đơn 🎉', 'success');
            closeAddMealModal();
            renderPlan(weekDays(planOffset));
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
   ADD TO PLAN MODAL (YÊU THÍCH / BÀI VIẾT / CÔNG THỨC)
========================================================= */
let atpTargetRecipe = null;
let atpSelectedSlot = 'morning';
let atpSelectedDate = '';

function openAddToPlanModal(recipe) {
    if (!recipe) return;
    if (!isUserLoggedIn()) {
        requireAuth('plan');
        return;
    }
    atpTargetRecipe = recipe;

    const modal = document.getElementById('addToPlanModal');
    if (!modal) {
        console.error('[MealPlan] Modal #addToPlanModal not found!');
        return;
    }

    // 1. Cập nhật thông tin món ăn xem trước
    const imgWrap = document.getElementById('atpRecipeImgWrap');
    const titleEl = document.getElementById('atpRecipeTitle');
    const metaEl = document.getElementById('atpRecipeMeta');

    const title = recipe.title || recipe.name || 'Món ăn';
    const kcal = parseInt(recipe.kcal) || 450;
    const time = parseInt(recipe.cookTime || recipe.time) || 25;
    const imgUrl = recipe.imageUrl || recipe.image || '';

    if (titleEl) titleEl.textContent = title;
    if (metaEl) {
        metaEl.innerHTML = '<span>🔥 ' + kcal + ' kcal</span><span>⏱ ' + time + ' phút</span><span>🥗 ' + escapeHtml(recipe.category || 'Món ngon') + '</span>';
    }
    if (imgWrap) {
        if (imgUrl && String(imgUrl).trim() && !String(imgUrl).includes('default-recipe.jpg')) {
            imgWrap.innerHTML = '<img src="' + escapeHtml(imgUrl) + '" alt="' + escapeHtml(title) + '" style="width:100%;height:100%;object-fit:cover;" onerror="this.outerHTML=\'<span style=\\\'font-size:24px;\\\'>' + (typeof recipeEmoji === 'function' ? recipeEmoji(recipe) : '🍜') + '</span>\'">';
        } else {
            imgWrap.innerHTML = '<span style="font-size:24px;">' + (typeof recipeEmoji === 'function' ? recipeEmoji(recipe) : '🍜') + '</span>';
        }
    }

    // 2. Mặc định chọn bữa ăn thông minh theo giờ thực tế
    const curHour = new Date().getHours();
    if (curHour < 10) {
        atpSelectedSlot = 'morning';
    } else if (curHour < 14) {
        atpSelectedSlot = 'lunch';
    } else if (curHour < 20) {
        atpSelectedSlot = 'dinner';
    } else {
        atpSelectedSlot = 'morning';
    }

    // Cập nhật trạng thái active cho nút slot
    document.querySelectorAll('.atp-slot-btn').forEach(function (btn) {
        const slot = btn.getAttribute('data-slot');
        btn.classList.toggle('active', slot === atpSelectedSlot);
    });

    // 3. Khởi tạo ngày
    const today = new Date();
    let defaultDate = new Date();
    if (curHour >= 20) {
        defaultDate.setDate(today.getDate() + 1);
    }
    atpSelectedDate = d2s(defaultDate);

    renderAtpQuickDays(atpSelectedDate);

    const dateInput = document.getElementById('atpDateInput');
    if (dateInput) {
        dateInput.value = atpSelectedDate;
    }

    // 4. Mở modal
    modal.hidden = false;
    modal.removeAttribute('hidden');
    modal.style.display = 'flex';
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}
window.openAddToPlanModal = openAddToPlanModal;

function closeAddToPlanModal() {
    const modal = document.getElementById('addToPlanModal');
    if (modal) {
        modal.hidden = true;
        modal.setAttribute('hidden', '');
        modal.style.display = 'none';
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
    atpTargetRecipe = null;
}
window.closeAddToPlanModal = closeAddToPlanModal;

function renderAtpQuickDays(selectedDate) {
    const container = document.getElementById('atpQuickDays');
    if (!container) return;

    const today = new Date();
    const DAYS_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const daysList = [];

    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(today.getDate() + i);
        const dateStr = d2s(d);
        let label = DAYS_VI[d.getDay()];
        if (i === 0) label = 'Hôm nay';
        else if (i === 1) label = 'Ngày mai';

        const sub = d.getDate() + '/' + (d.getMonth() + 1);
        daysList.push({ label: label, sub: sub, dateStr: dateStr });
    }

    container.innerHTML = daysList.map(function (item) {
        const isActive = item.dateStr === selectedDate;
        return '<button type="button" class="atp-day-chip' + (isActive ? ' active' : '') + '" data-atp-date="' + item.dateStr + '">' +
            '<span>' + item.label + '</span>' +
            '<span class="atp-chip-sub">' + item.sub + '</span>' +
            '</button>';
    }).join('');

    container.querySelectorAll('[data-atp-date]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            const dateVal = btn.getAttribute('data-atp-date');
            atpSelectedDate = dateVal;
            const dateInput = document.getElementById('atpDateInput');
            if (dateInput) dateInput.value = dateVal;
            container.querySelectorAll('[data-atp-date]').forEach(function (b) {
                b.classList.toggle('active', b.getAttribute('data-atp-date') === dateVal);
            });
        });
    });
}

async function submitAddToPlan() {
    if (!atpTargetRecipe) return;
    if (!isUserLoggedIn()) {
        requireAuth('plan');
        return;
    }

    const submitBtn = document.getElementById('atpSubmitBtn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>⏳ Đang lưu...</span>';
    }

    const title = atpTargetRecipe.title || atpTargetRecipe.name || 'Món ăn';
    const kcal = parseInt(atpTargetRecipe.kcal) || 450;
    const rid = atpTargetRecipe.id;

    // Phân biệt công thức catalog chính thức vs bài chia sẻ cộng đồng / món tùy chỉnh
    const isSocial = !!atpTargetRecipe.isSocial || !!atpTargetRecipe.authorName || !!atpTargetRecipe.authorId || String(rid).startsWith('mock-') || String(rid).startsWith('c');
    const isCatalogRecipe = !isSocial && (typeof recipesCache !== 'undefined' && Array.isArray(recipesCache)) && recipesCache.some(function (r) {
        return Number(r.id) === Number(rid) && (r.title === title || r.name === title);
    });

    const slotNames = { morning: 'Bữa Sáng 🌅', lunch: 'Bữa Trưa ☀️', dinner: 'Bữa Tối 🌙' };
    const dateObj = new Date(atpSelectedDate);
    const dateFormatted = dateObj.getDate() + '/' + (dateObj.getMonth() + 1);

    try {
        let savedEntry = null;
        if (isCatalogRecipe) {
            savedEntry = await apiRequest('/api/plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planDate: atpSelectedDate,
                    slot: atpSelectedSlot,
                    recipeId: Number(rid)
                })
            });
        } else {
            // Bài viết chia sẻ công thức hoặc món tự nhập -> Gửi custom-slot với calo và tên món chuẩn xác
            savedEntry = await apiRequest('/api/plan/custom-slot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planDate: atpSelectedDate,
                    slot: atpSelectedSlot,
                    title: title,
                    kcal: kcal,
                    description: atpTargetRecipe.description || 'Thêm từ bài chia sẻ công thức'
                })
            });
        }

        // Cập nhật mảng state planEntries tức thì
        planEntries = (planEntries || []).filter(function (e) {
            return !(e.planDate === atpSelectedDate && e.slot === atpSelectedSlot);
        });
        planEntries.push({
            id: (savedEntry && savedEntry.id) || Date.now(),
            planDate: atpSelectedDate,
            slot: atpSelectedSlot,
            recipeId: (savedEntry && savedEntry.recipeId) || (isCatalogRecipe ? Number(rid) : null),
            recipeTitle: (savedEntry && savedEntry.recipeTitle) || title,
            recipeKcal: (savedEntry && savedEntry.recipeKcal) || kcal
        });

        closeAddToPlanModal();
        showToast('✓ Đã lên lịch món "' + title + '" (' + kcal + ' kcal) cho ' + (slotNames[atpSelectedSlot] || atpSelectedSlot) + ' (' + dateFormatted + ') 🎉', 'success');

        if (typeof loadPlan === 'function') {
            await loadPlan();
        } else if (state && state.activeView === 'plan' && typeof renderPlan === 'function') {
            renderPlan(weekDays(planOffset));
        }
    } catch (err) {
        console.error('[MealPlan] Add to plan failed:', err);
        showToast('Không thể thêm vào kế hoạch: ' + (err.message || 'Lỗi kết nối'), 'error');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>✓ Thêm vào kế hoạch</span>';
        }
    }
}
window.submitAddToPlan = submitAddToPlan;

function initAddToPlanModalEvents() {
    // Xử lý chọn slot bữa ăn (Sáng / Trưa / Tối)
    document.querySelectorAll('.atp-slot-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            const slot = btn.getAttribute('data-slot');
            atpSelectedSlot = slot;
            document.querySelectorAll('.atp-slot-btn').forEach(function (b) {
                b.classList.toggle('active', b.getAttribute('data-slot') === slot);
            });
        });
    });

    // Xử lý thay đổi Date Picker tùy ý
    const dateInput = document.getElementById('atpDateInput');
    if (dateInput) {
        dateInput.addEventListener('change', function () {
            if (dateInput.value) {
                atpSelectedDate = dateInput.value;
                document.querySelectorAll('#atpQuickDays [data-atp-date]').forEach(function (b) {
                    b.classList.toggle('active', b.getAttribute('data-atp-date') === atpSelectedDate);
                });
            }
        });
    }

    // Nút xác nhận thêm vào kế hoạch
    const submitBtn = document.getElementById('atpSubmitBtn');
    if (submitBtn) {
        submitBtn.addEventListener('click', submitAddToPlan);
    }
}



/* =========================================================
   3. EXPORT MEAL PLAN -> SMART SHOPPING LIST
========================================================= */
(function initMealPlanExport() {
    const exportBtn = document.getElementById('exportPlanShoppingBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', async function () {
            if (!isUserLoggedIn()) {
                requireAuth('shopping');
                return;
            }
            const days = weekDays(planOffset);
            const start = d2s(days[0]);
            const end = d2s(days[6]);

            showToast('⏳ Đang tổng hợp nguyên liệu tuần và đối soát tủ lạnh...', 'info');

            try {
                const entries = await apiRequest('/api/plan?start=' + start + '&end=' + end) || [];
                if (!entries.length) {
                    showToast('Chưa có bữa ăn nào trong tuần này để xuất đi chợ.', 'warning');
                    return;
                }

                const recipeIds = Array.from(new Set(entries.map(function(e) { return e.recipeId; }).filter(Boolean)));
                const allRecipes = await apiRequest('/api/recipes') || [];
                const plannedRecipes = allRecipes.filter(function(r) { return recipeIds.includes(r.id); });

                const fridgeItems = await apiRequest('/api/fridge') || [];
                const fridgeFoodNames = fridgeItems.map(function(f) { return (f.name || f.foodName || '').toLowerCase().trim(); });

                const missingIngredients = [];
                plannedRecipes.forEach(function(r) {
                    const ings = normalizeIngredientList(r.ingredients || r.ingredientsText);
                    ings.forEach(function(ingObj) {
                        const ingName = ingObj.ingredientName || ingObj.name || '';
                        if (!ingName) return;
                        const inFridge = checkIngredientInFridge(ingName, fridgeFoodNames);
                        if (!inFridge) {
                            missingIngredients.push(ingName);
                        }
                    });
                });

                if (!missingIngredients.length) {
                    showToast('Tủ lạnh đã có đủ nguyên liệu cho tất cả các bữa trong tuần! 🎉', 'success');
                    return;
                }

                const uniqueItems = Array.from(new Set(missingIngredients));
                let addedCount = 0;
                for (const item of uniqueItems.slice(0, 20)) {
                    try {
                        await apiRequest('/api/shopping', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ name: item, quantity: 'Theo thực đơn' })
                        });
                        addedCount++;
                    } catch(e) {}
                }

                showToast('🛒 Đã xuất ' + addedCount + ' nguyên liệu còn thiếu vào Danh sách Đi chợ!', 'success');
                openView('shopping');
                if (typeof loadShoppingList === 'function') loadShoppingList();
            } catch(e) {
                showToast('Không thể xuất danh sách đi chợ lúc này', 'error');
            }
        });
    }
})();


