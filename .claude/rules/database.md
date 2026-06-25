# Database Rules

## Database Topology

| Database | Purpose | Driver |
|---|---|---|
| **PostgreSQL 16** (Railway) | Source of truth, relational data | asyncpg |
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

## PostgreSQL (via Railway)

### Rules
- Use parameterized queries — never string concatenation
- Migrations go in `supabase/migrations/` with sequential numbering
- Canonical tables (scriptures, verses, commentaries) are READ-ONLY at app level
- User tables (uploads, notes, collections) are scoped by `user_id`
- Authorization enforced at API layer via Firebase Auth

### Core Tables
```sql
CREATE TABLE user_profiles (
    id TEXT PRIMARY KEY,           -- usr_ULID
    firebase_uid TEXT NOT NULL UNIQUE,        -- Firebase Auth UID
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    role TEXT DEFAULT 'user',      -- user | scholar | moderator | admin
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE scriptures (
    id TEXT PRIMARY KEY,           -- scp_ULID
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,        -- veda | upanishad | gita | purana | ramayana | mahabharata
    language TEXT DEFAULT 'sanskrit',
    is_canonical BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE verses (
    id TEXT PRIMARY KEY,           -- vrs_ULID
    scripture_id TEXT REFERENCES scriptures(id),
    book_id TEXT,
    chapter_id TEXT,
    verse_number INTEGER NOT NULL,
    canonical_reference TEXT NOT NULL, -- "BG.2.47"
    created_at TIMESTAMPTZ DEFAULT NOW()
);

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

### Authorization
Authorization is enforced at the API layer via Firebase Auth JWT verification.
RLS is enabled on user tables but policies are permissive — the backend filters by `user_id` after token verification.

## Neo4j (Knowledge Graph)

### Rules
- 13 node labels: Scripture, Book, Chapter, Verse, Concept, Person, Deity, Place, Event, Story, Commentary, School, UploadedDocument
- 12 relationships: PART_OF, EXPLAINS, REFERENCES, MENTIONS, RELATED_TO, SUPPORTS, CONTRADICTS, AUTHORED_BY, COMMENTS_ON, LOCATED_IN, TEACHES, WORSHIPS
- Max traversal depth: 5
- Always use parameterized Cypher — never string interpolation
- LLMs consume graph data, never create it

## Qdrant (Vector Search)

### Rules
- Embedding model: OpenAI text-embedding-3-large (3072 dimensions)
- Collection naming: `veda_{entity_type}` (e.g., `veda_verses`, `veda_concepts`)
- Always include metadata payload with source references

### Collections
```python
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
    "source_id": "vrs_ULID",
    "source_type": "SCRIPTURE",     # SCRIPTURE | COMMENTARY | UPLOAD
    "scripture_id": "scp_ULID",
    "content": "Original text...",
    "canonical_reference": "BG.2.47",
    "language": "sanskrit",
    "metadata": {}
}
```

## OpenSearch (Full-Text)

### Rules
- Index naming: `veda-{entity_type}`
- Sanskrit text must be indexed with appropriate analyzers for Devanagari
- Maintain IAST transliteration as a separate searchable field

### Indexes
```json
{
    "veda-scriptures": { "mappings": { "name": "text", "content": "text", "reference": "keyword" }},
    "veda-concepts": { "mappings": { "name": "text", "definition": "text", "category": "keyword" }},
    "veda-uploads": { "mappings": { "title": "text", "content": "text", "user_id": "keyword" }}
}
```

## ID Strategy
- All entities use ULID with type prefixes
- Prefixes: `usr_`, `scp_`, `bok_`, `chp_`, `vrs_`, `cpt_`, `prs_`, `dei_`, `evt_`, `plc_`, `com_`, `upl_`, `nts_`, `rpt_`, `col_`
- Use branded TypeScript types from `@veda/types`

## Redis
- Cache layer only — no persistent data
- Key pattern: `veda:{service}:{entity}:{id}`
- Default TTL: 1 hour for search results, 24 hours for scripture data

## Migration Strategy
- PostgreSQL: SQL migration files in `supabase/migrations/`
- Neo4j: Custom Cypher scripts in `infrastructure/neo4j/migrations/`
- Qdrant: Collection creation scripts in `infrastructure/qdrant/`
- OpenSearch: Index template scripts in `infrastructure/opensearch/`
