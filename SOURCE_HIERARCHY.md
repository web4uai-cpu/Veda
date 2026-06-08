# SOURCE_HIERARCHY.md

# VEDA Source Hierarchy & Authority Framework

Version: 1.0

Status: Constitutional Knowledge Specification

Priority: Critical

Owner: Knowledge Council

---

# Purpose

Defines:

* Source Authority
* Source Ranking
* Retrieval Priority
* Citation Weighting
* Conflict Resolution
* Trust Scoring
* Evidence Ranking
* Reasoning Authority

This document governs how VEDA decides what information is most authoritative when multiple sources exist.

---

# Constitutional Principle

Not all sources carry equal authority.

All sources may be searchable.

Not all sources may be trusted equally.

---

# Core Objectives

Ensure:

```text
Accuracy

Traceability

Transparency

Scholarly Integrity

Tradition Preservation
```

---

Prevent:

```text
Hallucination

Source Mixing

False Equivalence

Citation Abuse

Ontology Corruption
```

---

# Source Authority Pyramid

Level 1

Canonical Scriptures

Highest Authority

---

Level 2

Traditional Commentaries

---

Level 3

Recognized Traditions

---

Level 4

Historical Sources

---

Level 5

Academic Research

---

Level 6

Curated Community Content

---

Level 7

User Uploads

Lowest Authority

````

---

# Level 1 Sources

Canonical Scriptures

Trust Score

```text
1.00
````

---

Includes

```text
Vedas

Upanishads

Bhagavad Gita

Mahabharata

Ramayana

Puranas

Brahma Sutras
```

---

# Authority Rules

Cannot be overridden.

Cannot be demoted.

Always preserved.

---

# Retrieval Priority

Highest

---

# Citation Weight

Maximum

---

# Level 2 Sources

Traditional Commentaries

Trust Score

```text
0.95
```

---

Examples

```text
Shankara Bhashya

Sri Bhashya

Anuvyakhyana

Vedanta Desika Works

Gaudiya Commentaries
```

---

# Authority Rules

May interpret scripture.

May not replace scripture.

---

# Level 3 Sources

Recognized Traditions

Trust Score

```text
0.90
```

---

Examples

```text
Advaita

Dvaita

Vishishtadvaita

Shaiva Siddhanta

Sri Vidya

Gaudiya
```

---

# Authority Rules

Preserve viewpoints.

Never treated as universal truth.

---

# Level 4 Sources

Historical Sources

Trust Score

```text
0.85
```

---

Examples

```text
Epigraphy

Temple Inscriptions

Manuscripts

Archaeological Records
```

---

# Authority Rules

Used for historical context.

Not used to override scripture.

---

# Level 5 Sources

Academic Research

Trust Score

```text
0.80
```

---

Examples

```text
Peer Reviewed Papers

Academic Books

University Research
```

---

# Authority Rules

Contextual only.

Must remain separate from traditional interpretations.

---

# Level 6 Sources

Curated Community Content

Trust Score

```text
0.65
```

---

Examples

```text
Scholar Essays

Editorial Content

Verified Contributions
```

---

# Level 7 Sources

User Uploads

Trust Score

```text
0.40 - 0.70
```

---

Examples

```text
PDF Uploads

Personal Notes

Books

Research Documents
```

---

# Critical Rule

User uploads are searchable.

User uploads are not automatically authoritative.

---

# Source Categories

## Canonical

## Commentary

## Tradition

## Historical

## Academic

## Community

## User

---

# Source Metadata Model

Every source requires:

```json
{
  "source_id":"",
  "title":"",
  "type":"",
  "authority_level":"",
  "trust_score":0,
  "origin":"",
  "citations":[]
}
```

---

# Retrieval Priority Formula

```text
Authority

×

Citation Coverage

×

Source Quality

×

Relevance

×

Freshness
```

---

# Trust Score Formula

```text
Authority Weight

+

Citation Quality

+

Scholar Review

+

Verification Status
```

---

# Conflict Resolution Model

When sources disagree:

Never merge claims.

---

Required Output

```text
Position A

Source

Authority Level

Citation

------------

Position B

Source

Authority Level

Citation
```

---

# Example

Question

```text
What is Moksha?
```

---

Output

```text
Advaita View

Source:
Shankara

Authority:
Level 2

------------

Dvaita View

Source:
Madhva

Authority:
Level 2
```

---

# Override Rules

Lower authority cannot override higher authority.

---

Invalid

```text
User Upload

overrides

Bhagavad Gita
```

---

Invalid

```text
Blog Post

overrides

Upanishad
```

---

Valid

```text
User Upload

supplements

Bhagavad Gita
```

---

# Citation Engine Rules

Citation Agent must rank:

```text
Canonical Sources

↓

Commentaries

↓

Traditions

↓

Historical Sources

↓

Academic Sources

↓

User Sources
```

---

# RLM Rules

Retrieval Order

```text
Scripture

↓

Commentary

↓

Tradition

↓

Historical

↓

Academic

↓

User
```

---

# Upload Integration Rules

User uploads receive:

```text
Authority Separation
```

---

Example

```text
Uploaded PDF

↓

Separate Source Layer
```

---

Never merged into canonical ontology automatically.

---

# Scholar Review System

Authority Increase Possible

Only after:

```text
Review

Validation

Citation Audit
```

---

# Source Confidence Levels

Canonical

```text
0.95 - 1.00
```

---

Traditional

```text
0.90 - 0.95
```

---

Historical

```text
0.85 - 0.90
```

---

Academic

```text
0.80 - 0.85
```

---

Community

```text
0.65 - 0.80
```

---

User

```text
0.40 - 0.70
```

---

# AI Reasoning Rules

AI may:

```text
Compare Sources

Summarize Sources

Analyze Sources
```

---

AI may not:

```text
Invent Sources

Override Sources

Create Authority
```

---

# Agent Authority Rules

Citation Agent

Highest Authority

for evidence validation.

---

Ontology Agent

Highest Authority

for graph integrity.

---

Research Agent

Consumes authority rankings.

---

VEDA Agent

Must obey authority rankings.

---

# Knowledge Graph Rules

Every node must store:

```text
Authority Level

Trust Score

Source Type
```

---

Every relationship must store:

```text
Evidence Source

Authority Level

Confidence
```

---

# Transparency Requirements

Every answer must expose:

```text
Source

Authority Level

Citation

Confidence
```

when requested.

---

# Source Evolution

New source categories require:

```text
Proposal

Review

Approval

Migration
```

---

# Constitutional Law

If a lower-authority source contradicts a higher-authority source:

The contradiction is recorded.

The higher-authority source remains authoritative.

---

# North Star Principle

A user should always be able to determine:

```text
Where information came from

Why it was trusted

What alternatives exist

How authoritative it is
```

within seconds.

---

# Mission

The Source Hierarchy exists to ensure that VEDA remains a trustworthy knowledge system rather than a collection of documents.

Knowledge may expand indefinitely.

Trust must remain mathematically enforceable.
