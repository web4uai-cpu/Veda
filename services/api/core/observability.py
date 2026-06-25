"""
VEDA — Observability
=======================
In-memory metrics counters and structured logging utilities.
Lightweight — no external dependencies (Prometheus/OTel can be added later).
"""

from __future__ import annotations

import logging
import time
from collections import defaultdict
from dataclasses import dataclass, field

logger = logging.getLogger("veda.observability")


@dataclass
class _Metrics:
    """In-memory metrics counters. Thread-safe enough for async single-process."""

    request_count: int = 0
    error_count: int = 0
    status_counts: dict[int, int] = field(default_factory=lambda: defaultdict(int))
    endpoint_counts: dict[str, int] = field(default_factory=lambda: defaultdict(int))
    endpoint_latency_sum: dict[str, float] = field(default_factory=lambda: defaultdict(float))
    agent_invocations: dict[str, int] = field(default_factory=lambda: defaultdict(int))
    rate_limit_hits: int = 0
    started_at: float = field(default_factory=time.time)


metrics = _Metrics()


def record_request(path: str, status: int, duration_ms: float) -> None:
    """Record a completed request."""
    metrics.request_count += 1
    metrics.status_counts[status] += 1
    metrics.endpoint_counts[path] += 1
    metrics.endpoint_latency_sum[path] += duration_ms
    if status >= 500:
        metrics.error_count += 1


def record_agent_invocation(agent_name: str) -> None:
    metrics.agent_invocations[agent_name] += 1


def record_rate_limit_hit() -> None:
    metrics.rate_limit_hits += 1


def get_metrics_snapshot() -> dict:
    """Return current metrics for the /health/metrics endpoint."""
    uptime = time.time() - metrics.started_at

    top_endpoints = sorted(
        metrics.endpoint_counts.items(),
        key=lambda x: x[1],
        reverse=True,
    )[:10]

    avg_latencies = {}
    for path, total_ms in metrics.endpoint_latency_sum.items():
        count = metrics.endpoint_counts.get(path, 1)
        avg_latencies[path] = round(total_ms / count, 2)

    return {
        "uptime_seconds": round(uptime, 0),
        "total_requests": metrics.request_count,
        "total_errors": metrics.error_count,
        "error_rate": round(metrics.error_count / max(metrics.request_count, 1), 4),
        "rate_limit_hits": metrics.rate_limit_hits,
        "status_codes": dict(metrics.status_counts),
        "top_endpoints": dict(top_endpoints),
        "avg_latency_ms": avg_latencies,
        "agent_invocations": dict(metrics.agent_invocations),
    }
