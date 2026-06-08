# SKILLS.md

# VEDA AI Skill Registry

Version: 1.0

Status: Authoritative Skill Definition

Priority: Critical

Owner: AI Systems Team

---

# Purpose

This document defines all cognitive skills available to AI agents inside VEDA.

Skills are reusable reasoning capabilities.

Agents may invoke skills.

Skills are not agents.

Agents own domains.

Skills own capabilities.

---

# Skill Architecture

```text
Agent

↓

Skill

↓

Tool

↓

Result
```

Example

```text
Upanishad Agent

↓

Concept Analysis Skill

↓

Knowledge Graph Tool

↓

Explanation
```

---

# Skill Categories

1. Knowledge Skills

2. Retrieval Skills

3. Reasoning Skills

4. Research Skills

5. Graph Skills

6. Citation Skills

7. Sanskrit Skills

8. Upload Skills

---

# KNOWLEDGE SKILLS

## Concept Analysis

Purpose

Understand concepts.

Examples

```text
Atman

Brahman

Moksha

Dharma
```

Output

```text
Definition

Context

Relationships

Sources
```

---

## Scripture Analysis

Purpose

Analyze scripture passages.

Output

```text
Meaning

Context

References
```

---

## Commentary Analysis

Purpose

Interpret commentary sources.

Output

```text
Author

School

Position

Evidence
```

---

# RETRIEVAL SKILLS

## Hybrid Retrieval

Uses

```text
Neo4j

Qdrant

Elasticsearch
```

Purpose

Collect evidence.

---

## Graph Expansion

Purpose

Expand concept networks.

Example

```text
Moksha

↓

Atman

↓

Brahman

↓

Vedanta
```

---

## Source Discovery

Purpose

Locate authoritative sources.

---

# REASONING SKILLS

## Comparative Reasoning

Purpose

Compare traditions.

Examples

```text
Advaita vs Dvaita

Karma vs Dharma
```

---

## Conceptual Reasoning

Purpose

Understand relationships.

Example

```text
Atman ↔ Brahman
```

---

## Historical Reasoning

Purpose

Build timelines.

---

## Educational Reasoning

Purpose

Explain concepts simply.

---

## Scholar Reasoning

Purpose

Produce advanced explanations.

---

# RESEARCH SKILLS

## Evidence Synthesis

Purpose

Combine multiple sources.

---

## Source Comparison

Purpose

Compare viewpoints.

---

## Research Report Generation

Purpose

Generate structured reports.

---

## Contradiction Analysis

Purpose

Handle conflicting interpretations.

---

# GRAPH SKILLS

## Concept Traversal

Purpose

Explore graph relationships.

---

## Path Discovery

Purpose

Find shortest meaningful paths.

---

## Relationship Ranking

Purpose

Determine strongest relationships.

---

## Ontology Navigation

Purpose

Move across knowledge domains.

---

# CITATION SKILLS

## Citation Validation

Purpose

Verify sources.

---

## Confidence Scoring

Purpose

Calculate reliability.

---

## Hallucination Detection

Purpose

Detect unsupported claims.

---

## Evidence Verification

Purpose

Match claim to source.

---

# SANSKRIT SKILLS

## Transliteration

Purpose

Convert scripts.

---

## Root Analysis

Purpose

Analyze Sanskrit roots.

---

## Grammar Analysis

Purpose

Analyze structure.

---

## Translation Comparison

Purpose

Compare translations.

---

# UPLOAD SKILLS

## Document Analysis

Purpose

Analyze uploaded documents.

---

## Concept Extraction

Purpose

Extract entities.

---

## Reference Detection

Purpose

Find scripture references.

---

## Graph Linking

Purpose

Connect uploads to graph.

---

# RESPONSE SKILLS

## Scholar Mode

Output

```text
Deep Analysis
```

---

## Beginner Mode

Output

```text
Simple Explanation
```

---

## Research Mode

Output

```text
Structured Report
```

---

# Skill Invocation Rules

1. Skills are reusable.

2. Skills are stateless.

3. Skills must be observable.

4. Skills cannot modify sources.

5. Skills cannot bypass citations.

---

# Skill Selection

Simple Questions

```text
Concept Analysis
```

---

Research Queries

```text
Evidence Synthesis

Comparative Reasoning
```

---

Graph Queries

```text
Concept Traversal
```

---

Upload Queries

```text
Document Analysis
```

---

# Future Skills

```text
Manuscript Analysis

Voice Understanding

Debate Simulation

Teaching Mode

Learning Path Generation
```

---

# Skill Mission

Skills provide reusable intelligence capabilities that can be shared across all agents, services, and workflows in VEDA.
