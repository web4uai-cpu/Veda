'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ScrollReveal, ScrollRevealItem } from '@/components/animations';
import { api, type AskResponse, type EvidencePacket, type SearchMode } from '@/lib/api';

const KnowledgeOrb = dynamic(() => import('@/components/three/KnowledgeOrb'), { ssr: false });

const SUGGESTIONS = [
  { q: 'What is Atman according to the Upanishads?', icon: '🕉️' },
  { q: 'Explain Karma Yoga from the Bhagavad Gita', icon: '📖' },
  { q: 'How do Advaita and Dvaita differ on Brahman?', icon: '⚖️' },
  { q: 'What does the Katha Upanishad say about death?', icon: '🔬' },
];

const MODES = [
  { label: 'Quick', desc: '< 500ms' },
  { label: 'Scholar', desc: 'Deep analysis' },
  { label: 'Research', desc: 'Full report' },
];

export default function AskPage() {
  const [question, setQuestion] = useState('');
  const [mode, setMode] = useState<SearchMode>('quick');
  const [askResponse, setAskResponse] = useState<AskResponse | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function submitQuestion(nextQuestion = question) {
    const query = nextQuestion.trim();
    if (!query) return;

    setQuestion(query);
    setStatus('loading');
    setError(null);

    try {
      const response = await api.ask({ query, mode });
      setAskResponse(response);
      setStatus('ready');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reach VEDA API');
      setAskResponse(null);
      setStatus('error');
    }
  }

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col lg:h-screen">
      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 py-8 lg:px-8">
        <div className="mx-auto max-w-3xl">
          {/* Welcome State */}
          <div className="flex flex-col items-center justify-center py-12 text-center">
            {/* 3D Knowledge Orb */}
            <motion.div
              className="mb-6 h-32 w-32"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: [0.25, 0.8, 0.25, 1] }}
            >
              <KnowledgeOrb pulse />
            </motion.div>

            <motion.h1
              className="scripture-title mb-3 text-3xl font-bold text-[hsl(var(--foreground))]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Ask VEDA
            </motion.h1>
            <motion.p
              className="mb-8 max-w-md text-base text-[hsl(var(--muted-foreground))]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              Ask any question about Sanatan Dharma. Every answer comes with citations
              from authentic scriptures and verified sources.
            </motion.p>

            {/* Suggested Questions */}
            <ScrollReveal stagger staggerDelay={0.1} className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
              {SUGGESTIONS.map((suggestion) => (
                <ScrollRevealItem key={suggestion.q} animation="scale-up">
                  <motion.button
                    type="button"
                    onClick={() => submitQuestion(suggestion.q)}
                    className="rounded-xl border border-[hsl(var(--border))] px-4 py-3 text-left text-sm text-[hsl(var(--foreground))] glass transition-all"
                    whileHover={{
                      borderColor: 'rgba(201, 122, 36, 0.3)',
                      backgroundColor: 'rgba(201, 122, 36, 0.05)',
                      y: -2,
                      boxShadow: '0 8px 24px rgba(201, 122, 36, 0.08)',
                    }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <motion.span
                      className="mb-1 block text-lg"
                      whileHover={{ scale: 1.15 }}
                    >
                      {suggestion.icon}
                    </motion.span>
                    {suggestion.q}
                  </motion.button>
                </ScrollRevealItem>
              ))}
            </ScrollReveal>

            {/* Mode Selector */}
            <motion.div
              className="mt-8 flex items-center gap-1 rounded-full border border-[hsl(var(--border))] p-1 glass"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              {MODES.map((option) => (
                <motion.button
                  key={option.label}
                  id={`mode-${option.label.toLowerCase()}`}
                  type="button"
                  onClick={() => setMode(option.label.toLowerCase() as SearchMode)}
                  className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    option.label.toLowerCase() === mode
                      ? 'text-white'
                      : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {option.label.toLowerCase() === mode && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(32,80%,55%)]"
                      layoutId="mode-highlight"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{option.label}</span>
                </motion.button>
              ))}
            </motion.div>

            {/* Results */}
            {(status === 'loading' || status === 'ready' || status === 'error') && (
              <div className="mt-8 w-full max-w-3xl text-left">
                {status === 'loading' && (
                  <div className="rounded-2xl border border-[hsl(var(--border))] p-5 text-sm text-[hsl(var(--muted-foreground))] glass">
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-[hsl(var(--primary))] border-t-transparent" />
                      Searching scriptures, generating cited answer...
                    </div>
                  </div>
                )}

                {status === 'error' && (
                  <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-5 text-sm text-red-200">
                    {error}
                  </div>
                )}

                {status === 'ready' && askResponse && (
                  <div className="space-y-4">
                    {/* Generated Answer */}
                    <div className="rounded-2xl border border-[hsl(var(--primary))]/20 bg-[hsl(var(--primary))]/5 p-5">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-xs font-medium uppercase tracking-wider text-[hsl(var(--primary))]">
                          VEDA Answer
                        </span>
                        <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
                          {askResponse.confidence > 0 && (
                            <span className={`rounded-full px-2 py-0.5 ${
                              askResponse.confidence >= 0.8 ? 'bg-emerald-500/15 text-emerald-400'
                              : askResponse.confidence >= 0.5 ? 'bg-amber-500/15 text-amber-400'
                              : 'bg-red-500/15 text-red-400'
                            }`}>
                              {Math.round(askResponse.confidence * 100)}% confidence
                            </span>
                          )}
                          {askResponse.model_used && askResponse.model_used !== 'none' && askResponse.model_used !== 'error' && (
                            <span>{Math.round(askResponse.query_time_ms)}ms</span>
                          )}
                        </div>
                      </div>
                      <div className="prose prose-invert prose-sm max-w-none text-[hsl(var(--foreground))]">
                        <p className="whitespace-pre-line leading-relaxed">{askResponse.answer}</p>
                      </div>
                      {askResponse.citations.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {askResponse.citations.map((c) => (
                            <span key={c.citation_id} className="rounded-full bg-[hsl(var(--primary))]/10 px-2 py-0.5 text-[11px] text-[hsl(var(--primary))]">
                              {c.reference}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Warnings */}
                    {askResponse.warnings.map((warning) => (
                      <div
                        key={warning}
                        className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-amber-100"
                      >
                        {warning}
                      </div>
                    ))}

                    {/* Evidence Packets */}
                    {askResponse.evidence.length > 0 && (
                      <>
                        <h3 className="pt-2 text-xs font-medium uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                          Source Evidence ({askResponse.evidence.length})
                        </h3>
                        {askResponse.evidence.map((packet) => (
                          <article
                            key={packet.packet_id}
                            className="rounded-2xl border border-[hsl(var(--border))] p-5 glass"
                          >
                            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
                              <span className="rounded-full bg-[hsl(var(--primary))]/10 px-2 py-1 text-[hsl(var(--primary))]">
                                {packet.citation.reference}
                              </span>
                              <span>{packet.citation.source_name}</span>
                              <span>Confidence {Math.round(packet.citation.confidence * 100)}%</span>
                              <span>Evidence {packet.citation.evidence_level}</span>
                            </div>
                            <h2 className="mb-2 text-base font-semibold text-[hsl(var(--foreground))]">
                              {packet.title}
                            </h2>
                            <p className="whitespace-pre-line text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                              {packet.content}
                            </p>
                          </article>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-[hsl(var(--border))] px-4 py-4 lg:px-8" style={{ backgroundColor: 'rgba(8, 8, 8, 0.8)', backdropFilter: 'blur(20px)' }}>
        <div className="mx-auto max-w-3xl">
          <div className="flex items-end gap-3">
            <div className="relative flex-1">
              <motion.textarea
                id="ask-input"
                rows={1}
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    submitQuestion();
                  }
                }}
                placeholder="Ask about Dharma, scriptures, philosophy..."
                className="glow-input w-full resize-none rounded-2xl border border-[hsl(var(--border))] px-4 py-3 text-base text-[hsl(var(--foreground))] outline-none glass transition-all focus:border-[hsl(var(--primary))]/40 placeholder:text-[hsl(var(--muted-foreground))]"
                whileFocus={{
                  boxShadow: '0 0 30px rgba(201, 122, 36, 0.1), 0 0 60px rgba(201, 122, 36, 0.05)',
                }}
              />
            </div>
            <motion.button
              id="ask-submit"
              type="button"
              onClick={() => submitQuestion()}
              disabled={status === 'loading' || !question.trim()}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(32,80%,55%)] text-white disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{
                scale: 1.05,
                boxShadow: '0 0 20px rgba(201, 122, 36, 0.4)',
              }}
              whileTap={{ scale: 0.95 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m5 12 7-7 7 7" />
                <path d="M12 19V5" />
              </svg>
            </motion.button>
          </div>
          <p className="mt-2 text-center text-xs text-[hsl(var(--muted-foreground))]">
            Every answer includes source citations · Confidence scored · Hallucination-resistant
          </p>
        </div>
      </div>
    </div>
  );
}
