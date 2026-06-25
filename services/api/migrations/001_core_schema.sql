-- =============================================================================
-- VEDA Database Migration: 001 — Core Schema
-- =============================================================================
-- Creates the foundational tables for the VEDA Knowledge Operating System.
-- Derived from DATA_MODEL.md and IMPLEMENTATION_PLAN.md Phase 2.
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- Trigram search for fuzzy matching

-- =============================================================================
-- USER PROFILES (linked to Firebase Auth)
-- =============================================================================
CREATE TABLE user_profiles (
    id TEXT PRIMARY KEY,                     -- usr_ULID
    firebase_uid TEXT NOT NULL UNIQUE,       -- Firebase Auth UID
    email TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'user'
        CHECK (role IN ('user', 'scholar', 'moderator', 'admin')),
    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'inactive', 'suspended')),
    language TEXT DEFAULT 'en',
    theme TEXT DEFAULT 'system'
        CHECK (theme IN ('light', 'dark', 'system')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_firebase_uid ON user_profiles(firebase_uid);
CREATE INDEX idx_user_profiles_username ON user_profiles(username);

-- =============================================================================
-- SCRIPTURES (Canonical — Read-Only after seeding)
-- =============================================================================
CREATE TABLE scriptures (
    id TEXT PRIMARY KEY,                     -- scp_ULID
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    sanskrit_name TEXT,                      -- Devanagari name
    category TEXT NOT NULL
        CHECK (category IN ('veda', 'upanishad', 'gita', 'purana', 'ramayana', 'mahabharata', 'commentary')),
    language TEXT DEFAULT 'sanskrit',
    period TEXT,                             -- Historical period
    description TEXT,
    is_canonical BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_scriptures_category ON scriptures(category);
CREATE INDEX idx_scriptures_slug ON scriptures(slug);

-- =============================================================================
-- BOOKS (Mandalas, Kandas, Parvas, etc.)
-- =============================================================================
CREATE TABLE books (
    id TEXT PRIMARY KEY,                     -- bok_ULID
    scripture_id TEXT NOT NULL REFERENCES scriptures(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sanskrit_name TEXT,
    position INTEGER NOT NULL,              -- Order within scripture
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_books_scripture ON books(scripture_id);

-- =============================================================================
-- CHAPTERS
-- =============================================================================
CREATE TABLE chapters (
    id TEXT PRIMARY KEY,                     -- chp_ULID
    book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    scripture_id TEXT NOT NULL REFERENCES scriptures(id),
    chapter_number INTEGER NOT NULL,
    title TEXT,
    sanskrit_title TEXT,
    summary TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (book_id, chapter_number)
);

CREATE INDEX idx_chapters_book ON chapters(book_id);
CREATE INDEX idx_chapters_scripture ON chapters(scripture_id);

-- =============================================================================
-- VERSES
-- =============================================================================
CREATE TABLE verses (
    id TEXT PRIMARY KEY,                     -- vrs_ULID
    scripture_id TEXT NOT NULL REFERENCES scriptures(id),
    book_id TEXT REFERENCES books(id),
    chapter_id TEXT REFERENCES chapters(id),
    verse_number INTEGER NOT NULL,
    canonical_reference TEXT UNIQUE NOT NULL, -- "BG.2.47", "KU.1.2", "RV.1.1.1"
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_verses_scripture ON verses(scripture_id);
CREATE INDEX idx_verses_chapter ON verses(chapter_id);
CREATE INDEX idx_verses_reference ON verses(canonical_reference);

-- =============================================================================
-- VERSE CONTENTS (Multiple translations per verse)
-- =============================================================================
CREATE TABLE verse_contents (
    id TEXT PRIMARY KEY,
    verse_id TEXT NOT NULL REFERENCES verses(id) ON DELETE CASCADE,
    language_code TEXT NOT NULL DEFAULT 'en',
    content_type TEXT NOT NULL
        CHECK (content_type IN ('sanskrit', 'transliteration', 'translation', 'commentary', 'word_meaning')),
    content TEXT NOT NULL,
    source TEXT NOT NULL,                    -- Translator/commentator name
    version INTEGER NOT NULL DEFAULT 1,
    is_primary BOOLEAN DEFAULT false,        -- Primary translation for display
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (verse_id, content_type, source, language_code)
);

CREATE INDEX idx_verse_contents_verse ON verse_contents(verse_id);
CREATE INDEX idx_verse_contents_type ON verse_contents(content_type);

-- =============================================================================
-- CONCEPTS
-- =============================================================================
CREATE TABLE concepts (
    id TEXT PRIMARY KEY,                     -- cpt_ULID
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    sanskrit_name TEXT,
    summary TEXT,
    category TEXT,                           -- dharma, yoga, philosophy, etc.
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_concepts_slug ON concepts(slug);
CREATE INDEX idx_concepts_name_trgm ON concepts USING gin (name gin_trgm_ops);

-- =============================================================================
-- PERSONS (Rishis, Acharyas, Kings, Saints)
-- =============================================================================
CREATE TABLE persons (
    id TEXT PRIMARY KEY,                     -- prs_ULID
    name TEXT NOT NULL,
    sanskrit_name TEXT,
    person_type TEXT NOT NULL
        CHECK (person_type IN ('rishi', 'acharya', 'king', 'saint', 'deity_avatar', 'other')),
    birth_period TEXT,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- COMMENTARIES
-- =============================================================================
CREATE TABLE commentaries (
    id TEXT PRIMARY KEY,                     -- com_ULID
    name TEXT NOT NULL,
    author_id TEXT REFERENCES persons(id),
    school TEXT,                             -- advaita, vishishtadvaita, dvaita, etc.
    scripture_id TEXT REFERENCES scriptures(id),
    description TEXT,
    period TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- USER UPLOADS
-- =============================================================================
CREATE TABLE user_uploads (
    id TEXT PRIMARY KEY,                     -- upl_ULID
    user_id TEXT NOT NULL REFERENCES user_profiles(id),
    filename TEXT NOT NULL,
    file_type TEXT NOT NULL,                 -- pdf, epub, txt, docx
    storage_key TEXT NOT NULL,               -- Supabase Storage path
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    language TEXT DEFAULT 'en',
    size_bytes BIGINT,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_uploads_user ON user_uploads(user_id);
CREATE INDEX idx_uploads_status ON user_uploads(status);

-- =============================================================================
-- NOTES
-- =============================================================================
CREATE TABLE notes (
    id TEXT PRIMARY KEY,                     -- nts_ULID
    user_id TEXT NOT NULL REFERENCES user_profiles(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    target_type TEXT,                         -- verse, concept, scripture, upload
    target_id TEXT,                           -- ID of the referenced entity
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notes_user ON notes(user_id);

-- =============================================================================
-- COLLECTIONS
-- =============================================================================
CREATE TABLE collections (
    id TEXT PRIMARY KEY,                     -- col_ULID
    user_id TEXT NOT NULL REFERENCES user_profiles(id),
    name TEXT NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE collection_items (
    id TEXT PRIMARY KEY,
    collection_id TEXT NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL,                  -- verse, concept, scripture, note, upload
    item_id TEXT NOT NULL,
    added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (collection_id, item_type, item_id)
);

-- =============================================================================
-- BOOKMARKS
-- =============================================================================
CREATE TABLE bookmarks (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES user_profiles(id),
    target_type TEXT NOT NULL,                -- verse, concept, scripture
    target_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, target_type, target_id)
);

CREATE INDEX idx_bookmarks_user ON bookmarks(user_id);

-- =============================================================================
-- RESEARCH REPORTS
-- =============================================================================
CREATE TABLE research_reports (
    id TEXT PRIMARY KEY,                     -- rpt_ULID
    user_id TEXT NOT NULL REFERENCES user_profiles(id),
    title TEXT NOT NULL,
    query TEXT NOT NULL,
    mode TEXT NOT NULL DEFAULT 'research'
        CHECK (mode IN ('quick', 'scholar', 'research')),
    content TEXT,                             -- Markdown report content
    evidence_count INTEGER DEFAULT 0,
    sources_used TEXT[] DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX idx_reports_user ON research_reports(user_id);

-- =============================================================================
-- ROW LEVEL SECURITY (Supabase)
-- =============================================================================

-- Canonical data: everyone can read, nobody can write via API
ALTER TABLE scriptures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON scriptures FOR SELECT USING (true);

ALTER TABLE books ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON books FOR SELECT USING (true);

ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON chapters FOR SELECT USING (true);

ALTER TABLE verses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON verses FOR SELECT USING (true);

ALTER TABLE verse_contents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON verse_contents FOR SELECT USING (true);

ALTER TABLE concepts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON concepts FOR SELECT USING (true);

-- User data: authorization enforced at API layer (Firebase Auth + FastAPI dependencies)
-- RLS is enabled but policies are permissive — backend filters by user_id after token verification
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_reports ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- UPDATED_AT TRIGGER
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_user_profiles
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_notes
    BEFORE UPDATE ON notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
