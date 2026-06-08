# SYSTEM_ARCHITECTURE.md

# VEDA System Architecture

Version: 1.0

Status: Authoritative Architecture Document

Owner: Core Architecture Team

Last Updated: 2026

---

# Purpose

This document defines the complete technical architecture of VEDA.

All implementation decisions must follow this architecture.

This architecture is optimized for:

* Knowledge Graph First
* Retrieval First
* Citation First
* AI Assisted Reasoning
* Scalable Research Platform
* Multi-Agent Intelligence
* User Knowledge Ownership

---

# Architecture Principles

## Principle 1

Knowledge Graph is Primary

The Knowledge Graph is the source of relationships.

LLMs are not allowed to invent relationships.

---

## Principle 2

Retrieval Before Generation

Every answer must be based on retrieved evidence.

---

## Principle 3

Citation Before Response

No answer may be returned without source attribution.

---

## Principle 4

Canonical Separation

Canonical scriptures must always remain separate from:

* User Uploads
* AI Notes
* External Sources

---

## Principle 5

Composable Services

Every major capability is implemented as an independent service.

---

# High-Level Architecture

```text
                         USER

                           │

                           ▼

                 API Gateway Layer

                           │

      ┌────────────────────┼────────────────────┐

      ▼                    ▼                    ▼

 Search Service      Chat Service       Upload Service

      │                    │                    │

      ▼                    ▼                    ▼

 Graph Service      RLM Engine        Ingestion Pipeline

      │                    │                    │

      ▼                    ▼                    ▼

    Neo4j            AI Agents         Processing Queue

      │                    │                    │

      └────────────────────┼────────────────────┘

                           ▼

                   Response Builder

                           ▼

                     User Interface
```

---

# System Layers

Layer 1

Presentation Layer

Layer 2

API Layer

Layer 3

Application Services

Layer 4

Knowledge Services

Layer 5

AI Layer

Layer 6

Storage Layer

Layer 7

Infrastructure Layer

---

# Layer 1

Presentation Layer

Components:

* Web App
* Mobile App
* Admin Portal

Technology:

* Next.js
* TypeScript
* Tailwind
* React Query

Responsibilities:

* User Interface
* Search Experience
* Knowledge Map
* Reading Experience
* Research Workspace

---

# Layer 2

API Gateway

Purpose:

Single entry point.

Responsibilities:

* Authentication
* Routing
* Rate Limiting
* Logging
* Metrics

Technology:

* FastAPI Gateway

Endpoints:

/api/search

/api/chat

/api/upload

/api/graph

/api/research

/api/user

---

# Layer 3

Core Services

## Search Service

Purpose:

Unified search engine.

Supports:

* Semantic Search
* Keyword Search
* Sanskrit Search
* Graph Search

Dependencies:

* Elasticsearch
* Qdrant

---

## User Service

Purpose:

Manage user accounts.

Stores:

* Profiles
* Settings
* History
* Bookmarks

Database:

PostgreSQL

---

## Research Service

Purpose:

Generate research reports.

Functions:

* Comparative Analysis
* Source Aggregation
* Citation Assembly

---

## Notification Service

Purpose:

User notifications.

Channels:

* Email
* Push
* In-App

---

# Layer 4

Knowledge Services

## Graph Service

Purpose:

Manage Dharma Knowledge Graph.

Technology:

Neo4j

Responsibilities:

* Node Management
* Relationship Management
* Graph Traversal
* Concept Discovery

---

## Citation Service

Purpose:

Verify references.

Functions:

* Source Validation
* Citation Formatting
* Confidence Scoring

Output:

Verified Sources

---

## Scripture Service

Purpose:

Canonical scripture storage.

Collections:

* Vedas
* Upanishads
* Bhagavad Gita
* Puranas
* Ramayana
* Mahabharata

Rules:

Read-only content.

---

# Layer 5

AI Layer

Purpose:

Reasoning.

Not storage.

Not source of truth.

---

# Multi-Agent Architecture

```text
User Query

     │

     ▼

Orchestrator Agent

     │

──────────────────────────────

Veda Agent

Upanishad Agent

Purana Agent

Vedanta Agent

Graph Agent

Citation Agent

Sanskrit Agent

Upload Agent

──────────────────────────────

     │

     ▼

Response Composer

     │

     ▼

Final Response
```

---

# Agent Responsibilities

## Veda Agent

Expert:

* Rigveda
* Yajurveda
* Samaveda
* Atharvaveda

---

## Upanishad Agent

Expert:

* Major Upanishads
* Minor Upanishads

---

## Purana Agent

Expert:

* Mahapuranas
* Upapuranas

---

## Vedanta Agent

Expert:

* Advaita
* Vishishtadvaita
* Dvaita

---

## Graph Agent

Responsibilities:

* Concept Discovery
* Graph Traversal
* Relationship Expansion

---

## Citation Agent

Responsibilities:

* Verify References
* Validate Sources
* Detect Hallucinations

---

## Sanskrit Agent

Responsibilities:

* Transliteration
* Grammar Analysis
* Root Word Analysis

---

## Upload Agent

Responsibilities:

* User Upload Analysis
* Metadata Extraction
* Knowledge Linking

---

# RLM Engine

Retrieval + Linkage + Reasoning Model

Pipeline:

```text
Query

↓

Intent Detection

↓

Graph Search

↓

Vector Search

↓

Scripture Retrieval

↓

Evidence Collection

↓

Agent Collaboration

↓

Citation Verification

↓

Response Generation

↓

Final Answer
```

---

# User Upload Architecture

Supported Formats:

* PDF
* EPUB
* DOCX
* TXT
* Markdown

---

Pipeline

```text
Upload

↓

Storage

↓

OCR

↓

Text Extraction

↓

Chunking

↓

Embedding

↓

Metadata Detection

↓

Concept Extraction

↓

Graph Linking

↓

Vector Storage

↓

Search Indexing
```

---

# Canonical Separation Rules

Canonical Database

Contains:

* Scriptures
* Commentaries
* Verified Sources

---

User Database

Contains:

* User Uploads
* Notes
* Collections

---

Rule:

Never merge canonical and user content.

Only link through references.

---

# Storage Layer

## PostgreSQL

Stores:

* Users
* Settings
* Sessions
* Notes
* Bookmarks

---

## Neo4j

Stores:

* Concepts
* Relationships
* Scripture Links

---

## Qdrant

Stores:

* Embeddings
* Semantic Chunks

---

## Elasticsearch

Stores:

* Full Text Index

---

## Object Storage

Stores:

* PDFs
* EPUBs
* Images
* Audio

Technology:

S3 Compatible Storage

---

# Knowledge Graph Model

Node Types

* Concept
* Scripture
* Verse
* Person
* Deity
* Event
* Place
* Commentary
* School
* Practice

Relationships

* REFERENCES
* EXPLAINS
* RELATED_TO
* PART_OF
* AUTHORED_BY
* COMMENTS_ON
* SUPPORTS
* CONTRADICTS

---

# API Contracts

## Search API

POST

/api/search

Request:

query

filters

Response:

results

citations

related concepts

---

## Chat API

POST

/api/chat

Request:

message

context

Response:

answer

sources

confidence

---

## Upload API

POST

/api/upload

Request:

file

metadata

Response:

upload_id

status

---

## Graph API

GET

/api/graph/{nodeId}

Response:

node

relationships

neighbors

---

# Security Model

Authentication:

JWT

OAuth

Passkeys

---

Authorization:

RBAC

Roles:

* User
* Scholar
* Moderator
* Admin

---

# Observability

Metrics:

* Query Latency
* Retrieval Quality
* Citation Accuracy
* Agent Success Rate

Tools:

* Prometheus
* Grafana
* OpenTelemetry

---

# Deployment Architecture

Frontend

Next.js

Hosted Separately

---

Backend

FastAPI Services

Containerized

Docker

Kubernetes

---

Databases

Managed Cluster

* PostgreSQL
* Neo4j
* Qdrant

---

# Future Architecture

Planned:

* Voice Interface
* Sanskrit Speech Engine
* Multi-Language Reasoning
* Academic Research Workspace
* Open Knowledge APIs

---

# Non-Negotiable Rules

1. Knowledge Graph before AI.

2. Retrieval before generation.

3. Citation before answer.

4. Canonical sources before commentary.

5. Commentary before AI interpretation.

6. User uploads remain separate.

7. No fabricated scripture references.

8. Every answer must be traceable.

---

# Architecture Summary

VEDA is not an AI chatbot.

VEDA is a Knowledge Operating System powered by:

Knowledge Graph

*

Retrieval

*

Citation

*

Reasoning

*

Research

*

Personal Knowledge Management

The architecture is designed to remain trustworthy, explainable, scalable, and verifiable as the platform grows into the world's largest structured knowledge network for Sanatan Dharma.
