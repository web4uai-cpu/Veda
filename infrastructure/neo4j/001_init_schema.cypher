// =============================================================================
// VEDA Neo4j Initialization — Constraints & Indexes
// =============================================================================
// Run this against a fresh Neo4j instance to set up the knowledge graph schema.
// Derived from KNOWLEDGE_GRAPH.md and the 12 ontology documents.
// =============================================================================

// --- Uniqueness Constraints ---

CREATE CONSTRAINT scripture_id IF NOT EXISTS FOR (s:Scripture) REQUIRE s.id IS UNIQUE;
CREATE CONSTRAINT scripture_slug IF NOT EXISTS FOR (s:Scripture) REQUIRE s.slug IS UNIQUE;
CREATE CONSTRAINT book_id IF NOT EXISTS FOR (b:Book) REQUIRE b.id IS UNIQUE;
CREATE CONSTRAINT chapter_id IF NOT EXISTS FOR (c:Chapter) REQUIRE c.id IS UNIQUE;
CREATE CONSTRAINT verse_id IF NOT EXISTS FOR (v:Verse) REQUIRE v.id IS UNIQUE;
CREATE CONSTRAINT verse_ref IF NOT EXISTS FOR (v:Verse) REQUIRE v.canonical_reference IS UNIQUE;
CREATE CONSTRAINT concept_id IF NOT EXISTS FOR (c:Concept) REQUIRE c.id IS UNIQUE;
CREATE CONSTRAINT concept_slug IF NOT EXISTS FOR (c:Concept) REQUIRE c.slug IS UNIQUE;
CREATE CONSTRAINT person_id IF NOT EXISTS FOR (p:Person) REQUIRE p.id IS UNIQUE;
CREATE CONSTRAINT deity_id IF NOT EXISTS FOR (d:Deity) REQUIRE d.id IS UNIQUE;
CREATE CONSTRAINT place_id IF NOT EXISTS FOR (pl:Place) REQUIRE pl.id IS UNIQUE;
CREATE CONSTRAINT event_id IF NOT EXISTS FOR (e:Event) REQUIRE e.id IS UNIQUE;
CREATE CONSTRAINT story_id IF NOT EXISTS FOR (st:Story) REQUIRE st.id IS UNIQUE;
CREATE CONSTRAINT commentary_id IF NOT EXISTS FOR (cm:Commentary) REQUIRE cm.id IS UNIQUE;
CREATE CONSTRAINT school_id IF NOT EXISTS FOR (sc:School) REQUIRE sc.id IS UNIQUE;
CREATE CONSTRAINT upload_id IF NOT EXISTS FOR (u:UploadedDocument) REQUIRE u.id IS UNIQUE;

// --- Performance Indexes ---

CREATE INDEX scripture_name IF NOT EXISTS FOR (s:Scripture) ON (s.name);
CREATE INDEX scripture_category IF NOT EXISTS FOR (s:Scripture) ON (s.category);
CREATE INDEX verse_scripture IF NOT EXISTS FOR (v:Verse) ON (v.scripture_id);
CREATE INDEX verse_number IF NOT EXISTS FOR (v:Verse) ON (v.verse_number);
CREATE INDEX concept_name IF NOT EXISTS FOR (c:Concept) ON (c.name);
CREATE INDEX concept_category IF NOT EXISTS FOR (c:Concept) ON (c.category);
CREATE INDEX person_name IF NOT EXISTS FOR (p:Person) ON (p.name);
CREATE INDEX person_type IF NOT EXISTS FOR (p:Person) ON (p.type);
CREATE INDEX deity_name IF NOT EXISTS FOR (d:Deity) ON (d.name);
CREATE INDEX school_name IF NOT EXISTS FOR (sc:School) ON (sc.name);
CREATE INDEX upload_user IF NOT EXISTS FOR (u:UploadedDocument) ON (u.user_id);

// --- Full-Text Search Indexes ---

CREATE FULLTEXT INDEX concept_search IF NOT EXISTS
    FOR (c:Concept) ON EACH [c.name, c.summary];

CREATE FULLTEXT INDEX verse_search IF NOT EXISTS
    FOR (v:Verse) ON EACH [v.canonical_reference];
