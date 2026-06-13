# TIMELINE_ONTOLOGY.md

# VEDA Timeline Ontology

Version: 1.0

Status: Authoritative Temporal Knowledge Model

Priority: Critical

Owner: Knowledge Engineering Team

---

# Purpose

Defines all temporal entities, chronology models, epochs, events, and time relationships within VEDA.

This ontology answers:

```text
When did it happen?
What happened before it?
What happened after it?
What era does it belong to?
```

---

# Core Principle

Time in VEDA is not purely historical.

Time exists in:

* Historical timelines
* Scriptural timelines
* Cosmological timelines
* Traditional timelines

All must coexist.

---

# Timeline Categories

## Historical

```text
Gupta Period
Mauryan Period
Classical India
```

---

## Scriptural

```text
Ramayana Era
Mahabharata Era
Krishna Era
```

---

## Cosmological

```text
Satya Yuga
Treta Yuga
Dvapara Yuga
Kali Yuga
```

---

## Cyclical

```text
Manvantara
Kalpa
Mahayuga
Pralaya
```

---

# Timeline Node Schema

```json
{
  "timeline_id":"",
  "name":"",
  "type":"",
  "description":"",
  "start_reference":"",
  "end_reference":"",
  "sources":[]
}
```

---

# Event Node

```json
{
  "event_id":"",
  "name":"",
  "era":"",
  "participants":[],
  "locations":[],
  "citations":[]
}
```

---

# Relationships

```text
PRECEDES

FOLLOWS

OCCURS_IN

CONTEMPORARY_WITH

PART_OF_ERA

ASSOCIATED_WITH
```

---

# Examples

```text
Kurukshetra War

OCCURS_IN

Dvapara Yuga
```

---

```text
Bhagavad Gita Dialogue

PRECEDES

Bhishma's Fall
```

---

# Timeline Views

## Historical View

Chronological ordering.

---

## Scriptural View

Scripture-centric chronology.

---

## Cosmological View

Yuga and Kalpa hierarchy.

---

# Research Features

Generate:

```text
Character Timelines

Event Timelines

Dynasty Timelines

Scripture Timelines

Teacher Lineages
```

---

# Graph Mission

Enable temporal traversal of all knowledge in VEDA.

