"""
VEDA — Agent System
=====================
Domain-specific and infrastructure agents for the VEDA Knowledge OS.

Architecture:
    Orchestrator → classifies query → routes to domain agent(s)
    Domain agents: Veda, Upanishad, Purana, Vedanta, Sanskrit
    Infrastructure agents: Graph, Citation, Research, Upload
    Citation Agent has VETO authority over all responses.
"""

from agents.base import AgentBase, AgentResult
from agents.registry import AGENT_REGISTRY, get_agent

__all__ = ["AgentBase", "AgentResult", "AGENT_REGISTRY", "get_agent"]
