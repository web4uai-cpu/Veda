import type { Metadata, Viewport } from 'next';
import './globals.css';
import { LayoutClient } from './layout-client';

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
    { media: '(prefers-color-scheme: light)', color: '#080808' },
    { media: '(prefers-color-scheme: dark)', color: '#080808' },
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
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  );
}
