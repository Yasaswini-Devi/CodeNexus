## CodeNexus

CodeNexus is a lightweight, browser-based coding playground with multiple “editors”:

- **JavaScript**: write JS in the browser and run it (output is captured from `console.log`). Powered by Monaco editor with syntax highlighting.
- **HTML/CSS/JS**: a mini web editor that live-previews HTML/CSS in an iframe and runs JS on demand. Uses Monaco for each language.
- **Python**: sends your code to a small Node/Express backend that writes a temporary `.py` file and executes it locally, returning stdout as "Output".
- **AI Assistant**: Interactive AI powered by local LLMs (Ollama) with curated prompt templates (Explain, Fix bugs, Write tests, Optimize).
- **Theme Switcher**: Toggle between light and dark themes with persistent localStorage.

## Tech stack

- **Client**: React + Vite + React Router + Monaco Editor (`client/`)
- **Server**: Node.js + Express + CORS + Mongoose (`server/`)
- **Database**: MongoDB (stores Users and Projects)
- **Authentication**: JWT & bcryptjs
- **Python execution**: server-side `python3` process (writes files to `server/temp_codes/` and executes)
- **AI Assistant**: LLM proxy (supports Ollama and other HTTP-based model APIs)

## Project structure

- **`client/`**: UI (React/Vite)
  - **`src/components/CodeEditor.jsx`**: Monaco editor wrapper for syntax highlighting
  - **`src/components/AIAssistant.jsx`**: AI assistant modal with curated prompts
  - **`src/components/AIAssistant.css`**: AI assistant specific styles
  - **`src/components/AppLayout.jsx`**: Main app layout with theme toggle
  - **`src/components/LandingPage.jsx`**: Welcome page and feature overview
  - **`src/components/LangList.jsx`**: Component displaying available language editors
  - **`src/components/Python.jsx`**, **`Javascript.jsx`**, **`Html.jsx`**: Editor playgrounds
  - **`src/App.jsx`**, **`index.css`**, **`App.css`**: App routing and styles
  
- **`server/`**: API backend
  - **`server.js`**: Express app entry point
  - **`models/`**: MongoDB schemas (`User.js`, `Project.js`)
  - **`middleware/`**: JWT `auth.js` middleware
  - **`.env`**: Environment variables (MongoDB URI, JWT Secret, model configuration)
  - **`routes/`**:
    - **`auth.js`**: Registration, Login, and User Identity
    - **`projects.js`**: CRUD operations for user's saved code projects
    - **`pythonRoutes.js`**: `POST /runpy` — Execute Python code
    - **`aiRoutes.js`**: `POST /ai` — Proxy AI requests
  - **`utils/`**:
    - **`pythonCompiler.js`**: Creates temp `.py` files, executes them, and cleans up
    - **`aiClient.js`**: Proxies prompts to external model API
  - **`temp_codes/`**: Auto-created folder holding transient generated `.py` files

## Requirements

- **Node.js**: recommended **18+**
- **Python**: **3.x**
  - The backend currently calls `python3` (see Troubleshooting for Windows notes).

## Run locally

### 1) Start the server (Python runner)

From `CodeNexus-main/server/`:

```bash
npm install
node server.js
```

The server listens on **port 5001** and exposes:

- **`POST http://localhost:5001/runpy`** with JSON body `{ "code": "print('hi')" }`
<<<<<<< HEAD
=======
- **`POST http://localhost:5001/api/auth/login`** for authentication
- **`GET http://localhost:5001/api/projects`** for saved projects
>>>>>>> 21827fab6e72321aabbf67436a265252a7c7c0c8

### 2) Start the client

From `CodeNexus-main/client/`:

```bash
npm install
npm run dev
```

Open the Vite dev URL (typically **`http://localhost:5173`**).

## New features added

- **User Authentication**: Secure JWT-based login and registration system. Users stay logged in (in-memory sessions) while using the app. Protected routes ensure unauthorized users cannot access the editors or dashboard.
- **Cloud Projects Storage & Custom Naming**: Save code to MongoDB. The editor top-bar features an inline editable text input to give projects custom names (or keep the smart auto-generated defaults).
- **Dashboard ("My Projects")**: A grid view of all your saved projects. Click "Open" to jump back into a project exactly where you left off, or instantly delete old projects.
- **Client-Side Routing**: Added `react-router-dom` to support navigation between the Landing Page, Dashboard, and individual language playgrounds.
- **Monaco editor**: Textareas were replaced with the Monaco editor for a much richer editing experience (syntax highlighting, line numbers, word wrap).
- **Theme switcher**: Toggle light/dark themes using the `Theme` button in the top-right. Theme preference is persisted to `localStorage`.
- **UI Architecture**: Glassmorphism styling, clean React Portals for UI overlays, and `react-hot-toast` for fluid user feedback.

## AI Assistant setup (open-source models)

This project doesn't bundle a model. To use the assistant, run any local or remote open-source LLM HTTP endpoint (examples below) and set the `MODEL_API_URL` environment variable for the server.

Example model frontends you can run locally:

- text-generation-webui (https://github.com/oobabooga/text-generation-webui) — it exposes an HTTP API for generation.
- llama.cpp HTTP servers or other LLM frontends that provide a simple JSON POST API.

Set `MODEL_API_URL` in a `.env` file in the `server/` folder, for example:

```
MODEL_API_URL=http://localhost:8080/api/generate
```

The server exposes:

- `POST http://localhost:5001/ai` with JSON body `{ "prompt": "Explain this code" }` — the server will proxy your request to `MODEL_API_URL` and return the model output.

Notes: different model frontends expect different payload shapes. The proxy (`server/utils/aiClient.js`) sends `{ prompt, max_tokens }` and attempts to parse common response shapes. Adjust the proxy logic if your frontend expects a different payload.

### Using Ollama (recommended for local LLMs)

Ollama (https://ollama.ai) is a lightweight way to run open-source models locally.

**Setup:**
1. Download and install Ollama from https://ollama.ai
2. Start the Ollama server in a terminal:
   ```bash
   ollama serve
   ```
3. In another terminal, pull a model (e.g., llama3.2:latest):
   ```bash
   ollama pull llama3.2:latest
   ```
   (Alternatives: `ollama pull mistral`, `ollama pull neural-chat`, `ollama pull llama2`, etc.)
4. Update `server/.env` to use Ollama (default):
   ```
   MODEL_API_URL=http://localhost:11434/api/generate
   OLLAMA_MODEL=llama3.2:latest
   ```
5. Restart the CodeNexus server:
   ```bash
   node server.js
   ```
6. Use the AI assistant in CodeNexus — it will connect to your local Ollama instance.

The `.env` file already points to Ollama by default, so if Ollama is running, the assistant should work immediately.

### Templates and quick prompts

The UI includes a small set of curated templates (Explain, Fix bugs, Write unit tests, Optimize). Use the dropdown inside the assistant modal to apply a template to the current editor code, set `max_tokens`, then click `Ask Model`.

If your model frontend expects a different field name for token limits (for example `max_new_tokens`), `server/utils/aiClient.js` attempts to include both `max_tokens` and `max_new_tokens` when proxying requests to increase compatibility.


## Notes & safety

- **Python execution runs on your machine** via the backend. Treat it as a local-only dev tool.
- The **JavaScript editor uses `eval()`** to execute code in the browser. Don’t paste untrusted code.

## Troubleshooting

### Python won’t run on Windows (“python3 is not recognized”)

The backend executes Python using `python3` in `server/utils/pythonCompiler.js`. If your machine uses `python` instead, change the command to `python`, or install/configure Python so `python3` is available on your PATH.

### CORS / API connection issues

<<<<<<< HEAD
- Client calls the server at `http://localhost:5001/runpy`.
- Server CORS currently allows `http://localhost:5173` and `http://localhost:3000`.
=======
- Client calls the server at `http://localhost:5001`.
- Server uses `cors({ origin: true, credentials: true })` by default during local development to prevent origin mismatch blocks between `localhost` and `127.0.0.1`.
- If dashboard projects are not loading, ensure MongoDB is running and `MONGO_URI` is correctly set in `server/.env`.
>>>>>>> 21827fab6e72321aabbf67436a265252a7c7c0c8
