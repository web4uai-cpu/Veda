/**
 * VEDA Mobile Theme
 * ==================
 * React Native adaptation of @veda/design-tokens.
 * Dark-first: near-black backgrounds, saffron accents, glass surfaces.
 */

import { colors as tokenColors } from '@veda/design-tokens';

export const palette = {
  saffron: tokenColors.saffron,
  indigo: tokenColors.indigo,
  neutral: tokenColors.neutral,
} as const;

export const theme = {
  colors: {
    background: '#0B0F1A',
    surface: '#111827',
    surfaceElevated: '#1A2232',
    card: 'rgba(26, 34, 50, 0.72)',
    cardBorder: 'rgba(255, 255, 255, 0.08)',
    text: '#F3F4F6',
    textSecondary: '#9CA3AF',
    textMuted: '#6B7280',
    primary: tokenColors.saffron[500],
    primaryBright: tokenColors.saffron[400],
    primarySoft: 'rgba(201, 122, 36, 0.14)',
    secondary: tokenColors.indigo[400],
    secondarySoft: 'rgba(84, 120, 174, 0.15)',
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    overlay: 'rgba(0, 0, 0, 0.55)',
    tabBar: 'rgba(11, 15, 26, 0.92)',
  },
  font: {
    sans: 'Inter_400Regular',
    sansMedium: 'Inter_500Medium',
    sansSemiBold: 'Inter_600SemiBold',
    sansBold: 'Inter_700Bold',
    devanagari: 'NotoSansDevanagari_400Regular',
    devanagariSemiBold: 'NotoSansDevanagari_600SemiBold',
    serif: 'CormorantGaramond_600SemiBold',
    serifBold: 'CormorantGaramond_700Bold',
  },
  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    xxl: 30,
    hero: 38,
  },
  spacing: (n: number) => n * 4,
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    card: 20,
    full: 999,
  },
  glass: {
    backgroundColor: 'rgba(26, 34, 50, 0.72)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
  },
  shadow: {
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    },
  },
  /** Node colors for explore/graph views (matches web legend). */
  nodeColors: {
    concept: '#E8A23C',
    scripture: '#5478AE',
    school: '#A78BFA',
    person: '#34D399',
  },
} as const;

export type Theme = typeof theme;
