<?php
/**
 * Collaboration API
 * 协作工作台相关 API 接口
 */

class CollaborationAPI {
    private $pdo;
    
    public function __construct($pdo) {
        $this->pdo = $pdo;
    }
    
    /**
     * 获取所有协作项目
     */
    public function getCollaborationProjects() {
        $stmt = $this->pdo->query("SELECT id, title, description, budget, tags, requester_id, creator_id, status, created_at FROM t_collaboration_projects ORDER BY id DESC");
        $projects = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return ['code' => 200, 'projects' => $projects];
    }
    
    /**
     * 获取单个协作项目详情
     */
    public function getCollaborationProject($projectId) {
        $projectId = intval($projectId);
        
        if ($projectId <= 0) {
            throw new Exception('无效的项目ID Invalid project ID');
        }
        
        $stmt = $this->pdo->prepare("SELECT id, title, description, budget, tags, requester_id, creator_id, status, created_at FROM t_collaboration_projects WHERE id = ?");
        $stmt->execute([$projectId]);
        $project = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$project) {
            throw new Exception('项目不存在 Project not found');
        }
        
        // 获取里程碑
        $msStmt = $this->pdo->prepare("SELECT id, project_id, title, status, submission_file, created_at FROM t_milestones WHERE project_id = ? ORDER BY id ASC");
        $msStmt->execute([$projectId]);
        $project['milestones'] = $msStmt->fetchAll(PDO::FETCH_ASSOC);
        
        // 获取消息
        $msgStmt = $this->pdo->prepare("SELECT m.id, m.project_id, m.sender_id, m.content, m.created_at, u.username FROM t_collaboration_messages m LEFT JOIN t_users u ON m.sender_id = u.id WHERE m.project_id = ? ORDER BY m.created_at ASC");
        $msgStmt->execute([$projectId]);
        $project['messages'] = $msgStmt->fetchAll(PDO::FETCH_ASSOC);
        
        // 获取需求方和创作者信息
        $reqStmt = $this->pdo->prepare("SELECT id, username, user_role, skills FROM t_users WHERE id = ?");
        $reqStmt->execute([$project['requester_id']]);
        $project['requester'] = $reqStmt->fetch(PDO::FETCH_ASSOC);
        
        if ($project['creator_id']) {
            $creStmt = $this->pdo->prepare("SELECT id, username, user_role, skills FROM t_users WHERE id = ?");
            $creStmt->execute([$project['creator_id']]);
            $project['creator'] = $creStmt->fetch(PDO::FETCH_ASSOC);
        }
        
        return ['code' => 200, 'project' => $project];
    }
    
    /**
     * 创建协作项目
     */
    public function createCollaborationProject($data) {
        $title = trim($data['title'] ?? '');
        $description = trim($data['description'] ?? '');
        $budget = floatval($data['budget'] ?? 0);
        $skillTag = trim($data['tags'] ?? '');
        $userId = $_SESSION['user_id'] ?? null;
        
        if (!$userId) {
            throw new Exception('未登录 Not logged in');
        }
        
        if (empty($title)) {
            throw new Exception('标题不能为空 Title cannot be empty');
        }
        
        $stmt = $this->pdo->prepare("INSERT INTO t_collaboration_projects (title, description, budget, tags, requester_id, status) VALUES (?, ?, ?, ?, ?, 'open')");
        $stmt->execute([$title, $description, $budget, $skillTag, $userId]);
        $projectId = $this->pdo->lastInsertId();
        
        return ['code' => 200, 'message' => '项目创建成功 Project created successfully', 'project_id' => (int)$projectId];
    }
    
    /**
     * 申请协作项目
     */
    public function applyCollaborationProject($data) {
        $projectId = intval($data['project_id'] ?? 0);
        $userId = $_SESSION['user_id'] ?? null;
        
        if (!$userId) {
            throw new Exception('未登录 Not logged in');
        }
        
        if ($projectId <= 0) {
            throw new Exception('无效的项目ID Invalid project ID');
        }
        
        // 更新项目分配创作者
        $stmt = $this->pdo->prepare("UPDATE t_collaboration_projects SET creator_id = ?, status = 'in_progress' WHERE id = ?");
        $stmt->execute([$userId, $projectId]);
        
        return ['code' => 200, 'message' => '申请成功 Application submitted successfully'];
    }
    
    /**
     * 添加协作消息
     */
    public function addCollaborationMessage($data) {
        $projectId = intval($data['project_id'] ?? 0);
        $content = trim($data['content'] ?? '');
        $userId = $_SESSION['user_id'] ?? null;
        
        if (!$userId) {
            throw new Exception('未登录 Not logged in');
        }
        
        if ($projectId <= 0) {
            throw new Exception('无效的项目ID Invalid project ID');
        }
        
        if (empty($content)) {
            throw new Exception('消息不能为空 Message cannot be empty');
        }
        
        $stmt = $this->pdo->prepare("INSERT INTO t_collaboration_messages (project_id, sender_id, content) VALUES (?, ?, ?)");
        $stmt->execute([$projectId, $userId, $content]);
        
        return ['code' => 200, 'message' => '消息发送成功 Message added successfully'];
    }
    
    /**
     * 更新里程碑状态
     */
    public function updateMilestoneStatus($data) {
        $milestoneId = intval($data['milestone_id'] ?? 0);
        $status = trim($data['status'] ?? '');
        $userId = $_SESSION['user_id'] ?? null;
        
        if (!$userId) {
            throw new Exception('未登录 Not logged in');
        }
        
        if ($milestoneId <= 0) {
            throw new Exception('无效的里程碑ID Invalid milestone ID');
        }
        
        // 验证用户是需求方
        $msStmt = $this->pdo->prepare("SELECT m.id, p.requester_id FROM t_milestones m JOIN t_collaboration_projects p ON m.project_id = p.id WHERE m.id = ?");
        $msStmt->execute([$milestoneId]);
        $ms = $msStmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$ms) {
            throw new Exception('里程碑不存在 Milestone not found');
        }
        
        if ($ms['requester_id'] != $userId) {
            throw new Exception('权限不足 Permission denied');
        }
        
        $stmt = $this->pdo->prepare("UPDATE t_milestones SET status = ? WHERE id = ?");
        $stmt->execute([$status, $milestoneId]);
        
        return ['code' => 200, 'message' => '里程碑更新成功 Milestone updated successfully'];
    }
    
    /**
     * 获取匹配的创作者
     */
    public function getMatchingCreators($skillTag) {
        $skillTag = trim($skillTag);
        
        if (empty($skillTag)) {
            throw new Exception('技能标签不能为空 Skill tag required');
        }
        
        $stmt = $this->pdo->prepare("SELECT id, username, user_role, skills, reputation_score FROM t_users WHERE user_role = 'creator' AND skills LIKE ? ORDER BY reputation_score DESC");
        $stmt->execute(['%' . $skillTag . '%']);
        $creators = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        return ['code' => 200, 'creators' => $creators];
    }
}
