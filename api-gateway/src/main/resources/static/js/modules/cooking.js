function getCookingStepTitle(
    step,
    index
) {

    const text =
        normalize(
            step
        );


    if (
        text.includes("rua") ||
        text.includes("cat") ||
        text.includes("thai") ||
        text.includes("got")
    ) {

        return (
            "Chuẩn bị nguyên liệu"
        );
    }


    if (
        text.includes("uop")
    ) {

        return (
            "Ướp nguyên liệu"
        );
    }


    if (
        text.includes("xao")
    ) {

        return (
            "Xào nguyên liệu"
        );
    }


    if (
        text.includes("nuong")
    ) {

        return (
            "Nướng món ăn"
        );
    }


    if (
        text.includes("luoc") ||
        text.includes("hap")
    ) {

        return (
            "Làm chín nguyên liệu"
        );
    }


    if (
        text.includes("tron")
    ) {

        return (
            "Trộn nguyên liệu"
        );
    }


    return (
        `Thực hiện bước ${index + 1}`
    );
}


function startCooking(recipeId) {

    const recipe =
        getRecipeById(
            recipeId
        );


    if (!recipe) {
        return;
    }


    activeRecipeContext = {

        id:
        recipe.id,

        name:
        recipe.name,

        ingredients:
            [...recipe.ingredients],

        steps:
            [...recipe.steps],

        kcal:
        recipe.kcal,

        time:
        recipe.time,

        difficulty:
        recipe.difficulty
    };


    cookingState = {

        recipeId:
        recipe.id,

        stepIndex:
            0
    };


    closeOtherModals(
        "cookingModal"
    );


    renderCookingStep();


    document
        .getElementById(
            "cookingModal"
        )
        ?.classList
        .add("show");


    showToast(
        `Bắt đầu nấu ${recipe.name}.`,
        "success"
    );
}


function renderCookingStep() {

    const recipe =
        getRecipeById(
            cookingState.recipeId
        );


    if (!recipe) {
        return;
    }


    const total =
        recipe.steps.length;


    cookingState.stepIndex =
        Math.max(
            0,
            Math.min(
                total - 1,
                cookingState.stepIndex
            )
        );


    const index =
        cookingState.stepIndex;


    const step =
        recipe.steps[
            index
            ];


    setText(
        "cookingRecipeName",
        recipe.name
    );


    setText(
        "cookingProgressText",
        `Bước ${index + 1} / ${total}`
    );


    setText(
        "cookingStepNumber",
        index + 1
    );


    setText(
        "cookingStepTitle",
        getCookingStepTitle(
            step,
            index
        )
    );


    setText(
        "cookingStepDescription",
        step
    );


    setText(
        "cookingTime",
        `${recipe.time} phút`
    );


    setText(
        "cookingCalories",
        `${recipe.kcal} kcal`
    );


    const image =
        document.getElementById(
            "cookingRecipeImage"
        );


    if (image) {

        image.src =
            recipe.image;
    }


    const progress =
        (
            (index + 1) /
            total
        ) *
        100;


    const bar =
        document.getElementById(
            "cookingProgressBar"
        );


    if (bar) {

        bar.style.width =
            `${progress}%`;
    }


    const previous =
        document.getElementById(
            "previousCookingStep"
        );


    if (previous) {

        previous.disabled =
            index === 0;
    }


    const next =
        document.getElementById(
            "nextCookingStep"
        );


    if (next) {

        next.innerHTML =
            index ===
            total - 1

                ? "✓ Hoàn thành"

                : "Bước tiếp theo →";
    }


    updateChatContextBanner();
}


document
    .getElementById(
        "previousCookingStep"
    )
    ?.addEventListener(
        "click",
        () => {

            if (
                cookingState.stepIndex >
                0
            ) {

                cookingState.stepIndex--;


                renderCookingStep();
            }
        }
    );


document
    .getElementById(
        "nextCookingStep"
    )
    ?.addEventListener(
        "click",
        () => {

            const recipe =
                getRecipeById(
                    cookingState.recipeId
                );


            if (!recipe) {
                return;
            }


            if (
                cookingState.stepIndex >=
                recipe.steps.length - 1
            ) {

                document
                    .getElementById(
                        "cookingModal"
                    )
                    ?.classList
                    .remove("show");


                showToast(
                    `🎉 Bạn đã hoàn thành ${recipe.name}!`,
                    "success"
                );


                cookingState = {

                    recipeId:
                        null,

                    stepIndex:
                        0
                };


                updateChatContextBanner();


                return;
            }


            cookingState.stepIndex++;


            renderCookingStep();
        }
    );


/* =========================================================
   SHOPPING
========================================================= */
// Quản lý danh sách mua sắm được xử lý đồng bộ qua API MySQL tại /api/shopping


function openCookingMode() {
    if (!curRecipe) {
        showToast('Chưa chọn món ăn để bắt đầu nấu.', 'warning');
        return;
    }
    currentCookingRecipe = curRecipe;
    currentCookingStepIndex = 0;

    const modal = document.getElementById('cookingModeModal');
    if (!modal) return;

    const titleEl = document.getElementById('cmRecipeTitle');
    if (titleEl) titleEl.textContent = currentCookingRecipe.title || currentCookingRecipe.name || 'Món ngon';
    renderCurrentCookingStep();
    resetCookingTimer();

    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}
window.openCookingMode = openCookingMode;

function renderCurrentCookingStep() {
    if (!currentCookingRecipe) return;
    const steps = String(currentCookingRecipe.instructions || '').split('\n').map(s => s.trim()).filter(Boolean);
    const totalSteps = steps.length || 1;
    const currentStepText = steps[currentCookingStepIndex] || (currentCookingRecipe.description || 'Nấu theo khẩu vị và thưởng thức.');

    const indEl = document.getElementById('cmStepIndicator');
    const contentEl = document.getElementById('cmStepContent');
    if (indEl) indEl.textContent = `Bước ${currentCookingStepIndex + 1} / ${totalSteps}`;
    if (contentEl) contentEl.textContent = currentStepText;

    const prevBtn = document.getElementById('cmPrevBtn');
    const nextBtn = document.getElementById('cmNextBtn');
    const doneBtn = document.getElementById('cmDoneBtn');

    if (prevBtn) prevBtn.style.display = currentCookingStepIndex > 0 ? 'inline-block' : 'none';
    if (nextBtn) nextBtn.style.display = currentCookingStepIndex < totalSteps - 1 ? 'inline-block' : 'none';
    if (doneBtn) doneBtn.style.display = currentCookingStepIndex >= totalSteps - 1 ? 'inline-block' : 'none';
}

function nextCookingStep() {
    if (!currentCookingRecipe) return;
    const steps = String(currentCookingRecipe.instructions || '').split('\n').map(s => s.trim()).filter(Boolean);
    if (currentCookingStepIndex < steps.length - 1) {
        currentCookingStepIndex++;
        renderCurrentCookingStep();
    }
}
window.nextCookingStep = nextCookingStep;

function prevCookingStep() {
    if (currentCookingStepIndex > 0) {
        currentCookingStepIndex--;
        renderCurrentCookingStep();
    }
}
window.prevCookingStep = prevCookingStep;

async function finishCookingMode() {
    const modal = document.getElementById('cookingModeModal');
    if (modal) modal.classList.remove('show');
    document.body.style.overflow = '';
    resetCookingTimer();
    stopCookingSpeech();

    if (isUserLoggedIn() && currentCookingRecipe && currentCookingRecipe.id) {
        try {
            await apiRequest('/api/stats/cooked', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipeId: currentCookingRecipe.id,
                    servings: currentCookingRecipe.servings || undefined
                })
            });
            // Cập nhật tủ lạnh & số liệu sau khi trừ nguyên liệu
            try {
                if (typeof loadFridgeFromApi === 'function') { await loadFridgeFromApi(false); }
                if (typeof renderFridge === 'function') { renderFridge(); }
                if (typeof renderStats === 'function') { renderStats(); }
            } catch (_) {}
        } catch (_) {}
    }
    showToast('🎉 Tuyệt vời! Bạn đã hoàn thành món ăn thành công! Chúc ngon miệng!', 'success');
}
window.finishCookingMode = finishCookingMode;

function setCookingTimer(minutes) {
    resetCookingTimer();
    cookingTimerSeconds = minutes * 60;
    updateTimerDisplay();
}
window.setCookingTimer = setCookingTimer;

function updateTimerDisplay() {
    const el = document.getElementById('cmTimerDisplay');
    if (!el) return;
    const m = Math.floor(cookingTimerSeconds / 60);
    const s = cookingTimerSeconds % 60;
    el.textContent = `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
}

function toggleCookingTimer() {
    const btn = document.getElementById('cmTimerToggleBtn');
    if (cookingTimerInterval) {
        clearInterval(cookingTimerInterval);
        cookingTimerInterval = null;
        if (btn) btn.textContent = '▶ Tiếp tục hẹn giờ';
    } else {
        if (cookingTimerSeconds <= 0) cookingTimerSeconds = 5 * 60;
        updateTimerDisplay();
        if (btn) btn.textContent = '⏸ Tạm dừng';
        cookingTimerInterval = setInterval(() => {
            if (cookingTimerSeconds > 0) {
                cookingTimerSeconds--;
                updateTimerDisplay();
            } else {
                clearInterval(cookingTimerInterval);
                cookingTimerInterval = null;
                if (btn) btn.textContent = '▶ Bắt đầu hẹn giờ';
                showToast('⏰ Hết giờ nấu rồi! Hãy kiểm tra món ăn nhé!', 'warning');
            }
        }, 1000);
    }
}
window.toggleCookingTimer = toggleCookingTimer;

function resetCookingTimer() {
    if (cookingTimerInterval) {
        clearInterval(cookingTimerInterval);
        cookingTimerInterval = null;
    }
    cookingTimerSeconds = 0;
    updateTimerDisplay();
    const btn = document.getElementById('cmTimerToggleBtn');
    if (btn) btn.textContent = '▶ Bắt đầu hẹn giờ';
}
window.resetCookingTimer = resetCookingTimer;

function toggleSpeechRecognition() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
        showToast('Trình duyệt của bạn chưa hỗ trợ nhận diện giọng nói Web Speech.', 'warning');
        return;
    }
    if (isCookingSpeechListening) {
        stopCookingSpeech();
    } else {
        startCookingSpeech(SpeechRec);
    }
}
window.toggleSpeechRecognition = toggleSpeechRecognition;

function startCookingSpeech(SpeechRec) {
    try {
        cookingSpeechRecognition = new SpeechRec();
        cookingSpeechRecognition.lang = 'vi-VN';
        cookingSpeechRecognition.continuous = true;
        cookingSpeechRecognition.interimResults = false;

        cookingSpeechRecognition.onstart = function () {
            isCookingSpeechListening = true;
            const btn = document.getElementById('cmVoiceBtn');
            const label = document.getElementById('cmVoiceLabel');
            if (btn) btn.classList.add('listening');
            if (label) label.textContent = 'Đang lắng nghe khẩu lệnh...';
        };

        cookingSpeechRecognition.onresult = function (event) {
            const last = event.results.length - 1;
            const transcript = event.results[last][0].transcript.toLowerCase().trim();
            console.log('[Voice Command]', transcript);
            if (transcript.includes('tiếp') || transcript.includes('sau')) {
                nextCookingStep();
                showToast('🗣 Khẩu lệnh: "Bước tiếp theo"', 'info');
            } else if (transcript.includes('trước') || transcript.includes('lùi')) {
                prevCookingStep();
                showToast('🗣 Khẩu lệnh: "Bước trước"', 'info');
            } else if (transcript.includes('xong') || transcript.includes('hoàn thành')) {
                finishCookingMode();
            }
        };

        cookingSpeechRecognition.onerror = function () {
            stopCookingSpeech();
        };

        cookingSpeechRecognition.onend = function () {
            if (isCookingSpeechListening) {
                try { cookingSpeechRecognition.start(); } catch (_) { stopCookingSpeech(); }
            } else {
                stopCookingSpeech();
            }
        };

        cookingSpeechRecognition.start();
    } catch (e) {
        stopCookingSpeech();
    }
}

function stopCookingSpeech() {
    isCookingSpeechListening = false;
    if (cookingSpeechRecognition) {
        try { cookingSpeechRecognition.stop(); } catch (_) {}
        cookingSpeechRecognition = null;
    }
    const btn = document.getElementById('cmVoiceBtn');
    const label = document.getElementById('cmVoiceLabel');
    if (btn) btn.classList.remove('listening');
    if (label) label.textContent = 'Bật giọng nói rảnh tay';
}

// --- 5.3 ZERO-WASTE MEAL PLANNING ---

// Module window exports
if (typeof window !== 'undefined') window.getCookingStepTitle = getCookingStepTitle;
if (typeof window !== 'undefined') window.startCooking = startCooking;
if (typeof window !== 'undefined') window.renderCookingStep = renderCookingStep;
if (typeof window !== 'undefined') window.renderCurrentCookingStep = renderCurrentCookingStep;
if (typeof window !== 'undefined') window.updateTimerDisplay = updateTimerDisplay;
if (typeof window !== 'undefined') window.startCookingSpeech = startCookingSpeech;
if (typeof window !== 'undefined') window.stopCookingSpeech = stopCookingSpeech;
