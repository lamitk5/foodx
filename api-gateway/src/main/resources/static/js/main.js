/**
 * FoodX - Modular Application Entry Point
 */

// Import modular scripts into global execution scope
import './modules/utils.js';
import './modules/data.js';
import './modules/state.js';
import './modules/auth.js';
import './modules/navigation.js';
import './modules/profile.js';
import './modules/foodCatalog.js';
import './modules/fridge.js';
import './modules/recipes.js';
import './modules/cooking.js';
import './modules/shopping.js';
import './modules/stats.js';
import './modules/social.js';
import './modules/plan.js';
import './modules/home.js';
import './modules/chat.js';
import './modules/onboarding.js';
import './modules/threeD.js';

// Boot application
function boot() {
    if (typeof window.startFoodX === 'function') {
        window.startFoodX();
    }
    if (typeof window.init3DFeatures === 'function') {
        window.init3DFeatures();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
} else {
    boot();
}
