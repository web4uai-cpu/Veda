"""
VEDA — Orchestrator Agent
============================
Routes queries to the appropriate domain agent(s) based on content analysis.
Supports multi-agent invocation for cross-domain questions.
"""

from __future__ import annotations

import logging
import re

logger = logging.getLogger("veda.agents.orchestrator")

DOMAIN_SIGNALS: dict[str, list[str]] = {
    "veda": [
        "rigveda", "samaveda", "yajurveda", "atharvaveda", "veda",
        "mantra", "sukta", "hymn", "brahmana", "aranyaka",
        "yajna", "agni", "indra", "soma", "varuna", "vedic",
    ],
    "upanishad": [
        "upanishad", "brahman", "atman", "self", "consciousness",
        "isha", "kena", "katha", "mundaka", "mandukya",
        "chandogya", "brihadaranyaka", "taittiriya", "aitareya",
        "mahavakya", "turiya", "moksha", "liberation",
    ],
    "purana": [
        "purana", "ramayana", "mahabharata", "bhagavata", "itihasa",
        "avatar", "rama", "krishna", "shiva", "vishnu", "devi",
        "mythology", "story", "narrative", "genealogy", "dynasty",
        "yuga", "kalpa", "tirtha",
    ],
    "vedanta": [
        "vedanta", "advaita", "vishishtadvaita", "dvaita",
        "shankara", "shankaracharya", "ramanuja", "madhva",
        "brahma sutra", "darshana", "philosophy",
        "nyaya", "vaisheshika", "samkhya", "mimamsa",
        "maya", "avidya", "superimposition",
    ],
    "sanskrit": [
        "sanskrit", "vyakarana", "grammar", "panini", "ashtadhyayi",
        "nirukta", "chandas", "dhatu", "root", "sandhi",
        "samasa", "compound", "vibhakti", "declension",
        "translate", "translation", "meaning of the word",
        "etymology", "devanagari",
    ],
}

SCRIPTURE_PATTERN = re.compile(
    r"\b(BG|gita|bhagavad)\b",
    re.IGNORECASE,
)


def classify_query(query: str) -> list[str]:
    """Classify a query into one or more domain agent names.

    Returns a list of agent names sorted by relevance score (highest first).
    Falls back to ["vedanta"] for general philosophical questions.
    """
    lowered = query.lower()
    scores: dict[str, int] = {}

    for agent_name, signals in DOMAIN_SIGNALS.items():
        score = sum(1 for s in signals if s in lowered)
        if score > 0:
            scores[agent_name] = score

    if not scores:
        if SCRIPTURE_PATTERN.search(query):
            return ["vedanta"]
        if any(w in lowered for w in ["what", "why", "how", "explain", "meaning"]):
            return ["vedanta"]
        return ["vedanta"]

    ranked = sorted(scores, key=scores.get, reverse=True)
    top_score = scores[ranked[0]]
    return [a for a in ranked if scores[a] >= max(1, top_score // 2)]


def needs_graph_enrichment(query: str) -> bool:
    """Determine if the query would benefit from knowledge graph context."""
    lowered = query.lower()
    return any(w in lowered for w in [
        "related", "connection", "relationship", "between",
        "compare", "contrast", "difference", "similar",
        "linked", "associated", "concept",
    ])


def needs_research_depth(query: str, mode: str) -> bool:
    """Determine if the query needs research-depth synthesis."""
    if mode == "research":
        return True
    lowered = query.lower()
    return any(w in lowered for w in [
        "analyze", "analysis", "comprehensive", "detailed",
        "research", "survey", "overview", "summarize all",
        "compare all", "evolution of", "history of",
    ])
