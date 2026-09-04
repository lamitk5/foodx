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
window.openFoodCatalogModal = openFoodCatalogModal;

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
            '<span style="font-size: 13px;">Bạn có thể thử tìm từ khóa khác hoặc nhấn "Tự nhập tay nguyên liệu khác" bên dưới.</span></div>';
        return;
    }

    grid.innerHTML = filtered.map(f => {
        const img = f.image || '/images/foods/placeholder.jpg';
        return `
        <div class="catalog-card" data-catalog-id="${f.id}">
            <div class="catalog-card-header">
                <img src="${img}" class="catalog-card-img" alt="${escapeHtml(f.name)}" onerror="this.src='/images/placeholder.svg'">
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
window.renderFoodCatalog = renderFoodCatalog;

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
        await addFoodToFridge(foodId, btn);
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
window.quickAddCatalogItemToFridge = quickAddCatalogItemToFridge;

function fillQuickFood(name, qty, unit, days, cat) {
    const nameInput = document.getElementById('customFoodName');
    const qtyInput = document.getElementById('customFoodQuantity');
    const unitInput = document.getElementById('customFoodUnit');
    const expiryInput = document.getElementById('customFoodExpiry');
    if (nameInput) {
        nameInput.value = name;
        nameInput.dispatchEvent(new Event('input'));
    }
    if (qtyInput) qtyInput.value = qty;
    if (unitInput) unitInput.value = unit;
    if (expiryInput && typeof toDateInputValue === 'function' && typeof futureDate === 'function') {
        expiryInput.value = toDateInputValue(futureDate(days || 7));
    }
    showToast(`Đã điền nhanh "${name}" (${qty} ${unit})!`, 'info');
}
window.fillQuickFood = fillQuickFood;

// --- 5.2 COOKING MODE CONTROLLER ---
let currentCookingRecipe = null;
let currentCookingStepIndex = 0;
let cookingTimerInterval = null;
let cookingTimerSeconds = 0;
let cookingSpeechRecognition = null;
let isCookingSpeechListening = false;
