# FRONTEND_ARCHITECTURE.md

# VEDA Frontend Architecture

Version: 1.0

Status: Authoritative Frontend Specification

Owner: Frontend Engineering Team

Priority: Critical

---

# Purpose

This document defines:

* Frontend Architecture
* Application Structure
* Routing Strategy
* State Management
* Data Fetching
* Component Design
* Mobile Strategy
* Graph Visualization
* Caching
* Performance Rules

This specification is the source of truth for all frontend implementation.

---

# Technology Stack

Framework

```text
Next.js 15
```

---

Language

```text
TypeScript
```

---

UI

```text
React 19
```

---

Styling

```text
Tailwind CSS v4
```

---

Components

```text
shadcn/ui
```

---

State

```text
Zustand
```

---

Server State

```text
TanStack Query
```

---

Forms

```text
React Hook Form

Zod
```

---

Graphs

```text
React Flow

D3
```

---

Animation

```text
Framer Motion
```

---

Icons

```text
Lucide
```

---

# Architectural Principles

## Principle 1

Feature First

Organize by domain.

Not by file type.

---

## Principle 2

Server Components First

Default to Server Components.

Use Client Components only when necessary.

---

## Principle 3

API Driven

No direct database access.

Everything flows through APIs.

---

## Principle 4

Knowledge First

UI exists to reveal knowledge.

Not chat messages.

---

# Application Structure

```text
apps/web

src

├─ app
├─ features
├─ shared
├─ providers
├─ lib
├─ services
├─ types
├─ config
└─ styles
```

---

# App Router

```text
app

├─ page.tsx

├─ explore

├─ ask

├─ scriptures

├─ concepts

├─ graph

├─ research

├─ uploads

├─ library

└─ profile
```

---

# Route Architecture

Home

```text
/
```

---

Explore

```text
/explore
```

---

Ask

```text
/ask
```

---

Scriptures

```text
/scriptures
```

---

Scripture

```text
/scriptures/[slug]
```

---

Chapter

```text
/scriptures/[slug]/[chapter]
```

---

Verse

```text
/verse/[id]
```

---

Concept

```text
/concepts/[slug]
```

---

Graph

```text
/graph/[nodeId]
```

---

Research

```text
/research/[id]
```

---

Upload

```text
/uploads/[id]
```

---

# Feature Structure

Example

Concepts

```text
features/concepts

├─ api
├─ components
├─ hooks
├─ types
├─ stores
├─ utils
└─ pages
```

---

Every feature owns itself.

---

# Shared Layer

Only truly shared code.

```text
shared

├─ ui
├─ layout
├─ forms
├─ icons
├─ tables
├─ cards
└─ hooks
```

---

# UI Composition

Hierarchy

```text
Page

↓

Feature Section

↓

Card

↓

Primitive Component
```

---

Avoid giant pages.

---

# Server Components

Default

```text
Server Component
```

---

Use For

```text
Scriptures

Concept Pages

Research Pages

Static Content
```

---

Benefits

```text
SEO

Performance

Caching
```

---

# Client Components

Use Only For

```text
Search

Graphs

Forms

Realtime Chat

Interactive Filters
```

---

Rule

Minimize client-side JavaScript.

---

# Data Fetching Strategy

Server Components

```text
fetch()
```

---

Interactive Features

```text
TanStack Query
```

---

Mutation

```text
TanStack Mutation
```

---

Never

```text
useEffect Fetching
```

unless unavoidable.

---

# Query Architecture

Query Keys

```typescript
["concept", slug]

["scripture", id]

["verse", id]

["research", id]
```

---

Consistent keys required.

---

# State Architecture

Use Zustand only for:

```text
UI State

Preferences

Theme

Navigation

Filters
```

---

Do Not Store

```text
Server Data
```

inside Zustand.

---

# Global Stores

Allowed

```text
themeStore

navigationStore

searchStore

preferencesStore
```

---

# Authentication

Provider

```text
Auth.js
```

---

Storage

```text
HTTP Only Cookies
```

---

No localStorage tokens.

---

# Search Architecture

Universal Search

```text
Concepts

Verses

Scriptures

Commentaries

Research

Uploads
```

---

Search Flow

```text
Input

↓

Debounce

↓

API

↓

Results
```

---

# Chat Architecture

Purpose

Knowledge exploration.

Not generic chat.

---

Page

```text
/ask
```

---

Components

```text
ChatInput

AnswerCard

CitationPanel

ConceptLinks

GraphPreview
```

---

# Knowledge Card System

Core UI Pattern

---

Components

```text
KnowledgeCard

ConceptCard

VerseCard

CitationCard

ResearchCard
```

---

All share:

```text
Title

Summary

Metadata

Actions
```

---

# Scripture Reader

Structure

```text
ReaderLayout

VersePanel

CommentaryPanel

NotesPanel
```

---

Desktop

Multi-column.

---

Mobile

Stacked.

---

# Knowledge Graph Architecture

Flagship Feature

---

Library

```text
React Flow
```

---

Data Source

```text
Neo4j API
```

---

Graph Model

```typescript
Node

Edge
```

---

Node Types

```text
Concept

Verse

Scripture

Commentary

School

Person
```

---

Graph Loading

Progressive Expansion

---

Never Load

Entire Graph

````

---

Expansion Strategy

```text
Node

↓

Neighbors

↓

Next Level
````

---

# Mobile Graph Experience

Desktop

Interactive Graph

---

Mobile

Card-Based Exploration

---

Reason

Graphs become unusable on small screens.

---

# Research Workspace

Layout

```text
Question

Evidence

Graph

Report

Sources
```

---

Components

```text
ResearchEditor

EvidencePanel

GraphPanel

ReportPanel
```

---

# Upload Workflow

Pages

```text
Upload

Processing

Results
```

---

Components

```text
UploadDropzone

UploadStatus

ConceptExtraction

ReferencePanel
```

---

# Caching Strategy

Static Content

```text
24 Hours
```

---

Scriptures

```text
7 Days
```

---

Concepts

```text
1 Day
```

---

Research

```text
5 Minutes
```

---

Chat

```text
No Cache
```

---

# Streaming Architecture

Transport

```text
SSE
```

---

Events

```text
message

citation

graph_update

complete
```

---

UI Components

```text
StreamingAnswer

CitationFeed
```

---

# Error Boundaries

Required

Per Feature

```text
Scriptures

Research

Graph

Uploads
```

---

Never

Single Global Boundary Only

---

# Loading States

Use

```text
Skeletons
```

---

Avoid

```text
Spinners
```

except very short operations.

---

# Accessibility

Requirements

```text
WCAG AA

Keyboard Navigation

Screen Readers

Focus Management
```

---

# Performance Budget

Initial JS

```text
< 200KB
```

---

LCP

```text
< 2.5s
```

---

CLS

```text
< 0.1
```

---

INP

```text
< 200ms
```

---

# SEO Strategy

Critical Pages

```text
Scriptures

Concepts

Research Reports
```

---

Must Be

```text
Server Rendered
```

---

Metadata

Generated dynamically.

---

# Testing Strategy

Unit

```text
Vitest
```

---

Component

```text
Testing Library
```

---

E2E

```text
Playwright
```

---

# Feature Ownership

Each feature owns:

```text
API

Components

Hooks

Tests

Types
```

---

No cross-feature coupling.

---

# AI Agent Rules

When generating code:

1. Prefer Server Components.

2. Use feature modules.

3. Use TanStack Query for server state.

4. Use Zustand only for UI state.

5. Follow design system.

6. Keep components small.

7. Keep features isolated.

8. Never bypass APIs.

---

# Frontend Mission

The VEDA frontend exists to transform complex knowledge into intuitive exploration.

Users should not feel they are navigating software.

They should feel they are navigating a living network of wisdom.

The frontend is the bridge between knowledge and understanding.
