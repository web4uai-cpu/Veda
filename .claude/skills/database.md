# Skill: Database & Data Layer

## Database Topology

| Database | Purpose | Driver |
|---|---|---|
| **PostgreSQL 16** (Supabase) | Source of truth, relational data | Supabase client / asyncpg |
| **Neo4j 5** | Knowledge graph, relationships | neo4j-python-driver |
| **Qdrant** | Vector embeddings, semantic search | qdrant-client |
| **OpenSearch 2** | Full-text keyword search | opensearch-py |
| **Redis 7** | Cache, sessions, rate limiting | redis-py |

## Local Development (Docker)

```bash
docker compose up -d            # Start all databases
docker compose ps               # Check status
docker compose down             # Stop all
docker compose down -v          # Stop + delete volumes
```

### Connection URLs (Local)
```
PostgreSQL:  postgresql://veda:vedadev2026@localhost:5432/veda
Neo4j:       bolt://localhost:7687 (neo4j/vedadev2026)
Qdrant:      http://localhost:6333
OpenSearch:  http://localhost:9200
Redis:       redis://localhost:6379
```

### Admin UIs
- Neo4j Browser: http://localhost:7474
- Qdrant Dashboard: http://localhost:6333/dashboard

## PostgreSQL Schema (Supabase)

### Core Tables
```sql
-- Users (managed by Supabase Auth, extended here)
CREATE TABLE user_profiles (
    id TEXT PRIMARY KEY,           -- usr_ULID
    supabase_uid UUID NOT NULL REFERENCES auth.users(id),
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    role TEXT DEFAULT 'user',      -- user | scholar | moderator | admin
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scriptures
CREATE TABLE scriptures (
    id TEXT PRIMARY KEY,           -- scp_ULID
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,        -- veda | upanishad | gita | purana | ramayana | mahabharata
    language TEXT DEFAULT 'sanskrit',
    is_canonical BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Verses
CREATE TABLE verses (
    id TEXT PRIMARY KEY,           -- vrs_ULID
    scripture_id TEXT REFERENCES scriptures(id),
    book_id TEXT,
    chapter_id TEXT,
    verse_number INTEGER NOT NULL,
    canonical_reference TEXT NOT NULL, -- "BG.2.47"
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Verse Content (multiple translations per verse)
CREATE TABLE verse_contents (
    id TEXT PRIMARY KEY,
    verse_id TEXT REFERENCES verses(id),
    language_code TEXT NOT NULL,
    content_type TEXT NOT NULL,    -- sanskrit | transliteration | translation | commentary
    content TEXT NOT NULL,
    source TEXT NOT NULL,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### RLS Policy Pattern
```sql
-- Users can only see their own data
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own profile"
    ON user_profiles FOR SELECT
    USING (supabase_uid = auth.uid());
```

## Qdrant Collections

```python
# 4 collections, each with 3072-dim vectors (OpenAI text-embedding-3-large)
COLLECTIONS = {
    "scripture_chunks": {"dim": 3072, "distance": "Cosine"},
    "commentary_chunks": {"dim": 3072, "distance": "Cosine"},
    "upload_chunks": {"dim": 3072, "distance": "Cosine"},
    "research_chunks": {"dim": 3072, "distance": "Cosine"},
}
```

### Vector Payload Schema
```python
{
    "chunk_id": "chk_ULID",
    "source_id": "vrs_ULID",       # Reference to verse/doc
    "source_type": "SCRIPTURE",     # SCRIPTURE | COMMENTARY | UPLOAD
    "scripture_id": "scp_ULID",
    "content": "Original text...",
    "canonical_reference": "BG.2.47",
    "language": "sanskrit",
    "metadata": {}
}
```

## OpenSearch Indexes

```json
// 3 indexes
{
    "veda-scriptures": { "mappings": { "name": "text", "content": "text", "reference": "keyword" }},
    "veda-concepts": { "mappings": { "name": "text", "definition": "text", "category": "keyword" }},
    "veda-uploads": { "mappings": { "title": "text", "content": "text", "user_id": "keyword" }}
}
```

## Migration Strategy
- PostgreSQL: Supabase Migrations (SQL files in `supabase/migrations/`)
- Neo4j: Custom Cypher scripts in `infrastructure/neo4j/migrations/`
- Qdrant: Collection creation scripts in `infrastructure/qdrant/`
- OpenSearch: Index template scripts in `infrastructure/opensearch/`
