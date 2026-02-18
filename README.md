## CodeNexus

CodeNexus is a lightweight, browser-based coding playground with multiple “editors”:

- **JavaScript**: write JS in the browser and run it (output is captured from `console.log`).
- **HTML/CSS/JS**: a mini web editor that live-previews HTML/CSS in an iframe and runs JS on demand.
- **Python**: sends your code to a small Node/Express backend that writes a temporary `.py` file and executes it locally, returning stdout as “Output”.

## Tech stack

- **Client**: React + Vite + React Router (`client/`)
- **Server**: Node.js + Express + CORS (`server/`)
- **Python execution**: server-side `python3` process (writes files to `server/python_runner/`)

## Project structure

- **`client/`**: UI (React/Vite)
- **`server/`**: API used by the Python editor
  - **`server/routes/pythonRoutes.js`**: `POST /runpy`
  - **`server/utils/pythonCompiler.js`**: creates files + executes Python
  - **`server/python_runner/`**: auto-created folder holding generated `.py` files

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

The server listens on **port 5000** and exposes:

- **`POST http://localhost:5000/runpy`** with JSON body `{ "code": "print('hi')" }`

### 2) Start the client

From `CodeNexus-main/client/`:

```bash
npm install
npm run dev
```

Open the Vite dev URL (typically **`http://localhost:5173`**).

## Notes & safety

- **Python execution runs on your machine** via the backend. Treat it as a local-only dev tool.
- The **JavaScript editor uses `eval()`** to execute code in the browser. Don’t paste untrusted code.

## Troubleshooting

### Python won’t run on Windows (“python3 is not recognized”)

The backend executes Python using `python3` in `server/utils/pythonCompiler.js`. If your machine uses `python` instead, change the command to `python`, or install/configure Python so `python3` is available on your PATH.

### CORS / API connection issues

- Client calls the server at `http://localhost:5000/runpy`.
- Server CORS currently allows `http://localhost:5173` and `http://localhost:3000`.
