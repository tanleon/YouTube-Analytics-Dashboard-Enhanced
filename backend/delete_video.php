<?php
// delete_video.php
// Deletes a video from database

require "db.php";
require "csrf.php";

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

// ✅ Handle preflight request FIRST
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    exit;
}

// Ensure session is available (csrf.php usually handles this, but make sure)
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Fallback: parse raw input when $_POST may be empty (multipart/form-data edge cases)
$raw = file_get_contents('php://input') ?? '';
$parsed = [];
if ($raw && empty($_POST)) {
    // Try urlencoded
    parse_str($raw, $parsed);
    if (empty($parsed)) {
        // Try JSON
        $json = json_decode($raw, true);
        if (is_array($json)) {
            $parsed = $json;
        }
    }
    if (!empty($parsed)) {
        $_POST = array_merge($_POST, $parsed);
    }
}

// Manual CSRF check with helpful debug info on failure
$receivedToken = $_POST['csrf_token'] ?? '';
if (!isset($_SESSION['csrf_token'])) {
    // Not expected, but generate for consistency and log
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    error_log("delete_video.php: generated missing session csrf token");
}

if (empty($receivedToken) || $receivedToken !== $_SESSION['csrf_token']) {
    error_log("delete_video.php: CSRF validation failed. received=" . substr($receivedToken,0,8) . " stored=" . substr($_SESSION['csrf_token'],0,8) . " session_id=" . session_id());
    http_response_code(403);
    echo json_encode([
        "error" => "Invalid or missing CSRF token",
        "debug" => [
            "received" => $receivedToken ? substr($receivedToken,0,16) . "..." : "",
            "stored" => isset($_SESSION['csrf_token']) ? substr($_SESSION['csrf_token'],0,16) . "..." : "NOT_SET",
            "raw_input_sample" => substr($raw,0,200),
            "session_id" => session_id()
        ]
    ]);
    exit;
}

// Now proceed normally
$videoId = $_POST["video_id"] ?? "";

if (!$videoId) {
    http_response_code(400);
    echo json_encode(["error" => "Missing video ID"]);
    exit;
}

try {
    $stmt = $pdo->prepare("DELETE FROM youtube_videos WHERE video_id = ?");
    $stmt->execute([$videoId]);

    echo json_encode(["success" => true]);
} catch (Exception $e) {
    error_log("delete_video.php: DB error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["error" => "Database error", "debug" => $e->getMessage()]);
}
