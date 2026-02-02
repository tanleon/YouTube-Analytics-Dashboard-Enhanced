<?php
// fetch_youtube.php
session_start(); // Start session FIRST

require "db.php";

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

// ✅ Handle CORS preflight FIRST
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    exit;
}

// ✅ Manual FormData parsing for CSRF validation
$input = file_get_contents("php://input");
parse_str($input, $postData);

// Get data from both $_POST (regular) and parsed FormData
$receivedToken = $_POST['csrf_token'] ?? ($postData['csrf_token'] ?? '');
$videoId = $_POST['video_id'] ?? ($postData['video_id'] ?? '');
$videoId = trim($videoId);

// ✅ Debug logging (enable for troubleshooting)
error_log("=== FETCH_YOUTUBE DEBUG ===");
error_log("Session ID: " . session_id());
error_log("Received Token: " . $receivedToken);
error_log("Stored Token: " . ($_SESSION['csrf_token'] ?? 'NOT_SET'));
error_log("Video ID: " . $videoId);
error_log("Input raw: " . substr($input, 0, 200));

// ✅ CSRF validation
if (!isset($_SESSION['csrf_token'])) {
    // Generate if not exists (this shouldn't happen if csrf.php was called first)
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    error_log("Generated new CSRF token in fetch_youtube");
}

if (empty($receivedToken)) {
    http_response_code(403);
    echo json_encode([
        "error" => "Missing CSRF token",
        "debug" => [
            "input_length" => strlen($input),
            "parsed_data" => $postData,
            "session_id" => session_id()
        ]
    ]);
    exit;
}

if ($receivedToken !== $_SESSION['csrf_token']) {
    http_response_code(403);
    echo json_encode([
        "error" => "Invalid CSRF token",
        "debug" => [
            "received" => $receivedToken,
            "stored" => $_SESSION['csrf_token'],
            "match" => $receivedToken === $_SESSION['csrf_token'] ? 'true' : 'false',
            "session_id" => session_id()
        ]
    ]);
    exit;
}

// ✅ Validate input
if (!$videoId || !preg_match("/^[a-zA-Z0-9_-]{11}$/", $videoId)) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid video ID: must be 11 characters"]);
    exit;
}

// ⚠️ Move this to env file in real apps
$API_KEY = "";

// Fetch from YouTube API
$url = "https://www.googleapis.com/youtube/v3/videos"
     . "?part=snippet,statistics"
     . "&id=$videoId"
     . "&key=$API_KEY";

$context = stream_context_create([
    'http' => [
        'ignore_errors' => true,
        'timeout' => 10
    ]
]);

$response = @file_get_contents($url, false, $context);

if ($response === false) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to contact YouTube API"]);
    exit;
}

$data = json_decode($response, true);

if (empty($data["items"])) {
    http_response_code(404);
    echo json_encode(["error" => "Video not found or private"]);
    exit;
}

$item = $data["items"][0];

// Extract fields
$title = $item["snippet"]["title"];
$views = (int)($item["statistics"]["viewCount"] ?? 0);
$likes = (int)($item["statistics"]["likeCount"] ?? 0);
$comments = (int)($item["statistics"]["commentCount"] ?? 0);

// Insert or update (idempotent) - FIXED: removed updated_at column
try {
    $stmt = $pdo->prepare("
        INSERT INTO youtube_videos (video_id, title, views, likes, comments)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            title = VALUES(title),
            views = VALUES(views),
            likes = VALUES(likes),
            comments = VALUES(comments)
    ");

    $stmt->execute([
        $videoId,
        $title,
        $views,
        $likes,
        $comments
    ]);
    
    error_log("Successfully saved video: $videoId");
    
} catch (Exception $e) {
    error_log("Database error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
    exit;
}

// Return live stats for frontend hover updates
echo json_encode([
    "success" => true,
    "video_id" => $videoId,
    "title" => $title,
    "views" => $views,
    "likes" => $likes,
    "comments" => $comments
]);
?>