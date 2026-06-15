'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { ScrollReveal, ScrollRevealItem } from '@/components/animations';

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
              {MODES.map((mode, i) => (
                <motion.button
                  key={mode.label}
                  id={`mode-${mode.label.toLowerCase()}`}
                  className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    i === 0
                      ? 'text-white'
                      : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {i === 0 && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(32,80%,55%)]"
                      layoutId="mode-highlight"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{mode.label}</span>
                </motion.button>
              ))}
            </motion.div>
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
                placeholder="Ask about Dharma, scriptures, philosophy..."
                className="glow-input w-full resize-none rounded-2xl border border-[hsl(var(--border))] px-4 py-3 text-base text-[hsl(var(--foreground))] outline-none glass transition-all focus:border-[hsl(var(--primary))]/40 placeholder:text-[hsl(var(--muted-foreground))]"
                whileFocus={{
                  boxShadow: '0 0 30px rgba(201, 122, 36, 0.1), 0 0 60px rgba(201, 122, 36, 0.05)',
                }}
              />
            </div>
            <motion.button
              id="ask-submit"
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(32,80%,55%)] text-white"
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
