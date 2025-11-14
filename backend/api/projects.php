<?php
/**
 * Projects API
 * 项目相关 API 接口
 */

class ProjectsAPI {
    private $pdo;
    
    public function __construct($pdo) {
        $this->pdo = $pdo;
    }
    
    /**
     * 获取所有项目
     */
    public function getProjects() {
        $stmt = $this->pdo->query("SELECT id, title, description, budget, tags, created_at FROM t_projects ORDER BY id DESC");
        $projects = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return ['code' => 200, 'projects' => $projects];
    }
    
    /**
     * 添加项目
     */
    public function addProject($data) {
        $title = trim($data['title'] ?? '');
        $description = trim($data['description'] ?? '');
        $budget = trim($data['budget'] ?? '');
        $tags = trim($data['tags'] ?? '');
        
        if (empty($title)) {
            throw new Exception('项目标题不能为空 Project title cannot be empty');
        }
        
        $stmt = $this->pdo->prepare("INSERT INTO t_projects (title, description, budget, tags) VALUES (?, ?, ?, ?)");
        $stmt->execute([$title, $description, $budget, $tags]);
        
        return ['code' => 200, 'message' => '项目创建成功 Project created successfully'];
    }
    
    /**
     * 订阅项目
     */
    public function subscribeProject($data) {
        $projectId = intval($data['project_id'] ?? 0);
        $subscriber = trim($data['subscriber'] ?? '');
        
        if ($projectId <= 0) {
            throw new Exception('无效的项目ID Invalid project ID');
        }
        
        if (empty($subscriber)) {
            throw new Exception('订阅者名称不能为空 Subscriber name cannot be empty');
        }
        
        $stmt = $this->pdo->prepare("INSERT INTO t_subscriptions (project_id, subscriber) VALUES (?, ?)");
        $stmt->execute([$projectId, $subscriber]);
        
        return ['code' => 200, 'message' => '订阅成功 Subscription successful'];
    }
    
    /**
     * 获取项目订阅列表
     */
    public function getSubscriptions($projectId) {
        $projectId = intval($projectId);
        
        if ($projectId <= 0) {
            throw new Exception('无效的项目ID Invalid project ID');
        }
        
        $stmt = $this->pdo->prepare("SELECT id, subscriber, created_at FROM t_subscriptions WHERE project_id = ? ORDER BY id DESC");
        $stmt->execute([$projectId]);
        $subscriptions = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        return ['code' => 200, 'subscriptions' => $subscriptions];
    }

    public function withdrawProject($data) {
        $userId = $_SESSION['user_id'] ?? null;
        
        if (!$userId) {
            throw new Exception('未登录 Not logged in');
        }
        
        $projectId = intval($data['project_id'] ?? 0);
        
        if ($projectId <= 0) {
            throw new Exception('无效的项目ID Invalid project ID');
        }
        
        // 获取项目
        $stmt = $this->pdo->prepare("SELECT * FROM t_collaboration_projects WHERE id = ?");
        $stmt->execute([$projectId]);
        $project = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$project) {
            throw new Exception('项目不存在 Project not found');
        }
        
        if ($project['requester_id'] != $userId) {
            throw new Exception('只有需求方可以撤回项目 Only the requester can withdraw the project');
        }
        
        if ($project['status'] !== 'open') {
            throw new Exception('只能撤回开放状态的项目 Can only withdraw open projects');
        }
        
        $stmt = $this->pdo->prepare("UPDATE t_collaboration_projects SET withdrawn = 1, withdrawn_at = CURRENT_TIMESTAMP, status = 'withdrawn' WHERE id = ?");
        $stmt->execute([$projectId]);
        
        return ['code' => 200, 'message' => '项目撤回成功 Project withdrawn successfully'];
    }
}
