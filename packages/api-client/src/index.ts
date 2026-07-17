/**
 * VEDA API Client (@veda/api-client)
 * ====================================
 * Framework-agnostic HTTP client for the VEDA FastAPI backend.
 * Works in browsers, Node 18+, and React Native (Hermes) — uses a manual
 * AbortController timeout instead of AbortSignal.timeout for RN compat.
 *
 * Usage:
 *   import { createApiClient } from '@veda/api-client';
 *   const api = createApiClient('https://vedaapi-production.up.railway.app');
 *   api.setAccessToken(token);
 *   const scriptures = await api.getScriptures();
 */

// =============================================================================
// TYPES (mirror backend Pydantic models — snake_case)
// =============================================================================

export interface Scripture {
  id: string;
  slug: string;
  name: string;
  sanskrit_name: string | null;
  category: string;
  language: string;
  period: string | null;
  description: string | null;
  is_canonical: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  chapter_count: number;
  verse_count: number;
}

export interface ScriptureListResponse {
  scriptures: Scripture[];
  total: number;
  page: number;
  per_page: number;
}

export interface Chapter {
  id: string;
  book_id: string;
  scripture_id: string;
  chapter_number: number;
  title: string | null;
  sanskrit_title: string | null;
  summary: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  verse_count: number;
}

export interface ChapterListResponse {
  chapters: Chapter[];
  total: number;
  scripture_id: string;
  scripture_name: string;
}

export interface VerseContent {
  id: string;
  content_type: string;
  content: string;
  language_code: string;
  source: string;
  is_primary: boolean;
}

export interface Verse {
  id: string;
  scripture_id: string;
  chapter_id: string | null;
  verse_number: number;
  canonical_reference: string;
  metadata: Record<string, unknown>;
  created_at: string;
  contents: VerseContent[];
}

export interface VerseListResponse {
  verses: Verse[];
  total: number;
  chapter_id: string | null;
  scripture_id: string;
  page: number;
  per_page: number;
}

export interface GraphConcept {
  id: string;
  slug: string;
  name: string;
  sanskrit_name: string | null;
  category: string | null;
  summary: string | null;
  connection_count?: number;
}

export interface ConceptDetail {
  concept: GraphConcept;
  related_concepts: Array<{
    slug: string;
    name: string;
    sanskrit_name: string | null;
    category: string | null;
    relationship: string;
    weight: number | null;
  }>;
  schools: Array<{
    slug: string;
    name: string;
    summary: string | null;
  }>;
  persons: Array<{
    name: string;
    type: string | null;
    period: string | null;
  }>;
  scripture_mentions: Array<{
    name: string;
    slug: string;
    mention_count: number;
  }>;
}

export interface School {
  id: string;
  slug: string;
  name: string;
  sanskrit_name: string | null;
  summary: string | null;
  concept_count?: number;
  teachers?: string[];
}

export interface Person {
  id: string;
  name: string;
  sanskrit_name: string | null;
  type: string | null;
  period: string | null;
  description: string | null;
  schools?: string[];
}

export interface GraphStats {
  total_nodes: number;
  total_relationships: number;
  nodes_by_label: Record<string, number>;
  relationships_by_type: Record<string, number>;
}

export interface GraphSearchResult {
  type: string;
  name: string;
  sanskrit_name: string | null;
  slug: string;
  summary: string | null;
}

export interface ServiceHealth {
  status: string;
  version?: string;
  error?: string;
  tables?: string;
  nodes?: string;
  collections?: string;
  cluster_status?: string;
  indices?: string;
}

export interface HealthResponse {
  status: string;
  platform: string;
  version: string;
  timestamp: string;
  phase: string;
  services: Record<string, ServiceHealth>;
}

export interface ApiErrorPayload {
  error: string;
  code: string;
  message: string;
  correlation_id?: string;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly correlationId?: string;

  constructor(status: number, payload: ApiErrorPayload) {
    super(payload.message || `HTTP ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.code = payload.code;
    this.correlationId = payload.correlation_id;
  }
}

export type SearchMode = 'quick' | 'scholar' | 'research';
export type SourceType = 'SCRIPTURE' | 'COMMENTARY' | 'SCHOLARLY_SOURCE' | 'UPLOAD' | 'AI_NOTE';
export type EvidenceLevel = 'A' | 'B' | 'C' | 'D' | 'E';

export interface SearchRequest {
  query: string;
  mode?: SearchMode;
  source_types?: SourceType[];
  scripture_ids?: string[];
  concept_slugs?: string[];
  include_uploads?: boolean;
  limit?: number;
}

export interface Citation {
  citation_id: string;
  source_type: SourceType;
  source_name: string;
  reference: string;
  source_id: string;
  chapter: number | null;
  verse: number | null;
  confidence: number;
  evidence_level: EvidenceLevel;
}

export interface EvidencePacket {
  packet_id: string;
  source_id: string;
  source_type: SourceType;
  title: string;
  content: string;
  citation: Citation;
  score: number;
  retrieval_source: string;
  highlights: string[];
  metadata: Record<string, unknown>;
}

export interface SearchResponse {
  query: string;
  mode: SearchMode;
  understanding: {
    intent: string;
    normalized_query: string;
    canonical_reference: string | null;
    concepts: string[];
    graph_depth: number;
  };
  results: EvidencePacket[];
  total: number;
  query_time_ms: number;
  warnings: string[];
}

export interface CitationResolveResponse {
  resolved: boolean;
  citation: Citation | null;
  message: string | null;
}

export interface CitationValidateResponse {
  valid: boolean;
  decision: 'approved' | 'flagged' | 'rejected';
  citation: Citation | null;
  reason: string;
}

export interface AskResponse {
  query: string;
  answer: string;
  citations: Citation[];
  evidence: EvidencePacket[];
  confidence: number;
  model_used: string;
  query_time_ms: number;
  warnings: string[];
}

export interface ResearchResponse {
  query: string;
  report: string;
  citations: Citation[];
  evidence: EvidencePacket[];
  confidence: number;
  model_used: string;
  query_time_ms: number;
  warnings: string[];
}

export interface Upload {
  id: string;
  user_id: string;
  filename: string;
  file_type: string;
  storage_key: string;
  status: string;
  title: string | null;
  scripture_id: string | null;
  language: string;
  size_bytes: number | null;
  error_message: string | null;
  metadata: Record<string, unknown>;
  uploaded_at: string;
  chunk_count: number;
}

export interface Bookmark {
  id: string;
  user_id: string;
  target_type: string;
  target_id: string;
  created_at: string;
}

export interface BookmarkListResponse {
  bookmarks: Bookmark[];
  total: number;
}

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  target_type: string | null;
  target_id: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface NoteListResponse {
  notes: Note[];
  total: number;
}

export interface CollectionItem {
  id: string;
  collection_id: string;
  item_type: string;
  item_id: string;
  added_at: string;
}

export interface Collection {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
  item_count: number;
  items: CollectionItem[];
}

export interface CollectionListResponse {
  collections: Collection[];
  total: number;
}

export interface Report {
  id: string;
  user_id: string;
  title: string;
  query: string;
  mode: string;
  content: string | null;
  evidence_count: number;
  sources_used: string[];
  status: string;
  created_at: string;
  completed_at: string | null;
}

export interface ReportListResponse {
  reports: Report[];
  total: number;
}

// =============================================================================
// CLIENT FACTORY
// =============================================================================

const DEFAULT_TIMEOUT_MS = 15000;
const AI_TIMEOUT_MS = 60000;

export type VedaApiClient = ReturnType<typeof createApiClient>;

export function createApiClient(baseUrl: string) {
  let accessToken: string | null = null;

  async function request<T>(
    endpoint: string,
    options: RequestInit = {},
    timeoutMs: number = DEFAULT_TIMEOUT_MS,
  ): Promise<T> {
    const headers: Record<string, string> = {
      ...((options.headers as Record<string, string>) ?? {}),
    };
    // Let fetch set the multipart boundary itself for FormData bodies.
    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    let response: Response;
    try {
      response = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }

    if (!response.ok) {
      const payload: ApiErrorPayload = await response.json().catch(() => ({
        error: 'Unknown',
        code: `HTTP_${response.status}`,
        message: response.statusText || `Request failed (${response.status})`,
      }));
      throw new ApiError(response.status, payload);
    }

    return response.json();
  }

  return {
    setAccessToken(token: string | null) {
      accessToken = token;
    },

    get baseUrl() {
      return baseUrl;
    },

    // --- Health ---

    health(): Promise<HealthResponse> {
      return request('/api/v1/health');
    },

    // --- Scriptures ---

    getScriptures(category?: string, page = 1, perPage = 20): Promise<ScriptureListResponse> {
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      params.set('page', String(page));
      params.set('per_page', String(perPage));
      return request(`/api/v1/scriptures?${params}`);
    },

    getScripture(id: string): Promise<Scripture> {
      return request(`/api/v1/scriptures/${id}`);
    },

    getScriptureBySlug(slug: string): Promise<Scripture> {
      return request(`/api/v1/scriptures/slug/${slug}`);
    },

    getChapters(scriptureId: string): Promise<ChapterListResponse> {
      return request(`/api/v1/scriptures/${scriptureId}/chapters`);
    },

    getChapter(scriptureId: string, chapterNumber: number): Promise<Chapter> {
      return request(`/api/v1/scriptures/${scriptureId}/chapters/${chapterNumber}`);
    },

    getVerses(
      scriptureId: string,
      chapterNumber: number,
      page = 1,
      perPage = 50,
    ): Promise<VerseListResponse> {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('per_page', String(perPage));
      return request(`/api/v1/scriptures/${scriptureId}/chapters/${chapterNumber}/verses?${params}`);
    },

    getVerseByReference(reference: string): Promise<Verse> {
      return request(`/api/v1/verses/${encodeURIComponent(reference)}`);
    },

    // --- Graph ---

    getConcepts(category?: string, limit = 50): Promise<{ concepts: GraphConcept[]; total: number }> {
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      params.set('limit', String(limit));
      return request(`/api/v1/graph/concepts?${params}`);
    },

    getConcept(slug: string): Promise<ConceptDetail> {
      return request(`/api/v1/graph/concepts/${slug}`);
    },

    getRelatedConcepts(
      slug: string,
      depth = 2,
      limit = 20,
    ): Promise<{ source: string; depth: number; related: GraphConcept[]; total: number }> {
      const params = new URLSearchParams();
      params.set('depth', String(depth));
      params.set('limit', String(limit));
      return request(`/api/v1/graph/concepts/${slug}/related?${params}`);
    },

    getSchools(): Promise<{ schools: School[]; total: number }> {
      return request('/api/v1/graph/schools');
    },

    getSchool(slug: string): Promise<{
      school: School;
      supported_concepts: GraphConcept[];
      teachers: Person[];
      contrasting_schools: School[];
    }> {
      return request(`/api/v1/graph/schools/${slug}`);
    },

    getPersons(type?: string): Promise<{ persons: Person[]; total: number }> {
      const params = new URLSearchParams();
      if (type) params.set('person_type', type);
      return request(`/api/v1/graph/persons?${params}`);
    },

    getGraphStats(): Promise<GraphStats> {
      return request('/api/v1/graph/stats');
    },

    searchGraph(
      query: string,
      nodeType?: string,
      limit = 20,
    ): Promise<{ query: string; results: GraphSearchResult[]; total: number }> {
      const params = new URLSearchParams();
      params.set('q', query);
      if (nodeType) params.set('node_type', nodeType);
      params.set('limit', String(limit));
      return request(`/api/v1/graph/search?${params}`);
    },

    // --- Search & Citations ---

    search(req: SearchRequest): Promise<SearchResponse> {
      return request('/api/v1/search', {
        method: 'POST',
        body: JSON.stringify({ mode: 'quick', limit: 10, ...req }),
      });
    },

    resolveCitation(reference: string): Promise<CitationResolveResponse> {
      return request('/api/v1/citations/resolve', {
        method: 'POST',
        body: JSON.stringify({ reference }),
      });
    },

    validateCitation(reference: string): Promise<CitationValidateResponse> {
      return request('/api/v1/citations/validate', {
        method: 'POST',
        body: JSON.stringify({ reference, source_type: 'SCRIPTURE' }),
      });
    },

    // --- AI ---

    ask(req: { query: string; mode?: SearchMode; include_evidence?: boolean }): Promise<AskResponse> {
      return request(
        '/api/v1/ask',
        {
          method: 'POST',
          body: JSON.stringify({ mode: 'quick', include_evidence: true, ...req }),
        },
        AI_TIMEOUT_MS,
      );
    },

    research(req: { query: string; depth?: 'standard' | 'deep' }): Promise<ResearchResponse> {
      return request(
        '/api/v1/research',
        {
          method: 'POST',
          body: JSON.stringify({ depth: 'standard', include_evidence: true, ...req }),
        },
        AI_TIMEOUT_MS,
      );
    },

    // --- Library (requires Bearer token) ---

    getBookmarks(): Promise<BookmarkListResponse> {
      return request('/api/v1/library/bookmarks');
    },

    createBookmark(target_type: string, target_id: string): Promise<Bookmark> {
      return request('/api/v1/library/bookmarks', {
        method: 'POST',
        body: JSON.stringify({ target_type, target_id }),
      });
    },

    deleteBookmark(id: string): Promise<{ ok: boolean }> {
      return request(`/api/v1/library/bookmarks/${id}`, { method: 'DELETE' });
    },

    getNotes(search?: string): Promise<NoteListResponse> {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      const qs = params.toString();
      return request(`/api/v1/library/notes${qs ? `?${qs}` : ''}`);
    },

    createNote(data: { title: string; content: string; tags?: string[] }): Promise<Note> {
      return request('/api/v1/library/notes', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    updateNote(
      id: string,
      data: Partial<{ title: string; content: string; tags: string[] }>,
    ): Promise<Note> {
      return request(`/api/v1/library/notes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    deleteNote(id: string): Promise<{ ok: boolean }> {
      return request(`/api/v1/library/notes/${id}`, { method: 'DELETE' });
    },

    getCollections(): Promise<CollectionListResponse> {
      return request('/api/v1/library/collections');
    },

    createCollection(data: { name: string; description?: string }): Promise<Collection> {
      return request('/api/v1/library/collections', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    updateCollection(
      id: string,
      data: Partial<{ name: string; description: string }>,
    ): Promise<Collection> {
      return request(`/api/v1/library/collections/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    deleteCollection(id: string): Promise<{ ok: boolean }> {
      return request(`/api/v1/library/collections/${id}`, { method: 'DELETE' });
    },

    addCollectionItem(collectionId: string, item_type: string, item_id: string): Promise<CollectionItem> {
      return request(`/api/v1/library/collections/${collectionId}/items`, {
        method: 'POST',
        body: JSON.stringify({ item_type, item_id }),
      });
    },

    removeCollectionItem(collectionId: string, itemId: string): Promise<{ ok: boolean }> {
      return request(`/api/v1/library/collections/${collectionId}/items/${itemId}`, {
        method: 'DELETE',
      });
    },

    getMyUploads(): Promise<{ uploads: Upload[]; total: number }> {
      return request('/api/v1/library/uploads');
    },

    getMyReports(): Promise<ReportListResponse> {
      return request('/api/v1/library/reports');
    },
  };
}
