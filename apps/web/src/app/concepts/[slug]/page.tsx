'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { api, type ConceptDetail } from '@/lib/api';
import { ScrollReveal, ScrollRevealItem, FloatingCard } from '@/components/animations';

export default function ConceptDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [detail, setDetail] = useState<ConceptDetail | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let cancelled = false;

    async function loadConcept() {
      try {
        setStatus('loading');
        const result = await api.getConcept(slug);
        if (!cancelled) {
          setDetail(result);
          setStatus('ready');
        }
      } catch {
        if (!cancelled) setStatus('error');
      }
    }

    loadConcept();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (status === 'loading') {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10 lg:px-8">
        <div className="h-40 animate-pulse rounded-2xl border border-[hsl(var(--border))] glass" />
      </main>
    );
  }

  if (status === 'error' || !detail) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10 text-center lg:px-8">
        <h1 className="scripture-title mb-3 text-3xl font-bold">Concept Not Available</h1>
        <p className="text-[hsl(var(--muted-foreground))]">
          Start Neo4j and seed the ontology graph to explore this concept.
        </p>
      </main>
    );
  }

  const { concept } = detail;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
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
            <motion.a
              key={item.slug}
              href={`/concepts/${item.slug}`}
              className="block rounded-xl border border-[hsl(var(--border))] p-3 text-sm glass"
              whileHover={{ x: 3, borderColor: 'rgba(201, 122, 36, 0.35)' }}
            >
              <span className="font-medium text-[hsl(var(--foreground))]">{item.name}</span>
              <span className="ml-2 text-xs text-[hsl(var(--muted-foreground))]">
                {item.relationship}
              </span>
            </motion.a>
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
