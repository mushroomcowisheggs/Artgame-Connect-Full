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
		        
		        $stmt = $this->pdo->prepare("SELECT id, title, description, budget, tags, requester_id, creator_id, status, created_at, time_limit FROM t_collaboration_projects WHERE id = ?");
		        $stmt->execute([$projectId]);
		        $project = $stmt->fetch(PDO::FETCH_ASSOC);
		        
		        // 获取项目里程碑数据
		        $partsStmt = $this->pdo->prepare("SELECT id, project_id, title, percentage, status FROM t_project_parts WHERE project_id = ? ORDER BY part_number ASC");
		        $partsStmt->execute([$projectId]);
		        $parts = $partsStmt->fetchAll(PDO::FETCH_ASSOC);
		        
		        // 转换为前端需要的里程碑格式
		        $milestones = [];
		        foreach ($parts as $part) {
		            $milestones[] = [
		                'id' => $part['id'],
		                'projectId' => $part['project_id'],
		                'title' => $part['title'],
		                'description' => '项目部分 ' . $part['percentage'] . '%',
		                'status' => $part['status'] === 'completed' ? 'completed' : 'planning',
		                'percentage' => $part['percentage'],
		                'createdAt' => date('Y-m-d H:i:s')
		            ];
		        }
		        
		        $project['milestones'] = $milestones;
        
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
        
        // 获取项目部分
        $partsStmt = $this->pdo->prepare("SELECT id, part_number, title, percentage, status FROM t_project_parts WHERE project_id = ? ORDER BY part_number ASC");
        $partsStmt->execute([$projectId]);
        $project['parts'] = $partsStmt->fetchAll(PDO::FETCH_ASSOC);
        
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
        $parts = $data['parts'] ?? [];
        $timeLimit = intval($data['time_limit'] ?? 30);
        $userId = $_SESSION['user_id'] ?? null;
        
        if (!$userId) {
            throw new Exception('未登录 Not logged in');
        }
        
        if (empty($title)) {
            throw new Exception('标题不能为空 Title cannot be empty');
        }
        
        // 验证描述长度（固定最多500，最少根据预算计算）
        $descLength = mb_strlen($description);
        $maxLength = 500; // 固定最大500字符
        $minLength = 0;
        
        if ($budget >= 500) {
            $minLength = 50;
            if ($budget >= 1000) {
                $minLength = 100;
                // 每增加100 budget，增加10个字符限制
                $additionalBudget = $budget - 1000;
                $minLength += floor($additionalBudget / 100) * 10;
            }
            // 不超过500的上限
            $minLength = min($minLength, $maxLength);
        }
        
        if ($minLength > 0 && $descLength < $minLength) {
            throw new Exception("项目描述至少需要 {$minLength} 个字符 Description must be at least {$minLength} characters");
        }
        
        if ($descLength > $maxLength) {
            throw new Exception("项目描述最多 {$maxLength} 个字符 Description cannot exceed {$maxLength} characters");
        }
        
        // 验证项目部分配置（最多9个）
        if (!empty($parts) && count($parts) > 9) {
            throw new Exception('项目部分最多9个 Parts cannot exceed 9');
        }

        try {
            $this->pdo->beginTransaction();
            
            // 先创建基础项目
            $stmt = $this->pdo->prepare("INSERT INTO t_projects (title, description, budget, tags) VALUES (?, ?, ?, ?)");
            $stmt->execute([$title, $description, $budget, $skillTag]);
            $baseProjectId = $this->pdo->lastInsertId();
            
            // 创建协作项目并关联基础项目
            $stmt = $this->pdo->prepare("INSERT INTO t_collaboration_projects (project_id, title, description, budget, tags, requester_id, time_limit, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'open')");
            $stmt->execute([$baseProjectId, $title, $description, $budget, $skillTag, $userId, $timeLimit]);
            $collabProjectId = $this->pdo->lastInsertId();
            
            // 保存项目部分配置
            if (!empty($parts)) {
                $partStmt = $this->pdo->prepare("INSERT INTO t_project_parts (project_id, part_number, title, percentage) VALUES (?, ?, ?, ?)");
                foreach ($parts as $index => $part) {
                    $partTitle = trim($part['title'] ?? '');
                    $partPercentage = floatval($part['percentage'] ?? 0);
                    if (!empty($partTitle) && $partPercentage > 0) {
                        $partStmt->execute([$collabProjectId, $index + 1, $partTitle, $partPercentage]);
                    }
                }
            }
            
            $this->pdo->commit();
            
            return ['code' => 200, 'message' => '项目创建成功 Project created successfully', 'project_id' => (int)$collabProjectId];
        } catch (Exception $e) {
            $this->pdo->rollBack();
            throw $e;
        }
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
	    /**
	     * 获取项目里程碑
	     */
	    public function getMilestones($projectId) {
	        $projectId = intval($projectId);
	        
	        if ($projectId <= 0) {
	            throw new Exception('无效的项目ID Invalid project ID');
	        }
	        
	        // 检查项目是否存在
	        $stmt = $this->pdo->prepare("SELECT id FROM t_collaboration_projects WHERE id = ?");
	        $stmt->execute([$projectId]);
	        if (!$stmt->fetch(PDO::FETCH_ASSOC)) {
	            throw new Exception('项目不存在 Project not found');
	        }
	        
	        // 获取项目部分作为里程碑
	        $partsStmt = $this->pdo->prepare("SELECT id, project_id, title, percentage, status FROM t_project_parts WHERE project_id = ? ORDER BY part_number ASC");
	        $partsStmt->execute([$projectId]);
	        $parts = $partsStmt->fetchAll(PDO::FETCH_ASSOC);
	        
	        // 转换为前端需要的里程碑格式
	        $milestones = [];
	        foreach ($parts as $part) {
	            $milestones[] = [
	                'id' => $part['id'],
	                'projectId' => $part['project_id'],
	                'title' => $part['title'],
	                'description' => '项目部分 ' . $part['percentage'] . '%', // 简单的描述
	                'stage' => $part['status'] === 'completed' ? 'completed' : 'planning', // 简单的状态映射
	                'payment' => $part['percentage'], // 使用百分比作为支付比例
	                'files' => [], // 暂时为空
	                'createdAt' => date('Y-m-d H:i:s')
	            ];
	        }
	        
	        return ['code' => 200, 'milestones' => $milestones];
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
