# KNOWLEDGE_MAP_UI.md

# VEDA Knowledge Map Experience

Version: 1.0

Status: Authoritative Knowledge Map Specification

Priority: Critical

Owner: Product + Knowledge Team

---

# Purpose

The Knowledge Map is VEDA's flagship feature.

Its purpose is to transform scripture exploration from linear reading into visual knowledge discovery.

The Knowledge Map must:

* Reveal relationships
* Encourage exploration
* Surface hidden connections
* Support research
* Support learning
* Support scripture study

The Knowledge Map is not a graph visualization.

The Knowledge Map is a knowledge navigation system.

---

# Product Vision

Traditional Search

```text
Question

↓

Answer
```

VEDA

```text
Question

↓

Concept

↓

Relationships

↓

Scriptures

↓

Commentaries

↓

Research
```

---

# Core Principle

Every concept connects to other concepts.

Every scripture connects to concepts.

Every answer opens new paths.

---

# Knowledge Map Architecture

```text
Concept

↓

Relationships

↓

Evidence

↓

Understanding
```

---

# User Goals

Explorer

Discover knowledge.

---

Practitioner

Understand teachings.

---

Scholar

Research relationships.

---

Researcher

Analyze networks.

---

# Node Types

## Concept

Examples

```text
Atman

Brahman

Moksha

Karma

Dharma
```

---

## Scripture

Examples

```text
Rigveda

Bhagavad Gita

Katha Upanishad
```

---

## Verse

Examples

```text
BG 2.47

BG 18.66
```

---

## Commentary

Examples

```text
Shankara Bhashya

Ramanuja Bhashya
```

---

## School

Examples

```text
Advaita

Dvaita

Vishishtadvaita
```

---

## Person

Examples

```text
Shankaracharya

Ramanujacharya

Madhvacharya
```

---

## Practice

Examples

```text
Meditation

Bhakti

Yoga
```

---

## Event

Examples

```text
Kurukshetra War
```

---

## Place

Examples

```text
Kurukshetra

Naimisharanya
```

---

# Relationship Types

## EXPLAINS

```text
Verse

↓

Concept
```

---

## RELATED_TO

```text
Concept

↓

Concept
```

---

## PART_OF

```text
Verse

↓

Scripture
```

---

## COMMENTS_ON

```text
Commentary

↓

Verse
```

---

## TEACHES

```text
School

↓

Concept
```

---

## PRACTICES

```text
Practice

↓

Concept
```

---

## REFERENCES

```text
Scripture

↓

Scripture
```

---

# Knowledge Map Entry Points

Users can enter through:

```text
Search

Chat

Scripture

Concept

Research

Upload
```

---

# Example Entry

User asks:

```text
What is Moksha?
```

System opens:

```text
Moksha

↓

Atman

↓

Brahman

↓

Karma

↓

Vedanta

↓

Katha Upanishad
```

---

# Knowledge Card

Every node opens a card.

Structure

```text
Title

Definition

Sources

Relationships

Actions
```

---

# Node Actions

Expand

Open

Compare

Bookmark

Add To Research

Copy Citation

Save Path

---

# Desktop Experience

Primary Mode

Interactive Graph

---

Layout

```text
Knowledge Graph

|-------------------------|

Node Canvas

Knowledge Panel

Citation Panel
```

---

# Desktop Graph Layout

Center

```text
Selected Node
```

---

First Ring

```text
Direct Relationships
```

---

Second Ring

```text
Related Concepts
```

---

Third Ring

```text
Research Expansion
```

---

# Mobile Experience

Default

Card Navigation

Not giant graph.

---

Mobile Layout

```text
Concept Card

↓

Relationships

↓

Swipe Explore

↓

Scriptures

↓

Research
```

---

# Mobile Graph Modes

Mode 1

Relationship Cards

---

Mode 2

Path Explorer

---

Mode 3

Mini Graph

---

# Expansion Rules

Default Depth

```text
2
```

---

Research Mode

```text
5
```

---

Maximum

```text
7
```

Prevent graph explosion.

---

# Knowledge Trails

Purpose

Create guided learning paths.

---

Example

```text
Dharma

↓

Karma

↓

Atman

↓

Moksha
```

---

User can save trail.

---

# Concept Page Integration

Every concept page contains:

```text
Definition

Sources

Knowledge Map

Commentaries

Research Questions
```

---

# Scripture Integration

Verse

↓

Concepts

↓

Knowledge Map

---

Example

```text
BG 2.47

↓

Karma

↓

Dharma

↓

Yoga
```

---

# Research Integration

User selects:

```text
Advaita
```

System reveals:

```text
Atman

Brahman

Moksha

Shankara

Upanishads
```

---

# Comparison Mode

Select

```text
Advaita

Dvaita
```

---

System displays

Shared Concepts

Differences

Sources

Relationships

---

# Timeline Mode

Purpose

Historical exploration.

---

Example

```text
Vedas

↓

Upanishads

↓

Vedanta

↓

Modern Thinkers
```

---

# School View

Purpose

Philosophical exploration.

---

Example

```text
Advaita

↓

Core Concepts

↓

Scriptures

↓

Commentaries
```

---

# Upload Integration

User Upload

↓

Concept Extraction

↓

Graph Linking

↓

Personal Knowledge Graph

---

Personal graph never modifies canonical graph.

---

# Research Workspace Integration

Selected Nodes

↓

Evidence Collection

↓

Citation Collection

↓

Research Report

---

# Visual Hierarchy

Most Important

```text
Concepts
```

---

Second

```text
Scriptures
```

---

Third

```text
Commentaries
```

---

Fourth

```text
People
```

---

# Graph Performance Rules

Never load entire graph.

---

Load

```text
Node

↓

Neighbors

↓

Progressive Expansion
```

Only.

---

# Search Integration

Search Result

↓

Open Node

↓

Expand Graph

---

Search should always lead to exploration.

---

# AI Integration

AI answers must include:

```text
Related Nodes

Knowledge Trail

Expand Knowledge Map
```

---

Chat should open graph.

Not terminate interaction.

---

# Saved Knowledge Paths

Users can save:

```text
Concept Paths

Research Paths

Learning Paths
```

---

Example

```text
Moksha Path
```

Contains

```text
Moksha

Atman

Brahman

Vedanta

Katha Upanishad
```

---

# Analytics

Track

```text
Node Expansions

Path Length

Graph Engagement

Research Conversions

Saved Trails
```

---

# Success Metrics

User should discover:

5–20 additional concepts

from a single question.

---

Average Exploration Depth

Target

```text
4+
```

---

# Anti-Patterns

Avoid

```text
Graph Overload

Tiny Nodes

Infinite Expansion

Unlabeled Relationships

Visual Noise
```

---

# North Star Experience

A user begins with:

```text
What is Moksha?
```

Within minutes they discover:

```text
Atman

Brahman

Karma

Vedanta

Katha Upanishad

Advaita

Dvaita
```

without needing additional searches.

---

# Knowledge Map Mission

The Knowledge Map exists to transform isolated information into connected understanding.

Search finds answers.

The Knowledge Map reveals meaning.

Meaning creates wisdom.
