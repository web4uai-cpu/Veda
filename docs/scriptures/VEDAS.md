# Vedas Knowledge Specification

Version: 2.0

Status: Canonical Scripture Domain Specification

---

## Purpose

Defines how the four Vedas are represented, structured, cited, and searched within VEDA.

---

## The Four Vedas

### 1. Rigveda (ऋग्वेद)

- **Abbreviation:** RV
- **Period:** ~1500–1200 BCE
- **Structure:** 10 Mandalas → 1,028 Suktas → 10,552 Mantras
- **Content:** Hymns (suktas) addressed to the Devas — Agni, Indra, Varuna, Soma, Ushas
- **Key Shakhas:** Shakala (primary surviving recension)
- **Significance:** Oldest extant Indo-European text. Foundation of all Vedic literature.

### 2. Samaveda (सामवेद)

- **Abbreviation:** SV
- **Period:** ~1200–1000 BCE
- **Structure:** Purvarchika + Uttararchika → 1,875 Mantras
- **Content:** Mantras arranged for melodic chanting (saman) in Soma sacrifices
- **Key Shakhas:** Kauthuma, Ranayaniya, Jaiminiya
- **Significance:** Basis of Indian classical music theory. "Of the Vedas, I am the Samaveda" — Bhagavad Gita 10.22

### 3. Yajurveda (यजुर्वेद)

- **Abbreviation:** YV
- **Period:** ~1200–1000 BCE
- **Structure:** Adhyaya → Mantras (~1,975 total)
- **Content:** Prose formulas (yajus) for ritual performance
- **Branches:**
  - **Shukla (White):** Vajasaneyi Samhita — mantras only, separated from commentary
  - **Krishna (Black):** Taittiriya Samhita — mantras interwoven with Brahmana commentary
- **Significance:** Practical liturgical manual for the Adhvaryu priest

### 4. Atharvaveda (अथर्ववेद)

- **Abbreviation:** AV
- **Period:** ~1200–1000 BCE
- **Structure:** 20 Kandas → 730 Suktas → 5,977 Mantras
- **Content:** Healing, philosophy, marriage, statecraft, domestic rituals, speculative hymns
- **Key Shakhas:** Shaunaka (primary), Paippalada
- **Significance:** Bridge between Vedic ritual and later philosophical/medical traditions

---

## Internal Structure (All Vedas)

Each Veda traditionally comprises four layers:

| Layer | Sanskrit | Purpose |
|---|---|---|
| **Samhita** | संहिता | Core collection of mantras/hymns |
| **Brahmana** | ब्राह्मण | Prose commentary on ritual application |
| **Aranyaka** | आरण्यक | "Forest texts" — mystical/symbolic interpretations |
| **Upanishad** | उपनिषद् | Philosophical conclusions (Vedanta) |

---

## Citation Format

```
RV.{mandala}.{sukta}.{mantra}     — Rigveda 1.1.1
SV.{section}.{mantra}             — Samaveda
YV.{adhyaya}.{mantra}             — Yajurveda
AV.{kanda}.{sukta}.{mantra}       — Atharvaveda 4.7.2
```

---

## Knowledge Graph Rules

- **Priority:** Highest (Trust 1.0 — Shruti)
- **Node hierarchy:** Scripture → Book (Mandala/Kanda) → Chapter (Sukta) → Verse (Mantra)
- **Relationships:** Verse -[:MENTIONS]-> Concept, Verse -[:PART_OF]-> Chapter
- Vedic mantras are IMMUTABLE canonical data
