<?php
// Simple wrapper so clients can POST to /backend/api/login.php
// It sets the action and includes the main api handler which will process the request.
try {
    // ensure action is set
    $_GET['action'] = 'login';
    include __DIR__ . '/api.php';
} catch (Exception $e) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['code' => 500, 'message' => $e->getMessage()]);
}
