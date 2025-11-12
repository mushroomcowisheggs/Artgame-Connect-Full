// Main JavaScript for ArtGame Connect MVP
let currentUser = null;
let currentTab = 'home';
let selectedProjectId = null;

// Utility function
function escapeHtml(str) {
    if (!str && str !== 0) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ===== Initialization =====
document.addEventListener('DOMContentLoaded', async function() {
    const authed = await initAuthFromServer();
    if (authed) {
        updatePageLanguage();
        loadFeed(); // Load initial content
        // Initialize homepage carousel (if present)
        try { initCarousel(); } catch (e) { /* ignore */ }
    }
});

async function initAuthFromServer() {
    try {
        const res = await fetch('../backend/api/api.php?action=whoami');
        const data = await res.json();
        if (data.code === 200 && data.user) {
            currentUser = data.user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        } else {
            const stored = JSON.parse(localStorage.getItem('currentUser') || 'null');
            currentUser = stored;
        }
    } catch (err) {
        const stored = JSON.parse(localStorage.getItem('currentUser') || 'null');
        currentUser = stored;
    }

    if (!currentUser) {
        window.location.href = 'auth.html';
        return false;
    }

    // Initialize UI
    document.getElementById('username').textContent = currentUser.username;
    // Set avatar (use default if not provided)
    try {
        const avatarEl = document.getElementById('userAvatar');
        if (avatarEl) avatarEl.src = currentUser.avatar && currentUser.avatar.trim() ? currentUser.avatar : './assets/images/avatar.png';
    } catch (e) { /* ignore if element not present */ }
    const roleText = currentUser.user_role === 'requester' ? t('requester') : t('creator');
    document.getElementById('roleDisplay').textContent = roleText;
    
    // Set language button
    const currentLang = getCurrentLanguage();
    document.getElementById('langToggleBtn').textContent = currentLang === 'en' ? '中文' : 'EN';
    
    return true;
}

// ===== Carousel (static, user-controlled) =====
function initCarousel() {
    const track = document.getElementById('carousel-track');
    if (!track) return;
    const slides = Array.from(track.querySelectorAll('.carousel-slide'));
    if (slides.length === 0) return;

    let index = 0;
    const update = () => {
        const offset = -index * 100;
        track.style.transform = `translateX(${offset}%)`;
    };

    document.getElementById('carousel-prev').addEventListener('click', () => {
        index = (index - 1 + slides.length) % slides.length;
        update();
    });

    document.getElementById('carousel-next').addEventListener('click', () => {
        index = (index + 1) % slides.length;
        update();
    });

    // Make sure images are responsive on load
    window.addEventListener('resize', update);
    update();
}

// ===== Authentication =====
function logout() {
    if (confirm(t('confirmLogout'))) {
        fetch('../backend/api/api.php?action=logout', { method: 'POST' }).finally(() => {
            localStorage.removeItem('currentUser');
            window.location.href = 'auth.html';
        });
    }
}

async function switchRole() {
    const newRole = currentUser.user_role === 'creator' ? 'requester' : 'creator';
    try {
        const res = await fetch('../backend/api/api.php?action=switch_user_role', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: newRole })
        });
        const data = await res.json();
        if (data.code === 200) {
            currentUser.user_role = newRole;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            const roleText = newRole === 'requester' ? t('requester') : t('creator');
            document.getElementById('roleDisplay').textContent = roleText;
            alert(t('roleSwitched'));
            // Reload current tab
            switchTab(currentTab);
        } else {
            alert(data.message);
        }
    } catch (err) {
        alert('Error switching role');
    }
}

function toggleLanguage() {
    const currentLang = getCurrentLanguage();
    const newLang = currentLang === 'en' ? 'zh' : 'en';
    setCurrentLanguage(newLang);
    document.getElementById('langToggleBtn').textContent = newLang === 'en' ? '中文' : 'EN';
    updatePageLanguage();
    // Reload current tab to update content
    switchTab(currentTab);
}

// ===== Navigation =====
function switchTab(tabName) {
    currentTab = tabName;
    
    // Update navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    const navBtn = document.getElementById('nav-' + tabName);
    if (navBtn) navBtn.classList.add('active');
    
    // Show content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    const tabContent = document.getElementById(tabName);
    if (tabContent) tabContent.classList.add('active');
    
    // Load data based on tab
    switch(tabName) {
        case 'plaza':
            loadFeed();
            break;
        case 'messages':
            loadMessages();
            break;
        case 'profile':
            loadProfile();
            break;
        case 'taskmarket':
            loadTaskMarket();
            break;
        case 'project':
            loadProjectDetail();
            break;
        case 'matching':
            // Search-based, no auto-load
            break;
        case 'workbench':
            loadWorkBench();
            break;
    }
}

// ===== Plaza (Activities) =====
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
                            ${activity.author_id === currentUser.id ? `<button class="btn btn-secondary btn-small" onclick="deleteActivity(${activity.id})" style="padding:4px 8px;font-size:0.8rem;">× Delete</button>` : ''}
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

async function toggleComments(activityId) {
    const commentsDiv = document.getElementById(`comments-${activityId}`);
    if (commentsDiv.style.display === 'none') {
        commentsDiv.style.display = 'block';
        await loadComments(activityId);
    } else {
        commentsDiv.style.display = 'none';
    }
}

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
            loadFeed(); // Reload to update comment count
        } else {
            alert(data.message);
        }
    } catch (err) {
        alert(t('error'));
    }
}

function openActivityModal() {
    document.getElementById('activityModal').classList.add('show');
}

function closeActivityModal() {
    document.getElementById('activityModal').classList.remove('show');
    document.getElementById('activityTitle').value = '';
    document.getElementById('activityContent').value = '';
    document.getElementById('activityImage').value = '';
}

async function submitActivity() {
    const title = document.getElementById('activityTitle').value.trim();
    const content = document.getElementById('activityContent').value.trim();
    const image = document.getElementById('activityImage').value.trim();
    
    if (!content) {
        alert('Please enter content');
        return;
    }
    
    try {
        const res = await fetch('../backend/api/api.php?action=post_activity', {
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

// ===== Messages =====
async function loadMessages() {
    const messagesList = document.getElementById('messages-list');
    messagesList.innerHTML = `<div class="loading">${t('loadingMessages')}</div>`;
    
    try {
        const res = await fetch('../backend/api/api.php?action=get_public_messages');
        const data = await res.json();
        
        if (data.code === 200 && data.messages) {
            if (data.messages.length === 0) {
                messagesList.innerHTML = `<p style="text-align:center;color:#999;">${t('noData')}</p>`;
                return;
            }
            
            let html = '';
            data.messages.forEach(msg => {
                html += `
                    <div class="activity-card">
                        <div class="activity-header" style="display:flex;justify-content:space-between;align-items:center;">
                            <div>
                                <span class="activity-author">${escapeHtml(msg.col_author || 'Anonymous')}</span>
                                <span class="activity-time" style="margin-left:12px;">${new Date(msg.col_createdAt).toLocaleString()}</span>
                            </div>
                            ${msg.col_author_id === currentUser.id ? `<button class="btn btn-secondary btn-small" onclick="deleteMessage(${msg.col_id})" style="padding:4px 8px;font-size:0.8rem;">× Delete</button>` : ''}
                        </div>
                        <div class="activity-content">${escapeHtml(msg.col_content)}</div>
                    </div>
                `;
            });
            messagesList.innerHTML = html;
        } else {
            messagesList.innerHTML = `<p style="color:#e74c3c;">${t('error')}</p>`;
        }
    } catch (err) {
        messagesList.innerHTML = `<p style="color:#e74c3c;">${t('error')}</p>`;
    }
}

function openMessageModal() {
    document.getElementById('messageModal').classList.add('show');
}

function closeMessageModal() {
    document.getElementById('messageModal').classList.remove('show');
    document.getElementById('messageContent').value = '';
}

async function submitMessage() {
    const content = document.getElementById('messageContent').value.trim();
    
    if (!content) {
        alert('Please enter message content');
        return;
    }
    
    try {
        const res = await fetch('../backend/api/api.php?action=add_public_message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: content })
        });
        const data = await res.json();
        
        if (data.code === 200) {
            closeMessageModal();
            loadMessages();
            alert(t('success'));
        } else {
            alert(data.message);
        }
    } catch (err) {
        alert(t('error'));
    }
}

async function deleteMessage(messageId) {
    if (!confirm('Are you sure you want to delete this message?')) return;
    
    try {
        const res = await fetch('../backend/api/api.php?action=delete_message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message_id: messageId })
        });
        const data = await res.json();
        
        if (data.code === 200) {
            loadMessages();
            alert('Message deleted');
        } else {
            alert(data.message);
        }
    } catch (err) {
        alert(t('error'));
    }
}

// ===== Profile =====
async function loadProfile() {
    const profileContent = document.getElementById('profile-content');
    profileContent.innerHTML = `<div class="loading">${t('loadingProfile')}</div>`;
    
    if (!currentUser) {
        profileContent.innerHTML = `<p style="color:#e74c3c;">Not logged in</p>`;
        return;
    }
    
    try {
        const res = await fetch('../backend/api/api.php?action=get_user_profile');
        const data = await res.json();
        
        if (data.code === 200 && data.user) {
            const user = data.user;
            const skills = user.skills ? user.skills.split(',').map(s => s.trim()).filter(s => s) : [];
            
            let html = `
                <div style="display:flex;gap:20px;align-items:center;margin-bottom:24px;flex-wrap:wrap;">
                    <div style="width:80px;height:80px;border-radius:50%;background:#667eea;display:flex;align-items:center;justify-content:center;color:white;font-size:2rem;font-weight:bold;">
                        ${user.username[0].toUpperCase()}
                    </div>
                    <div>
                        <h3>${escapeHtml(user.username)}</h3>
                        <p style="color:#666;">${escapeHtml(user.email)}</p>
                        <p style="color:#666;">${t('reputation')}: ${user.reputation_score || 0}</p>
                    </div>
                </div>
                
                <div style="margin-bottom:24px;">
                    <h4>${t('skills')}</h4>
                    <div class="skill-tags">
                        ${skills.map(skill => `<span class="skill-tag">${escapeHtml(skill)} <button onclick="deleteSkill('${escapeHtml(skill)}')" style="background:none;border:none;color:inherit;cursor:pointer;margin-left:4px;">×</button></span>`).join('')}
                    </div>
                    <button class="btn btn-primary btn-small" onclick="openAddSkillModal()" style="margin-top:12px;">${t('addSkill')}</button>
                </div>
            `;
            
            // Show subscribable projects if creator
            if (user.user_role === 'creator') {
                html += `
                    <div style="margin-bottom:24px;">
                        <h4>${t('mySubscribableProjects')}</h4>
                        <div id="subscribable-projects-list"></div>
                        <button class="btn btn-primary btn-small" onclick="openPublishSubscribableModal()" style="margin-top:12px;">${t('publishSubscribableProject')}</button>
                    </div>
                `;
            }
            
            profileContent.innerHTML = html;
            
            // Load subscribable projects if creator
            if (user.user_role === 'creator') {
                loadSubscribableProjects();
            }
        } else {
            profileContent.innerHTML = `<p style="color:#e74c3c;">${t('error')}</p>`;
        }
    } catch (err) {
        profileContent.innerHTML = `<p style="color:#e74c3c;">${t('error')}</p>`;
    }
}

async function loadSubscribableProjects() {
    const list = document.getElementById('subscribable-projects-list');
    if (!list) return;
    
    list.innerHTML = `<div class="loading">${t('loading')}</div>`;
    
    try {
        const res = await fetch('../backend/api/api.php?action=get_my_subscribable_projects');
        const data = await res.json();
        
        if (data.code === 200 && data.projects) {
            if (data.projects.length === 0) {
                list.innerHTML = `<p style="color:#999;">${t('noData')}</p>`;
                return;
            }
            
            let html = '<div class="card-grid">';
            data.projects.forEach(project => {
                const created = new Date(project.created_at).toLocaleDateString();
                html += `
                    <div class="project-card">
                        <div class="project-title">${escapeHtml(project.title)}</div>
                        <div class="project-desc">${escapeHtml(project.description || '')}</div>
                        <div class="project-meta">
                            <span>${t('projectPrice')}: $${project.price || 0}</span>
                            <span>${t('subscribers')}: ${project.subscriber_count || 0}</span>
                            <span>${t('createdAt')}: ${created}</span>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            list.innerHTML = html;
        } else {
            list.innerHTML = `<p style="color:#e74c3c;">${t('error')}</p>`;
        }
    } catch (err) {
        list.innerHTML = `<p style="color:#e74c3c;">${t('error')}</p>`;
    }
}

function openAddSkillModal() {
    const skill = prompt(t('skillName') + ':');
    if (skill && skill.trim()) {
        addSkill(skill.trim());
    }
}

async function addSkill(skill) {
    try {
        const res = await fetch('../backend/api/api.php?action=add_skill', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ skill: skill })
        });
        const data = await res.json();
        
        if (data.code === 200) {
            alert(t('success'));
            loadProfile();
        } else {
            alert(data.message);
        }
    } catch (err) {
        alert(t('error'));
    }
}

async function deleteSkill(skill) {
    if (!confirm(`Delete skill "${skill}"?`)) return;
    
    try {
        const res = await fetch('../backend/api/api.php?action=delete_skill', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ skill: skill })
        });
        const data = await res.json();
        
        if (data.code === 200) {
            loadProfile();
            alert('Skill deleted');
        } else {
            alert(data.message);
        }
    } catch (err) {
        alert(t('error'));
    }
}

function openPublishSubscribableModal() {
    const title = prompt(t('projectTitle') + ':');
    if (!title || !title.trim()) return;
    
    const description = prompt(t('projectDescription') + ':');
    const price = prompt(t('projectPrice') + ':');
    
    publishSubscribableProject(title.trim(), description ? description.trim() : '', price ? parseFloat(price) : 0);
}

async function publishSubscribableProject(title, description, price) {
    try {
        const res = await fetch('../backend/api/api.php?action=publish_subscribable_project', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: title,
                description: description,
                price: price
            })
        });
        const data = await res.json();
        
        if (data.code === 200) {
            alert(t('success'));
            loadProfile();
        } else {
            alert(data.message);
        }
    } catch (err) {
        alert(t('error'));
    }
}

// ===== Task Market =====
async function loadTaskMarket() {
    const projectsList = document.getElementById('projects-list');
    projectsList.innerHTML = `<div class="loading">${t('loading')}</div>`;
    
    try {
        const res = await fetch('../backend/api/api.php?action=get_collaboration_projects');
        const data = await res.json();
        
        if (data.code === 200 && data.projects) {
            if (data.projects.length === 0) {
                projectsList.innerHTML = `<p style="text-align:center;color:#999;">${t('noData')}</p>`;
                return;
            }
            
            let html = '<div class="card-grid">';
            data.projects.forEach(project => {
                const statusClass = `status-${project.status.replace('_', '-')}`;
                const statusText = t(project.status.replace('_', ''));
                
                html += `
                    <div class="project-card">
                        <div class="project-title">${escapeHtml(project.title)}</div>
                        <div class="project-desc">${escapeHtml(project.description || '')}</div>
                        <div class="project-meta">
                            <span>${t('budget')}: $${project.budget || 0}</span>
                            <span class="status-badge ${statusClass}">${statusText}</span>
                        </div>
                        <div class="project-actions">
                            <button class="btn btn-primary btn-small" onclick="viewProjectDetails(${project.id})">${t('viewDetails')}</button>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            projectsList.innerHTML = html;
        } else {
            projectsList.innerHTML = `<p style="color:#e74c3c;">${t('error')}</p>`;
        }
    } catch (err) {
        projectsList.innerHTML = `<p style="color:#e74c3c;">${t('error')}</p>`;
    }
}

function openCreateProjectModal() {
    if (currentUser.user_role !== 'requester') {
        alert('Please switch to Requester role to create projects');
        return;
    }
    document.getElementById('createProjectModal').classList.add('show');
}

function closeCreateProjectModal() {
    document.getElementById('createProjectModal').classList.remove('show');
    document.getElementById('projectTitle').value = '';
    document.getElementById('projectDescription').value = '';
    document.getElementById('projectBudget').value = '';
    document.getElementById('projectSkills').value = '';
}

async function submitProject() {
    const title = document.getElementById('projectTitle').value.trim();
    const description = document.getElementById('projectDescription').value.trim();
    const budget = document.getElementById('projectBudget').value.trim();
    const skills = document.getElementById('projectSkills').value.trim();
    
    if (!title || !description) {
        alert('Please fill in required fields');
        return;
    }
    
    try {
        const res = await fetch('../backend/api/api.php?action=create_collaboration_project', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: title,
                description: description,
                budget: parseFloat(budget) || 0,
                tags: skills
            })
        });
        const data = await res.json();
        
        if (data.code === 200) {
            closeCreateProjectModal();
            loadTaskMarket();
            alert(t('success'));
        } else {
            alert(data.message);
        }
    } catch (err) {
        alert(t('error'));
    }
}

// ===== Project Details =====
function viewProjectDetails(projectId) {
    selectedProjectId = projectId;
    switchTab('project');
    // Immediately load project details
    setTimeout(() => loadProjectDetail(), 100);
}

async function loadProjectDetail() {
    const projectDetails = document.getElementById('project-details');
    
    // If no project selected, show message
    if (!selectedProjectId) {
        projectDetails.innerHTML = `<p style="color:#666;">${t('selectProjectFromTaskMarket')}</p>`;
        return;
    }
    
    projectDetails.innerHTML = `<div class="loading">${t('loading')}</div>`;
    
    try {
        const res = await fetch(`../backend/api/api.php?action=get_collaboration_project&project_id=${selectedProjectId}`);
        const data = await res.json();
        
        if (data.code === 200 && data.project) {
            const project = data.project;
            const statusClass = `status-${project.status.replace('_', '-')}`;
            const statusText = t(project.status.replace('_', ''));
            const isRequester = currentUser.id === project.requester_id;
            const isCreator = currentUser.id === project.creator_id;
            const canApply = currentUser.user_role === 'creator' && project.status === 'open' && !project.creator_id;
            const canWithdraw = isRequester && project.status === 'open';
            const canConfirm = (isRequester || isCreator) && project.status === 'in_progress';
            
            let html = `
                <div style="margin-bottom:24px;">
                    <h3>${escapeHtml(project.title)}</h3>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </div>
                
                <div style="margin-bottom:16px;">
                    <p style="color:#666;line-height:1.6;">${escapeHtml(project.description || '')}</p>
                </div>
                
                <div style="margin-bottom:16px;">
                    <strong>${t('budget')}:</strong> $${project.budget || 0}
                </div>
                
                <div style="margin-bottom:16px;">
                    <strong>${t('requester')}:</strong> ${escapeHtml(project.requester_username || 'Unknown')}
                </div>
                
                <div style="margin-bottom:16px;">
                    <strong>${t('creator')}:</strong> ${project.creator_username ? escapeHtml(project.creator_username) : t('notAssigned')}
                </div>
                
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
            `;
            
            if (canApply) {
                html += `<button class="btn btn-primary" onclick="applyForProject(${project.id})">${t('applyForProject')}</button>`;
            }
            
            if (canConfirm) {
                html += `<button class="btn btn-primary" onclick="confirmCompletion(${project.id})">${t('confirmCompletion')}</button>`;
            }
            
            if (canWithdraw && !project.withdrawn) {
                html += `<button class="btn btn-secondary" onclick="withdrawProject(${project.id})">${t('withdraw')}</button>`;
            }
            
            if (project.status === 'closed' && (isRequester || isCreator)) {
                html += `<button class="btn btn-primary" onclick="openReviewModal(${project.id})">${t('writeReview')}</button>`;
            }
            
            html += `</div>`;
            
            projectDetails.innerHTML = html;
        } else {
            projectDetails.innerHTML = `<p style="color:#e74c3c;">${t('error')}</p>`;
        }
    } catch (err) {
        projectDetails.innerHTML = `<p style="color:#e74c3c;">${t('error')}</p>`;
    }
}

async function applyForProject(projectId) {
    try {
        const res = await fetch('../backend/api/api.php?action=apply_collaboration_project', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ project_id: projectId })
        });
        const data = await res.json();
        
        if (data.code === 200) {
            alert(t('success'));
            loadProjectDetail();
        } else {
            alert(data.message);
        }
    } catch (err) {
        alert(t('error'));
    }
}

async function confirmCompletion(projectId) {
    if (!confirm(t('confirmCompletion') + '?')) return;
    
    try {
        const res = await fetch('../backend/api/api.php?action=confirm_project_completion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ project_id: projectId })
        });
        const data = await res.json();
        
        if (data.code === 200) {
            alert(t('completionConfirmed'));
            loadProjectDetail();
        } else {
            alert(data.message);
        }
    } catch (err) {
        alert(t('error'));
    }
}

async function withdrawProject(projectId) {
    if (!confirm(t('confirmWithdraw'))) return;
    
    try {
        const res = await fetch('../backend/api/api.php?action=withdraw_project', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ project_id: projectId })
        });
        const data = await res.json();
        
        if (data.code === 200) {
            alert(t('projectWithdrawn'));
            loadProjectDetail();
        } else {
            alert(data.message);
        }
    } catch (err) {
        alert(t('error'));
    }
}

function openReviewModal(projectId) {
    const rating = prompt(t('rating') + ' (1-5):');
    if (!rating || isNaN(rating) || rating < 1 || rating > 5) return;
    
    const comment = prompt(t('reviewComment') + ':');
    
    submitReview(projectId, parseInt(rating), comment || '');
}

async function submitReview(projectId, rating, comment) {
    try {
        const res = await fetch('../backend/api/api.php?action=submit_project_review', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                project_id: projectId,
                rating: rating,
                comment: comment
            })
        });
        const data = await res.json();
        
        if (data.code === 200) {
            alert(t('reviewSubmitted'));
            loadProjectDetail();
        } else {
            alert(data.message);
        }
    } catch (err) {
        alert(t('error'));
    }
}

// ===== Matching =====
async function searchCreators() {
    const skill = document.getElementById('skillSearchInput').value.trim();
    const creatorsList = document.getElementById('creators-list');
    
    if (!skill) {
        alert('Please enter a skill to search');
        return;
    }
    
    creatorsList.innerHTML = `<div class="loading">${t('loading')}</div>`;
    
    try {
        const res = await fetch(`../backend/api/api.php?action=get_matching_creators&tags=${encodeURIComponent(skill)}`);
        const data = await res.json();
        
        if (data.code === 200 && data.creators) {
            if (data.creators.length === 0) {
                creatorsList.innerHTML = `<p style="text-align:center;color:#999;">${t('noData')}</p>`;
                return;
            }
            
            let html = '<div class="card-grid">';
            data.creators.forEach(creator => {
                const skills = creator.skills ? creator.skills.split(',').map(s => s.trim()).filter(s => s) : [];
                
                html += `
                    <div class="project-card">
                        <div class="project-title">${escapeHtml(creator.username)}</div>
                        <div class="project-meta">
                            <span>${t('reputation')}: ${creator.reputation_score || 0}</span>
                        </div>
                        <div class="skill-tags">
                            ${skills.map(skill => `<span class="skill-tag">${escapeHtml(skill)}</span>`).join('')}
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            creatorsList.innerHTML = html;
        } else {
            creatorsList.innerHTML = `<p style="color:#e74c3c;">${t('error')}</p>`;
        }
    } catch (err) {
        creatorsList.innerHTML = `<p style="color:#e74c3c;">${t('error')}</p>`;
    }
}

// ===== WorkBench =====
let currentWorkbenchProjectId = null;

async function loadWorkBench() {
    const projectListDiv = document.getElementById('workbench-project-list');
    projectListDiv.innerHTML = `<div class="loading">${t('loading')}</div>`;
    
    // Hide chat view
    document.getElementById('workbench-chat').style.display = 'none';
    document.getElementById('workbench-project-list').style.display = 'block';
    
    try {
        const res = await fetch('../backend/api/api.php?action=get_my_projects');
        const data = await res.json();
        
        if (data.code === 200) {
            let html = '';
            
            // Projects as requester
            if (data.as_requester && data.as_requester.length > 0) {
                html += `<h4>${t('asRequester')}</h4>`;
                html += '<div class="card-grid">';
                data.as_requester.forEach(project => {
                    const statusClass = `status-${project.status.replace('_', '-')}`;
                    const statusText = t(project.status.replace('_', ''));
                    
                    html += `
                        <div class="project-card">
                            <div class="project-title">${escapeHtml(project.title)}</div>
                            <div class="project-meta">
                                <span class="status-badge ${statusClass}">${statusText}</span>
                                <span>Creator: ${escapeHtml(project.creator_username || 'Not assigned')}</span>
                            </div>
                            <div class="project-actions">
                                <button class="btn btn-primary btn-small" onclick="openWorkbenchChat(${project.id})">${t('openWorkbench')}</button>
                            </div>
                        </div>
                    `;
                });
                html += '</div>';
            }
            
            // Projects as creator
            if (data.as_creator && data.as_creator.length > 0) {
                html += `<h4 style="margin-top:24px;">${t('asCreator')}</h4>`;
                html += '<div class="card-grid">';
                data.as_creator.forEach(project => {
                    const statusClass = `status-${project.status.replace('_', '-')}`;
                    const statusText = t(project.status.replace('_', ''));
                    
                    html += `
                        <div class="project-card">
                            <div class="project-title">${escapeHtml(project.title)}</div>
                            <div class="project-meta">
                                <span class="status-badge ${statusClass}">${statusText}</span>
                                <span>Requester: ${escapeHtml(project.requester_username)}</span>
                            </div>
                            <div class="project-actions">
                                <button class="btn btn-primary btn-small" onclick="openWorkbenchChat(${project.id})">${t('openWorkbench')}</button>
                            </div>
                        </div>
                    `;
                });
                html += '</div>';
            }
            
            if (!html) {
                html = `<p style="text-align:center;color:#999;">${t('noData')}</p>`;
            }
            
            projectListDiv.innerHTML = html;
        } else {
            projectListDiv.innerHTML = `<p style="color:#e74c3c;">${t('error')}</p>`;
        }
    } catch (err) {
        projectListDiv.innerHTML = `<p style="color:#e74c3c;">${t('error')}</p>`;
    }
}

function backToProjectList() {
    currentWorkbenchProjectId = null;
    document.getElementById('workbench-chat').style.display = 'none';
    document.getElementById('workbench-project-list').style.display = 'block';
}

async function openWorkbenchChat(projectId) {
    currentWorkbenchProjectId = projectId;
    
    // Hide project list, show chat
    document.getElementById('workbench-project-list').style.display = 'none';
    document.getElementById('workbench-chat').style.display = 'block';
    
    // Load project info
    await loadWorkbenchProjectInfo(projectId);
    
    // Load messages
    await loadWorkbenchMessages(projectId);
}

async function loadWorkbenchProjectInfo(projectId) {
    const infoDiv = document.getElementById('workbench-project-info');
    
    try {
        const res = await fetch(`../backend/api/api.php?action=get_collaboration_project&id=${projectId}`);
        const data = await res.json();
        
        if (data.code === 200 && data.project) {
            const project = data.project;
            const statusClass = `status-${project.status.replace('_', '-')}`;
            const statusText = t(project.status.replace('_', ''));
            const isRequester = currentUser.id === project.requester_id;
            const isCreator = currentUser.id === project.creator_id;
            
            let html = `
                <div style="background:#f5f7fa;padding:16px;border-radius:8px;">
                    <h3 style="margin-bottom:12px;">${escapeHtml(project.title)}</h3>
                    <p style="color:#666;margin-bottom:12px;">${escapeHtml(project.description || '')}</p>
                    <div style="display:flex;gap:16px;flex-wrap:wrap;font-size:0.9rem;">
                        <span><strong>${t('status')}:</strong> <span class="status-badge ${statusClass}">${statusText}</span></span>
                        <span><strong>${t('budget')}:</strong> $${project.budget || 0}</span>
                        <span><strong>${t('requester')}:</strong> ${escapeHtml(project.requester_username)}</span>
                        <span><strong>${t('creator')}:</strong> ${escapeHtml(project.creator_username || 'Not assigned')}</span>
                    </div>
            `;
            
            // Add action buttons
            if ((isRequester || isCreator) && project.status === 'in_progress') {
                html += `
                    <div style="margin-top:12px;">
                        <button class="btn btn-primary btn-small" onclick="confirmCompletion(${project.id})">${t('confirmCompletion')}</button>
                    </div>
                `;
            }
            
            html += `</div>`;
            infoDiv.innerHTML = html;
        }
    } catch (err) {
        infoDiv.innerHTML = `<p style="color:#e74c3c;">${t('error')}</p>`;
    }
}

async function loadWorkbenchMessages(projectId) {
    const messagesDiv = document.getElementById('workbench-messages');
    messagesDiv.innerHTML = `<div class="loading">${t('loading')}</div>`;
    
    try {
        const res = await fetch(`../backend/api/api.php?action=get_project_messages&project_id=${projectId}`);
        const data = await res.json();
        
        if (data.code === 200 && data.messages) {
            if (data.messages.length === 0) {
                messagesDiv.innerHTML = `<p style="color:#999;text-align:center;">${t('noMessages')}</p>`;
                return;
            }
            
            let html = '';
            data.messages.forEach(msg => {
                const isMine = msg.user_id === currentUser.id;
                const alignClass = isMine ? 'text-align:right;' : 'text-align:left;';
                const bgColor = isMine ? '#667eea' : '#e9ecef';
                const textColor = isMine ? 'white' : '#333';
                
                html += `
                    <div style="${alignClass}margin-bottom:12px;">
                        <div style="display:inline-block;max-width:70%;">
                            <div style="font-size:0.85rem;color:#666;margin-bottom:4px;">${escapeHtml(msg.username)}</div>
                            <div style="background:${bgColor};color:${textColor};padding:10px 14px;border-radius:12px;">
                                ${escapeHtml(msg.message)}
                            </div>
                            <div style="font-size:0.75rem;color:#999;margin-top:4px;">${new Date(msg.createdAt).toLocaleString()}</div>
                        </div>
                    </div>
                `;
            });
            
            messagesDiv.innerHTML = html;
            // Scroll to bottom
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        } else {
            messagesDiv.innerHTML = `<p style="color:#e74c3c;">${t('error')}</p>`;
        }
    } catch (err) {
        messagesDiv.innerHTML = `<p style="color:#e74c3c;">${t('error')}</p>`;
    }
}

async function sendProjectMessage() {
    const input = document.getElementById('workbench-message-input');
    const message = input.value.trim();
    
    if (!message) {
        alert('Please enter a message');
        return;
    }
    
    if (!currentWorkbenchProjectId) {
        alert('No project selected');
        return;
    }
    
    try {
        const res = await fetch('../backend/api/api.php?action=send_project_message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                project_id: currentWorkbenchProjectId,
                message: message
            })
        });
        const data = await res.json();
        
        if (data.code === 200) {
            input.value = '';
            await loadWorkbenchMessages(currentWorkbenchProjectId);
        } else {
            alert(data.message);
        }
    } catch (err) {
        alert(t('error'));
    }
}
