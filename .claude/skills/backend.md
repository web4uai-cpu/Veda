# Skill: Backend Development

## Framework
- **FastAPI** (Python 3.12+)
- **Pydantic v2** for request/response validation
- **OpenRouter** (OpenAI SDK with custom base_url) for LLM calls

## File Structure
```
services/api/
├── main.py              # FastAPI app entry point
├── config.py            # Settings from environment
├── requirements.txt     # Python dependencies
├── Dockerfile           # Container image
├── routers/             # Route modules (Phase 2+)
│   ├── health.py
│   ├── search.py
│   ├── chat.py
│   ├── scriptures.py
│   ├── graph.py
│   ├── upload.py
│   └── research.py
├── services/            # Business logic
│   ├── search_service.py
│   ├── graph_service.py
│   ├── citation_service.py
│   ├── agent_service.py
│   └── ingestion_service.py
├── models/              # Pydantic models
├── db/                  # Database connections
│   ├── postgres.py
│   ├── neo4j.py
│   ├── qdrant.py
│   ├── opensearch.py
│   └── redis.py
└── core/                # Shared utilities
    ├── errors.py
    ├── logging.py
    └── middleware.py
```

## API Conventions

### Versioning
All endpoints under `/api/v1/`

### Error Response
```python
{
    "error": "NotFound",
    "code": "SCRIPTURE_NOT_FOUND",
    "message": "Scripture 'scp_xxx' not found",
    "correlation_id": "req_01HXYZ..."
}
```

### Endpoint Pattern
```python
from fastapi import APIRouter, HTTPException, Depends

router = APIRouter(prefix="/api/v1/scriptures", tags=["scriptures"])

@router.get("/{scripture_id}")
async def get_scripture(scripture_id: str):
    # Always validate ID prefix
    if not scripture_id.startswith("scp_"):
        raise HTTPException(status_code=400, detail="Invalid scripture ID format")
    ...
```

### Correlation IDs
Every request gets a `correlation_id` via middleware. Pass it through ALL service calls, database queries, and event emissions.

## LLM Integration (OpenRouter)

```python
from openai import AsyncOpenAI
from config import settings

llm_client = AsyncOpenAI(
    api_key=settings.openrouter_api_key,
    base_url=settings.openrouter_base_url,
)

# Primary model
response = await llm_client.chat.completions.create(
    model=settings.llm_primary_model,  # "openai/gpt-5.5"
    messages=[...],
)
```

### Fallback Pattern
```python
try:
    response = await llm_client.chat.completions.create(
        model=settings.llm_primary_model, messages=messages
    )
except Exception:
    response = await llm_client.chat.completions.create(
        model=settings.llm_fallback_model, messages=messages  # claude
    )
```

## Database Connection Patterns

### PostgreSQL (via Supabase)
```python
from supabase import create_client
supabase = create_client(settings.supabase_url, settings.supabase_service_key)
```

### Neo4j
```python
from neo4j import AsyncGraphDatabase
driver = AsyncGraphDatabase.driver(
    settings.neo4j_uri, auth=(settings.neo4j_user, settings.neo4j_password)
)
```

### Qdrant
```python
from qdrant_client import AsyncQdrantClient
qdrant = AsyncQdrantClient(url=settings.qdrant_url)
```

## Running
```bash
cd services/api
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
