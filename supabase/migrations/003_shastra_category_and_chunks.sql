-- =============================================================================
-- Migration 003: Add 'shastra' category + upload_chunks table
-- =============================================================================
-- Extends the scriptures category constraint and adds infrastructure for
-- PDF upload processing (text extraction → chunked storage).
-- =============================================================================

-- --- Extend scriptures category constraint ---
ALTER TABLE scriptures DROP CONSTRAINT IF EXISTS scriptures_category_check;
ALTER TABLE scriptures ADD CONSTRAINT scriptures_category_check
    CHECK (category IN ('veda', 'upanishad', 'gita', 'purana', 'ramayana', 'mahabharata', 'commentary', 'shastra'));

-- --- Extend user_uploads with title and scripture link ---
ALTER TABLE user_uploads ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE user_uploads ADD COLUMN IF NOT EXISTS scripture_id TEXT REFERENCES scriptures(id);
CREATE INDEX IF NOT EXISTS idx_uploads_scripture ON user_uploads(scripture_id);

-- --- Upload Chunks (extracted text segments from PDFs) ---
CREATE TABLE IF NOT EXISTS upload_chunks (
    id TEXT PRIMARY KEY,                         -- chk_ULID
    upload_id TEXT NOT NULL REFERENCES user_uploads(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    page_start INTEGER,
    page_end INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (upload_id, chunk_index)
);

CREATE INDEX IF NOT EXISTS idx_upload_chunks_upload ON upload_chunks(upload_id);
CREATE INDEX IF NOT EXISTS idx_upload_chunks_content_trgm ON upload_chunks USING gin (content gin_trgm_ops);

-- --- RLS for upload_chunks ---
ALTER TABLE upload_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own upload chunks"
    ON upload_chunks FOR SELECT
    USING (
        upload_id IN (
            SELECT id FROM user_uploads
            WHERE user_id IN (
                SELECT id FROM user_profiles WHERE supabase_uid = auth.uid()
            )
        )
    );
