-- ---------------------------------------------------
-- Database: youtube_dashboard
-- ---------------------------------------------------
CREATE DATABASE IF NOT EXISTS youtube_dashboard;
USE youtube_dashboard;

-- ---------------------------------------------------
-- Table structure for `videos`
-- ---------------------------------------------------
CREATE TABLE IF NOT EXISTS youtube_videos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    video_id VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    views INT NOT NULL DEFAULT 0,
    likes INT NOT NULL DEFAULT 0,
    comments INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

