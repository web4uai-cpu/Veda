"""
VEDA — Infrastructure Agents
================================
Agents that wrap existing services: Graph, Citation, Research, Upload.
Citation Agent has VETO authority — it can reject any response with
unverifiable citations.
"""

from __future__ import annotations

import logging
import time

from agents.base import AgentBase, AgentResult
from agents.registry import register_agent
from models.schemas import EvidencePacketResponse
from services.citation_service import (
    resolve_scripture_citation_by_reference,
    validate_citation,
    calculate_confidence,
)
from services.rlm_service import _extract_citations

logger = logging.getLogger("veda.agents.infrastructure")


# ---------------------------------------------------------------------------
# Citation Agent — VETO AUTHORITY
# ---------------------------------------------------------------------------

class CitationAgent(AgentBase):
    """Validates all citations in an answer against the canonical corpus.

    Has VETO authority: if critical citations cannot be verified, it flags
    the response and computes an agent_agreement score for confidence
    recalculation.
    """

    name = "citation"
    description = "Validates citations against canonical corpus. Has VETO authority over unverifiable claims."

    async def process(
        self,
        query: str,
        evidence: list[EvidencePacketResponse],
        mode: str = "quick",
    ) -> AgentResult:
        return AgentResult(agent_name=self.name, answer="")

    async def validate_answer(
        self,
        answer: str,
        evidence: list[EvidencePacketResponse],
        correlation_id: str | None = None,
    ) -> AgentResult:
        """Validate all [REFERENCE] citations in an answer.

        Returns an AgentResult with:
        - confidence: fraction of citations that verified
        - vetoed: True if >50% of citations are unverifiable
        - warnings: list of unverified references
        """
        started = time.perf_counter()
        refs = _extract_citations(answer)

        if not refs:
            return AgentResult(
                agent_name=self.name,
                answer="No citations to validate.",
                confidence=1.0,
                latency_ms=round((time.perf_counter() - started) * 1000, 2),
            )

        verified = 0
        warnings: list[str] = []

        for ref in refs:
            citation = await resolve_scripture_citation_by_reference(ref)
            if citation:
                verified += 1
            else:
                warnings.append(f"[{ref}] could not be verified against canonical corpus")

        agreement = verified / len(refs) if refs else 1.0
        vetoed = agreement < 0.5

        elapsed = (time.perf_counter() - started) * 1000
        return AgentResult(
            agent_name=self.name,
            answer=f"Validated {verified}/{len(refs)} citations.",
            cited_references=refs,
            confidence=round(agreement, 4),
            vetoed=vetoed,
            veto_reason=f"Only {verified}/{len(refs)} citations verified" if vetoed else "",
            warnings=warnings,
            latency_ms=round(elapsed, 2),
        )


# ---------------------------------------------------------------------------
# Graph Agent — Knowledge graph traversal
# ---------------------------------------------------------------------------

class GraphAgent(AgentBase):
    """Enriches queries with knowledge graph context from Neo4j."""

    name = "graph"
    description = "Traverses the Neo4j knowledge graph to find related concepts, relationships, and structural context."

    async def process(
        self,
        query: str,
        evidence: list[EvidencePacketResponse],
        mode: str = "quick",
    ) -> AgentResult:
        started = time.perf_counter()
        try:
            from db.neo4j_client import read_query
        except Exception:
            return AgentResult(
                agent_name=self.name,
                answer="Knowledge graph not available.",
                model_used="none",
                warnings=["Neo4j connection not available"],
            )

        concepts: list[str] = []
        try:
            result = await read_query(
                """
                MATCH (c:Concept)
                WHERE toLower(c.name) CONTAINS toLower($query)
                   OR toLower(c.slug) CONTAINS toLower($query)
                RETURN c.name AS name, c.slug AS slug
                LIMIT 5
                """,
                {"query": query},
            )
            concepts = [r["name"] for r in result]
        except Exception as e:
            logger.warning("[graph] Concept lookup failed: %s", e)

        relationships: list[str] = []
        if concepts:
            try:
                result = await read_query(
                    """
                    MATCH (c:Concept)-[r]-(other)
                    WHERE c.name IN $names
                    RETURN c.name AS from_name, type(r) AS rel, labels(other)[0] AS to_label, other.name AS to_name
                    LIMIT 20
                    """,
                    {"names": concepts},
                )
                relationships = [
                    f"{r['from_name']} --{r['rel']}--> {r['to_label']}:{r['to_name']}"
                    for r in result
                ]
            except Exception as e:
                logger.warning("[graph] Relationship traversal failed: %s", e)

        parts = []
        if concepts:
            parts.append(f"Related concepts: {', '.join(concepts)}")
        if relationships:
            parts.append("Graph relationships:\n" + "\n".join(f"  - {r}" for r in relationships))

        answer = "\n\n".join(parts) if parts else "No graph context found for this query."
        elapsed = (time.perf_counter() - started) * 1000

        return AgentResult(
            agent_name=self.name,
            answer=answer,
            confidence=0.8 if concepts else 0.2,
            latency_ms=round(elapsed, 2),
        )


# ---------------------------------------------------------------------------
# Research Agent — Deep multi-source synthesis
# ---------------------------------------------------------------------------

class ResearchAgent(AgentBase):
    """Performs deep research using extended evidence retrieval and structured synthesis."""

    name = "research"
    description = "Deep multi-source research with structured reports and cross-reference analysis."

    async def process(
        self,
        query: str,
        evidence: list[EvidencePacketResponse],
        mode: str = "quick",
    ) -> AgentResult:
        from services.rlm_service import generate_research_report

        started = time.perf_counter()
        result = await generate_research_report(query, evidence)
        elapsed = (time.perf_counter() - started) * 1000

        return AgentResult(
            agent_name=self.name,
            answer=result.answer,
            cited_references=result.cited_references,
            evidence_used=evidence,
            model_used=result.model_used,
            latency_ms=round(elapsed, 2),
        )


# ---------------------------------------------------------------------------
# Upload Agent — User-uploaded document analysis
# ---------------------------------------------------------------------------

class UploadAgent(AgentBase):
    """Handles queries against user-uploaded documents."""

    name = "upload"
    description = "Searches and analyzes user-uploaded documents, providing citations from non-canonical sources."
    domain_filter = ["upload"]

    async def process(
        self,
        query: str,
        evidence: list[EvidencePacketResponse],
        mode: str = "quick",
    ) -> AgentResult:
        started = time.perf_counter()
        upload_evidence = [
            ep for ep in evidence
            if ep.source_type == "UPLOAD"
        ]

        if not upload_evidence:
            return AgentResult(
                agent_name=self.name,
                answer="No user-uploaded documents matched this query.",
                model_used="none",
                latency_ms=round((time.perf_counter() - started) * 1000, 2),
            )

        from services.rlm_service import generate_answer
        result = await generate_answer(query, upload_evidence, mode)
        elapsed = (time.perf_counter() - started) * 1000

        return AgentResult(
            agent_name=self.name,
            answer=result.answer,
            cited_references=result.cited_references,
            evidence_used=upload_evidence,
            model_used=result.model_used,
            latency_ms=round(elapsed, 2),
            warnings=["Answers from user uploads — not verified canonical sources"],
        )


# ---------------------------------------------------------------------------
# Register all infrastructure agents
# ---------------------------------------------------------------------------

register_agent(CitationAgent())
register_agent(GraphAgent())
register_agent(ResearchAgent())
register_agent(UploadAgent())
