/**
 * FoodX - Profile & Health Metrics Module
 * Quản lý hồ sơ dinh dưỡng người dùng, tính toán BMI, nhu cầu Calo và mục tiêu sức khỏe.
 */

function calcBmi(weight, height) {
    if (!weight || !height || height <= 0) return 0;
    const hMeter = height / 100;
    return Number((weight / (hMeter * hMeter)).toFixed(1));
}

function getBmiAssessment(bmi) {
    if (!bmi || bmi <= 0) return { label: "Chưa rõ", color: "var(--text-soft)" };
    if (bmi < 18.5) return { label: "Thiếu cân", color: "#3b82f6" };
    if (bmi < 24.9) return { label: "Cân đối", color: "#10b981" };
    if (bmi < 29.9) return { label: "Thừa cân", color: "#f59e0b" };
    return { label: "Béo phì", color: "#ef4444" };
}

window.calcBmi = calcBmi;
window.getBmiAssessment = getBmiAssessment;
