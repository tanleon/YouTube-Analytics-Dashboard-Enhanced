<?php
// get_videos.php - FIXED VERSION
require_once "db.php";

// CORS headers
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

try {
    // Fetch videos
    $stmt = $pdo->query("
        SELECT video_id, title, views, likes, comments
        FROM youtube_videos
        ORDER BY created_at DESC
    ");

    $videos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Ensure we always return an array
    if (!$videos) {
        $videos = [];
    }
    
    // Send JSON response - JUST the array, no wrapper
    echo json_encode($videos);
    
} catch (PDOException $e) {
    error_log("Database error in get_videos.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
?>