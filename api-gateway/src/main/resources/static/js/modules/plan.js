/**
 * FoodX - Meal Planner Module (plan.js)
 * Lập lịch kế hoạch bữa ăn theo tuần, tính toán calo dinh dưỡng và thuật toán giải cứu tủ lạnh (Zero-Waste Rescue)
 */

var planOffset = 0;
var planEntries = [];
var planDailyGoal = 2000;
var planActiveDate = null;
var planWeekDays = [];

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
    } catch (_) {
        planEntries = [];
    }

    planDailyGoal = 2000;
    try {
        const s = await apiRequest('/api/plan/summary?start=' + start + '&end=' + end);
        if (s && s.dailyKcalGoal) planDailyGoal = s.dailyKcalGoal;
    } catch (_) {}

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

    // Tab buttons for 7 days
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

    // Daily nutrition summary gauge
    const sum = document.getElementById('planSummary');
    if (sum) {
        const activeMeals = byDay[planActiveDate] || {};
        const dayKcal = Object.keys(activeMeals).reduce(function (s, sl) { return s + (activeMeals[sl].recipeKcal || 0); }, 0);
        const goal = planDailyGoal || 2000;
        const pct = Math.min(100, Math.round(dayKcal * 100 / goal));
        sum.innerHTML =
            '<div class="nutrition-gauge">' +
                '<div class="ng-head"><span>⚡ Calo ngày này</span><b>' + dayKcal + ' / ' + goal + ' kcal</b></div>' +
                '<div class="ng-bar"><div class="ng-fill" style="width:' + pct + '%"></div></div>' +
                '<div class="ng-meta"><span>Đã lên ' + Object.keys(activeMeals).length + '/3 bữa</span><span>' + pct + '% mục tiêu</span></div>' +
            '</div>';
    }

    // Meal slots
    const content = document.getElementById('planDayContent');
    const curMeals = byDay[planActiveDate] || {};
    content.innerHTML = ['morning', 'lunch', 'dinner'].map(function (slot) {
        const meal = curMeals[slot];
        const info = SLOT[slot];
        return '<div class="plan-slot-card">' +
            '<div class="psc-header"><span class="psc-icon">' + info[0] + '</span><h4>' + info[1] + '</h4></div>' +
            (meal ?
                '<div class="psc-meal">' +
                    '<img src="' + (meal.recipeImage || '/images/recipes/default-recipe.jpg') + '" class="psc-thumb" onerror="this.src=\'/images/recipes/default-recipe.jpg\'">' +
                    '<div class="psc-info"><strong>' + escapeHtml(meal.recipeTitle || 'Món ăn') + '</strong><span>🔥 ' + (meal.recipeKcal || 0) + ' kcal</span></div>' +
                    '<button type="button" class="psc-del" onclick="removeMeal(' + meal.id + ')" title="Xóa">✕</button>' +
                '</div>'
                :
                '<button type="button" class="psc-add-btn" onclick="openAddMeal(\'' + planActiveDate + '\', \'' + slot + '\')">+ Thêm món ' + info[1].toLowerCase() + '</button>'
            ) +
        '</div>';
    }).join('');

    // Bind tab clicks
    document.querySelectorAll('.plan-day-tab').forEach(function (btn) {
        btn.addEventListener('click', function () {
            planActiveDate = btn.getAttribute('data-plan-date');
            renderPlan();
        });
    });
}

async function removeMeal(entryId) {
    if (!entryId) return;
    try {
        await apiRequest('/api/plan/' + entryId, { method: 'DELETE' });
        showToast('Đã xóa món khỏi kế hoạch.', 'info');
        loadPlan();
    } catch (err) {
        showToast('Lỗi khi xóa món: ' + err.message, 'error');
    }
}

let activeAddMealDate = null;
let activeAddMealSlot = null;

function openAddMeal(dateStr, slot) {
    if (!isUserLoggedIn()) {
        requireAuth('plan');
        return;
    }
    activeAddMealDate = dateStr;
    activeAddMealSlot = slot;

    const modal = document.getElementById('planMealModal');
    if (!modal) return;
    modal.hidden = false;
    modal.style.display = 'flex';

    renderPmmRecipes('all', '');
}

function renderPmmRecipes(category, query) {
    const list = document.getElementById('pmmRecipesList');
    if (!list) return;

    let items = (typeof recipesCache !== 'undefined' && recipesCache.length) ? recipesCache : (window.VIETNAMESE_RECIPES || []);
    if (category && category !== 'all') {
        items = items.filter(r => r.category === category || (r.tags && r.tags.includes(category)));
    }
    if (query) {
        const q = normalize(query);
        items = items.filter(r => normalize(r.title || r.name).includes(q));
    }

    list.innerHTML = items.map(r => `
        <div class="pmm-recipe-item" onclick="selectRecipeForPlan(${r.id || `'${r.title}'`})">
            <img src="${r.imageUrl || r.image || '/images/recipes/default-recipe.jpg'}" class="pmm-thumb" onerror="this.src='/images/recipes/default-recipe.jpg'">
            <div class="pmm-meta">
                <strong>${escapeHtml(r.title || r.name)}</strong>
                <span>🔥 ${r.calories || r.kcal || 350} kcal · ⏱ ${r.cookTime || r.time || 25}p</span>
            </div>
            <button type="button" class="primary-button" style="padding:4px 12px;font-size:12px;">+ Chọn</button>
        </div>
    `).join('');
}

async function selectRecipeForPlan(recipeId) {
    const modal = document.getElementById('planMealModal');
    if (modal) modal.hidden = true;

    const allR = (typeof recipesCache !== 'undefined' && recipesCache.length) ? recipesCache : (window.VIETNAMESE_RECIPES || []);
    const r = allR.find(x => String(x.id) === String(recipeId) || x.title === recipeId) || allR[0];

    try {
        await apiRequest('/api/plan', {
            method: 'POST',
            body: JSON.stringify({
                planDate: activeAddMealDate,
                slot: activeAddMealSlot,
                recipeId: typeof r.id === 'number' ? r.id : null,
                recipeTitle: r.title || r.name,
                recipeKcal: r.calories || r.kcal || 350,
                recipeImage: r.imageUrl || r.image || ''
            })
        });
        showToast('✓ Đã thêm món vào bữa ' + activeAddMealSlot, 'success');
        loadPlan();
    } catch (err) {
        showToast('Lỗi khi thêm vào thực đơn: ' + err.message, 'error');
    }
}

async function planZeroWasteRescue() {
    if (!isUserLoggedIn()) {
        requireAuth('plan');
        return;
    }
    let fridgeItems = state.fridge || [];
    if (!fridgeItems.length) {
        showToast('Tủ lạnh chưa có thực phẩm nào. Hãy thêm thực phẩm trước nhé!', 'warning');
        return;
    }

    const sorted = [...fridgeItems].sort((a, b) => daysLeft(a.expiresAt) - daysLeft(b.expiresAt));
    const urgentItems = sorted.slice(0, 3).map(f => f.name || f.foodName).filter(Boolean);
    const urgentNames = urgentItems.join(', ');

    const allR = (typeof recipesCache !== 'undefined' && recipesCache.length ? recipesCache : (window.VIETNAMESE_RECIPES || []));
    let matchedRecipe = allR.find(r => {
        const text = ((r.title || r.name || '') + ' ' + (r.ingredients ? (Array.isArray(r.ingredients) ? r.ingredients.map(i => i.name || i.ingredientName || i).join(' ') : r.ingredients) : '')).toLowerCase();
        return urgentItems.some(ui => text.includes(ui.toLowerCase()));
    });

    if (!matchedRecipe && allR.length) matchedRecipe = allR[0];

    if (matchedRecipe) {
        showToast(`🌱 Ưu tiên giải cứu: Gợi ý món "${matchedRecipe.title || matchedRecipe.name}" để dùng ${urgentNames}!`, 'success');
        if (typeof openRecipeDetail === 'function') openRecipeDetail(matchedRecipe.id);
    } else {
        showToast(`Thực phẩm cần ưu tiên dùng: ${urgentNames}.`, 'info');
    }
}

/* =========================================================
   DOM EVENT WIRING & GLOBAL EXPOSURE
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("prevWeekBtn")?.addEventListener("click", () => {
        planOffset--;
        loadPlan();
    });
    document.getElementById("nextWeekBtn")?.addEventListener("click", () => {
        planOffset++;
        loadPlan();
    });
    document.getElementById("planZeroWasteBtn")?.addEventListener("click", planZeroWasteRescue);

    document.querySelectorAll('[data-close="planMealModal"]').forEach(btn => {
        btn.addEventListener('click', () => {
            const m = document.getElementById('planMealModal');
            if (m) m.hidden = true;
        });
    });
});

if (typeof window !== 'undefined') {
    window.d2s = d2s;
    window.weekDays = weekDays;
    window.loadPlan = loadPlan;
    window.renderPlan = renderPlan;
    window.openAddMeal = openAddMeal;
    window.addMeal = openAddMeal;
    window.removeMeal = removeMeal;
    window.selectRecipeForPlan = selectRecipeForPlan;
    window.planZeroWasteRescue = planZeroWasteRescue;
}
