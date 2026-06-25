# Frontend Rules

## Framework
- Next.js 15 with App Router — no Pages Router patterns
- React 19 — use server components by default, `"use client"` only when needed
- TypeScript 5.8+ strict mode — no `any`, no `@ts-ignore`
- Turbopack for dev (`next dev --turbopack`)

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
│   ├── firebase.ts         # Firebase client (Auth, Storage, Analytics)
│   ├── api.ts              # FastAPI client
│   └── utils.ts            # Helpers
├── hooks/                  # Custom React hooks
└── stores/                 # Zustand stores
```

## Design System
- Primary: Saffron `#C97A24` — actions, highlights, brand
- Secondary: Deep Indigo `#243B63` — knowledge, headers, navigation
- Background: `#F8F5EF` (light), `#111827` (dark)
- Color ratio: 70% neutral, 20% indigo, 10% saffron
- Fonts: Inter (UI), Noto Sans Devanagari (Sanskrit), Cormorant Garamond (scripture titles)
- Radii: sm=8px, md=12px, lg=16px, card=20px
- Shadows: subtle only — no dramatic elevation

## Sanskrit Rendering
Always render in this order:
1. Devanagari script (`.sanskrit` class)
2. IAST transliteration
3. English translation

Never combine into a single line.

## Component Patterns

### Knowledge Card
```tsx
<div className="knowledge-card">
  <h3>{title}</h3>
  <p>{summary}</p>
  <CitationBadge source={source} confidence={confidence} />
  <ConceptPills concepts={related} />
</div>
```

### Verse Card
```tsx
<div className="verse-block">
  <p className="verse-sanskrit">{sanskrit}</p>
  <p className="verse-transliteration">{transliteration}</p>
  <p className="verse-translation">{translation}</p>
</div>
```

## State Management
- Server state: TanStack Query v5
- Client state: Zustand v5
- No prop drilling beyond 2 levels — use context or stores

```typescript
// Server state
const { data } = useQuery({
  queryKey: ['scriptures', id],
  queryFn: () => api.getScripture(id),
});

// Client state
const useThemeStore = create<ThemeStore>((set) => ({
  theme: 'light',
  toggleTheme: () => set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),
}));
```

## Styling
- Tailwind CSS 3.4+ — no inline styles, no CSS modules
- Use `@veda/design-tokens` for colors, spacing, fonts
- CSS classes: `.sanskrit`, `.scripture-title`, `.knowledge-card`, `.verse-block`

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

## Performance
- Images: next/image with proper sizing
- Fonts: next/font with subset loading
- Lazy load below-fold components
- No client-side data fetching for initial page loads — use server components

## Build Commands
```bash
pnpm --filter @veda/web dev        # Start dev server
pnpm --filter @veda/web build      # Production build
pnpm --filter @veda/web lint       # Lint
pnpm --filter @veda/web typecheck  # Type check
```
