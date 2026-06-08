# KNOWLEDGE_GRAPH.md

# VEDA Knowledge Graph Architecture

Version: 1.0

Status: Authoritative Ontology Specification

Owner: Knowledge Systems Team

---

# Purpose

The VEDA Knowledge Graph is the core intelligence system of the platform.

Its purpose is to transform Sanatan Dharma knowledge into a structured, interconnected, searchable, and explainable network.

The graph is the source of relationships.

LLMs are consumers of graph knowledge.

The graph is the source of truth.

---

# Design Principles

## Principle 1

Everything Important Becomes a Node

Examples:

* Concepts
* Scriptures
* Verses
* Rishis
* Deities
* Places
* Stories
* Events
* Commentaries
* Philosophical Schools

---

## Principle 2

Relationships Are First-Class Citizens

Understanding Dharma requires understanding relationships.

The graph must capture:

* Context
* Meaning
* Lineage
* Interpretation
* Influence

---

## Principle 3

Scripture Hierarchy Must Be Preserved

Every verse must know:

* Which chapter it belongs to
* Which book it belongs to
* Which scripture it belongs to

---

## Principle 4

Canonical Content Is Immutable

Canonical scripture nodes cannot be modified by users.

---

## Principle 5

User Knowledge Is Separated

User uploads remain separate and linked through references only.

---

# Graph Architecture

```text
Universe

│

├── Scriptures

├── Concepts

├── People

├── Deities

├── Places

├── Events

├── Stories

├── Commentaries

├── Schools

└── User Knowledge
```

---

# Top Level Domains

## Scriptures

Contains:

* Vedas
* Upanishads
* Bhagavad Gita
* Puranas
* Ramayana
* Mahabharata

---

## Concepts

Contains:

* Atman
* Brahman
* Dharma
* Karma
* Moksha
* Maya
* Yoga
* Bhakti

---

## People

Contains:

* Rishis
* Acharyas
* Kings
* Saints

---

## Deities

Contains:

* Vishnu
* Shiva
* Devi
* Ganesha
* Surya
* Agni

---

## Events

Contains:

* Kurukshetra War
* Samudra Manthana
* Rama Exile

---

## Places

Contains:

* Ayodhya
* Kashi
* Kurukshetra
* Kailasa

---

## Schools

Contains:

* Advaita
* Dvaita
* Vishishtadvaita
* Sankhya
* Yoga
* Nyaya
* Mimamsa
* Vaisheshika

---

# Node Types

## Scripture

Represents a major scripture.

Properties

```json
{
  "id": "",
  "name": "",
  "type": "scripture",
  "category": "",
  "language": "",
  "period": ""
}
```

---

## Book

Represents a book inside scripture.

Examples:

* Bhagavad Gita Chapter
* Purana Book
* Veda Mandala

---

## Chapter

Represents chapters.

Examples:

* Gita Chapter 2
* Kena Upanishad Chapter 1

---

## Verse

Represents the smallest citation unit.

Properties

```json
{
  "id": "",
  "verse_number": "",
  "sanskrit": "",
  "transliteration": "",
  "translation": ""
}
```

---

## Concept

Examples:

* Atman
* Brahman
* Moksha

Properties

```json
{
  "id": "",
  "name": "",
  "slug": "",
  "description": ""
}
```

---

## Person

Examples:

* Vyasa
* Valmiki
* Adi Shankaracharya

---

## Deity

Examples:

* Shiva
* Vishnu
* Krishna

---

## Event

Examples:

* Mahabharata War
* Rama Pattabhisheka

---

## Story

Examples:

* Nachiketa Story
* Prahlada Story

---

## Commentary

Examples:

* Shankara Bhashya
* Ramanuja Bhashya

---

## School

Examples:

* Advaita
* Dvaita

---

## UploadedDocument

User-owned content.

Never canonical.

---

# Core Relationships

## PART_OF

Hierarchy relationship.

Example

```text
Verse
 PART_OF
 Chapter

Chapter
 PART_OF
 Scripture
```

---

## REFERENCES

Used when one entity references another.

Example

```text
Gita Verse

REFERENCES

Atman
```

---

## EXPLAINS

Example

```text
Katha Upanishad

EXPLAINS

Atman
```

---

## TEACHES

Example

```text
Krishna

TEACHES

Karma Yoga
```

---

## AUTHORED_BY

Example

```text
Mahabharata

AUTHORED_BY

Vyasa
```

---

## COMMENTS_ON

Example

```text
Shankara Bhashya

COMMENTS_ON

Brahma Sutra
```

---

## RELATED_TO

Semantic relationship.

Example

```text
Atman

RELATED_TO

Brahman
```

---

## SUPPORTS

Example

```text
Verse

SUPPORTS

Concept
```

---

## CONTRADICTS

Used carefully.

Only for philosophical differences.

---

## LOCATED_IN

Example

```text
Kurukshetra War

LOCATED_IN

Kurukshetra
```

---

## WORSHIPS

Example

```text
Bhakti Tradition

WORSHIPS

Krishna
```

---

# Scripture Hierarchy

## Vedas

```text
Veda

│

├ Mandala

│

├ Sukta

│

└ Verse
```

---

## Upanishads

```text
Upanishad

│

├ Chapter

│

└ Verse
```

---

## Bhagavad Gita

```text
Gita

│

├ Chapter

│

└ Verse
```

---

## Puranas

```text
Purana

│

├ Book

│

├ Chapter

│

└ Story
```

---

# Concept Taxonomy

## Ultimate Reality

```text
Brahman

Paramatman

Ishvara
```

---

## Self

```text
Atman

Jivatman
```

---

## Liberation

```text
Moksha

Kaivalya

Mukti
```

---

## Ethics

```text
Dharma

Satya

Ahimsa
```

---

## Action

```text
Karma

Nishkama Karma

Karma Yoga
```

---

## Devotion

```text
Bhakti

Shraddha

Puja
```

---

## Knowledge

```text
Jnana

Vidya

Viveka
```

---

## Yoga

```text
Raja Yoga

Bhakti Yoga

Jnana Yoga

Karma Yoga
```

---

# Philosophy Layer

Each concept may have multiple interpretations.

Example

```text
Atman

├ Advaita Interpretation

├ Dvaita Interpretation

├ Vishishtadvaita Interpretation

└ Kashmir Shaivism Interpretation
```

No interpretation overrides another.

All remain linked.

---

# User Knowledge Graph

Separate namespace.

```text
User

│

├ Notes

├ Highlights

├ Uploads

├ Research

└ Collections
```

---

# Upload Linking Model

Example

User uploads:

"Commentary on Moksha"

System creates:

```text
Document

REFERENCES

Moksha

RELATED_TO

Atman

RELATED_TO

Brahman
```

User document remains isolated.

Only references connect it.

---

# Neo4j Labels

Primary Labels

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

UploadedDocument
```

---

# Neo4j Indexes

Indexes Required

```cypher
Concept.name

Verse.id

Scripture.name

Person.name

Deity.name

School.name
```

---

# Graph Traversal Rules

Maximum depth:

5

Default depth:

2

Purpose:

Prevent excessive traversal costs.

---

# Knowledge Discovery Rules

When user asks:

"What is Moksha?"

System retrieves:

1. Moksha Node

2. Related Concepts

3. Supporting Verses

4. Related Commentaries

5. School Interpretations

6. Related Stories

7. Connected Practices

---

# Graph Scale Targets

Year 1

100,000 Nodes

500,000 Relationships

---

Year 3

500,000 Nodes

3 Million Relationships

---

Year 5

1 Million+ Nodes

10 Million+ Relationships

---

# Future Extensions

Planned Node Types

* Audio
* Video
* Manuscript
* Research Paper
* Festival
* Temple
* Ritual

---

# Knowledge Graph Mission

The VEDA Knowledge Graph represents the intellectual, spiritual, philosophical, historical, and cultural structure of Sanatan Dharma as a living, interconnected network.

It is the platform's primary intelligence layer.

Every search, answer, citation, report, recommendation, and research workflow must ultimately derive from the graph.
