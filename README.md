# YouTube Analytics Dashboard

A small full‑stack project that imports YouTube videos and shows basic analytics (title, views, likes, comments). Built as a learning project to explore modern frontend tooling (Next.js + TypeScript) while integrating AJAX (jQuery) and a PHP/MySQL backend.

---

## Why I built this
I used this project as a hands‑on sandbox to learn and practice:
- How modern React/Next.js applications can interoperate with legacy libraries (jQuery).
- Backend security basics (CSRF, sessions, safe DB access).
- Practical CSS patterns for responsive, accessible UIs.
- Debugging and integrating third‑party APIs (YouTube Data API v3).

---

## Tech stack
- Frontend: Next.js, React, TypeScript, jQuery (for delegated DOM/AJAX)
- Backend: PHP (procedural), MySQL (via PDO)
- Styling: CSS (vanilla; responsive layout + mobile breakpoints)
- APIs: YouTube Data API v3
- Dev tooling: Node.js, npm, XAMPP (Apache + MySQL)

---

## Features
- Import YouTube videos by ID (calls backend to fetch YouTube stats).
- List videos with title, views, likes, comments.
- Live updates on hover (delegated events refresh stats periodically).
- Delete videos (secure, CSRF‑protected).
- Nicely formatted numbers and responsive layout.

<img width="1919" height="860" alt="Screenshot_7" src="https://github.com/user-attachments/assets/a5c65837-e0f9-4a4c-ba67-4d58d597cb60" />

<img width="1919" height="899" alt="Screenshot_6" src="https://github.com/user-attachments/assets/a64f1bc8-e72f-4a7c-bb79-cb76b397c993" />

<img width="1919" height="909" alt="Screenshot_8" src="https://github.com/user-attachments/assets/9e0e8544-a19a-440c-8215-fb8a58735569" />

---

## How I used this project to learn (key concepts)

- CSS & Layout
  - Built a mobile‑friendly table and used container/padding/breakpoints to create a polished UI.
  - Practiced CSS-only modals, buttons, and accessible focus styles.
  - Learned to balance aesthetics and readability without a CSS framework.

- CSRF & Sessions
  - Implemented a minimal CSRF pattern: a backend endpoint that issues a session‑bound token (`csrf.php`) and server-side validation (`verify_csrf`).
  - Learned about same‑site cookies, credentials in fetch/jQuery (credentials: 'include' / xhrFields.withCredentials), and why you must send the token and the session cookie together.

- CORS and Credentials
  - Configured CORS headers on PHP endpoints to allow requests from the Next app (http://localhost:3000) while allowing credentials.
  - Learned how preflight requests (OPTIONS) behave and how to respond to them.

- XSS & Output Escaping
  - Practiced safe DOM updates: render text as text nodes (or escape before inserting) rather than injecting raw HTML.
  - On the backend, sanitize or ensure the frontend uses text nodes to avoid XSS.

- PHP & Database Security
  - Used PDO with prepared statements to avoid SQL injection.
  - Implemented basic error handling and logging for DB operations.

- Integrating Old + New (jQuery in React)
  - Learned trade-offs: delegated jQuery event handling works when you need quick DOM manipulations and legacy libraries, while React state keeps the application in sync.
  - Use a single source of truth: after mutating server state, re-fetch to avoid transient UI mismatch.

- Debugging and Instrumentation
  - Added helpful server-side error messages and debug fields during development (avoid showing debugging info in production).
  - Used browser DevTools (Network, Console) to verify cookies, request bodies, and server responses.

---

## Installation & quick start

1. Backend (XAMPP)
   - Copy the `backend/` folder into `C:\xampp\htdocs\backend`.
   - Start Apache and MySQL in XAMPP.
   - Import DB schema: `mysql -u root -p < backend/db.sql` (or use phpMyAdmin).
   - Add your YouTube API key to `backend/fetch_youtube.php`.
   - Visit http://localhost/backend/csrf.php — should return JSON with csrf_token and set a PHPSESSID cookie.

2. Frontend (Next.js)
   - cd frontend
   - npm install
   - npm run dev
   - Open http://localhost:3000

Notes:
- Ensure you fetch the CSRF token with credentials included (fetch(..., { credentials: 'include' })) so the session cookie is set.
- jQuery AJAX calls should be configured to send cookies (xhrFields: { withCredentials: true }).

---

## Project structure
```
youtube-dashboard/
├─ backend/
│  ├─ db.php             # PDO connection
│  ├─ csrf.php           # issues/validates CSRF tokens
│  ├─ fetch_youtube.php  # imports video stats from YouTube API
│  ├─ get_videos.php     # returns stored videos
│  ├─ delete_video.php   # deletes a video
│  └─ db.sql
├─ frontend/
│  ├─ app/
│  │  ├─ page.tsx        # main dashboard (React + jQuery)
│  │  └─ layout.tsx
│  ├─ types/
│  │  └─ video.ts
│  └─ globals.css
└─ README.md
```

---

## Development notes & future improvements
- Move API keys and environment flags to a .env file.
- Harden CSRF and CORS for production (HTTPS, secure cookies, stricter origins).
- Replace jQuery parts with pure React + fetch for a single consistent model.
- Add unit/integration tests for key server endpoints.
