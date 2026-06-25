"""
VEDA — Agent Router
======================
Multi-agent orchestration endpoints.
Routes queries through domain-specific agents with citation validation.
"""

from __future__ import annotations

import time

from fastapi import APIRouter

from agents.registry import AGENT_REGISTRY
from models.schemas import (
    AgentRequest,
    AgentResponse,
    AgentResultResponse,
    AgentListResponse,
)
from services.agent_service import orchestrate

router = APIRouter(prefix="/api/v1/agents", tags=["Agents"])


@router.post("/query", response_model=AgentResponse)
async def agent_query(request: AgentRequest):
    """Route a query through the agent orchestration system.

    Flow:
      1. Orchestrator classifies query → selects domain agent(s)
      2. Hybrid search retrieves evidence
      3. Domain agents generate grounded answers (parallel)
      4. Graph agent enriches context (if applicable)
      5. Citation agent validates all references (VETO authority)
      6. Responses merged with consensus scoring
    """
    result = await orchestrate(
        query=request.query,
        mode=request.mode,
        include_evidence=request.include_evidence,
        include_uploads=request.include_uploads,
    )

    return AgentResponse(
        query=result.query,
        answer=result.answer,
        agents_used=result.agents_used,
        agent_results=[
            AgentResultResponse(
                agent_name=ar.agent_name,
                answer=ar.answer,
                cited_references=ar.cited_references,
                confidence=ar.confidence,
                model_used=ar.model_used,
                latency_ms=ar.latency_ms,
                warnings=ar.warnings,
                vetoed=ar.vetoed,
                veto_reason=ar.veto_reason,
            )
            for ar in result.agent_results
        ],
        citations=result.citations,
        evidence=result.evidence,
        graph_context=result.graph_context,
        confidence=result.confidence,
        agent_agreement=result.agent_agreement,
        model_used=result.model_used,
        query_time_ms=result.query_time_ms,
        warnings=result.warnings,
        vetoed=result.vetoed,
        veto_reason=result.veto_reason,
    )


@router.get("/list", response_model=AgentListResponse)
async def list_agents():
    """List all available agents and their descriptions."""
    return AgentListResponse(
        agents=[
            {"name": agent.name, "description": agent.description}
            for agent in AGENT_REGISTRY.values()
        ]
    )
