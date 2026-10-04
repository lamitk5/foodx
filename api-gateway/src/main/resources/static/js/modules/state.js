/**
 * FoodX - Global State Module (state.js)
 * Quản lý trạng thái toàn cục (Auth state, User info, Dataset mặc định, Caching & LocalStorage)
 */

/* =========================================================
   1. CONSTANTS & SYSTEM CONFIG
========================================================= */

const STORAGE_KEY = "foodXLocalV8";
const TOKEN_KEY = "foodx_token";
const FRIDGE_API = "/api/fridge";
const PROFILE_API = "/api/profile";
const AUTH_API = "/api/auth";
const SOCIAL_API = "/api/social";

const DEFAULT_AVATAR =
    "data:image/svg+xml," +
    encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
            <rect width="200" height="200" rx="100" fill="#E8F7EE"/>
            <circle cx="100" cy="72" r="34" fill="#22A95B"/>
            <path d="M40 176c5-43 31-65 60-65s55 22 60 65" fill="#22A95B"/>
        </svg>
    `);


/* =========================================================
   2. SYSTEM DATASETS & NUTRITION LIBRARY
========================================================= */

const catalog = [
    // Meat & Seafood
    { id: "beef", name: "Thịt bò", type: "Thịt", category: "meat", ingredients: ["Thịt bò"], kcal: 250, quantity: 300, unit: "g", expiryDays: 3, image: "/images/foods/beef.jpg" },
    { id: "pork_belly", name: "Thịt ba chỉ heo", type: "Thịt", category: "meat", ingredients: ["Thịt heo"], kcal: 260, quantity: 400, unit: "g", expiryDays: 4, image: "/images/foods/beef.jpg" },
    { id: "pork_lean", name: "Thịt nạc thăn", type: "Thịt", category: "meat", ingredients: ["Thịt heo"], kcal: 145, quantity: 400, unit: "g", expiryDays: 4, image: "/images/foods/beef.jpg" },
    { id: "chicken", name: "Ức gà", type: "Thịt", category: "meat", ingredients: ["Ức gà"], kcal: 165, quantity: 450, unit: "g", expiryDays: 3, image: "/images/foods/chicken.jpg" },
    { id: "chicken_thigh", name: "Đùi gà", type: "Thịt", category: "meat", ingredients: ["Gà"], kcal: 210, quantity: 500, unit: "g", expiryDays: 3, image: "/images/foods/chicken.jpg" },
    { id: "salmon", name: "Cá hồi", type: "Hải sản", category: "meat", ingredients: ["Cá hồi"], kcal: 208, quantity: 300, unit: "g", expiryDays: 3, image: "/images/foods/salmon.jpg" },
    { id: "shrimp", name: "Tôm tươi", type: "Hải sản", category: "meat", ingredients: ["Tôm"], kcal: 99, quantity: 300, unit: "g", expiryDays: 3, image: "/images/foods/shrimp.jpg" },
    { id: "fish_mackerel", name: "Cá thu / Cá nục", type: "Hải sản", category: "meat", ingredients: ["Cá"], kcal: 180, quantity: 400, unit: "g", expiryDays: 3, image: "/images/foods/placeholder.jpg" },
    { id: "squid", name: "Mực ống", type: "Hải sản", category: "meat", ingredients: ["Mực"], kcal: 92, quantity: 300, unit: "g", expiryDays: 2, image: "/images/foods/placeholder.jpg" },

    // Veggies
    { id: "water_spinach", name: "Rau muống", type: "Rau", category: "veggie", ingredients: ["Rau muống"], kcal: 25, quantity: 1, unit: "bó", expiryDays: 3, image: "/images/foods/placeholder.jpg" },
    { id: "cabbage_sweet", name: "Rau cải ngọt", type: "Rau", category: "veggie", ingredients: ["Rau cải"], kcal: 22, quantity: 1, unit: "bó", expiryDays: 4, image: "/images/foods/placeholder.jpg" },
    { id: "cabbage", name: "Bắp cải", type: "Rau", category: "veggie", ingredients: ["Bắp cải"], kcal: 25, quantity: 500, unit: "g", expiryDays: 7, image: "/images/foods/placeholder.jpg" },
    { id: "tomato", name: "Cà chua", type: "Rau Củ", category: "veggie", ingredients: ["Cà chua"], kcal: 22, quantity: 4, unit: "quả", expiryDays: 6, image: "/images/foods/tomato.jpg" },
    { id: "broccoli", name: "Bông cải xanh", type: "Rau Củ", category: "veggie", ingredients: ["Bông cải"], kcal: 34, quantity: 250, unit: "g", expiryDays: 5, image: "/images/foods/broccoli.jpg" },
    { id: "carrot", name: "Cà rốt", type: "Củ", category: "veggie", ingredients: ["Cà rốt"], kcal: 41, quantity: 3, unit: "củ", expiryDays: 9, image: "/images/foods/carrot.jpg" },
    { id: "cucumber", name: "Dưa leo", type: "Rau Củ", category: "veggie", ingredients: ["Dưa leo"], kcal: 15, quantity: 3, unit: "quả", expiryDays: 5, image: "/images/foods/placeholder.jpg" },
    { id: "pumpkin", name: "Bí đỏ", type: "Củ", category: "veggie", ingredients: ["Bí đỏ"], kcal: 26, quantity: 400, unit: "g", expiryDays: 14, image: "/images/foods/placeholder.jpg" },
    { id: "mushroom", name: "Nấm đùi gà / Nấm rơm", type: "Nấm", category: "veggie", ingredients: ["Nấm"], kcal: 35, quantity: 200, unit: "g", expiryDays: 4, image: "/images/foods/placeholder.jpg" },

    // Egg & Tofu
    { id: "egg", name: "Trứng gà", type: "Trứng", category: "egg_tofu", ingredients: ["Trứng"], kcal: 70, quantity: 6, unit: "quả", expiryDays: 14, image: "/images/foods/egg.jpg" },
    { id: "duck_egg", name: "Trứng vịt", type: "Trứng", category: "egg_tofu", ingredients: ["Trứng vịt"], kcal: 130, quantity: 6, unit: "quả", expiryDays: 14, image: "/images/foods/egg.jpg" },
    { id: "tofu", name: "Đậu phụ (đậu hũ)", type: "Đậu", category: "egg_tofu", ingredients: ["Đậu hũ"], kcal: 76, quantity: 2, unit: "bìa", expiryDays: 3, image: "/images/foods/placeholder.jpg" },
    { id: "sausage", name: "Giò lụa / Xúc xích", type: "Chế biến", category: "egg_tofu", ingredients: ["Giò"], kcal: 220, quantity: 250, unit: "g", expiryDays: 7, image: "/images/foods/placeholder.jpg" },

    // Dairy
    { id: "milk", name: "Sữa tươi", type: "Sữa", category: "dairy", ingredients: ["Sữa"], kcal: 120, quantity: 1, unit: "hộp", expiryDays: 7, image: "/images/foods/milk.jpg" },
    { id: "yogurt", name: "Sữa chua", type: "Sữa", category: "dairy", ingredients: ["Sữa chua"], kcal: 95, quantity: 4, unit: "hộp", expiryDays: 10, image: "/images/foods/yogurt.jpg" },
    { id: "cheese", name: "Phô mai", type: "Bơ sữa", category: "dairy", ingredients: ["Phô mai"], kcal: 402, quantity: 150, unit: "g", expiryDays: 30, image: "/images/foods/placeholder.jpg" },
    { id: "butter", name: "Bơ thực vật / Bơ lạt", type: "Bơ sữa", category: "dairy", ingredients: ["Bơ"], kcal: 717, quantity: 100, unit: "g", expiryDays: 30, image: "/images/foods/placeholder.jpg" },

    // Carb & Fruits
    { id: "rice", name: "Cơm trắng", type: "Tinh bột", category: "carb", ingredients: ["Cơm"], kcal: 130, quantity: 500, unit: "g", expiryDays: 2, image: "/images/foods/rice.jpg" },
    { id: "potato", name: "Khoai tây", type: "Củ", category: "carb", ingredients: ["Khoai tây"], kcal: 77, quantity: 4, unit: "củ", expiryDays: 14, image: "/images/foods/potato.jpg" },
    { id: "sweet_potato", name: "Khoai lang", type: "Củ", category: "carb", ingredients: ["Khoai lang"], kcal: 86, quantity: 3, unit: "củ", expiryDays: 14, image: "/images/foods/placeholder.jpg" },
    { id: "noodles", name: "Bún tươi / Phở", type: "Tinh bột", category: "carb", ingredients: ["Bún"], kcal: 110, quantity: 500, unit: "g", expiryDays: 2, image: "/images/foods/placeholder.jpg" },
    { id: "bread", name: "Bánh mì", type: "Tinh bột", category: "carb", ingredients: ["Bánh mì"], kcal: 265, quantity: 2, unit: "ổ", expiryDays: 3, image: "/images/foods/placeholder.jpg" },
    { id: "banana", name: "Chuối", type: "Trái Cây", category: "carb", ingredients: ["Chuối"], kcal: 89, quantity: 5, unit: "quả", expiryDays: 5, image: "/images/foods/banana.jpg" },
    { id: "avocado", name: "Quả bơ", type: "Trái Cây", category: "carb", ingredients: ["Bơ"], kcal: 160, quantity: 2, unit: "quả", expiryDays: 4, image: "/images/foods/avocado.jpg" },

    // Spices
    { id: "shallot", name: "Hành tím / Hành khô", type: "Gia vị", category: "spice", ingredients: ["Hành"], kcal: 40, quantity: 5, unit: "củ", expiryDays: 30, image: "/images/foods/placeholder.jpg" },
    { id: "garlic", name: "Tỏi", type: "Gia vị", category: "spice", ingredients: ["Tỏi"], kcal: 149, quantity: 3, unit: "củ", expiryDays: 45, image: "/images/foods/placeholder.jpg" },
    { id: "ginger", name: "Gừng tươi", type: "Gia vị", category: "spice", ingredients: ["Gừng"], kcal: 80, quantity: 2, unit: "củ", expiryDays: 30, image: "/images/foods/placeholder.jpg" },
    { id: "chili", name: "Ớt cay", type: "Gia vị", category: "spice", ingredients: ["Ớt"], kcal: 40, quantity: 50, unit: "g", expiryDays: 15, image: "/images/foods/placeholder.jpg" }
];

const NUTRITION_LIBRARY = {
    egg: { protein: 6.3, fat: 4.8, carb: 0.4, benefit: "Cân bằng / tăng cơ", basis: "1 quả", components: "Protein, chất béo, vitamin B12, choline.", note: "Nguồn protein tiện lợi." },
    chicken: { protein: 31, fat: 3.6, carb: 0, benefit: "Tăng cơ / kiểm soát cân nặng", basis: "100 g", components: "Protein cao, ít chất béo.", note: "Thích hợp ăn kiêng." },
    tomato: { protein: 0.9, fat: 0.2, carb: 3.9, benefit: "Giảm cân / cân bằng", basis: "100 g", components: "Chất xơ, vitamin C, chất chống oxy hóa.", note: "Mật độ năng lượng thấp." },
    broccoli: { protein: 2.8, fat: 0.4, carb: 6.6, benefit: "Giảm cân / cân bằng", basis: "100 g", components: "Chất xơ, vitamin C, vitamin K.", note: "Tăng lượng rau và vi chất." },
    milk: { protein: 8, fat: 5, carb: 12, benefit: "Cân bằng / bổ sung canxi", basis: "250 ml", components: "Protein, canxi, vitamin D.", note: "Tăng cường năng lượng." },
    avocado: { protein: 2, fat: 14.7, carb: 8.5, benefit: "Chất béo lành mạnh", basis: "100 g", components: "Chất béo không bão hòa đơn, chất xơ.", note: "Tốt cho tim mạch." },
    beef: { protein: 26, fat: 15, carb: 0, benefit: "Tăng cơ / bổ máu", basis: "100 g", components: "Protein, sắt, kẽm, vitamin B12.", note: "Nguồn protein đậm đặc." },
    potato: { protein: 2, fat: 0.1, carb: 17, benefit: "Bổ sung năng lượng", basis: "100 g", components: "Tinh bột phức, kali, vitamin C.", note: "Nguồn carbohydrate tốt." },
    carrot: { protein: 0.9, fat: 0.2, carb: 10, benefit: "Sáng mắt / tiêu hóa", basis: "100 g", components: "Beta-carotene, chất xơ.", note: "Calo thấp." },
    yogurt: { protein: 5, fat: 3, carb: 12, benefit: "Hỗ trợ tiêu hóa", basis: "1 hộp", components: "Probiotics, protein, canxi.", note: "Lợi khuẩn đường ruột." },
    rice: { protein: 2.7, fat: 0.3, carb: 28, benefit: "Năng lượng thiết yếu", basis: "100 g cơm chín", components: "Carbohydrate, vitamin nhóm B.", note: "Nguồn năng lượng chính." },
    banana: { protein: 1.1, fat: 0.3, carb: 23, benefit: "Bổ sung kali / năng lượng", basis: "100 g", components: "Carbohydrate, kali, vitamin B6.", note: "Rất tốt trước khi tập." }
};

const VIETNAMESE_RECIPES = [
    { id: "rec-01", title: "Phở bò tái Hà Nội", category: "mon-sang", cookTime: 45, calories: 450, imageUrl: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80" },
    { id: "rec-02", title: "Cơm chiên trứng kiểu Việt", category: "nau-nhanh", cookTime: 15, calories: 380, imageUrl: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80" },
    { id: "rec-03", title: "Gà kho gừng sả ớt", category: "mon-an-gia-dinh", cookTime: 30, calories: 420, imageUrl: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80" },
    { id: "rec-04", title: "Thịt kho tàu nước dừa", category: "mon-an-gia-dinh", cookTime: 50, calories: 520, imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80" },
    { id: "rec-05", title: "Bún chả Hà Nội", category: "mon-sang", cookTime: 40, calories: 480, imageUrl: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=800&q=80" },
    { id: "rec-06", title: "Nem rán truyền thống", category: "mon-an-gia-dinh", cookTime: 35, calories: 410, imageUrl: "https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80" },
    { id: "rec-07", title: "Cá hồi áp chảo măng tây", category: "eat-clean", cookTime: 20, calories: 360, imageUrl: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80" },
    { id: "rec-08", title: "Salad ức gà sốt mè rang", category: "eat-clean", cookTime: 15, calories: 290, imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80" },
    { id: "rec-09", title: "Bánh mì kẹp pate thịt nướng", category: "nau-nhanh", cookTime: 10, calories: 350, imageUrl: "https://images.unsplash.com/photo-1626804475297-41608ea09aeb?auto=format&fit=crop&w=800&q=80" },
    { id: "rec-10", title: "Canh chua cá lóc miền Nam", category: "mon-an-gia-dinh", cookTime: 30, calories: 310, imageUrl: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80" }
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

const slides = [
    {
        badge: "Food X đồng hành cùng bạn",
        title: `Ăn ngon mỗi ngày<br><span>Sống khỏe mỗi ngày</span>`,
        description: "Gợi ý món ăn phù hợp với nguyên liệu và mục tiêu dinh dưỡng của riêng bạn.",
        image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1800&q=90"
    },
    {
        badge: "Tận dụng nguyên liệu đang có",
        title: `Có gì nấu nấy<br><span>Giảm lãng phí thực phẩm</span>`,
        description: "Theo dõi tủ lạnh và ưu tiên những thực phẩm cần sử dụng sớm.",
        image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1800&q=90"
    },
    {
        badge: "Dinh dưỡng cá nhân hóa",
        title: `Ăn uống phù hợp<br><span>Riêng cho bạn</span>`,
        description: "Food X sử dụng hồ sơ dinh dưỡng để xếp hạng món ăn phù hợp hơn.",
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1800&q=90"
    }
];


/* =========================================================
   3. GLOBAL STATE FACTORY & PERSISTENCE
========================================================= */

function createDefaultState() {
    return {
        theme: "light",
        userId: null,
        activeView: "home",
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
        fridge: [],
        favorites: [],
        shopping: [],
        selectedFridgeIds: []
    };
}

function loadState() {
    const defaults = createDefaultState();
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return defaults;
        const parsed = JSON.parse(saved);
        return {
            ...defaults,
            ...parsed,
            profile: {
                ...defaults.profile,
                ...(parsed.profile || {})
            },
            fridge: Array.isArray(parsed.fridge) ? parsed.fridge : [],
            favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
            shopping: Array.isArray(parsed.shopping) ? parsed.shopping : [],
            selectedFridgeIds: Array.isArray(parsed.selectedFridgeIds) ? parsed.selectedFridgeIds : []
        };
    } catch (error) {
        console.error("Lỗi đọc LocalStorage state:", error);
        return defaults;
    }
}

function saveState() {
    try {
        const currentState = window.state || state;
        if (currentState) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
        }
    } catch (e) {
        console.warn("Không thể lưu state vào LocalStorage:", e);
    }
}


/* =========================================================
   4. ACTIVE GLOBAL STATE INSTANCES
========================================================= */

var state = loadState();

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
    const token = localStorage.getItem(TOKEN_KEY);
    if (savedUser && token) {
        authState = { ...authState, ...savedUser, authenticated: true };
        if (state) {
            state.userId = authState.userId;
            if (authState.fullName) state.profile.name = authState.fullName;
            if (authState.avatarUrl) state.profile.avatarUrl = authState.avatarUrl;
        }
    }
} catch (_) {}

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
var activeCatalogCategory = 'all';
var currentSocialCategory = 'all';
var currentSocialSearch = '';
var currentBlogCategory = 'all';

var cookingState = {
    recipeId: null,
    stepIndex: 0,
    timerSeconds: 0,
    timerRunning: false,
    timerInterval: null
};

var activeRecipeContext = null;


/* =========================================================
   5. THEME MANAGER
========================================================= */

function setTheme(theme, notify = false) {
    state.theme = theme;
    document.body.classList.toggle("dark", theme === "dark");

    const lightButton = document.getElementById("lightButton");
    const darkButton = document.getElementById("darkButton");
    if (lightButton) lightButton.classList.toggle("active", theme === "light");
    if (darkButton) darkButton.classList.toggle("active", theme === "dark");

    saveState();

    if (notify && typeof showToast === "function") {
        showToast(
            theme === "dark" ? "Đã chuyển sang giao diện tối." : "Đã chuyển sang giao diện sáng.",
            "info"
        );
    }
}

// Bind Theme Buttons
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("lightButton")?.addEventListener("click", () => setTheme("light", true));
    document.getElementById("darkButton")?.addEventListener("click", () => setTheme("dark", true));
    setTheme(state.theme || "light");
});


/* =========================================================
   6. GLOBAL WINDOW EXPOSURE
========================================================= */

if (typeof window !== 'undefined') {
    window.STORAGE_KEY = STORAGE_KEY;
    window.TOKEN_KEY = TOKEN_KEY;
    window.DEFAULT_AVATAR = DEFAULT_AVATAR;
    window.FRIDGE_API = FRIDGE_API;
    window.PROFILE_API = PROFILE_API;
    window.AUTH_API = AUTH_API;
    window.SOCIAL_API = SOCIAL_API;

    window.catalog = catalog;
    window.NUTRITION_LIBRARY = NUTRITION_LIBRARY;
    window.recipes = recipes;
    window.VIETNAMESE_RECIPES = VIETNAMESE_RECIPES;
    window.slides = slides;

    window.createDefaultState = createDefaultState;
    window.loadState = loadState;
    window.saveState = saveState;

    window.state = state;
    window.authState = authState;
    window.savedPostsState = savedPostsState;
    window.likedPostsState = likedPostsState;
    window.localCommentsState = localCommentsState;
    window.allSocialPostsCache = allSocialPostsCache;
    window.recipesCache = recipesCache;
    window.curRecipe = curRecipe;
    window.previousViewBeforeRecipe = previousViewBeforeRecipe;
    window.activeCatalogCategory = activeCatalogCategory;
    window.currentSocialCategory = currentSocialCategory;
    window.currentSocialSearch = currentSocialSearch;
    window.currentBlogCategory = currentBlogCategory;
    window.cookingState = cookingState;
    window.activeRecipeContext = activeRecipeContext;
    window.setTheme = setTheme;
}
