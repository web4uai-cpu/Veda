# Upanishad Knowledge Specification

Version: 2.0

Status: Canonical Scripture Domain Specification

---

## Purpose

Defines how the Upanishadic corpus is represented, cited, and linked within VEDA.

---

## 13 Principal (Mukhya) Upanishads

| # | Name | Sanskrit | Abbr | Parent Veda | Mahavakya |
|---|---|---|---|---|---|
| 1 | Isha | ईशोपनिषद् | IU | Shukla Yajurveda | — |
| 2 | Kena | केनोपनिषद् | KnU | Samaveda | — |
| 3 | Katha | कठोपनिषद् | KU | Krishna Yajurveda | — |
| 4 | Prashna | प्रश्नोपनिषद् | PrU | Atharvaveda | — |
| 5 | Mundaka | मुण्डकोपनिषद् | MuU | Atharvaveda | — |
| 6 | Mandukya | माण्डूक्योपनिषद् | MaU | Atharvaveda | — |
| 7 | Taittiriya | तैत्तिरीयोपनिषद् | TU | Krishna Yajurveda | — |
| 8 | Aitareya | ऐतरेयोपनिषद् | AU | Rigveda | Prajnanam Brahma |
| 9 | Chandogya | छान्दोग्योपनिषद् | ChU | Samaveda | Tat Tvam Asi |
| 10 | Brihadaranyaka | बृहदारण्यकोपनिषद् | BU | Shukla Yajurveda | Aham Brahmasmi |
| 11 | Shvetashvatara | श्वेताश्वतरोपनिषद् | SvU | Krishna Yajurveda | — |
| 12 | Kaushitaki | कौषीतकिब्राह्मणोपनिषद् | KsU | Rigveda | — |
| 13 | Maitri | मैत्र्युपनिषद् | MtU | Krishna Yajurveda | — |

---

## Core Concepts

All Upanishads explore these themes:

- **Atman** (आत्मन्) — The eternal Self
- **Brahman** (ब्रह्मन्) — The ultimate reality
- **Maya** (माया) — Cosmic illusion
- **Moksha** (मोक्ष) — Liberation
- **Jnana** (ज्ञान) — Liberating knowledge

---

## Four Mahavakyas (Great Sayings)

| Mahavakya | Source | Meaning |
|---|---|---|
| Prajnanam Brahma | Aitareya (Rigveda) | Consciousness is Brahman |
| Tat Tvam Asi | Chandogya (Samaveda) | Thou art That |
| Aham Brahmasmi | Brihadaranyaka (Yajurveda) | I am Brahman |
| Ayam Atma Brahma | Mandukya (Atharvaveda) | This Self is Brahman |

---

## Citation Format

```
IU.{mantra}            — Isha Upanishad (e.g., IU.1)
KU.{valli}.{mantra}    — Katha Upanishad (e.g., KU.1.2.20)
BU.{adhyaya}.{brahmana}.{mantra} — Brihadaranyaka (e.g., BU.2.4.5)
ChU.{prapathaka}.{khanda}.{mantra} — Chandogya (e.g., ChU.6.8.7)
```

---

## Knowledge Graph Rules

- **Priority:** Very High (Trust 1.0 — Shruti)
- Part of the Prasthanatrayi (with Brahma Sutras and Bhagavad Gita)
- All Vedanta schools depend on Upanishadic authority
- Each Upanishad links to its parent Veda via PART_OF
