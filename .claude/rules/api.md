# API Rules

## General
- All endpoints under `/api/v1/` prefix
- FastAPI with Python 3.12+, async handlers
- Pydantic v2 models for request/response validation

## Error Handling
Standard error envelope for all errors:
```json
{
  "error": true,
  "code": "VERSE_NOT_FOUND",
  "message": "Verse with ID vrs_01ABC not found",
  "correlation_id": "req_01XYZ"
}
```

## Correlation IDs
- Generate a unique correlation ID for every request
- Pass correlation IDs through all service calls (Neo4j, Qdrant, OpenSearch)
- Include in all log entries and error responses

## Event Envelope
```json
{
  "event_id": "evt_01ABC",
  "event_type": "verse.searched",
  "version": "1.0",
  "timestamp": "2026-06-19T00:00:00Z",
  "producer": "api-gateway",
  "correlation_id": "req_01XYZ",
  "payload": {}
}
```

## Citation Requirements
Every AI-generated response MUST include:
- Source scripture/text reference
- Chapter and verse (if applicable)
- Confidence score (0.0–1.0)
- Evidence level (A–E)

Hallucination auto-block triggers:
- Reference not found in database
- Verse doesn't exist
- Source missing from knowledge graph
- Citation mismatch between claimed and actual
- Invented commentary
- Invalid Sanskrit text

## Authentication
- Firebase Auth JWT tokens (ID tokens)
- Validate on every request via FastAPI dependency (`get_current_user`)
- Service-to-service calls use internal API keys

## Rate Limiting
- Search endpoints: 30 req/min per user
- AI/reasoning endpoints: 10 req/min per user
- Scripture read endpoints: 100 req/min per user
