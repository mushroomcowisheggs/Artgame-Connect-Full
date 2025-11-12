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
            `;
            profileContent.innerHTML = html;
            
            // 加载我的项目
            loadMyProjects();
            
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

// 暴露给全局
window.loadProfile = loadProfile;
window.addSkill = addSkill;
window.searchCreators = searchCreators;
window.loadMyProjects = loadMyProjects;
