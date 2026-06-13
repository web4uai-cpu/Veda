// =============================================================================
// VEDA Shared Types — Entity Definitions
// =============================================================================
// Derived from DATA_MODEL.md — All entities use ULID with type prefixes
// =============================================================================

// ---------------------------------------------------------------------------
// ID Types — ULID with semantic prefixes
// ---------------------------------------------------------------------------

/** Branded string type for type-safe IDs */
type Brand<T, B> = T & { __brand: B };

export type UserId = Brand<string, 'UserId'>; // usr_
export type ScriptureId = Brand<string, 'ScriptureId'>; // scp_
export type BookId = Brand<string, 'BookId'>; // bok_
export type ChapterId = Brand<string, 'ChapterId'>; // chp_
export type VerseId = Brand<string, 'VerseId'>; // vrs_
export type ConceptId = Brand<string, 'ConceptId'>; // cpt_
export type PersonId = Brand<string, 'PersonId'>; // prs_
export type DeityId = Brand<string, 'DeityId'>; // dei_
export type EventId = Brand<string, 'EventId'>; // evt_
export type PlaceId = Brand<string, 'PlaceId'>; // plc_
export type CommentaryId = Brand<string, 'CommentaryId'>; // com_
export type UploadId = Brand<string, 'UploadId'>; // upl_
export type NoteId = Brand<string, 'NoteId'>; // nts_
export type ReportId = Brand<string, 'ReportId'>; // rpt_
export type CollectionId = Brand<string, 'CollectionId'>; // col_

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const ScriptureCategory = {
  VEDA: 'veda',
  UPANISHAD: 'upanishad',
  GITA: 'gita',
  PURANA: 'purana',
  RAMAYANA: 'ramayana',
  MAHABHARATA: 'mahabharata',
  COMMENTARY: 'commentary',
} as const;
export type ScriptureCategory = (typeof ScriptureCategory)[keyof typeof ScriptureCategory];

export const ContentType = {
  SANSKRIT: 'sanskrit',
  TRANSLITERATION: 'transliteration',
  TRANSLATION: 'translation',
  COMMENTARY: 'commentary',
} as const;
export type ContentType = (typeof ContentType)[keyof typeof ContentType];

export const PersonType = {
  RISHI: 'rishi',
  ACHARYA: 'acharya',
  KING: 'king',
  SAINT: 'saint',
} as const;
export type PersonType = (typeof PersonType)[keyof typeof PersonType];

export const UserRole = {
  USER: 'user',
  SCHOLAR: 'scholar',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const SourceType = {
  SCRIPTURE: 'SCRIPTURE',
  COMMENTARY: 'COMMENTARY',
  SCHOLARLY_SOURCE: 'SCHOLARLY_SOURCE',
  UPLOAD: 'UPLOAD',
  AI_NOTE: 'AI_NOTE',
} as const;
export type SourceType = (typeof SourceType)[keyof typeof SourceType];

export const UploadStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;
export type UploadStatus = (typeof UploadStatus)[keyof typeof UploadStatus];

// ---------------------------------------------------------------------------
// Core Entities
// ---------------------------------------------------------------------------

export interface User {
  id: UserId;
  email: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface UserSettings {
  id: string;
  userId: UserId;
  language: string;
  theme: 'light' | 'dark' | 'system';
  timezone: string;
  preferences: Record<string, unknown>;
}

export interface Scripture {
  id: ScriptureId;
  slug: string;
  name: string;
  category: ScriptureCategory;
  language: string;
  period?: string;
  description: string;
  isCanonical: boolean;
  createdAt: string;
}

export interface Book {
  id: BookId;
  scriptureId: ScriptureId;
  name: string;
  position: number;
  metadata?: Record<string, unknown>;
}

export interface Chapter {
  id: ChapterId;
  bookId: BookId;
  chapterNumber: number;
  title: string;
  metadata?: Record<string, unknown>;
}

export interface Verse {
  id: VerseId;
  scriptureId: ScriptureId;
  bookId: BookId;
  chapterId: ChapterId;
  verseNumber: number;
  canonicalReference: string; // e.g. "BG.2.47"
  createdAt: string;
}

export interface VerseContent {
  id: string;
  verseId: VerseId;
  languageCode: string;
  contentType: ContentType;
  content: string;
  version: number;
  source: string;
  createdAt: string;
}

export interface Concept {
  id: ConceptId;
  slug: string;
  name: string;
  summary: string;
  category: string;
  createdAt: string;
}

export interface Commentary {
  id: CommentaryId;
  name: string;
  authorId: PersonId;
  schoolId: string;
  description: string;
}

export interface PhilosophicalSchool {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface Person {
  id: PersonId;
  name: string;
  type: PersonType;
  birthPeriod?: string;
  description: string;
}

export interface Deity {
  id: DeityId;
  name: string;
  tradition: string;
  description: string;
}

export interface VedaEvent {
  id: EventId;
  name: string;
  description: string;
  period?: string;
}

export interface Place {
  id: PlaceId;
  name: string;
  latitude?: number;
  longitude?: number;
  description: string;
}

// ---------------------------------------------------------------------------
// User Content Entities
// ---------------------------------------------------------------------------

export interface UserUpload {
  id: UploadId;
  userId: UserId;
  filename: string;
  fileType: string;
  storageKey: string;
  status: UploadStatus;
  language?: string;
  sizeBytes: number;
  uploadedAt: string;
}

export interface UploadMetadata {
  id: string;
  uploadId: UploadId;
  title: string;
  author?: string;
  publisher?: string;
  year?: number;
  tags: string[];
  metadata?: Record<string, unknown>;
}

export interface Note {
  id: NoteId;
  userId: UserId;
  title: string;
  content: string;
  createdAt: string;
}

export interface Collection {
  id: CollectionId;
  userId: UserId;
  name: string;
  description: string;
}

export interface Bookmark {
  id: string;
  userId: UserId;
  targetType: string;
  targetId: string;
  createdAt: string;
}

export interface ResearchReport {
  id: ReportId;
  userId: UserId;
  title: string;
  query: string;
  content: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Knowledge Graph Types (Neo4j)
// ---------------------------------------------------------------------------

export const GraphNodeLabel = {
  SCRIPTURE: 'Scripture',
  BOOK: 'Book',
  CHAPTER: 'Chapter',
  VERSE: 'Verse',
  CONCEPT: 'Concept',
  PERSON: 'Person',
  DEITY: 'Deity',
  PLACE: 'Place',
  EVENT: 'Event',
  STORY: 'Story',
  COMMENTARY: 'Commentary',
  SCHOOL: 'School',
  UPLOADED_DOCUMENT: 'UploadedDocument',
} as const;
export type GraphNodeLabel = (typeof GraphNodeLabel)[keyof typeof GraphNodeLabel];

export const GraphRelationship = {
  PART_OF: 'PART_OF',
  EXPLAINS: 'EXPLAINS',
  REFERENCES: 'REFERENCES',
  MENTIONS: 'MENTIONS',
  RELATED_TO: 'RELATED_TO',
  SUPPORTS: 'SUPPORTS',
  CONTRADICTS: 'CONTRADICTS',
  AUTHORED_BY: 'AUTHORED_BY',
  COMMENTS_ON: 'COMMENTS_ON',
  LOCATED_IN: 'LOCATED_IN',
  TEACHES: 'TEACHES',
  WORSHIPS: 'WORSHIPS',
} as const;
export type GraphRelationship = (typeof GraphRelationship)[keyof typeof GraphRelationship];

export interface GraphNode {
  id: string;
  label: GraphNodeLabel;
  name: string;
  slug?: string;
  properties?: Record<string, unknown>;
}

export interface GraphEdge {
  source: string;
  target: string;
  relationship: GraphRelationship;
  properties?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Citation & Evidence Types
// ---------------------------------------------------------------------------

export interface Citation {
  citationId: string;
  sourceType: SourceType;
  sourceName: string;
  reference: string;
  chapter?: number;
  verse?: number;
  confidence: number;
}

export interface EvidencePacket {
  packetId: string;
  sourceId: string;
  content: string;
  score: number;
  sourceType: SourceType;
  citation: Citation;
}

export type EvidenceLevel = 'A' | 'B' | 'C' | 'D' | 'E';

// ---------------------------------------------------------------------------
// Agent Types
// ---------------------------------------------------------------------------

export const AgentName = {
  ORCHESTRATOR: 'orchestrator',
  VEDA: 'veda_agent',
  UPANISHAD: 'upanishad_agent',
  PURANA: 'purana_agent',
  VEDANTA: 'vedanta_agent',
  SANSKRIT: 'sanskrit_agent',
  GRAPH: 'graph_agent',
  CITATION: 'citation_agent',
  RESEARCH: 'research_agent',
  UPLOAD: 'upload_agent',
} as const;
export type AgentName = (typeof AgentName)[keyof typeof AgentName];

export type AgentStatus = 'pending' | 'running' | 'completed' | 'failed' | 'timeout';

export interface AgentResponse {
  agent: AgentName;
  status: AgentStatus;
  confidence: number;
  findings: unknown[];
  citations: Citation[];
  warnings: string[];
}

export interface AgentMessage {
  taskId: string;
  agent: AgentName;
  requestType: string;
  payload: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Search Types
// ---------------------------------------------------------------------------

export type SearchMode = 'quick' | 'scholar' | 'research';

export interface SearchRequest {
  query: string;
  mode: SearchMode;
  filters?: {
    scriptures?: ScriptureCategory[];
    concepts?: string[];
    sourceTypes?: SourceType[];
  };
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  id: string;
  type: GraphNodeLabel;
  title: string;
  content: string;
  citation?: Citation;
  score: number;
  highlights?: string[];
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  mode: SearchMode;
  queryTimeMs: number;
  relatedConcepts: string[];
}

// ---------------------------------------------------------------------------
// Chat / Ask VEDA Types
// ---------------------------------------------------------------------------

export type ReasoningMode = 'quick' | 'scholar' | 'research';

export interface ChatRequest {
  message: string;
  mode: ReasoningMode;
  context?: string[];
}

export interface ChatResponse {
  answer: string;
  citations: Citation[];
  relatedConcepts: Concept[];
  confidence: number;
  evidenceLevel: EvidenceLevel;
  agentContributions: AgentResponse[];
}

// ---------------------------------------------------------------------------
// Event Types (Kafka)
// ---------------------------------------------------------------------------

export interface VedaEvent<T = unknown> {
  eventId: string;
  eventType: string;
  version: string;
  timestamp: string;
  producer: string;
  correlationId: string;
  payload: T;
}
