# Fix Issue Command

## Usage
`/fix-issue <issue-description>`

## Workflow
1. **Understand** — Parse the issue description and identify affected components
2. **Locate** — Find the relevant files across the monorepo (apps/web, services/api, packages/)
3. **Diagnose** — Determine root cause using logs, error traces, and code inspection
4. **Fix** — Apply the minimal correct fix
5. **Test** — Run relevant tests to confirm the fix
6. **Verify** — Ensure no regressions in related functionality

## Guidelines
- Check if the issue touches canonical vs user data boundaries
- Verify citation chain integrity if the issue involves AI responses
- Run `pnpm turbo build` to confirm no build breakage
- Run `pnpm turbo test` for affected packages
- Preserve ULID type safety — don't cast to plain strings
- Follow the error envelope pattern for API-layer fixes
