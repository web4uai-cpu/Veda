import { Fragment, type ReactNode } from 'react';

/**
 * Renders LLM prose: `##` headers, ALL-CAPS headers, `**bold**`, and
 * `[Gita.2.47]` references as inline citation pills.
 *
 * Extracted from the research page so /ask renders answers the same way —
 * it previously dumped the answer into a single <p> with unlinked pills below.
 */

/** Matches [Gita.2.47] style references and **bold** runs. */
const INLINE_RE = /\[([A-Z][a-zA-Z]*(?:\.\d+)+[a-z]?)\]|\*\*(.+?)\*\*/g;

// Returns a keyed Fragment rather than a bare array: the repo runs two
// @types/react copies (see .npmrc), and an array-as-children trips their
// incompatible ReactNode definitions.
function inline(text: string, key: string) {
  return <Fragment key={key}>{renderInline(text)}</Fragment>;
}

function renderInline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  // exec() on a module-level regex carries lastIndex between calls.
  INLINE_RE.lastIndex = 0;

  while ((match = INLINE_RE.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));

    if (match[1]) {
      parts.push(
        <span
          key={`cit-${match.index}`}
          className="mx-0.5 inline-block rounded-full bg-[hsl(var(--primary))]/10 px-2 py-0.5 align-baseline text-[11px] font-medium text-[hsl(var(--primary))]"
        >
          {match[1]}
        </span>,
      );
    } else if (match[2]) {
      parts.push(<strong key={`b-${match.index}`}>{match[2]}</strong>);
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

function renderReport(text: string): ReactNode[] {
  const paragraphs = text.split(/\n\n+/);
  const elements: ReactNode[] = [];

  for (let pi = 0; pi < paragraphs.length; pi++) {
    const para = paragraphs[pi]?.trim() ?? '';
    if (!para) continue;

    if (/^#{1,3}\s+/.test(para)) {
      elements.push(
        <h3
          key={`h-${pi}`}
          className="mb-2 mt-5 text-base font-semibold text-[hsl(var(--foreground))]"
        >
          {inline(para.replace(/^#{1,3}\s+/, ''), `hi-${pi}`)}
        </h3>,
      );
      continue;
    }

    const lines = para.split('\n');
    const firstLine = lines[0] ?? '';
    // An ALL-CAPS opening line is a section title the model wrote without markdown.
    if (/^[A-Z][A-Z\s:]{3,}$/.test(firstLine)) {
      elements.push(
        <h3
          key={`h-${pi}`}
          className="mb-2 mt-5 text-base font-semibold text-[hsl(var(--foreground))]"
        >
          {firstLine}
        </h3>,
      );
      if (lines.length > 1) {
        elements.push(
          <p key={`p-${pi}`} className="mb-3 leading-relaxed text-[hsl(var(--foreground))]">
            {inline(lines.slice(1).join('\n'), `pi-${pi}`)}
          </p>,
        );
      }
      continue;
    }

    elements.push(
      <p key={`p-${pi}`} className="mb-3 leading-relaxed text-[hsl(var(--foreground))]">
        {inline(para, `pa-${pi}`)}
      </p>,
    );
  }

  return elements;
}

export function ReportRenderer({ text }: { text: string }) {
  return <Fragment>{renderReport(text)}</Fragment>;
}
