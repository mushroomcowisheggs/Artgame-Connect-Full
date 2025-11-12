<?php
/**
 * Activities API
 * 活动（动态/任务/服务）相关 API 接口
 */

class ActivitiesAPI {
    private $pdo;
    
    public function __construct($pdo) {
        $this->pdo = $pdo;
    }
    
    /**
     * 获取活动 Feed
     */
    public function getFeed() {
        $userId = $_SESSION['user_id'] ?? null;
        
        $stmt = $this->pdo->query("
            SELECT 
                a.id, 
                a.type, 
                a.title, 
                a.content, 
                a.image, 
                a.author, 
                a.author_id,
                a.like_count,
                a.created_at as createdAt,
                (SELECT COUNT(*) FROM t_comments WHERE activity_id = a.id) as comment_count
            FROM t_activities a
            ORDER BY a.id DESC
        ");
        $activities = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // 检查当前用户是否点赞
        foreach ($activities as &$activity) {
            $activity['is_liked'] = false;
            if ($userId) {
                $likeStmt = $this->pdo->prepare("SELECT COUNT(*) FROM t_likes WHERE activity_id = ? AND user_id = ?");
                $likeStmt->execute([$activity['id'], $userId]);
                $activity['is_liked'] = $likeStmt->fetchColumn() > 0;
            }
        }
        
        return ['code' => 200, 'feed' => $activities];
    }
    
    /**
     * 发布活动
     */
    public function publishActivity($data) {
        $type = trim($data['type'] ?? 'post');
        $title = trim($data['title'] ?? '');
        $content = trim($data['content'] ?? '');
        $image = trim($data['image'] ?? '');
        $author = $_SESSION['username'] ?? '匿名Anonymous';
        $authorId = $_SESSION['user_id'] ?? null;
        
        if (empty($content)) {
            throw new Exception('内容不能为空 Content cannot be empty');
        }
        
        $stmt = $this->pdo->prepare("INSERT INTO t_activities (type, title, content, image, author, author_id) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$type, $title, $content, $image, $author, $authorId]);
        
        return ['code' => 200, 'message' => '发布成功 Published successfully'];
    }
    
    /**
     * 删除活动
     */
    public function deleteActivity($data) {
        $activityId = intval($data['activity_id'] ?? 0);
        $userId = $_SESSION['user_id'] ?? null;
        
        if (!$userId) {
            throw new Exception('未登录 Not logged in');
        }
        
        if ($activityId <= 0) {
            throw new Exception('无效的活动ID Invalid activity ID');
        }
        
        // 检查权限
        $stmt = $this->pdo->prepare("SELECT author_id FROM t_activities WHERE id = ?");
        $stmt->execute([$activityId]);
        $activity = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$activity) {
            throw new Exception('活动不存在 Activity not found');
        }
        
        if ($activity['author_id'] != $userId) {
            throw new Exception('没有权限删除 No permission to delete');
        }
        
        // 删除活动及相关数据
        $this->pdo->prepare("DELETE FROM t_likes WHERE activity_id = ?")->execute([$activityId]);
        $this->pdo->prepare("DELETE FROM t_comments WHERE activity_id = ?")->execute([$activityId]);
        $this->pdo->prepare("DELETE FROM t_activities WHERE id = ?")->execute([$activityId]);
        
        return ['code' => 200, 'message' => '删除成功 Deleted successfully'];
    }
    
    /**
     * 切换点赞状态
     */
    public function toggleLike($data) {
        $activityId = intval($data['activity_id'] ?? 0);
        $userId = $_SESSION['user_id'] ?? null;
        
        if (!$userId) {
            throw new Exception('未登录 Not logged in');
        }
        
        if ($activityId <= 0) {
            throw new Exception('无效的活动ID Invalid activity ID');
        }
        
        // 检查是否已点赞
        $stmt = $this->pdo->prepare("SELECT id FROM t_likes WHERE activity_id = ? AND user_id = ?");
        $stmt->execute([$activityId, $userId]);
        $like = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($like) {
            // 取消点赞
            $this->pdo->prepare("DELETE FROM t_likes WHERE activity_id = ? AND user_id = ?")->execute([$activityId, $userId]);
            $this->pdo->prepare("UPDATE t_activities SET like_count = like_count - 1 WHERE id = ?")->execute([$activityId]);
            $message = '已取消点赞 Unliked';
        } else {
            // 添加点赞
            $this->pdo->prepare("INSERT INTO t_likes (activity_id, user_id) VALUES (?, ?)")->execute([$activityId, $userId]);
            $this->pdo->prepare("UPDATE t_activities SET like_count = like_count + 1 WHERE id = ?")->execute([$activityId]);
            $message = '点赞成功 Liked';
        }
        
        return ['code' => 200, 'message' => $message];
    }
    
    /**
     * 获取评论列表
     */
    public function getComments($activityId) {
        $activityId = intval($activityId);
        
        if ($activityId <= 0) {
            throw new Exception('无效的活动ID Invalid activity ID');
        }
        
        $stmt = $this->pdo->prepare("
            SELECT c.id, c.content, c.created_at, u.username
            FROM t_comments c
            LEFT JOIN t_users u ON c.user_id = u.id
            WHERE c.activity_id = ?
            ORDER BY c.created_at ASC
        ");
        $stmt->execute([$activityId]);
        $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        return ['code' => 200, 'comments' => $comments];
    }
    
    /**
     * 添加评论
     */
    public function addComment($data) {
        $activityId = intval($data['activity_id'] ?? 0);
        $content = trim($data['content'] ?? '');
        $userId = $_SESSION['user_id'] ?? null;
        
        if (!$userId) {
            throw new Exception('未登录 Not logged in');
        }
        
        if ($activityId <= 0) {
            throw new Exception('无效的活动ID Invalid activity ID');
        }
        
        if (empty($content)) {
            throw new Exception('评论内容不能为空 Comment cannot be empty');
        }
        
        $stmt = $this->pdo->prepare("INSERT INTO t_comments (activity_id, user_id, content) VALUES (?, ?, ?)");
        $stmt->execute([$activityId, $userId, $content]);
        
        return ['code' => 200, 'message' => '评论成功 Comment added'];
    }
}
