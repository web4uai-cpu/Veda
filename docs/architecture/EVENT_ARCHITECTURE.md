# EVENT_ARCHITECTURE.md

# VEDA Event-Driven Architecture

Version: 1.0

Status: Authoritative Event System Specification

Owner: Platform Engineering Team

Priority: Critical

---

# Purpose

This document defines:

* Event Bus Architecture
* Event Contracts
* Event Schemas
* Service Communication
* Event Ownership
* Retry Strategy
* Dead Letter Queues
* Event Versioning

The event system is the nervous system of VEDA.

---

# Core Philosophy

Services must not call each other directly whenever asynchronous communication is possible.

Preferred

```text
Service A
 ↓
Event Bus
 ↓
Service B
```

Avoid

```text
Service A
 ↓
HTTP
 ↓
Service B
```

for non-user-facing workflows.

---

# Event Bus

Recommended

```text
Apache Kafka
```

Alternative

```text
Redpanda
```

Development

```text
Redis Streams
```

---

# Event Categories

## Knowledge Events

```text
DOCUMENT_UPLOADED
DOCUMENT_PROCESSED
CONCEPT_CREATED
VERSE_CREATED
GRAPH_UPDATED
```

---

## Search Events

```text
EMBEDDING_CREATED
INDEX_UPDATED
VECTOR_STORED
SEARCH_INDEXED
```

---

## Agent Events

```text
AGENT_STARTED
AGENT_COMPLETED
AGENT_FAILED
REASONING_COMPLETED
```

---

## User Events

```text
USER_REGISTERED
BOOKMARK_CREATED
NOTE_CREATED
COLLECTION_CREATED
```

---

## Research Events

```text
REPORT_CREATED
REPORT_COMPLETED
REPORT_EXPORTED
```

---

# Event Envelope

All events follow the same structure.

```json
{
  "event_id": "",
  "event_type": "",
  "version": "1.0",
  "timestamp": "",
  "producer": "",
  "correlation_id": "",
  "payload": {}
}
```

---

# Correlation IDs

Required.

Used to trace a request across:

```text
API

Search

Graph

Agents

Research
```

---

# Event Ownership

DOCUMENT_UPLOADED

Producer

```text
ingestion-service
```

Consumers

```text
search-service
graph-service
```

---

GRAPH_UPDATED

Producer

```text
graph-service
```

Consumers

```text
search-service
agents-service
```

---

EMBEDDING_CREATED

Producer

```text
search-service
```

Consumers

```text
research-service
```

---

# Topic Design

```text
veda.documents

veda.graph

veda.search

veda.agents

veda.research

veda.users
```

---

# Retry Policy

Attempt

```text
3 Times
```

Exponential Backoff

```text
1s

5s

30s
```

---

# Dead Letter Queue

Every topic has:

```text
*.dlq
```

Example

```text
veda.documents.dlq
```

---

# Event Ordering

Required For

```text
Document Processing

Graph Updates

Citation Updates
```

Partition Key

```text
document_id
```

---

# Event Versioning

Never break existing consumers.

Example

```text
DOCUMENT_UPLOADED_V1

DOCUMENT_UPLOADED_V2
```

---

# Event Flow

Upload Pipeline

```text
DOCUMENT_UPLOADED

↓

OCR_COMPLETED

↓

CHUNKS_CREATED

↓

EMBEDDINGS_CREATED

↓

GRAPH_LINKED

↓

DOCUMENT_READY
```

---

# Agent Flow

```text
QUESTION_RECEIVED

↓

RETRIEVAL_COMPLETED

↓

REASONING_COMPLETED

↓

CITATION_VALIDATED

↓

ANSWER_GENERATED
```

---

# Monitoring

Track

```text
Consumer Lag

Failed Events

Retry Count

DLQ Count

Event Throughput
```

---

# Non-Negotiable Rules

1. Events are immutable.
2. Consumers must be idempotent.
3. Every event has a version.
4. Every event has a correlation_id.
5. Failed events go to DLQ.
6. No shared databases between services.

---

# Event Mission

Events enable VEDA services to evolve independently while maintaining a coherent knowledge ecosystem.
