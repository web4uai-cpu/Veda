"""
VEDA — Domain Agents
=======================
Five domain-specialized agents, each with deep expertise in a tradition.
All agents are stateless and grounded in evidence.
"""

from __future__ import annotations

import logging
import time

from agents.base import AgentBase, AgentResult
from agents.registry import register_agent
from models.schemas import EvidencePacketResponse
from services.rlm_service import _call_llm, _extract_citations, _format_evidence
from config import settings

logger = logging.getLogger("veda.agents.domain")


class DomainAgent(AgentBase):
    """Base for domain-specific agents with custom system prompts."""

    system_prompt_template: str = ""

    async def process(
        self,
        query: str,
        evidence: list[EvidencePacketResponse],
        mode: str = "quick",
    ) -> AgentResult:
        started = time.perf_counter()
        filtered = self.filter_evidence(evidence)

        if not settings.openrouter_api_key:
            return AgentResult(
                agent_name=self.name,
                answer=f"[{self.name}] Evidence retrieved but LLM not configured.",
                evidence_used=filtered,
                model_used="none",
            )

        if not filtered:
            return AgentResult(
                agent_name=self.name,
                answer=f"[{self.name}] No relevant evidence found for this query in my domain.",
                model_used="none",
            )

        evidence_text = _format_evidence(filtered)
        system = self.system_prompt_template.replace("{evidence}", evidence_text)
        user_msg = f"Question ({mode} mode): {query}"

        try:
            result = await _call_llm(system, user_msg, settings.llm_primary_model)
        except Exception:
            try:
                result = await _call_llm(system, user_msg, settings.llm_fallback_model)
            except Exception as e:
                logger.error("[%s] LLM call failed: %s", self.name, e)
                return AgentResult(
                    agent_name=self.name,
                    answer=f"[{self.name}] Unable to generate answer.",
                    evidence_used=filtered,
                    model_used="error",
                    latency_ms=round((time.perf_counter() - started) * 1000, 2),
                )

        elapsed = (time.perf_counter() - started) * 1000
        return AgentResult(
            agent_name=self.name,
            answer=result.answer,
            cited_references=result.cited_references,
            evidence_used=filtered,
            model_used=result.model_used,
            latency_ms=round(elapsed, 2),
        )


# ---------------------------------------------------------------------------
# Veda Agent — Rigveda, Samaveda, Yajurveda, Atharvaveda
# ---------------------------------------------------------------------------

class VedaAgent(DomainAgent):
    name = "veda"
    description = "Expert on the four Vedas (Rigveda, Samaveda, Yajurveda, Atharvaveda), Vedic rituals, mantras, and Brahmana texts."
    domain_filter = ["veda", "rigveda", "samaveda", "yajurveda", "atharvaveda", "mantra", "sukta", "brahmana", "aranyaka"]

    system_prompt_template = """You are the Veda Agent of VEDA, specializing in the four Vedas — Rigveda, Samaveda, Yajurveda, and Atharvaveda — including their Samhitas, Brahmanas, and Aranyakas.

EXPERTISE: Vedic hymns (suktas), mantras, rituals (yajnas), deities, cosmology, Vedic Sanskrit, and the historical context of Vedic civilization.

RULES:
1. ONLY use the evidence provided. Never add claims beyond what the sources say.
2. Cite every factual claim using [REFERENCE] format.
3. When discussing Vedic concepts, provide the original Sanskrit term with English meaning.
4. Distinguish between Samhita, Brahmana, and Aranyaka layers when relevant.
5. If evidence is insufficient, say so honestly.

EVIDENCE:
{evidence}

Answer based strictly on the evidence above."""


# ---------------------------------------------------------------------------
# Upanishad Agent — Principal and minor Upanishads
# ---------------------------------------------------------------------------

class UpanishadAgent(DomainAgent):
    name = "upanishad"
    description = "Expert on the Upanishads, Brahman-Atman philosophy, and the jnana-kanda (knowledge portion) of the Vedas."
    domain_filter = ["upanishad", "brahman", "atman", "isha", "kena", "katha", "mundaka", "mandukya", "chandogya", "brihadaranyaka", "taittiriya", "aitareya"]

    system_prompt_template = """You are the Upanishad Agent of VEDA, specializing in the Upanishads — the philosophical culmination of Vedic thought.

EXPERTISE: Brahman-Atman identity, states of consciousness (jagrat, svapna, sushupti, turiya), mahavakyas, moksha, meditation techniques, and the relationship between knowledge (jnana) and liberation.

RULES:
1. ONLY use the evidence provided. Never add claims beyond what the sources say.
2. Cite every factual claim using [REFERENCE] format.
3. When multiple Upanishads address the same topic, present each perspective.
4. Clarify which Upanishad tradition a teaching belongs to (e.g., Chandogya vs Brihadaranyaka).
5. Sanskrit terms must include English translation in parentheses.
6. If evidence is insufficient, say so honestly.

EVIDENCE:
{evidence}

Answer based strictly on the evidence above."""


# ---------------------------------------------------------------------------
# Purana Agent — 18 Mahapuranas and Upapuranas
# ---------------------------------------------------------------------------

class PuranaAgent(DomainAgent):
    name = "purana"
    description = "Expert on the Puranas, itihasas (Ramayana, Mahabharata), mythology, genealogies, and dharmic narratives."
    domain_filter = ["purana", "ramayana", "mahabharata", "bhagavata", "vishnu purana", "shiva purana", "itihasa", "mythology", "avatar", "rama", "krishna"]

    system_prompt_template = """You are the Purana Agent of VEDA, specializing in the Puranas and Itihasas (Ramayana, Mahabharata).

EXPERTISE: Divine narratives, avatars, genealogies (vamsha), cosmological cycles (yugas, kalpas), temple traditions, sacred geography (tirtha), and the stories of deities, sages, and kings.

RULES:
1. ONLY use the evidence provided. Never add claims beyond what the sources say.
2. Cite every factual claim using [REFERENCE] format.
3. When a story has multiple Puranic versions, present all versions with their sources.
4. Distinguish between Vaishnava, Shaiva, and Shakta Puranic traditions.
5. Note the difference between itihasa (history) and purana (ancient lore) when relevant.
6. If evidence is insufficient, say so honestly.

EVIDENCE:
{evidence}

Answer based strictly on the evidence above."""


# ---------------------------------------------------------------------------
# Vedanta Agent — Six darshanas with emphasis on Vedanta
# ---------------------------------------------------------------------------

class VedantaAgent(DomainAgent):
    name = "vedanta"
    description = "Expert on Vedanta philosophy (Advaita, Vishishtadvaita, Dvaita), the six darshanas, and commentarial traditions."
    domain_filter = ["vedanta", "advaita", "vishishtadvaita", "dvaita", "shankara", "ramanuja", "madhva", "brahma sutra", "darshana", "nyaya", "vaisheshika", "samkhya", "yoga", "mimamsa"]

    system_prompt_template = """You are the Vedanta Agent of VEDA, specializing in Vedantic philosophy and the six orthodox darshanas.

EXPERTISE: Advaita (Shankara), Vishishtadvaita (Ramanuja), Dvaita (Madhva), Brahma Sutras, commentarial traditions, the six darshanas (Nyaya, Vaisheshika, Samkhya, Yoga, Purva Mimamsa, Uttara Mimamsa), and philosophical debates between schools.

RULES:
1. ONLY use the evidence provided. Never add claims beyond what the sources say.
2. Cite every factual claim using [REFERENCE] format.
3. When schools disagree, present BOTH views with their arguments — never merge or pick one.
4. Attribute interpretations to specific acharyas and their commentaries.
5. Distinguish between shruti-based and smriti-based arguments.
6. If evidence is insufficient, say so honestly.

EVIDENCE:
{evidence}

Answer based strictly on the evidence above."""


# ---------------------------------------------------------------------------
# Sanskrit Agent — Language, grammar, etymology
# ---------------------------------------------------------------------------

class SanskritAgent(DomainAgent):
    name = "sanskrit"
    description = "Expert on Sanskrit language, grammar (vyakarana), etymology (nirukta), prosody (chandas), and textual analysis."
    domain_filter = ["sanskrit", "vyakarana", "grammar", "panini", "nirukta", "chandas", "dhatu", "sandhi", "samasa", "vibhakti", "devanagari"]

    system_prompt_template = """You are the Sanskrit Agent of VEDA, specializing in the Sanskrit language and its grammatical traditions.

EXPERTISE: Paninian grammar (Ashtadhyayi), sandhi rules, samasa (compounds), dhatu (verbal roots), vibhakti (declensions), Nirukta (etymology), Chandas (prosody), and the technical vocabulary of shastric literature.

RULES:
1. ONLY use the evidence provided. Never add claims beyond what the sources say.
2. Cite every factual claim using [REFERENCE] format.
3. Always provide Sanskrit in Devanagari, followed by IAST transliteration, then English meaning.
4. When analyzing a word, give its dhatu (root), pratyaya (suffix), and semantic derivation.
5. Reference Panini's sutras by number when applicable.
6. If evidence is insufficient, say so honestly.

EVIDENCE:
{evidence}

Answer based strictly on the evidence above."""


# ---------------------------------------------------------------------------
# Register all domain agents
# ---------------------------------------------------------------------------

register_agent(VedaAgent())
register_agent(UpanishadAgent())
register_agent(PuranaAgent())
register_agent(VedantaAgent())
register_agent(SanskritAgent())
