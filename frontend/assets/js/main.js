/**
 * Main Application Entry
 * 主应用入口文件 - 重构版
 * 
 * 此文件负责初始化应用并协调各个模块
 */

// ===== 页面初始化 =====
document.addEventListener('DOMContentLoaded', async function() {
    const authed = await initAuthFromServer();
    if (authed) {
        updatePageLanguage();
        loadFeed(); // 加载初始内容
        // 初始化首页轮播图（如果存在）
        try { initCarousel(); } catch (e) { /* ignore */ }
    }
});

// ===== 全局暴露的函数（供 HTML onclick 等使用） =====
// 这些函数从各个模块导入，确保在全局作用域可用

// 认证相关
window.logout = logout;
window.switchRole = switchRole;
window.toggleLanguage = toggleLanguage;
window.getCurrentUser = getCurrentUser;

// 导航相关
window.switchTab = switchTab;
window.getCurrentTab = getCurrentTab;

// 广场相关
window.loadFeed = loadFeed;
window.toggleLike = toggleLike;
window.toggleComments = toggleComments;
window.submitComment = submitComment;
window.openActivityModal = openActivityModal;
window.closeActivityModal = closeActivityModal;
window.submitActivity = submitActivity;
window.deleteActivity = deleteActivity;

// 消息相关
window.loadMessages = loadMessages;
window.openMessageModal = openMessageModal;
window.closeMessageModal = closeMessageModal;
window.submitMessage = submitMessage;
window.deleteMessage = deleteMessage;

// 项目相关
window.loadTaskMarket = loadTaskMarket;
window.viewProjectDetail = viewProjectDetail;
window.loadProjectDetail = loadProjectDetail;
window.applyForProject = applyForProject;
window.confirmCompletion = confirmCompletion;
window.withdrawProject = withdrawProject;
window.openReviewModal = openReviewModal;
window.submitReview = submitReview;
window.openCreateProjectModal = openCreateProjectModal;
window.closeCreateProjectModal = closeCreateProjectModal;
window.submitCreateProject = submitCreateProject;
window.submitProject = submitCreateProject;  // 映射 submitProject 到 submitCreateProject

// 资料和匹配相关
window.loadProfile = loadProfile;
window.addSkill = addSkill;
window.searchCreators = searchCreators;
window.loadMyProjects = loadMyProjects;

// 工作台相关
window.loadWorkBench = loadWorkBench;
window.openWorkbenchProject = openWorkbenchProject;
window.backToProjectList = backToProjectList;
window.sendProjectMessage = sendProjectMessage;
window.openMilestoneDetail = openMilestoneDetail;
window.approveMilestone = approveMilestone;
window.requestRevision = requestRevision;
window.closeMilestoneDetailModal = closeMilestoneDetailModal;
window.openFileUploadModal = openFileUploadModal;
window.closeFileUploadModal = closeFileUploadModal;
window.submitFiles = submitFiles;
window.submitMilestoneForReview = submitMilestoneForReview;
window.requestPlatformIntervention = requestPlatformIntervention;
window.openProjectReviewModal = openProjectReviewModal;
window.closeProjectReviewModal = closeProjectReviewModal;
window.setRating = setRating;
window.submitProjectReview = submitProjectReview;

// 工具函数
window.escapeHtml = escapeHtml;
window.initCarousel = initCarousel;
window.formatDate = formatDate;
window.formatBudget = formatBudget;
window.parseSkills = parseSkills;
window.showLoading = showLoading;
window.showError = showError;
window.showNoData = showNoData;

// ===== 模块状态共享 =====
// 确保模块间可以访问必要的状态变量
window.currentUser = null;
window.currentTab = 'home';
window.selectedProjectId = null;
