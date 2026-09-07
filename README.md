# AI Teacher

A React (Vite) learning interface with a Flask API.

## Run locally

Open two terminals in VS Code.

```bash
# Terminal 1: React website
cd ~/ai-teacher
npm run dev
```

Open the URL Vite prints—normally `http://localhost:5173`.

```bash
# Terminal 2: Flask API
cd ~/ai-teacher/backend
python3 -m pip install -r requirements.txt
cp .env.example .env
python3 app.py
```

The API runs at `http://127.0.0.1:5000/ask`. It is an API endpoint, not a page to open directly in the browser: it only accepts `POST` requests from the React app.

## Configuration

The frontend currently calls `http://127.0.0.1:5000`. To use a different API address, update the URL in `src/App.jsx`.

Restart Vite after changing the frontend API URL.

## Free database and login

The project uses Supabase's free Postgres database for teacher and student accounts.

1. Create a free project at [supabase.com](https://supabase.com/).
2. Open **SQL Editor** and run `backend/supabase-schema.sql`.
3. Copy the project URL and server-only service role key into `backend/.env`:

```text
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-server-only-service-role-key
SESSION_SECRET=use-a-long-random-secret
```

Keep `SUPABASE_SERVICE_ROLE_KEY` and `SESSION_SECRET` out of React, GitHub, and `.env.local`.
On Render, add the same values under the `guruji-api` service environment variables.
The login form stores only a signed session token in the browser. Passwords are hashed before they are saved in Supabase.

## Syllabus alignment

The learning controls currently include a curated UP Board/SCERT-aligned starter map for Classes 3, 4, and 5 in Maths, EVS, and Hindi. It is intentionally kept in the frontend while the pilot is small. Before treating it as an official exam syllabus, verify chapter names and yearly changes against the latest UPMSP/SCERT publication and move the verified map into Supabase.

Add your actual `GEMINI_API_KEY` to `backend/.env` before starting the backend. Never put this key in React, `src/`, or `.env.local`; browser code is visible to visitors.

To test the app without a Gemini request, set `MOCK_AI=true` in `backend/.env`. The backend will return a demo answer instead.

## Free public hosting

The included `render.yaml` can deploy the frontend and Flask API as two free Render services. Create a Render account, choose **New > Blueprint**, connect this GitHub repository, and set `VITE_API_URL` to the public API URL after the first deploy. Keep `MOCK_AI=true` for a free demo, or add `GEMINI_API_KEY` in Render's private environment variables for real Gemini answers.

## What is implemented

- The backend sends questions to Gemini from the server only.
- The React page offers subject and difficulty controls, chat history, a loading state, and clear errors.
- The API returns helpful `400`, `502`, or `503` errors instead of exposing provider details.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
