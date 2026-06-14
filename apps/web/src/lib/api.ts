/**
 * VEDA API Client
 * ================
 * Centralized HTTP client for the FastAPI backend.
 * Falls back to mock data when the API is unreachable.
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
      signal: AbortSignal.timeout(10000), // 10s timeout
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
}

export const api = new VedaApiClient(API_BASE_URL);
