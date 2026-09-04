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
import './modules/foodCatalog.js';

// Boot application
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (typeof window.startFoodX === 'function') {
            window.startFoodX();
        }
    });
} else {
    if (typeof window.startFoodX === 'function') {
        window.startFoodX();
    }
}
