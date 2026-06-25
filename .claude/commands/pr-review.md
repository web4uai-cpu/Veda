# PR Review Command

## Usage
`/pr-review [branch-name]`

## Review Process
1. **Diff analysis** — Examine all changed files
2. **Architecture check** — Verify changes respect the layer order (Graph → Retrieval → Citation → Reasoning → Agents → UI)
3. **Type safety** — Branded ULID types used correctly, no `any` casts
4. **Design system** — UI changes follow color ratio, fonts, radii, shadows spec
5. **API contract** — No breaking changes to `/api/v1/` endpoints
6. **Citation integrity** — AI-facing code includes all required citation fields
7. **Security** — No injection vectors, secrets exposure, or auth bypasses
8. **Tests** — New code has corresponding tests

## Severity Levels
- **Critical** — Must fix before merge (security, data corruption, breaking changes)
- **Warning** — Should fix, creates tech debt if ignored
- **Suggestion** — Nice to have, improves quality

## Output
Structured review with file-level comments, severity ratings, and suggested fixes.
