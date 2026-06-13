# VEDA — Development Memory

> Living document tracking project state, decisions, and context across sessions.
> Updated after every significant change.

---

## 📌 Current State

**Phase:** 1 (starting)
**Last Updated:** 2026-06-13
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
| **1** | Infrastructure | Docs reorg, Supabase setup, logging |
| **2** | Data Layer | PostgreSQL migrations, Prisma/Supabase |
| **3** | Knowledge Graph | Neo4j schema, ontology nodes |
| **4** | Scripture Content | Bhagavad Gita ingestion, verse storage |
| **5** | Ingestion Pipeline | PDF upload, chunking, embeddings |
| **6** | Search | Hybrid search service |
| **7** | Citation Engine | Confidence scoring, evidence levels |
| **8** | RLM Pipeline | Graph-first retrieval + reasoning |
| **9** | Agents | Multi-agent orchestrator |
| **10** | Full API | REST + WebSocket endpoints |
