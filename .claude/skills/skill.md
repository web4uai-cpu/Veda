# VEDA — .claude Directory Index

## Agents
| Agent | File | Purpose |
|-------|------|---------|
| Code Reviewer | [code-reviewer.md](../agents/code-reviewer.md) | Review code for correctness and VEDA conventions |
| Debugger | [debugger.md](../agents/debugger.md) | Diagnose and fix bugs across the stack |
| Test Writer | [test-writer.md](../agents/test-writer.md) | Write comprehensive tests |
| Refactor | [refactor.md](../agents/refactor.md) | Improve code structure without behavior changes |
| Doc Writer | [doc-writer.md](../agents/doc-writer.md) | Write and maintain documentation |
| Security | [security.md](../agents/security.md) | Security vulnerability analysis and remediation |

## Commands
| Command | File | Purpose |
|---------|------|---------|
| /fix-issue | [fix-issue.md](../commands/fix-issue.md) | Diagnose and fix a reported issue |
| /deploy | [deploy.md](../commands/deploy.md) | Deploy to dev/staging/production |
| /pr-review | [pr-review.md](../commands/pr-review.md) | Review a pull request |

## Hooks
| Hook | File | Trigger |
|------|------|---------|
| Pre-Commit | [pre-commit.sh](../hooks/pre-commit.sh) | Before each git commit |
| Lint-on-Save | [lint-on-save.sh](../hooks/lint-on-save.sh) | When files are saved |

## Rules
| Rule | File | Scope |
|------|------|-------|
| Frontend | [frontend.md](../rules/frontend.md) | Next.js, React, Tailwind, design system, file conventions |
| Backend | [backend.md](../rules/backend.md) | FastAPI, Python, LLM integration, file structure |
| Database | [database.md](../rules/database.md) | PostgreSQL, Neo4j, Qdrant, OpenSearch, Redis, schemas |
| API | [api.md](../rules/api.md) | Endpoints, error handling, citations, rate limits |

## Skills
| Skill | File | Domain |
|-------|------|--------|
| Frontend Design | [frontend-design.md](frontend-design.md) | Color palette, typography, components, layout, animations |
| Knowledge Graph | [knowledge-graph.md](knowledge-graph.md) | Neo4j node/relationship schema, Cypher patterns |
| Scripture Data | [scripture-data.md](scripture-data.md) | Data sources, ingestion pipeline, reference formats |
| Testing | [testing.md](testing.md) | Testing pyramid, Vitest, pytest, Playwright, critical test cases |

## Quick Reference
- **Design colors:** Saffron `#C97A24`, Indigo `#243B63`, BG `#F8F5EF`/`#111827`
- **Sanskrit order:** Devanagari → IAST → English (always)
- **ID format:** `{prefix}_{ulid}` with branded TypeScript types
- **API prefix:** `/api/v1/`
- **Embedding dims:** 3072 (text-embedding-3-large)
- **Graph depth:** max 5 traversals
