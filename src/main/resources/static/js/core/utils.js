/**
 * FoodX - Core Utils Module
 * Các tiện ích định dạng dữ liệu, thông báo Toast, xử lý chuỗi và DOM.
 */

function showToast(message, type = "info") {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatCurrency(amount) {
    if (!amount || isNaN(amount)) return "0 đ";
    return new Intl.NumberFormat("vi-VN").format(amount) + " đ";
}

function formatCalories(kcal) {
    if (!kcal || isNaN(kcal)) return "0 kcal";
    return new Intl.NumberFormat("vi-VN").format(kcal) + " kcal";
}

function cleanPureIngredient(name) {
    if (!name) return "";
    let clean = String(name).trim();
    clean = clean.replace(/[\*_~`]+/g, " ");
    clean = clean.replace(/[\/\\#=\-]+/g, " ");
    clean = clean.replace(/^\d+[\.\)\:\-]\s*/, "");
    clean = clean.replace(/^[•\+\-\*\.\,\:]+\s*/, "");
    clean = clean.replace(/[•\+\-\*\.\,\:\/\\#_]+$/, "");
    clean = clean.replace(/\s+/g, " ").trim();
    if (clean.length > 0) {
        clean = clean.charAt(0).toUpperCase() + clean.slice(1);
    }
    return clean;
}

function cleanPureQuantity(qty) {
    if (!qty) return "1 phần";
    let clean = String(qty).trim();
    clean = clean.replace(/[\*_~`]+/g, " ");
    clean = clean.replace(/[\/\\#=\-]+/g, " ");
    const m = clean.match(/^([\d\.,\/\s]+(?:kg|g|gr|gram|ml|l|lít|lit|quả|trái|củ|nhánh|cây|muỗng|thìa|bát|chén|gói|tép|lát|lon|hộp|miếng|bó|bắp|con|khúc|thìa cà phê|muỗng canh|vừa đủ|tùy thích|ít)?)\b/i);
    if (m && m[1] && m[1].trim()) {
        clean = m[1].trim();
    }
    clean = clean.replace(/\s+/g, " ").trim();
    return clean || "1 phần";
}

window.showToast = showToast;
window.escapeHtml = escapeHtml;
window.formatCurrency = formatCurrency;
window.formatCalories = formatCalories;
window.cleanPureIngredient = cleanPureIngredient;
window.cleanPureQuantity = cleanPureQuantity;
