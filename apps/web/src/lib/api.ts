/**
 * VEDA API Client
 *
 * Centralized HTTP client for the FastAPI backend.
 * All API calls go through this client for consistent error handling,
 * authentication, and base URL management.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

interface ApiError {
  error: string;
  code: string;
  message: string;
  correlationId?: string;
}

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

  // Health
  async health() {
    return this.request<{
      status: string;
      platform: string;
      version: string;
      services: Record<string, string>;
    }>('/api/v1/health');
  }

  // Search (Phase 6)
  async search(query: string, mode: string = 'quick') {
    return this.request('/api/v1/search', {
      method: 'POST',
      body: JSON.stringify({ query, mode }),
    });
  }

  // Chat (Phase 9)
  async chat(message: string, mode: string = 'quick') {
    return this.request('/api/v1/chat', {
      method: 'POST',
      body: JSON.stringify({ message, mode }),
    });
  }
}

export const api = new VedaApiClient(API_BASE_URL);
