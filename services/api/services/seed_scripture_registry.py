"""
VEDA — Scripture Registry Seeding
====================================
Registers all major scriptures into PostgreSQL as metadata entries.
No content is ingested — only the scripture catalog (name, category,
period, description, metadata with structural counts).

Scriptures registered:
  - 4 Vedas
  - 18 Mahapuranas
  - 13 Principal Upanishads
  - 14 Shastras

Idempotent — skips existing slugs via ON CONFLICT DO NOTHING.

Usage:
    cd services/api
    python -m services.seed_scripture_registry
"""

from __future__ import annotations

import asyncio
import json
import logging
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.ulid import generate_id
from db.postgres import init_postgres, close_postgres, execute, fetchval

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%H:%M:%S",
    stream=sys.stdout,
)
logger = logging.getLogger("veda.seed.registry")


# =============================================================================
# 4 VEDAS
# =============================================================================

VEDAS = [
    {
        "slug": "rigveda",
        "name": "Rigveda",
        "sanskrit_name": "ऋग्वेद",
        "category": "veda",
        "period": "~1500-1200 BCE",
        "description": "The oldest Vedic text — 10 Mandalas of 1,028 hymns (suktas) with 10,552 mantras addressed to the Devas. Foundation of all Vedic literature.",
        "metadata": {
            "total_mandalas": 10,
            "total_suktas": 1028,
            "total_mantras": 10552,
            "canonical_abbreviation": "RV",
            "tradition": "Shruti",
            "structure": "Mandala > Sukta > Mantra",
        },
    },
    {
        "slug": "samaveda",
        "name": "Samaveda",
        "sanskrit_name": "सामवेद",
        "category": "veda",
        "period": "~1200-1000 BCE",
        "description": "The Veda of melodies — 1,875 mantras arranged for liturgical chanting. Two parts: Purvarchika (first section) and Uttararchika (latter section).",
        "metadata": {
            "total_mantras": 1875,
            "canonical_abbreviation": "SV",
            "tradition": "Shruti",
            "parts": ["Purvarchika", "Uttararchika"],
            "structure": "Archika > Prapathaka > Mantra",
        },
    },
    {
        "slug": "yajurveda",
        "name": "Yajurveda",
        "sanskrit_name": "यजुर्वेद",
        "category": "veda",
        "period": "~1200-1000 BCE",
        "description": "The Veda of ritual formulas — prose mantras for yajna performance. Two recensions: Shukla (White) Yajurveda and Krishna (Black) Yajurveda.",
        "metadata": {
            "total_mantras": 1975,
            "canonical_abbreviation": "YV",
            "tradition": "Shruti",
            "branches": ["Shukla (Vajasaneyi Samhita)", "Krishna (Taittiriya Samhita)"],
            "structure": "Adhyaya > Mantra",
        },
    },
    {
        "slug": "atharvaveda",
        "name": "Atharvaveda",
        "sanskrit_name": "अथर्ववेद",
        "category": "veda",
        "period": "~1200-1000 BCE",
        "description": "The Veda of everyday life — 20 Kandas of 5,977 mantras covering healing, philosophy, marriage, statecraft, and domestic rituals.",
        "metadata": {
            "total_kandas": 20,
            "total_mantras": 5977,
            "canonical_abbreviation": "AV",
            "tradition": "Shruti",
            "structure": "Kanda > Sukta > Mantra",
        },
    },
]

# =============================================================================
# 18 MAHAPURANAS
# =============================================================================

PURANAS = [
    {
        "slug": "brahma-purana",
        "name": "Brahma Purana",
        "sanskrit_name": "ब्रह्मपुराण",
        "category": "purana",
        "period": "~900-1200 CE",
        "description": "The first Purana in traditional lists — covers creation, genealogies, geography, and pilgrimage to Konark and Puri.",
        "metadata": {"total_shlokas": 10000, "group": "Brahma", "canonical_abbreviation": "BrP", "tradition": "Smriti"},
    },
    {
        "slug": "padma-purana",
        "name": "Padma Purana",
        "sanskrit_name": "पद्मपुराण",
        "category": "purana",
        "period": "~750-1200 CE",
        "description": "Named after the lotus (padma) from which Brahma emerged. Five khandas covering creation, earth, heaven, Patala, and additional topics.",
        "metadata": {"total_shlokas": 55000, "group": "Brahma", "canonical_abbreviation": "PdP", "tradition": "Smriti"},
    },
    {
        "slug": "vishnu-purana",
        "name": "Vishnu Purana",
        "sanskrit_name": "विष्णुपुराण",
        "category": "purana",
        "period": "~400 BCE - 400 CE",
        "description": "One of the earliest Puranas — cosmology, genealogies of kings, and stories of Lord Vishnu across six amshas (parts).",
        "metadata": {"total_shlokas": 23000, "total_amshas": 6, "group": "Vishnu", "canonical_abbreviation": "VP", "tradition": "Smriti"},
    },
    {
        "slug": "shiva-purana",
        "name": "Shiva Purana",
        "sanskrit_name": "शिवपुराण",
        "category": "purana",
        "period": "~400-1000 CE",
        "description": "Glorification of Lord Shiva — his forms, exploits, philosophy, and the significance of the Shiva Linga.",
        "metadata": {"total_shlokas": 24000, "group": "Shiva", "canonical_abbreviation": "ShP", "tradition": "Smriti"},
    },
    {
        "slug": "bhagavata-purana",
        "name": "Bhagavata Purana",
        "sanskrit_name": "भागवतपुराण",
        "category": "purana",
        "period": "~500-1000 CE",
        "description": "The most beloved Purana — 12 Skandhas celebrating Krishna's life and the path of Bhakti. Considered the crown jewel of Puranic literature.",
        "metadata": {"total_shlokas": 18000, "total_skandhas": 12, "group": "Vishnu", "canonical_abbreviation": "BhP", "tradition": "Smriti"},
    },
    {
        "slug": "narada-purana",
        "name": "Narada Purana",
        "sanskrit_name": "नारदपुराण",
        "category": "purana",
        "period": "~900-1200 CE",
        "description": "Teachings of sage Narada — covers festivals, vratas, tirthas, and summaries of all 18 Mahapuranas.",
        "metadata": {"total_shlokas": 25000, "group": "Vishnu", "canonical_abbreviation": "NrP", "tradition": "Smriti"},
    },
    {
        "slug": "markandeya-purana",
        "name": "Markandeya Purana",
        "sanskrit_name": "मार्कण्डेयपुराण",
        "category": "purana",
        "period": "~250-700 CE",
        "description": "Contains the famous Devi Mahatmya (Chandi Path) — stories of the Goddess defeating demons. Among the oldest Puranas.",
        "metadata": {"total_shlokas": 9000, "group": "Brahma", "canonical_abbreviation": "MkP", "tradition": "Smriti"},
    },
    {
        "slug": "agni-purana",
        "name": "Agni Purana",
        "sanskrit_name": "अग्निपुराण",
        "category": "purana",
        "period": "~700-1100 CE",
        "description": "An encyclopedic Purana narrated by Agni — covers rituals, arts, grammar, medicine, astrology, warfare, law, and yoga.",
        "metadata": {"total_shlokas": 15400, "group": "Brahma", "canonical_abbreviation": "AgP", "tradition": "Smriti"},
    },
    {
        "slug": "bhavishya-purana",
        "name": "Bhavishya Purana",
        "sanskrit_name": "भविष्यपुराण",
        "category": "purana",
        "period": "~500-1900 CE (heavily interpolated)",
        "description": "The Purana of future prophecies — covers sun worship, vratas, dharma, and contains later interpolations on diverse topics.",
        "metadata": {"total_shlokas": 14500, "group": "Brahma", "canonical_abbreviation": "BvP", "tradition": "Smriti"},
    },
    {
        "slug": "brahma-vaivarta-purana",
        "name": "Brahma Vaivarta Purana",
        "sanskrit_name": "ब्रह्मवैवर्तपुराण",
        "category": "purana",
        "period": "~700-1200 CE",
        "description": "Celebrates Krishna and Radha — four khandas covering Brahma, Prakriti, Ganesha, and Sri Krishna.",
        "metadata": {"total_shlokas": 18000, "group": "Vishnu", "canonical_abbreviation": "BVP", "tradition": "Smriti"},
    },
    {
        "slug": "linga-purana",
        "name": "Linga Purana",
        "sanskrit_name": "लिङ्गपुराण",
        "category": "purana",
        "period": "~500-1000 CE",
        "description": "Glorification of the Shiva Linga — cosmic cycles, creation, and the 28 incarnations of Shiva.",
        "metadata": {"total_shlokas": 11000, "group": "Shiva", "canonical_abbreviation": "LgP", "tradition": "Smriti"},
    },
    {
        "slug": "varaha-purana",
        "name": "Varaha Purana",
        "sanskrit_name": "वराहपुराण",
        "category": "purana",
        "period": "~1000-1200 CE",
        "description": "Narrated by Vishnu in his Varaha (boar) avatar — covers creation, vratas, tirthas, and geography.",
        "metadata": {"total_shlokas": 10000, "group": "Vishnu", "canonical_abbreviation": "VrP", "tradition": "Smriti"},
    },
    {
        "slug": "skanda-purana",
        "name": "Skanda Purana",
        "sanskrit_name": "स्कन्दपुराण",
        "category": "purana",
        "period": "~700-1200 CE",
        "description": "The largest Purana — named after Kartikeya (Skanda). Vast collection of pilgrimage guides (mahatmyas) for sacred sites across India.",
        "metadata": {"total_shlokas": 81100, "group": "Shiva", "canonical_abbreviation": "SkP", "tradition": "Smriti"},
    },
    {
        "slug": "vamana-purana",
        "name": "Vamana Purana",
        "sanskrit_name": "वामनपुराण",
        "category": "purana",
        "period": "~900-1100 CE",
        "description": "Stories of Vishnu's Vamana (dwarf) avatar — cosmology, Shiva-Vishnu narratives, and tirtha descriptions.",
        "metadata": {"total_shlokas": 10000, "group": "Shiva", "canonical_abbreviation": "VmP", "tradition": "Smriti"},
    },
    {
        "slug": "kurma-purana",
        "name": "Kurma Purana",
        "sanskrit_name": "कूर्मपुराण",
        "category": "purana",
        "period": "~600-900 CE",
        "description": "Narrated by Vishnu as the Kurma (tortoise) — Samhitas covering Brahma, Bhagavat, Saura, and Vaisheshika philosophy.",
        "metadata": {"total_shlokas": 17000, "group": "Vishnu", "canonical_abbreviation": "KrP", "tradition": "Smriti"},
    },
    {
        "slug": "matsya-purana",
        "name": "Matsya Purana",
        "sanskrit_name": "मत्स्यपुराण",
        "category": "purana",
        "period": "~250-500 CE",
        "description": "Narrated by Vishnu as the Matsya (fish) to Manu — temple architecture, iconography, history, and governance. Among the oldest Puranas.",
        "metadata": {"total_shlokas": 14000, "group": "Vishnu", "canonical_abbreviation": "MtP", "tradition": "Smriti"},
    },
    {
        "slug": "garuda-purana",
        "name": "Garuda Purana",
        "sanskrit_name": "गरुडपुराण",
        "category": "purana",
        "period": "~800-1100 CE",
        "description": "Narrated by Vishnu to Garuda — afterlife, funeral rites, gemology, medicine, and ethics. The Pretakhanda is read during mourning.",
        "metadata": {"total_shlokas": 19000, "group": "Vishnu", "canonical_abbreviation": "GrP", "tradition": "Smriti"},
    },
    {
        "slug": "brahmanda-purana",
        "name": "Brahmanda Purana",
        "sanskrit_name": "ब्रह्माण्डपुराण",
        "category": "purana",
        "period": "~400-600 CE",
        "description": "The Purana of the cosmic egg (Brahmanda) — contains the Lalita Sahasranama and Adhyatma Ramayana. Three padas covering creation, genealogies, and future ages.",
        "metadata": {"total_shlokas": 12000, "group": "Brahma", "canonical_abbreviation": "BdP", "tradition": "Smriti"},
    },
]

# =============================================================================
# 13 PRINCIPAL UPANISHADS (Mukhya Upanishads)
# =============================================================================

UPANISHADS = [
    {
        "slug": "isha-upanishad",
        "name": "Isha Upanishad",
        "sanskrit_name": "ईशोपनिषद्",
        "category": "upanishad",
        "period": "~800-500 BCE",
        "description": "The Lord pervades everything — shortest and first of principal Upanishads. 18 mantras on renunciation and the all-pervading Brahman.",
        "metadata": {"total_mantras": 18, "parent_veda": "Shukla Yajurveda", "canonical_abbreviation": "IU", "tradition": "Shruti"},
    },
    {
        "slug": "kena-upanishad",
        "name": "Kena Upanishad",
        "sanskrit_name": "केनोपनिषद्",
        "category": "upanishad",
        "period": "~800-500 BCE",
        "description": "'By whom?' — Explores the nature of Brahman behind all perception and cognition. Part of the Samaveda.",
        "metadata": {"total_verses": 35, "total_khandas": 4, "parent_veda": "Samaveda", "canonical_abbreviation": "KnU", "tradition": "Shruti"},
    },
    {
        "slug": "katha-upanishad",
        "name": "Katha Upanishad",
        "sanskrit_name": "कठोपनिषद्",
        "category": "upanishad",
        "period": "~800-300 BCE",
        "description": "Nachiketa's dialogue with Yama (Death) — the mystery of death, the Self, and the path to immortality.",
        "metadata": {"total_verses": 119, "total_vallis": 6, "parent_veda": "Krishna Yajurveda", "canonical_abbreviation": "KU", "tradition": "Shruti"},
    },
    {
        "slug": "prashna-upanishad",
        "name": "Prashna Upanishad",
        "sanskrit_name": "प्रश्नोपनिषद्",
        "category": "upanishad",
        "period": "~600-300 BCE",
        "description": "Six questions posed to sage Pippalada — on creation, prana, the subtle body, sleep, meditation, and the sixteen parts.",
        "metadata": {"total_prashnas": 6, "parent_veda": "Atharvaveda", "canonical_abbreviation": "PrU", "tradition": "Shruti"},
    },
    {
        "slug": "mundaka-upanishad",
        "name": "Mundaka Upanishad",
        "sanskrit_name": "मुण्डकोपनिषद्",
        "category": "upanishad",
        "period": "~600-300 BCE",
        "description": "Higher and lower knowledge — the imperishable Brahman. Two birds on a tree as the Atman and Jiva.",
        "metadata": {"total_mantras": 64, "total_mundakas": 3, "parent_veda": "Atharvaveda", "canonical_abbreviation": "MuU", "tradition": "Shruti"},
    },
    {
        "slug": "mandukya-upanishad",
        "name": "Mandukya Upanishad",
        "sanskrit_name": "माण्डूक्योपनिषद्",
        "category": "upanishad",
        "period": "~500-200 BCE",
        "description": "The syllable Om and the four states of consciousness — waking, dreaming, deep sleep, and Turiya. Only 12 mantras but considered sufficient for liberation.",
        "metadata": {"total_mantras": 12, "parent_veda": "Atharvaveda", "canonical_abbreviation": "MaU", "tradition": "Shruti"},
    },
    {
        "slug": "taittiriya-upanishad",
        "name": "Taittiriya Upanishad",
        "sanskrit_name": "तैत्तिरीयोपनिषद्",
        "category": "upanishad",
        "period": "~600-300 BCE",
        "description": "Three vallis: Shiksha (phonetics), Brahmananda (bliss of Brahman), and Bhrigu (progressive realization of Brahman).",
        "metadata": {"total_vallis": 3, "parent_veda": "Krishna Yajurveda", "canonical_abbreviation": "TU", "tradition": "Shruti"},
    },
    {
        "slug": "aitareya-upanishad",
        "name": "Aitareya Upanishad",
        "sanskrit_name": "ऐतरेयोपनिषद्",
        "category": "upanishad",
        "period": "~600-300 BCE",
        "description": "Creation of the universe, the birth of the Self, and the three births of the Atman. 'Prajnanam Brahma' (Consciousness is Brahman).",
        "metadata": {"total_chapters": 3, "parent_veda": "Rigveda", "canonical_abbreviation": "AU", "tradition": "Shruti", "mahavakya": "Prajnanam Brahma"},
    },
    {
        "slug": "chandogya-upanishad",
        "name": "Chandogya Upanishad",
        "sanskrit_name": "छान्दोग्योपनिषद्",
        "category": "upanishad",
        "period": "~800-500 BCE",
        "description": "One of the oldest and largest Upanishads — contains 'Tat Tvam Asi' (Thou art That). Meditation on Om, the Sama chant, and progressive teachings of Brahman.",
        "metadata": {"total_prapathakas": 8, "parent_veda": "Samaveda", "canonical_abbreviation": "ChU", "tradition": "Shruti", "mahavakya": "Tat Tvam Asi"},
    },
    {
        "slug": "brihadaranyaka-upanishad",
        "name": "Brihadaranyaka Upanishad",
        "sanskrit_name": "बृहदारण्यकोपनिषद्",
        "category": "upanishad",
        "period": "~800-500 BCE",
        "description": "The 'Great Forest Upanishad' — largest and among the most important. Contains 'Aham Brahmasmi' (I am Brahman) and Yajnavalkya's teachings.",
        "metadata": {"total_adhyayas": 6, "parent_veda": "Shukla Yajurveda", "canonical_abbreviation": "BU", "tradition": "Shruti", "mahavakya": "Aham Brahmasmi"},
    },
    {
        "slug": "shvetashvatara-upanishad",
        "name": "Shvetashvatara Upanishad",
        "sanskrit_name": "श्वेताश्वतरोपनिषद्",
        "category": "upanishad",
        "period": "~400-200 BCE",
        "description": "A theistic Upanishad — synthesizes Samkhya, Yoga, and Vedanta. Introduces personal God (Rudra/Shiva) alongside impersonal Brahman.",
        "metadata": {"total_adhyayas": 6, "parent_veda": "Krishna Yajurveda", "canonical_abbreviation": "SvU", "tradition": "Shruti"},
    },
    {
        "slug": "kaushitaki-upanishad",
        "name": "Kaushitaki Upanishad",
        "sanskrit_name": "कौषीतकिब्राह्मणोपनिषद्",
        "category": "upanishad",
        "period": "~600-300 BCE",
        "description": "Prana as Brahman — the journey of the soul after death, and the doctrine of prana-vidya (knowledge of the life-breath).",
        "metadata": {"total_adhyayas": 4, "parent_veda": "Rigveda", "canonical_abbreviation": "KsU", "tradition": "Shruti"},
    },
    {
        "slug": "maitri-upanishad",
        "name": "Maitri Upanishad",
        "sanskrit_name": "मैत्र्युपनिषद्",
        "category": "upanishad",
        "period": "~300 BCE - 200 CE",
        "description": "King Brihadratha's renunciation and instruction by sage Maitri — integrates Samkhya, Yoga, and early Bhakti elements.",
        "metadata": {"total_prapathakas": 7, "parent_veda": "Krishna Yajurveda", "canonical_abbreviation": "MtU", "tradition": "Shruti"},
    },
]

# =============================================================================
# 14 SHASTRAS (Major Treatises by Munis)
# =============================================================================

SHASTRAS = [
    {
        "slug": "arthashastra",
        "name": "Arthashastra",
        "sanskrit_name": "अर्थशास्त्र",
        "category": "shastra",
        "period": "~300 BCE",
        "description": "Kautilya's treatise on statecraft, governance, economic policy, military strategy, and law. The foundational text of Indian political science.",
        "metadata": {"author": "Kautilya (Chanakya)", "total_adhikaranas": 15, "total_chapters": 150, "canonical_abbreviation": "AS", "tradition": "Shastra"},
    },
    {
        "slug": "manusmriti",
        "name": "Manusmriti",
        "sanskrit_name": "मनुस्मृति",
        "category": "shastra",
        "period": "~200 BCE - 200 CE",
        "description": "The Laws of Manu — an ancient legal text covering dharma, conduct, duties, and social organization. One of the most studied Dharmashastra texts.",
        "metadata": {"author": "Manu", "total_chapters": 12, "total_shlokas": 2694, "canonical_abbreviation": "MS", "tradition": "Dharmashastra"},
    },
    {
        "slug": "natyashastra",
        "name": "Natyashastra",
        "sanskrit_name": "नाट्यशास्त्र",
        "category": "shastra",
        "period": "~200 BCE - 200 CE",
        "description": "Bharata Muni's encyclopedic treatise on performing arts — drama, dance, music, rasa theory, stagecraft, and aesthetics. Foundation of Indian classical arts.",
        "metadata": {"author": "Bharata Muni", "total_chapters": 36, "total_shlokas": 6000, "canonical_abbreviation": "NS", "tradition": "Shastra"},
    },
    {
        "slug": "kamasutra",
        "name": "Kamasutra",
        "sanskrit_name": "कामसूत्र",
        "category": "shastra",
        "period": "~300 CE",
        "description": "Vatsyayana's treatise on kama (desire) — one of the four purusharthas. Covers love, relationships, social conduct, and the art of living.",
        "metadata": {"author": "Vatsyayana", "total_adhikaranas": 7, "total_chapters": 36, "canonical_abbreviation": "KS", "tradition": "Shastra"},
    },
    {
        "slug": "yoga-sutras",
        "name": "Yoga Sutras",
        "sanskrit_name": "योगसूत्र",
        "category": "shastra",
        "period": "~200 BCE",
        "description": "Patanjali's 196 sutras systematizing the eight limbs of yoga (Ashtanga Yoga). The foundational text of Raja Yoga and classical yoga philosophy.",
        "metadata": {"author": "Patanjali", "total_padas": 4, "total_sutras": 196, "canonical_abbreviation": "YS", "tradition": "Yoga Darshana"},
    },
    {
        "slug": "brahma-sutras",
        "name": "Brahma Sutras",
        "sanskrit_name": "ब्रह्मसूत्र",
        "category": "shastra",
        "period": "~400-200 BCE",
        "description": "Badarayana's systematization of Vedanta philosophy — 555 sutras across 4 adhyayas. One of the Prasthanatrayi (triple canon) alongside Upanishads and Gita.",
        "metadata": {"author": "Badarayana (Vyasa)", "total_adhyayas": 4, "total_sutras": 555, "canonical_abbreviation": "BS", "tradition": "Vedanta"},
    },
    {
        "slug": "nyaya-sutras",
        "name": "Nyaya Sutras",
        "sanskrit_name": "न्यायसूत्र",
        "category": "shastra",
        "period": "~200 BCE",
        "description": "Akshapada Gautama's foundational text of Indian logic and epistemology — 16 categories (padarthas) for valid reasoning and debate.",
        "metadata": {"author": "Akshapada Gautama", "total_adhyayas": 5, "total_sutras": 528, "canonical_abbreviation": "NyS", "tradition": "Nyaya Darshana"},
    },
    {
        "slug": "vaisheshika-sutras",
        "name": "Vaisheshika Sutras",
        "sanskrit_name": "वैशेषिकसूत्र",
        "category": "shastra",
        "period": "~200 BCE",
        "description": "Kanada's atomistic philosophy — categorizes reality into six padarthas (categories): substance, quality, action, generality, particularity, and inherence.",
        "metadata": {"author": "Kanada", "total_adhyayas": 10, "total_sutras": 370, "canonical_abbreviation": "VS", "tradition": "Vaisheshika Darshana"},
    },
    {
        "slug": "mimamsa-sutras",
        "name": "Mimamsa Sutras",
        "sanskrit_name": "मीमांसासूत्र",
        "category": "shastra",
        "period": "~200 BCE",
        "description": "Jaimini's hermeneutical system for interpreting Vedic injunctions — foundational text of Purva Mimamsa, emphasizing ritual action (karma) and dharma.",
        "metadata": {"author": "Jaimini", "total_adhyayas": 12, "total_sutras": 2745, "canonical_abbreviation": "MmS", "tradition": "Purva Mimamsa"},
    },
    {
        "slug": "sankhya-karika",
        "name": "Sankhya Karika",
        "sanskrit_name": "सांख्यकारिका",
        "category": "shastra",
        "period": "~350 CE",
        "description": "Ishvarakrishna's systematic exposition of Sankhya philosophy in 72 karikas — enumerating the 25 tattvas from Prakriti to Purusha.",
        "metadata": {"author": "Ishvarakrishna", "total_karikas": 72, "canonical_abbreviation": "SK", "tradition": "Sankhya Darshana"},
    },
    {
        "slug": "ashtadhyayi",
        "name": "Ashtadhyayi",
        "sanskrit_name": "अष्टाध्यायी",
        "category": "shastra",
        "period": "~400 BCE",
        "description": "Panini's grammar of the Sanskrit language — 3,959 rules in 8 chapters. The most comprehensive and scientific grammar ever composed for any language.",
        "metadata": {"author": "Panini", "total_adhyayas": 8, "total_sutras": 3959, "canonical_abbreviation": "AD", "tradition": "Vyakarana"},
    },
    {
        "slug": "amarakosha",
        "name": "Amarakosha",
        "sanskrit_name": "अमरकोश",
        "category": "shastra",
        "period": "~400 CE",
        "description": "Amarasimha's thesaurus of Sanskrit — three kandas organizing synonyms and vocabulary by category. The most influential Sanskrit lexicon.",
        "metadata": {"author": "Amarasimha", "total_kandas": 3, "canonical_abbreviation": "AK", "tradition": "Kosha (Lexicography)"},
    },
    {
        "slug": "charaka-samhita",
        "name": "Charaka Samhita",
        "sanskrit_name": "चरकसंहिता",
        "category": "shastra",
        "period": "~300 BCE - 200 CE",
        "description": "The foundational text of Ayurveda (internal medicine) — 120 chapters covering anatomy, diagnostics, therapeutics, pharmacology, and medical ethics.",
        "metadata": {"author": "Charaka (redacted by Dridhabala)", "total_sthanas": 8, "total_chapters": 120, "canonical_abbreviation": "CS", "tradition": "Ayurveda"},
    },
    {
        "slug": "sushruta-samhita",
        "name": "Sushruta Samhita",
        "sanskrit_name": "सुश्रुतसंहिता",
        "category": "shastra",
        "period": "~300 BCE - 200 CE",
        "description": "The foundational text of Ayurvedic surgery — 186 chapters covering surgical techniques, instruments, anatomy, and over 1,120 diseases. Describes rhinoplasty and cataract surgery.",
        "metadata": {"author": "Sushruta", "total_sthanas": 6, "total_chapters": 186, "canonical_abbreviation": "SS", "tradition": "Ayurveda"},
    },
]


ALL_SCRIPTURES = VEDAS + PURANAS + UPANISHADS + SHASTRAS


async def seed_scripture(entry: dict) -> str | None:
    """Seed a single scripture. Returns scripture_id if created, None if exists."""
    existing = await fetchval(
        "SELECT id FROM scriptures WHERE slug = $1", entry["slug"]
    )
    if existing:
        return None

    scripture_id = generate_id("scp")
    await execute(
        """
        INSERT INTO scriptures (id, slug, name, sanskrit_name, category, language, period, description, is_canonical, metadata)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (slug) DO NOTHING
        """,
        scripture_id,
        entry["slug"],
        entry["name"],
        entry["sanskrit_name"],
        entry["category"],
        "sanskrit",
        entry["period"],
        entry["description"],
        True,
        json.dumps(entry["metadata"]),
    )
    return scripture_id


async def seed_all_scriptures() -> int:
    """Seed all scripture registry entries. Returns count of newly created."""
    created = 0
    for entry in ALL_SCRIPTURES:
        result = await seed_scripture(entry)
        if result:
            logger.info("  Created: %-35s %s", entry["name"], result)
            created += 1
        else:
            logger.info("  Exists:  %-35s (skipped)", entry["name"])
    return created


async def main():
    """Run the scripture registry seeding."""
    logger.info("=" * 60)
    logger.info("VEDA — Scripture Registry Seeding")
    logger.info("=" * 60)
    logger.info("Total entries: %d", len(ALL_SCRIPTURES))
    logger.info("  Vedas:      %d", len(VEDAS))
    logger.info("  Puranas:    %d", len(PURANAS))
    logger.info("  Upanishads: %d", len(UPANISHADS))
    logger.info("  Shastras:   %d", len(SHASTRAS))
    logger.info("")

    await init_postgres()

    try:
        created = await seed_all_scriptures()

        total = await fetchval("SELECT COUNT(*) FROM scriptures")
        logger.info("")
        logger.info("=" * 60)
        logger.info("Registry complete!")
        logger.info("  New entries: %d", created)
        logger.info("  Total scriptures in DB: %d", total or 0)
        logger.info("=" * 60)
    finally:
        await close_postgres()


if __name__ == "__main__":
    asyncio.run(main())
