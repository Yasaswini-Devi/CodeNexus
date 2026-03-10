# CodeNexus - Recent Feature Updates

This document outlines the recent features added to CodeNexus, specifically focusing on User Authentication, Cloud Project Saving, and the Dashboard structure, along with the technical implementations that power them.

## 1. User Authentication System

**What was added:**
A complete, secure authentication system where users can create accounts, log in, and manage their own isolated projects.

**How it was made:**
- **Backend Auth Routes (`server/routes/auth.js`)**: Created POST endpoints for `/register` and `/login`. 
- **Security (`bcryptjs` & `jsonwebtoken`)**: 
  - User passwords are securely hashed using `bcryptjs` before being saved to the database.
  - Upon successful login/registration, a JSON Web Token (JWT) is generated with a 7-day expiration. 
- **Database (`server/models/User.js`)**: Built a Mongoose schema for the `User` containing `username`, `email` (unique index), and `passwordHash`.
- **Frontend State (`client/src/context/AuthContext.jsx`)**: Implemented React Context to inject the `user` and `token` state globally across the application. The token is held in-memory (it clears on refresh to ensure zero stale-session bugs).
- **Route Protection (`ProtectedRoute` inside `App.jsx`)**: Wrapped all editor and dashboard routes in a component that intercepts unauthenticated users and cleanly redirects them to the `/login` page.

## 2. Cloud Project Saving

**What was added:**
Users can now save the code they write in the JavaScript, Python, or HTML/CSS editors directly to their cloud account.

**How it was made:**
- **Database (`server/models/Project.js`)**: Created a Mongoose schema for `Project` with fields for `title`, `language`, `code`, and a strict reference `owner` tied to the User's `ObjectId`.
- **Backend API (`server/routes/projects.js`)**: Implemented full CRUD operations:
  - `POST /` to create a new project.
  - `GET /` to list all projects belonging *only* to the logged-in user.
  - `GET /:id` to fetch the specific code for a project.
  - `PUT /:id` and `DELETE /:id` to update and remove projects.
- **Save Hook (`client/src/hooks/useSaveProject.js`)**: Built a custom React Hook that abstracts the save logic. It auto-generates a timestamped title completely bypassing blocked browser `window.prompt` dialogs, executes the POST/PUT request with the `Authorization: Bearer <token>` header, and manages loading state.
- **Editor Integration**: Added an explicit "💾 Save Project" button to the UI of every editor, mapped directly to the `useSaveProject` hook.

## 3. Project Dashboard

**What was added:**
A visual grid ("My Projects") where users can view, open, and delete their saved code snippets.

**How it was made:**
- **Dashboard Component (`client/src/components/Dashboard.jsx`)**: 
  - Calls the `GET /api/projects` endpoint on mount to fetch the list of projects.
  - Displays empty states ("No projects yet") with quick-start buttons, or renders a CSS grid of project cards with custom language icons and timestamps.
- **Cache Busting**: Resolved a major browser bug where Chrome would aggressively cache an empty project list. Fixed by forcing `Cache-Control: no-store` on the Express backend and appending `?t=timestamp` to the frontend fetch.
- **React Portals (`client/src/components/AppLayout.jsx`)**: The dropdown menu to access the dashboard is mounted using `ReactDOM.createPortal` directly to `document.body`. This solved a severe CSS clipping issue where the dropdown was previously hidden behind the blurred navigation bar.

## 4. Python Execution Engine Overhaul

**What was fixed:**
The Python runner backend was executing code but failing to find the generated `.py` file, causing it to crash on Windows systems.

**How it was made:**
- **Path Resolution**: Refactored `server/utils/pythonCompiler.js` to correctly use `path.join(__dirname)` to construct absolute paths for the `temp_codes/` directory, making it OS-agnostic.
- **Garbage Collection**: Implemented `fs.unlink` to auto-delete the temporary `.py` file immediately after the Node `child_process.exec` finishes running. This prevents the server hard drive from filling up with thousands of temporary code files.
