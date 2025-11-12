<?php
/**
 * Authentication API
 * 用户认证相关 API 接口
 */

class AuthAPI {
    private $pdo;
    
    public function __construct($pdo) {
        $this->pdo = $pdo;
    }
    
    /**
     * 用户登录
     */
    public function login($data) {
        $email = trim($data['email'] ?? '');
        $password = trim($data['password'] ?? '');
        
        if (empty($email) || empty($password)) {
            throw new Exception('邮箱和密码不能为空 Email and password cannot be empty');
        }
        
        $stmt = $this->pdo->prepare("SELECT id, username, email, password, reputation_score, badges, user_role, skills FROM t_users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user || !password_verify($password, $user['password'])) {
            throw new Exception('邮箱或密码错误 Invalid email or password');
        }
        
        // 设置会话
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['user_role'] = $user['user_role'];
        
        unset($user['password']);
        return ['code' => 200, 'message' => '登录成功 Login successful', 'user' => $user];
    }
    
    /**
     * 用户注册
     */
    public function register($data) {
        $username = trim($data['username'] ?? '');
        $email = trim($data['email'] ?? '');
        $password = trim($data['password'] ?? '');
        
        if (empty($username) || empty($email) || empty($password)) {
            throw new Exception('所有字段都必须填写 All fields are required');
        }
        
        // 检查用户名是否已存在
        $stmt = $this->pdo->prepare("SELECT id FROM t_users WHERE username = ?");
        $stmt->execute([$username]);
        if ($stmt->fetch()) {
            throw new Exception('用户名已存在 Username already exists');
        }
        
        // 检查邮箱是否已存在
        $stmt = $this->pdo->prepare("SELECT id FROM t_users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            throw new Exception('邮箱已被使用 Email already in use');
        }
        
        // 创建用户
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $this->pdo->prepare("INSERT INTO t_users (username, email, password) VALUES (?, ?, ?)");
        $stmt->execute([$username, $email, $hashedPassword]);
        
        return ['code' => 200, 'message' => '注册成功 Registration successful'];
    }
    
    /**
     * 用户登出
     */
    public function logout() {
        session_unset();
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params['path'], $params['domain'],
                $params['secure'], $params['httponly']
            );
        }
        session_destroy();
        
        return ['code' => 200, 'message' => '已注销 Has been cancelled'];
    }
    
    /**
     * 获取当前用户信息
     */
    public function whoami() {
        $sessionUserId = $_SESSION['user_id'] ?? null;
        
        if (!$sessionUserId) {
            return ['code' => 401, 'message' => '未登录 Not logged in'];
        }
        
        $stmt = $this->pdo->prepare("SELECT id, username, email, reputation_score, badges, created_at FROM t_users WHERE id = ?");
        $stmt->execute([(int)$sessionUserId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            return ['code' => 401, 'message' => '会话用户不存在 The session user does not exist'];
        }
        
        return ['code' => 200, 'user' => $user];
    }
    
    /**
     * 切换用户角色
     */
    public function switchUserRole($data) {
        $newRole = trim($data['role'] ?? '');
        $userId = $_SESSION['user_id'] ?? null;
        
        if (!$userId) {
            throw new Exception('未登录 Not logged in');
        }
        
        if (!in_array($newRole, ['creator', 'requester'])) {
            throw new Exception('无效的角色 Invalid role');
        }
        
        $stmt = $this->pdo->prepare("UPDATE t_users SET user_role = ? WHERE id = ?");
        $stmt->execute([$newRole, $userId]);
        
        $_SESSION['user_role'] = $newRole;
        
        return ['code' => 200, 'message' => '角色切换成功 Role switched successfully', 'role' => $newRole];
    }
}
