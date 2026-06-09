# DATA_MODEL.md

# VEDA Data Model

Version: 1.0

Status: Authoritative Data Specification

Owner: Data Architecture Team

---

# Purpose

This document defines:

* Data ownership
* Database responsibilities
* Primary entities
* IDs
* Relationships
* Versioning
* Multilingual support
* Upload storage
* Retrieval storage

All services must conform to this specification.

---

# Data Architecture

```text
PostgreSQL
│
├── Canonical Records
├── User Data
├── Metadata
├── Citations
└── Configuration

Neo4j
│
├── Concepts
├── Relationships
├── Graph Traversal
└── Knowledge Discovery

Qdrant
│
├── Embeddings
├── Chunks
└── Semantic Search

Elasticsearch
│
├── Full Text Search
└── Filtering
```

---

# Global ID Strategy

Every object in VEDA uses ULID.

Benefits:

* Sortable
* Distributed
* Unique

Example

```text
usr_01HXYZ...
scp_01HXYZ...
vrs_01HXYZ...
cpt_01HXYZ...
```

---

# Prefix Standards

```text
usr = User

scp = Scripture

bok = Book

chp = Chapter

vrs = Verse

cpt = Concept

prs = Person

dei = Deity

evt = Event

plc = Place

com = Commentary

upl = Upload

nts = Note

rpt = Report

col = Collection
```

---

# PostgreSQL

PostgreSQL is the source of truth.

---

# USERS

Table

users

```sql
id

email

username

display_name

avatar_url

role

status

created_at

updated_at
```

---

# USER_SETTINGS

```sql
id

user_id

language

theme

timezone

preferences
```

---

# SCRIPTURES

```sql
id

slug

name

category

language

period

description

is_canonical

created_at
```

Categories

```text
veda

upanishad

gita

purana

ramayana

mahabharata

commentary
```

---

# BOOKS

```sql
id

scripture_id

name

position

metadata
```

---

# CHAPTERS

```sql
id

book_id

chapter_number

title

metadata
```

---

# VERSES

```sql
id

scripture_id

book_id

chapter_id

verse_number

canonical_reference

created_at
```

Example

```text
BG.2.47
```

---

# VERSE_CONTENT

Versioned table.

```sql
id

verse_id

language_code

content_type

content

version

source

created_at
```

content_type

```text
sanskrit

transliteration

translation

commentary
```

---

# CONCEPTS

```sql
id

slug

name

summary

category

created_at
```

Examples

```text
Atman

Brahman

Moksha

Karma
```

---

# COMMENTARIES

```sql
id

name

author_id

school_id

description
```

---

# PHILOSOPHICAL_SCHOOLS

```sql
id

name

slug

description
```

Examples

```text
Advaita

Dvaita

Vishishtadvaita

Yoga

Sankhya
```

---

# PERSONS

```sql
id

name

type

birth_period

description
```

Types

```text
Rishi

Acharya

King

Saint
```

---

# DEITIES

```sql
id

name

tradition

description
```

---

# EVENTS

```sql
id

name

description

period
```

---

# PLACES

```sql
id

name

latitude

longitude

description
```

---

# USER_UPLOADS

```sql
id

user_id

filename

file_type

storage_key

status

language

size_bytes

uploaded_at
```

---

# UPLOAD_METADATA

```sql
id

upload_id

title

author

publisher

year

tags

metadata
```

---

# NOTES

```sql
id

user_id

title

content

created_at
```

---

# COLLECTIONS

```sql
id

user_id

name

description
```

---

# BOOKMARKS

```sql
id

user_id

target_type

target_id

created_at
```

---

# RESEARCH_REPORTS

```sql
id

user_id

title

query

content

created_at
```

---

# Neo4j Model

Neo4j stores relationships only.

---

# Labels

```text
Scripture

Book

Chapter

Verse

Concept

Person

Deity

Place

Event

Story

Commentary

School

Upload
```

---

# Core Properties

Example

Concept

```json
{
  "id":"cpt_...",
  "name":"Atman",
  "slug":"atman"
}
```

---

# Relationship Types

```text
PART_OF

EXPLAINS

REFERENCES

MENTIONS

RELATED_TO

SUPPORTS

CONTRADICTS

AUTHORED_BY

COMMENTS_ON

LOCATED_IN

TEACHES
```

---

# Example

```cypher
(Verse)-[:EXPLAINS]->(Concept)

(Concept)-[:RELATED_TO]->(Concept)

(Commentary)-[:COMMENTS_ON]->(Verse)
```

---

# Qdrant Collections

Purpose:

Semantic Retrieval

---

# scripture_chunks

Stores

```text
Vedas

Upanishads

Gita

Puranas

Ramayana

Mahabharata
```

Payload

```json
{
  "chunk_id":"",
  "verse_id":"",
  "scripture_id":"",
  "text":"",
  "language":""
}
```

---

# commentary_chunks

Stores

```text
Commentaries
```

---

# upload_chunks

Stores

```text
User Uploaded Documents
```

---

# research_chunks

Stores

```text
Generated Reports
```

---

# Embedding Standards

Primary

```text
OpenAI Embeddings
```

Fallback

```text
BGE-M3
```

Vector Size

```text
3072
```

---

# Elasticsearch Indexes

Purpose:

Fast Search

---

# scriptures_index

Fields

```json
{
  "reference":"",
  "scripture":"",
  "chapter":"",
  "verse":"",
  "text":""
}
```

---

# concepts_index

Fields

```json
{
  "name":"",
  "summary":"",
  "category":""
}
```

---

# uploads_index

Fields

```json
{
  "title":"",
  "content":"",
  "author":""
}
```

---

# Multilingual Model

Supported Languages

```text
sa
en
hi
ta
te
kn
ml
bn
gu
mr
or
```

---

# Language Strategy

Every verse can have multiple records.

Example

```text
BG.2.47

Sanskrit

English

Hindi

Odia

Tamil
```

Stored separately.

---

# Scripture Storage Format

Canonical Path

```text
Scripture

↓

Book

↓

Chapter

↓

Verse

↓

Verse Content
```

---

# Commentary Storage Format

```text
Commentary

↓

Section

↓

Verse Reference

↓

Commentary Content
```

---

# Upload Processing Model

```text
Upload

↓

Document

↓

Pages

↓

Chunks

↓

Embeddings

↓

Graph Links
```

---

# Versioning Strategy

Every editable entity includes:

```sql
version

created_at

updated_at
```

---

# Translation Versioning

Example

```text
BG.2.47

Translation v1

Translation v2

Translation v3
```

No overwrite allowed.

---

# Audit Trail

All modifications stored.

```sql
entity_id

entity_type

action

user_id

timestamp
```

---

# Citation Model

Citation Object

```json
{
  "reference":"BG.2.47",
  "scripture":"Bhagavad Gita",
  "chapter":2,
  "verse":47,
  "confidence":0.98
}
```

---

# Separation Rules

Canonical Content

Never editable by users.

---

User Uploads

Never merged into canonical scripture.

---

AI Generated Content

Never stored as scripture.

---

# Scale Targets

Year 1

```text
100k Nodes

500k Relationships

10M Chunks
```

---

Year 5

```text
1M+ Nodes

10M+ Relationships

100M+ Chunks
```

---

# Data Governance

Priority Order

1. Canonical Scripture

2. Traditional Commentary

3. Verified Sources

4. User Uploads

5. AI Generated Content

---

# Data Model Mission

The VEDA Data Model exists to ensure every scripture, concept, commentary, relationship, citation, upload, and AI-generated insight remains structured, traceable, versioned, searchable, and verifiable across the entire platform lifecycle.
