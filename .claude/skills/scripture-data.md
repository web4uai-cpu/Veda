# Skill: Scripture Data

## Data Sources (Public APIs + PDFs)

### Bhagavad Gita (Priority 1)
- **API:** https://bhagavadgitaapi.in/ — Full 18 chapters, 700 verses, multiple translations
- **Format:** Sanskrit (Devanagari), transliteration, English translations (Swami Sivananda, etc.)
- **Structure:** Chapter → Verse → Content (Sanskrit, transliteration, word meanings, translation)

### Upanishads (Priority 2)
- **Sources:** Sacred-texts.com, Wisdomlib.org, public domain PDFs
- **10 Principal:** Isha, Kena, Katha, Prashna, Mundaka, Mandukya, Taittiriya, Aitareya, Chandogya, Brihadaranyaka
- **Format:** Sanskrit text + translations (Swami Gambirananda, Max Müller, etc.)

### Vedas
- **Sources:** TITUS (Thesaurus Indogermanischer Text- und Sprachmaterialien), sacred-texts.com
- **Rig Veda:** 10 Mandalas, 1028 Suktas, ~10,600 verses

### Puranas
- **Sources:** Wisdomlib.org, sacred-texts.com public domain texts
- **Priority:** Vishnu Purana, Bhagavata Purana (Srimad Bhagavatam)

### Ramayana & Mahabharata
- **Ramayana:** Valmiki Ramayana from valmikiramayan.net (public domain)
- **Mahabharata:** KM Ganguli translation (public domain, sacred-texts.com)

## Ingestion Pipeline

```
Document → Upload → OCR (if PDF) → Chunking → Embedding → Graph Linking → Indexing → Ready
```

### Chunking Strategy
- **Verse-level:** Each verse is a chunk (for scriptures)
- **Paragraph-level:** ~500 tokens per chunk (for commentaries/uploads)
- **Overlap:** 50 tokens between consecutive chunks
- **Metadata:** Always attach source_id, canonical_reference, language

### Embedding Generation
```python
from openai import AsyncOpenAI

client = AsyncOpenAI(api_key=settings.openai_api_key)

response = await client.embeddings.create(
    model="text-embedding-3-large",
    input=chunk_text,
    dimensions=3072,
)
vector = response.data[0].embedding
```

### Canonical Reference Format
```
BG.{chapter}.{verse}          → BG.2.47
KU.{chapter}.{verse}          → KU.1.2  (Katha Upanishad)
RV.{mandala}.{sukta}.{verse}  → RV.1.1.1 (Rig Veda)
```

## Data Quality Rules
1. Every verse MUST have Sanskrit + at least one English translation
2. Transliteration uses IAST standard (ā, ī, ū, ṛ, ṃ, ḥ, ś, ṣ, ñ, ṭ, ḍ, ṇ)
3. Multiple translations per verse are ENCOURAGED (store as separate verse_contents)
4. Commentary is linked to specific verses, not to chapters
5. Source attribution is MANDATORY — always record translator/commentator name
