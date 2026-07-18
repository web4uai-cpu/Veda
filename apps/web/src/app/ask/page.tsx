'use client';

import dynamic from 'next/dynamic';
import { Suspense, useEffect, useRef, useState, type JSX } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollReveal, ScrollRevealItem } from '@/components/animations';
import { ReportRenderer } from '@/components/domain/ReportRenderer';
import { useChat, useActiveMessages, type ChatMessage } from '@/stores/chat';
import type { SearchMode } from '@/lib/api';

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

export default function AskPage(): JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100vh-64px)] items-center justify-center lg:h-screen">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[hsl(var(--primary))] border-t-transparent" />
        </div>
      }
    >
      <AskPageInner />
    </Suspense>
  );
}

function AskPageInner() {
  const searchParams = useSearchParams();
  const [question, setQuestion] = useState('');
  const [mode, setMode] = useState<SearchMode>('quick');
  const initialQueryHandled = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const messages = useActiveMessages();
  const thinking = useChat((s) => s.thinking);
  const activeId = useChat((s) => s.activeId);
  const send = useChat((s) => s.send);
  const newChat = useChat((s) => s.newChat);

  const isEmpty = messages.length === 0 && !thinking;

  // ?q= deep links start a fresh conversation rather than clobbering the open one.
  useEffect(() => {
    const q = searchParams.get('q');
    if (q && !initialQueryHandled.current) {
      initialQueryHandled.current = true;
      newChat();
      void send(q, mode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, thinking]);

  // Jump to the latest turn when switching threads from the sidebar.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [activeId]);

  function submit(next = question) {
    const query = next.trim();
    if (!query || thinking) return;
    setQuestion('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    void send(query, mode);
  }

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col lg:h-screen">
      {/* Thread header — New Chat lives here on mobile web, where there is no sidebar */}
      <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-4 py-3 lg:hidden">
        <span className="text-sm font-medium text-[hsl(var(--foreground))]">Ask VEDA</span>
        <button
          type="button"
          onClick={newChat}
          disabled={isEmpty}
          className="flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] px-3 py-1.5 text-xs text-[hsl(var(--primary))] transition-colors hover:border-[hsl(var(--primary))]/40 disabled:opacity-40"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-8 lg:px-8">
        <div className="mx-auto max-w-3xl">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
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
                Ask any question about Sanatan Dharma. Every answer comes with citations from
                authentic scriptures and verified sources.
              </motion.p>

              <ScrollReveal
                stagger
                staggerDelay={0.1}
                className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2"
              >
                {SUGGESTIONS.map((suggestion) => (
                  <ScrollRevealItem key={suggestion.q} animation="scale-up">
                    <motion.button
                      type="button"
                      onClick={() => submit(suggestion.q)}
                      className="rounded-xl border border-[hsl(var(--border))] px-4 py-3 text-left text-sm text-[hsl(var(--foreground))] glass transition-all"
                      whileHover={{
                        borderColor: 'rgba(201, 122, 36, 0.3)',
                        backgroundColor: 'rgba(201, 122, 36, 0.05)',
                        y: -2,
                        boxShadow: '0 8px 24px rgba(201, 122, 36, 0.08)',
                      }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <motion.span className="mb-1 block text-lg" whileHover={{ scale: 1.15 }}>
                        {suggestion.icon}
                      </motion.span>
                      {suggestion.q}
                    </motion.button>
                  </ScrollRevealItem>
                ))}
              </ScrollReveal>
            </div>
          ) : (
            <div className="space-y-5 py-2">
              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <MessageRow key={message.id} message={message} />
                ))}
              </AnimatePresence>

              {thinking && (
                <div className="rounded-2xl border border-[hsl(var(--border))] p-5 glass">
                  <div className="flex items-center gap-3 text-sm text-[hsl(var(--muted-foreground))]">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-[hsl(var(--primary))] border-t-transparent" />
                    Searching scriptures, generating cited answer…
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>
      </div>

      {/* Mode Selector */}
      <div className="flex justify-center px-4 pb-2">
        <div className="flex items-center gap-1 rounded-full border border-[hsl(var(--border))] p-1 glass">
          {MODES.map((option) => (
            <motion.button
              key={option.label}
              type="button"
              onClick={() => setMode(option.label.toLowerCase() as SearchMode)}
              className={`relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                option.label.toLowerCase() === mode
                  ? 'text-white'
                  : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
              }`}
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
        </div>
      </div>

      {/* Composer */}
      <div
        className="border-t border-[hsl(var(--border))] px-4 py-4 lg:px-8"
        style={{ backgroundColor: 'rgba(8, 8, 8, 0.8)', backdropFilter: 'blur(20px)' }}
      >
        <div className="mx-auto max-w-3xl">
          <div className="flex items-end gap-3">
            <div className="relative flex-1">
              <motion.textarea
                ref={textareaRef}
                id="ask-input"
                rows={1}
                value={question}
                onChange={(event) => {
                  setQuestion(event.target.value);
                  // Auto-grow: reset first so the box shrinks when text is deleted.
                  const el = event.target;
                  el.style.height = 'auto';
                  el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    submit();
                  }
                }}
                placeholder="Ask about Dharma, scriptures, philosophy..."
                className="glow-input max-h-[200px] w-full resize-none rounded-2xl border border-[hsl(var(--border))] px-4 py-3 text-base text-[hsl(var(--foreground))] outline-none glass transition-all focus:border-[hsl(var(--primary))]/40 placeholder:text-[hsl(var(--muted-foreground))]"
                whileFocus={{
                  boxShadow: '0 0 30px rgba(201, 122, 36, 0.1), 0 0 60px rgba(201, 122, 36, 0.05)',
                }}
              />
            </div>
            <motion.button
              id="ask-submit"
              type="button"
              onClick={() => submit()}
              disabled={thinking || !question.trim()}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(32,80%,55%)] text-white disabled:cursor-not-allowed disabled:opacity-50"
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(201, 122, 36, 0.4)' }}
              whileTap={{ scale: 0.95 }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
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

function MessageRow({ message }: { message: ChatMessage }) {
  const [showEvidence, setShowEvidence] = useState(false);

  if (message.role === 'user') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-end"
      >
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(32,80%,55%)] px-4 py-2.5 text-white">
          <p className="whitespace-pre-line text-sm leading-relaxed">{message.text}</p>
        </div>
      </motion.div>
    );
  }

  if (message.role === 'error') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-red-500/30 bg-red-500/5 p-5 text-sm text-red-200"
      >
        {message.text}
      </motion.div>
    );
  }

  const confidence = message.confidence ?? 0;
  const evidence = message.evidence ?? [];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
      <div className="rounded-2xl border border-[hsl(var(--primary))]/20 bg-[hsl(var(--primary))]/5 p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-[hsl(var(--primary))]">
            VEDA Answer
          </span>
          <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
            {confidence > 0 && (
              <span
                className={`rounded-full px-2 py-0.5 ${
                  confidence >= 0.8
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : confidence >= 0.5
                      ? 'bg-amber-500/15 text-amber-400'
                      : 'bg-red-500/15 text-red-400'
                }`}
              >
                {Math.round(confidence * 100)}% confidence
              </span>
            )}
            {message.model && message.model !== 'none' && message.model !== 'error' && (
              <span>{Math.round(message.queryTimeMs ?? 0)}ms</span>
            )}
          </div>
        </div>

        {/* Inline citation pills, shared with /research */}
        <div className="prose prose-invert prose-sm max-w-none text-[hsl(var(--foreground))]">
          <ReportRenderer text={message.text} />
        </div>

        {message.citations && message.citations.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {message.citations.map((c) => (
              <span
                key={c.citation_id}
                className="rounded-full bg-[hsl(var(--primary))]/10 px-2 py-0.5 text-[11px] text-[hsl(var(--primary))]"
              >
                {c.reference}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Collapsed by default — an always-open list buries the composer in a long thread. */}
      {evidence.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowEvidence((v) => !v)}
            className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className={`transition-transform ${showEvidence ? 'rotate-90' : ''}`}
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
            Source Evidence ({evidence.length})
          </button>

          <AnimatePresence initial={false}>
            {showEvidence && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 space-y-3 overflow-hidden"
              >
                {evidence.map((packet) => (
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
