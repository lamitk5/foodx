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
    const sug = document.getElementById("suggestionSection") || document.getElementById("homeSuggestCard");
    if (sug) {
        sug.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
        openView("recipes");
    }
}
window.handleHeroCtaClick = handleHeroCtaClick;



function openView(name) {
    if (!name) name = "home";
    if (name === "stats") name = "home";
    const AUTH_REQUIRED_VIEWS = ["fridge", "favorites", "shopping", "plan"];
    if (AUTH_REQUIRED_VIEWS.includes(name) && !isUserLoggedIn()) {
        requireAuth(name);
        return;
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
        if (typeof window.trigger3DViewTransition === "function") {
            window.trigger3DViewTransition(targetView);
        }
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

var slides = (typeof window !== 'undefined' && window.slides) ? window.slides : [];

function displaySlide(index) {
    if (!slides || !slides.length) {
        slides = (typeof window !== 'undefined' && window.slides) ? window.slides : [];
    }


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
                    "suggestionSection"
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


// Module window exports
if (typeof window !== 'undefined') window.displaySlide = displaySlide;
if (typeof window !== 'undefined') window.startSlider = startSlider;
if (typeof window !== 'undefined') window.syncBottomNav = syncBottomNav;
if (typeof window !== 'undefined') window.toggleQa = toggleQa;
if (typeof window !== 'undefined') window.handleQa = handleQa;
