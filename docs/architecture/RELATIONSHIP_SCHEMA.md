# RELATIONSHIP_SCHEMA.md

# VEDA Knowledge Graph Relationship Schema

Version: 1.0

Status: Authoritative Graph Grammar

Priority: Critical

Owner: Knowledge Engineering Team

---

# Purpose

Defines every allowed relationship (edge) in the VEDA Knowledge Graph.

This document is the single source of truth for:

* Neo4j relationships
* Graph traversal
* Agent graph creation
* Ontology linking
* Knowledge validation

No relationship may exist unless defined here.

---

# Core Principle

Nodes represent knowledge.

Relationships represent meaning.

---

# Relationship Rules

Every relationship must have:

```json
{
  "relationship_type":"",
  "source":"",
  "citation":"",
  "confidence":"",
  "created_at":""
}
```

---

# Required Edge Metadata

Every edge requires:

```text
Source Citation

Confidence Score

Version

Creation Timestamp
```

---

# Relationship Categories

1. Structural
2. Semantic
3. Philosophical
4. Scriptural
5. Historical
6. Geographic
7. Devotional
8. Educational

---

# Structural Relationships

## PART_OF

Purpose

Hierarchy

Examples

```text
Verse

PART_OF

Chapter
```

```text
Chapter

PART_OF

Scripture
```

Allowed

```text
VERSE → CHAPTER

CHAPTER → SCRIPTURE

COMMENTARY → SCRIPTURE

SECTION → BOOK
```

---

## CONTAINS

Inverse Of

PART_OF

---

# Scriptural Relationships

## MENTIONED_IN

Examples

```text
Krishna

MENTIONED_IN

Bhagavata Purana
```

---

## APPEARS_IN

Examples

```text
Hanuman

APPEARS_IN

Ramayana
```

---

## TAUGHT_IN

Examples

```text
Moksha

TAUGHT_IN

Katha Upanishad
```

---

## PRAISED_IN

Examples

```text
Shiva

PRAISED_IN

Shiva Purana
```

---

## COMMENTS_ON

Examples

```text
Shankara Bhashya

COMMENTS_ON

BG.2.47
```

---

# Semantic Relationships

## RELATED_TO

Generic association.

Must be used sparingly.

---

Examples

```text
Karma

RELATED_TO

Dharma
```

---

## EXPLAINS

Examples

```text
Bhagavad Gita

EXPLAINS

Karma Yoga
```

---

## DEPENDS_ON

Examples

```text
Bhakti Yoga

DEPENDS_ON

Shraddha
```

---

## LEADS_TO

Examples

```text
Jnana

LEADS_TO

Moksha
```

---

## REQUIRES

Examples

```text
Meditation

REQUIRES

Discipline
```

---

# Philosophical Relationships

## TEACHES

Examples

```text
Advaita

TEACHES

Atman = Brahman
```

---

## INTERPRETS

Examples

```text
Advaita

INTERPRETS

Atman
```

---

## AGREES_WITH

Examples

```text
Advaita

AGREES_WITH

Upanishadic Nonduality
```

---

## DISAGREES_WITH

Examples

```text
Dvaita

DISAGREES_WITH

Advaita
```

---

## DERIVED_FROM

Examples

```text
Vedanta

DERIVED_FROM

Upanishads
```

---

# Person Relationships

## TEACHER_OF

Examples

```text
Drona

TEACHER_OF

Arjuna
```

---

## DISCIPLE_OF

Inverse

TEACHER_OF

---

## PARENT_OF

Examples

```text
Dasharatha

PARENT_OF

Rama
```

---

## CHILD_OF

Inverse

PARENT_OF

---

## SPOUSE_OF

Bidirectional

---

## BROTHER_OF

Bidirectional

---

## ALLY_OF

Bidirectional

---

## OPPOSES

Examples

```text
Rama

OPPOSES

Ravana
```

---

# Deity Relationships

## INCARNATION_OF

Examples

```text
Krishna

INCARNATION_OF

Vishnu
```

---

## MANIFESTATION_OF

Examples

```text
Durga

MANIFESTATION_OF

Adi Shakti
```

---

## CONSORT_OF

Examples

```text
Lakshmi

CONSORT_OF

Vishnu
```

---

## ASSOCIATED_WITH

Examples

```text
Ganesha

ASSOCIATED_WITH

Wisdom
```

---

# Festival Relationships

## CELEBRATES

Examples

```text
Janmashtami

CELEBRATES

Krishna
```

---

## OBSERVED_AT

Examples

```text
Ratha Yatra

OBSERVED_AT

Jagannath Temple
```

---

## ASSOCIATED_WITH_FESTIVAL

Examples

```text
Krishna

ASSOCIATED_WITH_FESTIVAL

Janmashtami
```

---

# Temple Relationships

## DEDICATED_TO

Examples

```text
Jagannath Temple

DEDICATED_TO

Jagannath
```

---

## LOCATED_IN

Examples

```text
Jagannath Temple

LOCATED_IN

Puri
```

---

## PART_OF_PILGRIMAGE

Examples

```text
Badrinath

PART_OF_PILGRIMAGE

Char Dham
```

---

# Geographic Relationships

## EVENT_OCCURRED_AT

Examples

```text
Kurukshetra War

EVENT_OCCURRED_AT

Kurukshetra
```

---

## RULED_BY

Examples

```text
Ayodhya

RULED_BY

Rama
```

---

# Event Relationships

## PARTICIPATED_IN

Examples

```text
Arjuna

PARTICIPATED_IN

Kurukshetra War
```

---

## CAUSED

Examples

```text
Dice Game

CAUSED

Exile
```

---

## PRECEDES

Examples

```text
Exile

PRECEDES

Kurukshetra War
```

---

## FOLLOWS

Inverse

PRECEDES

---

# Educational Relationships

## PREREQUISITE_FOR

Examples

```text
Dharma

PREREQUISITE_FOR

Karma Yoga
```

---

## LEARNING_PATH_TO

Examples

```text
Karma

LEARNING_PATH_TO

Moksha
```

---

## RECOMMENDED_AFTER

Examples

```text
Bhakti

RECOMMENDED_AFTER

Dharma
```

---

# Research Relationships

## CITES

Examples

```text
Research Report

CITES

BG.2.47
```

---

## SUPPORTED_BY

Examples

```text
Claim

SUPPORTED_BY

Verse
```

---

## CONTRADICTED_BY

Examples

```text
Interpretation

CONTRADICTED_BY

Alternative Interpretation
```

---

# Graph Validation Rules

Every edge must satisfy:

```text
Valid Relationship

Valid Node Types

Source Citation

Confidence Score
```

---

# Forbidden Relationships

Examples

```text
Temple

TEACHER_OF

Concept
```

Invalid

---

```text
Festival

PARENT_OF

Deity
```

Invalid

---

```text
Verse

SPOUSE_OF

Person
```

Invalid

---

# Edge Confidence

Canonical Scripture

```text
0.95 - 1.00
```

---

Traditional Commentary

```text
0.90 - 0.95
```

---

Academic Sources

```text
0.80 - 0.90
```

---

User Sources

```text
0.40 - 0.70
```

---

# Agent Rules

Ontology Agent

Validates relationships.

---

Graph Agent

Creates relationships.

---

Citation Agent

Validates evidence.

---

VEDA Agent

Consumes relationships.

---

# Neo4j Naming Convention

Always

```text
UPPER_CASE
```

Examples

```text
PART_OF

TEACHES

INCARNATION_OF

DEDICATED_TO

PARTICIPATED_IN
```

---

# Relationship Evolution Process

Proposal

↓

Ontology Review

↓

Approval

↓

Migration

↓

Publication

---

# Success Metrics

Relationship Validation

100%

---

Orphan Edges

0%

---

Citation Coverage

100%

---

Schema Compliance

100%

---

# North Star Principle

A relationship is not a connection.

A relationship is a claim.

Every claim must have:

* Evidence
* Citation
* Context
* Confidence

or it does not belong in the VEDA Knowledge Graph.

---

# Mission

The Relationship Schema is the grammar of the VEDA Knowledge Graph.

Nodes provide vocabulary.

Relationships provide meaning.

Together they transform scripture, philosophy, history, devotion, and culture into a coherent, explorable knowledge universe.
