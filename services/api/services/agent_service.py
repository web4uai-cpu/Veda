"""
VEDA — Agent Orchestration Service
======================================
Routes queries through the agent system:
  1. Orchestrator classifies query → selects domain agent(s)
  2. Search retrieves evidence
  3. Domain agent(s) generate answers in parallel
  4. Graph agent enriches context (if applicable)
  5. Citation agent validates all citations (VETO authority)
  6. Results are merged with consensus scoring
"""

from __future__ import annotations

import asyncio
import logging
import time
from dataclasses import dataclass, field

from agents.base import AgentResult
from agents.registry import get_agent
from agents.orchestrator import classify_query, needs_graph_enrichment, needs_research_depth
from agents.infrastructure import CitationAgent
from models.schemas import (
    EvidencePacketResponse,
    SearchRequest,
    SearchResponse,
    CitationResponse,
)
from services.search_service import search_evidence
from services.citation_service import resolve_scripture_citation_by_reference

logger = logging.getLogger("veda.services.agent")


@dataclass
class OrchestratedResult:
    """Final output after multi-agent orchestration."""

    query: str
    answer: str
    agents_used: list[str] = field(default_factory=list)
    agent_results: list[AgentResult] = field(default_factory=list)
    citations: list[CitationResponse] = field(default_factory=list)
    evidence: list[EvidencePacketResponse] = field(default_factory=list)
    graph_context: str = ""
    confidence: float = 0.0
    agent_agreement: float = 1.0
    model_used: str = ""
    query_time_ms: float = 0.0
    warnings: list[str] = field(default_factory=list)
    vetoed: bool = False
    veto_reason: str = ""


async def orchestrate(
    query: str,
    mode: str = "quick",
    include_evidence: bool = True,
    include_uploads: bool = False,
) -> OrchestratedResult:
    """Run a query through the full agent pipeline."""
    started = time.perf_counter()
    warnings: list[str] = []

    # 1. Classify query → select agents
    agent_names = classify_query(query)
    logger.info("Query classified → agents: %s", agent_names)

    # 2. Retrieve evidence
    search_limit = 20 if needs_research_depth(query, mode) else 15 if mode == "scholar" else 10
    search_req = SearchRequest(
        query=query,
        mode="research" if needs_research_depth(query, mode) else mode,
        limit=search_limit,
        include_uploads=include_uploads,
    )
    search_result = await search_evidence(search_req)
    warnings.extend(search_result.warnings)
    evidence = search_result.results

    # 3. Run domain agents in parallel
    tasks = []
    for name in agent_names:
        agent = get_agent(name)
        if agent:
            tasks.append(agent.process(query, evidence, mode))
        else:
            warnings.append(f"Agent '{name}' not found in registry")

    # Optionally run graph agent in parallel
    graph_context = ""
    if needs_graph_enrichment(query):
        graph_agent = get_agent("graph")
        if graph_agent:
            tasks.append(graph_agent.process(query, evidence, mode))

    agent_results: list[AgentResult] = []
    if tasks:
        results = await asyncio.gather(*tasks, return_exceptions=True)
        for r in results:
            if isinstance(r, AgentResult):
                agent_results.append(r)
                if r.agent_name == "graph":
                    graph_context = r.answer
            elif isinstance(r, Exception):
                logger.error("Agent task failed: %s", r)
                warnings.append(f"Agent error: {r}")

    # 4. Merge agent answers
    domain_results = [r for r in agent_results if r.agent_name != "graph"]
    if not domain_results:
        elapsed = (time.perf_counter() - started) * 1000
        return OrchestratedResult(
            query=query,
            answer="No agents could process this query.",
            warnings=warnings,
            evidence=evidence if include_evidence else [],
            query_time_ms=round(elapsed, 2),
        )

    primary = domain_results[0]
    merged_answer = primary.answer

    if len(domain_results) > 1:
        supplementary = []
        for r in domain_results[1:]:
            if r.answer and r.answer != primary.answer:
                supplementary.append(f"\n\n**[{r.agent_name.title()} perspective]**\n{r.answer}")
        if supplementary:
            merged_answer = f"**[{primary.agent_name.title()} perspective]**\n{primary.answer}" + "".join(supplementary)

    if graph_context and graph_context != "No graph context found for this query.":
        merged_answer += f"\n\n---\n**Knowledge Graph Context:**\n{graph_context}"

    # 5. Citation validation (VETO authority)
    citation_agent = get_agent("citation")
    citation_result = None
    if isinstance(citation_agent, CitationAgent):
        citation_result = await citation_agent.validate_answer(merged_answer, evidence)
        warnings.extend(citation_result.warnings)

    # 6. Verify cited references
    all_refs: list[str] = []
    for r in domain_results:
        all_refs.extend(r.cited_references)
    all_refs = list(dict.fromkeys(all_refs))

    verified_citations: list[CitationResponse] = []
    for ref in all_refs:
        citation = await resolve_scripture_citation_by_reference(ref)
        if citation:
            verified_citations.append(citation)
        else:
            warnings.append(f"[{ref}] could not be verified")

    # 7. Compute confidence
    agent_agreement = 1.0
    if citation_result:
        agent_agreement = citation_result.confidence

    avg_citation_confidence = 0.0
    if verified_citations:
        avg_citation_confidence = sum(c.confidence for c in verified_citations) / len(verified_citations)
    elif evidence:
        avg_citation_confidence = sum(
            ep.citation.confidence for ep in evidence if ep.citation
        ) / max(len(evidence), 1)

    final_confidence = round(avg_citation_confidence * agent_agreement, 4)

    # 8. Check for veto
    vetoed = False
    veto_reason = ""
    if citation_result and citation_result.vetoed:
        vetoed = True
        veto_reason = citation_result.veto_reason
        warnings.append(f"CITATION VETO: {veto_reason}")
        merged_answer = (
            f"⚠️ **Citation Warning:** {veto_reason}\n\n"
            f"The following answer contains references that could not be fully verified:\n\n"
            f"{merged_answer}"
        )

    elapsed = (time.perf_counter() - started) * 1000

    return OrchestratedResult(
        query=query,
        answer=merged_answer,
        agents_used=[r.agent_name for r in agent_results],
        agent_results=agent_results,
        citations=verified_citations,
        evidence=evidence if include_evidence else [],
        graph_context=graph_context,
        confidence=final_confidence,
        agent_agreement=agent_agreement,
        model_used=primary.model_used,
        query_time_ms=round(elapsed, 2),
        warnings=warnings,
        vetoed=vetoed,
        veto_reason=veto_reason,
    )
