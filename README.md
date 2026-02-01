
# YouTube Analytics Dashboard

A **full-stack YouTube Analytics Dashboard** built with **Next.js, TypeScript, PHP, MySQL, jQuery, AJAX, and YouTube Data API v3**.
This dashboard allows users to import YouTube videos, view live statistics, and continuously update metrics on hover — showcasing both **modern React frontend** and **classic jQuery skills**.


---

## Features

* Import YouTube videos by ID
* Display video title, views, likes, and comments
* Live update of metrics when hovering over a video row
* Delete videos from dashboard
* Numbers are consistently formatted with commas
* Fully responsive layout with clean UI
* Dashboard instructions included for easy use
* Demonstrates **jQuery + AJAX integration** in a modern React app

---

## Tech Stack

* **Frontend:** Next.js, TypeScript, React, jQuery, AJAX
* **Backend:** PHP, MySQL
* **Styling:** CSS 
* **APIs:** YouTube Data API v3
* **Database:** MySQL
* **Development Tools:** Node.js, npm, XAMPP

---

## Screenshots
<img style="max-width: 100%; height: auto;" alt="Screenshot_3" src="https://github.com/user-attachments/assets/f8f08a9b-ef53-4722-8200-eeab02625576" />
<img style="max-width: 100%; height: auto;" alt="Screenshot_4" src="https://github.com/user-attachments/assets/c864cfa2-62cd-48c9-bc3d-46eea2d78a9e" />

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/youtube-dashboard.git
cd youtube-dashboard
```

### 2. Setup Backend

* Ensure **XAMPP** (or another PHP + MySQL environment) is installed.
* Copy the `backend` folder to your XAMPP `htdocs` folder:

```
C:\xampp\htdocs\backend
```

* Import the database:

```bash
# Using phpMyAdmin or MySQL CLI
mysql -u root -p < backend/db.sql
```

* Add your **YouTube API key** in `fetch_youtube.php`:

```php
$apiKey = "YOUR_YOUTUBE_API_KEY";
```

* Start Apache and MySQL in XAMPP.

---

### 3. Setup Frontend

* Navigate to the frontend folder:

```bash
cd frontend
```

* Install dependencies:

```bash
npm install
npm install jquery @types/jquery --save-dev
```

* Start the Next.js development server:

```bash
npm run dev
```

* Open your browser at [http://localhost:3000](http://localhost:3000)

---

## Usage

1. Enter a **YouTube video ID** in the input box and click **Import Video**.
2. Hover over any row in the table to **update views, likes, and comments live** every 10 seconds.
3. Click **Delete** to remove a video from the dashboard.
4. Numbers are always **formatted with commas** for readability.
5. Refresh the page to reload all videos from the backend.

---

## Project Structure

```
youtube-dashboard/
├─ backend/              # PHP backend scripts
│  ├─ db.php             # Database connection
│  ├─ fetch_youtube.php  # Add video via YouTube API
│  ├─ get_videos.php     # Fetch all videos
│  ├─ delete_video.php   # Delete a video
│  └─ db.sql         # Database setup
├─ frontend/             # Next.js frontend
│  ├─ app/
│  │  ├─ page.tsx        # Main dashboard page
│  │  └─ layout.tsx      # Layout for header/footer
│  ├─ types/
│  │  └─ video.ts        # Video type definition
│  ├─ globals.css        # Global styling
│  └─ package.json
├─ README.md
