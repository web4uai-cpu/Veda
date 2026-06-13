# Skill: Knowledge Graph (Neo4j)

## Graph Philosophy

The knowledge graph is the BACKBONE of VEDA. It defines relationships that LLMs consume — LLMs NEVER create graph data directly.

## Node Labels & Properties

```cypher
// Scripture hierarchy
(:Scripture {id, slug, name, category, language, is_canonical})
(:Book {id, scripture_id, name, position})
(:Chapter {id, book_id, chapter_number, title})
(:Verse {id, scripture_id, verse_number, canonical_reference})

// Knowledge entities
(:Concept {id, slug, name, summary, category})
(:Person {id, name, type, birth_period, description})       // type: rishi | acharya | king | saint
(:Deity {id, name, tradition, description})
(:Place {id, name, latitude, longitude, description})
(:Event {id, name, description, period})
(:Story {id, name, description, source})

// Interpretive
(:Commentary {id, name, author_id, school_id, description})
(:School {id, name, slug, description})                     // Advaita, Dvaita, etc.

// User content (separate partition)
(:UploadedDocument {id, user_id, filename, status})
```

## Relationships

```cypher
// Structural
(Verse)-[:PART_OF]->(Chapter)
(Chapter)-[:PART_OF]->(Book)
(Book)-[:PART_OF]->(Scripture)

// Knowledge
(Concept)-[:RELATED_TO {weight}]->(Concept)
(Concept)-[:EXPLAINS]->(Concept)
(Verse)-[:MENTIONS]->(Concept)
(Verse)-[:REFERENCES]->(Verse)
(Commentary)-[:COMMENTS_ON]->(Verse)

// Philosophical
(School)-[:SUPPORTS]->(Concept)
(School)-[:CONTRADICTS {reason}]->(School)
(Person)-[:TEACHES]->(Concept)
(Person)-[:AUTHORED_BY]->(Commentary)

// Spatial/Temporal
(Event)-[:LOCATED_IN]->(Place)
(Person)-[:LOCATED_IN]->(Place)
```

## Query Patterns

### Find related concepts (depth 2)
```cypher
MATCH (c:Concept {slug: $slug})-[:RELATED_TO|EXPLAINS*1..2]-(related)
RETURN related
LIMIT 20
```

### Find verses mentioning a concept
```cypher
MATCH (v:Verse)-[:MENTIONS]->(c:Concept {slug: $slug})
MATCH (v)-[:PART_OF*]->(s:Scripture)
RETURN v, s
ORDER BY s.name, v.verse_number
```

### Cross-scripture concept analysis
```cypher
MATCH (c:Concept {slug: $slug})<-[:MENTIONS]-(v:Verse)-[:PART_OF*]->(s:Scripture)
RETURN s.name AS scripture, COUNT(v) AS mentions
ORDER BY mentions DESC
```

### Philosophy school comparison
```cypher
MATCH (s1:School {slug: $school1})-[:SUPPORTS]->(c:Concept)<-[:SUPPORTS]-(s2:School {slug: $school2})
RETURN c.name AS shared_concept
```

## Constraints & Indexes

```cypher
-- Uniqueness
CREATE CONSTRAINT concept_slug FOR (c:Concept) REQUIRE c.slug IS UNIQUE;
CREATE CONSTRAINT scripture_slug FOR (s:Scripture) REQUIRE s.slug IS UNIQUE;
CREATE CONSTRAINT verse_ref FOR (v:Verse) REQUIRE v.canonical_reference IS UNIQUE;

-- Indexes
CREATE INDEX concept_name FOR (c:Concept) ON (c.name);
CREATE INDEX verse_scripture FOR (v:Verse) ON (v.scripture_id);
CREATE INDEX person_type FOR (p:Person) ON (p.type);
```

## Rules
1. Canonical nodes are IMMUTABLE after creation
2. User-uploaded documents are in a SEPARATE partition (`:UploadedDocument`)
3. All graph writes go through the graph-service (never direct from frontend)
4. Max traversal depth: 2 (quick), 3 (scholar), 5 (research)
5. Every relationship change emits a `GRAPH_UPDATED` event
