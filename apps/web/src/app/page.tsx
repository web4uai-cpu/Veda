import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'VEDA — Explore the Wisdom of Sanatan Dharma',
};

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8 lg:py-16">
      {/* Hero Section */}
      <section className="mb-16 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-1.5 text-sm text-[hsl(var(--muted-foreground))]">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
          Knowledge Operating System
        </div>
        <h1 className="scripture-title mb-4 text-4xl font-bold leading-tight text-[hsl(var(--foreground))] lg:text-5xl">
          Explore the Wisdom of
          <br />
          <span className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] bg-clip-text text-transparent">
            Sanatan Dharma
          </span>
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-[hsl(var(--muted-foreground))]">
          Search scriptures, explore knowledge graphs, compare philosophies, and research with
          AI-powered citations. Every answer is traceable to its source.
        </p>

        {/* Search Bar — Flagship Component */}
        <div className="mx-auto max-w-2xl">
          <div className="group relative">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[hsl(var(--primary))]/20 to-[hsl(var(--secondary))]/20 opacity-0 blur-xl transition-opacity duration-500 group-focus-within:opacity-100" />
            <div className="relative flex items-center overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-[var(--veda-shadow-card)] transition-shadow duration-300 focus-within:shadow-[0_4px_24px_rgba(201,122,36,0.15)]">
              <span className="pl-5 text-xl text-[hsl(var(--muted-foreground))]">🔍</span>
              <input
                id="search-home"
                type="text"
                placeholder="Ask about Dharma, Karma, Moksha, Atman..."
                className="flex-1 bg-transparent px-4 py-4 text-base text-[hsl(var(--foreground))] outline-none placeholder:text-[hsl(var(--muted-foreground))]"
              />
              <button
                id="search-submit"
                className="mr-2 rounded-xl bg-[hsl(var(--primary))] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[hsl(var(--primary))]/90"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access Grid */}
      <section className="mb-16">
        <h2 className="mb-6 text-xl font-semibold text-[hsl(var(--foreground))]">
          Explore Scriptures
        </h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {[
            {
              name: 'Bhagavad Gita',
              sanskrit: 'भगवद्गीता',
              desc: '18 Chapters · 700 Verses',
              color: 'from-amber-500/10 to-orange-500/10',
              border: 'border-amber-200',
            },
            {
              name: 'Upanishads',
              sanskrit: 'उपनिषद्',
              desc: '10 Principal Texts',
              color: 'from-blue-500/10 to-indigo-500/10',
              border: 'border-blue-200',
            },
            {
              name: 'Vedas',
              sanskrit: 'वेद',
              desc: 'Rig · Yajur · Sama · Atharva',
              color: 'from-emerald-500/10 to-teal-500/10',
              border: 'border-emerald-200',
            },
            {
              name: 'Ramayana',
              sanskrit: 'रामायण',
              desc: '7 Kandas · 24,000 Verses',
              color: 'from-rose-500/10 to-pink-500/10',
              border: 'border-rose-200',
            },
            {
              name: 'Mahabharata',
              sanskrit: 'महाभारत',
              desc: '18 Parvas · 100,000 Verses',
              color: 'from-purple-500/10 to-violet-500/10',
              border: 'border-purple-200',
            },
            {
              name: 'Puranas',
              sanskrit: 'पुराण',
              desc: '18 Mahapuranas',
              color: 'from-cyan-500/10 to-sky-500/10',
              border: 'border-cyan-200',
            },
          ].map((scripture) => (
            <a
              key={scripture.name}
              href={`/scriptures/${scripture.name.toLowerCase().replace(/\s/g, '-')}`}
              id={`scripture-${scripture.name.toLowerCase().replace(/\s/g, '-')}`}
              className={`knowledge-card group border ${scripture.border} bg-gradient-to-br ${scripture.color} transition-transform duration-200 hover:scale-[1.02]`}
            >
              <p className="sanskrit mb-1 text-lg text-[hsl(var(--muted-foreground))]">
                {scripture.sanskrit}
              </p>
              <h3 className="scripture-title text-lg font-semibold text-[hsl(var(--foreground))]">
                {scripture.name}
              </h3>
              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{scripture.desc}</p>
            </a>
          ))}
        </div>
      </section>

      {/* Core Concepts */}
      <section className="mb-16">
        <h2 className="mb-6 text-xl font-semibold text-[hsl(var(--foreground))]">
          Core Concepts
        </h2>
        <div className="flex flex-wrap gap-3">
          {[
            'Atman',
            'Brahman',
            'Dharma',
            'Karma',
            'Moksha',
            'Maya',
            'Yoga',
            'Bhakti',
            'Jnana',
            'Samsara',
            'Ahimsa',
            'Satya',
          ].map((concept) => (
            <a
              key={concept}
              href={`/concepts/${concept.toLowerCase()}`}
              id={`concept-${concept.toLowerCase()}`}
              className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-2 text-sm font-medium text-[hsl(var(--foreground))] transition-all duration-200 hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/5 hover:text-[hsl(var(--primary))]"
            >
              {concept}
            </a>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="mb-16">
        <h2 className="mb-6 text-xl font-semibold text-[hsl(var(--foreground))]">
          Platform Capabilities
        </h2>
        <div className="grid gap-4 lg:grid-cols-3">
          {[
            {
              icon: '📖',
              title: 'Scripture Explorer',
              desc: 'Browse Vedas, Upanishads, Gita, Puranas with Sanskrit, transliteration, and translations.',
            },
            {
              icon: '🕸️',
              title: 'Knowledge Graph',
              desc: 'Interactive visualization of concepts, relationships, and cross-references across scriptures.',
            },
            {
              icon: '🔬',
              title: 'Research Mode',
              desc: 'Deep comparative analysis with multi-agent reasoning and evidence-based reports.',
            },
            {
              icon: '📝',
              title: 'Citations',
              desc: 'Every answer traced to its source. Confidence scores. No hallucinations.',
            },
            {
              icon: '📤',
              title: 'Upload & Connect',
              desc: 'Upload PDFs and research papers. AI automatically links them to the knowledge graph.',
            },
            {
              icon: '🧘',
              title: 'Daily Verse',
              desc: 'Personalized daily scripture recommendations with context and commentary.',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="knowledge-card"
            >
              <span className="mb-3 block text-2xl">{feature.icon}</span>
              <h3 className="mb-1 text-base font-semibold text-[hsl(var(--foreground))]">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Philosophy Banner */}
      <section className="rounded-[20px] bg-gradient-to-br from-[hsl(var(--secondary))] to-[hsl(var(--secondary))]/80 p-8 text-center text-white lg:p-12">
        <p className="sanskrit mb-2 text-lg opacity-80">ज्ञानं परमं बलम्</p>
        <p className="mb-2 text-sm italic opacity-60">Jñānaṁ Paramaṁ Balam</p>
        <p className="text-xl font-semibold">&ldquo;Knowledge is the Supreme Power&rdquo;</p>
        <p className="mt-4 text-sm opacity-60">
          Explore Knowledge · Understand Context · Follow Sources · Discover Dharma
        </p>
      </section>
    </div>
  );
}
