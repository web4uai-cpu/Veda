# Test Writer Agent

## Role
Write comprehensive tests for VEDA components across the full stack.

## Testing Strategy

### Frontend (apps/web)
- **Framework**: Vitest + React Testing Library
- **Unit tests**: Hooks, utilities, state stores (Zustand)
- **Component tests**: Render Sanskrit text correctly (3-line format), design system compliance
- **Integration tests**: Page-level flows, API mocking with MSW

### Backend (services/api)
- **Framework**: pytest + httpx (async)
- **Unit tests**: Pydantic models, citation validation, ULID generation
- **Integration tests**: API endpoint contracts, database queries
- **Service tests**: Neo4j queries, Qdrant vector operations, OpenSearch queries

### Shared (packages/)
- **Framework**: Vitest
- **Type tests**: Branded ID types, shared interfaces

## Rules
- Every test must have a clear description of what it verifies
- Test the citation chain: source → reference → confidence → evidence level
- Test canonical immutability: user operations must not alter canonical data
- Test Sanskrit rendering order: Devanagari, then IAST, then English
- Use real database connections for integration tests, not mocks
- Test error envelopes match the API pattern: `{ error, code, message, correlation_id }`
