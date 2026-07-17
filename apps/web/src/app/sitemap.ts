import type { MetadataRoute } from 'next';
import { getScripturesServer, SITE_URL } from '@/lib/server-api';
import { FALLBACK_SCRIPTURES } from '@/lib/scripture-fallback';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/scriptures',
    '/explore',
    '/ask',
    '/research',
    '/graph',
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.8,
  }));

  const scriptures = (await getScripturesServer()) ?? FALLBACK_SCRIPTURES;
  const scriptureRoutes: MetadataRoute.Sitemap = scriptures.map((s) => ({
    url: `${SITE_URL}/scriptures/${s.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...scriptureRoutes];
}
