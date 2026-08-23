/**
 * FoodX - Auth Module
 * Quản lý Token JWT, đăng nhập, đăng ký, đăng xuất và kiểm tra quyền người dùng.
 */

let authState = {
    authenticated: false,
    userId: null,
    fullName: "",
    email: "",
    role: "",
    avatarUrl: ""
};
window.authState = authState;

function getToken() {
    try {
        return localStorage.getItem("foodx_token") || "";
    } catch (_) {
        return "";
    }
}

function setToken(token) {
    try {
        if (token) {
            localStorage.setItem("foodx_token", token);
        } else {
            localStorage.removeItem("foodx_token");
        }
    } catch (_) {}
}

function isUserLoggedIn() {
    return Boolean(getToken() && window.authState && window.authState.authenticated);
}

function requireAuth(actionName, callback) {
    if (isUserLoggedIn()) {
        if (typeof callback === "function") callback();
        return true;
    }
    const modal = document.getElementById("loginModal");
    if (modal) modal.classList.add("show");

    let msg = "Vui lòng đăng nhập hoặc đăng ký để sử dụng tính năng này!";
    switch (actionName) {
        case "profile":
            msg = "Vui lòng đăng nhập để xem và quản lý hồ sơ dinh dưỡng!";
            break;
        case "chat":
            msg = "Vui lòng đăng nhập để trò chuyện cùng Trợ lý AI FoodX!";
            break;
        case "suggest":
            msg = "Vui lòng đăng nhập để nhận gợi ý món ăn thông minh từ AI!";
            break;
        case "fridge":
            msg = "Vui lòng đăng nhập để theo dõi và quản lý tủ lạnh!";
            break;
        case "plan":
            msg = "Vui lòng đăng nhập để lên kế hoạch bữa ăn!";
            break;
        case "shopping":
            msg = "Vui lòng đăng nhập để quản lý danh sách đi chợ!";
            break;
        case "favorites":
        case "favorite":
        case "save":
            msg = "Vui lòng đăng nhập để lưu và xem các món ăn yêu thích!";
            break;
        case "post":
        case "social":
        case "like":
        case "comment":
            msg = "Vui lòng đăng nhập để tương tác trên cộng đồng FoodX!";
            break;
    }
    showToast(msg, "warning");
    return false;
}

window.getToken = getToken;
window.setToken = setToken;
window.isUserLoggedIn = isUserLoggedIn;
window.requireAuth = requireAuth;
