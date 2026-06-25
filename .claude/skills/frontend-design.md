# Frontend Design Skill

## Philosophy
VEDA should feel like: **a living library of knowledge.**
NOT an AI chatbot, NOT a social network, NOT a productivity app.
The user should feel: Curiosity, Calmness, Trust, Discovery, Intellectual depth.

## Visual Language
- **Warmth over coldness** — Saffron accents bring life to scholarly content
- **Depth without drama** — Subtle shadows, layered cards, no harsh edges
- **Respect for text** — Sanskrit content gets visual priority and proper spacing
- **Quiet navigation** — Indigo-dominant nav that doesn't compete with content

## Color Palette

### Light Mode
| Token | Hex | Usage |
|---|---|---|
| `--veda-primary` | `#C97A24` | Saffron — actions, highlights, CTAs |
| `--veda-secondary` | `#243B63` | Deep Indigo — knowledge elements, headers |
| `--veda-bg` | `#F8F5EF` | Warm neutral background |
| `--veda-surface` | `#FFFFFF` | Cards, panels |
| `--veda-text` | `#1F2937` | Primary text |
| `--veda-text-secondary` | `#6B7280` | Secondary text |
| `--veda-border` | `#E5E0D5` | Borders |
| `--veda-success` | `#0F8A5F` | Verified, high confidence |
| `--veda-warning` | `#D97706` | Caution, medium confidence |
| `--veda-error` | `#B91C1C` | Error, rejected |

### Dark Mode
| Token | Hex |
|---|---|
| `--veda-bg` | `#111827` |
| `--veda-surface` | `#1F2937` |
| `--veda-text` | `#F9FAFB` |
| `--veda-primary` | `#D28D3A` |

### Color Ratio
**70% Neutral · 20% Indigo · 10% Saffron** — never overuse saffron.

## Typography

| Font | Usage | CSS Class |
|---|---|---|
| **Inter** | All UI text, body copy | (default) |
| **Noto Sans Devanagari** | Sanskrit text | `.sanskrit` |
| **Cormorant Garamond** | Scripture titles, display headings | `.scripture-title` |
| **JetBrains Mono** | Code, verse references | `font-mono` |

### Type Scale
| Name | Size | Usage |
|---|---|---|
| Display | 48px | Hero headings |
| H1 | 36px | Page titles |
| H2 | 30px | Section headers |
| H3 | 24px | Card titles |
| Body | 16px | Default text |
| Caption | 14px | Labels, metadata |
| Footnote | 12px | Fine print |

## Spacing System (4px base)
`4 · 8 · 12 · 16 · 24 · 32 · 48 · 64` — ONLY use scale values.

## Component Patterns

### Knowledge Card
```
rounded-[20px] | bg-white dark:bg-gray-900 | shadow-sm
padding: 24px | border: 1px solid rgba(36,59,99,0.08)
```
States: Default, Expanded, Saved, Referenced

### Verse Block
```
bg-[#F8F5EF] dark:bg-gray-800 | rounded-[16px] | p-6
Sanskrit: Noto Sans Devanagari, text-lg, text-[#243B63]
IAST: Inter italic, text-sm, text-gray-600
English: Inter, text-base, text-gray-800
```

### Action Buttons
```
Primary: bg-[#C97A24] text-white rounded-[12px]
Secondary: border-[#243B63] text-[#243B63] rounded-[12px]
Ghost: text-[#243B63] hover:bg-[#243B63]/5
Danger: bg-[#B91C1C] text-white rounded-[12px]
```

### Citation Badge
```html
<span class="confidence-high">A · 0.95</span>   <!-- Green -->
<span class="confidence-medium">C · 0.72</span>  <!-- Amber -->
<span class="confidence-low">E · 0.31</span>     <!-- Red -->
```

### Navigation
```
Sidebar: bg-[#243B63] text-white
Active item: bg-white/10 border-l-2 border-[#C97A24]
```

## Shadows
**Subtle ONLY.** No dramatic elevation.
- sm: `0 1px 2px rgba(0,0,0,0.05)`
- md: `0 2px 8px rgba(0,0,0,0.08)`
- card: `0 2px 12px rgba(0,0,0,0.06)`

## Corner Radius
sm=8px, md=12px, lg=16px, **card=20px**

## Icons
**Lucide Icons** for standard UI. Custom icons needed for: Scripture, Verse, Knowledge, Research, Graph, Commentary.

## Layout
- Desktop: 12-column grid, 280px sidebar, max content width 1400px
- Tablet: 8-column grid
- Mobile: 4-column grid, bottom navigation (56px)
- Header height: 64px

## Animation Guidelines
- Page transitions: subtle fade (200ms)
- Card hover: slight lift + shadow increase (150ms ease)
- Loading states: gentle pulse, saffron accent
- No flashy animations — maintain scholarly tone

## Graph Visualization
| Node Type | Shape | Color |
|---|---|---|
| Concept | Circle | Saffron |
| Scripture | Rectangle | Indigo |
| Verse | Pill | Light Indigo |
| Commentary | Hexagon | Light Saffron |
| School | Diamond | Neutral |

Node size: based on importance/references/popularity.
