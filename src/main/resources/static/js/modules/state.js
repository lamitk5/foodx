var state =
    loadState();
window.state = state;
/* =========================================================
   AUTH STATE
========================================================= */

var authState = {
    authenticated: false,
    userId: null,
    fullName: "",
    email: "",
    role: "",
    avatarUrl: ""
};

try {
    const savedUser = JSON.parse(localStorage.getItem("foodx_user") || "null");
    const token = localStorage.getItem("foodx_token");
    if (savedUser && token) {
        authState = { ...authState, ...savedUser, authenticated: true };
        if (typeof state !== "undefined" && state) {
            state.userId = authState.userId;
            if (authState.fullName) state.profile.name = authState.fullName;
            if (authState.avatarUrl) state.profile.avatarUrl = authState.avatarUrl;
        }
    }
} catch (_) {}
window.authState = authState;


/* =========================================================
   CROSS-MODULE SHARED STATES & DATASETS (GLOBAL)
========================================================= */
var SOCIAL_API = '/api/social';

var savedPostsState = {};
try { savedPostsState = JSON.parse(localStorage.getItem('foodx_saved_posts') || '{}'); } catch (_) { savedPostsState = {}; }

var likedPostsState = {};
try { likedPostsState = JSON.parse(localStorage.getItem('foodx_liked_posts') || '{}'); } catch (_) { likedPostsState = {}; }

var localCommentsState = {};
try { localCommentsState = JSON.parse(localStorage.getItem('foodx_post_comments') || '{}'); } catch (_) { localCommentsState = {}; }

var allSocialPostsCache = [];
var recipesCache = [];
var curRecipe = null;
var previousViewBeforeRecipe = 'recipes';

var currentSocialCategory = 'all';
var currentSocialSearch = '';

// ===== DỮ LIỆU THẬT (thay thế dữ liệu demo giả cứng) =====
// Hai mảng mẫu cũ (blog + feed cộng đồng với tác giả/like/comment ảo) đã bị gỡ để UI không
// "giả vờ" có nội dung. Giờ:
//  - sampleBlogPosts: renderHomeBlogSection() tự sinh từ kho công thức thật (/api/recipes).
//  - communityFeedPosts: feed xã hội thật (/api/social/posts — khách cũng xem được).
// Các code path cũ còn tham chiếu 2 mảng này sẽ an toàn (mảng rỗng).
var sampleBlogPosts = [];
var communityFeedPosts = [];

function apiProfileToState(data) {

    return {

        name:
            data.name ||
            authState.fullName ||
            "Người dùng Food X",

        avatarUrl:
            data.avatarUrl ||
            authState.avatarUrl ||
            "",

        gender:
            data.gender ||
            "male",

        age:
            Number(
                data.age || 21
            ),

        weight:
            Number(
                data.weight || 53
            ),

        height:
            Number(
                data.height || 153
            ),

        target:
            Number(
                data.target || 53
            ),

        activity:
            Number(
                data.activity || 1.2
            ),

        diet:
            data.diet ||
            "Ăn linh tinh",

        allergies:
            data.allergies ||
            "",

        dislikes:
            data.dislikes ||
            ""
    };
}


async function loadProfileFromApi(
    showErrorToast = true
) {

    try {

        const data =
            await apiRequest(
                PROFILE_API
            );


        state.userId =
            data.userId;


        state.profile =
            apiProfileToState(
                data
            );


        saveState();

        renderProfile();
        renderRecipes();


        return true;


    } catch (error) {

        console.error(
            "Không tải được profile:",
            error
        );


        if (showErrorToast) {

            showToast(
                "Không tải được hồ sơ.",
                "error"
            );
        }


        return false;
    }
}


/* =========================================================
   TOAST
========================================================= */

const toast =
    document.getElementById(
        "toast"
    );

let toastTimer;


function showToast(
    message,
    type = "success"
) {

    if (!toast) {

        console.log(message);

        return;
    }


    clearTimeout(
        toastTimer
    );


    const icons = {

        success:
            "✓",

        error:
            "!",

        warning:
            "⚠",

        info:
            "i"
    };


    toast.className =
        `toast ${type}`;


    toast.innerHTML = `

        <span class="toast-icon">
            ${icons[type] || "✓"}
        </span>

        <span>
            ${message}
        </span>

    `;


    requestAnimationFrame(
        () =>
            toast.classList.add(
                "show"
            )
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2800
        );
}


/* =========================================================
   BUTTON LOADING
========================================================= */

function buttonLoading(
    button,
    text = "Đang xử lý..."
) {

    if (!button) {

        return () => {};
    }


    const oldHTML =
        button.innerHTML;


    button.disabled =
        true;


    button.classList.add(
        "button-loading"
    );


    button.innerHTML = `

        <span class="mini-spinner"></span>

        ${text}
    `;


    return function restore(
        html = null
    ) {

        button.disabled =
            false;


        button.classList.remove(
            "button-loading"
        );


        button.innerHTML =
            html ||
            oldHTML;
    };
}


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
   AUTH REQUEST
========================================================= */


// Module window exports
if (typeof window !== 'undefined') window.apiProfileToState = apiProfileToState;
if (typeof window !== 'undefined') window.loadProfileFromApi = loadProfileFromApi;
if (typeof window !== 'undefined') window.showToast = showToast;
if (typeof window !== 'undefined') window.buttonLoading = buttonLoading;
if (typeof window !== 'undefined') window.setTheme = setTheme;
