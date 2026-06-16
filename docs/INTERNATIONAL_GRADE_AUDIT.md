# VEDA International-Grade Audit

Last updated: 2026-06-15

Status: Build passing, product foundation in progress

---

## Current Verdict

VEDA has a strong foundation and a serious product thesis. The repo now passes typecheck, lint, and production build. The app has an immersive frontend, a FastAPI backend, canonical scripture schema, graph APIs, and an evidence-first search/citation foundation.

It is not yet an international-grade knowledge product because the best-looking surfaces are ahead of the live data workflows. The next leap is to connect the experience to verified corpus, search, citations, and audit trails.

---

## Verified Quality Gates

Passing:

```bash
pnpm typecheck
pnpm lint
pnpm build
python -m compileall services\api infrastructure
```

Fixed during this audit:

* Monorepo `typecheck` no longer fails on the API package.
* Monorepo `lint` is no longer interactive or Windows-fragile.
* Three.js components compile under strict TypeScript.
* Web API client includes the backend search contract.
* `/scriptures/[slug]`, `/scriptures/[slug]/chapters/[chapterNumber]`, and `/concepts/[slug]` now exist instead of 404ing from visible links.

---

## What Is Strong

### Product Direction

* Clear identity: evidence-based Knowledge Operating System for Sanatan Dharma.
* Strong constitutional rules: knowledge before reasoning, citations before answers.
* Good separation of canonical scripture vs user uploads.

### Backend Foundation

* FastAPI gateway is structured cleanly.
* PostgreSQL, Neo4j, Qdrant, OpenSearch, Redis adapters exist.
* Citation/evidence schema exists.
* Search API returns evidence packets, not unsupported generated answers.
* Migration runner path and SQL splitting are corrected.

### Frontend Foundation

* Next.js app builds successfully.
* Immersive 3D/animation layer gives the product a memorable identity.
* Scripture and concept detail routes now exist.
* Chapter reader preserves Sanskrit, transliteration, translation order.

---

## Critical Gaps

### P0: Live Data Workflows

The UI still contains several static/demo surfaces. International-grade means users can complete real workflows:

* Home search should submit to `/api/v1/search`.
* Explore search should use graph/search endpoints.
* Ask VEDA should wait behind citation-backed retrieval or show "evidence search" mode.
* Research mode should not imply agent reasoning until RLM/agents exist.

### P0: Corpus and Indexing

The backend cannot become trusted until corpus ingestion is repeatable:

* Full Bhagavad Gita ingestion must be verified.
* PostgreSQL verses must sync to Neo4j.
* OpenSearch must index canonical verses.
* Qdrant must store embeddings for canonical chunks.

### P0: Testing

There is no real test suite yet.

Required next:

* API tests for health, scripture lookup, verse lookup, search.
* Migration tests against local PostgreSQL.
* Frontend smoke tests for primary routes.
* Playwright screenshot checks for 3D pages.

### P1: Authentication and User Data

Supabase client exists, but auth workflows are not wired into the app:

* Sign in/sign out.
* User profile.
* Notes/bookmarks/collections.
* Upload ownership and RLS validation.

### P1: Observability

Correlation IDs exist, but international-grade operations need:

* Structured JSON logs.
* Request metrics.
* Search latency metrics.
* Citation rejection/audit dashboards.

### P1: Accessibility and Internationalization

Needed before global release:

* Keyboard navigation for 3D-heavy pages.
* Reduced-motion mode for animations/splash.
* Proper icon buttons with accessible labels.
* Sanskrit font loading strategy.
* Language framework for English, Hindi, Sanskrit transliteration.

---

## Recommended Build Order

### 1. Evidence Search Experience

Wire Home and Explore search to `api.search`.

Acceptance:

* User searches "BG 2.47".
* App shows evidence packets.
* Each result shows citation, source, confidence, and evidence level.

### 2. Corpus Verification

Create a single command that verifies:

* Scripture count.
* Chapter count.
* Verse count.
* Verse content count.
* Missing Sanskrit/transliteration/translation rows.

Acceptance:

* Bhagavad Gita has 18 chapters and 700 verses.
* Every verse has at least Sanskrit and one translation.

### 3. Indexing Pipeline

Add `services/api/services/index_corpus.py`.

Acceptance:

* Re-runnable indexing into `veda-scriptures`.
* Re-runnable embedding upsert into `scripture_chunks`.
* Search uses OpenSearch and Qdrant before PostgreSQL fallback.

### 4. Citation Validation API

Add:

```text
POST /api/v1/citations/resolve
POST /api/v1/citations/validate
```

Acceptance:

* Invalid references are rejected.
* Valid references return traceable citation objects.
* Decisions are persisted to `citation_audit_logs`.

### 5. Ask VEDA, But Evidence-Only First

Do not build LLM answers yet. Build an "Ask VEDA: Evidence" mode first.

Acceptance:

* Question returns evidence grouped by scripture/concept.
* UI clearly says answer generation is locked until citations pass.

---

## Release Bar

VEDA is ready for a serious private alpha when:

* Build/typecheck/lint pass in CI.
* Local setup works from README commands.
* Bhagavad Gita is fully ingested and searchable.
* Every visible link resolves.
* Every search result has a citation.
* No AI answer appears without citation-backed evidence.
* Core pages meet keyboard and reduced-motion requirements.

The product should feel beautiful, but trust must be the signature feature.
