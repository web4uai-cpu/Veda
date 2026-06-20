'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ScrollReveal, ScrollRevealItem, FloatingCard, TextReveal } from '@/components/animations';
import { api, type ResearchResponse, type Citation } from '@/lib/api';

const TEMPLATES = [
  {
    title: 'Comparative Philosophy',
    desc: 'Compare interpretations of key concepts across Advaita, Vishishtadvaita, and Dvaita schools',
    query: 'Compare the concept of Brahman across Advaita, Vishishtadvaita, and Dvaita Vedanta with evidence from primary sources',
    icon: '⚖️',
  },
  {
    title: 'Scripture Cross-Reference',
    desc: 'Find parallel passages and shared themes between the Upanishads and the Bhagavad Gita',
    query: 'Find parallel passages about Atman and self-realization in the Upanishads and Bhagavad Gita',
    icon: '🔗',
  },
  {
    title: 'Concept Deep-Dive',
    desc: 'Trace the evolution of a concept (e.g. Dharma) across all scriptural sources',
    query: 'Trace the concept of Dharma across the Vedas, Upanishads, Bhagavad Gita, and Manusmriti',
    icon: '🔬',
  },
  {
    title: 'Sanskrit Analysis',
    desc: 'Analyze root meanings, grammar, and semantic evolution of Sanskrit terms',
    query: 'Analyze the Sanskrit term Yoga — its root meaning, grammatical forms, and how its meaning evolved from Vedic to Classical usage',
    icon: '📝',
  },
];

export default function ResearchPage() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<ResearchResponse | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function submitResearch(q = query) {
    const trimmed = q.trim();
    if (!trimmed) return;

    setQuery(trimmed);
    setStatus('loading');
    setError(null);

    try {
      const response = await api.research({ query: trimmed, depth: 'deep' });
      setResult(response);
      setStatus('ready');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reach VEDA API');
      setResult(null);
      setStatus('error');
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
      <div className="mb-10">
        <ScrollReveal animation="fade-up">
          <h1 className="scripture-title mb-2 text-3xl font-bold text-[hsl(var(--foreground))]">
            <TextReveal text="Research" />
          </h1>
        </ScrollReveal>
        <ScrollReveal animation="fade-up" delay={0.2}>
          <p className="text-lg text-[hsl(var(--muted-foreground))]">
            Deep comparative analysis powered by citation-verified evidence
          </p>
        </ScrollReveal>
      </div>

      {/* New Research */}
      <ScrollReveal animation="scale-up" delay={0.3}>
        <div className="mb-12 rounded-[20px] p-8 glass">
          <h2 className="mb-4 text-lg font-semibold text-[hsl(var(--foreground))]">
            New Research Query
          </h2>
          <motion.textarea
            id="research-input"
            rows={3}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submitResearch();
              }
            }}
            placeholder="e.g. Compare the concept of Atman in Advaita Vedanta vs Vishishtadvaita, with evidence from primary sources..."
            className="glow-input mb-4 w-full resize-none rounded-xl border border-[hsl(var(--border))] bg-transparent p-4 text-base text-[hsl(var(--foreground))] outline-none transition-all focus:border-[hsl(var(--primary))]/40 placeholder:text-[hsl(var(--muted-foreground))]"
            whileFocus={{
              boxShadow: '0 0 30px rgba(201, 122, 36, 0.08)',
            }}
          />
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {['Evidence-Based', 'Citations Required', 'Deep Analysis'].map((label, i) => (
                <span
                  key={label}
                  className="rounded-full bg-[hsl(var(--primary))]/10 px-3 py-1 text-xs font-medium text-[hsl(var(--primary))]"
                >
                  {label}
                </span>
              ))}
            </div>
            <motion.button
              id="research-submit"
              type="button"
              onClick={() => submitResearch()}
              disabled={status === 'loading'}
              className="shimmer-btn rounded-xl bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(32,80%,55%)] px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              whileHover={{ scale: 1.03, boxShadow: '0 0 25px rgba(201, 122, 36, 0.3)' }}
              whileTap={{ scale: 0.97 }}
            >
              {status === 'loading' ? 'Researching...' : 'Start Research'}
            </motion.button>
          </div>
        </div>
      </ScrollReveal>

      {/* Results */}
      {status === 'loading' && (
        <div className="mb-8 rounded-2xl border border-[hsl(var(--border))] p-6 glass">
          <div className="flex items-center gap-3 text-sm text-[hsl(var(--muted-foreground))]">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[hsl(var(--primary))] border-t-transparent" />
            Searching scriptures, analyzing sources, generating research report...
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="mb-8 rounded-2xl border border-red-500/30 bg-red-500/5 p-5 text-sm text-red-200">
          {error}
        </div>
      )}

      {status === 'ready' && result && (
        <div className="mb-8 space-y-4">
          {/* Report */}
          <div className="rounded-2xl border border-[hsl(var(--primary))]/20 bg-[hsl(var(--primary))]/5 p-6">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-[hsl(var(--primary))]">
                Research Report
              </span>
              <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
                {result.confidence > 0 && (
                  <span className={`rounded-full px-2 py-0.5 ${
                    result.confidence >= 0.8 ? 'bg-emerald-500/15 text-emerald-400'
                    : result.confidence >= 0.5 ? 'bg-amber-500/15 text-amber-400'
                    : 'bg-red-500/15 text-red-400'
                  }`}>
                    {Math.round(result.confidence * 100)}% confidence
                  </span>
                )}
                <span>{Math.round(result.query_time_ms)}ms</span>
              </div>
            </div>
            <div className="prose prose-invert prose-sm max-w-none text-[hsl(var(--foreground))]">
              <p className="whitespace-pre-line leading-relaxed">{result.report}</p>
            </div>
            {result.citations.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {result.citations.map((c: Citation) => (
                  <span key={c.citation_id} className="rounded-full bg-[hsl(var(--primary))]/10 px-2 py-0.5 text-[11px] text-[hsl(var(--primary))]">
                    {c.reference}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Warnings */}
          {result.warnings.map((w: string) => (
            <div key={w} className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-amber-100">
              {w}
            </div>
          ))}

          {/* Evidence */}
          {result.evidence.length > 0 && (
            <>
              <h3 className="pt-2 text-xs font-medium uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                Source Evidence ({result.evidence.length})
              </h3>
              {result.evidence.map((packet) => (
                <article key={packet.packet_id} className="rounded-2xl border border-[hsl(var(--border))] p-5 glass">
                  <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
                    <span className="rounded-full bg-[hsl(var(--primary))]/10 px-2 py-1 text-[hsl(var(--primary))]">
                      {packet.citation.reference}
                    </span>
                    <span>{packet.citation.source_name}</span>
                    <span>{Math.round(packet.citation.confidence * 100)}%</span>
                    <span>Level {packet.citation.evidence_level}</span>
                  </div>
                  <h4 className="mb-2 text-base font-semibold text-[hsl(var(--foreground))]">{packet.title}</h4>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">{packet.content}</p>
                </article>
              ))}
            </>
          )}
        </div>
      )}

      {/* Research Templates */}
      {status === 'idle' && (
        <>
          <ScrollReveal animation="slide-right">
            <h2 className="mb-4 text-lg font-semibold text-[hsl(var(--foreground))]">
              Research Templates
            </h2>
          </ScrollReveal>

          <ScrollReveal stagger staggerDelay={0.1} className="grid gap-4 sm:grid-cols-2">
            {TEMPLATES.map((template) => (
              <ScrollRevealItem key={template.title} animation="fade-up">
                <FloatingCard className="knowledge-card group cursor-pointer" tiltMax={5}>
                  <button
                    type="button"
                    className="w-full text-left"
                    onClick={() => submitResearch(template.query)}
                  >
                    <motion.span
                      className="mb-2 block text-2xl"
                      whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.4 }}
                    >
                      {template.icon}
                    </motion.span>
                    <h3 className="mb-1 text-base font-semibold text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--primary))] transition-colors">
                      {template.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                      {template.desc}
                    </p>
                  </button>
                </FloatingCard>
              </ScrollRevealItem>
            ))}
          </ScrollReveal>
        </>
      )}
    </div>
  );
}
