# VEDA — Development Memory

> Living document tracking project state, decisions, and context across sessions.
> Updated after every significant change.

---

## 📌 Current State

**Phase:** 3A complete, 3B next (Knowledge Graph Sync)
**Last Updated:** 2026-06-19
**Dev Server:** http://localhost:3000
**API Server:** http://localhost:8000 (when running)

---

## ✅ Completed Phases

### Phase 0: Repository Foundation (2026-06-13)
- Monorepo scaffold (Turborepo + pnpm)
- Root configs: turbo.json, tsconfig, prettier, editorconfig, gitignore
- Docker Compose: PostgreSQL 16, Neo4j 5, Qdrant, OpenSearch 2, Redis 7
- `@veda/types`: 300+ lines, 15 branded ID types, 20+ entity interfaces
- `@veda/design-tokens`: Full design system (TS + CSS custom properties)
- `apps/web`: Next.js 15 with 7 routes (home, explore, ask, scriptures, graph, research, library)
- `services/api`: FastAPI with `/api/v1/health`, config, Dockerfile
- CI/CD: GitHub Actions (lint, typecheck, build, API check)
- ADR.md: 18 architecture decisions documented
- Build verified: ✓ 9.9s, all routes compile

### Phase 2: Data Layer (2026-06-14 to 2026-06-15)
- PostgreSQL, Neo4j, Redis, Qdrant, and OpenSearch async adapters
- FastAPI lifespan connects/disconnects all backend services
- Scripture and graph routers under `/api/v1`
- Bhagavad Gita ingestion script
- Neo4j ontology seed script
- Citation/evidence/search audit migration
- Evidence-first `POST /api/v1/search`
- Backend audit and build order: `docs/architecture/BACKEND_ARCHITECTURE.md`

### Phase 3A: Backend Stabilization (2026-06-19)
- Test infrastructure: pytest + conftest with 5 DB mock fixtures, 59 tests passing
- Config rewrite: Pydantic BaseSettings with validators, .env support, fail-fast
- Service extraction: scripture_service.py (7 functions) + graph_service.py (9 functions)
- Routers slimmed: scriptures.py 326→115 lines, graph.py 354→85 lines
- Search integration: Qdrant vector + OpenSearch fulltext wired with Reciprocal Rank Fusion
- 4 concurrent retrieval paths: postgres.reference, postgres.keyword, qdrant.semantic, opensearch.fulltext
- Citation audit: persist_citation in evidence flow + search_queries audit logging
- Redis caching: cache_service.py — scripture list (24h), concepts (1h), search (5min)
- All graceful degradation: Qdrant/OpenSearch/Redis failures never block requests

---

## 🔑 Key Decisions Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-13 | AWS for cloud | Best Kubernetes + managed DB ecosystem |
| 2026-06-13 | GPT-5.5 via OpenRouter | Model-agnostic, easy fallback to Claude |
| 2026-06-13 | Supabase for auth+DB+storage | Solo dev efficiency, instant auth |
| 2026-06-13 | OpenSearch over Elasticsearch | AWS-managed, fork compatibility |
| 2026-06-13 | Self-hosted Docker for MVP | Zero cost, full local development |
| 2026-06-13 | Public APIs for scripture data | bhagavadgitaapi.in, sacred-texts.com |

---

## 🐛 Known Issues

| Issue | Severity | Status |
|---|---|---|
| Tailwind v4 not working (using v3.4 instead) | Low | Accepted — v3.4 is stable |
| Unicode escape in layout.tsx OpenGraph description | Fixed | ✅ Used `\u2019` for apostrophe |
| No Storybook setup yet | Low | Deferred to Phase 12 |

---

## 🏗️ Architecture Patterns Established

### Frontend
- Server Components by default, `'use client'` only when needed
- `@/` alias for local imports, `@veda/types` for shared types
- HSL CSS variables for theming (`hsl(var(--primary))`)
- `.knowledge-card`, `.verse-block`, `.scripture-title` component classes

### Backend
- `/api/v1/` prefix for all endpoints
- Pydantic models for request/response validation
- OpenAI SDK with OpenRouter base_url for LLM calls
- Dataclass-based settings from environment variables

### Data
- ULID with type prefixes for all entity IDs
- Supabase for auth + PostgreSQL + storage
- Neo4j for knowledge graph (read-only for canonical)
- 4 Qdrant collections at 3072 dimensions
- 3 OpenSearch indexes

---

## 📁 File Map (Quick Reference)

```
Key files to edit for each concern:

Routing/Pages:     apps/web/src/app/*/page.tsx
Global Styles:     apps/web/src/app/globals.css
Layout:            apps/web/src/app/layout.tsx
Design Tokens:     packages/design-tokens/src/index.ts
Shared Types:      packages/types/src/index.ts
API Gateway:       services/api/main.py
API Config:        services/api/config.py
Docker:            docker-compose.yml
Environment:       .env.example
CI/CD:             .github/workflows/ci.yml
Architecture:      ADR.md
```

---

## 🗺️ Phase Roadmap (Upcoming)

| Phase | Focus | Key Deliverable |
|---|---|---|
| **3A** | Backend Stabilization | Tests, migration verification, search/citation audit persistence |
| **3B** | Knowledge Graph Sync | PostgreSQL verses mirrored to Neo4j with concept edges |
| **4** | Scripture Content | Full Bhagavad Gita ingestion, Upanishad registry |
| **5** | Indexing Pipeline | OpenSearch bulk index, Qdrant embeddings |
| **6** | Search | Hybrid search service with fusion ranking |
| **7** | Citation Engine | Confidence scoring, validation endpoints, audit logs |
| **8** | RLM Pipeline | Graph-first retrieval + reasoning |
| **9** | Agents | Multi-agent orchestrator |
| **10** | Full API | REST + WebSocket endpoints |
