import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'VEDA — Knowledge Operating System for Sanatan Dharma',
    template: '%s | VEDA',
  },
  description:
    'Explore, search, and research the wisdom of the Vedas, Upanishads, Bhagavad Gita, Puranas, Ramayana, and Mahabharata with AI-powered citations and knowledge graph.',
  keywords: [
    'Sanatan Dharma',
    'Vedas',
    'Upanishads',
    'Bhagavad Gita',
    'Knowledge Graph',
    'Sanskrit',
    'Hindu Philosophy',
    'Puranas',
    'Ramayana',
    'Mahabharata',
  ],
  authors: [{ name: 'VEDA Platform' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'VEDA',
    title: 'VEDA — Knowledge Operating System for Sanatan Dharma',
    description:
      'The world\u2019s most trusted AI-powered knowledge platform for Sanatan Dharma.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F8F5EF' },
    { media: '(prefers-color-scheme: dark)', color: '#111827' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <div className="flex min-h-screen">
          {/* Sidebar Navigation */}
          <aside className="hidden lg:flex lg:w-[280px] lg:flex-col lg:border-r lg:border-[hsl(var(--border))] lg:bg-[hsl(var(--card))]">
            <div className="flex h-16 items-center gap-3 border-b border-[hsl(var(--border))] px-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--primary))]">
                <span className="scripture-title text-lg font-bold text-white">व</span>
              </div>
              <div>
                <h1 className="scripture-title text-xl font-bold text-[hsl(var(--foreground))]">
                  VEDA
                </h1>
                <p className="text-[10px] tracking-widest text-[hsl(var(--muted-foreground))] uppercase">
                  Knowledge System
                </p>
              </div>
            </div>
            <nav className="flex-1 space-y-1 px-3 py-4">
              {[
                { icon: '🔍', label: 'Explore', href: '/explore' },
                { icon: '💬', label: 'Ask VEDA', href: '/ask' },
                { icon: '📖', label: 'Scriptures', href: '/scriptures' },
                { icon: '🕸️', label: 'Knowledge Map', href: '/graph' },
                { icon: '🔬', label: 'Research', href: '/research' },
                { icon: '📚', label: 'Library', href: '/library' },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]"
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.label}
                </a>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            {/* Mobile Header */}
            <header className="sticky top-0 z-20 flex h-16 items-center border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]/80 px-4 backdrop-blur-xl lg:hidden">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--primary))]">
                  <span className="scripture-title text-base font-bold text-white">व</span>
                </div>
                <span className="scripture-title text-lg font-bold">VEDA</span>
              </div>
            </header>
            {children}
          </main>
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-30 flex h-16 items-center justify-around border-t border-[hsl(var(--border))] bg-[hsl(var(--card))]/95 backdrop-blur-xl lg:hidden">
          {[
            { icon: '🏠', label: 'Home', href: '/' },
            { icon: '🔍', label: 'Explore', href: '/explore' },
            { icon: '💬', label: 'Ask', href: '/ask' },
            { icon: '📚', label: 'Library', href: '/library' },
            { icon: '👤', label: 'Profile', href: '/profile' },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-0.5 text-[hsl(var(--muted-foreground))] transition-colors"
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </a>
          ))}
        </nav>
      </body>
    </html>
  );
}
