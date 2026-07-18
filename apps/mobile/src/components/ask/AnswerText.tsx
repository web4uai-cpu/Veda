/**
 * Renders an assistant answer: `##` headers, ALL-CAPS headers, `**bold**`, and
 * `[BG.2.47]` references as tappable inline citation pills.
 *
 * The mobile port of apps/web/src/components/domain/ReportRenderer.tsx — the
 * screen previously dumped the raw string into a <Text>, so inline references
 * and bold markers rendered as literal `[BG.2.47]` / `**…**`.
 */
import { Fragment, type ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '@/theme';
import { Text } from '@/components/ui';
import type { Citation } from '@/lib/api';

/** Matches [Gita.2.47] style references and **bold** runs. Kept in sync with the web copy. */
const INLINE_RE = /\[([A-Z][a-zA-Z]*(?:\.\d+)+[a-z]?)\]|\*\*(.+?)\*\*/g;

interface Props {
  text: string;
  /** Citations from the same message — used to resolve a tapped reference. */
  citations?: Citation[];
  onCitationPress?: (citation: Citation) => void;
}

/**
 * A reference the model wrote inline may not appear in the citations array. A
 * synthetic citation still lets the sheet open and look the verse up by
 * reference; the metadata fields degrade to unknown rather than blocking the tap.
 */
function synthesize(reference: string): Citation {
  return {
    citation_id: `inline_${reference}`,
    source_type: 'SCRIPTURE',
    source_name: 'Referenced in answer',
    reference,
    source_id: '',
    chapter: null,
    verse: null,
    confidence: 0,
    evidence_level: 'C',
  };
}

export function AnswerText({ text, citations, onCitationPress }: Props) {
  function press(reference: string) {
    if (!onCitationPress) return;
    const match = citations?.find((c) => c.reference === reference);
    onCitationPress(match ?? synthesize(reference));
  }

  function renderInline(source: string): ReactNode[] {
    const parts: ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    // exec() on a module-level regex carries lastIndex between calls.
    INLINE_RE.lastIndex = 0;

    while ((match = INLINE_RE.exec(source)) !== null) {
      if (match.index > lastIndex) parts.push(source.slice(lastIndex, match.index));

      if (match[1]) {
        const reference = match[1];
        parts.push(
          // Nested <Text> keeps the pill inline with the prose; a Pressable
          // wrapper would break it onto its own line.
          <Text
            key={`cit-${match.index}`}
            style={styles.pill}
            onPress={() => press(reference)}
            suppressHighlighting={!onCitationPress}
          >
            {` ${reference} `}
          </Text>,
        );
      } else if (match[2]) {
        parts.push(
          <Text key={`b-${match.index}`} style={styles.bold}>
            {match[2]}
          </Text>,
        );
      }
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < source.length) parts.push(source.slice(lastIndex));
    return parts;
  }

  const blocks: ReactNode[] = [];
  const paragraphs = text.split(/\n\n+/);

  for (let pi = 0; pi < paragraphs.length; pi++) {
    const para = paragraphs[pi]?.trim() ?? '';
    if (!para) continue;

    if (/^#{1,3}\s+/.test(para)) {
      blocks.push(
        <Text key={`h-${pi}`} variant="title" style={styles.headingBlock}>
          {renderInline(para.replace(/^#{1,3}\s+/, ''))}
        </Text>,
      );
      continue;
    }

    const lines = para.split('\n');
    const firstLine = lines[0] ?? '';
    // An ALL-CAPS opening line is a section title the model wrote without markdown.
    if (/^[A-Z][A-Z\s:]{3,}$/.test(firstLine)) {
      blocks.push(
        <Text key={`h-${pi}`} variant="title" style={styles.headingBlock}>
          {firstLine}
        </Text>,
      );
      if (lines.length > 1) {
        blocks.push(
          <Text key={`p-${pi}`} variant="body" style={styles.paragraph}>
            {renderInline(lines.slice(1).join('\n'))}
          </Text>,
        );
      }
      continue;
    }

    blocks.push(
      <Text key={`p-${pi}`} variant="body" style={styles.paragraph}>
        {renderInline(para)}
      </Text>,
    );
  }

  return <View>{blocks.map((b, i) => <Fragment key={i}>{b}</Fragment>)}</View>;
}

const styles = StyleSheet.create({
  paragraph: { marginBottom: theme.spacing(2) },
  headingBlock: { marginTop: theme.spacing(2), marginBottom: theme.spacing(1) },
  pill: {
    fontFamily: theme.font.sansSemiBold,
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft,
  },
  bold: { fontFamily: theme.font.sansSemiBold, color: theme.colors.text },
});
