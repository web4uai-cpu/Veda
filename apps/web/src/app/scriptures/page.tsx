'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ScrollReveal, ScrollRevealItem, TextReveal } from '@/components/animations';
import { api, type Scripture } from '@/lib/api';
import { FALLBACK_SCRIPTURES } from '@/lib/scripture-fallback';

// ---------------------------------------------------------------------------
// Category styling & ordering
// ---------------------------------------------------------------------------

const CATEGORY_CONFIG: Record<string, {
  label: string;
  accent: string;
  bg: string;
  border: string;
  pill: string;
}> = {
  veda:        { label: 'Vedas (Shruti)',        accent: 'border-l-amber-500',   bg: 'bg-amber-500/5  hover:bg-amber-500/10',   border: 'border-amber-500/15',  pill: 'bg-amber-500/15 text-amber-400' },
  upanishad:   { label: 'Upanishads (Vedanta)',  accent: 'border-l-blue-500',    bg: 'bg-blue-500/5   hover:bg-blue-500/10',    border: 'border-blue-500/15',   pill: 'bg-blue-500/15 text-blue-400' },
  gita:        { label: 'Bhagavad Gita',         accent: 'border-l-orange-500',  bg: 'bg-orange-500/5 hover:bg-orange-500/10',  border: 'border-orange-500/15', pill: 'bg-orange-500/15 text-orange-400' },
  ramayana:    { label: 'Itihasa',               accent: 'border-l-rose-500',    bg: 'bg-rose-500/5   hover:bg-rose-500/10',    border: 'border-rose-500/15',   pill: 'bg-rose-500/15 text-rose-400' },
  mahabharata: { label: 'Itihasa',               accent: 'border-l-purple-500',  bg: 'bg-purple-500/5 hover:bg-purple-500/10',  border: 'border-purple-500/15', pill: 'bg-purple-500/15 text-purple-400' },
  purana:      { label: 'Puranas (Smriti)',       accent: 'border-l-cyan-500',    bg: 'bg-cyan-500/5   hover:bg-cyan-500/10',    border: 'border-cyan-500/15',   pill: 'bg-cyan-500/15 text-cyan-400' },
  shastra:     { label: 'Shastras (Treatises)',   accent: 'border-l-emerald-500', bg: 'bg-emerald-500/5 hover:bg-emerald-500/10', border: 'border-emerald-500/15', pill: 'bg-emerald-500/15 text-emerald-400' },
  commentary:  { label: 'Commentaries',          accent: 'border-l-slate-500',   bg: 'bg-slate-500/5  hover:bg-slate-500/10',   border: 'border-slate-500/15',  pill: 'bg-slate-500/15 text-slate-400' },
};

const DEFAULT_STYLE = CATEGORY_CONFIG['commentary']!;

function getStyle(key: string) {
  return CATEGORY_CONFIG[key] ?? DEFAULT_STYLE;
}

const CATEGORY_ORDER = ['veda', 'upanishad', 'gita', 'ramayana', 'mahabharata', 'purana', 'shastra', 'commentary'];

// Merge ramayana + mahabharata into a single "Itihasa" display group
const DISPLAY_GROUPS: { key: string; label: string; categories: string[] }[] = [
  { key: 'veda',      label: 'Vedas (Shruti)',       categories: ['veda'] },
  { key: 'upanishad', label: 'Upanishads (Vedanta)',  categories: ['upanishad'] },
  { key: 'itihasa',   label: 'Itihasa & Gita',       categories: ['gita', 'ramayana', 'mahabharata'] },
  { key: 'purana',    label: 'Puranas (Smriti)',      categories: ['purana'] },
  { key: 'shastra',   label: 'Shastras (Treatises)',  categories: ['shastra'] },
  { key: 'commentary', label: 'Commentaries',         categories: ['commentary'] },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface DisplayGroup {
  key: string;
  label: string;
  items: Scripture[];
}

function buildDisplayGroups(scriptures: Scripture[]): DisplayGroup[] {
  const byCat = new Map<string, Scripture[]>();
  for (const s of scriptures) {
    const list = byCat.get(s.category);
    if (list) list.push(s);
    else byCat.set(s.category, [s]);
  }

  return DISPLAY_GROUPS
    .map((dg) => ({
      key: dg.key,
      label: dg.label,
      items: dg.categories.flatMap((cat) => byCat.get(cat) ?? []),
    }))
    .filter((g) => g.items.length > 0);
}

function getMetricLabel(scripture: Scripture): string {
  const m = scripture.metadata as Record<string, number | string>;
  if (scripture.verse_count > 0) {
    return `${scripture.verse_count.toLocaleString()} verses`;
  }
  if (m.total_mantras) return `${Number(m.total_mantras).toLocaleString()} mantras`;
  if (m.total_shlokas) return `${Number(m.total_shlokas).toLocaleString()} shlokas`;
  if (m.total_sutras)  return `${Number(m.total_sutras).toLocaleString()} sutras`;
  if (m.total_karikas) return `${Number(m.total_karikas).toLocaleString()} karikas`;
  if (m.total_verses)  return `${Number(m.total_verses).toLocaleString()} verses`;
  if (m.total_chapters) return `${Number(m.total_chapters)} chapters`;
  if (m.author) return String(m.author);
  return '';
}

function mergeWithFallback(apiData: Scripture[]): Scripture[] {
  if (apiData.length >= 40) return apiData;
  const slugs = new Set(apiData.map((s) => s.slug));
  const merged = [...apiData];
  for (const fb of FALLBACK_SCRIPTURES) {
    if (!slugs.has(fb.slug)) merged.push(fb);
  }
  return merged;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ScripturesPage() {
  const [scriptures, setScriptures] = useState<Scripture[]>(FALLBACK_SCRIPTURES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getScriptures(undefined, 1, 200)
      .then((res) => {
        setScriptures(mergeWithFallback(res.scriptures));
        setLoading(false);
      })
      .catch(() => {
        setScriptures(FALLBACK_SCRIPTURES);
        setLoading(false);
      });
  }, []);

  const groups = buildDisplayGroups(scriptures);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <ScrollReveal animation="fade-up">
          <h1 className="scripture-title mb-1 text-3xl font-bold text-[hsl(var(--foreground))]">
            <TextReveal text="Scriptures" />
          </h1>
        </ScrollReveal>
        <ScrollReveal animation="fade-up" delay={0.15}>
          <p className="text-base text-[hsl(var(--muted-foreground))]">
            {scriptures.length} sacred texts across {groups.length} traditions
          </p>
        </ScrollReveal>
      </div>

      {/* Category Sections */}
      {groups.map((group, gi) => (
        <section key={group.key} className="mb-8">
          {/* Section header */}
          <ScrollReveal animation="slide-right" delay={gi * 0.06}>
            <div className="mb-3 flex items-center gap-3">
              <motion.h2
                className="text-sm font-semibold uppercase tracking-widest text-[hsl(var(--muted-foreground))]"
                whileInView={{ backgroundSize: ['0% 2px', '100% 2px'] }}
                style={{
                  backgroundImage: 'linear-gradient(to right, hsl(32, 76%, 52%), transparent)',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'bottom left',
                  paddingBottom: '3px',
                }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                {group.label}
              </motion.h2>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                getStyle(group.key).pill
              }`}>
                {group.items.length}
              </span>
            </div>
          </ScrollReveal>

          {/* Card grid */}
          <ScrollReveal stagger staggerDelay={0.04} className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
            {group.items.map((scripture) => (
              <ScrollRevealItem key={scripture.slug} animation="fade-up">
                <CapsuleCard scripture={scripture} />
              </ScrollRevealItem>
            ))}
          </ScrollReveal>
        </section>
      ))}

      {/* Loading overlay — only on initial render while API is fetching */}
      {loading && (
        <div className="pointer-events-none absolute inset-0" aria-hidden />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Capsule Card
// ---------------------------------------------------------------------------

function CapsuleCard({ scripture }: { scripture: Scripture }) {
  const hasContent = scripture.verse_count > 0;
  const metric = getMetricLabel(scripture);
  const style = getStyle(scripture.category);

  const inner = (
    <div
      className={`
        relative rounded-xl border-l-[3px] border ${style.accent} ${style.border}
        ${style.bg} px-3.5 py-2.5
        transition-all duration-200
        ${hasContent ? 'cursor-pointer hover:translate-y-[-1px] hover:shadow-md' : 'opacity-70'}
      `}
    >
      {!hasContent && (
        <span className="absolute right-2 top-2 flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-40" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500/60" />
        </span>
      )}

      {scripture.sanskrit_name && (
        <p className="font-devanagari text-[11px] leading-tight text-[hsl(var(--muted-foreground))] truncate">
          {scripture.sanskrit_name}
        </p>
      )}
      <h3 className={`scripture-title text-[13px] font-semibold leading-snug text-[hsl(var(--foreground))] truncate ${
        hasContent ? 'group-hover:text-[hsl(var(--primary))]' : ''
      }`}>
        {scripture.name}
      </h3>
      {metric && (
        <p className="mt-0.5 text-[11px] text-[hsl(var(--muted-foreground))]">{metric}</p>
      )}
    </div>
  );

  if (hasContent) {
    return (
      <a href={`/scriptures/${scripture.slug}`} className="group block">
        {inner}
      </a>
    );
  }
  return inner;
}
