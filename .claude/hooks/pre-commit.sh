#!/bin/bash
# VEDA Pre-Commit Hook
# Runs before each commit to enforce code quality

set -e

echo "Running VEDA pre-commit checks..."

# 1. TypeScript type checking (frontend)
echo ">> Type checking frontend..."
pnpm turbo typecheck --filter=@veda/web 2>/dev/null || {
  echo "FAIL: TypeScript type errors found. Fix before committing."
  exit 1
}

# 2. Lint check
echo ">> Linting..."
pnpm turbo lint --filter=changed 2>/dev/null || {
  echo "FAIL: Lint errors found. Run 'pnpm turbo lint --fix' to auto-fix."
  exit 1
}

# 3. Python formatting (backend)
if git diff --cached --name-only | grep -q "services/api/"; then
  echo ">> Checking Python formatting..."
  cd services/api
  python -m ruff check . 2>/dev/null || {
    echo "FAIL: Python lint errors. Run 'ruff check --fix .' in services/api/"
    exit 1
  }
  cd ../..
fi

# 4. Check for hardcoded secrets
echo ">> Scanning for secrets..."
if git diff --cached --name-only -z | xargs -0 grep -lE "(sk-[a-zA-Z0-9]{20,}|password\s*=\s*['\"][^'\"]+['\"]|SUPABASE_SERVICE_ROLE_KEY\s*=)" 2>/dev/null; then
  echo "FAIL: Possible hardcoded secrets detected. Use environment variables."
  exit 1
fi

echo "All pre-commit checks passed."
