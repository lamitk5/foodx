/**
 * FoodX - Core State Module
 * Quản lý trạng thái dữ liệu người dùng, tủ lạnh, công thức, kế hoạch và đồng bộ LocalStorage.
 */

function createDefaultState() {
    return {
        theme: "light",
        userId: null,
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

let state = (function loadInitialState() {
    try {
        const raw = localStorage.getItem("foodXLocalV8");
        if (!raw) return createDefaultState();
        const parsed = JSON.parse(raw);
        return Object.assign(createDefaultState(), parsed);
    } catch (_) {
        return createDefaultState();
    }
})();

function saveState() {
    try {
        localStorage.setItem("foodXLocalV8", JSON.stringify(state));
    } catch (e) {
        console.warn("Không thể lưu state vào LocalStorage:", e);
    }
}

window.createDefaultState = createDefaultState;
window.state = state;
window.saveState = saveState;
