import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ask VEDA — Knowledge-Powered Answers',
  description:
    'Ask questions about Sanatan Dharma and receive AI-powered answers with citations from authentic scriptures.',
};

export default function AskPage() {
  return (
    <div className="flex h-[calc(100vh-64px)] flex-col lg:h-screen">
      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 py-8 lg:px-8">
        <div className="mx-auto max-w-3xl">
          {/* Welcome State */}
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))]">
              <span className="scripture-title text-3xl text-white">व</span>
            </div>
            <h1 className="scripture-title mb-3 text-3xl font-bold text-[hsl(var(--foreground))]">
              Ask VEDA
            </h1>
            <p className="mb-8 max-w-md text-base text-[hsl(var(--muted-foreground))]">
              Ask any question about Sanatan Dharma. Every answer comes with citations
              from authentic scriptures and verified sources.
            </p>

            {/* Suggested Questions */}
            <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                { q: 'What is Atman according to the Upanishads?', icon: '🕉️' },
                { q: 'Explain Karma Yoga from the Bhagavad Gita', icon: '📖' },
                { q: 'How do Advaita and Dvaita differ on Brahman?', icon: '⚖️' },
                { q: 'What does the Katha Upanishad say about death?', icon: '🔬' },
              ].map((suggestion) => (
                <button
                  key={suggestion.q}
                  className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 text-left text-sm text-[hsl(var(--foreground))] transition-all hover:border-[hsl(var(--primary))]/30 hover:shadow-sm"
                >
                  <span className="mb-1 block text-lg">{suggestion.icon}</span>
                  {suggestion.q}
                </button>
              ))}
            </div>

            {/* Mode Selector */}
            <div className="mt-8 flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-1">
              {[
                { label: 'Quick', desc: '< 500ms' },
                { label: 'Scholar', desc: 'Deep analysis' },
                { label: 'Research', desc: 'Full report' },
              ].map((mode, i) => (
                <button
                  key={mode.label}
                  id={`mode-${mode.label.toLowerCase()}`}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    i === 0
                      ? 'bg-[hsl(var(--primary))] text-white'
                      : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-4 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-end gap-3">
            <div className="relative flex-1">
              <textarea
                id="ask-input"
                rows={1}
                placeholder="Ask about Dharma, scriptures, philosophy..."
                className="w-full resize-none rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 text-base text-[hsl(var(--foreground))] outline-none transition-shadow focus:shadow-[0_0_0_2px_hsl(var(--primary)/0.2)] placeholder:text-[hsl(var(--muted-foreground))]"
              />
            </div>
            <button
              id="ask-submit"
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--primary))] text-white transition-colors hover:bg-[hsl(var(--primary))]/90"
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
            </button>
          </div>
          <p className="mt-2 text-center text-xs text-[hsl(var(--muted-foreground))]">
            Every answer includes source citations · Confidence scored · Hallucination-resistant
          </p>
        </div>
      </div>
    </div>
  );
}
