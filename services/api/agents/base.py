"""
VEDA — Agent Base Class
=========================
Abstract base for all VEDA agents. Every agent is stateless and operates
on evidence packets retrieved by the search layer.
"""

from __future__ import annotations

import logging
import time
from abc import ABC, abstractmethod
from dataclasses import dataclass, field

from models.schemas import EvidencePacketResponse, SearchRequest, SearchResponse

logger = logging.getLogger("veda.agents")


@dataclass
class AgentResult:
    """Output from a single agent invocation."""

    agent_name: str
    answer: str
    cited_references: list[str] = field(default_factory=list)
    confidence: float = 0.0
    evidence_used: list[EvidencePacketResponse] = field(default_factory=list)
    model_used: str = ""
    latency_ms: float = 0.0
    warnings: list[str] = field(default_factory=list)
    vetoed: bool = False
    veto_reason: str = ""


class AgentBase(ABC):
    """Abstract base class for all VEDA agents.

    Every agent is STATELESS — no instance variables persist between calls.
    Agents receive evidence and produce grounded answers.
    """

    name: str = "base"
    description: str = ""
    domain_filter: list[str] = []

    @abstractmethod
    async def process(
        self,
        query: str,
        evidence: list[EvidencePacketResponse],
        mode: str = "quick",
    ) -> AgentResult:
        """Process a query with the given evidence and return a result."""
        ...

    def filter_evidence(
        self,
        evidence: list[EvidencePacketResponse],
    ) -> list[EvidencePacketResponse]:
        """Filter evidence to this agent's domain. Override for custom logic."""
        if not self.domain_filter:
            return evidence
        return [
            ep for ep in evidence
            if any(kw in (ep.title or "").lower() or kw in (ep.content or "").lower()
                   for kw in self.domain_filter)
        ] or evidence

    def build_search_request(self, query: str, mode: str = "quick") -> SearchRequest:
        """Build a search request tuned to this agent's domain."""
        return SearchRequest(
            query=query,
            mode=mode,
            limit=15 if mode in ("scholar", "research") else 10,
        )
