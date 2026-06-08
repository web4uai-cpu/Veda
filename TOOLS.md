# TOOLS.md

# VEDA Tool Registry

Version: 1.0

Status: Authoritative Tool Definition

Priority: Critical

Owner: Platform Engineering Team

---

# Purpose

This document defines every tool available to AI agents.

Agents may only use approved tools.

No hidden tools are allowed.

Every tool must be:

* Observable
* Auditable
* Permission Controlled
* Versioned

---

# Tool Architecture

```text
Agent

↓

Skill

↓

Tool

↓

Result
```

---

# Tool Categories

1. Knowledge Tools

2. Graph Tools

3. Search Tools

4. Citation Tools

5. Upload Tools

6. Research Tools

7. User Tools

8. System Tools

---

# KNOWLEDGE TOOLS

## scripture_lookup

Purpose

Retrieve scriptures.

Input

```json
{
  "reference":"BG.2.47"
}
```

Output

```json
{
  "verse":"",
  "translation":""
}
```

---

## concept_lookup

Purpose

Retrieve concepts.

Input

```json
{
  "concept":"Moksha"
}
```

---

## commentary_lookup

Purpose

Retrieve commentary sources.

---

# GRAPH TOOLS

## graph_expand

Purpose

Expand concept network.

Input

```json
{
  "node_id":"",
  "depth":2
}
```

Output

```json
{
  "nodes":[],
  "edges":[]
}
```

---

## graph_neighbors

Purpose

Find connected nodes.

---

## graph_path

Purpose

Find relationships.

Example

```text
Atman → Brahman
```

---

## ontology_lookup

Purpose

Explore ontology.

---

# SEARCH TOOLS

## semantic_search

Backend

```text
Qdrant
```

Purpose

Meaning search.

---

## keyword_search

Backend

```text
Elasticsearch
```

Purpose

Exact matching.

---

## hybrid_search

Backend

```text
Qdrant

Neo4j

Elasticsearch
```

Purpose

Primary retrieval.

---

## source_search

Purpose

Find authoritative sources.

---

# CITATION TOOLS

## citation_validate

Purpose

Verify references.

---

## confidence_score

Purpose

Calculate confidence.

---

## evidence_match

Purpose

Match claim to source.

---

## hallucination_check

Purpose

Detect unsupported claims.

---

# RESEARCH TOOLS

## evidence_synthesis

Purpose

Combine evidence.

---

## source_comparison

Purpose

Compare viewpoints.

---

## report_builder

Purpose

Create reports.

---

## contradiction_analysis

Purpose

Handle disagreements.

---

# UPLOAD TOOLS

## upload_search

Purpose

Search user uploads.

---

## upload_graph

Purpose

Retrieve upload relationships.

---

## upload_metadata

Purpose

Retrieve upload metadata.

---

## upload_reference_detection

Purpose

Find scripture references.

---

# USER TOOLS

## bookmark_lookup

Purpose

Retrieve bookmarks.

---

## notes_lookup

Purpose

Retrieve notes.

---

## collection_lookup

Purpose

Retrieve collections.

---

# SYSTEM TOOLS

## health_check

Purpose

Verify service health.

---

## metrics_lookup

Purpose

Retrieve metrics.

---

## event_lookup

Purpose

Inspect event streams.

---

## audit_lookup

Purpose

Review audit logs.

---

# Tool Permissions

Veda Agent

```text
scripture_lookup

concept_lookup

hybrid_search
```

---

Upanishad Agent

```text
scripture_lookup

graph_expand

hybrid_search
```

---

Purana Agent

```text
scripture_lookup

graph_expand
```

---

Graph Agent

```text
graph_expand

graph_neighbors

graph_path
```

Only.

---

Citation Agent

```text
citation_validate

confidence_score

evidence_match

hallucination_check
```

Only.

---

Upload Agent

```text
upload_search

upload_graph

upload_metadata
```

Only.

---

# Tool Response Standard

All tools return:

```json
{
  "success": true,
  "request_id":"",
  "data":{},
  "errors":[]
}
```

---

# Tool Security

Requirements

```text
Authentication

Authorization

Audit Logging

Rate Limiting
```

---

# Tool Observability

Every tool invocation records:

```json
{
  "tool":"",
  "agent":"",
  "latency_ms":0,
  "success":true
}
```

---

# Tool Failure Rules

If tool fails:

1. Retry

2. Fallback

3. Return uncertainty

4. Log incident

---

# Future Tools

```text
Voice Search

Sanskrit Parser

Manuscript Comparator

Temple Knowledge Search

Festival Knowledge Search

Education Engine
```

---

# Non-Negotiable Rules

1. Agents use tools through skills.

2. Tools never bypass permissions.

3. Tools never modify canonical scripture.

4. All tool calls are logged.

5. Citation tools have highest authority.

6. Tool outputs are traceable.

---

# Tool Mission

Tools are the executable capabilities of VEDA.

Skills decide how to think.

Tools decide what can be done.

Together they enable trustworthy, scalable, and observable intelligence.
