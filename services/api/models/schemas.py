"""
VEDA — Pydantic Models: Scripture Domain
==========================================
Request/response schemas for scripture-related endpoints.
All IDs use branded ULID format (e.g., scp_01JXYZ...).
"""

from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field, ConfigDict


# =============================================================================
# SCRIPTURE
# =============================================================================


class ScriptureBase(BaseModel):
    """Shared fields for scripture creation and response."""

    slug: str = Field(..., description="URL-friendly identifier", examples=["bhagavad-gita"])
    name: str = Field(..., description="English name", examples=["Bhagavad Gita"])
    sanskrit_name: str | None = Field(None, description="Devanagari name", examples=["भगवद्गीता"])
    category: str = Field(
        ...,
        description="Scripture category",
        examples=["gita"],
        pattern="^(veda|upanishad|gita|purana|ramayana|mahabharata|commentary)$",
    )
    language: str = Field("sanskrit", description="Primary language")
    period: str | None = Field(None, description="Historical period estimate")
    description: str | None = None
    is_canonical: bool = Field(True, description="Whether this is a canonical (read-only) source")
    metadata: dict[str, Any] = Field(default_factory=dict)


class ScriptureCreate(ScriptureBase):
    """Request body for creating a new scripture."""

    pass


class ScriptureResponse(ScriptureBase):
    """Response body for a scripture."""

    model_config = ConfigDict(from_attributes=True)

    id: str = Field(..., description="Prefixed ULID", examples=["scp_01JXYZ..."])
    created_at: datetime
    chapter_count: int = Field(0, description="Number of chapters")
    verse_count: int = Field(0, description="Total number of verses")


class ScriptureListResponse(BaseModel):
    """Paginated list of scriptures."""

    scriptures: list[ScriptureResponse]
    total: int
    page: int = 1
    per_page: int = 20


# =============================================================================
# CHAPTER
# =============================================================================


class ChapterBase(BaseModel):
    """Shared chapter fields."""

    chapter_number: int = Field(..., ge=1, description="Chapter number within the book/scripture")
    title: str | None = Field(None, examples=["Arjuna Vishada Yoga"])
    sanskrit_title: str | None = Field(None, examples=["अर्जुनविषादयोग"])
    summary: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class ChapterResponse(ChapterBase):
    """Response body for a chapter."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    book_id: str
    scripture_id: str
    created_at: datetime
    verse_count: int = 0


class ChapterListResponse(BaseModel):
    """List of chapters for a scripture."""

    chapters: list[ChapterResponse]
    total: int
    scripture_id: str
    scripture_name: str


# =============================================================================
# VERSE
# =============================================================================


class VerseContentResponse(BaseModel):
    """A single content variant for a verse (Sanskrit, transliteration, translation, etc.)."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    content_type: str = Field(
        ...,
        description="Type of content",
        examples=["sanskrit", "transliteration", "translation", "commentary", "word_meaning"],
    )
    content: str = Field(..., description="The actual text content")
    language_code: str = Field("en", description="Language code")
    source: str = Field(..., description="Translator or commentator", examples=["Swami Sivananda"])
    is_primary: bool = False


class VerseBase(BaseModel):
    """Shared verse fields."""

    verse_number: int = Field(..., ge=1)
    canonical_reference: str = Field(
        ...,
        description="Canonical reference in format BOOK.CHAPTER.VERSE",
        examples=["BG.2.47"],
    )
    metadata: dict[str, Any] = Field(default_factory=dict)


class VerseResponse(VerseBase):
    """Response body for a verse with all content variants."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    scripture_id: str
    chapter_id: str | None = None
    created_at: datetime
    contents: list[VerseContentResponse] = Field(
        default_factory=list,
        description="All content variants (Sanskrit, transliteration, translations)",
    )


class VerseListResponse(BaseModel):
    """Paginated list of verses."""

    verses: list[VerseResponse]
    total: int
    chapter_id: str | None = None
    scripture_id: str
    page: int = 1
    per_page: int = 50


class VerseBriefResponse(BaseModel):
    """Minimal verse response for lists and search results."""

    id: str
    canonical_reference: str
    verse_number: int
    sanskrit: str | None = Field(None, description="Sanskrit text (if available)")
    translation: str | None = Field(None, description="Primary English translation")


# =============================================================================
# CONCEPT
# =============================================================================


class ConceptResponse(BaseModel):
    """Response body for a concept."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    slug: str
    name: str
    sanskrit_name: str | None = None
    summary: str | None = None
    category: str | None = None
    created_at: datetime


class ConceptListResponse(BaseModel):
    """List of concepts."""

    concepts: list[ConceptResponse]
    total: int


# =============================================================================
# HEALTH CHECK
# =============================================================================


class ServiceHealth(BaseModel):
    """Health status of a single service."""

    status: str
    version: str | None = None
    error: str | None = None
    tables: str | None = None
    nodes: str | None = None
    collections: str | None = None
    cluster_status: str | None = None
    indices: str | None = None


class HealthResponse(BaseModel):
    """Full platform health check response."""

    status: str = Field(..., examples=["healthy", "degraded", "unhealthy"])
    platform: str = "VEDA"
    version: str = "0.2.0"
    timestamp: datetime
    phase: str = "2 — Data Layer"
    services: dict[str, ServiceHealth]


# =============================================================================
# CITATION & EVIDENCE
# =============================================================================


EvidenceLevel = Literal["A", "B", "C", "D", "E"]
SourceType = Literal["SCRIPTURE", "COMMENTARY", "SCHOLARLY_SOURCE", "UPLOAD", "AI_NOTE"]


class CitationResponse(BaseModel):
    """A verified citation attached to an evidence packet."""

    citation_id: str
    source_type: SourceType
    source_name: str
    reference: str
    source_id: str
    chapter: int | None = None
    verse: int | None = None
    confidence: float = Field(..., ge=0.0, le=1.0)
    evidence_level: EvidenceLevel


class CitationResolveRequest(BaseModel):
    """Resolve a user-facing reference into a verified canonical citation."""

    reference: str = Field(..., min_length=2, max_length=80, examples=["BG.2.47"])
    retrieval_score: float = Field(1.0, ge=0.0, le=1.0)
    graph_score: float = Field(0.0, ge=0.0, le=1.0)


class CitationResolveResponse(BaseModel):
    """Result of citation resolution."""

    resolved: bool
    citation: CitationResponse | None = None
    message: str | None = None


class CitationValidateRequest(BaseModel):
    """Validate that a citation can support a claim or source reference."""

    reference: str = Field(..., min_length=2, max_length=80, examples=["BG.2.47"])
    source_type: SourceType = "SCRIPTURE"
    source_id: str | None = None
    claim: str | None = Field(None, max_length=1000)
    retrieval_score: float = Field(1.0, ge=0.0, le=1.0)
    graph_score: float = Field(0.0, ge=0.0, le=1.0)


class CitationValidateResponse(BaseModel):
    """Citation validation decision from the trust layer."""

    valid: bool
    decision: Literal["approved", "flagged", "rejected"]
    citation: CitationResponse | None = None
    reason: str


class EvidencePacketResponse(BaseModel):
    """Search output consumed by citation, reasoning, and agent layers."""

    packet_id: str
    source_id: str
    source_type: SourceType
    title: str
    content: str
    citation: CitationResponse
    score: float = Field(..., ge=0.0, le=1.0)
    retrieval_source: str
    highlights: list[str] = Field(default_factory=list)
    metadata: dict[str, Any] = Field(default_factory=dict)


# =============================================================================
# SEARCH
# =============================================================================


SearchMode = Literal["quick", "scholar", "research"]
SearchIntent = Literal[
    "concept",
    "verse",
    "scripture",
    "comparison",
    "research",
    "translation",
    "upload",
    "unknown",
]


class SearchRequest(BaseModel):
    """Hybrid evidence search request. Search returns evidence, never answers."""

    query: str = Field(..., min_length=2, max_length=500)
    mode: SearchMode = Field("quick")
    source_types: list[SourceType] = Field(default_factory=lambda: ["SCRIPTURE", "COMMENTARY"])
    scripture_ids: list[str] = Field(default_factory=list)
    concept_slugs: list[str] = Field(default_factory=list)
    include_uploads: bool = False
    limit: int = Field(10, ge=1, le=50)


class QueryUnderstanding(BaseModel):
    """Lightweight query plan used before retrieval."""

    intent: SearchIntent
    normalized_query: str
    canonical_reference: str | None = None
    concepts: list[str] = Field(default_factory=list)
    graph_depth: int = Field(1, ge=0, le=5)


class SearchResponse(BaseModel):
    """Hybrid search response with citation-ready evidence packets."""

    query: str
    mode: SearchMode
    understanding: QueryUnderstanding
    results: list[EvidencePacketResponse]
    total: int
    query_time_ms: float
    warnings: list[str] = Field(default_factory=list)


# =============================================================================
# CORPUS
# =============================================================================


class ScriptureCorpusStatus(BaseModel):
    """Readiness status for a single canonical scripture."""

    scripture_id: str
    slug: str
    name: str
    chapter_count: int
    verse_count: int
    content_count: int
    sanskrit_count: int
    transliteration_count: int
    translation_count: int
    missing_sanskrit: int
    missing_translation: int
    ready_for_search: bool
    ready_for_citation: bool


class CorpusStatusResponse(BaseModel):
    """Global corpus readiness for retrieval and citation gates."""

    status: Literal["empty", "partial", "ready"]
    scriptures: list[ScriptureCorpusStatus]
    totals: dict[str, int]
    blockers: list[str] = Field(default_factory=list)
