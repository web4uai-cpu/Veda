import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Research — Deep Scholarly Analysis',
  description:
    'Deep research and comparative analysis across scriptures with multi-agent AI reasoning and full evidence reports.',
};

export default function ResearchPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
      <div className="mb-10">
        <h1 className="scripture-title mb-2 text-3xl font-bold text-[hsl(var(--foreground))]">
          Research
        </h1>
        <p className="text-lg text-[hsl(var(--muted-foreground))]">
          Deep comparative analysis powered by multi-agent AI reasoning
        </p>
      </div>

      {/* New Research */}
      <div className="mb-12 rounded-[20px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8">
        <h2 className="mb-4 text-lg font-semibold text-[hsl(var(--foreground))]">
          New Research Query
        </h2>
        <textarea
          id="research-input"
          rows={3}
          placeholder="e.g. Compare the concept of Atman in Advaita Vedanta vs Vishishtadvaita, with evidence from primary sources..."
          className="mb-4 w-full resize-none rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4 text-base text-[hsl(var(--foreground))] outline-none transition-shadow focus:shadow-[0_0_0_2px_hsl(var(--primary)/0.2)] placeholder:text-[hsl(var(--muted-foreground))]"
        />
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <span className="rounded-full bg-[hsl(var(--primary))]/10 px-3 py-1 text-xs font-medium text-[hsl(var(--primary))]">
              Multi-Agent
            </span>
            <span className="rounded-full bg-[hsl(var(--secondary))]/10 px-3 py-1 text-xs font-medium text-[hsl(var(--secondary))]">
              Citations Required
            </span>
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700">
              Evidence-Based
            </span>
          </div>
          <button
            id="research-submit"
            className="rounded-xl bg-[hsl(var(--primary))] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[hsl(var(--primary))]/90"
          >
            Start Research
          </button>
        </div>
      </div>

      {/* Example Research Topics */}
      <h2 className="mb-4 text-lg font-semibold text-[hsl(var(--foreground))]">
        Research Templates
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          {
            title: 'Comparative Philosophy',
            desc: 'Compare interpretations of key concepts across Advaita, Vishishtadvaita, and Dvaita schools',
            agents: ['Vedanta Agent', 'Citation Agent'],
            icon: '⚖️',
          },
          {
            title: 'Scripture Cross-Reference',
            desc: 'Find parallel passages and shared themes between the Upanishads and the Bhagavad Gita',
            agents: ['Upanishad Agent', 'Graph Agent'],
            icon: '🔗',
          },
          {
            title: 'Concept Deep-Dive',
            desc: 'Trace the evolution of a concept (e.g. Dharma) across all scriptural sources',
            agents: ['Veda Agent', 'Purana Agent', 'Research Agent'],
            icon: '🔬',
          },
          {
            title: 'Sanskrit Analysis',
            desc: 'Analyze root meanings, grammar, and semantic evolution of Sanskrit terms',
            agents: ['Sanskrit Agent', 'Citation Agent'],
            icon: '📝',
          },
        ].map((template) => (
          <div
            key={template.title}
            className="knowledge-card group cursor-pointer border border-transparent transition-all hover:border-[hsl(var(--primary))]/20"
          >
            <span className="mb-2 block text-2xl">{template.icon}</span>
            <h3 className="mb-1 text-base font-semibold text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--primary))]">
              {template.title}
            </h3>
            <p className="mb-3 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
              {template.desc}
            </p>
            <div className="flex flex-wrap gap-1">
              {template.agents.map((agent) => (
                <span
                  key={agent}
                  className="rounded-full bg-[hsl(var(--accent))] px-2 py-0.5 text-[10px] font-medium text-[hsl(var(--muted-foreground))]"
                >
                  {agent}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
