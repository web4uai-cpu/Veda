"""
VEDA — Bhagavad Gita Seed Data
================================
Seeds the Bhagavad Gita scripture, chapters, and initial metadata
into PostgreSQL. This is the FIRST scripture ingested per IMPLEMENTATION_PLAN.md Phase 4.

Usage:
    python -m tools.seed_gita
"""

# Bhagavad Gita — 18 Chapters
GITA_CHAPTERS = [
    {"number": 1, "title": "Arjuna Vishada Yoga", "sanskrit": "अर्जुनविषादयोग", "verses": 47, "summary": "Arjuna's grief and moral dilemma on the battlefield of Kurukshetra"},
    {"number": 2, "title": "Sankhya Yoga", "sanskrit": "सांख्ययोग", "verses": 72, "summary": "The immortality of the soul, Karma Yoga, and the characteristics of a wise person"},
    {"number": 3, "title": "Karma Yoga", "sanskrit": "कर्मयोग", "verses": 43, "summary": "The path of selfless action and duty without attachment to results"},
    {"number": 4, "title": "Jnana Karma Sanyasa Yoga", "sanskrit": "ज्ञानकर्मसंन्यासयोग", "verses": 42, "summary": "The path of knowledge, divine incarnation, and renunciation of action in knowledge"},
    {"number": 5, "title": "Karma Sanyasa Yoga", "sanskrit": "कर्मसंन्यासयोग", "verses": 29, "summary": "Renunciation versus selfless action — both lead to liberation"},
    {"number": 6, "title": "Dhyana Yoga", "sanskrit": "ध्यानयोग", "verses": 47, "summary": "The practice of meditation, self-control, and the nature of the disciplined mind"},
    {"number": 7, "title": "Jnana Vijnana Yoga", "sanskrit": "ज्ञानविज्ञानयोग", "verses": 30, "summary": "Knowledge of the Absolute and the relative — matter and spirit"},
    {"number": 8, "title": "Akshara Brahma Yoga", "sanskrit": "अक्षरब्रह्मयोग", "verses": 28, "summary": "The imperishable Brahman, the cycle of birth and death, and liberation"},
    {"number": 9, "title": "Raja Vidya Raja Guhya Yoga", "sanskrit": "राजविद्याराजगुह्ययोग", "verses": 34, "summary": "The most secret knowledge — the sovereign science of devotion"},
    {"number": 10, "title": "Vibhuti Yoga", "sanskrit": "विभूतियोग", "verses": 42, "summary": "The divine glories and manifestations of the Supreme"},
    {"number": 11, "title": "Vishwarupa Darshana Yoga", "sanskrit": "विश्वरूपदर्शनयोग", "verses": 55, "summary": "The cosmic vision — Arjuna beholds the universal form of the Divine"},
    {"number": 12, "title": "Bhakti Yoga", "sanskrit": "भक्तियोग", "verses": 20, "summary": "The path of devotion and the qualities of a true devotee"},
    {"number": 13, "title": "Kshetra Kshetrajna Vibhaga Yoga", "sanskrit": "क्षेत्रक्षेत्रज्ञविभागयोग", "verses": 35, "summary": "The field and the knower of the field — body, soul, and nature"},
    {"number": 14, "title": "Gunatraya Vibhaga Yoga", "sanskrit": "गुणत्रयविभागयोग", "verses": 27, "summary": "The three qualities of nature — Sattva, Rajas, and Tamas"},
    {"number": 15, "title": "Purushottama Yoga", "sanskrit": "पुरुषोत्तमयोग", "verses": 20, "summary": "The Supreme Person — beyond the perishable and imperishable"},
    {"number": 16, "title": "Daivasura Sampad Vibhaga Yoga", "sanskrit": "दैवासुरसम्पद्विभागयोग", "verses": 24, "summary": "The divine and demoniac natures — virtues and vices"},
    {"number": 17, "title": "Shraddhatraya Vibhaga Yoga", "sanskrit": "श्रद्धात्रयविभागयोग", "verses": 28, "summary": "The three types of faith, food, sacrifice, austerity, and charity"},
    {"number": 18, "title": "Moksha Sanyasa Yoga", "sanskrit": "मोक्षसंन्यासयोग", "verses": 78, "summary": "Renunciation and liberation — the final teaching and Arjuna's resolution"},
]

# Total: 700 verses across 18 chapters

GITA_SCRIPTURE = {
    "slug": "bhagavad-gita",
    "name": "Bhagavad Gita",
    "sanskrit_name": "भगवद्गीता",
    "category": "gita",
    "language": "sanskrit",
    "period": "~3000 BCE (traditional) / ~200 BCE (scholarly)",
    "description": "The Song of God — A 700-verse dialogue between Prince Arjuna and Lord Krishna on the battlefield of Kurukshetra. Part of the Mahabharata (Bhishma Parva, chapters 25-42). The most widely studied and translated scripture in Sanatan Dharma.",
    "is_canonical": True,
    "metadata": {
        "total_chapters": 18,
        "total_verses": 700,
        "tradition": "Part of Prasthanatrayi (triple canon of Vedanta)",
        "original_context": "Bhishma Parva of the Mahabharata",
        "speaker": "Lord Krishna (primarily), with Arjuna, Sanjaya, and Dhritarashtra",
        "public_api": "https://bhagavadgitaapi.in/",
    },
}


def print_seed_summary():
    """Print a summary of the Gita seed data."""
    total_verses = sum(ch["verses"] for ch in GITA_CHAPTERS)
    print(f"📖 Bhagavad Gita Seed Data")
    print(f"   Chapters: {len(GITA_CHAPTERS)}")
    print(f"   Total Verses: {total_verses}")
    print(f"   Category: {GITA_SCRIPTURE['category']}")
    print(f"   API: {GITA_SCRIPTURE['metadata']['public_api']}")
    print()
    for ch in GITA_CHAPTERS:
        print(f"   Ch {ch['number']:2d}. {ch['title']:<40s} ({ch['sanskrit']}) — {ch['verses']} verses")


if __name__ == "__main__":
    print_seed_summary()
