# API_SPEC.md

# VEDA API Specification

Version: v1

Status: Authoritative API Contract

Owner: Platform Engineering Team

---

# Purpose

This document defines:

* REST APIs
* Authentication
* WebSocket APIs
* Streaming Protocols
* Search Contracts
* Graph Contracts
* Upload Contracts
* Research Contracts
* Agent Contracts

All services must conform to this specification.

---

# API Principles

## Principle 1

API First

All functionality must be available through APIs.

---

## Principle 2

Versioned Endpoints

Every endpoint must include version.

Example

```text
/api/v1/search
```

---

## Principle 3

Consistent Responses

Every endpoint returns:

```json
{
  "success": true,
  "data": {},
  "meta": {},
  "errors": []
}
```

---

## Principle 4

Traceability

Every response contains:

```json
{
  "request_id":""
}
```

---

# Base URL

```text
https://api.veda.ai/api/v1
```

---

# Authentication

Supported

```text
JWT

OAuth

Google

GitHub

Passkeys
```

---

# Auth Header

```http
Authorization: Bearer <token>
```

---

# Roles

```text
USER

SCHOLAR

MODERATOR

ADMIN
```

---

# Standard Response

Success

```json
{
  "success": true,
  "request_id": "req_123",
  "data": {},
  "meta": {},
  "errors": []
}
```

---

Error

```json
{
  "success": false,
  "request_id": "req_123",
  "data": null,
  "errors": [
    {
      "code":"INVALID_REQUEST",
      "message":"Missing field"
    }
  ]
}
```

---

# Pagination Model

Request

```http
?page=1
&limit=20
```

---

Response

```json
{
  "meta":{
    "page":1,
    "limit":20,
    "total":500,
    "pages":25
  }
}
```

---

# AUTH APIs

## Register

POST

```text
/api/v1/auth/register
```

Request

```json
{
  "email":"",
  "password":"",
  "username":""
}
```

---

## Login

POST

```text
/api/v1/auth/login
```

Request

```json
{
  "email":"",
  "password":""
}
```

Response

```json
{
  "token":"",
  "refresh_token":""
}
```

---

## Refresh Token

POST

```text
/api/v1/auth/refresh
```

---

## Logout

POST

```text
/api/v1/auth/logout
```

---

# USER APIs

## Get Profile

GET

```text
/api/v1/users/me
```

---

## Update Profile

PATCH

```text
/api/v1/users/me
```

---

## User Preferences

GET

```text
/api/v1/users/preferences
```

---

PATCH

```text
/api/v1/users/preferences
```

---

# SEARCH APIs

Purpose

Unified search.

---

## Search

POST

```text
/api/v1/search
```

Request

```json
{
  "query":"moksha",
  "filters":{
    "source_type":["scripture"],
    "language":["en"]
  },
  "page":1,
  "limit":20
}
```

---

Response

```json
{
  "results":[
    {
      "id":"",
      "title":"",
      "type":"",
      "score":0.98
    }
  ]
}
```

---

# SEMANTIC SEARCH

POST

```text
/api/v1/search/semantic
```

Uses

```text
Qdrant
```

---

# GRAPH SEARCH

POST

```text
/api/v1/search/graph
```

Uses

```text
Neo4j
```

---

# SCRIPTURE APIs

## List Scriptures

GET

```text
/api/v1/scriptures
```

---

## Get Scripture

GET

```text
/api/v1/scriptures/{id}
```

---

## List Chapters

GET

```text
/api/v1/scriptures/{id}/chapters
```

---

## Get Verse

GET

```text
/api/v1/verses/{id}
```

---

Response

```json
{
  "reference":"BG.2.47",
  "sanskrit":"",
  "translation":"",
  "commentaries":[]
}
```

---

# CONCEPT APIs

## List Concepts

GET

```text
/api/v1/concepts
```

---

## Get Concept

GET

```text
/api/v1/concepts/{id}
```

Response

```json
{
  "id":"",
  "name":"Moksha",
  "summary":"",
  "related_concepts":[]
}
```

---

# GRAPH APIs

Purpose

Knowledge Graph access.

---

## Get Node

GET

```text
/api/v1/graph/nodes/{id}
```

---

## Expand Node

POST

```text
/api/v1/graph/expand
```

Request

```json
{
  "node_id":"",
  "depth":2
}
```

---

Response

```json
{
  "nodes":[],
  "relationships":[]
}
```

---

## Related Concepts

GET

```text
/api/v1/graph/concepts/{id}/related
```

---

# CHAT APIs

Purpose

RLM-powered answers.

---

## Ask Question

POST

```text
/api/v1/chat
```

Request

```json
{
  "message":"What is Moksha?",
  "mode":"standard"
}
```

Modes

```text
quick

scholar

research
```

---

Response

```json
{
  "answer":"",
  "sources":[],
  "confidence":0.94
}
```

---

# STREAMING CHAT

POST

```text
/api/v1/chat/stream
```

Protocol

```text
Server Sent Events
```

Events

```text
message

citation

completed

error
```

---

# RESEARCH APIs

## Generate Report

POST

```text
/api/v1/research
```

Request

```json
{
  "topic":"Compare Moksha in Vedanta schools"
}
```

---

Response

```json
{
  "report_id":"",
  "status":"processing"
}
```

---

## Get Report

GET

```text
/api/v1/research/{id}
```

---

## Export Report

GET

```text
/api/v1/research/{id}/export
```

Formats

```text
pdf

markdown

json
```

---

# UPLOAD APIs

## Upload Document

POST

```text
/api/v1/uploads
```

Content Type

```text
multipart/form-data
```

Supported

```text
PDF

EPUB

DOCX

TXT

MD
```

---

Response

```json
{
  "upload_id":"",
  "status":"processing"
}
```

---

## Upload Status

GET

```text
/api/v1/uploads/{id}
```

---

Response

```json
{
  "status":"completed",
  "chunks":120
}
```

---

## Upload Search

POST

```text
/api/v1/uploads/search
```

---

## Upload Graph

GET

```text
/api/v1/uploads/{id}/graph
```

---

# BOOKMARK APIs

## Create Bookmark

POST

```text
/api/v1/bookmarks
```

---

## Delete Bookmark

DELETE

```text
/api/v1/bookmarks/{id}
```

---

## List Bookmarks

GET

```text
/api/v1/bookmarks
```

---

# NOTES APIs

## Create Note

POST

```text
/api/v1/notes
```

---

## Update Note

PATCH

```text
/api/v1/notes/{id}
```

---

## Delete Note

DELETE

```text
/api/v1/notes/{id}
```

---

# COLLECTION APIs

## Create Collection

POST

```text
/api/v1/collections
```

---

## Add Item

POST

```text
/api/v1/collections/{id}/items
```

---

# AGENT APIs

Internal Only

Not public.

---

## Execute Agent

POST

```text
/internal/v1/agents/execute
```

Request

```json
{
  "agent":"veda_agent",
  "task":"concept_lookup",
  "payload":{}
}
```

---

## Agent Status

GET

```text
/internal/v1/agents/{task_id}
```

---

# RLM APIs

Internal Only

---

## Retrieve Evidence

POST

```text
/internal/v1/rlm/retrieve
```

---

## Graph Expansion

POST

```text
/internal/v1/rlm/link
```

---

## Reason

POST

```text
/internal/v1/rlm/reason
```

---

## Validate

POST

```text
/internal/v1/rlm/validate
```

---

# WebSocket APIs

Connection

```text
/ws/v1
```

---

Events

## chat.delta

```json
{
  "type":"chat.delta",
  "content":"..."
}
```

---

## citation.added

```json
{
  "type":"citation.added",
  "citation":{}
}
```

---

## graph.updated

```json
{
  "type":"graph.updated"
}
```

---

## upload.progress

```json
{
  "type":"upload.progress",
  "progress":65
}
```

---

# Rate Limits

Anonymous

```text
30 requests/hour
```

---

Authenticated

```text
500 requests/hour
```

---

Scholar

```text
5000 requests/hour
```

---

# Error Codes

```text
INVALID_REQUEST

UNAUTHORIZED

FORBIDDEN

NOT_FOUND

RATE_LIMITED

VALIDATION_ERROR

GRAPH_ERROR

UPLOAD_ERROR

RLM_ERROR

AGENT_ERROR

INTERNAL_ERROR
```

---

# API Security

Requirements

* HTTPS Only
* JWT Validation
* CSRF Protection
* Rate Limiting
* Audit Logging

---

# API Observability

Every Request Logs

```json
{
  "request_id":"",
  "user_id":"",
  "latency_ms":0,
  "endpoint":"",
  "status_code":200
}
```

---

# Future APIs

Planned

* Voice APIs
* Sanskrit Analysis APIs
* Temple Knowledge APIs
* Public Graph APIs
* Open Research APIs
* University Integration APIs

---

# API Mission

The VEDA API exists to expose every capability of the platform through stable, versioned, secure, and observable contracts.

The API is the foundation that connects:

Users

Knowledge Graph

Scriptures

Research Engine

RLM Intelligence

Multi-Agent System

Personal Knowledge Bases

into a single coherent platform.
