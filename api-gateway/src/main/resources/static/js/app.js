/**
 * FoodX app.js — dieu huong view, gan su kien va khoi dong ung dung.
 * Nghiep vu nam o js/modules/*.js, nap truoc file nay.
 */
/* =========================================================
   HERO
========================================================= */

const slides = [

    {
        badge:
            "Food X đồng hành cùng bạn",

        title:
            `Ăn ngon mỗi ngày<br><span>Sống khỏe mỗi ngày</span>`,

        description:
            "Gợi ý món ăn phù hợp với nguyên liệu và mục tiêu dinh dưỡng của riêng bạn.",

        image:
            "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1800&q=90"
    },

    {
        badge:
            "Tận dụng nguyên liệu đang có",

        title:
            `Có gì nấu nấy<br><span>Giảm lãng phí thực phẩm</span>`,

        description:
            "Theo dõi tủ lạnh và ưu tiên những thực phẩm cần sử dụng sớm.",

        image:
            "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1800&q=90"
    },

    {
        badge:
            "Dinh dưỡng cá nhân hóa",

        title:
            `Ăn uống phù hợp<br><span>Riêng cho bạn</span>`,

        description:
            "Food X sử dụng hồ sơ dinh dưỡng để xếp hạng món ăn phù hợp hơn.",

        image:
            "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1800&q=90"
    }

];


/* =========================================================
   THEME
========================================================= */

const lightButton =
    document.getElementById(
        "lightButton"
    );


const darkButton =
    document.getElementById(
        "darkButton"
    );


function setTheme(
    theme,
    notify = false
) {

    state.theme =
        theme;


    document.body.classList.toggle(
        "dark",
        theme === "dark"
    );


    lightButton
        ?.classList
        .toggle(
            "active",
            theme === "light"
        );


    darkButton
        ?.classList
        .toggle(
            "active",
            theme === "dark"
        );


    saveState();


    if (notify) {

        showToast(
            theme === "dark"

                ? "Đã chuyển sang giao diện tối."

                : "Đã chuyển sang giao diện sáng.",

            "info"
        );
    }
}


lightButton
    ?.addEventListener(
        "click",
        () =>
            setTheme(
                "light",
                true
            )
    );


darkButton
    ?.addEventListener(
        "click",
        () =>
            setTheme(
                "dark",
                true
            )
    );


setTheme(
    state.theme
);


/* =========================================================
   SETTINGS + PROFILE PANEL
========================================================= */

const settingsPanel =
    document.getElementById(
        "settingsPanel"
    );


const profilePanel =
    document.getElementById(
        "profilePanel"
    );


document
    .getElementById(
        "settingsButton"
    )
    ?.addEventListener(
        "click",
        event => {

            event.stopPropagation();


            profilePanel
                ?.classList
                .remove("show");


            settingsPanel
                ?.classList
                .toggle("show");
        }
    );


document
    .getElementById(
        "avatarButton"
    )
    ?.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            if (!isUserLoggedIn()) {
                requireAuth("profile");
                return;
            }

            settingsPanel
                ?.classList
                .remove("show");


            profilePanel
                ?.classList
                .toggle("show");
        }
    );


settingsPanel
    ?.addEventListener(
        "click",
        event =>
            event.stopPropagation()
    );


profilePanel
    ?.addEventListener(
        "click",
        event =>
            event.stopPropagation()
    );


document.addEventListener(
    "click",
    () => {

        settingsPanel
            ?.classList
            .remove("show");


        profilePanel
            ?.classList
            .remove("show");
    }
);
/* =========================================================
   NAVIGATION
========================================================= */

var qaOpen = false;

function closeQa() {
    qaOpen = false;
    const fab = document.getElementById('qaFab');
    const menu = document.getElementById('qaMenu');
    if (fab) fab.classList.remove('open');
    if (menu) menu.hidden = true;
}
window.closeQa = closeQa;

function closeDrawer() {
    if (document.body) document.body.classList.remove('drawer-open');
}
window.closeDrawer = closeDrawer;

function handleHeroCtaClick() {
    const go = async function () {
        if (typeof isUserLoggedIn === 'function' && isUserLoggedIn() && typeof loadHomeSuggest === 'function') {
            await loadHomeSuggest();
        }
        const sug = document.getElementById("homeSuggestCard");
        if (sug) {
            sug.hidden = false;
            sug.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
            openView("recipes");
        }
    };
    go();
}
window.handleHeroCtaClick = handleHeroCtaClick;



function openView(name) {
    if (!name) name = "home";
    const AUTH_REQUIRED_VIEWS = ["fridge", "favorites", "shopping", "plan", "admin", "stats"];
    if (AUTH_REQUIRED_VIEWS.includes(name) && !isUserLoggedIn()) {
        requireAuth(name);
        return;
    }
    if (name === "admin") {
        let isAdmin = Boolean(authState && authState.authenticated && (authState.role === "ADMIN" || authState.username === "admin"));
        if (!isAdmin) {
            try {
                const token = getToken();
                if (token) {
                    const parts = token.split('.');
                    if (parts.length === 3) {
                        const p = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
                        if (p.role === "ADMIN" || p.sub === "admin") {
                            isAdmin = true;
                            if (authState) authState.role = "ADMIN";
                        }
                    }
                }
            } catch (_) {}
        }
        if (!isAdmin) {
            showToast("Chỉ tài khoản Quản trị viên (ADMIN) mới có quyền truy cập", "error");
            openView("home");
            return;
        }
    }

    if (typeof state !== "undefined" && state) {
        state.activeView = name;
    }
    try {
        localStorage.setItem("foodx_active_view", name);
        if (window.history && window.history.replaceState) {
            window.history.replaceState(null, "", "#" + name);
        }
    } catch (_) {}

    document.querySelectorAll(".view").forEach(view => view.classList.remove("active"));
    const targetView = document.getElementById(`view-${name}`);
    if (targetView) {
        targetView.classList.add("active");
    }

    // Sync sidebar active state
    document.querySelectorAll(".menu-item").forEach(button => {
        button.classList.toggle("active", button.dataset.view === name);
    });

    // Sync bottom navigation active state (mobile)
    document.querySelectorAll(".bn-item").forEach(button => {
        button.classList.toggle("active", button.getAttribute("data-bottom-nav") === name);
    });

    // Close mobile drawers and overlays if open
    if (typeof closeDrawer === "function") closeDrawer();
    if (typeof closeQa === "function") closeQa();

    // Data Hydration per view
    try {
        if (name === "home") {
            if (typeof renderAll === "function") renderAll();
            if (typeof loadHomeDashboard === "function") loadHomeDashboard();
            if (typeof renderHomeBlogSection === "function") renderHomeBlogSection();
        } else if (name === "fridge") {
            if (typeof renderFridge === "function") renderFridge();
            if (typeof loadFridgeFromApi === "function") loadFridgeFromApi(false);
        } else if (name === "recipes") {
            if (typeof loadRecipes === "function") loadRecipes();
        } else if (name === "recipe") {
            if (typeof renderRecipeDetail === "function") renderRecipeDetail();
        } else if (name === "plan") {
            if (typeof loadPlan === "function") loadPlan();
        } else if (name === "favorites") {
            if (typeof renderFavorites === "function") renderFavorites();
        } else if (name === "shopping") {
            if (typeof renderShopping === "function") renderShopping();
        } else if (name === "social") {
            if (typeof loadSocialFeed === "function") loadSocialFeed();
        } else if (name === "stats") {
            if (typeof loadStats === "function") loadStats();
        } else if (name === "admin") {
            if (typeof loadAdminDashboard === "function") loadAdminDashboard();
        }
    } catch (err) {
        console.warn("View hydration error for " + name + ":", err);
    }

    if (typeof window !== "undefined" && typeof window.scrollTo === "function") {
        try {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        } catch (_) {}
    }
}
window.openView = openView;


document
    .querySelectorAll(
        ".menu-item"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () =>
                    openView(
                        button.dataset.view
                    )
            );
        }
    );


document
    .querySelectorAll(
        "[data-open-view]"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () =>
                    openView(
                        button.dataset.openView
                    )
            );
        }
    );


/* =========================================================
   HERO
========================================================= */

let slideIndex =
    0;


let slideTimer;


const heroImage =
    document.getElementById(
        "heroImage"
    );


const heroContent =
    document.getElementById(
        "heroContent"
    );


function displaySlide(index) {

    if (!slides.length) {
        return;
    }


    slideIndex =
        (
            index +
            slides.length
        ) %
        slides.length;


    const slide =
        slides[
            slideIndex
            ];


    heroImage
        ?.classList
        .add("fade");


    heroContent
        ?.classList
        .add("changing");


    setTimeout(
        () => {

            if (heroImage) {

                heroImage.src =
                    slide.image;
            }


            setText(
                "heroBadge",
                slide.badge
            );


            const title =
                document.getElementById(
                    "heroTitle"
                );


            if (title) {

                title.innerHTML =
                    slide.title;
            }


            setText(
                "heroDescription",
                slide.description
            );


            document
                .querySelectorAll(
                    ".hero-dot"
                )
                .forEach(
                    (dot, i) => {

                        dot.classList.toggle(
                            "active",
                            i ===
                            slideIndex
                        );
                    }
                );


            heroImage
                ?.classList
                .remove("fade");


            heroContent
                ?.classList
                .remove("changing");

        },
        220
    );
}


function startSlider() {

    clearInterval(
        slideTimer
    );


    slideTimer =
        setInterval(
            () =>
                displaySlide(
                    slideIndex + 1
                ),
            5000
        );
}


document
    .getElementById(
        "nextSlide"
    )
    ?.addEventListener(
        "click",
        () => {

            displaySlide(
                slideIndex + 1
            );

            startSlider();
        }
    );


document
    .getElementById(
        "prevSlide"
    )
    ?.addEventListener(
        "click",
        () => {

            displaySlide(
                slideIndex - 1
            );

            startSlider();
        }
    );


document
    .querySelectorAll(
        ".hero-dot"
    )
    .forEach(
        dot => {

            dot.addEventListener(
                "click",
                () => {

                    displaySlide(
                        Number(
                            dot.dataset.index
                        )
                    );

                    startSlider();
                }
            );
        }
    );


document
    .getElementById(
        "exploreButton"
    )
    ?.addEventListener(
        "click",
        () =>
            document
                .getElementById(
                    "homeSuggestCard"
                )
                ?.scrollIntoView({

                    behavior:
                        "smooth"
                })
    );


displaySlide(0);

startSlider();


/* =========================================================
   BMI + CALORIES
========================================================= */

function calculateBMI(
    weight,
    heightCm
) {

    if (
        !weight ||
        !heightCm
    ) {

        return 0;
    }


    const height =
        heightCm / 100;


    return (
        weight /
        (
            height *
            height
        )
    );
}


function getAdultBMIStatus(bmi) {

    if (
        bmi < 18.5
    ) {

        return {

            key:
                "under",

            title:
                "Thiếu cân",

            description:
                "Cân nặng hiện thấp hơn khoảng BMI tham khảo."
        };
    }


    if (
        bmi < 25
    ) {

        return {

            key:
                "healthy",

            title:
                "Cân đối",

            description:
                "Cân nặng và chiều cao nằm trong khoảng BMI khỏe mạnh tham khảo."
        };
    }


    if (
        bmi < 30
    ) {

        return {

            key:
                "over",

            title:
                "Thừa cân",

            description:
                "BMI hiện cao hơn khoảng khỏe mạnh tham khảo."
        };
    }


    return {

        key:
            "high",

        title:
            "BMI cao",

        description:
            "BMI hiện ở mức cao. BMI chỉ là chỉ số sàng lọc."
    };
}


function calculateCalories(
    gender,
    age,
    weight,
    height,
    activity,
    target
) {

    if (
        age < 18 ||
        !weight ||
        !height
    ) {

        return 0;
    }


    let bmr;


    if (
        gender === "female"
    ) {

        bmr =
            10 * weight +
            6.25 * height -
            5 * age -
            161;

    } else {

        bmr =
            10 * weight +
            6.25 * height -
            5 * age +
            5;
    }


    let calories =
        bmr *
        Number(
            activity || 1.2
        );


    if (
        target &&
        target < weight - 1
    ) {

        calories *=
            0.90;
    }


    if (
        target &&
        target > weight + 1
    ) {

        calories *=
            1.08;
    }


    calories =
        Math.max(
            1200,
            Math.min(
                4000,
                calories
            )
        );


    return (
        Math.round(
            calories / 10
        ) *
        10
    );
}


function getGoal() {

    const weight =
        Number(
            state.profile.weight
        );


    const target =
        Number(
            state.profile.target
        );


    if (
        target <
        weight - 1
    ) {

        return "Giảm cân";
    }


    if (
        target >
        weight + 1
    ) {

        return "Tăng cân";
    }


    return "Duy trì cân nặng";
}


function getDietDescription(diet) {

    switch (diet) {

        case "Eat clean":

            return (
                "ưu tiên thực phẩm ít chế biến, rau củ và nguồn đạm phù hợp"
            );


        case "Nhiều đạm":

            return (
                "ưu tiên món giàu protein"
            );


        case "Ít carb":

            return (
                "ưu tiên món hạn chế carbohydrate"
            );


        case "Ăn chay":

            return (
                "ưu tiên công thức không sử dụng thịt"
            );


        case "Ăn linh tinh":

            return (
                "không khóa theo chế độ cố định, mà cân bằng theo nguyên liệu, calo và mục tiêu"
            );


        default:

            return (
                "ưu tiên chế độ ăn cân bằng"
            );
    }
}


/* =========================================================
   AVATAR
========================================================= */

function renderAvatar() {

    const avatar =
        (state.profile.avatarUrl && String(state.profile.avatarUrl).trim() !== "")
            ? state.profile.avatarUrl
            : ((authState.avatarUrl && String(authState.avatarUrl).trim() !== "")
                ? authState.avatarUrl
                : DEFAULT_AVATAR);


    /*
        Cả 3 avatar:
        - góc phải
        - cạnh tên
        - trong chỉnh hồ sơ
    */

    const avatarElements =
        new Set([

            ...document.querySelectorAll(
                ".user-avatar-sync"
            ),

            document.getElementById(
                "headerAvatar"
            ),

            document.getElementById(
                "profileMenuAvatar"
            ),

            document.getElementById(
                "profileAvatarPreview"
            )
        ]);


    avatarElements.forEach(
        element => {

            if (!element) {
                return;
            }


            element.src =
                avatar;


            element.onerror =
                function () {

                    this.onerror =
                        null;


                    this.src =
                        DEFAULT_AVATAR;
                };
        }
    );


    const removeButton =
        document.getElementById(
            "removeAvatarButton"
        );


    if (removeButton) {

        removeButton.style.display =
            state.profile.avatarUrl &&
            String(
                state.profile.avatarUrl
            ).trim() !== ""

                ? "inline-flex"

                : "none";
    }
}


/* =========================================================
   PROFILE RENDER
========================================================= */

function renderProfile() {

    const p =
        state.profile;


    const bmi =
        calculateBMI(
            p.weight,
            p.height
        );


    const calories =
        calculateCalories(
            p.gender,
            p.age,
            p.weight,
            p.height,
            p.activity,
            p.target
        );


    setText(
        "quickName",
        p.name
    );


    setText(
        "quickWeight",
        `${p.weight} kg`
    );


    setText(
        "quickHeight",
        `${p.height} cm`
    );


    setText(
        "quickTarget",
        `${p.target} kg`
    );


    setText(
        "quickBmi",
        bmi
            ? bmi.toFixed(1)
            : "--"
    );


    setText(
        "quickCalories",
        calories
            ? `${formatNumber(calories)} kcal`
            : "--"
    );


    setText(
        "quickDiet",
        p.diet
    );


    setText(
        "dailyCalories",
        calories
            ? formatNumber(calories)
            : "--"
    );


    const profileNote =
        document.getElementById(
            "profileAiNote"
        );


    if (profileNote) {

        profileNote.textContent =
            `${getGoal()} • ${p.diet}. Food X sẽ ưu tiên công thức phù hợp với hồ sơ.`;
    }


    const smart =
        document.getElementById(
            "smartSuggestion"
        );


    if (smart) {

        smart.textContent =
            calories

                ? `${getGoal()}. Năng lượng tham khảo khoảng ${formatNumber(calories)} kcal/ngày.`

                : "Food X đang phân tích hồ sơ.";
    }


    renderAvatar();
}


/* =========================================================
   PROFILE MODAL
========================================================= */

const profileModal =
    document.getElementById(
        "profileModal"
    );


function fillProfileForm() {
    const p = state.profile || {};
    const onb = (p.onboarding || (typeof onbState !== 'undefined' ? onbState : {})) || {};

    const values = {
        profileName: p.name,
        profileGender: p.gender,
        profileAge: p.age,
        profileWeight: p.weight,
        profileHeight: p.height,
        profileTarget: p.target,
        profileActivity: p.activity,
        profileDiet: p.diet,
        profileAllergies: p.allergies,
        profileDislikes: p.dislikes,
        profileCaloInput: onb.calo || 2000,
        profileCaloRangeSync: onb.calo || 2000
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

    // Populate Spice Select
    const spiceSelect = document.getElementById('profileSpiceSelect');
    if (spiceSelect) {
        const sp = onb.spice || 1;
        const spiceMap = { 0: 'Không cay', 1: 'Ít cay', 2: 'Vừa cay', 3: 'Cay nhiều', 4: 'Siêu cay 🌶️' };
        spiceSelect.value = typeof sp === 'string' ? sp : (spiceMap[sp] || 'Ít cay');
    }

    // Populate Cuisines Chips
    const cuisines = onb.cuisines || [];
    document.querySelectorAll('#profileCuisinesGrid .onb-chip').forEach(btn => {
        const txt = btn.textContent.trim();
        btn.classList.toggle('active', cuisines.some(c => txt.includes(c) || c.includes(txt)));
    });

    // Populate Goals Chips
    const goals = onb.goals || [];
    document.querySelectorAll('#profileGoalsGrid .onb-chip').forEach(btn => {
        const txt = btn.textContent.trim();
        btn.classList.toggle('active', goals.some(g => txt.includes(g) || g.includes(txt)));
    });

    // Populate Equipment Chips
    const equip = onb.equip || [];
    document.querySelectorAll('#profileEquipGrid .onb-chip').forEach(btn => {
        const txt = btn.textContent.trim();
        btn.classList.toggle('active', equip.some(e => txt.includes(e) || e.includes(txt)));
    });

    renderAvatar();
}


document
    .getElementById(
        "editProfileButton"
    )
    ?.addEventListener(
        "click",
        () => {

            if (!isUserLoggedIn()) {
                requireAuth("profile");
                return;
            }

            fillProfileForm();


            profilePanel
                ?.classList
                .remove("show");


            profileModal
                ?.classList
                .add("show");


            setTimeout(
                updateHealthPreview,
                50
            );
        }
    );


function setHealthAdvice(text) {

    const element =
        document.querySelector(
            "#healthAiAdvice p"
        );


    if (element) {

        element.textContent =
            text;
    }
}


function updateBMIMarker(bmi) {

    const marker =
        document.getElementById(
            "bmiMarker"
        );


    if (!marker) {
        return;
    }


    let position =
        (
            (bmi - 15) /
            20
        ) *
        100;


    position =
        Math.max(
            1,
            Math.min(
                99,
                position
            )
        );


    marker.style.left =
        `${position}%`;
}


function updateHealthPreview() {

    const gender =
        document
            .getElementById(
                "profileGender"
            )
            ?.value ||
        "male";


    const age =
        Number(
            document
                .getElementById(
                    "profileAge"
                )
                ?.value
        );


    const weight =
        Number(
            document
                .getElementById(
                    "profileWeight"
                )
                ?.value
        );


    const height =
        Number(
            document
                .getElementById(
                    "profileHeight"
                )
                ?.value
        );


    const target =
        Number(
            document
                .getElementById(
                    "profileTarget"
                )
                ?.value
        );


    const activity =
        Number(
            document
                .getElementById(
                    "profileActivity"
                )
                ?.value ||
            1.2
        );


    const diet =
        document
            .getElementById(
                "profileDiet"
            )
            ?.value ||
        "Cân bằng";


    setText(
        "healthGender",
        gender === "female"
            ? "Nữ"
            : "Nam"
    );


    const bmi =
        calculateBMI(
            weight,
            height
        );


    if (
        !age ||
        !weight ||
        !height ||
        !bmi
    ) {

        setText(
            "healthBMI",
            "--"
        );


        setText(
            "healthStatus",
            "Hãy nhập thông tin"
        );


        setText(
            "healthStatusDescription",
            "Kết quả sẽ cập nhật khi bạn thay đổi thông tin."
        );


        setText(
            "healthyWeightRange",
            "-- kg"
        );


        setText(
            "healthGoal",
            "--"
        );


        setText(
            "healthCalories",
            "-- kcal"
        );


        setText(
            "healthWeightDifference",
            "--"
        );


        setHealthAdvice(
            "Điền đầy đủ thông tin để Food X phân tích."
        );


        return;
    }


    setText(
        "healthBMI",
        bmi.toFixed(1)
    );


    updateBMIMarker(
        bmi
    );


    if (
        age < 20
    ) {

        setText(
            "healthStatus",
            "Cần đánh giá theo tuổi"
        );


        setText(
            "healthStatusDescription",
            "Người dưới 20 tuổi cần đánh giá BMI theo tuổi và giới tính."
        );


        setText(
            "healthyWeightRange",
            "Theo tuổi & giới"
        );


        setText(
            "healthGoal",
            "Chưa đánh giá"
        );


        setText(
            "healthCalories",
            "Chưa đánh giá"
        );


        setText(
            "healthWeightDifference",
            "Chưa đánh giá"
        );


        setHealthAdvice(
            "Food X chưa dùng ngưỡng BMI người lớn cho người dưới 20 tuổi."
        );


        return;
    }


    const status =
        getAdultBMIStatus(
            bmi
        );


    setText(
        "healthStatus",
        status.title
    );


    setText(
        "healthStatusDescription",
        status.description
    );


    const h =
        height / 100;


    const minWeight =
        18.5 *
        h *
        h;


    const maxWeight =
        24.9 *
        h *
        h;


    setText(
        "healthyWeightRange",
        `${minWeight.toFixed(1)} – ${maxWeight.toFixed(1)} kg`
    );


    let goalText =
        "Duy trì cân nặng";


    if (
        target <
        weight - 0.5
    ) {

        goalText =
            `Giảm ${(weight - target).toFixed(1)} kg`;
    }


    if (
        target >
        weight + 0.5
    ) {

        goalText =
            `Tăng ${(target - weight).toFixed(1)} kg`;
    }


    setText(
        "healthGoal",
        goalText
    );


    let difference =
        "Trong khoảng tham khảo";


    if (
        weight <
        minWeight
    ) {

        difference =
            `Thấp hơn ${(minWeight - weight).toFixed(1)} kg`;
    }


    if (
        weight >
        maxWeight
    ) {

        difference =
            `Cao hơn ${(weight - maxWeight).toFixed(1)} kg`;
    }


    setText(
        "healthWeightDifference",
        difference
    );


    const calories =
        calculateCalories(
            gender,
            age,
            weight,
            height,
            activity,
            target
        );


    setText(
        "healthCalories",
        `${formatNumber(calories)} kcal`
    );


    let advice =
        `${status.description} Food X sẽ ${getDietDescription(diet)}.`;


    advice +=
        gender === "female"

            ? " Giới tính nữ được sử dụng trong phần ước tính năng lượng."

            : " Giới tính nam được sử dụng trong phần ước tính năng lượng.";


    setHealthAdvice(
        advice
    );
}


[
    "profileGender",
    "profileAge",
    "profileWeight",
    "profileHeight",
    "profileTarget",
    "profileActivity",
    "profileDiet"
]
    .forEach(
        id => {

            const element =
                document.getElementById(
                    id
                );


            element
                ?.addEventListener(
                    "input",
                    updateHealthPreview
                );


            element
                ?.addEventListener(
                    "change",
                    updateHealthPreview
                );
        }
    );


/* =========================================================
   SAVE PROFILE MYSQL
========================================================= */

document.getElementById("profileForm")?.addEventListener("submit", async event => {
    event.preventDefault();
    const restore = buttonLoading(event.submitter, "Đang lưu...");

    // Collect Section 03 setup preferences
    const selCuisines = Array.from(document.querySelectorAll('#profileCuisinesGrid .onb-chip.active')).map(b => b.textContent.trim());
    const selGoals = Array.from(document.querySelectorAll('#profileGoalsGrid .onb-chip.active')).map(b => b.textContent.trim());
    const selEquip = Array.from(document.querySelectorAll('#profileEquipGrid .onb-chip.active')).map(b => b.textContent.trim());
    const spiceVal = document.getElementById('profileSpiceSelect')?.value || 'Ít cay';
    const caloVal = Number(document.getElementById('profileCaloInput')?.value || 2000);

    const payload = {
        name: document.getElementById("profileName")?.value.trim(),
        gender: document.getElementById("profileGender")?.value,
        age: Number(document.getElementById("profileAge")?.value),
        weight: Number(document.getElementById("profileWeight")?.value),
        height: Number(document.getElementById("profileHeight")?.value),
        target: Number(document.getElementById("profileTarget")?.value),
        activity: Number(document.getElementById("profileActivity")?.value),
        diet: document.getElementById("profileDiet")?.value,
        allergies: document.getElementById("profileAllergies")?.value.trim(),
        dislikes: document.getElementById("profileDislikes")?.value.trim()
    };

    try {
        let data = {};
        try {
            data = await apiRequest(PROFILE_API, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
        } catch (e) {
            console.warn("Backend profile save fallback:", e);
        }

        state.profile = Object.assign({}, state.profile, payload, {
            onboarding: {
                cuisines: selCuisines,
                spice: spiceVal,
                goals: selGoals,
                calo: caloVal,
                equip: selEquip,
                allergies: payload.allergies ? payload.allergies.split(',').map(s=>s.trim()) : [],
                diet: payload.diet
            }
        });

        // Sync with global onbState if present
        if (typeof onbState !== 'undefined') {
            onbState.cuisines = selCuisines;
            onbState.spice = spiceVal;
            onbState.goals = selGoals;
            onbState.calo = caloVal;
            onbState.equip = selEquip;
        }

        saveState();
        renderProfile();
        renderRecipes();

        restore("✓ Đã lưu");

        setTimeout(() => {
            document.getElementById("profileModal")?.classList.remove("show");
            restore();
            showToast("Hồ sơ & Chế độ ăn đã được đồng bộ!", "success");
        }, 350);

    } catch (error) {
        console.error(error);
        restore();
        showToast("Không lưu được hồ sơ.", "error");
    }
});

/* =========================================================
   AVATAR UPLOAD
========================================================= */

const profileAvatarInput =
    document.getElementById(
        "profileAvatarInput"
    );


document
    .getElementById(
        "chooseAvatarButton"
    )
    ?.addEventListener(
        "click",
        () => {

            profileAvatarInput
                ?.click();
        }
    );


profileAvatarInput
    ?.addEventListener(
        "change",
        async () => {

            const file =
                profileAvatarInput
                    .files?.[0];


            if (!file) {
                return;
            }


            const allowedTypes = [

                "image/jpeg",
                "image/png",
                "image/webp"
            ];


            if (
                !allowedTypes.includes(
                    file.type
                )
            ) {

                showToast(
                    "Chỉ hỗ trợ JPG, PNG hoặc WEBP.",
                    "warning"
                );


                profileAvatarInput.value =
                    "";


                return;
            }


            if (
                file.size >
                5 *
                1024 *
                1024
            ) {

                showToast(
                    "Ảnh tối đa 5MB.",
                    "warning"
                );


                profileAvatarInput.value =
                    "";


                return;
            }


            const previewURL =
                URL.createObjectURL(
                    file
                );


            /*
                Preview đồng bộ tất cả avatar.
            */

            document
                .querySelectorAll(
                    ".user-avatar-sync"
                )
                .forEach(
                    image => {

                        image.src =
                            previewURL;
                    }
                );


            const formData =
                new FormData();


            formData.append(
                "avatar",
                file
            );


            try {

                const response =
                    await fetch(
                        `${PROFILE_API}/avatar`,
                        {

                            method:
                                "POST",

                            body:
                            formData
                        }
                    );


                if (!response.ok) {

                    const errorText =
                        await response.text();


                    throw new Error(
                        `${response.status} ${errorText}`
                    );
                }


                const data =
                    await response.json();


                state.userId =
                    data.userId;


                state.profile =
                    apiProfileToState(
                        data
                    );


                saveState();


                renderProfile();


                showToast(
                    "Ảnh đại diện đã được cập nhật.",
                    "success"
                );


            } catch (error) {

                console.error(
                    "Avatar upload error:",
                    error
                );


                renderAvatar();


                showToast(
                    "Không tải được ảnh đại diện.",
                    "error"
                );


            } finally {

                URL.revokeObjectURL(
                    previewURL
                );


                profileAvatarInput.value =
                    "";
            }
        }
    );


/* =========================================================
   REMOVE AVATAR
========================================================= */

document
    .getElementById(
        "removeAvatarButton"
    )
    ?.addEventListener(
        "click",
        async () => {

            if (
                !state.profile.avatarUrl
            ) {

                return;
            }


            const confirmed =
                window.confirm(
                    "Bạn muốn xóa ảnh đại diện?"
                );


            if (!confirmed) {
                return;
            }


            try {

                const data =
                    await apiRequest(
                        `${PROFILE_API}/avatar`,
                        {

                            method:
                                "DELETE"
                        }
                    );


                state.userId =
                    data.userId;


                state.profile =
                    apiProfileToState(
                        data
                    );


                saveState();


                renderProfile();


                showToast(
                    "Đã xóa ảnh đại diện.",
                    "success"
                );


            } catch (error) {

                console.error(
                    error
                );


                showToast(
                    "Không xóa được ảnh đại diện.",
                    "error"
                );
            }
        }
    );


/* =========================================================
   MODAL COMMON
========================================================= */

function closeOtherModals(
    exceptId = ""
) {

    document
        .querySelectorAll(
            ".modal-overlay"
        )
        .forEach(
            modal => {

                if (
                    modal.id !==
                    exceptId
                ) {

                    modal.classList.remove(
                        "show"
                    );
                }
            }
        );
}


/* =========================================================
   MODAL EVENT DELEGATION (Static & Dynamic buttons, Backdrop, Escape key)
========================================================= */

document.addEventListener("click", function (event) {
    // 1. Click vào nút có thuộc tính data-close hoặc class .modal-close, .auth-close
    const closeBtn = event.target.closest("[data-close], .modal-close, .auth-close");
    if (closeBtn) {
        const modalId = closeBtn.dataset.close;
        const modal = modalId ? document.getElementById(modalId) : closeBtn.closest(".modal-overlay");
        if (modal) {
            modal.classList.remove("show");
            if (modal.id === "planMealModal" || modal.id === "shoppingRecipeModal" || modal.id === "addToPlanModal") {
                modal.setAttribute("hidden", "");
                modal.style.display = "none";
            }
            document.body.style.overflow = "";
        }
        return;
    }

    // 2. Click ra ngoài backdrop của modal-overlay
    if (event.target.classList && event.target.classList.contains("modal-overlay")) {
        event.target.classList.remove("show");
        if (event.target.id === "planMealModal" || event.target.id === "shoppingRecipeModal" || event.target.id === "addToPlanModal") {
            event.target.setAttribute("hidden", "");
            event.target.style.display = "none";
        }
        document.body.style.overflow = "";
    }
});

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        document.querySelectorAll(".modal-overlay.show").forEach(modal => {
            modal.classList.remove("show");
        });
        document.body.style.overflow = "";
    }
});


/* =========================================================
   STATS
========================================================= */

function renderStats() {

    setText(
        "fridgeCount",
        state.fridge.length
    );


    setText(
        "expiringCount",
        state.fridge.filter(
            item =>
                daysLeft(
                    item.expiresAt
                ) <= 3
        ).length
    );
}


function renderExpiring() {

    const items =
        state.fridge
            .filter(
                item =>
                    daysLeft(
                        item.expiresAt
                    ) <= 3
            )
            .sort(
                (a, b) =>
                    daysLeft(
                        a.expiresAt
                    ) -
                    daysLeft(
                        b.expiresAt
                    )
            );


    const container =
        document.getElementById(
            "homeExpiring"
        );


    if (!container) {
        return;
    }


    if (
        !items.length
    ) {

        container.innerHTML = `

            <p>
                Không có thực phẩm cần dùng sớm.
            </p>
        `;


        return;
    }


    container.innerHTML =
        items
            .slice(
                0,
                4
            )
            .map(
                item => {

                    const days =
                        daysLeft(
                            item.expiresAt
                        );


                    return `

                        <div class="expiring-item">


                            <strong>
                                ${item.name}
                            </strong>


                            <span>

                                ${
                        days <= 0

                            ? "Dùng ngay"

                            : `Còn ${days} ngày`
                    }

                            </span>


                        </div>
                    `;
                }
            )
            .join("");
}


/* =========================================================
   REFRESH
========================================================= */

document
    .getElementById(
        "refreshSuggestions"
    )
    ?.addEventListener(
        "click",
        async event => {

            const restore =
                buttonLoading(
                    event.currentTarget,
                    "Đang phân tích..."
                );


            await Promise.all([

                loadFridgeFromApi(
                    false
                ),

                loadProfileFromApi(
                    false
                )
            ]);


            renderRecipes();


            restore();


            showToast(
                "Đã cập nhật gợi ý.",
                "success"
            );
        }
    );


/* =========================================================
   NOTIFICATION
========================================================= */

document
    .getElementById(
        "notificationButton"
    )
    ?.addEventListener(
        "click",
        () => {

            const expiring =
                state.fridge.filter(
                    item =>
                        daysLeft(
                            item.expiresAt
                        ) <= 3
                );


            if (
                !expiring.length
            ) {

                showToast(
                    "Hiện không có cảnh báo mới.",
                    "info"
                );


                return;
            }


            showToast(

                `Nên dùng sớm: ${
                    expiring
                        .slice(
                            0,
                            3
                        )
                        .map(
                            item =>
                                item.name
                        )
                        .join(", ")
                }.`,

                "warning"
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
        if (!authState.role || authState.role !== "ADMIN") {
            try {
                const parts = token.split('.');
                if (parts.length === 3) {
                    const p = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
                    if (p.role === "ADMIN" || p.sub === "admin") {
                        authState.role = "ADMIN";
                    }
                }
            } catch (_) {}
        }
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
    const validViews = ["home", "fridge", "recipes", "plan", "favorites", "shopping", "social", "stats"];
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

window.addEventListener("hashchange", function () {
    const hash = window.location.hash ? window.location.hash.replace("#", "").trim() : "";
    const validViews = ["home", "fridge", "recipes", "plan", "favorites", "shopping", "social", "stats"];
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
    const days = Math.floor(h / 24);
    if (days < 7) return days + ' ngày trước';
    return d.toLocaleDateString('vi-VN');
}

function postCard(post) {
    const isLiked = post.likedByMe || !!likedPostsState[post.id];
    const isSaved = !!post.savedByMe || !!savedPostsState[post.id];
    const currentLikes = post.likeCount !== undefined ? post.likeCount : (post.likes || 0);

    const img = post.imageUrl
        ? '<div class="post-img-container" data-open-detail="' + post.id + '" title="Bấm vào ảnh để xem chi tiết công thức">' +
            '<img class="post-image" src="' + escapeHtml(post.imageUrl) + '" alt="' + escapeHtml(post.title) + '" loading="lazy" onerror="this.parentElement.style.display=\'none\'">' +
            '<div class="post-img-overlay"><span>🔍 Xem chi tiết công thức</span></div>' +
          '</div>'
        : '';

    const canDelete = window.authState && authState.userId && (authState.userId === post.authorId || authState.userId === +post.authorId);
    const totalComments = post.commentCount !== undefined ? post.commentCount : 0;

    return '' +
        '<article class="card post-card" data-post-id="' + post.id + '">' +
            '<div class="post-header">' +
                '<div class="post-avatar-wrap"><div class="post-avatar-emoji">👨‍🍳</div></div>' +
                '<div class="post-author-info">' +
                    '<strong>' + escapeHtml(post.authorName || 'Thành viên FoodX') + '</strong>' +
                    '<span>' + (post.authorRole ? escapeHtml(post.authorRole) + ' • ' : '') + socialTime(post.createdAt) + '</span>' +
                '</div>' +
                '<span class="post-badge-tag">' + (post.cookTime ? '⏱ ' + post.cookTime : 'Công thức') + '</span>' +
                (canDelete ? '<button type="button" class="text-button post-delete" data-delete="' + post.id + '">🗑 Xóa</button>' : '') +
            '</div>' +
            '<h3 class="post-title" data-open-detail="' + post.id + '" title="Bấm để xem chi tiết công thức">' + escapeHtml(post.title) + '</h3>' +
            '<div class="post-meta-pills">' +
                (post.kcal ? '<span>🔥 ' + post.kcal + ' kcal</span>' : '') +
                '<span>📊 ' + (post.category === 'eatclean' ? 'Healthy' : 'Dễ nấu') + '</span>' +
            '</div>' +
            img +
            (post.description ? '<p class="post-desc" data-open-detail="' + post.id + '" title="Bấm để xem chi tiết công thức">' + escapeHtml(post.description) + '</p>' : '') +
            '<div class="post-view-cta" data-open-detail="' + post.id + '">' +
                '<span>📖 Xem công thức & hướng dẫn chi tiết →</span>' +
            '</div>' +
            '<div class="post-actions-bar">' +
                '<button type="button" class="post-action-btn' + (isLiked ? ' active' : '') + '" data-like="' + post.id + '">' +
                    (isLiked ? '❤️' : '🤍') + ' <span data-like-count="' + post.id + '">' + currentLikes + '</span>' +
                '</button>' +
                '<button type="button" class="post-action-btn' + (isSaved ? ' saved-active' : '') + '" data-save="' + post.id + '" data-title="' + escapeHtml(post.title) + '">' +
                    (isSaved ? '🔖 Đã lưu' : '🤍 Lưu món') +
                '</button>' +
                '<button type="button" class="post-action-btn" data-plan-post="' + post.id + '" title="Lên lịch bữa ăn với món này">' +
                    '📅 Lên thực đơn' +
                '</button>' +
                '<button type="button" class="post-action-btn" data-comments="' + post.id + '">' +
                    '💬 <span data-comment-count="' + post.id + '">' + totalComments + '</span>' +
                '</button>' +
                '<button type="button" class="post-action-btn" data-share="' + post.id + '">' +
                    '↗️ Chia sẻ' +
                '</button>' +
            '</div>' +
            '<div class="post-comments" data-comments-box="' + post.id + '" hidden>' +
                '<div class="comment-list" data-comment-list="' + post.id + '">' +
                    '<div style="font-size:12px;color:var(--text-soft);padding:6px 0;">Bấm mở để tải bình luận...</div>' +
                '</div>' +
                '<div class="comment-input-row">' +
                    '<input class="comment-input" data-comment-input="' + post.id + '" placeholder="Viết bình luận hoặc đặt câu hỏi cho đầu bếp..." autocomplete="off">' +
                    '<button type="button" class="primary-button" style="padding:6px 14px;font-size:12px;" data-comment-send="' + post.id + '">Gửi</button>' +
                '</div>' +
            '</div>' +
        '</article>';
}

async function loadSocialFeed() {
    const feed = document.getElementById('socialFeed');
    if (!feed) return;
    feed.innerHTML = '<div class="social-empty" style="grid-column:1/-1;">⏳ Đang tải các bài chia sẻ công thức...</div>';

    let apiPosts = [];
    try {
        const res = await apiRequest(SOCIAL_API + '/posts');
        if (Array.isArray(res)) {
            apiPosts = res;
        } else if (res && Array.isArray(res.data)) {
            apiPosts = res.data;
        } else if (res && Array.isArray(res.content)) {
            apiPosts = res.content;
        } else {
            apiPosts = [];
        }
    } catch (error) {
        apiPosts = [];
    }

    if (!apiPosts) apiPosts = [];

    const seen = new Set();
    const combined = [];

    (apiPosts || []).forEach(function (p) {
        if (p && p.id && !seen.has(String(p.id)) && !seen.has(String(p.title || ''))) {
            seen.add(String(p.id));
            if (p.title) seen.add(String(p.title));
            combined.push(p);
        }
    });

    combined.forEach(function (p) {
        if (p && p.savedByMe && typeof rememberSavedPost === 'function') rememberSavedPost(p, true);
    });
    allSocialPostsCache = combined;
    renderSocialFeedFiltered();
}

function renderSocialFeedFiltered() {
    const feed = document.getElementById('socialFeed');
    if (!feed) return;

    let posts = allSocialPostsCache;
    const cat = currentSocialCategory;
    const kw = currentSocialSearch.trim().toLowerCase();

    // Category filtering
    if (cat !== 'all') {
        posts = posts.filter(function (p) {
            if (cat === 'my') {
                const myId = window.authState && authState.userId;
                const myName = window.authState && (authState.fullName || authState.username);
                return (myId && (p.authorId === myId || p.authorId === +myId)) ||
                       (myName && p.authorName === myName) ||
                       (p.authorName && p.authorName.startsWith('Bạn'));
            }
            if (cat === 'hot') return (p.likeCount || 0) > 0;
            if (cat === 'liked') return !!p.likedByMe || !!likedPostsState[p.id];
            if (cat === 'saved') return !!p.savedByMe || !!savedPostsState[p.id];
            return p.category === cat;
        });
    }

    // Keyword filtering
    if (kw) {
        posts = posts.filter(function (p) {
            const titleOk = String(p.title || '').toLowerCase().includes(kw);
            const descOk = String(p.description || '').toLowerCase().includes(kw);
            const ingOk = (p.ingredients || []).some(function (i) { return String(i).toLowerCase().includes(kw); });
            return titleOk || descOk || ingOk;
        });
    }

    if (!posts || !posts.length) {
        if (cat === 'my') {
            feed.innerHTML = '<div class="social-empty" style="grid-column:1/-1;">' +
                '<div style="font-size:36px;margin-bottom:8px;">📝</div>' +
                '<b>Bạn chưa đăng bài viết nào</b>' +
                '<p style="margin-top:6px;">Hãy bấm nút <b>"+ Đăng công thức mới"</b> phía trên để chia sẻ công thức và bí quyết nấu ăn của bạn cùng cộng đồng FoodX nhé! 🎉</p>' +
                '</div>';
        } else {
            feed.innerHTML = '<div class="social-empty" style="grid-column:1/-1;">Không tìm thấy bài chia sẻ phù hợp. Hãy chọn danh mục khác hoặc thử đăng bài đầu tiên! 🎉</div>';
        }
        return;
    }

    let myBanner = '';
    if (cat === 'my') {
        const totalLikesReceived = posts.reduce(function(acc, p) { return acc + (p.likeCount || 0); }, 0);
        const totalCommentsReceived = posts.reduce(function(acc, p) { return acc + (p.commentCount || 0); }, 0);
        myBanner = '<div class="card" style="grid-column:1/-1;padding:16px 20px;border-radius:14px;background:linear-gradient(135deg, rgba(76, 175, 80, 0.12), rgba(33, 150, 243, 0.08));border:1px solid var(--green);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:10px;">' +
            '<div>' +
                '<h3 style="margin:0;font-size:16px;color:var(--text);display:flex;align-items:center;gap:8px;">📝 Lịch sử bài đăng của bạn</h3>' +
                '<p style="margin:4px 0 0 0;font-size:13px;color:var(--text-soft);">Quản lý tất cả công thức và bài viết bạn đã chia sẻ lên cộng đồng FoodX</p>' +
            '</div>' +
            '<div style="display:flex;gap:14px;">' +
                '<span style="background:var(--card-bg);padding:6px 14px;border-radius:20px;font-size:13px;font-weight:600;border:1px solid var(--border);">🍳 <b>' + posts.length + '</b> bài viết</span>' +
                '<span style="background:var(--card-bg);padding:6px 14px;border-radius:20px;font-size:13px;font-weight:600;border:1px solid var(--border);">❤️ <b>' + totalLikesReceived + '</b> lượt thích</span>' +
                '<span style="background:var(--card-bg);padding:6px 14px;border-radius:20px;font-size:13px;font-weight:600;border:1px solid var(--border);">💬 <b>' + totalCommentsReceived + '</b> bình luận</span>' +
            '</div>' +
            '</div>';
    }

    feed.innerHTML = myBanner + posts.map(postCard).join('');
    wirePostEvents();
}

function socialPostCard(postId, fromEl) {
    if (fromEl && fromEl.closest) {
        const card = fromEl.closest('.post-card');
        if (card) return card;
    }
    const feed = document.getElementById('socialFeed');
    if (feed) {
        const card = feed.querySelector('.post-card[data-post-id="' + postId + '"]');
        if (card) return card;
    }
    return document.querySelector('.post-card[data-post-id="' + postId + '"]');
}

async function loadPostComments(postId, fromEl) {
    const card = socialPostCard(postId, fromEl);
    const listEl = card
        ? card.querySelector('[data-comment-list="' + postId + '"]')
        : document.querySelector('[data-comment-list="' + postId + '"]');
    if (!listEl) return;
    
    let comments = [];
    const isSample = String(postId).startsWith('c');
    
    if (isSample) {
        try {
            comments = JSON.parse(localStorage.getItem('foodx_comments_' + postId) || '[]');
        } catch (_) { comments = []; }
    } else {
        try {
            const rawComments = await apiRequest(SOCIAL_API + '/posts/' + postId + '/comments');
            if (Array.isArray(rawComments)) {
                comments = rawComments;
            } else if (rawComments && Array.isArray(rawComments.data)) {
                comments = rawComments.data;
            } else {
                comments = [];
            }
        } catch (e) {
            comments = [];
        }
    }

    if (comments && comments.length) {
        listEl.innerHTML = comments.map(function(c) {
            const canDel = window.authState && authState.userId && (authState.userId === c.authorId || authState.userId === +c.authorId || isSample);
            return '<div class="comment-item">' +
                '<div class="comment-meta">' +
                    '<strong class="comment-author">' + escapeHtml(c.authorName || 'Người dùng') + '</strong>' +
                    '<span class="comment-time">' + socialTime(c.createdAt) + '</span>' +
                    (canDel ? '<button type="button" class="text-button comment-delete" data-del-comment="' + (c.id || 0) + '" data-post-id="' + postId + '" title="Xóa bình luận">✕</button>' : '') +
                '</div>' +
                '<p class="comment-body">' + escapeHtml(c.content || '') + '</p>' +
                '</div>';
        }).join('');

        // Update comment count pill
        const cntEl = card
            ? card.querySelector('[data-comment-count="' + postId + '"]')
            : document.querySelector('[data-comment-count="' + postId + '"]');
        if (cntEl) cntEl.textContent = comments.length;

        // Wire delete comment events
        listEl.querySelectorAll('[data-del-comment]').forEach(function(delBtn) {
            delBtn.addEventListener('click', async function() {
                const cId = delBtn.getAttribute('data-del-comment');
                if (isSample) {
                    let localComms = JSON.parse(localStorage.getItem('foodx_comments_' + postId) || '[]');
                    localComms = localComms.filter(function(x) { return String(x.id) !== String(cId); });
                    localStorage.setItem('foodx_comments_' + postId, JSON.stringify(localComms));
                    showToast('Đã xóa bình luận', 'info');
                    loadPostComments(postId, listEl);
                } else {
                    try {
                        await apiRequest(SOCIAL_API + '/comments/' + cId, { method: 'DELETE' });
                        showToast('Đã xóa bình luận', 'info');
                        loadPostComments(postId, listEl);
                    } catch(e) {
                        showToast('Không thể xóa bình luận', 'error');
                    }
                }
            });
        });
    } else {
        listEl.innerHTML = '<div class="comment-empty">Chưa có bình luận nào. Hãy là người đầu tiên bình luận! ✨</div>';
    }
}

function wirePostEvents() {
    // Like button
    document.querySelectorAll('[data-like]').forEach(function (btn) {
        btn.addEventListener('click', async function (e) {
            e.stopPropagation();
            if (!isUserLoggedIn()) {
                requireAuth('like');
                return;
            }
            const id = btn.getAttribute('data-like');
            const isNumeric = typeof id === 'number' || (!isNaN(+id) && !String(id).startsWith('c'));

            if (isNumeric) {
                try {
                    const res = await apiRequest(SOCIAL_API + '/posts/' + id + '/like', { method: 'POST' });
                    if (res) {
                        btn.classList.toggle('active', res.liked);
                        btn.innerHTML = (res.liked ? '❤️' : '🤍') + ' <span data-like-count="' + id + '">' + res.likeCount + '</span>';
                        likedPostsState[id] = res.liked;
                        localStorage.setItem('foodx_liked_posts', JSON.stringify(likedPostsState));
                        showToast(res.liked ? 'Đã thích bài viết ❤️' : 'Đã bỏ thích bài viết.', 'info');
                    }
                } catch(e) {
                    showToast('Cần đăng nhập để thích bài viết', 'warning');
                }
            } else {
                // Handle sample community post local like toggle
                const wasLiked = !!likedPostsState[id];
                const newLiked = !wasLiked;
                likedPostsState[id] = newLiked;
                localStorage.setItem('foodx_liked_posts', JSON.stringify(likedPostsState));
                
                const countEl = btn.querySelector('[data-like-count]');
                let curCount = parseInt(countEl ? countEl.textContent : '0') || 0;
                curCount = newLiked ? curCount + 1 : Math.max(0, curCount - 1);
                
                btn.classList.toggle('active', newLiked);
                btn.innerHTML = (newLiked ? '❤️' : '🤍') + ' <span data-like-count="' + id + '">' + curCount + '</span>';
                showToast(newLiked ? 'Đã thích bài viết ❤️' : 'Đã bỏ thích bài viết.', 'info');
            }
        });
    });

    // Open Recipe Detail on click (Image, Title, Desc, CTA)
    document.querySelectorAll('[data-open-detail]').forEach(function (el) {
        el.addEventListener('click', function (e) {
            e.stopPropagation();
            const id = el.getAttribute('data-open-detail');
            if (id) {
                if (state && state.activeView && state.activeView !== 'recipe') {
                    previousViewBeforeRecipe = state.activeView;
                }
                openRecipeDetail(id, 'social');
            }
        });
    });

    // Save button
    document.querySelectorAll('[data-save]').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            if (!isUserLoggedIn()) {
                requireAuth('favorite');
                return;
            }
            const id = btn.getAttribute('data-save');
            const title = btn.getAttribute('data-title') || 'Công thức';
            const postObj = (allSocialPostsCache || []).find(p => String(p.id) === String(id))
                || (communityFeedPosts || []).find(p => String(p.id) === String(id))
                || { id: id, title: title };
            btn.disabled = true;
            apiRequest('/api/social/posts/' + id + '/save', { method: 'POST' })
                .then(function (res) {
                    const saved = !!(res && res.saved);
                    rememberSavedPost(postObj, saved);
                    if (postObj) postObj.savedByMe = saved;
                    btn.classList.toggle('saved-active', saved);
                    btn.innerHTML = saved ? '🔖 Đã lưu' : '🤍 Lưu món';
                    showToast(saved
                        ? 'Đã lưu "' + title + '" vào yêu thích.'
                        : 'Đã bỏ lưu "' + title + '".', saved ? 'success' : 'info');
                    if (typeof renderFavorites === 'function') renderFavorites();
                })
                .catch(function (err) {
                    showToast((err && err.message) || 'Không lưu được bài viết.', 'error');
                })
                .finally(function () { btn.disabled = false; });
        });
    });

    // Plan button
    document.querySelectorAll('[data-plan-post]').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            const id = btn.getAttribute('data-plan-post');
            const postObj = (allSocialPostsCache || []).find(p => String(p.id) === String(id))
                || (communityFeedPosts || []).find(p => String(p.id) === String(id));
            if (postObj) {
                const planTarget = Object.assign({}, postObj, {
                    isSocial: true,
                    kcal: parseInt(postObj.kcal) || 350
                });
                openAddToPlanModal(planTarget);
            }
        });
    });

    // Comment toggle & load
    document.querySelectorAll('[data-comments]').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            const id = btn.getAttribute('data-comments');
            const card = btn.closest('.post-card');
            const box = card
                ? card.querySelector('[data-comments-box="' + id + '"]')
                : document.querySelector('[data-comments-box="' + id + '"]');
            if (box) {
                box.hidden = !box.hidden;
                if (!box.hidden) {
                    loadPostComments(id, btn);
                }
            }
        });
    });

    // Comment send
    document.querySelectorAll('[data-comment-send]').forEach(function (btn) {
        btn.addEventListener('click', async function (e) {
            e.stopPropagation();
            if (!isUserLoggedIn()) {
                requireAuth('comment');
                return;
            }
            const id = btn.getAttribute('data-comment-send');
            const card = btn.closest('.post-card');
            const input = card
                ? card.querySelector('[data-comment-input="' + id + '"]')
                : document.querySelector('[data-comment-input="' + id + '"]');
            if (input && input.value.trim()) {
                const text = input.value.trim();
                btn.disabled = true;
                const isSample = String(id).startsWith('c');
                if (isSample) {
                    let localComms = JSON.parse(localStorage.getItem('foodx_comments_' + id) || '[]');
                    localComms.push({
                        id: Date.now(),
                        authorName: (window.authState && (authState.fullName || authState.username)) || 'Bạn',
                        content: text,
                        createdAt: new Date().toISOString()
                    });
                    localStorage.setItem('foodx_comments_' + id, JSON.stringify(localComms));
                    input.value = '';
                    showToast('Đã gửi bình luận! 💬', 'success');
                    loadPostComments(id, btn);
                    btn.disabled = false;
                } else {
                    try {
                        await apiRequest(SOCIAL_API + '/posts/' + id + '/comments', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ content: text })
                        });
                        input.value = '';
                        showToast('Đã gửi bình luận! 💬', 'success');
                        loadPostComments(id, btn);
                    } catch (e) {
                        showToast('Không gửi được bình luận: ' + (e.message || ''), 'error');
                    } finally {
                        btn.disabled = false;
                    }
                }
            }
        });
    });

    // Share button
    document.querySelectorAll('[data-share]').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href);
            }
            showToast('Đã sao chép liên kết bài viết! 🔗', 'success');
        });
    });

    // Delete post
    document.querySelectorAll('[data-delete]').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            deletePost(btn.getAttribute('data-delete'));
        });
    });
}

async function deletePost(id) {
    if (!isUserLoggedIn()) {
        requireAuth('social');
        return;
    }
    if (!window.confirm('Bạn muốn xóa bài chia sẻ này?')) return;
    try {
        await apiRequest(SOCIAL_API + '/posts/' + id, { method: 'DELETE' });
        showToast('Đã xóa bài chia sẻ.', 'success');
        loadSocialFeed();
    } catch (error) {
        showToast('Không xóa được bài chia sẻ.', 'error');
    }
}

function collectIngredientLines() {
    const lines = [];
    document.querySelectorAll('#ingredientRows .ing-row').forEach(function (row) {
        const qty = row.querySelector('.ing-qty') ? row.querySelector('.ing-qty').value.trim() : '';
        const unit = row.querySelector('.ing-unit') ? row.querySelector('.ing-unit').value.trim() : '';
        const name = row.querySelector('.ing-name') ? row.querySelector('.ing-name').value.trim() : '';
        if (!name) return;
        const amount = qty ? (qty + (unit ? ' ' + unit : '')) : '';
        lines.push((amount ? amount + ' ' : '') + name);
    });
    return lines;
}

function collectStepLines() {
    const lines = [];
    document.querySelectorAll('#stepRows .step-row .step-input').forEach(function (input) {
        if (input.value.trim()) lines.push(input.value.trim());
    });
    return lines;
}

function renumberSteps() {
    document.querySelectorAll('#stepRows .step-row').forEach(function (row, i) {
        const num = row.querySelector('.step-num');
        if (num) num.textContent = String(i + 1);
    });
}

function renderPostPreview() {
    const card = document.getElementById('postPreviewCard');
    if (!card) return;
    const title = document.getElementById('postTitle') ? document.getElementById('postTitle').value.trim() : '';
    const desc = document.getElementById('postDescription') ? document.getElementById('postDescription').value.trim() : '';
    const time = document.getElementById('postTime') ? document.getElementById('postTime').value : '';
    const kcal = document.getElementById('postKcal') ? document.getElementById('postKcal').value : '';
    const difficulty = document.getElementById('postDifficulty') ? document.getElementById('postDifficulty').value : 'Dễ';
    const imgUrl = document.getElementById('postImage') ? document.getElementById('postImage').value.trim() : '';
    const ings = collectIngredientLines();
    const steps = collectStepLines();
    card.innerHTML =
        '<article class="card post-card post-preview-card">' +
            '<h3 class="post-title">' + (escapeHtml(title) || '<em style="color:var(--text-muted);">Tên món ăn...</em>') + '</h3>' +
            '<div class="post-meta-pills">' +
                (time ? '<span>⏱ ' + escapeHtml(time) + '′</span>' : '') +
                (kcal ? '<span>🔥 ' + escapeHtml(kcal) + ' kcal</span>' : '') +
                '<span>📊 ' + escapeHtml(difficulty) + '</span>' +
            '</div>' +
            (imgUrl ? '<div class="post-img-container"><img class="post-image" src="' + escapeHtml(imgUrl) + '" alt=""></div>' : '') +
            (desc ? '<p class="post-desc">' + escapeHtml(desc) + '</p>' : '') +
            '<div class="post-preview-ing"><b>Nguyên liệu</b>' +
                (ings.length ? '<ul>' + ings.map(function (i) { return '<li>' + escapeHtml(i) + '</li>'; }).join('') + '</ul>' : '<span style="color:var(--text-muted);">Chưa có nguyên liệu</span>') +
            '</div>' +
            '<div class="post-preview-steps"><b>Các bước</b>' +
                (steps.length ? '<ol>' + steps.map(function (s) { return '<li>' + escapeHtml(s) + '</li>'; }).join('') + '</ol>' : '<span style="color:var(--text-muted);">Chưa có bước thực hiện</span>') +
            '</div>' +
        '</article>';
}

function addIngredientRow() {
    const box = document.getElementById('ingredientRows');
    if (!box) return;
    const row = document.createElement('div');
    row.className = 'ing-row';
    row.innerHTML =
        '<input type="text" class="social-input ing-qty" placeholder="SL" style="width:90px;">' +
        '<input type="text" class="social-input ing-unit" placeholder="g" style="width:70px;" list="unitList">' +
        '<input type="text" class="social-input ing-name" placeholder="Tên nguyên liệu">' +
        '<button type="button" class="ing-remove text-button" title="Xóa dòng">✕</button>';
    row.querySelector('.ing-remove').addEventListener('click', function () {
        row.remove();
        renderPostPreview();
    });
    row.querySelectorAll('input').forEach(function (inp) {
        inp.addEventListener('input', renderPostPreview);
    });
    box.appendChild(row);
    renderPostPreview();
}

function addStepRow(text) {
    const box = document.getElementById('stepRows');
    if (!box) return;
    const row = document.createElement('div');
    row.className = 'step-row';
    row.innerHTML =
        '<span class="step-num"></span>' +
        '<input type="text" class="social-input step-input" placeholder="Mô tả bước thực hiện..." value="' + escapeHtml(text || '') + '">' +
        '<button type="button" class="step-remove text-button" title="Xóa bước">✕</button>';
    row.querySelector('.step-remove').addEventListener('click', function () {
        row.remove();
        renumberSteps();
        renderPostPreview();
    });
    row.querySelector('.step-input').addEventListener('input', renderPostPreview);
    box.appendChild(row);
    renumberSteps();
    renderPostPreview();
}

function resetComposer() {
    ['postTitle', 'postDescription', 'postImage'].forEach(function (id) {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    const fileInput = document.getElementById('postImageFile');
    if (fileInput) fileInput.value = '';
    const status = document.getElementById('postImageStatus');
    if (status) { status.style.display = 'none'; status.textContent = ''; }
    const ingBox = document.getElementById('ingredientRows');
    if (ingBox) ingBox.innerHTML = '';
    const stepBox = document.getElementById('stepRows');
    if (stepBox) stepBox.innerHTML = '';
    addIngredientRow();
    addIngredientRow();
    addIngredientRow();
    addStepRow();
    addStepRow();
    renderPostPreview();
}

function ensureComposerRows() {
    const ingBox = document.getElementById('ingredientRows');
    if (ingBox && !ingBox.children.length) {
        addIngredientRow();
        addIngredientRow();
        addIngredientRow();
    }
    const stepBox = document.getElementById('stepRows');
    if (stepBox && !stepBox.children.length) {
        addStepRow();
        addStepRow();
    }
    renderPostPreview();
}

async function handlePostImageUpload(file) {
    if (!file) return;
    if (['image/jpeg', 'image/png', 'image/webp'].indexOf(file.type) === -1) {
        showToast('Chỉ hỗ trợ ảnh JPG, PNG hoặc WEBP', 'warning');
        return;
    }
    const status = document.getElementById('postImageStatus');
    if (status) { status.style.display = 'block'; status.textContent = '⏳ Đang tải ảnh lên...'; }
    try {
        const fd = new FormData();
        fd.append('file', file);
        const token = getToken();
        const resp = await fetch('/api/upload', {
            method: 'POST',
            headers: token ? { Authorization: 'Bearer ' + token } : {},
            body: fd
        });
        if (!resp.ok) {
            let msg = 'Tải ảnh thất bại';
            try { const j = await resp.json(); if (j && j.error) msg = j.error; } catch (_) {}
            throw new Error(msg);
        }
        const data = await resp.json();
        if (data && data.url) {
            const imgInput = document.getElementById('postImage');
            if (imgInput) imgInput.value = data.url;
            if (status) status.textContent = 'Đã tải ảnh lên';
            renderPostPreview();
        }
    } catch (e) {
        if (status) status.textContent = e.message || 'Tải ảnh thất bại';
        showToast(e.message || 'Tải ảnh thất bại', 'error');
    }
}

async function createPost(status) {
    if (!isUserLoggedIn()) {
        requireAuth('post');
        return;
    }
    const titleEl = document.getElementById('postTitle');
    const title = titleEl ? titleEl.value.trim() : '';
    if (!title) {
        showToast('Vui lòng nhập tên món ăn.', 'warning');
        if (titleEl) titleEl.focus();
        return;
    }
    const publish = status !== 'DRAFT';
    const btn = publish ? document.getElementById('postSubmit') : document.getElementById('postDraftBtn');
    const btnLabel = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = '⏳ Đang lưu...'; }

    const timeEl = document.getElementById('postTime');
    const kcalEl = document.getElementById('postKcal');
    const servingsEl = document.getElementById('postServings');
    const payload = {
        title: title,
        description: document.getElementById('postDescription') ? document.getElementById('postDescription').value.trim() : '',
        ingredients: collectIngredientLines(),
        steps: collectStepLines(),
        imageUrl: (document.getElementById('postImage') && document.getElementById('postImage').value.trim()) || null,
        category: document.getElementById('postCategory') ? document.getElementById('postCategory').value : 'family',
        cookTime: +(timeEl && timeEl.value) || 30,
        kcal: +(kcalEl && kcalEl.value) || 350,
        servings: +(servingsEl && servingsEl.value) || 2,
        difficulty: document.getElementById('postDifficulty') ? document.getElementById('postDifficulty').value : 'Dễ',
        status: publish ? 'PUBLISHED' : 'DRAFT'
    };

    try {
        const savedPost = await apiRequest(SOCIAL_API + '/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        showToast(publish ? 'Đã xuất bản công thức! 🎉' : 'Đã lưu bản nháp.', 'success');
        if (savedPost && savedPost.status !== 'DRAFT') {
            allSocialPostsCache.unshift(savedPost);
        }
        resetComposer();
        const composerCard = document.getElementById('socialComposerCard');
        if (composerCard) composerCard.hidden = true;
        loadSocialFeed();
    } catch (e) {
        showToast('Không thể đăng bài lúc này: ' + (e.message || ''), 'error');
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = btnLabel; }
    }
}

(function initSocialAndChat() {
    const submit = document.getElementById('postSubmit');
    if (submit) submit.addEventListener('click', function () { createPost('PUBLISHED'); });
    const draftBtn = document.getElementById('postDraftBtn');
    if (draftBtn) draftBtn.addEventListener('click', function () { createPost('DRAFT'); });

    if (!document.getElementById('unitList')) {
        const dl = document.createElement('datalist');
        dl.id = 'unitList';
        dl.innerHTML = '<option value="g"></option><option value="kg"></option><option value="ml"></option><option value="muỗng"></option><option value="quả"></option><option value="củ"></option><option value="bó"></option>';
        document.body.appendChild(dl);
    }

    const addIngBtn = document.getElementById('addIngredientRowBtn');
    if (addIngBtn) addIngBtn.addEventListener('click', function () { addIngredientRow(); });
    const addStepBtn = document.getElementById('addStepRowBtn');
    if (addStepBtn) addStepBtn.addEventListener('click', function () { addStepRow(); });

    const fileInput = document.getElementById('postImageFile');
    if (fileInput) fileInput.addEventListener('change', function () {
        if (fileInput.files && fileInput.files[0]) handlePostImageUpload(fileInput.files[0]);
    });

    ['postTitle', 'postDescription', 'postTime', 'postKcal', 'postServings', 'postImage'].forEach(function (id) {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', renderPostPreview);
    });
    ['postCategory', 'postDifficulty'].forEach(function (id) {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', renderPostPreview);
    });

    // Toggle composer
    const toggleBtn = document.getElementById('toggleComposerBtn');
    const closeBtn = document.getElementById('closeComposerBtn');
    const cancelBtn = document.getElementById('cancelComposerBtn');
    const composerCard = document.getElementById('socialComposerCard');

    if (toggleBtn && composerCard) {
        toggleBtn.addEventListener('click', function() {
            composerCard.hidden = !composerCard.hidden;
            if (!composerCard.hidden) {
                ensureComposerRows();
                const titleInput = document.getElementById('postTitle');
                if (titleInput) titleInput.focus();
            }
        });
    }

    if (closeBtn && composerCard) closeBtn.addEventListener('click', function() { composerCard.hidden = true; });
    if (cancelBtn && composerCard) cancelBtn.addEventListener('click', function() { composerCard.hidden = true; });

    // Category pills filter
    document.querySelectorAll('#socialCategoryPills .social-pill').forEach(function(pill) {
        pill.addEventListener('click', function() {
            document.querySelectorAll('#socialCategoryPills .social-pill').forEach(function(p) { p.classList.remove('active'); });
            pill.classList.add('active');
            currentSocialCategory = pill.getAttribute('data-social-cat') || 'all';
            renderSocialFeedFiltered();
        });
    });

    // Search input filter
    const searchInput = document.getElementById('socialSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            currentSocialSearch = searchInput.value;
            renderSocialFeedFiltered();
        });
    }

    ensureComposerRows();
    loadSocialFeed();
})();







/* =========================================================
   STATS - THỐNG KÊ (gop tu dk-dn)
========================================================= */
/* loadStats is implemented in STATS section with full insights & waste tracker */

function drawLineChart(byDay) {
    const svg = document.getElementById('statsLine');
    const labels = document.getElementById('statsLabels');
    if (!svg) return;
    const data = (byDay || []).map(function (d) { return d.kcal || 0; });
    const dates = (byDay || []).map(function (d) { return String(d.date || '').slice(5); });
    const W = 340, H = 150, pad = 8;
    const max = Math.max.apply(null, data.concat([1]));
    const x = function (i) { return pad + i * (W - pad * 2) / Math.max(1, data.length - 1); };
    const y = function (v) { return H - 14 - (v / max) * (H - 40); };
    const pts = data.map(function (v, i) { return x(i).toFixed(1) + ',' + y(v).toFixed(1); });
    if (data.length > 1) {
        svg.innerHTML =
            '<polyline class="stats-line" points="' + pts.join(' ') + '"/>' +
            pts.map(function (p, i) {
                return '<circle class="stats-dot" cx="' + p.split(',')[0] + '" cy="' + p.split(',')[1] + '" r="3"><title>' + (dates[i] || '') + ': ' + data[i] + ' kcal</title></circle>';
            }).join('');
    } else {
        svg.innerHTML = '<text x="170" y="75" text-anchor="middle" class="stats-empty-text">Chưa có dữ liệu</text>';
    }
    if (labels) labels.innerHTML = dates.map(function (d) { return '<span>' + d + '</span>'; }).join('');
}





async function addCurRecipeMissingToShopping() {
    if (!curRecipe) {
        showToast('Chưa chọn món ăn.', 'warning');
        return;
    }
    if (!isUserLoggedIn()) {
        requireAuth('shopping');
        return;
    }
    await addRecipeIngredientsToShopping(curRecipe.id, true);
}

async function addCurRecipeAllToShopping() {
    if (!curRecipe) {
        showToast('Chưa chọn món ăn.', 'warning');
        return;
    }
    if (!isUserLoggedIn()) {
        requireAuth('shopping');
        return;
    }
    await addRecipeIngredientsToShopping(curRecipe.id, false);
}

/* =========================================================
   WIRING CÁC TÍNH NĂNG MỚI
========================================================= */
(function initDkDnFeatures() {
    const rs = document.getElementById('recipeSearch');
    if (rs) rs.addEventListener('input', debounce(renderRecipeBrowse, 200));
    const rf = document.getElementById('recipeFilter');
    if (rf) rf.addEventListener('change', renderRecipeBrowse);
    const rms = document.getElementById('recipeMealSlot');
    if (rms) rms.addEventListener('change', function () { syncRecipeChips(); renderRecipeBrowse(); });
    const rsp = document.getElementById('recipeSpeed');
    if (rsp) rsp.addEventListener('change', function () { syncRecipeChips(); renderRecipeBrowse(); });
    const rcat = document.getElementById('recipeCategory');
    if (rcat) rcat.addEventListener('change', function () { syncRecipeChips(); renderRecipeBrowse(); });
    const rdiff = document.getElementById('recipeDifficulty');
    if (rdiff) rdiff.addEventListener('change', function () { renderRecipeBrowse(); });

    // Quick chips click handling
    document.querySelectorAll('.rc-chip').forEach(function (btn) {
        btn.addEventListener('click', function () {
            const chip = this.getAttribute('data-chip');
            handleRecipeChipClick(chip);
        });
    });

    const save = document.getElementById('rdSave');
    if (save) save.addEventListener('click', toggleSaveRecipe);
    const plan = document.getElementById('rdPlan');
    if (plan) plan.addEventListener('click', addCurToPlan);
    const cook = document.getElementById('rdCook');
    if (cook) cook.addEventListener('click', cookNow);
    const deleteBtn = document.getElementById('rdDelete');
    if (deleteBtn) deleteBtn.addEventListener('click', function () {
        if (!curRecipe || !curRecipe.id) return;
        deleteRecipeById(curRecipe.id, curRecipe.title || curRecipe.name);
    });
    const addShopBtn = document.getElementById('rdAddShop');
    if (addShopBtn) addShopBtn.addEventListener('click', addCurRecipeMissingToShopping);
    const addShopAllBtn = document.getElementById('rdAddShopAll');
    if (addShopAllBtn) addShopAllBtn.addEventListener('click', addCurRecipeAllToShopping);
    const addFridgeBtn = document.getElementById('rdAddFridge');
    if (addFridgeBtn) addFridgeBtn.addEventListener('click', addCurRecipeAllToShopping);

    document.querySelectorAll('[data-rdtab]').forEach(function (t) {
        t.addEventListener('click', function () {
            document.querySelectorAll('[data-rdtab]').forEach(function (x) { x.classList.remove('active'); });
            t.classList.add('active');
            ['rdIng', 'rdSteps', 'rdNutri'].forEach(function (id) {
                const el = document.getElementById(id);
                if (el) {
                    el.classList.toggle('active', id === 'rd' + t.getAttribute('data-rdtab').charAt(0).toUpperCase() + t.getAttribute('data-rdtab').slice(1));
                }
            });
        });
    });

    const pp = document.getElementById('planPrev');
    if (pp) pp.addEventListener('click', function () { planOffset--; loadPlan(); });
    const pn = document.getElementById('planNext');
    if (pn) pn.addEventListener('click', function () { planOffset++; loadPlan(); });
    const pa = document.getElementById('planAuto');
    if (pa) pa.addEventListener('click', autoPlan);

    // Plan Meal Modal Tabs & Handlers
    const tabAi = document.getElementById('pmmTabAi');
    if (tabAi) tabAi.addEventListener('click', function () { switchPlanModalTab('ai'); });
    const tabCustom = document.getElementById('pmmTabCustom');
    if (tabCustom) tabCustom.addEventListener('click', function () { switchPlanModalTab('custom'); });
    const tabRecipe = document.getElementById('pmmTabRecipe');
    if (tabRecipe) tabRecipe.addEventListener('click', function () { switchPlanModalTab('recipe'); });

    // Quick tag chips
    document.querySelectorAll('#pmmTags .filter-chip').forEach(function (btn) {
        btn.addEventListener('click', function () {
            const promptInput = document.getElementById('pmmAiPrompt');
            if (promptInput) {
                const tag = btn.getAttribute('data-tag') || btn.textContent.trim();
                promptInput.value = tag;
            }
        });
    });

    // AI Suggest submit
    const aiSubBtn = document.getElementById('pmmAiSubmit');
    if (aiSubBtn) {
        aiSubBtn.addEventListener('click', async function () {
            if (!currentPlanDate || !currentPlanSlot) return;
            const prompt = document.getElementById('pmmAiPrompt') ? document.getElementById('pmmAiPrompt').value.trim() : '';
            const targetKcal = document.getElementById('pmmAiTargetKcal') ? +document.getElementById('pmmAiTargetKcal').value : 450;

            console.log('[MealPlan] pmmAiSubmit clicked:', { prompt, targetKcal, currentPlanDate, currentPlanSlot });
            aiSubBtn.disabled = true;
            aiSubBtn.textContent = '⏳ AI đang sáng tạo món ăn...';

            let res = null;
            try {
                res = await apiRequest('/api/plan/suggest-slot', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        planDate: currentPlanDate,
                        slot: currentPlanSlot,
                        prompt: prompt,
                        targetKcal: targetKcal
                    })
                });
            } catch (e) {
                console.warn('[MealPlan] suggest-slot error:', e);
            } finally {
                aiSubBtn.disabled = false;
                aiSubBtn.textContent = '✨ AI Gợi ý & Thêm vào kế hoạch';
            }

            const recipeTitle = (res && res.recipeTitle) || (prompt || 'Món ngon AI đề xuất');
            const recipeKcal = (res && res.recipeKcal) || targetKcal || 450;

            // Cập nhật trực tiếp vào state planEntries
            planEntries = (planEntries || []).filter(e => !(e.planDate === currentPlanDate && e.slot === currentPlanSlot));
            planEntries.push({
                id: (res && res.id) || Date.now(),
                planDate: currentPlanDate,
                slot: currentPlanSlot,
                recipeId: (res && res.recipeId) || null,
                recipeTitle: recipeTitle,
                recipeKcal: recipeKcal
            });

            showToast('✨ AI đã thêm món "' + recipeTitle + '" (' + recipeKcal + ' kcal) vào thực đơn!', 'success');
            closeAddMealModal();
            renderPlan(weekDays(planOffset));
        });
    }

    // AI Estimate Dish
    const estBtn = document.getElementById('pmmEstimateBtn');
    if (estBtn) {
        estBtn.addEventListener('click', async function () {
            const titleInput = document.getElementById('pmmCustomTitle');
            const dish = titleInput ? titleInput.value.trim() : '';
            if (!dish) {
                showToast('Vui lòng nhập tên món ăn cần chấm calo', 'warning');
                if (titleInput) titleInput.focus();
                return;
            }
            console.log('[MealPlan] pmmEstimateBtn clicked for dish:', dish);
            estBtn.disabled = true;
            estBtn.textContent = '⏳ AI đang tính...';

            try {
                const res = await apiRequest('/api/plan/estimate-dish', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ dishName: dish, slot: currentPlanSlot })
                });
                if (res) {
                    if (document.getElementById('pmmCustomKcal')) document.getElementById('pmmCustomKcal').value = res.kcal || 450;
                    if (document.getElementById('pmmCustomProtein')) document.getElementById('pmmCustomProtein').value = res.protein || 20;
                    if (document.getElementById('pmmCustomCarb')) document.getElementById('pmmCustomCarb').value = res.carb || 50;
                    if (document.getElementById('pmmCustomFat')) document.getElementById('pmmCustomFat').value = res.fat || 12;
                    if (document.getElementById('pmmCustomDesc') && res.description) document.getElementById('pmmCustomDesc').value = res.description;
                    showToast('✨ AI chấm món "' + dish + '": ~' + res.kcal + ' kcal (Protein: ' + res.protein + 'g, Carb: ' + res.carb + 'g, Fat: ' + res.fat + 'g)', 'success');
                }
            } catch (e) {
                showToast('Không thể ước tính calo lúc này', 'error');
            } finally {
                estBtn.disabled = false;
                estBtn.textContent = '⚡ AI Chấm Calo';
            }
        });
    }

    // Custom Dish Submit
    const custSubBtn = document.getElementById('pmmCustomSubmit');
    if (custSubBtn) {
        custSubBtn.addEventListener('click', async function () {
            if (!currentPlanDate || !currentPlanSlot) return;
            const title = document.getElementById('pmmCustomTitle') ? document.getElementById('pmmCustomTitle').value.trim() : '';
            if (!title) {
                showToast('Vui lòng nhập tên món ăn', 'warning');
                return;
            }
            console.log('[MealPlan] pmmCustomSubmit clicked:', { title, currentPlanDate, currentPlanSlot });
            const kcal = document.getElementById('pmmCustomKcal') ? +document.getElementById('pmmCustomKcal').value : 450;
            const protein = document.getElementById('pmmCustomProtein') ? +document.getElementById('pmmCustomProtein').value : 20;
            const carb = document.getElementById('pmmCustomCarb') ? +document.getElementById('pmmCustomCarb').value : 50;
            const fat = document.getElementById('pmmCustomFat') ? +document.getElementById('pmmCustomFat').value : 12;
            const desc = document.getElementById('pmmCustomDesc') ? document.getElementById('pmmCustomDesc').value.trim() : '';

            custSubBtn.disabled = true;
            custSubBtn.textContent = '⏳ Đang lưu...';

            try {
                await apiRequest('/api/plan/custom-slot', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        planDate: currentPlanDate,
                        slot: currentPlanSlot,
                        title: title,
                        kcal: kcal,
                        protein: protein,
                        carb: carb,
                        fat: fat,
                        description: desc
                    })
                });
            } catch (e) {
                console.warn('[MealPlan] custom-slot API error:', e);
            } finally {
                custSubBtn.disabled = false;
                custSubBtn.textContent = '💾 Thêm món này vào kế hoạch';
            }

            // Cập nhật trực tiếp vào state thực đơn
            planEntries = (planEntries || []).filter(e => !(e.planDate === currentPlanDate && e.slot === currentPlanSlot));
            planEntries.push({
                id: Date.now(),
                planDate: currentPlanDate,
                slot: currentPlanSlot,
                recipeId: null,
                recipeTitle: title,
                recipeKcal: kcal
            });

            showToast('Đã thêm món "' + title + '" (' + kcal + ' kcal) vào thực đơn 🎉', 'success');
            closeAddMealModal();
            renderPlan(weekDays(planOffset));
        });
    }

    // Recipe Search in modal
    const pmmSearch = document.getElementById('pmmRecipeSearch');
    if (pmmSearch) {
        pmmSearch.addEventListener('input', function () {
            renderPmmRecipes(pmmSearch.value.trim());
        });
    }

    // Modal Close
    document.querySelectorAll('[data-close="planMealModal"]').forEach(function (btn) {
        btn.addEventListener('click', closeAddMealModal);
    });

    const pmmOverlay = document.getElementById('planMealModal');
    if (pmmOverlay) {
        pmmOverlay.addEventListener('click', function (e) {
            if (e.target === pmmOverlay) closeAddMealModal();
        });
    }

    // Add To Plan Modal events & close
    if (typeof initAddToPlanModalEvents === 'function') {
        initAddToPlanModalEvents();
    }

    document.querySelectorAll('[data-close="addToPlanModal"]').forEach(function (btn) {
        btn.addEventListener('click', closeAddToPlanModal);
    });

    const atpOverlay = document.getElementById('addToPlanModal');
    if (atpOverlay) {
        atpOverlay.addEventListener('click', function (e) {
            if (e.target === atpOverlay) closeAddToPlanModal();
        });
    }

})();



/* =========================================================
   FOODX REDESIGN — helpers + UX polish
========================================================= */

/* ---------- Skeleton / Empty / Error ---------- */
function showSkeleton(el, type, n) {
    if (!el) return;
    const unit = type === 'card' ? '<div class="sk sk-card"></div>'
        : type === 'row' ? '<div class="sk sk-row"></div>'
        : '<div class="sk sk-text"></div>';
    el.innerHTML = '<div class="' + (type === 'card' ? 'sk-grid' : 'sk-list') + '">' + Array(n || 3).fill(unit).join('') + '</div>';
}

function renderEmpty(el, icon, title, desc, ctaLabel, ctaFn) {
    if (!el) return;
    el.innerHTML = '<div class="empty-state"><span class="es-icon">' + (icon || '🥗') + '</span>' +
        '<b>' + title + '</b><p>' + desc + '</p>' +
        (ctaLabel ? '<button type="button" class="primary-button" id="emptyCtaBtn">' + ctaLabel + '</button>' : '') +
        '</div>';
    const btn = document.getElementById('emptyCtaBtn');
    if (btn && ctaFn) btn.addEventListener('click', ctaFn);
}

function renderError(el, retryFn) {
    if (!el) return;
    el.innerHTML = '<div class="error-state"><b>Không thể tải dữ liệu</b>' +
        '<p>Vui lòng thử lại.</p>' +
        '<button type="button" class="secondary-button" id="errRetryBtn">Thử lại</button></div>';
    const btn = document.getElementById('errRetryBtn');
    if (btn && retryFn) btn.addEventListener('click', retryFn);
}


/* =========================================================
   HOME DASHBOARD
========================================================= */
function homeUserName() {
    try {
        if (window.authState && authState.authenticated && (authState.fullName || authState.username)) {
            return authState.fullName || authState.username;
        }
    } catch (e) { }
    return '';
}

function expiryInfo(iso) {
    if (!iso) return null;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const d = new Date(iso + 'T00:00:00');
    const diff = Math.round((d - today) / 864e5);
    if (diff < 0) return { cls: 'expired', label: 'Đã hết hạn' };
    if (diff === 0) return { cls: 'soon', label: 'Hết hạn hôm nay' };
    if (diff <= 2) return { cls: 'soon', label: 'Còn ' + diff + ' ngày' };
    return { cls: 'ok', label: 'Còn ' + diff + ' ngày' };
}

function foodEmoji(name) {
    const n = String(name || '').toLowerCase();
    const map = { 'gà': '🍗', 'bò': '🥩', 'heo': '🥓', 'cá': '🐟', 'tôm': '🦐', 'trứng': '🥚', 'sữa': '🥛', 'cà rốt': '🥕', 'cải': '🥬', 'bông cải': '🥦', 'hành': '🌿', 'tỏi': '🧄', 'cà chua': '🍅', 'bí': '🎃', 'chuối': '🍌', 'táo': '🍎', 'chanh': '🍋', 'ớt': '🌶️', 'gạo': '🍚', 'mì': '🍜', 'bánh mì': '🥖', 'đậu hũ': '⬜', 'rau': '🥬', 'mật ong': '🍯', 'dầu': '🫗' };
    for (const k in map) { if (n.includes(k)) return map[k]; }
    return '🥫';
}

/* =========================================================
   GUEST HOME CONTROLLER (CHƯA ĐĂNG NHẬP)
========================================================= */

let guestCurrentTab = 'recipes';
let guestRecipeCat = 'all';
let guestRecipeQuery = '';
let guestIngredientCat = 'all';
let guestIngredientQuery = '';
let guestHomeEventsBound = false;

window.openLoginModal = function() {
    const modal = document.getElementById('loginModal');
    if (modal) modal.classList.add('show');
};

window.openRegisterModal = function() {
    const modal = document.getElementById('registerModal');
    if (modal) modal.classList.add('show');
};

function initGuestHomeEvents() {
    if (guestHomeEventsBound) return;
    guestHomeEventsBound = true;

    // Recipes search & pills
    const recipeSearch = document.getElementById('guestRecipeSearch');
    let rDebounce;
    if (recipeSearch) {
        recipeSearch.addEventListener('input', (e) => {
            clearTimeout(rDebounce);
            rDebounce = setTimeout(() => {
                guestRecipeQuery = (e.target.value || '').trim().toLowerCase();
                renderGuestRecipes();
            }, 250);
        });
    }

    const recipePills = document.querySelectorAll('#guestRecipePills .guest-pill');
    recipePills.forEach(pill => {
        pill.addEventListener('click', () => {
            recipePills.forEach(p => p.classList.toggle('active', p === pill));
            guestRecipeCat = pill.getAttribute('data-cat') || 'all';
            renderGuestRecipes();
        });
    });

    // Ingredients search & pills
    const ingSearch = document.getElementById('guestIngredientSearch');
    let iDebounce;
    if (ingSearch) {
        ingSearch.addEventListener('input', (e) => {
            clearTimeout(iDebounce);
            iDebounce = setTimeout(() => {
                guestIngredientQuery = (e.target.value || '').trim().toLowerCase();
                renderGuestIngredients();
            }, 250);
        });
    }

    const ingPills = document.querySelectorAll('#guestIngredientPills .guest-pill');
    ingPills.forEach(pill => {
        pill.addEventListener('click', () => {
            ingPills.forEach(p => p.classList.toggle('active', p === pill));
            guestIngredientCat = pill.getAttribute('data-cat') || 'all';
            renderGuestIngredients();
        });
    });
}

let guestRecipesExpanded = false;
let guestIngredientsExpanded = false;
let guestSocialExpanded = false;
let guestSocialCache = null;

function toggleGuestMore(section) {
    if (section === 'recipes') {
        guestRecipesExpanded = !guestRecipesExpanded;
        renderGuestRecipes();
    } else if (section === 'ingredients') {
        guestIngredientsExpanded = !guestIngredientsExpanded;
        renderGuestIngredients();
    } else if (section === 'social') {
        guestSocialExpanded = !guestSocialExpanded;
        renderGuestSocial();
    }
}
window.toggleGuestMore = toggleGuestMore;

function renderGuestHome() {
    initGuestHomeEvents();
    try { renderGuestRecipes(); } catch (e) { console.error('Lỗi render món guest:', e); }
    try { renderGuestIngredients(); } catch (e) { console.error('Lỗi render nguyên liệu guest:', e); }
    try { renderGuestSocial(); } catch (e) { console.error('Lỗi render chia sẻ guest:', e); }
}
window.renderGuestHome = renderGuestHome;

function renderGuestRecipes() {
    const grid = document.getElementById('guestRecipesGrid');
    if (!grid) return;

    let list = [];
    if (typeof homeBlogRecipesCache !== 'undefined' && Array.isArray(homeBlogRecipesCache) && homeBlogRecipesCache.length > 0) {
        list = homeBlogRecipesCache;
    } else if (typeof VIETNAMESE_RECIPES !== 'undefined' && Array.isArray(VIETNAMESE_RECIPES) && VIETNAMESE_RECIPES.length > 0) {
        list = VIETNAMESE_RECIPES;
    } else if (typeof recipes !== 'undefined' && Array.isArray(recipes) && recipes.length > 0) {
        list = recipes;
    } else if (typeof recipesCache !== 'undefined' && Array.isArray(recipesCache) && recipesCache.length > 0) {
        list = recipesCache;
    }

    const cat = guestRecipeCat || 'all';
    const q = guestRecipeQuery || '';

    const filtered = (list || []).filter(r => {
        const title = (r.title || r.name || '').toLowerCase();
        const desc = (r.description || '').toLowerCase();
        const rCat = (r.category || '').toLowerCase();

        let matchesCat = true;
        if (cat === 'main') {
            matchesCat = rCat.includes('main') || rCat.includes('chính') || rCat.includes('món ăn') || (!rCat.includes('soup') && !rCat.includes('canh') && !rCat.includes('diet') && !rCat.includes('clean'));
        } else if (cat === 'soup') {
            matchesCat = rCat.includes('soup') || rCat.includes('canh') || title.includes('canh') || title.includes('súp') || title.includes('phở') || title.includes('bún');
        } else if (cat === 'diet') {
            matchesCat = rCat.includes('diet') || rCat.includes('clean') || rCat.includes('healthy') || title.includes('salad') || title.includes('ức gà') || title.includes('hấp');
        } else if (cat === 'quick') {
            const timeNum = parseInt(r.cookTime || r.time || 30);
            matchesCat = timeNum <= 20 || title.includes('trứng') || title.includes('xào');
        }

        const matchesQ = !q || title.includes(q) || desc.includes(q);
        return matchesCat && matchesQ;
    });

    const headerBtn = document.getElementById('guestBtnMoreRecipes');
    const footerBtn = document.getElementById('guestFooterRecipes');
    const hasMore = filtered.length > 10;

    if (headerBtn) {
        headerBtn.style.display = hasMore ? 'inline-flex' : 'none';
        headerBtn.innerHTML = guestRecipesExpanded
            ? '<span class="guest-more-label">Thu gọn</span> <span class="guest-more-icon">➖</span>'
            : '<span class="guest-more-label">Xem thêm</span> <span class="guest-more-icon">➕</span>';
    }
    if (footerBtn) {
        footerBtn.style.display = hasMore ? 'flex' : 'none';
        const lbl = footerBtn.querySelector('.guest-more-label');
        const ico = footerBtn.querySelector('.guest-more-icon');
        if (lbl) lbl.textContent = guestRecipesExpanded ? 'Thu gọn bớt' : 'Xem thêm món ăn khác';
        if (ico) ico.textContent = guestRecipesExpanded ? '➖' : '➕';
    }

    if (filtered.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 30px 20px; color: var(--text-soft);">' +
            '<p style="font-size: 15px; font-weight: 600; margin-bottom: 4px;">🔍 Không tìm thấy món ăn phù hợp</p>' +
            '<span style="font-size: 13px;">Thử tìm kiếm với từ khóa khác hoặc bấm nút "Tất cả".</span>' +
            '</div>';
        return;
    }

    // 5 cột x 2 dòng = 10 món khi chưa mở rộng
    const limit = guestRecipesExpanded ? 30 : 10;
    const displayList = filtered.slice(0, limit);

    grid.innerHTML = displayList.map(r => {
        const img = r.imageUrl || r.image || '/images/recipes/default-recipe.jpg';
        const title = r.title || r.name || 'Món ăn ngon';
        const kcal = r.kcal ? Math.round(r.kcal) : (r.calories || 350);
        const time = r.cookTime ? (String(r.cookTime).includes('phút') ? r.cookTime : r.cookTime + ' phút') : (r.time ? r.time + ' phút' : '25 phút');
        const diff = r.difficulty || 'Dễ';

        return `
        <article class="card blog-card guest-recipe-card" onclick="openRecipeDetail('${r.id}')" title="Bấm để xem chi tiết công thức">
            <div class="blog-card-thumb">
                <img class="blog-card-img" src="${img}" alt="${escapeHtml(title)}" loading="lazy" onerror="this.src='/images/recipes/default-recipe.jpg'">
                <span class="recipe-time-badge">⏱ ${time}</span>
            </div>
            <div class="blog-card-body">
                <h4>${escapeHtml(title)}</h4>
                <div class="recipe-meta-row">
                    <span class="recipe-kcal-badge">🔥 ${kcal} kcal</span>
                    <span class="recipe-diff-badge">${escapeHtml(diff)}</span>
                </div>
                <div class="recipe-cta">
                    <span>Xem cách nấu</span>
                    <span>→</span>
                </div>
            </div>
        </article>`;
    }).join('');

    // Fetch API async in background if cache is empty
    if (!homeBlogRecipesCache) {
        loadHomeBlogRecipes().then(res => {
            if (Array.isArray(res) && res.length > 0) {
                renderGuestRecipes();
            }
        }).catch(() => {});
    }
}
window.renderGuestRecipes = renderGuestRecipes;

function renderGuestIngredients() {
    const grid = document.getElementById('guestIngredientsGrid');
    if (!grid) return;

    const cat = guestIngredientCat || 'all';
    const q = guestIngredientQuery || '';

    const list = (typeof catalog !== 'undefined' && Array.isArray(catalog)) ? catalog : [];
    const filtered = list.filter(f => {
        const matchesCat = (cat === 'all') || (f.category === cat) || (cat === 'meat' && (f.type && (f.type.includes('Thịt') || f.type.includes('Hải sản'))));
        const matchesQ = !q || (f.name && f.name.toLowerCase().includes(q)) || (f.type && f.type.toLowerCase().includes(q));
        return matchesCat && matchesQ;
    });

    const headerBtn = document.getElementById('guestBtnMoreIngredients');
    const footerBtn = document.getElementById('guestFooterIngredients');
    const hasMore = filtered.length > 10;

    if (headerBtn) {
        headerBtn.style.display = hasMore ? 'inline-flex' : 'none';
        headerBtn.innerHTML = guestIngredientsExpanded
            ? '<span class="guest-more-label">Thu gọn</span> <span class="guest-more-icon">➖</span>'
            : '<span class="guest-more-label">Xem thêm</span> <span class="guest-more-icon">➕</span>';
    }
    if (footerBtn) {
        footerBtn.style.display = hasMore ? 'flex' : 'none';
        const lbl = footerBtn.querySelector('.guest-more-label');
        const ico = footerBtn.querySelector('.guest-more-icon');
        if (lbl) lbl.textContent = guestIngredientsExpanded ? 'Thu gọn bớt' : 'Xem thêm nguyên liệu khác';
        if (ico) ico.textContent = guestIngredientsExpanded ? '➖' : '➕';
    }

    if (filtered.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 30px 20px; color: var(--text-soft);">' +
            '<p style="font-size: 15px; font-weight: 600; margin-bottom: 4px;">🔍 Không tìm thấy nguyên liệu phù hợp</p>' +
            '<span style="font-size: 13px;">Thử tìm kiếm với từ khóa khác hoặc bấm nút "Tất cả".</span>' +
            '</div>';
        return;
    }

    // 5 cột x 2 dòng = 10 nguyên liệu khi chưa mở rộng
    const limit = guestIngredientsExpanded ? 30 : 10;
    const displayList = filtered.slice(0, limit);

    grid.innerHTML = displayList.map(f => {
        const img = f.image || '/images/foods/placeholder.jpg';
        return `
        <div class="catalog-card" onclick="requireAuth('fridge')" title="Bấm để thêm vào tủ lạnh">
            <div class="catalog-card-header">
                <div class="catalog-img-wrap">
                    <img src="${img}" class="catalog-card-img" alt="${escapeHtml(f.name)}" onerror="this.src='/images/placeholder.svg'">
                </div>
                <div class="catalog-card-info">
                    <h4>${escapeHtml(f.name)}</h4>
                    <span>${f.quantity} ${escapeHtml(f.unit || '')} · <strong>${f.kcal || 0} kcal</strong></span>
                </div>
            </div>
            <div class="catalog-card-meta">
                <span>⏱ ~${f.expiryDays || 7} ngày</span>
                <span>🏷 ${escapeHtml(f.type || 'Thực phẩm')}</span>
            </div>
            <button type="button" class="catalog-add-btn" onclick="event.stopPropagation(); requireAuth('fridge')">
                + Thêm vào tủ
            </button>
        </div>`;
    }).join('');
}
window.renderGuestIngredients = renderGuestIngredients;

function renderGuestSocial() {
    const feed = document.getElementById('guestSocialFeed');
    if (!feed) return;

    if (guestSocialCache === null && typeof apiRequest === 'function') {
        feed.innerHTML = '<div class="social-empty" style="grid-column:1/-1;">Đang tải bài chia sẻ...</div>';
        guestSocialCache = [];
        apiRequest('/api/social/posts').then(function (res) {
            var apiPosts = [];
            if (Array.isArray(res)) apiPosts = res;
            else if (res && Array.isArray(res.data)) apiPosts = res.data;
            else if (res && Array.isArray(res.content)) apiPosts = res.content;
            guestSocialCache = apiPosts || [];
            renderGuestSocial();
        }).catch(function () {
            guestSocialCache = [];
            renderGuestSocial();
        });
        return;
    }

    const sourcePosts = guestSocialCache || [];

    const headerBtn = document.getElementById('guestBtnMoreSocial');
    const footerBtn = document.getElementById('guestFooterSocial');
    const hasMore = sourcePosts.length > 10;

    if (headerBtn) {
        headerBtn.style.display = hasMore ? 'inline-flex' : 'none';
        headerBtn.innerHTML = guestSocialExpanded
            ? '<span class="guest-more-label">Thu gọn</span> <span class="guest-more-icon">➖</span>'
            : '<span class="guest-more-label">Xem thêm</span> <span class="guest-more-icon">➕</span>';
    }
    if (footerBtn) {
        footerBtn.style.display = hasMore ? 'flex' : 'none';
        const lbl = footerBtn.querySelector('.guest-more-label');
        const ico = footerBtn.querySelector('.guest-more-icon');
        if (lbl) lbl.textContent = guestSocialExpanded ? 'Thu gọn bớt' : 'Xem thêm bài chia sẻ khác';
        if (ico) ico.textContent = guestSocialExpanded ? '➖' : '➕';
    }

    // 5 cột x 2 dòng = 10 bài viết khi chưa mở rộng
    const limit = guestSocialExpanded ? 30 : 10;
    if (!sourcePosts.length) {
        feed.innerHTML = '<div class="social-empty" style="grid-column:1/-1;">Chưa có bài chia sẻ từ cộng đồng.</div>';
        return;
    }

    const displayPosts = sourcePosts.slice(0, limit);

    feed.innerHTML = displayPosts.map(p => postCard(p)).join('');

}
window.renderGuestSocial = renderGuestSocial;

async function loadHomeDashboard() {
    const authDash = document.getElementById('homeAuthDashboard');
    const guestDash = document.getElementById('homeGuestDashboard');
    const loggedIn = isUserLoggedIn();

    if (authDash && guestDash) {
        if (loggedIn) {
            authDash.style.display = '';
            guestDash.style.display = 'none';
        } else {
            authDash.style.display = 'none';
            guestDash.style.display = 'flex';
            if (typeof renderGuestHome === 'function') renderGuestHome();
            return;
        }
    }

    const greet = document.getElementById('homeGreeting');
    const dateEl = document.getElementById('homeDate');
    if (greet) {
        const name = homeUserName();
        greet.textContent = name ? 'Chào ' + name.split(' ').pop() + ' 👋' : 'Chào bạn 👋';
    }
    if (dateEl) {
        dateEl.textContent = new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' });
    }

    // Fridge status + expiring
    const card = document.getElementById('homeFridgeCard');
    const expBox = document.getElementById('homeExpiringCard');
    const expList = document.getElementById('homeExpiring');
    const title = document.getElementById('homeFridgeTitle');
    const sub = document.getElementById('homeFridgeSub');
    let items = [];
    try {
        items = await apiRequest('/api/fridge') || [];
    } catch (e) {
        if (title) title.textContent = 'Đăng nhập để quản lý tủ lạnh';
        if (sub) sub.textContent = 'Lưu nguyên liệu và nhận gợi ý món ăn';
        return;
    }
    if (title) title.textContent = 'Bạn có ' + items.length + ' nguyên liệu trong tủ';
    const expiring = items.filter(function (i) {
        const info = expiryInfo(i.expiresAt);
        return info && (info.cls === 'expired' || info.cls === 'soon');
    }).sort(function (a, b) { return String(a.expiresAt).localeCompare(String(b.expiresAt)); });
    if (sub) sub.textContent = expiring.length ? expiring.length + ' nguyên liệu sắp hết hạn' : 'Tủ lạnh còn đủ thời gian sử dụng';
    if (expBox && expiring.length) {
        expBox.hidden = false;
        if (expList) {
            expList.innerHTML = expiring.slice(0, 4).map(function (i) {
                const info = expiryInfo(i.expiresAt);
                return '<div class="he-item"><span>' + foodEmoji(i.name) + '</span>' +
                    '<span class="he-name">' + escapeHtml(i.name) + '</span>' +
                    '<span class="exp-badge ' + info.cls + '">' + info.label + '</span></div>';
            }).join('');
        }
    } else if (expBox) {
        expBox.hidden = true;
    }
    loadTodayMeals();
    loadHomeSuggest();
}

async function loadTodayMeals() {
    const card = document.getElementById('homeTodayCard');
    const list = document.getElementById('homeToday');
    if (!card) return;
    if (!isUserLoggedIn()) {
        card.hidden = true;
        return;
    }
    const today = d2s(new Date());
    try {
        const entries = await apiRequest('/api/plan?start=' + today + '&end=' + today) || [];
        if (!entries.length) { card.hidden = true; return; }
        card.hidden = false;
        const SLOT = { morning: '🌅 Sáng', lunch: '☀️ Trưa', dinner: '🌙 Tối' };
        const bySlot = {};
        entries.forEach(function (e) { bySlot[e.slot] = e; });
        if (list) {
            list.innerHTML = ['morning', 'lunch', 'dinner'].map(function (s) {
                const e = bySlot[s];
                return e
                    ? '<div class="ht-row"><span class="ht-slot">' + SLOT[s] + '</span><b>' + escapeHtml(e.recipeTitle) + '</b><span class="ht-kcal">' + (e.recipeKcal || 0) + ' kcal</span></div>'
                    : '<div class="ht-row"><span class="ht-slot">' + SLOT[s] + '</span><b style="color:var(--text-soft);font-weight:500">Chưa có bữa ăn</b></div>';
            }).join('');
        }
    } catch (e) {
        card.hidden = true;
    }
}

function localDateKey() {
    const d = new Date();
    const pad = function (n) { return String(n).padStart(2, '0'); };
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}

function dailySuggestHash(text) {
    let hash = 0;
    const value = String(text || '');
    for (let i = 0; i < value.length; i++) hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
    return hash;
}

function readDailySuggest() {
    try {
        return JSON.parse(localStorage.getItem('foodx_daily_suggest_v2') || 'null');
    } catch (e) {
        return null;
    }
}

function suggestCardFromRecipe(recipe) {
    const urls = dishImageCandidates(recipe);
    const stored = String((recipe && (recipe.imageUrl || recipe.image)) || '');
    const ordered = [];
    if (/^https?:/i.test(stored)) ordered.push(stored);
    urls.forEach(function (url) {
        if (url && ordered.indexOf(url) < 0) ordered.push(url);
    });
    if (!ordered.length) ordered.push('/images/recipes/default-recipe.jpg');
    return {
        id: recipe.id,
        title: recipe.title || recipe.name || 'Món gợi ý',
        description: String(recipe.description || '').replace(/\s+/g, ' ').trim().slice(0, 120),
        time: (parseInt(recipe.cookTime || recipe.time, 10) || 30) + ' phút',
        image: ordered[0],
        fallbacks: ordered,
        emoji: recipeEmoji(recipe)
    };
}

function pickDailyRecipes(list, ingredients, userId, date) {
    const fridge = (ingredients || []).map(normalize).filter(Boolean);
    const usable = (list || []).filter(function (recipe) { return recipe && recipe.id && (recipe.title || recipe.name); });
    const scored = usable.map(function (recipe) {
        const names = normalizeIngredientList(recipe.ingredients || []).map(function (item) {
            return normalize(item.ingredientName || item.name || '');
        }).filter(Boolean);
        let hit = 0;
        names.forEach(function (name) {
            if (fridge.some(function (food) { return food.includes(name) || name.includes(food); })) hit++;
        });
        return { recipe: recipe, hit: hit };
    });
    const byId = function (a, b) { return Number(a.recipe.id) - Number(b.recipe.id); };
    const matched = scored.filter(function (item) { return item.hit > 0; }).sort(byId);
    const rest = scored.filter(function (item) { return item.hit === 0; }).sort(byId);
    if (!matched.length && !rest.length) return [];
    const rotate = function (rows) {
        if (rows.length <= 1) return rows.slice();
        const start = dailySuggestHash(String(userId) + '|' + date) % rows.length;
        return rows.slice(start).concat(rows.slice(0, start));
    };
    const pool = matched.length >= 3 ? rotate(matched) : matched.concat(rotate(rest));
    const picked = [];
    pool.forEach(function (item) {
        if (picked.length >= 3) return;
        if (!picked.some(function (row) { return row.recipe.id === item.recipe.id; })) picked.push(item);
    });
    return picked.map(function (item) { return item.recipe; });
}

function paintHomeSuggest(list, items) {
    list.innerHTML = items.map(function (item) {
        const fallbacks = (item.fallbacks && item.fallbacks.length ? item.fallbacks : [item.image]).filter(Boolean);
        const src = item.image || fallbacks[0] || '/images/recipes/default-recipe.jpg';
        return '<button type="button" class="hs-item" data-suggest-id="' + item.id + '">' +
            '<img class="hs-thumb" src="' + escapeHtml(src) + '" data-fallbacks="' + escapeHtml(fallbacks.join('|')) + '" data-img-i="0" data-emoji="' + escapeHtml(item.emoji || '🍽️') + '" alt="" loading="lazy" onerror="window.foodxImgFallback(this)">' +
            '<span class="hs-body"><b>' + escapeHtml(item.title || '') + '</b>' +
            (item.description ? '<span>' + escapeHtml(item.description) + '</span>' : '') +
            (item.time ? '<span class="hs-time">⏱ ' + escapeHtml(item.time) + '</span>' : '') +
            '</span></button>';
    }).join('');
    list.querySelectorAll('[data-suggest-id]').forEach(function (el) {
        el.addEventListener('click', function () {
            const id = el.getAttribute('data-suggest-id');
            if (id && typeof openRecipeDetail === 'function') openRecipeDetail(id);
        });
    });
}

async function loadHomeSuggest() {
    const card = document.getElementById('homeSuggestCard');
    const list = document.getElementById('homeSuggest');
    const btn = document.getElementById('homeSuggestBtn');
    if (!card || !list) return;

    if (!isUserLoggedIn()) {
        card.hidden = false;
        renderEmpty(
            list,
            '✨',
            'Gợi ý thực đơn thông minh',
            'Đăng nhập để nhận gợi ý món ngon phù hợp từ nguyên liệu trong tủ lạnh của bạn.',
            'Đăng nhập ngay',
            function () { requireAuth('suggest'); }
        );
        return;
    }

    const userId = window.authState && authState.userId != null ? String(authState.userId) : '0';
    const today = localDateKey();
    const cached = readDailySuggest();
    if (cached && String(cached.userId) === userId && cached.date === today && Array.isArray(cached.items) && cached.items.length) {
        card.hidden = false;
        paintHomeSuggest(list, cached.items);
        return;
    }

    if (btn) btn.disabled = true;
    card.hidden = false;
    if (!list.children.length) showSkeleton(list, 'card', 3);
    try {
        let ingredients = [];
        try {
            const fridge = await apiRequest('/api/fridge') || [];
            ingredients = fridge.map(function (item) { return item.name; });
        } catch (e) { }
        if (!ingredients.length) {
            renderEmpty(list, '🤖', 'Chưa có gợi ý', 'Thêm nguyên liệu vào tủ lạnh để nhận món phù hợp.', 'Xem tủ lạnh', function () { openView('fridge'); });
            return;
        }
        if (!recipesCache || !recipesCache.length) {
            try { await loadRecipes(); } catch (e) { }
        }
        const picked = pickDailyRecipes(recipesCache || [], ingredients, userId, today).map(suggestCardFromRecipe);
        if (!picked.length) {
            renderEmpty(list, '🤖', 'Chưa có gợi ý', 'Thêm nguyên liệu vào tủ lạnh để nhận món phù hợp.', 'Xem tủ lạnh', function () { openView('fridge'); });
            return;
        }
        localStorage.setItem('foodx_daily_suggest_v2', JSON.stringify({ userId: userId, date: today, items: picked }));
        paintHomeSuggest(list, picked);
    } catch (err) {
        renderError(list, loadHomeSuggest);
    } finally {
        if (btn) btn.disabled = false;
    }
}


/* =========================================================
   STATS — insights + food waste
========================================================= */
async function loadStats() {
    const kpi = document.getElementById('kpiGrid');
    if (kpi) showSkeleton(kpi, 'card', 3);
    try {
        const s = await apiRequest('/api/stats');
        if (kpi && s) {
            const activeDays = (s.byDay || []).filter(function (d) { return d.kcal > 0; });
            const avg = activeDays.length
                ? Math.round(activeDays.reduce(function (a, d) { return a + (d.kcal || 0); }, 0) / activeDays.length)
                : 0;
            kpi.innerHTML =
                (s.currentStreak > 0 ? '<div class="kpi"><span class="k-ic">📆</span><b>' + s.currentStreak + '</b><span>ngày nấu liên tiếp 🔥</span></div>' : '') +
                '<div class="kpi"><span class="k-ic">🍳</span><b>' + s.totalCooked + '</b><span>món đã nấu</span></div>' +
                '<div class="kpi"><span class="k-ic">📅</span><b>' + s.weekCooked + '</b><span>trong 7 ngày</span></div>' +
                '<div class="kpi"><span class="k-ic">🗓</span><b>' + s.monthCooked + '</b><span>trong 30 ngày</span></div>' +
                '<div class="kpi"><span class="k-ic">🔥</span><b>' + avg + '</b><span>kcal TB / ngày</span></div>';
        }
        drawLineChart(s ? s.byDay : []);
        const top = document.getElementById('topDishes');
        if (top) {
            top.innerHTML = (s && s.topRecipes && s.topRecipes.length)
                ? s.topRecipes.map(function (t) {
                    return '<div class="top-row"><span class="top-emoji">' + recipeEmoji({ title: t.title }) + '</span>' +
                        '<span class="top-name">' + escapeHtml(t.title) + '</span><span class="top-cnt">×' + t.count + ' lần</span></div>';
                }).join('')
                : '<div class="empty-state"><span class="es-icon">📊</span><b>Chưa có dữ liệu nấu ăn</b><p>Nấu ngay món đầu tiên để xem thống kê!</p></div>';
        }
        if (s) renderStatsExtra(s);
    } catch (e) {
        if (kpi) renderError(kpi, loadStats);
    }
}

async function renderStatsExtra(s) {
    const ins = document.getElementById('statsInsights');
    const waste = document.getElementById('statsWaste');
    let fridge = [];
    try { fridge = await apiRequest('/api/fridge') || []; } catch (e) { }

    const insights = [];
    if (s.weekCooked > 0) insights.push('Bạn đã nấu <b>' + s.weekCooked + ' món</b> trong 7 ngày qua.');
    if (s.topRecipes && s.topRecipes.length) insights.push('Món được nấu nhiều nhất: <b>' + escapeHtml(s.topRecipes[0].title) + '</b> (' + s.topRecipes[0].count + ' lần).');
    const expiring = fridge.filter(function (i) { const info = expiryInfo(i.expiresAt); return info && (info.cls === 'soon' || info.cls === 'expired'); });
    if (expiring.length) insights.push('Có <b>' + expiring.length + ' nguyên liệu</b> đang sắp hết hạn trong tủ.');

    if (ins) {
        ins.innerHTML = insights.length
            ? insights.map(function (t) { return '<div class="insight">💡 ' + t + '</div>'; }).join('')
            : '<div class="insight">💡 Bắt đầu thêm nguyên liệu vào tủ lạnh và nấu ăn để xem thông tin chi tiết.</div>';
    }
    if (waste) {
        const expired = fridge.filter(function (i) { const info = expiryInfo(i.expiresAt); return info && info.cls === 'expired'; });
        const soon = fridge.filter(function (i) { const info = expiryInfo(i.expiresAt); return info && info.cls === 'soon'; });
        const ok = fridge.filter(function (i) { const info = expiryInfo(i.expiresAt); return info && info.cls === 'ok'; });
        waste.innerHTML =
            '<div class="waste-box ok"><b>' + ok.length + '</b><span>Nguyên liệu còn hạn</span></div>' +
            '<div class="waste-box"><b>' + soon.length + '</b><span>Đang đến hạn (≤2 ngày)</span></div>' +
            '<div class="waste-box danger"><b>' + expired.length + '</b><span>Đã hết hạn</span></div>';
    }
}


/* =========================================================
   BOTTOM NAV + QUICK ACTION + DRAWER
========================================================= */
function syncBottomNav(name) {
    document.querySelectorAll('[data-bottom-nav]').forEach(function (b) {
        b.classList.toggle('active', b.getAttribute('data-bottom-nav') === name);
    });
}

function toggleQa() {
    qaOpen = !qaOpen;
    const fab = document.getElementById('qaFab');
    const menu = document.getElementById('qaMenu');
    if (fab) fab.classList.toggle('open', qaOpen);
    if (menu) menu.hidden = !qaOpen;
}

async function handleQa(action) {
    closeQa();
    if (action === 'ingredient') {
        openView('fridge');
        const btn = document.getElementById('openCustomIngredient');
        if (btn) { setTimeout(function () { btn.click(); }, 200); }
        else {
            const fab = document.getElementById('nav-fab');
            if (fab) fab.click();
        }
        return;
    }
    if (action === 'recipe') {
        openRecipeCreateModal();
        return;
    }
    if (action === 'plan') {
        openView('plan');
        setTimeout(function () { openAddMeal(d2s(new Date()), 'lunch'); }, 250);
        return;
    }
    if (action === 'notify') {
        enableExpiryReminders();
        return;
    }
}

/* ---------- Nhắc hết hạn thực phẩm (Notification API — giữ chân, chống lãng phí) ---------- */
const REMINDER_STORAGE_KEY = 'foodx_reminders_enabled';

function remindersEnabled() {
    try { return localStorage.getItem(REMINDER_STORAGE_KEY) === '1'; } catch (_) { return false; }
}

async function enableExpiryReminders() {
    if (!isUserLoggedIn()) {
        requireAuth('fridge');
        return;
    }
    if (typeof Notification === 'undefined') {
        showToast('Trình duyệt của bạn chưa hỗ trợ thông báo.', 'warning');
        return;
    }
    let permission = Notification.permission;
    if (permission !== 'granted') {
        permission = await Notification.requestPermission();
    }
    if (permission !== 'granted') {
        showToast('Bạn đã tắt quyền thông báo — hãy bật lại trong cài đặt trình duyệt để nhận nhắc hết hạn.', 'info');
        return;
    }
    try { localStorage.setItem(REMINDER_STORAGE_KEY, '1'); } catch (_) {}
    showToast('Đã bật nhắc hết hạn! 🔔 Khi có thực phẩm sắp hết hạn, FoodX sẽ thông báo cho bạn.', 'success');
    fireExpiryDigest(true);
}

async function fireExpiryDigest(manual) {
    if (!remindersEnabled() || !isUserLoggedIn()) return;
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;

    // Mỗi ngày chỉ nhắc 1 lần (tránh spam)
    const today = new Date().toISOString().slice(0, 10);
    try {
        const last = localStorage.getItem('foodx_last_expiry_notice');
        if (last === today && !manual) return;
    } catch (_) {}

    try {
        const items = await apiRequest('/api/fridge') || [];
        const soon = items.filter(function (i) {
            const info = expiryInfo(i.expiresAt);
            return info && (info.cls === 'soon' || info.cls === 'expired');
        }).slice(0, 5);
        if (!soon.length) {
            if (manual) showToast('Tủ lạnh của bạn không có thực phẩm nào cần dùng gấp. 👍', 'success');
            return;
        }
        try { localStorage.setItem('foodx_last_expiry_notice', today); } catch (_) {}
        const names = soon.map(function (i) { return i.name || '?'; }).join(', ');
        const body = soon.length >= 3
            ? soon.length + ' nguyên liệu trong tủ đang sắp hết hạn — hãy lên thực đơn dùng ngay!'
            : 'Nên dùng sớm: ' + names;
        try {
            const n = new Notification('🧊 FoodX — Thực phẩm cần dùng sớm', {
                body: body,
                icon: '/icons/icon.svg',
                tag: 'foodx-expiry-' + today
            });
            n.onclick = function () {
                window.focus();
                if (window.location.hash !== '#fridge') openView('fridge');
            };
        } catch (_) {}
        showToast('🔔 Có ' + soon.length + ' nguyên liệu sắp hết hạn: ' + names, 'warning');
    } catch (_) {}
}

// Tự nhắc khi mở app (nếu đã bật)
(function initReminderAutoCheck() {
    function autoCheck() {
        if (isUserLoggedIn() && remindersEnabled()) fireExpiryDigest(false);
    }
    if (document.readyState === 'complete') {
        setTimeout(autoCheck, 6000);
    } else {
        window.addEventListener('load', function () { setTimeout(autoCheck, 6000); });
    }
})();

/* ---------- Add recipe modal (Quick Action) ---------- */
let recipeCreateModal = null;

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
            '<style>' +
            '.rc-input { background: var(--bg-input, #ffffff); color: var(--text, #14532D); border: 1px solid var(--border, #E2ECE6); border-radius: 12px; padding: 12px 16px; width: 100%; font-family: inherit; font-size: 14px; transition: border-color 0.2s, box-shadow 0.2s; outline: none; } ' +
            '.rc-input:focus { border-color: var(--green, #059669); box-shadow: 0 0 0 3px var(--focus-ring, rgba(5, 150, 105, 0.18)); } ' +
            '.rc-input::placeholder { color: var(--text-muted, #9CA8A0); } ' +
            'body.dark .rc-input { background: var(--bg-input, #112019) !important; color: var(--text, #ECFDF5) !important; border-color: var(--border, #2D4A3A) !important; } ' +
            'body.dark .rc-input:focus { border-color: var(--green, #34d399) !important; box-shadow: 0 0 0 3px var(--focus-ring, rgba(52, 211, 153, 0.22)) !important; } ' +
            'body.dark .rc-input::placeholder { color: var(--text-muted, #7A9B8A) !important; } ' +
            'body.dark #recipeCreateModal .modal { border: 1px solid var(--border, #2D4A3A); } ' +
            '</style>' +
            '<div class="modal" style="display:flex; flex-direction:column; max-height:90vh; padding:0;">' +
            '<div class="modal-header" style="position:sticky; top:0; background:var(--card); z-index:10; padding:24px 24px 16px; border-bottom:1px solid var(--border); margin-bottom:0;">' +
            '<h3 style="margin:0; color:var(--text);">➕ Thêm công thức mới</h3><button class="modal-close" data-rc-close="1" aria-label="Đóng">✕</button></div>' +
            '<div class="rc-form" style="overflow-y:auto; padding:16px 24px; display:flex; flex-direction:column; gap:16px; margin:0;">' +
            '<label class="field" style="margin:0;"><span style="color:var(--text); font-weight:600; margin-bottom:4px; display:inline-block;">Tên món *</span><input type="text" id="rcTitle" placeholder="vd: Cá kho tộ" class="rc-input"></label>' +
            '<label class="field" style="margin:0;"><span style="color:var(--text); font-weight:600; margin-bottom:4px; display:inline-block;">Mô tả</span><textarea id="rcDesc" rows="2" placeholder="Mô tả ngắn..." class="rc-input"></textarea></label>' +
            '<div class="rc-row" style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; margin:0;">' +
            '<label class="field" style="margin:0;"><span style="color:var(--text); font-weight:600; margin-bottom:4px; display:inline-block;">Thời gian (phút)</span><input type="number" id="rcTime" value="30" min="1" class="rc-input"></label>' +
            '<label class="field" style="margin:0;"><span style="color:var(--text); font-weight:600; margin-bottom:4px; display:inline-block;">Khẩu phần</span><input type="number" id="rcServe" value="2" min="1" class="rc-input"></label>' +
            '<label class="field" style="margin:0;"><span style="color:var(--text); font-weight:600; margin-bottom:4px; display:inline-block;">Calo</span><input type="number" id="rcKcal" value="300" min="0" class="rc-input"></label>' +
            '</div>' +
            '<div class="field" style="margin:0;">' +
            '<span style="color:var(--text); font-weight:600; margin-bottom:4px; display:inline-block;">Hình ảnh món ăn</span>' +
            '<input type="hidden" id="rcImageUrl" value="">' +
            '<div style="display:flex; gap:8px; align-items:center; margin-bottom:8px;">' +
            '<label class="secondary-button" style="white-space:nowrap;font-size:12px;padding:0 12px;cursor:pointer;display:inline-flex;align-items:center;margin:0;height:40px;">' +
            '📁 Tải ảnh từ máy <input type="file" id="rcImageFile" accept="image/*" style="display:none;">' +
            '</label>' +
            '<span style="font-size:12px;color:var(--text-soft);">Có thể bỏ qua nếu chưa có ảnh.</span>' +
            '</div>' +
            '<div id="rcImagePreviewWrap" style="display:none;align-items:center;gap:10px;margin-bottom:8px;padding:8px;border:1px solid var(--border);border-radius:10px;background:var(--bg);">' +
            '<img id="rcImagePreview" src="" alt="Preview" style="width:60px;height:60px;object-fit:cover;border-radius:8px;">' +
            '<div style="flex:1;font-size:12px;color:var(--text-soft);" id="rcImageStatus">Đã chọn ảnh</div>' +
            '<button type="button" class="secondary-button" id="rcRemoveImg" style="padding:4px 8px;font-size:11px;">✕ Bỏ ảnh</button>' +
            '</div>' +
            '</div>' +
            '<label class="field" style="margin:0;"><span style="color:var(--text); font-weight:600; margin-bottom:4px; display:inline-block;">Nguyên liệu (mỗi dòng 1 nguyên liệu)</span><textarea id="rcIngs" rows="3" placeholder="Thịt cá 500 g&#10;Hành lá 2 nhánh" class="rc-input"></textarea></label>' +
            '<label class="field" style="margin:0;"><span style="color:var(--text); font-weight:600; margin-bottom:4px; display:inline-block;">Các bước (mỗi dòng 1 bước)</span><textarea id="rcSteps" rows="4" placeholder="Sơ chế cá...&#10;Kho cá trong 20 phút..." class="rc-input"></textarea></label>' +
            '</div>' +
            '<div class="modal-actions" style="position:sticky; bottom:0; background:var(--card); z-index:10; padding:16px 24px 24px; border-top:1px solid var(--border); margin:0;">' +
            '<button class="secondary-button" data-rc-close="1">Huỷ</button>' +
            '<button class="primary-button" id="rcSubmit">Lưu công thức</button></div>' +
            '</div>';
        document.body.appendChild(recipeCreateModal);
        recipeCreateModal.querySelectorAll('[data-rc-close]').forEach(function (b) {
            b.addEventListener('click', function () { recipeCreateModal.classList.remove('open'); });
        });
        recipeCreateModal.addEventListener('click', function (e) { if (e.target === recipeCreateModal) recipeCreateModal.classList.remove('open'); });
        document.getElementById('rcSubmit').addEventListener('click', submitNewRecipe);

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

        // Remove image
        document.getElementById('rcRemoveImg').addEventListener('click', function () {
            document.getElementById('rcImageUrl').value = '';
            document.getElementById('rcImageFile').value = '';
            const wrap = document.getElementById('rcImagePreviewWrap');
            if (wrap) wrap.style.display = 'none';
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
                ingredients: ings.map(parseIngredientLine)
            })
        });
        if (recipeCreateModal) recipeCreateModal.classList.remove('open');
        showToast('Đã thêm công thức mới! 🎉', 'success');
        loadRecipes();
    } catch (e) {
        const msg = (e && e.message) || '';
        if (/401|đăng nhập|Unauthorized/i.test(msg)) {
            showToast('Cần đăng nhập để tạo công thức.', 'error');
        } else {
            showToast(msg ? ('Không tạo được công thức: ' + msg.slice(0, 180)) : 'Không tạo được công thức.', 'error');
        }
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
    { key: 'mon-an-gia-dinh',  cat: 'mon-an-gia-dinh',  label: '🍚 Món ăn gia đình' },
    { key: 'mon-sang',         cat: 'mon-sang',         label: '🥣 Món sáng' },
    { key: 'eat-clean',        cat: 'eat-clean',        label: '🥗 Eat Clean' },
    { key: 'nau-nhanh',        cat: 'nau-nhanh',        label: '⚡ Nấu nhanh' },
    { key: 'banh-trang-mieng', cat: 'banh-trang-mieng', label: '🍰 Bánh & Tráng miệng' },
    { key: 'family',           cat: 'family',           label: '🍚 Món chính' },
    { key: 'breakfast',        cat: 'breakfast',        label: '🥣 Món sáng' },
    { key: 'eatclean',         cat: 'eatclean',         label: '🥗 Món ăn kiêng' },
    { key: 'dessert',          cat: 'dessert',          label: '🍰 Món tráng miệng' }
];

async function loadHomeBlogRecipes() {
    if (homeBlogRecipesCache) return homeBlogRecipesCache;
    try {
        const list = await apiRequest('/api/recipes');
        homeBlogRecipesCache = Array.isArray(list) ? list : [];
    } catch (_) {
        homeBlogRecipesCache = [];
    }
    return homeBlogRecipesCache;
}

function renderHomeBlogPills(categoriesPresent) {
    const pillsWrap = document.getElementById('homeBlogPills');
    if (!pillsWrap) return;
    let html = '<button type="button" class="blog-pill active" data-blog-cat="all">✨ Tất cả món</button>';
    BLOG_CAT_META.forEach(function (m) {
        if (!categoriesPresent.has(m.cat)) return;
        html += '<button type="button" class="blog-pill" data-blog-cat="' + m.key + '">' + m.label + '</button>';
    });
    pillsWrap.innerHTML = html;
}

async function renderHomeBlogSection(catFilter) {
    const grid = document.getElementById('homeBlogGrid');
    if (!grid) return;

    catFilter = catFilter || currentBlogCategory || 'all';
    currentBlogCategory = catFilter;

    const recipes = await loadHomeBlogRecipes();
    const posts = recipes.map(function (r) {
        return {
            id: r.id,
            title: r.title || r.name || 'Món ăn',
            description: r.description || '',
            image: r.imageUrl || '/images/recipes/default-recipe.jpg',
            kcal: r.kcal ? Math.round(r.kcal) : '',
            cookTime: r.cookTime ? (r.cookTime + ' phút') : '',
            difficulty: r.difficulty || 'Dễ',
            category: r.category || 'Món chính'
        };
    });

    // Pills động theo đúng category có trong kho công thức thật
    const categoriesPresent = new Set(posts.map(function (p) { return p.category; }));
    renderHomeBlogPills(categoriesPresent);
    const pillsWrap = document.getElementById('homeBlogPills');
    if (pillsWrap) {
        pillsWrap.querySelectorAll('.blog-pill').forEach(function (p) { p.classList.remove('active'); });
        const activePill = pillsWrap.querySelector('.blog-pill[data-blog-cat="' + catFilter + '"]');
        if (activePill) {
            activePill.classList.add('active');
        } else {
            const allPill = pillsWrap.querySelector('.blog-pill[data-blog-cat="all"]');
            if (allPill) allPill.classList.add('active');
            catFilter = 'all';
        }
    }

    let filtered = posts;
    if (catFilter !== 'all') {
        const meta = BLOG_CAT_META.find(function (m) { return m.key === catFilter; });
        filtered = meta ? posts.filter(function (p) { return p.category === meta.cat; }) : posts;
    }
    const shown = filtered.slice(0, 8);

    if (!shown.length) {
        grid.innerHTML = '<div class="social-empty" style="grid-column:1/-1;text-align:center;padding:30px;">Chưa có món trong mục này — hãy là người chia sẻ công thức đầu tiên nhé!</div>';
        return;
    }

    grid.innerHTML = shown.map(function (p) {
        return '<div class="blog-card" onclick="openRecipeDetail(' + p.id + ')">' +
            '<div class="blog-card-img-wrap">' +
                '<img class="blog-card-img" src="' + escapeHtml(p.image) + '" alt="' + escapeHtml(p.title) + '" loading="lazy" onerror="this.src=\'/images/recipes/default-recipe.jpg\'">' +
                '<span class="blog-category-tag">' + (p.cookTime ? '⏱ ' + p.cookTime : (p.difficulty ? escapeHtml(p.difficulty) : 'Món ăn')) + '</span>' +
            '</div>' +
            '<div class="blog-card-body">' +
                '<div class="blog-author-meta" style="margin-bottom:8px;">' +
                    '<div class="blog-avatar" style="width:24px;height:24px;font-size:12px;">🍳</div>' +
                    '<span class="blog-author-name" style="font-size:12px;">FoodX • <small style="opacity:0.7">Kho công thức cộng đồng</small></span>' +
                '</div>' +
                '<h4 class="blog-card-title">' + escapeHtml(p.title) + '</h4>' +
                '<p class="blog-card-desc">' + escapeHtml(String(p.description || '').slice(0, 140)) + '</p>' +
                '<div class="blog-card-footer">' +
                    '<span>🔥 ' + p.kcal + ' kcal</span>' +
                    '<span>' + escapeHtml(p.category) + '</span>' +
                '</div>' +
            '</div>' +
        '</div>';
    }).join('');
}


/* =========================================================
   WIRING REDESIGN
========================================================= */
(function initRedesign() {
    // Home
    const sb = document.getElementById('homeSuggestBtn');
    if (sb) sb.addEventListener('click', loadHomeSuggest);
    loadHomeDashboard();
    renderHomeBlogSection('all');

    // Home Blog Category Filter Pills — delegation (pills được render động theo category thật)
    const blogPillsWrap = document.getElementById('homeBlogPills');
    if (blogPillsWrap) {
        blogPillsWrap.addEventListener('click', function (e) {
            const pill = e.target.closest('.blog-pill');
            if (!pill) return;
            blogPillsWrap.querySelectorAll('.blog-pill').forEach(function (p) { p.classList.remove('active'); });
            pill.classList.add('active');
            renderHomeBlogSection(pill.getAttribute('data-blog-cat'));
        });
    }

    // Shopping clear-done & clear-all
    const cd = document.getElementById('shopClearDone');
    if (cd) cd.addEventListener('click', clearDoneShopping);
    const ca = document.getElementById('shopClearAll');
    if (ca) ca.addEventListener('click', clearAllShopping);

    // Bottom nav
    document.querySelectorAll('[data-bottom-nav]').forEach(function (b) {
        b.addEventListener('click', function () { openView(b.getAttribute('data-bottom-nav')); });
    });
    const fab = document.getElementById('qaFab');
    if (fab) fab.addEventListener('click', toggleQa);

    // Quick action items
    document.querySelectorAll('.qa-item').forEach(function (it) {
        it.addEventListener('click', function () { handleQa(it.getAttribute('data-qa')); });
    });

    // Hamburger drawer
    const hm = document.getElementById('mobileMenuButton');
    if (hm) hm.addEventListener('click', function (e) {
        e.stopPropagation();
        document.body.classList.toggle('drawer-open');
    });
    document.addEventListener('click', function (e) {
        if (document.body.classList.contains('drawer-open') && !e.target.closest('.sidebar') && !e.target.closest('#mobileMenuButton')) closeDrawer();
        if (qaOpen && !e.target.closest('#qaMenu') && !e.target.closest('#qaFab')) closeQa();
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeQa();
            closeDrawer();
            document.querySelectorAll('.modal-overlay.show').forEach(m => m.classList.remove('show'));
            document.querySelectorAll('.modal-overlay[id="planMealModal"], .modal-overlay[id="shoppingRecipeModal"]').forEach(m => { m.setAttribute('hidden', ''); m.style.display = 'none'; });
            document.body.style.overflow = '';
        }
    });
})();




function isUserLoggedIn() {
    const token = getToken();
    if (!token) return false;
    if (window.authState && window.authState.authenticated) return true;
    try {
        const saved = JSON.parse(localStorage.getItem('foodx_user') || 'null');
        if (saved) {
            authState = Object.assign({}, authState || {}, saved, { authenticated: true });
            window.authState = authState;
        }
    } catch (_) {}
    return true;
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
            statusText.textContent = mock ? 'Đang bảo trì' : 'Đang hoạt động';
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
    document.querySelectorAll(".onboarding-screen").forEach(function (s) {
        s.classList.remove("active");
    });
    var el = document.getElementById("onboardingStep" + step);
    if (el) el.classList.add("active");
}


/* --- Build chips --- */

function onbBuildChips(sel, items, store, multi) {
    var box = document.querySelector(sel);
    if (!box) return;
    box.innerHTML = "";
    items.forEach(function (it) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "onb-chip";
        b.textContent = it;
        b.onclick = function () {
            if (!multi) {
                store.length = 0;
                store.push(it);
                box.querySelectorAll(".onb-chip").forEach(function (c) {
                    c.classList.remove("active");
                });
                b.classList.add("active");
                return;
            }
            var idx = store.indexOf(it);
            if (idx > -1) {
                store.splice(idx, 1);
            } else {
                store.push(it);
            }
            b.classList.toggle("active");
        };
        box.appendChild(b);
    });
}

onbBuildChips(
    "#onbCuisines",
    ["🇻🇳 Việt Nam", "🥢 Á – Trung Hoa", "🌶️ Thái Lan", "🥘 Hàn Quốc", "🍣 Nhật Bản", "🍛 Ấn Độ", "🍝 Ý", "🥖 Pháp", "🌮 Mexico", "🫒 Địa Trung Hải"],
    onbState.cuisines,
    true
);

onbBuildChips(
    "#onbAllergy",
    ["🥜 Đậu phộng", "🦐 Tôm / Cua", "🐟 Cá", "🥛 Sữa", "🥚 Trứng", "🌾 Gluten", "🫘 Đậu nành", "🌰 Hạt khác", "✅ Không có dị ứng"],
    onbState.allergies,
    true
);

onbBuildChips(
    "#onbEquip",
    ["🔥 Bếp gas", "⚡ Bếp từ", "🍞 Lò nướng", "🍟 Nồi chiên không dầu", "🍚 Nồi cơm điện", "💨 Nồi áp suất", "🥤 Máy xay sinh tố"],
    onbState.equip,
    true
);


/* --- Goals --- */

var ONB_GOALS = [
    { ic: "🥗", t: "Ăn kiêng giảm cân", d: "Giảm 0,5kg mỗi tuần" },
    { ic: "💪", t: "Tăng cơ", d: "Đạm cao, ít tinh bột" },
    { ic: "⚖️", t: "Duy trì cân nặng", d: "Cân bằng dinh dưỡng" },
    { ic: "🌿", t: "Ăn lành mạnh", d: "Ít dầu, nhiều rau" },
    { ic: "⏰", t: "Tiết kiệm thời gian", d: "Món dưới 30 phút" },
    { ic: "💰", t: "Tiết kiệm chi phí", d: "Nguyên liệu giá tốt" }
];

(function buildGoals() {
    var grid = document.getElementById("onbGoals");
    if (!grid) return;
    grid.innerHTML = ONB_GOALS.map(function (g, i) {
        return '<button type="button" class="onb-goal-card" data-i="' + i + '">' +
            '<div class="g-ic">' + g.ic + '</div>' +
            '<div class="g-t">' + g.t + '</div>' +
            '<div class="g-d">' + g.d + '</div>' +
            '</button>';
    }).join("");
    grid.querySelectorAll(".onb-goal-card").forEach(function (b) {
        b.onclick = function () {
            var g = ONB_GOALS[parseInt(b.dataset.i)].t;
            var idx = onbState.goals.indexOf(g);
            if (idx > -1) {
                onbState.goals.splice(idx, 1);
            } else {
                onbState.goals.push(g);
            }
            b.classList.toggle("active");
        };
    });
})();


/* --- Segmented controls --- */

function onbBindSeg(sel, store, key) {
    var el = document.querySelector(sel);
    if (!el) return;
    el.querySelectorAll("button").forEach(function (b) {
        b.onclick = function () {
            el.querySelectorAll("button").forEach(function (x) {
                x.classList.remove("active");
            });
            b.classList.add("active");
            onbState[key] = b.dataset.v;
        };
    });
}

onbBindSeg("#onbEaters", null, "eaters");
onbBindSeg("#onbCooktime", null, "cooktime");
onbBindSeg("#onbDiet", null, "diet");


/* --- Spice slider --- */

(function () {
    var spice = document.getElementById("onbSpice");
    if (!spice) return;
    spice.addEventListener("input", function () {
        onbState.spice = parseInt(spice.value);
        document.querySelectorAll("#onboardingStep1 .onb-spice-labels span").forEach(function (s) {
            s.classList.toggle("active", parseInt(s.dataset.s) === onbState.spice);
        });
    });
})();


/* --- Favorite tags --- */

(function () {
    var input = document.getElementById("onbFavInput");
    var tagsEl = document.getElementById("onbFavTags");
    if (!input || !tagsEl) return;

    input.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && input.value.trim()) {
            e.preventDefault();
            onbState.favs.push(input.value.trim());
            input.value = "";
            renderOnbFavs();
        }
    });

    function renderOnbFavs() {
        tagsEl.innerHTML = onbState.favs.map(function (f, i) {
            return '<span class="onb-tag">' + escapeHtml(f) + '<button data-i="' + i + '" aria-label="Xoá">×</button></span>';
        }).join("");
        tagsEl.querySelectorAll("button").forEach(function (b) {
            b.onclick = function () {
                onbState.favs.splice(parseInt(b.dataset.i), 1);
                renderOnbFavs();
            };
        });
    }
})();


/* --- Calo slider --- */

(function () {
    var calo = document.getElementById("onbCalo");
    var out = document.getElementById("onbCaloOut");
    if (!calo || !out) return;
    calo.addEventListener("input", function () {
        onbState.calo = parseInt(calo.value);
        out.textContent = formatNumber(onbState.calo) + " kcal";
    });
})();


/* --- Goal other --- */

(function () {
    var inp = document.getElementById("onbGoalOther");
    if (!inp) return;
    inp.addEventListener("input", function () {
        onbState.goalOther = inp.value;
    });
})();


/* --- Navigation buttons --- */

(function () {
    var $1 = document.getElementById("onb1Next");
    var $2 = document.getElementById("onb2Next");
    var $3 = document.getElementById("onbFinish");
    var b1 = document.getElementById("onb1Back");
    var b2 = document.getElementById("onb2Back");
    var b3 = document.getElementById("onb3Back");

    if ($1) $1.onclick = function () { showOnbStep(2); };
    if ($2) $2.onclick = function () { showOnbStep(3); };
    if ($3) $3.onclick = async function () {
        /* Save onboarding profile to state */
        const dietValue = (onbState.diet && onbState.diet !== "Không") ? onbState.diet : (state.profile.diet || "Ăn linh tinh");
        const allergiesStr = Array.isArray(onbState.allergies) ? onbState.allergies.join(", ") : (onbState.allergies || "");
        const dislikesStr = onbState.goalOther || (Array.isArray(onbState.goals) ? onbState.goals.join(", ") : "");

        state.profile.diet = dietValue;
        state.profile.allergies = allergiesStr;
        state.profile.dislikes = dislikesStr;

        state.profile.onboarding = {
            cuisines: onbState.cuisines ? onbState.cuisines.slice() : [],
            spice: onbState.spice,
            favs: onbState.favs ? onbState.favs.slice() : [],
            goals: onbState.goals ? onbState.goals.slice() : [],
            goalOther: onbState.goalOther,
            eaters: onbState.eaters,
            cooktime: onbState.cooktime,
            allergies: onbState.allergies ? onbState.allergies.slice() : [],
            diet: dietValue,
            calo: onbState.calo,
            equip: onbState.equip ? onbState.equip.slice() : []
        };
        saveState();
        renderProfile();
        renderRecipes();
        hideOnboarding();
        showToast("Hoàn tất hồ sơ! Chào mừng bạn đến với Food X 🌿", "success");

        if (isUserLoggedIn()) {
            try {
                await apiRequest(PROFILE_API, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: state.profile.name,
                        gender: state.profile.gender || "male",
                        age: state.profile.age || 21,
                        weight: state.profile.weight || 53,
                        height: state.profile.height || 153,
                        target: state.profile.target || 53,
                        activity: state.profile.activity || 1.2,
                        diet: dietValue,
                        allergies: allergiesStr,
                        dislikes: dislikesStr
                    })
                });
                console.log("✅ Đã lưu chế độ ăn & hồ sơ vào MySQL thành công!");
            } catch (err) {
                console.warn("Lỗi lưu hồ sơ lên MySQL:", err);
            }
        }
    };

    if (b1) b1.onclick = function () { hideOnboarding(); };
    if (b2) b2.onclick = function () { showOnbStep(1); };
    if (b3) b3.onclick = function () { showOnbStep(2); };
})();


/* =========================================================
   1. THEME TOGGLE (DARK / LIGHT MODE)
========================================================= */
(function initTheme() {
    const savedTheme = localStorage.getItem('foodx_theme');
    const isDark = savedTheme === 'dark';
    if (isDark) {
        document.body.classList.add('dark');
    }
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) themeIcon.textContent = isDark ? '☀️' : '🌙';

    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
        themeBtn.addEventListener('click', function () {
            const dark = document.body.classList.toggle('dark');
            localStorage.setItem('foodx_theme', dark ? 'dark' : 'light');
            if (themeIcon) themeIcon.textContent = dark ? '☀️' : '🌙';
            showToast(dark ? 'Đã chuyển sang giao diện Tối 🌙' : 'Đã chuyển sang giao diện Sáng ☀️', 'info');
        });
    }
})();


/* =========================================================
   2. COOKING MODE: VOICE ASSISTANT & SMART TIMER
========================================================= */
(function initCookingTools() {
    // A. Voice Reader (Web Speech API)
    const voiceBtn = document.getElementById('readStepVoiceBtn');
    if (voiceBtn) {
        voiceBtn.addEventListener('click', function () {
            if (!('speechSynthesis' in window)) {
                showToast('Trình duyệt của bạn không hỗ trợ đọc giọng nói', 'warning');
                return;
            }
            if (window.speechSynthesis.speaking) {
                window.speechSynthesis.cancel();
                const vText = document.getElementById('voiceText');
                const vIcon = document.getElementById('voiceIcon');
                if (vText) vText.textContent = 'Đọc to bước này';
                if (vIcon) vIcon.textContent = '🔊';
                return;
            }
            const descEl = document.getElementById('cookingStepDescription');
            const titleEl = document.getElementById('cookingStepTitle');
            const textToRead = (titleEl ? titleEl.textContent + '. ' : '') + (descEl ? descEl.textContent : '');
            if (!textToRead.trim()) return;

            const utter = new SpeechSynthesisUtterance(textToRead);
            utter.lang = 'vi-VN';
            utter.rate = 0.95;

            const voices = window.speechSynthesis.getVoices();
            const viVoice = voices.find(function (v) { return v.lang && (v.lang.includes('vi') || v.lang.includes('VI')); });
            if (viVoice) utter.voice = viVoice;

            const vText = document.getElementById('voiceText');
            const vIcon = document.getElementById('voiceIcon');

            utter.onstart = function () {
                if (vText) vText.textContent = 'Đang đọc... (Bấm dừng)';
                if (vIcon) vIcon.textContent = '⏹️';
            };
            utter.onend = function () {
                if (vText) vText.textContent = 'Đọc to bước này';
                if (vIcon) vIcon.textContent = '🔊';
            };
            utter.onerror = function () {
                if (vText) vText.textContent = 'Đọc to bước này';
                if (vIcon) vIcon.textContent = '🔊';
            };

            window.speechSynthesis.speak(utter);
        });
    }

    // B. Smart Cooking Timer with Web Audio Synthesizer Chime
    let stepTimerInterval = null;
    let stepTimerSecondsLeft = 300;
    let isStepTimerRunning = false;

    function playTimerChime() {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();
            const now = ctx.currentTime;
            [523.25, 659.25, 783.99, 1046.50].forEach(function (freq, i) {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + i * 0.15);
                gain.gain.setValueAtTime(0.3, now + i * 0.15);
                gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.6);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now + i * 0.15);
                osc.stop(now + i * 0.15 + 0.6);
            });
        } catch (e) {}
    }

    function updateTimerDisp() {
        const disp = document.getElementById('stepTimerDisplay');
        if (!disp) return;
        const m = Math.floor(stepTimerSecondsLeft / 60);
        const s = stepTimerSecondsLeft % 60;
        disp.textContent = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
    }

    const toggleTimerBtn = document.getElementById('toggleStepTimerBtn');
    const timerCard = document.getElementById('stepTimerCard');
    if (toggleTimerBtn && timerCard) {
        toggleTimerBtn.addEventListener('click', function () {
            timerCard.style.display = timerCard.style.display === 'none' ? 'block' : 'none';
        });
    }

    document.querySelectorAll('[data-add-sec]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            const add = +btn.getAttribute('data-add-sec');
            stepTimerSecondsLeft += add;
            updateTimerDisp();
        });
    });

    const startPauseBtn = document.getElementById('stepTimerToggle');
    if (startPauseBtn) {
        startPauseBtn.addEventListener('click', function () {
            if (isStepTimerRunning) {
                clearInterval(stepTimerInterval);
                isStepTimerRunning = false;
                startPauseBtn.textContent = '▶ Tiếp tục';
            } else {
                if (stepTimerSecondsLeft <= 0) stepTimerSecondsLeft = 300;
                isStepTimerRunning = true;
                startPauseBtn.textContent = '⏸ Tạm dừng';
                stepTimerInterval = setInterval(function () {
                    stepTimerSecondsLeft--;
                    updateTimerDisp();
                    if (stepTimerSecondsLeft <= 0) {
                        clearInterval(stepTimerInterval);
                        isStepTimerRunning = false;
                        startPauseBtn.textContent = '▶ Bắt đầu';
                        playTimerChime();
                        showToast('⏰ Đã hết thời gian nấu!', 'success');
                    }
                }, 1000);
            }
        });
    }

    const resetBtn = document.getElementById('stepTimerReset');
    if (resetBtn) {
        resetBtn.addEventListener('click', function () {
            clearInterval(stepTimerInterval);
            isStepTimerRunning = false;
            stepTimerSecondsLeft = 300;
            updateTimerDisp();
            if (startPauseBtn) startPauseBtn.textContent = '▶ Bắt đầu';
        });
    }
})();


/* =========================================================
   4. FRIDGE RESCUE (ZERO-WASTE RECIPE)
========================================================= */
(function initFridgeRescue() {
    const rescueBtn = document.getElementById('fridgeRescueBtn');
    if (rescueBtn) {
        rescueBtn.addEventListener('click', async function () {
            if (!isUserLoggedIn()) {
                requireAuth('fridge');
                return;
            }
            try {
                const fridgeItems = await apiRequest('/api/fridge') || [];
                if (!fridgeItems.length) {
                    showToast('Tủ lạnh đang trống. Hãy thêm một vài thực phẩm trước nhé!', 'warning');
                    return;
                }
                const foodList = fridgeItems.map(function (f) { return f.name || f.foodName; }).filter(Boolean).join(', ');
                const prompt = 'Tôi đang có các nguyên liệu trong tủ lạnh gồm: ' + foodList + '. Hãy gợi ý cho tôi 1 món ăn nấu ngay ngon nhất để tận dụng và tránh lãng phí thực phẩm.';

                // Mở giao diện Trợ lý AI và tự động gửi yêu cầu gợi ý
                await openChat('chat');
                if (typeof doSend === 'function') {
                    doSend(prompt);
                } else {
                    const input = document.getElementById('chatInputFx');
                    if (input) {
                        input.value = prompt;
                        sendMessage();
                    }
                }
            } catch(e) {
                showToast('Không thể phân tích tủ lạnh lúc này: ' + e.message, 'error');
            }
        });
    }
})();

/* =========================================================
   5. BUILT-IN FOOD CATALOG & UX ENHANCEMENTS
========================================================= */

// --- 5.1 FOOD CATALOG CONTROLLER ---
let activeCatalogCategory = 'all';

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

function openCookingMode() {
    if (!curRecipe) {
        showToast('Chưa chọn món ăn để bắt đầu nấu.', 'warning');
        return;
    }
    currentCookingRecipe = curRecipe;
    currentCookingStepIndex = 0;

    const modal = document.getElementById('cookingModeModal');
    if (!modal) return;

    const titleEl = document.getElementById('cmRecipeTitle');
    if (titleEl) titleEl.textContent = currentCookingRecipe.title || currentCookingRecipe.name || 'Món ngon';
    renderCurrentCookingStep();
    resetCookingTimer();

    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}
window.openCookingMode = openCookingMode;

function renderCurrentCookingStep() {
    if (!currentCookingRecipe) return;
    const steps = String(currentCookingRecipe.instructions || '').split('\n').map(s => s.trim()).filter(Boolean);
    const totalSteps = steps.length || 1;
    const currentStepText = steps[currentCookingStepIndex] || (currentCookingRecipe.description || 'Nấu theo khẩu vị và thưởng thức.');

    const indEl = document.getElementById('cmStepIndicator');
    const contentEl = document.getElementById('cmStepContent');
    if (indEl) indEl.textContent = `Bước ${currentCookingStepIndex + 1} / ${totalSteps}`;
    if (contentEl) contentEl.textContent = currentStepText;

    const prevBtn = document.getElementById('cmPrevBtn');
    const nextBtn = document.getElementById('cmNextBtn');
    const doneBtn = document.getElementById('cmDoneBtn');

    if (prevBtn) prevBtn.style.display = currentCookingStepIndex > 0 ? 'inline-block' : 'none';
    if (nextBtn) nextBtn.style.display = currentCookingStepIndex < totalSteps - 1 ? 'inline-block' : 'none';
    if (doneBtn) doneBtn.style.display = currentCookingStepIndex >= totalSteps - 1 ? 'inline-block' : 'none';
}

function nextCookingStep() {
    if (!currentCookingRecipe) return;
    const steps = String(currentCookingRecipe.instructions || '').split('\n').map(s => s.trim()).filter(Boolean);
    if (currentCookingStepIndex < steps.length - 1) {
        currentCookingStepIndex++;
        renderCurrentCookingStep();
    }
}
window.nextCookingStep = nextCookingStep;

function prevCookingStep() {
    if (currentCookingStepIndex > 0) {
        currentCookingStepIndex--;
        renderCurrentCookingStep();
    }
}
window.prevCookingStep = prevCookingStep;

async function finishCookingMode() {
    const modal = document.getElementById('cookingModeModal');
    if (modal) modal.classList.remove('show');
    document.body.style.overflow = '';
    resetCookingTimer();
    stopCookingSpeech();

    if (isUserLoggedIn() && currentCookingRecipe && currentCookingRecipe.id) {
        try {
            await apiRequest('/api/stats/cooked', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipeId: currentCookingRecipe.id,
                    servings: currentCookingRecipe.servings || undefined
                })
            });
            // Cập nhật tủ lạnh & số liệu sau khi trừ nguyên liệu
            try {
                if (typeof loadFridgeFromApi === 'function') { await loadFridgeFromApi(false); }
                if (typeof renderFridge === 'function') { renderFridge(); }
                if (typeof renderStats === 'function') { renderStats(); }
            } catch (_) {}
        } catch (_) {}
    }
    showToast('🎉 Tuyệt vời! Bạn đã hoàn thành món ăn thành công! Chúc ngon miệng!', 'success');
}
window.finishCookingMode = finishCookingMode;

function setCookingTimer(minutes) {
    resetCookingTimer();
    cookingTimerSeconds = minutes * 60;
    updateTimerDisplay();
}
window.setCookingTimer = setCookingTimer;

function updateTimerDisplay() {
    const el = document.getElementById('cmTimerDisplay');
    if (!el) return;
    const m = Math.floor(cookingTimerSeconds / 60);
    const s = cookingTimerSeconds % 60;
    el.textContent = `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
}

function toggleCookingTimer() {
    const btn = document.getElementById('cmTimerToggleBtn');
    if (cookingTimerInterval) {
        clearInterval(cookingTimerInterval);
        cookingTimerInterval = null;
        if (btn) btn.textContent = '▶ Tiếp tục hẹn giờ';
    } else {
        if (cookingTimerSeconds <= 0) cookingTimerSeconds = 5 * 60;
        updateTimerDisplay();
        if (btn) btn.textContent = '⏸ Tạm dừng';
        cookingTimerInterval = setInterval(() => {
            if (cookingTimerSeconds > 0) {
                cookingTimerSeconds--;
                updateTimerDisplay();
            } else {
                clearInterval(cookingTimerInterval);
                cookingTimerInterval = null;
                if (btn) btn.textContent = '▶ Bắt đầu hẹn giờ';
                showToast('⏰ Hết giờ nấu rồi! Hãy kiểm tra món ăn nhé!', 'warning');
            }
        }, 1000);
    }
}
window.toggleCookingTimer = toggleCookingTimer;

function resetCookingTimer() {
    if (cookingTimerInterval) {
        clearInterval(cookingTimerInterval);
        cookingTimerInterval = null;
    }
    cookingTimerSeconds = 0;
    updateTimerDisplay();
    const btn = document.getElementById('cmTimerToggleBtn');
    if (btn) btn.textContent = '▶ Bắt đầu hẹn giờ';
}
window.resetCookingTimer = resetCookingTimer;

function toggleSpeechRecognition() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
        showToast('Trình duyệt của bạn chưa hỗ trợ nhận diện giọng nói Web Speech.', 'warning');
        return;
    }
    if (isCookingSpeechListening) {
        stopCookingSpeech();
    } else {
        startCookingSpeech(SpeechRec);
    }
}
window.toggleSpeechRecognition = toggleSpeechRecognition;

function startCookingSpeech(SpeechRec) {
    try {
        cookingSpeechRecognition = new SpeechRec();
        cookingSpeechRecognition.lang = 'vi-VN';
        cookingSpeechRecognition.continuous = true;
        cookingSpeechRecognition.interimResults = false;

        cookingSpeechRecognition.onstart = function () {
            isCookingSpeechListening = true;
            const btn = document.getElementById('cmVoiceBtn');
            const label = document.getElementById('cmVoiceLabel');
            if (btn) btn.classList.add('listening');
            if (label) label.textContent = 'Đang lắng nghe khẩu lệnh...';
        };

        cookingSpeechRecognition.onresult = function (event) {
            const last = event.results.length - 1;
            const transcript = event.results[last][0].transcript.toLowerCase().trim();
            console.log('[Voice Command]', transcript);
            if (transcript.includes('tiếp') || transcript.includes('sau')) {
                nextCookingStep();
                showToast('🗣 Khẩu lệnh: "Bước tiếp theo"', 'info');
            } else if (transcript.includes('trước') || transcript.includes('lùi')) {
                prevCookingStep();
                showToast('🗣 Khẩu lệnh: "Bước trước"', 'info');
            } else if (transcript.includes('xong') || transcript.includes('hoàn thành')) {
                finishCookingMode();
            }
        };

        cookingSpeechRecognition.onerror = function () {
            stopCookingSpeech();
        };

        cookingSpeechRecognition.onend = function () {
            if (isCookingSpeechListening) {
                try { cookingSpeechRecognition.start(); } catch (_) { stopCookingSpeech(); }
            } else {
                stopCookingSpeech();
            }
        };

        cookingSpeechRecognition.start();
    } catch (e) {
        stopCookingSpeech();
    }
}

function stopCookingSpeech() {
    isCookingSpeechListening = false;
    if (cookingSpeechRecognition) {
        try { cookingSpeechRecognition.stop(); } catch (_) {}
        cookingSpeechRecognition = null;
    }
    const btn = document.getElementById('cmVoiceBtn');
    const label = document.getElementById('cmVoiceLabel');
    if (btn) btn.classList.remove('listening');
    if (label) label.textContent = 'Bật giọng nói rảnh tay';
}

// --- 5.3 ZERO-WASTE MEAL PLANNING ---
// --- 5.3 ZERO-WASTE MEAL PLANNING (VÉT TỦ TỰ ĐỘNG THEO THỜI GIAN THỰC) ---
let isVetTuProcessing = false;
async function handleVetTuAutoFill() {
    console.log('[MealPlan] handleVetTuAutoFill triggered');
    if (!isUserLoggedIn()) {
        requireAuth('plan');
        return;
    }
    if (isVetTuProcessing) return;
    isVetTuProcessing = true;

    const btn = document.getElementById('planZeroWasteBtn');
    const origHtml = btn ? btn.innerHTML : '🌱 Ưu tiên vét tủ';
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span style="display:inline-block;width:12px;height:12px;border:2px solid currentColor;border-right-color:transparent;border-radius:50%;animation:spin 0.6s linear infinite;margin-right:6px;"></span>Đang vét tủ...';
    }

    try {
        // 1. Lấy danh sách nguyên liệu hiện có trong tủ lạnh (lọc món gần hết hạn trước)
        let fridgeItems = (state && Array.isArray(state.fridge) && state.fridge.length) ? state.fridge : [];
        if (!fridgeItems.length) {
            try {
                fridgeItems = await apiRequest('/api/fridge') || [];
            } catch (_) {}
        }
        if (!fridgeItems.length) {
            showToast('Tủ lạnh chưa có thực phẩm nào. Hãy thêm thực phẩm từ Kho trước nhé!', 'warning');
            return;
        }

        const urgentList = fridgeItems.filter(f => daysLeft(f.expiresAt) <= 3);
        const normalList = fridgeItems.filter(f => daysLeft(f.expiresAt) > 3);
        urgentList.sort((a, b) => daysLeft(a.expiresAt) - daysLeft(b.expiresAt));

        const urgentNames = urgentList.map(f => f.name || f.foodName).filter(Boolean);
        const allFridgeNames = [...urgentList, ...normalList].map(f => f.name || f.foodName).filter(Boolean);

        // 2. Xác định các ngày đang hiển thị trên giao diện tuần
        const visibleDays = weekDays(planOffset);
        const visibleDateStrs = visibleDays.map(d2s);
        const now = new Date();
        const todayStr = d2s(now);
        const minutes = now.getHours() * 60 + now.getMinutes();

        // Helper kiểm tra ô đã có món hay chưa
        const isSlotFilled = (dStr, sl) => (planEntries || []).some(e => e.planDate === dStr && e.slot === sl);

        let targetDateStr = null;
        let targetSlot = null;

        // Ưu tiên 1: Nếu hôm nay nằm trong tuần đang xem
        if (visibleDateStrs.includes(todayStr)) {
            if (minutes <= 570) {
                // Sáng (00:00 - 09:30): sáng -> trưa -> tối
                if (!isSlotFilled(todayStr, 'morning')) { targetDateStr = todayStr; targetSlot = 'morning'; }
                else if (!isSlotFilled(todayStr, 'lunch')) { targetDateStr = todayStr; targetSlot = 'lunch'; }
                else if (!isSlotFilled(todayStr, 'dinner')) { targetDateStr = todayStr; targetSlot = 'dinner'; }
            } else if (minutes <= 840) {
                // Trưa (09:30 - 14:00): trưa -> tối
                if (!isSlotFilled(todayStr, 'lunch')) { targetDateStr = todayStr; targetSlot = 'lunch'; }
                else if (!isSlotFilled(todayStr, 'dinner')) { targetDateStr = todayStr; targetSlot = 'dinner'; }
            } else if (minutes <= 1230) {
                // Chiều / Tối (14:00 - 20:30): tối
                if (!isSlotFilled(todayStr, 'dinner')) { targetDateStr = todayStr; targetSlot = 'dinner'; }
            }
        }

        // Ưu tiên 2: Nếu hôm nay không còn slot trống phù hợp (hoặc đã quá 20:30),
        // tìm slot trống đầu tiên từ ngày mai trở đi trong tuần đang xem
        if (!targetDateStr) {
            const todayIdx = visibleDateStrs.indexOf(todayStr);
            const startIdx = todayIdx >= 0 ? todayIdx + 1 : 0;
            for (let i = startIdx; i < visibleDateStrs.length; i++) {
                const dStr = visibleDateStrs[i];
                for (const sl of ['morning', 'lunch', 'dinner']) {
                    if (!isSlotFilled(dStr, sl)) {
                        targetDateStr = dStr;
                        targetSlot = sl;
                        break;
                    }
                }
                if (targetDateStr) break;
            }
        }

        // Ưu tiên 3: Nếu từ ngày mai trở đi cũng đã kín, quét toàn bộ tuần đang xem để tìm slot trống bất kỳ
        if (!targetDateStr) {
            for (let i = 0; i < visibleDateStrs.length; i++) {
                const dStr = visibleDateStrs[i];
                for (const sl of ['morning', 'lunch', 'dinner']) {
                    if (!isSlotFilled(dStr, sl)) {
                        targetDateStr = dStr;
                        targetSlot = sl;
                        break;
                    }
                }
                if (targetDateStr) break;
            }
        }

        // Nếu tất cả 21/21 slot của tuần đều đã kín
        if (!targetDateStr) {
            showToast('Tuần này đã kín 21/21 bữa ăn rồi! Hãy chuyển sang tuần sau hoặc chọn "Đổi" món nhé! 🎉', 'info');
            return;
        }

        const SLOT_LABELS = { morning: 'bữa Sáng', lunch: 'bữa Trưa', dinner: 'bữa Tối' };
        const targetMealName = SLOT_LABELS[targetSlot] || ('bữa ' + targetSlot);

        console.log('[MealPlan] Target slot for vet tu:', { targetDateStr, targetSlot, targetMealName });

        // 3. Gọi API AI gợi ý món vét tủ
        const prompt = 'Món ăn vét tủ cho ' + targetMealName +
            (urgentNames.length ? ', ưu tiên nguyên liệu sắp hết hạn: ' + urgentNames.join(', ') : ', nguyên liệu: ' + allFridgeNames.slice(0, 4).join(', '));

        let suggestedTitle = '';
        let suggestedKcal = targetSlot === 'morning' ? 420 : (targetSlot === 'lunch' ? 650 : 550);
        let suggestedRecipeId = null;

        try {
            const res = await apiRequest('/api/plan/suggest-slot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planDate: targetDateStr,
                    slot: targetSlot,
                    prompt: prompt
                })
            });
            if (res && res.recipeTitle) {
                suggestedTitle = res.recipeTitle;
                suggestedKcal = res.recipeKcal || suggestedKcal;
                suggestedRecipeId = res.recipeId;
            }
        } catch (apiErr) {
            console.warn('[MealPlan] suggest-slot failed, fallback to local recipe match:', apiErr);
        }

        if (!suggestedTitle) {
            const allR = (typeof recipesCache !== 'undefined' && recipesCache.length ? recipesCache : (typeof recipes !== 'undefined' ? recipes : []));
            const matched = allR.filter(r => {
                const text = ((r.title || r.name || '') + ' ' + (r.ingredients ? (Array.isArray(r.ingredients) ? r.ingredients.map(i => i.name || i.ingredientName || i).join(' ') : r.ingredients) : '')).toLowerCase();
                return urgentNames.some(u => text.includes(u.toLowerCase())) || allFridgeNames.some(u => text.includes(u.toLowerCase()));
            });
            const chosen = matched.length ? matched[0] : (allR.length ? allR[0] : { id: 8, title: 'Cơm chiên trứng kiểu Việt', kcal: 430 });
            suggestedTitle = chosen.title || chosen.name;
            suggestedKcal = chosen.kcal || suggestedKcal;
            suggestedRecipeId = chosen.id;

            try {
                await apiRequest('/api/plan/custom-slot', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        planDate: targetDateStr,
                        slot: targetSlot,
                        title: suggestedTitle,
                        kcal: suggestedKcal,
                        protein: 26,
                        carb: 48,
                        fat: 15,
                        description: 'Món vét tủ ưu tiên nguyên liệu sắp hết hạn'
                    })
                });
            } catch (_) {}
        }

        // 4. Đồng bộ State kế hoạch bữa ăn theo nguyên tắc bất biến (Immutability)
        const newMealEntry = {
            id: Date.now(),
            planDate: targetDateStr,
            slot: targetSlot,
            recipeId: suggestedRecipeId,
            recipeTitle: suggestedTitle,
            recipeKcal: suggestedKcal,
            tags: ["Vét tủ"],
            isAiGenerated: true
        };

        // Immutability: Tạo mảng mới hoàn toàn
        planEntries = [
            ...(planEntries || []).filter(e => !(e.planDate === targetDateStr && e.slot === targetSlot)),
            newMealEntry
        ];
        if (typeof window !== 'undefined') {
            window.planEntries = planEntries;
        }

        // Đồng bộ mealPlan state theo dạng mealPlan[dayKey][mealType]
        setMealPlan(prev => ({
            ...prev,
            [targetDateStr]: {
                ...((prev && prev[targetDateStr]) || {}),
                [targetSlot]: {
                    name: suggestedTitle,
                    calories: suggestedKcal,
                    tags: ["Vét tủ"],
                    isAiGenerated: true,
                    recipeId: suggestedRecipeId,
                    id: newMealEntry.id
                }
            }
        }));

        // 5. Cập nhật giao diện tức thì (Instant UI Re-render)
        // Cập nhật DOM trực tiếp vào thẻ slot nếu tồn tại
        const slotEl = document.getElementById('meal-slot-' + targetDateStr + '-' + targetSlot);
        if (slotEl) {
            const SLOT_ICONS = { morning: '🌅 Sáng', lunch: '☀️ Trưa', dinner: '🌙 Tối' };
            slotEl.className = 'meal-row';
            slotEl.innerHTML =
                '<div class="meal-row-header">' +
                    '<span class="meal-slot-tag">' + (SLOT_ICONS[targetSlot] || targetSlot) + '</span>' +
                    '<span class="meal-kcal-badge">' + suggestedKcal + ' kcal</span>' +
                    '<div class="meal-actions">' +
                        '<button type="button" class="meal-edit-btn" data-add-date="' + targetDateStr + '" data-add-slot="' + targetSlot + '" onclick="handleOpenAddMealModal(\'' + targetDateStr + '\', \'' + targetSlot + '\')" title="Đổi hoặc tự chọn món khác">✏️ Đổi</button>' +
                        '<button type="button" class="meal-swap-btn" data-swap-date="' + targetDateStr + '" data-swap-slot="' + targetSlot + '" onclick="handleAiSuggestMeal(\'' + targetDateStr + '\', \'' + targetSlot + '\', this)" title="🤖 AI Đổi món tự động">⚡ AI</button>' +
                        '<button type="button" class="meal-x" data-rm-date="' + targetDateStr + '" data-rm-slot="' + targetSlot + '" onclick="removeMeal(\'' + targetDateStr + '\', \'' + targetSlot + '\')" title="Xoá món">✕</button>' +
                    '</div>' +
                '</div>' +
                '<div class="meal-row-body">' +
                    '<div class="meal-name" title="' + escapeHtml(suggestedTitle) + '" data-open-recipe="' + (suggestedRecipeId || '') + '">' +
                        escapeHtml(suggestedTitle) +
                    '</div>' +
                '</div>';
        }

        // Render lại toàn bộ bảng tuần để cập nhật tổng calo ngày và bộ đếm tuần (vd: 2/21 -> 3/21)
        renderPlan(visibleDays);

        // Hiển thị Toast thông báo thành công: "Đã thêm món [Tên món] vào bữa [Sáng/Trưa/Tối]!"
        showToast('Đã thêm món ' + suggestedTitle + ' vào ' + targetMealName + '! 🎉', 'success');
    } catch (error) {
        console.error('[MealPlan] handleVetTuAutoFill error:', error);
        showToast('Không thể thực hiện vét tủ: ' + (error.message || 'Lỗi server'), 'error');
    } finally {
        isVetTuProcessing = false;
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = origHtml;
        }
    }
}
window.handleVetTuAutoFill = handleVetTuAutoFill;
window.planZeroWasteRescue = handleVetTuAutoFill;

// --- 5.4 SMART SHOPPING LIST SHARING ---
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

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startFoodX);
} else {
    startFoodX();
}
