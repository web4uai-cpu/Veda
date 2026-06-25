"""
VEDA — Agent Registry
========================
Central registry for all available agents. Agents self-register on import.
"""

from __future__ import annotations

from agents.base import AgentBase

AGENT_REGISTRY: dict[str, AgentBase] = {}


def register_agent(agent: AgentBase) -> AgentBase:
    """Register an agent instance in the global registry."""
    AGENT_REGISTRY[agent.name] = agent
    return agent


def get_agent(name: str) -> AgentBase | None:
    """Look up an agent by name."""
    return AGENT_REGISTRY.get(name)


def _register_all() -> None:
    """Import all agent modules so they self-register."""
    from agents import domain, infrastructure  # noqa: F401


_register_all()
