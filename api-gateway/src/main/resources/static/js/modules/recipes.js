/**
 * FoodX - Recipes & Cooking Module (recipes.js)
 * Hiển thị món ăn, tính toán khớp tủ lạnh, chi tiết công thức, chế độ nấu thông minh (Cooking Mode) và chia sẻ công thức cộng đồng
 */

/* =========================================================
   1. RECIPE MATCHING & NUTRITION/SAFETY SCORING
========================================================= */

function normalizeIngredientList(ingredients) {
    if (!ingredients) return [];
    if (Array.isArray(ingredients)) return ingredients;
    if (typeof ingredients === 'string') {
        try {
            const parsed = JSON.parse(ingredients);
            if (Array.isArray(parsed)) return parsed;
        } catch (_) {
            return ingredients.split(',').map(s => s.trim()).filter(Boolean);
        }
    }
    return [];
}

function hasIngredientInFridge(ingredient) {
    if (!state || !Array.isArray(state.fridge) || !state.fridge.length) return false;
    const rawTarget = typeof ingredient === 'string' ? ingredient : ((ingredient && (ingredient.ingredientName || ingredient.name)) || '');
    const target = normalize(rawTarget);
    if (!target || target.length < 2) return false;

    const cleanedTarget = target.replace(/^(\d+([\.,]\d+)?\s*(kg|g|cu|qua|bo|hop|vi|lit|ml|muong|goi|tui|phan|trai|con|nhanh|lat|tep)\s*)/i, '').trim();

    return state.fridge.some(item => {
        if (!item) return false;
        const rawName = (item.name || (item.food && item.food.name) || '');
        const val = normalize(rawName);
        if (!val || val.length < 2) return false;
        if (cleanedTarget === val || target === val) return true;
        if (val.length >= 3 && cleanedTarget.includes(val)) return true;
        if (cleanedTarget.length >= 3 && val.includes(cleanedTarget)) return true;
        return false;
    });
}

function isRecipeSafeForProfile(recipe) {
    if (!state.profile || !state.profile.allergies) return true;
    const allergies = normalize(state.profile.allergies).split(',').map(s => s.trim()).filter(Boolean);
    if (!allergies.length) return true;

    const ings = normalizeIngredientList(recipe.ingredients).map(i => typeof i === 'string' ? i : (i.ingredientName || i.name || ''));
    const text = normalize(ings.join(' '));
    return !allergies.some(allergy => text.includes(allergy));
}

function recipeScore(recipe) {
    const fridgeIngredients = (state.fridge || []).flatMap(item => [item.name, ...(item.ingredients || [])]).filter(Boolean).map(normalize);
    let matched = 0;
    const ings = normalizeIngredientList(recipe.ingredients);

    ings.forEach(ingredient => {
        const raw = typeof ingredient === 'string' ? ingredient : (ingredient.ingredientName || ingredient.name || '');
        const value = normalize(raw);
        if (value && fridgeIngredients.some(fridge => fridge.includes(value) || value.includes(fridge))) {
            matched++;
        }
    });

    let score = 25;
    if (ings.length > 0) {
        score += (matched / ings.length) * 50;
    }

    if (state.profile && state.profile.diet && state.profile.diet !== "Ăn linh tinh" && recipe.tags && recipe.tags.includes(state.profile.diet)) {
        score += 25;
    }
    return Math.min(100, Math.round(score));
}

function recipeMatch(r) {
    const have = (window.state && state.fridge) ? state.fridge.map(i => String(i.name || '').toLowerCase()) : [];
    if (!have.length) return 55;
    const ings = normalizeIngredientList(r.ingredients);
    if (!ings.length) return 60;

    let matched = 0;
    ings.forEach(ing => {
        const name = typeof ing === 'string' ? ing : (ing.ingredientName || ing.name || '');
        if (have.some(h => name.toLowerCase().includes(h) || h.includes(name.toLowerCase()))) {
            matched++;
        }
    });
    return Math.min(100, Math.max(30, Math.round((matched / ings.length) * 100)));
}


/* =========================================================
   2. RECIPE CATALOG FETCHING & RENDERING
========================================================= */

async function loadRecipes() {
    const container = document.getElementById('recipesList') || document.getElementById('recipesGrid');
    if (container) showSkeleton(container, 'card', 6);

    try {
        const res = await apiRequest('/api/recipes');
        if (Array.isArray(res) && res.length > 0) {
            recipesCache = res;
        } else if (res && Array.isArray(res.data) && res.data.length > 0) {
            recipesCache = res.data;
        } else {
            recipesCache = VIETNAMESE_RECIPES;
        }
    } catch (err) {
        console.warn('Lỗi tải công thức từ API, dùng dữ liệu mẫu:', err);
        recipesCache = VIETNAMESE_RECIPES;
    }

    window.recipesCache = recipesCache;
    renderRecipes();
}

function renderRecipes() {
    const container = document.getElementById('recipesList') || document.getElementById('recipesGrid');
    if (!container) return;

    const query = normalize(document.getElementById('recipeSearch')?.value || '');
    const activeCategory = document.querySelector('.recipe-tag-btn.active')?.dataset.category || 'all';

    let list = recipesCache && recipesCache.length ? recipesCache : VIETNAMESE_RECIPES;

    list = list.filter(r => {
        const title = r.title || r.name || '';
        const matchQ = !query || normalize(title).includes(query);
        const cat = r.category || '';
        const matchC = activeCategory === 'all' || cat === activeCategory || (r.tags && r.tags.includes(activeCategory));
        return matchQ && matchC && isRecipeSafeForProfile(r);
    });

    if (!list.length) {
        renderEmpty(container, '🍳', 'Không tìm thấy món ăn phù hợp', 'Thử đổi từ khóa hoặc bộ lọc danh mục.', null, null);
        return;
    }

    container.innerHTML = list.map(recipe => renderRecipeCard(recipe)).join('');
}

function renderRecipeCard(recipe) {
    const id = recipe.id;
    const title = recipe.title || recipe.name || 'Món ăn ngon';
    const img = recipe.imageUrl || recipe.image || '/images/recipes/default-recipe.jpg';
    const kcal = recipe.calories || recipe.kcal || 350;
    const time = recipe.cookTime || recipe.time || 25;
    const match = recipeMatch(recipe);
    const isFav = (state.favorites || []).some(x => String(x) === String(id));

    return `
        <article class="recipe-card card-3d" data-recipe-id="${id}" onclick="openRecipeDetail('${id}')">
            <div class="rc-thumb-wrap">
                <img src="${escapeHtml(img)}" alt="${escapeHtml(title)}" class="rc-thumb" loading="lazy" onerror="this.src='/images/recipes/default-recipe.jpg'">
                <span class="rc-match-badge ${match >= 75 ? 'high' : 'medium'}">${match}% khớp tủ</span>
                <button type="button" class="rc-fav-btn ${isFav ? 'active' : ''}" onclick="event.stopPropagation(); toggleFavorite('${id}')" title="Yêu thích">
                    ${isFav ? '❤️' : '🤍'}
                </button>
            </div>
            <div class="rc-content">
                <h4 class="rc-title">${escapeHtml(title)}</h4>
                <div class="rc-meta">
                    <span>⏱ ${time} phút</span>
                    <span>🔥 ${kcal} kcal</span>
                </div>
            </div>
        </article>
    `;
}

function toggleFavorite(id) {
    const idStr = String(id);
    const idx = (state.favorites || []).findIndex(x => String(x) === idStr);
    if (idx >= 0) {
        state.favorites.splice(idx, 1);
        delete savedPostsState[idStr];
        showToast('Đã bỏ lưu món ăn.', 'info');
    } else {
        if (!state.favorites) state.favorites = [];
        state.favorites.push(id);
        const r = (recipesCache || []).find(x => String(x.id) === idStr) || { id: id, title: 'Món đã lưu' };
        savedPostsState[idStr] = { id: r.id, title: r.title || r.name, imageUrl: r.imageUrl || r.image, savedAt: new Date().toISOString() };
        showToast('Đã thêm vào mục yêu thích! ❤️', 'success');
    }
    localStorage.setItem('foodx_saved_posts', JSON.stringify(savedPostsState));
    saveState();
    renderRecipes();
    if (typeof renderFavorites === 'function') renderFavorites();
}

function renderFavorites() {
    const container = document.getElementById('favoritesGrid');
    if (!container) return;

    const favIds = (state.favorites || []).map(String);
    if (!favIds.length) {
        renderEmpty(container, '❤️', 'Chưa có món ăn yêu thích nào', 'Nhấn vào biểu tượng trái tim ở các món ăn để lưu lại đây.', 'Khám phá công thức', () => openView('recipes'));
        return;
    }

    const favs = (recipesCache || []).filter(r => favIds.includes(String(r.id)));
    container.innerHTML = favs.map(r => renderRecipeCard(r)).join('');
}


/* =========================================================
   3. RECIPE DETAIL MODAL & SERVING ADJUSTER
========================================================= */

function openRecipeDetail(recipeId) {
    const r = (recipesCache || []).find(x => String(x.id) === String(recipeId))
        || (VIETNAMESE_RECIPES || []).find(x => String(x.id) === String(recipeId));
    if (!r) return;

    curRecipe = r;
    window.curRecipe = curRecipe;

    const viewRecipe = document.getElementById('view-recipe');
    if (viewRecipe) {
        openView('recipe');
        renderRecipeDetail(r);
    }
}

function renderRecipeDetail(recipe) {
    const r = recipe || curRecipe;
    if (!r) return;

    setText('rdTitle', r.title || r.name);
    setText('rdTime', `${r.cookTime || r.time || 25} phút`);
    setText('rdCalories', `${r.calories || r.kcal || 350} kcal`);
    setText('rdDifficulty', r.difficulty || 'Dễ nấu');

    const heroImg = document.getElementById('rdImage');
    if (heroImg) heroImg.src = r.imageUrl || r.image || '/images/recipes/default-recipe.jpg';

    // Ingredients
    const ingsList = document.getElementById('rdIngredients');
    if (ingsList) {
        const ings = normalizeIngredientList(r.ingredients);
        ingsList.innerHTML = ings.map(ing => {
            const name = typeof ing === 'string' ? ing : (ing.ingredientName || ing.name || '');
            const hasIt = hasIngredientInFridge(name);
            return `
                <li class="rd-ing-item ${hasIt ? 'in-fridge' : 'missing'}">
                    <span>${hasIt ? '✓' : '○'} ${escapeHtml(name)}</span>
                    <span class="ing-badge">${hasIt ? 'Có sẵn trong tủ' : 'Cần mua'}</span>
                </li>
            `;
        }).join('');
    }

    // Steps
    const stepsList = document.getElementById('rdSteps');
    if (stepsList) {
        const steps = r.steps || (r.instructions ? r.instructions.split('\n') : ["Chuẩn bị nguyên liệu sạch sẽ.", "Nấu chín và thưởng thức."]);
        stepsList.innerHTML = steps.map((s, idx) => `
            <div class="rd-step-card">
                <strong>Bước ${idx + 1}</strong>
                <p>${escapeHtml(s)}</p>
            </div>
        `).join('');
    }

    const startCookBtn = document.getElementById('rdCookNow');
    if (startCookBtn) {
        startCookBtn.onclick = () => startCooking(r.id);
    }
}

function goBackFromRecipeDetail() {
    openView(previousViewBeforeRecipe || 'recipes');
}


/* =========================================================
   4. INTERACTIVE COOKING MODE & VOICE TIMERS
========================================================= */

let cookingTimerInterval = null;
let cookingSecondsLeft = 0;
let isCookingSpeechListening = false;
let cookingSpeechRecognition = null;

function getCookingStepTitle(step, index) {
    const text = normalize(step);
    if (text.includes("rua") || text.includes("cat") || text.includes("thai") || text.includes("got")) return "Chuẩn bị nguyên liệu";
    if (text.includes("uop")) return "Ướp nguyên liệu";
    if (text.includes("xao")) return "Xào nguyên liệu";
    if (text.includes("nuong")) return "Nướng món ăn";
    if (text.includes("luoc") || text.includes("hap")) return "Luộc / Hấp chín";
    if (text.includes("nau") || text.includes("ham")) return "Nấu canh / Hầm";
    return `Bước ${index + 1}`;
}

function openCookingMode() {
    document.getElementById("cookingModeModal")?.classList.add("show");
    document.body.style.overflow = "hidden";
}

function startCooking(recipeId) {
    const r = (recipesCache || []).find(x => String(x.id) === String(recipeId)) || curRecipe;
    if (!r) return;

    cookingState.recipeId = r.id;
    cookingState.stepIndex = 0;
    cookingState.timerRunning = false;

    setText("cmRecipeTitle", r.title || r.name);
    openCookingMode();
    renderCookingStep(0);
}

function renderCookingStep(stepIndex) {
    const r = (recipesCache || []).find(x => String(x.id) === String(cookingState.recipeId)) || curRecipe;
    if (!r) return;

    const steps = r.steps || ["Sơ chế nguyên liệu sạch.", "Nấu chín theo định lượng.", "Trình bày ra đĩa và dùng nóng."];
    cookingState.stepIndex = Math.max(0, Math.min(stepIndex, steps.length - 1));

    setText("cmStepNumber", `Bước ${cookingState.stepIndex + 1} / ${steps.length}`);
    setText("cmStepTitle", getCookingStepTitle(steps[cookingState.stepIndex], cookingState.stepIndex));
    setText("cmStepInstruction", steps[cookingState.stepIndex]);

    const progBar = document.getElementById("cmProgressBar");
    if (progBar) {
        progBar.style.width = `${((cookingState.stepIndex + 1) / steps.length) * 100}%`;
    }

    const prevBtn = document.getElementById("cmPrevStep");
    const nextBtn = document.getElementById("cmNextStep");
    if (prevBtn) prevBtn.disabled = cookingState.stepIndex === 0;
    if (nextBtn) nextBtn.textContent = cookingState.stepIndex === steps.length - 1 ? "✓ Hoàn thành" : "Bước tiếp theo →";
}

function nextCookingStep() {
    const r = (recipesCache || []).find(x => String(x.id) === String(cookingState.recipeId)) || curRecipe;
    const steps = (r && r.steps) ? r.steps : [];
    if (cookingState.stepIndex >= steps.length - 1) {
        finishCookingMode();
    } else {
        renderCookingStep(cookingState.stepIndex + 1);
    }
}

function prevCookingStep() {
    renderCookingStep(cookingState.stepIndex - 1);
}

function finishCookingMode() {
    stopCookingSpeech();
    clearInterval(cookingTimerInterval);
    document.getElementById("cookingModeModal")?.classList.remove("show");
    document.body.style.overflow = "";
    showToast("🎉 Chúc mừng bạn đã hoàn thành món ăn!", "success");
}

function updateTimerDisplay() {
    const m = Math.floor(cookingSecondsLeft / 60);
    const s = cookingSecondsLeft % 60;
    setText("cmTimerDisplay", `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
}

function startCookingSpeech() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
        showToast("Trình duyệt không hỗ trợ nhận diện giọng nói.", "warning");
        return;
    }
    try {
        cookingSpeechRecognition = new SpeechRec();
        cookingSpeechRecognition.lang = 'vi-VN';
        cookingSpeechRecognition.continuous = true;
        cookingSpeechRecognition.interimResults = false;

        cookingSpeechRecognition.onresult = function (event) {
            const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
            if (transcript.includes('tiếp') || transcript.includes('sau')) nextCookingStep();
            else if (transcript.includes('trước') || transcript.includes('lùi')) prevCookingStep();
            else if (transcript.includes('xong') || transcript.includes('hoàn thành')) finishCookingMode();
        };

        cookingSpeechRecognition.start();
        isCookingSpeechListening = true;
        showToast('🎙️ Đang lắng nghe: nói "Tiếp theo", "Lùi lại", "Xong".', 'info');
    } catch (_) {
        stopCookingSpeech();
    }
}

function stopCookingSpeech() {
    isCookingSpeechListening = false;
    if (cookingSpeechRecognition) {
        try { cookingSpeechRecognition.stop(); } catch (_) {}
        cookingSpeechRecognition = null;
    }
}


/* =========================================================
   5. SOCIAL & COMMUNITY RECIPES MODULE
========================================================= */

function socialTime(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const diff = Date.now() - d.getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return 'Vừa xong';
    if (min < 60) return min + ' phút trước';
    const h = Math.floor(min / 60);
    if (h < 24) return h + ' giờ trước';
    return d.toLocaleDateString('vi-VN');
}

function postCard(post) {
    const isLiked = post.likedByMe || !!likedPostsState[post.id];
    const isSaved = !!savedPostsState[post.id];
    const currentLikes = post.likeCount !== undefined ? post.likeCount : (post.likes || 0);
    const defaultImg = '/images/recipes/default-recipe.jpg';
    const rawImg = post.imageUrl || post.image || '';
    const postImgUrl = (rawImg && String(rawImg).trim()) ? String(rawImg).trim() : defaultImg;

    return `
        <article class="card post-card" data-post-id="${post.id}">
            <div class="post-header">
                <div class="post-avatar-wrap"><div class="post-avatar-emoji">👨‍🍳</div></div>
                <div class="post-author-info">
                    <strong>${escapeHtml(post.authorName || 'Thành viên FoodX')}</strong>
                    <span>${socialTime(post.createdAt)}</span>
                </div>
                <span class="post-badge-tag">${post.cookTime ? `⏱ ${post.cookTime}` : 'Công thức'}</span>
            </div>
            <h3 class="post-title" onclick="openRecipeDetail('${post.id}')">${escapeHtml(post.title)}</h3>
            <div class="post-img-container" onclick="openRecipeDetail('${post.id}')">
                <img class="post-image" src="${escapeHtml(postImgUrl)}" alt="${escapeHtml(post.title)}" loading="lazy" onerror="this.src='${defaultImg}'">
            </div>
            <div class="post-actions-bar">
                <button type="button" class="post-action-btn ${isLiked ? 'active' : ''}" onclick="toggleLikePost(${post.id})">
                    ${isLiked ? '❤️' : '🤍'} <span>${currentLikes}</span>
                </button>
                <button type="button" class="post-action-btn ${isSaved ? 'saved-active' : ''}" onclick="toggleFavorite('${post.id}')">
                    ${isSaved ? '🔖 Đã lưu' : '🤍 Lưu món'}
                </button>
            </div>
        </article>
    `;
}

async function loadSocialFeed() {
    const feed = document.getElementById('socialFeed');
    if (!feed) return;
    feed.innerHTML = '<div class="social-empty" style="grid-column:1/-1;">⏳ Đang tải bài viết cộng đồng...</div>';

    let apiPosts = [];
    try {
        const res = await apiRequest(`${SOCIAL_API}/posts`);
        apiPosts = Array.isArray(res) ? res : (res?.data || []);
    } catch (_) {
        apiPosts = [];
    }

    if (!apiPosts.length) {
        apiPosts = [
            { id: 101, title: 'Bí quyết nấu Phở Bò tái mềm thơm phức', authorName: 'Đầu Bếp Minh', cookTime: '45 phút', kcal: 480, imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=600&q=80', likeCount: 42 },
            { id: 102, title: 'Salad gà sốt mè rang Eat Clean siêu tốc', authorName: 'Thanh Hằng Healthy', cookTime: '15 phút', kcal: 290, imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80', likeCount: 88 }
        ];
    }

    allSocialPostsCache = apiPosts;
    feed.innerHTML = apiPosts.map(p => postCard(p)).join('');
}

async function toggleLikePost(postId) {
    if (!isUserLoggedIn()) {
        requireAuth('social');
        return;
    }
    const isLiked = !!likedPostsState[postId];
    likedPostsState[postId] = !isLiked;
    localStorage.setItem('foodx_liked_posts', JSON.stringify(likedPostsState));

    try {
        await apiRequest(`${SOCIAL_API}/posts/${postId}/like`, { method: 'POST' });
    } catch (_) {}
    loadSocialFeed();
}


/* =========================================================
   6. DOM EVENT WIRING & GLOBAL EXPOSURE
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("recipeSearch")?.addEventListener("input", debounce(renderRecipes, 200));

    document.querySelectorAll(".recipe-tag-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".recipe-tag-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            renderRecipes();
        });
    });

    document.getElementById("cmNextStep")?.addEventListener("click", nextCookingStep);
    document.getElementById("cmPrevStep")?.addEventListener("click", prevCookingStep);
    document.getElementById("cmCloseBtn")?.addEventListener("click", finishCookingMode);
    document.getElementById("cmVoiceBtn")?.addEventListener("click", () => {
        if (isCookingSpeechListening) stopCookingSpeech();
        else startCookingSpeech();
    });

    document.getElementById("recipeBackBtn")?.addEventListener("click", goBackFromRecipeDetail);
});

if (typeof window !== 'undefined') {
    window.normalizeIngredientList = normalizeIngredientList;
    window.hasIngredientInFridge = hasIngredientInFridge;
    window.isRecipeSafeForProfile = isRecipeSafeForProfile;
    window.recipeScore = recipeScore;
    window.recipeMatch = recipeMatch;
    window.loadRecipes = loadRecipes;
    window.renderRecipes = renderRecipes;
    window.renderRecipeCard = renderRecipeCard;
    window.toggleFavorite = toggleFavorite;
    window.renderFavorites = renderFavorites;
    window.openRecipeDetail = openRecipeDetail;
    window.renderRecipeDetail = renderRecipeDetail;
    window.goBackFromRecipeDetail = goBackFromRecipeDetail;

    window.openCookingMode = openCookingMode;
    window.startCooking = startCooking;
    window.renderCookingStep = renderCookingStep;
    window.nextCookingStep = nextCookingStep;
    window.prevCookingStep = prevCookingStep;
    window.finishCookingMode = finishCookingMode;
    window.startCookingSpeech = startCookingSpeech;
    window.stopCookingSpeech = stopCookingSpeech;

    window.socialTime = socialTime;
    window.postCard = postCard;
    window.loadSocialFeed = loadSocialFeed;
    window.toggleLikePost = toggleLikePost;
}