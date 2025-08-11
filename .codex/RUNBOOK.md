 # Runbook

 Quick commands and environment notes for local dev.

 Prereqs
 - Node 20.x
 - MongoDB (Atlas or local) URL in `server/.env`
 - API keys in `server/.env`: `POLYGON_API_KEY`, `OPENAI_API_KEY`, `SESSION_SECRET`

 Server (API)
 - Dev: `cd server && npm run dev`
 - Prod: `cd server && npm start`
 - Default port: `4545` (override with `PORT`)

 Client (Vite React)
 - Dev: `cd client && npm run dev`
 - Build: `cd client && npm run build`
 - Preview: `cd client && npm run preview`
 - Default dev port: `5173`

 CORS
 - Allowed origins include `http://localhost:5173`, `http://localhost:5174`, and the deployed Vercel app(s). Update `server/server.js` `allowedOrigins` if adding new hosts.

 Health Checks
 - API: GET `http://localhost:4545/` → "AI-Trader API is running"

 Troubleshooting
 - Mongo connection errors: verify `MONGODB_URI`/`MONGODB_*` vars and IP allowlist.
 - Missing keys: server exits if `POLYGON_API_KEY` is absent.
 - Session/CORS: ensure client uses `credentials: 'include'` when needed and origin is whitelisted.
