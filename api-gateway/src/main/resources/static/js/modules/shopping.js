async function addShoppingItem() {
    await addShop();
}

document
    .getElementById(
        "shoppingAdd"
    )
    ?.addEventListener(
        "click",
        addShop
    );

document
    .getElementById(
        "shoppingInput"
    )
    ?.addEventListener(
        "keydown",
        event => {
            if (
                event.key ===
                "Enter"
            ) {
                event.preventDefault();
                addShop();
            }
        }
    );

function formatScaledNumber(num) {
    if (isNaN(num)) return '';
    const rounded = Math.round(num * 100) / 100;
    return String(rounded);
}

function scaleIngredientQuantity(qty, factor) {
    if (qty == null || qty === '' || !factor || factor === 1) return qty != null ? String(qty) : '';
    const str = String(qty).trim().replace(',', '.');
    if (/^\d+\s*\/\s*\d+$/.test(str)) {
        const parts = str.split('/');
        const val = (parseFloat(parts[0]) / parseFloat(parts[1])) * factor;
        return formatScaledNumber(val);
    }
    const parsed = parseFloat(str);
    if (!isNaN(parsed) && /^[\d\.]+$/.test(str)) {
        return formatScaledNumber(parsed * factor);
    }
    return str;
}

function parseIngredientString(str) {
    if (!str) return { ingredientName: '', name: '', quantity: '', baseQuantity: '', unit: '', raw: '' };
    const s = String(str).trim();
    const qtyMatch = s.match(/^(\d+(?:[\.,\/]\d+)?\s*(?:kg|g|gr|củ|quả|bó|hộp|vỉ|lít|l|ml|muỗng\s*(?:canh|cà\s*phê)?|thìa|gói|túi|phần|trái|con|nhánh|lát|tép|chén|bát|ổ|cây|khoanh|khúc)?)\s*(.+)$/i);
    if (qtyMatch && qtyMatch[2] && qtyMatch[2].trim()) {
        const qtyUnit = qtyMatch[1].trim();
        const ingName = qtyMatch[2].trim();
        const numMatch = qtyUnit.match(/^(\d+(?:[\.,\/]\d+)?)\s*(.*)$/);
        const qty = numMatch ? numMatch[1] : '';
        const unit = numMatch ? numMatch[2].trim() : qtyUnit;
        return {
            ingredientName: ingName,
            name: ingName,
            quantity: qty || '',
            baseQuantity: qty || '',
            unit: unit || '',
            raw: s
        };
    }
    return {
        ingredientName: s,
        name: s,
        quantity: '',
        baseQuantity: '',
        unit: '',
        raw: s
    };
}

function normalizeIngredientList(raw) {
    if (!raw) return [];
    if (typeof raw === 'string') {
        return raw.split(/[\r\n,;]+/)
            .map(s => s.trim())
            .filter(Boolean)
            .map(s => parseIngredientString(s));
    }
    if (Array.isArray(raw)) {
        const result = [];
        raw.forEach(item => {
            if (!item) return;
            if (typeof item === 'string') {
                const subItems = item.split(/[\r\n,;]+/).map(s => s.trim()).filter(Boolean);
                subItems.forEach(s => result.push(parseIngredientString(s)));
            } else if (typeof item === 'object') {
                const rawName = String(item.ingredientName || item.name || item.foodName || '').trim();
                if (rawName.includes(',') || rawName.includes(';') || rawName.includes('\n')) {
                    const subNames = rawName.split(/[\r\n,;]+/).map(s => s.trim()).filter(Boolean);
                    subNames.forEach(s => result.push(parseIngredientString(s)));
                } else if (rawName) {
                    const q = item.quantity != null ? item.quantity : '';
                    const baseQ = item.baseQuantity != null ? item.baseQuantity : q;
                    result.push({
                        ingredientName: rawName,
                        name: rawName,
                        quantity: q,
                        baseQuantity: baseQ,
                        unit: item.unit || '',
                        note: item.note || '',
                        raw: rawName
                    });
                }
            }
        });
        return result;
    }
    return [];
}

function getFridgeIngredientNames() {
    let names = [];
    if (typeof state !== 'undefined' && Array.isArray(state.fridge)) {
        state.fridge.forEach(f => {
            const n = String((f && f.name) || (f && f.food && f.food.name) || '').trim().toLowerCase();
            if (n.length >= 2) names.push(n);
        });
    }
    return Array.from(new Set(names));
}

function checkIngredientInFridge(ingName, fridgeNamesList) {
    if (!fridgeNamesList || !fridgeNamesList.length) return false;
    const lower = String(ingName || '').toLowerCase().trim();
    if (!lower || lower.length < 2) return false;
    
    // Strip leading quantities/units
    const cleaned = lower.replace(/^(\d+(?:[\.,\/]\d+)?\s*(kg|g|gr|củ|quả|bó|hộp|vỉ|lít|l|ml|muỗng|thìa|gói|túi|phần|trái|con|nhánh|lát|tép|chén|bát|ổ|cây|khoanh|khúc)\s*)/i, '').trim();
    if (!cleaned || cleaned.length < 2) return false;
    
    return fridgeNamesList.some(fn => {
        if (!fn || fn.length < 2) return false;
        const fnLower = fn.toLowerCase().trim();
        if (cleaned === fnLower || lower === fnLower) return true;
        if (fnLower.length >= 3 && cleaned.includes(fnLower)) return true;
        if (cleaned.length >= 3 && fnLower.includes(cleaned)) return true;
        return false;
    });
}

async function addRecipeIngredientsToShopping(recipeId, onlyMissing = false) {
    if (!isUserLoggedIn()) {
        requireAuth('shopping');
        return;
    }
    try {
        let recipe = curRecipe;
        if (!recipe || (recipeId && String(recipe.id) !== String(recipeId))) {
            const id = recipeId || (curRecipe && curRecipe.id);
            if (id) {
                const savedPosts = JSON.parse(localStorage.getItem('foodx_saved_posts') || '{}');
                recipe = savedPosts[String(id)]
                    || (typeof allSocialPostsCache !== 'undefined' && (allSocialPostsCache || []).find(p => String(p.id) === String(id)))
                    || (typeof communityFeedPosts !== 'undefined' && (communityFeedPosts || []).find(p => String(p.id) === String(id)))
                    || (recipesCache || []).find(r => String(r.id) === String(id))
                    || (typeof recipes !== 'undefined' ? recipes.find(r => String(r.id) === String(id)) : null);
            }
            if (!recipe && recipeId) {
                try { recipe = await apiRequest('/api/recipes/' + recipeId); } catch (_) {}
            }
        }
        if (!recipe) { showToast('Không tìm thấy thông tin công thức để thêm nguyên liệu.', 'warning'); return; }

        const recipeTitle = recipe.title || recipe.name || 'Món ngon';
        let fridgeNames = [];
        if (onlyMissing === true) {
            try {
                const fridgeItems = await apiRequest('/api/fridge') || [];
                if (Array.isArray(fridgeItems)) {
                    fridgeNames = fridgeItems
                        .map(f => String((f && f.name) || (f && f.food && f.food.name) || '').trim().toLowerCase())
                        .filter(n => n.length >= 2);
                }
            } catch (_) {}
            if (!fridgeNames.length) { fridgeNames = getFridgeIngredientNames(); }
        }

        const normalizedIngs = normalizeIngredientList(recipe.ingredients);
        let added = 0;
        let lastError = null;

        const recipeServingRatio = (recipe && recipe.currentServings && recipe.baseServings)
            ? (recipe.currentServings / recipe.baseServings)
            : 1;

        const catTag = 'Công thức: ' + (recipeTitle.length > 50 ? recipeTitle.substring(0, 47) + '...' : recipeTitle);

        if (!normalizedIngs.length) {
            const defaultServingQty = (recipe && recipe.currentServings ? recipe.currentServings : 1) + ' phần';
            try {
                const res = await apiRequest('/api/shopping', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: recipeTitle, quantity: defaultServingQty, price: 25000, category: catTag })
                });
                if (!Array.isArray(state.shopping)) state.shopping = [];
                state.shopping.push({
                    id: (res && res.id) || (Date.now() + Math.floor(Math.random() * 1000)),
                    name: recipeTitle,
                    quantity: defaultServingQty,
                    price: 25000,
                    category: catTag,
                    done: false
                });
                added = 1;
            } catch (e) { lastError = e; }
        } else {
            for (const ing of normalizedIngs) {
                const rawName = ing.ingredientName || ing.name || '';
                if (!rawName || !rawName.trim()) continue;
                if (onlyMissing === true && checkIngredientInFridge(rawName, fridgeNames)) {
                    continue;
                }
                const rawQty = ing.baseQuantity != null && ing.baseQuantity !== '' ? ing.baseQuantity : ing.quantity;
                const scaledQty = scaleIngredientQuantity(rawQty, recipeServingRatio);
                let qty = (scaledQty != null && String(scaledQty).trim() ? String(scaledQty).trim() : '') +
                          (ing.unit && String(ing.unit).trim() ? ' ' + String(ing.unit).trim() : '');
                try {
                    const res = await apiRequest('/api/shopping', {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: rawName.trim(), quantity: qty.trim() || '1 phần', price: 25000, category: catTag })
                    });
                    if (!Array.isArray(state.shopping)) state.shopping = [];
                    state.shopping.push({
                        id: (res && res.id) || (Date.now() + Math.floor(Math.random() * 1000)),
                        name: rawName.trim(),
                        quantity: qty.trim() || '1 phần',
                        price: 25000,
                        category: catTag,
                        done: false
                    });
                    added++;
                } catch (e) { lastError = e; console.error('addRecipeIngredientsToShopping item error:', e); }
            }
        }

        saveState();
        if (typeof renderShopping === 'function') { try { await renderShopping(); } catch (e) {} }
        if (typeof loadShoppingList === 'function') { try { await loadShoppingList(); } catch (e) {} }

        if (added > 0) {
            showToast(`🛒 Đã thêm ${added} nguyên liệu của món "${recipeTitle}" vào Danh sách mua! 🎉`, 'success');
        } else if (lastError) {
            showToast('Không thể thêm vào danh sách mua: ' + (lastError.message || 'Lỗi kết nối'), 'error');
        } else {
            showToast('Không tìm thấy nguyên liệu hợp lệ để thêm.', 'warning');
        }
    } catch (err) {
        console.error('addRecipeIngredientsToShopping error:', err);
        showToast('Lỗi khi thêm nguyên liệu vào danh sách mua: ' + err.message, 'error');
    }
}
window.addRecipeIngredientsToShopping = addRecipeIngredientsToShopping;

async function addMissingIngredients(recipeId) {
    return addRecipeIngredientsToShopping(recipeId, false);
}
window.addMissingIngredients = addMissingIngredients;

async function addRecipeIngredientsToFridge(recipeId) {
    return addRecipeIngredientsToShopping(recipeId, false);
}
window.addRecipeIngredientsToFridge = addRecipeIngredientsToFridge;
/* =========================================================
   STATS
========================================================= */

async function toggleShop(id) {
    if (!isUserLoggedIn()) {
        requireAuth('shopping');
        return;
    }
    try {
        const res = await apiRequest('/api/shopping/' + id + '/toggle', { method: 'PATCH' });
        await renderShopping();
        
        // Tự động cập nhật dữ liệu và giao diện Tủ lạnh
        await loadFridgeFromApi(false);
        if (typeof renderFridge === 'function') renderFridge();
        if (typeof renderExpiring === 'function') renderExpiring();
        if (typeof renderStats === 'function') renderStats();
        if (typeof updateFridgeSummaryCounters === 'function') updateFridgeSummaryCounters();

        if (res && res.done) {
            showToast(`✅ Đã mua "${res.name}" và cập nhật vào Tủ lạnh! 🧊`, 'success');
        }
    } catch (e) {
        showToast('Lỗi cập nhật món: ' + e.message, 'error');
    }
}

async function delShop(id) {
    if (!isUserLoggedIn()) {
        requireAuth('shopping');
        return;
    }
    try {
        await apiRequest('/api/shopping/' + id, { method: 'DELETE' });
        await renderShopping();
        showToast('Đã xóa món khỏi danh sách.', 'info');
    } catch (e) {
        showToast('Lỗi xóa món: ' + e.message, 'error');
    }
}

let currentShopFilter = 'all';
let currentShopSearch = '';
let allShoppingItemsCache = [];
let srmSelectedRecipe = null;

function formatShopTime(dateStr) {
    if (!dateStr) return 'Vừa thêm';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Vừa thêm';
    const now = new Date();
    const diffSec = Math.floor((now - d) / 1000);
    if (diffSec < 60) return 'Vừa xong';
    if (diffSec < 3600) return Math.floor(diffSec / 60) + ' phút trước';
    const isToday = d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    const timeStr = d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
    if (isToday) return 'Hôm nay, ' + timeStr;
    return d.getDate() + '/' + (d.getMonth() + 1) + ' ' + timeStr;
}

function shopEmoji(name) {
    const t = String(name || '').toLowerCase();
    if (t.includes('bò') || t.includes('thịt bò') || t.includes('xương')) return '🥩';
    if (t.includes('heo') || t.includes('lợn') || t.includes('sườn') || t.includes('ba chỉ')) return '🥓';
    if (t.includes('gà') || t.includes('vịt') || t.includes('cánh gà') || t.includes('ức gà')) return '🍗';
    if (t.includes('cá') || t.includes('tôm') || t.includes('mực') || t.includes('hải sản') || t.includes('cua')) return '🐟';
    if (t.includes('trứng')) return '🥚';
    if (t.includes('sữa') || t.includes('bơ') || t.includes('phô mai')) return '🥛';
    if (t.includes('rau') || t.includes('cải') || t.includes('xà lách') || t.includes('mồng tơi') || t.includes('muống')) return '🥬';
    if (t.includes('cà chua')) return '🍅';
    if (t.includes('hành') || t.includes('ngò') || t.includes('mùi')) return '🧅';
    if (t.includes('tỏi') || t.includes('gừng') || t.includes('sả') || t.includes('ớt')) return '🧄';
    if (t.includes('bánh phở') || t.includes('bún') || t.includes('mì') || t.includes('miến') || t.includes('gạo') || t.includes('cơm')) return '🍜';
    if (t.includes('hồi') || t.includes('quế') || t.includes('thảo quả') || t.includes('gia vị') || t.includes('nước mắm') || t.includes('tiêu')) return '🧂';
    if (t.includes('chanh') || t.includes('quất') || t.includes('tắc')) return '🍋';
    if (t.includes('nấm')) return '🍄';
    if (t.includes('dầu')) return '🫒';
    return '🛒';
}

async function addShop() {
    const input = document.getElementById('shoppingInput');
    const v = (input ? input.value.trim() : '');
    if (!v) {
        showToast('Hãy nhập tên nguyên liệu cần mua.', 'warning');
        return;
    }
    if (!isUserLoggedIn()) {
        requireAuth('shopping');
        return;
    }
    try {
        await apiRequest('/api/shopping', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: v, quantity: '1 phần', price: 25000, category: 'Nguyên liệu' })
        });
        if (input) input.value = '';
        await renderShopping();
        showToast(`Đã thêm "${v}" vào Danh sách mua 🛒`, 'success');
    } catch (e) {
        showToast('Không thể thêm món vào danh sách mua: ' + e.message, 'error');
    }
}

async function addShopByName(name, qty, category) {
    if (!name) return;
    if (!isUserLoggedIn()) {
        requireAuth('shopping');
        return;
    }
    try {
        await apiRequest('/api/shopping', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name, quantity: qty || '1 phần', price: 25000, category: category || 'Nguyên liệu' })
        });
        await renderShopping();
        showToast(`Đã thêm "${name}" vào Danh sách mua 🛒`, 'success');
    } catch (e) {
        showToast('Không thể thêm món vào danh sách mua: ' + e.message, 'error');
    }
}

async function renderShopping() {
    try {
        allShoppingItemsCache = await apiRequest('/api/shopping') || [];
    } catch (e) {
        allShoppingItemsCache = [];
    }
    renderShoppingFiltered();
}

function renderShoppingFiltered() {
    const list = document.getElementById('shoppingList');
    if (!list) return;

    const items = allShoppingItemsCache || [];
    const totalCount = items.length;
    const doneCount = items.filter(function (i) { return i.done; }).length;
    const pendingCount = totalCount - doneCount;
    const pct = totalCount ? Math.round(doneCount / totalCount * 100) : 0;

    // Update progress numbers
    const cntAll = document.getElementById('shopCntAll');
    const cntPending = document.getElementById('shopCntPending');
    const cntDone = document.getElementById('shopCntDone');
    if (cntAll) cntAll.textContent = '(' + totalCount + ')';
    if (cntPending) cntPending.textContent = '(' + pendingCount + ')';
    if (cntDone) cntDone.textContent = '(' + doneCount + ')';

    const sumEl = document.getElementById('shoppingSummary');
    const bar = document.getElementById('shoppingBar');
    if (sumEl) {
        sumEl.innerHTML = 'Đã hoàn thành: <b>' + doneCount + '/' + totalCount + ' món (' + pct + '%)</b>';
    }
    if (bar) bar.style.width = pct + '%';

    // Filter items
    let filtered = items;
    if (currentShopFilter === 'pending') {
        filtered = filtered.filter(function (i) { return !i.done; });
    } else if (currentShopFilter === 'done') {
        filtered = filtered.filter(function (i) { return !!i.done; });
    }

    // Keyword search
    const kw = (currentShopSearch || '').trim().toLowerCase();
    if (kw) {
        filtered = filtered.filter(function (i) {
            return String(i.name || '').toLowerCase().includes(kw) ||
                   String(i.quantity || '').toLowerCase().includes(kw) ||
                   String(i.category || '').toLowerCase().includes(kw);
        });
    }

    if (!items.length) {
        renderEmpty(list, '🛒', 'Danh sách mua sắm đang trống', 'Nhập nguyên liệu hoặc chọn gợi ý nhanh bên trên.', '+ Thêm nguyên liệu', function () {
            const input = document.getElementById('shoppingInput');
            if (input) { input.focus(); }
        });
        return;
    }

    if (!filtered.length) {
        list.innerHTML = '<div class="card" style="text-align:center;padding:36px 20px;border-radius:16px;">' +
            '<div style="font-size:32px;margin-bottom:8px;">🔍</div>' +
            '<b style="font-size:15px;color:var(--text);">Không tìm thấy nguyên liệu nào</b>' +
            '<p style="font-size:13px;color:var(--text-soft);margin-top:4px;">Thử tìm từ khóa khác hoặc chuyển tab bộ lọc.</p>' +
            '</div>';
        return;
    }

    list.innerHTML = filtered.map(function (i) {
        const emoji = shopEmoji(i.name);
        const isRecipeOrigin = i.category && (i.category.includes('Công thức') || i.category.includes('Món'));
        const timeBadge = '<span class="shop-time-badge">⏱ ' + formatShopTime(i.createdAt) + '</span>';
        const recipeBadge = isRecipeOrigin
            ? '<span class="shop-recipe-badge">🍲 ' + escapeHtml(i.category) + '</span>'
            : (i.category ? '<span class="shop-cat-badge">' + escapeHtml(i.category) + '</span>' : '');

        return '<div class="shop-row' + (i.done ? ' done' : '') + '">' +
            '<input type="checkbox" class="shop-item-check" data-shop-toggle="' + i.id + '"' + (i.done ? ' checked' : '') + ' title="Đánh dấu đã mua">' +
            '<div class="shop-emoji-icon">' + emoji + '</div>' +
            '<div class="shop-info">' +
                '<div class="shop-name' + (i.done ? ' done' : '') + '">' + escapeHtml(i.name) + '</div>' +
                '<div class="shop-meta-row">' +
                    '<span class="shop-qty-badge">' + escapeHtml(i.quantity || '1 phần') + '</span>' +
                    recipeBadge +
                    timeBadge +
                '</div>' +
            '</div>' +
            '<button type="button" class="shop-item-del" data-shop-del="' + i.id + '" title="Xoá món này">🗑</button>' +
            '</div>';
    }).join('');

    // Wire toggle
    list.querySelectorAll('[data-shop-toggle]').forEach(function (c) {
        c.addEventListener('change', function () { toggleShop(+c.getAttribute('data-shop-toggle')); });
    });

    // Wire delete
    list.querySelectorAll('[data-shop-del]').forEach(function (b) {
        b.addEventListener('click', function () { delShop(+b.getAttribute('data-shop-del')); });
    });
}

// Shopping Recipe Import Modal
function openShoppingRecipeModal() {
    const modal = document.getElementById('shoppingRecipeModal');
    if (!modal) return;
    modal.hidden = false;
    srmSelectedRecipe = null;
    const box = document.getElementById('srmIngredientsBox');
    if (box) box.style.display = 'none';
    renderSrmRecipes('');
}

function renderSrmRecipes(kw) {
    const listEl = document.getElementById('srmRecipeList');
    if (!listEl) return;
    const query = String(kw || '').trim().toLowerCase();
    
    let allR = (recipesCache || []);
    if (typeof sampleBlogPosts !== 'undefined' && Array.isArray(sampleBlogPosts)) {
        allR = allR.concat(sampleBlogPosts);
    }
    if (typeof communityFeedPosts !== 'undefined' && Array.isArray(communityFeedPosts)) {
        allR = allR.concat(communityFeedPosts);
    }

    // Unique by title
    const seen = new Set();
    const uniqueList = allR.filter(function (r) {
        const title = r.title || r.name;
        if (!title || seen.has(title)) return false;
        seen.add(title);
        return true;
    });

    let filtered = uniqueList;
    if (query) {
        filtered = filtered.filter(function (r) {
            return String(r.title || r.name || '').toLowerCase().includes(query) ||
                   String(r.category || '').toLowerCase().includes(query);
        });
    }

    if (!filtered.length) {
        listEl.innerHTML = '<div style="font-size:12.5px;color:var(--text-soft);text-align:center;padding:12px 0;">Không tìm thấy công thức phù hợp.</div>';
        return;
    }

    listEl.innerHTML = filtered.slice(0, 15).map(function (r) {
        return '<div class="srm-recipe-item" data-srm-recipe="' + r.id + '" style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;border-radius:8px;background:var(--bg);border:1px solid var(--border);cursor:pointer;transition:all 0.15s ease;">' +
            '<div style="display:flex;align-items:center;gap:10px;">' +
                '<span style="font-size:20px;">' + recipeEmoji(r) + '</span>' +
                '<div>' +
                    '<strong style="font-size:13.5px;color:var(--text);display:block;">' + escapeHtml(r.title || r.name) + '</strong>' +
                    '<span style="font-size:11.5px;color:var(--text-soft);">' + (r.cookTime ? r.cookTime + ' phút · ' : '') + (r.kcal ? r.kcal + ' kcal' : '') + '</span>' +
                '</div>' +
            '</div>' +
            '<button type="button" class="secondary-button" style="padding:4px 10px;font-size:11.5px;font-weight:600;pointer-events:none;">Chọn món →</button>' +
            '</div>';
    }).join('');

    listEl.querySelectorAll('[data-srm-recipe]').forEach(function (el) {
        el.addEventListener('click', function () {
            const rId = el.getAttribute('data-srm-recipe');
            const found = uniqueList.find(function (r) { return String(r.id) === String(rId); });
            if (found) selectSrmRecipe(found);
        });
    });
}

async function selectSrmRecipe(recipe) {
    srmSelectedRecipe = recipe;
    const box = document.getElementById('srmIngredientsBox');
    const titleEl = document.getElementById('srmRecipeTitle');
    const listEl = document.getElementById('srmIngredientsList');
    if (!box || !titleEl || !listEl) return;

    box.style.display = 'block';
    titleEl.innerHTML = '🍲 Món: ' + escapeHtml(recipe.title || recipe.name);

    let fridgeNames = [];
    try {
        const fridgeItems = await apiRequest('/api/fridge') || [];
        if (Array.isArray(fridgeItems)) {
            fridgeNames = fridgeItems
                .map(function (f) { return String((f && f.name) || (f && f.food && f.food.name) || '').trim().toLowerCase(); })
                .filter(function (n) { return n.length >= 2; });
        }
    } catch (_) {}
    if (!fridgeNames.length) {
        fridgeNames = getFridgeIngredientNames();
    }

    const ings = normalizeIngredientList(recipe.ingredients);
    srmSelectedRecipe.normalizedIngredients = ings;

    if (!ings.length) {
        listEl.innerHTML = '<div style="font-size:12.5px;color:var(--text-soft);padding:6px 0;">Công thức này chưa có danh sách nguyên liệu chi tiết.</div>';
        return;
    }

    listEl.innerHTML = ings.map(function (ing, idx) {
        const name = ing.ingredientName || ing.name || '';
        const qty = (ing.quantity != null && String(ing.quantity).trim() ? String(ing.quantity).trim() : '') + (ing.unit && String(ing.unit).trim() ? ' ' + String(ing.unit).trim() : '');
        const inFridge = checkIngredientInFridge(name, fridgeNames);

        return '<label style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:var(--bg);border-radius:8px;border:1px solid var(--border);cursor:pointer;">' +
            '<div style="display:flex;align-items:center;gap:10px;">' +
                '<input type="checkbox" class="srm-ing-cb" data-srm-ing-idx="' + idx + '"' + (!inFridge ? ' checked' : '') + ' style="width:18px;height:18px;accent-color:var(--green);">' +
                '<div>' +
                    '<b style="font-size:13px;color:var(--text);">' + escapeHtml(name) + '</b>' +
                    (qty.trim() ? '<span style="font-size:11.5px;color:var(--text-soft);margin-left:6px;">(' + escapeHtml(qty.trim()) + ')</span>' : '') +
                '</div>' +
            '</div>' +
            '<div>' +
                (inFridge
                    ? '<span style="font-size:11px;font-weight:700;color:var(--green);background:var(--green-light);padding:2px 8px;border-radius:999px;">✅ Có trong tủ lạnh</span>'
                    : '<span style="font-size:11px;font-weight:700;color:#d97706;background:#fffbeb;padding:2px 8px;border-radius:999px;">🛒 Cần mua thêm</span>') +
            '</div>' +
            '</label>';
    }).join('');
}

// Shopping global listeners initializer
(function initShoppingEnhanced() {
    // Quick filter tabs
    document.querySelectorAll('[data-shop-filter]').forEach(function (tab) {
        tab.addEventListener('click', function () {
            document.querySelectorAll('[data-shop-filter]').forEach(function (t) { t.classList.remove('active'); });
            tab.classList.add('active');
            currentShopFilter = tab.getAttribute('data-shop-filter');
            renderShoppingFiltered();
        });
    });

    // Search input
    const searchInput = document.getElementById('shopSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            currentShopSearch = searchInput.value;
            renderShoppingFiltered();
        });
    }

    // Quick suggestion chips
    document.querySelectorAll('[data-quick-add]').forEach(function (chip) {
        chip.addEventListener('click', function () {
            const val = chip.getAttribute('data-quick-add');
            if (val) addShopByName(val);
        });
    });

    // Import from Recipe button
    const importBtn = document.getElementById('shopImportRecipeBtn');
    if (importBtn) {
        importBtn.addEventListener('click', openShoppingRecipeModal);
    }

    // Modal recipe search
    const srmSearch = document.getElementById('srmSearch');
    if (srmSearch) {
        srmSearch.addEventListener('input', function () {
            renderSrmRecipes(srmSearch.value);
        });
    }

    // Modal submit
    const srmSubmitBtn = document.getElementById('srmSubmitBtn');
    if (srmSubmitBtn) {
        srmSubmitBtn.addEventListener('click', async function () {
            if (!srmSelectedRecipe) return;
            if (!isUserLoggedIn()) {
                requireAuth('shopping');
                return;
            }
            const checkedBoxes = document.querySelectorAll('.srm-ing-cb:checked');
            if (!checkedBoxes.length) {
                showToast('Chưa chọn nguyên liệu nào để thêm.', 'warning');
                return;
            }

            srmSubmitBtn.disabled = true;
            let addedCount = 0;
            const recipeTitle = srmSelectedRecipe.title || srmSelectedRecipe.name || 'Món ăn';
            const ings = srmSelectedRecipe.normalizedIngredients || normalizeIngredientList(srmSelectedRecipe.ingredients);

            for (const cb of checkedBoxes) {
                const idx = +cb.getAttribute('data-srm-ing-idx');
                const ing = ings[idx];
                if (!ing) continue;
                const name = ing.ingredientName || ing.name || '';
                const qty = (ing.quantity != null && String(ing.quantity).trim() ? String(ing.quantity).trim() : '') + (ing.unit && String(ing.unit).trim() ? ' ' + String(ing.unit).trim() : '');
                try {
                    await apiRequest('/api/shopping', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name: name,
                            quantity: qty.trim() || '1 phần',
                            price: 25000,
                            category: 'Công thức: ' + recipeTitle
                        })
                    });
                    addedCount++;
                } catch (_) {}
            }

            srmSubmitBtn.disabled = false;
            const modal = document.getElementById('shoppingRecipeModal');
            if (modal) modal.hidden = true;
            await renderShopping();
            if (typeof loadShoppingList === 'function') await loadShoppingList();
            showToast('Đã thêm ' + addedCount + ' nguyên liệu của món "' + recipeTitle + '" vào Danh sách mua! 🛒', 'success');
        });
    }
})();

async function clearDoneShopping() {
    let items = [];
    try { items = await apiRequest('/api/shopping') || []; } catch (e) { }
    const doneItems = items.filter(function (i) { return i.done; });
    if (!doneItems.length) { showToast('Chưa có món nào được đánh dấu đã mua.', 'info'); return; }
    lastClearedShop = doneItems;
    try {
        await apiRequest('/api/shopping/done', { method: 'DELETE' });
        await renderShopping();
        showToast('Đã dọn ' + doneItems.length + ' món đã mua xong! 🧹', 'success');
    } catch (e) {
        showToast('Cần đăng nhập.', 'error');
    }
}

async function clearAllShopping() {
    let items = [];
    try { items = await apiRequest('/api/shopping') || []; } catch (e) { }
    if (!items.length) {
        showToast('Danh sách mua sắm đang trống.', 'info');
        return;
    }
    if (!confirm('Bạn có chắc muốn xóa toàn bộ ' + items.length + ' món trong danh sách mua?')) {
        return;
    }
    lastClearedShop = items;
    try {
        await apiRequest('/api/shopping/all', { method: 'DELETE' });
        await renderShopping();
        showToast('Đã xóa toàn bộ ' + items.length + ' món mua sắm.', 'success');
    } catch (e) {
        showToast('Không thể xóa danh sách: ' + e.message, 'error');
    }
}

async function undoClearDone() {
    try {
        for (const it of lastClearedShop) {
            await apiRequest('/api/shopping', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: it.name, quantity: it.quantity, price: it.price, category: it.category || 'Nguyên liệu' })
            });
        }
        lastClearedShop = [];
        renderShopping();
        showToast('Đã hoàn tác. Món đã quay lại danh sách ↩️', 'success');
    } catch (e) {
        showToast('Không hoàn tác được.', 'error');
    }
}


/* =========================================================
   BOTTOM NAV + QUICK ACTION + DRAWER
========================================================= */
async function shareShoppingList() {
    const items = (typeof state !== 'undefined' && Array.isArray(state.shopping)) ? state.shopping : [];
    if (!items.length) {
        showToast('Danh sách mua sắm đang trống.', 'warning');
        return;
    }
    const doneCount = items.filter(i => i.done).length;
    let text = `🛒 DANH SÁCH ĐI CHỢ FOODX:\n`;
    items.forEach(i => {
        const check = i.done ? '[x]' : '[ ]';
        const qty = i.quantity ? ` (${i.quantity})` : '';
        text += `${check} ${i.name || ''}${qty}\n`;
    });
    text += `-----------------------\nTổng cộng: ${items.length} món (Đã mua: ${doneCount}/${items.length})\n🌿 Smart Kitchen & Meal Planner FoodX`;

    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Danh sách đi chợ FoodX',
                text: text
            });
            showToast('Đã mở hộp thoại chia sẻ!', 'success');
            return;
        } catch (_) {}
    }

    try {
        await navigator.clipboard.writeText(text);
        showToast('📋 Đã sao chép danh sách đi chợ! Dán vào Zalo/Tin nhắn để gửi cho người thân.', 'success');
    } catch (_) {
        showToast('Không thể sao chép tự động.', 'error');
    }
}
window.shareShoppingList = shareShoppingList;

// --- 5.5 INIT EVENT LISTENERS FOR NEW UX FEATURES ---
(function initUxEnhancements() {
    // Food catalog buttons
    const openCatalogBtn = document.getElementById('openFoodCatalogBtn');
    if (openCatalogBtn) openCatalogBtn.addEventListener('click', openFoodCatalogModal);

    const emptyCatalogBtn = document.getElementById('emptyFoodCatalogBtn');
    if (emptyCatalogBtn) emptyCatalogBtn.addEventListener('click', openFoodCatalogModal);

    const catalogGoCustomBtn = document.getElementById('catalogGoCustomBtn');
    if (catalogGoCustomBtn) {
        catalogGoCustomBtn.addEventListener('click', function () {
            const catModal = document.getElementById('foodCatalogModal');
            if (catModal) catModal.classList.remove('show');
            if (typeof openCustomIngredientModal === 'function') openCustomIngredientModal();
        });
    }

    // Catalog search
    const catalogSearch = document.getElementById('catalogSearchInput');
    if (catalogSearch) {
        catalogSearch.addEventListener('input', debounce(function (e) {
            renderFoodCatalog(activeCatalogCategory, e.target.value);
        }, 150));
    }

    // Catalog tabs
    const catTabs = document.querySelectorAll('#catalogCategoryTabs .catalog-tab');
    catTabs.forEach(tab => {
        tab.addEventListener('click', function () {
            catTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            activeCatalogCategory = tab.getAttribute('data-cat') || 'all';
            const q = catalogSearch ? catalogSearch.value : '';
            renderFoodCatalog(activeCatalogCategory, q);
        });
    });

    // Zero-waste plan button
    const planZeroWasteBtn = document.getElementById('planZeroWasteBtn');
    if (planZeroWasteBtn) planZeroWasteBtn.addEventListener('click', planZeroWasteRescue);

    // Shopping share button
    const shopShareBtn = document.getElementById('shopShareList');
    if (shopShareBtn) shopShareBtn.addEventListener('click', shareShoppingList);
})();

/* =========================================================
   6. SERVICE WORKER & PWA REGISTRATION
========================================================= */
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('/sw.js')
            .then(function (reg) {
                console.log('[FoodX PWA] Service Worker registered successfully, scope:', reg.scope);
            })
            .catch(function (err) {
                console.warn('[FoodX PWA] Service Worker registration failed:', err);
            });
    });
}

/* =========================================================
   7. LAZY LOAD ẢNH TOÀN CỤC (hiệu suất cảm nhận — không phải sửa từng template)
========================================================= */
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
    document.addEventListener('DOMContentLoaded', function () { scan(document); });
    if (typeof MutationObserver !== 'undefined') {
        try {
            const mo = new MutationObserver(function (mutations) {
                mutations.forEach(function (m) {
                    m.addedNodes.forEach(function (n) {
                        if (n.nodeType === 1) {
                            if (n.tagName === 'IMG') apply(n);
                            scan(n);
                        }
                    });
                });
            });
            mo.observe(document.documentElement, { childList: true, subtree: true });
        } catch (_) { /* môi trường không hỗ trợ MutationObserver */ }
    }
})();

// Module window exports
if (typeof window !== 'undefined') window.addShoppingItem = addShoppingItem;
if (typeof window !== 'undefined') window.formatScaledNumber = formatScaledNumber;
if (typeof window !== 'undefined') window.scaleIngredientQuantity = scaleIngredientQuantity;
if (typeof window !== 'undefined') window.parseIngredientString = parseIngredientString;
if (typeof window !== 'undefined') window.normalizeIngredientList = normalizeIngredientList;
if (typeof window !== 'undefined') window.getFridgeIngredientNames = getFridgeIngredientNames;
if (typeof window !== 'undefined') window.checkIngredientInFridge = checkIngredientInFridge;
if (typeof window !== 'undefined') window.toggleShop = toggleShop;
if (typeof window !== 'undefined') window.delShop = delShop;
if (typeof window !== 'undefined') window.formatShopTime = formatShopTime;
if (typeof window !== 'undefined') window.shopEmoji = shopEmoji;
if (typeof window !== 'undefined') window.addShop = addShop;
if (typeof window !== 'undefined') window.addShopByName = addShopByName;
if (typeof window !== 'undefined') window.renderShopping = renderShopping;
if (typeof window !== 'undefined') window.renderShoppingFiltered = renderShoppingFiltered;
if (typeof window !== 'undefined') window.openShoppingRecipeModal = openShoppingRecipeModal;
if (typeof window !== 'undefined') window.renderSrmRecipes = renderSrmRecipes;
if (typeof window !== 'undefined') window.selectSrmRecipe = selectSrmRecipe;
if (typeof window !== 'undefined') window.clearDoneShopping = clearDoneShopping;
if (typeof window !== 'undefined') window.clearAllShopping = clearAllShopping;
if (typeof window !== 'undefined') window.undoClearDone = undoClearDone;
