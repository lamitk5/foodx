/**
 * FoodX - Core Router Module
 * Điều hướng màn hình (openView), Drawer sidebar và Bottom navigation trên thiết bị di động.
 */

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
            if (typeof loadShoppingList === "function") loadShoppingList();
        } else if (name === "social") {
            if (typeof loadSocialFeed === "function") loadSocialFeed();
        }
    } catch (e) {
        console.warn("View hydration error:", e);
    }
}

function closeDrawer() {
    document.body.classList.remove("drawer-open");
}

let qaOpen = false;
function toggleQa() {
    const m = document.getElementById("qaMenu");
    if (!m) return;
    qaOpen = !qaOpen;
    m.hidden = !qaOpen;
    const fabIcon = document.getElementById("qaFabIcon");
    if (fabIcon) fabIcon.setAttribute("href", qaOpen ? "#i-close" : "#i-plus");
}

function closeQa() {
    const m = document.getElementById("qaMenu");
    if (!m) return;
    qaOpen = false;
    m.hidden = true;
    const fabIcon = document.getElementById("qaFabIcon");
    if (fabIcon) fabIcon.setAttribute("href", "#i-plus");
}

window.openView = openView;
window.closeDrawer = closeDrawer;
window.toggleQa = toggleQa;
window.closeQa = closeQa;
