// =============================================================================
// VEDA Design Tokens
// =============================================================================
// Derived from DESIGN_SYSTEM.md — The visual identity of VEDA
// Brand: Wise, Timeless, Elegant, Scholarly, Accessible, Trustworthy, Modern
// Inspiration: Ancient manuscripts, palm leaf texts, temple geometry
// =============================================================================

// ---------------------------------------------------------------------------
// Colors — Light Mode
// ---------------------------------------------------------------------------
export const colors = {
  // Primary: VEDA Saffron — Actions, Highlights, Brand
  saffron: {
    50: '#FFF8F0',
    100: '#FFECD4',
    200: '#FFD6A5',
    300: '#FFBC6B',
    400: '#E8A23C',
    500: '#C97A24', // Primary
    600: '#A8621A',
    700: '#874D14',
    800: '#6B3D10',
    900: '#4A2A0C',
  },

  // Secondary: Deep Indigo — Knowledge, Headers, Navigation
  indigo: {
    50: '#EEF2F7',
    100: '#D4DEEB',
    200: '#A9BDDB',
    300: '#7E9CCB',
    400: '#5478AE',
    500: '#3A5E94',
    600: '#243B63', // Secondary
    700: '#1C2F50',
    800: '#14233D',
    900: '#0C1729',
  },

  // Neutrals — Text, Backgrounds, Surfaces
  neutral: {
    50: '#F9FAFB',
    100: '#F8F5EF', // Background
    200: '#F0ECE3',
    300: '#E5E0D5',
    400: '#C8C2B4',
    500: '#9B9588',
    600: '#6B7280', // Text Secondary
    700: '#4B5563',
    800: '#374151',
    900: '#1F2937', // Text Primary
    950: '#111827',
  },

  // Semantic
  success: '#0F8A5F',
  warning: '#D97706',
  error: '#B91C1C',
  info: '#2563EB',

  // Pure
  white: '#FFFFFF',
  black: '#000000',
} as const;

// ---------------------------------------------------------------------------
// Colors — Dark Mode
// ---------------------------------------------------------------------------
export const darkColors = {
  background: '#111827',
  surface: '#1F2937',
  surfaceElevated: '#283548',
  text: '#F9FAFB',
  textSecondary: '#9CA3AF',
  accent: '#D28D3A',
  border: '#374151',
} as const;

// ---------------------------------------------------------------------------
// Typography
// ---------------------------------------------------------------------------
export const fonts = {
  /** Primary — UI text, body copy */
  sans: "'Inter', system-ui, -apple-system, sans-serif",
  /** Sanskrit / Devanagari text */
  devanagari: "'Noto Sans Devanagari', 'Mukta', sans-serif",
  /** Scripture titles, display headings */
  serif: "'Cormorant Garamond', Georgia, serif",
  /** Code, references */
  mono: "'JetBrains Mono', 'Fira Code', monospace",
} as const;

export const fontSizes = {
  xs: '0.75rem', // 12px — Footnote
  sm: '0.875rem', // 14px — Caption
  base: '1rem', // 16px — Body
  lg: '1.125rem', // 18px
  xl: '1.25rem', // 20px
  '2xl': '1.5rem', // 24px — H3
  '3xl': '1.875rem', // 30px — H2
  '4xl': '2.25rem', // 36px — H1
  '5xl': '3rem', // 48px — Display
} as const;

export const fontWeights = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const lineHeights = {
  tight: '1.25',
  normal: '1.5',
  relaxed: '1.75',
  loose: '2',
} as const;

// ---------------------------------------------------------------------------
// Spacing — 4px base scale
// ---------------------------------------------------------------------------
export const spacing = {
  0: '0',
  0.5: '0.125rem', // 2px
  1: '0.25rem', // 4px
  2: '0.5rem', // 8px
  3: '0.75rem', // 12px
  4: '1rem', // 16px
  6: '1.5rem', // 24px
  8: '2rem', // 32px
  12: '3rem', // 48px
  16: '4rem', // 64px
  20: '5rem', // 80px
  24: '6rem', // 96px
} as const;

// ---------------------------------------------------------------------------
// Border Radius
// ---------------------------------------------------------------------------
export const radii = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  card: '20px',
  full: '9999px',
} as const;

// ---------------------------------------------------------------------------
// Shadows — Subtle only (per DESIGN_SYSTEM.md)
// ---------------------------------------------------------------------------
export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 2px 8px rgba(0, 0, 0, 0.08)',
  lg: '0 4px 16px rgba(0, 0, 0, 0.10)',
  card: '0 2px 12px rgba(0, 0, 0, 0.06)',
} as const;

// ---------------------------------------------------------------------------
// Breakpoints
// ---------------------------------------------------------------------------
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ---------------------------------------------------------------------------
// Z-Index Scale
// ---------------------------------------------------------------------------
export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  overlay: 30,
  modal: 40,
  toast: 50,
} as const;

// ---------------------------------------------------------------------------
// Transitions
// ---------------------------------------------------------------------------
export const transitions = {
  fast: '150ms ease',
  normal: '250ms ease',
  slow: '350ms ease',
} as const;

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------
export const layout = {
  maxWidth: '1400px',
  sidebarWidth: '280px',
  sidebarCollapsedWidth: '72px',
  headerHeight: '64px',
  contentPadding: spacing[6],
} as const;

// ---------------------------------------------------------------------------
// Graph Visualization — Node shapes per DESIGN_SYSTEM.md
// ---------------------------------------------------------------------------
export const graphNodeStyles = {
  concept: { shape: 'circle', color: colors.saffron[500] },
  scripture: { shape: 'rectangle', color: colors.indigo[600] },
  verse: { shape: 'pill', color: colors.indigo[400] },
  commentary: { shape: 'hexagon', color: colors.saffron[300] },
  school: { shape: 'diamond', color: colors.neutral[600] },
  person: { shape: 'circle', color: colors.neutral[500] },
  deity: { shape: 'circle', color: colors.saffron[400] },
  event: { shape: 'rectangle', color: colors.neutral[400] },
  place: { shape: 'rectangle', color: colors.neutral[300] },
  story: { shape: 'pill', color: colors.saffron[200] },
} as const;
