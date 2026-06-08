# CLAUDE.md

# VEDA AI Development Constitution

Version: 1.0

Status: Mandatory

Priority: Highest

Applies To:

* Claude Code
* GPT-5.5
* Cursor
* Cline
* RooCode
* Aider
* OpenHands
* Continue
* Copilot Workspace

This document governs all code generation inside the VEDA repository.

---

# Mission

Build the world's most trusted knowledge platform for Sanatan Dharma.

VEDA is:

* Knowledge Graph Platform
* Research Platform
* Scripture Intelligence System
* Citation-First AI System
* Multi-Agent Knowledge Network

VEDA is not:

* Generic Chatbot
* AI Wrapper
* Traditional RAG Application

---

# Before Writing Code

Read the following files in order:

1.

PRODUCT_VISION.md

---

2.

ROADMAP.md

---

3.

SYSTEM_ARCHITECTURE.md

---

4.

KNOWLEDGE_GRAPH.md

---

5.

DATA_MODEL.md

---

6.

RLM_ARCHITECTURE.md

---

7.

AGENTS.md

---

8.

API_SPEC.md

---

9.

INGESTION_PIPELINE.md

---

10.

CITATION_ENGINE.md

---

11.

REASONING_ENGINE.md

---

12.

MASTER_SYSTEM_PROMPT.md

---

13.

UX_ARCHITECTURE.md

---

14.

DESIGN_SYSTEM.md

---

15.

FRONTEND_ARCHITECTURE.md

---

16.

MONOREPO_ARCHITECTURE.md

---

17.

IMPLEMENTATION_PLAN.md

---

# Authority Hierarchy

When documents conflict:

Priority Order

```text
IMPLEMENTATION_PLAN

↓

MONOREPO_ARCHITECTURE

↓

SYSTEM_ARCHITECTURE

↓

DATA_MODEL

↓

API_SPEC

↓

Everything Else
```

Never invent architecture.

Always follow documented architecture.

---

# Repository Structure

Never create new top-level folders.

Allowed

```text
apps/

services/

packages/

infrastructure/

tools/

docs/
```

---

Forbidden

```text
backend/

frontend/

misc/

temp/

new-version/
```

---

# Architectural Rules

Rule 1

Feature-first organization.

---

Rule 2

Domain-driven design.

---

Rule 3

Service boundaries are mandatory.

---

Rule 4

No cross-service database access.

---

Rule 5

Communication through APIs/events only.

---

# Build Order

Always follow:

```text
Foundation

↓

Data

↓

Ingestion

↓

Graph

↓

Search

↓

Citation

↓

RLM

↓

Agents

↓

API

↓

Frontend
```

Never build later phases first.

---

# Source Of Truth

Knowledge

↓

Graph

↓

Search

↓

Citation

↓

Reasoning

↓

UI

Never reverse this order.

---

# Coding Standards

Language

```text
TypeScript
```

Required

```text
strict=true
```

---

No

```text
any
```

unless absolutely unavoidable.

---

Prefer

```text
unknown
```

over

```text
any
```

---

# Function Rules

Prefer

Small Functions

Single Responsibility

Pure Logic

---

Maximum

```text
100 lines
```

per function.

---

# File Rules

Maximum

```text
500 lines
```

per file.

Preferred

```text
<300 lines
```

---

Split aggressively.

---

# Component Rules

Maximum

```text
250 lines
```

per React component.

---

Large screens must be composed.

Never become monolithic.

---

# Naming Rules

Use

```text
PascalCase
```

for:

```text
Components

Classes

Types
```

---

Use

```text
camelCase
```

for:

```text
Functions

Variables
```

---

Use

```text
UPPER_SNAKE_CASE
```

for:

```text
Constants
```

---

# Type Rules

Every API must have:

```text
Request Type

Response Type

Validation Schema
```

---

No untyped API responses.

---

# Validation Rules

Use

```text
Zod
```

for:

* API Inputs
* Forms
* Environment Variables

---

Never trust user input.

---

# API Rules

Follow

API_SPEC.md

exactly.

---

Do not invent endpoints.

---

Do not rename fields.

---

Do not alter contracts.

---

# Database Rules

Follow

DATA_MODEL.md

exactly.

---

Never:

* Rename columns
* Rename tables
* Change IDs

without updating documentation.

---

# Search Rules

Follow

RLM_ARCHITECTURE.md

---

All retrieval must support:

```text
Keyword

Semantic

Graph
```

---

No retrieval shortcuts.

---

# Citation Rules

Follow

CITATION_ENGINE.md

---

No citation

↓

No answer

---

All scripture claims require references.

---

# Agent Rules

Follow

AGENTS.md

---

Agents must:

* Be deterministic
* Be observable
* Be traceable

---

No hidden agent state.

---

# Frontend Rules

Follow

FRONTEND_ARCHITECTURE.md

DESIGN_SYSTEM.md

UX_ARCHITECTURE.md

---

Never build pages directly.

Use feature modules.

---

# Next.js Rules

Prefer:

```text
Server Components
```

---

Use Client Components only when required.

---

Use:

```text
TanStack Query
```

for server state.

---

Use:

```text
Zustand
```

for UI state.

---

Never use Zustand as a database cache.

---

# Graph Rules

Neo4j is authoritative.

Graph relationships are first-class citizens.

---

Do not duplicate graph logic in frontend.

---

Graph expansion belongs in graph-service.

---

# Upload Rules

User uploads:

* Are personal
* Are isolated
* Cannot override scripture

---

Always preserve source lineage.

---

# Security Rules

Never expose:

* Secrets
* Internal APIs
* Service credentials

---

Use:

```text
Environment Variables
```

for configuration.

---

Validate all inputs.

---

# Testing Requirements

Every feature requires:

Unit Tests

Integration Tests

Type Safety

---

Critical Systems Require:

E2E Tests

---

Critical Systems

```text
Search

Citation

Graph

RLM

Agents
```

---

# Observability Rules

Every service must expose:

```text
Health

Metrics

Tracing

Logging
```

---

Every request requires:

```text
request_id
```

---

Every agent execution requires:

```text
trace_id
```

---

# Performance Rules

API

```text
<500ms
```

Target

---

Search

```text
<1 second
```

Target

---

Graph Expansion

```text
<1 second
```

Target

---

Page Load

```text
<2.5 seconds
```

Target

---

# Accessibility Rules

All UI must satisfy:

```text
WCAG AA
```

Minimum.

---

# Documentation Rules

Every major feature requires:

```text
README.md
```

containing:

* Purpose
* Architecture
* API Usage
* Tests
* Examples

---

# Forbidden Practices

Never:

* Hardcode secrets
* Use any everywhere
* Create giant files
* Bypass APIs
* Bypass citation layer
* Mix service responsibilities
* Build undocumented architecture
* Create duplicate domain models

---

# AI Agent Workflow

Before coding

```text
Read Docs

↓

Understand Domain

↓

Create Plan

↓

Generate Code

↓

Generate Tests

↓

Validate Types

↓

Validate Architecture
```

---

Never skip planning.

---

# Pull Request Rules

Every generated PR must include:

1. Summary

2. Files Changed

3. Architectural Impact

4. Tests Added

5. Risks

---

# Code Generation Priority

When uncertain:

1.

Correctness

↓

2.

Maintainability

↓

3.

Scalability

↓

4.

Performance

↓

5.

Convenience

---

# VEDA Development Principles

Knowledge before intelligence.

Citation before reasoning.

Graph before explanation.

Architecture before features.

Quality before speed.

Trust before convenience.

---

# Final Directive

Do not optimize for generating code quickly.

Optimize for generating code that remains maintainable, scalable, and trustworthy five years from now.

Every file should move VEDA closer to becoming the most authoritative knowledge platform for Sanatan Dharma ever created.

When uncertain:

Follow the architecture.

When still uncertain:

Prefer simplicity.

When still uncertain:

Do not invent.
