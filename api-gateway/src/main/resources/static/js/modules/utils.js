/**
 * FoodX - Utility Module (utils.js)
 * Xử lý thông báo Toast, Loading Spinner, định dạng dữ liệu và hiệu ứng giao diện
 */

/* =========================================================
   1. STRING & DATA FORMATTING HELPERS
========================================================= */

function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function escapeHTML(text = '') {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function debounce(fn, delay = 200) {
    let timer = null;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

function normalize(text = '') {
    return String(text || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .trim();
}

function futureDate(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString();
}

function daysLeft(date) {
    if (!date) return 0;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let end;
    if (typeof date === 'string' && date.includes('-')) {
        const parts = date.split('T')[0].split('-');
        if (parts.length === 3) {
            end = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        } else {
            end = new Date(date);
        }
    } else {
        end = new Date(date);
    }
    const target = new Date(end.getFullYear(), end.getMonth(), end.getDate());

    return Math.round((target - today) / (1000 * 60 * 60 * 24));
}

function formatNumber(value) {
    return Number(value || 0).toLocaleString('vi-VN');
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

function toDateInputValue(dateValue) {
    if (!dateValue) return '';
    if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
        return dateValue;
    }
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function recipeEmoji(r) {
    const t = (r && r.title ? r.title : '').toLowerCase();
    if (t.includes('phở')) return '🍜';
    if (t.includes('gà')) return '🍗';
    if (t.includes('cơm')) return '🍚';
    if (t.includes('bánh mì')) return '🥖';
    if (t.includes('rau')) return '🥦';
    if (t.includes('canh')) return '🐟';
    if (t.includes('súp')) return '🎃';
    if (t.includes('bò')) return '🥩';
    if (t.includes('cháo')) return '🍲';
    if (t.includes('gỏi')) return '🥗';
    if (t.includes('chè')) return '🍮';
    return '🍽️';
}

function expiryInfo(iso) {
    if (!iso) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(iso.includes('T') ? iso : iso + 'T00:00:00');
    const diff = Math.round((d - today) / 864e5);
    if (diff < 0) return { cls: 'expired', label: 'Đã hết hạn' };
    if (diff === 0) return { cls: 'soon', label: 'Hết hạn hôm nay' };
    if (diff <= 2) return { cls: 'soon', label: 'Còn ' + diff + ' ngày' };
    return { cls: 'ok', label: 'Còn ' + diff + ' ngày' };
}

function foodEmoji(name) {
    const n = String(name || '').toLowerCase();
    const map = {
        'gà': '🍗', 'bò': '🥩', 'heo': '🥓', 'cá': '🐟', 'tôm': '🦐',
        'trứng': '🥚', 'sữa': '🥛', 'cà rốt': '🥕', 'cải': '🥬', 'bông cải': '🥦',
        'hành': '🌿', 'tỏi': '🧄', 'cà chua': '🍅', 'bí': '🎃', 'chuối': '🍌',
        'táo': '🍎', 'chanh': '🍋', 'ớt': '🌶️', 'gạo': '🍚', 'mì': '🍜',
        'bánh mì': '🥖', 'đậu hũ': '⬜', 'rau': '🥬', 'mật ong': '🍯', 'dầu': '🫗'
    };
    for (const k in map) {
        if (n.includes(k)) return map[k];
    }
    return '🥫';
}


/* =========================================================
   2. TOAST NOTIFICATIONS & LOADING SPINNERS
========================================================= */

let toastTimer;

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) {
        console.log(`[Toast ${type}]`, message);
        return;
    }

    clearTimeout(toastTimer);

    const icons = {
        success: '✓',
        error: '!',
        warning: '⚠',
        info: 'ℹ'
    };

    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || '✓'}</span>
        <span>${escapeHtml(message)}</span>
    `;

    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    toastTimer = setTimeout(() => {
        toast.classList.remove('show');
    }, 3200);
}

function buttonLoading(button, text = 'Đang xử lý...') {
    if (!button) return () => {};
    const oldHTML = button.innerHTML;
    button.disabled = true;
    button.classList.add('button-loading');
    button.innerHTML = `<span class="mini-spinner"></span> ${text}`;

    return function restore(html = null) {
        button.disabled = false;
        button.classList.remove('button-loading');
        button.innerHTML = html !== null ? html : oldHTML;
    };
}

function showSkeleton(el, type, n) {
    if (!el) return;
    const unit = type === 'card' ? '<div class="sk sk-card"></div>'
        : type === 'row' ? '<div class="sk sk-row"></div>'
        : '<div class="sk sk-text"></div>';
    el.innerHTML = '<div class="' + (type === 'card' ? 'sk-grid' : 'sk-list') + '">' + Array(n || 3).fill(unit).join('') + '</div>';
}

function renderEmpty(el, icon, title, desc, ctaLabel, ctaFn) {
    if (!el) return;
    el.innerHTML = '<div class="empty-state"><span class="es-icon">' + (icon || '🥗') + '</span>' +
        '<b>' + escapeHtml(title) + '</b><p>' + escapeHtml(desc) + '</p>' +
        (ctaLabel ? '<button type="button" class="primary-button" id="emptyCtaBtn">' + escapeHtml(ctaLabel) + '</button>' : '') +
        '</div>';
    const btn = document.getElementById('emptyCtaBtn');
    if (btn && ctaFn) btn.addEventListener('click', ctaFn);
}

function renderError(el, retryFn) {
    if (!el) return;
    el.innerHTML = '<div class="error-state"><b>Không thể tải dữ liệu</b>' +
        '<p>Vui lòng kiểm tra kết nối mạng hoặc thử lại.</p>' +
        '<button type="button" class="secondary-button" id="errRetryBtn">Thử lại</button></div>';
    const btn = document.getElementById('errRetryBtn');
    if (btn && retryFn) btn.addEventListener('click', retryFn);
}


/* =========================================================
   3. NETWORK API HELPER (Fetch + Auth header + Error parsing)
========================================================= */

async function apiRequest(url, options = {}) {
    const token = typeof getToken === 'function' ? getToken() : (localStorage.getItem('foodx_token') || '');

    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
            ...(token ? { Authorization: 'Bearer ' + token } : {})
        }
    });

    if (!response.ok) {
        if (response.status === 401) {
            if (typeof setToken === 'function') setToken('');
            else localStorage.removeItem('foodx_token');
            if (window.authState) window.authState.authenticated = false;
            if (typeof renderAuthSettings === 'function') renderAuthSettings();

            let errMsg = 'Vui lòng đăng nhập để thực hiện tính năng này.';
            try {
                const raw = await response.text();
                const j = JSON.parse(raw);
                if (j && j.message) errMsg = j.message;
            } catch (_) {}
            throw new Error(errMsg);
        }

        let message = `HTTP ${response.status}`;
        try {
            const text = await response.text();
            if (text) {
                try {
                    const parsed = JSON.parse(text);
                    message = parsed.message || parsed.error || text;
                } catch (_) {
                    message = text;
                }
            }
        } catch (_) {}
        throw new Error(message);
    }

    if (response.status === 204) return null;

    const text = await response.text();
    if (!text) return null;

    try {
        const parsed = JSON.parse(text);
        if (parsed && typeof parsed === 'object' && 'success' in parsed && 'data' in parsed) {
            return parsed.data;
        }
        return parsed;
    } catch {
        return text;
    }
}


/* =========================================================
   4. STATS CHARTING & VISUALIZATION HELPERS
========================================================= */

function drawLineChart(byDay) {
    const svg = document.getElementById('statsLine');
    const labels = document.getElementById('statsLabels');
    if (!svg) return;
    const data = (byDay || []).map(function (d) { return d.kcal || 0; });
    const dates = (byDay || []).map(function (d) { return String(d.date || '').slice(5); });
    const W = 340, H = 150, pad = 8;
    const max = Math.max.apply(null, data.concat([1]));
    const x = function (i) { return pad + i * (W - pad * 2) / Math.max(1, data.length - 1); };
    const y = function (v) { return H - 14 - (v / max) * (H - 40); };
    const pts = data.map(function (v, i) { return x(i).toFixed(1) + ',' + y(v).toFixed(1); });
    if (data.length > 1) {
        svg.innerHTML =
            '<polyline class="stats-line" points="' + pts.join(' ') + '"/>' +
            pts.map(function (p, i) {
                return '<circle class="stats-dot" cx="' + p.split(',')[0] + '" cy="' + p.split(',')[1] + '" r="3"><title>' + (dates[i] || '') + ': ' + data[i] + ' kcal</title></circle>';
            }).join('');
    } else {
        svg.innerHTML = '<text x="170" y="75" text-anchor="middle" class="stats-empty-text">Chưa có dữ liệu</text>';
    }
    if (labels) labels.innerHTML = dates.map(function (d) { return '<span>' + d + '</span>'; }).join('');
}

async function loadStats() {
    const kpi = document.getElementById('kpiGrid');
    if (kpi) showSkeleton(kpi, 'card', 3);
    try {
        const s = await apiRequest('/api/stats');
        if (kpi && s) {
            const avg = (s.byDay && s.byDay.length)
                ? Math.round(s.byDay.reduce(function (a, d) { return a + (d.kcal || 0); }, 0) / (s.byDay.filter(function (d) { return d.kcal > 0; }).length || 1))
                : 0;
            kpi.innerHTML =
                (s.currentStreak > 0 ? '<div class="kpi"><span class="k-ic">📆</span><b>' + s.currentStreak + '</b><span>ngày nấu liên tiếp 🔥</span></div>' : '') +
                '<div class="kpi"><span class="k-ic">🍳</span><b>' + (s.totalCooked || 0) + '</b><span>món đã nấu</span></div>' +
                '<div class="kpi"><span class="k-ic">📅</span><b>' + (s.weekCooked || 0) + '</b><span>trong 7 ngày</span></div>' +
                '<div class="kpi"><span class="k-ic">🗓</span><b>' + (s.monthCooked || 0) + '</b><span>trong 30 ngày</span></div>' +
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
   5. 3D SPATIAL & MOTION ENGINE
========================================================= */

let threeDInitialized = false;

function init3DFeatures() {
    if (threeDInitialized) return;
    threeDInitialized = true;

    init3DTiltObserver();
    init3DHeroParallax();
    init3DHeroScene();
}

function init3DTilt(element) {
    if (!element || element.dataset.tilt3dBound) return;
    element.dataset.tilt3dBound = 'true';
    element.classList.add('card-3d');

    let glare = element.querySelector('.card-3d-glare');
    if (!glare) {
        glare = document.createElement('div');
        glare.className = 'card-3d-glare';
        element.appendChild(glare);
    }

    let isHovered = false;
    let rafId = null;
    let currentX = 0, currentY = 0;
    let targetX = 0, targetY = 0;

    function update() {
        if (!isHovered) {
            currentX += (0 - currentX) * 0.15;
            currentY += (0 - currentY) * 0.15;
            if (Math.abs(currentX) < 0.1 && Math.abs(currentY) < 0.1) {
                element.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0)';
                if (glare) glare.style.opacity = '0';
                rafId = null;
                return;
            }
        } else {
            currentX += (targetX - currentX) * 0.2;
            currentY += (targetY - currentY) * 0.2;
        }

        const rotX = (-currentY * 9).toFixed(2);
        const rotY = (currentX * 9).toFixed(2);
        element.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(8px)`;

        if (glare) {
            const glareX = ((currentX + 1) * 50).toFixed(1);
            const glareY = ((currentY + 1) * 50).toFixed(1);
            glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.3) 0%, transparent 65%)`;
            glare.style.opacity = '1';
        }

        rafId = requestAnimationFrame(update);
    }

    element.addEventListener('mouseenter', () => {
        isHovered = true;
        if (!rafId) rafId = requestAnimationFrame(update);
    });

    element.addEventListener('mousemove', (e) => {
        const rect = element.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        targetX = (x - 0.5) * 2;
        targetY = (y - 0.5) * 2;
        if (!rafId) rafId = requestAnimationFrame(update);
    });

    element.addEventListener('mouseleave', () => {
        isHovered = false;
        targetX = 0;
        targetY = 0;
    });
}

function init3DTiltObserver() {
    const cardSelectors = '.recipe-card, .fridge-food-card, .catalog-card, .blog-featured-card, .dash-card, .srm-card';

    function scanAndBind() {
        document.querySelectorAll(cardSelectors).forEach(card => {
            init3DTilt(card);
        });
    }

    scanAndBind();
    if (typeof MutationObserver !== 'undefined') {
        const observer = new MutationObserver(() => scanAndBind());
        const mainContainer = document.querySelector('.main') || document.body;
        if (mainContainer) {
            observer.observe(mainContainer, { childList: true, subtree: true });
        }
    }
}

function trigger3DViewTransition(targetViewEl) {
    if (!targetViewEl) return;
    targetViewEl.classList.remove('view-enter-3d');
    void targetViewEl.offsetWidth;
    targetViewEl.classList.add('view-enter-3d');

    setTimeout(() => {
        targetViewEl.classList.remove('view-enter-3d');
    }, 550);
}

function init3DHeroParallax() {
    const heroWrap = document.querySelector('.slogan-hero-clean') || document.querySelector('.home-dash');
    if (!heroWrap) return;

    heroWrap.addEventListener('mousemove', (e) => {
        const rect = heroWrap.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        const badges = heroWrap.querySelectorAll('.floating-3d-badge');
        badges.forEach((b, idx) => {
            const depth = (idx + 1) * 14;
            const moveX = (x * depth).toFixed(1);
            const moveY = (y * depth).toFixed(1);
            b.style.transform = `translate3d(${moveX}px, ${moveY}px, ${30 + depth}px)`;
        });
    });

    heroWrap.addEventListener('mouseleave', () => {
        const badges = heroWrap.querySelectorAll('.floating-3d-badge');
        badges.forEach(b => {
            b.style.transform = '';
        });
    });
}

function init3DHeroScene() {
    const container = document.getElementById('hero3dContainer');
    if (!container) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'hero-3d-canvas';
    container.innerHTML = '';
    container.appendChild(canvas);

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
        render2D3DFallback(canvas);
        return;
    }

    let width = (canvas.width = container.clientWidth || 300);
    let height = (canvas.height = container.clientHeight || 280);
    gl.viewport(0, 0, width, height);

    const vsSource = `
        attribute vec3 aPosition;
        attribute vec3 aNormal;
        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
            vNormal = aNormal;
            vPosition = aPosition;
            gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
        }
    `;

    const fsSource = `
        precision mediump float;
        varying vec3 vNormal;
        varying vec3 vPosition;
        uniform vec3 uLightPos;
        uniform vec3 uColor;
        void main() {
            vec3 N = normalize(vNormal);
            vec3 L = normalize(uLightPos - vPosition);
            float diff = max(dot(N, L), 0.25);
            vec3 viewDir = vec3(0.0, 0.0, 1.0);
            vec3 reflectDir = reflect(-L, N);
            float spec = pow(max(dot(viewDir, reflectDir), 0.0), 16.0) * 0.4;
            vec3 col = uColor * diff + vec3(spec);
            gl_FragColor = vec4(col, 1.0);
        }
    `;

    function createShader(type, source) {
        const s = gl.createShader(type);
        gl.shaderSource(s, source);
        gl.compileShader(s);
        return s;
    }

    const prog = gl.createProgram();
    gl.attachShader(prog, createShader(gl.VERTEX_SHADER, vsSource));
    gl.attachShader(prog, createShader(gl.FRAGMENT_SHADER, fsSource));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const segments = 32;
    const positions = [];
    const normals = [];

    for (let i = 0; i < segments; i++) {
        const theta1 = (i / segments) * Math.PI * 2;
        const theta2 = ((i + 1) / segments) * Math.PI * 2;
        const x1 = Math.cos(theta1), z1 = Math.sin(theta1);
        const x2 = Math.cos(theta2), z2 = Math.sin(theta2);

        positions.push(0, -0.1, 0, x1 * 0.85, 0.45, z1 * 0.85, x2 * 0.85, 0.45, z2 * 0.85);
        normals.push(0, 1, 0, x1, 0.6, z1, x2, 0.6, z2);

        positions.push(x1 * 0.4, -0.45, z1 * 0.4, x2 * 0.4, -0.45, z2 * 0.4, x1 * 0.85, 0.45, z1 * 0.85);
        normals.push(x1, 0.2, z1, x2, 0.2, z2, x1, 0.6, z1);
        positions.push(x2 * 0.4, -0.45, z2 * 0.4, x2 * 0.85, 0.45, z2 * 0.85, x1 * 0.85, 0.45, z1 * 0.85);
        normals.push(x2, 0.2, z2, x2, 0.6, z2, x1, 0.6, z1);
    }

    const posBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const normBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(prog, 'aPosition');
    const aNorm = gl.getAttribLocation(prog, 'aNormal');
    const uMVP = gl.getUniformLocation(prog, 'uModelViewMatrix');
    const uProj = gl.getUniformLocation(prog, 'uProjectionMatrix');
    const uLight = gl.getUniformLocation(prog, 'uLightPos');
    const uColor = gl.getUniformLocation(prog, 'uColor');

    gl.enable(gl.DEPTH_TEST);

    let angleY = 0, targetAngleY = 0;
    let angleX = 0.25, targetAngleX = 0.25;
    let isDragging = false;
    let startX = 0, startY = 0;

    container.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
    });

    window.addEventListener('mouseup', () => (isDragging = false));

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) {
            const rect = container.getBoundingClientRect();
            if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
                const normX = (e.clientX - rect.left) / rect.width - 0.5;
                const normY = (e.clientY - rect.top) / rect.height - 0.5;
                targetAngleY += normX * 0.05;
                targetAngleX = 0.25 + normY * 0.2;
            }
            return;
        }
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        startX = e.clientX;
        startY = e.clientY;
        targetAngleY += dx * 0.015;
        targetAngleX = Math.max(-0.2, Math.min(0.7, targetAngleX + dy * 0.015));
    });

    function render() {
        if (!document.getElementById('hero3dContainer')) return;

        const homeView = document.getElementById('view-home');
        if (homeView && homeView.classList.contains('active')) {
            angleY += (targetAngleY - angleY) * 0.08 + 0.005;
            angleX += (targetAngleX - angleX) * 0.08;

            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            const aspect = width / height;
            const fov = (45 * Math.PI) / 180;
            const f = 1.0 / Math.tan(fov / 2);
            const projMat = [
                f / aspect, 0, 0, 0,
                0, f, 0, 0,
                0, 0, -1.02, -1,
                0, 0, -0.4, 0
            ];

            const cosY = Math.cos(angleY), sinY = Math.sin(angleY);
            const cosX = Math.cos(angleX), sinX = Math.sin(angleX);

            const mvMat = [
                cosY, sinX * sinY, -cosX * sinY, 0,
                0, cosX, sinX, 0,
                sinY, -sinX * cosY, cosX * cosY, 0,
                0, -0.1, -2.6, 1
            ];

            gl.uniformMatrix4fv(uProj, false, new Float32Array(projMat));
            gl.uniformMatrix4fv(uMVP, false, new Float32Array(mvMat));
            gl.uniform3f(uLight, 2.0, 3.0, 2.0);
            gl.uniform3f(uColor, 0.06, 0.72, 0.50);

            gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
            gl.enableVertexAttribArray(aPos);
            gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, normBuf);
            gl.enableVertexAttribArray(aNorm);
            gl.vertexAttribPointer(aNorm, 3, gl.FLOAT, false, 0, 0);

            gl.drawArrays(gl.TRIANGLES, 0, positions.length / 3);
        }

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

function render2D3DFallback(canvas) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '64px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🥗', canvas.width / 2, canvas.height / 2);
}


/* =========================================================
   6. GLOBAL WINDOW EXPOSURE
========================================================= */

if (typeof window !== 'undefined') {
    window.escapeHtml = escapeHtml;
    window.escapeHTML = escapeHTML;
    window.debounce = debounce;
    window.normalize = normalize;
    window.futureDate = futureDate;
    window.daysLeft = daysLeft;
    window.formatNumber = formatNumber;
    window.setText = setText;
    window.toDateInputValue = toDateInputValue;
    window.recipeEmoji = recipeEmoji;
    window.expiryInfo = expiryInfo;
    window.foodEmoji = foodEmoji;
    window.showToast = showToast;
    window.buttonLoading = buttonLoading;
    window.showSkeleton = showSkeleton;
    window.renderEmpty = renderEmpty;
    window.renderError = renderError;
    window.apiRequest = apiRequest;
    window.drawLineChart = drawLineChart;
    window.loadStats = loadStats;
    window.renderStatsExtra = renderStatsExtra;
    window.init3DFeatures = init3DFeatures;
    window.init3DTilt = init3DTilt;
    window.trigger3DViewTransition = trigger3DViewTransition;
}
