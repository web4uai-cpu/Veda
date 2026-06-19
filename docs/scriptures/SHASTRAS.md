# Shastras Knowledge Specification

Version: 1.0

Status: Canonical Scripture Domain Specification

---

## Purpose

Defines how the Shastra corpus (major treatises by ancient Indian munis and acharyas) is represented, cited, and searched within VEDA.

---

## 14 Major Shastras

### Darshana Shastras (Six Orthodox Schools)

| # | Name | Sanskrit | Abbr | Author | Period | Sutras/Karikas |
|---|---|---|---|---|---|---|
| 1 | Yoga Sutras | योगसूत्र | YS | Patanjali | ~200 BCE | 196 sutras |
| 2 | Brahma Sutras | ब्रह्मसूत्र | BS | Badarayana (Vyasa) | ~400-200 BCE | 555 sutras |
| 3 | Nyaya Sutras | न्यायसूत्र | NyS | Akshapada Gautama | ~200 BCE | 528 sutras |
| 4 | Vaisheshika Sutras | वैशेषिकसूत्र | VS | Kanada | ~200 BCE | 370 sutras |
| 5 | Mimamsa Sutras | मीमांसासूत्र | MmS | Jaimini | ~200 BCE | 2,745 sutras |
| 6 | Sankhya Karika | सांख्यकारिका | SK | Ishvarakrishna | ~350 CE | 72 karikas |

### Dharmashastra

| # | Name | Sanskrit | Abbr | Author | Period | Chapters |
|---|---|---|---|---|---|---|
| 7 | Manusmriti | मनुस्मृति | MS | Manu | ~200 BCE-200 CE | 12 chapters, 2,694 shlokas |

### Arthashastra (Statecraft)

| # | Name | Sanskrit | Abbr | Author | Period | Chapters |
|---|---|---|---|---|---|---|
| 8 | Arthashastra | अर्थशास्त्र | AS | Kautilya (Chanakya) | ~300 BCE | 15 adhikaranas, 150 chapters |

### Performing Arts & Aesthetics

| # | Name | Sanskrit | Abbr | Author | Period | Chapters |
|---|---|---|---|---|---|---|
| 9 | Natyashastra | नाट्यशास्त्र | NS | Bharata Muni | ~200 BCE-200 CE | 36 chapters, ~6,000 shlokas |
| 10 | Kamasutra | कामसूत्र | KS | Vatsyayana | ~300 CE | 7 adhikaranas, 36 chapters |

### Vyakarana (Grammar & Lexicography)

| # | Name | Sanskrit | Abbr | Author | Period | Structure |
|---|---|---|---|---|---|---|
| 11 | Ashtadhyayi | अष्टाध्यायी | AD | Panini | ~400 BCE | 8 adhyayas, 3,959 sutras |
| 12 | Amarakosha | अमरकोश | AK | Amarasimha | ~400 CE | 3 kandas |

### Ayurveda (Medical Sciences)

| # | Name | Sanskrit | Abbr | Author | Period | Structure |
|---|---|---|---|---|---|---|
| 13 | Charaka Samhita | चरकसंहिता | CS | Charaka | ~300 BCE-200 CE | 8 sthanas, 120 chapters |
| 14 | Sushruta Samhita | सुश्रुतसंहिता | SS | Sushruta | ~300 BCE-200 CE | 6 sthanas, 186 chapters |

---

## Citation Format

```
YS.{pada}.{sutra}         — Yoga Sutras (e.g., YS.1.2 "yogash chitta vritti nirodhah")
BS.{adhyaya}.{pada}.{sutra} — Brahma Sutras (e.g., BS.1.1.1 "athato brahma jijnasa")
MS.{chapter}.{shloka}     — Manusmriti (e.g., MS.6.92)
AS.{adhikarana}.{chapter}  — Arthashastra
AD.{adhyaya}.{pada}.{sutra} — Ashtadhyayi (e.g., AD.1.1.1)
CS.{sthana}.{chapter}.{shloka} — Charaka Samhita
```

---

## Knowledge Graph Rules

- **Priority:** High (Trust 0.95 — Authoritative tradition texts)
- Category: `shastra` in the scriptures table
- Each Shastra links to its author (Person node) via AUTHORED_BY
- Philosophical Shastras link to their Darshana school (School node) via SUPPORTS
- All Shastras are canonical and IMMUTABLE

---

## Traditions Covered

| Tradition | Shastras |
|---|---|
| Vedanta | Brahma Sutras |
| Yoga | Yoga Sutras |
| Nyaya | Nyaya Sutras |
| Vaisheshika | Vaisheshika Sutras |
| Mimamsa | Mimamsa Sutras |
| Sankhya | Sankhya Karika |
| Dharma | Manusmriti |
| Artha | Arthashastra |
| Kama | Kamasutra |
| Natya | Natyashastra |
| Vyakarana | Ashtadhyayi, Amarakosha |
| Ayurveda | Charaka Samhita, Sushruta Samhita |
