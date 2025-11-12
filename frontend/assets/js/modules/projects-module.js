/**
 * Projects Module
 * 项目模块（任务市场、项目详情等）
 */

let selectedProjectId = null;

/**
 * 加载任务市场
 */
async function loadTaskMarket() {
    const projectsList = document.getElementById('projects-list');
    projectsList.innerHTML = `<div class="loading">${t('loadingProjects')}</div>`;
    
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
                const tags = project.tags ? project.tags.split(',').map(t => t.trim()).filter(t => t) : [];
                
                html += `
                    <div class="project-card">
                        <div class="project-title">${escapeHtml(project.title)}</div>
                        <div class="project-desc">${escapeHtml(project.description || '')}</div>
                        <div class="project-meta">
                            <span class="status-badge ${statusClass}">${statusText}</span>
                            <span>${t('budget')}: $${project.budget || 0}</span>
                        </div>
                        ${tags.length > 0 ? `<div class="skill-tags">${tags.map(tag => `<span class="skill-tag">${escapeHtml(tag)}</span>`).join('')}</div>` : ''}
                        <div class="project-actions">
                            <button class="btn btn-primary btn-small" onclick="viewProjectDetail(${project.id})">${t('viewDetails')}</button>
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

/**
 * 查看项目详情
 */
function viewProjectDetail(projectId) {
    selectedProjectId = projectId;
    switchTab('project');
}

/**
 * 加载项目详情
 */
async function loadProjectDetail() {
    const projectDetails = document.getElementById('project-details');
    
    if (!selectedProjectId) {
        projectDetails.innerHTML = `<p style="text-align:center;color:#999;">${t('selectProject')}</p>`;
        return;
    }
    
    projectDetails.innerHTML = `<div class="loading">${t('loading')}</div>`;
    
    try {
        const res = await fetch(`../backend/api/api.php?action=get_collaboration_project&project_id=${selectedProjectId}`);
        const data = await res.json();
        
        if (data.code === 200 && data.project) {
            const project = data.project;
            const user = getCurrentUser();
            const isRequester = user.id === project.requester_id;
            const isCreator = user.id === project.creator_id;
            const canApply = !isRequester && !isCreator && project.status === 'open' && user.user_role === 'creator';
            
            const statusClass = `status-${project.status.replace('_', '-')}`;
            const statusText = t(project.status.replace('_', ''));
            const tags = project.tags ? project.tags.split(',').map(t => t.trim()).filter(t => t) : [];
            
            let html = `
                <div class="project-detail-header">
                    <h2>${escapeHtml(project.title)}</h2>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </div>
                
                <div class="project-detail-section">
                    <h3>${t('description')}</h3>
                    <p>${escapeHtml(project.description || t('noDescription'))}</p>
                </div>
                
                <div class="project-detail-section">
                    <h3>${t('projectInfo')}</h3>
                    <div class="project-meta">
                        <span><strong>${t('budget')}:</strong> $${project.budget || 0}</span>
                        <span><strong>${t('requester')}:</strong> ${escapeHtml(project.requester?.username || 'Unknown')}</span>
                        <span><strong>${t('creator')}:</strong> ${escapeHtml(project.creator?.username || t('notAssigned'))}</span>
                        <span><strong>${t('createdAt')}:</strong> ${new Date(project.created_at).toLocaleDateString()}</span>
                    </div>
                    ${tags.length > 0 ? `<div class="skill-tags" style="margin-top:12px;">${tags.map(tag => `<span class="skill-tag">${escapeHtml(tag)}</span>`).join('')}</div>` : ''}
                </div>
            `;
            
            // 申请按钮
            if (canApply) {
                html += `
                    <div class="project-actions">
                        <button class="btn btn-primary" onclick="applyForProject(${project.id})">${t('applyForProject')}</button>
                    </div>
                `;
            }
            
            // 项目操作按钮（需求方和创作者）
            if (isRequester || isCreator) {
                html += `
                    <div class="project-actions">
                        ${isRequester && project.status === 'open' ? `<button class="btn btn-secondary" onclick="withdrawProject(${project.id})">${t('withdrawProject')}</button>` : ''}
                        ${(isRequester || isCreator) && project.status === 'in_progress' ? `<button class="btn btn-primary" onclick="confirmCompletion(${project.id})">${t('confirmCompletion')}</button>` : ''}
                        ${(isRequester || isCreator) && project.status === 'closed' ? `<button class="btn btn-primary" onclick="openReviewModal(${project.id})">${t('submitReview')}</button>` : ''}
                    </div>
                `;
            }
            
            projectDetails.innerHTML = html;
        } else {
            projectDetails.innerHTML = `<p style="color:#e74c3c;">${t('error')}</p>`;
        }
    } catch (err) {
        projectDetails.innerHTML = `<p style="color:#e74c3c;">${t('error')}</p>`;
    }
}

/**
 * 申请项目
 */
async function applyForProject(projectId) {
    if (!confirm(t('confirmApply'))) return;
    
    try {
        const res = await fetch('../backend/api/api.php?action=apply_collaboration_project', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ project_id: projectId })
        });
        const data = await res.json();
        
        if (data.code === 200) {
            alert(t('applicationSubmitted'));
            loadProjectDetail();
        } else {
            alert(data.message);
        }
    } catch (err) {
        alert(t('error'));
    }
}

/**
 * 确认完成
 */
async function confirmCompletion(projectId) {
    if (!confirm(t('confirmProjectCompletion'))) return;
    
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

/**
 * 撤回项目
 */
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

/**
 * 打开评价弹窗
 */
function openReviewModal(projectId) {
    const rating = prompt(t('rating') + ' (1-5):');
    if (!rating || isNaN(rating) || rating < 1 || rating > 5) return;
    
    const comment = prompt(t('reviewComment') + ':');
    
    submitReview(projectId, parseInt(rating), comment || '');
}

/**
 * 提交评价
 */
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

/**
 * 打开创建项目弹窗
 */
function openCreateProjectModal() {
    document.getElementById('createProjectModal').classList.add('show');
}

/**
 * 关闭创建项目弹窗
 */
function closeCreateProjectModal() {
    document.getElementById('createProjectModal').classList.remove('show');
    document.getElementById('projectTitle').value = '';
    document.getElementById('projectDescription').value = '';
    document.getElementById('projectBudget').value = '';
    document.getElementById('projectSkills').value = '';
}

/**
 * 提交创建项目
 */
async function submitCreateProject() {
    const title = document.getElementById('projectTitle').value.trim();
    const description = document.getElementById('projectDescription').value.trim();
    const budget = parseFloat(document.getElementById('projectBudget').value) || 0;
    const tags = document.getElementById('projectSkills').value.trim();
    
    if (!title) {
        alert('Please enter project title');
        return;
    }
    
    try {
        const res = await fetch('../backend/api/api.php?action=create_collaboration_project', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: title,
                description: description,
                budget: budget,
                tags: tags
            })
        });
        const data = await res.json();
        
        if (data.code === 200) {
            closeCreateProjectModal();
            loadTaskMarket();
            alert(t('projectCreated'));
        } else {
            alert(data.message);
        }
    } catch (err) {
        alert(t('error'));
    }
}
