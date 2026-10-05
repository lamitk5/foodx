/**
 * FoodX module: recipes.js
 * Cong thuc: danh sach, chi tiet, yeu thich, che do nau.
 * Cat tu app.js, van dung bien toan cuc de index.html goi duoc.
 */
/* =========================================================
   RECIPES (VIETNAMESE RECIPES - MOCK DATA)
========================================================= */

const VIETNAMESE_RECIPES = [
  {
    id: "rec-01",
    title: "Phở bò tái Hà Nội",
    category: "mon-sang",
    cookTime: 45,
    calories: 450,
    imageUrl: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "rec-02",
    title: "Cơm chiên trứng kiểu Việt",
    category: "nau-nhanh",
    cookTime: 15,
    calories: 380,
    imageUrl: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "rec-03",
    title: "Gà kho gừng sả ớt",
    category: "mon-an-gia-dinh",
    cookTime: 30,
    calories: 420,
    imageUrl: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "rec-04",
    title: "Thịt kho tàu nước dừa",
    category: "mon-an-gia-dinh",
    cookTime: 50,
    calories: 520,
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "rec-05",
    title: "Bún chả Hà Nội",
    category: "mon-sang",
    cookTime: 40,
    calories: 480,
    imageUrl: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "rec-06",
    title: "Nem rán truyền thống",
    category: "mon-an-gia-dinh",
    cookTime: 35,
    calories: 410,
    imageUrl: "https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "rec-07",
    title: "Cá hồi áp chảo măng tây",
    category: "eat-clean",
    cookTime: 20,
    calories: 360,
    imageUrl: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "rec-08",
    title: "Salad ức gà sốt mè rang",
    category: "eat-clean",
    cookTime: 15,
    calories: 290,
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "rec-09",
    title: "Bánh mì kẹp pate thịt nướng",
    category: "nau-nhanh",
    cookTime: 10,
    calories: 350,
    imageUrl: "https://images.unsplash.com/photo-1626804475297-41608ea09aeb?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "rec-10",
    title: "Canh chua cá lóc miền Nam",
    category: "mon-an-gia-dinh",
    cookTime: 30,
    calories: 310,
    imageUrl: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80"
  }
].map(r => ({
  ...r,
  name: r.title,
  kcal: r.calories,
  time: r.cookTime,
  image: r.imageUrl,
  difficulty: r.cookTime <= 20 ? "Dễ" : (r.cookTime <= 35 ? "Trung bình" : "Khó"),
  tags: [r.category === 'mon-sang' ? 'Bữa sáng' : (r.category === 'nau-nhanh' ? 'Nấu nhanh' : (r.category === 'eat-clean' ? 'Eat clean' : 'Món gia đình')), 'Việt Nam'],
  ingredients: [r.title],
  steps: ["Sơ chế nguyên liệu sạch sẽ.", "Chế biến và nấu chín theo thời gian chuẩn.", "Trình bày ra đĩa và thưởng thức khi còn nóng."]
}));

const recipes = VIETNAMESE_RECIPES;
if (typeof window !== 'undefined') window.VIETNAMESE_RECIPES = VIETNAMESE_RECIPES;
if (typeof window !== 'undefined') window.recipes = recipes;


/* =========================================================
   RECIPE LOGIC
========================================================= */

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


function suggestionCatalog() {
    const source = (Array.isArray(recipesCache) && recipesCache.length) ? recipesCache : (recipes || []);
    return source.map(function (r) {
        const names = (typeof normalizeIngredientList === 'function' ? normalizeIngredientList(r.ingredients) : (r.ingredients || []))
            .map(function (ingredient) {
                if (typeof ingredient === 'string') return ingredient;
                return (ingredient && (ingredient.ingredientName || ingredient.name)) || '';
            })
            .filter(Boolean);
        return {
            ...r,
            name: r.name || r.title || 'Món ăn',
            title: r.title || r.name || 'Món ăn',
            time: r.time || r.cookTime || 30,
            kcal: Number(r.kcal || r.calories) || 0,
            difficulty: r.difficulty || 'Dễ',
            imageUrl: r.imageUrl || r.image || '',
            image: r.image || r.imageUrl || '',
            tags: Array.isArray(r.tags) ? r.tags : [],
            ingredients: names.length ? names : [r.title || r.name || '']
        };
    });
}

function suggestedRecipes() {
    const fridgeIngredients = (state.fridge || [])
        .flatMap(item => [item.name, ...(item.ingredients || [])])
        .filter(Boolean)
        .map(normalize);

    const scored = suggestionCatalog()
        .filter(isRecipeSafeForProfile)
        .map(recipe => ({ ...recipe, score: recipeScore(recipe) }))
        .sort((a, b) => b.score - a.score);

    if (!fridgeIngredients.length) {
        return scored.slice(0, 3);
    }

    const matched = scored.filter(recipe => recipe.ingredients.some(name => {
        const value = normalize(name);
        return value && fridgeIngredients.some(fridge => fridge.includes(value) || value.includes(fridge));
    }));
    const rest = scored.filter(recipe => matched.indexOf(recipe) === -1);
    return matched.concat(rest).slice(0, 3);
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
                    src="${recipe.imageUrl || recipe.image || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80'}"
                    alt="${recipe.title || recipe.name || 'Món ăn'}"
                    loading="lazy"
                    onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80';">


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


let homeSuggestLoading = false;

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

    if ((!recipesCache || !recipesCache.length) && !homeSuggestLoading && typeof apiRequest === 'function') {
        homeSuggestLoading = true;
        apiRequest('/api/recipes').then(function (list) {
            recipesCache = list || [];
            homeSuggestLoading = false;
            renderRecipes();
        }).catch(function () {
            homeSuggestLoading = false;
        });
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

function isNumericRecipeId(id) {
    const key = String(id == null ? '' : id);
    return key !== '' && !key.startsWith('c') && !isNaN(+key);
}

async function toggleRecipeFavorite(targetId) {
    const saved = await apiRequest('/api/favorites/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetId: +targetId, targetType: 'RECIPE' })
    });
    return saved === true;
}

function findRecipeSnapshot(id) {
    const idKey = String(id);
    const pools = [allSocialPostsCache, communityFeedPosts, recipesCache];
    if (typeof recipes !== 'undefined') pools.push(recipes);
    if (typeof curRecipe !== 'undefined' && curRecipe) pools.push([curRecipe]);
    let found = null;
    pools.forEach(function (pool) {
        if (!found && Array.isArray(pool)) {
            found = pool.find(function (p) { return p && String(p.id) === idKey; });
        }
    });
    if (!found) return null;
    return {
        id: id,
        title: found.title || found.name || 'Công thức yêu thích',
        imageUrl: found.imageUrl || found.image || '',
        cookTime: found.cookTime || found.time || '30',
        kcal: found.kcal || 350,
        description: found.description || '',
        ingredients: found.ingredients || [],
        instructions: found.instructions || found.steps || '',
        steps: found.steps || [],
        savedAt: new Date().toISOString()
    };
}

function rememberFavorite(id, saved, snapshot) {
    const idKey = String(id);
    if (saved) {
        savedPostsState[idKey] = snapshot || savedPostsState[idKey] || {
            id: id,
            title: 'Công thức yêu thích',
            savedAt: new Date().toISOString()
        };
        if (!state.favorites.some(function (x) { return String(x) === idKey; })) {
            state.favorites.push(id);
        }
    } else {
        delete savedPostsState[idKey];
        state.favorites = state.favorites.filter(function (x) { return String(x) !== idKey; });
    }
    localStorage.setItem('foodx_saved_posts', JSON.stringify(savedPostsState));
    saveState();
}

async function toggleFavorite(id) {
    if (!isUserLoggedIn()) {
        requireAuth('favorite');
        return;
    }
    const idKey = String(id);
    const currentlySaved = !!savedPostsState[idKey] || state.favorites.some(function (x) { return String(x) === idKey; });

    if (isNumericRecipeId(id)) {
        try {
            const serverSaved = await toggleRecipeFavorite(id);
            rememberFavorite(id, serverSaved, serverSaved ? findRecipeSnapshot(id) : null);
            showToast(serverSaved ? 'Đã lưu món vào danh sách yêu thích! ❤️' : 'Đã bỏ lưu món khỏi danh sách yêu thích.', serverSaved ? 'success' : 'info');
        } catch (e) {
            showToast('Không lưu được yêu thích: ' + (e.message || ''), 'error');
            return;
        }
    } else if (currentlySaved) {
        rememberFavorite(id, false);
        showToast('Đã bỏ lưu món khỏi danh sách yêu thích.', 'info');
    } else {
        rememberFavorite(id, true, findRecipeSnapshot(id));
        showToast('Đã lưu món vào danh sách yêu thích! ❤️', 'success');
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
            const apiSaved = await apiRequest('/api/favorites');
            if (Array.isArray(apiSaved)) {
                apiSaved.forEach(r => {
                    savedList.push({
                        id: r.targetId != null ? r.targetId : r.id,
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
        try {
            const savedPostsApi = await apiRequest('/api/social/posts/saved');
            if (Array.isArray(savedPostsApi)) {
                savedPostsApi.forEach(function (p) {
                    rememberSavedPost(p, true);
                    const already = savedList.some(function (item) {
                        return String(item.id) === String(p.id) || (item.title && p.title && item.title === p.title);
                    });
                    if (!already) {
                        savedList.push({
                            id: p.id,
                            isSocial: true,
                            title: p.title || 'Công thức cộng đồng',
                            name: p.title || 'Công thức cộng đồng',
                            imageUrl: p.imageUrl || '',
                            image: p.imageUrl || '',
                            cookTime: p.cookTime || 30,
                            time: parseInt(p.cookTime, 10) || 30,
                            kcal: parseInt(p.kcal, 10) || 350,
                            difficulty: p.difficulty || 'Dễ',
                            category: p.category || 'Cộng đồng',
                            score: 100
                        });
                    }
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
                    isSocial: true,
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
                    <div class="recipe-card-actions" style="margin-top: 10px; display: flex; gap: 8px;">
                        <button type="button" class="secondary-button" data-plan-fav="${r.id}" title="Lên thực đơn với món này" style="flex: 1; padding: 7px 12px; font-size: 12px; border-radius: 8px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; gap: 5px; border-color: var(--green); color: var(--green); background: rgba(16,185,129,0.06); cursor: pointer;">
                            📅 Lên kế hoạch
                        </button>
                    </div>
                </div>
            </article>
        `;
    }).join('');

    // Wire clicks to open recipe detail
    grid.querySelectorAll('[data-open-fav]').forEach(card => {
        card.addEventListener('click', function(e) {
            if (e.target.closest('.favorite-button') || e.target.closest('[data-plan-fav]')) return;
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

    // Wire add to plan
    grid.querySelectorAll('[data-plan-fav]').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const id = btn.getAttribute('data-plan-fav');
            const item = savedList.find(x => String(x.id) === String(id));
            if (item) {
                const isCatalog = !item.isSocial && (typeof recipesCache !== 'undefined' && Array.isArray(recipesCache)) && recipesCache.some(r => Number(r.id) === Number(item.id) && (r.title === item.title || r.name === item.title));
                const planTarget = Object.assign({}, item, {
                    isSocial: !isCatalog,
                    kcal: parseInt(item.kcal) || 350
                });
                openAddToPlanModal(planTarget);
            }
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

function getCookingStepTitle(
    step,
    index
) {

    const text =
        normalize(
            step
        );


    if (
        text.includes("rua") ||
        text.includes("cat") ||
        text.includes("thai") ||
        text.includes("got")
    ) {

        return (
            "Chuẩn bị nguyên liệu"
        );
    }


    if (
        text.includes("uop")
    ) {

        return (
            "Ướp nguyên liệu"
        );
    }


    if (
        text.includes("xao")
    ) {

        return (
            "Xào nguyên liệu"
        );
    }


    if (
        text.includes("nuong")
    ) {

        return (
            "Nướng món ăn"
        );
    }


    if (
        text.includes("luoc") ||
        text.includes("hap")
    ) {

        return (
            "Làm chín nguyên liệu"
        );
    }


    if (
        text.includes("tron")
    ) {

        return (
            "Trộn nguyên liệu"
        );
    }


    return (
        `Thực hiện bước ${index + 1}`
    );
}


function startCooking(recipeId) {

    const recipe =
        getRecipeById(
            recipeId
        );


    if (!recipe) {
        return;
    }


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


    cookingState = {

        recipeId:
        recipe.id,

        stepIndex:
            0
    };


    closeOtherModals(
        "cookingModal"
    );


    renderCookingStep();


    document
        .getElementById(
            "cookingModal"
        )
        ?.classList
        .add("show");


    showToast(
        `Bắt đầu nấu ${recipe.name}.`,
        "success"
    );
}


function renderCookingStep() {

    const recipe =
        getRecipeById(
            cookingState.recipeId
        );


    if (!recipe) {
        return;
    }


    const total =
        recipe.steps.length;


    cookingState.stepIndex =
        Math.max(
            0,
            Math.min(
                total - 1,
                cookingState.stepIndex
            )
        );


    const index =
        cookingState.stepIndex;


    const step =
        recipe.steps[
            index
            ];


    setText(
        "cookingRecipeName",
        recipe.name
    );


    setText(
        "cookingProgressText",
        `Bước ${index + 1} / ${total}`
    );


    setText(
        "cookingStepNumber",
        index + 1
    );


    setText(
        "cookingStepTitle",
        getCookingStepTitle(
            step,
            index
        )
    );


    setText(
        "cookingStepDescription",
        step
    );


    setText(
        "cookingTime",
        `${recipe.time} phút`
    );


    setText(
        "cookingCalories",
        `${recipe.kcal} kcal`
    );


    const image =
        document.getElementById(
            "cookingRecipeImage"
        );


    if (image) {

        image.src =
            recipe.image;
    }


    const progress =
        (
            (index + 1) /
            total
        ) *
        100;


    const bar =
        document.getElementById(
            "cookingProgressBar"
        );


    if (bar) {

        bar.style.width =
            `${progress}%`;
    }


    const previous =
        document.getElementById(
            "previousCookingStep"
        );


    if (previous) {

        previous.disabled =
            index === 0;
    }


    const next =
        document.getElementById(
            "nextCookingStep"
        );


    if (next) {

        next.innerHTML =
            index ===
            total - 1

                ? "✓ Hoàn thành"

                : "Bước tiếp theo →";
    }


    updateChatContextBanner();
}


document
    .getElementById(
        "previousCookingStep"
    )
    ?.addEventListener(
        "click",
        () => {

            if (
                cookingState.stepIndex >
                0
            ) {

                cookingState.stepIndex--;


                renderCookingStep();
            }
        }
    );


document
    .getElementById(
        "nextCookingStep"
    )
    ?.addEventListener(
        "click",
        () => {

            const recipe =
                getRecipeById(
                    cookingState.recipeId
                );


            if (!recipe) {
                return;
            }


            if (
                cookingState.stepIndex >=
                recipe.steps.length - 1
            ) {

                document
                    .getElementById(
                        "cookingModal"
                    )
                    ?.classList
                    .remove("show");


                showToast(
                    `🎉 Bạn đã hoàn thành ${recipe.name}!`,
                    "success"
                );


                cookingState = {

                    recipeId:
                        null,

                    stepIndex:
                        0
                };


                updateChatContextBanner();


                return;
            }


            cookingState.stepIndex++;


            renderCookingStep();
        }
    );


/* =========================================================
   RECIPES BROWSE + DETAIL (gop tu dk-dn)
========================================================= */
recipesCache = recipesCache || [];
curRecipe = curRecipe || null;

function parseIngredientLine(line) {
    const s = String(line || '').trim();
    if (!s) return { ingredientName: 'Nguyên liệu', quantity: 1, unit: 'phần', note: null };
    const lead = s.match(/^(\d+(?:[.,]\d+)?)\s*([a-zA-ZÀ-ỹđĐ]+)?\s+(.+)$/);
    if (lead) {
        return {
            ingredientName: lead[3].trim(),
            quantity: parseFloat(lead[1].replace(',', '.')),
            unit: lead[2] || 'phần',
            note: null
        };
    }
    return { ingredientName: s, quantity: 1, unit: 'phần', note: null };
}

function foodSlug(title) {
    return String(title || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'd')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

const DISH_IMAGE_ALIAS = {
    'com-chien-trung-kieu-viet': '/images/recipes/com-chien-trung.jpg',
    'ga-kho-gung-sa-ot': '/images/recipes/ga-kho-gung.jpg',
    'ca-hoi-ap-chao-mang-tay': '/images/recipes/ca-hoi-ap-chao.jpg',
    'banh-mi-kep-pate-thit-nuong': '/images/foods/banh-mi.jpg',
    'canh-chua-ca-loc-mien-nam': '/images/foods/canh-chua-ca-loc-mien-tay-ca-kho-to.jpg',
    'pho-bo-tai-ha-noi': '/images/foods/pho-bo-tai-ha-noi.jpg',
    'bun-cha-ha-noi': '/images/foods/bun-cha-ha-noi.jpg'
};

function dishImageCandidates(recipe) {
    const title = (recipe && (recipe.title || recipe.name)) || '';
    const slug = foodSlug(title);
    const stored = (recipe && (recipe.imageUrl || recipe.image)) || '';
    const list = [];
    if (slug && DISH_IMAGE_ALIAS[slug]) list.push(DISH_IMAGE_ALIAS[slug]);
    if (slug) {
        list.push('/images/foods/' + slug + '.jpg');
        list.push('/images/recipes/' + slug + '.jpg');
    }
    if (stored && !/unsplash\.com|default-recipe|placeholder/i.test(String(stored))) list.unshift(stored);
    else if (stored) list.push(stored);
    return list.filter(function (url, index, all) { return url && all.indexOf(url) === index; });
}

window.foodxImgFallback = function (img) {
    const list = String(img.getAttribute('data-fallbacks') || '').split('|').filter(Boolean);
    const next = Number(img.getAttribute('data-img-i') || '0') + 1;
    if (next < list.length) {
        img.setAttribute('data-img-i', String(next));
        img.src = list[next];
        return;
    }
    const emoji = img.getAttribute('data-emoji') || '🍽️';
    if (img.classList.contains('mine-menu-thumb')) {
        img.outerHTML = '<span class="mine-menu-thumb mine-menu-emoji" aria-hidden="true">' + emoji + '</span>';
        return;
    }
    if (img.classList.contains('hs-thumb')) {
        img.outerHTML = '<div class="hs-thumb hs-thumb-emoji" aria-hidden="true">' + emoji + '</div>';
        return;
    }
    img.outerHTML = '<div class="recipe-image recipe-image-emoji">' + emoji + '</div>';
};

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

function ownsRecipe(recipe) {
    if (!recipe || recipe.isSocial || !isUserLoggedIn()) return false;
    const me = window.authState && authState.userId != null ? Number(authState.userId) : null;
    const authorId = recipe.authorId != null ? Number(recipe.authorId) : null;
    return me != null && !Number.isNaN(me) && authorId != null && me === authorId;
}

function cleanRecipeTitle(title) {
    return String(title || 'Món của bạn').replace(/[\*_`#]+/g, ' ').replace(/\s+/g, ' ').trim() || 'Món của bạn';
}

function setPersonalMenuOpen(open) {
    const panel = document.getElementById('personalRecipeGrid');
    const btn = document.getElementById('personalMenuBtn');
    if (!panel || !btn) return;
    if (open) panel.removeAttribute('hidden');
    else panel.setAttribute('hidden', '');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.classList.toggle('open', !!open);
}

function ensurePersonalMenu() {
    const btn = document.getElementById('personalMenuBtn');
    const panel = document.getElementById('personalRecipeGrid');
    if (!btn || !panel || btn.dataset.bound === '1') return;
    btn.dataset.bound = '1';
    btn.addEventListener('click', function (e) {
        e.stopPropagation();
        setPersonalMenuOpen(panel.hasAttribute('hidden'));
    });
    document.addEventListener('click', function (e) {
        if (panel.hasAttribute('hidden')) return;
        if (e.target.closest && e.target.closest('#personalRecipesCard')) return;
        setPersonalMenuOpen(false);
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') setPersonalMenuOpen(false);
    });
}

function renderPersonalRecipes() {
    const panel = document.getElementById('personalRecipeGrid');
    const countEl = document.getElementById('personalMenuCount');
    if (!panel) return;
    ensurePersonalMenu();
    if (!isUserLoggedIn()) {
        if (countEl) countEl.textContent = '0';
        panel.innerHTML = '<p class="mine-menu-empty">Đăng nhập để xem công thức bạn đã tạo.</p>';
        return;
    }
    const mine = (recipesCache || []).filter(ownsRecipe);
    if (countEl) countEl.textContent = String(mine.length);
    if (!mine.length) {
        panel.innerHTML = '<p class="mine-menu-empty">Bạn chưa thêm công thức nào. Bấm “Thêm công thức” để tạo món của riêng bạn.</p>';
        return;
    }
    panel.innerHTML = mine.map(function (r) {
        const imgUrls = dishImageCandidates(r);
        const emoji = recipeEmoji(r);
        const title = cleanRecipeTitle(r.title);
        const thumb = imgUrls.length
            ? '<img class="mine-menu-thumb" src="' + escapeHtml(imgUrls[0]) + '" data-fallbacks="' + escapeHtml(imgUrls.join('|')) + '" data-img-i="0" data-emoji="' + emoji + '" alt="" loading="lazy" onerror="window.foodxImgFallback(this)">'
            : '<span class="mine-menu-thumb mine-menu-emoji" aria-hidden="true">' + emoji + '</span>';
        const mins = parseInt(r.cookTime || r.time, 10) || 0;
        const meta = (mins ? mins + ' phút · ' : '') + (r.kcal || 0) + ' kcal';
        return '<div class="mine-menu-row">' +
            '<button type="button" class="mine-menu-item" data-personal-rid="' + r.id + '">' +
            thumb +
            '<span class="mine-menu-copy"><span class="mine-menu-name">' + escapeHtml(title) + '</span>' +
            '<span class="mine-menu-meta">' + escapeHtml(meta) + '</span></span></button>' +
            '<button type="button" class="mine-menu-del" data-del-recipe="' + r.id + '" data-del-title="' + escapeHtml(title) + '" aria-label="Xóa ' + escapeHtml(title) + '">✕</button>' +
            '</div>';
    }).join('');
    panel.querySelectorAll('[data-del-recipe]').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            deleteRecipeById(btn.getAttribute('data-del-recipe'), btn.getAttribute('data-del-title'));
        });
    });
    panel.querySelectorAll('[data-personal-rid]').forEach(function (item) {
        item.addEventListener('click', function () {
            setPersonalMenuOpen(false);
            openRecipeDetail(+item.getAttribute('data-personal-rid'));
        });
    });
}

async function deleteRecipeById(id, title) {
    if (!id) return;
    if (!isUserLoggedIn()) {
        requireAuth('recipe');
        return;
    }
    const recipe = (recipesCache || []).find(function (r) { return String(r.id) === String(id); }) || curRecipe;
    if (recipe && !ownsRecipe(recipe) && !(window.authState && authState.role === 'ADMIN')) {
        showToast('Bạn chỉ xóa được công thức do mình tạo.', 'warning');
        return;
    }
    if (!window.confirm('Xóa công thức "' + (title || 'món này') + '"?')) return;
    try {
        await apiRequest('/api/recipes/' + id, { method: 'DELETE' });
        showToast('Đã xóa công thức.', 'success');
        if (window.curRecipe && String(curRecipe.id) === String(id)) {
            curRecipe = null;
            openView('recipes');
        }
        await loadRecipes();
    } catch (e) {
        showToast((e && e.message) || 'Không xóa được công thức.', 'error');
    }
}
window.deleteRecipeById = deleteRecipeById;

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
    renderPersonalRecipes();
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
        const imgUrls = dishImageCandidates(r);
        const emoji = recipeEmoji(r);
        const imgHtml = imgUrls.length
            ? '<img class="recipe-image" src="' + escapeHtml(imgUrls[0]) + '" data-fallbacks="' + escapeHtml(imgUrls.join('|')) + '" data-img-i="0" data-emoji="' + emoji + '" alt="' + escapeHtml(r.title) + '" loading="lazy" onerror="window.foodxImgFallback(this)">'
            : '<div class="recipe-image recipe-image-emoji">' + emoji + '</div>';

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

async function openRecipeDetail(id, source) {
    if (!id) return;
    curRecipe = null;
    const fromSocial = source === 'social';

    // Chỉ bài chia sẻ mới tra theo id bài. Công thức và kế hoạch dùng /api/recipes/{id}
    // vì id bài viết và id công thức trùng số nhưng là hai món khác nhau.
    const savedPosts = fromSocial ? JSON.parse(localStorage.getItem('foodx_saved_posts') || '{}') : {};
    let socialMatch = savedPosts[String(id)] || null;
    if (fromSocial && !socialMatch && typeof allSocialPostsCache !== 'undefined' && Array.isArray(allSocialPostsCache)) {
        socialMatch = allSocialPostsCache.find(p => String(p.id) === String(id) || (p.title && String(p.title) === String(id)));
    }
    if (fromSocial && !socialMatch && typeof communityFeedPosts !== 'undefined' && Array.isArray(communityFeedPosts)) {
        socialMatch = communityFeedPosts.find(p => String(p.id) === String(id) || (p.title && String(p.title) === String(id)));
    }
    if (fromSocial && !socialMatch && typeof sampleBlogPosts !== 'undefined' && Array.isArray(sampleBlogPosts)) {
        socialMatch = sampleBlogPosts.find(p => String(p.id) === String(id) || (p.title && String(p.title) === String(id)));
    }

    if (fromSocial && socialMatch && (!socialMatch.ingredients || !socialMatch.ingredients.length)) {
        const fullPost = (typeof allSocialPostsCache !== 'undefined' && (allSocialPostsCache || []).find(p => String(p.id) === String(id)))
            || (typeof communityFeedPosts !== 'undefined' && (communityFeedPosts || []).find(p => String(p.id) === String(id)));
        if (fullPost) {
            socialMatch.ingredients = fullPost.ingredients || [];
            if (!socialMatch.instructions) socialMatch.instructions = fullPost.instructions || '';
            if (!socialMatch.steps) socialMatch.steps = fullPost.steps || [];
        }
    }

    if (fromSocial && socialMatch) {
        curRecipe = {
            id: socialMatch.id,
            isSocial: true,
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
    const id = curRecipe.id;
    let newSaved = false;
    if (isNumericRecipeId(id)) {
        try {
            newSaved = await toggleRecipeFavorite(id);
        } catch (e) {
            showToast('Không lưu được yêu thích: ' + (e.message || ''), 'error');
            return;
        }
        rememberFavorite(id, newSaved, newSaved ? (findRecipeSnapshot(id) || {
            id: id,
            title: curRecipe.title || curRecipe.name,
            imageUrl: curRecipe.imageUrl || curRecipe.image,
            cookTime: curRecipe.cookTime || curRecipe.time,
            kcal: curRecipe.kcal,
            description: curRecipe.description,
            ingredients: curRecipe.ingredients,
            instructions: curRecipe.instructions,
            savedAt: new Date().toISOString()
        }) : null);
    } else {
        const idKey = String(id);
        newSaved = !(savedPostsState[idKey] || state.favorites.some(function (x) { return String(x) === idKey; }));
        rememberFavorite(id, newSaved, findRecipeSnapshot(id));
    }

    const saveBtn = document.getElementById('rdSave');
    if (saveBtn) saveBtn.innerHTML = newSaved ? '❤️ Đã lưu vào công thức của tôi' : '🤍 Lưu món';

    const cardSaveBtn = document.querySelector('[data-save="' + id + '"]');
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
    openAddToPlanModal(curRecipe);
}

async function cookNow() {
    if (!curRecipe) return;
    if (!isUserLoggedIn()) {
        requireAuth('stats');
        return;
    }
    openCookingMode();
}


/* =========================================================
   RECIPE DETAIL — hero image + related
========================================================= */
function renderRecipeDetail() {
    const r = curRecipe;
    if (!r) return;

    const baseServings = r.baseServings || parseInt(r.servings) || 4;
    const currentServings = r.currentServings || baseServings;
    const servingRatio = currentServings / baseServings;
    r.baseServings = baseServings;
    r.currentServings = currentServings;

    document.getElementById('rdEmoji').textContent = recipeEmoji(r);
    document.getElementById('rdTitle').textContent = r.title || r.name || 'Chi tiết món';

    let baseKcal = parseInt(r.baseKcal) || parseInt(r.kcal) || 0;
    let baseP = parseFloat(r.baseProtein) || parseFloat(r.protein) || 0;
    let baseC = parseFloat(r.baseCarb) || parseFloat(r.carb) || 0;
    let baseF = parseFloat(r.baseFat) || parseFloat(r.fat) || 0;

    if (!baseKcal || baseKcal < 50) {
        const t = (r.title || '').toLowerCase();
        if (t.includes('pho') || t.includes('bun') || t.includes('com')) baseKcal = 520;
        else if (t.includes('banh mi') || t.includes('chao') || t.includes('trung')) baseKcal = 380;
        else if (t.includes('salad') || t.includes('canh') || t.includes('yen mach')) baseKcal = 280;
        else baseKcal = 420;
    }

    if (!baseP || !baseC || !baseF) {
        const t = (r.title || '').toLowerCase();
        if (t.includes('bo') || t.includes('ga') || t.includes('ca ') || t.includes('tom') || t.includes('thit') || t.includes('trung') || t.includes('eatclean')) {
            baseP = Math.round(baseKcal * 0.28 / 4 * 10) / 10;
            baseC = Math.round(baseKcal * 0.46 / 4 * 10) / 10;
            baseF = Math.round(baseKcal * 0.26 / 9 * 10) / 10;
        } else {
            baseP = Math.round(baseKcal * 0.20 / 4 * 10) / 10;
            baseC = Math.round(baseKcal * 0.55 / 4 * 10) / 10;
            baseF = Math.round(baseKcal * 0.25 / 9 * 10) / 10;
        }
    }

    r.baseKcal = baseKcal;
    r.baseProtein = baseP;
    r.baseCarb = baseC;
    r.baseFat = baseF;

    let kcal = Math.round(baseKcal * servingRatio);
    let p = Math.round((baseP * servingRatio) * 10) / 10;
    let c = Math.round((baseC * servingRatio) * 10) / 10;
    let f = Math.round((baseF * servingRatio) * 10) / 10;
    r.kcal = kcal;
    r.protein = p;
    r.carb = c;
    r.fat = f;

    // Sync serving selector buttons
    const servingBtns = document.querySelectorAll('#rdServingSelector .serving-btn');
    if (servingBtns.length) {
        servingBtns.forEach(function (btn) {
            const s = parseInt(btn.getAttribute('data-servings'));
            if (s === currentServings) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    document.getElementById('rdMeta').innerHTML =
        '<span><svg class="icon"><use href="#i-clock"/></svg> ' + (r.cookTime || r.time || 30) + ' phút</span>' +
        '<span><svg class="icon"><use href="#i-stats"/></svg> ' + escapeHtml(r.difficulty || 'Dễ') + '</span>' +
        '<span><svg class="icon"><use href="#i-user"/></svg> ' + currentServings + ' người' + (currentServings !== baseServings ? ' (đã chỉnh)' : '') + '</span>' +
        (kcal ? '<span><svg class="icon"><use href="#i-flame"/></svg> ' + kcal + ' kcal</span>' : '');

    document.getElementById('rdDesc').textContent = r.description || '';

    // Hero image handling
    const heroBox = document.querySelector('.recipe-detail-hero');
    const img = document.getElementById('rdHeroImg');
    if (img) {
        const urls = dishImageCandidates(r);
        img.setAttribute('data-fallbacks', urls.join('|'));
        img.setAttribute('data-img-i', '0');
        img.onload = function () {
            if (heroBox) heroBox.classList.add('has-img');
        };
        img.onerror = function () {
            const list = String(img.getAttribute('data-fallbacks') || '').split('|').filter(Boolean);
            const next = Number(img.getAttribute('data-img-i') || '0') + 1;
            if (next < list.length) {
                img.setAttribute('data-img-i', String(next));
                img.src = list[next];
                return;
            }
            img.hidden = true;
            if (heroBox) heroBox.classList.remove('has-img');
        };
        if (urls.length) {
            img.hidden = false;
            img.src = urls[0];
        } else {
            img.hidden = true;
            if (heroBox) heroBox.classList.remove('has-img');
        }
    }

    const ings = normalizeIngredientList(r.ingredients);
    document.getElementById('rdIng').innerHTML = ings.length
        ? '<ul class="rd-ing-list">' + ings.map(function (i) {
            const rawQty = i.baseQuantity != null && i.baseQuantity !== '' ? i.baseQuantity : i.quantity;
            let qtyHtml = '';

            if (rawQty != null && String(rawQty).trim()) {
                const unitRaw = i.unit || '';
                const unitStr = escapeHtml(unitRaw);
                const ingName = i.ingredientName || i.name || '';
                const baseNum = quantityNumber(rawQty);
                const cooked = baseNum == null
                    ? { text: scaleIngredientQuantity(rawQty, servingRatio), hint: '' }
                    : formatCookAmount(baseNum * servingRatio, unitRaw, ingName);
                const fullScaledStr = cooked.text === 'một ít'
                    ? 'một ít'
                    : ((cooked.text ? cooked.text + ' ' : '') + unitStr).trim();

                let perPersonHtml = '';
                if (cooked.hint) {
                    perPersonHtml = '<small class="qty-per-person">' + escapeHtml(cooked.hint) + '</small>';
                } else if (currentServings > 1) {
                    if (baseNum != null && baseServings > 0) {
                        const perCooked = formatCookAmount(baseNum / baseServings, unitRaw, ingName);
                        const perText = perCooked.text === 'một ít'
                            ? 'một ít'
                            : ((perCooked.text ? perCooked.text + ' ' : '') + unitStr).trim();
                        perPersonHtml = '<small class="qty-per-person" title="Định lượng cho 1 người">' + perText + '/người</small>';
                    }
                }

                qtyHtml = '<div class="qty-group"><span class="qty">' + fullScaledStr.trim() + '</span>' + perPersonHtml + '</div>';
            } else if (i.unit) {
                qtyHtml = '<div class="qty-group"><span class="qty qty-opt">' + escapeHtml(i.unit) + '</span></div>';
            }

            return '<li><span class="ing-name">' + escapeHtml(i.ingredientName || i.name || '') + '</span>' + qtyHtml + '</li>';
        }).join('') + '</ul>'
        : '<div class="empty-state"><span class="es-icon">🧺</span><b>Chưa cập nhật nguyên liệu</b></div>';

    const steps = String(r.instructions || '').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
    document.getElementById('rdSteps').innerHTML = steps.length
        ? '<ol class="rd-steps-list">' + steps.map(function (s) { return '<li>' + escapeHtml(s) + '</li>'; }).join('') + '</ol>'
        : '<div class="empty-state"><span class="es-icon">👨‍🍳</span><b>Chưa cập nhật các bước</b></div>';

    const pPct = Math.round((p * 4 / kcal) * 100) || 25;
    const cPct = Math.round((c * 4 / kcal) * 100) || 50;
    const fPct = Math.max(0, 100 - pPct - cPct);

    document.getElementById('rdNutri').innerHTML =
        '<div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px; margin-bottom: 16px;">' +
        '<div style="background: var(--bg); border: 1px solid var(--border); border-radius: 12px; padding: 12px; text-align: center;">' +
        '<span style="font-size: 11px; color: var(--text-soft); font-weight: 600; text-transform: uppercase;">🔥 Năng lượng</span>' +
        '<div style="font-size: 20px; font-weight: 800; color: #ea580c; margin-top: 4px;">' + kcal + ' <small style="font-size: 11px; font-weight: 600;">kcal</small></div>' +
        '</div>' +
        '<div style="background: var(--bg); border: 1px solid var(--border); border-radius: 12px; padding: 12px; text-align: center;">' +
        '<span style="font-size: 11px; color: var(--text-soft); font-weight: 600; text-transform: uppercase;">🥩 Đạm (Protein)</span>' +
        '<div style="font-size: 20px; font-weight: 800; color: #2563eb; margin-top: 4px;">' + p + ' <small style="font-size: 11px; font-weight: 600;">g</small></div>' +
        '<div style="font-size: 10.5px; color: var(--text-soft); margin-top: 2px;">' + pPct + '% năng lượng</div>' +
        '</div>' +
        '<div style="background: var(--bg); border: 1px solid var(--border); border-radius: 12px; padding: 12px; text-align: center;">' +
        '<span style="font-size: 11px; color: var(--text-soft); font-weight: 600; text-transform: uppercase;">🍚 Tinh bột (Carbs)</span>' +
        '<div style="font-size: 20px; font-weight: 800; color: #d97706; margin-top: 4px;">' + c + ' <small style="font-size: 11px; font-weight: 600;">g</small></div>' +
        '<div style="font-size: 10.5px; color: var(--text-soft); margin-top: 2px;">' + cPct + '% năng lượng</div>' +
        '</div>' +
        '<div style="background: var(--bg); border: 1px solid var(--border); border-radius: 12px; padding: 12px; text-align: center;">' +
        '<span style="font-size: 11px; color: var(--text-soft); font-weight: 600; text-transform: uppercase;">🥑 Chất béo (Fat)</span>' +
        '<div style="font-size: 20px; font-weight: 800; color: #16a34a; margin-top: 4px;">' + f + ' <small style="font-size: 11px; font-weight: 600;">g</small></div>' +
        '<div style="font-size: 10.5px; color: var(--text-soft); margin-top: 2px;">' + fPct + '% năng lượng</div>' +
        '</div>' +
        '</div>' +
        '<div style="background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 14px; margin-bottom: 12px;">' +
        '<div style="display:flex; justify-content:space-between; font-size:12px; font-weight:700; margin-bottom: 8px;">' +
        '<span>Phân bổ dinh dưỡng (Macro Split)</span>' +
        '<span style="color: var(--green-dark);">1 khẩu phần</span>' +
        '</div>' +
        '<div style="display: flex; height: 10px; border-radius: 999px; overflow: hidden; background: var(--border); gap: 2px;">' +
        '<div style="width:' + pPct + '%; background: #2563eb;" title="Đạm: ' + pPct + '%"></div>' +
        '<div style="width:' + cPct + '%; background: #d97706;" title="Tinh bột: ' + cPct + '%"></div>' +
        '<div style="width:' + fPct + '%; background: #16a34a;" title="Chất béo: ' + fPct + '%"></div>' +
        '</div>' +
        '<div style="display: flex; justify-content: center; gap: 16px; margin-top: 10px; font-size: 11.5px; color: var(--text-soft); flex-wrap: wrap;">' +
        '<span><i style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#2563eb;margin-right:4px;"></i>Đạm ' + pPct + '%</span>' +
        '<span><i style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#d97706;margin-right:4px;"></i>Tinh bột ' + cPct + '%</span>' +
        '<span><i style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#16a34a;margin-right:4px;"></i>Chất béo ' + fPct + '%</span>' +
        '</div>' +
        '</div>' +
        '<div style="background: var(--green-light); border-radius: 10px; padding: 10px 14px; font-size: 12px; color: var(--green-dark); display: flex; align-items: center; gap: 8px;">' +
        '<span>💡</span>' +
        '<span>Món ăn cân đối dinh dưỡng, cung cấp đầy đủ đạm, tinh bột và chất béo thiết yếu cho cơ thể.</span>' +
        '</div>';
    
    const isSaved = !!savedPostsState[String(r.id)];
    const saveBtn = document.getElementById('rdSave');
    if (saveBtn) saveBtn.innerHTML = isSaved ? '❤️ Đã lưu vào công thức của tôi' : '🤍 Lưu món';
    const manage = document.querySelector('#view-recipe .rd-actions-manage');
    if (manage) manage.hidden = !ownsRecipe(r);
    
    renderRelated(r);
}

function renderRelated(r) {
    const box = document.getElementById('rdRelated');
    if (!box) return;
    const related = (recipesCache || []).filter(function (x) {
        return x.id !== r.id && x.category && r.category && x.category === r.category;
    }).slice(0, 4);
    if (!related.length) { box.innerHTML = ''; return; }
    box.innerHTML = '<h4>Món tương tự</h4><div class="related-grid">' +
        related.map(function (x) {
            return '<div class="related-item" data-related="' + x.id + '"><b>' + escapeHtml(x.title) + '</b>' +
                '<span>⏱ ' + (x.cookTime || '—') + '′ · ' + (x.kcal || 0) + ' kcal</span></div>';
        }).join('') + '</div>';
    document.querySelectorAll('[data-related]').forEach(function (el) {
        el.addEventListener('click', function () { openRecipeDetail(+el.getAttribute('data-related')); });
    });
}


