# RATE_LIMITS.md

# VEDA Rate Limiting Architecture

Version: 1.0

Status: Authoritative Rate Limiting Specification

Owner: Platform Engineering Team

Priority: Critical

---

# Purpose

This document defines:

* Request Limits
* Search Limits
* Chat Limits
* Upload Limits
* Research Limits
* Agent Limits
* Abuse Prevention
* Cost Protection

Rate limiting protects:

* Infrastructure
* Search Systems
* AI Models
* Knowledge Graph
* Users

---

# Core Principles

1. Protect Platform

2. Protect Cost

3. Protect Fair Usage

4. Prevent Abuse

5. Prevent Scraping

---

# Rate Limiting Layers

```text
Edge

↓

API Gateway

↓

Service

↓

Agent Runtime
```

---

# User Tiers

## Anonymous

No account.

---

## User

Registered.

---

## Scholar

Paid / Premium.

---

## Admin

Internal.

---

# Anonymous Limits

Search

```text
30 requests/hour
```

---

Concept Pages

```text
200 requests/day
```

---

Scripture Pages

```text
500 requests/day
```

---

Chat

```text
5 questions/day
```

---

Uploads

```text
Not Allowed
```

---

# User Limits

Search

```text
500 requests/hour
```

---

Chat

```text
200 messages/day
```

---

Research Reports

```text
20/day
```

---

Uploads

```text
50/day
```

---

Upload Size

```text
100 MB
```

---

Bookmarks

```text
Unlimited
```

---

# Scholar Limits

Search

```text
5000 requests/hour
```

---

Chat

```text
2000/day
```

---

Research Reports

```text
200/day
```

---

Uploads

```text
500/day
```

---

Upload Size

```text
1 GB
```

---

# Admin Limits

```text
Unlimited
```

Audited.

---

# Endpoint Limits

## Search

```text
POST /search

100 requests/minute
```

---

## Chat

```text
POST /chat

20 requests/minute
```

---

## Research

```text
POST /research

5 requests/minute
```

---

## Upload

```text
POST /uploads

10 requests/minute
```

---

# Graph Limits

Graph Expansion

```text
30 requests/minute
```

---

Max Depth

Standard

```text
2
```

---

Research Mode

```text
5
```

---

Hard Limit

```text
7
```

---

# AI Limits

Quick Mode

```text
50 requests/minute
```

---

Scholar Mode

```text
20 requests/minute
```

---

Research Mode

```text
5 requests/minute
```

---

# Upload Limits

Max File Count

```text
1000 Files/User
```

---

Max Storage

User

```text
20 GB
```

---

Scholar

```text
200 GB
```

---

# Agent Runtime Limits

Maximum Agents

```text
8
```

Per Request.

---

Maximum Execution Time

```text
30 Seconds
```

---

Maximum Memory

```text
2 GB
```

Per Agent.

---

# Search Protection

Detect

```text
Enumeration

Scraping

Automated Crawling
```

---

Response

```text
Throttle

Challenge

Block
```

---

# Abuse Detection

Signals

```text
IP

User

Device

Behavior
```

---

Actions

```text
Slowdown

Temporary Ban

Permanent Ban
```

---

# Rate Limit Headers

Response

```http
X-RateLimit-Limit

X-RateLimit-Remaining

X-RateLimit-Reset
```

---

# Exceeded Limit Response

HTTP

```text
429
```

Response

```json
{
  "error":"RATE_LIMIT_EXCEEDED",
  "retry_after":60
}
```

---

# Distributed Rate Limiting

Technology

```text
Redis
```

---

Algorithm

```text
Sliding Window
```

Preferred.

---

# Cost Controls

Trigger Alerts

```text
High AI Usage

High Search Usage

High Upload Usage
```

---

# Monitoring

Track

```text
Requests

Blocked Requests

Agent Usage

Token Usage

Upload Volume

Search Volume
```

---

# SLO Targets

False Positives

```text
<1%
```

---

Rate Limit Accuracy

```text
>99.9%
```

---

# Non-Negotiable Rules

1. Every endpoint has a limit.
2. AI requests are metered.
3. Uploads are restricted.
4. Research mode is protected.
5. Graph expansion is bounded.
6. Abuse is automatically detected.
7. Rate limits are observable.

---

# Rate Limiting Mission

The rate limiting system exists to ensure VEDA remains fast, fair, secure, and economically sustainable while protecting knowledge services from abuse and resource exhaustion.
