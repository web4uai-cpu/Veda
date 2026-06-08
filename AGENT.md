# AGENTS.md

# VEDA Multi-Agent Architecture

Version: 1.0

Status: Authoritative Agent Specification

Owner: AI Systems Team

---

# Purpose

This document defines:

* Agent Architecture
* Agent Responsibilities
* Message Contracts
* Tool Access
* Context Rules
* Memory Rules
* Communication Protocols
* Failure Handling

All AI agents must follow this specification.

---

# Core Philosophy

Agents do not replace retrieval.

Agents do not replace the knowledge graph.

Agents do not create truth.

Agents interpret retrieved evidence.

Truth comes from:

1. Canonical Sources
2. Verified Commentaries
3. Verified Metadata
4. Knowledge Graph

Agents provide reasoning only.

---

# Agent Topology

```text
User

↓

Orchestrator Agent

↓

──────────────────────────

Veda Agent

Upanishad Agent

Purana Agent

Vedanta Agent

Sanskrit Agent

Graph Agent

Citation Agent

Research Agent

Upload Agent

──────────────────────────

↓

Response Composer

↓

User
```

---

# Agent Lifecycle

Every request follows:

```text
Receive

↓

Analyze

↓

Retrieve

↓

Reason

↓

Validate

↓

Respond
```

---

# Agent Categories

## Domain Agents

Knowledge experts.

Examples:

* Veda Agent
* Purana Agent

---

## Infrastructure Agents

Platform experts.

Examples:

* Graph Agent
* Citation Agent

---

## User Agents

User-focused agents.

Examples:

* Upload Agent
* Research Agent

---

# Orchestrator Agent

Role

Central coordinator.

Responsibilities

* Intent detection
* Agent selection
* Task distribution
* Conflict resolution
* Response assembly

The orchestrator never answers questions directly.

---

# Orchestrator Workflow

```text
User Query

↓

Intent Detection

↓

Agent Selection

↓

Task Dispatch

↓

Result Collection

↓

Validation

↓

Response Composer
```

---

# Veda Agent

Domain

* Rigveda
* Yajurveda
* Samaveda
* Atharvaveda

Responsibilities

* Vedic references
* Vedic concepts
* Mantra context

Allowed Sources

* Canonical Vedas
* Approved Vedic Commentaries

Forbidden

* Generating unsupported interpretations

---

# Upanishad Agent

Domain

* Major Upanishads
* Minor Upanishads

Responsibilities

* Atman
* Brahman
* Liberation
* Self-Knowledge

Primary Goal

Explain metaphysical concepts.

---

# Purana Agent

Domain

* Mahapuranas
* Upapuranas

Responsibilities

* Stories
* Symbolism
* Mythological Context

Primary Goal

Narrative understanding.

---

# Vedanta Agent

Domain

* Advaita
* Dvaita
* Vishishtadvaita
* Bhedabheda

Responsibilities

* Compare schools
* Explain interpretations
* Highlight disagreements

Rule

Never present one school as universal truth.

---

# Sanskrit Agent

Domain

Language understanding.

Responsibilities

* Transliteration
* Grammar
* Root Analysis
* Word Meaning

Output Example

```json
{
  "word":"Atman",
  "root":"",
  "meaning":"Self"
}
```

---

# Graph Agent

Domain

Knowledge Graph.

Responsibilities

* Graph Traversal
* Relationship Discovery
* Concept Expansion

Tools

Neo4j

Only.

---

# Citation Agent

Domain

Evidence verification.

Responsibilities

* Source validation
* Reference verification
* Confidence scoring

Authority

May reject answers.

---

# Research Agent

Domain

Long-form analysis.

Responsibilities

* Research Reports
* Comparative Analysis
* Source Aggregation

Output

Structured reports.

---

# Upload Agent

Domain

User knowledge.

Responsibilities

* Analyze uploads
* Extract metadata
* Link concepts
* Build personal graph

Rule

User uploads never become canonical.

---

# Response Composer

Purpose

Merge agent outputs.

Responsibilities

* Remove duplicates
* Build final structure
* Format citations

Output Template

```text
Summary

Evidence

Commentaries

Related Concepts

Sources

Confidence
```

---

# Agent Contracts

All agents return the same structure.

Schema

```json
{
  "agent":"veda_agent",
  "status":"success",
  "confidence":0.94,
  "findings":[],
  "citations":[],
  "warnings":[]
}
```

---

# Agent States

Valid States

```text
pending

running

completed

failed

timeout
```

---

# Message Protocol

Every message contains:

```json
{
  "task_id":"",
  "agent":"",
  "request_type":"",
  "payload":{}
}
```

---

# Response Protocol

```json
{
  "task_id":"",
  "agent":"",
  "status":"",
  "result":{},
  "citations":[]
}
```

---

# Tool Permissions

## Veda Agent

Allowed

```text
Qdrant

Elasticsearch
```

Forbidden

```text
User Uploads
```

---

# Upanishad Agent

Allowed

```text
Qdrant

Neo4j
```

---

# Purana Agent

Allowed

```text
Qdrant

Neo4j
```

---

# Graph Agent

Allowed

```text
Neo4j
```

Only.

---

# Citation Agent

Allowed

```text
PostgreSQL

Neo4j

Qdrant
```

Read-only.

---

# Upload Agent

Allowed

```text
Upload Storage

Qdrant

Neo4j
```

---

# Context Window Strategy

Not all agents need full context.

---

# Small Context

```text
2k–4k tokens
```

Agents

* Citation
* Graph

---

# Medium Context

```text
8k–16k tokens
```

Agents

* Veda
* Purana
* Upanishad

---

# Large Context

```text
32k–128k tokens
```

Agents

* Research
* Upload

---

# Memory Architecture

Agents are stateless.

No long-term memory.

---

Persistent Memory Stored In

PostgreSQL

---

Memory Categories

```text
User Preferences

Research History

Bookmarks

Collections

Notes
```

---

# Conflict Resolution

Example

```text
Advaita

↓

Atman = Brahman

Dvaita

↓

Atman ≠ Brahman
```

Resolution

Both returned.

No forced merge.

---

# Confidence Model

Calculation

```text
Source Confidence

+

Citation Quality

+

Agent Agreement

+

Graph Support
```

Range

```text
0.0–1.0
```

---

# Failure Handling

## Timeout

Agent does not respond.

Action

```text
Mark Timeout

Continue Workflow
```

---

## Retrieval Failure

Action

```text
Fallback Search
```

---

## Citation Failure

Action

```text
Block Response
```

---

## Graph Failure

Action

```text
Use Retrieval Only
```

---

# Hallucination Prevention

Rule 1

No source

No claim.

---

Rule 2

No citation

No answer.

---

Rule 3

No evidence

Return uncertainty.

---

Rule 4

Contradictory evidence

Show multiple views.

---

# Research Workflow

```text
Question

↓

Orchestrator

↓

Graph Agent

↓

Domain Agents

↓

Research Agent

↓

Citation Agent

↓

Composer

↓

Report
```

---

# Upload Workflow

```text
Upload

↓

Upload Agent

↓

Concept Extraction

↓

Graph Linking

↓

Embedding

↓

Indexing

↓

Available For Retrieval
```

---

# Agent Observability

Track

```text
Latency

Failure Rate

Citation Accuracy

Agent Agreement

Retrieval Quality
```

---

# Future Agents

Planned

* Manuscript Agent
* Debate Agent
* Sanskrit Tutor Agent
* Dharma Teacher Agent
* Temple Knowledge Agent
* Festival Agent
* Audio Chant Agent

---

# Non-Negotiable Rules

1. Agents never invent scripture.

2. Agents never create citations.

3. Agents never modify canonical sources.

4. Citation Agent has veto authority.

5. Graph Agent owns relationships.

6. Upload Agent owns user documents.

7. Orchestrator controls execution.

8. Every answer must be traceable.

---

# Agent Mission

The VEDA Agent System exists to transform retrieved knowledge into trustworthy understanding.

Agents do not generate truth.

Agents reveal, connect, compare, validate, and explain truth that already exists within the VEDA Knowledge Network.
