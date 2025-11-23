<?php
/**
 * Main API Router
 * 主 API 路由文件 - 重构版
 */

// 1. 基础配置
session_start();
header('Content-Type: application/json; charset=utf-8');

// 2. 加载配置和类文件
$pdo = require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../classes/DatabaseInitializer.php';
require_once __DIR__ . '/../classes/FileUploader.php';
require_once __DIR__ . '/messages.php';
require_once __DIR__ . '/projects.php';
require_once __DIR__ . '/activities.php';
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/collaboration.php';
require_once __DIR__ . '/profile.php';

// 3. 初始化数据库
$dbInit = new DatabaseInitializer($pdo);
$dbInit->initializeTables();
$dbInit->insertSampleData();

// 4. 初始化 API 控制器
$messagesAPI = new MessagesAPI($pdo);
$projectsAPI = new ProjectsAPI($pdo);
$activitiesAPI = new ActivitiesAPI($pdo);
$authAPI = new AuthAPI($pdo);
$collaborationAPI = new CollaborationAPI($pdo);
$profileAPI = new ProfileAPI($pdo);
$fileUploader = new FileUploader(
    null,
    ['image/png','image/jpeg','image/jpg','image/gif','image/webp','application/pdf','text/plain'],
    20971520 // 20MB
);

// 5. 路由处理
$action = $_GET['action'] ?? '';

try {
    switch ($action) {
        // ===== 消息相关 Messages =====
        case 'get_messages':
        case 'get_public_messages': // 修复前端调用名称不一致的问题
            echo json_encode($messagesAPI->getMessages());
            break;
        
        case 'add_public_message':
            $data = json_decode(file_get_contents('php://input'), true);
            echo json_encode($messagesAPI->addMessage($data));
            break;
        
        case 'delete_message':
            $data = json_decode(file_get_contents('php://input'), true);
            echo json_encode($messagesAPI->deleteMessage($data));
            break;
        
        case 'add':
            $data = json_decode(file_get_contents('php://input'), true);
            echo json_encode($messagesAPI->addMessage($data));
            break;
        
        case 'update':
            $data = json_decode(file_get_contents('php://input'), true);
            echo json_encode($messagesAPI->updateMessage($data));
            break;
        
        case 'delete':
            $data = json_decode(file_get_contents('php://input'), true);
            echo json_encode($messagesAPI->deleteMessage($data));
            break;
        
        // ===== 项目相关 Projects =====
        case 'get_projects':
            echo json_encode($projectsAPI->getProjects());
            break;
        
        case 'add_project':
            $data = json_decode(file_get_contents('php://input'), true);
            echo json_encode($projectsAPI->addProject($data));
            break;
        
        case 'delete_project':
            $data = json_decode(file_get_contents('php://input'), true);
            echo json_encode($projectsAPI->deleteProject($data));
            break;
        
        case 'subscribe':
            $data = json_decode(file_get_contents('php://input'), true);
            echo json_encode($projectsAPI->subscribeProject($data));
            break;
        
        case 'get_subscriptions':
            $projectId = intval($_GET['project_id'] ?? 0);
            echo json_encode($projectsAPI->getSubscriptions($projectId));
            break;
        
        // ===== 活动相关 Activities =====
        case 'get_feed':
            echo json_encode($activitiesAPI->getFeed());
            break;
        
        case 'publish':
            $data = json_decode(file_get_contents('php://input'), true);
            echo json_encode($activitiesAPI->publishActivity($data));
            break;
        
        case 'delete_activity':
            $data = json_decode(file_get_contents('php://input'), true);
            echo json_encode($activitiesAPI->deleteActivity($data));
            break;
        
        case 'toggle_like':
            $data = json_decode(file_get_contents('php://input'), true);
            echo json_encode($activitiesAPI->toggleLike($data));
            break;
        
        case 'get_comments':
            $activityId = intval($_GET['activity_id'] ?? 0);
            echo json_encode($activitiesAPI->getComments($activityId));
            break;
        
        case 'add_comment':
            $data = json_decode(file_get_contents('php://input'), true);
            echo json_encode($activitiesAPI->addComment($data));
            break;
        
        case 'delete_comment':
            $data = json_decode(file_get_contents('php://input'), true);
            echo json_encode($activitiesAPI->deleteComment($data));
            break;
        
        // ===== 用户认证 Authentication =====
        case 'login':
            $data = json_decode(file_get_contents('php://input'), true);
            echo json_encode($authAPI->login($data));
            break;
        
        case 'register':
            $data = json_decode(file_get_contents('php://input'), true);
            echo json_encode($authAPI->register($data));
            break;
        
        case 'logout':
            echo json_encode($authAPI->logout());
            break;
        
        case 'whoami':
            echo json_encode($authAPI->whoami());
            break;
        
        case 'switch_user_role':
            $data = json_decode(file_get_contents('php://input'), true);
            echo json_encode($authAPI->switchUserRole($data));
            break;
        
        // ===== 协作工作台 Collaboration =====
        case 'get_collaboration_projects':
            echo json_encode($collaborationAPI->getCollaborationProjects());
            break;
        
        case 'get_collaboration_project':
            $projectId = intval($_GET['project_id'] ?? 0);
            echo json_encode($collaborationAPI->getCollaborationProject($projectId));
            break;
        
        case 'create_collaboration_project':
            $data = json_decode(file_get_contents('php://input'), true);
            echo json_encode($collaborationAPI->createCollaborationProject($data));
            break;
        
        case 'apply_collaboration_project':
            $data = json_decode(file_get_contents('php://input'), true);
            echo json_encode($collaborationAPI->applyCollaborationProject($data));
            break;
        
        case 'add_collaboration_message':
            $data = json_decode(file_get_contents('php://input'), true);
            echo json_encode($collaborationAPI->addCollaborationMessage($data));
            break;
        
	        case 'update_milestone_status':
	            $data = json_decode(file_get_contents('php://input'), true);
	            echo json_encode($collaborationAPI->updateMilestoneStatus($data));
	            break;
	        
	        case 'get_milestones':
	            $projectId = intval($_GET['project_id'] ?? 0);
	            echo json_encode($collaborationAPI->getMilestones($projectId));
	            break;
        
        case 'get_matching_creators':
            $skillTag = trim($_GET['tags'] ?? '');
            echo json_encode($collaborationAPI->getMatchingCreators($skillTag));
            break;
        
        // ===== 用户资料 Profile =====
        case 'get_user_profile':
            echo json_encode($profileAPI->getUserProfile());
            break;
        
        case 'add_skill':
            $data = json_decode(file_get_contents('php://input'), true);
            echo json_encode($profileAPI->addSkill($data));
            break;
        
        case 'get_my_subscribable_projects':
            echo json_encode($profileAPI->getMySubscribableProjects());
            break;
        
        case 'publish_subscribable_project':
            $data = json_decode(file_get_contents('php://input'), true);
            echo json_encode($profileAPI->publishSubscribableProject($data));
            break;
        
        case 'confirm_project_completion':
            $data = json_decode(file_get_contents('php://input'), true);
            echo json_encode($profileAPI->confirmProjectCompletion($data));
            break;
        
        case 'withdraw_project':
            $data = json_decode(file_get_contents('php://input'), true);
            echo json_encode($projectsAPI->withdrawProject($data));
            break;
        
        case 'submit_project_review':
            $data = json_decode(file_get_contents('php://input'), true);
            echo json_encode($profileAPI->submitProjectReview($data));
            break;
        
        case 'get_personal_projects':
            echo json_encode($profileAPI->getPersonalProjects());
            break;
        
        case 'add_personal_project':
            $data = json_decode(file_get_contents('php://input'), true);
            echo json_encode($profileAPI->addPersonalProject($data));
            break;
        
        case 'delete_personal_project':
            $data = json_decode(file_get_contents('php://input'), true);
            echo json_encode($profileAPI->deletePersonalProject($data));
            break;
        
        // ===== 自动点赞 Auto Likes =====
        case 'process_auto_likes':
            // 处理待执行的自动点赞任务
            $stmt = $pdo->query("
                SELECT al.id, al.activity_id 
                FROM t_auto_likes al
                WHERE al.created_at <= datetime('now', '-2 seconds')
                AND NOT EXISTS (
                    SELECT 1 FROM t_likes 
                    WHERE activity_id = al.activity_id 
                    AND user_id = 0
                )
                LIMIT 10
            ");
            $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            foreach ($tasks as $task) {
                // 添加2个点赞（使用系统账户 user_id=0）
                for ($i = 0; $i < 2; $i++) {
                    try {
                        $pdo->prepare("INSERT OR IGNORE INTO t_likes (activity_id, user_id) VALUES (?, ?)") 
                            ->execute([$task['activity_id'], 0]);
                    } catch (Exception $e) {
                        // 忽略重复插入错误
                    }
                }
                // 更新点赞数
                $pdo->prepare("UPDATE t_activities SET like_count = like_count + 2 WHERE id = ?")
                    ->execute([$task['activity_id']]);
                // 删除任务
                $pdo->prepare("DELETE FROM t_auto_likes WHERE id = ?")->execute([$task['id']]);
            }
            
            echo json_encode(['code' => 200, 'processed' => count($tasks)]);
            break;
        
        // ===== 文件上传 File Upload =====
        case 'upload':
            try {
                $userId = $_SESSION['user_id'] ?? null;
                if (!$userId) {
                    throw new Exception('请先登录 Please login first');
                }
                $milestoneId = isset($_POST['milestone_id']) ? intval($_POST['milestone_id']) : null;
                if ($milestoneId) {
                    $check = $pdo->prepare("SELECT COUNT(*) FROM t_milestones WHERE id = ?");
                    $check->execute([$milestoneId]);
                    if ($check->fetchColumn() == 0) {
                        $milestoneId = null; // 不存在则忽略
                    }
                }
                // Daily limit check (10 files per user per day)
                $stmt = $pdo->prepare("SELECT COUNT(*) FROM t_uploads WHERE user_id = ? AND date(created_at) = date('now')");
                $stmt->execute([$userId]);
                $countToday = (int)$stmt->fetchColumn();
                if ($countToday >= 10) {
                    throw new Exception('已达到今天上传上限 Daily upload limit reached (10)');
                }
                // Perform upload
                $filePath = $fileUploader->upload('file');
                $originalName = $_FILES['file']['name'] ?? '';
                $storedName = basename($filePath);
                $mimeType = $_FILES['file']['type'] ?? '';
                $size = $_FILES['file']['size'] ?? 0;
                // Record metadata
                $stmt = $pdo->prepare("INSERT INTO t_uploads (user_id, milestone_id, original_name, stored_name, path, mime_type, size) VALUES (?, ?, ?, ?, ?, ?, ?)");
                $stmt->execute([$userId, $milestoneId, $originalName, $storedName, $filePath, $mimeType, $size]);
                echo json_encode(['code' => 200, 'message' => '上传成功 Upload successful', 'path' => $filePath, 'original' => $originalName, 'milestone_id' => $milestoneId]);
            } catch (Exception $e) {
                echo json_encode(['code' => 400, 'message' => $e->getMessage()]);
            }
            break;
        
        default:
            throw new Exception('无效的操作 Invalid operation: ' . $action);
    }
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['code' => 400, 'message' => $e->getMessage()]);
}
