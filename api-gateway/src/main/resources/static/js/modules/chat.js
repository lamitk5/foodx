function addChatMessage(text, sender) {
    if (!chatMessages) return;
    const div = document.createElement("div");
    div.className = `message ${sender}`;
    if (sender === 'ai') {
        div.innerHTML = text;
    } else {
        div.textContent = text;
    }
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}


function updateChatContextBanner() {

    const banner =
        document.getElementById(
            "chatContextBanner"
        );


    if (!banner) {
        return;
    }


    if (
        !activeRecipeContext
    ) {

        banner.classList.remove(
            "show"
        );


        banner.innerHTML =
            "";


        return;
    }


    let stepText =
        "";


    if (
        cookingState.recipeId ===
        activeRecipeContext.id
    ) {

        stepText =
            ` • Bước ${cookingState.stepIndex + 1}/${activeRecipeContext.steps.length}`;
    }


    banner.innerHTML = `

        ✦ Bạn đang hỏi về:

        <strong>
            ${activeRecipeContext.name}
        </strong>

        ${stepText}
    `;


    banner.classList.add(
        "show"
    );
}


function openContextChat(
    type = "recipe"
) {

    // Chat mới (đa phiên): mở panel hiện đại; không còn chatWindow cũ
    if (!chatWindow) {
        openChat(type === "step" ? "step" : "chat");
        return;
    }

    chatWindow
        ?.classList
        .add("show");


    updateChatContextBanner();


    setTimeout(
        () =>
            chatInput
                ?.focus(),
        120
    );


    if (
        type === "step"
    ) {

        const recipe =
            getRecipeById(
                cookingState.recipeId
            );


        if (recipe) {

            const step =
                recipe.steps[
                    cookingState.stepIndex
                    ];


            addChatMessage(
                `Bạn đang ở bước ${cookingState.stepIndex + 1}: "${step}". Bạn chưa hiểu chỗ nào?`,
                "ai"
            );
        }


    } else if (
        activeRecipeContext
    ) {

        addChatMessage(
            `Tôi đang theo dõi công thức "${activeRecipeContext.name}". Bạn muốn hỏi gì về món này?`,
            "ai"
        );
    }
}


document
    .getElementById(
        "askCurrentStepAI"
    )
    ?.addEventListener(
        "click",
        () =>
            openContextChat(
                "step"
            )
    );


function contextualRecipeAI(question) {

    if (
        !activeRecipeContext
    ) {

        return null;
    }


    const text =
        normalize(
            question
        );


    const recipe =
        activeRecipeContext;


    let currentStep =
        null;


    if (
        cookingState.recipeId ===
        recipe.id
    ) {

        currentStep =
            recipe.steps[
                cookingState.stepIndex
                ];
    }


    if (
        text.includes(
            "nguyen lieu"
        )
    ) {

        return (
            `${recipe.name} cần: ${recipe.ingredients.join(", ")}.`
        );
    }


    if (
        text.includes("calo") ||
        text.includes("kcal")
    ) {

        return (
            `${recipe.name} được ước tính khoảng ${recipe.kcal} kcal/khẩu phần.`
        );
    }


    if (
        text.includes("bao lau") ||
        text.includes("may phut")
    ) {

        return (
            `Thời gian dự kiến của ${recipe.name} là khoảng ${recipe.time} phút.`
        );
    }


    if (
        text.includes("khong co") ||
        text.includes("thay bang") ||
        text.includes("thay ")
    ) {

        return (
            `Bạn đang hỏi về ${recipe.name}. Nguyên liệu gốc gồm ${recipe.ingredients.join(", ")}. Hiện đây vẫn là AI mô phỏng; sau này AI thật sẽ phân tích nguyên liệu thay thế chính xác hơn.`
        );
    }


    if (
        text.includes("khong hieu") ||
        text.includes("lam sao") ||
        text.includes("lam nhu nao") ||
        text.includes("nghia la gi")
    ) {

        if (currentStep) {

            return (
                `Bạn đang ở bước ${cookingState.stepIndex + 1}: "${currentStep}". Hãy nói cụ thể thao tác nào chưa hiểu để Food X giải thích tiếp.`
            );
        }
    }


    if (currentStep) {

        return (
            `Bạn đang nấu "${recipe.name}", bước ${cookingState.stepIndex + 1}: "${currentStep}".`
        );
    }


    return (
        `Bạn đang hỏi về "${recipe.name}". Tôi có thể hỗ trợ nguyên liệu, cách làm, calo và thời gian.`
    );
}


function fakeAI(question) {

    if (
        activeRecipeContext
    ) {

        const answer =
            contextualRecipeAI(
                question
            );


        if (answer) {

            return answer;
        }
    }


    const text =
        normalize(
            question
        );


    if (
        text.includes("an gi") ||
        text.includes("goi y") ||
        text.includes("mon")
    ) {

        const best =
            suggestedRecipes()[0];


        return best

            ? `Food X gợi ý ${best.name}. Món này khoảng ${best.kcal} kcal và đạt ${best.score}% phù hợp.`

            : "Hiện chưa tìm thấy món phù hợp.";
    }


    if (
        text.includes("bmi") ||
        text.includes("can nang")
    ) {

        const bmi =
            calculateBMI(
                state.profile.weight,
                state.profile.height
            );


        return (
            `BMI hiện tại khoảng ${bmi.toFixed(1)}. Cân nặng ${state.profile.weight} kg, chiều cao ${state.profile.height} cm.`
        );
    }


    if (
        text.includes("calo") ||
        text.includes("kcal")
    ) {

        const calories =
            calculateCalories(
                state.profile.gender,
                state.profile.age,
                state.profile.weight,
                state.profile.height,
                state.profile.activity,
                state.profile.target
            );


        return (
            `Mức năng lượng tham khảo khoảng ${formatNumber(calories)} kcal/ngày.`
        );
    }


    if (
        text.includes(
            "tu lanh"
        )
    ) {

        return (
            `Tủ lạnh hiện có ${state.fridge.length} loại thực phẩm.`
        );
    }


    if (
        text.includes(
            "het han"
        )
    ) {

        const data =
            state.fridge
                .filter(
                    item =>
                        daysLeft(
                            item.expiresAt
                        ) <= 3
                )
                .map(
                    item =>
                        item.name
                );

        return data.length
            ? `Bạn nên ưu tiên dùng: ${data.join(", ")}.`
            : "Không có thực phẩm nào cần dùng gấp.";
    }

    return (
        "Tôi hiện là lớp mô phỏng AI của Food X. Bạn có thể hỏi về món ăn, BMI, calo, tủ lạnh hoặc thực phẩm sắp hết hạn."
    );
}


function sendChat() {
    const text = chatInput?.value.trim();
    if (!text) return;

    addChatMessage(text, "user");
    chatInput.value = "";

    const loading = document.createElement("div");
    loading.className = "message ai typing-message";
    loading.innerHTML = `<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>`;
    chatMessages?.appendChild(loading);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
    })
    .then(res => {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
    })
    .then(j => {
        loading.remove();
        if (j && j.success && j.data) {
            const reply = escapeHtml(j.data.reply || '').replace(/\n/g, '<br>');
            addChatMessage(reply, "ai");
        } else {
            addChatMessage("Có lỗi xảy ra, thử lại nhé!", "ai");
        }
    })
    .catch(() => {
        loading.remove();
        addChatMessage("Không kết nối được máy chủ. Hãy khởi động backend rồi thử lại.", "ai");
    });
}


document
    .getElementById(
        "sendChat"
    )
    ?.addEventListener(
        "click",
        sendChat
    );


chatInput
    ?.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();


                sendChat();
            }
        }
    );


document
    .getElementById(
        "closeChat"
    )
    ?.addEventListener(
        "click",
        () =>
            chatWindow
                ?.classList
                .remove("show")
    );


document
    .getElementById(
        "chatFloating"
    )
    ?.addEventListener(
        "click",
        () => {

            const cookingOpen =
                document
                    .getElementById(
                        "cookingModal"
                    )
                    ?.classList
                    .contains(
                        "show"
                    );


            const recipeOpen =
                document
                    .getElementById(
                        "recipeModal"
                    )
                    ?.classList
                    .contains(
                        "show"
                    );


            if (
                activeRecipeContext &&
                (
                    cookingOpen ||
                    recipeOpen
                )
            ) {

                openContextChat(
                    cookingOpen
                        ? "step"
                        : "recipe"
                );


                return;
            }


            if (
                state.selectedFridgeIds
                    .length
            ) {

                openSelectedAISuggestions();


                return;
            }


            chatWindow
                ?.classList
                .toggle(
                    "show"
                );


            setTimeout(
                () =>
                    chatInput
                        ?.focus(),
                100
            );
        }
    );


/* =========================================================
   GLOBAL ACTIONS
========================================================= */

document.addEventListener(
    "change",
    event => {

        const fridgeCheckbox =
            event.target.closest(
                '[data-action="select-fridge"]'
            );


        if (fridgeCheckbox) {

            toggleSelectedFridge(

                Number(
                    fridgeCheckbox.dataset.id
                ),

                fridgeCheckbox.checked
            );

            return;
        }


        const shoppingCheckbox =
            event.target.closest(
                '[data-action="shopping-check"]'
            );


        if (shoppingCheckbox) {

            const id =
                Number(
                    shoppingCheckbox.dataset.id
                );


            const item =
                state.shopping.find(
                    item =>
                        Number(
                            item.id
                        ) ===
                        id
                );


            if (!item) {
                return;
            }


            item.done =
                shoppingCheckbox.checked;


            saveState();

            renderShopping();


            showToast(

                item.done

                    ? `Đã mua ${item.name}.`

                    : `Đã bỏ đánh dấu ${item.name}.`,

                "info"
            );
        }
    }
);

document.addEventListener(
    "click",
    event => {

        const target =
            event.target.closest(
                "[data-action]"
            );


        if (!target) {
            return;
        }


        const action =
            target.dataset.action;


        const rawId =
            target.dataset.id;


        const id =
            Number(
                rawId
            );


        if (
            action ===
            "add-food"
        ) {

            addFoodToFridge(
                rawId,
                target
            );


            return;
        }


        if (
            action ===
            "ingredient-detail"
        ) {

            openIngredientDetail(
                id
            );


            return;
        }


        if (
            action ===
            "save-ingredient-full"
        ) {
            saveIngredientFull(
                id
            );
            return;
        }

        if (
            action ===
            "save-ingredient-expiry"
        ) {

            saveIngredientExpiry(
                id
            );


            return;
        }


        if (
            action ===
            "increase-fridge"
        ) {

            adjustFridge(
                id,
                1
            );


            return;
        }


        if (
            action ===
            "decrease-fridge"
        ) {

            adjustFridge(
                id,
                -1
            );


            return;
        }


        if (
            action ===
            "use-fridge"
        ) {

            useFridgeFood(
                id
            );


            return;
        }


        if (
            action ===
            "delete-fridge"
        ) {

            deleteFridgeFood(
                id
            );


            return;
        }


        if (
            action ===
            "favorite"
        ) {

            toggleFavorite(
                id
            );


            return;
        }


        if (
            action ===
            "recipe-detail"
        ) {

            openRecipeDetail(
                id
            );


            return;
        }


        if (
            action ===
            "start-cooking"
        ) {

            startCooking(
                id
            );


            return;
        }


        if (
            action ===
            "ask-recipe-ai"
        ) {

            const recipe =
                getRecipeById(
                    id
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


            openContextChat(
                "recipe"
            );


            return;
        }


        if (
            action ===
            "add-missing"
        ) {

            addMissingIngredients(
                String(
                    target.dataset.recipe
                )
            );


            return;
        }


        if (
            action ===
            "shopping-delete"
        ) {

            state.shopping =
                state.shopping.filter(
                    item =>
                        Number(
                            item.id
                        ) !==
                        id
                );


            saveState();

            renderShopping();


            showToast(
                "Đã xóa khỏi danh sách mua.",
                "success"
            );


            return;
        }
    }
);


/* =========================================================
   CHECKBOX EVENTS
========================================================= */

document.addEventListener(
    "change",
    event => {

        const fridgeCheckbox =
            event.target.closest(
                '[data-action="select-fridge"]'
            );


        if (fridgeCheckbox) {

            toggleSelectedFridge(Number(fridgeCheckbox.dataset.id), fridgeCheckbox.checked);
            return;
        }

        const shoppingCheckbox = event.target.closest('[data-action="shopping-check"]');
        if (shoppingCheckbox) {
            const id = Number(shoppingCheckbox.dataset.id);
            const item =
                state.shopping.find(
                    item =>
                        Number(
                            item.id
                        ) ===
                        id
                );


            if (!item) {
                return;
            }


            item.done =
                shoppingCheckbox.checked;


            saveState();

            renderShopping();


            showToast(

                item.done

                    ? `Đã mua ${item.name}.`

                    : `Đã bỏ đánh dấu ${item.name}.`,

                "info"
            );
        }
    }
);


/* =========================================================
   GO TO FOOD SEARCH
========================================================= */

function goToFoodSearch() {

    openView(
        "home"
    );


    setTimeout(
        () => {

            foodSearch
                ?.scrollIntoView({

                    behavior:
                        "smooth",

                    block:
                        "center"
                });


            foodSearch
                ?.focus();

        },
        250
    );
}


document
    .getElementById(
        "fridgeAddMore"
    )
    ?.addEventListener(
        "click",
        goToFoodSearch
    );


/* =========================================================
   RENDER ALL
========================================================= */

function renderAll() {
    renderAvatar();
    renderProfile();
    renderAuthSettings();
    renderSearch();
    renderFridge();
    renderRecipes();
    renderFavorites();
    renderShopping();
    renderStats();
    renderExpiring();
}

/* =========================================================
   START FOOD X
========================================================= */

async function startFoodX() {
    /* 0. Khôi phục authState & profile ngay lập tức từ localStorage để giao diện hiển thị tức thì */
    const token = getToken();
    let savedUser = null;
    try {
        savedUser = JSON.parse(localStorage.getItem("foodx_user") || "null");
    } catch (_) {}

    if (token && savedUser) {
        authState = { ...authState, ...savedUser, authenticated: true };
        window.authState = authState;
        if (typeof state !== "undefined" && state) {
            state.userId = authState.userId;
            if (authState.fullName) state.profile.name = authState.fullName;
            if (authState.avatarUrl) state.profile.avatarUrl = authState.avatarUrl;
        }
    }

    /* 1. Khôi phục tab đang mở trước đó */
    const hash = window.location.hash ? window.location.hash.replace("#", "").trim() : "";
    const savedView = localStorage.getItem("foodx_active_view");
    const validViews = ["home", "fridge", "recipes", "plan", "favorites", "shopping", "social"];
    let initialView = "home";

    if (hash && validViews.includes(hash)) {
        initialView = hash;
    } else if (savedView && validViews.includes(savedView)) {
        initialView = savedView;
    }

    const AUTH_REQUIRED = ["fridge", "favorites", "shopping", "plan"];
    if (AUTH_REQUIRED.includes(initialView) && !isUserLoggedIn()) {
        initialView = "home";
    }

    renderAll();
    openView(initialView);

    /* 2. Gọi /api/auth/me để kiểm tra phiên và đồng bộ lại thông tin tài khoản */
    if (token) {
        try {
            await loadAuthState(false);
        } catch (_) {}
    }

    if (!isUserLoggedIn()) {
        renderAuthSettings();
        return;
    }

    /* 3. Tải dữ liệu MySQL cho tủ lạnh và hồ sơ */
    try {
        await Promise.all([
            loadFridgeFromApi(false),
            loadProfileFromApi(false)
        ]);
        console.log("✅ Food X đã đồng bộ MySQL: Tủ lạnh + Hồ sơ + Auth.");
    } catch (_) {}

    renderAll();
    openView(initialView);
}

// Khởi chạy ngay lập tức khi file JS được load
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startFoodX);
} else {
    startFoodX();
}

window.addEventListener("hashchange", function () {
    const hash = window.location.hash ? window.location.hash.replace("#", "").trim() : "";
    const validViews = ["home", "fridge", "recipes", "plan", "favorites", "shopping", "social"];
    if (hash && validViews.includes(hash)) {
        openView(hash);
    }
});

previousViewBeforeRecipe = previousViewBeforeRecipe || 'recipes';

function goBackFromRecipeDetail() {
    openView(previousViewBeforeRecipe || 'recipes');
}
window.goBackFromRecipeDetail = goBackFromRecipeDetail;

allSocialPostsCache = allSocialPostsCache || [];

/* =========================================================
   SOCIAL - CHIA SE CONG THUC
========================================================= */


function isUserLoggedIn() {
    return Boolean(getToken() && window.authState && window.authState.authenticated);
}

function requireAuth(actionName, callback) {
    if (isUserLoggedIn()) {
        if (typeof callback === 'function') callback();
        return true;
    }
    const modal = document.getElementById('loginModal');
    if (modal) modal.classList.add('show');

    let msg = 'Vui lòng đăng nhập hoặc đăng ký để sử dụng tính năng này!';
    switch (actionName) {
        case 'profile':
            msg = 'Vui lòng đăng nhập để xem và quản lý hồ sơ dinh dưỡng!';
            break;
        case 'chat':
            msg = 'Vui lòng đăng nhập để trò chuyện cùng Trợ lý AI FoodX!';
            break;
        case 'suggest':
            msg = 'Vui lòng đăng nhập để nhận gợi ý món ăn thông minh từ AI!';
            break;
        case 'fridge':
            msg = 'Vui lòng đăng nhập để theo dõi và quản lý tủ lạnh!';
            break;
        case 'plan':
            msg = 'Vui lòng đăng nhập để lên kế hoạch bữa ăn!';
            break;
        case 'shopping':
            msg = 'Vui lòng đăng nhập để quản lý danh sách đi chợ!';
            break;
        case 'recipe':
        case 'create':
            msg = 'Vui lòng đăng nhập để thêm / chia sẻ công thức mới!';
            break;
        case 'stats':
            msg = 'Vui lòng đăng nhập để xem thống kê dinh dưỡng & nấu nướng!';
            break;
        case 'favorites':
        case 'favorite':
        case 'save':
            msg = 'Vui lòng đăng nhập để lưu và xem các món ăn yêu thích!';
            break;
        case 'post':
        case 'social':
        case 'like':
        case 'comment':
            msg = 'Vui lòng đăng nhập để tương tác trên cộng đồng FoodX!';
            break;
    }
    showToast(msg, 'warning');
    return false;
}

/* =========================================================
   CHAT AI (Trợ lý AI FoodX — Đa phiên & Lịch sử theo tài khoản)
========================================================= */
let chatMode = 'chat';
let activeChatSessionId = null;
let chatSessionsCache = [];

function initChatForCurrentUser() {
    activeChatSessionId = null;
    chatSessionsCache = [];
    if (isUserLoggedIn()) {
        fetchChatSessions(false);
    }
}

function resetChatOnLogout() {
    activeChatSessionId = null;
    chatSessionsCache = [];
    const titleEl = document.getElementById('chatSessionTitle');
    if (titleEl) titleEl.innerText = 'Cuộc trò chuyện mới';
    const countEl = document.getElementById('chatSessionCount');
    if (countEl) countEl.innerText = '0';
    const body = document.getElementById('chatBody');
    if (body) body.innerHTML = '';
    const overlay = document.getElementById('chatSessionsOverlay');
    if (overlay) overlay.style.display = 'none';
}

function toggleChat() {
    const panel = document.getElementById('chatPanel');
    if (!panel) return;
    if (panel.classList.contains('open')) {
        closeChat();
    } else {
        openChat();
    }
}

async function openChat(mode) {
    if (!isUserLoggedIn()) {
        requireAuth('chat');
        return;
    }

    if (mode) setMode(mode);
    const panel = document.getElementById('chatPanel');
    if (panel) panel.classList.add('open');
    const badge = document.getElementById('fabBadge');
    if (badge) badge.style.display = 'none';

    loadAiStatus();

    // Nếu chưa có phiên nào đang chọn, tải danh sách và tự động chọn phiên gần nhất hoặc tạo mới
    if (!activeChatSessionId) {
        await fetchChatSessions(true);
    }

    setTimeout(() => {
        const input = document.getElementById('chatInputFx');
        if (input) input.focus();
    }, 350);
}

function closeChat() {
    const panel = document.getElementById('chatPanel');
    if (panel) panel.classList.remove('open');
    toggleChatSessions(false);
}

function toggleChatMaximize() {
    const panel = document.getElementById('chatPanel');
    const btn = document.getElementById('chatMaximizeBtn');
    if (!panel) return;

    panel.classList.toggle('maximized');
    const isMax = panel.classList.contains('maximized');
    if (btn) {
        btn.innerHTML = isMax ? '❐' : '⛶';
        btn.title = isMax ? 'Thu nhỏ kích thước cũ' : 'Phóng to tối đa';
    }

    if (!isMax) {
        const savedW = localStorage.getItem('foodx_chat_width');
        const savedH = localStorage.getItem('foodx_chat_height');
        panel.style.width = savedW ? savedW + 'px' : '';
        panel.style.height = savedH ? savedH + 'px' : '';
    }
}
window.toggleChatMaximize = toggleChatMaximize;

function initChatResizable() {
    const panel = document.getElementById('chatPanel');
    if (!panel) return;

    // Khôi phục kích thước người dùng đã lưu
    const savedW = localStorage.getItem('foodx_chat_width');
    const savedH = localStorage.getItem('foodx_chat_height');
    if (savedW && !panel.classList.contains('maximized')) {
        panel.style.width = Math.min(parseInt(savedW), window.innerWidth - 20) + 'px';
    }
    if (savedH && !panel.classList.contains('maximized')) {
        panel.style.height = Math.min(parseInt(savedH), window.innerHeight - 40) + 'px';
    }

    let startX = 0, startY = 0, startW = 0, startH = 0;
    let activeHandle = null;

    function onPointerDown(e, handleType) {
        if (panel.classList.contains('maximized')) return;
        activeHandle = handleType;
        const pt = e.touches ? e.touches[0] : e;
        startX = pt.clientX;
        startY = pt.clientY;
        startW = panel.offsetWidth;
        startH = panel.offsetHeight;

        panel.classList.add('resizing');
        document.addEventListener('mousemove', onPointerMove);
        document.addEventListener('mouseup', onPointerUp);
        document.addEventListener('touchmove', onPointerMove, { passive: false });
        document.addEventListener('touchend', onPointerUp);
        e.preventDefault();
    }

    function onPointerMove(e) {
        if (!activeHandle) return;
        const pt = e.touches ? e.touches[0] : e;
        if (!pt) return;

        const deltaX = startX - pt.clientX; // Kéo sang trái làm tăng width
        const deltaY = startY - pt.clientY; // Kéo lên trên làm tăng height

        const minW = 320;
        const maxW = window.innerWidth - 24;
        const minH = 400;
        const maxH = window.innerHeight - 40;

        if (activeHandle === 'left' || activeHandle === 'top-left') {
            const newW = Math.max(minW, Math.min(maxW, startW + deltaX));
            panel.style.width = newW + 'px';
            localStorage.setItem('foodx_chat_width', newW);
        }

        if (activeHandle === 'top' || activeHandle === 'top-left') {
            const newH = Math.max(minH, Math.min(maxH, startH + deltaY));
            panel.style.height = newH + 'px';
            localStorage.setItem('foodx_chat_height', newH);
        }

        if (e.cancelable) e.preventDefault();
    }

    function onPointerUp() {
        activeHandle = null;
        panel.classList.remove('resizing');
        document.removeEventListener('mousemove', onPointerMove);
        document.removeEventListener('mouseup', onPointerUp);
        document.removeEventListener('touchmove', onPointerMove);
        document.removeEventListener('touchend', onPointerUp);
    }

    document.getElementById('chatResizeLeft')?.addEventListener('mousedown', e => onPointerDown(e, 'left'));
    document.getElementById('chatResizeTop')?.addEventListener('mousedown', e => onPointerDown(e, 'top'));
    document.getElementById('chatResizeTopLeft')?.addEventListener('mousedown', e => onPointerDown(e, 'top-left'));

    document.getElementById('chatResizeLeft')?.addEventListener('touchstart', e => onPointerDown(e, 'left'), { passive: false });
    document.getElementById('chatResizeTop')?.addEventListener('touchstart', e => onPointerDown(e, 'top'), { passive: false });
    document.getElementById('chatResizeTopLeft')?.addEventListener('touchstart', e => onPointerDown(e, 'top-left'), { passive: false });
}

// Khởi chạy resize ngay
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatResizable);
} else {
    initChatResizable();
}

function setMode(m) {
    chatMode = m;
    const chatBtn = document.getElementById('modeChatBtn');
    const stepBtn = document.getElementById('modeStepBtn');
    if (chatBtn) chatBtn.classList.toggle('active', m === 'chat');
    if (stepBtn) stepBtn.classList.toggle('active', m === 'step');
}

/** Tải danh sách các phiên trò chuyện từ backend */
async function fetchChatSessions(autoSelectLatest = false) {
    if (!isUserLoggedIn()) return;
    try {
        const res = await fetch('/api/chat/sessions', {
            headers: {
                'Authorization': 'Bearer ' + getToken()
            }
        });
        if (res.status === 401 || res.status === 403) {
            setToken("");
            closeChat();
            requireAuth('chat');
            return;
        }
        const j = await res.json();
        if (j && j.success && Array.isArray(j.data)) {
            chatSessionsCache = j.data;
            updateChatSessionToolbar();
            renderChatSessionsList();

            if (autoSelectLatest) {
                if (chatSessionsCache.length > 0 && !activeChatSessionId) {
                    await switchChatSession(chatSessionsCache[0].id);
                } else if (!activeChatSessionId) {
                    await createChatSession('Cuộc trò chuyện mới', chatMode, false);
                }
            }
        }
    } catch (err) {
        console.warn('Không tải được danh sách phiên chat:', err);
    }
}

function updateChatSessionToolbar() {
    const countEl = document.getElementById('chatSessionCount');
    if (countEl) countEl.innerText = String(chatSessionsCache.length);

    const titleEl = document.getElementById('chatSessionTitle');
    if (titleEl) {
        const cur = chatSessionsCache.find(s => s.id === activeChatSessionId);
        titleEl.innerText = cur ? cur.title : 'Cuộc trò chuyện mới';
    }
}

function renderChatSessionsList() {
    const listEl = document.getElementById('chatSessionsList');
    if (!listEl) return;

    if (!chatSessionsCache || chatSessionsCache.length === 0) {
        listEl.innerHTML = `
            <div class="session-empty-state">
                <div class="session-empty-icon">💬</div>
                <div>Chưa có phiên trò chuyện nào.</div>
                <div style="font-size:11.5px;margin-top:4px;color:var(--text-soft)">Bấm "➕ Phiên mới" để bắt đầu!</div>
            </div>
        `;
        return;
    }

    listEl.innerHTML = chatSessionsCache.map(s => {
        const isActive = s.id === activeChatSessionId;
        const timeStr = formatChatSessionTime(s.updatedAt || s.createdAt);
        const modeText = s.mode === 'step' ? '👨‍🍳 Từng bước' : '💬 Hỏi đáp';
        const escapedTitle = escapeHtml(s.title || 'Cuộc trò chuyện mới');

        return `
            <div class="session-item ${isActive ? 'active' : ''}" onclick="switchChatSession(${s.id})">
                <div class="session-item-main">
                    <div class="session-item-title" title="${escapedTitle}">${escapedTitle}</div>
                    <div class="session-item-meta">
                        <span class="session-mode-badge">${modeText}</span>
                        <span class="session-item-time">🕒 ${timeStr}</span>
                    </div>
                </div>
                <div class="session-item-actions" onclick="event.stopPropagation()">
                    <button class="session-action-btn" title="Đổi tên" onclick="renameChatSession(${s.id}, event)">✏️</button>
                    <button class="session-action-btn delete-btn" title="Xóa phiên" onclick="deleteChatSession(${s.id}, event)">🗑️</button>
                </div>
            </div>
        `;
    }).join('');
}

function formatChatSessionTime(isoDateStr) {
    if (!isoDateStr) return '';
    try {
        const d = new Date(isoDateStr);
        if (isNaN(d.getTime())) return '';
        const now = new Date();
        const diffMs = now - d;
        const diffMin = Math.floor(diffMs / 60000);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);

        if (diffMin < 1) return 'Vừa xong';
        if (diffMin < 60) return `${diffMin} phút trước`;
        if (diffHour < 24) return `${diffHour} giờ trước`;
        if (diffDay < 7) return `${diffDay} ngày trước`;
        
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    } catch (e) {
        return '';
    }
}

/** Bật / tắt hiển thị danh sách các phiên trò chuyện */
function toggleChatSessions(force) {
    const overlay = document.getElementById('chatSessionsOverlay');
    if (!overlay) return;

    if (typeof force === 'boolean') {
        overlay.style.display = force ? 'flex' : 'none';
    } else {
        const isOpen = overlay.style.display === 'flex';
        overlay.style.display = isOpen ? 'none' : 'flex';
    }

    if (overlay.style.display === 'flex') {
        fetchChatSessions(false);
    }
}

/** Tạo một phiên chat mới */
async function createChatSession(title, mode, showSuccessToast = true) {
    if (!isUserLoggedIn()) {
        requireAuth('chat');
        return null;
    }

    const newTitle = title || 'Cuộc trò chuyện mới';
    const newMode = mode || chatMode || 'chat';

    try {
        const res = await fetch('/api/chat/sessions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + getToken()
            },
            body: JSON.stringify({ title: newTitle, mode: newMode })
        });
        if (res.status === 401 || res.status === 403) {
            setToken("");
            closeChat();
            requireAuth('chat');
            return null;
        }
        const j = await res.json();
        if (j && j.success && j.data) {
            const newSession = j.data;
            activeChatSessionId = newSession.id;
            
            chatSessionsCache = [newSession, ...chatSessionsCache.filter(s => s.id !== newSession.id)];
            updateChatSessionToolbar();
            renderChatSessionsList();

            // Xóa tin nhắn cũ và hiển thị lời chào phiên mới
            const body = document.getElementById('chatBody');
            if (body) {
                body.innerHTML = '';
                addMsg('Chào bạn! Mình là <b>Trợ lý AI FoodX</b> 👋<br>Hai đứa mình cùng trò chuyện để lên kế hoạch bữa ăn & khám phá công thức chuẩn vị cho bạn nhé!', 'ai', null);
            }

            setMode(newSession.mode || 'chat');
            toggleChatSessions(false);

            if (showSuccessToast) {
                showToast('Đã tạo phiên trò chuyện mới!', 'success');
            }
            return newSession;
        } else {
            showToast(j?.message || 'Không thể tạo phiên mới', 'error');
        }
    } catch (err) {
        console.error('Lỗi tạo phiên chat:', err);
    }
    return null;
}

/** Chuyển sang xem một phiên chat */
async function switchChatSession(sessionId) {
    if (!sessionId) return;
    if (!isUserLoggedIn()) {
        requireAuth('chat');
        return;
    }

    activeChatSessionId = sessionId;
    toggleChatSessions(false);
    updateChatSessionToolbar();
    renderChatSessionsList();

    const body = document.getElementById('chatBody');
    if (body) {
        body.innerHTML = '<div style="text-align:center;padding:24px;color:var(--text-soft);font-size:12.5px;">⏳ Đang tải nội dung phiên...</div>';
    }

    try {
        const res = await fetch(`/api/chat/sessions/${sessionId}`, {
            headers: {
                'Authorization': 'Bearer ' + getToken()
            }
        });
        const j = await res.json();
        if (j && j.success && j.data) {
            const sessionData = j.data.session;
            const messages = j.data.messages || [];

            if (sessionData) {
                setMode(sessionData.mode || 'chat');
                const titleEl = document.getElementById('chatSessionTitle');
                if (titleEl) titleEl.innerText = sessionData.title || 'Cuộc trò chuyện mới';
            }

            if (body) {
                body.innerHTML = '';
                if (messages.length === 0) {
                    addMsg('Chào bạn! Mình là <b>Trợ lý AI FoodX</b> 👋<br>Hai đứa mình cùng trò chuyện để lên kế hoạch bữa ăn & khám phá công thức chuẩn vị cho bạn nhé!', 'ai', null);
                } else {
                    messages.forEach(m => {
                        if (m.role === 'user') {
                            addMsg(escapeHtml(m.content), 'user');
                        } else {
                            const formatted = m.content.includes('<') ? m.content : formatAiReply(m.content);
                            addMsg(formatted, 'ai', null, m.content);
                            if (m.steps && Array.isArray(m.steps) && m.steps.length > 0) {
                                addSteps(m.steps);
                            }
                        }
                    });
                }
                body.scrollTop = body.scrollHeight;
            }
        } else {
            showToast(j?.message || 'Không thể tải phiên chat', 'error');
        }
    } catch (err) {
        console.error('Lỗi tải chi tiết phiên chat:', err);
        if (body) body.innerHTML = '<div class="msg ai error">Không tải được tin nhắn phiên này.</div>';
    }
}

/** Đổi tên phiên chat đang chọn */
function renameCurrentChatSession() {
    if (!activeChatSessionId) {
        showToast('Chưa có phiên chat nào được chọn', 'warning');
        return;
    }
    renameChatSession(activeChatSessionId);
}

/** Đổi tên phiên chat */
async function renameChatSession(sessionId, event) {
    if (event) event.stopPropagation();
    if (!sessionId) return;

    const cur = chatSessionsCache.find(s => s.id === sessionId);
    const oldTitle = cur ? cur.title : '';
    const newTitle = window.prompt('Nhập tiêu đề mới cho phiên trò chuyện:', oldTitle);

    if (newTitle === null) return;
    const trimmed = newTitle.trim();
    if (!trimmed) {
        showToast('Tiêu đề không được để trống', 'warning');
        return;
    }

    try {
        const res = await fetch(`/api/chat/sessions/${sessionId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + getToken()
            },
            body: JSON.stringify({ title: trimmed })
        });
        const j = await res.json();
        if (j && j.success) {
            showToast('Đã đổi tên phiên thành công', 'success');
            if (cur) cur.title = trimmed;
            updateChatSessionToolbar();
            renderChatSessionsList();
        } else {
            showToast(j?.message || 'Không thể đổi tên phiên', 'error');
        }
    } catch (err) {
        console.error('Lỗi đổi tên phiên chat:', err);
        showToast('Lỗi kết nối máy chủ', 'error');
    }
}

function isQuantityString(s) {
    if (!s) return false;
    const l = String(s).toLowerCase().trim();
    if (['vừa đủ', 'tùy thích', 'tùy khẩu vị', 'nêm nếm', '1 ít', 'ít'].some(q => l.includes(q))) {
        return true;
    }
    if (/\d/.test(l) && /(g|kg|gr|gram|ml|l|lít|lit|quả|trái|củ|nhánh|cây|muỗng|thìa|bát|chén|gói|tép|lát|lon|hộp|miếng|bó|bắp|con|khúc|nhúm|thìa cà phê|muỗng canh)/i.test(l)) {
        return true;
    }
    if (/^\d+(\s*[\.,\/]\s*\d+)?\s*(g|kg|gr|gram|ml|l|lít|lit|quả|trái|củ|nhánh|cây|muỗng|thìa|bát|chén|gói|tép|lát|lon|hộp|miếng|bó|bắp|con|khúc|phần)?$/i.test(l)) {
        return true;
    }
    return false;
}

function cleanPureName(name) {
    if (!name) return '';
    let clean = String(name).trim();
    clean = clean.replace(/[\*_~`]+/g, ' ');
    clean = clean.replace(/[\/\\#=\-]+/g, ' ');
    clean = clean.replace(/^\d+[\.\)\:\-]\s*/, '');
    clean = clean.replace(/^[•\+\-\*\.\,\:]+\s*/, '');
    clean = clean.replace(/[•\+\-\*\.\,\:\/\\#_]+$/, '');
    clean = clean.replace(/\s+/g, ' ').trim();
    if (clean.length > 0) {
        clean = clean.charAt(0).toUpperCase() + clean.slice(1);
    }
    return clean;
}

function cleanPureQuantity(qty) {
    if (!qty) return '1 phần';
    let clean = String(qty).trim();
    clean = clean.replace(/[\*_~`]+/g, ' ');
    clean = clean.replace(/[\/\\#=\-]+/g, ' ');
    const m = clean.match(/^([\d\.,\/\s]+(?:kg|g|gr|gram|ml|l|lít|lit|quả|trái|củ|nhánh|cây|muỗng|thìa|bát|chén|gói|tép|lát|lon|hộp|miếng|bó|bắp|con|khúc|thìa cà phê|muỗng canh|vừa đủ|tùy thích|ít)?)\b/i);
    if (m && m[1] && m[1].trim()) {
        clean = m[1].trim();
    }
    clean = clean.replace(/\s+/g, ' ').trim();
    return clean || '1 phần';
}

/** Xóa một phiên chat */
async function deleteChatSession(sessionId, event) {
    if (event) event.stopPropagation();
    if (!sessionId) return;

    const confirmed = window.confirm('Bạn có chắc chắn muốn xóa phiên trò chuyện này không? Toàn bộ tin nhắn trong phiên sẽ bị xóa.');
    if (!confirmed) return;

    try {
        const res = await fetch(`/api/chat/sessions/${sessionId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + getToken()
            }
        });
        const j = await res.json();
        if (j && j.success) {
            showToast('Đã xóa phiên trò chuyện', 'success');
            chatSessionsCache = chatSessionsCache.filter(s => s.id !== sessionId);

            if (activeChatSessionId === sessionId) {
                if (chatSessionsCache.length > 0) {
                    await switchChatSession(chatSessionsCache[0].id);
                } else {
                    activeChatSessionId = null;
                    await createChatSession('Cuộc trò chuyện mới', chatMode, false);
                }
            } else {
                updateChatSessionToolbar();
                renderChatSessionsList();
            }
        } else {
            showToast(j?.message || 'Không thể xóa phiên', 'error');
        }
    } catch (err) {
        console.error('Lỗi xóa phiên chat:', err);
        showToast('Lỗi kết nối máy chủ', 'error');
    }
}

function addMsg(text, who, cls, rawContent) {
    const body = document.getElementById('chatBody');
    if (!body) return null;
    const div = document.createElement('div');
    div.className = 'msg ' + who + (cls ? ' ' + cls : '');
    div.innerHTML = text;

    // Nếu là tin nhắn AI có chứa danh sách nguyên liệu hoặc công thức, gắn nút Thao tác nhanh
    if (who === 'ai' && rawContent) {
        const lower = rawContent.toLowerCase();
        const hasRecipeOrDish = lower.includes('nguyên liệu') || lower.includes('cần chuẩn bị') || lower.includes('thành phần') 
            || lower.includes('cách làm') || lower.includes('hướng dẫn') || lower.includes('công thức') || lower.includes('bước 1')
            || rawContent.includes('- ') || rawContent.includes('* ') || rawContent.includes('|');

        if (hasRecipeOrDish) {
            const btnWrap = document.createElement('div');
            btnWrap.style.cssText = 'margin-top: 10px; display: flex; gap: 8px; flex-wrap: wrap; align-items: center;';

            // Nút 1: Lưu món vào Danh sách Yêu thích
            const favBtn = document.createElement('button');
            favBtn.className = 'secondary-button ai-action-fav-btn';
            favBtn.style.cssText = 'padding: 6px 12px; font-size: 12px; border-radius: 8px; border: 1px solid #ef4444; color: #ef4444; background: rgba(239, 68, 68, 0.08); cursor: pointer; display: inline-flex; align-items: center; gap: 4px; font-weight: 600; transition: all 0.2s;';
            favBtn.innerHTML = '❤️ Lưu vào Yêu thích';
            favBtn.addEventListener('click', function () {
                saveAiRecipeToFavorites(rawContent, favBtn);
            });
            btnWrap.appendChild(favBtn);

            // Nút 2: Lưu công thức vào Kho công thức
            const recipeBtn = document.createElement('button');
            recipeBtn.className = 'secondary-button ai-action-recipe-btn';
            recipeBtn.style.cssText = 'padding: 6px 12px; font-size: 12px; border-radius: 8px; border: 1px solid var(--green); color: #fff; background: var(--green); cursor: pointer; display: inline-flex; align-items: center; gap: 4px; font-weight: 600; transition: all 0.2s;';
            recipeBtn.innerHTML = '📖 Lưu vào Kho món ăn';
            recipeBtn.addEventListener('click', function () {
                saveAiRecipeToCookbook(rawContent, recipeBtn);
            });
            btnWrap.appendChild(recipeBtn);

            // Nút 3: Thêm nguyên liệu vào Danh sách mua
            if (lower.includes('nguyên liệu') || lower.includes('thành phần') || lower.includes('chuẩn bị') || rawContent.includes('- ') || rawContent.includes('* ')) {
                const shopBtn = document.createElement('button');
                shopBtn.className = 'secondary-button ai-action-shop-btn';
                shopBtn.style.cssText = 'padding: 6px 12px; font-size: 12px; border-radius: 8px; border: 1px solid var(--border); color: var(--text); background: var(--card); cursor: pointer; display: inline-flex; align-items: center; gap: 4px; font-weight: 600; transition: all 0.2s;';
                shopBtn.innerHTML = '🛒 Thêm vào Danh sách mua';
                shopBtn.addEventListener('click', function () {
                    addAiIngredientsToShopping(rawContent);
                });
                btnWrap.appendChild(shopBtn);
            }

            div.appendChild(btnWrap);
        }
    }

    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
    return div;
}

async function saveAiRecipeToFavorites(rawContent, btnElement) {
    if (!isUserLoggedIn()) {
        requireAuth('favorite');
        return;
    }
    const origText = btnElement ? btnElement.innerHTML : '';
    if (btnElement) {
        btnElement.innerHTML = '⏳ Đang lưu...';
        btnElement.disabled = true;
    }
    showToast('Đang lưu món vào danh sách yêu thích...', 'info');

    try {
        // 1. Phân tích và tạo món trong database
        const res = await apiRequest('/api/recipes/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: rawContent })
        });

        if (res && res.id) {
            const recipeId = res.id;
            const title = res.title || 'Món ăn gợi ý';

            // 2. Đánh dấu đã lưu yêu thích ở backend
            try {
                await apiRequest('/api/recipes/' + recipeId + '/save', { method: 'POST' });
            } catch (_) {}

            // 3. Cập nhật state.favorites và savedPostsState
            const idKey = String(recipeId);
            if (!state.favorites.includes(recipeId) && !state.favorites.includes(idKey)) {
                state.favorites.push(recipeId);
            }

            savedPostsState[idKey] = {
                id: recipeId,
                title: title,
                imageUrl: res.imageUrl || '',
                cookTime: res.cookTime || 30,
                kcal: res.kcal || 350,
                description: res.description || '',
                ingredients: res.ingredients || [],
                instructions: res.instructions || '',
                steps: res.steps || [],
                savedAt: new Date().toISOString()
            };

            localStorage.setItem('foodx_saved_posts', JSON.stringify(savedPostsState));
            saveState();

            if (btnElement) {
                btnElement.innerHTML = '❤️ Đã lưu Yêu thích';
                btnElement.style.background = '#ef4444';
                btnElement.style.color = '#fff';
                btnElement.style.borderColor = '#ef4444';
                btnElement.disabled = false;
            }

            showToast(`Đã lưu "${title}" vào Danh sách Yêu thích! ❤️`, 'success');

            const toastEl = document.getElementById('toast');
            if (toastEl) {
                const favBtn = document.createElement('button');
                favBtn.textContent = 'Mở Yêu thích';
                favBtn.style.cssText = 'margin-left:10px;background:#ef4444;color:#fff;border:none;border-radius:8px;padding:5px 12px;font-weight:700;cursor:pointer;';
                favBtn.addEventListener('click', function () {
                    openView('favorites');
                    closeChat();
                });
                toastEl.appendChild(favBtn);
                toastEl.classList.add('show');
                clearTimeout(toastEl._tm);
                toastEl._tm = setTimeout(function () { toastEl.classList.remove('show'); }, 4000);
            }

            if (typeof renderFavorites === 'function') await renderFavorites();
            if (typeof renderRecipes === 'function') renderRecipes();
        } else {
            showToast('Đã lưu vào danh sách yêu thích thành công! ❤️', 'success');
        }
    } catch (err) {
        console.error('Lỗi lưu món AI vào yêu thích:', err);
        showToast('Không thể lưu món: ' + (err.message || 'Lỗi xử lý dữ liệu'), 'error');
        if (btnElement) {
            btnElement.innerHTML = origText || '❤️ Lưu vào Yêu thích';
            btnElement.disabled = false;
        }
    }
}
window.saveAiRecipeToFavorites = saveAiRecipeToFavorites;

async function saveAiRecipeToCookbook(rawContent, btnElement) {
    if (!isUserLoggedIn()) {
        requireAuth('recipes');
        return;
    }
    const origText = btnElement ? btnElement.innerHTML : '';
    if (btnElement) {
        btnElement.innerHTML = '⏳ Đang lưu...';
        btnElement.disabled = true;
    }
    showToast('Đang phân tích và lưu công thức vào kho...', 'info');
    try {
        const res = await apiRequest('/api/recipes/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: rawContent })
        });
        if (res && res.id) {
            showToast(`Đã lưu công thức "${res.title}" vào Kho món ăn! 🎉`, 'success');
            if (btnElement) {
                btnElement.innerHTML = '📖 Đã lưu Kho món';
                btnElement.style.background = '#059669';
                btnElement.disabled = false;
            }
            const toastEl = document.getElementById('toast');
            if (toastEl) {
                const viewBtn = document.createElement('button');
                viewBtn.textContent = 'Xem ngay';
                viewBtn.style.cssText = 'margin-left:10px;background:var(--green);color:#fff;border:none;border-radius:8px;padding:5px 12px;font-weight:700;cursor:pointer;';
                viewBtn.addEventListener('click', function () { openRecipeDetail(res.id); });
                toastEl.appendChild(viewBtn);
                toastEl.classList.add('show');
                clearTimeout(toastEl._tm);
                toastEl._tm = setTimeout(function () { toastEl.classList.remove('show'); }, 4000);
            }
            if (typeof loadRecipes === 'function') loadRecipes();
        } else {
            showToast('Đã lưu công thức thành công! 🎉', 'success');
        }
    } catch (err) {
        showToast('Không thể lưu công thức: ' + (err.message || 'Lỗi xử lý dữ liệu'), 'error');
        if (btnElement) {
            btnElement.innerHTML = origText || '📖 Lưu vào Kho món ăn';
            btnElement.disabled = false;
        }
    }
}

const ACTION_VERBS = [
    'đun', 'nấu', 'hầm', 'nêm', 'luộc', 'xào', 'chiên', 'rán', 'nướng', 'vớt', 'rửa',
    'cắt', 'thái', 'băm', 'ướp', 'trộn', 'khuấy', 'đổ', 'cho', 'thêm', 'giảm', 'bật',
    'tắt', 'dùng', 'sau khi', 'khi', 'để nguội', 'bày', 'múc', 'trụng', 'chần', 'phi',
    'rang', 'hấp', 'kho', 'om', 'xé', 'bóc', 'ngâm', 'chặt'
];

function isProceduralAction(text) {
    if (!text) return true;
    const lower = text.toLowerCase().trim();
    if (lower.length > 65) return true;
    for (let i = 0; i < ACTION_VERBS.length; i++) {
        const v = ACTION_VERBS[i];
        if (lower.startsWith(v + ' ') || lower === v) return true;
    }
    const badPhrases = [
        'đun sôi', 'đun nhẹ', 'lọc bỏ', 'vớt ra', 'rửa nhanh', 'chặt khúc', 'phi thơm',
        'để ráo', 'vừa ăn', 'tùy vào', 'trong 2-3 tiếng', 'cho vào nồi', 'tránh làm',
        'giữ lại', 'thành lửa nhỏ', 'sơ chế', 'thực hiện', 'bước', 'cách làm'
    ];
    for (let i = 0; i < badPhrases.length; i++) {
        if (lower.includes(badPhrases[i])) return true;
    }
    return false;
}

function parseIngredientFromText(rawLine) {
    if (!rawLine) return null;
    let line = String(rawLine).trim();

    // 1. Loại bỏ các ký tự thừa: /////, \\\\, markdown ***, ###, ===, ---
    line = line.replace(/[\*_~`]+/g, ' ');
    line = line.replace(/[\/\\#=\-]+/g, ' ');
    line = line.replace(/\s+/g, ' ').trim();

    // 2. Loại bỏ số thứ tự đầu dòng (1., 2), 3:) và bullet
    line = line.replace(/^\d+[\.\)\:\-]\s*/, '').trim();
    line = line.replace(/^[•\+\-\*\.\,\:]+\s*/, '').trim();

    if (!line || line.length < 2 || line.length > 80) return null;

    const lower = line.toLowerCase();
    const blacklist = [
        'nguyên liệu', 'thành phần', 'cần chuẩn bị', 'hướng dẫn', 'cách làm',
        'các bước', 'thực hiện', 'bước ', 'chúc bạn', 'thưởng thức', 'lưu ý',
        'sơ chế', 'chế biến', 'thời gian', 'khẩu phần', 'dinh dưỡng', 'calo',
        'kcal', 'công thức', 'mẹo nhỏ', 'bảo quản', 'ngon miệng', 'dưới đây là',
        'lợi ích', 'chất béo', 'vitamin', 'omega', 'protein', 'khoáng chất'
    ];
    if (blacklist.some(kw => lower.includes(kw))) {
        return null;
    }
    if (isProceduralAction(line)) {
        return null;
    }

    let name = line;
    let quantity = '1 phần';

    // Format A: trong ngoặc đơn - vd: Thịt ba chỉ (500g)
    const mParen = line.match(/^(.*?)\s*[\(\[]([^\)\]]+)[\)\]]$/);
    if (mParen && mParen[1].trim().length >= 2) {
        name = mParen[1].trim();
        quantity = mParen[2].trim();
    }
    // Format B: dấu hai chấm - vd: Thịt bò: 300g
    else if (line.includes(':')) {
        const parts = line.split(':');
        const p1 = parts[0].trim();
        const p2 = parts.slice(1).join(':').trim();
        if (p1 && p2) {
            if (isQuantityString(p2)) {
                name = p1;
                quantity = p2;
            } else {
                name = p2;
                quantity = p1;
            }
        }
    }
    // Format C: số lượng ở đầu - vd: 500g thịt ba chỉ, 2 củ cà rốt
    else {
        const mStart = line.match(/^(\d+(?:[\.,\/]\d+)?\s*(?:kg|g|gr|gram|ml|l|lít|lit|quả|trái|củ|nhánh|cây|muỗng|thìa|bát|chén|gói|tép|lát|lon|hộp|miếng|bó|bắp|con)?)\s+(.*)$/i);
        if (mStart && mStart[1] && mStart[2] && mStart[2].trim().length >= 2) {
            quantity = mStart[1].trim();
            name = mStart[2].trim();
        } else {
            // Format D: số lượng ở cuối - vd: Thịt ba chỉ 500g
            const mEnd = line.match(/^(.*?)\s+(\d+(?:[\.,\/]\d+)?\s*(?:kg|g|gr|gram|ml|l|lít|lit|quả|trái|củ|nhánh|cây|muỗng|thìa|bát|chén|gói|tép|lát|lon|hộp|miếng|bó|bắp|con))$/i);
            if (mEnd && mEnd[1] && mEnd[2] && mEnd[1].trim().length >= 2) {
                name = mEnd[1].trim();
                quantity = mEnd[2].trim();
            }
        }
    }

    name = cleanPureName(name);
    quantity = cleanPureQuantity(quantity);

    if (isProceduralAction(name)) return null;
    if (!name || name.length < 2) return null;
    return { name: name, quantity: quantity || '1 phần' };
}

async function addAiIngredientsToShopping(rawContent) {
    if (!isUserLoggedIn()) {
        requireAuth('shopping');
        return;
    }
    const lines = String(rawContent || '').split('\n');
    const itemsToAdd = [];
    let isIngSection = false;
    let hasExplicitSection = false;

    for (const line of lines) {
        const l = line.toLowerCase();
        if (l.includes('nguyên liệu') || l.includes('thành phần') || l.includes('chuẩn bị') || l.includes('gia vị cần')) {
            hasExplicitSection = true;
            break;
        }
    }

    for (const rawLine of lines) {
        const lineClean = rawLine.trim();
        if (!lineClean) continue;
        const lower = lineClean.toLowerCase();

        // Kiểm tra bắt đầu vùng nguyên liệu
        if (lower.includes('nguyên liệu') || lower.includes('thành phần') || lower.includes('chuẩn bị')) {
            isIngSection = true;
            continue;
        }
        // Kiểm tra kết thúc vùng nguyên liệu -> Nếu đã vào vùng bước làm, NGẮT NGAY LẬP TỨC
        if (isIngSection && (lower.includes('hướng dẫn') || lower.includes('cách làm') || lower.includes('các bước') || lower.includes('thực hiện') || lower.includes('bước 1') || lower.includes('bước 2') || lower.includes('bước 3') || lower.includes('sơ chế') || lower.includes('chế biến') || lower.includes('công đoạn') || lower.includes('nấu nước dùng') || lower.includes('trụng bánh') || lower.includes('thành phẩm') || lower.includes('thưởng thức') || lower.includes('lưu ý') || lower.includes('chúc bạn'))) {
            isIngSection = false;
            break;
        }

        if (hasExplicitSection && !isIngSection) {
            continue;
        }

        // Xử lý dòng bảng Markdown (ví dụ: | Nước dùng | Xương bò | 1kg | HOẶC | Dầu ô liu | 1 thìa | Lợi ích |)
        if (lineClean.startsWith('|') && lineClean.endsWith('|')) {
            if (lineClean.includes('---')) continue;
            const cells = lineClean.split('|').map(function (c) { return c.trim(); }).filter(function (_, idx, arr) { return idx > 0 && idx < arr.length - 1; });
            if (['nguyên liệu', 'định lượng', 'thành phần', 'số lượng', 'đơn vị', 'lợi ích', 'dinh dưỡng', 'ghi chú', 'bước', 'thao tác', 'hướng dẫn'].some(function (h) { return lower.includes(h); })) {
                continue;
            }
            const nonEmpty = cells.filter(Boolean);
            if (!nonEmpty.length) continue;

            let name = '', qty = '1 phần';
            if (nonEmpty.length === 1) {
                name = nonEmpty[0];
            } else if (nonEmpty.length === 2) {
                if (isQuantityString(nonEmpty[0]) && !isQuantityString(nonEmpty[1])) {
                    qty = nonEmpty[0];
                    name = nonEmpty[1];
                } else {
                    name = nonEmpty[0];
                    qty = nonEmpty[1];
                }
            } else {
                const c0 = nonEmpty[0], c1 = nonEmpty[1], c2 = nonEmpty[2];
                if (isQuantityString(c1)) {
                    // Bảng dạng: | Tên nguyên liệu | Định lượng | Lợi ích dinh dưỡng / Ghi chú |
                    name = c0;
                    qty = c1;
                } else if (isQuantityString(c2)) {
                    // Bảng dạng: | Nhóm phân loại | Tên nguyên liệu | Định lượng |
                    name = c1;
                    qty = c2;
                } else {
                    name = c0;
                    qty = c1;
                }
            }

            name = cleanPureName(name);
            qty = cleanPureQuantity(qty);

            if (isProceduralAction(name)) continue;

            if (name && name.length >= 2) {
                if (!itemsToAdd.some(function (i) { return i.name.toLowerCase() === name.toLowerCase(); })) {
                    itemsToAdd.push({ name: name, quantity: qty || '1 phần' });
                }
            }
            continue;
        }

        const parsed = parseIngredientFromText(lineClean);
        if (parsed && parsed.name) {
            if (!itemsToAdd.some(i => i.name.toLowerCase() === parsed.name.toLowerCase())) {
                itemsToAdd.push(parsed);
            }
        }
    }

    if (itemsToAdd.length === 0) {
        showToast('Không tìm thấy dòng nguyên liệu phù hợp trong tin nhắn.', 'warning');
        return;
    }

    let addedCount = 0;
    for (const item of itemsToAdd) {
        try {
            await apiRequest('/api/shopping', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: item.name, quantity: item.quantity, price: 0, category: 'AI Gợi ý' })
            });
            addedCount++;
        } catch (_) {}
    }

    if (typeof renderShopping === 'function') await renderShopping();

    if (addedCount > 0) {
        showToast(`Đã thêm ${addedCount} nguyên liệu sạch vào Danh sách mua 🛒`, 'success');
    } else {
        showToast('Không thể thêm nguyên liệu vào danh sách mua.', 'error');
    }
}

function addSteps(steps) {
    const body = document.getElementById('chatBody');
    if (!body || !steps || !steps.length) return;
    const card = document.createElement('div');
    card.className = 'steps-card';
    card.innerHTML = '<div class="steps-title">📋 Các bước thực hiện</div>' +
        steps.map((s, i) => '<div class="step"><b>' + (i + 1) + '.</b>' + escapeHtml(s) + '</div>').join('');
    body.appendChild(card);
    body.scrollTop = body.scrollHeight;
}

function typing(on) {
    const body = document.getElementById('chatBody');
    if (!body) return;
    if (on) {
        const t = document.createElement('div');
        t.className = 'typing';
        t.id = 'typingInd';
        t.innerHTML = '<span></span><span></span><span></span>';
        body.appendChild(t);
        body.scrollTop = body.scrollHeight;
    } else {
        const t = document.getElementById('typingInd');
        if (t) t.remove();
    }
}



function formatAiReply(text) {
    if (!text) return '';

    let html = String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    // Table parsing
    const lines = html.split('\n');
    let inTable = false;
    let tableHtml = '';
    let parsedLines = [];

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (line.startsWith('|') && line.endsWith('|')) {
            if (line.includes('---')) continue;
            const cells = line.split('|').filter(function(_, idx, arr) { return idx > 0 && idx < arr.length - 1; });
            if (!inTable) {
                inTable = true;
                tableHtml = '<table class="ai-table"><thead><tr>' + cells.map(function(c) { return '<th>' + c.trim() + '</th>'; }).join('') + '</tr></thead><tbody>';
            } else {
                tableHtml += '<tr>' + cells.map(function(c) { return '<td>' + c.trim() + '</td>'; }).join('') + '</tr>';
            }
        } else {
            if (inTable) {
                inTable = false;
                tableHtml += '</tbody></table>';
                parsedLines.push(tableHtml);
                tableHtml = '';
            }
            parsedLines.push(line);
        }
    }
    if (inTable) {
        tableHtml += '</tbody></table>';
        parsedLines.push(tableHtml);
    }

    html = parsedLines.join('\n');

    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/^### (.*$)/gim, '<h4 class="ai-heading">$1</h4>');
    html = html.replace(/^## (.*$)/gim, '<h3 class="ai-heading">$1</h3>');
    html = html.replace(/^# (.*$)/gim, '<h2 class="ai-heading">$1</h2>');
    html = html.replace(/^&gt;\s?(.*$)/gim, '<blockquote class="ai-quote">$1</blockquote>');
    html = html.replace(/^\d+\.\s+(.*$)/gim, '<div class="ai-step-item">$1</div>');
    html = html.replace(/^[-*]\s+(.*$)/gim, '<div class="ai-bullet-item">$1</div>');
    html = html.replace(/\n/g, '<br>');
    html = html.replace(/<br><br>/g, '<br>');

    return html;
}

async function sendMessage() {
    const input = document.getElementById('chatInputFx');
    if (!input) return;
    const msg = input.value.trim();
    if (!msg) return;
    input.value = '';
    doSend(msg);
}

async function doSend(msg) {
    if (!isUserLoggedIn()) {
        requireAuth('chat');
        return;
    }

    addMsg(escapeHtml(msg), 'user');
    typing(true);
    const btn = document.getElementById('chatSendBtn');
    if (btn) btn.disabled = true;

    // Gather available ingredients from fridge items
    let ings = [];
    if (window.fridgeItemsCache && Array.isArray(window.fridgeItemsCache)) {
        ings = window.fridgeItemsCache.map(function(i) { return i.ingredientName || i.name; }).filter(Boolean);
    }

    try {
        // Đảm bảo có phiên chat đang active
        if (!activeChatSessionId) {
            const newS = await createChatSession(msg.length > 40 ? msg.substring(0, 40) + '…' : msg, chatMode, false);
            if (!newS) {
                typing(false);
                return;
            }
        }

        const res = await fetch(`/api/chat/sessions/${activeChatSessionId}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + getToken()
            },
            body: JSON.stringify({ message: msg, mode: chatMode, availableIngredients: ings })
        });

        if (res.status === 401 || res.status === 403) {
            setToken("");
            typing(false);
            closeChat();
            requireAuth('chat');
            return;
        }

        const j = await res.json();
        typing(false);

        if (j && j.success && j.data) {
            const replyText = j.data.reply || '';
            addMsg(formatAiReply(replyText), 'ai', null, replyText);
            if (j.data.steps && j.data.steps.length) {
                addSteps(j.data.steps);
            }
            // Tải lại danh sách phiên để cập nhật tiêu đề mới và thời gian
            fetchChatSessions(false);
        } else {
            showToast(j?.message || 'Có lỗi khi xử lý tin nhắn từ AI', 'error');
        }
    } catch (err) {
        typing(false);
        console.warn('Lỗi gửi tin nhắn AI:', err);
        showToast('Không thể kết nối đến máy chủ AI', 'error');
    } finally {
        if (btn) btn.disabled = false;
        const input = document.getElementById('chatInputFx');
        if (input) input.focus();
    }
}

/* =========================================================
   ONBOARDING HELPERS (SHARED CHIP TOGGLE — profile form)
========================================================= */
function toggleOnbChip(btn) {
    btn.classList.toggle('active');
}

function generateSmartFallbackReply(msg, ings) {
    const q = (msg || '').toLowerCase();
    const ingsStr = ings && ings.length ? 'Nguyên liệu sẵn có trong tủ lạnh của bạn: **' + ings.join(', ') + '**.' : '';

    if (q.includes('cá kho') || q.includes('kho tiêu') || q.includes('kho')) {
        return '**Bí Quyết Làm Cá Kho Tiêu Đậm Đà Đậm Vị Gia Đình**\n\n' +
            '### 1. Nguyên liệu chuẩn bị (cho 2-3 người)\n' +
            '- Cá lóc, cá thu hoặc basa: 500g (rửa sạch, ráo nước)\n' +
            '- Tiêu đen xay, tỏi băm, hành tím băm, ớt tươi\n' +
            '- Nước mắm ngon, đường, hạt nêm, dầu ăn\n\n' +
            '### 2. Các bước thực hiện\n' +
            '1. **Ướp cá:** Ướp cá với 2 thìa nước mắm, 1 thìa đường, 1/2 thìa tiêu và tỏi hành băm trong 20 phút.\n' +
            '2. **Thắng nước màu:** Cho 1 thìa đường vào dầu nóng đun nhỏ lửa đến khi chuyển màu cánh gián thơm.\n' +
            '3. **Kho cá:** Cho cá vào đảo lật 2 mặt cho săn lại. Đổ nước sấp mặt cá đun sôi rồi hạ lửa nhỏ kho 25 phút.\n' +
            '4. **Hoàn thành:** Rắc tiêu xay và ớt thái lát lên trên. Dùng với cơm nóng tuyệt ngon!\n\n' +
            '> 💡 *' + (ingsStr || 'Mẹo: Kho 2 lần lửa cá sẽ săn thịt và ngấm vị đậm đà hơn!') + '*';
    } else if (q.includes('phở') || q.includes('bún')) {
        return '**Hướng Dẫn Nấu Phở Bò Thơm Ngon Chuẩn Vị Hà Nội**\n\n' +
            '### 1. Chuẩn bị nước dùng\n' +
            '- Ninh xương ống bò 3-4 tiếng cùng gừng nướng, hành nướng, hoa hồi, quế, thảo quả.\n' +
            '- Nêm nước mắm ngon và chút đường phèn cho vị ngọt dịu thanh mát.\n\n' +
            '### 2. Thưởng thức\n' +
            '- Chần bánh phở tươi qua nước sôi, xếp vào tô.\n' +
            '- Xếp thịt bò tái hoặc nạm, rắc hành lá thái nhỏ.\n' +
            '- Chan nước dùng sôi sùng sục và ăn kèm chanh ớt tươi!';
    } else if (q.includes('gà') || q.includes('ức gà') || q.includes('eat clean')) {
        return '**Gợi Ý Món Gà Áp Chảo Sốt Bơ Chanh Healthy**\n\n' +
            '### 1. Nguyên liệu\n' +
            '- Ức gà 300g (thái lát vừa ăn)\n' +
            '- Chanh tươi, bơ lạt, tỏi băm, muối pepper, xà lách\n\n' +
            '### 2. Cách làm\n' +
            '1. Ướp ức gà với chút muối, tiêu và tỏi băm 10 phút.\n' +
            '2. Áp chảo ức gà với bơ lạt đến khi vàng đều 2 mặt.\n' +
            '3. Vắt chanh tươi tạo nước sốt chua nhẹ béo ngậy.\n\n' +
            '> 📌 *' + (ingsStr || 'Món ăn cực giàu đạm và hỗ trợ giảm cân hiệu quả!') + '*';
    } else {
        return 'Chào bạn! Mình là **Trợ lý AI Nấu ăn FoodX** 🍳\n\n' +
            'Mình luôn sẵn sàng tư vấn công thức nấu ăn, mẹo bảo quản thực phẩm và gợi ý món ngon cho gia đình bạn.\n\n' +
            'Bạn có thể hỏi mình: *"Cách nấu cá kho tiêu"*, *"Cách làm cơm chiên trứng"*, *"Gợi ý món tối nay"*...\n\n' +
            '> 💡 *' + (ingsStr || 'Hãy nhập câu hỏi của bạn bên dưới nhé!') + '*';
    }
}

function heroSearchSubmit(e) {
    if (e) e.preventDefault();
    if (!isUserLoggedIn()) {
        requireAuth('chat');
        return false;
    }
    const input = document.getElementById('heroSearchInput') || document.getElementById('heroSearchInputApp');
    if (!input) return false;
    const val = input.value.trim();
    if (!val) {
        showToast('Bạn muốn ăn gì? Hãy gõ nguyên liệu hoặc tên món vào ô tìm kiếm nhé 😉', 'info');
        return false;
    }
    openChat();
    doSend(val);
    return false;
}

function askFromTag(q) {
    if (!isUserLoggedIn()) {
        requireAuth('chat');
        return;
    }
    openChat();
    doSend(q);
}

async function loadAiStatus() {
    const setUi = (mock, provider) => {
        const statusText = document.getElementById('chatStatusText');
        const dot = document.getElementById('chatDot');
        if (statusText) {
            statusText.textContent = mock
                ? 'Dữ liệu mẫu • Trợ lý Sẵn sàng'
                : (provider === 'groq' ? 'Groq AI • Trực tuyến' : 'Gemini AI • Trực tuyến');
        }
        if (dot) dot.classList.toggle('live', !mock);
    };

    setUi(true, 'mock');

    try {
        const res = await fetch('/api/ai/status');
        if (res.ok) {
            const j = await res.json();
            if (j && j.success && j.data) {
                const provider = j.data.provider || 'gemini';
                setUi(!!j.data.mock, provider);
            }
        }
    } catch (e) {
        setUi(true, 'mock');
    }
}

window.createChatSession = createChatSession;
window.switchChatSession = switchChatSession;
window.deleteChatSession = deleteChatSession;
window.toggleChatSessions = toggleChatSessions;
window.renameCurrentChatSession = renameCurrentChatSession;
window.openChat = openChat;
window.closeChat = closeChat;
window.toggleChat = toggleChat;
window.setMode = setMode;
window.sendMessage = sendMessage;
window.askFromTag = function (text) {
    const input = document.getElementById('chatInputFx');
    if (input) {
        input.value = text;
        sendMessage();
    }
};

(function initChat() {
    const body = document.getElementById('chatBody');
    if (body && !body.childElementCount) {
        addMsg('Chào bạn! Mình là <b>Trợ lý AI FoodX</b> 👋<br>Hỏi mình bất cứ điều gì về nấu nướng — công thức, mẹo hay gợi ý món ăn nhé!', 'ai');
    }
    loadAiStatus();
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeChat(); });

    const newBtn = document.getElementById('chatNewSession');
    if (newBtn) {
        newBtn.addEventListener('click', function (e) {
            e.preventDefault();
            createChatSession('Cuộc trò chuyện mới', chatMode || 'chat', true);
        });
    }
})();


/* =========================================================
   ONBOARDING WIZARD
========================================================= */

const ONB_KEY = "foodx_onboarding_done";

const onbState = {
    cuisines: [],
    spice: 1,
    favs: [],
    goals: [],
    goalOther: "",
    eaters: "3-4 người",
    cooktime: "15-30 phút",
    allergies: [],
    diet: "Không",
    calo: 2000,
    equip: []
};


// Module window exports
if (typeof window !== 'undefined') window.addChatMessage = addChatMessage;
if (typeof window !== 'undefined') window.updateChatContextBanner = updateChatContextBanner;
if (typeof window !== 'undefined') window.openContextChat = openContextChat;
if (typeof window !== 'undefined') window.contextualRecipeAI = contextualRecipeAI;
if (typeof window !== 'undefined') window.fakeAI = fakeAI;
if (typeof window !== 'undefined') window.sendChat = sendChat;
if (typeof window !== 'undefined') window.goToFoodSearch = goToFoodSearch;
if (typeof window !== 'undefined') window.renderAll = renderAll;
if (typeof window !== 'undefined') window.startFoodX = startFoodX;
if (typeof window !== 'undefined') window.isUserLoggedIn = isUserLoggedIn;
if (typeof window !== 'undefined') window.requireAuth = requireAuth;
if (typeof window !== 'undefined') window.initChatForCurrentUser = initChatForCurrentUser;
if (typeof window !== 'undefined') window.resetChatOnLogout = resetChatOnLogout;
if (typeof window !== 'undefined') window.initChatResizable = initChatResizable;
if (typeof window !== 'undefined') window.fetchChatSessions = fetchChatSessions;
if (typeof window !== 'undefined') window.updateChatSessionToolbar = updateChatSessionToolbar;
if (typeof window !== 'undefined') window.renderChatSessionsList = renderChatSessionsList;
if (typeof window !== 'undefined') window.formatChatSessionTime = formatChatSessionTime;
if (typeof window !== 'undefined') window.renameChatSession = renameChatSession;
if (typeof window !== 'undefined') window.isQuantityString = isQuantityString;
if (typeof window !== 'undefined') window.cleanPureName = cleanPureName;
if (typeof window !== 'undefined') window.cleanPureQuantity = cleanPureQuantity;
if (typeof window !== 'undefined') window.addMsg = addMsg;
if (typeof window !== 'undefined') window.saveAiRecipeToCookbook = saveAiRecipeToCookbook;
if (typeof window !== 'undefined') window.isProceduralAction = isProceduralAction;
if (typeof window !== 'undefined') window.parseIngredientFromText = parseIngredientFromText;
if (typeof window !== 'undefined') window.addAiIngredientsToShopping = addAiIngredientsToShopping;
if (typeof window !== 'undefined') window.addSteps = addSteps;
if (typeof window !== 'undefined') window.typing = typing;
if (typeof window !== 'undefined') window.formatAiReply = formatAiReply;
if (typeof window !== 'undefined') window.doSend = doSend;
if (typeof window !== 'undefined') window.toggleOnbChip = toggleOnbChip;
if (typeof window !== 'undefined') window.generateSmartFallbackReply = generateSmartFallbackReply;
if (typeof window !== 'undefined') window.heroSearchSubmit = heroSearchSubmit;
if (typeof window !== 'undefined') window.loadAiStatus = loadAiStatus;
