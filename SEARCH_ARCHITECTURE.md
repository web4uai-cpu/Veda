# SEARCH_ARCHITECTURE.md

# VEDA Hybrid Search Architecture

Version: 1.0

Status: Authoritative Search Specification

Owner: Search Engineering Team

Priority: Critical

---

# Purpose

This document defines:

* Search Strategy
* Retrieval Architecture
* Hybrid Search
* Semantic Search
* Graph Search
* Ranking
* Re-ranking
* Query Understanding

Search quality determines answer quality.

---

# Core Philosophy

Traditional Search

```text
Keywords
 ↓
Results
```

---

Vector RAG

```text
Embedding
 ↓
Results
```

---

VEDA Search

```text
Intent

↓

Graph Expansion

↓

Keyword Search

+

Semantic Search

+

Citation Search

↓

Fusion Ranking

↓

Re-ranking

↓

Evidence Packets
```

---

# Search Stack

PostgreSQL

Purpose

```text
Metadata
```

---

Elasticsearch

Purpose

```text
Keyword Search
```

---

Qdrant

Purpose

```text
Semantic Search
```

---

Neo4j

Purpose

```text
Relationship Search
```

---

# Query Pipeline

User Query

```text
What is Moksha?
```

↓

Intent Detection

↓

Concept Extraction

↓

Graph Expansion

↓

Multi-Retrieval

↓

Ranking

↓

Evidence Packets

---

# Search Modes

## Quick Search

Target

```text
<500ms
```

Uses

```text
Elastic + Qdrant
```

---

## Scholar Search

Target

```text
<2s
```

Uses

```text
Elastic

Qdrant

Neo4j
```

---

## Research Search

Target

```text
<5s
```

Uses

```text
Elastic

Qdrant

Neo4j

Agents
```

---

# Hybrid Retrieval

Search Score

```text
Semantic

+

Keyword

+

Graph

+

Citation
```

---

# Semantic Search

Technology

```text
Qdrant
```

Purpose

Meaning search.

Example

```text
Liberation
```

Finds

```text
Moksha
```

---

# Keyword Search

Technology

```text
Elasticsearch
```

Purpose

Exact references.

Example

```text
BG 2.47
```

---

# Graph Search

Technology

```text
Neo4j
```

Purpose

Relationship discovery.

Example

```text
Moksha

↓

Atman

↓

Brahman
```

---

# Citation Search

Purpose

Prioritize authoritative sources.

Ranking

```text
Canonical Scripture

↓

Commentary

↓

Scholar Source

↓

Uploads
```

---

# Query Understanding

Output

```json
{
  "intent":"concept",
  "concepts":["Moksha"],
  "mode":"scholar"
}
```

---

# Intent Types

```text
Concept

Verse

Scripture

Comparison

Research

Translation

Upload
```

---

# Graph Expansion

Default Depth

```text
2
```

Research Mode

```text
5
```

---

# Retrieval Sources

Priority

```text
Canonical Sources

↓

Commentaries

↓

Research

↓

Uploads
```

---

# Fusion Ranking

Formula

```text
0.40 Semantic

0.25 Keyword

0.20 Graph

0.15 Citation
```

---

# Re-Ranking

Technology

```text
Cross Encoder
```

Recommended

```text
bge-reranker-large
```

---

# Evidence Packet

Output

```json
{
  "source_id":"",
  "content":"",
  "citation":"",
  "score":0.94
}
```

---

# Search Collections

Qdrant

```text
scriptures

concepts

commentaries

uploads

research
```

---

# Elasticsearch Indexes

```text
scriptures_index

concepts_index

commentaries_index

uploads_index
```

---

# Search API Contract

Endpoint

```text
POST /api/v1/search
```

Response

```json
{
  "results":[],
  "meta":{}
}
```

---

# Personal Search

Includes

```text
User Uploads

User Notes

Bookmarks
```

---

# Global Search

Includes

```text
Canonical Sources

Commentaries

Research Sources
```

---

# Hallucination Prevention

Search must return evidence.

Not answers.

Answers come later.

---

# Search Metrics

Track

```text
Recall@10

Precision@10

MRR

NDCG

Latency
```

---

# Search SLO

Quick Search

```text
<500ms
```

---

Scholar Search

```text
<2s
```

---

Research Search

```text
<5s
```

---

# Future Enhancements

```text
Multilingual Search

Voice Search

Sanskrit Search

Manuscript Search

Semantic Graph Search
```

---

# Non-Negotiable Rules

1. Graph before LLM.
2. Retrieval before generation.
3. Citation before answer.
4. Search returns evidence, not conclusions.
5. Hybrid retrieval is mandatory.
6. Canonical sources rank highest.

---

# Search Mission

The purpose of search is not to find documents.

The purpose of search is to retrieve the most trustworthy evidence needed to answer a user's question accurately, transparently, and with citations.
