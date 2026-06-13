# Skill: Frontend Development

## Framework
- **Next.js 15** with App Router (NOT Pages Router)
- **React 19** with Server Components by default
- **Turbopack** for dev (`next dev --turbopack`)

## File Conventions
```
apps/web/src/
├── app/                    # App Router pages
│   ├── layout.tsx          # Root layout (sidebar + mobile nav)
│   ├── page.tsx            # Home page
│   ├── globals.css         # Global styles + design tokens
│   ├── ask/page.tsx        # Ask VEDA (chat)
│   ├── explore/page.tsx    # Concept discovery
│   ├── scriptures/page.tsx # Scripture browser
│   ├── graph/page.tsx      # Knowledge Map
│   ├── research/page.tsx   # Research workspace
│   └── library/page.tsx    # User collections
├── components/             # Reusable components
│   ├── ui/                 # shadcn/ui primitives
│   └── domain/             # VEDA-specific (VerseCard, KnowledgeCard, etc.)
├── lib/                    # Utilities
│   ├── supabase.ts         # Supabase client
│   ├── api.ts              # FastAPI client
│   └── utils.ts            # Helpers
├── hooks/                  # Custom React hooks
└── stores/                 # Zustand stores
```

## Component Patterns

### Server Components (default)
Use for pages that fetch data. No `'use client'` directive.

### Client Components
Use only when needed (interactivity, hooks, browser APIs). Always add `'use client'` at the top.

### Knowledge Card (flagship component)
```tsx
// Structure: Title → Summary → Source → Related Concepts → Action
<div className="knowledge-card">
  <h3>{title}</h3>
  <p>{summary}</p>
  <CitationBadge source={source} confidence={confidence} />
  <ConceptPills concepts={related} />
</div>
```

### Verse Card
```tsx
// ALWAYS render in this order: Sanskrit → Transliteration → Translation
<div className="verse-block">
  <p className="verse-sanskrit">{sanskrit}</p>
  <p className="verse-transliteration">{transliteration}</p>
  <p className="verse-translation">{translation}</p>
</div>
```

## State Management

### Server State → TanStack Query
```typescript
const { data } = useQuery({
  queryKey: ['scriptures', id],
  queryFn: () => api.getScripture(id),
});
```

### Client State → Zustand
```typescript
const useThemeStore = create<ThemeStore>((set) => ({
  theme: 'light',
  toggleTheme: () => set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),
}));
```

## Routing
- Dynamic routes: `[slug]/page.tsx`
- Loading states: `loading.tsx`
- Error boundaries: `error.tsx`
- All pages get unique SEO metadata via `export const metadata`

## Import Aliases
```typescript
import { Thing } from '@/components/Thing';   // Local
import type { Verse } from '@veda/types';     // Shared types
import { colors } from '@veda/design-tokens'; // Design tokens
```

## Build Commands
```bash
pnpm --filter @veda/web dev      # Start dev server
pnpm --filter @veda/web build    # Production build
pnpm --filter @veda/web lint     # Lint
pnpm --filter @veda/web typecheck # Type check
```
