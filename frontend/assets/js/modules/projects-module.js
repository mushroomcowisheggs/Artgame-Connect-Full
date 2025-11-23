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
        const res = await fetch('../backend/api/api.php?action=get_collaboration_projects', {
            cache: 'no-store'
        });
        const data = await res.json();
        
            if (data.code === 200 && data.projects) {
                const user = getCurrentUser();
                const isAdmin = user && user.is_admin == 1;
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
                        <div class="project-desc" style="word-wrap:break-word;white-space:normal;overflow-wrap:break-word;">${escapeHtml(project.description || '')}</div>
                        <div class="project-meta">
                            <span class="status-badge ${statusClass}">${statusText}</span>
                            <span>${t('budget')}: $${project.budget || 0}</span>
                        </div>
                        ${tags.length > 0 ? `<div class="skill-tags">${tags.map(tag => `<span class="skill-tag">${escapeHtml(tag)}</span>`).join('')}</div>` : ''}
                        <div class="project-actions">
                            <button class="btn btn-primary btn-small" onclick="viewProjectDetail(${project.id})">${t('viewDetails')}</button>
                            ${isAdmin ? `<button class="btn btn-danger btn-small" onclick="deleteProject(${project.id})">${t('deleteProject') || 'Delete'}</button>` : ''}
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
 * 删除项目（管理员）
 */
async function deleteProject(projectId) {
    if (!confirm(t('confirmDeleteProject') || 'Are you sure you want to delete this project?')) return;
    try {
        const res = await fetch('../backend/api/api.php?action=delete_project', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ project_id: projectId })
        });
        const data = await res.json();
        if (data.code === 200) {
            alert(t('projectDeleted') || 'Project deleted');
            // 回到任务市场并刷新
            switchTab('taskmarket');
            loadTaskMarket();
        } else {
            alert(data.message || t('error'));
        }
    } catch (err) {
        alert(t('error'));
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
	        console.log('Project API response:', data); // 添加调试日志
	        
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
                <div class="project-detail-nav" style="margin-bottom:16px;display:flex;gap:8px;">
                    <button class="btn btn-secondary btn-small" onclick="switchTab('taskmarket')" data-i18n="backToTaskMarket">← ${t('backToTaskMarket')}</button>
                    <button class="btn btn-secondary btn-small" onclick="switchTab('workbench')" data-i18n="backToWorkbench">← ${t('backToWorkbench')}</button>
                </div>
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
                        <span><strong>${t('timeLimit')}:</strong> ${project.time_limit || 30} days</span>
                    </div>
                    ${tags.length > 0 ? `<div class="skill-tags" style="margin-top:12px;">${tags.map(tag => `<span class="skill-tag">${escapeHtml(tag)}</span>`).join('')}</div>` : ''}
                </div>
                
                <div class="project-detail-section">
                    <h3>${t('projectProgress')}</h3>
                    ${renderProjectProgress(project)}
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

            // 管理员可以删除项目
            if (user && user.is_admin == 1) {
                html += `
                    <div class="project-actions">
                        <button class="btn btn-danger" onclick="deleteProject(${project.id})">${t('deleteProject') || 'Delete Project'}</button>
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
    const timeLimit = parseInt(document.getElementById('projectTimeLimit').value) || 30;
    
    // 收集项目部分
    const parts = [];
    const partItems = document.querySelectorAll('.project-part-item');
    partItems.forEach((item, index) => {
        const titleInput = item.querySelector('.part-title');
        const percentageInput = item.querySelector('.part-percentage');
        if (titleInput && percentageInput) {
            const partTitle = titleInput.value.trim();
            const partPercentage = parseFloat(percentageInput.value) || 0;
            if (partTitle && partPercentage > 0) {
                parts.push({
                    title: partTitle,
                    percentage: partPercentage
                });
            }
        }
    });
    
    if (!title) {
        alert('Please enter project title');
        return;
    }
    
    if (parts.length > 9) {
        alert('Maximum 9 parts allowed');
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
                tags: tags,
                time_limit: timeLimit,
                parts: parts
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

/**
 * 添加項目部分
 */
function addPartItem() {
    const container = document.getElementById('project-parts-container');
    const partCount = container.querySelectorAll('.project-part-item').length;
    
    if (partCount >= 9) {
        alert('Maximum 9 parts allowed');
        return;
    }
    
    const partItem = document.createElement('div');
    partItem.className = 'project-part-item';
    partItem.style.cssText = 'display:flex;gap:8px;margin-bottom:8px;';
    partItem.innerHTML = `
        <input type="text" placeholder="Part ${partCount + 1} title" class="part-title" style="flex:2;">
        <input type="number" placeholder="%" class="part-percentage" style="flex:1;" min="0" max="100">
        <button type="button" class="btn btn-danger btn-small" onclick="removePartItem(this)" style="flex:0;">&times;</button>
    `;
    container.appendChild(partItem);
}

/**
 * 移除項目部分
 */
function removePartItem(button) {
    const container = document.getElementById('project-parts-container');
    const partCount = container.querySelectorAll('.project-part-item').length;
    
    if (partCount <= 1) {
        alert('At least one part is required');
        return;
    }
    
    button.closest('.project-part-item').remove();
}

/**
 * 渲染项目进度
 */
function renderProjectProgress(project) {
    const milestones = project.milestones || [];
    const createdDate = new Date(project.created_at);
    const currentDate = new Date();
    const timeLimit = project.time_limit || 30;
    const daysPassed = Math.floor((currentDate - createdDate) / (1000 * 60 * 60 * 24));
    const timeProgress = Math.min(100, (daysPassed / timeLimit) * 100);
    
    let html = '';
    
    // 时间进度条
    html += `
        <div style="margin-bottom:20px;">
            <h4 style="margin:0 0 8px 0;font-size:14px;">${t('timeProgress')}</h4>
            <div class="progress-bar-container">
                <div class="progress-bar-fill" style="width:${timeProgress}%;"></div>
                <div class="progress-bar-text">${daysPassed} / ${timeLimit} days (${timeProgress.toFixed(1)}%)</div>
            </div>
        </div>
    `;
    
    // 进度显示（优先显示milestones，没有milestones则显示parts）
    if (milestones.length > 0) {
        const completedMilestones = milestones.filter(m => m.status === 'completed');
        const taskProgress = (completedMilestones.length / milestones.length) * 100;
        
        html += `
            <div style="margin-bottom:20px;">
                <h4 style="margin:0 0 8px 0;font-size:14px;">${t('milestoneProgress')}</h4>
                <div class="progress-bar-container">
                    <div class="progress-bar-fill" style="width:${taskProgress}%;"></div>
                    <div class="progress-bar-text">${completedMilestones.length} / ${milestones.length} milestones (${taskProgress.toFixed(1)}%)</div>
                </div>
            </div>
        `;
        
        // 里程碑列表
        html += `
            <div style="margin-top:16px;">
                <h4 style="margin:0 0 8px 0;font-size:14px;">${t('milestones')}</h4>
                <div style="display:flex;flex-direction:column;gap:8px;">
        `;
        
        milestones.forEach((milestone, index) => {
            const statusClass = milestone.status === 'completed' ? 'status-completed' : 
                              milestone.status === 'review' ? 'status-review' : 
                              milestone.status === 'in_progress' ? 'status-in-progress' : 'status-planning';
            const statusText = milestone.status === 'completed' ? t('completed') : 
                             milestone.status === 'review' ? t('review') : 
                             milestone.status === 'in_progress' ? t('inProgress') : t('planning');
            html += `
                <div style="padding:12px;background:#f9f9f9;border-radius:6px;display:flex;justify-content:space-between;align-items:center;">
                    <div>
                        <strong>${index + 1}. ${escapeHtml(milestone.title)}</strong>
                        <span style="margin-left:12px;" class="status-badge ${statusClass}">${statusText}</span>
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    } else if (project.parts && project.parts.length > 0) {
        // 没有milestones但有parts时，显示parts进度
        const totalPartsProgress = project.parts.reduce((sum, part) => sum + (part.percentage || 0), 0);
        const avgPartsProgress = totalPartsProgress / project.parts.length;
        
        html += `
            <div style="margin-bottom:20px;">
                <h4 style="margin:0 0 8px 0;font-size:14px;">${t('partsProgress') || 'Parts Progress'}</h4>
                <div class="progress-bar-container">
                    <div class="progress-bar-fill" style="width:${avgPartsProgress}%;"></div>
                    <div class="progress-bar-text">${avgPartsProgress.toFixed(1)}% (${project.parts.length} parts)</div>
                </div>
            </div>
            
            <div style="margin-top:16px;">
                <h4 style="margin:0 0 8px 0;font-size:14px;">${t('parts') || 'Parts'}</h4>
                <div style="display:flex;flex-direction:column;gap:8px;">
        `;
        
        project.parts.forEach((part, index) => {
            const statusClass = part.status === 'completed' ? 'status-completed' : 
                              part.status === 'review' ? 'status-review' : 
                              part.status === 'in_progress' ? 'status-in-progress' : 'status-pending';
            const statusText = part.status === 'completed' ? t('completed') : 
                             part.status === 'review' ? t('review') : 
                             part.status === 'in_progress' ? t('inProgress') : t('pending');
            html += `
                <div style="padding:12px;background:#f9f9f9;border-radius:6px;display:flex;justify-content:space-between;align-items:center;">
                    <div>
                        <strong>${index + 1}. ${escapeHtml(part.title || `Part ${index + 1}`)}</strong>
                        <span style="margin-left:12px;" class="status-badge ${statusClass}">${statusText}</span>
                        <span style="margin-left:12px;">${part.percentage || 0}%</span>
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    } else {
        html += `<p style="color:#999;">${t('noMilestonesConfigured')}</p>`;
    }
    
    return html;
}

window.addPartItem = addPartItem;
window.removePartItem = removePartItem;
window.renderProjectProgress = renderProjectProgress;
