# Skill: Testing Strategy

## Testing Pyramid

```
         ╱ E2E Tests ╲          (Playwright — critical user flows)
        ╱──────────────╲
       ╱ Integration Tests ╲     (API + DB — service boundaries)
      ╱────────────────────╲
     ╱     Unit Tests        ╲   (Vitest — business logic, utils)
    ╱────────────────────────╲
```

## Frontend Tests (apps/web)

### Unit Tests — Vitest
```typescript
// Component test
import { render, screen } from '@testing-library/react';
import { VerseCard } from '@/components/domain/VerseCard';

test('renders verse in correct order: Sanskrit → Transliteration → Translation', () => {
  render(<VerseCard verse={mockVerse} />);
  const elements = screen.getAllByRole('paragraph');
  expect(elements[0]).toHaveClass('verse-sanskrit');
  expect(elements[1]).toHaveClass('verse-transliteration');
  expect(elements[2]).toHaveClass('verse-translation');
});
```

### E2E Tests — Playwright
```typescript
test('home page search redirects to results', async ({ page }) => {
  await page.goto('/');
  await page.fill('#search-home', 'Atman');
  await page.click('#search-submit');
  await expect(page).toHaveURL(/\/search/);
});
```

## Backend Tests (services/api)

### Unit Tests — pytest
```python
import pytest
from httpx import AsyncClient
from main import app

@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
```

### Integration Tests
```python
@pytest.mark.asyncio
async def test_search_returns_citations():
    """Every search result MUST include at least one citation."""
    response = await client.post("/api/v1/search", json={"query": "Atman", "mode": "quick"})
    for result in response.json()["results"]:
        assert "citation" in result
        assert result["citation"]["confidence"] > 0
```

## Critical Test Cases

### Citation Integrity (MUST PASS)
- [ ] Every search result has a citation
- [ ] Every chat response has citations
- [ ] Confidence score is between 0.0 and 1.0
- [ ] Evidence level is A, B, C, D, or E
- [ ] Level E responses are blocked from display

### Sanskrit Rendering (MUST PASS)
- [ ] Sanskrit text uses Devanagari font
- [ ] Transliteration follows IAST standard
- [ ] Three-line display order is never violated

### Data Integrity (MUST PASS)
- [ ] Canonical data cannot be modified via API
- [ ] User uploads are isolated from canonical graph
- [ ] ULID prefixes match entity types

## Commands
```bash
# Frontend tests
pnpm --filter @veda/web test

# Backend tests
cd services/api && pytest

# E2E tests (future)
pnpm --filter @veda/web test:e2e
```
