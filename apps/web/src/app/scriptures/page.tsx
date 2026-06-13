import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Scriptures — Browse Sacred Texts',
  description:
    'Browse the Vedas, Upanishads, Bhagavad Gita, Puranas, Ramayana, and Mahabharata with Sanskrit, transliteration, and translations.',
};

const scriptures = [
  {
    category: 'Shruti (Revealed)',
    items: [
      {
        name: 'Bhagavad Gita',
        sanskrit: 'भगवद्गीता',
        desc: 'The Song of God — 18 chapters, 700 verses of Krishna\'s teachings to Arjuna',
        chapters: 18,
        verses: 700,
        slug: 'bhagavad-gita',
        gradient: 'from-amber-500/15 to-orange-500/10',
      },
      {
        name: 'Isha Upanishad',
        sanskrit: 'ईशोपनिषद्',
        desc: 'The Lord pervades everything — shortest and first of principal Upanishads',
        chapters: 1,
        verses: 18,
        slug: 'isha-upanishad',
        gradient: 'from-blue-500/15 to-indigo-500/10',
      },
      {
        name: 'Kena Upanishad',
        sanskrit: 'केनोपनिषद्',
        desc: '"By whom?" — Explores the nature of Brahman behind all perception',
        chapters: 4,
        verses: 35,
        slug: 'kena-upanishad',
        gradient: 'from-blue-500/15 to-indigo-500/10',
      },
      {
        name: 'Katha Upanishad',
        sanskrit: 'कठोपनिषद्',
        desc: 'Nachiketa\'s dialogue with Yama — The mystery of death and the Self',
        chapters: 6,
        verses: 119,
        slug: 'katha-upanishad',
        gradient: 'from-blue-500/15 to-indigo-500/10',
      },
      {
        name: 'Mundaka Upanishad',
        sanskrit: 'मुण्डकोपनिषद्',
        desc: 'Higher and lower knowledge — The imperishable Brahman',
        chapters: 3,
        verses: 64,
        slug: 'mundaka-upanishad',
        gradient: 'from-blue-500/15 to-indigo-500/10',
      },
      {
        name: 'Mandukya Upanishad',
        sanskrit: 'माण्डूक्योपनिषद्',
        desc: 'The syllable Om and the four states of consciousness',
        chapters: 1,
        verses: 12,
        slug: 'mandukya-upanishad',
        gradient: 'from-blue-500/15 to-indigo-500/10',
      },
    ],
  },
  {
    category: 'Itihasa (History)',
    items: [
      {
        name: 'Ramayana',
        sanskrit: 'रामायण',
        desc: 'The journey of Lord Rama — 7 Kandas of dharma, exile, and devotion',
        chapters: 7,
        verses: 24000,
        slug: 'ramayana',
        gradient: 'from-rose-500/15 to-pink-500/10',
      },
      {
        name: 'Mahabharata',
        sanskrit: 'महाभारत',
        desc: 'The great epic — 18 Parvas of dharma, war, and wisdom',
        chapters: 18,
        verses: 100000,
        slug: 'mahabharata',
        gradient: 'from-purple-500/15 to-violet-500/10',
      },
    ],
  },
  {
    category: 'Puranas',
    items: [
      {
        name: 'Vishnu Purana',
        sanskrit: 'विष्णुपुराण',
        desc: 'Cosmology, genealogy, and stories of Lord Vishnu',
        chapters: 6,
        verses: 23000,
        slug: 'vishnu-purana',
        gradient: 'from-cyan-500/15 to-sky-500/10',
      },
      {
        name: 'Bhagavata Purana',
        sanskrit: 'भागवतपुराण',
        desc: 'The divine play of Lord Krishna — devotion and liberation',
        chapters: 12,
        verses: 18000,
        slug: 'bhagavata-purana',
        gradient: 'from-cyan-500/15 to-sky-500/10',
      },
    ],
  },
];

export default function ScripturesPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
      <div className="mb-10">
        <h1 className="scripture-title mb-2 text-3xl font-bold text-[hsl(var(--foreground))]">
          Scriptures
        </h1>
        <p className="text-lg text-[hsl(var(--muted-foreground))]">
          Browse sacred texts with Sanskrit, transliteration, and multiple translations
        </p>
      </div>

      {scriptures.map((group) => (
        <section key={group.category} className="mb-12">
          <h2 className="mb-4 text-lg font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
            {group.category}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {group.items.map((scripture) => (
              <a
                key={scripture.slug}
                href={`/scriptures/${scripture.slug}`}
                id={`scripture-${scripture.slug}`}
                className={`knowledge-card group bg-gradient-to-br ${scripture.gradient} border border-transparent transition-all hover:border-[hsl(var(--primary))]/20 hover:scale-[1.01]`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="sanskrit text-sm text-[hsl(var(--muted-foreground))]">
                      {scripture.sanskrit}
                    </p>
                    <h3 className="scripture-title text-xl font-semibold text-[hsl(var(--foreground))] transition-colors group-hover:text-[hsl(var(--primary))]">
                      {scripture.name}
                    </h3>
                  </div>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                  {scripture.desc}
                </p>
                <div className="mt-3 flex gap-3 text-xs text-[hsl(var(--muted-foreground))]">
                  <span>{scripture.chapters} {scripture.chapters === 1 ? 'chapter' : 'chapters'}</span>
                  <span>·</span>
                  <span>{scripture.verses.toLocaleString()} verses</span>
                </div>
              </a>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
