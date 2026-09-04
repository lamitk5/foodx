function renderStats() {

    setText(
        "fridgeCount",
        state.fridge.length
    );


    setText(
        "expiringCount",
        state.fridge.filter(
            item =>
                daysLeft(
                    item.expiresAt
                ) <= 3
        ).length
    );
}


function renderExpiring() {

    const items =
        state.fridge
            .filter(
                item =>
                    daysLeft(
                        item.expiresAt
                    ) <= 3
            )
            .sort(
                (a, b) =>
                    daysLeft(
                        a.expiresAt
                    ) -
                    daysLeft(
                        b.expiresAt
                    )
            );


    const container =
        document.getElementById(
            "homeExpiring"
        );


    if (!container) {
        return;
    }


    if (
        !items.length
    ) {

        container.innerHTML = `

            <p>
                Không có thực phẩm cần dùng sớm.
            </p>
        `;


        return;
    }


    container.innerHTML =
        items
            .slice(
                0,
                4
            )
            .map(
                item => {

                    const days =
                        daysLeft(
                            item.expiresAt
                        );


                    return `

                        <div class="expiring-item">


                            <strong>
                                ${item.name}
                            </strong>


                            <span>

                                ${
                        days <= 0

                            ? "Dùng ngay"

                            : `Còn ${days} ngày`
                    }

                            </span>


                        </div>
                    `;
                }
            )
            .join("");
}


/* =========================================================
   REFRESH
========================================================= */

document
    .getElementById(
        "refreshSuggestions"
    )
    ?.addEventListener(
        "click",
        async event => {

            const restore =
                buttonLoading(
                    event.currentTarget,
                    "Đang phân tích..."
                );


            await Promise.all([

                loadFridgeFromApi(
                    false
                ),

                loadProfileFromApi(
                    false
                )
            ]);


            renderRecipes();


            restore();


            showToast(
                "Đã cập nhật gợi ý.",
                "success"
            );
        }
    );


/* =========================================================
   NOTIFICATION
========================================================= */

document
    .getElementById(
        "notificationButton"
    )
    ?.addEventListener(
        "click",
        () => {

            const expiring =
                state.fridge.filter(
                    item =>
                        daysLeft(
                            item.expiresAt
                        ) <= 3
                );


            if (
                !expiring.length
            ) {

                showToast(
                    "Hiện không có cảnh báo mới.",
                    "info"
                );


                return;
            }


            showToast(

                `Nên dùng sớm: ${
                    expiring
                        .slice(
                            0,
                            3
                        )
                        .map(
                            item =>
                                item.name
                        )
                        .join(", ")
                }.`,

                "warning"
            );
        }
    );


/* =========================================================
   CHAT
========================================================= */

const chatWindow =
    document.getElementById(
        "chatWindow"
    );


const chatInput =
    document.getElementById(
        "chatInput"
    );


const chatMessages =
    document.getElementById(
        "chatMessages"
    );


async function cookNow() {
    if (!curRecipe) return;
    if (!isUserLoggedIn()) {
        requireAuth('stats');
        return;
    }
    openCookingMode();
}


/* =========================================================
   PLAN - KẾ HOẠCH TUẦN (gop tu dk-dn)
========================================================= */
let planOffset = 0;
let planEntries = [];

async function loadStats() {
    const kpi = document.getElementById('kpiGrid');
    if (kpi) showSkeleton(kpi, 'card', 3);
    try {
        const s = await apiRequest('/api/stats');
        if (kpi && s) {
            const avg = (s.byDay && s.byDay.length)
                ? Math.round(s.byDay.reduce(function (a, d) { return a + (d.kcal || 0); }, 0) / s.byDay.filter(function (d) { return d.kcal > 0; }).length || 0)
                : 0;
            kpi.innerHTML =
                (s.currentStreak > 0 ? '<div class="kpi"><span class="k-ic">📆</span><b>' + s.currentStreak + '</b><span>ngày nấu liên tiếp 🔥</span></div>' : '') +
                '<div class="kpi"><span class="k-ic">🍳</span><b>' + s.totalCooked + '</b><span>món đã nấu</span></div>' +
                '<div class="kpi"><span class="k-ic">📅</span><b>' + s.weekCooked + '</b><span>trong 7 ngày</span></div>' +
                '<div class="kpi"><span class="k-ic">🗓</span><b>' + s.monthCooked + '</b><span>trong 30 ngày</span></div>' +
                '<div class="kpi"><span class="k-ic">🔥</span><b>' + avg + '</b><span>kcal TB / ngày</span></div>';
        }
        drawLineChart(s ? s.byDay : []);
        const top = document.getElementById('topDishes');
        if (top) {
            top.innerHTML = (s && s.topRecipes && s.topRecipes.length)
                ? s.topRecipes.map(function (t) {
                    return '<div class="top-row"><span class="top-emoji">' + recipeEmoji({ title: t.title }) + '</span>' +
                        '<span class="top-name">' + escapeHtml(t.title) + '</span><span class="top-cnt">×' + t.count + ' lần</span></div>';
                }).join('')
                : '<div class="empty-state"><span class="es-icon">📊</span><b>Chưa có dữ liệu nấu ăn</b><p>Nấu ngay món đầu tiên để xem thống kê!</p></div>';
        }
        if (s) renderStatsExtra(s);
    } catch (e) {
        if (kpi) renderError(kpi, loadStats);
    }
}

async function renderStatsExtra(s) {
    const ins = document.getElementById('statsInsights');
    const waste = document.getElementById('statsWaste');
    let fridge = [];
    try { fridge = await apiRequest('/api/fridge') || []; } catch (e) { }

    const insights = [];
    if (s.weekCooked > 0) insights.push('Bạn đã nấu <b>' + s.weekCooked + ' món</b> trong 7 ngày qua.');
    if (s.topRecipes && s.topRecipes.length) insights.push('Món được nấu nhiều nhất: <b>' + escapeHtml(s.topRecipes[0].title) + '</b> (' + s.topRecipes[0].count + ' lần).');
    const expiring = fridge.filter(function (i) { const info = expiryInfo(i.expiresAt); return info && (info.cls === 'soon' || info.cls === 'expired'); });
    if (expiring.length) insights.push('Có <b>' + expiring.length + ' nguyên liệu</b> đang sắp hết hạn trong tủ.');

    if (ins) {
        ins.innerHTML = insights.length
            ? insights.map(function (t) { return '<div class="insight">💡 ' + t + '</div>'; }).join('')
            : '<div class="insight">💡 Bắt đầu thêm nguyên liệu vào tủ lạnh và nấu ăn để xem thông tin chi tiết.</div>';
    }
    if (waste) {
        const expired = fridge.filter(function (i) { const info = expiryInfo(i.expiresAt); return info && info.cls === 'expired'; });
        const soon = fridge.filter(function (i) { const info = expiryInfo(i.expiresAt); return info && info.cls === 'soon'; });
        const ok = fridge.filter(function (i) { const info = expiryInfo(i.expiresAt); return info && info.cls === 'ok'; });
        waste.innerHTML =
            '<div class="waste-box ok"><b>' + ok.length + '</b><span>Nguyên liệu còn hạn</span></div>' +
            '<div class="waste-box"><b>' + soon.length + '</b><span>Đang đến hạn (≤2 ngày)</span></div>' +
            '<div class="waste-box danger"><b>' + expired.length + '</b><span>Đã hết hạn</span></div>';
    }
}


/* =========================================================
   SHOPPING — progress + clear-done undo
========================================================= */
let lastClearedShop = [];


// Module window exports
if (typeof window !== 'undefined') window.renderStats = renderStats;
if (typeof window !== 'undefined') window.renderExpiring = renderExpiring;
if (typeof window !== 'undefined') window.cookNow = cookNow;
if (typeof window !== 'undefined') window.loadStats = loadStats;
if (typeof window !== 'undefined') window.renderStatsExtra = renderStatsExtra;
