var SOCIAL_API = (typeof window !== 'undefined' && window.SOCIAL_API) ? window.SOCIAL_API : '/api/social';
var recipesCache = (typeof window !== 'undefined' && window.recipesCache) ? window.recipesCache : [];
var curRecipe = (typeof window !== 'undefined' && window.curRecipe) ? window.curRecipe : null;
var allSocialPostsCache = (typeof window !== 'undefined' && window.allSocialPostsCache) ? window.allSocialPostsCache : [];

function socialTime(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const diff = Date.now() - d.getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return 'Vừa xong';
    if (min < 60) return min + ' phút trước';
    const h = Math.floor(min / 60);
    if (h < 24) return h + ' giờ trước';
    const days = Math.floor(h / 24);
    if (days < 7) return days + ' ngày trước';
    return d.toLocaleDateString('vi-VN');
}

function postCard(post) {
    const isLiked = post.likedByMe || !!likedPostsState[post.id];
    const isSaved = !!savedPostsState[post.id];
    const currentLikes = post.likeCount !== undefined ? post.likeCount : (post.likes || 0);

    const img = post.imageUrl
        ? '<div class="post-img-container" data-open-detail="' + post.id + '" title="Bấm vào ảnh để xem chi tiết công thức">' +
            '<img class="post-image" src="' + escapeHtml(post.imageUrl) + '" alt="' + escapeHtml(post.title) + '" loading="lazy" onerror="this.parentElement.style.display=\'none\'">' +
            '<div class="post-img-overlay"><span>🔍 Xem chi tiết công thức</span></div>' +
          '</div>'
        : '';

    const canDelete = window.authState && authState.userId && (authState.userId === post.authorId || authState.userId === +post.authorId || authState.role === 'ADMIN');
    const totalComments = post.commentCount !== undefined ? post.commentCount : 0;

    return '' +
        '<article class="card post-card" data-post-id="' + post.id + '">' +
            '<div class="post-header">' +
                '<div class="post-avatar-wrap"><div class="post-avatar-emoji">👨‍🍳</div></div>' +
                '<div class="post-author-info">' +
                    '<strong>' + escapeHtml(post.authorName || 'Thành viên FoodX') + '</strong>' +
                    '<span>' + (post.authorRole ? escapeHtml(post.authorRole) + ' • ' : '') + socialTime(post.createdAt) + '</span>' +
                '</div>' +
                '<span class="post-badge-tag">' + (post.cookTime ? '⏱ ' + post.cookTime + "'" : 'Công thức') + '</span>' +
                (canDelete ? '<button type="button" class="text-button post-delete" data-delete="' + post.id + '">🗑 Xóa</button>' : '') +
            '</div>' +
            '<h3 class="post-title" data-open-detail="' + post.id + '" title="Bấm để xem chi tiết công thức">' + escapeHtml(post.title) + '</h3>' +
            '<div class="post-meta-pills">' +
                (post.kcal ? '<span>🔥 ' + post.kcal + ' kcal</span>' : '') +
                '<span>📊 ' + escapeHtml(post.difficulty || (post.category === 'eatclean' ? 'Healthy' : 'Dễ nấu')) + '</span>' +
                (post.status === 'DRAFT' ? '<span class="draft-pill">💾 Bản nháp</span>' : '') +
            '</div>' +
            img +
            (post.description ? '<p class="post-desc" data-open-detail="' + post.id + '" title="Bấm để xem chi tiết công thức">' + escapeHtml(post.description) + '</p>' : '') +
            '<div class="post-view-cta" data-open-detail="' + post.id + '">' +
                '<span>📖 Xem công thức & hướng dẫn chi tiết →</span>' +
            '</div>' +
            '<div class="post-actions-bar">' +
                '<button type="button" class="post-action-btn' + (isLiked ? ' active' : '') + '" data-like="' + post.id + '">' +
                    (isLiked ? '❤️' : '🤍') + ' <span data-like-count="' + post.id + '">' + currentLikes + '</span>' +
                '</button>' +
                '<button type="button" class="post-action-btn' + (isSaved ? ' saved-active' : '') + '" data-save="' + post.id + '" data-title="' + escapeHtml(post.title) + '">' +
                    (isSaved ? '🔖 Đã lưu' : '🤍 Lưu món') +
                '</button>' +
                '<button type="button" class="post-action-btn" data-comments="' + post.id + '">' +
                    '💬 <span data-comment-count="' + post.id + '">' + totalComments + '</span>' +
                '</button>' +
                '<button type="button" class="post-action-btn" data-share="' + post.id + '">' +
                    '↗️ Chia sẻ' +
                '</button>' +
            '</div>' +
            '<div class="post-comments" data-comments-box="' + post.id + '" hidden>' +
                '<div class="comment-list" data-comment-list="' + post.id + '">' +
                    '<div style="font-size:12px;color:var(--text-soft);padding:6px 0;">Bấm mở để tải bình luận...</div>' +
                '</div>' +
                '<div class="comment-input-row">' +
                    '<input class="comment-input" data-comment-input="' + post.id + '" placeholder="Viết bình luận hoặc đặt câu hỏi cho đầu bếp..." autocomplete="off">' +
                    '<button type="button" class="primary-button" style="padding:6px 14px;font-size:12px;" data-comment-send="' + post.id + '">Gửi</button>' +
                '</div>' +
            '</div>' +
        '</article>';
}

async function loadSocialFeed() {
    const feed = document.getElementById('socialFeed');
    if (!feed) return;
    feed.innerHTML = '<div class="social-empty" style="grid-column:1/-1;">⏳ Đang tải các bài chia sẻ công thức...</div>';

    let apiPosts = [];
    try {
        const res = await apiRequest(SOCIAL_API + '/posts');
        if (Array.isArray(res)) {
            apiPosts = res;
        } else if (res && Array.isArray(res.data)) {
            apiPosts = res.data;
        } else if (res && Array.isArray(res.content)) {
            apiPosts = res.content;
        } else {
            apiPosts = [];
        }
    } catch (error) {
        apiPosts = [];
    }

    const seen = new Set();
    const combined = [];

    (apiPosts || []).forEach(function (p) {
        if (p && p.id && !seen.has(String(p.id)) && !seen.has(String(p.title || ''))) {
            seen.add(String(p.id));
            if (p.title) seen.add(String(p.title));
            combined.push(p);
        }
    });

    allSocialPostsCache = combined;
    if (typeof window !== 'undefined') window.allSocialPostsCache = combined;
    renderSocialFeedFiltered();
}

function renderSocialFeedFiltered() {
    const feed = document.getElementById('socialFeed');
    if (!feed) return;

    let posts = allSocialPostsCache;
    const cat = currentSocialCategory;
    const kw = currentSocialSearch.trim().toLowerCase();

    // Category filtering
    if (cat !== 'all') {
        posts = posts.filter(function (p) {
            if (cat === 'my') {
                const myId = window.authState && authState.userId;
                const myName = window.authState && (authState.fullName || authState.username);
                return (myId && (p.authorId === myId || p.authorId === +myId)) ||
                       (myName && p.authorName === myName) ||
                       (p.authorName && p.authorName.startsWith('Bạn'));
            }
            if (cat === 'hot') return (p.likeCount || 0) > 0;
            if (cat === 'liked') return !!p.likedByMe || !!likedPostsState[p.id];
            if (cat === 'saved') return !!savedPostsState[p.id];
            return p.category === cat;
        });
    }

    // Keyword filtering
    if (kw) {
        posts = posts.filter(function (p) {
            const titleOk = String(p.title || '').toLowerCase().includes(kw);
            const descOk = String(p.description || '').toLowerCase().includes(kw);
            const ingOk = (p.ingredients || []).some(function (i) { return String(i).toLowerCase().includes(kw); });
            return titleOk || descOk || ingOk;
        });
    }

    if (!posts || !posts.length) {
        if (cat === 'my') {
            feed.innerHTML = '<div class="social-empty" style="grid-column:1/-1;">' +
                '<div style="font-size:36px;margin-bottom:8px;">📝</div>' +
                '<b>Bạn chưa đăng bài viết nào</b>' +
                '<p style="margin-top:6px;">Hãy bấm nút <b>"+ Đăng công thức mới"</b> phía trên để chia sẻ công thức và bí quyết nấu ăn của bạn cùng cộng đồng FoodX nhé! 🎉</p>' +
                '</div>';
        } else {
            feed.innerHTML = '<div class="social-empty" style="grid-column:1/-1;">Không tìm thấy bài chia sẻ phù hợp. Hãy chọn danh mục khác hoặc thử đăng bài đầu tiên! 🎉</div>';
        }
        return;
    }

    let myBanner = '';
    if (cat === 'my') {
        const totalLikesReceived = posts.reduce(function(acc, p) { return acc + (p.likeCount || 0); }, 0);
        const totalCommentsReceived = posts.reduce(function(acc, p) { return acc + (p.commentCount || 0); }, 0);
        myBanner = '<div class="card" style="grid-column:1/-1;padding:16px 20px;border-radius:14px;background:linear-gradient(135deg, rgba(76, 175, 80, 0.12), rgba(33, 150, 243, 0.08));border:1px solid var(--green);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:10px;">' +
            '<div>' +
                '<h3 style="margin:0;font-size:16px;color:var(--text);display:flex;align-items:center;gap:8px;">📝 Lịch sử bài đăng của bạn</h3>' +
                '<p style="margin:4px 0 0 0;font-size:13px;color:var(--text-soft);">Quản lý tất cả công thức và bài viết bạn đã chia sẻ lên cộng đồng FoodX</p>' +
            '</div>' +
            '<div style="display:flex;gap:14px;">' +
                '<span style="background:var(--card-bg);padding:6px 14px;border-radius:20px;font-size:13px;font-weight:600;border:1px solid var(--border);">🍳 <b>' + posts.length + '</b> bài viết</span>' +
                '<span style="background:var(--card-bg);padding:6px 14px;border-radius:20px;font-size:13px;font-weight:600;border:1px solid var(--border);">❤️ <b>' + totalLikesReceived + '</b> lượt thích</span>' +
                '<span style="background:var(--card-bg);padding:6px 14px;border-radius:20px;font-size:13px;font-weight:600;border:1px solid var(--border);">💬 <b>' + totalCommentsReceived + '</b> bình luận</span>' +
            '</div>' +
            '</div>';
    }

    feed.innerHTML = myBanner + posts.map(postCard).join('');
    wirePostEvents();
}

async function loadPostComments(postId) {
    const listEl = document.querySelector('[data-comment-list="' + postId + '"]');
    if (!listEl) return;
    
    let comments = [];
    const isSample = String(postId).startsWith('c');
    
    if (isSample) {
        try {
            comments = JSON.parse(localStorage.getItem('foodx_comments_' + postId) || '[]');
        } catch (_) { comments = []; }
    } else {
        try {
            const rawComments = await apiRequest(SOCIAL_API + '/posts/' + postId + '/comments');
            if (Array.isArray(rawComments)) {
                comments = rawComments;
            } else if (rawComments && Array.isArray(rawComments.data)) {
                comments = rawComments.data;
            } else {
                comments = [];
            }
        } catch (e) {
            comments = [];
        }
    }

    if (comments && comments.length) {
        listEl.innerHTML = comments.map(function(c) {
            const canDel = window.authState && authState.userId && (authState.userId === c.authorId || authState.userId === +c.authorId || isSample);
            return '<div class="comment-item" style="display:flex;justify-content:space-between;align-items:flex-start;padding:6px 0;border-bottom:1px solid var(--border-light);">' +
                '<div><strong style="color:var(--text);font-size:13px;">' + escapeHtml(c.authorName || 'Người dùng') + ':</strong> ' +
                '<span style="font-size:13px;color:var(--text-soft);">' + escapeHtml(c.content) + '</span> ' +
                '<span style="font-size:11px;color:var(--text-muted);margin-left:6px;">' + socialTime(c.createdAt) + '</span></div>' +
                (canDel ? '<button class="text-button" style="color:var(--danger);font-size:11px;padding:0 4px;margin-left:8px;" data-del-comment="' + (c.id || 0) + '" data-post-id="' + postId + '" title="Xóa bình luận">✕</button>' : '') +
                '</div>';
        }).join('');

        // Update comment count pill
        const cntEl = document.querySelector('[data-comment-count="' + postId + '"]');
        if (cntEl) cntEl.textContent = comments.length;

        // Wire delete comment events
        listEl.querySelectorAll('[data-del-comment]').forEach(function(delBtn) {
            delBtn.addEventListener('click', async function() {
                const cId = delBtn.getAttribute('data-del-comment');
                if (isSample) {
                    let localComms = JSON.parse(localStorage.getItem('foodx_comments_' + postId) || '[]');
                    localComms = localComms.filter(function(x) { return String(x.id) !== String(cId); });
                    localStorage.setItem('foodx_comments_' + postId, JSON.stringify(localComms));
                    showToast('Đã xóa bình luận', 'info');
                    loadPostComments(postId);
                } else {
                    try {
                        await apiRequest(SOCIAL_API + '/comments/' + cId, { method: 'DELETE' });
                        showToast('Đã xóa bình luận', 'info');
                        loadPostComments(postId);
                    } catch(e) {
                        showToast('Không thể xóa bình luận', 'error');
                    }
                }
            });
        });
    } else {
        listEl.innerHTML = '<div style="font-size:12px;color:var(--text-soft);padding:6px 0;">Chưa có bình luận nào. Hãy là người đầu tiên bình luận! ✨</div>';
    }
}

function wirePostEvents() {
    // Like button
    document.querySelectorAll('[data-like]').forEach(function (btn) {
        btn.addEventListener('click', async function (e) {
            e.stopPropagation();
            if (!isUserLoggedIn()) {
                requireAuth('like');
                return;
            }
            const id = btn.getAttribute('data-like');
            const isNumeric = typeof id === 'number' || (!isNaN(+id) && !String(id).startsWith('c'));

            if (isNumeric) {
                try {
                    const res = await apiRequest(SOCIAL_API + '/posts/' + id + '/like', { method: 'POST' });
                    if (res) {
                        btn.classList.toggle('active', res.liked);
                        btn.innerHTML = (res.liked ? '❤️' : '🤍') + ' <span data-like-count="' + id + '">' + res.likeCount + '</span>';
                        likedPostsState[id] = res.liked;
                        localStorage.setItem('foodx_liked_posts', JSON.stringify(likedPostsState));
                        showToast(res.liked ? 'Đã thích bài viết ❤️' : 'Đã bỏ thích bài viết.', 'info');
                    }
                } catch(e) {
                    showToast('Cần đăng nhập để thích bài viết', 'warning');
                }
            } else {
                // Handle sample community post local like toggle
                const wasLiked = !!likedPostsState[id];
                const newLiked = !wasLiked;
                likedPostsState[id] = newLiked;
                localStorage.setItem('foodx_liked_posts', JSON.stringify(likedPostsState));
                
                const countEl = btn.querySelector('[data-like-count]');
                let curCount = parseInt(countEl ? countEl.textContent : '0') || 0;
                curCount = newLiked ? curCount + 1 : Math.max(0, curCount - 1);
                
                btn.classList.toggle('active', newLiked);
                btn.innerHTML = (newLiked ? '❤️' : '🤍') + ' <span data-like-count="' + id + '">' + curCount + '</span>';
                showToast(newLiked ? 'Đã thích bài viết ❤️' : 'Đã bỏ thích bài viết.', 'info');
            }
        });
    });

    // Open Recipe Detail on click (Image, Title, Desc, CTA)
    document.querySelectorAll('[data-open-detail]').forEach(function (el) {
        el.addEventListener('click', function (e) {
            e.stopPropagation();
            const id = el.getAttribute('data-open-detail');
            if (id) {
                if (state && state.activeView && state.activeView !== 'recipe') {
                    previousViewBeforeRecipe = state.activeView;
                }
                openRecipeDetail(id);
            }
        });
    });

    // Save button
    document.querySelectorAll('[data-save]').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            if (!isUserLoggedIn()) {
                requireAuth('favorite');
                return;
            }
            const id = btn.getAttribute('data-save');
            const title = btn.getAttribute('data-title') || 'Công thức';
            const postObj = (allSocialPostsCache || []).find(p => String(p.id) === String(id))
                || (communityFeedPosts || []).find(p => String(p.id) === String(id));
            
            const isCurrentlySaved = !!savedPostsState[id];
            if (isCurrentlySaved) {
                delete savedPostsState[id];
                state.favorites = state.favorites.filter(x => String(x) !== String(id));
                btn.classList.remove('saved-active');
                btn.innerHTML = '🤍 Lưu món';
                showToast('Đã bỏ lưu "' + title + '".', 'info');
            } else {
                savedPostsState[id] = {
                    id: id,
                    title: title,
                    imageUrl: postObj ? (postObj.imageUrl || postObj.image) : '',
                    cookTime: postObj ? (postObj.cookTime || postObj.time) : '30 phút',
                    kcal: postObj ? postObj.kcal : 350,
                    description: postObj ? postObj.description : '',
                    ingredients: postObj ? postObj.ingredients : [],
                    instructions: postObj ? postObj.instructions : '',
                    savedAt: new Date().toISOString()
                };
                if (!state.favorites.some(x => String(x) === String(id))) {
                    state.favorites.push(id);
                }
                btn.classList.add('saved-active');
                btn.innerHTML = '🔖 Đã lưu';
                showToast('Đã lưu công thức "' + title + '" vào danh sách yêu thích! ❤️', 'success');
            }
            localStorage.setItem('foodx_saved_posts', JSON.stringify(savedPostsState));
            saveState();
            if (typeof renderFavorites === 'function') renderFavorites();
        });
    });

    // Comment toggle & load
    document.querySelectorAll('[data-comments]').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            const id = btn.getAttribute('data-comments');
            const box = document.querySelector('[data-comments-box="' + id + '"]');
            if (box) {
                box.hidden = !box.hidden;
                if (!box.hidden) {
                    loadPostComments(id);
                }
            }
        });
    });

    // Comment send
    document.querySelectorAll('[data-comment-send]').forEach(function (btn) {
        btn.addEventListener('click', async function (e) {
            e.stopPropagation();
            if (!isUserLoggedIn()) {
                requireAuth('comment');
                return;
            }
            const id = btn.getAttribute('data-comment-send');
            const input = document.querySelector('[data-comment-input="' + id + '"]');
            if (input && input.value.trim()) {
                const text = input.value.trim();
                btn.disabled = true;
                const isSample = String(id).startsWith('c');
                if (isSample) {
                    let localComms = JSON.parse(localStorage.getItem('foodx_comments_' + id) || '[]');
                    localComms.push({
                        id: Date.now(),
                        authorName: (window.authState && (authState.fullName || authState.username)) || 'Bạn',
                        content: text,
                        createdAt: new Date().toISOString()
                    });
                    localStorage.setItem('foodx_comments_' + id, JSON.stringify(localComms));
                    input.value = '';
                    showToast('Đã gửi bình luận! 💬', 'success');
                    loadPostComments(id);
                    btn.disabled = false;
                } else {
                    try {
                        await apiRequest(SOCIAL_API + '/posts/' + id + '/comments', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ content: text })
                        });
                        input.value = '';
                        showToast('Đã gửi bình luận! 💬', 'success');
                        loadPostComments(id);
                    } catch (e) {
                        showToast('Không gửi được bình luận: ' + (e.message || ''), 'error');
                    } finally {
                        btn.disabled = false;
                    }
                }
            }
        });
    });

    // Share button
    document.querySelectorAll('[data-share]').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href);
            }
            showToast('Đã sao chép liên kết bài viết! 🔗', 'success');
        });
    });

    // Delete post
    document.querySelectorAll('[data-delete]').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            deletePost(btn.getAttribute('data-delete'));
        });
    });
}

async function deletePost(id) {
    if (!isUserLoggedIn()) {
        requireAuth('social');
        return;
    }
    if (!window.confirm('Bạn muốn xóa bài chia sẻ này?')) return;
    try {
        await apiRequest(SOCIAL_API + '/posts/' + id, { method: 'DELETE' });
        showToast('Đã xóa bài chia sẻ.', 'success');
        loadSocialFeed();
    } catch (error) {
        showToast('Không xóa được bài chia sẻ.', 'error');
    }
}

async function createPost(status) {
    if (!isUserLoggedIn()) {
        requireAuth('post');
        return;
    }
    const titleEl = document.getElementById('postTitle');
    const title = titleEl ? titleEl.value.trim() : '';
    if (!title) {
        showToast('Vui lòng nhập tên món ăn.', 'warning');
        if (titleEl) titleEl.focus();
        return;
    }

    const payload = {
        title: title,
        description: document.getElementById('postDescription') ? document.getElementById('postDescription').value.trim() : '',
        ingredients: collectIngredientLines(),
        steps: collectStepLines(),
        imageUrl: (document.getElementById('postImage') ? document.getElementById('postImage').value.trim() : '') || null,
        category: document.getElementById('postCategory') ? document.getElementById('postCategory').value : 'family',
        cookTime: +(document.getElementById('postTime') ? document.getElementById('postTime').value : 30) || 30,
        kcal: +(document.getElementById('postKcal') ? document.getElementById('postKcal').value : 350) || 350,
        servings: +(document.getElementById('postServings') ? document.getElementById('postServings').value : 2) || 2,
        difficulty: document.getElementById('postDifficulty') ? document.getElementById('postDifficulty').value : 'Dễ',
        status: status === 'DRAFT' ? 'DRAFT' : 'PUBLISHED'
    };

    const btn = status === 'DRAFT' ? document.getElementById('postDraftBtn') : document.getElementById('postSubmit');
    if (btn) { btn.disabled = true; btn.textContent = '⏳ Đang lưu...'; }

    try {
        const savedPost = await apiRequest(SOCIAL_API + '/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        showToast(status === 'DRAFT' ? 'Đã lưu bản nháp 💾' : 'Đã xuất bản công thức thành công! 🎉', 'success');
        if (savedPost && savedPost.status !== 'DRAFT') {
            allSocialPostsCache.unshift(savedPost);
        }
        resetComposer();
        loadSocialFeed();
    } catch (e) {
        showToast('Không thể đăng bài lúc này: ' + (e.message || ''), 'error');
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = status === 'DRAFT' ? '💾 Lưu nháp' : '🚀 Xuất bản công thức'; }
    }
}

function collectIngredientLines() {
    const lines = [];
    document.querySelectorAll('#ingredientRows .ing-row').forEach(function(row) {
        const qty = row.querySelector('.ing-qty') ? row.querySelector('.ing-qty').value.trim() : '';
        const unit = row.querySelector('.ing-unit') ? row.querySelector('.ing-unit').value.trim() : '';
        const name = row.querySelector('.ing-name') ? row.querySelector('.ing-name').value.trim() : '';
        if (!name) return;
        const amount = qty ? (qty + unit) : '';
        lines.push((amount ? amount + ' ' : '') + name);
    });
    return lines;
}

function collectStepLines() {
    const lines = [];
    document.querySelectorAll('#stepRows .step-row .step-input').forEach(function(input) {
        if (input.value.trim()) lines.push(input.value.trim());
    });
    return lines;
}

function addIngredientRow() {
    const box = document.getElementById('ingredientRows');
    if (!box) return;
    const row = document.createElement('div');
    row.className = 'ing-row';
    row.innerHTML =
        '<input type="text" class="social-input ing-qty" placeholder="SL (vd 500)" style="width:90px;">' +
        '<input type="text" class="social-input ing-unit" placeholder="g" style="width:70px;" list="unitList">' +
        '<input type="text" class="social-input ing-name" placeholder="Tên nguyên liệu (vd Thịt bò)">' +
        '<button type="button" class="ing-remove text-button" title="Xóa dòng">✕</button>';
    row.querySelector('.ing-remove').addEventListener('click', function() {
        row.remove();
        renderPostPreview();
    });
    row.querySelectorAll('input').forEach(function(inp) {
        inp.addEventListener('input', renderPostPreview);
    });
    box.appendChild(row);
    renderPostPreview();
}

function addStepRow(text) {
    const box = document.getElementById('stepRows');
    if (!box) return;
    const row = document.createElement('div');
    row.className = 'step-row';
    row.innerHTML =
        '<span class="step-num">' + (box.children.length + 1) + '</span>' +
        '<input type="text" class="social-input step-input" placeholder="Mô tả bước thực hiện..." value="' + escapeHtml(text || '') + '">' +
        '<button type="button" class="step-remove text-button" title="Xóa bước">✕</button>';
    row.querySelector('.step-remove').addEventListener('click', function() {
        row.remove();
        renumberSteps();
        renderPostPreview();
    });
    row.querySelector('.step-input').addEventListener('input', renderPostPreview);
    box.appendChild(row);
    renumberSteps();
    renderPostPreview();
}

function renumberSteps() {
    document.querySelectorAll('#stepRows .step-row').forEach(function(row, i) {
        const num = row.querySelector('.step-num');
        if (num) num.textContent = i + 1;
    });
}

function renderPostPreview() {
    const card = document.getElementById('postPreviewCard');
    if (!card) return;
    const title = document.getElementById('postTitle') ? document.getElementById('postTitle').value.trim() : '';
    const desc = document.getElementById('postDescription') ? document.getElementById('postDescription').value.trim() : '';
    const time = document.getElementById('postTime') ? document.getElementById('postTime').value : '';
    const kcal = document.getElementById('postKcal') ? document.getElementById('postKcal').value : '';
    const difficulty = document.getElementById('postDifficulty') ? document.getElementById('postDifficulty').value : 'Dễ';
    const imgUrl = document.getElementById('postImage') ? document.getElementById('postImage').value.trim() : '';
    const ings = collectIngredientLines();
    const steps = collectStepLines();

    card.innerHTML =
        '<article class="card post-card post-preview-card">' +
            '<div class="post-header">' +
                '<div class="post-avatar-wrap"><div class="post-avatar-emoji">👨‍🍳</div></div>' +
                '<div class="post-author-info"><strong>' + escapeHtml((window.authState && (authState.fullName || authState.username)) || 'Bạn') + '</strong><span>Vừa xong</span></div>' +
                '<span class="post-badge-tag">' + (time ? '⏱ ' + time + "'" : 'Công thức') + '</span>' +
            '</div>' +
            '<h3 class="post-title">' + (escapeHtml(title) || '<em style="color:var(--text-muted);">Tên món ăn...</em>') + '</h3>' +
            '<div class="post-meta-pills">' +
                (kcal ? '<span>🔥 ' + kcal + ' kcal</span>' : '') +
                '<span>📊 ' + escapeHtml(difficulty) + '</span>' +
            '</div>' +
            (imgUrl ? '<div class="post-img-container"><img class="post-image" src="' + escapeHtml(imgUrl) + '" alt="" onerror="this.remove()"></div>' : '<div class="post-preview-noimg">🖼️ Ảnh món ăn sẽ hiển thị tại đây</div>') +
            (desc ? '<p class="post-desc">' + escapeHtml(desc) + '</p>' : '') +
            '<div class="post-preview-ing"><b>🧺 Nguyên liệu</b>' +
                (ings.length ? '<ul>' + ings.map(function(i) { return '<li>' + escapeHtml(i) + '</li>'; }).join('') + '</ul>' : '<span style="color:var(--text-muted);">Chưa có nguyên liệu</span>') +
            '</div>' +
            '<div class="post-preview-steps"><b>👨‍🍳 Các bước</b>' +
                (steps.length ? '<ol>' + steps.map(function(s) { return '<li>' + escapeHtml(s) + '</li>'; }).join('') + '</ol>' : '<span style="color:var(--text-muted);">Chưa có bước thực hiện</span>') +
            '</div>' +
        '</article>';
}

function resetComposer() {
    ['postTitle', 'postDescription', 'postImage'].forEach(function(id) {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    const fileInput = document.getElementById('postImageFile');
    if (fileInput) fileInput.value = '';
    const status = document.getElementById('postImageStatus');
    if (status) { status.style.display = 'none'; status.textContent = ''; }
    const ingBox = document.getElementById('ingredientRows');
    if (ingBox) ingBox.innerHTML = '';
    const stepBox = document.getElementById('stepRows');
    if (stepBox) stepBox.innerHTML = '';
    addIngredientRow(); addIngredientRow(); addIngredientRow();
    addStepRow(); addStepRow();
    renderPostPreview();
}

async function handlePostImageUpload(file) {
    if (!file) return;
    if (['image/jpeg', 'image/png', 'image/webp'].indexOf(file.type) === -1) {
        showToast('Chỉ hỗ trợ ảnh JPG, PNG hoặc WEBP', 'warning');
        return;
    }
    const status = document.getElementById('postImageStatus');
    if (status) { status.style.display = 'block'; status.textContent = '⏳ Đang tải ảnh lên...'; }
    try {
        const fd = new FormData();
        fd.append('file', file);
        const token = getToken();
        const resp = await fetch('/api/upload', {
            method: 'POST',
            headers: token ? { Authorization: 'Bearer ' + token } : {},
            body: fd
        });
        if (!resp.ok) {
            let msg = 'Tải ảnh thất bại';
            try { const j = await resp.json(); if (j && j.error) msg = j.error; } catch (_) {}
            throw new Error(msg);
        }
        const data = await resp.json();
        if (data && data.url) {
            const imgInput = document.getElementById('postImage');
            if (imgInput) imgInput.value = data.url;
            if (status) status.textContent = '✅ Đã tải ảnh lên';
            renderPostPreview();
        }
    } catch (e) {
        if (status) status.textContent = '⚠️ ' + (e.message || 'Tải ảnh thất bại');
        showToast(e.message || 'Tải ảnh thất bại', 'error');
    }
}

(function initSocialAndChat() {
    const submit = document.getElementById('postSubmit');
    if (submit) submit.addEventListener('click', function() { createPost('PUBLISHED'); });
    const draftBtn = document.getElementById('postDraftBtn');
    if (draftBtn) draftBtn.addEventListener('click', function() { createPost('DRAFT'); });

    // Datalist đơn vị nguyên liệu
    if (!document.getElementById('unitList')) {
        const dl = document.createElement('datalist');
        dl.id = 'unitList';
        dl.innerHTML = '<option value="g"></option><option value="kg"></option><option value="ml"></option><option value="lít"></option><option value="muỗng"></option><option value="quả"></option><option value="củ"></option><option value="nhánh"></option><option value="bó"></option><option value="phần"></option>';
        document.body.appendChild(dl);
    }

    // Dòng nguyên liệu & bước động
    const addIngBtn = document.getElementById('addIngredientRowBtn');
    if (addIngBtn) addIngBtn.addEventListener('click', function() { addIngredientRow(); });
    const addStepBtn = document.getElementById('addStepRowBtn');
    if (addStepBtn) addStepBtn.addEventListener('click', function() { addStepRow(); });

    // Upload ảnh
    const fileInput = document.getElementById('postImageFile');
    if (fileInput) fileInput.addEventListener('change', function() {
        if (fileInput.files && fileInput.files[0]) handlePostImageUpload(fileInput.files[0]);
    });

    // Live preview binding
    ['postTitle', 'postDescription', 'postTime', 'postKcal', 'postServings', 'postImage'].forEach(function(id) {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', renderPostPreview);
    });
    ['postCategory', 'postDifficulty'].forEach(function(id) {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', renderPostPreview);
    });

    // Toggle composer
    const toggleBtn = document.getElementById('toggleComposerBtn');
    const closeBtn = document.getElementById('closeComposerBtn');
    const cancelBtn = document.getElementById('cancelComposerBtn');
    const composerCard = document.getElementById('socialComposerCard');

    if (toggleBtn && composerCard) {
        toggleBtn.addEventListener('click', function() {
            composerCard.hidden = !composerCard.hidden;
            if (!composerCard.hidden) {
                const ingBox = document.getElementById('ingredientRows');
                if (ingBox && !ingBox.children.length) { addIngredientRow(); addIngredientRow(); addIngredientRow(); }
                const stepBox = document.getElementById('stepRows');
                if (stepBox && !stepBox.children.length) { addStepRow(); addStepRow(); }
                renderPostPreview();
                const titleInput = document.getElementById('postTitle');
                if (titleInput) titleInput.focus();
            }
        });
    }

    if (closeBtn && composerCard) closeBtn.addEventListener('click', function() { composerCard.hidden = true; });
    if (cancelBtn && composerCard) cancelBtn.addEventListener('click', function() { composerCard.hidden = true; });

    // Category pills filter
    document.querySelectorAll('#socialCategoryPills .social-pill').forEach(function(pill) {
        pill.addEventListener('click', function() {
            document.querySelectorAll('#socialCategoryPills .social-pill').forEach(function(p) { p.classList.remove('active'); });
            pill.classList.add('active');
            currentSocialCategory = pill.getAttribute('data-social-cat') || 'all';
            renderSocialFeedFiltered();
        });
    });

    // Search input filter
    const searchInput = document.getElementById('socialSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            currentSocialSearch = searchInput.value;
            renderSocialFeedFiltered();
        });
    }

    // Khởi tạo form trước khi user mở composer
    addIngredientRow(); addIngredientRow(); addIngredientRow();
    addStepRow(); addStepRow();
    renderPostPreview();

    loadSocialFeed();
})();







/* =========================================================
   RECIPES BROWSE + DETAIL (gop tu dk-dn)
========================================================= */
recipesCache = recipesCache || [];
curRecipe = curRecipe || null;


// Module window exports
if (typeof window !== 'undefined') window.socialTime = socialTime;
if (typeof window !== 'undefined') window.postCard = postCard;
if (typeof window !== 'undefined') window.loadSocialFeed = loadSocialFeed;
if (typeof window !== 'undefined') window.renderSocialFeedFiltered = renderSocialFeedFiltered;
if (typeof window !== 'undefined') window.loadPostComments = loadPostComments;
if (typeof window !== 'undefined') window.wirePostEvents = wirePostEvents;
if (typeof window !== 'undefined') window.deletePost = deletePost;
if (typeof window !== 'undefined') window.createPost = createPost;
