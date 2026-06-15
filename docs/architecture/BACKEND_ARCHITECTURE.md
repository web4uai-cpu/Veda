# VEDA Backend Architecture Audit

Version: 0.1

Status: Active build map

Last updated: 2026-06-15

---

## Executive Summary

VEDA has moved beyond Phase 0. The repository already contains a FastAPI gateway, PostgreSQL schema, database adapters, Neo4j graph seed data, Qdrant collection bootstrap, and scripture/graph browsing APIs.

The backend is currently between Phase 2 and Phase 3:

```text
DONE:    Foundation, core schema, DB adapters, scripture APIs, graph APIs
PARTIAL: Bhagavad Gita ingestion, graph ontology seed, vector/search bootstrap
MISSING: Hybrid search indexing, citation engine, upload pipeline, RLM, agents
```

The correct place to start is not agents or UI. Start with:

```text
1. Finish canonical corpus ingestion
2. Sync graph nodes to verses
3. Build hybrid search indexes
4. Validate citations
5. Only then build reasoning and agents
```

---

## Current Backend Inventory

### API Gateway

Implemented:

* `services/api/main.py`
* Correlation ID middleware
* Request logging middleware
* Structured VEDA error envelope
* Health endpoint with service probes
* Scripture browsing routes
* Knowledge graph routes
* Evidence search route: `POST /api/v1/search`

### Data Layer

Implemented:

* PostgreSQL async pool via `asyncpg`
* Neo4j async driver
* Redis async client
* Qdrant async client
* OpenSearch async client
* SQL migration runner
* Core schema migration
* Citation/evidence/search audit migration

### Knowledge Layer

Implemented:

* Core scripture tables
* Verse content variants
* Canonical/user data separation
* Neo4j constraints and indexes
* Initial concept/school/person seed script
* Bhagavad Gita ingestion script

### Retrieval Layer

Implemented now:

* Search request/response schemas
* Citation response schema
* Evidence packet schema
* PostgreSQL keyword fallback search
* Exact canonical reference lookup
* Optional graph concept expansion
* OpenSearch index initializer

Still pending:

* Embedding generation
* Qdrant upsert pipeline
* OpenSearch bulk indexing from canonical verses
* Fusion ranking across Qdrant + OpenSearch + Neo4j
* Re-ranking

---

## Critical Issues Found

### 1. Project phase documents disagree

`README.md` says Phase 0. `CLAUDE.md` says Phase 2. `.claude/memory.md` says Phase 1.

Decision:

* Code reality is Phase 2 complete enough to enter Phase 3.
* Treat scripture ingestion and search indexing as the immediate backend priority.

### 2. Search collection names were inconsistent

Different files used names like `scriptures`, `scripture_verses`, and `scripture_chunks`.

Decision:

* Qdrant collections are canonical:
  * `scripture_chunks`
  * `commentary_chunks`
  * `upload_chunks`
  * `research_chunks`
* OpenSearch indexes are canonical:
  * `veda-scriptures`
  * `veda-concepts`
  * `veda-commentaries`
  * `veda-uploads`

### 3. Citation storage was specified but not implemented

The citation engine spec requires persistent citation and audit records, but the schema did not include them.

Decision:

* Add `citations`, `evidence_packets`, `search_queries`, and `citation_audit_logs`.

### 4. Backend has no tests

There are no API tests, service tests, or migration checks.

Decision:

* Add tests before implementing reasoning, agents, or uploads.

### 5. APIs are still mostly raw database access

Routers contain SQL directly. This is acceptable for Phase 2 but should not continue.

Decision:

* New behavior belongs in `services/api/services/*`.
* Routers should become thin HTTP adapters.

---

## Target Backend Service Architecture

```text
services/api/
├── main.py
├── config.py
├── core/
│   ├── errors.py
│   ├── middleware.py
│   ├── logging.py
│   └── ulid.py
├── db/
│   ├── postgres.py
│   ├── neo4j_client.py
│   ├── qdrant_client.py
│   ├── opensearch_client.py
│   └── redis_client.py
├── models/
│   ├── schemas.py
│   ├── search.py
│   ├── citations.py
│   └── uploads.py
├── routers/
│   ├── health.py
│   ├── scriptures.py
│   ├── graph.py
│   ├── search.py
│   ├── citations.py
│   ├── uploads.py
│   ├── research.py
│   └── ask.py
└── services/
    ├── scripture_service.py
    ├── graph_service.py
    ├── search_service.py
    ├── citation_service.py
    ├── ingestion_service.py
    ├── embedding_service.py
    ├── indexing_service.py
    ├── rlm_service.py
    └── agent_service.py
```

---

## Build Order From Here

### Phase 3A: Backend Stabilization

Acceptance:

* `python -m compileall services/api` passes.
* Migrations apply cleanly against local PostgreSQL.
* Health endpoint reports all running services.
* `/api/v1/search` returns evidence packets for ingested verses.

Tasks:

* Add API test framework.
* Move scripture SQL into `scripture_service.py`.
* Persist citation/search audit records.
* Add typed settings validation.

### Phase 3B: Knowledge Graph Sync

Acceptance:

* Bhagavad Gita scripture/book/chapter/verse nodes exist in Neo4j.
* `Verse -[:MENTIONS]-> Concept` exists for core concepts.
* Graph stats match PostgreSQL corpus counts.

Tasks:

* Add PostgreSQL to Neo4j sync script.
* Add concept detection for Gita verses.
* Add graph validation command.

### Phase 4: Canonical Scripture Content

Acceptance:

* Full Bhagavad Gita is ingested.
* Sanskrit, transliteration, translation order is preserved.
* Each verse resolves by canonical reference.
* Each verse can produce a Citation object.

Tasks:

* Harden Bhagavad Gita ingestion.
* Add source attribution normalization.
* Add principal Upanishad registry.

### Phase 5: Indexing Pipeline

Acceptance:

* Every canonical verse is indexed into OpenSearch.
* Every canonical verse has a Qdrant embedding.
* Re-indexing is idempotent.

Tasks:

* Build `embedding_service.py`.
* Build `indexing_service.py`.
* Add `python -m services.index_corpus`.

### Phase 6: Hybrid Search

Acceptance:

* Search combines keyword, vector, graph, and citation scores.
* Canonical sources outrank uploads.
* Search returns evidence packets, not answers.

Tasks:

* Add OpenSearch retrieval.
* Add Qdrant retrieval.
* Add fusion ranking.
* Add latency and quality metrics.

### Phase 7: Citation Engine

Acceptance:

* Invalid references are rejected.
* Every evidence packet has a verifiable citation.
* Confidence and evidence level are visible.
* Citation audit logs are persisted.

Tasks:

* Add citation resolver endpoint.
* Add citation validation endpoint.
* Add claim-to-evidence matcher.

---

## API Surface To Build Before Agents

```text
GET  /api/v1/health
GET  /api/v1/scriptures
GET  /api/v1/scriptures/{id}
GET  /api/v1/scriptures/{id}/chapters
GET  /api/v1/scriptures/{id}/chapters/{chapter}/verses
GET  /api/v1/verses/{reference}
GET  /api/v1/graph/concepts
GET  /api/v1/graph/concepts/{slug}
GET  /api/v1/graph/concepts/{slug}/related
POST /api/v1/search
POST /api/v1/citations/validate
POST /api/v1/indexing/corpus
POST /api/v1/uploads
GET  /api/v1/uploads/{id}
POST /api/v1/uploads/{id}/ingest
POST /api/v1/ask
POST /api/v1/research
```

`/api/v1/ask` and `/api/v1/research` must wait until search and citation gates pass.

---

## Non-Negotiable Backend Rules

1. Search returns evidence, not generated answers.
2. Citation validation runs before reasoning.
3. Canonical scripture is immutable.
4. User uploads can reference canonical nodes but never override them.
5. Every request carries a correlation ID.
6. Every generated answer must be traceable to evidence packets.
7. Agents are stateless consumers of retrieval and citation services.

---

## Immediate Next Commands

```bash
docker compose up -d
cd services/api
python -m services.run_migrations
python -m services.ingest_gita
python -m services.seed_graph
cd ../..
python -m infrastructure.qdrant.init_collections
python -m infrastructure.opensearch.init_indexes
```

Then start the API:

```bash
cd services/api
uvicorn main:app --reload --port 8000
```

First validation request:

```bash
curl -X POST http://localhost:8000/api/v1/search \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"BG 2.47\",\"mode\":\"quick\",\"limit\":3}"
```

---

## Product Direction

To make VEDA world-class, the backend should feel like a scholarly instrument:

* Every answer is sourced.
* Every source is inspectable.
* Every contradiction is preserved.
* Every confidence score is explainable.
* Every user upload is clearly separated from canonical scripture.

The next leap is not more UI. It is trustworthy retrieval.
