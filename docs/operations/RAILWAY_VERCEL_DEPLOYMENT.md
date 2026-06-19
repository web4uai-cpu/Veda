# Railway + Vercel Deployment

This setup deploys:

- Frontend: Vercel, from `apps/web`
- Backend API: Railway, from `services/api`
- Primary PostgreSQL database: Railway PostgreSQL
- Auth: deferred

## 1. Current Scope

Deploy without authentication first. Public read APIs and the frontend can go live using only Railway and Vercel.

Add auth later with Clerk, Auth.js, Better Auth, or Supabase. Until then, do not set Supabase variables in Vercel or Railway.

## 2. Railway PostgreSQL

Create a Railway project and add a PostgreSQL database.

Copy Railway's Postgres connection string into the API service as:

```text
DATABASE_URL=postgresql://...
```

Run the schema against the Railway database from your local project root:

```powershell
$env:DATABASE_URL="<Railway Postgres connection string>"
python services/api/services/run_migrations.py
```

Optional seed command:

```powershell
python tools/seed_gita.py
```

The migration runner skips Supabase-only `auth.uid()` policies when applying the schema to plain Railway PostgreSQL.

## 3. Railway Backend

Create a Railway service from the GitHub repo.

Service settings:

- Root Directory: leave empty / repo root
- Builder: Dockerfile
- Dockerfile path: `Dockerfile.railway`
- Health check path: `/api/v1/health`

This repo includes `railway.json`, so Railway should pick `Dockerfile.railway` automatically. If Railway tries to run `pnpm`, the service is using Nixpacks instead of Dockerfile. Switch the builder to Dockerfile and redeploy.

Set variables:

```text
DATABASE_URL=<Railway Postgres connection string>
CORS_ORIGINS=https://<your-vercel-domain>,http://localhost:3000
OPENROUTER_API_KEY=<optional>
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENAI_API_KEY=<optional>
DEBUG=false
```

Railway injects `PORT` automatically. The API Dockerfile uses that value in production and falls back to `8000` locally.

After deploy, verify:

```text
https://<your-railway-api-domain>/api/v1/health
https://<your-railway-api-domain>/docs
```

## 4. Vercel Frontend

Import the GitHub repo into Vercel.

Project settings:

- Framework Preset: Next.js
- Root Directory: `apps/web`
- Install Command: `pnpm install --frozen-lockfile`
- Build Command: `pnpm build`
- Output Directory: `.next`

Set variables:

```text
NEXT_PUBLIC_API_URL=https://<your-railway-api-domain>
NEXT_PUBLIC_APP_URL=https://<your-vercel-domain>
```

## 5. Final Checks

Open the Vercel URL and verify:

- Pages load without CORS errors
- `/api/v1/health` on Railway returns the API status
- Scripture/library pages can read from Railway PostgreSQL

If the frontend shows failed API requests, confirm `NEXT_PUBLIC_API_URL` has no trailing slash and that the Vercel domain is included in `CORS_ORIGINS`.

## 6. Auth Later

When you are ready to add auth:

- Clerk: fastest hosted auth path for Next.js
- Auth.js or Better Auth: good self-owned path with Railway PostgreSQL
- Supabase Auth: still possible later, but not required for this first deploy
