'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { api, type Chapter, type Scripture } from '@/lib/api';
import { ScrollReveal, ScrollRevealItem, FloatingCard } from '@/components/animations';

export default function ScriptureDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [scripture, setScripture] = useState<Scripture | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let cancelled = false;

    async function loadScripture() {
      try {
        setStatus('loading');
        const scriptureResult = await api.getScriptureBySlug(slug);
        const chapterResult = await api.getChapters(scriptureResult.id);
        if (!cancelled) {
          setScripture(scriptureResult);
          setChapters(chapterResult.chapters);
          setStatus('ready');
        }
      } catch {
        if (!cancelled) setStatus('error');
      }
    }

    loadScripture();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (status === 'loading') {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10 lg:px-8">
        <div className="mb-4 h-4 w-32 animate-pulse rounded bg-[hsl(var(--muted))]/40" />
        <div className="mb-8 h-40 animate-pulse rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/10" />
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/10" style={{ animationDelay: `${i * 100}ms` }} />
          ))}
        </div>
      </main>
    );
  }

  if (status === 'error' || !scripture) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10 text-center lg:px-8">
        <h1 className="scripture-title mb-3 text-3xl font-bold">Scripture Not Available</h1>
        <p className="text-[hsl(var(--muted-foreground))]">
          Start the API and ingest the canonical corpus to read this scripture.
        </p>
        <a
          href="/scriptures"
          className="mt-4 inline-block text-sm text-[hsl(var(--primary))] hover:underline"
        >
          Back to all scriptures
        </a>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
      <ScrollReveal animation="fade-up">
        <nav className="mb-4 flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
          <a href="/scriptures" className="hover:text-[hsl(var(--primary))]">Scriptures</a>
          <span>/</span>
          <span className="text-[hsl(var(--foreground))]">{scripture.name}</span>
        </nav>
        <section className="mb-8 rounded-2xl border border-[hsl(var(--border))] p-6 glass">
          {scripture.sanskrit_name && (
            <p className="sanskrit mb-2 text-xl text-[hsl(var(--muted-foreground))]">
              {scripture.sanskrit_name}
            </p>
          )}
          <h1 className="scripture-title text-4xl font-bold text-[hsl(var(--foreground))]">
            {scripture.name}
          </h1>
          {scripture.description && (
            <p className="mt-3 max-w-3xl leading-relaxed text-[hsl(var(--muted-foreground))]">
              {scripture.description}
            </p>
          )}
          <div className="mt-5 flex flex-wrap gap-3 text-sm text-[hsl(var(--muted-foreground))]">
            {scripture.chapter_count > 0 && <span>{scripture.chapter_count} chapters</span>}
            {scripture.verse_count > 0 && <span>{scripture.verse_count} verses</span>}
            <span className="capitalize">{scripture.category}</span>
          </div>
        </section>
      </ScrollReveal>

      {chapters.length === 0 && (
        <div className="rounded-xl border border-dashed border-[hsl(var(--border))] py-12 text-center">
          <p className="text-[hsl(var(--muted-foreground))]">
            Chapters for this scripture have not been ingested yet.
          </p>
        </div>
      )}

      <ScrollReveal stagger staggerDelay={0.06} className="grid gap-4 md:grid-cols-2">
        {chapters.map((chapter) => (
          <ScrollRevealItem key={chapter.id} animation="fade-up">
            <FloatingCard className="knowledge-card" tiltMax={4}>
              <motion.a
                href={`/scriptures/${slug}/chapters/${chapter.chapter_number}`}
                className="block"
                whileHover={{ x: 3 }}
              >
                <p className="text-xs uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                  Chapter {chapter.chapter_number}
                </p>
                {chapter.sanskrit_title && (
                  <p className="sanskrit mt-2 text-sm text-[hsl(var(--muted-foreground))]">
                    {chapter.sanskrit_title}
                  </p>
                )}
                <h2 className="mt-1 text-lg font-semibold text-[hsl(var(--foreground))]">
                  {chapter.title ?? `Chapter ${chapter.chapter_number}`}
                </h2>
                {chapter.summary && (
                  <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                    {chapter.summary}
                  </p>
                )}
                <p className="mt-3 text-xs text-[hsl(var(--primary))]">
                  {chapter.verse_count} verses
                </p>
              </motion.a>
            </FloatingCard>
          </ScrollRevealItem>
        ))}
      </ScrollReveal>
    </main>
  );
}
