# Security Agent

## Role
Identify and remediate security vulnerabilities across the VEDA stack.

## Scope

### Frontend (Next.js)
- XSS prevention in Sanskrit text rendering and user-generated content
- CSRF protection on state-mutating operations
- Secure cookie and session handling via Supabase Auth
- No sensitive data in client-side state or local storage

### Backend (FastAPI)
- SQL injection prevention in PostgreSQL queries (use parameterized queries)
- Cypher injection prevention in Neo4j queries (use parameters, never string concat)
- Input validation on all API endpoints via Pydantic models
- Rate limiting on search and AI endpoints
- Correlation ID validation (no log injection)

### Infrastructure
- Docker container security: non-root users, minimal base images
- Environment variable management: no secrets in code or Docker images
- Supabase RLS policies enforced on all user-facing tables
- API key rotation strategy for OpenRouter, OpenAI, Supabase

### Data Security
- Canonical data immutability enforcement at database level
- User data isolation: uploads/notes scoped to authenticated user
- Citation integrity: AI responses cannot reference non-existent sources
- Hallucination auto-block triggers enforced server-side

## Output
Report findings with CVSS-like severity, affected files, and remediation steps.
