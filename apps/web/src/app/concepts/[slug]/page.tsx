import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getConceptServer, SITE_URL } from '@/lib/server-api';
import { ScrollReveal, ScrollRevealItem, FloatingCard } from '@/components/animations';

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const detail = await getConceptServer(slug);
  if (!detail) return { title: 'Concept Not Available' };

  const { concept } = detail;
  const description =
    concept.summary ??
    `Explore ${concept.name} in the VEDA knowledge graph — related concepts, schools, and teachers.`;
  return {
    title: concept.name,
    description,
    alternates: { canonical: `/concepts/${slug}` },
    openGraph: {
      title: `${concept.name} | VEDA`,
      description,
      type: 'article',
      url: `${SITE_URL}/concepts/${slug}`,
    },
  };
}

export default async function ConceptDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const detail = await getConceptServer(slug);
  if (!detail) notFound();

  const { concept } = detail;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    name: concept.name,
    alternateName: concept.sanskrit_name ?? undefined,
    description: concept.summary ?? undefined,
    url: `${SITE_URL}/concepts/${slug}`,
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ScrollReveal animation="fade-up">
        <section className="mb-8 rounded-2xl border border-[hsl(var(--border))] p-6 glass">
          {concept.sanskrit_name && (
            <p className="sanskrit mb-2 text-xl text-[hsl(var(--muted-foreground))]">
              {concept.sanskrit_name}
            </p>
          )}
          <h1 className="scripture-title text-4xl font-bold text-[hsl(var(--foreground))]">
            {concept.name}
          </h1>
          {concept.summary && (
            <p className="mt-3 max-w-3xl leading-relaxed text-[hsl(var(--muted-foreground))]">
              {concept.summary}
            </p>
          )}
          {concept.category && (
            <p className="mt-4 text-sm uppercase tracking-wide text-[hsl(var(--primary))]">
              {concept.category}
            </p>
          )}
        </section>
      </ScrollReveal>

      <div className="grid gap-5 lg:grid-cols-3">
        <ConceptPanel title="Related Concepts" empty="No related concepts yet.">
          {detail.related_concepts.map((item) => (
            <Link
              key={item.slug}
              href={`/concepts/${item.slug}`}
              className="block rounded-xl border border-[hsl(var(--border))] p-3 text-sm glass transition-all hover:translate-x-1 hover:border-[hsl(var(--primary))]/40"
            >
              <span className="font-medium text-[hsl(var(--foreground))]">{item.name}</span>
              <span className="ml-2 text-xs text-[hsl(var(--muted-foreground))]">
                {item.relationship}
              </span>
            </Link>
          ))}
        </ConceptPanel>

        <ConceptPanel title="Schools" empty="No school links yet.">
          {detail.schools.map((school) => (
            <div key={school.slug} className="rounded-xl border border-[hsl(var(--border))] p-3 glass">
              <p className="font-medium text-[hsl(var(--foreground))]">{school.name}</p>
              {school.summary && (
                <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{school.summary}</p>
              )}
            </div>
          ))}
        </ConceptPanel>

        <ConceptPanel title="Teachers" empty="No teacher links yet.">
          {detail.persons.map((person) => (
            <div key={person.name} className="rounded-xl border border-[hsl(var(--border))] p-3 glass">
              <p className="font-medium text-[hsl(var(--foreground))]">{person.name}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                {[person.type, person.period].filter(Boolean).join(' · ')}
              </p>
            </div>
          ))}
        </ConceptPanel>
      </div>
    </main>
  );
}

function ConceptPanel({
  title,
  empty,
  children,
}: {
  title: string;
  empty: string;
  children: React.ReactNode[];
}) {
  return (
    <ScrollRevealItem animation="fade-up">
      <FloatingCard className="knowledge-card min-h-48" tiltMax={3}>
        <h2 className="mb-4 text-lg font-semibold text-[hsl(var(--foreground))]">{title}</h2>
        <div className="space-y-3">
          {children.length > 0 ? children : (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">{empty}</p>
          )}
        </div>
      </FloatingCard>
    </ScrollRevealItem>
  );
}
