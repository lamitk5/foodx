/**
 * =========================================================
 * FOODX - MODULE: CHAT (Giao diện hội thoại tương tác AI)
 * =========================================================
 */

var chatMode = 'chat';
var activeChatSessionId = null;
var chatSessionsCache = [];
var activeRecipeContext = (typeof window !== 'undefined' && window.activeRecipeContext) ? window.activeRecipeContext : null;
var cookingState = (typeof window !== 'undefined' && window.cookingState) ? window.cookingState : { recipeId: null, stepIndex: 0 };

// --- Banner & Context Chat ---
function updateChatContextBanner() {
    const banner = document.getElementById("chatContextBanner");
    if (!banner) return;

    if (!activeRecipeContext) {
        banner.classList.remove("show");
        banner.innerHTML = "";
        return;
    }

    let stepText = "";
    if (cookingState && cookingState.recipeId === activeRecipeContext.id && activeRecipeContext.steps) {
        stepText = ` • Bước ${cookingState.stepIndex + 1}/${activeRecipeContext.steps.length}`;
    }

    banner.innerHTML = `✦ Bạn đang hỏi về: <strong>${escapeHtml(activeRecipeContext.name || activeRecipeContext.title || '')}</strong>${stepText}`;
    banner.classList.add("show");
}

function openContextChat(type = "recipe") {
    const chatWindow = document.getElementById("chatWindow");
    const chatPanel = document.getElementById("chatPanel");

    if (chatPanel) {
        openChat(type === "step" ? "step" : "chat");
        updateChatContextBanner();
        return;
    }

    if (chatWindow) {
        chatWindow.classList.add("show");
        updateChatContextBanner();
        const input = document.getElementById("chatInput");
        setTimeout(() => input?.focus(), 120);

        if (type === "step" && cookingState && cookingState.recipeId) {
            const recipe = (typeof getRecipeById === 'function') ? getRecipeById(cookingState.recipeId) : activeRecipeContext;
            if (recipe && recipe.steps) {
                const step = recipe.steps[cookingState.stepIndex];
                addMsg(`Bạn đang ở bước ${cookingState.stepIndex + 1}: "${step}". Bạn chưa hiểu chỗ nào?`, "ai");
            }
        } else if (activeRecipeContext) {
            addMsg(`Tôi đang theo dõi công thức "${activeRecipeContext.name || activeRecipeContext.title}". Bạn muốn hỏi gì về món này?`, "ai");
        }
    }
}

function contextualRecipeAI(question) {
    if (!activeRecipeContext) return null;
    const text = (typeof normalize === 'function') ? normalize(question) : question.toLowerCase();
    const recipe = activeRecipeContext;
    let currentStep = null;

    if (cookingState && cookingState.recipeId === recipe.id && recipe.steps) {
        currentStep = recipe.steps[cookingState.stepIndex];
    }

    const recipeName = recipe.name || recipe.title || 'Món ăn';
    if (text.includes("nguyen lieu")) {
        const ings = Array.isArray(recipe.ingredients) ? recipe.ingredients.join(", ") : 'đầy đủ';
        return `${recipeName} cần: ${ings}.`;
    }
    if (text.includes("calo") || text.includes("kcal")) {
        return `${recipeName} được ước tính khoảng ${recipe.kcal || 350} kcal/khẩu phần.`;
    }
    if (text.includes("bao lau") || text.includes("may phut")) {
        return `Thời gian dự kiến của ${recipeName} là khoảng ${recipe.cookTime || recipe.time || 30} phút.`;
    }
    if (text.includes("khong co") || text.includes("thay bang") || text.includes("thay ")) {
        return `Bạn đang hỏi về ${recipeName}. Bạn có thể thay thế nguyên liệu tương đương hoặc ghi chú lại vào danh sách mua nhé.`;
    }
    if (text.includes("khong hieu") || text.includes("lam sao") || text.includes("lam nhu nao") || text.includes("nghia la gi")) {
        if (currentStep) {
            return `Bạn đang ở bước ${cookingState.stepIndex + 1}: "${currentStep}". Hãy nói cụ thể thao tác nào chưa hiểu để FoodX giải thích tiếp nhé.`;
        }
    }
    if (currentStep) {
        return `Bạn đang nấu "${recipeName}", bước ${cookingState.stepIndex + 1}: "${currentStep}".`;
    }
    return `Bạn đang hỏi về "${recipeName}". Tôi có thể hỗ trợ nguyên liệu, cách làm, calo và thời gian.`;
}

function fakeAI(question) {
    if (activeRecipeContext) {
        const answer = contextualRecipeAI(question);
        if (answer) return answer;
    }
    const text = (typeof normalize === 'function') ? normalize(question) : question.toLowerCase();

    if (text.includes("an gi") || text.includes("goi y") || text.includes("mon")) {
        if (typeof suggestedRecipes === 'function') {
            const best = suggestedRecipes()[0];
            if (best) return `FoodX gợi ý ${best.name || best.title}. Món này khoảng ${best.kcal || 350} kcal.`;
        }
        return "FoodX gợi ý bạn nấu Phở bò tái lăn hoặc Canh chua cá lóc giải nhiệt!";
    }
    if (text.includes("bmi") || text.includes("can nang")) {
        if (typeof state !== 'undefined' && state.profile && typeof calculateBMI === 'function') {
            const bmi = calculateBMI(state.profile.weight, state.profile.height);
            return `BMI hiện tại khoảng ${bmi.toFixed(1)}. Cân nặng ${state.profile.weight} kg, chiều cao ${state.profile.height} cm.`;
        }
    }
    if (text.includes("tu lanh")) {
        const count = (typeof state !== 'undefined' && Array.isArray(state.fridge)) ? state.fridge.length : 0;
        return `Tủ lạnh hiện có ${count} loại thực phẩm.`;
    }
    return "Tôi là Trợ lý AI của FoodX. Bạn có thể hỏi về món ăn, công thức, dinh dưỡng hoặc thực phẩm trong tủ lạnh.";
}

// --- Session & Multi-Session Management ---
function initChatForCurrentUser() {
    activeChatSessionId = null;
    chatSessionsCache = [];
    if (typeof isUserLoggedIn === 'function' && isUserLoggedIn()) {
        fetchChatSessions(false);
    }
}

function resetChatOnLogout() {
    activeChatSessionId = null;
    chatSessionsCache = [];
    const titleEl = document.getElementById('chatSessionTitle');
    if (titleEl) titleEl.innerText = 'Cuộc trò chuyện mới';
    const countEl = document.getElementById('chatSessionCount');
    if (countEl) countEl.innerText = '0';
    const body = document.getElementById('chatBody');
    if (body) body.innerHTML = '';
    const overlay = document.getElementById('chatSessionsOverlay');
    if (overlay) overlay.style.display = 'none';
}

function toggleChat() {
    const panel = document.getElementById('chatPanel');
    if (!panel) return;
    if (panel.classList.contains('open')) {
        closeChat();
    } else {
        openChat();
    }
}

async function openChat(mode) {
    if (typeof isUserLoggedIn === 'function' && !isUserLoggedIn()) {
        if (typeof requireAuth === 'function') requireAuth('chat');
        return;
    }

    if (mode) setMode(mode);
    const panel = document.getElementById('chatPanel');
    if (panel) panel.classList.add('open');
    const badge = document.getElementById('fabBadge');
    if (badge) badge.style.display = 'none';

    loadAiStatus();

    if (!activeChatSessionId) {
        await fetchChatSessions(true);
    }

    setTimeout(() => {
        const input = document.getElementById('chatInputFx');
        if (input) input.focus();
    }, 350);
}

function closeChat() {
    const panel = document.getElementById('chatPanel');
    if (panel) panel.classList.remove('open');
    toggleChatSessions(false);
}

function toggleChatMaximize() {
    const panel = document.getElementById('chatPanel');
    const btn = document.getElementById('chatMaximizeBtn');
    if (!panel) return;

    panel.classList.toggle('maximized');
    const isMax = panel.classList.contains('maximized');
    if (btn) {
        btn.innerHTML = isMax ? '❐' : '⛶';
        btn.title = isMax ? 'Thu nhỏ kích thước cũ' : 'Phóng to tối đa';
    }

    if (!isMax) {
        const savedW = localStorage.getItem('foodx_chat_width');
        const savedH = localStorage.getItem('foodx_chat_height');
        panel.style.width = savedW ? savedW + 'px' : '';
        panel.style.height = savedH ? savedH + 'px' : '';
    }
}

function initChatResizable() {
    const panel = document.getElementById('chatPanel');
    if (!panel) return;

    const savedW = localStorage.getItem('foodx_chat_width');
    const savedH = localStorage.getItem('foodx_chat_height');
    if (savedW && !panel.classList.contains('maximized')) {
        panel.style.width = Math.min(parseInt(savedW), window.innerWidth - 20) + 'px';
    }
    if (savedH && !panel.classList.contains('maximized')) {
        panel.style.height = Math.min(parseInt(savedH), window.innerHeight - 40) + 'px';
    }

    let startX = 0, startY = 0, startW = 0, startH = 0;
    let activeHandle = null;

    function onPointerDown(e, handleType) {
        if (panel.classList.contains('maximized')) return;
        activeHandle = handleType;
        const pt = e.touches ? e.touches[0] : e;
        startX = pt.clientX;
        startY = pt.clientY;
        startW = panel.offsetWidth;
        startH = panel.offsetHeight;

        panel.classList.add('resizing');
        document.addEventListener('mousemove', onPointerMove);
        document.addEventListener('mouseup', onPointerUp);
        document.addEventListener('touchmove', onPointerMove, { passive: false });
        document.addEventListener('touchend', onPointerUp);
        e.preventDefault();
    }

    function onPointerMove(e) {
        if (!activeHandle) return;
        const pt = e.touches ? e.touches[0] : e;
        if (!pt) return;

        const deltaX = startX - pt.clientX;
        const deltaY = startY - pt.clientY;

        const minW = 320;
        const maxW = window.innerWidth - 24;
        const minH = 400;
        const maxH = window.innerHeight - 40;

        if (activeHandle === 'left' || activeHandle === 'top-left') {
            const newW = Math.max(minW, Math.min(maxW, startW + deltaX));
            panel.style.width = newW + 'px';
            localStorage.setItem('foodx_chat_width', newW);
        }

        if (activeHandle === 'top' || activeHandle === 'top-left') {
            const newH = Math.max(minH, Math.min(maxH, startH + deltaY));
            panel.style.height = newH + 'px';
            localStorage.setItem('foodx_chat_height', newH);
        }

        if (e.cancelable) e.preventDefault();
    }

    function onPointerUp() {
        activeHandle = null;
        panel.classList.remove('resizing');
        document.removeEventListener('mousemove', onPointerMove);
        document.removeEventListener('mouseup', onPointerUp);
        document.removeEventListener('touchmove', onPointerMove);
        document.removeEventListener('touchend', onPointerUp);
    }

    document.getElementById('chatResizeLeft')?.addEventListener('mousedown', e => onPointerDown(e, 'left'));
    document.getElementById('chatResizeTop')?.addEventListener('mousedown', e => onPointerDown(e, 'top'));
    document.getElementById('chatResizeTopLeft')?.addEventListener('mousedown', e => onPointerDown(e, 'top-left'));

    document.getElementById('chatResizeLeft')?.addEventListener('touchstart', e => onPointerDown(e, 'left'), { passive: false });
    document.getElementById('chatResizeTop')?.addEventListener('touchstart', e => onPointerDown(e, 'top'), { passive: false });
    document.getElementById('chatResizeTopLeft')?.addEventListener('touchstart', e => onPointerDown(e, 'top-left'), { passive: false });
}

function setMode(m) {
    chatMode = m;
    const chatBtn = document.getElementById('modeChatBtn');
    const stepBtn = document.getElementById('modeStepBtn');
    if (chatBtn) chatBtn.classList.toggle('active', m === 'chat');
    if (stepBtn) stepBtn.classList.toggle('active', m === 'step');
}

async function fetchChatSessions(autoSelectLatest = false) {
    if (typeof isUserLoggedIn === 'function' && !isUserLoggedIn()) return;
    try {
        const token = (typeof getToken === 'function') ? getToken() : '';
        const res = await fetch('/api/chat/sessions', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (res.status === 401 || res.status === 403) {
            if (typeof setToken === 'function') setToken("");
            closeChat();
            if (typeof requireAuth === 'function') requireAuth('chat');
            return;
        }
        const j = await res.json();
        if (j && j.success && Array.isArray(j.data)) {
            chatSessionsCache = j.data;
            updateChatSessionToolbar();
            renderChatSessionsList();

            if (autoSelectLatest) {
                if (chatSessionsCache.length > 0 && !activeChatSessionId) {
                    await switchChatSession(chatSessionsCache[0].id);
                } else if (!activeChatSessionId) {
                    await createChatSession('Cuộc trò chuyện mới', chatMode, false);
                }
            }
        }
    } catch (err) {
        console.warn('Không tải được danh sách phiên chat:', err);
    }
}

function updateChatSessionToolbar() {
    const countEl = document.getElementById('chatSessionCount');
    if (countEl) countEl.innerText = String(chatSessionsCache.length);

    const titleEl = document.getElementById('chatSessionTitle');
    if (titleEl) {
        const cur = chatSessionsCache.find(s => s.id === activeChatSessionId);
        titleEl.innerText = cur ? cur.title : 'Cuộc trò chuyện mới';
    }
}

function renderChatSessionsList() {
    const listEl = document.getElementById('chatSessionsList');
    if (!listEl) return;

    if (!chatSessionsCache || chatSessionsCache.length === 0) {
        listEl.innerHTML = `
            <div class="session-empty-state">
                <div class="session-empty-icon">💬</div>
                <div>Chưa có phiên trò chuyện nào.</div>
                <div style="font-size:11.5px;margin-top:4px;color:var(--text-soft)">Bấm "➕ Phiên mới" để bắt đầu!</div>
            </div>
        `;
        return;
    }

    listEl.innerHTML = chatSessionsCache.map(s => {
        const isActive = s.id === activeChatSessionId;
        const timeStr = formatChatSessionTime(s.updatedAt || s.createdAt);
        const modeText = s.mode === 'step' ? '👨‍🍳 Từng bước' : '💬 Hỏi đáp';
        const escapedTitle = escapeHtml(s.title || 'Cuộc trò chuyện mới');

        return `
            <div class="session-item ${isActive ? 'active' : ''}" onclick="switchChatSession(${s.id})">
                <div class="session-item-main">
                    <div class="session-item-title" title="${escapedTitle}">${escapedTitle}</div>
                    <div class="session-item-meta">
                        <span class="session-mode-badge">${modeText}</span>
                        <span class="session-item-time">🕒 ${timeStr}</span>
                    </div>
                </div>
                <div class="session-item-actions" onclick="event.stopPropagation()">
                    <button class="session-action-btn" title="Đổi tên" onclick="renameChatSession(${s.id}, event)">✏️</button>
                    <button class="session-action-btn delete-btn" title="Xóa phiên" onclick="deleteChatSession(${s.id}, event)">🗑️</button>
                </div>
            </div>
        `;
    }).join('');
}

function formatChatSessionTime(isoDateStr) {
    if (!isoDateStr) return '';
    try {
        const d = new Date(isoDateStr);
        if (isNaN(d.getTime())) return '';
        const now = new Date();
        const diffMs = now - d;
        const diffMin = Math.floor(diffMs / 60000);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);

        if (diffMin < 1) return 'Vừa xong';
        if (diffMin < 60) return `${diffMin} phút trước`;
        if (diffHour < 24) return `${diffHour} giờ trước`;
        if (diffDay < 7) return `${diffDay} ngày trước`;
        
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    } catch (e) {
        return '';
    }
}

function toggleChatSessions(force) {
    const overlay = document.getElementById('chatSessionsOverlay');
    if (!overlay) return;

    if (typeof force === 'boolean') {
        overlay.style.display = force ? 'flex' : 'none';
    } else {
        const isOpen = overlay.style.display === 'flex';
        overlay.style.display = isOpen ? 'none' : 'flex';
    }

    if (overlay.style.display === 'flex') {
        fetchChatSessions(false);
    }
}

async function createChatSession(title, mode, showSuccessToast = true) {
    if (typeof isUserLoggedIn === 'function' && !isUserLoggedIn()) {
        if (typeof requireAuth === 'function') requireAuth('chat');
        return null;
    }

    const newTitle = title || 'Cuộc trò chuyện mới';
    const newMode = mode || chatMode || 'chat';
    const token = (typeof getToken === 'function') ? getToken() : '';

    try {
        const res = await fetch('/api/chat/sessions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ title: newTitle, mode: newMode })
        });
        if (res.status === 401 || res.status === 403) {
            if (typeof setToken === 'function') setToken("");
            closeChat();
            if (typeof requireAuth === 'function') requireAuth('chat');
            return null;
        }
        const j = await res.json();
        if (j && j.success && j.data) {
            const newSession = j.data;
            activeChatSessionId = newSession.id;
            
            chatSessionsCache = [newSession, ...chatSessionsCache.filter(s => s.id !== newSession.id)];
            updateChatSessionToolbar();
            renderChatSessionsList();

            const body = document.getElementById('chatBody');
            if (body) {
                body.innerHTML = '';
                addMsg('Chào bạn! Mình là <b>Trợ lý AI FoodX</b> 👋<br>Hai đứa mình cùng trò chuyện để lên kế hoạch bữa ăn & khám phá công thức chuẩn vị cho bạn nhé!', 'ai', null);
            }

            setMode(newSession.mode || 'chat');
            toggleChatSessions(false);

            if (showSuccessToast && typeof showToast === 'function') {
                showToast('Đã tạo phiên trò chuyện mới!', 'success');
            }
            return newSession;
        } else {
            if (typeof showToast === 'function') showToast(j?.message || 'Không thể tạo phiên mới', 'error');
        }
    } catch (err) {
        console.error('Lỗi tạo phiên chat:', err);
    }
    return null;
}

async function switchChatSession(sessionId) {
    if (!sessionId) return;
    if (typeof isUserLoggedIn === 'function' && !isUserLoggedIn()) {
        if (typeof requireAuth === 'function') requireAuth('chat');
        return;
    }

    activeChatSessionId = sessionId;
    toggleChatSessions(false);
    updateChatSessionToolbar();
    renderChatSessionsList();

    const body = document.getElementById('chatBody');
    if (body) {
        body.innerHTML = '<div style="text-align:center;padding:24px;color:var(--text-soft);font-size:12.5px;">⏳ Đang tải nội dung phiên...</div>';
    }

    try {
        const token = (typeof getToken === 'function') ? getToken() : '';
        const res = await fetch(`/api/chat/sessions/${sessionId}`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const j = await res.json();
        if (j && j.success && j.data) {
            const sessionData = j.data.session;
            const messages = j.data.messages || [];

            if (sessionData) {
                setMode(sessionData.mode || 'chat');
                const titleEl = document.getElementById('chatSessionTitle');
                if (titleEl) titleEl.innerText = sessionData.title || 'Cuộc trò chuyện mới';
            }

            if (body) {
                body.innerHTML = '';
                if (messages.length === 0) {
                    addMsg('Chào bạn! Mình là <b>Trợ lý AI FoodX</b> 👋<br>Hai đứa mình cùng trò chuyện để lên kế hoạch bữa ăn & khám phá công thức chuẩn vị cho bạn nhé!', 'ai', null);
                } else {
                    messages.forEach(m => {
                        if (m.role === 'user') {
                            addMsg(escapeHtml(m.content), 'user');
                        } else {
                            const formatted = m.content.includes('<') ? m.content : formatAiReply(m.content);
                            addMsg(formatted, 'ai', null, m.content);
                            if (m.steps && Array.isArray(m.steps) && m.steps.length > 0) {
                                addSteps(m.steps);
                            }
                        }
                    });
                }
                body.scrollTop = body.scrollHeight;
            }
        } else {
            if (typeof showToast === 'function') showToast(j?.message || 'Không thể tải phiên chat', 'error');
        }
    } catch (err) {
        console.error('Lỗi tải chi tiết phiên chat:', err);
        if (body) body.innerHTML = '<div class="msg ai error">Không tải được tin nhắn phiên này.</div>';
    }
}

function renameCurrentChatSession() {
    if (!activeChatSessionId) {
        if (typeof showToast === 'function') showToast('Chưa có phiên chat nào được chọn', 'warning');
        return;
    }
    renameChatSession(activeChatSessionId);
}

async function renameChatSession(sessionId, event) {
    if (event) event.stopPropagation();
    if (!sessionId) return;

    const cur = chatSessionsCache.find(s => s.id === sessionId);
    const oldTitle = cur ? cur.title : '';
    const newTitle = window.prompt('Nhập tiêu đề mới cho phiên trò chuyện:', oldTitle);

    if (newTitle === null) return;
    const trimmed = newTitle.trim();
    if (!trimmed) {
        if (typeof showToast === 'function') showToast('Tiêu đề không được để trống', 'warning');
        return;
    }

    try {
        const token = (typeof getToken === 'function') ? getToken() : '';
        const res = await fetch(`/api/chat/sessions/${sessionId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ title: trimmed })
        });
        const j = await res.json();
        if (j && j.success) {
            if (typeof showToast === 'function') showToast('Đã đổi tên phiên thành công', 'success');
            if (cur) cur.title = trimmed;
            updateChatSessionToolbar();
            renderChatSessionsList();
        } else {
            if (typeof showToast === 'function') showToast(j?.message || 'Không thể đổi tên phiên', 'error');
        }
    } catch (err) {
        console.error('Lỗi đổi tên phiên chat:', err);
        if (typeof showToast === 'function') showToast('Lỗi kết nối máy chủ', 'error');
    }
}

async function deleteChatSession(sessionId, event) {
    if (event) event.stopPropagation();
    if (!sessionId) return;

    const confirmed = window.confirm('Bạn có chắc chắn muốn xóa phiên trò chuyện này không? Toàn bộ tin nhắn trong phiên sẽ bị xóa.');
    if (!confirmed) return;

    try {
        const token = (typeof getToken === 'function') ? getToken() : '';
        const res = await fetch(`/api/chat/sessions/${sessionId}`, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const j = await res.json();
        if (j && j.success) {
            if (typeof showToast === 'function') showToast('Đã xóa phiên trò chuyện', 'success');
            chatSessionsCache = chatSessionsCache.filter(s => s.id !== sessionId);

            if (activeChatSessionId === sessionId) {
                if (chatSessionsCache.length > 0) {
                    await switchChatSession(chatSessionsCache[0].id);
                } else {
                    activeChatSessionId = null;
                    await createChatSession('Cuộc trò chuyện mới', chatMode, false);
                }
            } else {
                updateChatSessionToolbar();
                renderChatSessionsList();
            }
        } else {
            if (typeof showToast === 'function') showToast(j?.message || 'Không thể xóa phiên', 'error');
        }
    } catch (err) {
        console.error('Lỗi xóa phiên chat:', err);
        if (typeof showToast === 'function') showToast('Lỗi kết nối máy chủ', 'error');
    }
}

// --- Messages & Parser Helpers ---
function addMsg(text, who, cls, rawContent) {
    const body = document.getElementById('chatBody') || document.getElementById('chatMessages');
    if (!body) return null;
    const div = document.createElement('div');
    div.className = 'msg ' + who + (cls ? ' ' + cls : '');
    div.innerHTML = text;

    if (who === 'ai' && rawContent) {
        const lower = rawContent.toLowerCase();
        const hasRecipeOrDish = lower.includes('nguyên liệu') || lower.includes('cần chuẩn bị') || lower.includes('thành phần') 
            || lower.includes('cách làm') || lower.includes('hướng dẫn') || lower.includes('công thức') || lower.includes('bước 1')
            || rawContent.includes('- ') || rawContent.includes('* ') || rawContent.includes('|');

        if (hasRecipeOrDish) {
            const btnWrap = document.createElement('div');
            btnWrap.style.cssText = 'margin-top: 10px; display: flex; gap: 8px; flex-wrap: wrap; align-items: center;';

            // Lưu món vào Yêu thích
            const favBtn = document.createElement('button');
            favBtn.className = 'secondary-button ai-action-fav-btn';
            favBtn.style.cssText = 'padding: 6px 12px; font-size: 12px; border-radius: 8px; border: 1px solid #ef4444; color: #ef4444; background: rgba(239, 68, 68, 0.08); cursor: pointer; display: inline-flex; align-items: center; gap: 4px; font-weight: 600; transition: all 0.2s;';
            favBtn.innerHTML = '❤️ Lưu vào Yêu thích';
            favBtn.addEventListener('click', function () {
                saveAiRecipeToFavorites(rawContent, favBtn);
            });
            btnWrap.appendChild(favBtn);

            // Lưu vào Kho món ăn
            const recipeBtn = document.createElement('button');
            recipeBtn.className = 'secondary-button ai-action-recipe-btn';
            recipeBtn.style.cssText = 'padding: 6px 12px; font-size: 12px; border-radius: 8px; border: 1px solid var(--green); color: #fff; background: var(--green); cursor: pointer; display: inline-flex; align-items: center; gap: 4px; font-weight: 600; transition: all 0.2s;';
            recipeBtn.innerHTML = '📖 Lưu vào Kho món ăn';
            recipeBtn.addEventListener('click', function () {
                saveAiRecipeToCookbook(rawContent, recipeBtn);
            });
            btnWrap.appendChild(recipeBtn);

            // Thêm vào Danh sách mua
            if (lower.includes('nguyên liệu') || lower.includes('thành phần') || lower.includes('chuẩn bị') || rawContent.includes('- ') || rawContent.includes('* ')) {
                const shopBtn = document.createElement('button');
                shopBtn.className = 'secondary-button ai-action-shop-btn';
                shopBtn.style.cssText = 'padding: 6px 12px; font-size: 12px; border-radius: 8px; border: 1px solid var(--border); color: var(--text); background: var(--card); cursor: pointer; display: inline-flex; align-items: center; gap: 4px; font-weight: 600; transition: all 0.2s;';
                shopBtn.innerHTML = '🛒 Thêm vào Danh sách mua';
                shopBtn.addEventListener('click', function () {
                    addAiIngredientsToShopping(rawContent);
                });
                btnWrap.appendChild(shopBtn);
            }

            div.appendChild(btnWrap);
        }
    }

    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
    return div;
}

function addChatMessage(text, sender) {
    addMsg(text, sender);
}

function addSteps(steps) {
    const body = document.getElementById('chatBody') || document.getElementById('chatMessages');
    if (!body || !steps || !steps.length) return;
    const card = document.createElement('div');
    card.className = 'steps-card';
    card.innerHTML = '<div class="steps-title">📋 Các bước thực hiện</div>' +
        steps.map((s, i) => '<div class="step"><b>' + (i + 1) + '.</b>' + escapeHtml(s) + '</div>').join('');
    body.appendChild(card);
    body.scrollTop = body.scrollHeight;
}

function typing(on) {
    const body = document.getElementById('chatBody');
    if (!body) return;
    if (on) {
        const t = document.createElement('div');
        t.className = 'typing';
        t.id = 'typingInd';
        t.innerHTML = '<span></span><span></span><span></span>';
        body.appendChild(t);
        body.scrollTop = body.scrollHeight;
    } else {
        const t = document.getElementById('typingInd');
        if (t) t.remove();
    }
}

function formatAiReply(text) {
    if (!text) return '';

    let html = String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    const lines = html.split('\n');
    let inTable = false;
    let tableHtml = '';
    let parsedLines = [];

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (line.startsWith('|') && line.endsWith('|')) {
            if (line.includes('---')) continue;
            const cells = line.split('|').filter(function(_, idx, arr) { return idx > 0 && idx < arr.length - 1; });
            if (!inTable) {
                inTable = true;
                tableHtml = '<table class="ai-table"><thead><tr>' + cells.map(function(c) { return '<th>' + c.trim() + '</th>'; }).join('') + '</tr></thead><tbody>';
            } else {
                tableHtml += '<tr>' + cells.map(function(c) { return '<td>' + c.trim() + '</td>'; }).join('') + '</tr>';
            }
        } else {
            if (inTable) {
                inTable = false;
                tableHtml += '</tbody></table>';
                parsedLines.push(tableHtml);
                tableHtml = '';
            }
            parsedLines.push(line);
        }
    }
    if (inTable) {
        tableHtml += '</tbody></table>';
        parsedLines.push(tableHtml);
    }

    html = parsedLines.join('\n');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/^### (.*$)/gim, '<h4 class="ai-heading">$1</h4>');
    html = html.replace(/^## (.*$)/gim, '<h3 class="ai-heading">$1</h3>');
    html = html.replace(/^# (.*$)/gim, '<h2 class="ai-heading">$1</h2>');
    html = html.replace(/^&gt;\s?(.*$)/gim, '<blockquote class="ai-quote">$1</blockquote>');
    html = html.replace(/^\d+\.\s+(.*$)/gim, '<div class="ai-step-item">$1</div>');
    html = html.replace(/^[-*]\s+(.*$)/gim, '<div class="ai-bullet-item">$1</div>');
    html = html.replace(/\n/g, '<br>');
    html = html.replace(/<br><br>/g, '<br>');

    return html;
}

// --- Send & AI Network Calls ---
async function sendMessage() {
    const input = document.getElementById('chatInputFx') || document.getElementById('chatInput');
    if (!input) return;
    const msg = (input.value || '').trim();
    if (!msg) {
        if (typeof showToast === 'function') {
            showToast('Vui lòng nhập nội dung câu hỏi!', 'warning');
        }
        input.value = '';
        input.focus();
        return;
    }
    input.value = '';
    doSend(msg);
}

function sendChat() {
    sendMessage();
}

async function doSend(msg) {
    if (typeof isUserLoggedIn === 'function' && !isUserLoggedIn()) {
        if (typeof requireAuth === 'function') requireAuth('chat');
        return;
    }

    addMsg(escapeHtml(msg), 'user');
    typing(true);
    const btn = document.getElementById('chatSendBtn') || document.getElementById('sendChat');
    if (btn) btn.disabled = true;

    let ings = [];
    if (window.fridgeItemsCache && Array.isArray(window.fridgeItemsCache)) {
        ings = window.fridgeItemsCache.map(function(i) { return i.ingredientName || i.name; }).filter(Boolean);
    } else if (typeof state !== 'undefined' && Array.isArray(state.fridge)) {
        ings = state.fridge.map(f => f.name).filter(Boolean);
    }

    try {
        if (!activeChatSessionId) {
            const newS = await createChatSession(msg.length > 40 ? msg.substring(0, 40) + '…' : msg, chatMode, false);
            if (!newS) {
                typing(false);
                return;
            }
        }

        const token = (typeof getToken === 'function') ? getToken() : '';
        const res = await fetch(`/api/chat/sessions/${activeChatSessionId}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ message: msg, mode: chatMode, availableIngredients: ings })
        });

        if (res.status === 401 || res.status === 403) {
            if (typeof setToken === 'function') setToken("");
            typing(false);
            closeChat();
            if (typeof requireAuth === 'function') requireAuth('chat');
            return;
        }

        const j = await res.json();
        typing(false);

        if (j && j.success && j.data) {
            const replyText = j.data.reply || '';
            addMsg(formatAiReply(replyText), 'ai', null, replyText);
            if (j.data.steps && j.data.steps.length) {
                addSteps(j.data.steps);
            }
            fetchChatSessions(false);
        } else {
            if (typeof showToast === 'function') showToast(j?.message || 'Có lỗi khi xử lý tin nhắn từ AI', 'error');
        }
    } catch (err) {
        typing(false);
        console.warn('Lỗi gửi tin nhắn AI:', err);
        if (typeof showToast === 'function') showToast('Không thể kết nối đến máy chủ AI', 'error');
    } finally {
        if (btn) btn.disabled = false;
        const input = document.getElementById('chatInputFx') || document.getElementById('chatInput');
        if (input) input.focus();
    }
}

function heroSearchSubmit(e) {
    if (e) e.preventDefault();
    if (typeof isUserLoggedIn === 'function' && !isUserLoggedIn()) {
        if (typeof requireAuth === 'function') requireAuth('chat');
        return false;
    }
    const input = document.getElementById('heroSearchInput') || document.getElementById('heroSearchInputApp');
    if (!input) return false;
    const val = input.value.trim();
    if (!val) {
        if (typeof showToast === 'function') showToast('Bạn muốn ăn gì? Hãy gõ nguyên liệu hoặc tên món vào ô tìm kiếm nhé 😉', 'info');
        return false;
    }
    openChat();
    doSend(val);
    return false;
}

function askFromTag(q) {
    if (typeof isUserLoggedIn === 'function' && !isUserLoggedIn()) {
        if (typeof requireAuth === 'function') requireAuth('chat');
        return;
    }
    openChat();
    doSend(q);
}

async function loadAiStatus() {
    const statusText = document.getElementById('chatStatusText');
    const dot = document.getElementById('chatDot');
    const setUi = (mock, provider, message) => {
        if (statusText) {
            if (mock) {
                statusText.textContent = 'AI: Mock Mode • Sẵn sàng';
            } else if (provider === 'groq') {
                statusText.textContent = 'AI: Groq Llama-3.3 • Trực tuyến';
            } else if (provider === 'gemini') {
                statusText.textContent = 'AI: Gemini 1.5 • Trực tuyến';
            } else {
                statusText.textContent = `AI: ${provider || 'Trực tuyến'}`;
            }
            if (message) statusText.title = message;
        }
        if (dot) dot.classList.toggle('live', !mock);
    };

    setUi(true, 'mock');

    try {
        const res = await fetch('/api/ai/status');
        if (res.ok) {
            const j = await res.json();
            if (j && j.success && j.data) {
                const provider = (j.data.provider || '').toLowerCase();
                const isMock = !!j.data.mock || provider === 'mock';
                setUi(isMock, provider, j.data.message);
            }
        }
    } catch (e) {
        setUi(true, 'mock');
    }
}

// --- Quick Recipe / Ingredient Exporters from AI message ---
async function saveAiRecipeToFavorites(rawContent, btnElement) {
    if (typeof isUserLoggedIn === 'function' && !isUserLoggedIn()) {
        if (typeof requireAuth === 'function') requireAuth('favorite');
        return;
    }
    const origText = btnElement ? btnElement.innerHTML : '';
    if (btnElement) {
        btnElement.innerHTML = '⏳ Đang lưu...';
        btnElement.disabled = true;
    }
    if (typeof showToast === 'function') showToast('Đang lưu món vào danh sách yêu thích...', 'info');

    try {
        const res = await apiRequest('/api/recipes/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: rawContent })
        });

        if (res && res.id) {
            const recipeId = res.id;
            const title = res.title || 'Món ăn gợi ý';

            try {
                await apiRequest('/api/favorites/toggle', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ targetId: recipeId, targetType: 'RECIPE' })
                });
            } catch (_) {}

            if (typeof state !== 'undefined' && Array.isArray(state.favorites)) {
                if (!state.favorites.includes(recipeId) && !state.favorites.includes(String(recipeId))) {
                    state.favorites.push(recipeId);
                }
            }

            if (typeof savedPostsState !== 'undefined') {
                savedPostsState[String(recipeId)] = {
                    id: recipeId,
                    title: title,
                    imageUrl: res.imageUrl || '',
                    cookTime: res.cookTime || 30,
                    kcal: res.kcal || 350,
                    description: res.description || '',
                    ingredients: res.ingredients || [],
                    instructions: res.instructions || '',
                    steps: res.steps || [],
                    savedAt: new Date().toISOString()
                };
                localStorage.setItem('foodx_saved_posts', JSON.stringify(savedPostsState));
            }
            if (typeof saveState === 'function') saveState();

            if (btnElement) {
                btnElement.innerHTML = '❤️ Đã lưu Yêu thích';
                btnElement.style.background = '#ef4444';
                btnElement.style.color = '#fff';
                btnElement.style.borderColor = '#ef4444';
                btnElement.disabled = false;
            }

            if (typeof showToast === 'function') showToast(`Đã lưu "${title}" vào Danh sách Yêu thích! ❤️`, 'success');
            if (typeof renderFavorites === 'function') await renderFavorites();
            if (typeof renderRecipes === 'function') renderRecipes();
        } else {
            if (typeof showToast === 'function') showToast('Đã lưu vào danh sách yêu thích thành công! ❤️', 'success');
        }
    } catch (err) {
        console.error('Lỗi lưu món AI vào yêu thích:', err);
        if (typeof showToast === 'function') showToast('Không thể lưu món: ' + (err.message || 'Lỗi xử lý dữ liệu'), 'error');
        if (btnElement) {
            btnElement.innerHTML = origText || '❤️ Lưu vào Yêu thích';
            btnElement.disabled = false;
        }
    }
}

async function saveAiRecipeToCookbook(rawContent, btnElement) {
    if (typeof isUserLoggedIn === 'function' && !isUserLoggedIn()) {
        if (typeof requireAuth === 'function') requireAuth('recipes');
        return;
    }
    const origText = btnElement ? btnElement.innerHTML : '';
    if (btnElement) {
        btnElement.innerHTML = '⏳ Đang lưu...';
        btnElement.disabled = true;
    }
    if (typeof showToast === 'function') showToast('Đang phân tích và lưu công thức vào kho...', 'info');
    try {
        const res = await apiRequest('/api/recipes/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: rawContent })
        });
        if (res && res.id) {
            if (typeof showToast === 'function') showToast(`Đã lưu công thức "${res.title}" vào Kho món ăn! 🎉`, 'success');
            if (btnElement) {
                btnElement.innerHTML = '📖 Đã lưu Kho món';
                btnElement.style.background = '#059669';
                btnElement.disabled = false;
            }
            if (typeof loadRecipes === 'function') loadRecipes();
        } else {
            if (typeof showToast === 'function') showToast('Đã lưu công thức thành công! 🎉', 'success');
        }
    } catch (err) {
        if (typeof showToast === 'function') showToast('Không thể lưu công thức: ' + (err.message || 'Lỗi xử lý dữ liệu'), 'error');
        if (btnElement) {
            btnElement.innerHTML = origText || '📖 Lưu vào Kho món ăn';
            btnElement.disabled = false;
        }
    }
}

const ACTION_VERBS = [
    'đun', 'nấu', 'hầm', 'nêm', 'luộc', 'xào', 'chiên', 'rán', 'nướng', 'vớt', 'rửa',
    'cắt', 'thái', 'băm', 'ướp', 'trộn', 'khuấy', 'đổ', 'cho', 'thêm', 'giảm', 'bật',
    'tắt', 'dùng', 'sau khi', 'khi', 'để nguội', 'bày', 'múc', 'trụng', 'chần', 'phi',
    'rang', 'hấp', 'kho', 'om', 'xé', 'bóc', 'ngâm', 'chặt'
];

function isProceduralAction(text) {
    if (!text) return true;
    const lower = text.toLowerCase().trim();
    if (lower.length > 65) return true;
    for (let i = 0; i < ACTION_VERBS.length; i++) {
        const v = ACTION_VERBS[i];
        if (lower.startsWith(v + ' ') || lower === v) return true;
    }
    const badPhrases = [
        'đun sôi', 'đun nhẹ', 'lọc bỏ', 'vớt ra', 'rửa nhanh', 'chặt khúc', 'phi thơm',
        'để ráo', 'vừa ăn', 'tùy vào', 'trong 2-3 tiếng', 'cho vào nồi', 'tránh làm',
        'giữ lại', 'thành lửa nhỏ', 'sơ chế', 'thực hiện', 'bước', 'cách làm'
    ];
    for (let i = 0; i < badPhrases.length; i++) {
        if (lower.includes(badPhrases[i])) return true;
    }
    return false;
}

function isQuantityString(s) {
    if (!s) return false;
    const l = String(s).toLowerCase().trim();
    if (['vừa đủ', 'tùy thích', 'tùy khẩu vị', 'nêm nếm', '1 ít', 'ít'].some(q => l.includes(q))) return true;
    if (/\d/.test(l) && /(g|kg|gr|gram|ml|l|lít|lit|quả|trái|củ|nhánh|cây|muỗng|thìa|bát|chén|gói|tép|lát|lon|hộp|miếng|bó|bắp|con|khúc|nhúm|thìa cà phê|muỗng canh)/i.test(l)) return true;
    if (/^\d+(\s*[\.,\/]\s*\d+)?\s*(g|kg|gr|gram|ml|l|lít|lit|quả|trái|củ|nhánh|cây|muỗng|thìa|bát|chén|gói|tép|lát|lon|hộp|miếng|bó|bắp|con|khúc|phần)?$/i.test(l)) return true;
    return false;
}

function cleanPureName(name) {
    if (!name) return '';
    let clean = String(name).trim();
    clean = clean.replace(/[\*_~`]+/g, ' ');
    clean = clean.replace(/[\/\\#=\-]+/g, ' ');
    clean = clean.replace(/^\d+[\.\)\:\-]\s*/, '');
    clean = clean.replace(/^[•\+\-\*\.\,\:]+\s*/, '');
    clean = clean.replace(/[•\+\-\*\.\,\:\/\\#_]+$/, '');
    clean = clean.replace(/\s+/g, ' ').trim();
    if (clean.length > 0) clean = clean.charAt(0).toUpperCase() + clean.slice(1);
    return clean;
}

function cleanPureQuantity(qty) {
    if (!qty) return '1 phần';
    let clean = String(qty).trim();
    clean = clean.replace(/[\*_~`]+/g, ' ');
    clean = clean.replace(/[\/\\#=\-]+/g, ' ');
    const m = clean.match(/^([\d\.,\/\s]+(?:kg|g|gr|gram|ml|l|lít|lit|quả|trái|củ|nhánh|cây|muỗng|thìa|bát|chén|gói|tép|lát|lon|hộp|miếng|bó|bắp|con|khúc|thìa cà phê|muỗng canh|vừa đủ|tùy thích|ít)?)\b/i);
    if (m && m[1] && m[1].trim()) clean = m[1].trim();
    clean = clean.replace(/\s+/g, ' ').trim();
    return clean || '1 phần';
}

function parseIngredientFromText(rawLine) {
    if (!rawLine) return null;
    let line = String(rawLine).trim();
    line = line.replace(/[\*_~`]+/g, ' ').replace(/[\/\\#=\-]+/g, ' ').replace(/\s+/g, ' ').trim();
    line = line.replace(/^\d+[\.\)\:\-]\s*/, '').replace(/^[•\+\-\*\.\,\:]+\s*/, '').trim();

    if (!line || line.length < 2 || line.length > 80) return null;
    const lower = line.toLowerCase();
    const blacklist = [
        'nguyên liệu', 'thành phần', 'cần chuẩn bị', 'hướng dẫn', 'cách làm',
        'các bước', 'thực hiện', 'bước ', 'chúc bạn', 'thưởng thức', 'lưu ý',
        'sơ chế', 'chế biến', 'thời gian', 'khẩu phần', 'dinh dưỡng', 'calo',
        'kcal', 'công thức', 'mẹo nhỏ', 'bảo quản', 'ngon miệng', 'dưới đây là',
        'lợi ích', 'chất béo', 'vitamin', 'omega', 'protein', 'khoáng chất'
    ];
    if (blacklist.some(kw => lower.includes(kw))) return null;
    if (isProceduralAction(line)) return null;

    let name = line;
    let quantity = '1 phần';

    const mParen = line.match(/^(.*?)\s*[\(\[]([^\)\]]+)[\)\]]$/);
    if (mParen && mParen[1].trim().length >= 2) {
        name = mParen[1].trim();
        quantity = mParen[2].trim();
    } else if (line.includes(':')) {
        const parts = line.split(':');
        const p1 = parts[0].trim();
        const p2 = parts.slice(1).join(':').trim();
        if (p1 && p2) {
            if (isQuantityString(p2)) {
                name = p1;
                quantity = p2;
            } else {
                name = p2;
                quantity = p1;
            }
        }
    } else {
        const mStart = line.match(/^(\d+(?:[\.,\/]\d+)?\s*(?:kg|g|gr|gram|ml|l|lít|lit|quả|trái|củ|nhánh|cây|muỗng|thìa|bát|chén|gói|tép|lát|lon|hộp|miếng|bó|bắp|con)?)\s+(.*)$/i);
        if (mStart && mStart[1] && mStart[2] && mStart[2].trim().length >= 2) {
            quantity = mStart[1].trim();
            name = mStart[2].trim();
        } else {
            const mEnd = line.match(/^(.*?)\s+(\d+(?:[\.,\/]\d+)?\s*(?:kg|g|gr|gram|ml|l|lít|lit|quả|trái|củ|nhánh|cây|muỗng|thìa|bát|chén|gói|tép|lát|lon|hộp|miếng|bó|bắp|con))$/i);
            if (mEnd && mEnd[1] && mEnd[2] && mEnd[1].trim().length >= 2) {
                name = mEnd[1].trim();
                quantity = mEnd[2].trim();
            }
        }
    }

    name = cleanPureName(name);
    quantity = cleanPureQuantity(quantity);
    if (isProceduralAction(name)) return null;
    if (!name || name.length < 2) return null;
    return { name: name, quantity: quantity || '1 phần' };
}

async function addAiIngredientsToShopping(rawContent) {
    if (typeof isUserLoggedIn === 'function' && !isUserLoggedIn()) {
        if (typeof requireAuth === 'function') requireAuth('shopping');
        return;
    }
    const lines = String(rawContent || '').split('\n');
    const itemsToAdd = [];
    let isIngSection = false;
    let hasExplicitSection = false;

    for (const line of lines) {
        const l = line.toLowerCase();
        if (l.includes('nguyên liệu') || l.includes('thành phần') || l.includes('chuẩn bị') || l.includes('gia vị cần')) {
            hasExplicitSection = true;
            break;
        }
    }

    for (const rawLine of lines) {
        const lineClean = rawLine.trim();
        if (!lineClean) continue;
        const lower = lineClean.toLowerCase();

        if (lower.includes('nguyên liệu') || lower.includes('thành phần') || lower.includes('chuẩn bị')) {
            isIngSection = true;
            continue;
        }
        if (isIngSection && (lower.includes('hướng dẫn') || lower.includes('cách làm') || lower.includes('các bước') || lower.includes('thực hiện') || lower.includes('bước 1') || lower.includes('bước 2') || lower.includes('bước 3') || lower.includes('sơ chế') || lower.includes('chế biến') || lower.includes('thành phẩm') || lower.includes('thưởng thức') || lower.includes('lưu ý') || lower.includes('chúc bạn'))) {
            isIngSection = false;
            break;
        }

        if (hasExplicitSection && !isIngSection) continue;

        if (lineClean.startsWith('|') && lineClean.endsWith('|')) {
            if (lineClean.includes('---')) continue;
            const cells = lineClean.split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
            if (['nguyên liệu', 'định lượng', 'thành phần', 'số lượng', 'đơn vị', 'lợi ích', 'dinh dưỡng', 'ghi chú', 'bước', 'thao tác', 'hướng dẫn'].some(h => lower.includes(h))) {
                continue;
            }
            const nonEmpty = cells.filter(Boolean);
            if (!nonEmpty.length) continue;

            let name = '', qty = '1 phần';
            if (nonEmpty.length === 1) {
                name = nonEmpty[0];
            } else if (nonEmpty.length === 2) {
                if (isQuantityString(nonEmpty[0]) && !isQuantityString(nonEmpty[1])) {
                    qty = nonEmpty[0];
                    name = nonEmpty[1];
                } else {
                    name = nonEmpty[0];
                    qty = nonEmpty[1];
                }
            } else {
                const c0 = nonEmpty[0], c1 = nonEmpty[1], c2 = nonEmpty[2];
                if (isQuantityString(c1)) {
                    name = c0;
                    qty = c1;
                } else if (isQuantityString(c2)) {
                    name = c1;
                    qty = c2;
                } else {
                    name = c0;
                    qty = c1;
                }
            }

            name = cleanPureName(name);
            qty = cleanPureQuantity(qty);
            if (isProceduralAction(name)) continue;

            if (name && name.length >= 2) {
                if (!itemsToAdd.some(i => i.name.toLowerCase() === name.toLowerCase())) {
                    itemsToAdd.push({ name: name, quantity: qty || '1 phần' });
                }
            }
            continue;
        }

        const parsed = parseIngredientFromText(lineClean);
        if (parsed && parsed.name) {
            if (!itemsToAdd.some(i => i.name.toLowerCase() === parsed.name.toLowerCase())) {
                itemsToAdd.push(parsed);
            }
        }
    }

    if (itemsToAdd.length === 0) {
        if (typeof showToast === 'function') showToast('Không tìm thấy dòng nguyên liệu phù hợp trong tin nhắn.', 'warning');
        return;
    }

    let addedCount = 0;
    for (const item of itemsToAdd) {
        try {
            await apiRequest('/api/shopping', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: item.name, quantity: item.quantity, price: 0, category: 'AI Gợi ý' })
            });
            addedCount++;
        } catch (_) {}
    }

    if (typeof renderShopping === 'function') await renderShopping();

    if (addedCount > 0) {
        if (typeof showToast === 'function') showToast(`Đã thêm ${addedCount} nguyên liệu sạch vào Danh sách mua 🛒`, 'success');
    } else {
        if (typeof showToast === 'function') showToast('Không thể thêm nguyên liệu vào danh sách mua.', 'error');
    }
}

// --- Module Initializer ---
(function initChatModule() {
    const body = document.getElementById('chatBody');
    if (body && !body.childElementCount) {
        addMsg('Chào bạn! Mình là <b>Trợ lý AI FoodX</b> 👋<br>Hỏi mình bất cứ điều gì về nấu nướng — công thức, mẹo hay gợi ý món ăn nhé!', 'ai');
    }
    loadAiStatus();
    initChatResizable();

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeChat();
    });

    document.getElementById('chatSendBtn')?.addEventListener('click', sendMessage);
    document.getElementById('sendChat')?.addEventListener('click', sendMessage);
    document.getElementById('chatInputFx')?.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage();
        }
    });

    document.getElementById('chatCloseBtn')?.addEventListener('click', closeChat);
    document.getElementById('closeChat')?.addEventListener('click', closeChat);
    document.getElementById('chatMaximizeBtn')?.addEventListener('click', toggleChatMaximize);
    document.getElementById('chatFloating')?.addEventListener('click', toggleChat);

    const newBtn = document.getElementById('chatNewSession');
    if (newBtn) {
        newBtn.addEventListener('click', function (e) {
            e.preventDefault();
            createChatSession('Cuộc trò chuyện mới', chatMode || 'chat', true);
        });
    }

    document.getElementById('modeChatBtn')?.addEventListener('click', () => setMode('chat'));
    document.getElementById('modeStepBtn')?.addEventListener('click', () => setMode('step'));
})();

// Window Exports
if (typeof window !== 'undefined') {
    window.addChatMessage = addChatMessage;
    window.updateChatContextBanner = updateChatContextBanner;
    window.openContextChat = openContextChat;
    window.contextualRecipeAI = contextualRecipeAI;
    window.fakeAI = fakeAI;
    window.sendMessage = sendMessage;
    window.sendChat = sendChat;
    window.doSend = doSend;
    window.toggleChat = toggleChat;
    window.openChat = openChat;
    window.closeChat = closeChat;
    window.toggleChatMaximize = toggleChatMaximize;
    window.setMode = setMode;
    window.initChatForCurrentUser = initChatForCurrentUser;
    window.resetChatOnLogout = resetChatOnLogout;
    window.fetchChatSessions = fetchChatSessions;
    window.createChatSession = createChatSession;
    window.switchChatSession = switchChatSession;
    window.renameChatSession = renameChatSession;
    window.renameCurrentChatSession = renameCurrentChatSession;
    window.deleteChatSession = deleteChatSession;
    window.toggleChatSessions = toggleChatSessions;
    window.formatChatSessionTime = formatChatSessionTime;
    window.heroSearchSubmit = heroSearchSubmit;
    window.askFromTag = askFromTag;
    window.loadAiStatus = loadAiStatus;
    window.saveAiRecipeToFavorites = saveAiRecipeToFavorites;
    window.saveAiRecipeToCookbook = saveAiRecipeToCookbook;
    window.addAiIngredientsToShopping = addAiIngredientsToShopping;
}
