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

    /**
     * 删除项目（仅管理员）
     */
    public function deleteProject($data) {
        $projectId = intval($data['project_id'] ?? $data['id'] ?? 0);
        $userId = $_SESSION['user_id'] ?? null;
        $isAdmin = $_SESSION['is_admin'] ?? 0;

        if (!$userId) {
            throw new Exception('未登录 Not logged in');
        }

        if (!$isAdmin) {
            throw new Exception('没有权限删除项目 No permission to delete project');
        }

        if ($projectId <= 0) {
            throw new Exception('无效的项目ID Invalid project ID');
        }

        try {
            $this->pdo->beginTransaction();
            
            // 检查项目在任一表中是否存在
            $stmt = $this->pdo->prepare("SELECT id FROM t_projects WHERE id = ?");
            $stmt->execute([$projectId]);
            $proj = $stmt->fetch(PDO::FETCH_ASSOC);
            $stmt = $this->pdo->prepare("SELECT id FROM t_collaboration_projects WHERE id = ? OR project_id = ?");
            $stmt->execute([$projectId, $projectId]);
            $collabProj = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$proj && !$collabProj) {
                throw new Exception('项目不存在 Project not found');
            }
            // 删除所有关联数据
            $this->pdo->prepare("DELETE FROM t_collaboration_projects WHERE id = ? OR project_id = ?")->execute([$projectId, $projectId]);
            $this->pdo->prepare("DELETE FROM t_milestones WHERE project_id IN (SELECT id FROM t_collaboration_projects WHERE id = ? OR project_id = ?)")->execute([$projectId, $projectId]);
            $this->pdo->prepare("DELETE FROM t_collaboration_messages WHERE project_id IN (SELECT id FROM t_collaboration_projects WHERE id = ? OR project_id = ?)")->execute([$projectId, $projectId]);

            // 删除相关订阅
            $this->pdo->prepare("DELETE FROM t_subscriptions WHERE project_id = ?")->execute([$projectId]);

            // 删除基础项目
            $stmt = $this->pdo->prepare("DELETE FROM t_projects WHERE id = ?");
            $stmt->execute([$projectId]);

            $this->pdo->commit();
            
            return ['code' => 200, 'message' => '删除成功 Project deleted successfully'];
        } catch (Exception $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }
}
