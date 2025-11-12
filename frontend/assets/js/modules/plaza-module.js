/**
 * Plaza Module (Activities Feed)
 * 广场模块 - 活动动态
 */

/**
 * 加载活动 Feed
 */
async function loadFeed() {
    const feedList = document.getElementById('feed-list');
    feedList.innerHTML = `<div class="loading">${t('loadingActivities')}</div>`;
    
    try {
        const res = await fetch('../backend/api/api.php?action=get_feed');
        const data = await res.json();
        
        if (data.code === 200 && data.feed) {
            if (data.feed.length === 0) {
                feedList.innerHTML = `<p style="text-align:center;color:#999;">${t('noData')}</p>`;
                return;
            }
            
            const user = getCurrentUser();
            let html = '';
            data.feed.forEach(activity => {
                const likedClass = activity.is_liked ? 'liked' : '';
                const likeIcon = activity.is_liked ? '❤️' : '🤍';
                html += `
                    <div class="activity-card">
                        <div class="activity-header" style="display:flex;justify-content:space-between;align-items:center;">
                            <div>
                                <span class="activity-author">${escapeHtml(activity.author || 'Anonymous')}</span>
                                <span class="activity-time" style="margin-left:12px;">${new Date(activity.createdAt).toLocaleString()}</span>
                            </div>
                            ${activity.author_id === user.id ? `<button class="btn btn-secondary btn-small" onclick="deleteActivity(${activity.id})" style="padding:4px 8px;font-size:0.8rem;">× Delete</button>` : ''}
                        </div>
                        ${activity.title ? `<div class="activity-title">${escapeHtml(activity.title)}</div>` : ''}
                        <div class="activity-content">${escapeHtml(activity.content)}</div>
                        ${activity.image ? `<img src="${escapeHtml(activity.image)}" style="max-width:100%;border-radius:8px;margin-top:12px;" alt="Activity image">` : ''}
                        <div class="activity-actions">
                            <button class="action-btn ${likedClass}" onclick="toggleLike(${activity.id})">
                                ${likeIcon} ${activity.like_count || 0}
                            </button>
                            <button class="action-btn" onclick="toggleComments(${activity.id})">
                                💬 ${activity.comment_count || 0}
                            </button>
                        </div>
                        <div id="comments-${activity.id}" class="comments-section" style="display:none;">
                            <div id="comments-list-${activity.id}"></div>
                            <div class="comment-input-area">
                                <input type="text" class="comment-input" id="comment-input-${activity.id}" placeholder="${t('addComment')}">
                                <button class="btn btn-primary btn-small" onclick="submitComment(${activity.id})">${t('submit')}</button>
                            </div>
                        </div>
                    </div>
                `;
            });
            feedList.innerHTML = html;
        } else {
            feedList.innerHTML = `<p style="color:#e74c3c;">${data.message || t('error')}</p>`;
        }
    } catch (err) {
        feedList.innerHTML = `<p style="color:#e74c3c;">${t('error')}</p>`;
    }
}

/**
 * 切换点赞
 */
async function toggleLike(activityId) {
    try {
        const res = await fetch('../backend/api/api.php?action=toggle_like', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ activity_id: activityId })
        });
        const data = await res.json();
        if (data.code === 200) {
            loadFeed();
        } else {
            alert(data.message);
        }
    } catch (err) {
        alert(t('error'));
    }
}

/**
 * 切换评论区显示
 */
async function toggleComments(activityId) {
    const commentsDiv = document.getElementById(`comments-${activityId}`);
    if (commentsDiv.style.display === 'none') {
        commentsDiv.style.display = 'block';
        await loadComments(activityId);
    } else {
        commentsDiv.style.display = 'none';
    }
}

/**
 * 加载评论
 */
async function loadComments(activityId) {
    const commentsList = document.getElementById(`comments-list-${activityId}`);
    commentsList.innerHTML = `<div class="loading">${t('loading')}</div>`;
    
    try {
        const res = await fetch(`../backend/api/api.php?action=get_comments&activity_id=${activityId}`);
        const data = await res.json();
        
        if (data.code === 200 && data.comments) {
            if (data.comments.length === 0) {
                commentsList.innerHTML = `<p style="color:#999;font-size:0.9rem;">${t('noData')}</p>`;
                return;
            }
            
            let html = '';
            data.comments.forEach(comment => {
                html += `
                    <div class="comment-item">
                        <div class="comment-author">${escapeHtml(comment.username || 'Anonymous')}</div>
                        <div class="comment-content">${escapeHtml(comment.content)}</div>
                    </div>
                `;
            });
            commentsList.innerHTML = html;
        } else {
            commentsList.innerHTML = `<p style="color:#e74c3c;font-size:0.9rem;">${t('error')}</p>`;
        }
    } catch (err) {
        commentsList.innerHTML = `<p style="color:#e74c3c;font-size:0.9rem;">${t('error')}</p>`;
    }
}

/**
 * 提交评论
 */
async function submitComment(activityId) {
    const input = document.getElementById(`comment-input-${activityId}`);
    const content = input.value.trim();
    
    if (!content) {
        alert('Please enter a comment');
        return;
    }
    
    try {
        const res = await fetch('../backend/api/api.php?action=add_comment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                activity_id: activityId,
                content: content
            })
        });
        const data = await res.json();
        
        if (data.code === 200) {
            input.value = '';
            await loadComments(activityId);
            loadFeed(); // 重新加载以更新评论数
        } else {
            alert(data.message);
        }
    } catch (err) {
        alert(t('error'));
    }
}

/**
 * 打开发布活动弹窗
 */
function openActivityModal() {
    document.getElementById('activityModal').classList.add('show');
}

/**
 * 关闭发布活动弹窗
 */
function closeActivityModal() {
    document.getElementById('activityModal').classList.remove('show');
    document.getElementById('activityTitle').value = '';
    document.getElementById('activityContent').value = '';
    document.getElementById('activityImage').value = '';
}

/**
 * 提交活动
 */
async function submitActivity() {
    const title = document.getElementById('activityTitle').value.trim();
    const content = document.getElementById('activityContent').value.trim();
    const image = document.getElementById('activityImage').value.trim();
    
    if (!content) {
        alert('Please enter content');
        return;
    }
    
    try {
        const res = await fetch('../backend/api/api.php?action=publish', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'post',
                title: title,
                content: content,
                image: image
            })
        });
        const data = await res.json();
        
        if (data.code === 200) {
            closeActivityModal();
            loadFeed();
            alert(t('success'));
        } else {
            alert(data.message);
        }
    } catch (err) {
        alert(t('error'));
    }
}

/**
 * 删除活动
 */
async function deleteActivity(activityId) {
    if (!confirm('Are you sure you want to delete this activity?')) return;
    
    try {
        const res = await fetch('../backend/api/api.php?action=delete_activity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ activity_id: activityId })
        });
        const data = await res.json();
        
        if (data.code === 200) {
            loadFeed();
            alert('Activity deleted');
        } else {
            alert(data.message);
        }
    } catch (err) {
        alert(t('error'));
    }
}
