<?php
/**
 * Messages API
 * 消息相关 API 接口
 */

class MessagesAPI {
    private $pdo;
    
    public function __construct($pdo) {
        $this->pdo = $pdo;
    }
    
    /**
     * 获取所有消息
     */
    public function getMessages() {
        $stmt = $this->pdo->query("SELECT col_id as id, col_content as content, col_created_at as createdAt, col_author as author, col_author_id as author_id FROM t_messages ORDER BY col_id DESC");
        $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return ['code' => 200, 'messages' => $messages];
    }
    
    /**
     * 添加消息
     */
    public function addMessage($data) {
        $content = trim($data['content'] ?? trim($data['col_content'] ?? ''));
        if (empty($content)) {
            throw new Exception('消息内容不能为空 The content of the message cannot be empty');
        }
        
        $author = $_SESSION['username'] ?? trim($data['col_author'] ?? ($data['author'] ?? '匿名Anonymous'));
        $authorId = isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : null;
        
        $stmt = $this->pdo->prepare("INSERT INTO t_messages (col_content, col_author, col_author_id) VALUES (?, ?, ?)");
        $stmt->execute([$content, $author, $authorId]);
        
        return ['code' => 200, 'message' => '添加成功 Added successfully'];
    }
    
    /**
     * 更新消息
     */
    public function updateMessage($data) {
        $id = intval($data['col_id'] ?? 0);
        $content = trim($data['col_content'] ?? '');
        
        if (empty($content)) {
            throw new Exception('修改内容不能为空 The modified content cannot be empty');
        }
        
        $stmt = $this->pdo->prepare("UPDATE t_messages SET col_content = ? WHERE col_id = ?");
        $stmt->execute([$content, $id]);
        
        if ($stmt->rowCount() === 0) {
            throw new Exception('消息不存在 The message does not exist.');
        }
        
        return ['code' => 200, 'message' => '修改成功 Modification successful'];
    }
    
    /**
     * 删除消息
     */
    public function deleteMessage($data) {
        $id = intval($data['message_id'] ?? $data['col_id'] ?? 0);
        $sessionUserId = $_SESSION['user_id'] ?? null;
        
        if (!$sessionUserId) {
            throw new Exception('未登录或权限不足 Not logged in or insufficient permissions');
        }
        
        // 查找消息
        $stmt = $this->pdo->prepare("SELECT col_author_id FROM t_messages WHERE col_id = ?");
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$row) {
            throw new Exception('消息不存在 The message does not exist.');
        }
        
        // 只允许作者删除
        if (empty($row['col_author_id']) || (int)$row['col_author_id'] !== (int)$sessionUserId) {
            throw new Exception('没有权限删除该消息 No permission to delete this message');
        }
        
        $stmt = $this->pdo->prepare("DELETE FROM t_messages WHERE col_id = ?");
        $stmt->execute([$id]);
        
        if ($stmt->rowCount() === 0) {
            throw new Exception('消息不存在 The message does not exist.');
        }
        
        return ['code' => 200, 'message' => '删除成功 Deleted successfully'];
    }
}
