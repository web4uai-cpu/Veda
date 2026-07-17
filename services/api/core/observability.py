"""
VEDA — Observability
=======================
Metrics for the API:

- Prometheus counters/histograms (authoritative, multi-worker safe when
  PROMETHEUS_MULTIPROC_DIR is set) exposed at GET /metrics
- Legacy in-memory snapshot kept for GET /api/v1/health/metrics
  (per-process only — use Prometheus for real monitoring)
"""

from __future__ import annotations

import logging
import re
import time
from collections import defaultdict
from dataclasses import dataclass, field

logger = logging.getLogger("veda.observability")

# --- Prometheus (optional dependency; degrade gracefully if missing) ---

try:
    from prometheus_client import Counter, Histogram

    PROMETHEUS_AVAILABLE = True

    REQUESTS_TOTAL = Counter(
        "veda_http_requests_total",
        "Total HTTP requests",
        ["path", "status"],
    )
    REQUEST_LATENCY = Histogram(
        "veda_http_request_duration_seconds",
        "HTTP request latency in seconds",
        ["path"],
        buckets=(0.01, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0, 30.0),
    )
    AGENT_INVOCATIONS = Counter(
        "veda_agent_invocations_total",
        "Agent invocations",
        ["agent"],
    )
    RATE_LIMIT_HITS = Counter(
        "veda_rate_limit_hits_total",
        "Requests rejected by the rate limiter",
    )
except ImportError:  # prometheus_client not installed
    PROMETHEUS_AVAILABLE = False

# ULID path segments (e.g. /scriptures/scp_01ABC...) would explode label
# cardinality — collapse them to a placeholder.
_ID_SEGMENT = re.compile(r"/[a-z]{3}_[0-9A-Za-z]{10,}")
_NUM_SEGMENT = re.compile(r"/\d+")


def normalize_path(path: str) -> str:
    path = _ID_SEGMENT.sub("/{id}", path)
    path = _NUM_SEGMENT.sub("/{n}", path)
    return path


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

    if PROMETHEUS_AVAILABLE:
        norm = normalize_path(path)
        REQUESTS_TOTAL.labels(path=norm, status=str(status)).inc()
        REQUEST_LATENCY.labels(path=norm).observe(duration_ms / 1000.0)


def record_agent_invocation(agent_name: str) -> None:
    metrics.agent_invocations[agent_name] += 1
    if PROMETHEUS_AVAILABLE:
        AGENT_INVOCATIONS.labels(agent=agent_name).inc()


def record_rate_limit_hit() -> None:
    metrics.rate_limit_hits += 1
    if PROMETHEUS_AVAILABLE:
        RATE_LIMIT_HITS.inc()


def render_prometheus() -> tuple[bytes, str]:
    """Render metrics in Prometheus exposition format.

    Uses multiprocess collection when PROMETHEUS_MULTIPROC_DIR is set
    (required for uvicorn --workers > 1).
    """
    import os

    from prometheus_client import (
        CONTENT_TYPE_LATEST,
        CollectorRegistry,
        REGISTRY,
        generate_latest,
        multiprocess,
    )

    if os.environ.get("PROMETHEUS_MULTIPROC_DIR"):
        registry = CollectorRegistry()
        multiprocess.MultiProcessCollector(registry)
        return generate_latest(registry), CONTENT_TYPE_LATEST
    return generate_latest(REGISTRY), CONTENT_TYPE_LATEST


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
