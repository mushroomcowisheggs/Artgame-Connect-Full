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
}
