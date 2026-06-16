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
        <div className="h-56 animate-pulse rounded-2xl border border-[hsl(var(--border))] glass" />
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
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
      <ScrollReveal animation="fade-up">
        <header className="mb-8 border-b border-[hsl(var(--border))] pb-6">
          <a
            href={`/scriptures/${slug}`}
            className="text-sm text-[hsl(var(--primary))] hover:underline"
          >
            {scripture.name}
          </a>
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
    </main>
  );
}
