import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getScriptureBySlugServer,
  getChaptersServer,
  SITE_URL,
} from '@/lib/server-api';
import { ScrollReveal, ScrollRevealItem, FloatingCard } from '@/components/animations';

export const revalidate = 3600; // canonical content — revalidate hourly

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const scripture = await getScriptureBySlugServer(slug);
  if (!scripture) {
    return { title: 'Scripture Not Available' };
  }
  const description =
    scripture.description ??
    `Read the ${scripture.name} with Sanskrit, IAST transliteration, and English translation.`;
  return {
    title: scripture.name,
    description,
    alternates: { canonical: `/scriptures/${slug}` },
    openGraph: {
      title: `${scripture.name} | VEDA`,
      description,
      type: 'book',
      url: `${SITE_URL}/scriptures/${slug}`,
    },
  };
}

export default async function ScriptureDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const scripture = await getScriptureBySlugServer(slug);
  if (!scripture) notFound();

  const chapters = (await getChaptersServer(scripture.id)) ?? [];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: scripture.name,
    alternateName: scripture.sanskrit_name ?? undefined,
    description: scripture.description ?? undefined,
    inLanguage: scripture.language,
    url: `${SITE_URL}/scriptures/${slug}`,
    numberOfPages: scripture.chapter_count > 0 ? scripture.chapter_count : undefined,
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ScrollReveal animation="fade-up">
        <nav className="mb-4 flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
          <Link href="/scriptures" className="hover:text-[hsl(var(--primary))]">Scriptures</Link>
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
              <Link
                href={`/scriptures/${slug}/chapters/${chapter.chapter_number}`}
                className="block transition-transform hover:translate-x-1"
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
              </Link>
            </FloatingCard>
          </ScrollRevealItem>
        ))}
      </ScrollReveal>
    </main>
  );
}
