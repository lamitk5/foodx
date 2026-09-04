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

    const allergies =
        normalize(
            state.profile.allergies
        )
            .split(",")
            .map(
                value =>
                    value.trim()
            )
            .filter(
                Boolean
            );


    if (
        !allergies.length
    ) {

        return true;
    }


    const text =
        normalize(
            recipe.ingredients
                .join(" ")
        );


    return !allergies.some(
        allergy =>
            text.includes(
                allergy
            )
    );
}


function recipeScore(recipe) {
    const fridgeIngredients =
        (state.fridge || [])
            .flatMap(item => [
                item.name,
                ...(item.ingredients || [])
            ])
            .filter(Boolean)
            .map(normalize);

    let matched = 0;
    const ings = normalizeIngredientList(recipe.ingredients);

    ings.forEach(ingredient => {
        const raw = ingredient.ingredientName || ingredient.name || ingredient;
        const value = normalize(raw);
        if (value && fridgeIngredients.some(fridge => fridge.includes(value) || value.includes(fridge))) {
            matched++;
        }
    });

    let score = 25;
    if (ings.length > 0) {
        score += (matched / ings.length) * 50;
    }


    if (
        state.profile.diet !==
        "Ăn linh tinh" &&
        recipe.tags.includes(
            state.profile.diet
        )
    ) {

        score +=
            12;
    }


    if (
        state.profile.diet ===
        "Ăn linh tinh" &&
        recipe.kcal >= 250 &&
        recipe.kcal <= 550
    ) {

        score +=
            7;
    }


    const goal =
        getGoal();


    if (
        goal === "Giảm cân" &&
        recipe.kcal <= 450
    ) {

        score +=
            8;
    }


    if (
        goal === "Tăng cân" &&
        recipe.kcal >= 350
    ) {

        score +=
            8;
    }


    const dislikes =
        normalize(
            state.profile.dislikes
        )
            .split(",")
            .map(
                value =>
                    value.trim()
            )
            .filter(
                Boolean
            );


    const recipeText =
        normalize(
            recipe.ingredients
                .join(" ")
        );


    if (
        dislikes.some(
            dislike =>
                recipeText.includes(
                    dislike
                )
        )
    ) {

        score -=
            20;
    }


    return Math.max(
        1,
        Math.min(
            99,
            Math.round(
                score
            )
        )
    );
}


function suggestedRecipes() {
    if (!state.fridge || state.fridge.length === 0) {
        return [];
    }

    const fridgeIngredients = (state.fridge || [])
        .flatMap(item => [item.name, ...(item.ingredients || [])])
        .filter(Boolean)
        .map(normalize);

    return recipes
        .filter(isRecipeSafeForProfile)
        .filter(recipe => {
            const ings = normalizeIngredientList(recipe.ingredients);
            return ings.some(ingredient => {
                const raw = ingredient.ingredientName || ingredient.name || ingredient;
                const value = normalize(raw);
                return value && fridgeIngredients.some(fridge => fridge.includes(value) || value.includes(fridge));
            });
        })
        .map(
            recipe => ({
                ...recipe,
                score: recipeScore(recipe)
            })
        )
        .sort(
            (a, b) => b.score - a.score
        );
}


function scoreRecipeWithSelected(
    recipe,
    selectedItems
) {

    const selected =
        selectedItems
            .flatMap(
                item => [

                    item.name,

                    ...(item.ingredients || [])
                ]
            )
            .map(
                normalize
            );


    let recipeMatched =
        0;


    recipe.ingredients
        .forEach(
            ingredient => {

                const value =
                    normalize(
                        ingredient
                    );


                if (
                    selected.some(
                        item =>
                            item.includes(
                                value
                            ) ||
                            value.includes(
                                item
                            )
                    )
                ) {

                    recipeMatched++;
                }
            }
        );


    let selectedUsed =
        0;


    selectedItems
        .forEach(
            item => {

                const itemName =
                    normalize(
                        item.name
                    );


                if (
                    recipe.ingredients.some(
                        ingredient => {

                            const value =
                                normalize(
                                    ingredient
                                );


                            return (
                                value.includes(
                                    itemName
                                ) ||
                                itemName.includes(
                                    value
                                )
                            );
                        }
                    )
                ) {

                    selectedUsed++;
                }
            }
        );


    let score =
        15;


    score +=
        (
            recipeMatched /
            recipe.ingredients.length
        ) *
        50;


    score +=
        (
            selectedUsed /
            selectedItems.length
        ) *
        30;


    if (
        recipe.tags.includes(
            state.profile.diet
        )
    ) {

        score +=
            5;
    }


    return Math.max(
        1,
        Math.min(
            99,
            Math.round(
                score
            )
        )
    );
}


/* =========================================================
   RECIPE CARD
========================================================= */

function recipeCard(recipe) {

    const favorite =
        state.favorites.includes(
            Number(
                recipe.id
            )
        );


    const score =
        recipe.score ??
        recipeScore(
            recipe
        );


    return `

        <article class="recipe-card">


            <div class="recipe-image-wrap">


                <img
                    class="recipe-image"
                    src="${recipe.image}"
                    alt="${recipe.name}">


                <span class="recipe-match">
                    ${score}% phù hợp
                </span>


                <button
                    type="button"
                    class="favorite-button ${favorite ? "active" : ""}"
                    data-action="favorite"
                    data-id="${recipe.id}">

                    ${favorite ? "♥" : "♡"}

                </button>


            </div>


            <div class="recipe-body">


                <h3 class="recipe-title">
                    ${recipe.name}
                </h3>


                <div class="recipe-meta">


                    <span>
                        ◷ ${recipe.time} phút
                    </span>


                    <span>
                        ◉ ${recipe.difficulty}
                    </span>


                    <span>
                        🔥 ${recipe.kcal} kcal
                    </span>


                </div>


                <div class="recipe-actions">


                    <button
                        type="button"
                        class="secondary-button"
                        data-action="recipe-detail"
                        data-id="${recipe.id}">

                        Chi tiết

                    </button>


                    <button
                        type="button"
                        class="small-green-button"
                        data-action="favorite"
                        data-id="${recipe.id}">

                        ${
        favorite
            ? "✓ Đã lưu"
            : "♡ Lưu món"
    }

                    </button>


                </div>


            </div>


        </article>
    `;
}


function renderRecipes() {

    const data =
        suggestedRecipes()
            .slice(
                0,
                3
            );


    const grid =
        document.getElementById(
            "recipeGrid"
        );


    if (grid) {

        grid.innerHTML =
            data
                .map(
                    recipeCard
                )
                .join("");
    }


    setText(
        "suggestionCount",
        data.length
    );


    let diet =
        state.profile.diet;


    if (
        diet ===
        "Ăn linh tinh"
    ) {

        diet =
            "Không cố định";
    }


    setText(
        "suggestionText",
        `${getGoal()} • ${diet} • ưu tiên nguyên liệu đang có`
    );
}


/* =========================================================
   SELECTED AI
========================================================= */

function openSelectedAISuggestions() {
    if (!isUserLoggedIn()) {
        requireAuth('suggest');
        return;
    }

    const selectedItems =
        state.selectedFridgeIds
            .map(
                id =>
                    state.fridge.find(
                        food =>
                            Number(food.id) ===
                            Number(id)
                    )
            )
            .filter(
                Boolean
            );


    if (
        !selectedItems.length
    ) {

        showToast(
            "Hãy tích chọn ít nhất một nguyên liệu.",
            "warning"
        );


        return;
    }


    setText(
        "aiSelectedDescription",
        `Food X đang ưu tiên ${selectedItems.length} nguyên liệu đã chọn.`
    );


    const chips =
        document.getElementById(
            "selectedIngredientChips"
        );


    if (chips) {

        chips.innerHTML =
            selectedItems
                .map(
                    item => `

                        <span>
                            ✓ ${item.name}
                        </span>
                    `
                )
                .join("");
    }


    const suggestions =
        recipes
            .filter(
                isRecipeSafeForProfile
            )
            .map(
                recipe => ({

                    ...recipe,

                    score:
                        scoreRecipeWithSelected(
                            recipe,
                            selectedItems
                        )
                })
            )
            .sort(
                (a, b) =>
                    b.score -
                    a.score
            )
            .slice(
                0,
                6
            );


    const grid =
        document.getElementById(
            "aiSelectedRecipeGrid"
        );


    if (grid) {

        grid.innerHTML =
            suggestions
                .map(
                    recipeCard
                )
                .join("");
    }


    closeOtherModals(
        "aiSelectedModal"
    );


    document
        .getElementById(
            "aiSelectedModal"
        )
        ?.classList
        .add("show");
}


document
    .getElementById(
        "openSelectedAI"
    )
    ?.addEventListener(
        "click",
        openSelectedAISuggestions
    );


document
    .getElementById(
        "selectedAIButton"
    )
    ?.addEventListener(
        "click",
        openSelectedAISuggestions
    );


/* =========================================================
   FAVORITES
========================================================= */

async function toggleFavorite(id) {
    if (!isUserLoggedIn()) {
        requireAuth('favorite');
        return;
    }
    const idKey = String(id);
    const wasSavedInPosts = !!savedPostsState[idKey];
    const wasSavedInState = state.favorites.some(x => String(x) === idKey);
    const isCurrentlySaved = wasSavedInPosts || wasSavedInState;

    if (isCurrentlySaved) {
        delete savedPostsState[idKey];
        state.favorites = state.favorites.filter(x => String(x) !== idKey);
        showToast('Đã bỏ lưu món khỏi danh sách yêu thích.', 'info');
    } else {
        // Find recipe object
        let found = null;
        if (typeof allSocialPostsCache !== 'undefined' && Array.isArray(allSocialPostsCache)) {
            found = allSocialPostsCache.find(p => String(p.id) === idKey);
        }
        if (!found && typeof communityFeedPosts !== 'undefined' && Array.isArray(communityFeedPosts)) {
            found = communityFeedPosts.find(p => String(p.id) === idKey);
        }
        if (!found && typeof recipesCache !== 'undefined' && Array.isArray(recipesCache)) {
            found = recipesCache.find(p => String(p.id) === idKey);
        }
        if (!found && typeof recipes !== 'undefined' && Array.isArray(recipes)) {
            found = recipes.find(p => String(p.id) === idKey);
        }

        savedPostsState[idKey] = {
            id: id,
            title: found ? (found.title || found.name) : 'Công thức yêu thích',
            imageUrl: found ? (found.imageUrl || found.image) : '',
            cookTime: found ? (found.cookTime || found.time) : '30',
            kcal: found ? found.kcal : 350,
            description: found ? found.description : '',
            ingredients: found ? (found.ingredients || []) : [],
            instructions: found ? (found.instructions || found.steps || '') : '',
            steps: found ? (found.steps || []) : [],
            savedAt: new Date().toISOString()
        };
        if (!state.favorites.some(x => String(x) === idKey)) {
            state.favorites.push(id);
        }
        showToast('Đã lưu món vào danh sách yêu thích! ❤️', 'success');
    }

    localStorage.setItem('foodx_saved_posts', JSON.stringify(savedPostsState));
    saveState();

    // Call API if numeric ID
    if (typeof id === 'number' || (!isNaN(+id) && !String(id).startsWith('c'))) {
        try {
            await apiRequest('/api/recipes/' + id + '/save', { method: 'POST' });
        } catch (_) {}
    }

    renderRecipes();
    await renderFavorites();
    if (typeof renderSocialFeedFiltered === 'function') renderSocialFeedFiltered();
}


async function renderFavorites() {
    const grid = document.getElementById("favoriteGrid");
    const empty = document.getElementById("favoriteEmpty");
    if (!grid) return;

    let savedList = [];

    // 1. Fetch saved recipes from API if logged in
    if (isUserLoggedIn()) {
        try {
            const apiSaved = await apiRequest('/api/recipes/saved');
            if (Array.isArray(apiSaved)) {
                apiSaved.forEach(r => {
                    savedList.push({
                        id: r.id,
                        title: r.title || r.name,
                        name: r.title || r.name,
                        imageUrl: r.imageUrl || r.image || '',
                        image: r.imageUrl || r.image || '',
                        cookTime: r.cookTime || r.time || 30,
                        time: r.cookTime || r.time || 30,
                        kcal: r.kcal || 350,
                        difficulty: r.difficulty || 'Dễ',
                        category: r.category || 'Món chính',
                        score: typeof recipeScore === 'function' ? recipeScore(r) : 95
                    });
                });
            }
        } catch (_) {}
    }

    // 2. Read from savedPostsState (which stores community posts, e.g. c101, c102, etc.)
    const savedPosts = JSON.parse(localStorage.getItem('foodx_saved_posts') || '{}');
    Object.values(savedPosts).forEach(s => {
        if (s && s.id) {
            const alreadyInList = savedList.some(item => String(item.id) === String(s.id) || (item.title && s.title && item.title === s.title));
            if (!alreadyInList) {
                savedList.push({
                    id: s.id,
                    title: s.title || s.name || 'Công thức cộng đồng',
                    name: s.title || s.name || 'Công thức cộng đồng',
                    imageUrl: s.imageUrl || s.image || '',
                    image: s.imageUrl || s.image || '',
                    cookTime: s.cookTime || 30,
                    time: parseInt(s.cookTime) || 30,
                    kcal: parseInt(s.kcal) || 350,
                    difficulty: s.difficulty || 'Healthy',
                    category: s.category || 'Cộng đồng',
                    score: 100
                });
            }
        }
    });

    // 3. Check state.favorites for any standard recipes
    if (Array.isArray(state.favorites)) {
        state.favorites.forEach(favId => {
            const alreadyInList = savedList.some(item => String(item.id) === String(favId));
            if (!alreadyInList) {
                let match = null;
                if (typeof recipesCache !== 'undefined' && Array.isArray(recipesCache)) {
                    match = recipesCache.find(r => String(r.id) === String(favId));
                }
                if (!match && typeof recipes !== 'undefined' && Array.isArray(recipes)) {
                    match = recipes.find(r => String(r.id) === String(favId));
                }
                if (match) {
                    savedList.push({
                        id: match.id,
                        title: match.title || match.name,
                        name: match.title || match.name,
                        imageUrl: match.imageUrl || match.image || '',
                        image: match.imageUrl || match.image || '',
                        cookTime: match.cookTime || match.time || 30,
                        time: match.cookTime || match.time || 30,
                        kcal: match.kcal || 350,
                        difficulty: match.difficulty || 'Dễ',
                        category: match.category || 'Món chính',
                        score: typeof recipeScore === 'function' ? recipeScore(match) : 90
                    });
                }
            }
        });
    }

    if (!savedList.length) {
        grid.innerHTML = '';
        if (empty) empty.style.display = 'block';
        return;
    }

    if (empty) empty.style.display = 'none';

    grid.innerHTML = savedList.map(function(r) {
        const kcalStr = r.kcal ? `<span>🔥 ${r.kcal} kcal</span>` : '';
        const timeStr = r.cookTime ? `<span>⏱ ${r.cookTime}′</span>` : '';
        const imgEl = r.imageUrl || r.image
            ? `<img class="recipe-image" src="${escapeHtml(r.imageUrl || r.image)}" alt="${escapeHtml(r.title || r.name)}" loading="lazy" onerror="this.outerHTML='<div class=\\'recipe-image recipe-image-emoji\\'>${recipeEmoji(r)}</div>'">`
            : `<div class="recipe-image recipe-image-emoji">${recipeEmoji(r)}</div>`;

        return `
            <article class="recipe-card" data-open-fav="${r.id}" style="cursor:pointer;">
                <div class="recipe-image-wrap">
                    ${imgEl}
                    <span class="recipe-match">${r.score || 95}% phù hợp</span>
                    <button type="button" class="favorite-button active" data-fav-toggle="${r.id}" title="Bỏ lưu khỏi yêu thích">
                        ♥
                    </button>
                </div>
                <div class="recipe-body">
                    <h3 class="recipe-title">${escapeHtml(r.title || r.name)}</h3>
                    <div class="recipe-meta">
                        ${timeStr}
                        ${kcalStr}
                        <span>📊 ${escapeHtml(r.difficulty || 'Dễ nấu')}</span>
                    </div>
                </div>
            </article>
        `;
    }).join('');

    // Wire clicks to open recipe detail
    grid.querySelectorAll('[data-open-fav]').forEach(card => {
        card.addEventListener('click', function(e) {
            if (e.target.closest('.favorite-button')) return;
            const id = card.getAttribute('data-open-fav');
            if (id) openRecipeDetail(id);
        });
    });

    // Wire favorite removal
    grid.querySelectorAll('[data-fav-toggle]').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const id = btn.getAttribute('data-fav-toggle');
            if (id) toggleFavorite(id);
        });
    });
}


/* =========================================================
   RECIPE DETAIL
========================================================= */

let activeRecipeContext =
    null;


let cookingState = {

    recipeId:
        null,

    stepIndex:
        0
};


function getRecipeById(id) {

    return recipes.find(
        recipe =>
            recipe.id ===
            Number(id)
    );
}


function openRecipeModalQuick(id) {

    const recipe =
        getRecipeById(
            id
        );


    if (!recipe) {
        return;
    }


    closeOtherModals(
        "recipeModal"
    );


    activeRecipeContext = {

        id:
        recipe.id,

        name:
        recipe.name,

        ingredients:
            [...recipe.ingredients],

        steps:
            [...recipe.steps],

        kcal:
        recipe.kcal,

        time:
        recipe.time,

        difficulty:
        recipe.difficulty
    };


    const missing =
        recipe.ingredients.filter(
            ingredient =>
                !hasIngredientInFridge(
                    ingredient
                )
        );

    showRecipeDetail(recipe);
}



function scaleIngredientText(text, scaleFactor) {
    if (!text || scaleFactor === 1) return text;
    return text.replace(/(\d+(?:\.\d+)?)/g, function (match) {
        const val = parseFloat(match) * scaleFactor;
        return val % 1 === 0 ? val : (Math.round(val * 10) / 10);
    });
}

let currentRecipeDetailServings = 2;

function showRecipeDetail(recipe, customServings) {
    if (!recipe) return;
    const baseServings = recipe.servings || 2;
    currentRecipeDetailServings = customServings || currentRecipeDetailServings || baseServings;
    if (currentRecipeDetailServings < 1) currentRecipeDetailServings = 1;
    const scaleFactor = currentRecipeDetailServings / baseServings;

    const scaledKcal = Math.round((recipe.kcal || 350) * scaleFactor);
    const scaledIngredients = (recipe.ingredients || []).map(function(ing) { return scaleIngredientText(ing, scaleFactor); });
    const missing = scaledIngredients.filter(function(ing) { return !hasIngredientInFridge(ing); });

    setText("recipeModalTitle", recipe.name);

    const body = document.getElementById("recipeModalBody");
    if (!body) return;

    body.innerHTML = `
        <div class="recipe-detail-v2">
            <div class="recipe-detail-hero">
                <img src="${recipe.image}" alt="${recipe.name}" class="recipe-detail-main-image">
                <div class="recipe-detail-floating">
                    <span>✦ ${recipeScore(recipe)}% phù hợp</span>
                </div>
            </div>

            <div class="recipe-detail-summary">
                <div class="recipe-main-info">
                    <span class="page-eyebrow">CÔNG THỨC FOOD X</span>
                    <h2>${recipe.name}</h2>
                    <p>Công thức được xếp hạng dựa trên tủ lạnh và hồ sơ dinh dưỡng.</p>
                </div>

                <div class="recipe-quick-stats">
                    <div>
                        <span>🔥 Năng lượng</span>
                        <strong>${scaledKcal} kcal</strong>
                    </div>
                    <div>
                        <span>◷ Thời gian</span>
                        <strong>${recipe.time} phút</strong>
                    </div>
                    <div>
                        <span>◉ Độ khó</span>
                        <strong>${recipe.difficulty}</strong>
                    </div>
                </div>
            </div>

            <section class="recipe-v2-section">
                <div class="recipe-v2-section-heading">
                    <div>
                        <span class="recipe-section-number">01</span>
                        <div>
                            <h3>Nguyên liệu cần có</h3>
                            <p>Đã tự động tính theo khẩu phần ${currentRecipeDetailServings} người ăn.</p>
                        </div>
                    </div>
                </div>

                <!-- SERVING SIZE MULTIPLIER -->
                <div class="recipe-servings-bar" style="display:flex;align-items:center;justify-content:space-between;background:var(--bg);padding:10px 14px;border-radius:12px;margin:10px 0 14px 0;border:1px solid var(--border);">
                    <span style="font-weight:700;font-size:13px;color:var(--text);display:flex;align-items:center;gap:6px;">⚖️ Điều chỉnh khẩu phần:</span>
                    <div style="display:flex;align-items:center;gap:10px;">
                        <button type="button" class="stepper-btn" id="servingsDecBtn" style="width:30px;height:30px;border-radius:50%;border:1px solid var(--border);background:var(--card);font-weight:bold;cursor:pointer;font-size:14px;">−</button>
                        <span id="servingsCountText" style="font-weight:800;font-size:14px;color:var(--green);min-width:64px;text-align:center;">${currentRecipeDetailServings} người</span>
                        <button type="button" class="stepper-btn" id="servingsIncBtn" style="width:30px;height:30px;border-radius:50%;border:1px solid var(--border);background:var(--card);font-weight:bold;cursor:pointer;font-size:14px;">+</button>
                    </div>
                </div>

                <div class="ingredient-check-list">
                    ${scaledIngredients.map(function(ingredient) {
                        const available = hasIngredientInFridge(ingredient);
                        return `
                            <div class="recipe-ingredient-row ${available ? "available" : "missing"}">
                                <div class="ingredient-check-icon">${available ? "✓" : "!"}</div>
                                <span>${ingredient}</span>
                                <strong>${available ? "Đã có" : "Còn thiếu"}</strong>
                            </div>
                        `;
                    }).join("")}
                </div>

                ${missing.length ? `
                    <button type="button" class="secondary-button missing-shopping-button" data-action="add-missing" data-recipe="${recipe.id}">
                        🛒 Thêm ${missing.length} nguyên liệu thiếu vào danh sách mua
                    </button>
                ` : `
                    <div class="recipe-ready-box">✓ Bạn đã có đủ nguyên liệu chính.</div>
                `}
            </section>


            </section>


            <section class="recipe-v2-section">


                <div class="recipe-v2-section-heading">


                    <div>


                        <span class="recipe-section-number">
                            02
                        </span>


                        <div>

                            <h3>
                                Các bước thực hiện
                            </h3>

                            <p>
                                Xem nhanh quy trình trước khi nấu.
                            </p>

                        </div>


                    </div>


                </div>


                <div class="recipe-step-preview">


                    ${
        recipe.steps
            .map(
                (step, index) => `

                                    <div class="preview-step">


                                        <div class="preview-step-number">

                                            ${index + 1}

                                        </div>


                                        <div>

                                            <strong>
                                                Bước ${index + 1}
                                            </strong>

                                            <p>
                                                ${step}
                                            </p>

                                        </div>


                                    </div>
                                `
            )
            .join("")
    }


                </div>


            </section>


            <div class="recipe-detail-bottom-actions">


                <button
                    type="button"
                    class="secondary-button"
                    data-action="ask-recipe-ai"
                    data-id="${recipe.id}">

                    ✦ Hỏi AI về món này

                </button>


                <button
                    type="button"
                    class="primary-button"
                    data-action="start-cooking"
                    data-id="${recipe.id}">

                    👨‍🍳 Bắt đầu nấu

                </button>


            </div>


        </div>
    `;


    document
        .getElementById(
            "recipeModal"
        )
        ?.classList
        .add("show");

    const decBtn = document.getElementById("servingsDecBtn");
    if (decBtn) {
        decBtn.addEventListener("click", function () {
            if (currentRecipeDetailServings > 1) {
                showRecipeDetail(recipe, currentRecipeDetailServings - 1);
            }
        });
    }
    const incBtn = document.getElementById("servingsIncBtn");
    if (incBtn) {
        incBtn.addEventListener("click", function () {
            if (currentRecipeDetailServings < 20) {
                showRecipeDetail(recipe, currentRecipeDetailServings + 1);
            }
        });
    }
}


/* =========================================================
   COOKING
========================================================= */

function recipeEmoji(r) {
    const t = (r.title || '').toLowerCase();
    if (t.includes('phở')) return '🍜';
    if (t.includes('gà')) return '🍗';
    if (t.includes('cơm')) return '🍚';
    if (t.includes('bánh mì')) return '🥖';
    if (t.includes('rau')) return '🥦';
    if (t.includes('canh')) return '🐟';
    if (t.includes('súp')) return '🎃';
    if (t.includes('bò')) return '🥩';
    if (t.includes('cháo')) return '🍲';
    if (t.includes('gỏi')) return '🥗';
    if (t.includes('chè')) return '🍮';
    return '🍽️';
}

function recipeMatch(r) {
    const have = (window.state && (state.fridge || [])) ? state.fridge.map(i => String(i.name || '').toLowerCase()) : [];
    if (!have.length) return 55;
    const names = (r.ingredients || []).map(i => String(i.ingredientName || '').toLowerCase());
    if (!names.length) return 70;
    const hit = names.filter(function (n) {
        return have.some(function (h) {
            return h.includes(n.split(' ')[0]) || n.includes(h.split(' ')[0]);
        });
    }).length;
    return Math.min(95, Math.round(45 + hit / names.length * 55));
}

async function loadRecipes() {
    try {
        recipesCache = await apiRequest('/api/recipes') || [];
    } catch (e) {
        recipesCache = [];
    }
    renderRecipeBrowse();
}

function handleRecipeChipClick(chipType) {
    document.querySelectorAll('.rc-chip').forEach(function (btn) {
        btn.classList.remove('active');
    });
    const activeBtn = document.querySelector('.rc-chip[data-chip="' + chipType + '"]');
    if (activeBtn) activeBtn.classList.add('active');

    const mealSlotEl = document.getElementById('recipeMealSlot');
    const speedEl = document.getElementById('recipeSpeed');
    const catEl = document.getElementById('recipeCategory');

    if (chipType === 'all') {
        if (mealSlotEl) mealSlotEl.value = '';
        if (speedEl) speedEl.value = '';
        if (catEl) catEl.value = '';
    } else if (chipType === 'morning' || chipType === 'lunch' || chipType === 'dinner') {
        if (mealSlotEl) mealSlotEl.value = chipType;
        if (speedEl) speedEl.value = '';
        if (catEl) catEl.value = '';
    } else if (chipType === 'quick') {
        if (speedEl) speedEl.value = 'quick';
        if (mealSlotEl) mealSlotEl.value = '';
    } else if (chipType === 'slow') {
        if (speedEl) speedEl.value = 'slow';
        if (mealSlotEl) mealSlotEl.value = '';
    } else if (chipType === 'eatclean') {
        if (catEl) catEl.value = 'Eat Clean';
        if (mealSlotEl) mealSlotEl.value = '';
        if (speedEl) speedEl.value = '';
    } else if (chipType === 'soup') {
        if (catEl) catEl.value = 'Canh';
        if (mealSlotEl) mealSlotEl.value = '';
        if (speedEl) speedEl.value = '';
    }

    renderRecipeBrowse();
}
window.handleRecipeChipClick = handleRecipeChipClick;

function syncRecipeChips() {
    const mealSlot = document.getElementById('recipeMealSlot')?.value || '';
    const speed = document.getElementById('recipeSpeed')?.value || '';
    const cat = document.getElementById('recipeCategory')?.value || '';

    let matchedChip = 'all';
    if (mealSlot === 'morning' || mealSlot === 'lunch' || mealSlot === 'dinner') {
        matchedChip = mealSlot;
    } else if (speed === 'quick' || speed === 'slow') {
        matchedChip = speed;
    } else if (cat.toLowerCase().includes('clean')) {
        matchedChip = 'eatclean';
    } else if (cat.toLowerCase().includes('canh')) {
        matchedChip = 'soup';
    } else if (!mealSlot && !speed && !cat) {
        matchedChip = 'all';
    } else {
        matchedChip = '';
    }

    document.querySelectorAll('.rc-chip').forEach(function (btn) {
        btn.classList.toggle('active', matchedChip && btn.getAttribute('data-chip') === matchedChip);
    });
}
window.syncRecipeChips = syncRecipeChips;

function renderRecipeBrowse() {
    const grid = document.getElementById('recipeBrowseGrid');
    if (!grid) return;

    const kw = normalize(document.getElementById('recipeSearch')?.value || '');
    const mealSlot = document.getElementById('recipeMealSlot')?.value || '';
    const speed = document.getElementById('recipeSpeed')?.value || '';
    const category = normalize(document.getElementById('recipeCategory')?.value || '');
    const difficulty = normalize(document.getElementById('recipeDifficulty')?.value || '');
    const legacyFilter = normalize(document.getElementById('recipeFilter')?.value || '');

    let list = (recipesCache || []).filter(function (r) {
        if (!r) return false;

        const titleNorm = normalize(r.title || r.name || '');
        const descNorm = normalize(r.description || '');
        const catNorm = normalize(r.category || '');
        const msNorm = normalize(r.mealSlots || '');
        const diffNorm = normalize(r.difficulty || '');
        const cookTime = parseInt(r.cookTime || r.time) || 30;

        // 1. Lọc theo tên món, mô tả, hoặc nguyên liệu
        if (kw) {
            let ingsNorm = '';
            if (Array.isArray(r.ingredients)) {
                ingsNorm = r.ingredients.map(function (i) {
                    return normalize(i.ingredientName || i.name || (typeof i === 'string' ? i : ''));
                }).join(' ');
            }
            const matchKw = titleNorm.includes(kw) || descNorm.includes(kw) || ingsNorm.includes(kw);
            if (!matchKw) return false;
        }

        // 2. Lọc theo Bữa ăn (Sáng / Trưa / Tối / Ăn nhẹ)
        if (mealSlot) {
            if (mealSlot === 'morning') {
                const isMorning = msNorm.includes('morning') || msNorm.includes('sang')
                    || catNorm.includes('sang') || catNorm.includes('breakfast')
                    || titleNorm.includes('pho') || titleNorm.includes('banh mi') || titleNorm.includes('chao')
                    || titleNorm.includes('hu tieu') || titleNorm.includes('yen mach') || titleNorm.includes('banh cuon') || titleNorm.includes('xoi');
                if (!isMorning) return false;
            } else if (mealSlot === 'lunch') {
                const isLunch = msNorm.includes('lunch') || msNorm.includes('trua')
                    || catNorm.includes('trua') || catNorm.includes('chinh')
                    || titleNorm.includes('com') || titleNorm.includes('bun') || titleNorm.includes('mi y')
                    || titleNorm.includes('suon') || titleNorm.includes('bo luc lac') || titleNorm.includes('thit') || titleNorm.includes('ga');
                if (!isLunch) return false;
            } else if (mealSlot === 'dinner') {
                const isDinner = msNorm.includes('dinner') || msNorm.includes('toi')
                    || catNorm.includes('toi') || catNorm.includes('chinh') || catNorm.includes('canh') || catNorm.includes('kho')
                    || titleNorm.includes('canh') || titleNorm.includes('kho') || titleNorm.includes('hap')
                    || titleNorm.includes('ham') || titleNorm.includes('xao') || titleNorm.includes('salad') || titleNorm.includes('ca hoi') || titleNorm.includes('dau hu');
                if (!isDinner) return false;
            } else if (mealSlot === 'snack') {
                const isSnack = msNorm.includes('snack') || msNorm.includes('phu') || msNorm.includes('vat')
                    || catNorm.includes('vat') || catNorm.includes('nhe') || catNorm.includes('trang mieng');
                if (!isSnack) return false;
            }
        }

        // 3. Lọc theo Tốc độ nấu / Thời gian (Ăn nhanh, Vừa phải, Nấu kỹ - Ăn chậm)
        if (speed) {
            if (speed === 'quick') {
                // Ăn nhanh: ≤ 20 phút
                if (cookTime > 20) return false;
            } else if (speed === 'medium') {
                // Vừa phải: 21 - 35 phút
                if (cookTime <= 20 || cookTime > 35) return false;
            } else if (speed === 'slow') {
                // Nấu kỹ / Ăn chậm: > 35 phút
                if (cookTime <= 35) return false;
            }
        }

        // 4. Lọc theo Danh mục
        if (category) {
            if (category.includes('canh') || category.includes('nuoc')) {
                const isSoup = catNorm.includes('canh') || catNorm.includes('nuoc') || catNorm.includes('sup')
                    || titleNorm.includes('canh') || titleNorm.includes('sup') || titleNorm.includes('pho')
                    || titleNorm.includes('bun') || titleNorm.includes('hu tieu');
                if (!isSoup) return false;
            } else if (category.includes('eat clean') || category.includes('clean') || category.includes('healthy')) {
                const isClean = catNorm.includes('clean') || catNorm.includes('healthy')
                    || descNorm.includes('clean') || descNorm.includes('giam can') || descNorm.includes('chất xơ')
                    || titleNorm.includes('uc ga') || titleNorm.includes('yen mach') || titleNorm.includes('salad');
                if (!isClean) return false;
            } else if (category.includes('sang')) {
                if (!catNorm.includes('sang') && !msNorm.includes('morning') && !titleNorm.includes('banh mi') && !titleNorm.includes('pho')) return false;
            } else if (category.includes('chinh')) {
                if (!catNorm.includes('chinh') && !msNorm.includes('lunch') && !msNorm.includes('dinner') && !titleNorm.includes('com') && !titleNorm.includes('kho')) return false;
            } else {
                if (!catNorm.includes(category) && !titleNorm.includes(category)) return false;
            }
        }

        // 5. Lọc theo Độ khó
        if (difficulty) {
            if (!diffNorm.includes(difficulty)) return false;
        }

        // 6. Legacy Filter
        if (legacyFilter) {
            if (!catNorm.includes(legacyFilter)) return false;
        }

        return true;
    });

    if (!list.length) {
        grid.innerHTML = '<div class="social-empty" style="grid-column: 1/-1; text-align: center; padding: 40px 20px; border: 1px dashed var(--border); border-radius: 12px; background: var(--bg);">' +
            '<div style="font-size: 36px; margin-bottom: 8px;">🍽</div>' +
            '<strong style="font-size: 15px; color: var(--text); display: block; margin-bottom: 4px;">Không tìm thấy công thức phù hợp</strong>' +
            '<span style="font-size: 13px; color: var(--text-soft);">Hãy thử từ khoá khác hoặc đổi bộ lọc (bữa sáng/trưa/tối, ăn nhanh/chậm...).</span>' +
            '</div>';
        return;
    }

    grid.innerHTML = list.map(function (r) {
        const pct = recipeMatch(r);
        const kcal = r.kcal ? r.kcal + ' kcal' : '';
        const imgUrl = r.imageUrl || r.image;
        const imgHtml = (imgUrl && String(imgUrl).trim() && !String(imgUrl).includes('default-recipe.jpg'))
            ? '<img class="recipe-image" src="' + escapeHtml(imgUrl) + '" alt="' + escapeHtml(r.title) + '" loading="lazy" onerror="this.outerHTML=\'<div class=\\\'recipe-image recipe-image-emoji\\\'>' + recipeEmoji(r) + '</div>\'">'
            : '<div class="recipe-image recipe-image-emoji">' + recipeEmoji(r) + '</div>';

        const cookTime = parseInt(r.cookTime || r.time) || 30;
        let speedBadge = '';
        if (cookTime <= 20) {
            speedBadge = '<span style="background: rgba(34,197,94,0.15); color: #16a34a; font-size: 11px; font-weight: 700; padding: 2px 6px; border-radius: 6px;">⚡ Nhanh ' + cookTime + '′</span>';
        } else if (cookTime > 35) {
            speedBadge = '<span style="background: rgba(234,88,12,0.15); color: #ea580c; font-size: 11px; font-weight: 700; padding: 2px 6px; border-radius: 6px;">🥘 Nấu kỹ ' + cookTime + '′</span>';
        } else {
            speedBadge = '<span style="font-size: 12px; color: var(--text-soft);">⏱ ' + cookTime + '′</span>';
        }

        return '<div class="recipe-card browse-card" data-rid="' + r.id + '">' +
            '<div class="recipe-image-wrap">' + imgHtml +
            '<span class="recipe-match">' + pct + '% khớp</span></div>' +
            '<div class="recipe-body"><div class="recipe-title">' + escapeHtml(r.title) + '</div>' +
            '<div class="recipe-meta" style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">' +
            speedBadge +
            (kcal ? '<span>🔥 ' + kcal + '</span>' : '') +
            '<span>📊 ' + escapeHtml(r.difficulty || 'Dễ') + '</span>' +
            '</div></div></div>';
    }).join('');

    document.querySelectorAll('.browse-card').forEach(function (c) {
        c.addEventListener('click', function () { openRecipeDetail(+c.getAttribute('data-rid')); });
    });
}

async function openRecipeDetail(id) {
    if (!id) return;
    curRecipe = null;

    // Check in savedPostsState / allSocialPostsCache / communityFeedPosts / sampleBlogPosts
    const savedPosts = JSON.parse(localStorage.getItem('foodx_saved_posts') || '{}');
    let socialMatch = savedPosts[String(id)] || null;
    if (!socialMatch && typeof allSocialPostsCache !== 'undefined' && Array.isArray(allSocialPostsCache)) {
        socialMatch = allSocialPostsCache.find(p => String(p.id) === String(id) || (p.title && String(p.title) === String(id)));
    }
    if (!socialMatch && typeof communityFeedPosts !== 'undefined' && Array.isArray(communityFeedPosts)) {
        socialMatch = communityFeedPosts.find(p => String(p.id) === String(id) || (p.title && String(p.title) === String(id)));
    }
    if (!socialMatch && typeof sampleBlogPosts !== 'undefined' && Array.isArray(sampleBlogPosts)) {
        socialMatch = sampleBlogPosts.find(p => String(p.id) === String(id) || (p.title && String(p.title) === String(id)));
    }

    if (socialMatch && (!socialMatch.ingredients || !socialMatch.ingredients.length)) {
        const fullPost = (typeof allSocialPostsCache !== 'undefined' && (allSocialPostsCache || []).find(p => String(p.id) === String(id)))
            || (typeof communityFeedPosts !== 'undefined' && (communityFeedPosts || []).find(p => String(p.id) === String(id)));
        if (fullPost) {
            socialMatch.ingredients = fullPost.ingredients || [];
            if (!socialMatch.instructions) socialMatch.instructions = fullPost.instructions || '';
            if (!socialMatch.steps) socialMatch.steps = fullPost.steps || [];
        }
    }

    if (socialMatch) {
        curRecipe = {
            id: socialMatch.id,
            title: socialMatch.title,
            name: socialMatch.title,
            description: socialMatch.description || '',
            cookTime: socialMatch.cookTime || '30',
            time: parseInt(socialMatch.cookTime) || 30,
            kcal: parseInt(socialMatch.kcal) || 350,
            servings: socialMatch.servings || 2,
            difficulty: socialMatch.difficulty || (socialMatch.category === 'eatclean' ? 'Healthy' : 'Dễ nấu'),
            category: socialMatch.category || 'Món chính',
            imageUrl: socialMatch.imageUrl || socialMatch.image || '',
            ingredients: normalizeIngredientList(socialMatch.ingredients),
            instructions: socialMatch.instructions || (Array.isArray(socialMatch.steps) ? socialMatch.steps.join('\n') : (socialMatch.description || '')),
            steps: Array.isArray(socialMatch.steps)
                ? socialMatch.steps
                : (socialMatch.instructions ? String(socialMatch.instructions).split('\n').filter(Boolean) : [socialMatch.description || 'Sơ chế và nấu theo khẩu vị'])
        };
    } else {
        try {
            curRecipe = await apiRequest('/api/recipes/' + id);
        } catch (e) {
            curRecipe = (recipesCache || []).find(r => r.id === Number(id) || String(r.id) === String(id))
                || (typeof recipes !== 'undefined' ? recipes.find(r => r.id === Number(id) || String(r.id) === String(id)) : null);
        }
        if (curRecipe && curRecipe.ingredients) {
            curRecipe.ingredients = normalizeIngredientList(curRecipe.ingredients);
        }
    }

    if (!curRecipe) {
        showToast('Không tìm thấy thông tin công thức.', 'warning');
        return;
    }

    if (!curRecipe.name && curRecipe.title) curRecipe.name = curRecipe.title;
    if (!curRecipe.title && curRecipe.name) curRecipe.title = curRecipe.name;
    if (!curRecipe.time && curRecipe.cookTime) curRecipe.time = curRecipe.cookTime;
    if (!curRecipe.cookTime && curRecipe.time) curRecipe.cookTime = curRecipe.time;
    if (curRecipe.ingredients) {
        curRecipe.ingredients = normalizeIngredientList(curRecipe.ingredients);
    }

    curRecipe.baseServings = parseInt(curRecipe.servings) || 4;
    curRecipe.currentServings = curRecipe.baseServings;
    curRecipe.baseKcal = parseInt(curRecipe.kcal) || 0;
    curRecipe.baseProtein = parseFloat(curRecipe.protein) || 0;
    curRecipe.baseCarb = parseFloat(curRecipe.carb) || 0;
    curRecipe.baseFat = parseFloat(curRecipe.fat) || 0;

    activeRecipeContext = {
        id: curRecipe.id,
        name: curRecipe.title || curRecipe.name,
        ingredients: Array.isArray(curRecipe.ingredients)
            ? curRecipe.ingredients.map(i => i.ingredientName || i.name || i)
            : [],
        steps: Array.isArray(curRecipe.steps)
            ? [...curRecipe.steps]
            : String(curRecipe.instructions || '').split('\n').filter(Boolean),
        kcal: curRecipe.kcal || 350,
        time: curRecipe.cookTime || curRecipe.time || 30,
        difficulty: curRecipe.difficulty || 'Dễ'
    };

    renderRecipeDetail();
    openView('recipe');
}
window.openRecipeDetail = openRecipeDetail;

function setRecipeServings(servings) {
    if (!curRecipe) return;
    const targetServings = parseInt(servings) || 4;
    curRecipe.currentServings = targetServings;
    renderRecipeDetail();
}
window.setRecipeServings = setRecipeServings;


async function toggleSaveRecipe() {
    if (!curRecipe) return;
    if (!isUserLoggedIn()) {
        requireAuth('save');
        return;
    }
    const idKey = String(curRecipe.id);
    const wasSaved = !!savedPostsState[idKey];
    const newSaved = !wasSaved;

    // Save locally into user's collection
    if (newSaved) {
        savedPostsState[idKey] = {
            id: curRecipe.id,
            title: curRecipe.title || curRecipe.name,
            imageUrl: curRecipe.imageUrl || curRecipe.image,
            cookTime: curRecipe.cookTime || curRecipe.time,
            kcal: curRecipe.kcal,
            description: curRecipe.description,
            ingredients: curRecipe.ingredients,
            instructions: curRecipe.instructions,
            savedAt: new Date().toISOString()
        };
        if (!state.favorites.some(x => String(x) === idKey)) {
            state.favorites.push(curRecipe.id);
        }
    } else {
        delete savedPostsState[idKey];
        state.favorites = state.favorites.filter(x => String(x) !== idKey);
    }
    localStorage.setItem('foodx_saved_posts', JSON.stringify(savedPostsState));
    saveState();

    // Try API save if numeric ID
    if (typeof curRecipe.id === 'number' || (!isNaN(+curRecipe.id) && !String(curRecipe.id).startsWith('c'))) {
        try {
            await apiRequest('/api/recipes/' + curRecipe.id + '/save', { method: 'POST' });
        } catch (_) {}
    }

    const saveBtn = document.getElementById('rdSave');
    if (saveBtn) saveBtn.innerHTML = newSaved ? '❤️ Đã lưu vào công thức của tôi' : '🤍 Lưu món';
    
    // Sync matching post cards if present
    const cardSaveBtn = document.querySelector('[data-save="' + curRecipe.id + '"]');
    if (cardSaveBtn) {
        cardSaveBtn.classList.toggle('saved-active', newSaved);
        cardSaveBtn.innerHTML = newSaved ? '🔖 Đã lưu' : '🤍 Lưu món';
    }

    if (typeof renderFavorites === 'function') renderFavorites();
    showToast(newSaved ? 'Đã lưu công thức vào bộ sưu tập của bạn! 🎉' : 'Đã bỏ lưu món.', 'success');
}

function addCurToPlan() {
    if (!curRecipe) return;
    if (!isUserLoggedIn()) {
        requireAuth('plan');
        return;
    }
    openView('plan');
    setTimeout(function () {
        openAddMeal(d2s(new Date()), 'lunch');
        const rSel = document.getElementById('paRecipe');
        if (rSel) rSel.value = String(curRecipe.id);
    }, 250);
}

function updateRcImagePreview(url, statusText) {
    const wrap = document.getElementById('rcImagePreviewWrap');
    const preview = document.getElementById('rcImagePreview');
    const status = document.getElementById('rcImageStatus');
    if (wrap && preview) {
        preview.src = url;
        preview.onerror = function () {
            if (status) status.textContent = '⚠️ Không thể tải trước ảnh';
        };
        if (status && statusText) status.textContent = statusText;
        wrap.style.display = 'flex';
    }
}

function openRecipeCreateModal() {
    // Tạo/chia sẻ công thức cần tài khoản — chặn sớm thay vì để submit thất bại 401
    if (!isUserLoggedIn()) {
        requireAuth('recipe');
        return;
    }
    if (!recipeCreateModal) {
        recipeCreateModal = document.createElement('div');
        recipeCreateModal.className = 'modal-overlay';
        recipeCreateModal.id = 'recipeCreateModal';
        recipeCreateModal.innerHTML =
            '<div class="modal">' +
            '<div class="modal-header"><h3>➕ Thêm công thức mới</h3><button class="modal-close" data-rc-close="1" aria-label="Đóng">✕</button></div>' +
            '<div class="rc-form">' +
            '<label class="field"><span>Tên món *</span><input type="text" id="rcTitle" placeholder="vd: Cá kho tộ"></label>' +
            '<label class="field"><span>Mô tả</span><textarea id="rcDesc" rows="2" placeholder="Mô tả ngắn..."></textarea></label>' +
            '<div class="rc-row">' +
            '<label class="field"><span>Thời gian (phút)</span><input type="number" id="rcTime" value="30" min="1"></label>' +
            '<label class="field"><span>Khẩu phần</span><input type="number" id="rcServe" value="2" min="1"></label>' +
            '<label class="field"><span>Calo</span><input type="number" id="rcKcal" value="300" min="0"></label>' +
            '</div>' +
            '<div class="field">' +
            '<span>Hình ảnh món ăn</span>' +
            '<div style="display: flex; gap: 8px; margin-bottom: 8px;">' +
            '<input type="text" id="rcImageUrl" placeholder="Link ảnh hoặc để trống để tự tìm..." style="flex:1;">' +
            '<button type="button" class="secondary-button" id="rcBtnSearchImg" title="Tự động tìm kiếm ảnh trên mạng" style="white-space:nowrap;font-size:12px;padding:0 12px;">🔍 Tìm ảnh</button>' +
            '<label class="secondary-button" style="white-space:nowrap;font-size:12px;padding:0 12px;cursor:pointer;display:inline-flex;align-items:center;margin:0;">' +
            '📁 Tải ảnh <input type="file" id="rcImageFile" accept="image/*" style="display:none;">' +
            '</label>' +
            '</div>' +
            '<div id="rcImagePreviewWrap" style="display:none;align-items:center;gap:10px;margin-bottom:8px;padding:8px;border:1px solid var(--border);border-radius:10px;background:var(--bg);">' +
            '<img id="rcImagePreview" src="" alt="Preview" style="width:60px;height:60px;object-fit:cover;border-radius:8px;">' +
            '<div style="flex:1;font-size:12px;color:var(--text-soft);" id="rcImageStatus">Đã chọn ảnh</div>' +
            '<button type="button" class="secondary-button" id="rcRemoveImg" style="padding:4px 8px;font-size:11px;">✕ Bỏ ảnh</button>' +
            '</div>' +
            '</div>' +
            '<label class="field"><span>Nguyên liệu (mỗi dòng 1 nguyên liệu)</span><textarea id="rcIngs" rows="3" placeholder="Thịt cá 500 g&#10;Hành lá 2 nhánh"></textarea></label>' +
            '<label class="field"><span>Các bước (mỗi dòng 1 bước)</span><textarea id="rcSteps" rows="4" placeholder="Sơ chế cá...&#10;Kho cá trong 20 phút..."></textarea></label>' +
            '<div class="modal-actions"><button class="secondary-button" data-rc-close="1">Huỷ</button>' +
            '<button class="primary-button" id="rcSubmit">Lưu công thức</button></div>' +
            '</div></div>';
        document.body.appendChild(recipeCreateModal);
        recipeCreateModal.querySelectorAll('[data-rc-close]').forEach(function (b) {
            b.addEventListener('click', function () { recipeCreateModal.classList.remove('open'); });
        });
        recipeCreateModal.addEventListener('click', function (e) { if (e.target === recipeCreateModal) recipeCreateModal.classList.remove('open'); });
        document.getElementById('rcSubmit').addEventListener('click', submitNewRecipe);

        // Auto search image button
        document.getElementById('rcBtnSearchImg').addEventListener('click', async function () {
            const title = document.getElementById('rcTitle').value.trim();
            if (!title) {
                showToast('Vui lòng nhập tên món trước khi tìm ảnh.', 'warning');
                document.getElementById('rcTitle').focus();
                return;
            }
            const btn = this;
            const origText = btn.innerHTML;
            btn.innerHTML = '⏳...';
            btn.disabled = true;
            try {
                const res = await apiRequest('/api/recipes/search-image?query=' + encodeURIComponent(title));
                if (res && res.data && res.data.imageUrl) {
                    const imgUrl = res.data.imageUrl;
                    document.getElementById('rcImageUrl').value = imgUrl;
                    updateRcImagePreview(imgUrl, '✓ Đã tìm thấy ảnh từ mạng');
                    showToast('Đã tìm thấy ảnh món ăn! 🖼', 'success');
                } else {
                    showToast('Không tìm thấy ảnh phù hợp cho món này.', 'info');
                }
            } catch (err) {
                console.error(err);
                showToast('Lỗi khi tìm ảnh: ' + (err.message || 'Lỗi mạng'), 'error');
            } finally {
                btn.innerHTML = origText;
                btn.disabled = false;
            }
        });

        // File upload
        document.getElementById('rcImageFile').addEventListener('change', async function () {
            const file = this.files[0];
            if (!file) return;
            const formData = new FormData();
            formData.append('file', file);
            const statusEl = document.getElementById('rcImageStatus');
            if (statusEl) statusEl.textContent = '⏳ Đang tải ảnh lên...';
            const previewWrap = document.getElementById('rcImagePreviewWrap');
            if (previewWrap) previewWrap.style.display = 'flex';

            try {
                const token = typeof getAuthToken === 'function' ? getAuthToken() : (localStorage.getItem('foodx_token') || '');
                const headers = {};
                if (token) headers['Authorization'] = 'Bearer ' + token;
                const resp = await fetch('/api/upload', {
                    method: 'POST',
                    headers: headers,
                    body: formData
                });
                const json = await resp.json();
                if (resp.ok && json.url) {
                    document.getElementById('rcImageUrl').value = json.url;
                    updateRcImagePreview(json.url, '✓ Đã tải ảnh lên thành công');
                    showToast('Đã tải ảnh lên thành công! 📸', 'success');
                } else {
                    throw new Error(json.error || 'Lỗi tải ảnh');
                }
            } catch (err) {
                console.error(err);
                showToast('Không thể tải ảnh: ' + (err.message || 'Lỗi mạng'), 'error');
                if (statusEl) statusEl.textContent = '⚠️ Lỗi tải ảnh';
            }
        });

        // Manual URL input change
        document.getElementById('rcImageUrl').addEventListener('input', function () {
            const val = this.value.trim();
            if (val) {
                updateRcImagePreview(val, 'Ảnh từ liên kết');
            } else {
                const wrap = document.getElementById('rcImagePreviewWrap');
                if (wrap) wrap.style.display = 'none';
            }
        });

        // Remove image
        document.getElementById('rcRemoveImg').addEventListener('click', function () {
            document.getElementById('rcImageUrl').value = '';
            document.getElementById('rcImageFile').value = '';
            const wrap = document.getElementById('rcImagePreviewWrap');
            if (wrap) wrap.style.display = 'none';
        });

        // Auto search image when title is blurred if image URL is empty
        document.getElementById('rcTitle').addEventListener('blur', async function () {
            const title = this.value.trim();
            const currentImg = document.getElementById('rcImageUrl').value.trim();
            if (title && !currentImg) {
                try {
                    const res = await apiRequest('/api/recipes/search-image?query=' + encodeURIComponent(title));
                    if (res && res.data && res.data.imageUrl && !document.getElementById('rcImageUrl').value.trim()) {
                        const imgUrl = res.data.imageUrl;
                        document.getElementById('rcImageUrl').value = imgUrl;
                        updateRcImagePreview(imgUrl, '✓ Tự động tìm thấy ảnh');
                    }
                } catch (_) {}
            }
        });
    }

    // Reset fields on open
    document.getElementById('rcTitle').value = '';
    document.getElementById('rcDesc').value = '';
    document.getElementById('rcTime').value = '30';
    document.getElementById('rcServe').value = '2';
    document.getElementById('rcKcal').value = '300';
    document.getElementById('rcImageUrl').value = '';
    document.getElementById('rcImageFile').value = '';
    document.getElementById('rcIngs').value = '';
    document.getElementById('rcSteps').value = '';
    const wrap = document.getElementById('rcImagePreviewWrap');
    if (wrap) wrap.style.display = 'none';

    recipeCreateModal.classList.add('open');
    setTimeout(function () { const t = document.getElementById('rcTitle'); if (t) t.focus(); }, 80);
}
window.openRecipeCreateModal = openRecipeCreateModal;

async function submitNewRecipe() {
    const title = document.getElementById('rcTitle').value.trim();
    if (!title) { showToast('Vui lòng nhập tên món.', 'warning'); return; }
    const ings = document.getElementById('rcIngs').value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
    const imageUrl = document.getElementById('rcImageUrl')?.value?.trim() || '';
    const btn = document.getElementById('rcSubmit');
    if (btn) btn.disabled = true;
    try {
        await apiRequest('/api/recipes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: title,
                description: document.getElementById('rcDesc').value.trim(),
                cookTime: +document.getElementById('rcTime').value || 30,
                servings: +document.getElementById('rcServe').value || 2,
                kcal: +document.getElementById('rcKcal').value || 0,
                category: 'Món chính',
                difficulty: 'Dễ',
                imageUrl: imageUrl,
                instructions: document.getElementById('rcSteps').value.trim(),
                ingredients: ings.map(function (s) {
                    const parts = s.split(/\s+/);
                    const name = parts[0] || s;
                    return { ingredientName: name, quantity: null, unit: parts.slice(1).join(' '), note: null };
                })
            })
        });
        if (recipeCreateModal) recipeCreateModal.classList.remove('open');
        showToast('Đã thêm công thức mới! 🎉', 'success');
        loadRecipes();
    } catch (e) {
        showToast('Cần đăng nhập để tạo công thức.', 'error');
    } finally {
        if (btn) btn.disabled = false;
    }
}


/* =========================================================
   HOME BLOG RECIPE SECTION RENDERER
========================================================= */

/* ===== Blog "Món hay" — dữ liệu THẬT từ kho công thức (không còn bài/blog demo giả) ===== */
let homeBlogRecipesCache = null;
const BLOG_CAT_META = [
    { key: 'sang',     cat: 'Món sáng',        label: '🥣 Món sáng' },
    { key: 'family',   cat: 'Món chính',       label: '🍚 Món chính' },
    { key: 'eatclean', cat: 'Món ăn kiêng',    label: '🥗 Món ăn kiêng' },
    { key: 'quick',    cat: 'Món nhanh',       label: '⚡ Món nhanh' },
    { key: 'dessert',  cat: 'Món tráng miệng', label: '🍰 Món tráng miệng' }
];


// Module window exports
if (typeof window !== 'undefined') window.hasIngredientInFridge = hasIngredientInFridge;
if (typeof window !== 'undefined') window.isRecipeSafeForProfile = isRecipeSafeForProfile;
if (typeof window !== 'undefined') window.recipeScore = recipeScore;
if (typeof window !== 'undefined') window.suggestedRecipes = suggestedRecipes;
if (typeof window !== 'undefined') window.scoreRecipeWithSelected = scoreRecipeWithSelected;
if (typeof window !== 'undefined') window.recipeCard = recipeCard;
if (typeof window !== 'undefined') window.renderRecipes = renderRecipes;
if (typeof window !== 'undefined') window.openSelectedAISuggestions = openSelectedAISuggestions;
if (typeof window !== 'undefined') window.toggleFavorite = toggleFavorite;
if (typeof window !== 'undefined') window.renderFavorites = renderFavorites;
if (typeof window !== 'undefined') window.getRecipeById = getRecipeById;
if (typeof window !== 'undefined') window.openRecipeModalQuick = openRecipeModalQuick;
if (typeof window !== 'undefined') window.scaleIngredientText = scaleIngredientText;
if (typeof window !== 'undefined') window.showRecipeDetail = showRecipeDetail;
if (typeof window !== 'undefined') window.recipeEmoji = recipeEmoji;
if (typeof window !== 'undefined') window.recipeMatch = recipeMatch;
if (typeof window !== 'undefined') window.loadRecipes = loadRecipes;
if (typeof window !== 'undefined') window.renderRecipeBrowse = renderRecipeBrowse;
if (typeof window !== 'undefined') window.toggleSaveRecipe = toggleSaveRecipe;
if (typeof window !== 'undefined') window.addCurToPlan = addCurToPlan;
if (typeof window !== 'undefined') window.updateRcImagePreview = updateRcImagePreview;
if (typeof window !== 'undefined') window.submitNewRecipe = submitNewRecipe;
