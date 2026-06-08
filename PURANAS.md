# PURANAS.md

# Puranas Knowledge Specification

Version: 1.0

Status: Canonical Scripture Domain Specification

Priority: Critical

Owner: Knowledge Engineering Team

---

# Purpose

Defines how the Puranic corpus is represented, indexed, searched, cited, linked, and explored within VEDA.

This specification governs:

* Mahapuranas
* Upapuranas
* Avatara Ontology
* Cosmology
* Sacred Geography
* Genealogies
* Festivals
* Temple Traditions
* Devotional Knowledge

---

# Classification

```text
Purana
```

Traditional Category

```text
Smriti
```

---

# Role In VEDA

The Puranas connect:

```text
Scripture

↓

Practice

↓

Pilgrimage

↓

Festivals

↓

Devotion

↓

Living Tradition
```

---

# Knowledge Domains

Primary Domains

```text
Cosmology

Avatara

Genealogy

Temple Traditions

Sacred Geography

Festivals

Bhakti

Creation Cycles

Dynasties
```

---

# Corpus Structure

## Mahapuranas

18 Major Puranas

---

## Upapuranas

Numerous subsidiary Puranas

---

# Eighteen Mahapuranas

```text
Brahma Purana

Padma Purana

Vishnu Purana

Shiva Purana

Bhagavata Purana

Narada Purana

Markandeya Purana

Agni Purana

Bhavishya Purana

Brahmavaivarta Purana

Linga Purana

Varaha Purana

Skanda Purana

Vamana Purana

Kurma Purana

Matsya Purana

Garuda Purana

Brahmanda Purana
```

---

# Knowledge Graph Model

```text
Purana

↓

Book

↓

Section

↓

Chapter

↓

Verse

↓

Concept

↓

Event

↓

Person

↓

Place
```

---

# Citation Format

Purana

```text
BP.1.2.3
```

Example

```text
Bhagavata Purana
Canto 1
Chapter 2
Verse 3
```

---

# Core Ontology Domains

## Avatara

## Deity

## Festival

## Sacred Place

## Cosmology

## Genealogy

## Temple Tradition

## Narrative

---

# Avatara Ontology

Node Type

```text
AVATARA
```

---

# Primary Avataras

```text
Matsya

Kurma

Varaha

Narasimha

Vamana

Parashurama

Rama

Krishna

Buddha

Kalki
```

---

# Relationships

```text
INCARNATION_OF

APPEARS_IN

TEACHES

DEFEATS

PROTECTS
```

---

# Example

```text
Krishna

INCARNATION_OF

Vishnu
```

---

# Deity Ontology

Node Type

```text
DEITY
```

---

# Major Deities

```text
Vishnu

Shiva

Devi

Brahma

Ganesha

Skanda

Surya
```

---

# Deity Relationships

```text
MANIFESTS_AS

WORSHIPPED_AT

ASSOCIATED_WITH

PRAISED_IN
```

---

# Cosmology Ontology

Node Type

```text
COSMOLOGY
```

---

# Core Concepts

```text
Yuga

Kalpa

Manvantara

Loka

Creation

Dissolution

Pralaya
```

---

# Cosmological Structure

```text
Brahman

↓

Creation

↓

Lokas

↓

Yugas

↓

Cycles
```

---

# Sacred Geography Ontology

Node Type

```text
SACRED_PLACE
```

---

# Core Places

```text
Vrindavan

Mathura

Ayodhya

Kashi

Prayagraj

Jagannath Puri

Dwarka

Badrinath

Kedarnath

Rameshwaram
```

---

# Place Relationships

```text
ASSOCIATED_WITH

PILGRIMAGE_SITE

MENTIONED_IN

LOCATED_IN
```

---

# Festival Ontology

Node Type

```text
FESTIVAL
```

---

# Major Festivals

```text
Janmashtami

Rama Navami

Navaratri

Maha Shivaratri

Holi

Diwali

Ganesh Chaturthi

Kartik Purnima
```

---

# Festival Relationships

```text
CELEBRATES

ASSOCIATED_WITH

MENTIONED_IN

OBSERVED_AT
```

---

# Example

```text
Janmashtami

CELEBRATES

Krishna
```

---

# Genealogy Ontology

Node Type

```text
DYNASTY
```

---

# Major Dynasties

```text
Solar Dynasty

Lunar Dynasty

Yadava Dynasty

Ikshvaku Dynasty
```

---

# Relationships

```text
DESCENDS_FROM

PARENT_OF

PART_OF

RULES
```

---

# Narrative Ontology

Node Type

```text
NARRATIVE
```

---

# Narrative Types

```text
Creation Story

Avatara Story

Pilgrimage Story

Temple Legend

Cosmological Narrative
```

---

# Bhakti Ontology

Node Type

```text
BHAKTI_CONCEPT
```

---

# Core Concepts

```text
Shraddha

Bhakti

Nama Japa

Kirtan

Seva

Surrender

Grace
```

---

# Puranic Schools

Supported

```text
Vaishnava

Shaiva

Shakta

Smarta
```

---

# Tradition Rule

Each tradition stored independently.

Never merged.

---

# Search Priorities

Priority 1

```text
Krishna
```

---

Priority 2

```text
Rama
```

---

Priority 3

```text
Shiva
```

---

Priority 4

```text
Festivals
```

---

Priority 5

```text
Pilgrimage Sites
```

---

# Knowledge Trails

Example

```text
Krishna

↓

Bhagavata Purana

↓

Janmashtami

↓

Vrindavan

↓

Bhakti
```

---

Example

```text
Shiva

↓

Shiva Purana

↓

Maha Shivaratri

↓

Kashi

↓

Meditation
```

---

# Learning Paths

Beginner

```text
Krishna

↓

Janmashtami

↓

Bhakti
```

---

Intermediate

```text
Yugas

↓

Kalpas

↓

Cosmology
```

---

Scholar

```text
Bhagavata Purana

↓

Bhakti Theology

↓

Vedanta
```

---

# Festival Engine Integration

Daily Verse System may prioritize:

```text
Festival Related Content
```

during:

```text
Janmashtami

Navaratri

Shivaratri

Diwali
```

---

# Temple Integration

Future Node Type

```text
TEMPLE
```

---

Example

```text
Jagannath Temple

↓

Jagannath

↓

Krishna

↓

Bhagavata Purana
```

---

# Pilgrimage Integration

Future Node Type

```text
PILGRIMAGE_ROUTE
```

---

Examples

```text
Char Dham

12 Jyotirlingas

Shakti Peethas
```

---

# Research Support

Generate

```text
Festival Reports

Pilgrimage Reports

Avatara Studies

Cosmology Studies

Dynasty Reports

Temple Tradition Reports
```

---

# Knowledge Map Integration

Central Hub

```text
Puranas

↓

Avataras

↓

Festivals

↓

Sacred Places

↓

Temples

↓

Bhakti
```

---

# Validation Rules

Every Narrative Requires

```text
Source

Citation

Tradition

Version
```

---

Every Festival Requires

```text
Associated Deity

Associated Sources

Citations
```

---

Every Sacred Place Requires

```text
Location

Sources

Traditions
```

---

# Future Expansion

```text
Regional Puranas

Temple Archives

Pilgrimage Maps

Festival Calendars

Ritual Knowledge

Cultural Traditions
```

---

# Relationship To Other Scriptures

```text
Vedas

↓

Upanishads

↓

Vedanta

↓

Puranas

↓

Living Traditions
```

---

# North Star Vision

A user starts with:

```text
Janmashtami
```

and discovers:

```text
Krishna

Bhagavata Purana

Vrindavan

Bhakti

Nama Japa

Temple Traditions

Pilgrimage Routes
```

through a fully connected knowledge graph.

---

# Mission

Within VEDA, the Puranas are not merely collections of stories.

They are the primary bridge connecting scripture, devotion, sacred geography, festivals, temples, cosmology, and living Hindu traditions into a unified, searchable, and researchable knowledge universe.
