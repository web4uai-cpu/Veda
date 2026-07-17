"""
VEDA — Reasoning Language Model Service
===========================================
LLM-powered answer generation grounded in evidence packets.
Uses OpenRouter (GPT-5.5 primary, Claude fallback).

Every answer must be:
  - Grounded in provided evidence only
  - Cited with [REFERENCE] format
  - Honest about confidence level
  - Preserving contradictory views (no forced merge)
"""

from __future__ import annotations

import logging
import time
from dataclasses import dataclass, field

from openai import AsyncOpenAI

from config import settings
from models.schemas import EvidencePacketResponse

logger = logging.getLogger("veda.services.rlm")

SYSTEM_PROMPT_ASK = """You are VEDA, a Knowledge Operating System for Sanatan Dharma.
You answer questions using ONLY the evidence provided below. You are a research tool, not a guru.

RULES:
1. ONLY use the evidence provided. Never add claims beyond what the sources say.
2. Cite every factual claim using [REFERENCE] format (e.g., [BG.2.47]).
3. If multiple traditions or commentators disagree, present ALL views — never merge or pick one.
4. Sanskrit terms should be followed by their English meaning in parentheses.
5. If evidence is insufficient, say so honestly. Never fabricate.
6. Keep answers concise for "quick" mode, detailed for "scholar" mode.

EVIDENCE:
{evidence}

Answer the question based strictly on the evidence above."""

SYSTEM_PROMPT_RESEARCH = """You are VEDA, a Knowledge Operating System for Sanatan Dharma.
You produce structured research reports using ONLY the evidence provided below.

RULES:
1. ONLY use the evidence provided. Never add claims beyond what the sources say.
2. Cite every claim using [REFERENCE] format.
3. Present contradictory interpretations side by side with their source traditions.
4. Structure the report with: Summary, Key Findings, Source Analysis, Open Questions.
5. Include a confidence assessment for each finding.
6. If evidence is insufficient for a complete report, state the gaps.

EVIDENCE:
{evidence}

Produce a research report based strictly on the evidence above."""


@dataclass
class RLMResult:
    """Result from LLM reasoning."""
    answer: str
    cited_references: list[str] = field(default_factory=list)
    model_used: str = ""
    prompt_tokens: int = 0
    completion_tokens: int = 0
    latency_ms: float = 0.0


def _format_evidence(evidence: list[EvidencePacketResponse]) -> str:
    """Format evidence packets into a text block for LLM context."""
    parts = []
    for i, ep in enumerate(evidence, 1):
        ref = ep.citation.reference if ep.citation else "unknown"
        source = ep.citation.source_name if ep.citation else ep.title
        confidence = ep.citation.confidence if ep.citation else 0.0
        level = ep.citation.evidence_level if ep.citation else "E"

        parts.append(
            f"[Source {i}] {ref} ({source}, confidence: {confidence:.0%}, level: {level})\n"
            f"{ep.content}"
        )
    return "\n\n---\n\n".join(parts) if parts else "No evidence available."


def _extract_citations(text: str) -> list[str]:
    """Extract [REFERENCE] citations from LLM output."""
    import re
    return list(dict.fromkeys(re.findall(r'\[([A-Z][A-Za-z0-9.]+)\]', text)))


_llm_client: AsyncOpenAI | None = None


def _get_llm_client() -> AsyncOpenAI:
    """Shared OpenRouter client — reuses HTTP connections across calls."""
    global _llm_client
    if _llm_client is None:
        _llm_client = AsyncOpenAI(
            api_key=settings.openrouter_api_key,
            base_url=settings.openrouter_base_url,
            timeout=25.0,
        )
    return _llm_client


async def _call_llm(
    system_prompt: str,
    user_message: str,
    model: str,
) -> RLMResult:
    """Call the LLM via OpenRouter."""
    client = _get_llm_client()

    started = time.perf_counter()
    response = await client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ],
        temperature=0.3,
        max_tokens=2000,
    )
    elapsed = (time.perf_counter() - started) * 1000

    answer = response.choices[0].message.content or ""
    usage = response.usage

    return RLMResult(
        answer=answer,
        cited_references=_extract_citations(answer),
        model_used=model,
        prompt_tokens=usage.prompt_tokens if usage else 0,
        completion_tokens=usage.completion_tokens if usage else 0,
        latency_ms=round(elapsed, 2),
    )


async def generate_answer(
    query: str,
    evidence: list[EvidencePacketResponse],
    mode: str = "quick",
) -> RLMResult:
    """Generate an answer grounded in evidence packets.

    Uses primary model with automatic fallback.
    Returns evidence-only stub if no API key is configured.
    """
    if not settings.openrouter_api_key:
        logger.warning("OPENROUTER_API_KEY not set — returning evidence-only response")
        return RLMResult(
            answer="Evidence retrieved but LLM reasoning is not configured. Set OPENROUTER_API_KEY to enable generated answers.",
            model_used="none",
        )

    if not evidence:
        return RLMResult(
            answer="No evidence was found for this question. Try rephrasing or searching for a specific scripture reference.",
            model_used="none",
        )

    evidence_text = _format_evidence(evidence)
    system = SYSTEM_PROMPT_ASK.replace("{evidence}", evidence_text)
    user_msg = f"Question ({mode} mode): {query}"

    try:
        return await _call_llm(system, user_msg, settings.llm_primary_model)
    except Exception as primary_err:
        logger.warning("Primary LLM failed (%s), trying fallback: %s", settings.llm_primary_model, primary_err)
        try:
            return await _call_llm(system, user_msg, settings.llm_fallback_model)
        except Exception as fallback_err:
            logger.error("Fallback LLM also failed: %s", fallback_err)
            return RLMResult(
                answer="Unable to generate an answer at this time. The evidence packets below contain the relevant source material.",
                model_used="error",
            )


async def generate_research_report(
    query: str,
    evidence: list[EvidencePacketResponse],
) -> RLMResult:
    """Generate a structured research report grounded in evidence.

    Same fallback pattern as generate_answer.
    """
    if not settings.openrouter_api_key:
        return RLMResult(
            answer="Evidence retrieved but LLM reasoning is not configured. Set OPENROUTER_API_KEY to enable research reports.",
            model_used="none",
        )

    if not evidence:
        return RLMResult(
            answer="No evidence was found for this research query.",
            model_used="none",
        )

    evidence_text = _format_evidence(evidence)
    system = SYSTEM_PROMPT_RESEARCH.replace("{evidence}", evidence_text)
    user_msg = f"Research question: {query}"

    try:
        return await _call_llm(system, user_msg, settings.llm_primary_model)
    except Exception:
        try:
            return await _call_llm(system, user_msg, settings.llm_fallback_model)
        except Exception as e:
            logger.error("Research report generation failed: %s", e)
            return RLMResult(
                answer="Unable to generate a research report. The evidence packets contain the relevant source material.",
                model_used="error",
            )
