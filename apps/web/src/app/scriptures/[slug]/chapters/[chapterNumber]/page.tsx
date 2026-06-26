'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api, type Chapter, type Scripture, type Verse } from '@/lib/api';
import { ScrollReveal, ScrollRevealItem } from '@/components/animations';

export default function ChapterReaderPage() {
  const params = useParams<{ slug: string; chapterNumber: string }>();
  const slug = params.slug;
  const chapterNumber = Number(params.chapterNumber);
  const [scripture, setScripture] = useState<Scripture | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [totalChapters, setTotalChapters] = useState(0);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let cancelled = false;

    async function loadChapter() {
      try {
        setStatus('loading');
        const scriptureResult = await api.getScriptureBySlug(slug);
        const [chapterResult, versesResult] = await Promise.all([
          api.getChapter(scriptureResult.id, chapterNumber),
          api.getVerses(scriptureResult.id, chapterNumber, 1, 200),
        ]);
        if (!cancelled) {
          setScripture(scriptureResult);
          setChapter(chapterResult);
          setVerses(versesResult.verses);
          setTotalChapters(scriptureResult.chapter_count);
          setStatus('ready');
        }
      } catch {
        if (!cancelled) setStatus('error');
      }
    }

    loadChapter();
    return () => {
      cancelled = true;
    };
  }, [chapterNumber, slug]);

  if (status === 'loading') {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10 lg:px-8">
        <div className="mb-4 h-4 w-32 animate-pulse rounded bg-[hsl(var(--muted))]/40" />
        <div className="mb-2 h-5 w-48 animate-pulse rounded bg-[hsl(var(--muted))]/30" />
        <div className="mb-8 h-10 w-80 animate-pulse rounded bg-[hsl(var(--muted))]/40" />
        <div className="space-y-6">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="space-y-2 rounded-xl border border-[hsl(var(--border))] p-5" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="h-3 w-16 animate-pulse rounded bg-[hsl(var(--muted))]/30" />
              <div className="h-6 w-full animate-pulse rounded bg-[hsl(var(--muted))]/20" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-[hsl(var(--muted))]/15" />
              <div className="h-4 w-full animate-pulse rounded bg-[hsl(var(--muted))]/20" />
            </div>
          ))}
        </div>
      </main>
    );
  }

  if (status === 'error' || !scripture || !chapter) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10 text-center lg:px-8">
        <h1 className="scripture-title mb-3 text-3xl font-bold">Chapter Not Available</h1>
        <p className="text-[hsl(var(--muted-foreground))]">
          Start the API and ingest verses before opening this chapter.
        </p>
        <a
          href={`/scriptures/${slug}`}
          className="mt-4 inline-block text-sm text-[hsl(var(--primary))] hover:underline"
        >
          Back to scripture
        </a>
      </main>
    );
  }

  const hasPrev = chapterNumber > 1;
  const hasNext = chapterNumber < totalChapters;

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
      <ScrollReveal animation="fade-up">
        <header className="mb-8 border-b border-[hsl(var(--border))] pb-6">
          <nav className="mb-3 flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
            <a href="/scriptures" className="hover:text-[hsl(var(--primary))]">Scriptures</a>
            <span>/</span>
            <a href={`/scriptures/${slug}`} className="hover:text-[hsl(var(--primary))]">{scripture.name}</a>
            <span>/</span>
            <span className="text-[hsl(var(--foreground))]">Chapter {chapter.chapter_number}</span>
          </nav>
          {chapter.sanskrit_title && (
            <p className="sanskrit mt-4 text-lg text-[hsl(var(--muted-foreground))]">
              {chapter.sanskrit_title}
            </p>
          )}
          <h1 className="scripture-title mt-1 text-4xl font-bold text-[hsl(var(--foreground))]">
            Chapter {chapter.chapter_number}: {chapter.title}
          </h1>
          {chapter.summary && (
            <p className="mt-3 leading-relaxed text-[hsl(var(--muted-foreground))]">
              {chapter.summary}
            </p>
          )}
          <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
            {verses.length} verses
          </p>
        </header>
      </ScrollReveal>

      <ScrollReveal stagger staggerDelay={0.04} className="space-y-5">
        {verses.map((verse) => {
          const sanskrit = verse.contents.find((item) => item.content_type === 'sanskrit');
          const transliteration = verse.contents.find(
            (item) => item.content_type === 'transliteration',
          );
          const translation =
            verse.contents.find(
              (item) => item.content_type === 'translation' && item.is_primary,
            ) ?? verse.contents.find((item) => item.content_type === 'translation');

          return (
            <ScrollRevealItem key={verse.id} animation="fade-up">
              <article className="verse-block">
                <p className="mb-3 text-xs uppercase tracking-wide text-[hsl(var(--primary))]">
                  {verse.canonical_reference}
                </p>
                {sanskrit && <p className="sanskrit text-xl leading-loose">{sanskrit.content}</p>}
                {transliteration && (
                  <p className="mt-3 italic text-[hsl(var(--muted-foreground))]">
                    {transliteration.content}
                  </p>
                )}
                {translation && (
                  <p className="mt-4 leading-relaxed text-[hsl(var(--foreground))]">
                    {translation.content}
                  </p>
                )}
                {translation?.source && (
                  <p className="mt-3 text-xs text-[hsl(var(--muted-foreground))]">
                    Source: {translation.source}
                  </p>
                )}
              </article>
            </ScrollRevealItem>
          );
        })}
      </ScrollReveal>

      {/* Prev / Next Chapter Navigation */}
      {totalChapters > 1 && (
        <nav className="mt-10 flex items-center justify-between border-t border-[hsl(var(--border))] pt-6">
          {hasPrev ? (
            <a
              href={`/scriptures/${slug}/chapters/${chapterNumber - 1}`}
              className="group flex items-center gap-2 rounded-lg border border-[hsl(var(--border))] px-4 py-2.5 text-sm transition-colors hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]"
            >
              <svg className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Chapter {chapterNumber - 1}
            </a>
          ) : <div />}
          <span className="text-xs text-[hsl(var(--muted-foreground))]">
            {chapterNumber} of {totalChapters}
          </span>
          {hasNext ? (
            <a
              href={`/scriptures/${slug}/chapters/${chapterNumber + 1}`}
              className="group flex items-center gap-2 rounded-lg border border-[hsl(var(--border))] px-4 py-2.5 text-sm transition-colors hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]"
            >
              Chapter {chapterNumber + 1}
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          ) : <div />}
        </nav>
      )}
    </main>
  );
}
