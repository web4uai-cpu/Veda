'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollReveal, ScrollRevealItem, FloatingCard, TextReveal } from '@/components/animations';
import { api, type ResearchResponse, type Citation, type EvidencePacket } from '@/lib/api';

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

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
    desc: 'Trace the evolution of a concept across all scriptural sources',
    query: 'Trace the concept of Dharma across the Vedas, Upanishads, Bhagavad Gita, and Manusmriti',
    icon: '🔬',
  },
  {
    title: 'Sanskrit Analysis',
    desc: 'Analyze root meanings, grammar, and semantic evolution of Sanskrit terms',
    query: 'Analyze the Sanskrit term Yoga — its root meaning, grammatical forms, and how its meaning evolved from Vedic to Classical usage',
    icon: '📝',
  },
  {
    title: 'Historical Analysis',
    desc: 'Trace the historical evolution of a practice or tradition through textual evidence',
    query: 'Trace the evolution of meditation practices from the Vedic period through the Upanishads to Patanjali\'s Yoga Sutras',
    icon: '📜',
  },
  {
    title: 'Textual Comparison',
    desc: 'Compare two specific texts on a shared theme with verse-level evidence',
    query: 'Compare the teachings on devotion (Bhakti) in the Bhagavad Gita Chapter 12 and the Narada Bhakti Sutras',
    icon: '📚',
  },
];

const LOADING_STEPS = [
  'Searching scriptures...',
  'Analyzing sources...',
  'Generating report...',
  'Verifying citations...',
];

const SOURCE_TYPE_STYLES: Record<string, { label: string; color: string }> = {
  SCRIPTURE: { label: 'Scripture', color: 'bg-amber-500/15 text-amber-400' },
  COMMENTARY: { label: 'Commentary', color: 'bg-blue-500/15 text-blue-400' },
  SCHOLARLY_SOURCE: { label: 'Scholarly', color: 'bg-emerald-500/15 text-emerald-400' },
  UPLOAD: { label: 'Upload', color: 'bg-slate-500/15 text-slate-400' },
  AI_NOTE: { label: 'AI Note', color: 'bg-purple-500/15 text-purple-400' },
};

// ---------------------------------------------------------------------------
// Report Renderer — parses [REFERENCE] citations, headers, bold
// ---------------------------------------------------------------------------

function renderReport(text: string): React.ReactNode[] {
  const paragraphs = text.split(/\n\n+/);
  const elements: React.ReactNode[] = [];

  for (let pi = 0; pi < paragraphs.length; pi++) {
    const para = paragraphs[pi]?.trim() ?? '';
    if (!para) continue;

    // Section headers: lines starting with ## or all-caps lines (>4 chars, no lowercase)
    if (/^#{1,3}\s+/.test(para)) {
      const headerText = para.replace(/^#{1,3}\s+/, '');
      elements.push(
        <h3 key={`h-${pi}`} className="mt-5 mb-2 text-base font-semibold text-[hsl(var(--foreground))]">
          {renderInline(headerText)}
        </h3>,
      );
      continue;
    }

    const firstLine = para.split('\n')[0] ?? '';
    if (/^[A-Z][A-Z\s:]{3,}$/.test(firstLine)) {
      const lines = para.split('\n');
      elements.push(
        <h3 key={`h-${pi}`} className="mt-5 mb-2 text-base font-semibold text-[hsl(var(--foreground))]">
          {lines[0]}
        </h3>,
      );
      if (lines.length > 1) {
        elements.push(
          <p key={`p-${pi}`} className="mb-3 leading-relaxed text-[hsl(var(--foreground))]">
            {renderInline(lines.slice(1).join('\n'))}
          </p>,
        );
      }
      continue;
    }

    elements.push(
      <p key={`p-${pi}`} className="mb-3 leading-relaxed text-[hsl(var(--foreground))]">
        {renderInline(para)}
      </p>,
    );
  }

  return elements;
}

function renderInline(text: string): React.ReactNode[] {
  // Split by [REFERENCE] citations and **bold** markers
  const parts: React.ReactNode[] = [];
  const regex = /\[([A-Z][a-zA-Z]*(?:\.\d+)+[a-z]?)\]|\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[1]) {
      // Citation reference
      parts.push(
        <span
          key={`cit-${match.index}`}
          className="mx-0.5 inline-block rounded-full bg-[hsl(var(--primary))]/10 px-2 py-0.5 text-[11px] font-medium text-[hsl(var(--primary))] align-baseline"
        >
          {match[1]}
        </span>,
      );
    } else if (match[2]) {
      // Bold
      parts.push(<strong key={`b-${match.index}`}>{match[2]}</strong>);
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface HistoryEntry {
  query: string;
  result: ResearchResponse;
  timestamp: number;
}

interface RelatedConcept {
  name: string;
  slug: string;
  sanskrit_name: string | null;
}

function timeAgo(ts: number): string {
  const seconds = Math.floor((Date.now() - ts) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

function groupBySourceType(packets: EvidencePacket[]): Record<string, EvidencePacket[]> {
  const groups: Record<string, EvidencePacket[]> = {};
  for (const p of packets) {
    const key = p.source_type || 'SCRIPTURE';
    if (!groups[key]) groups[key] = [];
    groups[key].push(p);
  }
  return groups;
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function ResearchPage() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<ResearchResponse | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [depth, setDepth] = useState<'standard' | 'deep'>('deep');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [expandedPackets, setExpandedPackets] = useState<Set<string>>(new Set());
  const [relatedConcepts, setRelatedConcepts] = useState<RelatedConcept[]>([]);
  const [copied, setCopied] = useState(false);

  const resultsRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearLoadingInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const resetToIdle = useCallback(() => {
    setStatus('idle');
    setResult(null);
    setError(null);
    setRelatedConcepts([]);
    setExpandedPackets(new Set());
    setLoadingStep(0);
  }, []);

  async function submitResearch(q = query) {
    const trimmed = q.trim();
    if (!trimmed) return;

    setQuery(trimmed);
    setStatus('loading');
    setError(null);
    setLoadingStep(0);
    setRelatedConcepts([]);
    setExpandedPackets(new Set());

    // Start loading step progression
    clearLoadingInterval();
    let step = 0;
    intervalRef.current = setInterval(() => {
      step = Math.min(step + 1, LOADING_STEPS.length - 1);
      setLoadingStep(step);
    }, 2500);

    try {
      const response = await api.research({ query: trimmed, depth });
      clearLoadingInterval();
      setResult(response);
      setStatus('ready');

      // Push to history (cap at 20)
      setHistory((prev) => {
        const next = [{ query: trimmed, result: response, timestamp: Date.now() }, ...prev];
        return next.slice(0, 20);
      });

      // Fetch related concepts (non-blocking)
      api.searchGraph(trimmed, undefined, 6)
        .then((res) => {
          setRelatedConcepts(
            res.results.map((r) => ({ name: r.name, slug: r.slug, sanskrit_name: r.sanskrit_name })),
          );
        })
        .catch(() => {});
    } catch (err) {
      clearLoadingInterval();
      setError(err instanceof Error ? err.message : 'Unable to reach VEDA API');
      setResult(null);
      setStatus('error');
    }
  }

  function loadFromHistory(entry: HistoryEntry) {
    setQuery(entry.query);
    setResult(entry.result);
    setStatus('ready');
    setError(null);
    setExpandedPackets(new Set());
    setShowHistory(false);
  }

  async function copyReport() {
    if (!result) return;
    await navigator.clipboard.writeText(result.report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function togglePacket(packetId: string) {
    setExpandedPackets((prev) => {
      const next = new Set(prev);
      if (next.has(packetId)) next.delete(packetId);
      else next.add(packetId);
      return next;
    });
  }

  // Auto-scroll to results
  useEffect(() => {
    if ((status === 'ready' || status === 'error') && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [status]);

  // Cleanup interval on unmount
  useEffect(() => clearLoadingInterval, [clearLoadingInterval]);

  const evidenceGroups = result ? groupBySourceType(result.evidence) : {};

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
      {/* Header */}
      <div className="mb-8">
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

      {/* History Panel */}
      {history.length > 0 && (
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Research History ({history.length})
            <svg className={`h-3 w-3 transition-transform ${showHistory ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-2 max-h-48 space-y-1.5 overflow-y-auto rounded-xl border border-[hsl(var(--border))] p-3 glass scrollbar-thin">
                  {history.map((entry, i) => (
                    <button
                      key={`${entry.timestamp}-${i}`}
                      type="button"
                      onClick={() => loadFromHistory(entry)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-[hsl(var(--primary))]/5"
                    >
                      <span className="flex-1 truncate text-[hsl(var(--foreground))]">
                        {entry.query.length > 60 ? `${entry.query.slice(0, 60)}...` : entry.query}
                      </span>
                      {entry.result.confidence > 0 && (
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          entry.result.confidence >= 0.8 ? 'bg-emerald-500/15 text-emerald-400'
                          : entry.result.confidence >= 0.5 ? 'bg-amber-500/15 text-amber-400'
                          : 'bg-red-500/15 text-red-400'
                        }`}>
                          {Math.round(entry.result.confidence * 100)}%
                        </span>
                      )}
                      <span className="shrink-0 text-[10px] text-[hsl(var(--muted-foreground))]">
                        {timeAgo(entry.timestamp)}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Query Form */}
      <ScrollReveal animation="scale-up" delay={0.3}>
        <div className="mb-10 rounded-[20px] p-8 glass">
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

          {/* Badges + Depth + Submit */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {['Evidence-Based', 'Citations Required', 'Deep Analysis'].map((label) => (
                <span
                  key={label}
                  className="rounded-full bg-[hsl(var(--primary))]/10 px-3 py-1 text-xs font-medium text-[hsl(var(--primary))]"
                >
                  {label}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {/* Depth Toggle */}
              <div className="flex items-center gap-1 rounded-full border border-[hsl(var(--border))] p-0.5">
                {(['standard', 'deep'] as const).map((d) => (
                  <motion.button
                    key={d}
                    type="button"
                    onClick={() => setDepth(d)}
                    className={`relative rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      depth === d ? 'text-white' : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
                    }`}
                  >
                    {depth === d && (
                      <motion.div
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(32,80%,55%)]"
                        layoutId="depth-highlight"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 capitalize">{d}</span>
                  </motion.button>
                ))}
              </div>

              <motion.button
                id="research-submit"
                type="button"
                onClick={() => submitResearch()}
                disabled={status === 'loading' || !query.trim()}
                className="shimmer-btn rounded-xl bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(32,80%,55%)] px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.03, boxShadow: '0 0 25px rgba(201, 122, 36, 0.3)' }}
                whileTap={{ scale: 0.97 }}
              >
                {status === 'loading' ? 'Researching...' : 'Start Research'}
              </motion.button>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* ----------------------------------------------------------------- */}
      {/* Results Area                                                      */}
      {/* ----------------------------------------------------------------- */}

      {/* Multi-step Loading */}
      {status === 'loading' && (
        <div ref={resultsRef} className="mb-8 rounded-2xl border border-[hsl(var(--border))] p-6 glass">
          <div className="space-y-3">
            {LOADING_STEPS.map((step, i) => {
              const isDone = i < loadingStep;
              const isActive = i === loadingStep;
              return (
                <motion.div
                  key={step}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: isActive || isDone ? 1 : 0.3, x: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.3 }}
                >
                  {isDone ? (
                    <svg className="h-4 w-4 shrink-0 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : isActive ? (
                    <div className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-[hsl(var(--primary))] border-t-transparent" />
                  ) : (
                    <div className="h-2 w-2 shrink-0 rounded-full bg-[hsl(var(--muted-foreground))]/30 ml-1" />
                  )}
                  <span className={`text-sm ${
                    isActive ? 'text-[hsl(var(--foreground))]' : isDone ? 'text-emerald-400' : 'text-[hsl(var(--muted-foreground))]/50'
                  }`}>
                    {step}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <div ref={resultsRef} className="mb-8">
          <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-5">
            <p className="text-sm text-red-200">{error}</p>
            <button
              type="button"
              onClick={() => submitResearch()}
              className="mt-3 text-sm text-[hsl(var(--primary))] hover:underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Ready — Research Report */}
      {status === 'ready' && result && (
        <div ref={resultsRef} className="mb-8 space-y-4">
          {/* Query Header + Back */}
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={resetToIdle}
              className="mt-1 shrink-0 rounded-lg border border-[hsl(var(--border))] p-2 text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))]/30"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div className="flex-1">
              <p className="text-xs font-medium uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                Research Query
              </p>
              <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">{query}</h2>
            </div>
            <span className="shrink-0 rounded-full bg-[hsl(var(--primary))]/10 px-2.5 py-1 text-[10px] font-medium text-[hsl(var(--primary))] capitalize">
              {depth} depth
            </span>
          </div>

          {/* Report Card */}
          <div className="rounded-2xl border border-[hsl(var(--primary))]/20 bg-[hsl(var(--primary))]/5 p-6">
            <div className="mb-4 flex items-center justify-between">
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
                {result.model_used && result.model_used !== 'none' && result.model_used !== 'error' && (
                  <span>{Math.round(result.query_time_ms)}ms</span>
                )}
              </div>
            </div>

            {/* Rendered Report */}
            <div className="prose prose-invert prose-sm max-w-none">
              {renderReport(result.report)}
            </div>

            {/* Citation Badges */}
            {result.citations.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-1.5">
                {result.citations.map((c: Citation) => (
                  <span key={c.citation_id} className="rounded-full bg-[hsl(var(--primary))]/10 px-2 py-0.5 text-[11px] text-[hsl(var(--primary))]">
                    {c.reference}
                  </span>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-5 flex items-center gap-3 border-t border-[hsl(var(--border))]/30 pt-4">
              <button
                type="button"
                onClick={copyReport}
                className="flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] px-3 py-1.5 text-xs text-[hsl(var(--muted-foreground))] transition-colors hover:border-[hsl(var(--primary))]/30 hover:text-[hsl(var(--foreground))]"
              >
                {copied ? (
                  <>
                    <svg className="h-3.5 w-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy Report
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={resetToIdle}
                className="flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] px-3 py-1.5 text-xs text-[hsl(var(--muted-foreground))] transition-colors hover:border-[hsl(var(--primary))]/30 hover:text-[hsl(var(--foreground))]"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Research
              </button>
            </div>
          </div>

          {/* Warnings */}
          {result.warnings.map((w: string) => (
            <div key={w} className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-amber-100">
              {w}
            </div>
          ))}

          {/* Evidence Packets — grouped by source type */}
          {result.evidence.length > 0 && (
            <div className="space-y-4">
              <h3 className="pt-2 text-xs font-medium uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                Source Evidence ({result.evidence.length})
              </h3>

              {Object.entries(evidenceGroups).map(([sourceType, packets]) => {
                const style = SOURCE_TYPE_STYLES[sourceType] ?? SOURCE_TYPE_STYLES['SCRIPTURE']!;
                return (
                  <div key={sourceType}>
                    <div className="mb-2 flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${style.color}`}>
                        {style.label}
                      </span>
                      <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
                        {packets.length} source{packets.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {packets.map((packet) => {
                        const isExpanded = expandedPackets.has(packet.packet_id);
                        return (
                          <article
                            key={packet.packet_id}
                            className="rounded-2xl border border-[hsl(var(--border))] glass transition-colors hover:border-[hsl(var(--border))]/80"
                          >
                            <button
                              type="button"
                              onClick={() => togglePacket(packet.packet_id)}
                              className="flex w-full items-center gap-3 px-5 py-3.5 text-left"
                            >
                              <svg
                                className={`h-4 w-4 shrink-0 text-[hsl(var(--muted-foreground))] transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                                fill="none" stroke="currentColor" viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                              <span className="rounded-full bg-[hsl(var(--primary))]/10 px-2 py-0.5 text-[11px] text-[hsl(var(--primary))]">
                                {packet.citation.reference}
                              </span>
                              <span className="flex-1 truncate text-sm font-medium text-[hsl(var(--foreground))]">
                                {packet.title}
                              </span>
                              <span className="shrink-0 text-[10px] text-[hsl(var(--muted-foreground))]">
                                {Math.round(packet.citation.confidence * 100)}% · Level {packet.citation.evidence_level}
                              </span>
                            </button>
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="border-t border-[hsl(var(--border))]/30 px-5 py-4">
                                    <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
                                      <span>{packet.citation.source_name}</span>
                                      {packet.retrieval_source && (
                                        <span className="rounded bg-[hsl(var(--muted))]/30 px-1.5 py-0.5 text-[10px]">
                                          {packet.retrieval_source}
                                        </span>
                                      )}
                                    </div>
                                    <p className="whitespace-pre-line text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                                      {packet.content}
                                    </p>
                                    {/* Highlights */}
                                    {packet.highlights && packet.highlights.length > 0 && (
                                      <div className="mt-3 space-y-1">
                                        {packet.highlights.map((hl, hi) => (
                                          <span
                                            key={hi}
                                            className="mr-2 inline-block rounded bg-amber-500/15 px-2 py-0.5 text-xs text-amber-300"
                                          >
                                            {hl}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </article>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Related Concepts */}
          {relatedConcepts.length > 0 && (
            <div className="pt-2">
              <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                Related Concepts
              </h3>
              <div className="flex flex-wrap gap-2">
                {relatedConcepts.map((concept) => (
                  <Link
                    key={concept.slug}
                    href={`/concepts/${concept.slug}`}
                    className="group rounded-full border border-[hsl(var(--border))] px-3 py-1.5 text-sm transition-all hover:border-[hsl(var(--primary))]/40 hover:bg-[hsl(var(--primary))]/5"
                  >
                    <span className="text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--primary))]">
                      {concept.name}
                    </span>
                    {concept.sanskrit_name && (
                      <span className="ml-1.5 text-xs text-[hsl(var(--muted-foreground))]">
                        {concept.sanskrit_name}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* Idle — Research Templates                                         */}
      {/* ----------------------------------------------------------------- */}
      {status === 'idle' && (
        <>
          <ScrollReveal animation="slide-right">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">
                Research Templates
              </h2>
              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                Start with a pre-built research query, or write your own above
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal stagger staggerDelay={0.08} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
