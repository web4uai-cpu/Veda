import type { Metadata, Viewport } from 'next';
import { Inter, Noto_Sans_Devanagari, Cormorant_Garamond } from 'next/font/google';
import './globals.css';
import { LayoutClient } from './layout-client';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-devanagari',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

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
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${notoDevanagari.variable} ${cormorant.variable}`}
    >
      <body className="min-h-screen antialiased">
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  );
}
