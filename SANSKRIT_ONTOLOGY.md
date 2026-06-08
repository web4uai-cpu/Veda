# SANSKRIT_ONTOLOGY.md

# VEDA Sanskrit Ontology

Version: 1.0

Status: Authoritative Sanskrit Language Model

Priority: Critical

Owner: Sanskrit Intelligence Team

---

# Purpose

Defines Sanskrit linguistic structures used throughout VEDA.

This ontology answers:

```text
What does the original text mean?

How is the word constructed?

What root produced this term?

How is it interpreted?
```

---

# Core Principle

Meaning begins with language.

Every major concept in VEDA must connect back to Sanskrit.

---

# Supported Scripts

```text
Devanagari

IAST

Harvard-Kyoto

ITRANS

ISO 15919
```

---

# Sanskrit Node Types

## Word

```text
Sanskrit Term
```

Example

```text
Dharma

Karma

Moksha

Atman
```

---

## Root

```text
Dhatu
```

Example

```text
gam

kri

bhu

vid
```

---

## Compound

```text
Samasa
```

Example

```text
Bhagavad Gita

Brahma Sutra
```

---

## Grammar

```text
Vyakarana
```

---

# Word Schema

```json
{
  "term":"",
  "devanagari":"",
  "iast":"",
  "meaning":"",
  "root":"",
  "category":""
}
```

---

# Root Schema

```json
{
  "dhatu":"",
  "meaning":"",
  "derived_words":[]
}
```

---

# Relationships

```text
DERIVED_FROM

TRANSLATED_AS

HAS_ROOT

HAS_MEANING

USED_IN

MENTIONED_IN

RELATED_TO
```

---

# Example

```text
Karma

DERIVED_FROM

कृ (kṛ)
```

---

```text
Dharma

USED_IN

Bhagavad Gita
```

---

# Morphology Support

Store:

```text
Gender

Number

Case

Tense

Voice

Mood
```

---

# Sandhi Support

Support:

```text
Vowel Sandhi

Consonant Sandhi

Visarga Sandhi
```

---

# Compound Analysis

Support:

```text
Tatpurusha

Bahuvrihi

Dvandva

Karmadharaya

Avyayibhava
```

---

# Translation Model

Every term may contain:

```text
Literal Meaning

Contextual Meaning

Philosophical Meaning

Traditional Meaning
```

---

# Example

```text
Dharma

Literal:
That which upholds

Ethical:
Duty

Philosophical:
Cosmic Order

Traditional:
Righteous Conduct
```

---

# Scholar Mode Features

Generate:

```text
Word Studies

Root Analysis

Translation Comparison

Grammar Breakdown

Verse Linguistic Analysis
```

---

# Sanskrit Agent Integration

Primary Consumer:

```text
sanskrit_agent.md
```

---

# Research Features

Generate:

```text
Concept Etymology

Word Evolution

Scripture Word Frequency

Root Networks

Semantic Maps
```

---

# Validation Rules

Every Sanskrit term requires:

```text
Source

Root

Meaning

Citation
```

---

# Graph Mission

Connect every scripture, concept, commentary, and philosophy back to its original Sanskrit foundation so that meaning remains traceable, explainable, and academically defensible.
