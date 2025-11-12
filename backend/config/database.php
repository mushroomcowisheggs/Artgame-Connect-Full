<?php
/**
 * Database Configuration
 * 数据库配置文件
 */

// 数据库文件路径（相对于 backend 目录）
$dbFile = __DIR__ . '/../../database/helper.db';

// 确保数据库文件存在
if (!file_exists($dbFile)) {
    @touch($dbFile);
}

// 检查数据库目录是否可写
if (!is_writable(dirname($dbFile))) {
    http_response_code(500);
    echo json_encode(['code' => 500, 'message' => '数据库目录不可写 Database directory is not writable']);
    exit;
}

// 创建 PDO 连接
try {
    $pdo = new PDO('sqlite:' . $dbFile);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['code' => 500, 'message' => '数据库连接失败 Database connection failed: ' . $e->getMessage()]);
    exit;
}

return $pdo;
