"use client";

import { useEffect, useState, useRef } from "react";
import Script from "next/script";
import "./globals.css";

// Declare jQuery on window for TypeScript
declare global {
  interface Window {
    jQuery: any;
    $: any;
  }
}

/**
 * YouTube Analytics Dashboard
 * Frontend: Next.js + jQuery + AJAX
 * Security: CSRF token + XSS-safe DOM updates
 */
export default function Home() {
  // Store CSRF token in state after fetching
  const [csrfToken, setCsrfToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [videos, setVideos] = useState<any[]>([]);
  const [jQueryLoaded, setJQueryLoaded] = useState(false);
  
  // Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<{id: string; title: string} | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Refs to track intervals and prevent duplicate event listeners
  const intervalsRef = useRef<{[key: string]: number}>({});
  const eventListenersAttachedRef = useRef(false);

  // Fetch CSRF token once on mount
  useEffect(() => {
    fetch("http://localhost/backend/csrf.php", { 
      credentials: "include",
      method: "GET"
    })
      .then(res => {
        console.log("CSRF fetch status:", res.status);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log("CSRF token received:", data);
        setCsrfToken(data.csrf_token);
        setError("");
      })
      .catch((err) => {
        console.error("Failed to fetch CSRF token:", err);
        setError("Failed to connect to backend. Make sure XAMPP is running.");
      });
  }, []);

  // Initialize jQuery when loaded
  useEffect(() => {
    const checkJQuery = () => {
      if (typeof window !== 'undefined' && window.jQuery) {
        console.log("jQuery is loaded, setting up AJAX defaults");
        
        window.$.ajaxSetup({
          xhrFields: { withCredentials: true },
          crossDomain: true,
        });
        
        setJQueryLoaded(true);
        fetchVideos();
      } else {
        setTimeout(checkJQuery, 100);
      }
    };

    checkJQuery();
  }, []);

  // Fetch videos when jQuery is loaded or csrfToken changes
  useEffect(() => {
    if (jQueryLoaded && csrfToken) {
      fetchVideos();
    }
  }, [jQueryLoaded, csrfToken]);

  // Test session function
  const testSession = () => {
    console.log("Testing session...");
    setLoading(true);
    
    fetch("http://localhost/backend/csrf.php", { 
      credentials: 'include',
      method: "GET"
    })
      .then(res => {
        console.log("CSRF Response status:", res.status);
        return res.json();
      })
      .then(data => {
        console.log("CSRF data:", data);
        setCsrfToken(data.csrf_token);
        
        const fd = new FormData();
        fd.append("video_id", "dQw4w9WgXcQ");
        fd.append("csrf_token", data.csrf_token);
        
        return fetch("http://localhost/backend/fetch_youtube.php", {
          method: "POST",
          body: fd,
          credentials: 'include'
        });
      })
      .then(res => {
        console.log("Fetch YouTube status:", res.status);
        return res.json();
      })
      .then(data => {
        console.log("Fetch YouTube result:", data);
        if (data.success) {
          alert("Test successful! Video imported.");
          fetchVideos();
        } else {
          alert("Test failed: " + (data.error || "Unknown error"));
        }
      })
      .catch(err => {
        console.error("Test failed:", err);
        alert("Test failed. Check console for details.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Fetch all stored videos
  const fetchVideos = () => {
    console.log("Fetching videos from backend...");
    
    fetch("http://localhost/backend/get_videos.php", {
      method: "GET",
      credentials: "include",
      headers: {
        "Accept": "application/json"
      }
    })
      .then(res => {
        console.log("Get videos response status:", res.status);
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        return res.json();
      })
      .then(data => {
        console.log("Videos data received:", data);
        
        const videoArray = Array.isArray(data) ? data : [];
        console.log("Processed video array:", videoArray);
        setVideos(videoArray);
        
        if (jQueryLoaded && window.$) {
          renderVideos(videoArray);
          attachEventListeners();
        }
      })
      .catch(err => {
        console.error("Failed to fetch videos:", err);
        setError(`Failed to load videos: ${err.message}`);
        setVideos([]);
        
        if (jQueryLoaded && window.$) {
          renderVideos([]);
        }
      });
  };

  // Render videos to table using jQuery
  const renderVideos = (videoList: any) => {
    console.log("Rendering videos:", videoList);
    
    const tbody = window.$("tbody");
    tbody.empty();

    if (!Array.isArray(videoList)) {
      console.error("videoList is not an array:", videoList);
      tbody.append(`
        <tr>
          <td colspan="5" style="text-align: center; padding: 2rem; color: #c62828;">
            ❌ Error: Invalid data format received from server
          </td>
        </tr>
      `);
      return;
    }

    if (videoList.length === 0) {
      tbody.append(`
        <tr>
          <td colspan="5" style="text-align: center; padding: 2rem; color: #666;">
            No videos imported yet. Add a YouTube video ID above.
          </td>
        </tr>
      `);
      return;
    }

    videoList.forEach((v: any) => {
      if (!v || typeof v !== 'object') {
        console.warn("Invalid video item:", v);
        return;
      }
      
      const videoId = v.video_id || v.id || '';
      const title = v.title || 'Untitled';
      const views = Number(v.views) || 0;
      const likes = Number(v.likes) || 0;
      const comments = Number(v.comments) || 0;

      const row = window.$(`
        <tr data-video-id="${videoId}" data-video-title="${title.replace(/"/g, '&quot;')}">
          <td class="title">${title}</td>
          <td class="views">${views.toLocaleString()}</td>
          <td class="likes">${likes.toLocaleString()}</td>
          <td class="comments">${comments.toLocaleString()}</td>
          <td>
            <button class="delete-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Delete
            </button>
          </td>
        </tr>
      `);

      tbody.append(row);
    });
  };

  // Show delete confirmation modal
  const showDeleteConfirmation = (videoId: string, videoTitle: string) => {
    setVideoToDelete({ id: videoId, title: videoTitle });
    setShowDeleteModal(true);
  };

  // Close delete modal
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setVideoToDelete(null);
    setDeleteLoading(false);
  };

  // Handle delete confirmation
  const handleDelete = () => {
    if (!videoToDelete || !csrfToken) {
      console.error("Missing video ID or CSRF token");
      closeDeleteModal();
      return;
    }

    setDeleteLoading(true);

    const fd = new FormData();
    fd.append("video_id", videoToDelete.id);
    fd.append("csrf_token", csrfToken);

    console.log("Deleting video:", videoToDelete.id);

    window.$.ajax({
      url: "http://localhost/backend/delete_video.php",
      method: "POST",
      data: fd,
      processData: false,
      contentType: false,
      xhrFields: {
        withCredentials: true
      },
      success: (response: any) => {
        console.log("Delete successful:", response);
        
        // Clear any active polling interval for this video
        if (intervalsRef.current[videoToDelete.id]) {
          clearInterval(intervalsRef.current[videoToDelete.id]);
          delete intervalsRef.current[videoToDelete.id];
        }
        
        // Remove row with animation
        const row = window.$(`tr[data-video-id="${videoToDelete.id}"]`);
        row.fadeOut(300, () => row.remove());
        
        // Update videos state
        setVideos(prev => prev.filter(v => v.video_id !== videoToDelete.id));
        
        closeDeleteModal();
        
        // Refresh from server if table is now empty
        if (videos.length <= 1) {
          setTimeout(() => fetchVideos(), 300);
        }
      },
      error: (jqXHR: any, textStatus: string, errorThrown: string) => {
        console.error("Delete failed:", textStatus, errorThrown);
        console.error("Response:", jqXHR.responseText);
        setError("Failed to delete video. Please try again.");
        closeDeleteModal();
      },
    });
  };

  // Attach event listeners (hover and delete)
  const attachEventListeners = () => {
    if (eventListenersAttachedRef.current) {
      console.log("Event listeners already attached, skipping...");
      return;
    }
    
    console.log("Attaching event listeners...");
    
    // Clear any existing intervals
    Object.values(intervalsRef.current).forEach(clearInterval);
    intervalsRef.current = {};

    // Delegated hover events for live updates
    window.$("tbody").off("mouseenter", "tr").on("mouseenter", "tr", function (this: HTMLElement) {
      const row = window.$(this);
      const videoId = row.data("video-id") as string;
      
      console.log("Hover start on video:", videoId);

      updateRow(row, videoId);
      intervalsRef.current[videoId] = window.setInterval(() => updateRow(row, videoId), 5000);
    });

    window.$("tbody").off("mouseleave", "tr").on("mouseleave", "tr", function (this: HTMLElement) {
      const videoId = window.$(this).data("video-id") as string;
      
      console.log("Hover end on video:", videoId);
      
      if (intervalsRef.current[videoId]) {
        clearInterval(intervalsRef.current[videoId]);
        delete intervalsRef.current[videoId];
      }
    });

    // Delegated delete button - show modal instead of immediate delete
    window.$("tbody").off("click", ".delete-btn").on("click", ".delete-btn", function (this: HTMLElement, e: Event) {
      e.preventDefault();
      e.stopPropagation();
      
      const row = window.$(this).closest("tr");
      const videoId = row.data("video-id") as string;
      const videoTitle = row.data("video-title") as string;

      showDeleteConfirmation(videoId, videoTitle);
    });

    eventListenersAttachedRef.current = true;
    console.log("Event listeners attached successfully");
  };

  // Clean up intervals on unmount
  useEffect(() => {
    return () => {
      Object.values(intervalsRef.current).forEach(clearInterval);
    };
  }, []);

  // Update stats for a single video
  const updateRow = (row: any, videoId: string) => {
    if (!csrfToken) {
      console.warn("No CSRF token available for update");
      return;
    }

    const fd = new FormData();
    fd.append("video_id", videoId);
    fd.append("csrf_token", csrfToken);

    console.log("Updating video stats for:", videoId);

    window.$.ajax({
      url: "http://localhost/backend/fetch_youtube.php",
      method: "POST",
      data: fd,
      processData: false,
      contentType: false,
      xhrFields: {
        withCredentials: true
      },
      success: function (res: any) {
        console.log("Update success for", videoId, ":", res);
        
        if (res.views !== undefined) {
          row.find(".views").text(Number(res.views).toLocaleString());
        }
        if (res.likes !== undefined) {
          row.find(".likes").text(Number(res.likes).toLocaleString());
        }
        if (res.comments !== undefined) {
          row.find(".comments").text(Number(res.comments).toLocaleString());
        }
        
        setVideos(prevVideos => 
          prevVideos.map(v => 
            v.video_id === videoId 
              ? { ...v, 
                  views: res.views || v.views, 
                  likes: res.likes || v.likes, 
                  comments: res.comments || v.comments 
                }
              : v
          )
        );
      },
      error: (jqXHR: any, textStatus: string, errorThrown: string) => {
        console.warn("Failed to update video:", videoId, textStatus, errorThrown);
      },
    });
  };

  // Add new video
  const addVideo = () => {
    const videoId = (window.$("#video-id-input").val() as string) || "";
    if (!videoId) {
      alert("Please enter a YouTube video ID");
      return;
    }

    if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      alert("Invalid YouTube video ID. Must be 11 characters (letters, numbers, -, _)");
      return;
    }

    if (!csrfToken) {
      alert("CSRF token not loaded yet. Please wait or refresh the page.");
      return;
    }

    if (!jQueryLoaded) {
      alert("jQuery not loaded yet. Please wait or refresh the page.");
      return;
    }

    setLoading(true);
    const fd = new FormData();
    fd.append("video_id", videoId);
    fd.append("csrf_token", csrfToken);

    console.log("Sending request with CSRF:", csrfToken);
    console.log("Video ID:", videoId);

    window.$.ajax({
      url: "http://localhost/backend/fetch_youtube.php",
      method: "POST",
      data: fd,
      processData: false,
      contentType: false,
      xhrFields: {
        withCredentials: true
      },
      success: (response: any) => {
        console.log("Success:", response);
        window.$("#video-id-input").val("");
        setError("");
        fetchVideos();
      },
      error: (jqXHR: any, textStatus: string, errorThrown: string) => {
        console.error("AJAX Error:", textStatus, errorThrown);
        
        let errorMsg = "Failed to import video";
        try {
          const err = JSON.parse(jqXHR.responseText);
          if (err.error) errorMsg = err.error;
        } catch (e) {
          setError("Server error. Check if backend is running.");
        }
        
        alert(errorMsg);
      },
      complete: () => {
        setLoading(false);
      }
    });
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addVideo();
    }
  };

  return (
    <main>
      <Script
        src="https://code.jquery.com/jquery-3.7.0.min.js"
        strategy="beforeInteractive"
        onLoad={() => {
          console.log("jQuery loaded successfully");
          setJQueryLoaded(true);
        }}
        onError={() => {
          console.error("Failed to load jQuery");
          setError("Failed to load jQuery. Please refresh the page.");
        }}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={closeDeleteModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 9V11M12 15H12.01M5 7H19L18 19H6L5 7Z" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            
            <h2 className="modal-title">Delete Video</h2>
            
            <p className="modal-message">
              Are you sure you want to delete <strong>"{videoToDelete?.title}"</strong>?
              This action cannot be undone.
            </p>
            
            <div className="modal-actions">
              <button 
                className="modal-cancel-btn"
                onClick={closeDeleteModal}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button 
                className="modal-delete-btn"
                onClick={handleDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <>
                    <svg className="spinner" width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="15.7 15.7">
                        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
                      </circle>
                    </svg>
                    Deleting...
                  </>
                ) : "Delete Video"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container">
        <h1>YouTube Analytics Dashboard</h1>
        
        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        <div className="input-group">
          <input
            type="text"
            id="video-id-input"
            placeholder="Enter YouTube Video ID (e.g., dQw4w9WgXcQ)"
            onKeyPress={handleKeyPress}
            style={{ flex: 1 }}
          />
          <button 
            onClick={addVideo} 
            disabled={loading || !csrfToken || !jQueryLoaded}
            className="import-btn"
          >
            {loading ? "Importing..." : "Import Video"}
          </button>
          <button 
            onClick={testSession} 
            className="test-btn"
            title="Test backend connection"
          >
            Test Connection
          </button>
          <button 
            onClick={fetchVideos} 
            className="refresh-btn"
            title="Refresh videos list"
          >
            Refresh
          </button>
        </div>

        <div className="status-info">
          <div>
            <strong>Status:</strong> 
            {csrfToken ? " ✓ CSRF Token loaded" : " ✗ No token"}
            {jQueryLoaded ? " ✓ jQuery loaded" : " ✗ jQuery loading..."}
          </div>
          <div className="video-count">
            <strong>Videos:</strong> {Array.isArray(videos) ? videos.length : 'error'} loaded
          </div>
          {csrfToken && (
            <div className="token-info">
              Token: {csrfToken.substring(0, 8)}...
            </div>
          )}
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Views</th>
                <th>Likes</th>
                <th>Comments</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {/* Rows will be inserted here by jQuery */}
            </tbody>
          </table>
        </div>

        <section className="instructions">
          <h2>How to Use This Dashboard</h2>
          <ol>
            <li>
              <strong>Import a Video:</strong> Enter the YouTube video ID and click
              <em> Import Video</em>.
            </li>
            <li>
              <strong>View Video Stats:</strong> Displays title, views, likes,
              comments.
            </li>
            <li>
              <strong>Live Updates:</strong> Hover a row to refresh stats every
              5 seconds.
            </li>
            <li>
              <strong>Delete Video:</strong> Click delete button to remove video
              securely.
            </li>
            <li>
              <strong>XSS Safe:</strong> All data rendered using text nodes.
            </li>
          </ol>
        </section>

        <div className="debug-section">
          <h3>Debug & Troubleshooting</h3>
          <ul>
            <li><strong>Check Backend:</strong> <a href="http://localhost/backend/get_videos.php" target="_blank" rel="noopener noreferrer">Test get_videos.php</a></li>
            <li><strong>Check Database:</strong> Run <code>SELECT * FROM youtube_videos;</code> in phpMyAdmin</li>
            <li><strong>Open Console:</strong> Press F12 → Console tab for errors</li>
            <li><strong>Network Tab:</strong> Check request/response in Network tab</li>
            <li><strong>CSRF Token:</strong> Visit <a href="http://localhost/backend/csrf.php" target="_blank" rel="noopener noreferrer">Test csrf.php</a></li>
          </ul>
        </div>
      </div>

      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .error-message {
          padding: 1rem;
          background-color: #ffebee;
          color: #c62828;
          border-radius: 4px;
          margin-bottom: 1rem;
          border-left: 4px solid #c62828;
        }

        .input-group {
          display: flex;
          gap: 8px;
          margin-bottom: 1rem;
        }

        .input-group input {
          padding: 10px 14px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.3s;
        }

        .input-group input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }

        .input-group button {
          padding: 10px 16px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .input-group button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .import-btn {
          background-color: #3b82f6;
          color: white;
        }

        .import-btn:hover:not(:disabled) {
          background-color: #2563eb;
          transform: translateY(-1px);
        }

        .test-btn {
          background-color: #ef4444;
          color: white;
        }

        .test-btn:hover:not(:disabled) {
          background-color: #dc2626;
          transform: translateY(-1px);
        }

        .refresh-btn {
          background-color: #10b981;
          color: white;
        }

        .refresh-btn:hover:not(:disabled) {
          background-color: #059669;
          transform: translateY(-1px);
        }

        .status-info {
          margin-top: 1rem;
          padding: 1rem;
          background-color: #f8fafc;
          border-radius: 8px;
          font-size: 0.9rem;
          color: #64748b;
          border: 1px solid #e2e8f0;
        }

        .video-count {
          margin-top: 0.5rem;
        }

        .token-info {
          margin-top: 0.5rem;
          font-family: 'SF Mono', Monaco, 'Courier New', monospace;
          font-size: 0.8rem;
          background-color: #f1f5f9;
          padding: 4px 8px;
          border-radius: 4px;
          display: inline-block;
          color: #475569;
        }

        .table-container {
          margin-top: 2rem;
          overflow-x: auto;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          min-width: 600px;
        }

        th {
          padding: 16px;
          text-align: left;
          background-color: #f8fafc;
          font-weight: 600;
          color: #475569;
          border-bottom: 1px solid #e2e8f0;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        td {
          padding: 16px;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: middle;
          font-size: 0.95rem;
          color: #334155;
        }

        tr:last-child td {
          border-bottom: none;
        }

        tr:hover {
          background-color: #f8fafc;
        }

        .delete-btn {
          padding: 8px 16px;
          background-color: #fee2e2;
          color: #dc2626;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        }

        .delete-btn:hover {
          background-color: #fecaca;
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .instructions {
          margin-top: 2rem;
          padding: 1.5rem;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }

        .instructions h2 {
          margin-top: 0;
          color: #1e293b;
          font-size: 1.5rem;
          margin-bottom: 1rem;
        }

        .instructions ol {
          padding-left: 1.5rem;
          line-height: 1.8;
          color: #475569;
        }

        .instructions li {
          margin-bottom: 0.75rem;
        }

        .debug-section {
          margin-top: 2rem;
          padding: 1.5rem;
          background-color: #eff6ff;
          border-radius: 12px;
          border: 1px solid #dbeafe;
          font-size: 0.9rem;
        }

        .debug-section h3 {
          margin-top: 0;
          color: #1d4ed8;
          font-size: 1.25rem;
          margin-bottom: 1rem;
        }

        .debug-section ul {
          padding-left: 1.5rem;
          margin-bottom: 0;
          color: #374151;
        }

        .debug-section li {
          margin-bottom: 0.75rem;
          line-height: 1.6;
        }

        .debug-section a {
          color: #2563eb;
          text-decoration: none;
          font-weight: 500;
        }

        .debug-section a:hover {
          text-decoration: underline;
        }

        code {
          background-color: #f1f5f9;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'SF Mono', Monaco, 'Courier New', monospace;
          font-size: 0.85em;
          color: #334155;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease-out;
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          padding: 32px;
          max-width: 400px;
          width: 90%;
          text-align: center;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          animation: slideUp 0.3s ease-out;
        }

        .modal-icon {
          margin-bottom: 20px;
        }

        .modal-title {
          margin: 0 0 12px 0;
          font-size: 1.5rem;
          font-weight: 600;
          color: #1f2937;
        }

        .modal-message {
          margin: 0 0 24px 0;
          color: #6b7280;
          line-height: 1.6;
          font-size: 0.95rem;
        }

        .modal-message strong {
          color: #1f2937;
          font-weight: 600;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
        }

        .modal-cancel-btn,
        .modal-delete-btn {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 120px;
        }

        .modal-cancel-btn {
          background-color: #f3f4f6;
          color: #374151;
        }

        .modal-cancel-btn:hover:not(:disabled) {
          background-color: #e5e7eb;
        }

        .modal-delete-btn {
          background-color: #ef4444;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .modal-delete-btn:hover:not(:disabled) {
          background-color: #dc2626;
          transform: translateY(-1px);
        }

        .modal-delete-btn:disabled,
        .modal-cancel-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .input-group {
            flex-direction: column;
          }
          
          .input-group input {
            width: 100%;
          }
          
          .modal-content {
            padding: 24px;
            width: 95%;
          }
          
          .modal-actions {
            flex-direction: column;
          }
          
          .modal-cancel-btn,
          .modal-delete-btn {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}