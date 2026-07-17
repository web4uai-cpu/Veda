import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getScriptureBySlugServer,
  getChapterServer,
  getVersesServer,
  SITE_URL,
} from '@/lib/server-api';
import { ScrollReveal, ScrollRevealItem } from '@/components/animations';

export const revalidate = 3600; // canonical content — revalidate hourly

interface PageProps {
  params: Promise<{ slug: string; chapterNumber: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, chapterNumber } = await params;
  const scripture = await getScriptureBySlugServer(slug);
  if (!scripture) return { title: 'Chapter Not Available' };

  const chapter = await getChapterServer(scripture.id, Number(chapterNumber));
  const title = chapter?.title
    ? `${scripture.name} — Chapter ${chapterNumber}: ${chapter.title}`
    : `${scripture.name} — Chapter ${chapterNumber}`;
  const description =
    chapter?.summary ??
    `Read ${scripture.name} chapter ${chapterNumber} with Sanskrit, transliteration, and English translation.`;
  return {
    title,
    description,
    alternates: { canonical: `/scriptures/${slug}/chapters/${chapterNumber}` },
    openGraph: {
      title: `${title} | VEDA`,
      description,
      type: 'article',
      url: `${SITE_URL}/scriptures/${slug}/chapters/${chapterNumber}`,
    },
  };
}

export default async function ChapterReaderPage({ params }: PageProps) {
  const { slug, chapterNumber: chapterParam } = await params;
  const chapterNumber = Number(chapterParam);
  if (!Number.isInteger(chapterNumber) || chapterNumber < 1) notFound();

  const scripture = await getScriptureBySlugServer(slug);
  if (!scripture) notFound();

  const [chapter, versesResult] = await Promise.all([
    getChapterServer(scripture.id, chapterNumber),
    getVersesServer(scripture.id, chapterNumber),
  ]);
  if (!chapter) notFound();

  const verses = versesResult?.verses ?? [];
  const totalChapters = scripture.chapter_count;
  const hasPrev = chapterNumber > 1;
  const hasNext = chapterNumber < totalChapters;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Chapter',
    name: chapter.title ?? `Chapter ${chapterNumber}`,
    position: chapterNumber,
    isPartOf: {
      '@type': 'Book',
      name: scripture.name,
      url: `${SITE_URL}/scriptures/${slug}`,
    },
    url: `${SITE_URL}/scriptures/${slug}/chapters/${chapterNumber}`,
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ScrollReveal animation="fade-up">
        <header className="mb-8 border-b border-[hsl(var(--border))] pb-6">
          <nav className="mb-3 flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
            <Link href="/scriptures" className="hover:text-[hsl(var(--primary))]">Scriptures</Link>
            <span>/</span>
            <Link href={`/scriptures/${slug}`} className="hover:text-[hsl(var(--primary))]">{scripture.name}</Link>
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
            <Link
              href={`/scriptures/${slug}/chapters/${chapterNumber - 1}`}
              className="group flex items-center gap-2 rounded-lg border border-[hsl(var(--border))] px-4 py-2.5 text-sm transition-colors hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]"
            >
              <svg className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Chapter {chapterNumber - 1}
            </Link>
          ) : <div />}
          <span className="text-xs text-[hsl(var(--muted-foreground))]">
            {chapterNumber} of {totalChapters}
          </span>
          {hasNext ? (
            <Link
              href={`/scriptures/${slug}/chapters/${chapterNumber + 1}`}
              className="group flex items-center gap-2 rounded-lg border border-[hsl(var(--border))] px-4 py-2.5 text-sm transition-colors hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]"
            >
              Chapter {chapterNumber + 1}
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ) : <div />}
        </nav>
      )}
    </main>
  );
}
