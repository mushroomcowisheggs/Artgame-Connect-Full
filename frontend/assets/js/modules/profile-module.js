/**
 * Profile Module
 * 用户资料模块
 */

/**
 * 加载用户资料页面
 */
async function loadProfile() {
    const profileContent = document.getElementById('profile-content');
    profileContent.innerHTML = `<div class="loading">${t('loadingProfile')}</div>`;
    
    const user = getCurrentUser();
    if (!user) {
        profileContent.innerHTML = `<p style="color:#e74c3c;">${t('notLoggedIn')}</p>`;
        return;
    }

    try {
        const res = await fetch('../backend/api/api.php?action=get_user_profile');
        const data = await res.json();
        
        if (data.code === 200 && data.profile) {
            const profile = data.profile;
            const skills = parseSkills(profile.skills);
            
            let html = `
                <div class="profile-header">
                    <img src="${profile.avatar && profile.avatar.trim() ? profile.avatar : './assets/images/avatar_32.png'}" alt="Avatar" class="profile-avatar">
                    <h2>${escapeHtml(profile.username)}</h2>
                    <p class="profile-role">${profile.user_role === 'requester' ? t('requester') : t('creator')}</p>
                    <p class="profile-score">${t('reputationScore')}: ${profile.reputation_score}</p>
                    <div class="profile-badges">
                        ${profile.badges ? JSON.parse(profile.badges).map(badge => `<span class="badge">${escapeHtml(badge)}</span>`).join('') : ''}
                    </div>
                </div>
                
                <div class="profile-section">
                    <h3>${t('skills')}</h3>
                    <div class="skill-tags">
                        ${skills.map(skill => `<span class="skill-tag">${escapeHtml(skill)}</span>`).join('')}
                    </div>
                    <input type="text" id="newSkillInput" placeholder="${t('addSkillPlaceholder')}" style="margin-top:10px;">
                    <button class="btn btn-secondary btn-small" onclick="addSkill()">${t('addSkill')}</button>
                </div>
                
                <div class="profile-section">
                    <h3>${t('myProjects')}</h3>
                    <div id="my-projects-list">
                        ${t('loading')}
                    </div>
                </div>
                
                <div class="profile-section">
                    <h3>${t('personalProjects')}</h3>
                    <div id="personal-projects-list">
                        ${t('loading')}
                    </div>
                    <button class="btn btn-primary btn-small" onclick="openAddPersonalProjectModal()" style="margin-top:12px;">${t('addPersonalProject')}</button>
                </div>
            `;
            profileContent.innerHTML = html;
            
            // 加载我的项目
            loadMyProjects();
            loadPersonalProjects();
            
        } else {
            profileContent.innerHTML = `<p style="color:#e74c3c;">${data.message || t('error')}</p>`;
        }
    } catch (err) {
        profileContent.innerHTML = `<p style="color:#e74c3c;">${t('error')}</p>`;
    }
}

/**
 * 加载我的项目
 */
async function loadMyProjects() {
    const myProjectsList = document.getElementById('my-projects-list');
    if (!myProjectsList) return;
    myProjectsList.innerHTML = `<div class="loading">${t('loading')}</div>`;
    
    try {
        const res = await fetch('../backend/api/api.php?action=get_my_subscribable_projects');
        const data = await res.json();
        
        if (data.code === 200 && data.projects) {
            if (data.projects.length === 0) {
                myProjectsList.innerHTML = `<p style="text-align:center;color:#999;">${t('noProjects')}</p>`;
                return;
            }
            
            let html = '<ul>';
            data.projects.forEach(project => {
                html += `<li>${escapeHtml(project.title)} (${project.status})</li>`;
            });
            html += '</ul>';
            myProjectsList.innerHTML = html;
        } else {
            myProjectsList.innerHTML = `<p style="color:#e74c3c;">${t('error')}</p>`;
        }
    } catch (err) {
        myProjectsList.innerHTML = `<p style="color:#e74c3c;">${t('error')}</p>`;
    }
}

/**
 * 添加技能
 */
async function addSkill() {
    const skillInput = document.getElementById('newSkillInput');
    const skill = skillInput.value.trim();
    
    if (!skill) {
        alert(t('enterSkill'));
        return;
    }
    
    try {
        const res = await fetch('../backend/api/api.php?action=add_skill', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ skill: skill })
        });
        const data = await res.json();
        
        if (data.code === 200) {
            skillInput.value = '';
            loadProfile(); // 重新加载资料以更新技能列表
        } else {
            alert(data.message);
        }
    } catch (err) {
        alert(t('error'));
    }
}

/**
 * 搜索创作者
 */
async function searchCreators() {
    const searchInput = document.getElementById('skillSearchInput');
    const tags = searchInput.value.trim();
    const creatorsList = document.getElementById('creators-list');
    
    if (!tags) {
        creatorsList.innerHTML = `<p style="text-align:center;color:#999;">${t('enterTags')}</p>`;
        return;
    }
    
    creatorsList.innerHTML = `<div class="loading">${t('searching')}</div>`;
    
    try {
        const res = await fetch(`../backend/api/api.php?action=get_matching_creators&tags=${encodeURIComponent(tags)}`);
        const data = await res.json();
        
        if (data.code === 200 && data.creators) {
            if (data.creators.length === 0) {
                creatorsList.innerHTML = `<p style="text-align:center;color:#999;">${t('noCreatorsFound')}</p>`;
                return;
            }
            
            let html = '<div class="creator-list">';
            data.creators.forEach(creator => {
                const skills = parseSkills(creator.skills);
                html += `
                    <div class="creator-card">
                        <div class="creator-info">
                            <img src="${creator.avatar && creator.avatar.trim() ? creator.avatar : './assets/images/avatar_32.png'}" alt="Avatar" class="creator-avatar">
                            <div>
                                <h3>${escapeHtml(creator.username)}</h3>
                                <p>${t('reputationScore')}: ${creator.reputation_score}</p>
                            </div>
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
            creatorsList.innerHTML = `<p style="color:#e74c3c;">${data.message || t('error')}</p>`;
        }
    } catch (err) {
        creatorsList.innerHTML = `<p style="color:#e74c3c;">${t('error')}</p>`;
    }
}

/**
 * 加载个人项目列表
 */
async function loadPersonalProjects() {
    const personalProjectsList = document.getElementById('personal-projects-list');
    if (!personalProjectsList) return;
    personalProjectsList.innerHTML = `<div class="loading">${t('loading')}</div>`;
    
    try {
        const res = await fetch('../backend/api/api.php?action=get_personal_projects');
        const data = await res.json();
        
        if (data.code === 200 && data.projects) {
            if (data.projects.length === 0) {
                personalProjectsList.innerHTML = `<p style="text-align:center;color:#999;">${t('noPersonalProjects')}</p>`;
                return;
            }
            
            let html = '<div class="personal-projects-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:16px;">';
            data.projects.forEach(project => {
                html += `
                    <div class="personal-project-card" style="border:1px solid #ddd;border-radius:8px;padding:12px;">
                        ${project.image ? `<img src="${escapeHtml(project.image)}" alt="Project" style="width:100%;height:150px;object-fit:cover;border-radius:4px;margin-bottom:8px;">` : ''}
                        <h4 style="margin:0 0 8px 0;">${escapeHtml(project.title)}</h4>
                        <p style="font-size:13px;color:#666;margin:0 0 8px 0;">${escapeHtml(project.description || '')}</p>
                        ${project.link ? `<a href="${escapeHtml(project.link)}" target="_blank" style="font-size:13px;color:#667eea;">${t('viewProject')}</a>` : ''}
                        <button class="btn btn-danger btn-small" onclick="deletePersonalProject(${project.id})" style="margin-top:8px;">${t('delete')}</button>
                    </div>
                `;
            });
            html += '</div>';
            personalProjectsList.innerHTML = html;
        } else {
            personalProjectsList.innerHTML = `<p style="color:#e74c3c;">${t('error')}</p>`;
        }
    } catch (err) {
        personalProjectsList.innerHTML = `<p style="color:#e74c3c;">${t('error')}</p>`;
    }
}

/**
 * 打开添加个人项目对话框
 */
function openAddPersonalProjectModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:10000;';
    modal.innerHTML = `
        <div class="modal-content" style="background:white;padding:24px;border-radius:8px;max-width:500px;width:90%;">
            <h3>${t('addPersonalProject')}</h3>
            <input type="text" id="personalProjectTitle" placeholder="${t('projectTitle')}" style="width:100%;margin-bottom:12px;padding:8px;border:1px solid #ddd;border-radius:4px;">
            <textarea id="personalProjectDesc" placeholder="${t('projectDescription')}" style="width:100%;margin-bottom:12px;padding:8px;border:1px solid #ddd;border-radius:4px;height:80px;"></textarea>
            <input type="text" id="personalProjectImage" placeholder="${t('projectImageUrl')}" style="width:100%;margin-bottom:12px;padding:8px;border:1px solid #ddd;border-radius:4px;">
            <input type="text" id="personalProjectLink" placeholder="${t('projectLink')}" style="width:100%;margin-bottom:12px;padding:8px;border:1px solid #ddd;border-radius:4px;">
            <div style="display:flex;gap:12px;justify-content:flex-end;">
                <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">${t('cancel')}</button>
                <button class="btn btn-primary" onclick="submitPersonalProject()">${t('add')}</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

/**
 * 提交个人项目
 */
async function submitPersonalProject() {
    const title = document.getElementById('personalProjectTitle').value.trim();
    const description = document.getElementById('personalProjectDesc').value.trim();
    const image = document.getElementById('personalProjectImage').value.trim();
    const link = document.getElementById('personalProjectLink').value.trim();
    
    if (!title) {
        alert(t('projectTitleRequired'));
        return;
    }
    
    try {
        const res = await fetch('../backend/api/api.php?action=add_personal_project', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description, image, link })
        });
        const data = await res.json();
        
        if (data.code === 200) {
            document.querySelector('.modal').remove();
            loadPersonalProjects();
        } else {
            alert(data.message);
        }
    } catch (err) {
        alert(t('error'));
    }
}

/**
 * 删除个人项目
 */
async function deletePersonalProject(projectId) {
    if (!confirm(t('confirmDelete'))) return;
    
    try {
        const res = await fetch('../backend/api/api.php?action=delete_personal_project', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ project_id: projectId })
        });
        const data = await res.json();
        
        if (data.code === 200) {
            loadPersonalProjects();
        } else {
            alert(data.message);
        }
    } catch (err) {
        alert(t('error'));
    }
}

// 暴露给全局
window.loadProfile = loadProfile;
window.addSkill = addSkill;
window.searchCreators = searchCreators;
window.loadMyProjects = loadMyProjects;
window.loadPersonalProjects = loadPersonalProjects;
window.openAddPersonalProjectModal = openAddPersonalProjectModal;
window.submitPersonalProject = submitPersonalProject;
window.deletePersonalProject = deletePersonalProject;
