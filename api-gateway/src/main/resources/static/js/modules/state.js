/**
 * FoodX module: state.js
 * Trang thai toan cuc: ho so, tu lanh local, auth session, cache dung chung.
 * Cat tu app.js, van dung bien toan cuc de index.html goi duoc.
 */
/* =========================================================
   STATE
========================================================= */

function createDefaultState() {

    return {

        theme:
            "light",

        userId:
            null,

        profile: {
            name: "Khách",
            avatarUrl: "",
            gender: "male",
            age: 25,
            weight: 60,
            height: 165,
            target: 60,
            activity: 1.2,
            diet: "Cân bằng",
            allergies: "",
            dislikes: ""
        },

        fridge:
            [],

        favorites:
            [],

        shopping:
            [],

        selectedFridgeIds:
            []
    };
}


function loadState() {

    const defaults =
        createDefaultState();

    try {

        const saved =
            localStorage.getItem(
                STORAGE_KEY
            );

        if (!saved) {
            return defaults;
        }

        const parsed =
            JSON.parse(saved);

        return {

            ...defaults,

            ...parsed,

            profile: {

                ...defaults.profile,

                ...(parsed.profile || {})
            },

            fridge:
                [],

            favorites:
                Array.isArray(
                    parsed.favorites
                )
                    ? parsed.favorites
                    : [],

            shopping:
                Array.isArray(
                    parsed.shopping
                )
                    ? parsed.shopping
                    : [],

            selectedFridgeIds:
                Array.isArray(
                    parsed.selectedFridgeIds
                )
                    ? parsed.selectedFridgeIds
                    : []
        };

    } catch (error) {

        console.error(
            "Lỗi localStorage:",
            error
        );

        return defaults;
    }
}


var state =
    loadState();
window.state = state;

function saveState() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
        console.warn("Không thể lưu state vào LocalStorage:", e);
    }
}
window.saveState = saveState;
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

function rememberSavedPost(post, saved) {
    if (!post || post.id == null) return;
    const id = String(post.id);
    if (saved) {
        savedPostsState[id] = {
            id: post.id,
            title: post.title || post.name || 'Công thức',
            imageUrl: post.imageUrl || post.image || '',
            cookTime: post.cookTime || post.time || 30,
            kcal: post.kcal || 350,
            description: post.description || '',
            ingredients: post.ingredients || [],
            instructions: post.instructions || '',
            savedAt: new Date().toISOString()
        };
    } else {
        delete savedPostsState[id];
    }
    try { localStorage.setItem('foodx_saved_posts', JSON.stringify(savedPostsState)); } catch (_) {}
}

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

