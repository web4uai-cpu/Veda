/**
 * VEDA Server API
 * ================
 * Server-side data fetching for React Server Components.
 * Uses Next.js fetch caching (ISR) — canonical scripture content is
 * immutable, so pages revalidate lazily instead of refetching per request.
 *
 * All helpers return null on failure so pages can render fallbacks
 * (e.g. at build time when the API is not running).
 */

import type {
  Scripture,
  ScriptureListResponse,
  Chapter,
  ChapterListResponse,
  VerseListResponse,
  ConceptDetail,
} from '@/lib/api';

// Server-side base URL: prefer an internal URL (API_URL) if provided,
// otherwise reuse the public one.
const SERVER_API_URL =
  process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

const DEFAULT_REVALIDATE = 300; // 5 minutes

async function fetchJson<T>(path: string, revalidate = DEFAULT_REVALIDATE): Promise<T | null> {
  try {
    const res = await fetch(`${SERVER_API_URL}${path}`, {
      next: { revalidate },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function getScripturesServer(perPage = 200): Promise<Scripture[] | null> {
  const res = await fetchJson<ScriptureListResponse>(
    `/api/v1/scriptures?page=1&per_page=${perPage}`,
  );
  return res?.scriptures ?? null;
}

export async function getScriptureBySlugServer(slug: string): Promise<Scripture | null> {
  return fetchJson<Scripture>(`/api/v1/scriptures/slug/${encodeURIComponent(slug)}`);
}

export async function getChaptersServer(scriptureId: string): Promise<Chapter[] | null> {
  const res = await fetchJson<ChapterListResponse>(
    `/api/v1/scriptures/${encodeURIComponent(scriptureId)}/chapters`,
  );
  return res?.chapters ?? null;
}

export async function getChapterServer(
  scriptureId: string,
  chapterNumber: number,
): Promise<Chapter | null> {
  return fetchJson<Chapter>(
    `/api/v1/scriptures/${encodeURIComponent(scriptureId)}/chapters/${chapterNumber}`,
  );
}

export async function getVersesServer(
  scriptureId: string,
  chapterNumber: number,
  perPage = 200,
): Promise<VerseListResponse | null> {
  return fetchJson<VerseListResponse>(
    `/api/v1/scriptures/${encodeURIComponent(scriptureId)}/chapters/${chapterNumber}/verses?page=1&per_page=${perPage}`,
  );
}

export async function getConceptServer(slug: string): Promise<ConceptDetail | null> {
  return fetchJson<ConceptDetail>(`/api/v1/graph/concepts/${encodeURIComponent(slug)}`);
}

/** Public site origin for canonical URLs / sitemap. */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://veda.example.com';
