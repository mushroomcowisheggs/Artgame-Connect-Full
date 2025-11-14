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
        backToTaskMarket: "Back to Task Market",
        backToWorkbench: "Back to Workbench",
        
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
        noProjectsInWorkbench: "No projects yet. Go to Task Market to create or apply for projects.",
        myProjectsInWorkbench: "My Projects",
        goToTaskMarket: "Go to Task Market",
        openWorkbench: "Open Workbench",
        noChatMessages: "No messages yet. Start a conversation!",
        pleaseEnterMessage: "Please enter a message",
        backToProjectList: "Back to Project List",
        milestonesBoard: "Milestones Board",
        stagePlanning: "Planning",
        stageInProgress: "In Progress",
        stageReview: "Under Review",
        stageCompleted: "Completed",
        stage_planning: "Planning",
        stage_in_progress: "In Progress",
        stage_review: "Under Review",
        stage_completed: "Completed",
        noMilestones: "No milestones in this stage",
        uploadFiles: "Upload Files",
        selectFiles: "Select Files",
        upload: "Upload",
        uploadedFiles: "Uploaded Files",
        files: "files",
        submitForReview: "Submit for Review",
        approveAndPay: "Approve & Pay",
        requestRevision: "Request Revision",
        platformIntervention: "Platform Intervention",
        waitingApproval: "Waiting for Approval",
        paid: "Paid",
        payment: "Payment",
        amount: "Amount",
        confirmApproveAndPay: "Confirm approval and release payment?",
        paymentReleased: "Payment released successfully!",
        processingPayment: "Processing Payment",
        pleaseWait: "Please wait...",
        interventionReason: "Please describe the reason for platform intervention:",
        interventionRequested: "Platform intervention requested",
        platformWillReview: "Platform will review within 48 hours",
        revisionReason: "Please describe what needs to be revised:",
        revisionRequested: "Revision requested",
        pleaseSelectFiles: "Please select files to upload",
        filesUploaded: "Files uploaded successfully!",
        pleaseUploadFilesFirst: "Please upload deliverable files first",
        confirmSubmitForReview: "Submit this milestone for review?",
        milestoneSubmittedForReview: "Milestone submitted for review. Requester will be notified.",
        projectChat: "Project Chat",
        typeMessage: "Type your message...",
        send: "Send",
        escrowPayments: "Escrow Payments",
        startupPayment: "Startup Payment",
        midtermPayment: "Midterm Payment",
        finalPayment: "Final Payment",
        milestone1Title: "Startup - Initial Concept & Planning",
        milestone1Desc: "Define project scope, create initial sketches or wireframes",
        milestone2Title: "Midterm - Development & Iteration",
        milestone2Desc: "Complete main development work, iterate based on feedback",
        milestone3Title: "Final - Delivery & Handover",
        milestone3Desc: "Final polishing, delivery of all assets and documentation",
        submitProjectReview: "Submit Project Review",
        overallRating: "Overall Rating",
        communicationRating: "Communication",
        qualityRating: "Quality",
        timelinessRating: "Timeliness",
        pleaseSelectRating: "Please select an overall rating",
        pleaseSelectProject: "Please select a project first",
        
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
        backToTaskMarket: "返回任务市场",
        backToWorkbench: "返回工作台",
        
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
        noProjectsInWorkbench: "暂无项目。前往任务市场创建或申请项目。",
        myProjectsInWorkbench: "我的项目",
        goToTaskMarket: "前往任务市场",
        openWorkbench: "打开工作台",
        noChatMessages: "暂无消息。开始对话吧！",
        pleaseEnterMessage: "请输入消息",
        backToProjectList: "返回项目列表",
        milestonesBoard: "里程碑看板",
        stagePlanning: "规划中",
        stageInProgress: "进行中",
        stageReview: "审核中",
        stageCompleted: "已完成",
        stage_planning: "规划中",
        stage_in_progress: "进行中",
        stage_review: "审核中",
        stage_completed: "已完成",
        noMilestones: "该阶段暂无里程碑",
        uploadFiles: "上传文件",
        selectFiles: "选择文件",
        upload: "上传",
        uploadedFiles: "已上传文件",
        files: "个文件",
        submitForReview: "提交审核",
        approveAndPay: "批准并支付",
        requestRevision: "请求修改",
        platformIntervention: "平台介入",
        waitingApproval: "等待审核",
        paid: "已支付",
        payment: "支付金额",
        amount: "金额",
        confirmApproveAndPay: "确认批准并释放款项？",
        paymentReleased: "款项已成功释放！",
        processingPayment: "正在处理支付",
        pleaseWait: "请稍候...",
        interventionReason: "请描述申请平台介入的原因：",
        interventionRequested: "平台介入申请已提交",
        platformWillReview: "平台将在48小时内审核",
        revisionReason: "请描述需要修改的内容：",
        revisionRequested: "修改请求已发送",
        pleaseSelectFiles: "请选择要上传的文件",
        filesUploaded: "文件上传成功！",
        pleaseUploadFilesFirst: "请先上传交付文件",
        confirmSubmitForReview: "提交该里程碑审核？",
        milestoneSubmittedForReview: "里程碑已提交审核。已通知需求方。",
        projectChat: "项目聊天",
        typeMessage: "输入消息...",
        send: "发送",
        escrowPayments: "托管款项",
        startupPayment: "启动款",
        midtermPayment: "中期款",
        finalPayment: "尾款",
        milestone1Title: "启动 - 初始概念与规划",
        milestone1Desc: "定义项目范围，创建初始草图或线框图",
        milestone2Title: "中期 - 开发与迭代",
        milestone2Desc: "完成主要开发工作，根据反馈迭代",
        milestone3Title: "最终 - 交付与移交",
        milestone3Desc: "最终打磨，交付所有资产和文档",
        submitProjectReview: "提交项目评价",
        overallRating: "总体评分",
        communicationRating: "沟通评分",
        qualityRating: "质量评分",
        timelinessRating: "时效评分",
        pleaseSelectRating: "请选择总体评分",
        pleaseSelectProject: "请先选择一个项目",
        
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
