import { Text as RNText, type TextProps, StyleSheet } from 'react-native';
import { theme } from '@/theme';

type Variant =
  | 'body'
  | 'bodySmall'
  | 'caption'
  | 'label'
  | 'title'
  | 'heading'
  | 'hero'
  | 'serif'
  | 'sanskrit'
  | 'transliteration';

interface Props extends TextProps {
  variant?: Variant;
  color?: string;
}

const styles = StyleSheet.create({
  body: { fontFamily: theme.font.sans, fontSize: theme.fontSize.base, color: theme.colors.text, lineHeight: 22 },
  bodySmall: { fontFamily: theme.font.sans, fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, lineHeight: 19 },
  caption: { fontFamily: theme.font.sans, fontSize: theme.fontSize.xs, color: theme.colors.textMuted, lineHeight: 15 },
  label: {
    fontFamily: theme.font.sansSemiBold,
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  title: { fontFamily: theme.font.sansSemiBold, fontSize: theme.fontSize.md, color: theme.colors.text, lineHeight: 23 },
  heading: { fontFamily: theme.font.sansBold, fontSize: theme.fontSize.xl, color: theme.colors.text, lineHeight: 31 },
  hero: { fontFamily: theme.font.serifBold, fontSize: theme.fontSize.hero, color: theme.colors.text, lineHeight: 46 },
  serif: { fontFamily: theme.font.serif, fontSize: theme.fontSize.lg, color: theme.colors.text, lineHeight: 27 },
  sanskrit: {
    fontFamily: theme.font.devanagari,
    fontSize: theme.fontSize.lg,
    color: theme.colors.text,
    lineHeight: 36,
  },
  transliteration: {
    fontFamily: theme.font.sans,
    fontSize: theme.fontSize.sm,
    fontStyle: 'italic',
    color: theme.colors.textSecondary,
    lineHeight: 21,
  },
});

export function Text({ variant = 'body', color, style, ...rest }: Props) {
  return <RNText style={[styles[variant], color ? { color } : null, style]} {...rest} />;
}
