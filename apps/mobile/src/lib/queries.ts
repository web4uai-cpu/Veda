/**
 * TanStack Query hooks for VEDA server data.
 */
import { useQuery } from '@tanstack/react-query';
import { api } from './api';

export function useScriptures(category?: string) {
  return useQuery({
    queryKey: ['scriptures', category ?? 'all'],
    queryFn: () => api.getScriptures(category, 1, 200),
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
