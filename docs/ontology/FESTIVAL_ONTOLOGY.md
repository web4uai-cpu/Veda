# FESTIVAL_ONTOLOGY.md

# VEDA Festival Ontology

Version: 1.0

Status: Authoritative Festival Model

Priority: High

---

# Purpose

Defines Hindu festivals, observances, and sacred calendar events.

---

# Festival Categories

## Vaishnava

```text
Janmashtami

Rama Navami

Narasimha Jayanti
```

---

## Shaiva

```text
Maha Shivaratri

Pradosha
```

---

## Shakta

```text
Navaratri

Durga Puja

Kali Puja
```

---

## Pan-Hindu

```text
Diwali

Holi

Guru Purnima
```

---

# Node Structure

```json
{
  "festival_id":"",
  "name":"",
  "associated_deities":[],
  "scriptures":[],
  "rituals":[]
}
```

---

# Relationships

```text
CELEBRATES

OBSERVED_AT

MENTIONED_IN

ASSOCIATED_WITH
```

---

# Example

```text
Janmashtami

CELEBRATES

Krishna
```

---

# Mission

Connect scripture, tradition, ritual, and living culture.
