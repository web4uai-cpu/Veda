# PERSON_ONTOLOGY.md

# VEDA Person Ontology

Version: 1.0

Status: Authoritative Person Model

Priority: Critical

Owner: Knowledge Engineering Team

---

# Purpose

Defines all person entities represented in VEDA.

This specification governs:

* Historical Figures
* Scriptural Figures
* Sages
* Rishis
* Gurus
* Acharyas
* Kings
* Saints
* Avatara Personalities
* Divine Personalities

---

# Core Principle

People are not merely characters.

They are knowledge hubs connecting:

* Scriptures
* Concepts
* Events
* Traditions
* Teachings
* Locations
* Genealogies

---

# Person Categories

## Divine Personalities

Examples

```text
Krishna
Rama
Narasimha
Vamana
Parashurama
```

---

## Rishis

Examples

```text
Vyasa
Vasistha
Vishvamitra
Yajnavalkya
Narada
```

---

## Acharyas

Examples

```text
Shankaracharya
Ramanujacharya
Madhvacharya
Vallabhacharya
Nimbarka
```

---

## Epic Figures

Examples

```text
Arjuna
Bhishma
Draupadi
Karna
Hanuman
Sita
Lakshmana
```

---

## Kings

Examples

```text
Dasharatha
Janaka
Yudhishthira
Harishchandra
```

---

## Saints

Examples

```text
Tukaram
Mirabai
Kabir
Namdev
Tulsidas
```

---

# Person Node Schema

```json
{
  "person_id":"",
  "name":"",
  "aliases":[],
  "category":"",
  "tradition":"",
  "description":"",
  "sources":[],
  "citations":[],
  "confidence_score":0.0
}
```

---

# Canonical Identifier

Format

```text
PERSON-<UUID>
```

Example

```text
PERSON-KRISHNA
PERSON-VYASA
PERSON-SHANKARACHARYA
```

---

# Name Normalization

Store

```text
Primary Name

Aliases

Transliterations

Regional Names
```

---

Example

```text
Krishna

Aliases

Shri Krishna
Sri Krishna
Govinda
Gopala
Madhava
Vasudeva
```

---

# Person Relationships

## Family Relationships

```text
PARENT_OF
CHILD_OF
BROTHER_OF
SISTER_OF
SPOUSE_OF
DESCENDS_FROM
```

---

## Educational Relationships

```text
TEACHER_OF
DISCIPLE_OF
GUIDES
INFLUENCES
```

---

## Social Relationships

```text
ALLY_OF
OPPOSES
RULES
SERVES
ADVISES
```

---

## Scriptural Relationships

```text
APPEARS_IN
MENTIONED_IN
TEACHES
PRACTICES
```

---

# Divine Personality Model

Special Category

```text
DIVINE_PERSON
```

---

Examples

```text
Krishna
Rama
Narasimha
```

---

Additional Relationships

```text
INCARNATION_OF
MANIFESTATION_OF
WORSHIPPED_AS
```

---

# Rishi Ontology

Node Type

```text
RISHI
```

---

Responsibilities

```text
Reveals Knowledge
Authors Texts
Teaches Disciples
```

---

Example

```text
Vyasa

AUTHORED

Mahabharata
```

---

# Acharya Ontology

Node Type

```text
ACHARYA
```

---

Relationships

```text
FOUNDED
COMMENTED_ON
INTERPRETED
TEACHES
```

---

Example

```text
Shankaracharya

INTERPRETED

Upanishads
```

---

# Epic Character Ontology

Node Type

```text
EPIC_PERSON
```

---

Examples

```text
Arjuna
Bhishma
Karna
Sita
Hanuman
```

---

Relationships

```text
PARTICIPATED_IN
ALLY_OF
OPPOSES
```

---

# Historical Confidence

Every person receives:

```json
{
  "historicity":"mythic|traditional|historical|mixed"
}
```

---

Examples

```text
Krishna → traditional

Shankaracharya → historical

Arjuna → traditional
```

---

# Genealogy Model

Support

```text
Lineages
Dynasties
Teacher Chains
Successions
```

---

Example

```text
Dasharatha

PARENT_OF

Rama
```

---

Example

```text
Guru

TEACHER_OF

Disciple
```

---

# Tradition Affiliation

Supported

```text
Advaita
Dvaita
Vishishtadvaita
Shaiva
Shakta
Vaishnava
Smarta
```

---

# Event Participation

Examples

```text
Arjuna

PARTICIPATED_IN

Kurukshetra War
```

---

```text
Hanuman

PARTICIPATED_IN

Search For Sita
```

---

# Scripture Connections

Examples

```text
Krishna

APPEARS_IN

Mahabharata
```

---

```text
Krishna

TEACHES

Bhagavad Gita
```

---

# Temple Connections

Examples

```text
Krishna

WORSHIPPED_AT

Jagannath Temple
```

---

```text
Shiva

WORSHIPPED_AT

Kashi Vishwanath
```

---

# Festival Connections

Examples

```text
Krishna

ASSOCIATED_WITH_FESTIVAL

Janmashtami
```

---

```text
Rama

ASSOCIATED_WITH_FESTIVAL

Rama Navami
```

---

# Knowledge Trails

Example

```text
Krishna

↓

Bhagavad Gita

↓

Karma Yoga

↓

Moksha
```

---

Example

```text
Hanuman

↓

Bhakti

↓

Seva

↓

Rama
```

---

# Scholar Mode Support

Must Support

```text
Multiple Traditions

Commentarial Interpretations

Historical Analysis

Source Comparison
```

---

# Research Support

Generate

```text
Biography Reports

Lineage Reports

Influence Networks

Teacher Chains

Character Networks

Concept Associations
```

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
Hanuman
```

---

Priority 4

```text
Arjuna
```

---

Priority 5

```text
Shankaracharya
```

---

# Validation Rules

Every Person Requires

```text
Name

Category

Source

Citation

At Least One Relationship
```

---

No anonymous people.

No uncited relationships.

---

# Future Expansion

```text
Regional Saints

Bhakti Movements

Guru Paramparas

Temple Founders

Modern Spiritual Teachers
```

---

# North Star Vision

A user starts with:

```text
Krishna
```

and discovers:

```text
Bhagavad Gita

Arjuna

Mahabharata

Bhakti

Janmashtami

Vrindavan

Vishnu

Vedanta
```

through a richly connected knowledge graph.

---

# Mission

Within VEDA, people are not isolated entities.

They are living connection points between scripture, philosophy, devotion, history, culture, and practice.

Understanding a person should naturally reveal an entire universe of knowledge.
