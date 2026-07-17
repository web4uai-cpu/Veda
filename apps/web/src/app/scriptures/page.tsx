import type { Metadata } from 'next';
import { getScripturesServer } from '@/lib/server-api';
import { FALLBACK_SCRIPTURES } from '@/lib/scripture-fallback';
import type { Scripture } from '@/lib/api';
import { ScripturesClient } from './scriptures-client';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Scriptures — Vedas, Upanishads, Gita, Puranas & More',
  description:
    'Browse the sacred texts of Sanatan Dharma: the four Vedas, principal Upanishads, Bhagavad Gita, Puranas, Ramayana, Mahabharata, and classical Shastras — with Sanskrit, transliteration, and translation.',
  alternates: { canonical: '/scriptures' },
};

function mergeWithFallback(apiData: Scripture[]): Scripture[] {
  if (apiData.length >= 40) return apiData;
  const slugs = new Set(apiData.map((s) => s.slug));
  const merged = [...apiData];
  for (const fb of FALLBACK_SCRIPTURES) {
    if (!slugs.has(fb.slug)) merged.push(fb);
  }
  return merged;
}

export default async function ScripturesPage() {
  const apiScriptures = await getScripturesServer();
  const scriptures = mergeWithFallback(apiScriptures ?? []);

  return <ScripturesClient scriptures={scriptures} />;
}
