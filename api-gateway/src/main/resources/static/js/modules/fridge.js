/**
 * FoodX - Fridge & Inventory Module (fridge.js)
 * Giao diện và API thao tác tủ lạnh, theo dõi hạn dùng, nguyên liệu tùy chỉnh và danh mục thực phẩm mẫu
 */

/* =========================================================
   1. FRIDGE API COMMUNICATION
========================================================= */

async function fetchFridgeItems() {
    try {
        const token = typeof getToken === 'function' ? getToken() : (localStorage.getItem('foodx_token') || '');
        const response = await fetch(FRIDGE_API, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Không thể tải dữ liệu tủ lạnh');
        }
        return result.data || [];
    } catch (error) {
        if (typeof showToast === 'function') showToast(error.message, 'error');
        return [];
    }
}

async function loadFridgeFromApi(showToastOnSuccess = false) {
    if (typeof isUserLoggedIn === 'function' && !isUserLoggedIn()) {
        state.fridge = [];
        window.fridgeItemsCache = [];
        saveState();
        if (typeof renderFridge === 'function') renderFridge();
        return;
    }
    try {
        const items = await apiRequest(FRIDGE_API);
        if (Array.isArray(items)) {
            state.fridge = items.map(item => ({
                id: item.id,
                sourceKey: item.sourceKey || item.id,
                name: item.name || item.foodName || "",
                foodName: item.name || item.foodName || "",
                type: item.type || "Khác",
                quantity: item.quantity ?? 1,
                unit: item.unit || "g",
                kcal: item.kcal ?? 0,
                protein: item.protein ?? 0,
                carb: item.carb ?? 0,
                fat: item.fat ?? 0,
                components: item.components || "",
                benefit: item.benefit || "Cân bằng",
                imageUrl: item.imageUrl || "/images/foods/placeholder.jpg",
                expiresAt: item.expiresAt || (typeof futureDate === 'function' ? futureDate(7) : ""),
                note: item.note || "",
                customFood: !!item.customFood
            }));
            window.fridgeItemsCache = state.fridge;
            saveState();
            if (typeof renderFridge === 'function') renderFridge();
            if (typeof renderExpiring === 'function') renderExpiring();
            if (typeof renderStats === 'function') renderStats();
            if (typeof updateFridgeSummaryCounters === 'function') updateFridgeSummaryCounters();
            if (showToastOnSuccess) {
                showToast("Đã cập nhật dữ liệu tủ lạnh!", "success");
            }
        }
    } catch (error) {
        console.warn("Lỗi tải tủ lạnh từ API:", error);
    }
}


/* =========================================================
   2. NUTRITION & IMAGE HELPERS
========================================================= */

function getFridgeImage(item) {
    if (item.imageUrl && String(item.imageUrl).trim() !== "") return item.imageUrl;
    const cat = catalog.find(f => f.id === item.sourceKey || normalize(f.name) === normalize(item.name));
    if (cat && cat.image) return cat.image;
    return "/images/foods/placeholder.jpg";
}

function estimateClientNutrition(name, quantity, unit) {
    let multiplier = (quantity || 100) / 100.0;
    const u = (unit || "g").toLowerCase();
    if (u === "kg" || u === "lít" || u === "lit" || u === "l") multiplier = ((quantity || 1) * 1000) / 100.0;
    else if (u === "quả" || u === "qua" || u === "củ" || u === "cu") multiplier = ((quantity || 1) * 80) / 100.0;
    else if (u === "hộp" || u === "hop" || u === "bìa" || u === "bia") multiplier = ((quantity || 1) * 120) / 100.0;

    const matched = catalog.find(f => normalize(f.name) === normalize(name));
    if (matched) {
        return {
            kcal: Math.round(matched.kcal * multiplier),
            protein: Math.round((matched.kcal * 0.15) * 10) / 10,
            carb: Math.round((matched.kcal * 0.10) * 10) / 10,
            fat: Math.round((matched.kcal * 0.05) * 10) / 10,
            benefit: "Cân bằng"
        };
    }

    return {
        kcal: Math.round(150 * multiplier),
        protein: Math.round(15 * multiplier * 10) / 10,
        carb: Math.round(10 * multiplier * 10) / 10,
        fat: Math.round(5 * multiplier * 10) / 10,
        benefit: "Cân bằng"
    };
}

function getNutritionForItem(item) {
    return {
        kcal: item.kcal || 0,
        protein: item.protein || 0,
        carb: item.carb || 0,
        fat: item.fat || 0,
        benefit: item.benefit || "Cân bằng"
    };
}

function getQuantityStep(item) {
    const unit = (item.unit || "g").toLowerCase();
    if (unit === "g" || unit === "ml") return 50;
    if (unit === "kg" || unit === "lít" || unit === "lit" || unit === "l") return 0.5;
    return 1;
}


/* =========================================================
   3. RENDER FRIDGE & CATEGORY FILTERING
========================================================= */

function renderFridge() {
    const container = document.getElementById("fridgeGrid");
    if (!container) return;

    const search = normalize(document.getElementById("fridgeSearch")?.value || "");
    const filter = document.getElementById("fridgeFilter")?.value || "all";

    const foods = state.fridge.filter(item => {
        const itemName = item.name || item.foodName || "";
        const itemType = item.type || "";
        const itemComponents = item.components || "";
        const matchSearch = !search || normalize(`${itemName} ${itemType} ${itemComponents}`).includes(search);

        let matchFilter = true;
        if (filter === "soon") {
            matchFilter = daysLeft(item.expiresAt) <= 3;
        } else if (filter === "meat") {
            const raw = (item.name || "").toLowerCase() + " " + (item.type || "").toLowerCase();
            const meatKeywords = ["thịt", "cá", "tôm", "gà", "bò", "heo", "hải sản", "mực", "vịt", "cua", "xúc xích", "giò"];
            matchFilter = meatKeywords.some(k => raw.includes(k));
        } else if (filter === "veggie") {
            const raw = (item.name || "").toLowerCase() + " " + (item.type || "").toLowerCase();
            const veggieKeywords = ["rau", "củ", "quả", "cải", "cà chua", "cà rốt", "nấm", "bí", "bầu", "hành", "tỏi", "ớt", "chanh", "khoai"];
            matchFilter = veggieKeywords.some(k => raw.includes(k));
        } else if (filter === "dairy") {
            const raw = (item.name || "").toLowerCase() + " " + (item.type || "").toLowerCase();
            const dairyKeywords = ["trứng", "sữa", "phô mai", "bơ", "sữa chua", "đậu hũ", "tofu"];
            matchFilter = dairyKeywords.some(k => raw.includes(k));
        } else if (filter === "grain") {
            const raw = (item.name || "").toLowerCase() + " " + (item.type || "").toLowerCase();
            const grainKeywords = ["gạo", "cơm", "bún", "mì", "miến", "phở", "bánh mì", "khoai tây"];
            matchFilter = grainKeywords.some(k => raw.includes(k));
        }

        return matchSearch && matchFilter;
    });

    const empty = document.getElementById("fridgeEmpty");
    if (!state.fridge.length) {
        container.style.display = "none";
        if (empty) empty.style.display = "block";
    } else {
        container.style.display = "grid";
        if (empty) empty.style.display = "none";
    }

    if (!foods.length && state.fridge.length) {
        container.innerHTML = '<div class="fridge-no-result" style="grid-column:1/-1; text-align:center; padding:30px; color:var(--text-soft);">Không tìm thấy thực phẩm phù hợp.</div>';
    } else {
        container.innerHTML = foods.map(item => {
            const nutrition = getNutritionForItem(item);
            const days = daysLeft(item.expiresAt);
            const selected = state.selectedFridgeIds.includes(Number(item.id));
            const statusClass = days <= 1 ? "status-danger" : (days <= 3 ? "status-warning" : "status-safe");
            const statusLabel = days < 0 ? "Đã hết hạn" : (days === 0 ? "Hết hạn hôm nay" : (days <= 3 ? `Còn ${days} ngày` : `Còn ${days} ngày`));

            return `
                <div class="fridge-food-card ${selected ? 'selected' : ''}" data-id="${item.id}">
                    <div class="ffc-top">
                        <img src="${getFridgeImage(item)}" alt="${escapeHtml(item.name)}" class="ffc-thumb" onerror="this.src='/images/foods/placeholder.jpg'">
                        <div class="ffc-meta">
                            <h4 class="ffc-title" onclick="openIngredientDetail(${item.id})">${escapeHtml(item.name)}</h4>
                            <span class="ffc-type">${escapeHtml(item.type)} · ${item.quantity} ${escapeHtml(item.unit)}</span>
                        </div>
                        <input type="checkbox" class="ffc-check" data-action="select-fridge" data-id="${item.id}" ${selected ? 'checked' : ''} title="Chọn để tìm món">
                    </div>
                    <div class="ffc-expiry">
                        <span class="expiry-pill ${statusClass}">⏱ ${statusLabel}</span>
                        <span class="ffc-kcal">🔥 ${nutrition.kcal} kcal</span>
                    </div>
                    <div class="ffc-actions">
                        <div class="ffc-qty-ctrl">
                            <button type="button" class="qty-btn" onclick="adjustFridge(${item.id}, -1)">−</button>
                            <span class="qty-val">${item.quantity} ${escapeHtml(item.unit)}</span>
                            <button type="button" class="qty-btn" onclick="adjustFridge(${item.id}, 1)">+</button>
                        </div>
                        <div class="ffc-btn-group">
                            <button type="button" class="action-icon-btn" onclick="useFridgeFood(${item.id})" title="Đã dùng">✓ Dùng</button>
                            <button type="button" class="action-icon-btn btn-trash" onclick="deleteFridgeFood(${item.id})" title="Xóa">🗑</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    updateSelectedFridgeUI();
}

function updateSelectedFridgeUI() {
    const countEl = document.getElementById("selectedFridgeCount");
    if (countEl) countEl.textContent = state.selectedFridgeIds.length;
}

function toggleSelectedFridge(id, checked) {
    const numId = Number(id);
    if (checked) {
        if (!state.selectedFridgeIds.includes(numId)) state.selectedFridgeIds.push(numId);
    } else {
        state.selectedFridgeIds = state.selectedFridgeIds.filter(x => x !== numId);
    }
    saveState();
    updateSelectedFridgeUI();
}


/* =========================================================
   4. QUANTITY, USAGE & DELETE ACTIONS
========================================================= */

async function adjustFridge(id, direction) {
    const item = state.fridge.find(food => Number(food.id) === Number(id));
    if (!item) return;

    const delta = direction * getQuantityStep(item);
    try {
        await apiRequest(`${FRIDGE_API}/${id}/quantity?delta=${encodeURIComponent(delta)}`, { method: "PATCH" });
        await loadFridgeFromApi(false);
        showToast(direction > 0 ? `Đã tăng ${item.name}.` : `Đã giảm ${item.name}.`, "info");
    } catch (error) {
        showToast("Không cập nhật được số lượng.", "error");
    }
}

async function useFridgeFood(id) {
    const item = state.fridge.find(food => Number(food.id) === Number(id));
    if (!item) return;

    const delta = -getQuantityStep(item);
    try {
        await apiRequest(`${FRIDGE_API}/${id}/quantity?delta=${encodeURIComponent(delta)}`, { method: "PATCH" });
        await loadFridgeFromApi(false);
        showToast(`Đã cập nhật ${item.name} sau khi sử dụng.`, "success");
    } catch (error) {
        showToast("Không cập nhật được thực phẩm.", "error");
    }
}

async function deleteFridgeFood(id) {
    const item = state.fridge.find(food => Number(food.id) === Number(id));
    if (!item) return;
    if (!confirm(`Bạn có chắc muốn xóa "${item.name}" khỏi tủ lạnh?`)) return;

    try {
        await apiRequest(`${FRIDGE_API}/${id}`, { method: "DELETE" });
        state.selectedFridgeIds = state.selectedFridgeIds.filter(selectedId => Number(selectedId) !== Number(id));
        saveState();
        await loadFridgeFromApi(false);
        showToast(`${item.name} đã được xóa.`, "success");
    } catch (error) {
        showToast("Không thể xóa thực phẩm.", "error");
    }
}

async function clearAllFridge() {
    if (!isUserLoggedIn()) {
        requireAuth('fridge');
        return;
    }
    const total = state.fridge.length;
    if (total === 0) {
        showToast('Tủ lạnh hiện đang trống.', 'info');
        return;
    }
    if (!confirm(`Bạn có chắc muốn xóa toàn bộ ${total} thực phẩm khỏi tủ lạnh?`)) return;

    try {
        await apiRequest(`${FRIDGE_API}/all`, { method: "DELETE" });
        state.fridge = [];
        state.selectedFridgeIds = [];
        saveState();
        await loadFridgeFromApi(false);
        showToast('Đã xóa toàn bộ thực phẩm trong tủ lạnh! 🧹', 'success');
    } catch (error) {
        showToast('Không thể xóa tủ lạnh: ' + (error.message || 'Lỗi kết nối'), 'error');
    }
}


/* =========================================================
   5. CUSTOM INGREDIENT & FOOD CATALOG
========================================================= */

function openCustomIngredientModal() {
    if (!isUserLoggedIn()) {
        requireAuth('fridge');
        return;
    }
    const form = document.getElementById("customIngredientForm");
    form?.reset();

    const expiry = document.getElementById("customFoodExpiry");
    if (expiry) {
        expiry.setAttribute("min", toDateInputValue(new Date()));
        expiry.value = toDateInputValue(futureDate(7));
    }

    closeOtherModals("customIngredientModal");
    document.getElementById("customIngredientModal")?.classList.add("show");
}

function openFoodCatalogModal() {
    const modal = document.getElementById('foodCatalogModal');
    if (!modal) return;
    activeCatalogCategory = 'all';
    const tabs = document.querySelectorAll('#catalogCategoryTabs .catalog-tab');
    tabs.forEach(t => t.classList.toggle('active', t.getAttribute('data-cat') === 'all'));
    const input = document.getElementById('catalogSearchInput');
    if (input) input.value = '';

    renderFoodCatalog('all', '');
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function renderFoodCatalog(category = 'all', query = '') {
    const grid = document.getElementById('catalogGrid');
    if (!grid) return;
    const q = (query || '').toLowerCase().trim();

    const filtered = catalog.filter(f => {
        const matchesCat = (category === 'all') || (f.category === category) || (category === 'meat' && (f.type.includes('Thịt') || f.type.includes('Hải sản')));
        const matchesQuery = !q || f.name.toLowerCase().includes(q) || (f.type && f.type.toLowerCase().includes(q));
        return matchesCat && matchesQuery;
    });

    if (!filtered.length) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 40px 20px; color:var(--text-soft);">' +
            '<p style="font-size: 16px; font-weight: 600; margin-bottom: 6px;">🔍 Không tìm thấy thực phẩm phù hợp</p>' +
            '<span style="font-size: 13px;">Bạn có thể thử tìm từ khóa khác hoặc bấm "Tự nhập tay nguyên liệu khác".</span></div>';
        return;
    }

    grid.innerHTML = filtered.map(f => {
        const img = f.image || '/images/foods/placeholder.jpg';
        return `
        <div class="catalog-card" data-catalog-id="${f.id}">
            <div class="catalog-card-header">
                <img src="${img}" class="catalog-card-img" alt="${escapeHtml(f.name)}" onerror="this.src='/images/foods/placeholder.jpg'">
                <div class="catalog-card-info">
                    <h4>${escapeHtml(f.name)}</h4>
                    <span>${f.quantity} ${escapeHtml(f.unit || '')} · ${f.kcal || 0} kcal</span>
                </div>
            </div>
            <div class="catalog-card-meta">
                <span>⏱ Hạn dùng: ~${f.expiryDays || 7} ngày</span>
                <span>🏷 ${escapeHtml(f.type || 'Thực phẩm')}</span>
            </div>
            <button type="button" class="catalog-add-btn" onclick="quickAddCatalogItemToFridge('${f.id}', this)">
                + Thêm vào tủ
            </button>
        </div>`;
    }).join('');
}

async function quickAddCatalogItemToFridge(foodId, btn) {
    if (!isUserLoggedIn()) {
        requireAuth('fridge');
        return;
    }
    const food = catalog.find(f => f.id === foodId);
    if (!food) return;

    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Đang thêm...';
    }

    try {
        await apiRequest(FRIDGE_API, {
            method: "POST",
            body: JSON.stringify({
                sourceKey: food.id,
                name: food.name,
                type: food.type,
                quantity: food.quantity,
                unit: food.unit,
                kcal: food.kcal,
                protein: 0,
                carb: 0,
                fat: 0,
                components: food.ingredients.join(', '),
                benefit: "Cân bằng",
                imageUrl: food.image,
                expiresAt: futureDate(food.expiryDays || 7),
                customFood: false
            })
        });

        await loadFridgeFromApi(false);
        showToast(`✓ Đã thêm "${food.name}" vào tủ lạnh!`, 'success');
        if (btn) {
            btn.textContent = '✓ Đã thêm';
            setTimeout(() => {
                if (btn) {
                    btn.disabled = false;
                    btn.textContent = '+ Thêm vào tủ';
                }
            }, 1200);
        }
    } catch (err) {
        showToast('Lỗi khi thêm thực phẩm: ' + err.message, 'error');
        if (btn) {
            btn.disabled = false;
            btn.textContent = '+ Thêm vào tủ';
        }
    }
}

function openIngredientDetail(id) {
    const item = state.fridge.find(f => Number(f.id) === Number(id));
    if (!item) return;

    const modal = document.getElementById("ingredientDetailModal");
    if (!modal) return;

    setText("detailFoodName", item.name);
    setText("detailFoodQty", `${item.quantity} ${item.unit}`);
    setText("detailFoodKcal", `${item.kcal} kcal`);
    setText("detailFoodExpires", item.expiresAt ? new Date(item.expiresAt).toLocaleDateString('vi-VN') : '—');

    const expInput = document.getElementById("detailFoodExpiryInput");
    if (expInput) expInput.value = toDateInputValue(item.expiresAt);

    const saveBtn = document.getElementById("saveDetailExpiryBtn");
    if (saveBtn) {
        saveBtn.onclick = () => saveIngredientExpiry(item.id);
    }

    modal.classList.add("show");
}

async function saveIngredientExpiry(id) {
    const expInput = document.getElementById("detailFoodExpiryInput");
    if (!expInput || !expInput.value) return;

    try {
        await apiRequest(`${FRIDGE_API}/${id}`, {
            method: "PUT",
            body: JSON.stringify({ expiresAt: expInput.value })
        });
        await loadFridgeFromApi(false);
        document.getElementById("ingredientDetailModal")?.classList.remove("show");
        showToast("Đã cập nhật ngày hết hạn!", "success");
    } catch (err) {
        showToast("Lỗi cập nhật: " + err.message, "error");
    }
}


/* =========================================================
   6. DOM EVENT WIRING & GLOBAL EXPOSURE
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("openCustomIngredient")?.addEventListener("click", openCustomIngredientModal);
    document.getElementById("emptyCustomIngredient")?.addEventListener("click", openCustomIngredientModal);
    document.getElementById("clearAllFridgeBtn")?.addEventListener("click", clearAllFridge);

    document.getElementById("fridgeSearch")?.addEventListener("input", debounce(renderFridge, 180));
    document.getElementById("fridgeFilter")?.addEventListener("change", renderFridge);

    document.addEventListener("change", event => {
        const fridgeCheckbox = event.target.closest('[data-action="select-fridge"]');
        if (fridgeCheckbox) {
            toggleSelectedFridge(Number(fridgeCheckbox.dataset.id), fridgeCheckbox.checked);
        }
    });

    // Custom ingredient submission
    document.getElementById("customIngredientForm")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document.getElementById("customFoodName")?.value.trim();
        const quantity = parseFloat(document.getElementById("customFoodQuantity")?.value);
        const unit = document.getElementById("customFoodUnit")?.value || "g";
        const expiry = document.getElementById("customFoodExpiry")?.value;

        if (!name || isNaN(quantity) || quantity <= 0 || !expiry) {
            showToast("Vui lòng điền đủ tên, số lượng và ngày hết hạn.", "warning");
            return;
        }

        const restore = typeof buttonLoading === 'function' ? buttonLoading(e.submitter, "Đang lưu...") : () => {};
        try {
            await apiRequest(FRIDGE_API, {
                method: "POST",
                body: JSON.stringify({
                    name,
                    quantity,
                    unit,
                    type: "Nguyên liệu",
                    kcal: Number(document.getElementById("customFoodCalories")?.value) || 0,
                    protein: Number(document.getElementById("customFoodProtein")?.value) || 0,
                    carb: Number(document.getElementById("customFoodCarb")?.value) || 0,
                    fat: Number(document.getElementById("customFoodFat")?.value) || 0,
                    components: document.getElementById("customFoodIngredients")?.value.trim() || name,
                    benefit: document.getElementById("customFoodBenefit")?.value || "Cân bằng",
                    expiresAt: expiry,
                    customFood: true
                })
            });

            await loadFridgeFromApi(false);
            document.getElementById("customIngredientModal")?.classList.remove("show");
            showToast(`✓ Đã thêm "${name}" vào tủ lạnh.`, "success");
        } catch (error) {
            showToast(error.message || "Không thể thêm nguyên liệu.", "error");
        } finally {
            restore();
        }
    });

    // Food catalog catalog search and tabs
    document.getElementById("catalogSearchInput")?.addEventListener("input", debounce(e => {
        renderFoodCatalog(activeCatalogCategory, e.target.value);
    }, 150));

    document.querySelectorAll('#catalogCategoryTabs .catalog-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('#catalogCategoryTabs .catalog-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            activeCatalogCategory = tab.getAttribute('data-cat') || 'all';
            const q = document.getElementById('catalogSearchInput')?.value || '';
            renderFoodCatalog(activeCatalogCategory, q);
        });
    });

    document.getElementById("catalogGoCustomBtn")?.addEventListener("click", () => {
        document.getElementById("foodCatalogModal")?.classList.remove("show");
        openCustomIngredientModal();
    });
});

if (typeof window !== 'undefined') {
    window.fetchFridgeItems = fetchFridgeItems;
    window.loadFridgeFromApi = loadFridgeFromApi;
    window.renderFridge = renderFridge;
    window.getFridgeImage = getFridgeImage;
    window.estimateClientNutrition = estimateClientNutrition;
    window.getNutritionForItem = getNutritionForItem;
    window.getQuantityStep = getQuantityStep;
    window.adjustFridge = adjustFridge;
    window.useFridgeFood = useFridgeFood;
    window.deleteFridgeFood = deleteFridgeFood;
    window.clearAllFridge = clearAllFridge;
    window.toggleSelectedFridge = toggleSelectedFridge;
    window.openCustomIngredientModal = openCustomIngredientModal;
    window.openFoodCatalogModal = openFoodCatalogModal;
    window.renderFoodCatalog = renderFoodCatalog;
    window.quickAddCatalogItemToFridge = quickAddCatalogItemToFridge;
    window.openIngredientDetail = openIngredientDetail;
    window.saveIngredientExpiry = saveIngredientExpiry;
}
