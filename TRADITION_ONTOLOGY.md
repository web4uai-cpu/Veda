# TRADITION_ONTOLOGY.md

# VEDA Tradition Ontology

Version: 1.0

Status: Authoritative Tradition Model

Priority: Critical

Owner: Knowledge Engineering Team

---

# Purpose

Defines all traditions, sampradayas, lineages, schools, sects, and devotional communities represented within VEDA.

This ontology governs:

* Sampradayas
* Paramparas
* Traditions
* Denominations
* Lineages
* Spiritual Communities
* Historical Development

---

# Core Principle

Scriptures may be shared.

Interpretations may differ.

Traditions preserve those interpretations.

---

# Tradition Hierarchy

```text
Sanatan Dharma

├── Vedanta Traditions
├── Vaishnava Traditions
├── Shaiva Traditions
├── Shakta Traditions
├── Smarta Traditions
├── Yoga Traditions
├── Tantra Traditions
└── Regional Traditions
```

---

# Tradition Node Schema

```json
{
  "tradition_id":"",
  "name":"",
  "parent_tradition":"",
  "founder":"",
  "period":"",
  "primary_texts":[],
  "core_concepts":[],
  "deities":[],
  "practices":[]
}
```

---

# Primary Tradition Categories

## Vedanta Traditions

```text
Advaita Vedanta

Vishishtadvaita Vedanta

Dvaita Vedanta

Bhedabheda

Achintya Bheda Abheda

Dvaitadvaita

Shuddhadvaita
```

---

## Vaishnava Traditions

```text
Sri Vaishnava

Madhva Sampradaya

Gaudiya Vaishnava

Pushtimarg

Nimbarka Sampradaya

Ramanandi
```

---

## Shaiva Traditions

```text
Kashmir Shaivism

Shaiva Siddhanta

Pashupata

Veerashaiva

Lingayat
```

---

## Shakta Traditions

```text
Sri Vidya

Kaula

Trika

Shakta Tantra
```

---

## Smarta Tradition

```text
Smarta

Panchayatana
```

---

## Yoga Traditions

```text
Patanjala Yoga

Nath Tradition

Hatha Yoga Lineages
```

---

# Relationships

```text
BELONGS_TO

DERIVED_FROM

FOUNDED_BY

FOLLOWS

INFLUENCED_BY

ASSOCIATED_WITH

PRESERVES

COMMENTS_ON

PRACTICES
```

---

# Example

```text
Sri Vaishnava

DERIVED_FROM

Vishishtadvaita
```

---

```text
Gaudiya Vaishnava

FOLLOWS

Achintya Bheda Abheda
```

---

```text
Lingayat

DERIVED_FROM

Shaiva Tradition
```

---

# Founder Relationships

Examples

```text
Advaita Vedanta

ASSOCIATED_WITH

Shankaracharya
```

---

```text
Vishishtadvaita

ASSOCIATED_WITH

Ramanujacharya
```

---

```text
Dvaita

ASSOCIATED_WITH

Madhvacharya
```

---

# Scripture Associations

Every tradition may define:

```text
Primary Scriptures

Secondary Scriptures

Commentarial Corpus
```

---

# Example

Advaita

```text
Upanishads

Bhagavad Gita

Brahma Sutras
```

---

Gaudiya

```text
Bhagavata Purana

Bhagavad Gita

Chaitanya Literature
```

---

# Commentary Associations

Examples

```text
Advaita

↓

Shankara Bhashya
```

---

```text
Sri Vaishnava

↓

Sri Bhashya
```

---

```text
Madhva

↓

Anuvyakhyana
```

---

# Deity Associations

Tradition-specific emphasis.

---

Examples

```text
Gaudiya

↓

Radha-Krishna
```

---

```text
Sri Vaishnava

↓

Narayana
```

---

```text
Shaiva Siddhanta

↓

Shiva
```

---

```text
Sri Vidya

↓

Lalita Tripurasundari
```

---

# Practice Associations

Examples

```text
Gaudiya

↓

Nama Sankirtana
```

---

```text
Sri Vaishnava

↓

Temple Worship
```

---

```text
Nath

↓

Hatha Yoga
```

---

# Temple Associations

Examples

```text
Jagannath Temple

ASSOCIATED_WITH

Gaudiya Vaishnava
```

---

```text
Srirangam

ASSOCIATED_WITH

Sri Vaishnava
```

---

```text
Kashi Vishwanath

ASSOCIATED_WITH

Shaiva
```

---

# Festival Associations

Examples

```text
Janmashtami

ASSOCIATED_WITH

Vaishnava Traditions
```

---

```text
Maha Shivaratri

ASSOCIATED_WITH

Shaiva Traditions
```

---

```text
Navaratri

ASSOCIATED_WITH

Shakta Traditions
```

---

# Parampara Model

Node Type

```text
PARAMPARA
```

---

Relationships

```text
TEACHER_OF

DISCIPLE_OF

SUCCESSOR_OF
```

---

Example

```text
Shankaracharya

↓

Sureshvara

↓

Tradition Continuity
```

---

# Tradition Isolation Rules

Critical Rule

Traditions must never be merged.

---

Example

Invalid

```text
Advaita + Dvaita

↓

Single Interpretation
```

---

Valid

```text
Advaita Position

↓

Source

↓

Citation

----------------

Dvaita Position

↓

Source

↓

Citation
```

---

# Retrieval Rules

RLM Layer must support:

```text
Tradition-Aware Retrieval

Tradition Filtering

Tradition Comparison

Tradition-Specific Search
```

---

Examples

```text
Show Advaita interpretation of Moksha
```

---

```text
Compare Dvaita and Vishishtadvaita
```

---

# Scholar Mode

Must support:

```text
Tradition Matrix

Interpretation Matrix

Commentary Comparison

Parampara Analysis
```

---

# Learning Mode

Generate:

```text
Tradition Learning Paths

Tradition Introductions

Tradition Maps

Parampara Timelines
```

---

# Research Support

Generate:

```text
Tradition Reports

Influence Networks

Cross-Tradition Comparisons

Historical Development Reports

Commentary Networks
```

---

# Validation Rules

Every Tradition Requires

```text
Founder

Primary Sources

Core Concepts

At Least One Commentary

At Least One Lineage
```

---

No tradition without sources.

No tradition without citations.

No tradition without historical context.

---

# Knowledge Graph Position

```text
Tradition

↓

Philosophy

↓

Commentary

↓

Practice

↓

Temple

↓

Festival

↓

Community
```

---

# North Star Vision

A user starts with:

```text
Advaita Vedanta
```

and discovers:

```text
Shankaracharya

↓

Upanishads

↓

Brahman

↓

Atman

↓

Shankara Bhashya

↓

Guru Parampara

↓

Sacred Sites

↓

Practices
```

through a fully connected tradition-aware knowledge graph.

---

# Mission

The Tradition Ontology exists to preserve the diversity of Sanatan Dharma while enabling structured exploration, comparison, learning, and research.

It ensures that every teaching, commentary, practice, temple, festival, and philosophy remains properly rooted in its living tradition, lineage, and historical context.
