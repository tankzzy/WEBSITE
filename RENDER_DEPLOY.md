## Render Split Deployment

This workspace is now split into:

- `frontend/`
- `backend/`

If you deploy them as separate Render services, use these settings.

### Frontend service

- Root directory: `frontend`
- Build command: `npm install && npm run build`
- Publish directory: `dist`
- Environment variable:
  - `VITE_API_URL=https://YOUR-BACKEND-SERVICE.onrender.com`

### Backend service

- Root directory: `backend`
- Build command: `npm install`
- Start command: `node server.js`
- Environment variables:
  - `MONGO_URI=...`
  - `AUTH_SECRET=...`
  - `PORT=5000`

### Health check

Open:

- `https://YOUR-BACKEND-SERVICE.onrender.com/api/health`

Expected response when the database is connected:

```json
{"ok":true,"database":"connected"}
```

If the frontend and backend are split and `VITE_API_URL` is missing, the frontend will incorrectly call its own domain for `/api/...` requests.
