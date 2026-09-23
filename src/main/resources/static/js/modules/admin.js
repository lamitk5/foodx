/* ==========================================================
   ADMIN MANAGEMENT MODULE — FoodX
========================================================== */

let adminUsersCache = [];
let adminIngredientsCache = [];
let adminRecipesCache = [];
let adminSocialCache = [];
let currentAdminTab = 'users';

async function loadAdminDashboard() {
    let isAdmin = Boolean(window.authState && (window.authState.role === 'ADMIN' || window.authState.username === 'admin'));
    if (!isAdmin) {
        try {
            const token = typeof getToken === 'function' ? getToken() : localStorage.getItem('foodx_token');
            if (token) {
                const parts = token.split('.');
                if (parts.length === 3) {
                    const p = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
                    if (p.role === 'ADMIN' || p.sub === 'admin') {
                        isAdmin = true;
                        if (window.authState) window.authState.role = 'ADMIN';
                    }
                }
            }
        } catch (_) {}
    }
    if (!isAdmin) {
        showToast('Bạn không có quyền truy cập trang Quản trị', 'error');
        if (typeof openView === 'function') openView('home');
        return;
    }

    // Load stats concurrently
    try {
        const [usersRes, ingsRes, recipesRes, postsRes] = await Promise.allSettled([
            apiCall('/api/admin/users'),
            apiCall('/api/ingredients'),
            apiCall('/api/recipes'),
            apiCall('/api/social/posts')
        ]);

        if (usersRes.status === 'fulfilled' && usersRes.value) {
            adminUsersCache = Array.isArray(usersRes.value) ? usersRes.value : (usersRes.value.data || []);
            const uEl = document.getElementById('adminStatUsers');
            if (uEl) uEl.textContent = adminUsersCache.length;
        }

        if (ingsRes.status === 'fulfilled' && ingsRes.value) {
            adminIngredientsCache = Array.isArray(ingsRes.value) ? ingsRes.value : (ingsRes.value.data || []);
            const iEl = document.getElementById('adminStatIngredients');
            if (iEl) iEl.textContent = adminIngredientsCache.length;
        }

        if (recipesRes.status === 'fulfilled' && recipesRes.value) {
            adminRecipesCache = Array.isArray(recipesRes.value) ? recipesRes.value : (recipesRes.value.data || []);
            const rEl = document.getElementById('adminStatRecipes');
            if (rEl) rEl.textContent = adminRecipesCache.length;
        }

        if (postsRes.status === 'fulfilled' && postsRes.value) {
            adminSocialCache = Array.isArray(postsRes.value) ? postsRes.value : (postsRes.value.data || []);
            const pEl = document.getElementById('adminStatSocial');
            if (pEl) pEl.textContent = adminSocialCache.length;
        }

        renderCurrentAdminTab();
    } catch (err) {
        console.error('Error loading admin dashboard:', err);
    }
}

function switchAdminTab(tabName) {
    currentAdminTab = tabName;
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    document.querySelectorAll('.admin-tab-pane').forEach(pane => {
        pane.classList.toggle('active', pane.id === 'adminTab-' + tabName);
    });
    renderCurrentAdminTab();
}

function renderCurrentAdminTab() {
    if (currentAdminTab === 'users') {
        renderAdminUsers();
    } else if (currentAdminTab === 'ingredients') {
        renderAdminIngredients();
    } else if (currentAdminTab === 'recipes') {
        renderAdminRecipes();
    } else if (currentAdminTab === 'social') {
        renderAdminSocial();
    }
}

/* ==========================================================
   1. USER MANAGEMENT
========================================================== */

async function reloadAdminUsers() {
    try {
        const res = await apiCall('/api/admin/users');
        adminUsersCache = Array.isArray(res) ? res : (res?.data || []);
        const uEl = document.getElementById('adminStatUsers');
        if (uEl) uEl.textContent = adminUsersCache.length;
        renderAdminUsers();
    } catch (err) {
        showToast('Lỗi tải danh sách người dùng: ' + err.message, 'error');
    }
}

function renderAdminUsers() {
    const tbody = document.getElementById('adminUserTableBody');
    if (!tbody) return;

    const q = (document.getElementById('adminUserSearch')?.value || '').toLowerCase().trim();
    const roleFilter = document.getElementById('adminUserRoleFilter')?.value || 'ALL';

    const filtered = adminUsersCache.filter(u => {
        const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
        const matchQ = !q ||
            (u.username && u.username.toLowerCase().includes(q)) ||
            (u.email && u.email.toLowerCase().includes(q)) ||
            (u.fullName && u.fullName.toLowerCase().includes(q));
        return matchRole && matchQ;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:32px; color:var(--text-soft);">Không tìm thấy người dùng phù hợp.</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map(u => {
        const isSelf = window.authState && window.authState.userId === u.id;
        const dateStr = u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : '—';
        const roleClass = u.role === 'ADMIN' ? 'admin-role-admin' : 'admin-role-user';
        const avatar = u.avatarUrl || '/images/avatars/default-avatar.svg';

        return `
            <tr>
                <td><strong>#${u.id}</strong></td>
                <td>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <img src="${avatar}" alt="${escapeHtml(u.fullName)}" class="admin-avatar" onerror="this.src='/images/avatars/default-avatar.svg'">
                        <div>
                            <strong style="display:block; font-size:13.5px;">${escapeHtml(u.fullName || u.username)}</strong>
                            ${isSelf ? '<span style="font-size:11px; color:var(--green); font-weight:700;">(Tài khoản của bạn)</span>' : ''}
                        </div>
                    </div>
                </td>
                <td><code>${escapeHtml(u.username)}</code></td>
                <td>${escapeHtml(u.email)}</td>
                <td><span class="admin-role-badge ${roleClass}">${u.role}</span></td>
                <td>${dateStr}</td>
                <td>
                    <div style="display:flex; gap:6px;">
                        <button type="button" class="admin-action-btn" title="Chỉnh sửa người dùng" onclick="openAdminUserModal(${u.id})">✏️</button>
                        ${!isSelf ? `<button type="button" class="admin-action-btn btn-delete" title="Xóa người dùng" onclick="deleteAdminUser(${u.id}, '${escapeHtml(u.username)}')">🗑️</button>` : ''}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function openAdminUserModal(userId = null) {
    let modal = document.getElementById('adminUserModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'adminUserModal';
        modal.innerHTML = `
            <div class="modal" style="max-width:500px;">
                <div class="modal-header">
                    <h3 id="adminUserModalTitle" style="color:var(--text);">Quản lý người dùng</h3>
                    <button class="modal-close" onclick="closeAdminUserModal()">✕</button>
                </div>
                <form id="adminUserForm" onsubmit="handleAdminUserSubmit(event)" style="display:flex; flex-direction:column; gap:14px;">
                    <input type="hidden" id="admUserId">
                    <label class="field" style="margin:0;">
                        <span>Họ và tên</span>
                        <input type="text" id="admUserFullName" class="rc-input" placeholder="Nguyễn Văn A" required>
                    </label>
                    <label class="field" style="margin:0;">
                        <span>Tên đăng nhập (Username) *</span>
                        <input type="text" id="admUserUsername" class="rc-input" placeholder="username" required>
                    </label>
                    <label class="field" style="margin:0;">
                        <span>Email *</span>
                        <input type="email" id="admUserEmail" class="rc-input" placeholder="email@foodx.com" required>
                    </label>
                    <label class="field" style="margin:0;">
                        <span id="admUserPasswordLabel">Mật khẩu *</span>
                        <input type="password" id="admUserPassword" class="rc-input" placeholder="Tối thiểu 6 ký tự">
                    </label>
                    <label class="field" style="margin:0;">
                        <span>Vai trò (Role)</span>
                        <select id="admUserRole" class="rc-input" style="height:44px;">
                            <option value="USER">USER (Người dùng tiêu chuẩn)</option>
                            <option value="ADMIN">ADMIN (Quản trị viên toàn quyền)</option>
                        </select>
                    </label>
                    <div class="modal-actions" style="margin-top:10px; display:flex; justify-content:flex-end; gap:8px;">
                        <button type="button" class="secondary-button" onclick="closeAdminUserModal()">Huỷ</button>
                        <button type="submit" class="primary-button" id="admUserSubmitBtn">Lưu người dùng</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
        modal.addEventListener('click', e => { if (e.target === modal) closeAdminUserModal(); });
    }

    const titleEl = document.getElementById('adminUserModalTitle');
    const idInput = document.getElementById('admUserId');
    const uInput = document.getElementById('admUserUsername');
    const fnInput = document.getElementById('admUserFullName');
    const eInput = document.getElementById('admUserEmail');
    const pInput = document.getElementById('admUserPassword');
    const pLabel = document.getElementById('admUserPasswordLabel');
    const rSelect = document.getElementById('admUserRole');

    pInput.value = '';

    if (userId) {
        const u = adminUsersCache.find(x => x.id === userId);
        if (!u) return;
        idInput.value = u.id;
        titleEl.textContent = '✏️ Chỉnh sửa người dùng #' + u.id;
        uInput.value = u.username;
        uInput.disabled = true;
        fnInput.value = u.fullName || '';
        eInput.value = u.email || '';
        rSelect.value = u.role || 'USER';
        pLabel.textContent = 'Mật khẩu mới (để trống nếu không đổi)';
        pInput.required = false;
    } else {
        idInput.value = '';
        titleEl.textContent = '➕ Thêm người dùng mới';
        uInput.value = '';
        uInput.disabled = false;
        fnInput.value = '';
        eInput.value = '';
        rSelect.value = 'USER';
        pLabel.textContent = 'Mật khẩu *';
        pInput.required = true;
    }

    modal.classList.add('open');
}

function closeAdminUserModal() {
    const modal = document.getElementById('adminUserModal');
    if (modal) modal.classList.remove('open');
}

async function handleAdminUserSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('admUserId').value;
    const username = document.getElementById('admUserUsername').value.trim();
    const fullName = document.getElementById('admUserFullName').value.trim();
    const email = document.getElementById('admUserEmail').value.trim();
    const password = document.getElementById('admUserPassword').value;
    const role = document.getElementById('admUserRole').value;

    const payload = { fullName, email, role };
    if (username) payload.username = username;
    if (password) payload.password = password;

    const btn = document.getElementById('admUserSubmitBtn');
    btn.disabled = true;
    btn.textContent = 'Đang lưu…';

    try {
        if (id) {
            await apiCall('/api/admin/users/' + id, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            showToast('Đã cập nhật người dùng thành công! 🎉', 'success');
        } else {
            await apiCall('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            showToast('Đã tạo tài khoản người dùng mới thành công! 🎉', 'success');
        }
        closeAdminUserModal();
        await reloadAdminUsers();
    } catch (err) {
        showToast('Lỗi: ' + (err.message || 'Không thể lưu'), 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Lưu người dùng';
    }
}

async function deleteAdminUser(id, username) {
    if (!confirm(`Bạn có chắc chắn muốn xóa người dùng "${username}" (ID: ${id})?\nHành động này không thể hoàn tác.`)) {
        return;
    }
    try {
        await apiCall('/api/admin/users/' + id, { method: 'DELETE' });
        showToast(`Đã xóa người dùng ${username}!`, 'success');
        await reloadAdminUsers();
    } catch (err) {
        showToast('Lỗi xóa người dùng: ' + err.message, 'error');
    }
}

/* ==========================================================
   2. INGREDIENT MANAGEMENT
========================================================== */

async function reloadAdminIngredients() {
    try {
        const res = await apiCall('/api/ingredients');
        adminIngredientsCache = Array.isArray(res) ? res : (res?.data || []);
        const iEl = document.getElementById('adminStatIngredients');
        if (iEl) iEl.textContent = adminIngredientsCache.length;
        renderAdminIngredients();
    } catch (err) {
        showToast('Lỗi tải danh mục nguyên liệu: ' + err.message, 'error');
    }
}

function getAdminIngredientImage(item) {
    if (item.image && typeof item.image === 'string' && item.image.trim() !== '') return item.image;
    if (item.imageUrl && typeof item.imageUrl === 'string' && item.imageUrl.trim() !== '') return item.imageUrl;
    if (typeof getFridgeImage === 'function') {
        const found = getFridgeImage({ name: item.name });
        if (found && !found.includes('placeholder')) return found;
    }
    const n = (item.name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
    if (n.includes('trung')) return '/images/foods/egg.jpg';
    if (n.includes('ga') || n.includes('uc ga')) return '/images/foods/chicken.jpg';
    if (n.includes('bo') && !n.includes('bo lat') && !n.includes('qua bo')) return '/images/foods/beef.jpg';
    if (n.includes('heo') || n.includes('lon')) return '/images/foods/pork.jpg';
    if (n.includes('ca hoi')) return '/images/foods/salmon.jpg';
    if (n.includes('tom')) return '/images/foods/shrimp.jpg';
    if (n.includes('ca chua')) return '/images/foods/tomato.jpg';
    if (n.includes('bong cai') || n.includes('sup lo')) return '/images/foods/broccoli.jpg';
    if (n.includes('ca rot')) return '/images/foods/carrot.jpg';
    if (n.includes('khoai tay')) return '/images/foods/potato.jpg';
    if (n.includes('hanh')) return '/images/foods/shallot.jpg';
    if (n.includes('toi')) return '/images/foods/garlic.jpg';
    if (n.includes('gung')) return '/images/foods/ginger.jpg';
    if (n.includes('sua chua')) return '/images/foods/yogurt.jpg';
    if (n.includes('sua')) return '/images/foods/milk.jpg';
    if (n.includes('qua bo') || n.includes('trai bo')) return '/images/foods/avocado.jpg';
    if (n.includes('chuoi')) return '/images/foods/banana.jpg';
    if (n.includes('com') || n.includes('gao')) return '/images/foods/rice.jpg';
    if (n.includes('dau hu') || n.includes('dau phu')) return '/images/foods/tofu.jpg';
    if (n.includes('pho mai')) return '/images/foods/cheese.jpg';
    return '/images/foods/placeholder.jpg';
}

function renderAdminIngredients() {
    const tbody = document.getElementById('adminIngredientTableBody');
    if (!tbody) return;

    const q = (document.getElementById('adminIngredientSearch')?.value || '').toLowerCase().trim();
    const catFilter = document.getElementById('adminIngredientCatFilter')?.value || 'ALL';

    const filtered = adminIngredientsCache.filter(item => {
        const matchCat = catFilter === 'ALL' || item.category === catFilter;
        const matchQ = !q || (item.name && item.name.toLowerCase().includes(q));
        return matchCat && matchQ;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:32px; color:var(--text-soft);">Không tìm thấy nguyên liệu nào.</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map(item => {
        const img = getAdminIngredientImage(item);
        return `
        <tr>
            <td><strong>#${item.id}</strong></td>
            <td>
                <img src="${img}" alt="${escapeHtml(item.name)}" class="admin-dish-thumb" onerror="this.onerror=null;this.src='/images/foods/placeholder.jpg';">
            </td>
            <td><strong style="font-size:14px; color:var(--text);">${escapeHtml(item.name)}</strong></td>
            <td><span class="admin-role-badge admin-role-user">${escapeHtml(item.category || 'Chung')}</span></td>
            <td><span class="admin-unit-badge">${escapeHtml(item.defaultUnit || 'g')}</span></td>
            <td>${item.caloriesPerUnit != null ? item.caloriesPerUnit + ' kcal' : '—'}</td>
            <td>
                <div style="display:flex; gap:6px;">
                    <button type="button" class="admin-action-btn" title="Chỉnh sửa nguyên liệu" onclick="openAdminIngredientModal(${item.id})">✏️</button>
                    <button type="button" class="admin-action-btn btn-delete" title="Xóa nguyên liệu" onclick="deleteAdminIngredient(${item.id}, '${escapeHtml(item.name)}')">🗑️</button>
                </div>
            </td>
        </tr>
    `;
    }).join('');
}

function openAdminIngredientModal(ingId = null) {
    let modal = document.getElementById('adminIngredientModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'adminIngredientModal';
        modal.innerHTML = `
            <div class="modal" style="max-width:500px;">
                <div class="modal-header">
                    <h3 id="adminIngredientModalTitle" style="color:var(--text);">Quản lý nguyên liệu</h3>
                    <button class="modal-close" onclick="closeAdminIngredientModal()">✕</button>
                </div>
                <form id="adminIngredientForm" onsubmit="handleAdminIngredientSubmit(event)" style="display:flex; flex-direction:column; gap:14px;">
                    <input type="hidden" id="admIngId">
                    <label class="field" style="margin:0;">
                        <span>Tên nguyên liệu *</span>
                        <input type="text" id="admIngName" class="rc-input" placeholder="vd: Thịt ba chỉ, Rau muống..." required>
                    </label>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                        <label class="field" style="margin:0;">
                            <span>Danh mục</span>
                            <input type="text" id="admIngCategory" class="rc-input" placeholder="vd: Thịt, Rau củ, Gia vị...">
                        </label>
                        <label class="field" style="margin:0;">
                            <span>Đơn vị mặc định</span>
                            <input type="text" id="admIngUnit" class="rc-input" placeholder="g, kg, quả, bó, ml..." required>
                        </label>
                    </div>
                    <label class="field" style="margin:0;">
                        <span>Calo trên mỗi đơn vị (kcal)</span>
                        <input type="number" id="admIngCalo" class="rc-input" placeholder="vd: 250" step="0.1" min="0">
                    </label>
                    <label class="field" style="margin:0;">
                        <span>Mô tả ngắn / Hướng dẫn bảo quản</span>
                        <textarea id="admIngDesc" class="rc-input" rows="2" placeholder="Ghi chú..."></textarea>
                    </label>
                    <div class="modal-actions" style="margin-top:10px; display:flex; justify-content:flex-end; gap:8px;">
                        <button type="button" class="secondary-button" onclick="closeAdminIngredientModal()">Huỷ</button>
                        <button type="submit" class="primary-button" id="admIngSubmitBtn">Lưu nguyên liệu</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
        modal.addEventListener('click', e => { if (e.target === modal) closeAdminIngredientModal(); });
    }

    const titleEl = document.getElementById('adminIngredientModalTitle');
    const idInput = document.getElementById('admIngId');
    const nameInput = document.getElementById('admIngName');
    const catInput = document.getElementById('admIngCategory');
    const unitInput = document.getElementById('admIngUnit');
    const caloInput = document.getElementById('admIngCalo');
    const descInput = document.getElementById('admIngDesc');

    if (ingId) {
        const item = adminIngredientsCache.find(x => x.id === ingId);
        if (!item) return;
        idInput.value = item.id;
        titleEl.textContent = '✏️ Chỉnh sửa nguyên liệu #' + item.id;
        nameInput.value = item.name || '';
        catInput.value = item.category || '';
        unitInput.value = item.defaultUnit || '';
        caloInput.value = item.caloriesPerUnit != null ? item.caloriesPerUnit : '';
        descInput.value = item.description || '';
    } else {
        idInput.value = '';
        titleEl.textContent = '➕ Thêm nguyên liệu mới vào Catalog';
        nameInput.value = '';
        catInput.value = 'Rau củ';
        unitInput.value = 'g';
        caloInput.value = '';
        descInput.value = '';
    }

    modal.classList.add('open');
}

function closeAdminIngredientModal() {
    const modal = document.getElementById('adminIngredientModal');
    if (modal) modal.classList.remove('open');
}

async function handleAdminIngredientSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('admIngId').value;
    const name = document.getElementById('admIngName').value.trim();
    const category = document.getElementById('admIngCategory').value.trim();
    const defaultUnit = document.getElementById('admIngUnit').value.trim();
    const caloVal = document.getElementById('admIngCalo').value;
    const caloriesPerUnit = caloVal !== '' ? parseFloat(caloVal) : null;
    const description = document.getElementById('admIngDesc').value.trim();

    const payload = { name, category, defaultUnit, caloriesPerUnit, description };
    const btn = document.getElementById('admIngSubmitBtn');
    btn.disabled = true;
    btn.textContent = 'Đang lưu…';

    try {
        if (id) {
            await apiCall('/api/ingredients/' + id, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            showToast('Đã cập nhật nguyên liệu thành công! 🎉', 'success');
        } else {
            await apiCall('/api/ingredients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            showToast('Đã thêm nguyên liệu mới thành công! 🎉', 'success');
        }
        closeAdminIngredientModal();
        await reloadAdminIngredients();
    } catch (err) {
        showToast('Lỗi: ' + (err.message || 'Không thể lưu nguyên liệu'), 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Lưu nguyên liệu';
    }
}

async function deleteAdminIngredient(id, name) {
    if (!confirm(`Xác nhận xóa nguyên liệu "${name}" khỏi kho hệ thống?`)) return;
    try {
        await apiCall('/api/ingredients/' + id, { method: 'DELETE' });
        showToast(`Đã xóa nguyên liệu "${name}"!`, 'success');
        await reloadAdminIngredients();
    } catch (err) {
        showToast('Lỗi xóa nguyên liệu: ' + err.message, 'error');
    }
}

/* ==========================================================
   3. RECIPE MANAGEMENT
========================================================== */

async function reloadAdminRecipes() {
    try {
        const res = await apiCall('/api/recipes');
        adminRecipesCache = Array.isArray(res) ? res : (res?.data || []);
        const rEl = document.getElementById('adminStatRecipes');
        if (rEl) rEl.textContent = adminRecipesCache.length;
        renderAdminRecipes();
    } catch (err) {
        showToast('Lỗi tải danh sách công thức: ' + err.message, 'error');
    }
}

function renderAdminRecipes() {
    const tbody = document.getElementById('adminRecipeTableBody');
    if (!tbody) return;

    const q = (document.getElementById('adminRecipeSearch')?.value || '').toLowerCase().trim();

    const filtered = adminRecipesCache.filter(r => {
        const title = (r.title || r.name || '').toLowerCase();
        return !q || title.includes(q);
    });

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:32px; color:var(--text-soft);">Không tìm thấy công thức nào.</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map(r => {
        const title = r.title || r.name || 'Không có tên';
        const img = r.imageUrl || r.image || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80';
        const time = (r.cookTime || r.timeMinutes || 30) + ' phút';
        const calo = (r.kcal || r.calories || 0) + ' kcal';
        const cat = r.category || 'Chính';

        return `
            <tr>
                <td><strong>#${r.id}</strong></td>
                <td>
                    <div style="display:flex; align-items:center; gap:12px;">
                        <img src="${img}" alt="${escapeHtml(title)}" class="admin-dish-thumb" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80';">
                        <strong style="color:var(--text); font-size:14px;">${escapeHtml(title)}</strong>
                    </div>
                </td>
                <td><span class="admin-role-badge admin-role-user">${escapeHtml(cat)}</span></td>
                <td>${time}</td>
                <td>${calo}</td>
                <td>${r.servings ? r.servings + ' người' : '—'}</td>
                <td>
                    <div style="display:flex; gap:6px;">
                        <button type="button" class="admin-action-btn" title="Xem chi tiết" onclick="if(typeof openRecipeModal==='function') openRecipeModal(${r.id})">👁️</button>
                        <button type="button" class="admin-action-btn btn-delete" title="Xóa công thức" onclick="deleteAdminRecipe(${r.id}, '${escapeHtml(title)}')">🗑️</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

async function deleteAdminRecipe(id, title) {
    if (!confirm(`Bạn có chắc chắn muốn xóa công thức "${title}" (ID: ${id}) khỏi hệ thống?`)) return;
    try {
        await apiCall('/api/recipes/' + id, { method: 'DELETE' });
        showToast(`Đã xóa công thức "${title}"!`, 'success');
        await reloadAdminRecipes();
    } catch (err) {
        showToast('Lỗi xóa công thức: ' + err.message, 'error');
    }
}

/* ==========================================================
   4. SOCIAL POST MODERATION
========================================================== */

async function reloadAdminSocial() {
    try {
        const res = await apiCall('/api/social/posts');
        adminSocialCache = Array.isArray(res) ? res : (res?.data || []);
        const pEl = document.getElementById('adminStatSocial');
        if (pEl) pEl.textContent = adminSocialCache.length;
        renderAdminSocial();
    } catch (err) {
        showToast('Lỗi tải bài viết cộng đồng: ' + err.message, 'error');
    }
}

function renderAdminSocial() {
    const tbody = document.getElementById('adminSocialTableBody');
    if (!tbody) return;

    const q = (document.getElementById('adminSocialSearch')?.value || '').toLowerCase().trim();

    const filtered = adminSocialCache.filter(p => {
        const title = (p.title || '').toLowerCase();
        const author = (p.authorName || '').toLowerCase();
        return !q || title.includes(q) || author.includes(q);
    });

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:32px; color:var(--text-soft);">Không có bài đăng nào.</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map(p => {
        const dateStr = p.createdAt ? new Date(p.createdAt).toLocaleDateString('vi-VN') : '—';
        return `
            <tr>
                <td><strong>#${p.id}</strong></td>
                <td><strong style="color:var(--text);">${escapeHtml(p.authorName || 'Ẩn danh')}</strong></td>
                <td><strong style="color:var(--text); font-size:14px;">${escapeHtml(p.title || 'Không có tiêu đề')}</strong></td>
                <td><span class="admin-stat-pill">❤️ ${p.likeCount ?? p.likesCount ?? 0}</span></td>
                <td>
                    <button type="button" class="admin-comments-btn" onclick="openAdminCommentsModal(${p.id}, '${escapeHtml(p.title || '')}')">
                        💬 ${p.commentCount ?? p.commentsCount ?? 0} bình luận
                    </button>
                </td>
                <td>${dateStr}</td>
                <td>
                    <button type="button" class="admin-action-btn btn-delete" title="Xóa bài viết vi phạm" onclick="deleteAdminSocialPost(${p.id}, '${escapeHtml(p.title || '')}')">🗑️</button>
                </td>
            </tr>
        `;
    }).join('');
}

async function deleteAdminSocialPost(id, title) {
    if (!confirm(`Xác nhận xóa bài viết "${title}" của cộng đồng?`)) return;
    try {
        await apiCall('/api/social/posts/' + id, { method: 'DELETE' });
        showToast('Đã xóa bài viết thành công!', 'success');
        await reloadAdminSocial();
    } catch (err) {
        showToast('Lỗi xóa bài viết: ' + err.message, 'error');
    }
}

/* ==========================================================
   5. COMMENT MODERATION MODAL
========================================================== */

async function openAdminCommentsModal(postId, postTitle) {
    let modal = document.getElementById('adminCommentsModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'adminCommentsModal';
        modal.innerHTML = `
            <div class="modal" style="max-width:580px; max-height:85vh; display:flex; flex-direction:column;">
                <div class="modal-header">
                    <h3 id="adminCommentsModalTitle" style="color:var(--text); font-size:16px;">💬 Quản lý bình luận</h3>
                    <button class="modal-close" onclick="closeAdminCommentsModal()">✕</button>
                </div>
                <div id="adminCommentsList" style="flex:1; overflow-y:auto; padding:10px 0; max-height:400px;">
                    <div style="text-align:center; padding:20px; color:var(--text-soft);">Đang tải bình luận...</div>
                </div>
                <div class="modal-actions" style="margin-top:14px; display:flex; justify-content:flex-end;">
                    <button type="button" class="secondary-button" onclick="closeAdminCommentsModal()">Đóng</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.addEventListener('click', e => { if (e.target === modal) closeAdminCommentsModal(); });
    }

    const titleEl = document.getElementById('adminCommentsModalTitle');
    const listEl = document.getElementById('adminCommentsList');
    titleEl.textContent = `💬 Bình luận bài viết: "${postTitle || '#' + postId}"`;
    listEl.innerHTML = '<div style="text-align:center; padding:20px; color:var(--text-soft);">Đang tải bình luận...</div>';
    modal.classList.add('open');

    try {
        const res = await apiCall(`/api/social/posts/${postId}/comments`);
        const comments = Array.isArray(res) ? res : (res?.data || []);
        if (comments.length === 0) {
            listEl.innerHTML = '<div style="text-align:center; padding:28px; color:var(--text-soft);">Bài viết này chưa có bình luận nào.</div>';
            return;
        }

        listEl.innerHTML = comments.map(c => {
            const author = escapeHtml(c.authorName || c.userFullName || 'Thành viên');
            const dateStr = c.createdAt ? new Date(c.createdAt).toLocaleString('vi-VN') : '—';
            const content = escapeHtml(c.content || '');
            return `
                <div class="admin-comment-item" id="adminComment-${c.id}">
                    <div class="admin-comment-content">
                        <div class="admin-comment-meta">
                            <strong>${author}</strong> • <span>${dateStr}</span>
                        </div>
                        <div>${content}</div>
                    </div>
                    <button type="button" class="admin-action-btn btn-delete" title="Xóa bình luận này" onclick="deleteAdminComment(${postId}, ${c.id}, '${escapeHtml(postTitle)}')">
                        🗑️
                    </button>
                </div>
            `;
        }).join('');
    } catch (err) {
        listEl.innerHTML = `<div style="text-align:center; padding:20px; color:var(--danger);">Lỗi tải bình luận: ${escapeHtml(err.message)}</div>`;
    }
}

function closeAdminCommentsModal() {
    const modal = document.getElementById('adminCommentsModal');
    if (modal) modal.classList.remove('open');
}

async function deleteAdminComment(postId, commentId, postTitle) {
    if (!confirm('Bạn có chắc muốn xóa bình luận này khỏi bài viết?')) return;
    try {
        await apiCall(`/api/social/comments/${commentId}`, { method: 'DELETE' });
        showToast('Đã xóa bình luận vi phạm!', 'success');
        openAdminCommentsModal(postId, postTitle);
        await reloadAdminSocial();
    } catch (err) {
        showToast('Lỗi xóa bình luận: ' + err.message, 'error');
    }
}

// Utility helper for API calls
async function apiCall(url, opts = {}) {
    if (typeof apiRequest === 'function') {
        return await apiRequest(url, opts);
    }
    const token = typeof getToken === 'function' ? getToken() : (localStorage.getItem('foodx_token') || '');
    const headers = { ...(opts.headers || {}) };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    const res = await fetch(url, { ...opts, headers });
    if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
    }
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
        const data = await res.json();
        return (data && typeof data === 'object' && 'data' in data) ? data.data : data;
    }
    return null;
}

// Global exposure
window.loadAdminDashboard = loadAdminDashboard;
window.switchAdminTab = switchAdminTab;
window.openAdminUserModal = openAdminUserModal;
window.closeAdminUserModal = closeAdminUserModal;
window.handleAdminUserSubmit = handleAdminUserSubmit;
window.deleteAdminUser = deleteAdminUser;
window.renderAdminUsers = renderAdminUsers;
window.openAdminIngredientModal = openAdminIngredientModal;
window.closeAdminIngredientModal = closeAdminIngredientModal;
window.handleAdminIngredientSubmit = handleAdminIngredientSubmit;
window.deleteAdminIngredient = deleteAdminIngredient;
window.renderAdminIngredients = renderAdminIngredients;
window.renderAdminRecipes = renderAdminRecipes;
window.deleteAdminRecipe = deleteAdminRecipe;
window.renderAdminSocial = renderAdminSocial;
window.deleteAdminSocialPost = deleteAdminSocialPost;
