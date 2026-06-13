import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Explore — Discover Dharma Knowledge',
  description:
    'Explore concepts, scriptures, commentaries, and philosophical traditions across Sanatan Dharma.',
};

const categories = [
  {
    title: 'Core Concepts',
    icon: '💡',
    items: [
      { name: 'Atman', desc: 'The eternal Self', slug: 'atman' },
      { name: 'Brahman', desc: 'The ultimate reality', slug: 'brahman' },
      { name: 'Dharma', desc: 'Cosmic law and duty', slug: 'dharma' },
      { name: 'Karma', desc: 'Action and consequence', slug: 'karma' },
      { name: 'Moksha', desc: 'Liberation from samsara', slug: 'moksha' },
      { name: 'Maya', desc: 'Cosmic illusion', slug: 'maya' },
    ],
  },
  {
    title: 'Yoga Paths',
    icon: '🧘',
    items: [
      { name: 'Karma Yoga', desc: 'Path of selfless action', slug: 'karma-yoga' },
      { name: 'Jnana Yoga', desc: 'Path of knowledge', slug: 'jnana-yoga' },
      { name: 'Bhakti Yoga', desc: 'Path of devotion', slug: 'bhakti-yoga' },
      { name: 'Raja Yoga', desc: 'Path of meditation', slug: 'raja-yoga' },
    ],
  },
  {
    title: 'Philosophical Schools',
    icon: '🏛️',
    items: [
      { name: 'Advaita', desc: 'Non-dualism (Shankara)', slug: 'advaita' },
      { name: 'Vishishtadvaita', desc: 'Qualified non-dualism (Ramanuja)', slug: 'vishishtadvaita' },
      { name: 'Dvaita', desc: 'Dualism (Madhva)', slug: 'dvaita' },
      { name: 'Sankhya', desc: 'Enumeration philosophy', slug: 'sankhya' },
      { name: 'Nyaya', desc: 'Logic and epistemology', slug: 'nyaya' },
      { name: 'Vaisheshika', desc: 'Atomistic naturalism', slug: 'vaisheshika' },
    ],
  },
];

export default function ExplorePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
      {/* Header */}
      <div className="mb-10">
        <h1 className="scripture-title mb-2 text-3xl font-bold text-[hsl(var(--foreground))]">
          Explore
        </h1>
        <p className="text-lg text-[hsl(var(--muted-foreground))]">
          Discover the interconnected wisdom of Sanatan Dharma
        </p>
      </div>

      {/* Search */}
      <div className="mb-12">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-[hsl(var(--muted-foreground))]">
            🔍
          </span>
          <input
            id="explore-search"
            type="text"
            placeholder="Search concepts, scriptures, people, places..."
            className="w-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] py-3.5 pl-12 pr-4 text-base text-[hsl(var(--foreground))] outline-none transition-shadow focus:shadow-[0_0_0_2px_hsl(var(--primary)/0.2)] placeholder:text-[hsl(var(--muted-foreground))]"
          />
        </div>
      </div>

      {/* Category Sections */}
      {categories.map((category) => (
        <section key={category.title} className="mb-12">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-xl">{category.icon}</span>
            <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">
              {category.title}
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {category.items.map((item) => (
              <a
                key={item.slug}
                href={`/concepts/${item.slug}`}
                id={`explore-${item.slug}`}
                className="knowledge-card group border border-transparent transition-all hover:border-[hsl(var(--primary))]/20"
              >
                <h3 className="text-base font-semibold text-[hsl(var(--foreground))] transition-colors group-hover:text-[hsl(var(--primary))]">
                  {item.name}
                </h3>
                <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{item.desc}</p>
              </a>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
