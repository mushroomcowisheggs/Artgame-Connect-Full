// Multi-language configuration
const translations = {
    en: {
        // Header
        appTitle: "🎨 ArtGame Connect",
        welcome: "Welcome, ",
        switchRole: "Switch Role",
        logout: "Logout",
        
        // Roles
        creator: "Creator",
        requester: "Requester",
        
        // Navigation Row 1
        home: "Home",
        plaza: "Plaza",
        messages: "Messages",
        profile: "Profile",
        
        // Navigation Row 2
        taskMarket: "TaskMarket",
        project: "Project",
        matching: "Matching",
        workBench: "WorkBench",
        
        // Home
        homeTitle: "Welcome to ArtGame Connect",
        homeDesc: "A creative collaboration platform integrating project marketplace, activity plaza, messaging system, personal center, collaboration workbench, and creator matching.",
        quickStart: "Quick Start:",
        quickStartRow1: "Row 1: Home, Plaza, Messages, Profile",
        quickStartRow2: "Row 2: TaskMarket, Project, Matching, WorkBench",
        quickStartRow3: "Row 3: Creator, Switch Role, Logout, Language",
        quickStartTip: "Switch to Requester role to publish projects, switch to Creator role to apply for projects",
        
        // Plaza
        plazaTitle: "Activity Plaza",
        newActivity: "+ New Activity",
        all: "All",
        recommend: "Recommend",
        following: "Following",
        newest: "Newest",
        hottest: "Hottest",
        loadingActivities: "Loading activities...",
        postActivity: "Post Activity",
        activityTitle: "Title",
        activityContent: "Content",
        activityImage: "Image URL (optional)",
        submit: "Submit",
        cancel: "Cancel",
        likes: "Likes",
        comments: "Comments",
        addComment: "Add a comment...",
        viewComments: "View Comments",
        hideComments: "Hide Comments",
        
        // Messages
        messagesTitle: "Messages",
        loadingMessages: "Loading messages...",
        messageBoard: "Public Message Board",
        addNewMessage: "Add New Message",
        messageContent: "Message Content",
        postMessage: "Post Message",
        
        // Profile
        profileTitle: "Profile",
        loadingProfile: "Loading profile...",
        reputation: "Reputation",
        projectsCompleted: "Projects Completed",
        skills: "Skills",
        addSkill: "Add Skill",
        skillName: "Skill Name",
        mySubscribableProjects: "My Subscribable Projects",
        publishSubscribableProject: "Publish Subscribable Project",
        projectTitle: "Project Title",
        projectDescription: "Description",
        projectPrice: "Price",
        subscribers: "Subscribers",
        
        // Task Market
        taskMarketTitle: "Task Market",
        regularProjects: "Regular Projects",
        collaborationProjects: "Collaboration Projects",
        createProject: "Create Project",
        budget: "Budget",
        tags: "Tags",
        status: "Status",
        viewDetails: "View Details",
        apply: "Apply",
        
        // Project Details
        projectDetailsTitle: "Project Details",
        requester: "Requester",
        creator: "Creator",
        notAssigned: "Not Assigned",
        applyForProject: "Apply for Project",
        confirmCompletion: "Confirm Completion",
        withdraw: "Withdraw Project",
        writeReview: "Write Review",
        rating: "Rating",
        reviewComment: "Review Comment",
        submitReview: "Submit Review",
        selectProjectFromTaskMarket: "Please select a project from Task Market",
        
        // Matching
        matchingTitle: "Creator Matching",
        searchBySkill: "Search by Skill",
        search: "Search",
        
        // WorkBench
        workBenchTitle: "Work Bench",
        myProjects: "My Projects",
        asRequester: "As Requester",
        asCreator: "As Creator",
        milestones: "Milestones",
        addMilestone: "Add Milestone",
        milestoneTitle: "Milestone Title",
        pending: "Pending",
        completed: "Completed",
        
        // Common
        loading: "Loading...",
        noData: "No data available",
        success: "Success",
        error: "Error",
        confirm: "Confirm",
        delete: "Delete",
        edit: "Edit",
        save: "Save",
        
        // Status
        open: "Open",
        inProgress: "In Progress",
        closed: "Closed",
        withdrawn: "Withdrawn",
        
        // Messages
        confirmLogout: "Are you sure you want to logout?",
        confirmWithdraw: "Are you sure you want to withdraw this project?",
        confirmCompletion: "Are you sure you want to confirm project completion?",
        roleSwitched: "Role switched successfully",
        projectWithdrawn: "Project withdrawn successfully",
        completionConfirmed: "Completion confirmed successfully",
        reviewSubmitted: "Review submitted successfully"
    },
    zh: {
        // Header
        appTitle: "🎨 创界协作平台",
        welcome: "欢迎, ",
        switchRole: "切换角色",
        logout: "登出",
        
        // Roles
        creator: "创作者",
        requester: "需求方",
        
        // Navigation Row 1
        home: "首页",
        plaza: "活动广场",
        messages: "消息",
        profile: "个人中心",
        
        // Navigation Row 2
        taskMarket: "任务市场",
        project: "项目详情",
        matching: "创作者匹配",
        workBench: "工作台",
        
        // Home
        homeTitle: "欢迎来到创界协作平台",
        homeDesc: "一个整合了项目市场、活动广场、消息系统、个人中心、协作工作台和创作者匹配的创意协作平台。",
        quickStart: "快速开始:",
        quickStartRow1: "第一排: 首页、活动广场、消息、个人中心",
        quickStartRow2: "第二排: 任务市场、项目详情、创作者匹配、工作台",
        quickStartRow3: "第三排: 创作者、切换角色、登出、语言",
        quickStartTip: "切换到需求方角色发布项目,切换到创作者角色申请项目",
        
        // Plaza
        plazaTitle: "活动广场",
        newActivity: "+ 发布动态",
        all: "全部",
        recommend: "推荐",
        following: "关注",
        newest: "最新",
        hottest: "最热",
        loadingActivities: "加载中...",
        postActivity: "发布动态",
        activityTitle: "标题",
        activityContent: "内容",
        activityImage: "图片链接(可选)",
        submit: "提交",
        cancel: "取消",
        likes: "点赞",
        comments: "评论",
        addComment: "添加评论...",
        viewComments: "查看评论",
        hideComments: "隐藏评论",
        
        // Messages
        messagesTitle: "消息中心",
        loadingMessages: "加载中...",
        messageBoard: "公共留言板",
        addNewMessage: "添加新留言",
        messageContent: "留言内容",
        postMessage: "发布留言",
        
        // Profile
        profileTitle: "个人中心",
        loadingProfile: "加载中...",
        reputation: "声誉评分",
        projectsCompleted: "完成项目数",
        skills: "技能标签",
        addSkill: "添加技能",
        skillName: "技能名称",
        mySubscribableProjects: "我的可订阅项目",
        publishSubscribableProject: "发布可订阅项目",
        projectTitle: "项目标题",
        projectDescription: "项目描述",
        projectPrice: "价格",
        subscribers: "订阅者",
        
        // Task Market
        taskMarketTitle: "任务市场",
        regularProjects: "常规项目",
        collaborationProjects: "协作项目",
        createProject: "创建项目",
        budget: "预算",
        tags: "标签",
        status: "状态",
        viewDetails: "查看详情",
        apply: "申请",
        
        // Project Details
        projectDetailsTitle: "项目详情",
        requester: "需求方",
        creator: "创作者",
        notAssigned: "未分配",
        applyForProject: "申请项目",
        confirmCompletion: "确认完成",
        withdraw: "撤回项目",
        writeReview: "撰写评价",
        rating: "评分",
        reviewComment: "评价内容",
        submitReview: "提交评价",
        selectProjectFromTaskMarket: "请从任务市场选择一个项目",
        
        // Matching
        matchingTitle: "创作者匹配",
        searchBySkill: "按技能搜索",
        search: "搜索",
        
        // WorkBench
        workBenchTitle: "工作台",
        myProjects: "我的项目",
        asRequester: "作为需求方",
        asCreator: "作为创作者",
        milestones: "里程碑",
        addMilestone: "添加里程碑",
        milestoneTitle: "里程碑标题",
        pending: "待完成",
        completed: "已完成",
        
        // Common
        loading: "加载中...",
        noData: "暂无数据",
        success: "成功",
        error: "错误",
        confirm: "确认",
        delete: "删除",
        edit: "编辑",
        save: "保存",
        
        // Status
        open: "开放中",
        inProgress: "进行中",
        closed: "已关闭",
        withdrawn: "已撤回",
        
        // Messages
        confirmLogout: "确定要登出吗?",
        confirmWithdraw: "确定要撤回这个项目吗?",
        confirmCompletion: "确定要确认项目完成吗?",
        roleSwitched: "角色切换成功",
        projectWithdrawn: "项目撤回成功",
        completionConfirmed: "完成确认成功",
        reviewSubmitted: "评价提交成功"
    }
};

// Get current language
function getCurrentLanguage() {
    return localStorage.getItem('language') || 'en';
}

// Set current language
function setCurrentLanguage(lang) {
    localStorage.setItem('language', lang);
}

// Get translation
function t(key) {
    const lang = getCurrentLanguage();
    return translations[lang][key] || translations['en'][key] || key;
}

// Update all translatable elements
function updatePageLanguage() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translation = t(key);
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.placeholder = translation;
        } else {
            el.textContent = translation;
        }
    });
}
