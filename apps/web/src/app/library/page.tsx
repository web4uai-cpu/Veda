import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Library — Your Personal Collection',
  description:
    'Manage your bookmarks, notes, collections, uploads, and research reports.',
};

export default function LibraryPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
      <div className="mb-10">
        <h1 className="scripture-title mb-2 text-3xl font-bold text-[hsl(var(--foreground))]">
          Library
        </h1>
        <p className="text-lg text-[hsl(var(--muted-foreground))]">
          Your personal knowledge collection
        </p>
      </div>

      {/* Library Tabs */}
      <div className="mb-8 flex gap-1 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-1">
        {[
          { label: 'Bookmarks', icon: '🔖' },
          { label: 'Notes', icon: '📝' },
          { label: 'Collections', icon: '📂' },
          { label: 'Uploads', icon: '📤' },
          { label: 'Reports', icon: '📊' },
        ].map((tab, i) => (
          <button
            key={tab.label}
            id={`library-tab-${tab.label.toLowerCase()}`}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              i === 0
                ? 'bg-[hsl(var(--primary))] text-white'
                : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
            }`}
          >
            <span className="mr-1.5">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(var(--accent))]">
          <span className="text-3xl">🔖</span>
        </div>
        <h2 className="mb-2 text-xl font-semibold text-[hsl(var(--foreground))]">
          No Bookmarks Yet
        </h2>
        <p className="mb-6 max-w-md text-sm text-[hsl(var(--muted-foreground))]">
          Bookmark verses, concepts, and research findings as you explore.
          Your library will grow alongside your knowledge journey.
        </p>
        <a
          href="/explore"
          className="rounded-xl bg-[hsl(var(--primary))] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[hsl(var(--primary))]/90"
        >
          Start Exploring
        </a>
      </div>
    </div>
  );
}
