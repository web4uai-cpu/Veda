# PRODUCTION.md

# VEDA Production Environment

Version: 1.0

Status: Authoritative Production Specification

---

# Purpose

Defines requirements for the live platform.

Production is optimized for:

```text
Reliability

Security

Performance

Scalability
```

---

# Availability Target

```text
99.95%
```

Minimum

---

# Infrastructure

Cloud

```text
AWS
```

Recommended

Alternative

```text
GCP
```

---

# Core Services

```text
web
api
graph
search
agents
research
ingestion
```

Independent deployments.

---

# Database Strategy

PostgreSQL

```text
Multi-AZ
```

---

Neo4j

```text
Cluster
```

---

Redis

```text
HA Cluster
```

---

# Storage

Object Storage

```text
S3
```

For

```text
Uploads

Exports

Archives
```

---

# Scaling

Horizontal Autoscaling

Required

For

```text
API

Search

Agents
```

---

# Security

Required

```text
WAF

DDoS Protection

TLS

Secrets Manager
```

---

# Backups

PostgreSQL

```text
Daily
```

---

Neo4j

```text
Daily
```

---

Object Storage

```text
Versioned
```

---

# Deployment

Strategy

```text
Blue-Green
```

Preferred

Alternative

```text
Canary
```

---

# Rollback

Target

```text
< 5 Minutes
```

---

# Incident Response

Severity Levels

```text
P1

P2

P3

P4
```

Defined in Incident Runbooks.

---

# Production SLO

API

```text
95th percentile < 500ms
```

Search

```text
< 1 second
```

Graph

```text
< 1 second
```

Research

```text
< 10 seconds
```
