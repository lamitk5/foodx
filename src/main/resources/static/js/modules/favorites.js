/**
 * Module Danh sách yêu thích (Favorites) - FoodX
 * Hỗ trợ lưu, hiển thị, bỏ yêu thích và đồng bộ trạng thái yêu thích của người dùng.
 */

const FAVORITES_API = (typeof window !== "undefined" && window.FAVORITES_API) || "/api/favorites";
if (typeof window !== "undefined") {
    window.FAVORITES_API = FAVORITES_API;
}

/**
 * Bật/tắt lưu món ăn hoặc nguyên liệu vào danh sách yêu thích.
 */
async function toggleFavorite(targetId, targetType = "RECIPE") {
    if (typeof isUserLoggedIn === "function" && !isUserLoggedIn()) {
        if (typeof requireAuth === "function") {
            requireAuth("favorites");
        }
        return false;
    }

    if (!targetId) return false;
    const idNum = Number(targetId);
    const idStr = String(targetId);

    if (typeof state !== "undefined" && !Array.isArray(state.favorites)) {
        state.favorites = [];
    }

    let isSaved = false;
    try {
        const token = (typeof getToken === "function") ? getToken() : (window.getToken ? window.getToken() : "");
        const response = await fetch(`${FAVORITES_API}/toggle`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { "Authorization": `Bearer ${token}` } : {})
            },
            body: JSON.stringify({
                targetId: idNum,
                targetType: targetType
            })
        });

        if (response.ok) {
            const data = await response.json();
            isSaved = data?.data === true;
        } else {
            // Fallback toggle local nếu offline/service chưa online
            const existingIdx = (state.favorites || []).findIndex(x => String(x) === idStr);
            isSaved = existingIdx === -1;
        }
    } catch (e) {
        console.warn("API toggle favorite fallback local:", e);
        const existingIdx = (state.favorites || []).findIndex(x => String(x) === idStr);
        isSaved = existingIdx === -1;
    }

    // Đồng bộ vào state.favorites
    if (typeof state !== "undefined") {
        const idx = (state.favorites || []).findIndex(x => String(x) === idStr);
        if (isSaved) {
            if (idx === -1) state.favorites.push(idNum);
            if (typeof showToast === "function") showToast("Đã thêm vào danh sách yêu thích! ❤️", "success");
        } else {
            if (idx !== -1) state.favorites.splice(idx, 1);
            if (typeof showToast === "function") showToast("Đã bỏ khỏi danh sách yêu thích.", "info");
        }
        if (typeof saveState === "function") saveState();
    }

    // Cập nhật lại giao diện recipes và favorites
    if (typeof window.renderRecipes === "function") window.renderRecipes();
    else if (typeof renderRecipes === "function") renderRecipes();

    renderFavorites();
    return isSaved;
}

/**
 * Tải danh sách ID món yêu thích từ server khi đăng nhập.
 */
async function loadFavoritesFromApi(showError = false) {
    if (typeof isUserLoggedIn === "function" && !isUserLoggedIn()) {
        if (typeof state !== "undefined") state.favorites = [];
        return;
    }

    try {
        const token = (typeof getToken === "function") ? getToken() : (window.getToken ? window.getToken() : "");
        const res = await fetch(`${FAVORITES_API}/ids?targetType=RECIPE`, {
            headers: {
                ...(token ? { "Authorization": `Bearer ${token}` } : {})
            }
        });
        if (res.ok) {
            const json = await res.json();
            const ids = Array.isArray(json?.data) ? json.data : [];
            if (typeof state !== "undefined") {
                state.favorites = ids.map(Number);
                if (typeof saveState === "function") saveState();
            }
            renderFavorites();
        }
    } catch (err) {
        console.warn("Không tải được danh sách yêu thích từ server:", err);
        if (showError && typeof showToast === "function") {
            showToast("Không tải được danh sách yêu thích.", "error");
        }
    }
}

/**
 * Hiển thị danh sách các món yêu thích trong view-favorites.
 * Khắc phục triệt để lỗi selector giữa #favoritesGrid và #favoriteGrid.
 */
function renderFavorites() {
    const container = document.getElementById("favoritesGrid") || document.getElementById("favoriteGrid");
    if (!container) return;

    const favIds = (typeof state !== "undefined" && Array.isArray(state.favorites))
        ? state.favorites.map(String)
        : [];

    if (!favIds.length) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 48px 16px;">
                <div style="font-size: 48px; margin-bottom: 16px;">❤️</div>
                <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 8px;">Chưa có món ăn yêu thích nào</h3>
                <p style="color: var(--text-muted, #64748b); margin-bottom: 24px;">Nhấn vào biểu tượng trái tim ở các món ăn để lưu lại và xem tại đây.</p>
                <button type="button" class="btn btn-primary" onclick="if(typeof openView==='function') openView('recipes');" style="padding: 10px 20px; border-radius: 8px; cursor: pointer;">
                    Khám phá công thức
                </button>
            </div>
        `;
        return;
    }

    // Nếu có hàm renderRecipeCard chuẩn
    const recipesPool = (typeof recipesCache !== "undefined" && Array.isArray(recipesCache))
        ? recipesCache
        : ((typeof VIETNAMESE_RECIPES !== "undefined" && Array.isArray(VIETNAMESE_RECIPES)) ? VIETNAMESE_RECIPES : []);

    const favList = recipesPool.filter(r => favIds.includes(String(r.id)));

    if (favList.length > 0 && typeof renderRecipeCard === "function") {
        container.innerHTML = favList.map(r => renderRecipeCard(r)).join("");
    } else {
        // Fallback hiển thị card danh sách yêu thích gọn gàng
        container.innerHTML = favIds.map(id => {
            const item = recipesPool.find(r => String(r.id) === String(id));
            const title = item?.title || item?.name || `Món ăn #${id}`;
            const img = item?.imageUrl || item?.image || "/images/foods/beef.jpg";
            const calo = item?.calories || item?.kcal || 350;
            const time = item?.cookingTime || item?.cookTime || 30;

            return `
                <div class="card recipe-card" style="position: relative; overflow: hidden; border-radius: 12px; border: 1px solid rgba(0,0,0,0.08);">
                    <div style="height: 160px; overflow: hidden; background: #eee;">
                        <img src="${img}" alt="${title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='/images/foods/beef.jpg'">
                    </div>
                    <div style="padding: 14px;">
                        <h4 style="margin: 0 0 8px 0; font-size: 1rem; font-weight: 600;">${title}</h4>
                        <div style="font-size: 0.85rem; color: #64748b; display: flex; justify-content: space-between; margin-bottom: 12px;">
                            <span>⏱️ ${time} phút</span>
                            <span>🔥 ${calo} kcal</span>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button type="button" class="btn btn-sm btn-outline" onclick="if(typeof openRecipeDetail==='function') openRecipeDetail(${id})" style="flex: 1;">Xem chi tiết</button>
                            <button type="button" class="btn btn-sm" onclick="toggleFavorite(${id})" title="Bỏ yêu thích" style="color: #ef4444; background: #fee2e2; border: none; border-radius: 6px; padding: 6px 10px; cursor: pointer;">❤️</button>
                        </div>
                    </div>
                </div>
            `;
        }).join("");
    }
}

// Module window exports
if (typeof window !== "undefined") {
    window.toggleFavorite = toggleFavorite;
    window.loadFavoritesFromApi = loadFavoritesFromApi;
    window.renderFavorites = renderFavorites;
}
