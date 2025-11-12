/**
 * Navigation Module
 * 导航模块
 */

let currentTab = 'home';

/**
 * 切换标签页
 */
function switchTab(tabName) {
    currentTab = tabName;
    
    // 更新导航按钮状态
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    const navBtn = document.getElementById('nav-' + tabName);
    if (navBtn) navBtn.classList.add('active');
    
    // 显示内容
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    const tabContent = document.getElementById(tabName);
    if (tabContent) tabContent.classList.add('active');
    
    // 根据标签页加载数据
    switch(tabName) {
        case 'plaza':
            if (typeof loadFeed === 'function') loadFeed();
            break;
        case 'messages':
            if (typeof loadMessages === 'function') loadMessages();
            break;
        case 'profile':
            if (typeof loadProfile === 'function') loadProfile();
            break;
        case 'taskmarket':
            if (typeof loadTaskMarket === 'function') loadTaskMarket();
            break;
        case 'project':
            if (typeof loadProjectDetail === 'function') loadProjectDetail();
            break;
        case 'matching':
            // 基于搜索，不自动加载
            break;
        case 'workbench':
            if (typeof loadWorkBench === 'function') loadWorkBench();
            break;
    }
}

/**
 * 获取当前标签页
 */
function getCurrentTab() {
    return currentTab;
}
