<?php
// csrf.php - CSRF protection middleware

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, X-CSRF-Token");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

// Set cookie settings FIRST
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'secure' => false,
    'httponly' => true,
    'samesite' => 'Lax'
]);

session_start();

// Create token if not exists
if (!isset($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

// Helper function
function csrf_token() {
    return $_SESSION['csrf_token'];
}

// Send token only on GET
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode([
        'csrf_token' => csrf_token()
    ]);
    exit;
}
?>
