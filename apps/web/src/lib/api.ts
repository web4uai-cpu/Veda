/**
 * VEDA API Client
 * ================
 * Centralized HTTP client for the FastAPI backend.
 * Throws typed request errors when the API is unreachable.
 *
 * Usage:
 *   import { api } from '@/lib/api';
 *   const scriptures = await api.getScriptures();
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

// =============================================================================
// TYPES (mirrors backend Pydantic models)
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

export interface ApiError {
  error: string;
  code: string;
  message: string;
  correlation_id?: string;
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

export interface ScriptureCorpusStatus {
  scripture_id: string;
  slug: string;
  name: string;
  chapter_count: number;
  verse_count: number;
  content_count: number;
  sanskrit_count: number;
  transliteration_count: number;
  translation_count: number;
  missing_sanskrit: number;
  missing_translation: number;
  ready_for_search: boolean;
  ready_for_citation: boolean;
}

export interface CorpusStatusResponse {
  status: 'empty' | 'partial' | 'ready';
  scriptures: ScriptureCorpusStatus[];
  totals: Record<string, number>;
  blockers: string[];
}

// =============================================================================
// CLIENT
// =============================================================================

class VedaApiClient {
  private baseUrl: string;
  private accessToken: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    timeoutMs: number = 10000,
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) ?? {}),
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        error: 'Unknown',
        code: `HTTP_${response.status}`,
        message: response.statusText,
      }));
      throw new Error(error.message);
    }

    return response.json();
  }

  // ---------------------------------------------------------------------------
  // HEALTH
  // ---------------------------------------------------------------------------

  async health(): Promise<HealthResponse> {
    return this.request<HealthResponse>('/api/v1/health');
  }

  // ---------------------------------------------------------------------------
  // SCRIPTURES
  // ---------------------------------------------------------------------------

  async getScriptures(
    category?: string,
    page: number = 1,
    perPage: number = 20,
  ): Promise<ScriptureListResponse> {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    params.set('page', String(page));
    params.set('per_page', String(perPage));
    return this.request(`/api/v1/scriptures?${params}`);
  }

  async getScripture(id: string): Promise<Scripture> {
    return this.request(`/api/v1/scriptures/${id}`);
  }

  async getScriptureBySlug(slug: string): Promise<Scripture> {
    return this.request(`/api/v1/scriptures/slug/${slug}`);
  }

  async getChapters(scriptureId: string): Promise<ChapterListResponse> {
    return this.request(`/api/v1/scriptures/${scriptureId}/chapters`);
  }

  async getChapter(scriptureId: string, chapterNumber: number): Promise<Chapter> {
    return this.request(`/api/v1/scriptures/${scriptureId}/chapters/${chapterNumber}`);
  }

  async getVerses(
    scriptureId: string,
    chapterNumber: number,
    page: number = 1,
    perPage: number = 50,
  ): Promise<VerseListResponse> {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('per_page', String(perPage));
    return this.request(
      `/api/v1/scriptures/${scriptureId}/chapters/${chapterNumber}/verses?${params}`,
    );
  }

  async getVerseByReference(reference: string): Promise<Verse> {
    return this.request(`/api/v1/verses/${encodeURIComponent(reference)}`);
  }

  // ---------------------------------------------------------------------------
  // GRAPH
  // ---------------------------------------------------------------------------

  async getConcepts(
    category?: string,
    limit: number = 50,
  ): Promise<{ concepts: GraphConcept[]; total: number }> {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    params.set('limit', String(limit));
    return this.request(`/api/v1/graph/concepts?${params}`);
  }

  async getConcept(slug: string): Promise<ConceptDetail> {
    return this.request(`/api/v1/graph/concepts/${slug}`);
  }

  async getRelatedConcepts(
    slug: string,
    depth: number = 2,
    limit: number = 20,
  ): Promise<{
    source: string;
    depth: number;
    related: GraphConcept[];
    total: number;
  }> {
    const params = new URLSearchParams();
    params.set('depth', String(depth));
    params.set('limit', String(limit));
    return this.request(`/api/v1/graph/concepts/${slug}/related?${params}`);
  }

  async getSchools(): Promise<{ schools: School[]; total: number }> {
    return this.request('/api/v1/graph/schools');
  }

  async getSchool(slug: string): Promise<{
    school: School;
    supported_concepts: GraphConcept[];
    teachers: Person[];
    contrasting_schools: School[];
  }> {
    return this.request(`/api/v1/graph/schools/${slug}`);
  }

  async getPersons(
    type?: string,
  ): Promise<{ persons: Person[]; total: number }> {
    const params = new URLSearchParams();
    if (type) params.set('person_type', type);
    return this.request(`/api/v1/graph/persons?${params}`);
  }

  async getGraphStats(): Promise<GraphStats> {
    return this.request('/api/v1/graph/stats');
  }

  async searchGraph(
    query: string,
    nodeType?: string,
    limit: number = 20,
  ): Promise<{
    query: string;
    results: Array<{
      type: string;
      name: string;
      sanskrit_name: string | null;
      slug: string;
      summary: string | null;
    }>;
    total: number;
  }> {
    const params = new URLSearchParams();
    params.set('q', query);
    if (nodeType) params.set('node_type', nodeType);
    params.set('limit', String(limit));
    return this.request(`/api/v1/graph/search?${params}`);
  }

  // ---------------------------------------------------------------------------
  // SEARCH
  // ---------------------------------------------------------------------------

  async search(request: SearchRequest): Promise<SearchResponse> {
    return this.request('/api/v1/search', {
      method: 'POST',
      body: JSON.stringify({
        mode: 'quick',
        limit: 10,
        ...request,
      }),
    });
  }

  async resolveCitation(reference: string): Promise<CitationResolveResponse> {
    return this.request('/api/v1/citations/resolve', {
      method: 'POST',
      body: JSON.stringify({ reference }),
    });
  }

  async validateCitation(reference: string): Promise<CitationValidateResponse> {
    return this.request('/api/v1/citations/validate', {
      method: 'POST',
      body: JSON.stringify({ reference, source_type: 'SCRIPTURE' }),
    });
  }

  async getCorpusStatus(): Promise<CorpusStatusResponse> {
    return this.request('/api/v1/corpus/status');
  }

  // --- Admin Uploads ---

  async uploadPdf(file: File, adminKey: string, title?: string, scriptureId?: string): Promise<Upload> {
    const formData = new FormData();
    formData.append('file', file);
    if (title) formData.append('title', title);
    if (scriptureId) formData.append('scripture_id', scriptureId);
    return this.request('/api/v1/admin/uploads', {
      method: 'POST',
      body: formData,
      headers: { 'X-Admin-Key': adminKey },
    });
  }

  async listUploads(adminKey: string, status?: string): Promise<{ uploads: Upload[]; total: number }> {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    return this.request(`/api/v1/admin/uploads?${params}`, {
      headers: { 'X-Admin-Key': adminKey },
    });
  }

  async processUpload(uploadId: string, adminKey: string): Promise<Upload> {
    return this.request(`/api/v1/admin/uploads/${uploadId}/process`, {
      method: 'POST',
      headers: { 'X-Admin-Key': adminKey },
    });
  }

  // --- Ask VEDA ---

  async ask(request: { query: string; mode?: SearchMode; include_evidence?: boolean }): Promise<AskResponse> {
    return this.request('/api/v1/ask', {
      method: 'POST',
      body: JSON.stringify({ mode: 'quick', include_evidence: true, ...request }),
    }, 60000);
  }

  async research(request: { query: string; depth?: 'standard' | 'deep' }): Promise<ResearchResponse> {
    return this.request('/api/v1/research', {
      method: 'POST',
      body: JSON.stringify({ depth: 'standard', include_evidence: true, ...request }),
    }, 60000);
  }
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

export const api = new VedaApiClient(API_BASE_URL);
