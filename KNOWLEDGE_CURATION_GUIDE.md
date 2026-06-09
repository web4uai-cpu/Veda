# KNOWLEDGE_CURATION_GUIDE.md

# VEDA Knowledge Curation & Ontology Governance Guide

Version: 1.0

Status: Authoritative Knowledge Governance Specification

Priority: Critical

Owner: Knowledge Council

---

# Purpose

Defines:

* Ontology Governance
* Concept Curation
* Scholar Review Process
* Knowledge Approval Workflow
* Concept Normalization
* Conflict Resolution
* Tradition Handling
* Taxonomy Evolution
* Graph Integrity Rules

This document governs how VEDA knowledge evolves over years while remaining consistent, traceable, and academically defensible.

---

# Core Philosophy

Knowledge is not data.

Knowledge is a curated network of meaning.

---

# Governance Goals

Preserve:

```text
Accuracy
Authenticity
Traceability
Consistency
Neutrality
Scholarship
```

---

Prevent:

```text
Ontology Drift
Duplicate Concepts
Unverified Claims
Tradition Mixing
Graph Corruption
```

---

# Knowledge Authority Pyramid

Level 1

```text
Canonical Scriptures
```

Highest Authority

---

Level 2

```text
Traditional Commentaries
```

---

Level 3

```text
Established Schools
```

---

Level 4

```text
Academic Research
```

---

Level 5

```text
User Content
```

Lowest Authority

---

# Knowledge Governance Structure

## Knowledge Council

Responsible For

```text
Ontology Approval
Concept Approval
Schema Evolution
Conflict Resolution
```

---

## Scholar Review Board

Responsible For

```text
Scripture Validation
Commentary Validation
Interpretation Review
```

---

## Knowledge Engineering Team

Responsible For

```text
Graph Structure
Ontology Maintenance
Data Quality
```

---

# Ontology Principles

Every concept must have:

```text
Definition
Source
Citation
Category
Relationships
```

---

No anonymous concepts allowed.

---

# Concept Lifecycle

```text
Proposed

↓

Validated

↓

Approved

↓

Published

↓

Maintained

↓

Deprecated
```

---

# Concept Identifier Rules

Every concept receives:

```text
CONCEPT-<UUID>
```

Example

```text
CONCEPT-MOKSHA
```

---

Concept IDs are permanent.

Never reused.

---

# Concept Normalization

Purpose

Prevent duplicates.

---

Example

Forbidden

```text
Moksha

Mukti

Liberation
```

as separate primary concepts.

---

Required

```text
Primary Concept

↓

Aliases

↓

Translations
```

---

Example

```text
Primary

Moksha

Aliases

Mukti

Liberation
```

---

# Canonical Concept Structure

Required Fields

```json
{
  "id":"",
  "name":"",
  "definition":"",
  "citations":[],
  "aliases":[],
  "schools":[],
  "relationships":[]
}
```

---

# Taxonomy Structure

Level 1

```text
Scriptures
```

---

Level 2

```text
Concepts
Practices
Schools
People
Places
Events
```

---

Level 3

Domain Categories

Example

```text
Vedanta
Yoga
Bhakti
Sankhya
Nyaya
```

---

# Concept Categories

## Metaphysical

Examples

```text
Atman
Brahman
Moksha
```

---

## Ethical

Examples

```text
Dharma
Ahimsa
Satya
```

---

## Practical

Examples

```text
Meditation
Yoga
Bhakti
```

---

## Cosmological

Examples

```text
Prakriti
Purusha
Loka
```

---

# Relationship Governance

Allowed Relationships Only

```text
RELATED_TO
PART_OF
TEACHES
EXPLAINS
COMMENTS_ON
PRACTICES
REFERENCES
OPPOSES
```

---

No custom relationships without approval.

---

# Relationship Validation

Every relationship requires:

```text
Source
Citation
Confidence Score
```

---

Example

```text
Atman

RELATED_TO

Brahman
```

must have evidence.

---

# Duplicate Detection

Before publishing:

Check

```text
Name Similarity
Alias Similarity
Translation Similarity
Semantic Similarity
```

---

Potential duplicates require review.

---

# Scholar Review Workflow

Submission

↓

Validation

↓

Scholar Review

↓

Knowledge Council Review

↓

Approval

↓

Publication

---

# Review Levels

Level 1

Metadata Review

---

Level 2

Citation Review

---

Level 3

Scholar Review

---

Level 4

Ontology Review

---

# Commentary Governance

Every commentary linked to:

```text
Author
Tradition
Scripture
Verse
```

---

Never detached.

---

# Tradition Management

VEDA must support:

```text
Advaita
Dvaita
Vishishtadvaita
Yoga
Sankhya
Nyaya
Mimamsa
Shaiva
Shakta
Vaishnava
```

---

# Tradition Isolation Principle

Different traditions may disagree.

Disagreement must be preserved.

---

Never merge conflicting interpretations.

---

Example

```text
Advaita Interpretation

↓

Stored Independently

Dvaita Interpretation

↓

Stored Independently
```

---

# Conflict Handling

When sources disagree:

Do not choose a winner.

---

Store

```text
Position A

Position B

Evidence

Tradition
```

---

# Comparative Knowledge Model

Example

```text
Atman

↓

Advaita View

↓

Dvaita View

↓

Vishishtadvaita View
```

---

All linked independently.

---

# Contradiction Management

Contradictions must be:

```text
Recorded
Explained
Attributed
Cited
```

---

Never hidden.

---

# Knowledge Evolution

Allowed

```text
Add Concepts
Add Sources
Add Relationships
```

---

Restricted

```text
Delete Canonical Concepts
Modify Canonical Sources
```

---

# Deprecation Process

Concept

↓

Review

↓

Replacement Mapping

↓

Archive

---

Never hard delete.

---

# Ontology Change Process

Proposal

↓

Review

↓

Approval

↓

Migration

↓

Publication

---

# Knowledge Quality Metrics

Track

```text
Citation Coverage
Relationship Accuracy
Duplicate Rate
Review Completion
Conflict Resolution
```

---

# Acceptance Thresholds

Citation Coverage

```text
100%
```

---

Duplicate Rate

```text
<1%
```

---

Relationship Validation

```text
100%
```

---

Scholar Review

```text
100%
```

for canonical content.

---

# Knowledge Graph Integrity Rules

Every node must have:

```text
Type
Source
Citation
Version
```

---

No orphan nodes.

---

No uncited relationships.

---

No anonymous sources.

---

# User Generated Knowledge

Stored Separately.

---

May create:

```text
Notes
Bookmarks
Collections
Private Links
```

---

Cannot alter:

```text
Canonical Ontology
Canonical Sources
```

---

# AI Governance Rules

AI may:

```text
Suggest Concepts
Suggest Relationships
Suggest Classifications
```

---

AI may never:

```text
Publish Concepts
Modify Ontology
Approve Knowledge
```

without review.

---

# Audit Requirements

Every ontology change records:

```text
Who
What
Why
When
Version
```

---

Permanent history required.

---

# Knowledge Preservation Rules

VEDA must preserve:

```text
Original Text
Original Source
Original Author
Original Tradition
Original Citation
```

---

Never rewrite history.

---

# North Star Principle

If a scholar examines any concept in VEDA, they must be able to determine:

```text
Where it came from

Who supports it

Who disagrees with it

Which tradition teaches it

What evidence exists
```

within minutes.

---

# Governance Mission

The purpose of knowledge curation is not merely to store information.

The purpose is to preserve the intellectual integrity of Sanatan knowledge across generations while enabling modern search, reasoning, research, and discovery.

Knowledge may grow.

Trust must never decline.
