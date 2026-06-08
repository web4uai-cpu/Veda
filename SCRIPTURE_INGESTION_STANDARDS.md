# SCRIPTURE_INGESTION_STANDARDS.md

# VEDA Scripture Ingestion Standards

Version: 1.0

Status: Authoritative Knowledge Acquisition Specification

Priority: Critical

Owner: Knowledge Engineering Team

---

# Purpose

This document defines:

* Scripture acquisition standards
* Source validation
* Canonical text requirements
* Metadata requirements
* Translation standards
* Commentary standards
* Citation standards
* Knowledge graph extraction standards
* OCR standards
* Versioning standards

This is the highest authority governing how knowledge enters VEDA.

---

# Core Principle

Bad knowledge in

↓

Bad reasoning out

---

Every answer produced by VEDA ultimately depends on the quality of ingested knowledge.

---

# Knowledge Hierarchy

Authority Order

```text
Canonical Scripture

↓

Traditional Commentary

↓

Scholarly Source

↓

Academic Research

↓

User Upload
```

---

Lower levels can never override higher levels.

---

# Canonical Corpus

Phase 1

```text
Bhagavad Gita

Principal Upanishads

Rigveda (selected)

Yajurveda (selected)

Samaveda (selected)

Atharvaveda (selected)
```

---

Phase 2

```text
Complete Vedas

Major Upanishads

Brahma Sutras
```

---

Phase 3

```text
Mahabharata

Ramayana

18 Mahapuranas
```

---

Phase 4

```text
Smritis

Vedangas

Darshanas

Agamas
```

---

# Accepted Source Categories

## Category A

Canonical Sources

Highest Trust

Examples

```text
Critical Editions

Recognized Sanskrit Editions

Traditional Publications
```

---

## Category B

Traditional Commentaries

Examples

```text
Shankaracharya

Ramanujacharya

Madhvacharya

Abhinavagupta
```

---

## Category C

Academic Sources

Examples

```text
Peer Reviewed Research

University Publications
```

---

## Category D

User Uploads

Lowest Trust

Must remain isolated.

---

# Source Metadata

Required For Every Source

```json
{
  "source_id":"",
  "title":"",
  "author":"",
  "translator":"",
  "language":"",
  "publication_year":"",
  "source_type":"",
  "trust_level":""
}
```

---

# Source Identification

Every source receives:

```text
SRC-
```

Example

```text
SRC-BG-001
```

---

Never reuse IDs.

---

# Scripture Identification

Format

```text
SCRIPTURE-<TYPE>-<ID>
```

Example

```text
SCRIPTURE-GITA-001
```

---

# Verse Identification

Format

```text
BG.2.47
```

---

Upanishad

```text
KU.1.2.20
```

---

Rigveda

```text
RV.1.1.1
```

---

IDs must be stable forever.

---

# OCR Standards

Minimum Accuracy

```text
99%
```

---

Required Validation

```text
Human Review
```

For canonical texts.

---

OCR Confidence

Stored For Every Page.

---

# Sanskrit Preservation

Original Sanskrit

Mandatory.

---

Never replace original text.

---

Store

```text
Devanagari

IAST

Translation
```

When available.

---

# Scripture Storage Model

Every verse stores:

```json
{
  "original_text":"",
  "transliteration":"",
  "translation":"",
  "commentaries":[]
}
```

---

# Translation Standards

Store multiple translations.

---

Never merge translations.

---

Each translation remains independent.

---

Example

```text
Translation A

Translation B

Translation C
```

---

# Commentary Standards

Every commentary linked to:

```text
Verse

Chapter

Scripture
```

---

Never detached.

---

# Citation Requirements

Every chunk must contain:

```json
{
  "citation":"",
  "source_id":"",
  "location":""
}
```

---

Example

```text
BG.2.47
```

---

# Chunking Standards

Never chunk blindly.

---

Preferred

```text
Verse

↓

Commentary

↓

Section
```

---

Forbidden

```text
Fixed 1000 Characters
```

For scripture.

---

# Knowledge Extraction

Extract

```text
Concepts

People

Places

Practices

Schools

Relationships
```

---

# Concept Extraction Example

Verse

↓

Karma

↓

Dharma

↓

Yoga

---

# Knowledge Graph Rules

Every extracted concept requires:

```text
Source

Citation

Confidence
```

---

No orphan nodes.

---

# Relationship Extraction

Allowed

```text
TEACHES

EXPLAINS

REFERENCES

RELATED_TO

PRACTICES

PART_OF
```

---

# Confidence Scoring

Canonical Sources

```text
0.95-1.00
```

---

Traditional Commentaries

```text
0.90-0.95
```

---

Academic Sources

```text
0.80-0.90
```

---

User Uploads

```text
0.40-0.70
```

---

# Translation Linking

Example

```text
BG.2.47

↓

Translation A

↓

Translation B

↓

Translation C
```

All connected to same verse node.

---

# Duplicate Detection

Required

Before ingestion.

---

Check

```text
Title

Author

Verse Count

Content Similarity
```

---

# User Upload Handling

User uploads:

```text
Cannot modify Canonical Corpus
```

---

Must be stored separately.

---

May create:

```text
Personal Concepts

Personal Notes

Personal Graph Links
```

---

# Versioning

Every source includes:

```json
{
  "version":"",
  "created_at":"",
  "updated_at":""
}
```

---

Never overwrite.

---

Create new versions.

---

# Human Review Requirements

Mandatory For

```text
Canonical Scriptures

Traditional Commentaries

Ontology Changes
```

---

# Automated Validation

Checks

```text
Missing Citations

Duplicate Verses

Broken References

Missing Metadata
```

---

# Quality Gates

Level 1

Metadata Validation

---

Level 2

Citation Validation

---

Level 3

Ontology Validation

---

Level 4

Human Review

---

# Rejection Criteria

Reject if:

```text
Missing Source

Missing Citation

Low OCR Quality

Unknown Provenance

Corrupted Content
```

---

# Ingestion Workflow

Source

↓

Validation

↓

Metadata Extraction

↓

OCR

↓

Chunking

↓

Embedding

↓

Graph Extraction

↓

Citation Validation

↓

Human Review

↓

Publish

---

# Publication Criteria

A document becomes searchable only after:

```text
Metadata Complete

Citation Complete

Graph Complete

Validation Complete
```

---

# Audit Requirements

Every ingestion action logs:

```text
Who

What

When

Version

Source
```

---

# Scholar Integrity Rules

VEDA must:

* Preserve original wording
* Preserve source attribution
* Preserve translation boundaries
* Preserve commentary authorship

---

VEDA must never:

* Rewrite scripture
* Merge translations
* Invent citations
* Remove provenance
* Hide conflicting interpretations

---

# Success Metrics

Citation Coverage

```text
100%
```

---

Canonical Validation

```text
100%
```

---

OCR Accuracy

```text
>99%
```

---

Metadata Completeness

```text
100%
```

---

# Knowledge Mission

The purpose of ingestion is not to collect documents.

The purpose of ingestion is to preserve, structure, verify, and connect knowledge so that every answer generated by VEDA remains traceable to authentic sources.

Trust begins at ingestion.

Everything else depends on it.
