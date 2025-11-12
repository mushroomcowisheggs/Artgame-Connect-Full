<?php
// Simple wrapper so clients can POST to /backend/api/register.php
try {
    $_GET['action'] = 'register';
    include __DIR__ . '/api.php';
} catch (Exception $e) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['code' => 500, 'message' => $e->getMessage()]);
}
