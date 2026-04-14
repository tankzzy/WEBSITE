## Deploy Frontend to Vercel and Backend to Render

This repo is split into:

- `frontend/` for the Vite + React app
- `backend/` for the Express + MongoDB API

### Vercel frontend

Create a new Vercel project and set:

- Root directory: `frontend`
- Framework preset: `Vite`
- Build command: `npm run build`
- Output directory: `dist`

Add this environment variable in Vercel:

- `VITE_API_URL=https://YOUR-BACKEND-SERVICE.onrender.com`

The frontend also includes [frontend/vercel.json](</c:/Users/hp/OneDrive/Документы/WEBSITE/frontend/vercel.json>) so React routes like `/dashboard` and `/login` rewrite to `index.html` instead of 404ing.

### Render backend

Create a new Render Web Service or use the Blueprint file at [render.yaml](</c:/Users/hp/OneDrive/Документы/WEBSITE/render.yaml>).

If creating it manually, use:

- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Health check path: `/api/health`

Add these environment variables in Render:

- `MONGO_URI=...`
- `AUTH_SECRET=...`
- `CORS_ORIGINS=http://localhost:5173,https://YOUR-FRONTEND-PROJECT.vercel.app`

Do not hardcode `PORT` in Render. Render injects its own port automatically, and the backend already uses `process.env.PORT || 5000`.

You can copy the template from [backend/.env.example](</c:/Users/hp/OneDrive/Документы/WEBSITE/backend/.env.example>).

### Local development

- Backend env template: [backend/.env.example](</c:/Users/hp/OneDrive/Документы/WEBSITE/backend/.env.example>)
- Frontend env template: [frontend/.env.example](</c:/Users/hp/OneDrive/Документы/WEBSITE/frontend/.env.example>)

For local dev, the frontend still proxies `/api` to `http://localhost:5000`, so no local `VITE_API_URL` is required unless you want the frontend to talk to a remote backend.

### Deploy order

1. Deploy the backend to Render.
2. Copy the Render backend URL.
3. Set `VITE_API_URL` in Vercel to that backend URL.
4. Add your final Vercel domain to `CORS_ORIGINS` in Render.
5. Redeploy both services if needed.
