'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ScrollReveal, ScrollRevealItem, FloatingCard, AnimatedCounter, TextReveal } from '@/components/animations';
import { api, type Scripture } from '@/lib/api';

const CATEGORY_CONFIG: Record<string, { label: string; gradient: string; border: string }> = {
  veda:        { label: 'Vedas (Shruti)',         gradient: 'from-amber-500/15 to-orange-500/10',  border: 'border-amber-500/20' },
  upanishad:   { label: 'Upanishads (Vedanta)',   gradient: 'from-blue-500/15 to-indigo-500/10',   border: 'border-blue-500/20' },
  gita:        { label: 'Bhagavad Gita',          gradient: 'from-amber-500/15 to-orange-500/10',  border: 'border-amber-500/20' },
  ramayana:    { label: 'Ramayana (Itihasa)',     gradient: 'from-rose-500/15 to-pink-500/10',     border: 'border-rose-500/20' },
  mahabharata: { label: 'Mahabharata (Itihasa)',  gradient: 'from-purple-500/15 to-violet-500/10', border: 'border-purple-500/20' },
  purana:      { label: 'Puranas (Smriti)',        gradient: 'from-cyan-500/15 to-sky-500/10',      border: 'border-cyan-500/20' },
  shastra:     { label: 'Shastras (Treatises)',    gradient: 'from-emerald-500/15 to-teal-500/10',  border: 'border-emerald-500/20' },
  commentary:  { label: 'Commentaries',           gradient: 'from-gray-500/15 to-slate-500/10',    border: 'border-gray-500/20' },
};

const CATEGORY_ORDER = ['veda', 'upanishad', 'gita', 'ramayana', 'mahabharata', 'purana', 'shastra', 'commentary'];

function groupByCategory(scriptures: Scripture[]): { category: string; label: string; items: Scripture[] }[] {
  const grouped = new Map<string, Scripture[]>();
  for (const s of scriptures) {
    const list = grouped.get(s.category);
    if (list) {
      list.push(s);
    } else {
      grouped.set(s.category, [s]);
    }
  }

  return CATEGORY_ORDER
    .filter((cat) => (grouped.get(cat)?.length ?? 0) > 0)
    .map((cat) => ({
      category: cat,
      label: CATEGORY_CONFIG[cat]?.label ?? cat,
      items: grouped.get(cat)!,
    }));
}

function getCountLabel(scripture: Scripture): string {
  const meta = scripture.metadata as Record<string, number>;
  if (scripture.verse_count > 0) {
    return `${scripture.chapter_count} ${scripture.chapter_count === 1 ? 'chapter' : 'chapters'} · ${scripture.verse_count} verses`;
  }
  const mantras = meta?.total_mantras;
  const shlokas = meta?.total_shlokas;
  const sutras = meta?.total_sutras;
  const karikas = meta?.total_karikas;
  if (mantras) return `${mantras.toLocaleString()} mantras`;
  if (shlokas) return `${shlokas.toLocaleString()} shlokas`;
  if (sutras) return `${sutras.toLocaleString()} sutras`;
  if (karikas) return `${karikas.toLocaleString()} karikas`;
  return '';
}

export default function ScripturesPage() {
  const [scriptures, setScriptures] = useState<Scripture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getScriptures(undefined, 1, 200)
      .then((res) => {
        setScriptures(res.scriptures);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message ?? 'Failed to load scriptures');
        setLoading(false);
      });
  }, []);

  const groups = groupByCategory(scriptures);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
      <div className="mb-10">
        <ScrollReveal animation="fade-up">
          <h1 className="scripture-title mb-2 text-3xl font-bold text-[hsl(var(--foreground))]">
            <TextReveal text="Scriptures" />
          </h1>
        </ScrollReveal>
        <ScrollReveal animation="fade-up" delay={0.2}>
          <p className="text-lg text-[hsl(var(--muted-foreground))]">
            Browse sacred texts with Sanskrit, transliteration, and multiple translations
          </p>
        </ScrollReveal>
      </div>

      {loading && (
        <div className="space-y-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="mb-4 h-5 w-40 rounded bg-[hsl(var(--muted))]" />
              <div className="grid gap-4 sm:grid-cols-2">
                {[1, 2].map((j) => (
                  <div key={j} className="knowledge-card h-32 rounded-xl bg-[hsl(var(--muted))]" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center">
          <p className="text-red-500">{error}</p>
          <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
            Make sure the API server is running at {process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'}
          </p>
        </div>
      )}

      {!loading && !error && groups.map((group, groupIndex) => {
        const config = CATEGORY_CONFIG[group.category] ?? CATEGORY_CONFIG.commentary;

        return (
          <section key={group.category} className="mb-12">
            <ScrollReveal animation="slide-right" delay={groupIndex * 0.1}>
              <h2 className="mb-4 text-lg font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                <motion.span
                  className="inline-block"
                  whileInView={{
                    backgroundSize: ['0% 2px', '100% 2px'],
                  }}
                  style={{
                    backgroundImage: 'linear-gradient(to right, hsl(32, 76%, 52%), transparent)',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'bottom left',
                    paddingBottom: '4px',
                  }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                >
                  {group.label}
                </motion.span>
              </h2>
            </ScrollReveal>

            <ScrollReveal stagger staggerDelay={0.08} className="grid gap-4 sm:grid-cols-2">
              {group.items.map((scripture) => {
                const hasContent = scripture.verse_count > 0;
                const countLabel = getCountLabel(scripture);

                return (
                  <ScrollRevealItem key={scripture.slug} animation="fade-up">
                    <FloatingCard
                      className={`knowledge-card group bg-gradient-to-br ${config.gradient} border ${config.border} transition-all`}
                      tiltMax={5}
                    >
                      {hasContent ? (
                        <a
                          href={`/scriptures/${scripture.slug}`}
                          id={`scripture-${scripture.slug}`}
                          className="block"
                        >
                          <ScriptureCardContent scripture={scripture} countLabel={countLabel} hasContent />
                        </a>
                      ) : (
                        <div className="relative" id={`scripture-${scripture.slug}`}>
                          <div className="absolute right-0 top-0 rounded-bl-lg rounded-tr-xl bg-[hsl(var(--muted))] px-2 py-0.5 text-xs font-medium text-[hsl(var(--muted-foreground))]">
                            Coming Soon
                          </div>
                          <ScriptureCardContent scripture={scripture} countLabel={countLabel} hasContent={false} />
                        </div>
                      )}
                    </FloatingCard>
                  </ScrollRevealItem>
                );
              })}
            </ScrollReveal>
          </section>
        );
      })}
    </div>
  );
}

function ScriptureCardContent({
  scripture,
  countLabel,
  hasContent,
}: {
  scripture: Scripture;
  countLabel: string;
  hasContent: boolean;
}) {
  return (
    <>
      <div className="flex items-start justify-between">
        <div>
          {scripture.sanskrit_name && (
            <p className="sanskrit text-sm text-[hsl(var(--muted-foreground))]">
              {scripture.sanskrit_name}
            </p>
          )}
          <h3
            className={`scripture-title text-xl font-semibold text-[hsl(var(--foreground))] transition-colors ${
              hasContent ? 'group-hover:text-[hsl(var(--primary))]' : 'opacity-80'
            }`}
          >
            {scripture.name}
          </h3>
        </div>
      </div>
      {scripture.description && (
        <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
          {scripture.description}
        </p>
      )}
      {countLabel && (
        <div className="mt-3 text-xs text-[hsl(var(--muted-foreground))]">
          {hasContent ? (
            <span>
              <AnimatedCounter target={scripture.chapter_count} duration={1.5} />{' '}
              {scripture.chapter_count === 1 ? 'chapter' : 'chapters'}
              <span className="mx-1">·</span>
              <AnimatedCounter target={scripture.verse_count} duration={2} /> verses
            </span>
          ) : (
            <span>{countLabel}</span>
          )}
        </div>
      )}
    </>
  );
}
