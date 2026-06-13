# VEDA — Knowledge Operating System for Sanatan Dharma

> The world's most trusted AI-powered knowledge platform for Sanatan Dharma.

VEDA is not a chatbot. VEDA is a research platform combining:

- 📖 **Vedas** · **Upanishads** · **Bhagavad Gita** · **Puranas** · **Ramayana** · **Mahabharata**
- 🕸️ **Knowledge Graph** — 10+ node types, 12+ relationship types
- 🔍 **Hybrid Search** — Semantic + Keyword + Graph + Citation
- 📝 **Citation Engine** — Every answer traced to its source
- 🤖 **Multi-Agent AI** — 9 specialized agents with orchestrator
- 🔬 **Research Mode** — Comparative analysis with evidence reports
- 📤 **Upload Intelligence** — PDF/EPUB auto-linking to knowledge graph
- 🧘 **Sanskrit Companion** — Transliteration, grammar, root analysis

## Architecture

```
Knowledge Graph First → Retrieval Second → Citation Third → LLM Last
```

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15, React 19, TypeScript, Tailwind CSS |
| **Backend** | FastAPI (Python) |
| **Auth** | Supabase |
| **Knowledge Graph** | Neo4j |
| **Vector Search** | Qdrant |
| **Full-Text Search** | OpenSearch |
| **Cache** | Redis |
| **LLM** | GPT-5.5 via OpenRouter |
| **Embeddings** | OpenAI text-embedding-3-large (3072-dim) |
| **Events** | Apache Kafka (Redis Streams for dev) |
| **Infrastructure** | Docker, Kubernetes (EKS), Terraform |

## Repository Structure

```
veda/
├── apps/
│   └── web/              # Next.js 15 — Main VEDA application
├── services/
│   └── api/              # FastAPI — API Gateway
├── packages/
│   ├── types/            # Shared TypeScript types
│   └── design-tokens/    # Design system tokens
├── docs/                 # Architecture & specifications
├── infrastructure/       # Terraform, K8s, Docker
├── docker-compose.yml    # Local development databases
├── turbo.json            # Turborepo pipeline
└── pnpm-workspace.yaml   # Workspace configuration
```

## Quick Start

```bash
# Install dependencies
pnpm install

# Start databases
docker compose up -d

# Start development
pnpm dev

# API service (separate terminal)
cd services/api
pip install -r requirements.txt
uvicorn main:app --reload
```

## Constitutional Rules

1. Never build intelligence before knowledge
2. Never build reasoning before citations
3. Never build agents before retrieval
4. Never build UI before APIs
5. Never optimize before correctness
6. Never prioritize features over architecture

## Current Phase

**Phase 0 — Repository Foundation** ✅

---

*Explore Knowledge · Understand Context · Follow Sources · Discover Dharma*
