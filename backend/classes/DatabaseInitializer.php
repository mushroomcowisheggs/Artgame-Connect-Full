<?php
/**
 * Database Initializer
 * 数据库初始化类 - 负责创建表结构和初始数据
 */

class DatabaseInitializer {
    private $pdo;
    
    public function __construct($pdo) {
        $this->pdo = $pdo;
    }
    
    /**
     * 初始化所有数据库表
     */
    public function initializeTables() {
        $this->createMessagesTable();
        $this->createProjectsTable();
        $this->createSubscriptionsTable();
        $this->createActivitiesTable();
        $this->createLikesTable();
        $this->createUsersTable();
        $this->createCollaborationProjectsTable();
        $this->createMilestonesTable();
        $this->createCollaborationMessagesTable();
        $this->createRatingsTable();
        $this->createCommentsTable();
        $this->createSubscribableProjectsTable();
        $this->createProjectSubscriptionsTable();
    }
    
    /**
     * 创建消息表
     */
    private function createMessagesTable() {
        $this->pdo->exec("CREATE TABLE IF NOT EXISTS t_messages (
            col_id INTEGER PRIMARY KEY AUTOINCREMENT,
            col_content TEXT NOT NULL,
            col_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");
        
        // 添加作者字段
        $cols = $this->pdo->query("PRAGMA table_info(t_messages)")->fetchAll(PDO::FETCH_ASSOC);
        $hasAuthor = false;
        $hasAuthorId = false;
        foreach ($cols as $c) {
            if ($c['name'] === 'col_author') $hasAuthor = true;
            if ($c['name'] === 'col_author_id') $hasAuthorId = true;
        }
        if (!$hasAuthor) {
            $this->pdo->exec("ALTER TABLE t_messages ADD COLUMN col_author TEXT DEFAULT '匿名'");
        }
        if (!$hasAuthorId) {
            $this->pdo->exec("ALTER TABLE t_messages ADD COLUMN col_author_id INTEGER DEFAULT NULL");
        }
    }
    
    /**
     * 创建项目表
     */
    private function createProjectsTable() {
        $this->pdo->exec("CREATE TABLE IF NOT EXISTS t_projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            budget TEXT,
            tags TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");
    }
    
    /**
     * 创建订阅表
     */
    private function createSubscriptionsTable() {
        $this->pdo->exec("CREATE TABLE IF NOT EXISTS t_subscriptions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL,
            subscriber TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(project_id) REFERENCES t_projects(id)
        )");
    }
    
    /**
     * 创建活动表（动态/任务/服务）
     */
    private function createActivitiesTable() {
        $this->pdo->exec("CREATE TABLE IF NOT EXISTS t_activities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL,
            title TEXT,
            content TEXT,
            image TEXT,
            author TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");
        
        // 添加作者ID和点赞数字段
        $cols = $this->pdo->query("PRAGMA table_info(t_activities)")->fetchAll(PDO::FETCH_ASSOC);
        $hasAuthorId = false;
        $hasLikeCount = false;
        foreach ($cols as $c) {
            if ($c['name'] === 'author_id') $hasAuthorId = true;
            if ($c['name'] === 'like_count') $hasLikeCount = true;
        }
        if (!$hasAuthorId) {
            $this->pdo->exec("ALTER TABLE t_activities ADD COLUMN author_id INTEGER DEFAULT NULL");
        }
        if (!$hasLikeCount) {
            $this->pdo->exec("ALTER TABLE t_activities ADD COLUMN like_count INTEGER DEFAULT 0");
        }
    }
    
    /**
     * 创建点赞表
     */
    private function createLikesTable() {
        $this->pdo->exec("CREATE TABLE IF NOT EXISTS t_likes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            activity_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(activity_id, user_id),
            FOREIGN KEY(activity_id) REFERENCES t_activities(id),
            FOREIGN KEY(user_id) REFERENCES t_users(id)
        )");
    }
    
    /**
     * 创建用户表
     */
    private function createUsersTable() {
        $this->pdo->exec("CREATE TABLE IF NOT EXISTS t_users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            reputation_score REAL DEFAULT 0,
            badges TEXT,
            user_role TEXT DEFAULT 'creator',
            skills TEXT DEFAULT '',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");
    }
    
    /**
     * 创建协作项目表
     */
    private function createCollaborationProjectsTable() {
        $this->pdo->exec("CREATE TABLE IF NOT EXISTS t_collaboration_projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            budget REAL,
            tags TEXT,
            requester_id INTEGER NOT NULL,
            creator_id INTEGER,
            status TEXT DEFAULT 'open',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(requester_id) REFERENCES t_users(id),
            FOREIGN KEY(creator_id) REFERENCES t_users(id)
        )");
        
        // 添加 withdrawn 和 withdrawn_at 字段
        $cols = $this->pdo->query("PRAGMA table_info(t_collaboration_projects)")->fetchAll(PDO::FETCH_ASSOC);
        $hasWithdrawn = false;
        $hasWithdrawnAt = false;
        foreach ($cols as $c) {
            if ($c['name'] === 'withdrawn') $hasWithdrawn = true;
            if ($c['name'] === 'withdrawn_at') $hasWithdrawnAt = true;
        }
        if (!$hasWithdrawn) {
            $this->pdo->exec("ALTER TABLE t_collaboration_projects ADD COLUMN withdrawn INTEGER DEFAULT 0");
        }
        if (!$hasWithdrawnAt) {
            $this->pdo->exec("ALTER TABLE t_collaboration_projects ADD COLUMN withdrawn_at TIMESTAMP DEFAULT NULL");
        }
    }
    
    /**
     * 创建里程碑表
     */
    private function createMilestonesTable() {
        $this->pdo->exec("CREATE TABLE IF NOT EXISTS t_milestones (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            submission_file TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(project_id) REFERENCES t_collaboration_projects(id)
        )");
    }
    
    /**
     * 创建协作消息表
     */
    private function createCollaborationMessagesTable() {
        $this->pdo->exec("CREATE TABLE IF NOT EXISTS t_collaboration_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL,
            sender_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(project_id) REFERENCES t_collaboration_projects(id),
            FOREIGN KEY(sender_id) REFERENCES t_users(id)
        )");
    }
    
    /**
     * 创建评价表
     */
    private function createRatingsTable() {
        $this->pdo->exec("CREATE TABLE IF NOT EXISTS t_ratings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL,
            rater_id INTEGER NOT NULL,
            rated_id INTEGER NOT NULL,
            score INTEGER NOT NULL,
            comment TEXT,
            badge_awarded TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(project_id) REFERENCES t_projects(id),
            FOREIGN KEY(rater_id) REFERENCES t_users(id),
            FOREIGN KEY(rated_id) REFERENCES t_users(id)
        )");
    }
    
    /**
     * 创建评论表
     */
    private function createCommentsTable() {
        $this->pdo->exec("CREATE TABLE IF NOT EXISTS t_comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            activity_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(activity_id) REFERENCES t_activities(id),
            FOREIGN KEY(user_id) REFERENCES t_users(id)
        )");
    }
    
    private function createSubscribableProjectsTable() {
        $this->pdo->exec("CREATE TABLE IF NOT EXISTS t_subscribable_projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            creator_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            price REAL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(creator_id) REFERENCES t_users(id)
        )");
    }

    private function createProjectSubscriptionsTable() {
        $this->pdo->exec("CREATE TABLE IF NOT EXISTS t_project_subscriptions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL,
            subscriber_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(project_id) REFERENCES t_subscribable_projects(id),
            FOREIGN KEY(subscriber_id) REFERENCES t_users(id)
        )");
    }

    /**
     * 插入初始示例数据
     */
    public function insertSampleData() {
        $this->insertSampleProjects();
        $this->insertSampleUsers();
        $this->insertSampleUser1();
        $this->insertSampleUser2();
        $this->insertSampleUser3();
        $this->insertSampleUser4();
        $this->insertSampleMessages();
        $this->insertSampleActivities();
    }
    
    private function insertSampleProjects() {
        $count = $this->pdo->query("SELECT COUNT(*) FROM t_projects")->fetchColumn();
        if ($count == 0) {
            $stmt = $this->pdo->prepare("INSERT INTO t_projects (title, description, budget, tags) VALUES (?, ?, ?, ?)");
            $stmt->execute(['Sample: 游戏角色设计Game character design', '为独立游戏设计5个角色，风格参考xxx.sample.com。Design five characters for the indie game, following the style of xxx.sample.com.', '$2000-5000', '角色设计,游戏美术,Character design, game art']);
            $stmt->execute(['游戏西语本地化Localization to Spanish games', '将5000字游戏文本从中文翻译成西班牙文，要求本地化与文化适配。Translate 5,000 words of game text from Chinese to Spanish, with the requirement of localization and cultural adaptation.', '按字数计费Charge by word count', '翻译,本地化,Translation,localization']);
        }
    }
    
    private function insertSampleUsers() {
        // Check if demo_user exists instead of checking if table is empty
        $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM t_users WHERE username = ?");
        $stmt->execute(['demo_user']);
        $count = $stmt->fetchColumn();
        
        if ($count == 0) {
            $stmt = $this->pdo->prepare("INSERT INTO t_users (username, email, password, reputation_score, badges) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute(['demo_user', 'demo@example.com', password_hash('demo123', PASSWORD_DEFAULT), 12.5, json_encode(['starter','contributor'])]);
        }
    }
    
    private function insertSampleUser1() {
        $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM t_users WHERE username = ?");
        $stmt->execute(['Alice']);
        $count = $stmt->fetchColumn();
        
        if ($count == 0) {
            $stmt = $this->pdo->prepare("INSERT INTO t_users (username, email, password, reputation_score, badges) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute(['Alice', 'alice@example.com', password_hash('demo123', PASSWORD_DEFAULT), 12.5, json_encode(['starter','contributor'])]);
        }
    }

    private function insertSampleUser2() {
        $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM t_users WHERE username = ?");
        $stmt->execute(['Bob']);
        $count = $stmt->fetchColumn();
        
        if ($count == 0) {
            $stmt = $this->pdo->prepare("INSERT INTO t_users (username, email, password, reputation_score, badges) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute(['Bob', 'bob@example.com', password_hash('demo123', PASSWORD_DEFAULT), 12.5, json_encode(['starter','contributor'])]);
        }
    }

    private function insertSampleUser3() {
        $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM t_users WHERE username = ?");
        $stmt->execute(['Charlie']);
        $count = $stmt->fetchColumn();
        
        if ($count == 0) {
            $stmt = $this->pdo->prepare("INSERT INTO t_users (username, email, password, reputation_score, badges) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute(['Charlie', 'charlie@example.com', password_hash('demo123', PASSWORD_DEFAULT), 12.5, json_encode(['starter','contributor'])]);
        }
    }

    private function insertSampleUser4() {
        $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM t_users WHERE username = ?");
        $stmt->execute(['Diana']);
        $count = $stmt->fetchColumn();
        
        if ($count == 0) {
            $stmt = $this->pdo->prepare("INSERT INTO t_users (username, email, password, reputation_score, badges) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute(['Diana', 'diana@example.com', password_hash('demo123', PASSWORD_DEFAULT), 12.5, json_encode(['starter','contributor'])]);
        }
    }

    private function insertSampleMessages() {
        $count = $this->pdo->query("SELECT COUNT(*) FROM t_messages")->fetchColumn();
        if ($count == 0) {
            $stmt = $this->pdo->prepare("INSERT INTO t_messages (col_content) VALUES (?)");
            $stmt->execute(['欢迎使用本地原型！这是一个示例消息，您可以通过界面添加/编辑/删除消息。Welcome to use the local prototype! This is a sample message. You can add/edit/delete messages through the interface.']);
            $stmt->execute(['试试在"发布"中上传一张 PNG 图片，或创建一个项目来体验完整流程。Try uploading a PNG image in "Publish", or create a project to experience the full process.']);
        }
    }
    
    private function insertSampleActivities() {
        $count = $this->pdo->query("SELECT COUNT(*) FROM t_activities")->fetchColumn();
        if ($count == 0) {
            $stmt = $this->pdo->prepare("INSERT INTO t_activities (type, title, content, image, author) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute(['post', '示例动态：共创挑战Example dynamic: Co-create challenges', '欢迎大家在此分享你的创意，参与我们的共创挑战！Welcome everyone to share your creativity here and participate in our co-creation challenges!', null, 'demo_user']);
        }
    }
}
