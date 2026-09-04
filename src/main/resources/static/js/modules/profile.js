function calculateBMI(
    weight,
    heightCm
) {

    if (
        !weight ||
        !heightCm
    ) {

        return 0;
    }


    const height =
        heightCm / 100;


    return (
        weight /
        (
            height *
            height
        )
    );
}


function getAdultBMIStatus(bmi) {

    if (
        bmi < 18.5
    ) {

        return {

            key:
                "under",

            title:
                "Thiếu cân",

            description:
                "Cân nặng hiện thấp hơn khoảng BMI tham khảo."
        };
    }


    if (
        bmi < 25
    ) {

        return {

            key:
                "healthy",

            title:
                "Cân đối",

            description:
                "Cân nặng và chiều cao nằm trong khoảng BMI khỏe mạnh tham khảo."
        };
    }


    if (
        bmi < 30
    ) {

        return {

            key:
                "over",

            title:
                "Thừa cân",

            description:
                "BMI hiện cao hơn khoảng khỏe mạnh tham khảo."
        };
    }


    return {

        key:
            "high",

        title:
            "BMI cao",

        description:
            "BMI hiện ở mức cao. BMI chỉ là chỉ số sàng lọc."
    };
}


function calculateCalories(
    gender,
    age,
    weight,
    height,
    activity,
    target
) {

    if (
        age < 18 ||
        !weight ||
        !height
    ) {

        return 0;
    }


    let bmr;


    if (
        gender === "female"
    ) {

        bmr =
            10 * weight +
            6.25 * height -
            5 * age -
            161;

    } else {

        bmr =
            10 * weight +
            6.25 * height -
            5 * age +
            5;
    }


    let calories =
        bmr *
        Number(
            activity || 1.2
        );


    if (
        target &&
        target < weight - 1
    ) {

        calories *=
            0.90;
    }


    if (
        target &&
        target > weight + 1
    ) {

        calories *=
            1.08;
    }


    calories =
        Math.max(
            1200,
            Math.min(
                4000,
                calories
            )
        );


    return (
        Math.round(
            calories / 10
        ) *
        10
    );
}


function getGoal() {

    const weight =
        Number(
            state.profile.weight
        );


    const target =
        Number(
            state.profile.target
        );


    if (
        target <
        weight - 1
    ) {

        return "Giảm cân";
    }


    if (
        target >
        weight + 1
    ) {

        return "Tăng cân";
    }


    return "Duy trì cân nặng";
}


function getDietDescription(diet) {

    switch (diet) {

        case "Eat clean":

            return (
                "ưu tiên thực phẩm ít chế biến, rau củ và nguồn đạm phù hợp"
            );


        case "Nhiều đạm":

            return (
                "ưu tiên món giàu protein"
            );


        case "Ít carb":

            return (
                "ưu tiên món hạn chế carbohydrate"
            );


        case "Ăn chay":

            return (
                "ưu tiên công thức không sử dụng thịt"
            );


        case "Ăn linh tinh":

            return (
                "không khóa theo chế độ cố định, mà cân bằng theo nguyên liệu, calo và mục tiêu"
            );


        default:

            return (
                "ưu tiên chế độ ăn cân bằng"
            );
    }
}


/* =========================================================
   AVATAR
========================================================= */

function renderAvatar() {

    const avatar =
        (state.profile.avatarUrl && String(state.profile.avatarUrl).trim() !== "")
            ? state.profile.avatarUrl
            : ((authState.avatarUrl && String(authState.avatarUrl).trim() !== "")
                ? authState.avatarUrl
                : DEFAULT_AVATAR);


    /*
        Cả 3 avatar:
        - góc phải
        - cạnh tên
        - trong chỉnh hồ sơ
    */

    const avatarElements =
        new Set([

            ...document.querySelectorAll(
                ".user-avatar-sync"
            ),

            document.getElementById(
                "headerAvatar"
            ),

            document.getElementById(
                "profileMenuAvatar"
            ),

            document.getElementById(
                "profileAvatarPreview"
            )
        ]);


    avatarElements.forEach(
        element => {

            if (!element) {
                return;
            }


            element.src =
                avatar;


            element.onerror =
                function () {

                    this.onerror =
                        null;


                    this.src =
                        DEFAULT_AVATAR;
                };
        }
    );


    const removeButton =
        document.getElementById(
            "removeAvatarButton"
        );


    if (removeButton) {

        removeButton.style.display =
            state.profile.avatarUrl &&
            String(
                state.profile.avatarUrl
            ).trim() !== ""

                ? "inline-flex"

                : "none";
    }
}


/* =========================================================
   PROFILE RENDER
========================================================= */

function renderProfile() {

    const p =
        state.profile;


    const bmi =
        calculateBMI(
            p.weight,
            p.height
        );


    const calories =
        calculateCalories(
            p.gender,
            p.age,
            p.weight,
            p.height,
            p.activity,
            p.target
        );


    setText(
        "quickName",
        p.name
    );


    setText(
        "quickWeight",
        `${p.weight} kg`
    );


    setText(
        "quickHeight",
        `${p.height} cm`
    );


    setText(
        "quickTarget",
        `${p.target} kg`
    );


    setText(
        "quickBmi",
        bmi
            ? bmi.toFixed(1)
            : "--"
    );


    setText(
        "quickCalories",
        calories
            ? `${formatNumber(calories)} kcal`
            : "--"
    );


    setText(
        "quickDiet",
        p.diet
    );


    setText(
        "dailyCalories",
        calories
            ? formatNumber(calories)
            : "--"
    );


    const profileNote =
        document.getElementById(
            "profileAiNote"
        );


    if (profileNote) {

        profileNote.textContent =
            `${getGoal()} • ${p.diet}. Food X sẽ ưu tiên công thức phù hợp với hồ sơ.`;
    }


    const smart =
        document.getElementById(
            "smartSuggestion"
        );


    if (smart) {

        smart.textContent =
            calories

                ? `${getGoal()}. Năng lượng tham khảo khoảng ${formatNumber(calories)} kcal/ngày.`

                : "Food X đang phân tích hồ sơ.";
    }


    renderAvatar();
}


/* =========================================================
   PROFILE MODAL
========================================================= */

const profileModal =
    document.getElementById(
        "profileModal"
    );


function fillProfileForm() {
    const p = state.profile || {};
    const onb = (p.onboarding || (typeof onbState !== 'undefined' ? onbState : {})) || {};

    const values = {
        profileName: p.name,
        profileGender: p.gender,
        profileAge: p.age,
        profileWeight: p.weight,
        profileHeight: p.height,
        profileTarget: p.target,
        profileActivity: p.activity,
        profileDiet: p.diet,
        profileAllergies: p.allergies,
        profileDislikes: p.dislikes,
        profileCaloInput: onb.calo || 2000,
        profileCaloRangeSync: onb.calo || 2000
    };

    Object.entries(values).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (!element) return;

        if (id === "profileDiet") {
            const exists = Array.from(element.options).some(option => option.value === value);
            element.value = exists ? value : "Cân bằng";
        } else {
            element.value = value ?? "";
        }
    });

    // Populate Spice Select
    const spiceSelect = document.getElementById('profileSpiceSelect');
    if (spiceSelect) {
        const sp = onb.spice || 1;
        const spiceMap = { 0: 'Không cay', 1: 'Ít cay', 2: 'Vừa cay', 3: 'Cay nhiều', 4: 'Siêu cay 🌶️' };
        spiceSelect.value = typeof sp === 'string' ? sp : (spiceMap[sp] || 'Ít cay');
    }

    // Populate Cuisines Chips
    const cuisines = onb.cuisines || [];
    document.querySelectorAll('#profileCuisinesGrid .onb-chip').forEach(btn => {
        const txt = btn.textContent.trim();
        btn.classList.toggle('active', cuisines.some(c => txt.includes(c) || c.includes(txt)));
    });

    // Populate Goals Chips
    const goals = onb.goals || [];
    document.querySelectorAll('#profileGoalsGrid .onb-chip').forEach(btn => {
        const txt = btn.textContent.trim();
        btn.classList.toggle('active', goals.some(g => txt.includes(g) || g.includes(txt)));
    });

    // Populate Equipment Chips
    const equip = onb.equip || [];
    document.querySelectorAll('#profileEquipGrid .onb-chip').forEach(btn => {
        const txt = btn.textContent.trim();
        btn.classList.toggle('active', equip.some(e => txt.includes(e) || e.includes(txt)));
    });

    renderAvatar();
}


document
    .getElementById(
        "editProfileButton"
    )
    ?.addEventListener(
        "click",
        () => {

            if (!isUserLoggedIn()) {
                requireAuth("profile");
                return;
            }

            fillProfileForm();


            profilePanel
                ?.classList
                .remove("show");


            profileModal
                ?.classList
                .add("show");


            setTimeout(
                updateHealthPreview,
                50
            );
        }
    );


function setHealthAdvice(text) {

    const element =
        document.querySelector(
            "#healthAiAdvice p"
        );


    if (element) {

        element.textContent =
            text;
    }
}


function updateBMIMarker(bmi) {

    const marker =
        document.getElementById(
            "bmiMarker"
        );


    if (!marker) {
        return;
    }


    let position =
        (
            (bmi - 15) /
            20
        ) *
        100;


    position =
        Math.max(
            1,
            Math.min(
                99,
                position
            )
        );


    marker.style.left =
        `${position}%`;
}


function updateHealthPreview() {

    const gender =
        document
            .getElementById(
                "profileGender"
            )
            ?.value ||
        "male";


    const age =
        Number(
            document
                .getElementById(
                    "profileAge"
                )
                ?.value
        );


    const weight =
        Number(
            document
                .getElementById(
                    "profileWeight"
                )
                ?.value
        );


    const height =
        Number(
            document
                .getElementById(
                    "profileHeight"
                )
                ?.value
        );


    const target =
        Number(
            document
                .getElementById(
                    "profileTarget"
                )
                ?.value
        );


    const activity =
        Number(
            document
                .getElementById(
                    "profileActivity"
                )
                ?.value ||
            1.2
        );


    const diet =
        document
            .getElementById(
                "profileDiet"
            )
            ?.value ||
        "Cân bằng";


    setText(
        "healthGender",
        gender === "female"
            ? "Nữ"
            : "Nam"
    );


    const bmi =
        calculateBMI(
            weight,
            height
        );


    if (
        !age ||
        !weight ||
        !height ||
        !bmi
    ) {

        setText(
            "healthBMI",
            "--"
        );


        setText(
            "healthStatus",
            "Hãy nhập thông tin"
        );


        setText(
            "healthStatusDescription",
            "Kết quả sẽ cập nhật khi bạn thay đổi thông tin."
        );


        setText(
            "healthyWeightRange",
            "-- kg"
        );


        setText(
            "healthGoal",
            "--"
        );


        setText(
            "healthCalories",
            "-- kcal"
        );


        setText(
            "healthWeightDifference",
            "--"
        );


        setHealthAdvice(
            "Điền đầy đủ thông tin để Food X phân tích."
        );


        return;
    }


    setText(
        "healthBMI",
        bmi.toFixed(1)
    );


    updateBMIMarker(
        bmi
    );


    if (
        age < 20
    ) {

        setText(
            "healthStatus",
            "Cần đánh giá theo tuổi"
        );


        setText(
            "healthStatusDescription",
            "Người dưới 20 tuổi cần đánh giá BMI theo tuổi và giới tính."
        );


        setText(
            "healthyWeightRange",
            "Theo tuổi & giới"
        );


        setText(
            "healthGoal",
            "Chưa đánh giá"
        );


        setText(
            "healthCalories",
            "Chưa đánh giá"
        );


        setText(
            "healthWeightDifference",
            "Chưa đánh giá"
        );


        setHealthAdvice(
            "Food X chưa dùng ngưỡng BMI người lớn cho người dưới 20 tuổi."
        );


        return;
    }


    const status =
        getAdultBMIStatus(
            bmi
        );


    setText(
        "healthStatus",
        status.title
    );


    setText(
        "healthStatusDescription",
        status.description
    );


    const h =
        height / 100;


    const minWeight =
        18.5 *
        h *
        h;


    const maxWeight =
        24.9 *
        h *
        h;


    setText(
        "healthyWeightRange",
        `${minWeight.toFixed(1)} – ${maxWeight.toFixed(1)} kg`
    );


    let goalText =
        "Duy trì cân nặng";


    if (
        target <
        weight - 0.5
    ) {

        goalText =
            `Giảm ${(weight - target).toFixed(1)} kg`;
    }


    if (
        target >
        weight + 0.5
    ) {

        goalText =
            `Tăng ${(target - weight).toFixed(1)} kg`;
    }


    setText(
        "healthGoal",
        goalText
    );


    let difference =
        "Trong khoảng tham khảo";


    if (
        weight <
        minWeight
    ) {

        difference =
            `Thấp hơn ${(minWeight - weight).toFixed(1)} kg`;
    }


    if (
        weight >
        maxWeight
    ) {

        difference =
            `Cao hơn ${(weight - maxWeight).toFixed(1)} kg`;
    }


    setText(
        "healthWeightDifference",
        difference
    );


    const calories =
        calculateCalories(
            gender,
            age,
            weight,
            height,
            activity,
            target
        );


    setText(
        "healthCalories",
        `${formatNumber(calories)} kcal`
    );


    let advice =
        `${status.description} Food X sẽ ${getDietDescription(diet)}.`;


    advice +=
        gender === "female"

            ? " Giới tính nữ được sử dụng trong phần ước tính năng lượng."

            : " Giới tính nam được sử dụng trong phần ước tính năng lượng.";


    setHealthAdvice(
        advice
    );
}


[
    "profileGender",
    "profileAge",
    "profileWeight",
    "profileHeight",
    "profileTarget",
    "profileActivity",
    "profileDiet"
]
    .forEach(
        id => {

            const element =
                document.getElementById(
                    id
                );


            element
                ?.addEventListener(
                    "input",
                    updateHealthPreview
                );


            element
                ?.addEventListener(
                    "change",
                    updateHealthPreview
                );
        }
    );


/* =========================================================
   SAVE PROFILE MYSQL
========================================================= */

document.getElementById("profileForm")?.addEventListener("submit", async event => {
    event.preventDefault();
    const restore = buttonLoading(event.submitter, "Đang lưu...");

    // Collect Section 03 setup preferences
    const selCuisines = Array.from(document.querySelectorAll('#profileCuisinesGrid .onb-chip.active')).map(b => b.textContent.trim());
    const selGoals = Array.from(document.querySelectorAll('#profileGoalsGrid .onb-chip.active')).map(b => b.textContent.trim());
    const selEquip = Array.from(document.querySelectorAll('#profileEquipGrid .onb-chip.active')).map(b => b.textContent.trim());
    const spiceVal = document.getElementById('profileSpiceSelect')?.value || 'Ít cay';
    const caloVal = Number(document.getElementById('profileCaloInput')?.value || 2000);

    const payload = {
        name: document.getElementById("profileName")?.value.trim(),
        gender: document.getElementById("profileGender")?.value,
        age: Number(document.getElementById("profileAge")?.value),
        weight: Number(document.getElementById("profileWeight")?.value),
        height: Number(document.getElementById("profileHeight")?.value),
        target: Number(document.getElementById("profileTarget")?.value),
        activity: Number(document.getElementById("profileActivity")?.value),
        diet: document.getElementById("profileDiet")?.value,
        allergies: document.getElementById("profileAllergies")?.value.trim(),
        dislikes: document.getElementById("profileDislikes")?.value.trim()
    };

    try {
        let data = {};
        try {
            data = await apiRequest(PROFILE_API, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
        } catch (e) {
            console.warn("Backend profile save fallback:", e);
        }

        state.profile = Object.assign({}, state.profile, payload, {
            onboarding: {
                cuisines: selCuisines,
                spice: spiceVal,
                goals: selGoals,
                calo: caloVal,
                equip: selEquip,
                allergies: payload.allergies ? payload.allergies.split(',').map(s=>s.trim()) : [],
                diet: payload.diet
            }
        });

        // Sync with global onbState if present
        if (typeof onbState !== 'undefined') {
            onbState.cuisines = selCuisines;
            onbState.spice = spiceVal;
            onbState.goals = selGoals;
            onbState.calo = caloVal;
            onbState.equip = selEquip;
        }

        saveState();
        renderProfile();
        renderRecipes();

        restore("✓ Đã lưu");

        setTimeout(() => {
            document.getElementById("profileModal")?.classList.remove("show");
            restore();
            showToast("Hồ sơ & Chế độ ăn đã được đồng bộ!", "success");
        }, 350);

    } catch (error) {
        console.error(error);
        restore();
        showToast("Không lưu được hồ sơ.", "error");
    }
});

/* =========================================================
   AVATAR UPLOAD
========================================================= */

const profileAvatarInput =
    document.getElementById(
        "profileAvatarInput"
    );


document
    .getElementById(
        "chooseAvatarButton"
    )
    ?.addEventListener(
        "click",
        () => {

            profileAvatarInput
                ?.click();
        }
    );


profileAvatarInput
    ?.addEventListener(
        "change",
        async () => {

            const file =
                profileAvatarInput
                    .files?.[0];


            if (!file) {
                return;
            }


            const allowedTypes = [

                "image/jpeg",
                "image/png",
                "image/webp"
            ];


            if (
                !allowedTypes.includes(
                    file.type
                )
            ) {

                showToast(
                    "Chỉ hỗ trợ JPG, PNG hoặc WEBP.",
                    "warning"
                );


                profileAvatarInput.value =
                    "";


                return;
            }


            if (
                file.size >
                5 *
                1024 *
                1024
            ) {

                showToast(
                    "Ảnh tối đa 5MB.",
                    "warning"
                );


                profileAvatarInput.value =
                    "";


                return;
            }


            const previewURL =
                URL.createObjectURL(
                    file
                );


            /*
                Preview đồng bộ tất cả avatar.
            */

            document
                .querySelectorAll(
                    ".user-avatar-sync"
                )
                .forEach(
                    image => {

                        image.src =
                            previewURL;
                    }
                );


            const formData =
                new FormData();


            formData.append(
                "avatar",
                file
            );


            try {

                const response =
                    await fetch(
                        `${PROFILE_API}/avatar`,
                        {

                            method:
                                "POST",

                            body:
                            formData
                        }
                    );


                if (!response.ok) {

                    const errorText =
                        await response.text();


                    throw new Error(
                        `${response.status} ${errorText}`
                    );
                }


                const data =
                    await response.json();


                state.userId =
                    data.userId;


                state.profile =
                    apiProfileToState(
                        data
                    );


                saveState();


                renderProfile();


                showToast(
                    "Ảnh đại diện đã được cập nhật.",
                    "success"
                );


            } catch (error) {

                console.error(
                    "Avatar upload error:",
                    error
                );


                renderAvatar();


                showToast(
                    "Không tải được ảnh đại diện.",
                    "error"
                );


            } finally {

                URL.revokeObjectURL(
                    previewURL
                );


                profileAvatarInput.value =
                    "";
            }
        }
    );


/* =========================================================
   REMOVE AVATAR
========================================================= */

document
    .getElementById(
        "removeAvatarButton"
    )
    ?.addEventListener(
        "click",
        async () => {

            if (
                !state.profile.avatarUrl
            ) {

                return;
            }


            const confirmed =
                window.confirm(
                    "Bạn muốn xóa ảnh đại diện?"
                );


            if (!confirmed) {
                return;
            }


            try {

                const data =
                    await apiRequest(
                        `${PROFILE_API}/avatar`,
                        {

                            method:
                                "DELETE"
                        }
                    );


                state.userId =
                    data.userId;


                state.profile =
                    apiProfileToState(
                        data
                    );


                saveState();


                renderProfile();


                showToast(
                    "Đã xóa ảnh đại diện.",
                    "success"
                );


            } catch (error) {

                console.error(
                    error
                );


                showToast(
                    "Không xóa được ảnh đại diện.",
                    "error"
                );
            }
        }
    );


/* =========================================================
   MODAL COMMON
========================================================= */

function closeOtherModals(
    exceptId = ""
) {

    document
        .querySelectorAll(
            ".modal-overlay"
        )
        .forEach(
            modal => {

                if (
                    modal.id !==
                    exceptId
                ) {

                    modal.classList.remove(
                        "show"
                    );
                }
            }
        );
}


/* =========================================================
   MODAL EVENT DELEGATION (Static & Dynamic buttons, Backdrop, Escape key)
========================================================= */

document.addEventListener("click", function (event) {
    // 1. Click vào nút có thuộc tính data-close hoặc class .modal-close, .auth-close
    const closeBtn = event.target.closest("[data-close], .modal-close, .auth-close");
    if (closeBtn) {
        const modalId = closeBtn.dataset.close;
        const modal = modalId ? document.getElementById(modalId) : closeBtn.closest(".modal-overlay");
        if (modal) {
            modal.classList.remove("show");
            if (modal.id === "planMealModal" || modal.id === "shoppingRecipeModal") {
                modal.setAttribute("hidden", "");
                modal.style.display = "none";
            }
            document.body.style.overflow = "";
        }
        return;
    }

    // 2. Click ra ngoài backdrop của modal-overlay
    if (event.target.classList && event.target.classList.contains("modal-overlay")) {
        event.target.classList.remove("show");
        if (event.target.id === "planMealModal" || event.target.id === "shoppingRecipeModal") {
            event.target.setAttribute("hidden", "");
            event.target.style.display = "none";
        }
        document.body.style.overflow = "";
    }
});

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        document.querySelectorAll(".modal-overlay.show").forEach(modal => {
            modal.classList.remove("show");
        });
        document.body.style.overflow = "";
    }
});


/* =========================================================
   SEARCH FOOD
========================================================= */

const foodSearch =
    document.getElementById(
        "foodSearch"
    );



// Module window exports
if (typeof window !== 'undefined') window.calculateBMI = calculateBMI;
if (typeof window !== 'undefined') window.getAdultBMIStatus = getAdultBMIStatus;
if (typeof window !== 'undefined') window.calculateCalories = calculateCalories;
if (typeof window !== 'undefined') window.getGoal = getGoal;
if (typeof window !== 'undefined') window.getDietDescription = getDietDescription;
if (typeof window !== 'undefined') window.renderAvatar = renderAvatar;
if (typeof window !== 'undefined') window.renderProfile = renderProfile;
if (typeof window !== 'undefined') window.fillProfileForm = fillProfileForm;
if (typeof window !== 'undefined') window.setHealthAdvice = setHealthAdvice;
if (typeof window !== 'undefined') window.updateBMIMarker = updateBMIMarker;
if (typeof window !== 'undefined') window.updateHealthPreview = updateHealthPreview;
if (typeof window !== 'undefined') window.closeOtherModals = closeOtherModals;
