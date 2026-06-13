# MONOREPO_ARCHITECTURE.md

# VEDA Monorepo Architecture

Version: 1.0

Status: Authoritative Repository Blueprint

Owner: Platform Engineering Team

Priority: Critical

---

# Purpose

This document defines:

* Repository Structure
* Workspace Organization
* Service Boundaries
* Package Ownership
* Deployment Units
* Shared Libraries
* Agent Services
* Infrastructure Layout

This document is the source of truth for repository organization.

---

# Design Goals

The monorepo must support:

* Web Application
* Mobile Application
* API Platform
* Knowledge Graph
* RLM Engine
* Agent System
* Ingestion Pipeline
* Research Platform

without creating tight coupling.

---

# Core Principles

## Principle 1

Apps Are Products

Apps contain user experiences.

---

## Principle 2

Services Are Independent Systems

Services contain business logic.

---

## Principle 3

Packages Are Shared Libraries

Packages contain reusable code.

---

## Principle 4

Infrastructure Is Separate

Deployment code never belongs in applications.

---

# Technology

Monorepo Tool

```text
Turborepo
```

---

Package Manager

```text
pnpm
```

---

Language

```text
TypeScript
```

---

Runtime

```text
Node.js 22+
```

---

# Repository Structure

```text
veda/

├─ apps/
├─ services/
├─ packages/
├─ infrastructure/
├─ tools/
├─ docs/
├─ scripts/
├─ .github/
├─ turbo.json
├─ pnpm-workspace.yaml
└─ package.json
```

---

# Apps

Purpose

User-facing applications.

---

Structure

```text
apps/

├─ web
├─ mobile
├─ admin
└─ docs
```

---

# apps/web

Purpose

Main VEDA application.

Stack

```text
Next.js 15
```

Contains

```text
Explore

Chat

Research

Graph

Scriptures

Library
```

---

# apps/mobile

Purpose

Mobile application.

Stack

```text
React Native

Expo
```

---

# apps/admin

Purpose

Administration console.

Used For

```text
Content Review

Ontology Management

User Management

Moderation
```

---

# apps/docs

Purpose

Developer documentation.

Stack

```text
Nextra
```

---

# Services

Purpose

Deployable backend systems.

---

Structure

```text
services/

├─ api
├─ auth
├─ graph
├─ search
├─ ingestion
├─ agents
├─ research
├─ notifications
└─ analytics
```

---

# api

Purpose

Public API Gateway.

Responsibilities

```text
REST

GraphQL

WebSockets

Rate Limits
```

---

# auth

Purpose

Identity platform.

Responsibilities

```text
JWT

OAuth

Passkeys

Sessions
```

---

# graph

Purpose

Knowledge graph service.

Responsibilities

```text
Neo4j Access

Graph Traversal

Concept Expansion
```

---

# search

Purpose

Search platform.

Responsibilities

```text
Qdrant

Elasticsearch

Hybrid Search
```

---

# ingestion

Purpose

Knowledge ingestion.

Responsibilities

```text
OCR

Chunking

Embedding

Metadata Extraction
```

---

# agents

Purpose

Multi-agent runtime.

Responsibilities

```text
Orchestration

Reasoning

Agent Execution
```

---

# research

Purpose

Research report generation.

Responsibilities

```text
Comparative Analysis

Scholar Reports

Research Workflows
```

---

# notifications

Purpose

Messaging.

Responsibilities

```text
Email

Push

In-App
```

---

# analytics

Purpose

Telemetry.

Responsibilities

```text
Metrics

Events

Insights
```

---

# Packages

Purpose

Shared reusable libraries.

---

Structure

```text
packages/

├─ ui
├─ design-tokens
├─ types
├─ api-client
├─ auth-sdk
├─ graph-sdk
├─ search-sdk
├─ knowledge-sdk
├─ agent-sdk
├─ config
├─ eslint-config
├─ tsconfig
└─ testing
```

---

# ui

Purpose

Shared UI system.

Contains

```text
Buttons

Cards

Modals

Layouts

Knowledge Components
```

---

# design-tokens

Purpose

Design system source.

Contains

```text
Colors

Spacing

Typography

Shadows
```

---

# types

Purpose

Shared TypeScript contracts.

Contains

```text
API Types

Graph Types

Knowledge Types
```

---

# api-client

Purpose

Typed API access.

Contains

```text
REST Client

Query Helpers

SSE Client
```

---

# graph-sdk

Purpose

Graph interactions.

Contains

```text
Node Models

Traversal APIs

Relationship Types
```

---

# search-sdk

Purpose

Search abstraction.

Contains

```text
Semantic Search

Hybrid Search

Filters
```

---

# knowledge-sdk

Purpose

Domain models.

Contains

```text
Scriptures

Verses

Concepts

Commentaries
```

---

# agent-sdk

Purpose

Agent contracts.

Contains

```text
Agent Messages

Tasks

Responses
```

---

# Infrastructure

Purpose

Deployment and operations.

---

Structure

```text
infrastructure/

├─ terraform
├─ kubernetes
├─ docker
├─ monitoring
├─ security
└─ environments
```

---

# Terraform

Purpose

Cloud provisioning.

Resources

```text
VPC

Databases

Storage

Networking
```

---

# Kubernetes

Purpose

Service deployment.

Contains

```text
Deployments

Services

Ingress

Secrets
```

---

# Docker

Purpose

Containerization.

Contains

```text
Service Images

Build Configs
```

---

# Monitoring

Purpose

Observability.

Contains

```text
Prometheus

Grafana

OpenTelemetry
```

---

# Security

Purpose

Security policies.

Contains

```text
IAM

Secrets

Audit
```

---

# Tools

Purpose

Development utilities.

---

Structure

```text
tools/

├─ generators
├─ codemods
├─ ontology-tools
├─ graph-tools
└─ scripts
```

---

# Docs

Purpose

Architecture and specifications.

---

Structure

```text
docs/

├─ architecture
├─ product
├─ ontology
├─ api
├─ agents
└─ research
```

---

# Domain Ownership

Knowledge Team

Owns

```text
Knowledge Graph

Ontology

Scriptures
```

---

AI Team

Owns

```text
Agents

Reasoning

RLM
```

---

Platform Team

Owns

```text
API

Auth

Infrastructure
```

---

Frontend Team

Owns

```text
Web

Mobile

UI Packages
```

---

# Dependency Rules

Apps

Can depend on

```text
Packages
```

---

Apps

Cannot depend on

```text
Other Apps
```

---

Services

Can depend on

```text
Packages
```

---

Services

Cannot depend on

```text
Other Services
```

Directly.

Must use APIs/events.

---

Packages

Cannot depend on

```text
Apps

Services
```

---

# Communication Model

Service Communication

```text
API

Events

Queues
```

Only.

---

Never

```text
Direct Database Access
```

Across services.

---

# Event Bus

Recommended

```text
Kafka
```

---

Events

```text
DOCUMENT_UPLOADED

GRAPH_UPDATED

REPORT_CREATED

USER_REGISTERED

AGENT_COMPLETED
```

---

# Database Ownership

PostgreSQL

Owned By

```text
api
```

---

Neo4j

Owned By

```text
graph
```

---

Qdrant

Owned By

```text
search
```

---

Elasticsearch

Owned By

```text
search
```

---

No shared database writes.

---

# Deployment Units

Independent Deployments

```text
web

api

graph

search

ingestion

agents

research
```

---

Each service deploys separately.

---

# CI/CD Pipeline

Stages

```text
Lint

Type Check

Test

Build

Security Scan

Deploy
```

---

Tooling

```text
GitHub Actions
```

---

# Testing Strategy

Unit

```text
Vitest
```

---

Integration

```text
Jest
```

---

E2E

```text
Playwright
```

---

Contract Tests

Required

Between

```text
API

Agents

Graph
```

---

# Repository Scaling Plan

Phase 1

```text
web

api

search

ingestion
```

---

Phase 2

```text
graph

agents

research
```

---

Phase 3

```text
mobile

analytics

notifications
```

---

# AI Code Generation Rules

When generating code:

1. Respect workspace boundaries.

2. Never create cross-service coupling.

3. Prefer packages over duplication.

4. Share contracts through packages/types.

5. Keep services independently deployable.

6. Keep apps independently releasable.

7. Use event-driven communication.

8. Follow domain ownership.

---

# Future Expansion

Planned Services

```text
voice

sanskrit-engine

manuscript-engine

education-platform

public-api
```

---

# Monorepo Mission

The VEDA monorepo exists to enable independent evolution of products, services, intelligence systems, and infrastructure while preserving a unified developer experience.

The repository should remain understandable at:

10,000 lines

100,000 lines

1,000,000 lines

and beyond.

Structure creates scalability.

Boundaries create maintainability.

Ownership creates velocity.
