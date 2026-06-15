-- =============================================================================
-- VEDA Database Migration: 002 — Citations, Evidence, and Search Audit
-- =============================================================================
-- Creates the trust-layer tables required before reasoning or agents.
-- =============================================================================

CREATE TABLE citations (
    id TEXT PRIMARY KEY,                         -- cit_ULID
    source_type TEXT NOT NULL
        CHECK (source_type IN ('SCRIPTURE', 'COMMENTARY', 'SCHOLARLY_SOURCE', 'UPLOAD', 'AI_NOTE')),
    source_id TEXT NOT NULL,
    source_name TEXT NOT NULL,
    reference TEXT NOT NULL,
    chapter INTEGER,
    verse INTEGER,
    confidence NUMERIC(5,4) NOT NULL
        CHECK (confidence >= 0 AND confidence <= 1),
    evidence_level TEXT NOT NULL
        CHECK (evidence_level IN ('A', 'B', 'C', 'D', 'E')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_citations_source ON citations(source_type, source_id);
CREATE INDEX idx_citations_reference ON citations(reference);
CREATE INDEX idx_citations_confidence ON citations(confidence DESC);

CREATE TABLE evidence_packets (
    id TEXT PRIMARY KEY,                         -- pkt_ULID
    citation_id TEXT NOT NULL REFERENCES citations(id) ON DELETE CASCADE,
    source_type TEXT NOT NULL
        CHECK (source_type IN ('SCRIPTURE', 'COMMENTARY', 'SCHOLARLY_SOURCE', 'UPLOAD', 'AI_NOTE')),
    source_id TEXT NOT NULL,
    retrieval_source TEXT NOT NULL,              -- postgres.keyword, qdrant.semantic, neo4j.concept, etc.
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    score NUMERIC(5,4) NOT NULL
        CHECK (score >= 0 AND score <= 1),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_evidence_packets_citation ON evidence_packets(citation_id);
CREATE INDEX idx_evidence_packets_source ON evidence_packets(source_type, source_id);
CREATE INDEX idx_evidence_packets_score ON evidence_packets(score DESC);

CREATE TABLE search_queries (
    id TEXT PRIMARY KEY,                         -- qry_ULID
    user_id TEXT REFERENCES user_profiles(id),
    query TEXT NOT NULL,
    mode TEXT NOT NULL
        CHECK (mode IN ('quick', 'scholar', 'research')),
    intent TEXT,
    result_count INTEGER NOT NULL DEFAULT 0,
    latency_ms NUMERIC(10,2),
    warnings TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_search_queries_user ON search_queries(user_id);
CREATE INDEX idx_search_queries_created ON search_queries(created_at DESC);

CREATE TABLE citation_audit_logs (
    id TEXT PRIMARY KEY,
    correlation_id TEXT,
    citation_id TEXT REFERENCES citations(id) ON DELETE SET NULL,
    decision TEXT NOT NULL
        CHECK (decision IN ('approved', 'flagged', 'rejected')),
    reason TEXT,
    confidence NUMERIC(5,4)
        CHECK (confidence >= 0 AND confidence <= 1),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_citation_audit_correlation ON citation_audit_logs(correlation_id);
CREATE INDEX idx_citation_audit_decision ON citation_audit_logs(decision);

ALTER TABLE citations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON citations FOR SELECT USING (true);

ALTER TABLE evidence_packets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON evidence_packets FOR SELECT USING (true);

ALTER TABLE search_queries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own search history" ON search_queries FOR SELECT
    USING (user_id IN (SELECT id FROM user_profiles WHERE supabase_uid = auth.uid()));

ALTER TABLE citation_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read citation audits" ON citation_audit_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM user_profiles
            WHERE supabase_uid = auth.uid()
              AND role IN ('admin', 'moderator')
        )
    );
