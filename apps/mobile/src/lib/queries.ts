/**
 * TanStack Query hooks for VEDA server data.
 */
import { useQuery } from '@tanstack/react-query';
import { api } from './api';

// The API caps per_page at 100 (routers/scriptures.py) — asking for more 422s.
// The registry holds 49 scriptures, so a single page covers the corpus.
const SCRIPTURES_PER_PAGE = 100;

export function useScriptures() {
  return useQuery({
    queryKey: ['scriptures', 'all'],
    queryFn: () => api.getScriptures(undefined, 1, SCRIPTURES_PER_PAGE),
  });
}

export function useScripture(slug: string) {
  return useQuery({
    queryKey: ['scripture', slug],
    queryFn: () => api.getScriptureBySlug(slug),
    enabled: !!slug,
  });
}

export function useChapters(scriptureId: string | undefined) {
  return useQuery({
    queryKey: ['chapters', scriptureId],
    queryFn: () => api.getChapters(scriptureId!),
    enabled: !!scriptureId,
  });
}

export function useVerses(scriptureId: string | undefined, chapterNumber: number) {
  return useQuery({
    queryKey: ['verses', scriptureId, chapterNumber],
    queryFn: () => api.getVerses(scriptureId!, chapterNumber, 1, 200),
    enabled: !!scriptureId && chapterNumber > 0,
  });
}

/**
 * A single verse looked up by canonical reference ("BG.2.47") — what a citation
 * badge carries. Not every reference resolves (uploads, commentaries, malformed
 * refs from the model), so callers must handle the error rather than retrying.
 */
export function useVerseByReference(reference: string | undefined) {
  return useQuery({
    queryKey: ['verse', reference],
    queryFn: () => api.getVerseByReference(reference!),
    enabled: !!reference,
    retry: 0,
    staleTime: 60 * 60 * 1000, // canonical text is immutable
  });
}

export function useConcepts(category?: string) {
  return useQuery({
    queryKey: ['concepts', category ?? 'all'],
    queryFn: () => api.getConcepts(category, 100),
  });
}

export function useConcept(slug: string) {
  return useQuery({
    queryKey: ['concept', slug],
    queryFn: () => api.getConcept(slug),
    enabled: !!slug,
  });
}

export function useGraphStats() {
  return useQuery({
    queryKey: ['graph', 'stats'],
    queryFn: () => api.getGraphStats(),
    retry: 0,
  });
}
