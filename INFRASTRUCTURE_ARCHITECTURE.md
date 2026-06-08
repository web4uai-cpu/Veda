# INFRASTRUCTURE_ARCHITECTURE.md

# VEDA Infrastructure Architecture

Version: 1.0

Status: Authoritative Infrastructure Specification

Priority: Critical

---

# Purpose

Defines cloud infrastructure, networking, compute, storage, databases, Kubernetes architecture, scaling, and platform topology.

---

# Cloud Provider

Primary

AWS

Alternative

GCP

---

# Infrastructure Principles

1. Infrastructure as Code
2. Immutable Deployments
3. Stateless Services
4. Automated Scaling
5. High Availability
6. Security by Default

---

# Regional Strategy

Production

```text
Primary Region
Multi-AZ
```

Disaster Recovery

```text
Secondary Region
Warm Standby
```

---

# Core Topology

```text
Users
 ↓
CloudFront
 ↓
AWS WAF
 ↓
Application Load Balancer
 ↓
EKS Kubernetes
 ↓
Microservices
```

---

# Kubernetes Cluster

Cluster

```text
veda-production
```

Node Pools

```text
web
api
agents
search
system
```

---

# Databases

PostgreSQL

```text
AWS RDS
Multi-AZ
```

---

Neo4j

```text
3 Node Cluster
```

---

Qdrant

```text
3 Node Cluster
```

---

OpenSearch

```text
Managed Cluster
```

---

Redis

```text
ElastiCache HA
```

---

# Object Storage

S3 Buckets

```text
veda-uploads
veda-exports
veda-archives
veda-backups
```

---

# Networking

Private Subnets

```text
Databases
Search
Graph
Redis
```

---

Public Subnets

```text
ALB
NAT Gateway
```

---

# Autoscaling

Services

CPU

```text
70%
```

Memory

```text
75%
```

---

# Secrets

AWS Secrets Manager

Required.

---

# Infrastructure Monitoring

OpenTelemetry

Prometheus

Grafana

CloudWatch

---

# Mission

Infrastructure must support millions of knowledge relationships while remaining secure, observable, and scalable.
