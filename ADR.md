# VEDA — Architecture Decision Records (ADR)

**Version:** 1.0  
**Status:** Accepted  
**Date:** 2026-06-13  
**Owner:** Platform Architecture Team  
**Scope:** Full Platform — All Phases  

> This document consolidates every major architectural decision for the VEDA Knowledge Operating System. Each decision was derived from a complete audit of the 79-file specification corpus, cross-referenced against the IMPLEMENTATION_PLAN.md, ROADMAP.md, SYSTEM_ARCHITECTURE.md, and all supporting documents.

---

## Table of Contents

1. [Project Audit Summary](#project-audit-summary)
2. [ADR-001: Monorepo with Turborepo + pnpm](#adr-001-monorepo-with-turborepo--pnpm)
3. [ADR-002: Polyglot Backend — TypeScript Frontend + FastAPI Backend](#adr-002-polyglot-backend--typescript-frontend--fastapi-backend)
4. [ADR-003: Four-Database Storage Architecture](#adr-003-four-database-storage-architecture)
5. [ADR-004: Neo4j as Primary Knowledge Graph](#adr-004-neo4j-as-primary-knowledge-graph)
6. [ADR-005: Qdrant for Vector/Semantic Search](#adr-005-qdrant-for-vectorsemantic-search)
7. [ADR-006: RLM (Retrieval + Linkage + Reasoning) over Standard RAG](#adr-006-rlm-retrieval--linkage--reasoning-over-standard-rag)
8. [ADR-007: Multi-Agent Architecture with Orchestrator Pattern](#adr-007-multi-agent-architecture-with-orchestrator-pattern)
9. [ADR-008: Citation Engine as Trust Gatekeeper](#adr-008-citation-engine-as-trust-gatekeeper)
10. [ADR-009: Canonical/User Data Separation](#adr-009-canonicaluser-data-separation)
11. [ADR-010: Next.js 15 + Tailwind v4 + shadcn/ui Frontend](#adr-010-nextjs-15--tailwind-v4--shadcnui-frontend)
12. [ADR-011: Event-Driven Architecture with Kafka](#adr-011-event-driven-architecture-with-kafka)
13. [ADR-012: Hybrid Search with Fusion Ranking](#adr-012-hybrid-search-with-fusion-ranking)
14. [ADR-013: AWS-Primary Infrastructure on EKS](#adr-013-aws-primary-infrastructure-on-eks)
15. [ADR-014: ULID-Based Global ID Strategy](#adr-014-ulid-based-global-id-strategy)
16. [ADR-015: Dependency-Ordered Build Sequence](#adr-015-dependency-ordered-build-sequence)
17. [Audit Findings — Gaps & Recommendations](#audit-findings--gaps--recommendations)

---

## Project Audit Summary

### Files Audited: 79
### Categories Covered:

| Category | Files | Key Documents |
|---|---|---|
| **Architecture** | 12 | SYSTEM_ARCHITECTURE, MONOREPO_ARCHITECTURE, FRONTEND_ARCHITECTURE, RLM_ARCHITECTURE, SEARCH_ARCHITECTURE, EVENT_ARCHITECTURE, INFRASTRUCTURE_ARCHITECTURE, DEPLOYMENT_ARCHITECTURE, SECURITY_ARCHITECTURE, AGENT ARCHITECTURE |
| **Data & Knowledge** | 10 | DATA_MODEL, KNOWLEDGE_GRAPH, RELATIONSHIP_SCHEMA, CITATION_ENGINE, SOURCE_HIERARCHY, INGESTION_PIPELINE, SCRIPTURE_INGESTION_STANDARDS |
| **Ontology** | 12 | CONCEPT_ONTOLOGY, DEITY_ONTOLOGY, DYNASTY_ONTOLOGY, FESTIVAL_ONTOLOGY, PERSON_ONTOLOGY, PHILOSOPHY_ONTOLOGY, PRACTICE_ONTOLOGY, SANSKRIT_ONTOLOGY, TEMPLE_ONTOLOGY, TIMELINE_ONTOLOGY, TRADITION_ONTOLOGY, COMMENTARY_ONTOLOGY |
| **Agent Specifications** | 12 | AGENT.md, veda_agent, upanishad_agent, purana_agent, vedanta_agent, research_agent, Sanskrit_agent, Graph_agent, Citation_agent, comparison_agent, learning_agent, ontology_agent |
| **Product & UX** | 8 | PRODUCT_VISION, APP_FLOW, UX_ARCHITECTURE, DESIGN_SYSTEM, KNOWLEDGE_MAP_UI, DAILY_VERSE, MOBILE_APP, KNOWLEDGE_CURATION_GUIDE |
| **Scripture Content** | 6 | VEDAS, UPANISHADS, GITA, RAMAYANA, MAHABHARATA, PURANAS |
| **AI & Intelligence** | 5 | REASONING_ENGINE, MASTER_SYSTEM_PROMPT, PROMPT_ENGINEERING_GUIDE, SKILLS, TOOLS |
| **Operations** | 10 | AUTH, RATE_LIMITS, OBSERVABILITY, PRODUCTION, STAGING, DEV_ENV, BACKUP_RECOVERY, DISASTER_RECOVERY, INCIDENT_RESPONSE, SRE_RUNBOOK |
| **Planning** | 4 | IMPLEMENTATION_PLAN, ROADMAP, QUALITY_STANDARDS, COST_OPTIMIZATION |

### Current State: **Documentation Only — No Source Code Exists**

The repository contains 79 specification documents and zero implementation code. There is no `package.json`, no `turbo.json`, no source directories, no database migrations, and no CI/CD pipeline. The project is at **Phase 0, Step 0**.

---

## ADR-001: Monorepo with Turborepo + pnpm

**Status:** Accepted

### Context

VEDA requires coordinated development across a web app, mobile app, admin portal, 9+ backend services, 12+ shared packages, and infrastructure code. Independent repos would create version drift, type mismatches, and slow development velocity.

### Decision

Use a **Turborepo monorepo** with **pnpm** workspaces.

```
veda/
├── apps/         (web, mobile, admin, docs)
├── services/     (api, auth, graph, search, ingestion, agents, research, notifications, analytics)
├── packages/     (ui, design-tokens, types, api-client, auth-sdk, graph-sdk, search-sdk, knowledge-sdk, agent-sdk, config, eslint-config, tsconfig, testing)
├── infrastructure/ (terraform, kubernetes, docker, monitoring, security, environments)
├── tools/        (generators, codemods, ontology-tools, graph-tools, scripts)
├── docs/         (architecture, product, ontology, api, agents, research)
└── turbo.json
```

### Alternatives Considered

| Option | Pros | Cons |
|---|---|---|
| **Nx** | More features, better graph visualization | Heavier, more complex config, steeper learning curve |
| **Independent Repos** | Team isolation | Version drift, type mismatches, dependency hell |
| **Lerna** | Mature | Maintenance concerns, less modern than Turborepo |

### Consequences

- **Positive:** Shared types, atomic commits, unified CI, code reuse via packages
- **Negative:** Larger repo, longer CI for unrelated changes (mitigated by Turborepo caching)

### Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Slow CI on large repo | Turborepo remote caching + task hashing |
| Package boundary violations | Strict workspace dependencies + lint rules |
| Build complexity | Shared tsconfig, standardized build scripts |

---

## ADR-002: Polyglot Backend — TypeScript Frontend + FastAPI Backend

**Status:** Accepted

### Context

The frontend requires React/Next.js (TypeScript), but the AI/ML ecosystem (LLM orchestration, embedding generation, agent orchestration, Neo4j/Qdrant clients) is Python-dominated. A single-language approach would sacrifice either frontend DX or AI ecosystem strength.

### Decision

- **Frontend + Shared Packages:** TypeScript (Node.js 22+)
- **Backend Services:** Python (FastAPI)
- **API Contract:** OpenAPI specs as the bridge between worlds

### Alternatives Considered

| Option | Pros | Cons |
|---|---|---|
| **All TypeScript (tRPC/NestJS)** | Single language, shared types | Weak AI/ML ecosystem, no LangChain/LlamaIndex |
| **All Python (Django)** | Strong AI, single language | Poor frontend DX, slower UI development |
| **Go Backend** | Performance | Small AI ecosystem, learning curve |

### Consequences

- **Positive:** Best-of-breed for each layer, access to Python AI libraries (LangChain, LlamaIndex, OpenAI SDK)
- **Negative:** Two language runtimes, need OpenAPI generation for type safety across the boundary

### Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Type drift between TS and Python | Auto-generated OpenAPI types + CI validation |
| Two build systems | Containerize Python services independently |
| Developer context switching | Clear service boundaries, domain ownership |

---

## ADR-003: Four-Database Storage Architecture

**Status:** Accepted

### Context

VEDA serves four fundamentally different data access patterns: relational (users, metadata, citations), graph traversal (knowledge relationships), vector similarity (semantic search), and full-text keyword search. No single database excels at all four.

### Decision

| Database | Purpose | Data |
|---|---|---|
| **PostgreSQL** | Source of truth, relational data | Users, scriptures, verses, citations, uploads, notes, settings |
| **Neo4j** | Knowledge graph | Concepts, relationships, scripture links, traversals |
| **Qdrant** | Vector/semantic search | Embeddings, semantic chunks (3072-dim, OpenAI primary / BGE-M3 fallback) |
| **Elasticsearch** | Full-text keyword search | Scripture index, concept index, upload index |

Supporting:
- **Redis (ElastiCache):** Caching, session store
- **S3:** Object storage for PDFs, EPUBs, images, audio

### Alternatives Considered

| Option | Pros | Cons |
|---|---|---|
| **PostgreSQL + pgvector only** | Simpler ops | Poor graph traversal, weaker vector search at scale |
| **MongoDB** | Flexible schema | No native graph, no native vector |
| **ArangoDB (multi-model)** | Single DB for graph+document | Immature vector support, smaller ecosystem |

### Consequences

- **Positive:** Best performance for each access pattern, clear data ownership
- **Negative:** Operational complexity (4 databases to maintain), data sync challenges

### Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Data consistency across databases | Event-driven sync via Kafka, correlation IDs |
| Operational burden | Managed services (RDS, managed Neo4j, managed Qdrant) |
| Query complexity | Abstraction layers in services (graph-sdk, search-sdk) |

---

## ADR-004: Neo4j as Primary Knowledge Graph

**Status:** Accepted

### Context

VEDA's core value proposition is a structured knowledge graph of Sanatan Dharma. The graph must support: 10+ node types (Concept, Scripture, Verse, Person, Deity, Event, Place, Story, Commentary, School), 11+ relationship types (PART_OF, EXPLAINS, REFERENCES, MENTIONS, RELATED_TO, SUPPORTS, CONTRADICTS, AUTHORED_BY, COMMENTS_ON, LOCATED_IN, TEACHES), and traversals up to depth 5 for research mode.

### Decision

Use **Neo4j** (3-node cluster in production) as the authoritative knowledge graph database.

The graph is the **source of relationships**. LLMs are **consumers** of graph knowledge, never creators. Canonical content nodes are **immutable**.

### Alternatives Considered

| Option | Pros | Cons |
|---|---|---|
| **Amazon Neptune** | Managed, AWS-native | Less mature Cypher support, vendor lock-in |
| **TigerGraph** | Performance at scale | Commercial licensing, smaller community |
| **PostgreSQL with recursive CTEs** | Simpler ops | Poor traversal performance at depth > 3 |

### Consequences

- **Positive:** Native graph traversal, Cypher query language, mature ecosystem, proven at scale
- **Negative:** Additional infrastructure, cluster management, licensing costs at scale

---

## ADR-005: Qdrant for Vector/Semantic Search

**Status:** Accepted

### Context

VEDA requires semantic search across scripture chunks, commentary chunks, upload chunks, and research chunks. Embedding dimensions: 3072 (OpenAI primary), with BGE-M3 as fallback.

### Decision

Use **Qdrant** (3-node cluster) with four collections: `scripture_chunks`, `commentary_chunks`, `upload_chunks`, `research_chunks`.

### Alternatives Considered

| Option | Pros | Cons |
|---|---|---|
| **Pinecone** | Fully managed, simple | Vendor lock-in, less control, cost at scale |
| **Weaviate** | Built-in schema, hybrid search | Heavier, less focused |
| **pgvector** | Single database | Performance at scale, limited filtering |

### Consequences

- **Positive:** High performance, Rust-based, excellent filtering, self-hostable
- **Negative:** Additional infrastructure, need to manage cluster

---

## ADR-006: RLM (Retrieval + Linkage + Reasoning) over Standard RAG

**Status:** Accepted

### Context

Standard RAG (question → vector search → LLM → answer) produces weak relationships, poor context awareness, and limited knowledge discovery. VEDA needs richer understanding that leverages the knowledge graph.

### Decision

Implement a custom **RLM (Retrieval + Linkage + Reasoning Model)** pipeline:

```
Query → Intent Analysis → Graph Linkage → Hybrid Retrieval → Evidence Collection → Multi-Agent Reasoning → Citation Validation → Response Assembly → Answer
```

**Key differentiators from standard RAG:**
1. **Graph-first:** Relationship discovery before vector search
2. **Multi-source:** Hybrid retrieval (Neo4j + Qdrant + Elasticsearch)
3. **Evidence packets:** Structured evidence with source type, confidence, citation
4. **Citation gate:** No answer without verified citations
5. **Multi-agent:** Specialized agents (Veda, Upanishad, Purana, Vedanta, Sanskrit, Graph, Citation) collaborate

### Alternatives Considered

| Option | Pros | Cons |
|---|---|---|
| **Standard RAG** | Simple, well-understood | No graph awareness, weak citations, hallucination risk |
| **GraphRAG (Microsoft)** | Graph-aware retrieval | Less customizable, not citation-first |
| **RAPTOR (hierarchical)** | Better context | No graph integration, no multi-agent |

### Consequences

- **Positive:** Dramatically reduced hallucination, traceable answers, multi-perspective responses
- **Negative:** Higher complexity, longer latency (~2-5s for scholar/research mode), more engineering effort

---

## ADR-007: Multi-Agent Architecture with Orchestrator Pattern

**Status:** Accepted

### Context

Sanatan Dharma knowledge spans diverse domains (Vedas, Upanishads, Puranas, multiple philosophical schools). A single LLM prompt cannot maintain domain-specific expertise, and different domains require different context sizes and tool access.

### Decision

Implement a **multi-agent system** with an **Orchestrator pattern**:

| Agent | Domain | Context | Tool Access |
|---|---|---|---|
| **Orchestrator** | Coordination | — | All agents |
| **Veda Agent** | Four Vedas | 8-16k | Qdrant, Elasticsearch |
| **Upanishad Agent** | Upanishads | 8-16k | Qdrant, Neo4j |
| **Purana Agent** | Puranas | 8-16k | Qdrant, Neo4j |
| **Vedanta Agent** | Philosophical schools | 8-16k | Qdrant, Neo4j |
| **Sanskrit Agent** | Language analysis | 8-16k | Qdrant |
| **Graph Agent** | Knowledge graph | 2-4k | Neo4j only |
| **Citation Agent** | Verification | 2-4k | PostgreSQL, Neo4j, Qdrant (read-only) |
| **Research Agent** | Long-form analysis | 32-128k | All |
| **Upload Agent** | User documents | 32-128k | Upload storage, Qdrant, Neo4j |

**All agents are stateless.** Persistent memory stored in PostgreSQL.

**Critical rules:**
- Agents **interpret** retrieved evidence; they do not create truth
- Citation Agent has **veto authority** — may reject responses
- Contradictory views are **both returned** (no forced merge)

### Alternatives Considered

| Option | Pros | Cons |
|---|---|---|
| **Single LLM with mega-prompt** | Simple | Context limit, no specialization, hallucination risk |
| **CrewAI/AutoGen framework** | Pre-built | Less control over citation gating, framework lock-in |
| **LangGraph** | Flexible graph-based flows | More complex, overkill for initial phases |

### Consequences

- **Positive:** Domain specialization, reduced hallucination, parallel execution, clear boundaries
- **Negative:** Higher latency (multiple agent calls), orchestration complexity, cost (multiple LLM calls per query)

---

## ADR-008: Citation Engine as Trust Gatekeeper

**Status:** Accepted

### Context

VEDA's north star is trustworthiness. AI-generated content about religious scriptures carries high risk of hallucination and misattribution. Users (scholars, practitioners, researchers) need verifiable references.

### Decision

Implement a **Citation Engine** as the mandatory final gate before any response reaches users.

**Confidence Formula:**
```
Final = (Source Quality × 0.40) + (Retrieval Score × 0.20) + (Graph Agreement × 0.15) + (Agent Agreement × 0.15) + (Citation Strength × 0.10)
```

**Source Quality Scores:**
| Source | Score |
|---|---|
| Canonical Scripture | 1.00 |
| Traditional Commentary | 0.90 |
| Scholarly Source | 0.80 |
| User Upload | 0.50 |
| AI Generated Note | 0.20 |

**Evidence Levels:**
| Level | Type | Score | Action |
|---|---|---|---|
| A | Direct Evidence | 1.0 | Approve |
| B | Strong Evidence | 0.8–0.99 | Approve |
| C | Indirect Evidence | 0.6–0.79 | Approve with caveat |
| D | Weak Evidence | 0.4–0.59 | Flag uncertainty |
| E | Unsupported | 0.0–0.39 | **Reject** |

**Hallucination triggers (auto-block):** Reference not found, verse does not exist, source missing, citation mismatch, invented commentary, invalid Sanskrit.

### Consequences

- **Positive:** Industry-leading trust, academic-grade citations, hallucination prevention
- **Negative:** Some valid inferences may be blocked, higher latency

---

## ADR-009: Canonical/User Data Separation

**Status:** Accepted

### Context

Mixing user-uploaded content with canonical scriptures would compromise the integrity of the knowledge graph and erode trust.

### Decision

**Canonical Database** (read-only) contains: Scriptures, Commentaries, Verified Sources.

**User Database** (read-write) contains: User Uploads, Notes, Collections.

**Rule:** Never merge canonical and user content. Only link through references.

User uploads can **reference** canonical nodes but can never **modify** them. Uploads cannot override canonical scripture in search ranking or citation priority.

### Consequences

- **Positive:** Absolute integrity of canonical sources, clear trust boundary
- **Negative:** More complex queries when combining canonical + user results

---

## ADR-010: Next.js 15 + Tailwind v4 + shadcn/ui Frontend

**Status:** Accepted

### Context

The frontend must support: server-side rendering (SEO for scriptures), interactive knowledge graph (React Flow), real-time chat (WebSockets), offline-capable mobile (React Native), and a design system inspired by ancient manuscripts with modern aesthetics.

### Decision

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| UI Library | React 19 |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui |
| State (client) | Zustand |
| Server State | TanStack Query |
| Forms | React Hook Form + Zod |
| Graph Viz | React Flow + D3 |
| Animation | Framer Motion |
| Icons | Lucide |
| Auth | Auth.js (HTTP-only cookies) |
| Mobile | React Native + Expo |

**Design System:** Saffron (#C97A24) primary, Deep Indigo (#243B63) secondary, neutral background (#F8F5EF). Fonts: Inter (English), Noto Sans Devanagari (Sanskrit), Cormorant Garamond (scripture titles). 70/20/10 color ratio.

### Consequences

- **Positive:** Server Components for SEO, modern DX, strong type safety, beautiful design
- **Negative:** Large frontend dependency surface, shadcn/ui requires customization for domain-specific components

---

## ADR-011: Event-Driven Architecture with Kafka

**Status:** Accepted

### Context

Nine backend services must communicate without tight coupling. The ingestion pipeline, in particular, has a multi-step async workflow (upload → OCR → chunk → embed → graph link → index).

### Decision

Use **Apache Kafka** (Redpanda as alternative, Redis Streams for development) as the event bus.

**Topics:** `veda.documents`, `veda.graph`, `veda.search`, `veda.agents`, `veda.research`, `veda.users`

**Rules:**
1. Events are immutable
2. Consumers must be idempotent
3. Every event has a version and correlation_id
4. Failed events go to DLQ (`*.dlq`)
5. No shared databases between services
6. Retry policy: 3 attempts with exponential backoff (1s, 5s, 30s)

### Consequences

- **Positive:** Loose coupling, async processing, clear event contracts, replay capability
- **Negative:** Kafka operational complexity, eventual consistency challenges

---

## ADR-012: Hybrid Search with Fusion Ranking

**Status:** Accepted

### Context

No single search method covers all access patterns. Users search by meaning ("liberation"), exact reference ("BG 2.47"), and relationships ("concepts related to Atman").

### Decision

**Hybrid search combining four signals:**

```
Final Score = (Semantic × 0.40) + (Keyword × 0.25) + (Graph × 0.20) + (Citation × 0.15)
```

**Re-ranking:** Cross-encoder (bge-reranker-large) applied to top candidates.

**SLOs:**
| Mode | Target Latency |
|---|---|
| Quick Search | < 500ms |
| Scholar Search | < 2s |
| Research Search | < 5s |

### Consequences

- **Positive:** Best results for all query types, meaning-aware + exact-match + graph-aware
- **Negative:** Higher latency than single-mode search, fusion weight tuning needed

---

## ADR-013: AWS-Primary Infrastructure on EKS

**Status:** Accepted

### Context

Production deployment requires managed databases, container orchestration, CDN, WAF, and multi-AZ availability.

### Decision

- **Cloud:** AWS primary (GCP alternative)
- **Compute:** EKS (Kubernetes) with node pools: web, api, agents, search, system
- **Databases:** RDS (PostgreSQL Multi-AZ), Neo4j 3-node cluster, Qdrant 3-node cluster, OpenSearch (managed), ElastiCache Redis (HA)
- **Storage:** S3 (uploads, exports, archives, backups)
- **Networking:** Private subnets for databases; public subnets for ALB + NAT
- **Security:** AWS WAF, AWS Shield, TLS 1.3, AES-256 at rest, Secrets Manager
- **CDN:** CloudFront
- **IaC:** Terraform
- **Observability:** OpenTelemetry + Prometheus + Grafana + CloudWatch
- **Autoscaling:** CPU 70%, Memory 75%

### Consequences

- **Positive:** Enterprise-grade reliability, managed services reduce ops burden
- **Negative:** AWS cost, vendor considerations, complexity of multi-database Kubernetes deployment

---

## ADR-014: ULID-Based Global ID Strategy

**Status:** Accepted

### Context

Objects span four databases (PostgreSQL, Neo4j, Qdrant, Elasticsearch). IDs must be sortable, globally unique, and semantically meaningful.

### Decision

All entities use **ULID** with **type prefixes:**

```
usr_ = User         scp_ = Scripture    bok_ = Book
chp_ = Chapter      vrs_ = Verse        cpt_ = Concept
prs_ = Person       dei_ = Deity        evt_ = Event
plc_ = Place        com_ = Commentary   upl_ = Upload
nts_ = Note         rpt_ = Report       col_ = Collection
```

### Consequences

- **Positive:** Sortable, distributed-safe, semantically clear at a glance, cross-database traceable
- **Negative:** Slightly longer than UUID, requires prefix parsing in generic code

---

## ADR-015: Dependency-Ordered Build Sequence

**Status:** Accepted

### Context

IMPLEMENTATION_PLAN.md defines strict constitutional rules: "Never build intelligence before knowledge. Never build reasoning before citations. Never build agents before retrieval. Never build UI before APIs."

### Decision

Build in strict dependency order across 5 stages and 21 phases (see full details in ADR.md main body above).

### Consequences

- **Positive:** Correct dependency order prevents rework, ensures trust-first architecture
- **Negative:** Slower time-to-visible-product (UI arrives at Phase 13, Week 23)

---

## ADR-016: Supabase for Authentication, PostgreSQL, and Storage

**Status:** Accepted

### Context

Original plan specified separate JWT/OAuth auth (Phase 17), raw PostgreSQL, and S3 for storage. For a solo developer, managing three separate systems is excessive overhead.

### Decision

Use **Supabase** as a unified platform providing:
- **Auth:** JWT, OAuth (Google, GitHub), email/password, magic links
- **PostgreSQL:** Managed database with row-level security
- **Storage:** S3-compatible object storage for uploads
- **Realtime:** WebSocket subscriptions (bonus for live features)

Auth moves from Phase 17 to **Phase 0** — available from day one.

### Alternatives Considered

| Option | Pros | Cons |
|---|---|---|
| **Auth.js + Raw PostgreSQL + S3** | Maximum control | Three systems to manage, solo overhead |
| **Firebase** | Fast setup | Not PostgreSQL, vendor lock-in, no SQL |
| **Clerk** | Great auth DX | Auth-only, still need separate DB + storage |

### Consequences

- **Positive:** Single dashboard for auth + DB + storage, instant auth from Phase 0, RLS for security
- **Negative:** Supabase dependency, some features locked behind paid tier at scale

---

## ADR-017: OpenRouter for LLM Abstraction

**Status:** Accepted

### Context

The platform needs GPT-5.5 as primary LLM with Claude as fallback. Direct OpenAI SDK calls would create vendor lock-in and prevent easy model switching.

### Decision

Use **OpenRouter** as the LLM gateway. GPT-5.5 is the primary model; Claude is the fallback. The OpenAI SDK is used with OpenRouter's base URL for compatibility.

```python
# Configuration
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
LLM_PRIMARY_MODEL = "openai/gpt-5.5"
LLM_FALLBACK_MODEL = "anthropic/claude-sonnet-4"
```

### Consequences

- **Positive:** Model-agnostic, easy A/B testing, single API key, fallback routing
- **Negative:** Additional latency (~50ms), OpenRouter as intermediary dependency

---

## ADR-018: Self-Hosted Docker for MVP

**Status:** Accepted

### Context

Managed Neo4j, Qdrant, and Kafka have significant costs ($500+/month minimum). As a solo developer with budget constraints, managed services are premature.

### Decision

All databases and infrastructure run as **Docker containers** for MVP:
- PostgreSQL 16 (via docker-compose, Supabase for production)
- Neo4j 5 Community Edition
- Qdrant (latest)
- OpenSearch 2
- Redis 7

Production migration to managed services deferred to Phase 20 (Production Readiness).

### Consequences

- **Positive:** Zero infrastructure cost, full local development, fast iteration
- **Negative:** No HA, no backups (manual), limited to single-machine performance

---

## Audit Findings — Gaps & Recommendations

### 🔴 Critical Gaps

| # | Gap | Impact | Recommendation |
|---|---|---|---|
| 1 | **No source code exists** | Cannot validate any architectural decision against reality | Begin Phase 0 immediately: monorepo scaffold |
| 2 | **No API versioning strategy** | API_SPEC.md defines endpoints but lacks versioning rules | Add `/api/v1/` prefix standard to API_SPEC.md |
| 3 | **No data migration strategy** | DATA_MODEL.md defines schemas but no migration tooling | Adopt Prisma (PostgreSQL) + Neo4j Migrations |
| 4 | **No error handling contract** | No standardized error response format across services | Define error envelope: `{error, code, message, correlation_id}` |
| 5 | **No caching strategy** | Redis mentioned but no caching patterns defined | Document cache-aside patterns for search, graph, scripture reads |

### 🟡 Important Gaps

| # | Gap | Impact | Recommendation |
|---|---|---|---|
| 6 | **INFRASTRUCTURE_ARCHITECTURE.md says OpenSearch** but SYSTEM_ARCHITECTURE.md says **Elasticsearch** | Ambiguity in search technology choice | Align on OpenSearch (AWS-managed Elasticsearch fork) |
| 7 | **Frontend says Tailwind v4** but system arch says **Tailwind** generically | Minor version ambiguity | Confirm Tailwind v4 as canonical in all docs |
| 8 | **Auth is Phase 17 (Week 34)** but API Gateway needs auth for rate limiting | Auth needed much earlier | Move basic JWT auth to Phase 1 or Phase 2 |
| 9 | **No testing strategy document** | QUALITY_STANDARDS.md is lightweight | Create TESTING_STRATEGY.md: unit/integration/e2e/load |
| 10 | **No CI/CD pipeline specification** | DEV_ENV.md mentions CI but no GitHub Actions/workflows defined | Create CI_CD.md with pipeline stages |

### 🟢 Strengths

| # | Strength | Impact |
|---|---|---|
| 1 | **Constitutional Rules** are consistent across all 79 files | Architectural integrity maintained |
| 2 | **Citation-first philosophy** is deeply embedded | Trust is baked in, not bolted on |
| 3 | **Canonical separation** is clearly defined everywhere | Data integrity guaranteed by design |
| 4 | **Confidence scoring** is mathematically defined | Reproducible, auditable trust scores |
| 5 | **Event-driven architecture** is well-specified | Services can evolve independently |
| 6 | **Ontology coverage** is comprehensive (12 ontology documents) | Rich domain modeling from day one |
| 7 | **Design system** has clear color, typography, and component specs | Consistent UI from first pixel |
| 8 | **Multi-agent spec** includes tool permissions and context budgets | Security-conscious AI architecture |

### 📋 Recommended Immediate Actions (Phase 0)

1. **Scaffold monorepo** — `turbo.json`, `pnpm-workspace.yaml`, `package.json`
2. **Create `apps/web`** — Next.js 15 with TypeScript, Tailwind v4, shadcn/ui
3. **Create `services/api`** — FastAPI gateway with health check
4. **Create `packages/types`** — Shared TypeScript types from DATA_MODEL.md
5. **Create `packages/design-tokens`** — Export color, typography, spacing tokens
6. **Create `infrastructure/docker`** — docker-compose for PostgreSQL, Neo4j, Qdrant, Redis
7. **Create CI/CD** — GitHub Actions for lint, test, build
8. **Create `.env.example`** — All required environment variables
9. **Move all 79 markdown files** into `docs/` directory per MONOREPO_ARCHITECTURE.md
10. **Create TESTING_STRATEGY.md** and **CI_CD.md**

---

## References

| Document | Purpose |
|---|---|
| [IMPLEMENTATION_PLAN.md](file:///d:/My%20%20Projects/VEDA/Veda/IMPLEMENTATION_PLAN.md) | Build order and phase definitions |
| [ROADMAP.md](file:///d:/My%20%20Projects/VEDA/Veda/ROADMAP.md) | 5-year product evolution |
| [SYSTEM_ARCHITECTURE.md](file:///d:/My%20%20Projects/VEDA/Veda/SYSTEM_ARCHITECTURE.md) | 7-layer system architecture |
| [MONOREPO_ARCHITECTURE.md](file:///d:/My%20%20Projects/VEDA/Veda/MONOREPO_ARCHITECTURE.md) | Repository structure |
| [DATA_MODEL.md](file:///d:/My%20%20Projects/VEDA/Veda/DATA_MODEL.md) | Database schemas and ID strategy |
| [KNOWLEDGE_GRAPH.md](file:///d:/My%20%20Projects/VEDA/Veda/KNOWLEDGE_GRAPH.md) | Neo4j node types and relationships |
| [RLM_ARCHITECTURE.md](file:///d:/My%20%20Projects/VEDA/Veda/RLM_ARCHITECTURE.md) | Intelligence pipeline |
| [AGENT.md](file:///d:/My%20%20Projects/VEDA/Veda/AGENT.md) | Multi-agent specification |
| [CITATION_ENGINE.md](file:///d:/My%20%20Projects/VEDA/Veda/CITATION_ENGINE.md) | Trust and citation system |
| [SEARCH_ARCHITECTURE.md](file:///d:/My%20%20Projects/VEDA/Veda/SEARCH_ARCHITECTURE.md) | Hybrid search pipeline |
| [EVENT_ARCHITECTURE.md](file:///d:/My%20%20Projects/VEDA/Veda/EVENT_ARCHITECTURE.md) | Event-driven communication |
| [FRONTEND_ARCHITECTURE.md](file:///d:/My%20%20Projects/VEDA/Veda/FRONTEND_ARCHITECTURE.md) | Frontend technology and patterns |
| [DESIGN_SYSTEM.md](file:///d:/My%20%20Projects/VEDA/Veda/DESIGN_SYSTEM.md) | Visual design specifications |
| [INFRASTRUCTURE_ARCHITECTURE.md](file:///d:/My%20%20Projects/VEDA/Veda/INFRASTRUCTURE_ARCHITECTURE.md) | Cloud infrastructure |
| [SECURITY_ARCHITECTURE.md](file:///d:/My%20%20Projects/VEDA/Veda/SECURITY_ARCHITECTURE.md) | Security layers |
| [PRODUCT_VISION.md](file:///d:/My%20%20Projects/VEDA/Veda/PRODUCT_VISION.md) | Product thesis and vision |

---

## Approval

| Role | Name | Date |
|---|---|---|
| Engineering Lead | — | — |
| Platform Lead | — | — |
| Product Lead | — | — |
| AI Lead | — | — |
