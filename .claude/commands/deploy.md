# Deploy Command

## Usage
`/deploy <environment>`

## Environments
- **dev** — Local Docker Compose stack
- **staging** — Railway (backend) + Vercel preview (frontend)
- **production** — Railway (backend) + Vercel production (frontend)

## Pre-Deploy Checklist
1. All tests pass: `pnpm turbo test`
2. Build succeeds: `pnpm turbo build`
3. Lint clean: `pnpm turbo lint`
4. No uncommitted changes: `git status`
5. Environment variables configured for target environment
6. Database migrations applied

## Deploy Steps

### Frontend (Vercel)
- Push to branch triggers automatic Vercel preview deployment
- Production deploys from `Main` branch
- Verify at deployed URL that Sanskrit rendering works correctly

### Backend (Railway)
- Push triggers automatic Railway deployment
- Verify API health: `GET /api/v1/health`
- Check service connectivity: Neo4j, Qdrant, OpenSearch, Redis, Supabase

### Local (Docker Compose)
```bash
docker-compose up --build -d
```
- Verify all services healthy: `docker-compose ps`
