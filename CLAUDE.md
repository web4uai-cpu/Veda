# VEDA — Project Memory

> This file is the single source of truth for AI assistants working on this codebase.
> Read this FIRST before making any changes.

## Identity

**VEDA** is a Knowledge Operating System for Sanatan Dharma. It is NOT a chatbot, NOT a social network, NOT a productivity app. It is a **research platform** combining ancient scriptures with modern AI.

## Constitutional Rules (NEVER VIOLATE)

1. **Never build intelligence before knowledge** — Graph/data layer must exist before any AI
2. **Never build reasoning before citations** — Citation engine before LLM reasoning
3. **Never build agents before retrieval** — Search infrastructure before agent system
4. **Never build UI before APIs** — Backend endpoints before frontend pages
5. **Never optimize before correctness** — Correct first, fast second
6. **Never prioritize features over architecture** — Foundation before features

## Architecture North Star

```
Knowledge Graph (Neo4j) → Retrieval (Qdrant + OpenSearch) → Citation (PostgreSQL) → Reasoning (LLM/RLM) → Agents → Experience (UI)
```

## Tech Stack (Locked)

| Layer | Technology | Version |
|---|---|---|
| Frontend | Next.js (App Router) | 15 |
| UI Library | React | 19 |
| Styling | Tailwind CSS | 3.4+ |
| State | Zustand (client), TanStack Query (server) | 5+, 5+ |
| Backend | FastAPI (Python) | 0.115+ |
| Auth + DB + Storage | Supabase | latest |
| Knowledge Graph | Neo4j Community | 5 |
| Vector Search | Qdrant | latest |
| Full-Text Search | OpenSearch | 2 |
| Cache | Redis | 7 |
| LLM Gateway | OpenRouter | — |
| LLM Primary | GPT-5.5 | — |
| LLM Fallback | Claude | — |
| Embeddings | OpenAI text-embedding-3-large | 3072-dim |
| Events | Kafka (Redis Streams for dev) | — |
| Monorepo | Turborepo + pnpm | 2.5+, 9+ |
| Language | TypeScript (frontend), Python (backend) | 5.8+, 3.12+ |
| Infrastructure | Docker (MVP), AWS EKS (production) | — |

## Monorepo Structure

```
veda/
├── apps/web/              → Next.js 15 main application
├── services/api/          → FastAPI gateway (Python)
├── packages/types/        → @veda/types — shared TypeScript types
├── packages/design-tokens/ → @veda/design-tokens — colors, fonts, spacing
├── docs/                  → Architecture & specification documents
├── infrastructure/        → Terraform, Kubernetes, Docker
├── tools/                 → Generators, scripts
├── turbo.json
├── pnpm-workspace.yaml
├── docker-compose.yml
└── ADR.md                 → 18 Architecture Decision Records
```

## ID Strategy

All entities use **ULID** with type prefixes:

```
usr_ = User         scp_ = Scripture    bok_ = Book
chp_ = Chapter      vrs_ = Verse        cpt_ = Concept
prs_ = Person       dei_ = Deity        evt_ = Event
plc_ = Place        com_ = Commentary   upl_ = Upload
nts_ = Note         rpt_ = Report       col_ = Collection
```

IDs are branded TypeScript types — use them for type safety:
```typescript
import type { UserId, VerseId, ConceptId } from '@veda/types';
```

## Design System (NEVER DEVIATE)

- **Primary:** Saffron `#C97A24` — actions, highlights, brand
- **Secondary:** Deep Indigo `#243B63` — knowledge, headers, navigation
- **Background:** `#F8F5EF` (light), `#111827` (dark)
- **Fonts:** Inter (UI), Noto Sans Devanagari (Sanskrit), Cormorant Garamond (scripture titles)
- **Color ratio:** 70% neutral, 20% indigo, 10% saffron
- **Radii:** sm=8px, md=12px, lg=16px, card=20px
- **Shadows:** Subtle ONLY — no dramatic elevation
- **CSS classes:** `.sanskrit`, `.scripture-title`, `.knowledge-card`, `.verse-block`

## Sanskrit Rendering (ALWAYS)

Sanskrit text must always display in this order:
1. **Sanskrit** (Devanagari script) — `.sanskrit` class
2. **Transliteration** (IAST romanization)
3. **Translation** (English)

NEVER combine these into one line.

## Canonical vs User Data (CRITICAL)

- **Canonical** (read-only): Scriptures, Commentaries, Verified Sources
- **User** (read-write): Uploads, Notes, Collections
- Canonical content is IMMUTABLE — user content can REFERENCE but never MODIFY canonical nodes
- User uploads never override canonical sources in search ranking

## Citation Rules

Every AI-generated answer MUST include:
- Source scripture/text reference
- Chapter and verse (if applicable)
- Confidence score (0.0–1.0)
- Evidence level (A–E)

**Hallucination auto-block triggers:** Reference not found, verse doesn't exist, source missing, citation mismatch, invented commentary, invalid Sanskrit.

## API Patterns

- All API endpoints under `/api/v1/`
- Error envelope: `{ error, code, message, correlation_id }`
- Use correlation IDs across all services
- Event envelope: `{ event_id, event_type, version, timestamp, producer, correlation_id, payload }`

## Graph Patterns (Neo4j)

- 13 node labels: Scripture, Book, Chapter, Verse, Concept, Person, Deity, Place, Event, Story, Commentary, School, UploadedDocument
- 12 relationships: PART_OF, EXPLAINS, REFERENCES, MENTIONS, RELATED_TO, SUPPORTS, CONTRADICTS, AUTHORED_BY, COMMENTS_ON, LOCATED_IN, TEACHES, WORSHIPS
- Max traversal depth: 5 (for research mode)
- LLMs are CONSUMERS of graph knowledge, never creators

## Agent System

9 specialized agents with orchestrator:
- Orchestrator → routes to domain agents
- Domain agents: Veda, Upanishad, Purana, Vedanta, Sanskrit
- Infrastructure agents: Graph, Citation, Research, Upload
- ALL agents are STATELESS
- Citation Agent has VETO AUTHORITY — can reject any response
- Contradictory views are BOTH returned (no forced merge)

## Current Phase: 4 — Scripture Content (next)

### Completed
- Phase 0: Monorepo scaffold, web app (7 routes), FastAPI gateway, shared packages, Docker, CI/CD
- Phase 1: Docs reorganization, database migrations, Neo4j schema, Qdrant setup
- Phase 2: Database connections, API routers, Pydantic models, Gita ingestion scripts, citation/evidence schema, evidence search API
- Phase 3A: Backend stabilization, tests, migration verification, citation/search audit persistence, Redis caching layer
- Phase 3B: Knowledge Graph sync (PG→Neo4j), concept detection for Gita verses, graph validation command (76 tests passing)

### Next Up
- Phase 4: Scripture Content (full Bhagavad Gita ingestion and principal Upanishad registry)
- Phase 5: Indexing Pipeline (embedding generation, OpenSearch/Qdrant bulk indexing)

See `docs/architecture/BACKEND_ARCHITECTURE.md` for the active backend audit and build order.
