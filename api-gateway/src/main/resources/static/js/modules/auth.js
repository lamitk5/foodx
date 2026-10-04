/**
 * FoodX - Authentication, Profile & Access Control Module (auth.js)
 * Xử lý form đăng nhập, đăng ký, JWT storage, quản lý hồ sơ người dùng, onboarding và trang quản trị
 */

/* =========================================================
   1. TOKEN MANAGEMENT & AUTH HTTP CLIENT
========================================================= */

function getToken() {
    try {
        return localStorage.getItem(TOKEN_KEY) || "";
    } catch (_) {
        return "";
    }
}

function setToken(token) {
    try {
        if (token) {
            localStorage.setItem(TOKEN_KEY, token);
        } else {
            localStorage.removeItem(TOKEN_KEY);
        }
    } catch (_) {}
}

async function authRequest(url, options = {}) {
    const isPublicAuthUrl = url.includes('/api/auth/register') || url.includes('/api/auth/login');
    const token = isPublicAuthUrl ? "" : getToken();

    const response = await fetch(url, {
        credentials: "same-origin",
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
            ...(token ? { Authorization: "Bearer " + token } : {})
        }
    });

    let data = null;
    const contentType = response.headers.get("content-type") || "";

    try {
        if (contentType.includes("application/json")) {
            data = await response.json();
        } else {
            const text = await response.text();
            data = text ? { message: text } : null;
        }
    } catch (error) {
        console.error("Lỗi đọc Auth response:", error);
    }

    if (!response.ok) {
        throw new Error(data?.message || `Có lỗi xảy ra (${response.status}).`);
    }

    if (data && typeof data === "object" && "success" in data && "data" in data) {
        return data.data;
    }

    return data;
}

function applyAuthResponse(data) {
    if (data?.accessToken) {
        setToken(data.accessToken);
    }

    const isAuth = Boolean(data?.accessToken || data?.userId || (getToken() && data?.username));
    authState = {
        authenticated: isAuth,
        userId: data?.userId ?? (isAuth ? authState.userId : null),
        fullName: data?.fullName || data?.username || (isAuth ? authState.fullName : ""),
        email: data?.email || (isAuth ? authState.email : ""),
        role: data?.role || (isAuth ? authState.role : ""),
        avatarUrl: data?.avatarUrl || (isAuth ? authState.avatarUrl : "")
    };
    window.authState = authState;

    if (authState.authenticated) {
        try {
            localStorage.setItem("foodx_user", JSON.stringify(authState));
        } catch (_) {}

        if (window.state) {
            state.userId = authState.userId;
            if (authState.fullName) state.profile.name = authState.fullName;
            if (authState.avatarUrl) state.profile.avatarUrl = authState.avatarUrl;
        }
        saveState();
        renderProfile();
        loadProfileFromApi(false);
        if (typeof window.loadFridgeFromApi === 'function') window.loadFridgeFromApi(false);
        if (typeof window.loadHomeDashboard === 'function') window.loadHomeDashboard();
        if (typeof window.loadSocialFeed === 'function') window.loadSocialFeed();
        if (typeof window.initChatForCurrentUser === 'function') window.initChatForCurrentUser();
    } else {
        try {
            localStorage.removeItem("foodx_user");
        } catch (_) {}

        if (window.state) {
            state.userId = null;
            state.profile = createDefaultState().profile;
            state.fridge = [];
            state.selectedFridgeIds = [];
        }
        saveState();
        if (typeof renderAll === 'function') renderAll();
        if (typeof window.loadHomeDashboard === 'function') window.loadHomeDashboard();
        if (typeof window.loadSocialFeed === 'function') window.loadSocialFeed();
        if (typeof window.resetChatOnLogout === 'function') window.resetChatOnLogout();
    }

    renderAuthSettings();
}

function renderAuthSettings() {
    const guestBox = document.getElementById("authGuestBox");
    const userBox = document.getElementById("authUserBox");

    if (guestBox) guestBox.hidden = authState.authenticated;
    if (userBox) userBox.hidden = !authState.authenticated;

    const adminMenuItem = document.getElementById("menuItemAdmin");
    if (adminMenuItem) {
        adminMenuItem.style.display = (authState && authState.authenticated && authState.role === "ADMIN") ? "flex" : "none";
    }

    if (!authState.authenticated) return;

    setText("authSettingsName", authState.fullName || "Người dùng Food X");
    setText("authSettingsEmail", authState.email || "");

    const avatar = document.getElementById("authSettingsAvatar");
    if (avatar) {
        avatar.src = authState.avatarUrl || DEFAULT_AVATAR;
        avatar.onerror = function () {
            this.onerror = null;
            this.src = DEFAULT_AVATAR;
        };
    }
}

async function loadAuthState(showErrorToast = false) {
    const token = getToken();
    if (!token) return false;

    try {
        const data = await authRequest(`${AUTH_API}/me`);
        if (data) {
            applyAuthResponse(data);
            return true;
        }
        return false;
    } catch (error) {
        const errMsg = String(error?.message || "");
        if (errMsg.includes("401") || errMsg.includes("403") || errMsg.includes("hết hạn") || errMsg.includes("Unauthorized")) {
            setToken("");
            try { localStorage.removeItem("foodx_user"); } catch (_) {}
            authState = {
                authenticated: false,
                userId: null,
                fullName: "",
                email: "",
                role: "",
                avatarUrl: ""
            };
            window.authState = authState;

            if (window.state) {
                state.userId = null;
                state.profile = createDefaultState().profile;
                saveState();
                renderAvatar();
            }

            renderAuthSettings();

            if (showErrorToast && typeof showToast === 'function') {
                showToast("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", "warning");
            }
        }
        return false;
    }
}


/* =========================================================
   2. AUTH GUARDS & MODAL ROUTING
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
        case 'profile': msg = 'Vui lòng đăng nhập để xem và quản lý hồ sơ dinh dưỡng!'; break;
        case 'chat': msg = 'Vui lòng đăng nhập để trò chuyện cùng Trợ lý AI FoodX!'; break;
        case 'suggest': msg = 'Vui lòng đăng nhập để nhận gợi ý món ăn thông minh từ AI!'; break;
        case 'fridge': msg = 'Vui lòng đăng nhập để theo dõi và quản lý tủ lạnh!'; break;
        case 'plan': msg = 'Vui lòng đăng nhập để lên kế hoạch bữa ăn!'; break;
        case 'shopping': msg = 'Vui lòng đăng nhập để quản lý danh sách đi chợ!'; break;
        case 'recipe':
        case 'create': msg = 'Vui lòng đăng nhập để thêm / chia sẻ công thức mới!'; break;
        case 'stats': msg = 'Vui lòng đăng nhập để xem thống kê dinh dưỡng & nấu nướng!'; break;
        default: break;
    }
    if (typeof showToast === 'function') showToast(msg, 'warning');
    return false;
}

function closeOtherModals(keepModalId = null) {
    document.querySelectorAll(".modal-overlay.show").forEach(modal => {
        if (!keepModalId || modal.id !== keepModalId) {
            modal.classList.remove("show");
            if (modal.id === "planMealModal" || modal.id === "shoppingRecipeModal") {
                modal.setAttribute("hidden", "");
                modal.style.display = "none";
            }
        }
    });
    document.body.style.overflow = "";
}

function openAuthModal(modalId) {
    document.getElementById("settingsPanel")?.classList.remove("show");
    document.getElementById("profilePanel")?.classList.remove("show");
    closeOtherModals(modalId);
    document.getElementById(modalId)?.classList.add("show");
}

function openLogin() {
    openAuthModal("loginModal");
    setTimeout(() => document.getElementById("loginEmail")?.focus(), 120);
}

function openRegister() {
    openAuthModal("registerModal");
    setTimeout(() => document.getElementById("registerFullName")?.focus(), 120);
}

function closeAuthModal() {
    document.getElementById("loginModal")?.classList.remove("show");
    document.getElementById("registerModal")?.classList.remove("show");
}


/* =========================================================
   3. LOGIN, REGISTER & LOGOUT FORM ACTIONS
========================================================= */

let isLoggingIn = false;

async function handleLoginSubmit(event) {
    if (event) event.preventDefault();
    if (isLoggingIn) return;

    const form = document.getElementById("loginForm");
    const submitButton = form?.querySelector('button[type="submit"]');
    isLoggingIn = true;
    if (submitButton) submitButton.disabled = true;

    const restore = typeof buttonLoading === 'function' ? buttonLoading(submitButton, "Đang đăng nhập...") : () => {};
    const email = document.getElementById("loginEmail")?.value.trim();
    const password = document.getElementById("loginPassword")?.value;

    if (!email || !password) {
        isLoggingIn = false;
        if (submitButton) submitButton.disabled = false;
        restore();
        showToast("Vui lòng nhập email / tên đăng nhập và mật khẩu.", "warning");
        return;
    }

    try {
        const data = await authRequest(`${AUTH_API}/login`, {
            method: "POST",
            body: JSON.stringify({ username: email, email: email, password: password })
        });

        applyAuthResponse(data);
        document.getElementById("loginModal")?.classList.remove("show");
        form?.reset();
        showToast(data?.message || "Đăng nhập thành công.", "success");
    } catch (error) {
        console.error("Login error:", error);
        showToast(error.message || "Đăng nhập thất bại.", "error");
    } finally {
        isLoggingIn = false;
        if (submitButton) submitButton.disabled = false;
        restore();
    }
}

async function handleRegisterSubmit(event) {
    if (event) event.preventDefault();
    const form = document.getElementById("registerForm");
    const submitButton = form?.querySelector('button[type="submit"]');
    const restore = typeof buttonLoading === 'function' ? buttonLoading(submitButton, "Đang tạo tài khoản...") : () => {};

    const fullName = document.getElementById("registerFullName")?.value.trim();
    const username = document.getElementById("registerUsername")?.value.trim();
    const email = document.getElementById("registerEmail")?.value.trim();
    const password = document.getElementById("registerPassword")?.value;
    const confirmPassword = document.getElementById("registerConfirmPassword")?.value;

    if (!fullName || !username || !email || !password || !confirmPassword) {
        restore();
        showToast("Hãy nhập đầy đủ thông tin.", "warning");
        return;
    }

    if (username.length < 3 || username.length > 50) {
        restore();
        showToast("Tên đăng nhập phải từ 3 đến 50 ký tự.", "warning");
        return;
    }

    if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
        restore();
        showToast("Tên đăng nhập chỉ được chứa chữ cái, số, dấu gạch dưới hoặc gạch nối.", "warning");
        return;
    }

    if (password.length < 6) {
        restore();
        showToast("Mật khẩu phải có ít nhất 6 ký tự.", "warning");
        return;
    }

    if (password !== confirmPassword) {
        restore();
        showToast("Mật khẩu nhập lại không khớp.", "warning");
        return;
    }

    try {
        const data = await authRequest(`${AUTH_API}/register`, {
            method: "POST",
            body: JSON.stringify({
                username: username,
                fullName: fullName,
                email: email,
                password: password,
                confirmPassword: confirmPassword
            })
        });

        applyAuthResponse(data);
        showToast(data?.message || "Tạo tài khoản thành công!", "success");

        document.getElementById("registerModal")?.classList.remove("show");
        form?.reset();

        setTimeout(() => {
            showOnboarding();
        }, 300);
    } catch (error) {
        console.error("Register error:", error);
        showToast(error.message || "Không thể đăng ký tài khoản. Vui lòng kiểm tra lại!", "error");
    } finally {
        restore();
    }
}

async function handleLogout(event) {
    const confirmed = window.confirm("Bạn muốn đăng xuất khỏi Food X?");
    if (!confirmed) return;

    const btn = event ? event.currentTarget : document.getElementById("logoutButton");
    const restore = typeof buttonLoading === 'function' ? buttonLoading(btn, "Đang đăng xuất...") : () => {};

    try {
        setToken("");
        applyAuthResponse({});
        document.getElementById("settingsPanel")?.classList.remove("show");
        try { localStorage.removeItem("foodx_onboarding_done"); } catch (_) {}
        showToast("Đã đăng xuất.", "success");
    } catch (error) {
        console.error("Logout error:", error);
        showToast(error.message || "Không đăng xuất được.", "error");
    } finally {
        restore();
    }
}

function initPasswordToggles() {
    document.querySelectorAll('.btn-toggle-password').forEach(btn => {
        if (btn.dataset.initialized) return;
        btn.dataset.initialized = "true";
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = btn.getAttribute('data-target');
            const input = document.getElementById(targetId);
            if (input) {
                const isPassword = input.type === 'password';
                input.type = isPassword ? 'text' : 'password';
                btn.textContent = isPassword ? '🙈' : '👁️';
            }
        });
    });
}


/* =========================================================
   4. USER PROFILE & NUTRITION GOAL MANAGEMENT
========================================================= */

function calculateBMI(weight, heightCm) {
    if (!weight || !heightCm) return 0;
    const height = heightCm / 100;
    return weight / (height * height);
}

function getAdultBMIStatus(bmi) {
    if (bmi < 18.5) return { key: "under", title: "Thiếu cân", description: "Cân nặng hiện thấp hơn khoảng BMI tham khảo." };
    if (bmi < 25) return { key: "healthy", title: "Cân đối", description: "Chỉ số BMI nằm trong khoảng hợp lý." };
    if (bmi < 30) return { key: "over", title: "Thừa cân", description: "Cân nặng cao hơn khoảng tham khảo chuẩn." };
    return { key: "obese", title: "Béo phì", description: "Nên ưu tiên kiểm soát calo và tăng vận động." };
}

function calculateCalories(gender, age, weight, height, activity, target) {
    if (age < 18 || !weight || !height) return 0;
    let bmr = gender === "female"
        ? 10 * weight + 6.25 * height - 5 * age - 161
        : 10 * weight + 6.25 * height - 5 * age + 5;

    let calories = bmr * Number(activity || 1.2);
    if (target && target < weight - 1) calories *= 0.90;
    if (target && target > weight + 1) calories *= 1.08;
    calories = Math.max(1200, Math.min(4000, calories));
    return Math.round(calories / 10) * 10;
}

function getGoal() {
    const weight = Number(state.profile.weight);
    const target = Number(state.profile.target);
    if (target < weight - 1) return "Giảm cân";
    if (target > weight + 1) return "Tăng cân";
    return "Duy trì cân nặng";
}

function getDietDescription(diet) {
    switch (diet) {
        case "Eat clean": return "ưu tiên thực phẩm ít chế biến, rau củ và nguồn đạm phù hợp";
        case "Nhiều đạm": return "ưu tiên món giàu protein";
        case "Ít carb": return "ưu tiên món hạn chế carbohydrate";
        case "Ăn chay": return "ưu tiên công thức không sử dụng thịt";
        case "Ăn linh tinh": return "không khóa theo chế độ cố định, mà cân bằng theo nguyên liệu và mục tiêu";
        default: return "ưu tiên chế độ ăn cân bằng";
    }
}

function renderAvatar() {
    const avatar = (state.profile.avatarUrl && String(state.profile.avatarUrl).trim() !== "")
        ? state.profile.avatarUrl
        : ((authState.avatarUrl && String(authState.avatarUrl).trim() !== "") ? authState.avatarUrl : DEFAULT_AVATAR);

    const avatarElements = [
        ...document.querySelectorAll(".user-avatar-sync"),
        document.getElementById("headerAvatar"),
        document.getElementById("profileMenuAvatar"),
        document.getElementById("profileAvatarPreview"),
        document.getElementById("authSettingsAvatar")
    ].filter(Boolean);

    if (authState) authState.avatarUrl = avatar;

    avatarElements.forEach(element => {
        element.src = avatar;
        element.onerror = function () {
            this.onerror = null;
            this.src = DEFAULT_AVATAR;
        };
    });

    const removeButton = document.getElementById("removeAvatarButton");
    if (removeButton) {
        removeButton.style.display = (state.profile.avatarUrl && String(state.profile.avatarUrl).trim() !== "") ? "inline-flex" : "none";
    }
}

function renderProfile() {
    const p = state.profile;
    const bmi = calculateBMI(p.weight, p.height);
    const calories = calculateCalories(p.gender, p.age, p.weight, p.height, p.activity, p.target);

    setText("quickName", p.name);
    setText("quickWeight", `${p.weight} kg`);
    setText("quickHeight", `${p.height} cm`);
    setText("quickTarget", `${p.target} kg`);
    setText("quickBmi", bmi ? bmi.toFixed(1) : "--");
    setText("quickCalories", calories ? `${formatNumber(calories)} kcal` : "--");
    setText("quickDiet", p.diet);
    setText("dailyCalories", calories ? formatNumber(calories) : "--");

    const profileNote = document.getElementById("profileAiNote");
    if (profileNote) {
        profileNote.textContent = `${getGoal()} • ${p.diet}. Food X sẽ ưu tiên công thức phù hợp với hồ sơ.`;
    }

    const smart = document.getElementById("smartSuggestion");
    if (smart) {
        smart.textContent = calories
            ? `${getGoal()}. Năng lượng tham khảo khoảng ${formatNumber(calories)} kcal/ngày.`
            : "Food X đang phân tích hồ sơ.";
    }

    renderAvatar();
}

function fillProfileForm() {
    const p = state.profile || {};
    const values = {
        profileName: p.name,
        profilePhone: p.phone,
        profileGender: p.gender,
        profileAge: p.age,
        profileWeight: p.weight,
        profileHeight: p.height,
        profileTarget: p.target,
        profileActivity: p.activity,
        profileDiet: p.diet,
        profileAllergies: p.allergies,
        profileDislikes: p.dislikes
    };

    Object.entries(values).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (!element) return;
        if (id === "profileDiet") {
            const exists = Array.from(element.options).some(option => option.value === value);
            element.value = exists ? value : "Cân bằng";
        } else {
            element.value = value ?? "";
        }
    });

    renderAvatar();
}

function apiProfileToState(data) {
    return {
        name: data.name || authState.fullName || "Người dùng Food X",
        avatarUrl: data.avatarUrl || authState.avatarUrl || "",
        gender: data.gender || "male",
        age: Number(data.age || 25),
        weight: Number(data.weight || 60),
        height: Number(data.height || 165),
        target: Number(data.target || 60),
        activity: Number(data.activity || 1.2),
        diet: data.diet || "Cân bằng",
        allergies: data.allergies || "",
        dislikes: data.dislikes || ""
    };
}

async function loadProfileFromApi(showErrorToast = true) {
    try {
        const data = await apiRequest(PROFILE_API);
        if (data) {
            state.userId = data.userId;
            state.profile = apiProfileToState(data);
            saveState();
            renderProfile();
            if (typeof window.renderRecipes === 'function') window.renderRecipes();
            return true;
        }
        return false;
    } catch (error) {
        console.warn("Không tải được profile từ server:", error);
        if (showErrorToast) showToast("Không tải được hồ sơ.", "error");
        return false;
    }
}

async function updateProfile(updatedData) {
    try {
        const res = await apiRequest(PROFILE_API, {
            method: 'PUT',
            body: JSON.stringify(updatedData)
        });
        if (res) {
            state.profile = apiProfileToState(res);
            saveState();
            renderProfile();
            showToast("Đã lưu thông tin hồ sơ!", "success");
            return true;
        }
    } catch (err) {
        showToast("Lỗi lưu hồ sơ: " + err.message, "error");
    }
    return false;
}

function updateHealthPreview() {
    const weight = Number(document.getElementById("profileWeight")?.value || 0);
    const height = Number(document.getElementById("profileHeight")?.value || 0);
    const age = Number(document.getElementById("profileAge")?.value || 0);
    const gender = document.getElementById("profileGender")?.value || "male";
    const activity = Number(document.getElementById("profileActivity")?.value || 1.2);
    const target = Number(document.getElementById("profileTarget")?.value || weight);

    const bmi = calculateBMI(weight, height);
    const calories = calculateCalories(gender, age, weight, height, activity, target);

    setText("previewBmi", bmi ? bmi.toFixed(1) : "--");
    setText("previewCalories", calories ? `${formatNumber(calories)} kcal` : "--");
}


/* =========================================================
   5. ONBOARDING WIZARD
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

function isOnboardingDone() {
    try {
        return localStorage.getItem(ONB_KEY) === "1";
    } catch (e) {
        return false;
    }
}

function markOnboardingDone() {
    try {
        localStorage.setItem(ONB_KEY, "1");
    } catch (e) {}
}

function showOnboarding() {
    const overlay = document.getElementById("onboardingOverlay");
    if (!overlay) return;
    overlay.classList.add("show");
    document.body.style.overflow = "hidden";
}

function hideOnboarding() {
    const overlay = document.getElementById("onboardingOverlay");
    if (!overlay) return;
    overlay.classList.remove("show");
    document.body.style.overflow = "";
    markOnboardingDone();
}

function showOnbStep(step) {
    document.querySelectorAll(".onboarding-screen").forEach(s => s.classList.remove("active"));
    const el = document.getElementById("onboardingStep" + step);
    if (el) el.classList.add("active");
}

function onbBuildChips(sel, items, store, multi) {
    const box = document.querySelector(sel);
    if (!box) return;
    box.innerHTML = items.map(function (it) {
        const val = typeof it === "string" ? it : it.label;
        const icon = typeof it === "object" && it.icon ? it.icon + " " : "";
        return '<button type="button" class="onb-chip" data-val="' + escapeHtml(val) + '">' + icon + escapeHtml(val) + '</button>';
    }).join("");

    box.addEventListener("click", function (e) {
        const chip = e.target.closest(".onb-chip");
        if (!chip) return;
        const val = chip.getAttribute("data-val");
        if (multi) {
            chip.classList.toggle("active");
            const idx = store.indexOf(val);
            if (idx >= 0) store.splice(idx, 1);
            else store.push(val);
        } else {
            box.querySelectorAll(".onb-chip").forEach(c => c.classList.remove("active"));
            chip.classList.add("active");
            store[0] = val;
        }
    });
}

function onbBindSeg(containerId, onChange) {
    const c = document.getElementById(containerId);
    if (!c) return;
    c.addEventListener("click", function (e) {
        const btn = e.target.closest(".onb-seg-btn");
        if (!btn) return;
        c.querySelectorAll(".onb-seg-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        if (onChange) onChange(btn.getAttribute("data-val"));
    });
}

function initOnboarding() {
    const overlay = document.getElementById("onboardingOverlay");
    if (!overlay) return;

    onbBuildChips("#onbCuisines", [
        { icon: "🇻🇳", label: "Món Việt" }, { icon: "🇰🇷", label: "Món Hàn" },
        { icon: "🇯🇵", label: "Món Nhật" }, { icon: "🥗", label: "Healthy / Salad" },
        { icon: "🥩", label: "Âu / Steak" }, { icon: "🌶️", label: "Món Thái" }
    ], onbState.cuisines, true);

    onbBuildChips("#onbFavs", ["Gà", "Bò", "Heo", "Hải sản", "Cá", "Đậu hũ", "Rau xanh", "Trứng", "Nấm", "Bún/Phở"], onbState.favs, true);
    onbBuildChips("#onbGoals", ["Giảm cân", "Tăng cơ", "Ăn lành mạnh (Eat Clean)", "Tiết kiệm thời gian", "Nấu cho gia đình", "Tiết kiệm chi phí"], onbState.goals, true);
    onbBuildChips("#onbAllergies", ["Hải sản", "Đậu phộng", "Sữa bò (Lactose)", "Trứng", "Gluten", "Không dị ứng"], onbState.allergies, true);
    onbBuildChips("#onbEquip", ["Nồi chiên không dầu", "Lò vi sóng", "Lò nướng", "Máy xay sinh tố", "Nồi áp suất", "Bếp từ / hồng ngoại"], onbState.equip, true);

    onbBindSeg("onbEaters", v => { onbState.eaters = v; });
    onbBindSeg("onbCooktime", v => { onbState.cooktime = v; });

    document.getElementById("onbSkip")?.addEventListener("click", hideOnboarding);
    document.getElementById("onb1Next")?.addEventListener("click", () => showOnbStep(2));
    document.getElementById("onb2Back")?.addEventListener("click", () => showOnbStep(1));
    document.getElementById("onb2Next")?.addEventListener("click", () => showOnbStep(3));
    document.getElementById("onb3Back")?.addEventListener("click", () => showOnbStep(2));
    document.getElementById("onbFinish")?.addEventListener("click", () => {
        hideOnboarding();
        showToast("✓ Thiết lập sở hữu vị thành công!", "success");
    });
}


/* =========================================================
   6. ADMIN MANAGEMENT PANEL
========================================================= */

let adminUsersCache = [];
let adminIngredientsCache = [];
let adminRecipesCache = [];
let adminSocialCache = [];
let currentAdminTab = 'users';

async function apiAdminCall(url, opts = {}) {
    if (typeof apiRequest === 'function') return await apiRequest(url, opts);
    const token = getToken();
    const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}), ...(token ? { Authorization: 'Bearer ' + token } : {}) };
    const res = await fetch(url, { ...opts, headers });
    if (!res.ok) throw new Error(await res.text() || `HTTP ${res.status}`);
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
        const data = await res.json();
        return (data && typeof data === 'object' && 'data' in data) ? data.data : data;
    }
    return null;
}

async function loadAdminDashboard() {
    const isAdmin = Boolean(window.authState && (window.authState.role === 'ADMIN' || window.authState.username === 'admin'));
    if (!isAdmin) {
        showToast('Chỉ tài khoản Quản trị viên (ADMIN) mới có quyền truy cập', 'error');
        if (typeof openView === 'function') openView('home');
        return;
    }

    try {
        const [usersRes, ingsRes, recipesRes, postsRes] = await Promise.allSettled([
            apiAdminCall('/api/admin/users'),
            apiAdminCall('/api/ingredients'),
            apiAdminCall('/api/recipes'),
            apiAdminCall('/api/social/posts')
        ]);

        if (usersRes.status === 'fulfilled' && usersRes.value) {
            adminUsersCache = Array.isArray(usersRes.value) ? usersRes.value : (usersRes.value.data || []);
            const uEl = document.getElementById('adminStatUsers');
            if (uEl) uEl.textContent = adminUsersCache.length;
        }

        if (ingsRes.status === 'fulfilled' && ingsRes.value) {
            adminIngredientsCache = Array.isArray(ingsRes.value) ? ingsRes.value : (ingsRes.value.data || []);
            const iEl = document.getElementById('adminStatIngredients');
            if (iEl) iEl.textContent = adminIngredientsCache.length;
        }

        if (recipesRes.status === 'fulfilled' && recipesRes.value) {
            adminRecipesCache = Array.isArray(recipesRes.value) ? recipesRes.value : (recipesRes.value.data || []);
            const rEl = document.getElementById('adminStatRecipes');
            if (rEl) rEl.textContent = adminRecipesCache.length;
        }

        if (postsRes.status === 'fulfilled' && postsRes.value) {
            adminSocialCache = Array.isArray(postsRes.value) ? postsRes.value : (postsRes.value.data || []);
            const pEl = document.getElementById('adminStatSocial');
            if (pEl) pEl.textContent = adminSocialCache.length;
        }

        renderCurrentAdminTab();
    } catch (err) {
        console.error('Error loading admin dashboard:', err);
    }
}

function switchAdminTab(tabName) {
    currentAdminTab = tabName;
    document.querySelectorAll('.admin-tab-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabName));
    document.querySelectorAll('.admin-tab-pane').forEach(pane => pane.classList.toggle('active', pane.id === 'adminTab-' + tabName));
    renderCurrentAdminTab();
}

function renderCurrentAdminTab() {
    if (currentAdminTab === 'users') renderAdminUsers();
    else if (currentAdminTab === 'ingredients') renderAdminIngredients();
    else if (currentAdminTab === 'recipes') renderAdminRecipes();
    else if (currentAdminTab === 'social') renderAdminSocial();
}

function renderAdminUsers() {
    const tbody = document.getElementById('adminUserTableBody');
    if (!tbody) return;

    const q = (document.getElementById('adminUserSearch')?.value || '').toLowerCase().trim();
    const roleFilter = document.getElementById('adminUserRoleFilter')?.value || 'ALL';

    const filtered = adminUsersCache.filter(u => {
        const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
        const matchQ = !q || (u.username && u.username.toLowerCase().includes(q)) || (u.email && u.email.toLowerCase().includes(q)) || (u.fullName && u.fullName.toLowerCase().includes(q));
        return matchRole && matchQ;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:32px; color:var(--text-soft);">Không tìm thấy người dùng phù hợp.</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map(u => {
        const isSelf = window.authState && window.authState.userId === u.id;
        const dateStr = u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : '—';
        const roleClass = u.role === 'ADMIN' ? 'admin-role-admin' : 'admin-role-user';
        const avatar = u.avatarUrl || DEFAULT_AVATAR;

        return `
            <tr>
                <td><strong>#${u.id}</strong></td>
                <td>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <img src="${avatar}" alt="${escapeHtml(u.fullName)}" class="admin-avatar" onerror="this.src='${DEFAULT_AVATAR}'">
                        <div>
                            <strong style="display:block; font-size:13.5px;">${escapeHtml(u.fullName || u.username)}</strong>
                            ${isSelf ? '<span style="font-size:11px; color:var(--green); font-weight:700;">(Tài khoản của bạn)</span>' : ''}
                        </div>
                    </div>
                </td>
                <td><code>${escapeHtml(u.username)}</code></td>
                <td>${escapeHtml(u.email)}</td>
                <td><span class="admin-role-badge ${roleClass}">${u.role}</span></td>
                <td>${dateStr}</td>
                <td>
                    <div style="display:flex; gap:6px;">
                        <button type="button" class="admin-action-btn" title="Chỉnh sửa người dùng" onclick="openAdminUserModal(${u.id})">✏️</button>
                        ${!isSelf ? `<button type="button" class="admin-action-btn btn-delete" title="Xóa người dùng" onclick="deleteAdminUser(${u.id}, '${escapeHtml(u.username)}')">🗑️</button>` : ''}
                    </div>
                </td>
            </tr>`;
    }).join('');
}

function openAdminUserModal(userId = null) {
    let modal = document.getElementById('adminUserModal');
    if (!modal) return;
    const titleEl = document.getElementById('adminUserModalTitle');
    const idInput = document.getElementById('admUserId');
    const uInput = document.getElementById('admUserUsername');
    const fnInput = document.getElementById('admUserFullName');
    const eInput = document.getElementById('admUserEmail');
    const pInput = document.getElementById('admUserPassword');
    const pLabel = document.getElementById('admUserPasswordLabel');
    const rSelect = document.getElementById('admUserRole');

    if (pInput) pInput.value = '';

    if (userId) {
        const u = adminUsersCache.find(x => x.id === userId);
        if (!u) return;
        if (idInput) idInput.value = u.id;
        if (titleEl) titleEl.textContent = '✏️ Chỉnh sửa người dùng #' + u.id;
        if (uInput) { uInput.value = u.username; uInput.disabled = true; }
        if (fnInput) fnInput.value = u.fullName || '';
        if (eInput) eInput.value = u.email || '';
        if (rSelect) rSelect.value = u.role || 'USER';
        if (pLabel) pLabel.textContent = 'Mật khẩu mới (để trống nếu không đổi)';
        if (pInput) pInput.required = false;
    } else {
        if (idInput) idInput.value = '';
        if (titleEl) titleEl.textContent = '➕ Thêm người dùng mới';
        if (uInput) { uInput.value = ''; uInput.disabled = false; }
        if (fnInput) fnInput.value = '';
        if (eInput) eInput.value = '';
        if (rSelect) rSelect.value = 'USER';
        if (pLabel) pLabel.textContent = 'Mật khẩu *';
        if (pInput) pInput.required = true;
    }

    modal.classList.add('show');
}

function closeAdminUserModal() {
    document.getElementById('adminUserModal')?.classList.remove('show');
}

async function handleAdminUserSubmit(e) {
    if (e) e.preventDefault();
    const id = document.getElementById('admUserId')?.value;
    const username = document.getElementById('admUserUsername')?.value.trim();
    const fullName = document.getElementById('admUserFullName')?.value.trim();
    const email = document.getElementById('admUserEmail')?.value.trim();
    const password = document.getElementById('admUserPassword')?.value;
    const role = document.getElementById('admUserRole')?.value || 'USER';

    try {
        if (id) {
            const body = { fullName, email, role };
            if (password) body.password = password;
            await apiAdminCall(`/api/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(body) });
            showToast('Cập nhật người dùng thành công!', 'success');
        } else {
            await apiAdminCall('/api/admin/users', {
                method: 'POST',
                body: JSON.stringify({ username, fullName, email, password, role })
            });
            showToast('Tạo người dùng mới thành công!', 'success');
        }
        closeAdminUserModal();
        const res = await apiAdminCall('/api/admin/users');
        adminUsersCache = Array.isArray(res) ? res : (res?.data || []);
        renderAdminUsers();
    } catch (err) {
        showToast('Lỗi lưu người dùng: ' + err.message, 'error');
    }
}

async function deleteAdminUser(id, username) {
    if (!confirm(`Bạn có chắc muốn xóa người dùng "${username}" (#${id})?`)) return;
    try {
        await apiAdminCall(`/api/admin/users/${id}`, { method: 'DELETE' });
        showToast('Đã xóa người dùng thành công!', 'success');
        adminUsersCache = adminUsersCache.filter(u => u.id !== id);
        renderAdminUsers();
    } catch (err) {
        showToast('Lỗi xóa người dùng: ' + err.message, 'error');
    }
}

function renderAdminIngredients() {
    const tbody = document.getElementById('adminIngTableBody');
    if (!tbody) return;
    if (!adminIngredientsCache.length) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:32px; color:var(--text-soft);">Chưa có nguyên liệu nào trong kho.</td></tr>';
        return;
    }
    tbody.innerHTML = adminIngredientsCache.map(ing => `
        <tr>
            <td><strong>#${ing.id}</strong></td>
            <td><strong>${escapeHtml(ing.name)}</strong></td>
            <td>${escapeHtml(ing.category || '—')}</td>
            <td>${ing.shelfLifeDays || 7} ngày</td>
            <td>${ing.defaultUnit || 'g'}</td>
            <td>
                <button type="button" class="admin-action-btn btn-delete" onclick="deleteAdminIngredient(${ing.id})">🗑️</button>
            </td>
        </tr>
    `).join('');
}

function openAdminIngredientModal() {
    document.getElementById('adminIngModal')?.classList.add('show');
}

function closeAdminIngredientModal() {
    document.getElementById('adminIngModal')?.classList.remove('show');
}

async function deleteAdminIngredient(id) {
    if (!confirm(`Bạn có chắc muốn xóa nguyên liệu #${id}?`)) return;
    try {
        await apiAdminCall(`/api/ingredients/${id}`, { method: 'DELETE' });
        showToast('Đã xóa nguyên liệu!', 'success');
        adminIngredientsCache = adminIngredientsCache.filter(i => i.id !== id);
        renderAdminIngredients();
    } catch (err) {
        showToast('Lỗi xóa nguyên liệu: ' + err.message, 'error');
    }
}

function renderAdminRecipes() {
    const tbody = document.getElementById('adminRecipeTableBody');
    if (!tbody) return;
    if (!adminRecipesCache.length) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:32px; color:var(--text-soft);">Chưa có công thức nào.</td></tr>';
        return;
    }
    tbody.innerHTML = adminRecipesCache.map(r => `
        <tr>
            <td><strong>#${r.id}</strong></td>
            <td><strong>${escapeHtml(r.title || r.name)}</strong></td>
            <td>${escapeHtml(r.category || '—')}</td>
            <td>${r.calories || r.kcal || 0} kcal</td>
            <td>
                <button type="button" class="admin-action-btn btn-delete" onclick="deleteAdminRecipe('${r.id}')">🗑️</button>
            </td>
        </tr>
    `).join('');
}

async function deleteAdminRecipe(id) {
    if (!confirm(`Bạn có chắc muốn xóa công thức #${id}?`)) return;
    try {
        await apiAdminCall(`/api/recipes/${id}`, { method: 'DELETE' });
        showToast('Đã xóa công thức!', 'success');
        adminRecipesCache = adminRecipesCache.filter(r => String(r.id) !== String(id));
        renderAdminRecipes();
    } catch (err) {
        showToast('Lỗi xóa công thức: ' + err.message, 'error');
    }
}

function renderAdminSocial() {
    const tbody = document.getElementById('adminSocialTableBody');
    if (!tbody) return;
    if (!adminSocialCache.length) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:32px; color:var(--text-soft);">Không có bài đăng cộng đồng.</td></tr>';
        return;
    }
    tbody.innerHTML = adminSocialCache.map(p => `
        <tr>
            <td><strong>#${p.id}</strong></td>
            <td><strong>${escapeHtml(p.title || '')}</strong></td>
            <td>${escapeHtml(p.authorName || 'Ẩn danh')}</td>
            <td>${p.likeCount || 0} ❤️ / ${p.commentCount || 0} 💬</td>
            <td>
                <button type="button" class="admin-action-btn btn-delete" onclick="deleteAdminSocialPost(${p.id})">🗑️</button>
            </td>
        </tr>
    `).join('');
}

async function deleteAdminSocialPost(id) {
    if (!confirm(`Bạn có chắc muốn xóa bài đăng #${id}?`)) return;
    try {
        await apiAdminCall(`/api/social/posts/${id}`, { method: 'DELETE' });
        showToast('Đã gỡ bài đăng vi phạm!', 'success');
        adminSocialCache = adminSocialCache.filter(p => p.id !== id);
        renderAdminSocial();
    } catch (err) {
        showToast('Lỗi gỡ bài đăng: ' + err.message, 'error');
    }
}


/* =========================================================
   7. DOM EVENT WIRING & GLOBAL EXPOSURE
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    // Auth modals & toggle buttons
    document.getElementById("openLoginButton")?.addEventListener("click", openLogin);
    document.getElementById("openRegisterButton")?.addEventListener("click", openRegister);
    document.getElementById("switchToRegister")?.addEventListener("click", () => {
        document.getElementById("loginModal")?.classList.remove("show");
        openRegister();
    });
    document.getElementById("switchToLogin")?.addEventListener("click", () => {
        document.getElementById("registerModal")?.classList.remove("show");
        openLogin();
    });
    document.querySelectorAll(".modal-close").forEach(btn => {
        btn.addEventListener("click", () => {
            btn.closest(".modal-overlay")?.classList.remove("show");
            document.body.style.overflow = "";
        });
    });

    // Form Submissions
    document.getElementById("loginForm")?.addEventListener("submit", handleLoginSubmit);
    document.getElementById("registerForm")?.addEventListener("submit", handleRegisterSubmit);
    document.getElementById("logoutButton")?.addEventListener("click", handleLogout);

    // Quick demo accounts
    document.getElementById("btnQuickDemoLogin")?.addEventListener("click", () => {
        const emailInput = document.getElementById("loginEmail");
        const passInput = document.getElementById("loginPassword");
        if (emailInput) emailInput.value = "minhanh";
        if (passInput) passInput.value = "123456";
        showToast("Đã điền tài khoản User: minhanh!", "info");
    });
    document.getElementById("btnQuickAdminLogin")?.addEventListener("click", () => {
        const emailInput = document.getElementById("loginEmail");
        const passInput = document.getElementById("loginPassword");
        if (emailInput) emailInput.value = "admin";
        if (passInput) passInput.value = "123456";
        showToast("Đã điền tài khoản Admin: admin!", "info");
    });

    // Profile settings events
    document.getElementById("settingsButton")?.addEventListener("click", (e) => {
        e.stopPropagation();
        document.getElementById("profilePanel")?.classList.remove("show");
        document.getElementById("settingsPanel")?.classList.toggle("show");
    });

    document.getElementById("avatarButton")?.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!isUserLoggedIn()) {
            requireAuth("profile");
            return;
        }
        document.getElementById("settingsPanel")?.classList.remove("show");
        document.getElementById("profilePanel")?.classList.toggle("show");
    });

    document.addEventListener("click", () => {
        document.getElementById("settingsPanel")?.classList.remove("show");
        document.getElementById("profilePanel")?.classList.remove("show");
    });

    document.getElementById("editProfileButton")?.addEventListener("click", () => {
        if (!isUserLoggedIn()) {
            requireAuth("profile");
            return;
        }
        fillProfileForm();
        document.getElementById("profilePanel")?.classList.remove("show");
        document.getElementById("profileModal")?.classList.add("show");
        setTimeout(updateHealthPreview, 50);
    });

    // Profile Health Calculation preview listeners
    ["profileWeight", "profileHeight", "profileAge", "profileGender", "profileActivity", "profileTarget"].forEach(id => {
        document.getElementById(id)?.addEventListener("input", updateHealthPreview);
        document.getElementById(id)?.addEventListener("change", updateHealthPreview);
    });

    // Profile form submission
    document.getElementById("profileForm")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const updated = {
            name: document.getElementById("profileName")?.value.trim() || state.profile.name,
            gender: document.getElementById("profileGender")?.value || state.profile.gender,
            age: Number(document.getElementById("profileAge")?.value || state.profile.age),
            weight: Number(document.getElementById("profileWeight")?.value || state.profile.weight),
            height: Number(document.getElementById("profileHeight")?.value || state.profile.height),
            target: Number(document.getElementById("profileTarget")?.value || state.profile.target),
            activity: Number(document.getElementById("profileActivity")?.value || state.profile.activity),
            diet: document.getElementById("profileDiet")?.value || state.profile.diet,
            allergies: document.getElementById("profileAllergies")?.value || "",
            dislikes: document.getElementById("profileDislikes")?.value || ""
        };

        const success = await updateProfile(updated);
        if (success) {
            document.getElementById("profileModal")?.classList.remove("show");
        }
    });

    // Avatar upload handler
    document.getElementById("profileAvatarInput")?.addEventListener("change", (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            showToast("Kích thước ảnh tối đa là 2MB", "warning");
            return;
        }
        const reader = new FileReader();
        reader.onload = (re) => {
            state.profile.avatarUrl = re.target.result;
            saveState();
            renderAvatar();
            showToast("Đã cập nhật ảnh đại diện tạm thời!", "info");
        };
        reader.readAsDataURL(file);
    });

    document.getElementById("removeAvatarButton")?.addEventListener("click", () => {
        state.profile.avatarUrl = "";
        saveState();
        renderAvatar();
        showToast("Đã gỡ ảnh đại diện.", "info");
    });

    initPasswordToggles();
    initOnboarding();
});

if (typeof window !== 'undefined') {
    window.getToken = getToken;
    window.setToken = setToken;
    window.authRequest = authRequest;
    window.applyAuthResponse = applyAuthResponse;
    window.renderAuthSettings = renderAuthSettings;
    window.loadAuthState = loadAuthState;
    window.isUserLoggedIn = isUserLoggedIn;
    window.requireAuth = requireAuth;
    window.openAuthModal = openAuthModal;
    window.openLogin = openLogin;
    window.openRegister = openRegister;
    window.closeAuthModal = closeAuthModal;
    window.closeOtherModals = closeOtherModals;
    window.handleLoginSubmit = handleLoginSubmit;
    window.handleRegisterSubmit = handleRegisterSubmit;
    window.handleLogout = handleLogout;

    window.calculateBMI = calculateBMI;
    window.getAdultBMIStatus = getAdultBMIStatus;
    window.calculateCalories = calculateCalories;
    window.getGoal = getGoal;
    window.getDietDescription = getDietDescription;
    window.renderAvatar = renderAvatar;
    window.renderProfile = renderProfile;
    window.fillProfileForm = fillProfileForm;
    window.apiProfileToState = apiProfileToState;
    window.loadProfileFromApi = loadProfileFromApi;
    window.updateProfile = updateProfile;
    window.updateHealthPreview = updateHealthPreview;

    window.isOnboardingDone = isOnboardingDone;
    window.markOnboardingDone = markOnboardingDone;
    window.showOnboarding = showOnboarding;
    window.hideOnboarding = hideOnboarding;
    window.showOnbStep = showOnbStep;
    window.onbBuildChips = onbBuildChips;
    window.onbBindSeg = onbBindSeg;
    window.initOnboarding = initOnboarding;

    window.loadAdminDashboard = loadAdminDashboard;
    window.switchAdminTab = switchAdminTab;
    window.renderAdminUsers = renderAdminUsers;
    window.openAdminUserModal = openAdminUserModal;
    window.closeAdminUserModal = closeAdminUserModal;
    window.handleAdminUserSubmit = handleAdminUserSubmit;
    window.deleteAdminUser = deleteAdminUser;
    window.renderAdminIngredients = renderAdminIngredients;
    window.openAdminIngredientModal = openAdminIngredientModal;
    window.closeAdminIngredientModal = closeAdminIngredientModal;
    window.deleteAdminIngredient = deleteAdminIngredient;
    window.renderAdminRecipes = renderAdminRecipes;
    window.deleteAdminRecipe = deleteAdminRecipe;
    window.renderAdminSocial = renderAdminSocial;
    window.deleteAdminSocialPost = deleteAdminSocialPost;
}
