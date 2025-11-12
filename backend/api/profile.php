<?php
/**
 * User Profile API
 * 用户资料相关 API 接口
 */

class ProfileAPI {
    private $pdo;
    
    public function __construct($pdo) {
        $this->pdo = $pdo;
    }
    
    /**
     * 获取用户资料
     */
    public function getUserProfile() {
        $userId = $_SESSION['user_id'] ?? null;
        
        if (!$userId) {
            throw new Exception('未登录 Not logged in');
        }
        
        $stmt = $this->pdo->prepare("SELECT * FROM t_users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            throw new Exception('用户不存在 User not found');
        }
        
        unset($user['password']);
        return ['code' => 200, 'profile' => $user];
    }
    
    /**
     * 添加技能标签
     */
    public function addSkill($data) {
        $userId = $_SESSION['user_id'] ?? null;
        
        if (!$userId) {
            throw new Exception('未登录 Not logged in');
        }
        
        $skill = trim($data['skill'] ?? '');
        
        if (empty($skill)) {
            throw new Exception('技能不能为空 Skill cannot be empty');
        }
        
        // 获取当前技能
        $stmt = $this->pdo->prepare("SELECT skills FROM t_users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $currentSkills = $user['skills'] ? explode(',', $user['skills']) : [];
        $currentSkills = array_map('trim', $currentSkills);
        
        // 添加新技能（如果不存在）
        if (!in_array($skill, $currentSkills)) {
            $currentSkills[] = $skill;
            $newSkills = implode(', ', $currentSkills);
            
            $stmt = $this->pdo->prepare("UPDATE t_users SET skills = ? WHERE id = ?");
            $stmt->execute([$newSkills, $userId]);
        }
        
        return ['code' => 200, 'message' => '技能添加成功 Skill added successfully'];
    }
    
    /**
     * 获取我的可订阅项目
     */
    public function getMySubscribableProjects() {
        $userId = $_SESSION['user_id'] ?? null;
        
        if (!$userId) {
            throw new Exception('未登录 Not logged in');
        }
        
        $stmt = $this->pdo->prepare("
            SELECT sp.*, 
                   (SELECT COUNT(*) FROM t_project_subscriptions WHERE project_id = sp.id) as subscriber_count
            FROM t_subscribable_projects sp
            WHERE sp.creator_id = ?
            ORDER BY sp.created_at DESC
        ");
        $stmt->execute([$userId]);
        $projects = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        return ['code' => 200, 'projects' => $projects];
    }
    
    /**
     * 发布可订阅项目
     */
    public function publishSubscribableProject($data) {
        $userId = $_SESSION['user_id'] ?? null;
        
        if (!$userId) {
            throw new Exception('未登录 Not logged in');
        }
        
        $title = trim($data['title'] ?? '');
        $description = trim($data['description'] ?? '');
        $price = floatval($data['price'] ?? 0);
        
        if (empty($title)) {
            throw new Exception('标题不能为空 Title cannot be empty');
        }
        
        $stmt = $this->pdo->prepare("
            INSERT INTO t_subscribable_projects (creator_id, title, description, price) 
            VALUES (?, ?, ?, ?)
        ");
        $stmt->execute([$userId, $title, $description, $price]);
        
        return ['code' => 200, 'message' => '项目发布成功 Project published successfully'];
    }
    
    /**
     * 确认项目完成
     */
    public function confirmProjectCompletion($data) {
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
        
        $isRequester = ($project['requester_id'] == $userId);
        $isCreator = ($project['creator_id'] == $userId);
        
        if (!$isRequester && !$isCreator) {
            throw new Exception('您不是该项目成员 You are not part of this project');
        }
        
        // 更新确认状态
        if ($isRequester) {
            $stmt = $this->pdo->prepare("UPDATE t_collaboration_projects SET requester_confirmed = 1 WHERE id = ?");
            $stmt->execute([$projectId]);
        } else {
            $stmt = $this->pdo->prepare("UPDATE t_collaboration_projects SET creator_confirmed = 1 WHERE id = ?");
            $stmt->execute([$projectId]);
        }
        
        // 检查双方是否都已确认
        $stmt = $this->pdo->prepare("SELECT requester_confirmed, creator_confirmed FROM t_collaboration_projects WHERE id = ?");
        $stmt->execute([$projectId]);
        $confirmations = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($confirmations['requester_confirmed'] && $confirmations['creator_confirmed']) {
            $stmt = $this->pdo->prepare("UPDATE t_collaboration_projects SET status = 'closed', completed_at = CURRENT_TIMESTAMP WHERE id = ?");
            $stmt->execute([$projectId]);
        }
        
        return ['code' => 200, 'message' => '完成确认成功 Completion confirmed'];
    }
    
    /**
     * 撤回项目
     */
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
     * 提交项目评价
     */
    public function submitProjectReview($data) {
        $userId = $_SESSION['user_id'] ?? null;
        
        if (!$userId) {
            throw new Exception('未登录 Not logged in');
        }
        
        $projectId = intval($data['project_id'] ?? 0);
        $rating = intval($data['rating'] ?? 0);
        $comment = trim($data['comment'] ?? '');
        
        if ($projectId <= 0) {
            throw new Exception('无效的项目ID Invalid project ID');
        }
        
        if ($rating < 1 || $rating > 5) {
            throw new Exception('评分必须在1-5之间 Rating must be between 1 and 5');
        }
        
        // 获取项目
        $stmt = $this->pdo->prepare("SELECT * FROM t_collaboration_projects WHERE id = ?");
        $stmt->execute([$projectId]);
        $project = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$project) {
            throw new Exception('项目不存在 Project not found');
        }
        
        $isRequester = ($project['requester_id'] == $userId);
        $isCreator = ($project['creator_id'] == $userId);
        
        if (!$isRequester && !$isCreator) {
            throw new Exception('您不是该项目成员 You are not part of this project');
        }
        
        // 确定被评价者
        $revieweeId = $isRequester ? $project['creator_id'] : $project['requester_id'];
        
        // 插入评价
        $stmt = $this->pdo->prepare("
            INSERT INTO t_ratings (project_id, rater_id, rated_id, score, comment) 
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([$projectId, $userId, $revieweeId, $rating, $comment]);
        
        // 更新被评价者的声誉分数
        $stmt = $this->pdo->prepare("
            SELECT AVG(score) as avg_score FROM t_ratings WHERE rated_id = ?
        ");
        $stmt->execute([$revieweeId]);
        $avgScore = $stmt->fetchColumn();
        
        $stmt = $this->pdo->prepare("UPDATE t_users SET reputation_score = ? WHERE id = ?");
        $stmt->execute([$avgScore, $revieweeId]);
        
        return ['code' => 200, 'message' => '评价提交成功 Review submitted successfully'];
    }
}
