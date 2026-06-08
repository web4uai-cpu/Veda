# MAHABHARATA.md

# Mahabharata Knowledge Specification

Version: 1.0

Status: Canonical Scripture Domain Specification

Priority: Critical

Owner: Knowledge Engineering Team

---

# Purpose

Defines how Mahabharata is represented, indexed, searched, cited, linked, and visualized within VEDA.

This document is the authoritative specification for:

* Structure
* Ontology
* Characters
* Events
* Locations
* Genealogies
* Concepts
* Knowledge Graph Relationships

---

# Classification

```text
Itihasa
```

Canonical Hindu Epic

Traditionally attributed to:

```text
Vyasa
```

---

# Role In VEDA

The Mahabharata is not merely literature.

It is a foundational knowledge domain containing:

```text
Ethics

Dharma

Politics

Leadership

War

Family Systems

Spirituality

Bhagavad Gita
```

---

# Corpus Structure

Traditional Structure

```text
18 Parvas
```

---

# Primary Parvas

```text
Adi Parva

Sabha Parva

Vana Parva

Virata Parva

Udyoga Parva

Bhishma Parva

Drona Parva

Karna Parva

Shalya Parva

Sauptika Parva

Stri Parva

Shanti Parva

Anushasana Parva

Ashvamedhika Parva

Ashramavasika Parva

Mausala Parva

Mahaprasthanika Parva

Svargarohana Parva
```

---

# Special Sub-Domain

Bhagavad Gita

Location

```text
Bhishma Parva
```

Graph Link

```text
Mahabharata

↓

Bhishma Parva

↓

Bhagavad Gita
```

---

# Primary Ontology Domains

## Characters

## Events

## Places

## Concepts

## Relationships

## Dynasties

## Dialogues

---

# Character Ontology

Node Type

```text
PERSON
```

---

# Core Characters

```text
Krishna

Arjuna

Bhishma

Yudhishthira

Bhima

Nakula

Sahadeva

Draupadi

Duryodhana

Karna

Vidura

Dhritarashtra

Gandhari

Kunti

Shakuni

Drona

Ashwatthama

Vyasa
```

---

# Character Relationships

Allowed

```text
PARENT_OF

CHILD_OF

SPOUSE_OF

TEACHER_OF

DISCIPLE_OF

ALLY_OF

OPPOSES

RULES

DESCENDS_FROM
```

---

# Example

```text
Krishna

GUIDES

Arjuna
```

---

# Dynasty Ontology

Node Type

```text
DYNASTY
```

---

# Major Dynasties

```text
Kuru

Yadava

Bharata

Panchala
```

---

# Example Graph

```text
Arjuna

PART_OF

Pandava

PART_OF

Kuru Dynasty
```

---

# Group Ontology

Node Type

```text
FACTION
```

---

# Major Groups

```text
Pandavas

Kauravas

Yadavas

Panchalas
```

---

# Event Ontology

Node Type

```text
EVENT
```

---

# Major Events

```text
Birth Of Pandavas

Lac House Incident

Draupadi Swayamvara

Dice Game

Exile

Kurukshetra War

Bhagavad Gita Dialogue

Ashvamedha
```

---

# Event Relationships

```text
PARTICIPATED_IN

CAUSED

PRECEDES

FOLLOWS

OCCURS_AT
```

---

# Location Ontology

Node Type

```text
PLACE
```

---

# Core Locations

```text
Kurukshetra

Hastinapura

Indraprastha

Dwaraka

Panchala

Kamyaka Forest
```

---

# Place Relationships

```text
LOCATED_IN

RULED_BY

EVENT_OCCURRED_AT
```

---

# Concept Ontology

Node Type

```text
CONCEPT
```

---

# Core Concepts

```text
Dharma

Karma

Raja Dharma

Apad Dharma

Moksha

Duty

Justice

Sacrifice

Leadership

War Ethics

Truth
```

---

# Knowledge Graph Priority

Very High

---

Reason

Most concepts connect directly to:

```text
Bhagavad Gita

Vedanta

Upanishads

Dharma Literature
```

---

# Dialogue Ontology

Node Type

```text
DIALOGUE
```

---

# Examples

```text
Krishna-Arjuna

Vidura-Dhritarashtra

Bhishma-Yudhishthira
```

---

# Dialogue Relationships

```text
SPEAKER

LISTENER

TEACHES

EXPLAINS
```

---

# Citation Format

Parva Level

```text
MBH.1
```

---

Section Level

```text
MBH.1.23
```

---

Verse Level

```text
MBH.1.23.12
```

---

# Search Priorities

Priority 1

```text
Characters
```

---

Priority 2

```text
Bhagavad Gita
```

---

Priority 3

```text
Concepts
```

---

Priority 4

```text
Events
```

---

Priority 5

```text
Locations
```

---

# Character Pages

Each character requires:

```json
{
  "name":"",
  "dynasty":"",
  "parents":[],
  "teachers":[],
  "allies":[],
  "opponents":[],
  "concepts":[]
}
```

---

# Event Pages

Each event requires:

```json
{
  "name":"",
  "participants":[],
  "location":"",
  "citations":[],
  "concepts":[]
}
```

---

# Knowledge Trails

Example

```text
Arjuna

↓

Krishna

↓

Bhagavad Gita

↓

Karma Yoga

↓

Moksha
```

---

# Learning Paths

Beginner

```text
Pandavas

↓

Krishna

↓

Bhagavad Gita

↓

Dharma
```

---

Intermediate

```text
Bhishma

↓

Rajadharma

↓

Leadership
```

---

Scholar

```text
Shanti Parva

↓

Moksha Dharma

↓

Vedanta
```

---

# Comparison Support

Examples

```text
Arjuna vs Karna

Pandavas vs Kauravas

Krishna vs Bhishma Leadership
```

---

# Research Support

Generate

```text
Genealogy Reports

Character Networks

Concept Networks

War Analysis

Dharma Analysis

Leadership Analysis
```

---

# Daily Verse Eligibility

Supported

Priority

Medium

Bhagavad Gita preferred.

---

# Knowledge Map Integration

Central Hub

```text
Mahabharata

↓

Characters

↓

Events

↓

Concepts

↓

Bhagavad Gita

↓

Vedanta
```

---

# Scholar Mode

Must support:

```text
Multiple Interpretations

Commentarial Traditions

Historical Context

Cross-Scripture References
```

---

# Graph Metrics

Track

```text
Character Relationships

Event Relationships

Concept Relationships

Genealogy Depth

Dialogue Connections
```

---

# Validation Rules

Every Character Requires

```text
Source

Citation

Relationship Evidence
```

---

Every Event Requires

```text
Source

Participants

Location

Citation
```

---

No orphan nodes.

No uncited relationships.

---

# Future Expansion

```text
Critical Editions

Regional Versions

Commentaries

Character Timelines

Interactive Genealogies

War Simulations

Historical Mapping
```

---

# North Star Vision

A user starts with:

```text
Arjuna
```

and within minutes can discover:

```text
Krishna

Bhagavad Gita

Karma Yoga

Dharma

Kurukshetra

Pandavas

Vedanta
```

through a fully connected knowledge graph.

---

# Mission

The Mahabharata within VEDA is not a book.

It is a living knowledge universe that connects narrative, philosophy, ethics, leadership, spirituality, genealogy, and scripture into a navigable graph of understanding.
