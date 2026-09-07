# Deploying Nexus FMS to Vercel

The app is a Vite + React SPA that talks to the Django backend at
`https://futsal-be.onrender.com` through **same-origin `/api` requests**.
In development Vite proxies them (see `vite.config.ts`); in production, a
Vercel proxy function does the same job. No backend CORS changes are needed.

## One-time setup

1. **Push this project to GitHub** (from the project root):

   ```bash
   git remote add origin https://github.com/<you>/nexus-fms-frontend.git
   git branch -M main
   git push -u origin main
   ```

   (A local git repo with an initial commit already exists.)

2. **Import in Vercel**: [vercel.com/new](https://vercel.com/new) → pick the
   repo. The framework (Vite), build command (`npm run build`) and output
   directory (`dist`) are detected from `vercel.json` — nothing to change.

3. **Environment variables** (Project → Settings → Environment Variables).
   Add these values for Production, Preview and Development:

   | Key | Value |
   |---|---|
   | `VITE_API_BASE_URL` | `https://futsal-be.onrender.com` |
   | `VITE_APP_NAME` | `Nexus FMS` |

4. **Deploy** → note your URL (e.g. `https://nexus-fms.vercel.app`).

## Post-deploy checklist

- `/` loads and the hero chip shows live open/closed status
  (proves the futsal record is reachable through the rewrite)
- Log in → the navbar shows your avatar/role (auth + cookies work over HTTPS)
- `/bookings` shows real slots for today
- DevTools → Network: `/api/v1/...` requests return 200 (proxied to Render)

## How routing works

| Request | Served by |
|---|---|
| `/assets/**`, static files | Vercel CDN (filesystem first) |
| `/api/**` | Proxied to the `VITE_API_BASE_URL` backend (headers incl. `Authorization` pass through) |
| anything else (`/bookings`, `/about`, …) | `index.html` (SPA fallback for React Router) |

## Notes

- **Cold starts**: the Render backend can take ~30–60s to wake; the UI has
  loading/error states with retry for that.
- **Cookies**: auth cookies are set with `Secure` automatically on HTTPS.
- **Redeployments**: every push to `main` auto-deploys; PRs get preview URLs.
- `VITE_API_BASE_URL` must be the backend origin only (for example,
  `https://futsal-be.onrender.com`), without a trailing `/api` path.
