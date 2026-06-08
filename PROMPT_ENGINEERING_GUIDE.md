# PROMPT_ENGINEERING_GUIDE.md

# VEDA AI Development Prompt Engineering Guide

Version: 1.0

Status: Authoritative AI Development Framework

Priority: Critical

Owner: Architecture Team

---

# Purpose

Defines how AI coding agents must build VEDA.

This document ensures:

* Consistent code generation
* Architecture compliance
* Predictable outputs
* Agent coordination
* Reduced hallucination
* Reduced rework

This is the operational guide for all AI development agents.

---

# Core Principle

AI should never invent architecture.

AI should implement architecture.

---

# Golden Rule

Before generating code:

Read architecture.

Before modifying code:

Read architecture.

Before proposing architecture:

Read architecture.

---

# Architecture Authority Order

Always follow this order.

```text
1. PRODUCT_VISION.md

2. SYSTEM_ARCHITECTURE.md

3. IMPLEMENTATION_PLAN.md

4. DATA_MODEL.md

5. KNOWLEDGE_GRAPH.md

6. RLM_ARCHITECTURE.md

7. API_SPEC.md

8. AGENTS.md

9. UX_ARCHITECTURE.md

10. DESIGN_SYSTEM.md
```

---

# Non-Negotiable Rule

If generated code conflicts with architecture:

Architecture wins.

Always.

---

# Development Philosophy

Build from foundations upward.

Never build top-down.

---

# Correct Order

```text
Infrastructure

↓

Data Layer

↓

Knowledge Layer

↓

Retrieval Layer

↓

Agents

↓

API Layer

↓

Frontend

↓

Optimization
```

---

# Context Loading Strategy

Never load the entire repository.

Load only required documents.

---

# Example

Building Neo4j

Load:

```text
SYSTEM_ARCHITECTURE.md

KNOWLEDGE_GRAPH.md

DATA_MODEL.md

RELATIONSHIP_SCHEMA.md
```

---

Building Search

Load:

```text
SEARCH_ARCHITECTURE.md

RLM_ARCHITECTURE.md

API_SPEC.md
```

---

Building Frontend

Load:

```text
UX_ARCHITECTURE.md

DESIGN_SYSTEM.md

FRONTEND_ARCHITECTURE.md
```

---

# Phase 0

Repository Bootstrap

Goal

Create project skeleton only.

---

Prompt

```text
Read:

MONOREPO_ARCHITECTURE.md

DEV_ENV.md

QUALITY_STANDARDS.md

Generate:

Folder Structure
Package Definitions
Workspace Configuration

Do not generate business logic.
```

---

Success Criteria

```text
Repository compiles

CI passes

No application logic
```

---

# Phase 1

Infrastructure

Goal

Provision infrastructure.

---

Read

```text
INFRASTRUCTURE_ARCHITECTURE.md

DEPLOYMENT_ARCHITECTURE.md

PRODUCTION.md
```

---

Generate

```text
Docker

Terraform

Kubernetes

Secrets Management

Monitoring
```

---

Forbidden

```text
Frontend

Agents

RLM
```

---

# Phase 2

Database Layer

Goal

Build persistence.

---

Read

```text
DATA_MODEL.md
```

---

Generate

```text
PostgreSQL Schema

Neo4j Schema

Qdrant Collections

Elasticsearch Indexes

Migrations
```

---

Success Criteria

```text
All databases start

Migrations succeed

Tests pass
```

---

# Phase 3

Knowledge Layer

Goal

Implement ontology.

---

Read

```text
KNOWLEDGE_GRAPH.md

CONCEPT_ONTOLOGY.md

PERSON_ONTOLOGY.md

TRADITION_ONTOLOGY.md

RELATIONSHIP_SCHEMA.md
```

---

Generate

```text
Node Models

Edge Models

Ontology Services

Validation Services
```

---

# Phase 4

Ingestion

Goal

Build ingestion pipeline.

---

Read

```text
INGESTION_PIPELINE.md

SCRIPTURE_INGESTION_STANDARDS.md
```

---

Generate

```text
PDF Parsing

EPUB Parsing

OCR

Chunking

Metadata Extraction

Graph Builders
```

---

Success Criteria

```text
Upload scripture

Graph populated

Vectors generated

Searchable
```

---

# Phase 5

Search Layer

Goal

Hybrid retrieval.

---

Read

```text
SEARCH_ARCHITECTURE.md

RLM_ARCHITECTURE.md
```

---

Generate

```text
Vector Search

Graph Search

Hybrid Search

Re-ranking
```

---

# Phase 6

Citation Layer

Goal

Trust engine.

---

Read

```text
CITATION_ENGINE.md

SOURCE_HIERARCHY.md
```

---

Generate

```text
Citation Validator

Confidence Engine

Evidence Matching

Source Ranking
```

---

Success Criteria

```text
No uncited responses
```

---

# Phase 7

Reasoning Layer

Goal

Answer generation.

---

Read

```text
REASONING_ENGINE.md

MASTER_SYSTEM_PROMPT.md
```

---

Generate

```text
Reasoning Pipeline

Evidence Synthesis

Answer Generation
```

---

# Phase 8

Agent Layer

Goal

Multi-agent system.

---

Read

```text
AGENTS.md

veda_agent.md

citation_agent.md

graph_agent.md
```

---

Generate

```text
Agent Runtime

Message Bus

Orchestrator

Agent Registry
```

---

# Phase 9

API Layer

Goal

Expose functionality.

---

Read

```text
API_SPEC.md
```

---

Generate

```text
REST APIs

WebSocket APIs

Streaming APIs
```

---

# Phase 10

Frontend

Goal

User experience.

---

Read

```text
UX_ARCHITECTURE.md

DESIGN_SYSTEM.md

FRONTEND_ARCHITECTURE.md
```

---

Generate

```text
Next.js Application

Knowledge Map

Chat

Research Workspace

Daily Verse
```

---

# Phase 11

Mobile

Goal

Mobile platform.

---

Read

```text
MOBILE_APP.md
```

---

Generate

```text
React Native

Offline Support

Push Notifications

Widgets
```

---

# Phase 12

Optimization

Goal

Production readiness.

---

Read

```text
OBSERVABILITY.md

COST_OPTIMIZATION.md

SRE_RUNBOOK.md
```

---

Generate

```text
Caching

Monitoring

Rate Limiting

Performance Improvements
```

---

# Prompt Template

Always use.

```text
Task:
<specific task>

Read:
<documents>

Constraints:
<rules>

Output:
<deliverables>

Validation:
<success criteria>
```

---

# Example Prompt

```text
Task:

Build Neo4j ontology models.

Read:

DATA_MODEL.md
KNOWLEDGE_GRAPH.md
RELATIONSHIP_SCHEMA.md

Constraints:

No business logic.

No API generation.

Output:

TypeScript models.

Validation:

Schema matches ontology.
```

---

# Agent Prompting Rules

Never ask:

```text
Build VEDA
```

---

Always ask:

```text
Build Neo4j ontology models
```

---

Bad Prompts

```text
Create backend
```

---

Good Prompts

```text
Generate PostgreSQL migrations
for scripture storage using DATA_MODEL.md
```

---

# Context Window Strategy

Small Tasks

```text
1–3 documents
```

---

Medium Tasks

```text
3–6 documents
```

---

Large Tasks

```text
6–10 documents
```

---

Never load:

Entire repository.

---

# Validation Loop

After generation:

1. Compare against architecture
2. Compare against APIs
3. Run tests
4. Run linting
5. Run type checks
6. Review citations

---

# Code Review Prompt

```text
Review generated code.

Check:

Architecture compliance

Security

Performance

Type safety

Citation compliance

Return violations only.
```

---

# Anti-Hallucination Rules

AI must never:

```text
Invent endpoints

Invent schemas

Invent graph edges

Invent ontology types

Invent authority rules
```

---

AI must always:

```text
Reference architecture documents
```

---

# Definition Of Done

Feature complete only when:

```text
Architecture compliant

Tests passing

Documentation updated

Types validated

Observability added

Security reviewed
```

---

# Repository Constitution

When uncertain:

```text
Architecture > Code

Documentation > Assumptions

Evidence > Guessing

Citation > Confidence
```

---

# North Star Principle

AI agents do not design VEDA.

The architecture designs VEDA.

AI agents implement VEDA.

---

# Mission

This guide exists to ensure that every AI coding agent—from GPT-5.5 to Claude to future autonomous developers—produces code that converges toward a single coherent system rather than thousands of disconnected implementations.

The objective is not faster code generation.

The objective is architecture-preserving code generation at scale.
