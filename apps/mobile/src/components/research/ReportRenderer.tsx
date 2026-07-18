import { type ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { theme } from '@/theme';
import { Text, Card } from '@/components/ui';

/**
 * Renders a research report as a stack of small cards.
 *
 * Parsing mirrors apps/web/src/components/domain/ReportRenderer.tsx
 * so a report reads identically on both platforms: `##` headers, ALL-CAPS
 * headers, `**bold**`, and `[Gita.2.47]` citation references as inline pills.
 */

/** Matches [Gita.2.47] style references and **bold** runs. */
const INLINE_RE = /\[([A-Z][a-zA-Z]*(?:\.\d+)+[a-z]?)\]|\*\*(.+?)\*\*/g;

function renderInline(text: string, keyBase: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  // exec() on a module-level regex carries lastIndex between calls.
  INLINE_RE.lastIndex = 0;

  while ((match = INLINE_RE.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));

    if (match[1]) {
      parts.push(
        <Text key={`${keyBase}-c${match.index}`} style={styles.citation}>
          {` ${match[1]} `}
        </Text>,
      );
    } else if (match[2]) {
      parts.push(
        <Text key={`${keyBase}-b${match.index}`} style={styles.bold}>
          {match[2]}
        </Text>,
      );
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

interface Block {
  kind: 'heading' | 'paragraph';
  text: string;
}

function parseBlocks(report: string): Block[] {
  const blocks: Block[] = [];

  for (const raw of report.split(/\n\n+/)) {
    const para = raw.trim();
    if (!para) continue;

    if (/^#{1,3}\s+/.test(para)) {
      blocks.push({ kind: 'heading', text: para.replace(/^#{1,3}\s+/, '') });
      continue;
    }

    const lines = para.split('\n');
    const firstLine = lines[0] ?? '';
    // An ALL-CAPS opening line is a section title the model wrote without markdown.
    if (/^[A-Z][A-Z\s:]{3,}$/.test(firstLine)) {
      blocks.push({ kind: 'heading', text: firstLine });
      if (lines.length > 1) {
        blocks.push({ kind: 'paragraph', text: lines.slice(1).join('\n').trim() });
      }
      continue;
    }

    blocks.push({ kind: 'paragraph', text: para });
  }

  return blocks;
}

/**
 * Groups paragraphs under the heading that precedes them, so each section
 * becomes one compact card instead of one long scroll of text.
 */
export function ReportRenderer({ report }: { report: string }) {
  const blocks = parseBlocks(report);

  const sections: Array<{ heading: string | null; paragraphs: string[] }> = [];
  for (const block of blocks) {
    if (block.kind === 'heading') {
      sections.push({ heading: block.text, paragraphs: [] });
    } else {
      if (!sections.length) sections.push({ heading: null, paragraphs: [] });
      sections[sections.length - 1]!.paragraphs.push(block.text);
    }
  }

  return (
    <View style={styles.stack}>
      {sections.map((section, si) => (
        <Animated.View key={si} entering={FadeInDown.delay(Math.min(si, 8) * 60).duration(320)}>
          <Card style={styles.card}>
            {section.heading ? (
              <Text variant="label" color={theme.colors.primary}>
                {section.heading}
              </Text>
            ) : null}
            {section.paragraphs.map((p, pi) => (
              <Text key={pi} variant="body" style={styles.paragraph}>
                {renderInline(p, `s${si}p${pi}`)}
              </Text>
            ))}
          </Card>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: theme.spacing(2.5) },
  card: { gap: theme.spacing(2) },
  paragraph: { lineHeight: 23 },
  bold: { fontFamily: theme.font.sansSemiBold, color: theme.colors.text },
  citation: {
    fontFamily: theme.font.sansSemiBold,
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft,
  },
});
