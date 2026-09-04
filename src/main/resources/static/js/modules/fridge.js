function renderSearch() {

    if (!foodSearch) {
        return;
    }


    const query =
        normalize(
            foodSearch.value
        );


    let data =
        catalog.filter(
            food => {

                const text =
                    normalize(
                        [
                            food.name,
                            food.type,
                            ...food.ingredients
                        ]
                            .join(" ")
                    );


                return text.includes(
                    query
                );
            }
        );


    if (!query) {

        data =
            catalog.slice(
                0,
                7
            );
    }


    const container =
        document.getElementById(
            "searchResults"
        );


    if (!container) {
        return;
    }


    if (!data.length) {

        container.innerHTML = `

            <div class="empty-search">

                <strong>
                    Không tìm thấy nguyên liệu
                </strong>

                <span>
                    Bạn có thể thêm thủ công trong Tủ lạnh.
                </span>

            </div>
        `;


        return;
    }


    container.innerHTML =
        data
            .slice(
                0,
                7
            )
            .map(
                food => `

                <div class="search-result">

                    <img
                        class="search-thumb"
                        src="${food.image}"
                        alt="${food.name}">

                    <div>

                        <div class="food-name">
                            ${food.name}
                        </div>

                        <div class="food-meta">
                            ${food.ingredients.join(", ")}
                        </div>

                        <span class="type-badge">
                            ${food.type}
                        </span>

                    </div>


                    <div class="search-actions">

                        <span class="calorie">
                            ${food.kcal} kcal
                        </span>

                        <button
                            type="button"
                            class="small-green-button"
                            data-action="add-food"
                            data-id="${food.id}">

                            + Thêm vào tủ

                        </button>

                    </div>

                </div>
            `
            )
            .join("");
}


foodSearch
    ?.addEventListener(
        "input",
        renderSearch
    );


/* =========================================================
   ADD FOOD MYSQL
========================================================= */

async function addFoodToFridge(
    foodId,
    button = null
) {

    const food =
        catalog.find(
            item =>
                item.id ===
                foodId
        );


    if (!food) {
        return;
    }


    const restore =
        buttonLoading(
            button,
            "Đang thêm..."
        );


    try {

        const nutrition =
            NUTRITION_LIBRARY[
                food.id
                ] || {};


        await apiRequest(
            FRIDGE_API,
            {

                method:
                    "POST",

                headers: {

                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify({

                        sourceKey:
                        food.id,

                        name:
                        food.name,

                        type:
                        food.type,

                        quantity:
                        food.quantity,

                        unit:
                        food.unit,

                        kcal:
                        food.kcal,

                        protein:
                            nutrition.protein ||
                            0,

                        carb:
                            nutrition.carb ||
                            0,

                        fat:
                            nutrition.fat ||
                            0,

                        components:
                            nutrition.components ||
                            food.ingredients.join(", "),

                        benefit:
                            nutrition.benefit ||
                            "Cân bằng",

                        imageUrl:
                        food.image,

                        expiresAt:
                            toDateInputValue(
                                futureDate(
                                    food.expiryDays
                                )
                            ),

                        note:
                            "",

                        customFood:
                            false
                    })
            }
        );


        await loadFridgeFromApi(
            false
        );


        restore(
            "✓ Đã thêm"
        );


        showToast(
            `${food.name} đã được lưu vào MySQL.`,
            "success"
        );


        setTimeout(
            restore,
            700
        );


    } catch (error) {

        console.error(
            error
        );


        restore();


        showToast(
            "Không thể thêm thực phẩm.",
            "error"
        );
    }
}


/* =========================================================
   FRIDGE HELPERS
========================================================= */

function getFridgeImage(item) {
    if (item.image && item.image.trim() !== '' && !item.image.includes('unsplash.com/photo-1542838132') && !item.image.includes('photo-1540420773420')) {
        return item.image;
    }

    const food = catalog.find(f => f.id === item.sourceId || (f.id && item.sourceKey === f.id));
    if (food?.image) {
        return food.image;
    }

    const n = normalize(item.name || item.ingredientName || '').toLowerCase();
    if (n === 'trung' || n.includes('trung ga') || n.includes('trung vit')) return '/images/foods/egg.jpg';
    if (n === 'ga' || n.includes('uc ga') || n.includes('thit ga')) return '/images/foods/chicken.jpg';
    if (n === 'bo' || n.includes('thit bo')) return '/images/foods/beef.jpg';
    if (n === 'heo' || n.includes('thit heo') || n.includes('thit lon')) return '/images/foods/pork.jpg';
    if (n.includes('ca hoi')) return '/images/foods/salmon.jpg';
    if (n === 'tom' || n.includes('tom tuoi')) return '/images/foods/shrimp.jpg';
    if (n.includes('ca chua')) return '/images/foods/tomato.jpg';
    if (n.includes('bong cai') || n.includes('sup lo') || n.includes('broccoli')) return '/images/foods/broccoli.jpg';
    if (n.includes('ca rot')) return '/images/foods/carrot.jpg';
    if (n.includes('khoai tay')) return '/images/foods/potato.jpg';
    if (n.includes('hanh tim')) return '/images/foods/shallot.jpg';
    if (n === 'toi') return '/images/foods/garlic.jpg';
    if (n === 'gung') return '/images/foods/ginger.jpg';
    if (n.includes('sua chua')) return '/images/foods/yogurt.jpg';
    if (n === 'sua' || n.includes('sua tuoi')) return '/images/foods/milk.jpg';
    if (n.includes('qua bo') || n.includes('trai bo')) return '/images/foods/avocado.jpg';
    if (n === 'chuoi') return '/images/foods/banana.jpg';
    if (n.includes('com') || n === 'gao') return '/images/foods/rice.jpg';
    if (n.includes('dau hu') || n.includes('dau phu')) return '/images/foods/tofu.jpg';
    if (n.includes('pho mai')) return '/images/foods/cheese.jpg';

    // Nếu là món tự thêm có tên riêng (như "cá chép"), sinh đường dẫn ảnh slug tương ứng
    const slug = (item.name || '').toLowerCase().trim()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    if (slug) {
        return `/images/foods/${slug}.jpg`;
    }

    return '/images/placeholder.jpg';
}


function estimateClientNutrition(name = "", quantity = 1, unit = "g") {
    const clean = normalize(name);
    let multiplier = (parseFloat(quantity) || 1) / 100.0;
    const u = normalize(unit);
    if (u === "kg" || u === "lit" || u === "l") multiplier = ((parseFloat(quantity) || 1) * 1000) / 100.0;
    else if (u === "qua" || u === "trung" || u === "cu" || u === "trai" || u === "con") multiplier = ((parseFloat(quantity) || 1) * 60) / 100.0;
    else if (u === "hop" || u === "phan" || u === "goi" || u === "bat" || u === "chen") multiplier = ((parseFloat(quantity) || 1) * 150) / 100.0;

    let baseKcal = 120, basePro = 8, baseCarb = 10, baseFat = 4, benefit = "Cân bằng";
    if (clean.includes("ga") || clean.includes("bo") || clean.includes("heo") || clean.includes("lon") || clean.includes("thit") || clean.includes("vit")) {
        baseKcal = 220; basePro = 26; baseCarb = 0; baseFat = 12; benefit = "Tăng cơ";
    } else if (clean.includes("ca") || clean.includes("tom") || clean.includes("muc") || clean.includes("cua") || clean.includes("hai san") || clean.includes("ngheu") || clean.includes("so")) {
        baseKcal = 140; basePro = 22; baseCarb = 0; baseFat = 5; benefit = "Giảm cân";
    } else if (clean.includes("trung")) {
        baseKcal = 143; basePro = 13; baseCarb = 1; baseFat = 10; benefit = "Cân bằng";
    } else if (clean.includes("rau") || clean.includes("cai") || clean.includes("muong") || clean.includes("xa lach") || clean.includes("bi") || clean.includes("chua") || clean.includes("rot")) {
        baseKcal = 25; basePro = 2; baseCarb = 4; baseFat = 0.2; benefit = "Giảm cân";
    } else if (clean.includes("sua") || clean.includes("pho mai") || clean.includes("chua")) {
        baseKcal = 70; basePro = 3.5; baseCarb = 5; baseFat = 3.5; benefit = "Tăng cơ";
    } else if (clean.includes("gao") || clean.includes("com") || clean.includes("bun") || clean.includes("khoai") || clean.includes("mi") || clean.includes("yen mach")) {
        baseKcal = 130; basePro = 3; baseCarb = 28; baseFat = 0.5; benefit = "Cân bằng";
    }

    return {
        kcal: Math.max(10, Math.round(baseKcal * multiplier)),
        protein: Math.round(basePro * multiplier * 10) / 10,
        carb: Math.round(baseCarb * multiplier * 10) / 10,
        fat: Math.round(baseFat * multiplier * 10) / 10,
        benefit: benefit
    };
}

function getNutritionForItem(item) {
    if (!item) return { kcal: 0, protein: 0, fat: 0, carb: 0, benefit: "Cân bằng", basis: "Khẩu phần tham khảo", components: "", note: "" };

    const library = NUTRITION_LIBRARY[item.sourceId] || {};

    let kcal = Number(item.kcal || library.kcal || 0);
    let protein = Number(item.protein ?? library.protein ?? 0);
    let fat = Number(item.fat ?? library.fat ?? 0);
    let carb = Number(item.carb ?? library.carb ?? 0);
    let benefit = item.benefit || library.benefit || "";

    // Nếu chưa có calo hoặc dinh dưỡng bằng 0, tự động ước tính dựa trên tên và số lượng
    if (kcal <= 0 && protein <= 0 && carb <= 0 && fat <= 0) {
        const est = estimateClientNutrition(item.name || "", item.quantity || 1, item.unit || "g");
        kcal = est.kcal;
        protein = est.protein;
        carb = est.carb;
        fat = est.fat;
        if (!benefit) benefit = est.benefit;
    }

    if (!benefit) benefit = "Cân bằng";

    return {
        kcal: kcal,
        protein: protein,
        fat: fat,
        carb: carb,
        benefit: benefit,
        basis: library.basis || "Khẩu phần tham khảo",
        components: item.components || library.components || item.name,
        note: item.note || library.note || "Chưa có ghi chú."
    };
}


function getQuantityStep(item) {

    const unit =
        normalize(
            item.unit
        );


    if (
        unit === "g" ||
        unit === "gram"
    ) {

        return 50;
    }


    if (
        unit === "kg"
    ) {

        return 0.1;
    }


    if (
        unit === "lit" ||
        unit === "l"
    ) {

        return 0.25;
    }


    return 1;
}


/* =========================================================
   SELECTED FRIDGE
========================================================= */

function updateSelectedFridgeUI() {

    state.selectedFridgeIds =
        state.selectedFridgeIds
            .map(Number)
            .filter(
                id =>
                    state.fridge.some(
                        food =>
                            Number(food.id) ===
                            Number(id)
                    )
            );


    const count =
        state.selectedFridgeIds.length;


    setText(
        "selectedCountHeader",
        count
    );


    setText(
        "selectedFridgeText",
        `Đã chọn ${count} nguyên liệu`
    );


    document
        .getElementById(
            "selectedFridgeBar"
        )
        ?.classList
        .toggle(
            "show",
            count > 0
        );


    const aiButton =
        document.getElementById(
            "openSelectedAI"
        );


    if (aiButton) {

        aiButton.disabled =
            count === 0;
    }


    saveState();
}


/* =========================================================
   RENDER FRIDGE
========================================================= */

function renderFridge() {

    const container =
        document.getElementById(
            "fridgeGrid"
        );


    if (!container) {
        return;
    }


    const search =
        normalize(
            document
                .getElementById(
                    "fridgeSearch"
                )
                ?.value ||
            ""
        );


    const filter =
        document
            .getElementById(
                "fridgeFilter"
            )
            ?.value ||
        "all";


    const foods =
        state.fridge.filter(
            item => {

                const matchSearch =
                    normalize(
                        `${item.name} ${item.type}`
                    )
                        .includes(
                            search
                        );


                let matchFilter =
                    true;


                if (filter === "soon") {
                    matchFilter = daysLeft(item.expiresAt) <= 3;
                } else if (filter === "meat") {
                    const raw = (item.name || "").toLowerCase() + " " + (item.type || "").toLowerCase();
                    const clean = normalize(raw);
                    const words = clean.split(/[\s,._\-\/]+/);

                    // Loại trừ rõ ràng các món thực vật/tinh bột dễ bị dính chuỗi
                    if (raw.includes("cà chua") || raw.includes("cà rốt") || raw.includes("cà tím") || raw.includes("cải") || raw.includes("gạo") || raw.includes("cam") || raw.includes("cacao") || raw.includes("cà phê")) {
                        matchFilter = false;
                    } else {
                        const meatKeywords = [
                            "thịt", "cá", "tôm", "gà", "bò", "heo", "lợn", "hải sản", "mực", "vịt", "nghêu", "sò", "ốc", "hến",
                            "cua", "ghẹ", "bạch tuộc", "chả", "xúc xích", "giò", "sườn", "lươn", "ếch", "ba chỉ", "thăn", "nạc"
                        ];
                        const cleanMeatWords = [
                            "thit", "ca", "tom", "ga", "bo", "heo", "lon", "muc", "vit", "ngheu", "so", "oc", "hen",
                            "cua", "ghe", "bach tuoc", "cha", "xuc xich", "gio", "suon", "luon", "ech", "hai san"
                        ];
                        matchFilter = meatKeywords.some(k => raw.includes(k)) || cleanMeatWords.some(k => k.includes(" ") ? clean.includes(k) : words.includes(k));
                    }
                } else if (filter === "veggie") {
                    const raw = (item.name || "").toLowerCase() + " " + (item.type || "").toLowerCase();
                    const clean = normalize(raw);
                    const words = clean.split(/[\s,._\-\/]+/);
                    const veggieKeywords = [
                        "rau", "củ", "quả", "trái", "cải", "cà chua", "cà rốt", "cà tím", "nấm", "bí", "bầu", "mướp",
                        "xà lách", "hành", "tỏi", "ớt", "gừng", "sả", "chanh", "khoai", "bắp", "ngô", "đậu", "đỗ", "dưa", "xoài", "táo", "chuối"
                    ];
                    const cleanVeggieWords = [
                        "rau", "cu", "qua", "trai", "cai", "ca chua", "ca rot", "ca tim", "nam", "bi", "bau", "muop",
                        "xa lach", "hanh", "toi", "ot", "gung", "sa", "chanh", "khoai", "bap", "ngo", "dau", "do", "dua"
                    ];
                    matchFilter = veggieKeywords.some(k => raw.includes(k)) || cleanVeggieWords.some(k => k.includes(" ") ? clean.includes(k) : words.includes(k));
                } else if (filter === "dairy") {
                    const raw = (item.name || "").toLowerCase() + " " + (item.type || "").toLowerCase();
                    const clean = normalize(raw);
                    const words = clean.split(/[\s,._\-\/]+/);
                    const dairyKeywords = ["trứng", "sữa", "phô mai", "phô-mai", "bơ", "sữa chua", "váng sữa", "kem"];
                    const cleanDairyWords = ["trung", "sua", "pho mai", "sua chua", "vang sua", "kem"];
                    matchFilter = dairyKeywords.some(k => raw.includes(k)) || cleanDairyWords.some(k => k.includes(" ") ? clean.includes(k) : words.includes(k));
                } else if (filter === "grain") {
                    const raw = (item.name || "").toLowerCase() + " " + (item.type || "").toLowerCase();
                    const clean = normalize(raw);
                    const words = clean.split(/[\s,._\-\/]+/);
                    const grainKeywords = [
                        "gạo", "cơm", "bún", "mì", "miến", "phở", "nếp", "yến mạch", "ngũ cốc",
                        "bánh mì", "bột mì", "bột gạo", "bột năng", "khoai tây", "khoai lang", "khoai", "sắn", "ngô", "bắp"
                    ];
                    const cleanGrainWords = [
                        "gao", "com", "bun", "mi", "mien", "pho", "nep", "yen mach", "ngu coc",
                        "banh mi", "bot mi", "bot gao", "bot nang", "khoai tay", "khoai lang", "khoai", "san", "ngo", "bap"
                    ];
                    matchFilter = grainKeywords.some(k => raw.includes(k)) || cleanGrainWords.some(k => k.includes(" ") ? clean.includes(k) : words.includes(k));
                }


                return (
                    matchSearch &&
                    matchFilter
                );
            }
        );


    const empty =
        document.getElementById(
            "fridgeEmpty"
        );


    if (
        !state.fridge.length
    ) {

        container.style.display =
            "none";


        if (empty) {

            empty.style.display =
                "block";
        }

    } else {

        container.style.display =
            "grid";


        if (empty) {

            empty.style.display =
                "none";
        }
    }


    if (
        !foods.length &&
        state.fridge.length
    ) {

        container.innerHTML = `

            <div class="fridge-no-result">

                Không tìm thấy thực phẩm phù hợp.

            </div>
        `;

    } else {

        container.innerHTML =
            foods
                .map(
                    item => {

                        const nutrition =
                            getNutritionForItem(
                                item
                            );


                        const days =
                            daysLeft(
                                item.expiresAt
                            );


                        const selected =
                            state.selectedFridgeIds
                                .includes(
                                    Number(
                                        item.id
                                    )
                                );


                        let statusClass =
                            "safe";


                        let statusText =
                            `Còn ${days} ngày`;


                        let expiryRingClass = "expiry-safe";
                        if (days <= 0) {
                            expiryRingClass = "expiry-danger";
                            statusClass = "danger";
                            statusText = "Cần dùng ngay";
                        } else if (days <= 2) {
                            expiryRingClass = "expiry-soon";
                            statusClass = "danger";
                        } else if (days <= 4) {
                            expiryRingClass = "expiry-warning";
                            statusClass = "soon";
                        }

                        const progress =
                            Math.max(
                                5,
                                Math.min(
                                    100,
                                    days * 10
                                )
                            );


                        return `

                        <article
                            class="
                                fridge-food-card
                                ${selected ? "selected" : ""}
                                ${expiryRingClass}
                            ">


                            <label
                                class="fridge-select-wrap"
                                title="Chọn nguyên liệu">

                                <input
                                    type="checkbox"
                                    class="fridge-select-checkbox"
                                    data-action="select-fridge"
                                    data-id="${item.id}"
                                    ${selected ? "checked" : ""}>

                            </label>


                            <div
                                class="fridge-food-image-wrap"
                                data-action="ingredient-detail"
                                data-id="${item.id}">

                                <img
                                    class="fridge-food-image"
                                    src="${getFridgeImage(item)}"
                                    alt="${escapeHtml(item.name)}">

                                <span
                                    class="fridge-status ${statusClass}">

                                    ${statusText}

                                </span>

                            </div>


                            <div class="fridge-food-body">


                                <div class="fridge-food-heading">

                                    <h3>
                                        ${escapeHtml(item.name)}
                                    </h3>

                                    <span>
                                        ${
                            item.custom
                                ? "Tự thêm"
                                : escapeHtml(item.type || "")
                        }
                                    </span>

                                </div>


                                <div class="fridge-food-info">

                                    <div>

                                        <span>
                                            Số lượng
                                        </span>

                                        <strong>
                                            ${item.quantity} ${escapeHtml(item.unit || "")}
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Năng lượng
                                        </span>

                                        <strong>
                                            ${nutrition.kcal || item.kcal || 0} kcal
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Protein
                                        </span>

                                        <strong>
                                            ${nutrition.protein} g
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Mục tiêu
                                        </span>

                                        <strong>
                                            ${escapeHtml(nutrition.benefit || "")}
                                        </strong>

                                    </div>

                                </div>


                                <span class="expiry-label">
                                    Thời gian sử dụng
                                </span>


                                <div class="fridge-expiry-progress">

                                    <div
                                        style="width:${progress}%">
                                    </div>

                                </div>


                                <div class="fridge-food-actions p1-actions">


                                    <div class="quantity-control">

                                        <button
                                            type="button"
                                            data-action="decrease-fridge"
                                            data-id="${item.id}">

                                            −

                                        </button>


                                        <button
                                            type="button"
                                            data-action="increase-fridge"
                                            data-id="${item.id}">

                                            +

                                        </button>

                                    </div>


                                    <button
                                        type="button"
                                        class="fridge-detail-button"
                                        data-action="ingredient-detail"
                                        data-id="${item.id}">

                                        Chi tiết

                                    </button>


                                    <button
                                        type="button"
                                        class="fridge-use-button"
                                        data-action="use-fridge"
                                        data-id="${item.id}">

                                        ✓ Đã dùng

                                    </button>


                                    <button
                                        type="button"
                                        class="fridge-delete"
                                        data-action="delete-fridge"
                                        data-id="${item.id}">

                                        ×

                                    </button>


                                </div>

                            </div>

                        </article>
                        `;
                    }
                )
                .join("");
    }


    const expiring =
        state.fridge.filter(
            item =>
                daysLeft(
                    item.expiresAt
                ) <= 3
        );


    setText(
        "fridgePageTotal",
        state.fridge.length
    );


    setText(
        "fridgePageExpiring",
        expiring.length
    );


    setText(
        "fridgeRecipeCount",
        suggestedRecipes().length
    );


    setText(
        "fridgeFavoriteCount",
        state.favorites.length
    );


    updateSelectedFridgeUI();
}


document
    .getElementById(
        "fridgeSearch"
    )
    ?.addEventListener(
        "input",
        debounce(renderFridge, 200)
    );


document
    .getElementById(
        "fridgeFilter"
    )
    ?.addEventListener(
        "change",
        renderFridge
    );


/* =========================================================
   QUANTITY MYSQL
========================================================= */

async function adjustFridge(
    id,
    direction
) {

    const item =
        state.fridge.find(
            food =>
                Number(food.id) ===
                Number(id)
        );


    if (!item) {
        return;
    }


    const delta =
        direction *
        getQuantityStep(
            item
        );


    try {

        await apiRequest(
            `${FRIDGE_API}/${id}/quantity?delta=${encodeURIComponent(delta)}`,
            {

                method:
                    "PATCH"
            }
        );


        await loadFridgeFromApi(
            false
        );


        showToast(
            direction > 0

                ? `Đã tăng ${item.name}.`

                : `Đã giảm ${item.name}.`,

            "info"
        );


    } catch (error) {

        console.error(
            error
        );


        showToast(
            "Không cập nhật được số lượng.",
            "error"
        );
    }
}


/* =========================================================
   USED FOOD
========================================================= */

async function useFridgeFood(id) {

    const item =
        state.fridge.find(
            food =>
                Number(food.id) ===
                Number(id)
        );


    if (!item) {
        return;
    }


    const delta =
        -getQuantityStep(
            item
        );


    try {

        await apiRequest(
            `${FRIDGE_API}/${id}/quantity?delta=${encodeURIComponent(delta)}`,
            {

                method:
                    "PATCH"
            }
        );


        await loadFridgeFromApi(
            false
        );


        showToast(
            `Đã cập nhật ${item.name} sau khi sử dụng.`,
            "success"
        );


    } catch (error) {

        console.error(
            error
        );


        showToast(
            "Không cập nhật được thực phẩm.",
            "error"
        );
    }
}


/* =========================================================
   DELETE FOOD
========================================================= */

async function deleteFridgeFood(id) {

    const item =
        state.fridge.find(
            food =>
                Number(food.id) ===
                Number(id)
        );


    if (!item) {
        return;
    }


    const confirmed =
        window.confirm(
            `Bạn có chắc muốn xóa "${item.name}" khỏi tủ lạnh?`
        );


    if (!confirmed) {
        return;
    }


    try {

        await apiRequest(
            `${FRIDGE_API}/${id}`,
            {

                method:
                    "DELETE"
            }
        );


        state.selectedFridgeIds =
            state.selectedFridgeIds
                .filter(
                    selectedId =>
                        Number(selectedId) !==
                        Number(id)
                );


        saveState();


        await loadFridgeFromApi(
            false
        );


        showToast(
            `${item.name} đã được xóa.`,
            "success"
        );


    } catch (error) {

        console.error(
            error
        );


        showToast(
            "Không thể xóa thực phẩm.",
            "error"
        );
    }
}

async function clearAllFridge() {
    if (!isUserLoggedIn()) {
        requireAuth('fridge');
        return;
    }
    const total = (state.fridge && Array.isArray(state.fridge)) ? state.fridge.length : 0;
    if (total === 0) {
        showToast('Tủ lạnh hiện đang trống.', 'info');
        return;
    }
    const confirmed = window.confirm(`Bạn có chắc muốn xóa toàn bộ ${total} thực phẩm khỏi tủ lạnh?`);
    if (!confirmed) return;

    try {
        await apiRequest(`${FRIDGE_API}/all`, {
            method: "DELETE"
        });
        state.fridge = [];
        state.selectedFridgeIds = [];
        saveState();
        await loadFridgeFromApi(false);
        if (typeof renderFridge === 'function') renderFridge();
        if (typeof renderExpiring === 'function') renderExpiring();
        if (typeof renderStats === 'function') renderStats();
        if (typeof updateFridgeSummaryCounters === 'function') updateFridgeSummaryCounters();
        showToast('Đã xóa toàn bộ thực phẩm trong tủ lạnh! 🧹', 'success');
    } catch (error) {
        console.error('clearAllFridge error:', error);
        showToast('Không thể xóa tủ lạnh: ' + (error.message || 'Lỗi kết nối'), 'error');
    }
}
window.clearAllFridge = clearAllFridge;


/* =========================================================
   SELECT FRIDGE
========================================================= */

function toggleSelectedFridge(
    id,
    checked
) {

    id =
        Number(id);


    if (checked) {

        if (
            !state.selectedFridgeIds
                .includes(id)
        ) {

            state.selectedFridgeIds.push(
                id
            );
        }

    } else {

        state.selectedFridgeIds =
            state.selectedFridgeIds
                .filter(
                    selectedId =>
                        Number(selectedId) !==
                        id
                );
    }


    saveState();

    renderFridge();
}


document
    .getElementById(
        "clearFridgeSelection"
    )
    ?.addEventListener(
        "click",
        () => {

            state.selectedFridgeIds =
                [];


            saveState();

            renderFridge();


            showToast(
                "Đã bỏ chọn toàn bộ nguyên liệu.",
                "info"
            );
        }
    );


/* =========================================================
   INGREDIENT DETAIL
/* =========================================================
   INGREDIENT DETAIL & EDIT
========================================================= */

function openIngredientDetail(id) {
    const item = state.fridge.find(food => Number(food.id) === Number(id));
    if (!item) return;

    const nutrition = getNutritionForItem(item);
    const remaining = daysLeft(item.expiresAt);

    setText("ingredientDetailTitle", "Chỉnh sửa nguyên liệu");

    const body = document.getElementById("ingredientDetailBody");
    if (!body) return;

    const commonUnits = ["quả", "trứng", "g", "kg", "ml", "lít", "hộp", "củ", "bó", "phần", "gói", "lát", "thìa", "chén", "bát", "con", "trái", "tép"];
    const curUnit = item.unit || "phần";

    body.innerHTML = `
        <div class="ingredient-detail-layout">
            <div>
                <img class="ingredient-detail-image" src="${getFridgeImage(item)}" alt="${escapeHtml(item.name)}">
                
                <div class="ingredient-expiry-box" style="margin-top: 12px; padding: 14px; border: 1px solid var(--border); border-radius: 14px; background: var(--bg);">
                    <label style="display: block; margin-bottom: 6px; font-weight: 600; font-size: 12px; color: var(--text);">📅 Hạn sử dụng</label>
                    <input type="date" id="editIngredientExpiry" value="${toDateInputValue(item.expiresAt)}" style="width: 100%; height: 38px; padding: 0 10px; border: 1px solid var(--border); border-radius: 8px; background: var(--card); color: var(--text);">
                    <small style="display: block; margin-top: 4px; font-size: 11px; color: ${remaining <= 3 ? 'var(--danger, #ef4444)' : 'var(--text-soft)'};">
                        ${remaining > 0 ? `⏳ Còn ${remaining} ngày` : '⚠️ Hết hạn / Cần dùng ngay'}
                    </small>
                </div>
            </div>

            <div>
                <div class="ingredient-detail-header" style="margin-bottom: 14px;">
                    <label style="display: block; font-size: 12px; font-weight: 600; color: var(--text); margin-bottom: 4px;">Tên thực phẩm / nguyên liệu</label>
                    <input type="text" id="editIngredientName" value="${escapeHtml(item.name)}" maxlength="100" placeholder="Nhập tên nguyên liệu..." style="width: 100%; font-size: 16px; font-weight: 600; padding: 8px 12px; border: 1px solid var(--border); border-radius: 10px; background: var(--card); color: var(--text); margin-bottom: 12px;">

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
                        <div>
                            <label style="display: block; font-size: 12px; font-weight: 600; color: var(--text); margin-bottom: 4px;">Số lượng</label>
                            <div style="display: flex; align-items: center; gap: 6px;">
                                <button type="button" class="secondary-button" style="height: 38px; width: 38px; padding: 0; font-size: 18px; font-weight: bold; border-radius: 8px;" onclick="const el = document.getElementById('editIngredientQty'); el.value = Math.max(0.1, Math.round(((parseFloat(el.value) || 1) - 1) * 10) / 10); el.dispatchEvent(new Event('input'));">−</button>
                                <input type="number" step="any" min="0.01" id="editIngredientQty" value="${item.quantity}" style="flex: 1; height: 38px; text-align: center; font-weight: 700; font-size: 15px; border: 1px solid var(--border); border-radius: 8px; background: var(--card); color: var(--text);">
                                <button type="button" class="secondary-button" style="height: 38px; width: 38px; padding: 0; font-size: 18px; font-weight: bold; border-radius: 8px;" onclick="const el = document.getElementById('editIngredientQty'); el.value = Math.round(((parseFloat(el.value) || 0) + 1) * 10) / 10; el.dispatchEvent(new Event('input'));">+</button>
                            </div>
                        </div>
                        <div>
                            <label style="display: block; font-size: 12px; font-weight: 600; color: var(--text); margin-bottom: 4px;">Đơn vị</label>
                            <select id="editIngredientUnit" style="width: 100%; height: 38px; padding: 0 10px; border: 1px solid var(--border); border-radius: 8px; background: var(--card); color: var(--text); font-weight: 500;">
                                ${commonUnits.map(u => `<option value="${u}" ${curUnit.toLowerCase() === u ? 'selected' : ''}>${u}</option>`).join('')}
                                ${!commonUnits.includes(curUnit.toLowerCase()) ? `<option value="${escapeHtml(curUnit)}" selected>${escapeHtml(curUnit)}</option>` : ''}
                            </select>
                        </div>
                    </div>

                    <div class="ingredient-tags" style="display: flex; gap: 6px; margin-top: 6px;">
                        <span>${escapeHtml(item.type || 'Nguyên liệu')}</span>
                        <span>${escapeHtml(nutrition.benefit || 'Cân bằng')}</span>
                    </div>
                </div>

                <div style="margin-bottom: 12px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                        <label style="font-size: 12px; font-weight: 600; color: var(--text); margin: 0;">Dinh dưỡng & Năng lượng</label>
                        <span style="font-size: 11px; color: var(--primary, #10b981); font-weight: 500;">⚡ Tự động khớp theo số lượng</span>
                    </div>
                    <div class="ingredient-nutrition-grid">
                        <div class="nutrition-card">
                            <span>Năng lượng</span>
                            <div style="display: flex; align-items: center; justify-content: center; gap: 2px;">
                                <input type="number" id="editIngredientKcal" value="${nutrition.kcal || item.kcal || 0}" style="width: 55px; border: 1px solid var(--border); border-radius: 6px; background: var(--card); color: var(--text); font-weight: 700; text-align: center; padding: 2px 4px;">
                                <span style="font-size: 11px;">kcal</span>
                            </div>
                        </div>
                        <div class="nutrition-card">
                            <span>Protein</span>
                            <div style="display: flex; align-items: center; justify-content: center; gap: 2px;">
                                <input type="number" step="0.1" id="editIngredientProtein" value="${nutrition.protein || 0}" style="width: 45px; border: 1px solid var(--border); border-radius: 6px; background: var(--card); color: var(--text); font-weight: 700; text-align: center; padding: 2px 4px;">
                                <span style="font-size: 11px;">g</span>
                            </div>
                        </div>
                        <div class="nutrition-card">
                            <span>Carb</span>
                            <div style="display: flex; align-items: center; justify-content: center; gap: 2px;">
                                <input type="number" step="0.1" id="editIngredientCarb" value="${nutrition.carb || 0}" style="width: 45px; border: 1px solid var(--border); border-radius: 6px; background: var(--card); color: var(--text); font-weight: 700; text-align: center; padding: 2px 4px;">
                                <span style="font-size: 11px;">g</span>
                            </div>
                        </div>
                        <div class="nutrition-card">
                            <span>Chất béo</span>
                            <div style="display: flex; align-items: center; justify-content: center; gap: 2px;">
                                <input type="number" step="0.1" id="editIngredientFat" value="${nutrition.fat || 0}" style="width: 45px; border: 1px solid var(--border); border-radius: 6px; background: var(--card); color: var(--text); font-weight: 700; text-align: center; padding: 2px 4px;">
                                <span style="font-size: 11px;">g</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="ingredient-info-section" style="margin-bottom: 16px;">
                    <label style="display: block; font-size: 12px; font-weight: 600; color: var(--text); margin-bottom: 4px;">Ghi chú</label>
                    <input type="text" id="editIngredientNote" value="${escapeHtml(item.note || '')}" placeholder="Ghi chú về nguyên liệu (vd: bảo quản ngăn mát...)" style="width: 100%; border: 1px solid var(--border); border-radius: 8px; padding: 8px 10px; background: var(--card); color: var(--text);">
                </div>

                <div style="display: flex; gap: 10px; justify-content: space-between; align-items: center; padding-top: 10px; border-top: 1px solid var(--border);">
                    <button type="button" class="danger-button" data-action="delete-fridge" data-id="${item.id}" style="padding: 9px 16px; border-radius: 9px; font-size: 13px;">
                        🗑 Xóa khỏi tủ
                    </button>
                    <div style="display: flex; gap: 8px;">
                        <button type="button" class="secondary-button" data-close="ingredientDetailModal" style="padding: 9px 16px; border-radius: 9px; font-size: 13px;">
                            Đóng
                        </button>
                        <button type="button" class="primary-button" data-action="save-ingredient-full" data-id="${item.id}" style="padding: 9px 20px; border-radius: 9px; font-size: 13px; font-weight: 600;">
                            💾 Lưu thay đổi
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Tự động cập nhật dinh dưỡng khi số lượng / đơn vị / tên thay đổi trong chi tiết
    function updateDetailNutritionLive() {
        const name = document.getElementById("editIngredientName")?.value.trim() || item.name;
        const qty = parseFloat(document.getElementById("editIngredientQty")?.value);
        const unit = document.getElementById("editIngredientUnit")?.value || item.unit || "g";

        if (!qty || isNaN(qty) || qty <= 0) return;

        const est = estimateClientNutrition(name, qty, unit);

        const kcalInput = document.getElementById("editIngredientKcal");
        const proInput = document.getElementById("editIngredientProtein");
        const carbInput = document.getElementById("editIngredientCarb");
        const fatInput = document.getElementById("editIngredientFat");

        if (kcalInput) kcalInput.value = est.kcal;
        if (proInput) proInput.value = est.protein;
        if (carbInput) carbInput.value = est.carb;
        if (fatInput) fatInput.value = est.fat;
    }

    document.getElementById("editIngredientQty")?.addEventListener("input", updateDetailNutritionLive);
    document.getElementById("editIngredientUnit")?.addEventListener("change", updateDetailNutritionLive);
    document.getElementById("editIngredientName")?.addEventListener("input", updateDetailNutritionLive);

    closeOtherModals("ingredientDetailModal");
    document.getElementById("ingredientDetailModal")?.classList.add("show");
}

async function saveIngredientFull(id) {
    const item = state.fridge.find(food => Number(food.id) === Number(id));
    if (!item) return;

    const name = document.getElementById("editIngredientName")?.value.trim();
    const quantity = parseFloat(document.getElementById("editIngredientQty")?.value);
    const unit = document.getElementById("editIngredientUnit")?.value?.trim() || "phần";
    const expiresAt = document.getElementById("editIngredientExpiry")?.value;
    const kcal = parseFloat(document.getElementById("editIngredientKcal")?.value) || 0;
    const protein = parseFloat(document.getElementById("editIngredientProtein")?.value) || 0;
    const carb = parseFloat(document.getElementById("editIngredientCarb")?.value) || 0;
    const fat = parseFloat(document.getElementById("editIngredientFat")?.value) || 0;
    const note = document.getElementById("editIngredientNote")?.value.trim() || "";

    if (!name) {
        showToast("Tên nguyên liệu không được để trống.", "warning");
        document.getElementById("editIngredientName")?.focus();
        return;
    }
    if (!FOOD_NAME_REGEX.test(name)) {
        showToast("Tên nguyên liệu chỉ được chứa chữ cái.", "warning");
        document.getElementById("editIngredientName")?.focus();
        return;
    }
    if (name.length > 100) {
        showToast("Tên nguyên liệu không được vượt quá 100 ký tự.", "warning");
        document.getElementById("editIngredientName")?.focus();
        return;
    }
    if (isNaN(quantity) || quantity <= 0) {
        showToast("Số lượng phải lớn hơn 0.", "warning");
        document.getElementById("editIngredientQty")?.focus();
        return;
    }
    if (!expiresAt) {
        showToast("Vui lòng chọn hạn sử dụng.", "warning");
        document.getElementById("editIngredientExpiry")?.focus();
        return;
    }

    try {
        await apiRequest(`${FRIDGE_API}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                quantity,
                unit,
                expiresAt,
                kcal,
                protein,
                carb,
                fat,
                note
            })
        });

        // Cập nhật state nội bộ ngay lập tức
        item.name = name;
        item.quantity = quantity;
        item.unit = unit;
        item.expiresAt = expiresAt;
        item.kcal = kcal;
        item.protein = protein;
        item.carb = carb;
        item.fat = fat;
        item.note = note;

        await loadFridgeFromApi(false);
        closeOtherModals();
        document.getElementById("ingredientDetailModal")?.classList.remove("show");
        document.body.style.overflow = "";
        showToast(`Đã lưu thay đổi nguyên liệu "${name}"!`, "success");
    } catch (error) {
        console.error("saveIngredientFull error:", error);
        showToast("Không thể cập nhật nguyên liệu: " + (error.message || "Lỗi kết nối"), "error");
    }
}
window.saveIngredientFull = saveIngredientFull;

async function saveIngredientExpiry(id) {
    const value = document.getElementById("editIngredientExpiry")?.value || document.getElementById("ingredientExpiryInput")?.value;

    if (!value) {
        showToast("Hãy chọn ngày hết hạn.", "warning");
        return;
    }

    try {
        await apiRequest(`${FRIDGE_API}/${id}/expiry`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                expiresAt: value
            })
        });

        await loadFridgeFromApi(false);
        openIngredientDetail(id);
        showToast("Đã cập nhật hạn sử dụng.", "success");
    } catch (error) {
        console.error(error);
        showToast("Không cập nhật được hạn sử dụng.", "error");
    }
}

async function mergeFridgeDuplicates() {
    if (!isUserLoggedIn()) {
        requireAuth('fridge');
        return;
    }
    try {
        await apiRequest(`${FRIDGE_API}/merge-duplicates`, {
            method: "POST"
        });
        await loadFridgeFromApi(false);
        showToast("Đã tự động gộp các nguyên liệu trùng cùng hạn sử dụng trong tủ lạnh! ✨", "success");
    } catch (error) {
        console.error("mergeFridgeDuplicates error:", error);
        showToast("Không thể gộp trùng: " + (error.message || "Lỗi kết nối"), "error");
    }
}
window.mergeFridgeDuplicates = mergeFridgeDuplicates;


/* =========================================================
   CUSTOM INGREDIENT
========================================================= */

function openCustomIngredientModal() {

    const form =
        document.getElementById(
            "customIngredientForm"
        );


    form?.reset();

    const nameInput = document.getElementById("customFoodName");
    if (nameInput) {
        nameInput.value = "";
        nameInput.style.borderColor = "";
        nameInput.style.backgroundColor = "";
        nameInput.setCustomValidity("");
    }
    const nameErrEl = document.getElementById("customFoodNameError");
    if (nameErrEl) {
        nameErrEl.style.display = "none";
    }

    const qtyInput = document.getElementById("customFoodQuantity");
    if (qtyInput) {
        qtyInput.value = "";
        qtyInput.style.borderColor = "";
        qtyInput.style.backgroundColor = "";
        qtyInput.setCustomValidity("");
    }
    const errEl = document.getElementById("customFoodQuantityError");
    if (errEl) {
        errEl.style.display = "none";
    }

    const expiry =
        document.getElementById(
            "customFoodExpiry"
        );


    if (expiry) {

        expiry.value =
            toDateInputValue(
                futureDate(7)
            );
    }


    closeOtherModals(
        "customIngredientModal"
    );

    const calcStatus = document.getElementById("nutritionCalcStatus");
    if (calcStatus) {
        calcStatus.style.display = "none";
        calcStatus.innerHTML = "";
    }

    document
        .getElementById(
            "customIngredientModal"
        )
        ?.classList
        .add("show");
}


document
    .getElementById(
        "openCustomIngredient"
    )
    ?.addEventListener(
        "click",
        openCustomIngredientModal
    );

document
    .getElementById(
        "clearAllFridgeBtn"
    )
    ?.addEventListener(
        "click",
        clearAllFridge
    );


document
    .getElementById(
        "emptyCustomIngredient"
    )
    ?.addEventListener(
        "click",
        openCustomIngredientModal
    );

/* =========================================================
   AUTO CALCULATE NUTRITION HANDLER
========================================================= */
document
    .getElementById("btnAutoCalculateNutrition")
    ?.addEventListener("click", async function () {
        const name = document.getElementById("customFoodName")?.value.trim();
        const quantity = parseFloat(document.getElementById("customFoodQuantity")?.value) || 0;
        const unit = document.getElementById("customFoodUnit")?.value || "g";
        const statusEl = document.getElementById("nutritionCalcStatus");

        if (!name) {
            showToast("Vui lòng nhập tên nguyên liệu trước khi tính calo.", "warning");
            document.getElementById("customFoodName")?.focus();
            return;
        }

        if (quantity <= 0) {
            showToast("Vui lòng nhập số lượng hợp lệ (> 0).", "warning");
            document.getElementById("customFoodQuantity")?.focus();
            return;
        }

        const btn = this;
        const originalText = btn.innerHTML;
        btn.innerHTML = "⏳ Đang tính...";
        btn.disabled = true;

        try {
            const res = await apiRequest(`/api/fridge/estimate-nutrition?name=${encodeURIComponent(name)}&quantity=${quantity}&unit=${encodeURIComponent(unit)}`);
            if (res && res.data) {
                const d = res.data;
                const calInput = document.getElementById("customFoodCalories");
                const proInput = document.getElementById("customFoodProtein");
                const carbInput = document.getElementById("customFoodCarb");
                const fatInput = document.getElementById("customFoodFat");
                const benefitSelect = document.getElementById("customFoodBenefit");
                const ingInput = document.getElementById("customFoodIngredients");

                if (calInput) calInput.value = d.kcal;
                if (proInput) proInput.value = d.protein;
                if (carbInput) carbInput.value = d.carb;
                if (fatInput) fatInput.value = d.fat;
                if (benefitSelect && d.benefit) benefitSelect.value = d.benefit;
                if (ingInput && (!ingInput.value || ingInput.value.trim() === "") && d.components) {
                    ingInput.value = d.components;
                }

                if (statusEl) {
                    statusEl.style.display = "flex";
                    statusEl.innerHTML = `✓ ${d.basisNote}: <strong>${d.kcal} kcal</strong> (Protein: ${d.protein}g, Carb: ${d.carb}g, Béo: ${d.fat}g)`;
                }

                showToast(`✓ Đã tính xong: ${d.kcal} kcal (bạn có thể sửa lại nếu muốn)`, "success");
            } else {
                throw new Error("Không có dữ liệu trả về");
            }
        } catch (err) {
            console.warn("Lỗi API estimate nutrition, dùng fallback nội bộ:", err);
            // Fallback tính toán tại client
            let multiplier = quantity / 100.0;
            const u = unit.toLowerCase();
            if (u === "kg" || u === "lít" || u === "lit" || u === "l") multiplier = (quantity * 1000) / 100.0;
            else if (u === "quả" || u === "qua" || u === "củ" || u === "cu") multiplier = (quantity * 100) / 100.0;
            else if (u === "hộp" || u === "hop" || u === "phần" || u === "phan") multiplier = (quantity * 150) / 100.0;

            const kcal = Math.round(150 * multiplier);
            const protein = Math.round(15 * multiplier * 10) / 10;
            const carb = Math.round(10 * multiplier * 10) / 10;
            const fat = Math.round(5 * multiplier * 10) / 10;

            const calInput = document.getElementById("customFoodCalories");
            const proInput = document.getElementById("customFoodProtein");
            const carbInput = document.getElementById("customFoodCarb");
            const fatInput = document.getElementById("customFoodFat");

            if (calInput) calInput.value = kcal;
            if (proInput) proInput.value = protein;
            if (carbInput) carbInput.value = carb;
            if (fatInput) fatInput.value = fat;

            if (statusEl) {
                statusEl.style.display = "flex";
                statusEl.innerHTML = `✓ Ước tính cho ${quantity} ${unit} ${name}: <strong>${kcal} kcal</strong>`;
            }
            showToast(`✓ Đã ước tính: ${kcal} kcal`, "success");
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    });

// Tự động tính calo trong modal thêm mới khi gõ tên, đổi số lượng hoặc đổi đơn vị
function autoUpdateCustomFoodNutrition() {
    const name = document.getElementById("customFoodName")?.value.trim();
    const quantity = parseFloat(document.getElementById("customFoodQuantity")?.value) || 0;
    const unit = document.getElementById("customFoodUnit")?.value || "g";
    const statusEl = document.getElementById("nutritionCalcStatus");

    if (!name || quantity <= 0) return;

    const est = estimateClientNutrition(name, quantity, unit);
    const calInput = document.getElementById("customFoodCalories");
    const proInput = document.getElementById("customFoodProtein");
    const carbInput = document.getElementById("customFoodCarb");
    const fatInput = document.getElementById("customFoodFat");
    const benefitSelect = document.getElementById("customFoodBenefit");

    if (calInput) calInput.value = est.kcal;
    if (proInput) proInput.value = est.protein;
    if (carbInput) carbInput.value = est.carb;
    if (fatInput) fatInput.value = est.fat;
    if (benefitSelect && est.benefit) benefitSelect.value = est.benefit;

    if (statusEl) {
        statusEl.style.display = "flex";
        statusEl.innerHTML = `⚡ Tự động khớp: <strong>${est.kcal} kcal</strong> (Protein: ${est.protein}g, Carb: ${est.carb}g, Béo: ${est.fat}g)`;
    }
}

const FOOD_NAME_REGEX = /^[\p{L}\s]+$/u;

function validateCustomFoodQuantityLive() {
    const input = document.getElementById("customFoodQuantity");
    const errEl = document.getElementById("customFoodQuantityError");
    if (!input) return;

    const rawVal = input.value.trim();
    const val = parseFloat(rawVal);

    if (rawVal !== "" && (rawVal.includes("-") || isNaN(val) || val <= 0)) {
        if (errEl) {
            errEl.textContent = "⚠️ Số lượng phải là số lớn hơn 0";
            errEl.style.display = "block";
        }
        input.style.borderColor = "#ef4444";
        input.style.backgroundColor = "rgba(239, 68, 68, 0.08)";
        input.setCustomValidity("Số lượng phải là số lớn hơn 0");
    } else {
        if (errEl) errEl.style.display = "none";
        input.style.borderColor = "";
        input.style.backgroundColor = "";
        input.setCustomValidity("");
    }
}

function validateCustomFoodNameLive() {
    const input = document.getElementById("customFoodName");
    const errEl = document.getElementById("customFoodNameError");
    if (!input) return;

    const val = input.value.trim();
    if (input.value.length > 100) {
        if (errEl) {
            errEl.textContent = "⚠️ Tên nguyên liệu không được vượt quá 100 ký tự";
            errEl.style.display = "block";
        }
        input.style.borderColor = "#ef4444";
        input.style.backgroundColor = "rgba(239, 68, 68, 0.08)";
        input.setCustomValidity("Tên nguyên liệu không được vượt quá 100 ký tự");
    } else if (val.length > 0 && !FOOD_NAME_REGEX.test(val)) {
        if (errEl) {
            errEl.textContent = "⚠️ Tên nguyên liệu chỉ được nhập chữ cái (không nhập số hoặc ký tự đặc biệt)";
            errEl.style.display = "block";
        }
        input.style.borderColor = "#ef4444";
        input.style.backgroundColor = "rgba(239, 68, 68, 0.08)";
        input.setCustomValidity("Tên nguyên liệu chỉ được chứa chữ cái");
    } else {
        if (errEl) errEl.style.display = "none";
        input.style.borderColor = "";
        input.style.backgroundColor = "";
        input.setCustomValidity("");
    }
}

document.getElementById("customFoodQuantity")?.addEventListener("keydown", function (e) {
    if (["-", "+", "e", "E"].includes(e.key)) {
        e.preventDefault();
    }
});
document.getElementById("customFoodQuantity")?.addEventListener("input", function () {
    validateCustomFoodQuantityLive();
    autoUpdateCustomFoodNutrition();
});
document.getElementById("customFoodQuantity")?.addEventListener("blur", function () {
    const rawVal = this.value.trim();
    const val = parseFloat(rawVal);
    if (rawVal !== "" && (rawVal.includes("-") || isNaN(val) || val <= 0)) {
        validateCustomFoodQuantityLive();
        showToast("⚠️ Số lượng không hợp lệ! Vui lòng chỉ nhập số lớn hơn 0.", "warning");
    }
});
document.getElementById("customFoodName")?.addEventListener("input", function () {
    validateCustomFoodNameLive();
    autoUpdateCustomFoodNutrition();
});
document.getElementById("customFoodName")?.addEventListener("blur", function () {
    const val = this.value.trim();
    if (this.value.length > 100) {
        validateCustomFoodNameLive();
        showToast("⚠️ Tên nguyên liệu không được vượt quá 100 ký tự.", "warning");
    } else if (val.length > 0 && !FOOD_NAME_REGEX.test(val)) {
        validateCustomFoodNameLive();
        showToast("⚠️ Tên nguyên liệu chỉ được chứa chữ cái.", "warning");
    }
});
document.getElementById("customFoodUnit")?.addEventListener("change", autoUpdateCustomFoodNutrition);



document
    .getElementById(
        "customIngredientForm"
    )
    ?.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const name =
                document
                    .getElementById(
                        "customFoodName"
                    )
                    ?.value
                    .trim();


            const quantity =
                parseFloat(
                    document
                        .getElementById(
                            "customFoodQuantity"
                        )
                        ?.value
                );


            const expiry =
                document
                    .getElementById(
                        "customFoodExpiry"
                    )
                    ?.value;


            if (!name) {
                showToast(
                    "Vui lòng nhập tên nguyên liệu.",
                    "warning"
                );
                document.getElementById("customFoodName")?.focus();
                return;
            }

            if (!FOOD_NAME_REGEX.test(name)) {
                validateCustomFoodNameLive();
                showToast(
                    "Tên nguyên liệu chỉ được chứa chữ cái (không chứa số hoặc ký tự đặc biệt).",
                    "warning"
                );
                document.getElementById("customFoodName")?.focus();
                return;
            }

            if (name.length > 100) {
                validateCustomFoodNameLive();
                showToast(
                    "Tên nguyên liệu không được vượt quá 100 ký tự.",
                    "warning"
                );
                document.getElementById("customFoodName")?.focus();
                return;
            }

            if (isNaN(quantity) || quantity <= 0) {
                validateCustomFoodQuantityLive();
                showToast(
                    "Số lượng nguyên liệu phải lớn hơn 0.",
                    "warning"
                );
                document.getElementById("customFoodQuantity")?.focus();
                return;
            }

            if (!expiry) {
                showToast(
                    "Vui lòng chọn ngày hết hạn.",
                    "warning"
                );
                document.getElementById("customFoodExpiry")?.focus();
                return;
            }


            const restore =
                buttonLoading(
                    event.submitter,
                    "Đang lưu..."
                );


            try {

                await apiRequest(
                    FRIDGE_API,
                    {

                        method:
                            "POST",

                        headers: {

                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({

                                sourceKey:
                                    null,

                                name,

                                type:
                                    "Nguyên liệu",

                                quantity,

                                unit:
                                    document
                                        .getElementById(
                                            "customFoodUnit"
                                        )
                                        ?.value ||
                                    "g",

                                kcal:
                                    Number(
                                        document
                                            .getElementById(
                                                "customFoodCalories"
                                            )
                                            ?.value
                                    ) || 0,

                                protein:
                                    Number(
                                        document
                                            .getElementById(
                                                "customFoodProtein"
                                            )
                                            ?.value
                                    ) || 0,

                                carb:
                                    Number(
                                        document
                                            .getElementById(
                                                "customFoodCarb"
                                            )
                                            ?.value
                                    ) || 0,

                                fat:
                                    Number(
                                        document
                                            .getElementById(
                                                "customFoodFat"
                                            )
                                            ?.value
                                    ) || 0,

                                components:
                                    document
                                        .getElementById(
                                            "customFoodIngredients"
                                        )
                                        ?.value
                                        .trim() ||
                                    name,

                                benefit:
                                    document
                                        .getElementById(
                                            "customFoodBenefit"
                                        )
                                        ?.value ||
                                    "Cân bằng",

                                imageUrl:
                                    document
                                        .getElementById(
                                            "customFoodImage"
                                        )
                                        ?.value
                                        .trim() ||
                                    "",

                                expiresAt:
                                expiry,

                                note:
                                    document
                                        .getElementById(
                                            "customFoodNote"
                                        )
                                        ?.value
                                        .trim() ||
                                    "",

                                customFood:
                                    true
                            })
                    }
                );


                await loadFridgeFromApi(
                    false
                );


                document
                    .getElementById(
                        "customIngredientModal"
                    )
                    ?.classList
                    .remove("show");


                restore();


                showToast(
                    `${name} đã được lưu vào MySQL.`,
                    "success"
                );


            } catch (error) {

                console.error(
                    error
                );


                restore();


                showToast(
                    error?.message || "Không thể thêm nguyên liệu.",
                    "error"
                );
            }
        }
    );


/* =========================================================
   RECIPE LOGIC
========================================================= */


// Module window exports
if (typeof window !== 'undefined') window.renderSearch = renderSearch;
if (typeof window !== 'undefined') window.addFoodToFridge = addFoodToFridge;
if (typeof window !== 'undefined') window.getFridgeImage = getFridgeImage;
if (typeof window !== 'undefined') window.estimateClientNutrition = estimateClientNutrition;
if (typeof window !== 'undefined') window.getNutritionForItem = getNutritionForItem;
if (typeof window !== 'undefined') window.getQuantityStep = getQuantityStep;
if (typeof window !== 'undefined') window.updateSelectedFridgeUI = updateSelectedFridgeUI;
if (typeof window !== 'undefined') window.renderFridge = renderFridge;
if (typeof window !== 'undefined') window.adjustFridge = adjustFridge;
if (typeof window !== 'undefined') window.useFridgeFood = useFridgeFood;
if (typeof window !== 'undefined') window.deleteFridgeFood = deleteFridgeFood;
if (typeof window !== 'undefined') window.toggleSelectedFridge = toggleSelectedFridge;
if (typeof window !== 'undefined') window.openIngredientDetail = openIngredientDetail;
if (typeof window !== 'undefined') window.saveIngredientExpiry = saveIngredientExpiry;
if (typeof window !== 'undefined') window.openCustomIngredientModal = openCustomIngredientModal;
if (typeof window !== 'undefined') window.autoUpdateCustomFoodNutrition = autoUpdateCustomFoodNutrition;
if (typeof window !== 'undefined') window.validateCustomFoodQuantityLive = validateCustomFoodQuantityLive;
if (typeof window !== 'undefined') window.validateCustomFoodNameLive = validateCustomFoodNameLive;
