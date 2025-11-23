/**
 * Workbench Module
 * 工作台模块 - 包含项目协作、里程碑管理、资金托管等功能
 */

let currentWorkbenchProjectId = null;
let milestones = []; // 里程碑数据

/**
 * 加载工作台
 */
async function loadWorkBench() {
    const workbenchContent = document.getElementById('workbench-content');
    const projectListDiv = document.getElementById('workbench-project-list');
    const detailDiv = document.getElementById('workbench-detail');
    const chatBtn = document.getElementById('chat-btn');
    
    // 隐藏 Chat 按钮
    if (chatBtn) chatBtn.style.display = 'none';
    
    // 隐藏详情界面，显示项目列表
    detailDiv.style.display = 'none';
    projectListDiv.style.display = 'block';
    
    projectListDiv.innerHTML = `<div class="loading">${t('loading')}</div>`;
    
    try {
        const user = getCurrentUser();
        const res = await fetch('../backend/api/api.php?action=get_collaboration_projects');
        const data = await res.json();
        
        if (data.code === 200 && data.projects) {
            // 筛选出当前用户参与的项目
            const myProjects = data.projects.filter(p => 
                p.requester_id === user.id || p.creator_id === user.id
            );
            
            if (myProjects.length === 0) {
                projectListDiv.innerHTML = `
                    <div style="text-align:center;padding:40px;color:#999;">
                        <p>${t('noProjectsInWorkbench')}</p>
                        <div style="margin-top:20px;display:flex;gap:12px;justify-content:center;">
                            <button class="btn btn-primary" onclick="switchTab('taskmarket')">${t('goToTaskMarket')}</button>
                        </div>
                    </div>
                `;
                return;
            }
            
            let html = `
                <div style="margin-bottom:20px;display:flex;gap:12px;justify-content:space-between;align-items:center;">
                    <h3>${t('myProjectsInWorkbench')}</h3>
                    <div style="display:flex;gap:8px;">
                        <button class="btn btn-secondary btn-small" onclick="switchTab('taskmarket')">${t('goToTaskMarket')}</button>
                    </div>
                </div>
                <div class="card-grid">
            `;
            
            myProjects.forEach(project => {
                const statusClass = `status-${project.status.replace('_', '-')}`;
                const statusText = t(project.status.replace('_', ''));
                const isRequester = user.id === project.requester_id;
                const roleText = isRequester ? t('asRequester') : t('asCreator');
                
                html += `
                    <div class="project-card">
                        <div class="project-title">${escapeHtml(project.title)}</div>
                        <div class="project-meta">
                            <span class="status-badge ${statusClass}">${statusText}</span>
                            <span class="role-badge">${roleText}</span>
                        </div>
                        <div class="project-meta">
                            <span>${t('budget')}: $${project.budget || 0}</span>
                        </div>
                        <div class="project-actions">
                            <button class="btn btn-primary btn-small" onclick="openWorkbenchProject(${project.id})">${t('openWorkbench')}</button>
                        </div>
                    </div>
                `;
            });
            
            html += '</div>';
            projectListDiv.innerHTML = html;
        } else {
            projectListDiv.innerHTML = `<p style="color:#e74c3c;">${t('error')}</p>`;
        }
    } catch (err) {
        projectListDiv.innerHTML = `<p style="color:#e74c3c;">${t('error')}</p>`;
    }
}

/**
 * 打开工作台项目详情
 */
async function openWorkbenchProject(projectId) {
    currentWorkbenchProjectId = projectId;
    
    const projectListDiv = document.getElementById('workbench-project-list');
    const detailDiv = document.getElementById('workbench-detail');
    const chatBtn = document.getElementById('chat-btn');
    
    // 显示 Chat 按钮
    if (chatBtn) chatBtn.style.display = 'flex';
    
    // 显示详情界面，隐藏项目列表
    projectListDiv.style.display = 'none';
    detailDiv.style.display = 'block';
    
    // 加载项目详情和里程碑
    await loadWorkbenchProjectDetail();
    await loadMilestones();
}

/**
 * 返回项目列表
 */
function backToProjectList() {
    currentWorkbenchProjectId = null;
    milestones = [];
    const chatBtn = document.getElementById('chat-btn');
    if (chatBtn) chatBtn.style.display = 'none';
    loadWorkBench();
}

/**
 * 加载工作台项目详情
 */
async function loadWorkbenchProjectDetail() {
    const projectInfoDiv = document.getElementById('workbench-project-info');
    const messagesDiv = document.getElementById('workbench-messages');
    
    if (!currentWorkbenchProjectId) {
        projectInfoDiv.innerHTML = `<p style="color:#999;">${t('selectProject')}</p>`;
        return;
    }
    
    projectInfoDiv.innerHTML = `<div class="loading">${t('loading')}</div>`;
    messagesDiv.innerHTML = `<div class="loading">${t('loading')}</div>`;
    
    try {
        const res = await fetch(`../backend/api/api.php?action=get_collaboration_project&project_id=${currentWorkbenchProjectId}`);
        const data = await res.json();
        
        if (data.code === 200 && data.project) {
            const project = data.project;
            const user = getCurrentUser();
            const isRequester = user.id === project.requester_id;
            
            const statusClass = `status-${project.status.replace('_', '-')}`;
            const statusText = t(project.status.replace('_', ''));
            
            // 计算里程碑金额分配
            const totalBudget = parseFloat(project.budget) || 0;
            const milestonePayments = {
                startup: (totalBudget * 0.3).toFixed(2),
                midterm: (totalBudget * 0.4).toFixed(2),
                final: (totalBudget * 0.3).toFixed(2)
            };

            // 计算时间进度 & 步骤进度
            const createdDate = new Date(project.created_at);
            const currentDate = new Date();
            const timeLimit = project.time_limit || 30;
            const daysPassed = Math.floor((currentDate - createdDate) / (1000 * 60 * 60 * 24));
            const timeProgress = Math.min(100, (daysPassed / timeLimit) * 100);

            let partsProgressBlock = '';
            if (project.parts && project.parts.length > 0) {
                const totalPartsProgress = project.parts.reduce((sum, part) => sum + (part.percentage || 0), 0);
                const avgPartsProgress = totalPartsProgress / project.parts.length;
                partsProgressBlock = `
                <div style="margin-top:16px;">
                    <h4 style="margin:0 0 8px 0;font-size:14px;">${t('partsProgress')}</h4>
                    <div class="progress-bar-container">
                        <div class="progress-bar-fill" style="width:${avgPartsProgress}%;"></div>
                        <div class="progress-bar-text">${avgPartsProgress.toFixed(1)}% (${project.parts.length} ${t('parts')})</div>
                    </div>
                </div>`;
            }
            
            let html = `
                <div class="project-detail-header" style="display:flex;justify-content:space-between;align-items:center;">
                    <div>
                        <h2 style="margin:0;">${escapeHtml(project.title)}</h2>
                        <div class="project-meta" style="margin-top:8px;">
                            <span class="status-badge ${statusClass}">${statusText}</span>
                            <span>${t('budget')}: $${totalBudget}</span>
                            <span class="role-badge">${isRequester ? t('asRequester') : t('asCreator')}</span>
                        </div>
                    </div>
                    <div>
                        ${project.status === 'closed' ? `
                            <button class="btn btn-primary" onclick="openProjectReviewModal()">${t('submitProjectReview')}</button>
                        ` : ''}
                    </div>
                </div>
                <div style="margin-top:16px;padding:16px;background:#f9f9f9;border-radius:8px;">
                    <p style="margin:0;color:#666;">${escapeHtml(project.description || t('noDescription'))}</p>
                </div>
                <div style="margin-top:12px;padding:12px;background:#fff3e0;border-radius:8px;border-left:4px solid #ffa726;">
                    <strong>${t('escrowPayments')}:</strong>
                    <div style="margin-top:8px;display:flex;gap:16px;font-size:14px;">
                        <span>${t('startupPayment')}: $${milestonePayments.startup} (30%)</span>
                        <span>${t('midtermPayment')}: $${milestonePayments.midterm} (40%)</span>
                        <span>${t('finalPayment')}: $${milestonePayments.final} (30%)</span>
                    </div>
                </div>
                <div style="margin-top:20px;padding:16px;background:#f9f9f9;border-radius:8px;">
                    <h3 style="margin:0 0 12px 0;font-size:18px;">${t('projectProgress')}</h3>
                    <div style="margin-bottom:16px;">
                        <h4 style="margin:0 0 8px 0;font-size:14px;">${t('timeProgress')}</h4>
                        <div class="progress-bar-container">
                            <div class="progress-bar-fill" style="width:${timeProgress}%;"></div>
                            <div class="progress-bar-text">${daysPassed} / ${timeLimit} days (${timeProgress.toFixed(1)}%)</div>
                        </div>
                    </div>
                    ${partsProgressBlock || `<p style='color:#999;margin:0;'>${t('noMilestonesConfigured')}</p>`}
                </div>
            `;
            
            projectInfoDiv.innerHTML = html;
            
            // 加载消息（简单的聊天功能）
            messagesDiv.innerHTML = `<p style="color:#999;text-align:center;">${t('noChatMessages')}</p>`;
        } else {
            projectInfoDiv.innerHTML = `<p style="color:#e74c3c;">${t('error')}</p>`;
        }
    } catch (err) {
        projectInfoDiv.innerHTML = `<p style="color:#e74c3c;">${t('error')}</p>`;
    }
}

/**
 * 加载里程碑数据
 */
async function loadMilestones() {
    // 实际应用中应从后端API获取
    
    if (!currentWorkbenchProjectId) return;
    
    try {
        const res = await fetch(`../backend/api/api.php?action=get_milestones&project_id=${currentWorkbenchProjectId}`);
        const data = await res.json();
        
        if (data.code === 200 && data.milestones) {
            milestones = data.milestones;
        } else {
            milestones = [];
        }
    } catch (err) {
        console.error('Error loading milestones:', err);
        milestones = [];
    }
    
    renderMilestones();
    initDragAndDrop();
}

/**
 * 渲染里程碑卡片
 */
function renderMilestones() {
    const stages = ['planning', 'in_progress', 'review', 'completed'];
    
    stages.forEach(stage => {
        const container = document.getElementById(`cards-${stage}`);
        const count = document.getElementById(`count-${stage}`);
        
        const stageMilestones = milestones.filter(m => m.stage === stage);
        count.textContent = stageMilestones.length;
        
        if (stageMilestones.length === 0) {
            container.innerHTML = `<p style="color:#999;text-align:center;padding:20px;font-size:13px;">${t('noMilestones')}</p>`;
            return;
        }
        
        let html = '';
        stageMilestones.forEach(milestone => {
            html += renderMilestoneCard(milestone);
        });
        
        container.innerHTML = html;
    });
}

/**
 * 渲染单个里程碑卡片
 */
function renderMilestoneCard(milestone) {
    const user = getCurrentUser();
    const isRequester = true; // 简化处理，实际需要从项目数据判断
    
    let actionsHtml = '';
    
    if (milestone.stage === 'planning' || milestone.stage === 'in_progress') {
        actionsHtml = `
            <div class="milestone-card-actions">
                <button class="btn btn-primary btn-small" onclick="openMilestoneDetail(${milestone.id})">${t('viewDetails')}</button>
                <button class="btn btn-secondary btn-small" onclick="openFileUploadModal(${milestone.id})">${t('uploadFiles')}</button>
            </div>
        `;
    } else if (milestone.stage === 'review') {
        if (isRequester) {
            actionsHtml = `
                <div class="milestone-card-actions">
                    <button class="btn btn-primary btn-small payment-highlight" onclick="approveMilestone(${milestone.id})">${t('approveAndPay')}</button>
                    <button class="btn btn-secondary btn-small" onclick="requestRevision(${milestone.id})">${t('requestRevision')}</button>
                    <button class="btn btn-secondary btn-small" onclick="requestPlatformIntervention(${milestone.id})">${t('platformIntervention')}</button>
                </div>
            `;
        } else {
            actionsHtml = `
                <div class="milestone-card-actions">
                    <button class="btn btn-secondary btn-small" onclick="openMilestoneDetail(${milestone.id})">${t('waitingApproval')}</button>
                </div>
            `;
        }
    } else if (milestone.stage === 'completed') {
        const paidInfo = milestone.paidAmount ? `$${milestone.paidAmount}` : `${milestone.payment}%`;
        actionsHtml = `
            <div class="milestone-card-actions">
                <button class="btn btn-secondary btn-small" disabled>✅ ${t('paid')}: ${paidInfo}</button>
            </div>
        `;
    }
    
    let filesHtml = '';
    if (milestone.files && milestone.files.length > 0) {
            const previewHtml = milestone.stage === 'review'
                ? `<div class="milestone-file-previews">${milestone.files.filter(f => f.type && f.type.startsWith('image/') && f.path).slice(0,3).map(f => `<img src="${escapeHtml(f.path)}" alt="${escapeHtml(f.name)}" style="max-width:80px;max-height:80px;object-fit:contain;border:1px solid #ddd;border-radius:4px;margin:4px;" />`).join('')}</div>`
                : '';
            filesHtml = `
                <div class="milestone-card-files">
                    ${milestone.files.map(f => `
                        <div class="milestone-file-item">
                            📎 ${escapeHtml(f.name)}
                        </div>
                    `).join('')}
                    ${previewHtml}
                </div>
            `;
    }
    
    return `
        <div class="milestone-card" draggable="true" data-milestone-id="${milestone.id}">
            <div class="milestone-card-header">
                <div class="milestone-card-title">${escapeHtml(milestone.title)}</div>
                <div class="milestone-card-badge">${milestone.payment}%</div>
            </div>
            <div class="milestone-card-desc">${escapeHtml(milestone.description)}</div>
            <div class="milestone-card-meta">
                <span>📅 ${new Date(milestone.createdAt).toLocaleDateString()}</span>
                ${milestone.files.length > 0 ? `<span>📎 ${milestone.files.length} ${t('files')}</span>` : ''}
            </div>
            ${filesHtml}
            ${actionsHtml}
        </div>
    `;
}

/**
 * 初始化拖拽功能
 */
function initDragAndDrop() {
    let draggedElement = null;
    
    // 为所有卡片添加拖拽事件
    document.querySelectorAll('.milestone-card').forEach(card => {
        card.addEventListener('dragstart', function(e) {
            draggedElement = this;
            this.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', this.innerHTML);
        });
        
        card.addEventListener('dragend', function(e) {
            this.classList.remove('dragging');
        });
    });
    
    // 为所有列添加放置事件
    document.querySelectorAll('.milestone-cards').forEach(container => {
        container.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            this.classList.add('drag-over');
        });
        
        container.addEventListener('dragleave', function(e) {
            this.classList.remove('drag-over');
        });
        
        container.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('drag-over');
            
            if (draggedElement) {
                const milestoneId = parseInt(draggedElement.getAttribute('data-milestone-id'));
                const newStage = this.getAttribute('data-stage');
                
                moveMilestone(milestoneId, newStage);
            }
        });
    });
}

/**
 * 移动里程碑到新阶段
 */
function moveMilestone(milestoneId, newStage) {
    const milestone = milestones.find(m => m.id === milestoneId);
    if (!milestone) return;
    
    const oldStage = milestone.stage;
    
    // 验证移动是否合法（简化版本，实际应有更复杂的规则）
    const stageOrder = ['planning', 'in_progress', 'review', 'completed'];
    const oldIndex = stageOrder.indexOf(oldStage);
    const newIndex = stageOrder.indexOf(newStage);
    
    // 允许前进和后退（原型简化）
    milestone.stage = newStage;
    
    // 如果移动到待审核，触发通知（原型中只是提示）
    if (newStage === 'review' && oldStage !== 'review') {
        alert(t('milestoneSubmittedForReview'));
    }
    
    // 重新渲染
    renderMilestones();
    initDragAndDrop();
}

let currentMilestoneId = null;

/**
 * 打开里程碑详情
 */
function openMilestoneDetail(milestoneId) {
    const milestone = milestones.find(m => m.id === milestoneId);
    if (!milestone) return;
    
    currentMilestoneId = milestoneId;
    
    const modal = document.getElementById('milestoneDetailModal');
    const content = document.getElementById('milestone-detail-content');
    
    let filesHtml = '';
    if (milestone.files && milestone.files.length > 0) {
        filesHtml = `
            <div style="margin-top:16px;">
                <strong>${t('uploadedFiles')}:</strong>
                <div style="margin-top:8px;">
                    ${milestone.files.map(f => `
                        <div style="padding:8px;background:#f9f9f9;border-radius:4px;margin-bottom:4px;">
                            📎 ${escapeHtml(f.name)} (${(f.size / 1024).toFixed(2)} KB)
                            ${f.type && f.type.startsWith('image/') && f.path ? `<div style=\"margin-top:6px;\"><img src=\"${escapeHtml(f.path)}\" alt=\"${escapeHtml(f.name)}\" style=\"max-width:120px;max-height:120px;object-fit:contain;border:1px solid #ddd;border-radius:4px;\" /></div>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    content.innerHTML = `
        <div style="margin-bottom:16px;">
            <h4 style="margin:0 0 8px 0;">${escapeHtml(milestone.title)}</h4>
            <div style="padding:12px;background:#f9f9f9;border-radius:8px;">
                <p style="margin:0;color:#666;">${escapeHtml(milestone.description)}</p>
            </div>
        </div>
        <div style="display:flex;gap:16px;margin-bottom:16px;">
            <div>
                <strong>${t('payment')}:</strong> ${milestone.payment}%
            </div>
            <div>
                <strong>${t('status')}:</strong> ${t('stage_' + milestone.stage)}
            </div>
        </div>
        ${filesHtml}
            <div style="margin-top:20px;display:flex;gap:8px;">
                ${milestone.stage !== 'review' && milestone.stage !== 'completed' ? `
                    <button class="btn btn-secondary" onclick="submitMilestoneForReview(${milestone.id})">${t('submitForReview')}</button>
                ` : ''}
            </div>
    `;
    
    modal.classList.add('show');
}

/**
 * 关闭里程碑详情弹窗
 */
function closeMilestoneDetailModal() {
    document.getElementById('milestoneDetailModal').classList.remove('show');
    currentMilestoneId = null;
}

/**
 * 打开文件上传弹窗
 */
function openFileUploadModal(milestoneId) {
    currentMilestoneId = milestoneId;
    document.getElementById('fileUploadModal').classList.add('show');
    document.getElementById('file-list').innerHTML = '';
    document.getElementById('milestoneFiles').value = '';
}

/**
 * 关闭文件上传弹窗
 */
function closeFileUploadModal() {
    document.getElementById('fileUploadModal').classList.remove('show');
    document.getElementById('file-list').innerHTML = '';
    document.getElementById('milestoneFiles').value = '';
}

/**
 * 提交文件
 */
async function submitFiles() {
    const fileInput = document.getElementById('milestoneFiles');
    const files = fileInput.files;
    if (files.length === 0) {
        alert(t('pleaseSelectFiles'));
        return;
    }
    if (!currentMilestoneId) return;
    const milestone = milestones.find(m => m.id === currentMilestoneId);
    if (!milestone) return;
    for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('file', files[i]);
        formData.append('milestone_id', currentMilestoneId);
        try {
            const resp = await fetch('../backend/api/api.php?action=upload', { method: 'POST', body: formData });
            const data = await resp.json();
            if (data.code !== 200) {
                alert(data.message || 'Upload failed');
                continue;
            }
            milestone.files.push({
                name: files[i].name,
                size: files[i].size,
                type: files[i].type,
                path: data.path,
                uploadedAt: new Date().toISOString()
            });
        } catch (e) {
            alert('Upload failed');
        }
    }
    alert(t('filesUploaded'));
    closeFileUploadModal();
    renderMilestones();
    initDragAndDrop();
    if (document.getElementById('milestoneDetailModal').classList.contains('show')) {
        openMilestoneDetail(currentMilestoneId);
    }
}

/**
 * 提交里程碑审核
 */
function submitMilestoneForReview(milestoneId) {
    const milestone = milestones.find(m => m.id === milestoneId);
    if (!milestone) return;
    
    if (!milestone.files || milestone.files.length === 0) {
        alert(t('pleaseUploadFilesFirst'));
        return;
    }
    
    if (!confirm(t('confirmSubmitForReview'))) return;
    
    milestone.stage = 'review';
    
    alert(t('milestoneSubmittedForReview'));
    
    closeMilestoneDetailModal();
    renderMilestones();
    initDragAndDrop();
}

/**
 * 批准里程碑并支付
 */
async function approveMilestone(milestoneId) {
    const milestone = milestones.find(m => m.id === milestoneId);
    if (!milestone) return;
    
    // 获取项目信息计算支付金额
    const res = await fetch(`../backend/api/api.php?action=get_collaboration_project&project_id=${currentWorkbenchProjectId}`);
    const data = await res.json();
    
    if (data.code !== 200 || !data.project) {
        alert(t('error'));
        return;
    }
    
    const totalBudget = parseFloat(data.project.budget) || 0;
    const paymentAmount = (totalBudget * milestone.payment / 100).toFixed(2);
    
    if (!confirm(t('confirmApproveAndPay') + `\n\n${t('amount')}: $${paymentAmount} (${milestone.payment}%)`)) return;
    
    // 模拟支付延迟
    const modal = showPaymentProcessing();
    
    setTimeout(() => {
        milestone.stage = 'completed';
        milestone.paidAt = new Date().toISOString();
        milestone.paidAmount = paymentAmount;
        
        hidePaymentProcessing(modal);
        alert(t('paymentReleased') + `\n\n${t('amount')}: $${paymentAmount}`);
        
        renderMilestones();
        initDragAndDrop();
    }, 1500);
}

/**
 * 显示支付处理中
 */
function showPaymentProcessing() {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;';
    overlay.innerHTML = `
        <div style="background:white;padding:30px;border-radius:12px;text-align:center;">
            <div style="font-size:48px;margin-bottom:16px;">⏳</div>
            <div style="font-size:18px;font-weight:bold;margin-bottom:8px;">${t('processingPayment')}</div>
            <div style="color:#666;">${t('pleaseWait')}</div>
        </div>
    `;
    document.body.appendChild(overlay);
    return overlay;
}

/**
 * 隐藏支付处理中
 */
function hidePaymentProcessing(modal) {
    if (modal && modal.parentNode) {
        modal.parentNode.removeChild(modal);
    }
}

/**
 * 打开平台介入申请
 */
function requestPlatformIntervention(milestoneId) {
    const reason = prompt(t('interventionReason'));
    if (!reason) return;
    
    // 原型实现：只是显示提示，实际应保存到数据库
    alert(t('interventionRequested') + '\n\n' + t('platformWillReview'));
    
    // 这里应该调用API保存介入申请到数据库
    // await fetch('../backend/api/api.php?action=request_intervention', {
    //     method: 'POST',
    //     body: JSON.stringify({ milestone_id: milestoneId, reason: reason })
    // });
}

/**
 * 请求修改
 */
function requestRevision(milestoneId) {
    const reason = prompt(t('revisionReason'));
    if (!reason) return;
    
    const milestone = milestones.find(m => m.id === milestoneId);
    if (!milestone) return;
    
    milestone.stage = 'in_progress';
    
    alert(t('revisionRequested'));
    
    renderMilestones();
    initDragAndDrop();
}

/**
 * 发送项目消息
 */
function sendProjectMessage() {
    const input = document.getElementById('workbench-message-input');
    const message = input.value.trim();
    
    if (!message) {
        alert(t('pleaseEnterMessage'));
        return;
    }
    
    // 简单的原型实现，只在前端显示
    const messagesDiv = document.getElementById('workbench-messages');
    const user = getCurrentUser();
    
    const messageHtml = `
        <div style="margin-bottom:12px;padding:12px;background:#fff;border-radius:8px;border-left:3px solid #667eea;">
            <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                <strong>${escapeHtml(user.username)}</strong>
                <span style="color:#999;font-size:12px;">${new Date().toLocaleString()}</span>
            </div>
            <p style="margin:0;color:#333;">${escapeHtml(message)}</p>
        </div>
    `;
    
    if (messagesDiv.innerHTML.includes('noChatMessages')) {
        messagesDiv.innerHTML = messageHtml;
    } else {
        messagesDiv.innerHTML += messageHtml;
    }
    
    input.value = '';
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

/**
 * 打开项目评价弹窗
 */
function openProjectReviewModal() {
    if (!currentWorkbenchProjectId) {
        alert(t('pleaseSelectProject'));
        return;
    }
    
    // 重置评分
    document.querySelectorAll('#rating-stars .star').forEach(star => {
        star.textContent = '☆';
        star.style.color = '#ddd';
    });
    
    document.getElementById('communicationRating').value = '3';
    document.getElementById('qualityRating').value = '3';
    document.getElementById('timelinessRating').value = '3';
    document.getElementById('reviewCommentText').value = '';
    
    document.getElementById('projectReviewModal').classList.add('show');
}

/**
 * 关闭项目评价弹窗
 */
function closeProjectReviewModal() {
    document.getElementById('projectReviewModal').classList.remove('show');
}

let selectedRating = 0;

/**
 * 设置评分
 */
function setRating(rating) {
    selectedRating = rating;
    
    document.querySelectorAll('#rating-stars .star').forEach((star, index) => {
        if (index < rating) {
            star.textContent = '★';
            star.style.color = '#ffa726';
        } else {
            star.textContent = '☆';
            star.style.color = '#ddd';
        }
    });
}

/**
 * 提交项目评价
 */
function submitProjectReview() {
    if (selectedRating === 0) {
        alert(t('pleaseSelectRating'));
        return;
    }
    
    const communication = parseInt(document.getElementById('communicationRating').value);
    const quality = parseInt(document.getElementById('qualityRating').value);
    const timeliness = parseInt(document.getElementById('timelinessRating').value);
    const comment = document.getElementById('reviewCommentText').value.trim();
    
    // 原型实现：只显示提示，实际应保存到数据库
    const reviewData = {
        projectId: currentWorkbenchProjectId,
        overallRating: selectedRating,
        communication: communication,
        quality: quality,
        timeliness: timeliness,
        comment: comment,
        submittedAt: new Date().toISOString()
    };
    
    console.log('Review submitted:', reviewData);
    
    alert(t('reviewSubmitted') + '\n\n' + 
          `${t('overallRating')}: ${selectedRating}/5\n` +
          `${t('communicationRating')}: ${communication}/5\n` +
          `${t('qualityRating')}: ${quality}/5\n` +
          `${t('timelinessRating')}: ${timeliness}/5`);
    
    closeProjectReviewModal();
    
    // 实际应用中应调用API保存评价
    // await fetch('../backend/api/api.php?action=submit_project_review', {
    //     method: 'POST',
    //     body: JSON.stringify(reviewData)
    // });
}
