# COMMENTARY_ONTOLOGY.md

# VEDA Commentary Ontology

Version: 1.0

Status: Authoritative Interpretation Model

Priority: Critical

Owner: Knowledge Engineering Team

---

# Purpose

Defines all commentaries, bhashyas, tika traditions, interpretive works, scholastic traditions, and explanatory literature represented in VEDA.

This ontology governs:

* Bhashyas
* Tikas
* Vrittis
* Scholastic Traditions
* Interpretive Lineages
* Commentary Relationships
* Comparative Interpretations

---

# Core Principle

Scripture provides the text.

Commentary provides interpretation.

---

# VEDA Interpretation Model

```text
Scripture

↓

Verse

↓

Commentary

↓

School

↓

Concept

↓

Interpretation
```

---

# Commentary Categories

## Bhashya

Primary Commentary

Examples

```text
Shankara Bhashya

Sri Bhashya

Brahma Sutra Bhashya
```

---

## Tika

Sub Commentary

Examples

```text
Subodhini

Tatparya Chandrika
```

---

## Vritti

Explanatory Commentary

---

## Academic Commentary

Modern Scholarship

---

## Traditional Commentary

Parampara Based

---

# Commentary Node Schema

```json
{
  "commentary_id":"",
  "title":"",
  "author":"",
  "school":"",
  "tradition":"",
  "scripture":"",
  "type":"",
  "citations":[]
}
```

---

# Commentary Types

```text
BHASHYA

TIKA

VRITTI

SUB_COMMENTARY

ACADEMIC

MODERN
```

---

# Core Commentary Sources

## Advaita

```text
Shankaracharya

Sureshvara

Vidyaranya
```

---

## Vishishtadvaita

```text
Ramanujacharya

Vedanta Desika

Pillai Lokacharya
```

---

## Dvaita

```text
Madhvacharya

Jayatirtha

Vyasatirtha
```

---

## Gaudiya

```text
Jiva Goswami

Baladeva Vidyabhushana

Vishvanatha Chakravarti
```

---

## Shaiva

```text
Abhinavagupta

Kshemaraja
```

---

## Shakta

```text
Bhaskararaya

Lakshmidhara
```

---

# Commentary Relationships

```text
COMMENTS_ON

INTERPRETS

SUPPORTS

CRITIQUES

EXPANDS

DERIVED_FROM

AGREES_WITH

DISAGREES_WITH
```

---

# Example

```text
Shankara Bhashya

COMMENTS_ON

Bhagavad Gita
```

---

```text
Sri Bhashya

INTERPRETS

Brahma Sutras
```

---

# School Association

Every commentary belongs to:

```text
School

Tradition

Lineage
```

---

Example

```text
Shankara Bhashya

↓

Advaita Vedanta
```

---

```text
Sri Bhashya

↓

Vishishtadvaita Vedanta
```

---

# Interpretation Node

Node Type

```text
INTERPRETATION
```

---

Schema

```json
{
  "interpretation_id":"",
  "claim":"",
  "school":"",
  "source_commentary":"",
  "citations":[]
}
```

---

# Interpretation Rules

Every interpretation requires:

```text
Commentary

Author

School

Citation
```

---

No anonymous interpretations allowed.

---

# Comparative Interpretation Model

Example

```text
BG 2.47

↓

Shankara

↓

Jnana Emphasis

----------------

Ramanuja

↓

Bhakti Emphasis

----------------

Madhva

↓

Devotional Dualism
```

---

# Conflict Handling

Different interpretations:

```text
Must Coexist
```

---

Never merge schools.

---

Never synthesize competing positions into one answer.

---

# Scholar Neutrality Rule

VEDA must present:

```text
Position

Evidence

Source

School
```

---

VEDA must never declare:

```text
Correct School

Best School

Winning School
```

---

# Commentary Graph Structure

```text
Verse

↓

Commentary

↓

Interpretation

↓

Concept

↓

School
```

---

# Commentary Search

Supported Queries

```text
Shankara on BG 2.47

Ramanuja on Moksha

Madhva on Brahman

Advaita interpretation of Atman
```

---

# Commentary Citations

Required Format

```text
COMMENTARY-ID

AUTHOR

SCRIPTURE

VERSE
```

---

Example

```text
SHANKARA-BG-2.47
```

---

# Commentary Confidence

Traditional Bhashya

```text
0.95+
```

---

Recognized Traditional Commentary

```text
0.90+
```

---

Academic Commentary

```text
0.80+
```

---

User Commentary

```text
0.50+
```

---

# Commentary Timeline

Track

```text
Author

Century

Tradition

Geography
```

---

Example

```text
Shankaracharya

↓

8th Century

↓

Advaita
```

---

# Commentary Ontology Links

Connect To

```text
SCRIPTURE

VERSE

CONCEPT

PHILOSOPHY

PERSON

TRADITION

SANSKRIT_TERM
```

---

# Research Features

Generate

```text
Comparative Commentary Reports

School Comparisons

Interpretation Trees

Commentary Evolution Reports

Concept Analysis Reports
```

---

# Learning Features

Generate

```text
Beginner Commentary

Intermediate Commentary

Scholar Commentary
```

based on user level.

---

# Scholar Mode

Must Support

```text
Parallel Commentary View

Citation Comparison

Interpretation Matrix

Source Analysis
```

---

# Validation Rules

Every Commentary Requires

```text
Author

School

Source

Citation

Scripture Link
```

---

Every Interpretation Requires

```text
Supporting Commentary

Citation

School Attribution
```

---

No orphan interpretations.

No anonymous claims.

No uncited commentary relationships.

---

# Future Expansion

```text
Regional Commentaries

Tamil Traditions

Kashmir Shaivism Sources

Gaudiya Sources

Modern Scholarly Sources

Manuscript Traditions
```

---

# North Star Vision

A user asks:

```text
What does BG 18.66 mean?
```

VEDA responds:

```text
Scripture

↓

Shankara Interpretation

↓

Ramanuja Interpretation

↓

Madhva Interpretation

↓

Comparative Analysis

↓

Sources
```

with complete transparency.

---

# Relationship To Other Ontologies

```text
Scripture Ontology

↓

Commentary Ontology

↓

Philosophy Ontology

↓

Concept Ontology

↓

Reasoning Engine
```

---

# Mission

The Commentary Ontology exists to preserve the interpretive diversity of Sanatan traditions while maintaining scholarly rigor, citation integrity, and philosophical neutrality.

Scripture provides the words.

Commentaries reveal the many ways those words have been understood across centuries.
