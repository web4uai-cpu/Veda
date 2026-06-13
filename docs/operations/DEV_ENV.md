# DEV_ENV.md

# VEDA Development Environment

Version: 1.0

Status: Authoritative Development Environment Specification

---

# Purpose

Defines local development standards.

Every developer and AI coding agent must produce identical environments.

---

# Technology Stack

Node.js

```text
22+
```

pnpm

```text
10+
```

Docker

```text
Latest Stable
```

PostgreSQL

```text
16
```

Neo4j

```text
5.x
```

Qdrant

```text
Latest
```

Redis

```text
7.x
```

Elasticsearch

```text
8.x
```

---

# Local Services

```text
docker compose up
```

Starts

```text
postgres
neo4j
qdrant
redis
elasticsearch
mailhog
minio
```

---

# Environment Files

```text
.env.local
.env.test
.env.example
```

Never commit:

```text
.env
```

---

# Local URLs

```text
Web          http://localhost:3000
API          http://localhost:4000
Neo4j        http://localhost:7474
Qdrant       http://localhost:6333
Mailhog      http://localhost:8025
MinIO        http://localhost:9001
```

---

# Developer Commands

```bash
pnpm install
pnpm dev
pnpm test
pnpm lint
pnpm build
```

---

# AI Agent Rules

Before generating code:

1. Run type check.
2. Run lint.
3. Run unit tests.
4. Verify architecture compliance.

---

# Local Data

Seed Dataset

```text
Bhagavad Gita
10 Principal Upanishads
Core Concepts
```

Required for development.

---

# Definition of Done

Feature is complete only if:

```text
Tests Pass
Lint Passes
Types Pass
Docs Updated
```
