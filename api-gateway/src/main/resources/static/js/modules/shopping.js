/**
 * FoodX module: shopping.js
 * Danh sach mua sam.
 * Cat tu app.js, van dung bien toan cuc de index.html goi duoc.
 */
/* =========================================================
   SHOPPING
========================================================= */
// Quản lý danh sách mua sắm được xử lý đồng bộ qua API MySQL tại /api/shopping


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

function quantityNumber(qty) {
    const str = String(qty == null ? '' : qty).trim().replace(',', '.');
    if (/^\d+\s*\/\s*\d+$/.test(str)) {
        const parts = str.split('/');
        const value = parseFloat(parts[0]) / parseFloat(parts[1]);
        return isNaN(value) ? null : value;
    }
    if (/^[\d.]+$/.test(str)) {
        const value = parseFloat(str);
        return isNaN(value) ? null : value;
    }
    return null;
}

function formatScaledNumber(num) {
    if (isNaN(num)) return '';
    return nearestCookFraction(num);
}

function nearestCookFraction(num) {
    const steps = [
        [0.125, '1/8'], [0.167, '1/6'], [0.25, '1/4'], [0.333, '1/3'],
        [0.5, '1/2'], [0.667, '2/3'], [0.75, '3/4'], [0.833, '5/6'], [0.875, '7/8']
    ];
    const abs = Math.abs(Number(num));
    if (!isFinite(abs)) return '';
    const whole = Math.floor(abs + 1e-8);
    const frac = abs - whole;
    if (frac < 0.04) return String(whole);
    if (frac > 0.96) return String(whole + 1);
    let best = steps[0];
    let diff = 1;
    steps.forEach(function (step) {
        const gap = Math.abs(frac - step[0]);
        if (gap < diff) {
            diff = gap;
            best = step;
        }
    });
    if (diff > 0.04) return String(Math.round(abs * 10) / 10);
    if (whole === 0) return best[1];
    return whole + ' ' + best[1];
}

function formatCookAmount(num, unit, name) {
    if (num == null || isNaN(num)) return { text: '', hint: '' };
    const u = String(unit || '').trim();
    const label = String(name || '');
    if (/^(kg|g|gr|gram|ml|l|lít|lit)$/i.test(u)) {
        let rounded = num;
        if (num >= 100) rounded = Math.round(num / 5) * 5;
        else if (num >= 10) rounded = Math.round(num);
        else rounded = Math.round(num * 10) / 10;
        if (rounded <= 0 && num > 0) rounded = Math.round(num * 10) / 10 || num;
        return { text: String(rounded), hint: '' };
    }
    const fraction = nearestCookFraction(num);
    const isEgg = /trứng/i.test(label) && /quả|trái/i.test(u);
    if (isEgg) {
        if (num < 0.2) return { text: 'một ít', hint: '' };
        if (num < 0.4) return { text: '1/2', hint: 'Công thức khoảng ' + fraction + ' quả, dùng nửa quả cho dễ.' };
        if (num <= 0.6) return { text: '1/2', hint: '' };
        if (num < 0.9) return { text: '1', hint: 'Công thức khoảng ' + fraction + ' quả. Dùng 1 quả cho dễ đánh.' };
        if (Math.abs(num - Math.round(num)) < 0.08) return { text: String(Math.round(num)), hint: '' };
    }
    if (num > 0 && num < 0.12) return { text: 'một ít', hint: '' };
    return { text: fraction, hint: '' };
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

const VN_ING_UNITS = '(?:kg|g|gr|gram|lạng|củ|quả|bó|hộp|vỉ|lít|lit|l|ml|muỗng(?:\\s*(?:canh|cà\\s*phê))?|thìa(?:\\s*(?:canh|cà\\s*phê))?|gói|túi|phần|trái|con|nhánh|cây|tép|lát|miếng|chén|bát|ổ|khoanh|khúc|lon|bắp|khay|đọt|búp|tai|nắm)';

function parseIngredientString(str) {
    if (!str) return { ingredientName: '', name: '', quantity: '', baseQuantity: '', unit: '', raw: '' };
    const s = String(str).trim();
    if (!s) return { ingredientName: '', name: '', quantity: '', baseQuantity: '', unit: '', raw: '' };

    // 1. Trailing quantity: "Bánh mì giòn 2 ổ", "Thịt thăn bò 400g", "Pate gan: 50g", "Hành tây 1 củ"
    const trailingRe = new RegExp('^(.+?)(?:[\\s:–—\\-]+)(\\d+(?:[\\.,\\/]\\d+)?)\\s*(' + VN_ING_UNITS + ')?$', 'i');
    const trailingMatch = s.match(trailingRe);
    if (trailingMatch && trailingMatch[1] && trailingMatch[2]) {
        const ingName = trailingMatch[1].trim().replace(/[:–—\\-]+$/, '').trim();
        const qty = trailingMatch[2].trim();
        const unit = trailingMatch[3] ? trailingMatch[3].trim() : '';
        return {
            ingredientName: ingName,
            name: ingName,
            quantity: qty,
            baseQuantity: qty,
            unit: unit,
            raw: s
        };
    }

    // 2. Leading quantity: "2 ổ bánh mì giòn", "50g pate gan", "2 quả trứng gà"
    const leadingRe = new RegExp('^(\\d+(?:[\\.,\\/]\\d+)?)\\s*(' + VN_ING_UNITS + ')?\\s*[:–—\\-]?\\s*(.+)$', 'i');
    const leadingMatch = s.match(leadingRe);
    if (leadingMatch && leadingMatch[1] && leadingMatch[3]) {
        const qty = leadingMatch[1].trim();
        const unit = leadingMatch[2] ? leadingMatch[2].trim() : '';
        const ingName = leadingMatch[3].trim().replace(/^[:–—\\-]+/, '').trim();
        return {
            ingredientName: ingName,
            name: ingName,
            quantity: qty,
            baseQuantity: qty,
            unit: unit,
            raw: s
        };
    }

    // 3. Fallback: No numeric quantity found (e.g. "Sốt cà chua", "Tiêu đen xay", "Gia vị")
    return {
        ingredientName: s,
        name: s,
        quantity: '',
        baseQuantity: '',
        unit: 'vừa đủ',
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
                const baseNum = quantityNumber(rawQty);
                const cookedShop = baseNum == null
                    ? { text: scaleIngredientQuantity(rawQty, recipeServingRatio), hint: '' }
                    : formatCookAmount(baseNum * recipeServingRatio, ing.unit, rawName);
                const shopUnit = ing.unit && String(ing.unit).trim() ? String(ing.unit).trim() : '';
                let qty = cookedShop.text === 'một ít'
                    ? 'một ít'
                    : ((cookedShop.text ? String(cookedShop.text).trim() + (shopUnit ? ' ' + shopUnit : '') : shopUnit));
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
   SHOPPING — progress + clear-done undo
========================================================= */
let lastClearedShop = [];

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

async function mergeAndSaveShoppingItem(name, newQtyVal, newUnit, category) {
    name = name.trim();
    let lowerName = name.toLowerCase();
    
    const existing = allShoppingItemsCache.find(i => String(i.name || '').toLowerCase() === lowerName && !i.done);
    
    if (existing) {
        let oldQtyStr = (existing.quantity || '').trim();
        let match = oldQtyStr.match(/^([\d\.]+)\s*(.*)$/);
        let oldQtyVal = match ? parseFloat(match[1]) : 1;
        let oldUnit = match ? match[2].trim().toLowerCase() : 'phần';
        
        let mergedQtyStr = oldQtyStr + ' + ' + newQtyVal + ' ' + newUnit;
        newUnit = newUnit.toLowerCase();
        
        if (oldUnit === newUnit) {
            mergedQtyStr = (oldQtyVal + newQtyVal) + ' ' + newUnit;
        } else if ((oldUnit === 'g' && newUnit === 'kg') || (oldUnit === 'kg' && newUnit === 'g')) {
            let totalG = (oldUnit === 'kg' ? oldQtyVal * 1000 : oldQtyVal) + (newUnit === 'kg' ? newQtyVal * 1000 : newQtyVal);
            mergedQtyStr = (totalG >= 1000) ? (totalG / 1000) + ' kg' : totalG + ' g';
        } else if ((oldUnit === 'ml' && newUnit === 'lít') || (oldUnit === 'lít' && newUnit === 'ml')) {
            let totalMl = (oldUnit === 'lít' ? oldQtyVal * 1000 : oldQtyVal) + (newUnit === 'lít' ? newQtyVal * 1000 : newQtyVal);
            mergedQtyStr = (totalMl >= 1000) ? (totalMl / 1000) + ' lít' : totalMl + ' ml';
        }
        
        await apiRequest('/api/shopping/' + existing.id, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: existing.name, quantity: mergedQtyStr, price: existing.price || 25000, category: existing.category || category })
        });
    } else {
        await apiRequest('/api/shopping', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name, quantity: newQtyVal + ' ' + newUnit, price: 25000, category: category || 'Nguyên liệu' })
        });
    }
}

async function addShop() {
    const input = document.getElementById('shoppingInput');
    const qtyInput = document.getElementById('shoppingQty');
    const unitInput = document.getElementById('shoppingUnit');
    const v = (input ? input.value.trim() : '');
    const q = (qtyInput ? parseFloat(qtyInput.value) || 1 : 1);
    const u = (unitInput ? unitInput.value : 'phần');
    
    if (!v) {
        showToast('Hãy nhập tên nguyên liệu cần mua.', 'warning');
        return;
    }
    if (!isUserLoggedIn()) {
        requireAuth('shopping');
        return;
    }
    try {
        await mergeAndSaveShoppingItem(v, q, u, 'Nguyên liệu');
        if (input) input.value = '';
        if (qtyInput) qtyInput.value = '1';
        await renderShopping();
        showToast(`Đã thêm "${v}" vào Danh sách mua 🛒`, 'success');
    } catch (e) {
        showToast('Không thể thêm món vào danh sách mua: ' + e.message, 'error');
    }
}

async function addShopByName(name, qtyStr, category) {
    if (!name) return;
    if (!isUserLoggedIn()) {
        requireAuth('shopping');
        return;
    }
    
    let match = (qtyStr || '').match(/^([\d\.]+)\s*(.*)$/);
    let q = match ? parseFloat(match[1]) : 1;
    let u = match && match[2] ? match[2].trim() : 'phần';
    
    try {
        await mergeAndSaveShoppingItem(name, q, u, category);
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


