# INGESTION_PIPELINE.md

# VEDA Knowledge Ingestion Architecture

Version: 1.0

Status: Authoritative Ingestion Specification

Owner: Knowledge Engineering Team

---

# Purpose

The ingestion system transforms raw knowledge into structured intelligence.

Input Sources:

* Scriptures
* Commentaries
* PDFs
* EPUBs
* Research Papers
* OCR Documents
* User Uploads

Output Targets:

* PostgreSQL
* Neo4j
* Qdrant
* Elasticsearch

The goal is to create:

* Searchable Knowledge
* Graph Relationships
* Citation-Ready Sources
* AI-Retrievable Evidence

---

# Core Principle

Garbage In

↓

Garbage Out

The quality of VEDA is determined by the quality of its ingestion pipeline.

Every document must pass validation before entering the system.

---

# Trust Levels

All content is assigned a trust level.

---

# Level 1

Canonical Sources

Examples

```text
Vedas

Upanishads

Bhagavad Gita

Ramayana

Mahabharata

Puranas
```

Highest Trust

Immutable

---

# Level 2

Traditional Commentaries

Examples

```text
Shankara Bhashya

Ramanuja Bhashya

Madhva Bhashya
```

High Trust

Version Controlled

---

# Level 3

Verified Scholarly Sources

Examples

```text
Academic Papers

Published Research

Verified Books
```

Medium Trust

---

# Level 4

User Uploads

Examples

```text
Personal Notes

PDFs

Research Collections
```

Personal Trust

Never Canonical

---

# Master Architecture

```text
Source

↓

Validation

↓

Extraction

↓

Normalization

↓

Enrichment

↓

Knowledge Linking

↓

Embedding

↓

Storage

↓

Indexing

↓

Ready For Retrieval
```

---

# Pipeline Types

## Canonical Scripture Pipeline

Purpose

Ingest scriptures.

Examples

```text
Rigveda

Bhagavad Gita

Katha Upanishad
```

---

## Commentary Pipeline

Purpose

Ingest commentary literature.

---

## Scholarly Pipeline

Purpose

Ingest research materials.

---

## User Upload Pipeline

Purpose

Personal knowledge ingestion.

---

# Stage 1

Document Registration

Create master record.

Stored In

PostgreSQL

Example

```json
{
  "id":"doc_123",
  "source_type":"scripture",
  "status":"processing"
}
```

---

# Stage 2

Document Validation

Purpose

Reject invalid content.

Checks

```text
File Format

File Integrity

Encoding

Metadata
```

---

Supported Formats

```text
PDF

EPUB

DOCX

TXT

MD

HTML
```

---

# Stage 3

Content Extraction

Purpose

Extract text.

---

PDF

Tools

```text
PyMuPDF

pdfplumber
```

---

EPUB

Tools

```text
ebooklib
```

---

DOCX

Tools

```text
python-docx
```

---

HTML

Tools

```text
BeautifulSoup
```

---

Output

Clean Text

---

# Stage 4

OCR Processing

Triggered If

```text
Scanned PDF

Image PDF
```

---

Recommended

```text
Tesseract

PaddleOCR

Google Vision OCR
```

---

Output

```json
{
  "page":1,
  "text":"..."
}
```

---

# Stage 5

Language Detection

Supported

```text
Sanskrit

English

Hindi

Odia

Tamil

Telugu

Kannada

Gujarati

Marathi

Bengali
```

---

Output

```json
{
  "language":"sa"
}
```

---

# Stage 6

Structure Detection

Purpose

Identify hierarchy.

---

Examples

Scripture

```text
Book

↓

Chapter

↓

Verse
```

---

Commentary

```text
Section

↓

Paragraph

↓

Reference
```

---

Research Paper

```text
Title

↓

Abstract

↓

Sections
```

---

# Stage 7

Metadata Extraction

Purpose

Create structured metadata.

---

Fields

```json
{
  "title":"",
  "author":"",
  "publisher":"",
  "year":"",
  "language":""
}
```

---

# Stage 8

Canonical Reference Detection

Purpose

Identify scripture references.

Example

```text
BG 2.47

Katha Upanishad 2.3.14

Rigveda 10.129
```

---

Output

```json
{
  "reference":"BG.2.47"
}
```

---

# Stage 9

Chunking Engine

Purpose

Prepare retrieval units.

---

Rule

Never split verses.

---

Scripture Chunk

```text
1 Verse

or

3-5 Related Verses
```

---

Commentary Chunk

```text
500-1000 Tokens
```

---

Research Chunk

```text
1000-1500 Tokens
```

---

Upload Chunk

```text
500-1000 Tokens
```

---

# Stage 10

Concept Extraction

Purpose

Identify knowledge entities.

---

Examples

```text
Atman

Brahman

Moksha

Dharma

Karma
```

---

Methods

```text
NER

Ontology Matching

Graph Lookup
```

---

Output

```json
{
  "concepts":[
    "Atman",
    "Moksha"
  ]
}
```

---

# Stage 11

Knowledge Linking

Purpose

Connect content to graph.

---

Example

```text
Chunk

↓

Moksha

↓

Atman

↓

Brahman
```

---

Neo4j Relationships

```text
MENTIONS

EXPLAINS

RELATED_TO

COMMENTS_ON
```

---

# Stage 12

Citation Generation

Purpose

Create citation-ready references.

---

Example

```json
{
  "source":"Bhagavad Gita",
  "chapter":2,
  "verse":47,
  "reference":"BG.2.47"
}
```

---

# Stage 13

Embedding Generation

Purpose

Semantic retrieval.

---

Model

Primary

```text
OpenAI Embeddings
```

Fallback

```text
BGE-M3
```

---

Output

```text
3072 Dimensions
```

---

Stored In

Qdrant

---

# Stage 14

Graph Construction

Purpose

Expand knowledge graph.

---

Creates

```text
Nodes

Relationships

Cross References
```

---

Stored In

Neo4j

---

# Stage 15

Full Text Indexing

Purpose

Keyword search.

---

Stored In

Elasticsearch

---

Indexes

```text
scriptures_index

concepts_index

commentaries_index

uploads_index
```

---

# Stage 16

Quality Validation

Purpose

Prevent bad knowledge.

---

Checks

```text
Duplicate Detection

Reference Validation

Chunk Validation

Metadata Validation

Graph Validation
```

---

# Stage 17

Publication

Status

```text
READY
```

Document becomes searchable.

---

# Canonical Scripture Pipeline

Special Rules

---

No User Editing

---

No Auto-Rewriting

---

No AI Modification

---

Preserve Original Text

---

Store

```text
Sanskrit

Transliteration

Translation
```

Separately

---

# Commentary Pipeline

Special Rules

Store

```text
Commentary

Author

School

Reference
```

---

Every commentary must link to:

```text
Verse

Chapter

Scripture
```

---

# User Upload Pipeline

Special Rules

Uploads stored in:

```text
Personal Namespace
```

---

Never merged into:

```text
Canonical Sources
```

---

May create graph references.

---

May not create scripture nodes.

---

# Research Paper Pipeline

Store

```text
Abstract

Sections

References

Authors
```

---

Extract

```text
Concepts

Citations

Relationships
```

---

# Reprocessing Strategy

When ontology changes:

```text
Re-chunk

Re-embed

Re-index

Re-link
```

---

No Data Loss Allowed

---

# Event Architecture

Events

```text
DOCUMENT_UPLOADED

OCR_COMPLETED

CHUNK_CREATED

EMBEDDING_CREATED

GRAPH_LINKED

INDEXED

READY
```

---

# Queue Architecture

Recommended

```text
Redis Streams

RabbitMQ

Kafka
```

---

Each stage is asynchronous.

---

# Monitoring

Metrics

```text
OCR Accuracy

Extraction Accuracy

Chunk Quality

Citation Accuracy

Embedding Coverage

Graph Coverage
```

---

# Failure Handling

OCR Failure

↓

Manual Review Queue

---

Metadata Failure

↓

Retry

---

Graph Linking Failure

↓

Partial Publish

---

Embedding Failure

↓

Requeue

---

# Scale Targets

Daily Documents

Year 1

```text
10,000
```

---

Year 3

```text
100,000
```

---

Year 5

```text
1,000,000+
```

---

# Ingestion Mission

The ingestion system exists to transform raw spiritual, philosophical, historical, and scholarly knowledge into structured, searchable, connected, and citation-ready intelligence.

Every answer generated by VEDA ultimately depends on the quality of this pipeline.

Therefore:

Ingestion quality is product quality.
