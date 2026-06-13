# DYNASTY_ONTOLOGY.md

# VEDA Dynasty Ontology

Version: 1.0

Status: Authoritative Lineage Model

Priority: Critical

Owner: Knowledge Engineering Team

---

# Purpose

Defines dynasties, genealogies, lineages, royal houses, guru-paramparas, and family structures.

This ontology answers:

```text
Who belongs to whom?

Who descended from whom?

Which lineage produced this person?

Which tradition originated here?
```

---

# Core Principle

Lineage is a first-class knowledge structure.

---

# Dynasty Categories

## Royal Dynasties

```text
Ikshvaku

Raghu

Kuru

Yadava

Solar Dynasty

Lunar Dynasty
```

---

## Guru Paramparas

```text
Advaita Parampara

Sri Vaishnava Parampara

Madhva Parampara
```

---

## Rishi Lineages

```text
Vasistha Lineage

Bhrigu Lineage

Angirasa Lineage
```

---

# Dynasty Node Schema

```json
{
  "dynasty_id":"",
  "name":"",
  "type":"",
  "founder":"",
  "description":"",
  "sources":[]
}
```

---

# Lineage Relationships

```text
DESCENDS_FROM

FOUNDED_BY

PART_OF

SUCCESSOR_OF

PREDECESSOR_OF

TEACHER_OF

DISCIPLE_OF

MEMBER_OF
```

---

# Examples

```text
Rama

MEMBER_OF

Raghu Dynasty
```

---

```text
Raghu Dynasty

PART_OF

Solar Dynasty
```

---

```text
Shankaracharya

PART_OF

Advaita Parampara
```

---

# Genealogy Model

Support:

```text
Parents

Children

Siblings

Spouses

Teachers

Disciples
```

---

# Knowledge Graph Use Cases

Generate:

```text
Family Trees

Dynasty Maps

Guru Lineages

Succession Chains

Tradition Networks
```

---

# Validation Rules

Every dynasty requires:

```text
Founder

Source

Citation

Type
```

---

# Graph Mission

Reveal how people, traditions, and teachings propagate across generations.
