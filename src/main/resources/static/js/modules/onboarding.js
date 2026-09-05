const ONB_KEY = "foodx_onboarding_done";

const onbState = {
    cuisines: [],
    spice: 1,
    favs: [],
    goals: [],
    goalOther: "",
    eaters: "3-4 người",
    cooktime: "15-30 phút",
    allergies: [],
    diet: "Không",
    calo: 2000,
    equip: []
};

if (typeof window !== 'undefined') window.onbState = onbState;

function isOnboardingDone() {
    try {
        return localStorage.getItem(ONB_KEY) === "1";
    } catch (e) {
        return false;
    }
}

function markOnboardingDone() {
    try {
        localStorage.setItem(ONB_KEY, "1");
    } catch (e) {}
}

function showOnboarding() {
    const overlay = document.getElementById("onboardingOverlay");
    if (!overlay) return;
    overlay.classList.add("show");
    document.body.style.overflow = "hidden";
}

function hideOnboarding() {
    const overlay = document.getElementById("onboardingOverlay");
    if (!overlay) return;
    overlay.classList.remove("show");
    document.body.style.overflow = "";
    markOnboardingDone();
}

function showOnbStep(step) {
    document.querySelectorAll(".onboarding-screen").forEach(function (s) {
        s.classList.remove("active");
    });
    var el = document.getElementById("onboardingStep" + step);
    if (el) el.classList.add("active");
}


/* --- Build chips --- */

function onbBuildChips(sel, items, store, multi) {
    var box = document.querySelector(sel);
    if (!box) return;
    box.innerHTML = "";
    items.forEach(function (it) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "onb-chip";
        b.textContent = it;
        b.onclick = function () {
            if (!multi) {
                store.length = 0;
                store.push(it);
                box.querySelectorAll(".onb-chip").forEach(function (c) {
                    c.classList.remove("active");
                });
                b.classList.add("active");
                return;
            }
            var idx = store.indexOf(it);
            if (idx > -1) {
                store.splice(idx, 1);
            } else {
                store.push(it);
            }
            b.classList.toggle("active");
        };
        box.appendChild(b);
    });
}

onbBuildChips(
    "#onbCuisines",
    ["🇻🇳 Việt Nam", "🥢 Á – Trung Hoa", "🌶️ Thái Lan", "🥘 Hàn Quốc", "🍣 Nhật Bản", "🍛 Ấn Độ", "🍝 Ý", "🥖 Pháp", "🌮 Mexico", "🫒 Địa Trung Hải"],
    onbState.cuisines,
    true
);

onbBuildChips(
    "#onbAllergy",
    ["🥜 Đậu phộng", "🦐 Tôm / Cua", "🐟 Cá", "🥛 Sữa", "🥚 Trứng", "🌾 Gluten", "🫘 Đậu nành", "🌰 Hạt khác", "✅ Không có dị ứng"],
    onbState.allergies,
    true
);

onbBuildChips(
    "#onbEquip",
    ["🔥 Bếp gas", "⚡ Bếp từ", "🍞 Lò nướng", "🍟 Nồi chiên không dầu", "🍚 Nồi cơm điện", "💨 Nồi áp suất", "🥤 Máy xay sinh tố"],
    onbState.equip,
    true
);


/* --- Goals --- */

var ONB_GOALS = [
    { ic: "🥗", t: "Ăn kiêng giảm cân", d: "Giảm 0,5kg mỗi tuần" },
    { ic: "💪", t: "Tăng cơ", d: "Đạm cao, ít tinh bột" },
    { ic: "⚖️", t: "Duy trì cân nặng", d: "Cân bằng dinh dưỡng" },
    { ic: "🌿", t: "Ăn lành mạnh", d: "Ít dầu, nhiều rau" },
    { ic: "⏰", t: "Tiết kiệm thời gian", d: "Món dưới 30 phút" },
    { ic: "💰", t: "Tiết kiệm chi phí", d: "Nguyên liệu giá tốt" }
];

(function buildGoals() {
    var grid = document.getElementById("onbGoals");
    if (!grid) return;
    grid.innerHTML = ONB_GOALS.map(function (g, i) {
        return '<button type="button" class="onb-goal-card" data-i="' + i + '">' +
            '<div class="g-ic">' + g.ic + '</div>' +
            '<div class="g-t">' + g.t + '</div>' +
            '<div class="g-d">' + g.d + '</div>' +
            '</button>';
    }).join("");
    grid.querySelectorAll(".onb-goal-card").forEach(function (b) {
        b.onclick = function () {
            var g = ONB_GOALS[parseInt(b.dataset.i)].t;
            var idx = onbState.goals.indexOf(g);
            if (idx > -1) {
                onbState.goals.splice(idx, 1);
            } else {
                onbState.goals.push(g);
            }
            b.classList.toggle("active");
        };
    });
})();


/* --- Segmented controls --- */

function onbBindSeg(sel, store, key) {
    var el = document.querySelector(sel);
    if (!el) return;
    el.querySelectorAll("button").forEach(function (b) {
        b.onclick = function () {
            el.querySelectorAll("button").forEach(function (x) {
                x.classList.remove("active");
            });
            b.classList.add("active");
            onbState[key] = b.dataset.v;
        };
    });
}

onbBindSeg("#onbEaters", null, "eaters");
onbBindSeg("#onbCooktime", null, "cooktime");
onbBindSeg("#onbDiet", null, "diet");


/* --- Spice slider --- */

(function () {
    var spice = document.getElementById("onbSpice");
    if (!spice) return;
    spice.addEventListener("input", function () {
        onbState.spice = parseInt(spice.value);
        document.querySelectorAll("#onboardingStep1 .onb-spice-labels span").forEach(function (s) {
            s.classList.toggle("active", parseInt(s.dataset.s) === onbState.spice);
        });
    });
})();


/* --- Favorite tags --- */

(function () {
    var input = document.getElementById("onbFavInput");
    var tagsEl = document.getElementById("onbFavTags");
    if (!input || !tagsEl) return;

    input.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && input.value.trim()) {
            e.preventDefault();
            onbState.favs.push(input.value.trim());
            input.value = "";
            renderOnbFavs();
        }
    });

    function renderOnbFavs() {
        tagsEl.innerHTML = onbState.favs.map(function (f, i) {
            return '<span class="onb-tag">' + escapeHtml(f) + '<button data-i="' + i + '" aria-label="Xoá">×</button></span>';
        }).join("");
        tagsEl.querySelectorAll("button").forEach(function (b) {
            b.onclick = function () {
                onbState.favs.splice(parseInt(b.dataset.i), 1);
                renderOnbFavs();
            };
        });
    }
})();


/* --- Calo slider --- */

(function () {
    var calo = document.getElementById("onbCalo");
    var out = document.getElementById("onbCaloOut");
    if (!calo || !out) return;
    calo.addEventListener("input", function () {
        onbState.calo = parseInt(calo.value);
        out.textContent = formatNumber(onbState.calo) + " kcal";
    });
})();


/* --- Goal other --- */

(function () {
    var inp = document.getElementById("onbGoalOther");
    if (!inp) return;
    inp.addEventListener("input", function () {
        onbState.goalOther = inp.value;
    });
})();


/* --- Navigation buttons --- */

(function () {
    var $1 = document.getElementById("onb1Next");
    var $2 = document.getElementById("onb2Next");
    var $3 = document.getElementById("onbFinish");
    var b1 = document.getElementById("onb1Back");
    var b2 = document.getElementById("onb2Back");
    var b3 = document.getElementById("onb3Back");

    if ($1) $1.onclick = function () { showOnbStep(2); };
    if ($2) $2.onclick = function () { showOnbStep(3); };
    if ($3) $3.onclick = async function () {
        /* Save onboarding profile to state */
        const dietValue = (onbState.diet && onbState.diet !== "Không") ? onbState.diet : (state.profile.diet || "Ăn linh tinh");
        const allergiesStr = Array.isArray(onbState.allergies) ? onbState.allergies.join(", ") : (onbState.allergies || "");
        const dislikesStr = onbState.goalOther || (Array.isArray(onbState.goals) ? onbState.goals.join(", ") : "");

        state.profile.diet = dietValue;
        state.profile.allergies = allergiesStr;
        state.profile.dislikes = dislikesStr;

        state.profile.onboarding = {
            cuisines: onbState.cuisines ? onbState.cuisines.slice() : [],
            spice: onbState.spice,
            favs: onbState.favs ? onbState.favs.slice() : [],
            goals: onbState.goals ? onbState.goals.slice() : [],
            goalOther: onbState.goalOther,
            eaters: onbState.eaters,
            cooktime: onbState.cooktime,
            allergies: onbState.allergies ? onbState.allergies.slice() : [],
            diet: dietValue,
            calo: onbState.calo,
            equip: onbState.equip ? onbState.equip.slice() : []
        };
        saveState();
        renderProfile();
        renderRecipes();
        hideOnboarding();
        showToast("Hoàn tất hồ sơ! Chào mừng bạn đến với Food X 🌿", "success");

        if (isUserLoggedIn()) {
            try {
                await apiRequest(PROFILE_API, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: state.profile.name,
                        gender: state.profile.gender || "male",
                        age: state.profile.age || 21,
                        weight: state.profile.weight || 53,
                        height: state.profile.height || 153,
                        target: state.profile.target || 53,
                        activity: state.profile.activity || 1.2,
                        diet: dietValue,
                        allergies: allergiesStr,
                        dislikes: dislikesStr
                    })
                });
                console.log("✅ Đã lưu chế độ ăn & hồ sơ vào MySQL thành công!");
            } catch (err) {
                console.warn("Lỗi lưu hồ sơ lên MySQL:", err);
            }
        }
    };

    if (b1) b1.onclick = function () { hideOnboarding(); };
    if (b2) b2.onclick = function () { showOnbStep(1); };
    if (b3) b3.onclick = function () { showOnbStep(2); };
})();


/* =========================================================
   1. THEME TOGGLE (DARK / LIGHT MODE)
========================================================= */
(function initTheme() {
    const savedTheme = localStorage.getItem('foodx_theme');
    const isDark = savedTheme === 'dark';
    if (isDark) {
        document.body.classList.add('dark');
    }
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) themeIcon.textContent = isDark ? '☀️' : '🌙';

    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
        themeBtn.addEventListener('click', function () {
            const dark = document.body.classList.toggle('dark');
            localStorage.setItem('foodx_theme', dark ? 'dark' : 'light');
            if (themeIcon) themeIcon.textContent = dark ? '☀️' : '🌙';
            showToast(dark ? 'Đã chuyển sang giao diện Tối 🌙' : 'Đã chuyển sang giao diện Sáng ☀️', 'info');
        });
    }
})();


/* =========================================================
   2. COOKING MODE: VOICE ASSISTANT & SMART TIMER
========================================================= */
(function initCookingTools() {
    // A. Voice Reader (Web Speech API)
    const voiceBtn = document.getElementById('readStepVoiceBtn');
    if (voiceBtn) {
        voiceBtn.addEventListener('click', function () {
            if (!('speechSynthesis' in window)) {
                showToast('Trình duyệt của bạn không hỗ trợ đọc giọng nói', 'warning');
                return;
            }
            if (window.speechSynthesis.speaking) {
                window.speechSynthesis.cancel();
                const vText = document.getElementById('voiceText');
                const vIcon = document.getElementById('voiceIcon');
                if (vText) vText.textContent = 'Đọc to bước này';
                if (vIcon) vIcon.textContent = '🔊';
                return;
            }
            const descEl = document.getElementById('cookingStepDescription');
            const titleEl = document.getElementById('cookingStepTitle');
            const textToRead = (titleEl ? titleEl.textContent + '. ' : '') + (descEl ? descEl.textContent : '');
            if (!textToRead.trim()) return;

            const utter = new SpeechSynthesisUtterance(textToRead);
            utter.lang = 'vi-VN';
            utter.rate = 0.95;

            const voices = window.speechSynthesis.getVoices();
            const viVoice = voices.find(function (v) { return v.lang && (v.lang.includes('vi') || v.lang.includes('VI')); });
            if (viVoice) utter.voice = viVoice;

            const vText = document.getElementById('voiceText');
            const vIcon = document.getElementById('voiceIcon');

            utter.onstart = function () {
                if (vText) vText.textContent = 'Đang đọc... (Bấm dừng)';
                if (vIcon) vIcon.textContent = '⏹️';
            };
            utter.onend = function () {
                if (vText) vText.textContent = 'Đọc to bước này';
                if (vIcon) vIcon.textContent = '🔊';
            };
            utter.onerror = function () {
                if (vText) vText.textContent = 'Đọc to bước này';
                if (vIcon) vIcon.textContent = '🔊';
            };

            window.speechSynthesis.speak(utter);
        });
    }

    // B. Smart Cooking Timer with Web Audio Synthesizer Chime
    let stepTimerInterval = null;
    let stepTimerSecondsLeft = 300;
    let isStepTimerRunning = false;

    function playTimerChime() {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();
            const now = ctx.currentTime;
            [523.25, 659.25, 783.99, 1046.50].forEach(function (freq, i) {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + i * 0.15);
                gain.gain.setValueAtTime(0.3, now + i * 0.15);
                gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.6);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now + i * 0.15);
                osc.stop(now + i * 0.15 + 0.6);
            });
        } catch (e) {}
    }

    function updateTimerDisp() {
        const disp = document.getElementById('stepTimerDisplay');
        if (!disp) return;
        const m = Math.floor(stepTimerSecondsLeft / 60);
        const s = stepTimerSecondsLeft % 60;
        disp.textContent = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
    }

    const toggleTimerBtn = document.getElementById('toggleStepTimerBtn');
    const timerCard = document.getElementById('stepTimerCard');
    if (toggleTimerBtn && timerCard) {
        toggleTimerBtn.addEventListener('click', function () {
            timerCard.style.display = timerCard.style.display === 'none' ? 'block' : 'none';
        });
    }

    document.querySelectorAll('[data-add-sec]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            const add = +btn.getAttribute('data-add-sec');
            stepTimerSecondsLeft += add;
            updateTimerDisp();
        });
    });

    const startPauseBtn = document.getElementById('stepTimerToggle');
    if (startPauseBtn) {
        startPauseBtn.addEventListener('click', function () {
            if (isStepTimerRunning) {
                clearInterval(stepTimerInterval);
                isStepTimerRunning = false;
                startPauseBtn.textContent = '▶ Tiếp tục';
            } else {
                if (stepTimerSecondsLeft <= 0) stepTimerSecondsLeft = 300;
                isStepTimerRunning = true;
                startPauseBtn.textContent = '⏸ Tạm dừng';
                stepTimerInterval = setInterval(function () {
                    stepTimerSecondsLeft--;
                    updateTimerDisp();
                    if (stepTimerSecondsLeft <= 0) {
                        clearInterval(stepTimerInterval);
                        isStepTimerRunning = false;
                        startPauseBtn.textContent = '▶ Bắt đầu';
                        playTimerChime();
                        showToast('⏰ Đã hết thời gian nấu!', 'success');
                    }
                }, 1000);
            }
        });
    }

    const resetBtn = document.getElementById('stepTimerReset');
    if (resetBtn) {
        resetBtn.addEventListener('click', function () {
            clearInterval(stepTimerInterval);
            isStepTimerRunning = false;
            stepTimerSecondsLeft = 300;
            updateTimerDisp();
            if (startPauseBtn) startPauseBtn.textContent = '▶ Bắt đầu';
        });
    }
})();


/* =========================================================
   3. EXPORT MEAL PLAN -> SMART SHOPPING LIST
========================================================= */
(function initMealPlanExport() {
    const exportBtn = document.getElementById('exportPlanShoppingBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', async function () {
            if (!isUserLoggedIn()) {
                requireAuth('shopping');
                return;
            }
            const days = weekDays(planOffset);
            const start = d2s(days[0]);
            const end = d2s(days[6]);

            showToast('⏳ Đang tổng hợp nguyên liệu tuần và đối soát tủ lạnh...', 'info');

            try {
                const entries = await apiRequest('/api/plan?start=' + start + '&end=' + end) || [];
                if (!entries.length) {
                    showToast('Chưa có bữa ăn nào trong tuần này để xuất đi chợ.', 'warning');
                    return;
                }

                const recipeIds = Array.from(new Set(entries.map(function(e) { return e.recipeId; }).filter(Boolean)));
                const allRecipes = await apiRequest('/api/recipes') || [];
                const plannedRecipes = allRecipes.filter(function(r) { return recipeIds.includes(r.id); });

                const fridgeItems = await apiRequest('/api/fridge') || [];
                const fridgeFoodNames = fridgeItems.map(function(f) { return (f.name || f.foodName || '').toLowerCase().trim(); });

                const missingIngredients = [];
                plannedRecipes.forEach(function(r) {
                    const ings = normalizeIngredientList(r.ingredients || r.ingredientsText);
                    ings.forEach(function(ingObj) {
                        const ingName = ingObj.ingredientName || ingObj.name || '';
                        if (!ingName) return;
                        const inFridge = checkIngredientInFridge(ingName, fridgeFoodNames);
                        if (!inFridge) {
                            missingIngredients.push(ingName);
                        }
                    });
                });

                if (!missingIngredients.length) {
                    showToast('Tủ lạnh đã có đủ nguyên liệu cho tất cả các bữa trong tuần! 🎉', 'success');
                    return;
                }

                const uniqueItems = Array.from(new Set(missingIngredients));
                let addedCount = 0;
                for (const item of uniqueItems.slice(0, 20)) {
                    try {
                        await apiRequest('/api/shopping', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ name: item, quantity: 'Theo thực đơn' })
                        });
                        addedCount++;
                    } catch(e) {}
                }

                showToast('🛒 Đã xuất ' + addedCount + ' nguyên liệu còn thiếu vào Danh sách Đi chợ!', 'success');
                openView('shopping');
                if (typeof loadShoppingList === 'function') loadShoppingList();
            } catch(e) {
                showToast('Không thể xuất danh sách đi chợ lúc này', 'error');
            }
        });
    }
})();


/* =========================================================
   4. FRIDGE RESCUE (ZERO-WASTE RECIPE)
========================================================= */
(function initFridgeRescue() {
    const rescueBtn = document.getElementById('fridgeRescueBtn');
    if (rescueBtn) {
        rescueBtn.addEventListener('click', async function () {
            if (!isUserLoggedIn()) {
                requireAuth('fridge');
                return;
            }
            try {
                const fridgeItems = await apiRequest('/api/fridge') || [];
                if (!fridgeItems.length) {
                    showToast('Tủ lạnh đang trống. Hãy thêm một vài thực phẩm trước nhé!', 'warning');
                    return;
                }
                const foodList = fridgeItems.map(function (f) { return f.name || f.foodName; }).filter(Boolean).join(', ');
                const prompt = 'Tôi đang có các nguyên liệu trong tủ lạnh gồm: ' + foodList + '. Hãy gợi ý cho tôi 1 món ăn nấu ngay ngon nhất để tận dụng và tránh lãng phí thực phẩm.';

                // Mở giao diện Trợ lý AI và tự động gửi yêu cầu gợi ý
                await openChat('chat');
                if (typeof doSend === 'function') {
                    doSend(prompt);
                } else {
                    const input = document.getElementById('chatInputFx');
                    if (input) {
                        input.value = prompt;
                        sendMessage();
                    }
                }
            } catch(e) {
                showToast('Không thể phân tích tủ lạnh lúc này: ' + e.message, 'error');
            }
        });
    }
})();

/* =========================================================
   5. BUILT-IN FOOD CATALOG & UX ENHANCEMENTS
========================================================= */

// --- 5.1 FOOD CATALOG CONTROLLER ---
let activeCatalogCategory = 'all';


// Module window exports
if (typeof window !== 'undefined') window.isOnboardingDone = isOnboardingDone;
if (typeof window !== 'undefined') window.markOnboardingDone = markOnboardingDone;
if (typeof window !== 'undefined') window.showOnboarding = showOnboarding;
if (typeof window !== 'undefined') window.hideOnboarding = hideOnboarding;
if (typeof window !== 'undefined') window.showOnbStep = showOnbStep;
if (typeof window !== 'undefined') window.onbBuildChips = onbBuildChips;
if (typeof window !== 'undefined') window.onbBindSeg = onbBindSeg;
